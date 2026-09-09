import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, Key } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { KingdomCrossIcon } from '../../components/KingdomCrossIcon';
import { signInWithEmailAndPassword, getMultiFactorResolver, TotpMultiFactorGenerator, signOut, multiFactor } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { formatAuthError } from '../../lib/utils';
import { requestOtp, verifyOtp } from '../../services/otpService';
import { QRCodeSVG } from 'qrcode.react';

const proverbs = [
  { ref: 'Proverbs 18:22', text: '"He who finds a wife finds a good thing and obtains favor from the Lord."' },
  { ref: 'Proverbs 31:10', text: '"An excellent wife who can find? She is far more precious than jewels."' },
  { ref: 'Ecclesiastes 4:9', text: '"Two are better than one, because they have a good reward for their toil."' },
  { ref: 'Genesis 2:18', text: '"It is not good that the man should be alone; I will make a helper fit for him."' },
  { ref: 'Song of Solomon 8:6', text: '"Set me as a seal upon your heart, as a seal upon your arm."' },
  { ref: '1 Corinthians 13:4', text: '"Love is patient and kind; love does not envy or boast."' },
];

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState('');

  const [step, setStep] = useState<'LOGIN' | 'VERIFY_OTP' | 'ENROLL_MFA'>('LOGIN');

  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaEnrollError, setMfaEnrollError] = useState<string | null>(null);

  const [currentVerse, setCurrentVerse] = useState(0);
  const [verseFading, setVerseFading] = useState(false);

  const { signIn, user, isAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setVerseFading(true);
      setTimeout(() => {
        setCurrentVerse(prev => (prev + 1) % proverbs.length);
        setVerseFading(false);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkRedirect = async () => {
      if (user && isAdmin) {
        const enrolledFactors = multiFactor(user).enrolledFactors;
        if (enrolledFactors.length === 0) {
          setStep('ENROLL_MFA');
          await initializeMfaEnrollment(user);
        } else {
          setIsRedirecting(true);
          navigate('/admin');
        }
      }
    };
    checkRedirect();
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    const checkSessionState = async () => {
      if (user && !isAdmin) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          if (idTokenResult.claims.admin) {
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminDocSnap = await getDoc(adminDocRef);
            if (adminDocSnap.exists()) {
              const adminData = adminDocSnap.data();
              if (adminData?.emailVerified !== true) {
                setEmail(user.email || '');
                setStep('VERIFY_OTP');
              } else {
                const enrolledFactors = multiFactor(user).enrolledFactors;
                if (enrolledFactors.length === 0) {
                  setStep('ENROLL_MFA');
                  await initializeMfaEnrollment(user);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error restoring admin login session state:", err);
        }
      }
    };
    checkSessionState();
  }, [user, isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setIsRedirecting(true);

      const idTokenResult = await user.getIdTokenResult();
      if (!idTokenResult.claims.admin) {
        await signOut(auth);
        setError("Access denied. You are not an administrator.");
        setLoading(false);
        setIsRedirecting(false);
        return;
      }

      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        await signOut(auth);
        setError("Access denied. Admin record not found.");
        setLoading(false);
        setIsRedirecting(false);
        return;
      }

      const adminData = adminDocSnap.data();
      const emailVerifiedInDoc = adminData?.emailVerified === true;

      if (!emailVerifiedInDoc) {
        await requestOtp(email, 'admin_login');
        setStep('VERIFY_OTP');
        setLoading(false);
        setIsRedirecting(false);
        return;
      }

      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length === 0) {
        setStep('ENROLL_MFA');
        await initializeMfaEnrollment(user);
        setLoading(false);
        setIsRedirecting(false);
        return;
      }

      navigate('/admin');
    } catch (error: any) {
      setIsRedirecting(false);
      if (error.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, error);
        setMfaResolver(resolver);
        setLoading(false);
        return;
      }
      console.error("Admin Login Error:", error);
      setError(formatAuthError(error));
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpError(null);

    try {
      await verifyOtp(email, otpCode, 'admin_login');

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setOtpError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      const isDev = import.meta.env.MODE === 'development';
      const verifyEndpoint = isDev
        ? '/api/verify-admin-email'
        : window.location.hostname.includes('staging')
          ? 'https://verifyadminemail-2wu7cebqxq-uc.a.run.app'
          : 'https://verifyadminemail-zqwxjtgara-uc.a.run.app';

      const verifyRes = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Verification endpoint failed.');
      }

      await currentUser.getIdToken(true);
      await refreshProfile();

      const enrolledFactors = multiFactor(currentUser).enrolledFactors;
      if (enrolledFactors.length === 0) {
        setStep('ENROLL_MFA');
        await initializeMfaEnrollment(currentUser);
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setOtpError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const initializeMfaEnrollment = async (currentUser: any) => {
    try {
      setMfaEnrollError(null);
      const multiFactorSession = await multiFactor(currentUser).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);
      setTotpSecret(secret);
      setQrCodeUrl(secret.generateQrCodeUrl(currentUser.email!, "Kingdom Alliance Admin"));
    } catch (err: any) {
      console.error("MFA setup failed:", err);
      setMfaEnrollError("Failed to initiate 2FA setup: " + err.message);
    }
  };

  const handleVerifyAndEnrollMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMfaEnrollError(null);

    try {
      if (!totpSecret) {
        throw new Error("MFA configuration session is missing.");
      }
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, verificationCode);
      await multiFactor(auth.currentUser!).enroll(assertion, "Admin Authenticator");
      navigate('/admin');
    } catch (err: any) {
      console.error("MFA enrollment failed:", err);
      setMfaEnrollError(err.message || "Invalid verification code.");
      setLoading(false);
    }
  };

  const handleVerifyMfaCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsRedirecting(true);
    try {
      setError('');
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(
        mfaResolver.hints[0].uid,
        mfaCode
      );
      const userCredential = await mfaResolver.resolveSignIn(assertion);

      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      if (!adminDoc.exists()) {
        await auth.signOut();
        setError("Access Denied: Administrator privileges required.");
        setMfaResolver(null);
        setLoading(false);
        setIsRedirecting(false);
        return;
      }

      navigate('/admin');
    } catch (err: any) {
      console.error("MFA Error:", err);
      setError(err.message || "Invalid 2FA Code.");
      setLoading(false);
      setIsRedirecting(false);
    }
  };

  if (loading && step === 'LOGIN' && !mfaResolver) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2035 50%, #0a1628 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin" />
          <p className="text-[#b89a72] text-sm tracking-widest uppercase animate-pulse" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Verifying administrative credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex relative overflow-hidden" style={{ background: '#fafafa' }}>

      {/* ─── LEFT PANEL: Brand & Scripture (Desktop) ─── */}
      <div
        className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2035 50%, #0a1628 100%)' }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(201,168,76,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 80%, rgba(143,99,55,0.08) 0%, transparent 50%)' }} />

        {/* Grain overlay */}
        <div className="sanctuary-grain absolute inset-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          {/* Cross */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 0.9, 0.3, 1] }}
          >
            <KingdomCrossIcon size="lg" className="mb-8" />
          </motion.div>

          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 0.9, 0.3, 1] }}
            className="text-4xl font-light tracking-tight mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A84C' }}
          >
            Kingdom Alliance
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 0.9, 0.3, 1] }}
            className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-16"
            style={{ fontFamily: "'Montserrat', sans-serif", color: '#b89a72' }}
          >
            Administration Portal
          </motion.p>

          {/* Scripture verse */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 0.9, 0.3, 1] }}
            className="relative min-h-[100px] flex flex-col items-center justify-center"
          >
            <div
              className={`text-center transition-opacity duration-500 ${verseFading ? 'opacity-0' : 'opacity-100'}`}
            >
              <p
                className="text-lg italic leading-relaxed mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'rgba(201,168,76,0.8)' }}
              >
                {proverbs[currentVerse].text}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(184,154,114,0.5)' }}
              >
                — {proverbs[currentVerse].ref}
              </p>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-6 mt-16"
          >
            {['Secure', 'Verified', 'Trusted'].map((word) => (
              <span
                key={word}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em]"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(184,154,114,0.4)' }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(201,168,76,0.3)' }} />
                {word}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Form Area ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile brand header */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <KingdomCrossIcon size="md" className="mb-3" />
          <h1
            className="text-2xl font-light tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a2e4a' }}
          >
            Kingdom Alliance
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: '#b89a72' }}>
            Administration Portal
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.9, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Card with Double-Bezel */}
          <div className="bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(26,46,74,0.1)] ring-1 ring-black/[0.06] p-1.5">
            <div className="bg-white rounded-[calc(2rem-6px)] p-8 lg:p-10">
              {/* Card header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #C9A84C15, #8f633710)' }}>
                  <ShieldCheck className="w-7 h-7" style={{ color: '#C9A84C' }} />
                </div>
                <h2 className="text-2xl font-semibold text-[#0f172a]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Admin Access
                </h2>
                <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>
                  Sign in to your administrator account
                </p>
              </div>

              {/* Form content */}
              {mfaResolver ? (
                /* ─── MFA CODE FORM ─── */
                <form onSubmit={handleVerifyMfaCode} className="space-y-5">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-[#1a2e4a]">Two-Factor Authentication</h3>
                    <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                      Enter the 6-digit code from your authenticator app.
                    </p>
                  </div>

                  <div className="s-field">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder=" "
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="!text-center !font-mono !text-xl !tracking-widest"
                      required
                    />
                    <label>Verification Code</label>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="sanctuary-btn !rounded-full flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMfaResolver(null)}
                    className="w-full py-3 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    style={{ color: '#64748b' }}
                  >
                    Cancel & Go Back
                  </button>
                </form>
              ) : (
                /* ─── LOGIN FORM ─── */
                <form onSubmit={handleAdminLogin} className="space-y-5" autoComplete="off">
                  <input
                    type="text"
                    name="prevent_autofill_email"
                    style={{ position: 'absolute', top: -1000, left: -1000, width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    name="prevent_autofill_password"
                    style={{ position: 'absolute', top: -1000, left: -1000, width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
                    tabIndex={-1}
                    aria-hidden="true"
                  />

                  <div className="s-field">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#94a3b8', zIndex: 1 }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=" "
                      autoComplete="off"
                      className="!pl-12"
                    />
                    <label style={{ left: 48 }}>Admin Email</label>
                  </div>

                  <div className="s-field">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#94a3b8', zIndex: 1 }} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" "
                      autoComplete="new-password"
                      className="!pl-12"
                    />
                    <label style={{ left: 48 }}>Password</label>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="sanctuary-btn !rounded-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Secure Login
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] flex items-center justify-center gap-1.5 pt-1" style={{ color: '#94a3b8' }}>
                    <Lock className="w-3 h-3" />
                    Secure admin access · All actions audited
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors hover:text-[#C9A84C]"
              style={{ color: '#94a3b8' }}
            >
              <KingdomCrossIcon size="sm" />
              Back to Kingdom Alliance
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── OTP VERIFICATION MODAL ─── */}
      {step === 'VERIFY_OTP' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md z-10"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/[0.06]">
              {/* Gold accent bar */}
              <div className="h-1.5" style={{ background: 'linear-gradient(to right, #C9A84C, #8f6337)' }} />

              <div className="p-8">
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #C9A84C15, #8f633710)' }}>
                      <Mail className="w-7 h-7" style={{ color: '#C9A84C' }} />
                    </div>
                    <h3 className="text-xl font-semibold text-[#0f172a]">Verify Your Email</h3>
                    <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>
                      We've sent a 6-digit code to <strong className="text-[#1a2e4a]">{email}</strong>
                    </p>
                  </div>

                  <div className="s-field">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#94a3b8', zIndex: 1 }} />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder=" "
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="!pl-12 !text-center !font-mono !text-xl !tracking-widest"
                      required
                    />
                    <label style={{ left: 48 }}>Enter OTP Code</label>
                  </div>

                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{otpError}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="sanctuary-btn !rounded-full flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await signOut(auth);
                      setStep('LOGIN');
                      setOtpCode('');
                      setOtpError(null);
                    }}
                    className="w-full py-3 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    style={{ color: '#64748b' }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── MFA ENROLLMENT MODAL ─── */}
      {step === 'ENROLL_MFA' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md z-10"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/[0.06]">
              {/* Gold accent bar */}
              <div className="h-1.5" style={{ background: 'linear-gradient(to right, #C9A84C, #8f6337)' }} />

              <div className="p-8">
                <form onSubmit={handleVerifyAndEnrollMfa} className="space-y-5">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #C9A84C15, #8f633710)' }}>
                      <ShieldCheck className="w-7 h-7" style={{ color: '#C9A84C' }} />
                    </div>
                    <h3 className="text-xl font-semibold text-[#0f172a]">Secure Your Account</h3>
                    <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>
                      Set up Google Authenticator (2FA) to continue.
                    </p>
                  </div>

                  {qrCodeUrl && (
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-center shadow-inner">
                      <QRCodeSVG value={qrCodeUrl} size={180} />
                    </div>
                  )}

                  <p className="text-xs text-center leading-relaxed" style={{ color: '#94a3b8' }}>
                    Scan the QR code with your authenticator app, then enter the 6-digit code below.
                  </p>

                  <div className="s-field">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder=" "
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="!text-center !font-mono !text-xl !tracking-widest"
                      required
                    />
                    <label>Authenticator Code</label>
                  </div>

                  {mfaEnrollError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{mfaEnrollError}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="sanctuary-btn !rounded-full flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Complete Setup"}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await signOut(auth);
                      setStep('LOGIN');
                      setVerificationCode('');
                      setMfaEnrollError(null);
                    }}
                    className="w-full py-3 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    style={{ color: '#64748b' }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
