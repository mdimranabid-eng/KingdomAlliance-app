import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Heart, Loader2, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { formatAuthError } from '../lib/utils';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'account_restricted') {
      setError("Your account has been suspended or blocked. Please contact support if you believe this is an error.");
    }
  }, []);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Check if profile exists
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (adminDoc.exists()) {
        await auth.signOut();
        setError("Admins must login through the Admin Portal. Please use the administrative login page.");
        setLoading(false);
        return;
      }

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        if (profileData.status === 'suspended' || profileData.status === 'blocked') {
          await auth.signOut();
          setError(`Your account has been ${profileData.status}. Please contact support if you believe this is an error.`);
          setLoading(false);
          return;
        }
        navigate('/dashboard');
      } else {
        // New user, go to registration stepper
        navigate('/register');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant overflow-hidden"
      >
        <div className="p-8 text-center space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-10 h-10 text-primary fill-primary" />
            <span className="font-headline text-3xl text-primary font-bold tracking-tight">Kingdom Alliance</span>
          </Link>

          <div className="space-y-2">
            <h1 className="font-headline text-3xl text-on-surface">Welcome Back</h1>
            <p className="text-on-surface-variant font-body-md">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="p-4 bg-error-container text-error rounded-xl text-sm border border-error/20">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailPasswordLogin} className="space-y-4 pt-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full pl-12 pr-4 py-4 bg-surface-container-high border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-4 bg-surface-container-high border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm font-bold text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-primary hover:bg-primary-hover text-on-primary rounded-2xl transition-all font-label-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-on-surface-variant pt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Register now
            </Link>
          </p>
        </div>

        <div className="bg-surface-container p-6 text-center text-xs text-on-surface-variant space-y-2">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          <div className="flex justify-center gap-4 text-primary font-semibold">
            <Link to="/">Terms</Link>
            <Link to="/">Privacy</Link>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
}
