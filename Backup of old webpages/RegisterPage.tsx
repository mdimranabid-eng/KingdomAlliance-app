import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithGoogle, registerWithEmail } from '../services/authService';
import { useAuth } from '../lib/AuthContext';
import { useSettings } from '../lib/SettingsContext';
import { Loader2, Eye, EyeOff, CheckCircle2, Heart, Lock as LockIcon, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { requestOtp, verifyOtp } from '../services/otpService';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import toast from 'react-hot-toast';

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
  const [otpTimer, setOtpTimer] = useState(60);
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
      setError(err.message || "Google sign-up failed.");
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
      setOtpTimer(60);
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
      setOtpError("Verification failed: " + (err.message || "Please try again."));
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
      setOtpTimer(60);
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-body py-12 md:py-16 px-4"
      style={{
        background: 'linear-gradient(135deg, #fff0f3 0%, #ffe3e8 40%, #ffccd5 70%, #fff0f3 100%)'
      }}
    >
      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-45"
          style={{ background: 'radial-gradient(circle, #ffccd5 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, #d4af3725 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #ffe5ec 0%, transparent 70%)' }} />
      </div>

      {/* Decorative SVG Roses & Leaves - Top Left */}
      <svg className="absolute -top-10 -left-10 w-48 h-48 md:w-80 md:h-80 opacity-30 pointer-events-none select-none" viewBox="0 0 100 100" fill="none">
        <path d="M30 20C20 30 15 50 35 70C55 50 45 35 30 20Z" fill="url(#rose-pink)" opacity="0.8"/>
        <path d="M15 45C5 55 10 70 25 75C40 65 30 50 15 45Z" fill="url(#rose-red)" opacity="0.7"/>
        <path d="M50 15C60 25 55 40 40 45C35 30 40 20 50 15Z" fill="url(#leaf-green)" opacity="0.5"/>
        <path d="M25 60C35 75 55 70 65 85" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>

      {/* Decorative SVG Roses & Leaves - Bottom Right */}
      <svg className="absolute -bottom-10 -right-10 w-48 h-48 md:w-80 md:h-80 opacity-30 pointer-events-none select-none" viewBox="0 0 100 100" fill="none">
        <path d="M70 80C80 70 85 50 65 30C45 50 55 65 70 80Z" fill="url(#rose-pink)" opacity="0.8"/>
        <path d="M85 55C95 45 90 30 75 25C60 35 70 50 85 55Z" fill="url(#rose-red)" opacity="0.7"/>
        <path d="M50 85C40 75 45 60 60 55C65 70 60 80 50 85Z" fill="url(#leaf-green)" opacity="0.5"/>
        <path d="M75 40C65 25 45 30 35 15" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
          <radialGradient id="rose-pink" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff0f3" />
            <stop offset="50%" stopColor="#ffb3c1" />
            <stop offset="100%" stopColor="#ff4d6d" />
          </radialGradient>
          <radialGradient id="rose-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb3c1" />
            <stop offset="100%" stopColor="#c9184a" />
          </radialGradient>
          <linearGradient id="leaf-green" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a3b18a" />
            <stop offset="100%" stopColor="#588157" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main glass card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md mx-4 rounded-[2.5rem] overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.62)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 32px 64px -12px rgba(26,46,74,0.12), inset 0 1px 0 rgba(255,255,255,0.90), inset 0 -1px 0 rgba(0,0,0,0.04)'
        }}
      >
        {/* Inner highlight */}
        <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, transparent 50%, rgba(0,0,0,0.02) 100%)'
          }} />

        <div className="relative p-8 md:p-10 space-y-7">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full space-y-7"
              >
                {/* Logo + Title */}
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 rounded-2xl"
                      style={{
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
                      }}>
                      <img src="/images/logo.jpeg" alt="Kingdom Alliance" className="w-8 h-8 object-contain" />
                    </div>
                  </div>
                  <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
                    Create Account
                  </h2>
                  <p className="text-on-surface-variant text-sm">
                    Join Christian singles on {settings.siteName}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-3 text-red-300"
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.25)'
                    }}>
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Google Button */}
                  <button
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading || loading}
                    title={!agreedTerms || !recaptchaToken ? "Please accept the terms and conditions and complete the reCAPTCHA first" : undefined}
                    className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 ${(!agreedTerms || !recaptchaToken) ? 'cursor-pointer' : ''}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.80)',
                      border: '1px solid rgba(26, 46, 74, 0.12)',
                      color: '#374151',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.90)'
                    }}
                  >
                    {googleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    <span>Sign up with Google</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-white/10" />
                    <span className="px-4 text-[10px] text-on-surface-variant/50 uppercase tracking-widest absolute bg-transparent">
                      or register with email
                    </span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleEmailSignUp} className="space-y-3" autoComplete="off">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm"
                      style={{
                        background: 'rgba(255,255,255,0.70)',
                        border: '1px solid rgba(26,46,74,0.12)',
                        backdropFilter: 'blur(10px)',
                      }}
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm"
                      style={{
                        background: 'rgba(255,255,255,0.70)',
                        border: '1px solid rgba(26,46,74,0.12)',
                        backdropFilter: 'blur(10px)',
                      }}
                    />

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          required
                          className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm pr-12"
                          style={{
                            background: 'rgba(255,255,255,0.70)',
                            border: '1px solid rgba(26,46,74,0.12)',
                            backdropFilter: 'blur(10px)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {password && (
                        <div className="space-y-1 px-1">
                          <div className="h-1 w-full bg-gray-200/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${strength.color}`} 
                              style={{ width: `${strength.score}%` }}
                            />
                          </div>
                          <p className="text-[9px] uppercase tracking-wider font-bold text-on-surface-variant/60">
                            Strength: {strength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      required
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm"
                      style={{
                        background: 'rgba(255,255,255,0.70)',
                        border: '1px solid rgba(26,46,74,0.12)',
                        backdropFilter: 'blur(10px)',
                      }}
                    />

                    {/* Checkboxes */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex-shrink-0 flex items-center justify-center mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={agreedTerms}
                            onChange={(e) => setAgreedTerms(e.target.checked)}
                            className="peer appearance-none w-4 h-4 border border-on-surface-variant/30 rounded checked:bg-[#d4af37] checked:border-[#d4af37] transition-all bg-white/50" 
                          />
                          <CheckCircle2 className="absolute w-3 h-3 text-[#0a0f1e] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className="text-xs text-on-surface-variant font-medium select-none">
                          I agree to the <Link to="/terms" target="_blank" className="text-[#d4af37] font-semibold hover:underline">terms and conditions</Link> of Kingdom Alliance website
                        </span>
                      </label>
                    </div>

                    {/* reCAPTCHA Checkbox */}
                    <div className="flex justify-center py-2">
                      <Turnstile
                        ref={recaptchaRef}
                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
                        onSuccess={(token) => setRecaptchaToken(token)}
                        onExpire={() => setRecaptchaToken(null)}
                        options={{ theme: 'light', size: 'normal' }}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                        boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                        color: '#0a0f1e'
                      }}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
                    </button>
                  </form>

                  {/* Sign In link */}
                  <div className="text-center text-sm pt-2 flex flex-col items-center gap-3">
                    <div>
                      <span className="text-on-surface-variant">Already have an account? </span>
                      <Link to="/login" className="font-bold hover:underline"
                        style={{ color: 'rgba(212, 175, 55, 0.9)' }}>
                        Sign In
                      </Link>
                    </div>
                    <Link to="/" className="text-xs font-bold text-[#d4af37] hover:text-[#b8860b] hover:underline transition-colors">
                      ← Go back to Homepage
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full text-center space-y-6"
              >
                <div className="flex justify-center">
                  <div className="p-3 rounded-2xl"
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
                    }}>
                    <img src="/images/logo.jpeg" alt="Kingdom Alliance" className="w-8 h-8 object-contain" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="font-headline text-3xl text-on-surface font-bold tracking-tight">Account Created!</h2>
                  <p className="text-on-surface-variant text-sm">
                    We have sent a verification email to <span className="font-bold text-on-surface">{email}</span>. 
                    Please verify your email then complete your profile.
                  </p>
                </div>
                
                <div className="p-5 rounded-2xl flex items-start gap-4 text-left"
                  style={{
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                  }}>
                  <ShieldCheck className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Verification ensures a safe and authentic community for everyone. Check your inbox (and spam folder) for the link.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/onboarding')}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                    boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    color: '#0a0f1e'
                  }}
                >
                  Continue to Profile Setup
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md p-8 bg-white/95 rounded-[2.5rem] shadow-2xl border border-white/20 relative overflow-hidden"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <button
                onClick={handleCancelAndSignOut}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-[#d4af37]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-headline text-2xl text-[#040e2a] font-bold">Verify Your Email</h3>
                  <p className="text-sm text-gray-500">
                    We have sent a 6-digit verification code to<br />
                    <span className="font-bold text-[#040e2a]">{email}</span>
                  </p>
                </div>

                {otpError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-left font-medium"
                  >
                    {otpError}
                  </motion.div>
                )}

                <div className="flex justify-center gap-2.5">
                  {otpInputs.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => {
                        const inputVal = e.target.value.replace(/[^0-9]/g, '');
                        const newInputs = [...otpInputs];
                        newInputs[idx] = inputVal;
                        setOtpInputs(newInputs);

                        if (inputVal && idx < 5) {
                          otpRefs.current[idx + 1]?.focus();
                        }
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
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all bg-white"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otpInputs.some(v => !v)}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                    boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    color: '#0a0f1e'
                  }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#0a0f1e]" />
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <div className="flex flex-col items-center justify-center gap-2 text-sm pt-2">
                  <div className="flex justify-center">
                    <Turnstile
                      ref={resendCaptchaRef}
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
                      onSuccess={(token) => setResendCaptchaToken(token)}
                      onExpire={() => setResendCaptchaToken(null)}
                      options={{ theme: 'light', size: 'normal' }}
                    />
                  </div>
                  {otpTimer > 0 ? (
                    <span className="text-gray-500">
                      Resend code in <span className="font-bold text-[#d4af37]">{otpTimer}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpSending}
                      className="text-[#d4af37] font-bold hover:underline disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {otpSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Resend OTP
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCancelAndSignOut}
                    className="text-gray-400 hover:text-red-500 transition-colors text-xs font-semibold mt-4"
                  >
                    Cancel & Sign Out
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
