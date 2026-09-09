import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithGoogle, registerWithEmail } from '../services/authService';
import { useAuth } from '../lib/AuthContext';
import { useSettings } from '../lib/SettingsContext';
import { Loader2, Eye, EyeOff, CheckCircle2, Heart, Lock as LockIcon, ShieldCheck, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { requestOtp, verifyOtp } from '../services/otpService';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function RegisterPage() {
  const { settings } = useSettings();
  const { user, profile, signOut } = useAuth();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCredentials, setSavedCredentials] = useState({ email: '', password: '' });

  // Email OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInputs, setOtpInputs] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(120);
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCaptchaToken, setResendCaptchaToken] = useState<string | null>(null);
  const resendCaptchaRef = useRef<TurnstileInstance>(null);
  const [registeredUid, setRegisteredUid] = useState<string>('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    // If the user is logged in via email/password, but their profile has not been verified yet,
    // automatically trigger the verification modal.
    if (user && profile && profile.authProvider === 'email' && !profile.emailVerified) {
      setEmail(user.email || '');
      setRegisteredUid(user.uid);
      setShowOtpModal(true);
    }
  }, [user, profile]);

  useEffect(() => {
    let interval: any;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtpModal, otpTimer]);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score === 1) return { score: 33, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 66, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { score: 100, label: 'Strong', color: 'bg-green-500' };
    return { score: 0, label: 'None', color: 'bg-gray-200' };
  };

  const strength = getPasswordStrength(password);

  const handleGoogleSignUp = async () => {
    // Terms & reCAPTCHA must be accepted before any registration path
    if (!agreedTerms) {
      const msg = "Please accept the Terms and Conditions before creating an account.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!recaptchaToken) {
      const msg = "Please complete the verification to confirm you are not a robot.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setGoogleLoading(true);
    setError(null);
    try {
      // Utilize your central auth service state handler to enforce profile registration properties
      await signInWithGoogle();
      
      // Pass them cleanly into the wizard tracking loop
      navigate('/onboarding');
    } catch (err: any) {
      if (err?.code === 'auth/multi-factor-auth-required') {
        setError("Multi-factor authentication is required for this account. Please contact support if you need assistance.");
      } else {
        setError(err.message || "Google sign-up failed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const recaptchaRef = useRef<TurnstileInstance>(null);

  // reCAPTCHA v2 tokens are SINGLE-USE. Consume the token and reset the
  // widget so every attempt (initial or resend) carries a fresh token.
  const consumeRecaptcha = (): string | null => {
    const token = recaptchaToken;
    recaptchaRef.current?.reset();
    setRecaptchaToken(null);
    return token;
  };

  const sendEmailOtp = async (targetEmail: string) => {
    // OTP is now generated, stored (hashed) and emailed entirely server-side
    await requestOtp(targetEmail, 'register', consumeRecaptcha() || undefined);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (strength.label === 'Weak') {
      setError("Password must be at least 8 characters with a number and symbol.");
      return;
    }

    if (!agreedTerms) {
      const msg = "Please accept the Terms and Conditions before creating an account.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!recaptchaToken) {
      const msg = "Please complete the verification to confirm you are not a robot.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      // Save credentials locally and in sessionStorage for deferred creation
      setSavedCredentials({ email, password });
      const creds = { email, password, fullName, authProvider: 'email', emailVerified: false };
      sessionStorage.setItem('saved_credentials', JSON.stringify(creds));

      await sendEmailOtp(email);

      setOtpInputs(['', '', '', '', '', '']);
      setOtpError(null);
      setOtpTimer(120);
      setShowOtpModal(true);
    } catch (err: any) {
      // reCAPTCHA token was consumed by the failed attempt — reset the widget
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError(null);
    const code = otpInputs.join('');
    if (code.length !== 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      // Server-side verification (hashed OTP, attempt-limited, expiry-checked)
      await verifyOtp(email, code, 'register');

      // Defer Firestore user update until final step - just update session credentials to verified
      const saved = sessionStorage.getItem('saved_credentials');
      if (saved) {
        const creds = JSON.parse(saved);
        creds.emailVerified = true;
        sessionStorage.setItem('saved_credentials', JSON.stringify(creds));
      }

      // Recovery path: if an already-registered user re-verifies (profile.emailVerified was
      // false), persist the flag to Firestore so AuthGuard stops redirecting back to /register.
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), { emailVerified: true });
        } catch (syncErr) {
          console.warn('Could not sync emailVerified to profile:', syncErr);
        }
      }

      setShowOtpModal(false);
      navigate('/onboarding');
    } catch (err: any) {
      console.error("Verification failed:", err);
      const msg = err.message || "Please try again.";
      if (msg.includes('already registered')) {
        setShowOtpModal(false);
        setError(msg);
      } else {
        setOtpError("Verification failed: " + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!resendCaptchaToken) {
      setOtpError('Please complete the verification to resend the code.');
      return;
    }
    setOtpError(null);
    setOtpSending(true);
    try {
      await requestOtp(email, 'register', resendCaptchaToken);
      resendCaptchaRef.current?.reset();
      setResendCaptchaToken(null);
      setOtpTimer(120);
      setOtpInputs(['', '', '', '', '', '']);
      if (otpRefs.current[0]) {
        otpRefs.current[0].focus();
      }
    } catch (err: any) {
      console.error("Failed to resend code:", err);
      setOtpError("Failed to resend verification code. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleCancelAndSignOut = async () => {
    try {
      setShowOtpModal(false);
      sessionStorage.removeItem('saved_credentials');
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#faf4ea] overflow-hidden">
      {/* ===== Left panel (desktop) ===== */}
      <div className="hidden lg:flex flex-col w-[46%] sanctuary-grain sanctuary-panel text-white p-12 xl:p-16 relative overflow-hidden">
        <div className="san-anim san-d1 flex items-center gap-3">
          <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-14 h-14 object-contain drop-shadow-lg" />
          <div>
            <div className="font-headline font-bold text-lg leading-tight">The Kingdom Alliances</div>
            <div className="text-[#dfc88a] text-[10px] tracking-[3px] uppercase font-bold">Christian Matrimony</div>
          </div>
        </div>

        <div className="my-auto">
          <h1 className="san-anim san-d2 font-headline text-5xl font-medium leading-[1.15]">
            Begin your journey to a <em className="text-[#dfc88a] font-normal">God-centered</em> union.
          </h1>
          <div className="san-fade san-d3 flex items-center gap-4 mt-7 max-w-[240px]">
            <div className="h-px flex-1 bg-[#dfc88a]/50" />
            <span className="text-[#dfc88a] text-sm">✝</span>
            <div className="h-px flex-1 bg-[#dfc88a]/50" />
          </div>
          <p className="san-fade san-d4 mt-7 text-white/70 text-[15px] leading-relaxed font-light max-w-md">
            "For I know the plans I have for you, declares the Lord, plans to give you hope and a future."
            <span className="block mt-2 text-[#dfc88a] font-semibold text-[13px]">— Jeremiah 29:11</span>
          </p>
        </div>

        <div className="san-fade san-d5 space-y-3.5">
          {[
            'Takes about 5 minutes',
            'Reviewed within 24 hours',
            'Your information is never public',
          ].map((t) => (
            <div key={t} className="flex items-center gap-3 text-white/80 text-sm font-medium">
              <span className="w-5 h-5 rounded-full border border-[#dfc88a]/50 text-[#dfc88a] flex items-center justify-center text-[10px]">✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Right panel — form ===== */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 sm:px-10 relative overflow-y-auto">
        <div className="lg:hidden w-full sanctuary-grain sanctuary-panel text-white rounded-3xl p-6 mb-8 max-w-md">
          <div className="san-anim san-d1 flex items-center gap-3">
            <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-11 h-11 object-contain" />
            <div>
              <div className="font-headline font-bold text-base">The Kingdom Alliances</div>
              <div className="text-[#dfc88a] text-[9px] tracking-[2.5px] uppercase font-bold">Christian Matrimony</div>
            </div>
          </div>
          <p className="san-anim san-d2 font-headline text-xl mt-3">Begin your <em className="text-[#dfc88a]">journey.</em></p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          className="w-full max-w-md"
        >
          {/* Double-Bezel Card */}
          <div className="p-2 md:p-3 bg-[#f5f0e6]/60 rounded-[2rem] border border-[#e8e1d3]/80 shadow-[0_8px_40px_-12px_rgba(74,53,33,0.12)]">
            <div className="rounded-[calc(2rem-0.375rem)] bg-white/95 backdrop-blur-sm border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_3px_rgba(74,53,33,0.06)] overflow-hidden">

              {/* Header */}
              <div className="px-8 pt-8 pb-6 border-b border-[#f0ead9]/60 bg-gradient-to-b from-[#fffdf8] to-white">
                <div className="hidden lg:flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                    <span className="text-[#C9A84C] text-sm">✝</span>
                  </div>
                  <span className="font-headline font-bold text-sm text-[#4a3521]">The Kingdom Alliances</span>
                </div>
                <h2 className="font-headline text-2xl font-semibold text-[#4a3521]">Create your profile</h2>
                <p className="text-[#a89f8d] text-[13px] mt-1">Your account details.</p>
              </div>

              {/* Form Content */}
              <div className="px-8 py-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-5 p-3.5 rounded-xl text-[13px] font-medium flex items-center gap-2.5 text-[#a13c2f] bg-[rgba(220,90,70,0.06)] border border-[rgba(220,90,70,0.15)]"
                  >
                    <span className="w-1.5 h-1.5 bg-[#c0392b] rounded-full flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading || loading}
                  title={!agreedTerms || !recaptchaToken ? 'Please accept the terms and complete the verification first' : undefined}
                  className={`group w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full font-semibold text-[13.5px] text-[#4b5563] bg-white border border-[#e2ddd2] shadow-[0_1px_3px_rgba(74,53,33,0.04)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] hover:border-[#C9A84C]/40 hover:shadow-[0_2px_8px_rgba(201,168,76,0.1)] disabled:opacity-50 mb-4 ${(!agreedTerms || !recaptchaToken) ? 'opacity-60' : ''}`}
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#b3804c]" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Sign up with Google
                </button>

                <div className="flex items-center gap-4 my-5">
                  <div className="h-px flex-1 bg-[#e8e2d5]" />
                  <span className="text-[9px] text-[#c4bba8] uppercase tracking-[2px] font-semibold">or register with email</span>
                  <div className="h-px flex-1 bg-[#e8e2d5]" />
                </div>

                <form onSubmit={handleEmailSignUp} className="space-y-3.5" autoComplete="off">
                  <div className="s-field">
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder=" " required
                    />
                    <label>Email address</label>
                  </div>

                  <div className="s-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder=" " required className="pr-12"
                    />
                    <label>Password</label>
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[17px] text-[#b6ae9c] hover:text-[#8f6337] transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {password && (
                    <div className="-mt-1.5 mb-0.5 flex items-center gap-3">
                      <div className="h-1 flex-1 rounded-full bg-[#eee7d8] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ width: `${strength.score}%`, background: strength.color }} />
                      </div>
                      <span className="text-[10px] font-bold tracking-wide uppercase" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}

                  <div className="s-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=" " required
                    />
                    <label>Confirm password</label>
                  </div>

                  <div className="flex gap-3 items-start p-3.5 rounded-xl border border-[#e2ddd2]/80 bg-[#fffdf8]/60">
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox" checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                          agreedTerms
                            ? 'bg-[#C9A84C] border-[#C9A84C] shadow-[0_1px_4px_rgba(201,168,76,0.3)]'
                            : 'bg-white border-[#d8d1c0] hover:border-[#C9A84C]/60'
                        }`}
                      >
                        <svg
                          viewBox="0 0 16 16" fill="none"
                          className={`w-3 h-3 text-white transition-all duration-300 ${agreedTerms ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                        >
                          <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </label>
                    <p className="text-[11.5px] text-[#8a7a65] leading-relaxed">
                      I agree to the <Link to="/terms" className="font-bold text-[#b8860b] hover:underline">Terms</Link> & <Link to="/terms" className="font-bold text-[#b8860b] hover:underline">Privacy Policy</Link>, and affirm the information I provide is truthful.
                    </p>
                  </div>

                  <div className="flex justify-center py-1">
                    <Turnstile
                      ref={recaptchaRef}
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''}
                      onSuccess={(token) => setRecaptchaToken(token)}
                      onExpire={() => setRecaptchaToken(null)}
                      options={{ theme: 'light', size: 'normal' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="group w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-[#4a3521] text-white rounded-full font-semibold text-[13.5px] shadow-[0_2px_12px_rgba(74,53,33,0.25)] hover:bg-[#3a2a1a] hover:shadow-[0_4px_20px_rgba(74,53,33,0.35)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                    {!loading && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/15 transition-all duration-300 group-hover:bg-white/25 group-hover:translate-x-0.5">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                </form>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-[#f0ead9]/60 bg-gradient-to-t from-[#faf7f0] to-white text-center">
                <p className="text-[12px] text-[#a89f8d]">
                  Already a member?{' '}
                  <Link to="/login" className="font-bold text-[#4a3521] hover:text-[#8f6337] transition-colors duration-300">
                    Sign in
                  </Link>
                </p>
                <div className="mt-3">
                  <Link to="/" className="text-xs font-semibold text-[#a89f8d] hover:text-[#8f6337] transition-colors">
                    ← Back to Home
                  </Link>
                  <span className="mx-2 text-[#d8cbb4]">·</span>
                  <Link to="/faq" className="text-xs font-semibold text-[#a89f8d] hover:text-[#8f6337] transition-colors">
                    Help Center
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== OTP Verification Modal ===== */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            style={{ background: 'rgba(43, 32, 20, 0.55)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-full max-w-sm"
            >
              {/* Double-Bezel Modal */}
              <div className="p-2 bg-[#f5f0e6]/80 rounded-[2rem] border border-[#e8e1d3]/80 shadow-[0_20px_60px_-15px_rgba(43,32,20,0.4)]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-white/95 backdrop-blur-sm border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] overflow-hidden">

                  {/* Header */}
                  <div className="px-7 pt-7 pb-5 text-center border-b border-[#f0ead9]/60 bg-gradient-to-b from-[#fffdf8] to-white">
                    <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-[#C9A84C] text-lg">✝</span>
                    </div>
                    <h2 className="font-headline text-xl font-semibold text-[#4a3521]">Verify your email</h2>
                    <p className="text-[12px] text-[#a89f8d] mt-1.5">
                      We sent a 6-digit code to<br />
                      <span className="font-bold text-[#4a3521]">{email}</span>
                    </p>
                  </div>

                  {/* Content */}
                  <div className="px-7 py-6 space-y-5">
                    {otpError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-xl text-[12px] font-medium flex items-center gap-2 text-[#a13c2f] bg-[rgba(220,90,70,0.06)] border border-[rgba(220,90,70,0.15)]"
                      >
                        <span className="w-1.5 h-1.5 bg-[#c0392b] rounded-full flex-shrink-0" />
                        {otpError}
                      </motion.div>
                    )}

                    <div className="flex justify-center gap-2">
                      {otpInputs.map((val, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { otpRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={val}
                          onChange={(e) => {
                            const inputVal = e.target.value.replace(/[^0-9]/g, '');
                            const newInputs = [...otpInputs];
                            newInputs[idx] = inputVal;
                            setOtpInputs(newInputs);
                            if (inputVal && idx < 5) otpRefs.current[idx + 1]?.focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace') {
                              if (!otpInputs[idx] && idx > 0) {
                                const newInputs = [...otpInputs];
                                newInputs[idx - 1] = '';
                                setOtpInputs(newInputs);
                                otpRefs.current[idx - 1]?.focus();
                              } else {
                                const newInputs = [...otpInputs];
                                newInputs[idx] = '';
                                setOtpInputs(newInputs);
                              }
                            }
                          }}
                          className="w-10 h-12 text-center text-lg font-bold rounded-lg border-[1.5px] border-[#e2ddd2] bg-white text-[#4a3521] focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading || otpInputs.some(v => !v)}
                      className="group w-full flex items-center justify-center gap-2.5 py-3 bg-[#4a3521] text-white rounded-full font-semibold text-[13px] shadow-[0_2px_10px_rgba(74,53,33,0.2)] hover:bg-[#3a2a1a] hover:shadow-[0_4px_16px_rgba(74,53,33,0.3)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
                    </button>

                    <div className="flex flex-col items-center gap-2.5 pt-0.5">
                      <div className="flex justify-center overflow-x-auto">
                        <Turnstile
                          ref={resendCaptchaRef}
                          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''}
                          onSuccess={(token) => setResendCaptchaToken(token)}
                          onExpire={() => setResendCaptchaToken(null)}
                      options={{ theme: 'light', size: 'normal' }}
                        />
                      </div>
                      {otpTimer > 0 ? (
                        <span className="text-[14px] font-semibold text-[#8a7a65]">
                          Resend code in <span className="font-bold text-[#b8860b] text-[16px]">{otpTimer}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={otpSending}
                          className="text-[13px] font-bold text-[#b8860b] hover:underline disabled:opacity-50 flex items-center gap-1.5 transition-colors duration-300"
                        >
                          {otpSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-7 py-4 border-t border-[#f0ead9]/60 bg-gradient-to-t from-[#faf7f0] to-white text-center">
                    <button
                      type="button"
                      onClick={handleCancelAndSignOut}
                      className="text-[11px] font-semibold text-[#c4bba8] hover:text-[#c0392b] transition-colors duration-300"
                    >
                      Cancel & Sign Out
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
