import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import { signInWithGoogle, signInWithEmail } from '../services/authService';
import { Loader2, Eye, EyeOff, CheckCircle2, Heart, Lock as LockIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { resolveApprovalStatus } from '../lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
    try {
      const response = await signInWithEmail(email, password);
      await enforceGatekeeperRouting(response.user.uid);
    } catch (err: any) {
      setError(formatError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-body">
      {/* LEFT COLUMN - Decorative (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#040e2a] flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <KingdomCrossIcon size="lg" />
            <h1 className="font-headline text-5xl font-bold text-white tracking-tight">Kingdom Alliance</h1>
            <p className="text-[#d4af37] text-xl font-medium">Connecting Hearts Through Faith</p>
          </div>

          <div className="space-y-6 pt-12">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                <span className="text-[#d4af37] text-xl">✝</span>
              </div>
              <div>
                <p className="font-bold">Faith-centered matches</p>
                <p className="text-sm text-white/60">Connect with those who share your values</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <p className="font-bold">Verified profiles</p>
                <p className="text-sm text-white/60">A secure environment for sacred unions</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                <LockIcon className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <p className="font-bold">Safe and private</p>
                <p className="text-sm text-white/60">Your journey is protected and confidential</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center text-white/40 text-sm italic">
          "A sacred space for Christian matrimony"
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* RIGHT COLUMN - Form */}
      <div className="w-full lg:w-1/2 bg-[#f9f9f6] flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="lg:hidden flex justify-center mb-4">
              <KingdomCrossIcon size="md" />
            </div>
            <h2 className="font-headline text-3xl text-[#040e2a] font-bold">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Sign in to your Kingdom Alliance account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-3.5 px-4 rounded-xl shadow-sm hover:shadow-md transition-all group disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span className="font-medium text-gray-700">Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-[#f9f9f6] px-4 text-xs text-gray-400 uppercase tracking-widest relative z-10">or sign in with email</span>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-4" autoComplete="off">
              {/* Dummy inputs to deceive browser password managers and prevent auto-fill on page load */}
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

              <div className="space-y-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1.5 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-sm font-semibold text-[#d4af37] hover:underline">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-4 bg-[#040e2a] hover:bg-[#0a1b4d] text-white rounded-xl font-bold shadow-lg shadow-[#040e2a]/10 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : "Sign In"}
              </button>
            </form>

            <div className="text-center text-sm pt-4">
              <span className="text-gray-500">Don't have an account? </span>
              <Link to="/register" className="text-[#d4af37] font-bold hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
