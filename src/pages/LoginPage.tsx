import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import { signInWithGoogle, signInWithEmail } from '../services/authService';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Loader2, Eye, EyeOff, CheckCircle2, Heart, Lock as LockIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { resolveApprovalStatus } from '../lib/utils';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const enforceGatekeeperRouting = async (uid: string) => {
    try {
      // 1. Intercept admin accounts attempting standard client login
      const adminRef = doc(db, 'admins', uid);
      const adminDoc = await getDoc(adminRef);
      if (adminDoc.exists()) {
        const { signOut } = await import('firebase/auth');
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
        navigate('/dashboard');
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
      default:
        return err.message || "An unexpected error occurred.";
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const response = await signInWithGoogle();
      await enforceGatekeeperRouting(response.user.uid);
    } catch (err: any) {
      setError(formatError(err));
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!executeRecaptcha) {
      setError("Security check loading, please try again in a second.");
      setLoading(false);
      return;
    }

    try {
      // Generate the invisible token
      await executeRecaptcha('login_attempt');

      // Proceed with existing client-side Firebase Auth check
      const responseAuth = await signInWithEmail(email, password);
      await enforceGatekeeperRouting(responseAuth.user.uid);
    } catch (err: any) {
      setError(formatError(err));
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, #f5f0e8 0%, #fafaf8 40%, #f0ece4 70%, #faf8f2 100%)'
    }}
  >
    {/* Ambient background orbs */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, #d4af3740 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, #c9a84c30 0%, transparent 70%)' }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-3xl opacity-15"
        style={{ background: 'radial-gradient(circle, #1a2e4a20 0%, transparent 70%)' }} />
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
    </div>

    {/* Main glass card */}
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-md mx-4 rounded-[2.5rem] overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.80)',
        boxShadow: '0 32px 64px -12px rgba(26,46,74,0.12), inset 0 1px 0 rgba(255,255,255,0.90), inset 0 -1px 0 rgba(0,0,0,0.04)'
      }}
    >
      {/* Inner highlight */}
      <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, transparent 50%, rgba(0,0,0,0.02) 100%)'
        }} />

      <div className="relative p-8 md:p-10 space-y-7">

        {/* Logo + Title */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-2xl"
              style={{
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
              }}>
              <KingdomCrossIcon size="md" />
            </div>
          </div>
          <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
            Welcome Back
          </h2>
          <p className="text-on-surface-variant text-sm">
            Sign in to your Kingdom Alliance account
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
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-medium transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              background: 'rgba(255, 255, 255, 0.80)',
              border: '1px solid rgba(26, 46, 74, 0.12)',
              color: '#374151',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.90)'
            }}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white/60" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="px-4 text-[10px] text-on-surface-variant/50 uppercase tracking-widest absolute bg-transparent"
              style={{ background: 'transparent' }}>
              or sign in with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-3" autoComplete="off">
            <input type="text" name="prevent_autofill_email"
              style={{ position: 'absolute', top: -1000, left: -1000, width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
              tabIndex={-1} aria-hidden="true" />
            <input type="password" name="prevent_autofill_password"
              style={{ position: 'absolute', top: -1000, left: -1000, width: 1, height: 1, opacity: 0, overflow: 'hidden' }}
              tabIndex={-1} aria-hidden="true" />

            {/* Email */}
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

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs font-semibold transition-colors"
                style={{ color: 'rgba(212, 175, 55, 0.85)' }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                color: '#0a0f1e'
              }}
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                : "Sign In"
              }
            </button>
          </form>

          {/* Register link */}
          <div className="text-center text-sm pt-2">
            <span className="text-on-surface-variant">Don't have an account? </span>
            <Link to="/register" className="font-bold hover:underline"
              style={{ color: 'rgba(212, 175, 55, 0.9)' }}>
              Register here
            </Link>
          </div>
        </div>
      </div>
    </motion.div>

    <ForgotPasswordModal
      isOpen={isForgotModalOpen}
      onClose={() => setIsForgotModalOpen(false)}
    />
  </div>
);
}
