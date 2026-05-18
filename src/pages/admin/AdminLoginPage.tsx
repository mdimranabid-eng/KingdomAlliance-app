import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { KingdomCrossIcon } from '../../components/KingdomCrossIcon';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { formatAuthError } from '../../lib/utils';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Strict email check for admin panel entry
    const adminEmails = ['md.imranabid@gmail.com', 'admin@kingdomalliance.com', 'gsmtp22@gmail.com'];
    if (!adminEmails.includes(email)) {
      setError("Unauthorized access. Admin credentials required.");
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Verify if the user is truly an admin in Firestore
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (!adminDoc.exists()) {
        await auth.signOut();
        setError("Unauthorized: This account does not have administrative privileges.");
        setLoading(false);
        return;
      }

      // Successful admin login
      navigate('/admin');
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      setError(formatAuthError(err));
      setLoading(false);
    }
  };

  // If already logged in as admin, redirect
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
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
          <form onSubmit={handleAdminLogin} className="space-y-6" autoComplete="off">
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
                  className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
                  className="w-full pl-12 pr-4 py-4 bg-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
    </div>
  );
}
