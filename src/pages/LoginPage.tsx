import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail } from '../services/authService';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { resolveApprovalStatus } from '../lib/utils';
import { signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, getMultiFactorResolver, TotpMultiFactorGenerator } from 'firebase/auth';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const navigate = useNavigate();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<TurnstileInstance>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  const enforceGatekeeperRouting = async (uid: string) => {
    try {
      const adminRef = doc(db, 'admins', uid);
      const adminDoc = await getDoc(adminRef);
      if (adminDoc.exists()) {
        await signOut(auth);
        throw new Error("Administrative accounts are restricted. Please sign in via the Admin Access portal.");
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        navigate('/onboarding');
        return;
      }

      const data = userDoc.data();
      const status = resolveApprovalStatus(data);

      if (status === 'banned' || data.isBanned) {
        navigate('/banned');
      } else if (status === 'not_approved' || status === 'pending') {
        navigate('/waiting-room');
      } else if (status === 'approved') {
        navigate('/profile');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error("Gatekeeper routing error:", err);
      throw new Error(err.message || "Failed to process user status routing.");
    }
  };

  const formatError = (err: any) => {
    const code = err.code;
    switch (code) {
      case 'auth/wrong-password':
        return "Incorrect password. Please try again.";
      case 'auth/user-not-found':
        return "No account found with this email.";
      case 'auth/too-many-requests':
        return "Too many attempts. Please try again later.";
      case 'auth/network-request-failed':
        return "Connection error. Check your internet.";
      case 'auth/multi-factor-auth-required':
        return "Multi-factor authentication is required for this account. Please enter your verification code.";
      default:
        return err.message || "An unexpected error occurred.";
    }
  };

  const handleGoogleSignIn = async () => {
    if (!recaptchaToken) {
      setError("Please complete the verification to confirm you are not a robot.");
      return;
    }
    setGoogleLoading(true);
    setError(null);
    try {
      await setPersistence(auth, keepSignedIn ? browserLocalPersistence : browserSessionPersistence);
      const response = await signInWithGoogle();
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      await enforceGatekeeperRouting(response.user.uid);
    } catch (err: any) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      if (err.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, err);
        setMfaResolver(resolver);
        setGoogleLoading(false);
        return;
      }
      setError(formatError(err));
      setGoogleLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      setMfaError("Please enter all 6 digits.");
      return;
    }
    setMfaLoading(true);
    setMfaError(null);
    try {
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(
        mfaResolver.hints[0].uid,
        mfaCode
      );
      const userCredential = await mfaResolver.resolveSignIn(assertion);
      setMfaResolver(null);
      setMfaCode('');
      await enforceGatekeeperRouting(userCredential.user.uid);
    } catch (err: any) {
      setMfaError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMfaCancel = () => {
    setMfaResolver(null);
    setMfaCode('');
    setMfaError(null);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!recaptchaToken) {
      setError("Please complete the verification to confirm you are not a robot.");
      setLoading(false);
      return;
    }

    try {
      await setPersistence(auth, keepSignedIn ? browserLocalPersistence : browserSessionPersistence);
      const responseAuth = await signInWithEmail(email, password);
      await enforceGatekeeperRouting(responseAuth.user.uid);
    } catch (err: any) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      if (err.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, err);
        setMfaResolver(resolver);
        setLoading(false);
        return;
      }
      setError(formatError(err));
      setLoading(false);
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
            Welcome <em className="text-[#dfc88a] font-normal">back</em>,<br />beloved.
          </h1>
          <div className="san-fade san-d3 flex items-center gap-4 mt-7 max-w-[240px]">
            <div className="h-px flex-1 bg-[#dfc88a]/50" />
            <span className="text-[#dfc88a] text-sm">✝</span>
            <div className="h-px flex-1 bg-[#dfc88a]/50" />
          </div>
          <p className="san-fade san-d4 mt-7 text-white/70 text-[15px] leading-relaxed font-light max-w-md">
            "Two are better than one… For if they fall, the one will lift up his fellow."
            <span className="block mt-2 text-[#dfc88a] font-semibold text-[13px]">— Ecclesiastes 4:9–10</span>
          </p>
        </div>

        <div className="san-fade san-d5 space-y-3.5">
          {[
            'Faith-centered community',
            'Every profile prayerfully reviewed',
            'Private by design — you choose who sees you',
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
        {/* Mobile brand strip */}
        <div className="lg:hidden w-full sanctuary-grain sanctuary-panel text-white rounded-3xl p-6 mb-8 max-w-md">
          <div className="san-anim san-d1 flex items-center gap-3">
            <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-11 h-11 object-contain" />
            <div>
              <div className="font-headline font-bold text-base">The Kingdom Alliances</div>
              <div className="text-[#dfc88a] text-[9px] tracking-[2.5px] uppercase font-bold">Christian Matrimony</div>
            </div>
          </div>
          <p className="san-anim san-d2 font-headline text-xl mt-3">Welcome <em className="text-[#dfc88a]">back,</em> beloved.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="hidden lg:flex items-center gap-3 mb-9">
            <div className="w-11 h-11 rounded-xl bg-[#4a3521] text-[#dfc88a] flex items-center justify-center text-lg">✝</div>
            <span className="font-headline font-bold text-lg text-[#4a3521]">The Kingdom Alliances</span>
          </div>

          <h2 className="font-headline text-3xl font-semibold text-[#4a3521]">Sign in to continue</h2>
          <p className="text-[#8a7a65] text-sm mt-2 mb-8">Your journey continues — your matches await.</p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-3 text-[#a13c2f]"
              style={{ background: 'rgba(220, 90, 70, 0.1)', border: '1px solid rgba(220, 90, 70, 0.3)' }}>
              <span className="w-1.5 h-1.5 bg-[#c0392b] rounded-full flex-shrink-0" />
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {mfaResolver ? (
              <motion.div
                key="mfa"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-[#e8e2d5] bg-white p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#faf4ea] border border-[#f0e5cc] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#b8860b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-[#4a3521] text-[15px]">Two-Factor Authentication</h3>
                      <p className="text-[12px] text-[#8a7a65]">Enter the 6-digit code from your authenticator app</p>
                    </div>
                  </div>

                  {mfaError && (
                    <div className="mb-4 px-3 py-2 rounded-xl text-[12.5px] font-medium text-[#a13c2f]"
                      style={{ background: 'rgba(220, 90, 70, 0.1)', border: '1px solid rgba(220, 90, 70, 0.3)' }}>
                      {mfaError}
                    </div>
                  )}

                  <form onSubmit={handleMfaVerify} className="space-y-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setMfaCode(val);
                        if (mfaError) setMfaError(null);
                      }}
                      placeholder="000000"
                      className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold rounded-xl border border-[#e2ddd2] bg-[#fffdf9] px-4 py-3.5 text-[#4a3521] outline-none transition-shadow placeholder:text-[#d8cbb4] focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/15"
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleMfaCancel}
                        className="flex-1 py-2.5 rounded-xl border-[1.5px] border-[#e5dcc9] bg-white text-[13px] font-bold text-[#8a7a65] transition-colors hover:border-[#d8cbb4] hover:text-[#4a3521]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={mfaLoading || mfaCode.length !== 6}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-[0_12px_28px_-12px_rgba(143,99,55,0.55)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
                        style={{ background: 'linear-gradient(135deg, #b3804c 0%, #96683a 100%)' }}
                      >
                        {mfaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div key="login" initial={false}>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-semibold text-[14.5px] text-[#4b5563] bg-white border border-[#e2ddd2] transition-all active:scale-[0.98] hover:border-[#d2a273] disabled:opacity-50 mb-5"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#b3804c]" />
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <div className="flex items-center gap-4 my-6">
                  <div className="h-px flex-1 bg-[#e8e2d5]" />
                  <span className="text-[10px] text-[#a89f8d] uppercase tracking-[2px]">or sign in with email</span>
                  <div className="h-px flex-1 bg-[#e8e2d5]" />
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-4" autoComplete="off">
                  <input type="text" name="prevent_autofill_email"
                    style={{ position: 'absolute', top: -1000, left: -1000, width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
                    tabIndex={-1} aria-hidden="true" />
                  <input type="password" name="prevent_autofill_password"
                    style={{ position: 'absolute', top: -1000, left: -1000, width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
                    tabIndex={-1} aria-hidden="true" />

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
                      className="absolute right-4 top-[17px] text-[#b6ae9c] hover:text-[#8f6337] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox" checked={keepSignedIn}
                          onChange={(e) => setKeepSignedIn(e.target.checked)}
                          className="peer appearance-none w-4 h-4 rounded border border-[#c9bda9] checked:bg-[#C9A84C] checked:border-[#C9A84C] transition-all bg-white"
                        />
                        <CheckCircle2 className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <span className="text-[13px] text-[#8a7a65] font-medium">Keep me signed in</span>
                    </label>
                    <button
                      type="button" onClick={() => setIsForgotModalOpen(true)}
                      className="text-[13px] font-semibold text-[#b8860b] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="flex justify-center mb-2">
                    <Turnstile
                      ref={recaptchaRef}
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''}
                      onSuccess={(token) => setRecaptchaToken(token)}
                      onExpire={() => setRecaptchaToken(null)}
                      options={{ theme: 'light', size: 'normal' }}
                    />
                  </div>

                  <button
                    type="submit" disabled={loading || googleLoading}
                    className="sanctuary-btn w-full"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
                  </button>
                </form>

                <div className="text-center mt-8 text-[13.5px] text-[#8a7a65]">
                  New to The Kingdom Alliances?{' '}
                  <Link to="/register" className="font-bold text-[#4a3521] border-b-[1.5px] border-[#C9A84C] pb-0.5 hover:text-[#8f6337] transition-colors">
                    Begin your journey
                  </Link>
                </div>

                <div className="text-center mt-6">
                  <Link to="/" className="text-xs font-semibold text-[#a89f8d] hover:text-[#8f6337] transition-colors">
                    ← Back to Home
                  </Link>
                  <span className="mx-2 text-[#d8cbb4]">·</span>
                  <Link to="/faq" className="text-xs font-semibold text-[#a89f8d] hover:text-[#8f6337] transition-colors">
                    Help Center
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
}
