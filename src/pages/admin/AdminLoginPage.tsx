import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle, Key, RefreshCw } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { KingdomCrossIcon } from '../../components/KingdomCrossIcon';
import { signInWithEmailAndPassword, getMultiFactorResolver, TotpMultiFactorGenerator, signOut, multiFactor } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, addDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { formatAuthError } from '../../lib/utils';
import { sendEmail } from '../../lib/email';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // MFA Login states (already enrolled)
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState('');

  // Flow State: 'LOGIN' | 'VERIFY_OTP' | 'ENROLL_MFA'
  const [step, setStep] = useState<'LOGIN' | 'VERIFY_OTP' | 'ENROLL_MFA'>('LOGIN');

  // OTP Verification states
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // QR Code MFA enrollment states
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaEnrollError, setMfaEnrollError] = useState<string | null>(null);

  const { signIn, user, isAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect fully authenticated admins
  React.useEffect(() => {
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

  // Session Recovery: if user is signed in but isAdmin is false, check if they need OTP or MFA
  React.useEffect(() => {
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

  const generateOTP = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return String(array[0] % 900000 + 100000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setIsRedirecting(true);

      // Verify admin status via Firebase Custom Claims
      const idTokenResult = await user.getIdTokenResult();
      if (!idTokenResult.claims.admin) {
        await signOut(auth);
        setError("Access denied. You are not an administrator.");
        setLoading(false);
        setIsRedirecting(false);
        return;
      }

      // Fetch admins doc from Firestore to check emailVerified status
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
        // Paused! Send OTP to verify identity
        const code = generateOTP();
        if (import.meta.env.DEV) {
          console.log(`🔑 [DEV ONLY] Generated Admin Login OTP for ${email}: ${code}`);
        }

        // Delete any old OTPs for this email in temp_otps
        const oldOtpsQuery = query(collection(db, 'temp_otps'), where('email', '==', email));
        const oldOtpsSnap = await getDocs(oldOtpsQuery);
        const deletePromises = oldOtpsSnap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);

        // Store new OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await addDoc(collection(db, 'temp_otps'), {
          email: email,
          otp: code,
          expiresAt: Timestamp.fromDate(expiresAt),
          createdAt: serverTimestamp()
        });

        // Send Email
        await sendEmail({
          to_email: email,
          otp_code: code,
          type: 'otp'
        });

        setStep('VERIFY_OTP');
        setLoading(false);
        setIsRedirecting(false);
        return;
      }

      // Check if MFA is already enrolled for this user
      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length === 0) {
        setStep('ENROLL_MFA');
        await initializeMfaEnrollment(user);
        setLoading(false);
        setIsRedirecting(false);
        return;
      }

      // Successful admin login
      navigate('/admin');
    } catch (error: any) {
      setIsRedirecting(false);
      if (error.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, error);
        setMfaResolver(resolver);
        setLoading(false);
        return; // Stop the login process and wait for the code
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
      const q = query(
        collection(db, 'temp_otps'),
        where('email', '==', email),
        where('otp', '==', otpCode)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setOtpError("Invalid OTP code. Please check and try again.");
        setLoading(false);
        return;
      }

      const otpDoc = snapshot.docs[0];
      const otpData = otpDoc.data();
      const now = Timestamp.now();

      if (otpData.expiresAt.toMillis() < now.toMillis()) {
        await deleteDoc(otpDoc.ref);
        setOtpError("OTP has expired. Please log in again to receive a new OTP.");
        setLoading(false);
        return;
      }

      // Cleanup verified OTP
      await deleteDoc(otpDoc.ref);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setOtpError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      // Get ID token to authenticate with the backend
      const idToken = await currentUser.getIdToken();

      // Call the verifyAdminEmail Cloud Function dynamically depending on environment
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

      // Force refresh the token so the client Auth instance immediately knows emailVerified is true
      await currentUser.getIdToken(true);

      // Refresh Auth Context profile so it sets isAdmin to true
      await refreshProfile();

      // Proceed to 2FA Google Authenticator QR Scan/Verification
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
      
      // Successfully enrolled, route to admin dashboard
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
      
      // Check Admin Privileges
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      if (!adminDoc.exists()) {
        await auth.signOut();
        setError("❌ Access Denied: Administrator privileges required.");
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
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-on-surface-variant font-headline text-lg tracking-wide animate-pulse">
            Verifying administrative credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-headline text-4xl text-on-surface text-center">Admin Access</h1>
          <p className="text-on-surface-variant text-center mt-2">Kingdom Alliance Administration Portal</p>
        </div>

        <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 lg:p-12 border border-outline-variant shadow-2xl space-y-8">
          {mfaResolver ? (
            /* 2FA CODE SIGN IN FORM */
            <form onSubmit={handleVerifyMfaCode} className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-on-surface">Two-Factor Authentication</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Enter the 6-digit verification code from your authenticator app to secure your session.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="w-full mt-1 p-3 bg-surface border border-outline-variant rounded-2xl text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-error/10 text-error rounded-2xl border border-error/20 flex items-center gap-3 text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={() => setMfaResolver(null)}
                className="w-full py-4 bg-surface-container text-on-surface font-bold rounded-2xl border border-outline-variant hover:bg-surface-container-high transition-all mt-2"
              >
                Cancel & Go Back
              </button>
            </form>
          ) : (
            /* LOGIN FORM (EMAIL / PASSWORD) */
            <form onSubmit={handleAdminLogin} className="space-y-6" autoComplete="off">
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

              <div className="space-y-2">
                <label className="block font-label-sm text-on-surface uppercase tracking-wider">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-label-sm text-on-surface uppercase tracking-wider">Access Token / Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    autoComplete="new-password"
                    className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-error/10 text-error rounded-2xl border border-error/20 flex items-center gap-3 text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    Secure Login
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-[10px] text-center text-on-surface-variant leading-relaxed uppercase tracking-tighter">
            This is a secure area. All actions are logged and audited.
            Unauthorized access attempts are reported to cybersecurity.
          </p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-on-surface-variant hover:text-primary transition-colors text-sm font-bold flex items-center justify-center gap-2 mx-auto"
          >
            <KingdomCrossIcon size="sm" /> Back to Kingdom Alliance
          </button>
        </div>
      </motion.div>

      {/* POPUP MODAL FOR EMAIL OTP VERIFICATION */}
      {step === 'VERIFY_OTP' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-surface border border-outline-variant rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 z-10"
          >
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-on-surface">Verify Your Email</h2>
                <p className="text-sm text-on-surface-variant mt-1 text-center">
                  We've sent a 6-digit OTP to your registered email <strong className="text-on-surface">{email}</strong> to verify your identity.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left">Enter OTP Code</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant rounded-2xl text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    required
                  />
                </div>
              </div>

              {otpError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-error/10 text-error rounded-2xl border border-error/20 flex items-center gap-3 text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{otpError}</span>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
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
                className="w-full py-4 bg-surface-container text-on-surface font-bold rounded-2xl border border-outline-variant hover:bg-surface-container-high transition-all mt-2"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* POPUP MODAL FOR 2FA GOOGLE AUTHENTICATOR ENROLLMENT */}
      {step === 'ENROLL_MFA' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-surface border border-outline-variant rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-6 z-10"
          >
            <form onSubmit={handleVerifyAndEnrollMfa} className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-on-surface">Secure Admin Account</h2>
                <p className="text-sm text-on-surface-variant mt-1 text-center">
                  Google Authenticator (2FA) setup is required. Scan the QR code to continue.
                </p>
              </div>

              {qrCodeUrl && (
                <div className="p-4 bg-white rounded-2xl border border-outline-variant flex justify-center shadow-inner">
                  <QRCodeSVG value={qrCodeUrl} size={180} />
                </div>
              )}

              <p className="text-xs text-on-surface-variant text-center leading-relaxed">
                Scan the QR code above with your authenticator app, then enter the generated 6-digit code below to register your device.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant text-left">Authenticator Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-4 bg-surface border border-outline-variant rounded-2xl text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
                  required
                />
              </div>

              {mfaEnrollError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-error/10 text-error rounded-2xl border border-error/20 flex items-center gap-3 text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{mfaEnrollError}</span>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
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
                className="w-full py-4 bg-surface-container text-on-surface font-bold rounded-2xl border border-outline-variant hover:bg-surface-container-high transition-all mt-2"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
