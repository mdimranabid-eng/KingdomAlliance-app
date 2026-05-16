import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Key, X, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { sendEmail } from '../lib/email';
import { sendPasswordResetEmail } from 'firebase/auth';
import { cn } from '../lib/utils';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Generate OTP
      const code = generateOTP();
      
      // 2. Store in Firestore with 10 min expiry
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      // Clean up old OTPs for this email first
      const oldOtpsQuery = query(collection(db, 'temp_otps'), where('email', '==', email));
      const oldOtpsSnap = await getDocs(oldOtpsQuery);
      const deletePromises = oldOtpsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      await addDoc(collection(db, 'temp_otps'), {
        email,
        otp: code,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp()
      });

      // 3. Send via EmailJS
      await sendEmail({
        to_email: email,
        otp_code: code,
        type: 'otp'
      });

      setStep('otp');
    } catch (err: any) {
      console.error('OTP Request failed:', err);
      setError('Failed to send OTP. Please check your email or try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'temp_otps'), 
        where('email', '==', email),
        where('otp', '==', otp)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setError('Invalid OTP code. Please try again.');
        setLoading(false);
        return;
      }

      const otpData = snap.docs[0].data();
      if (otpData.expiresAt.toDate() < new Date()) {
        setError('OTP has expired. Please request a new one.');
        setLoading(false);
        return;
      }

      // Success - delete OTP
      await deleteDoc(snap.docs[0].ref);
      
      // NOTE: Client-side Firebase Auth doesn't allow changing password without current password 
      // or a Reset Link (oobCode). For this prototype, we'll trigger the official Reset Link 
      // upon successful identity verification via OTP.
      await sendPasswordResetEmail(auth, email);
      setStep('success');
    } catch (err) {
      console.error('OTP Verification failed:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    // In a production app with Cloud Functions, we would call a secure function here:
    // await resetPasswordWithOTP({ email, otp, newPassword });
    // Since we are using client-side Firebase, we've already sent the Reset Link in the previous step.
    setStep('success');
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-surface rounded-[2.5rem] shadow-2xl border border-outline-variant overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              {step === 'email' && <Mail className="w-8 h-8" />}
              {step === 'otp' && <Key className="w-8 h-8" />}
              {step === 'reset' && <Lock className="w-8 h-8" />}
              {step === 'success' && <CheckCircle2 className="w-8 h-8" />}
            </div>
            
            <h2 className="font-headline text-3xl text-on-surface mb-2 font-bold">
              {step === 'email' && "Forgot Password?"}
              {step === 'otp' && "Check Your Email"}
              {step === 'reset' && "New Password"}
              {step === 'success' && "Check Your Inbox"}
            </h2>
            <p className="text-on-surface-variant text-sm px-4">
              {step === 'email' && "Enter your email address and we'll send you an OTP to verify your identity."}
              {step === 'otp' && `We've sent a 6-digit code to ${email}. It expires in 10 minutes.`}
              {step === 'reset' && "Create a secure new password for your account."}
              {step === 'success' && `For security, we've sent a final confirmation link to ${email}. Please click it to complete your password reset.`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-error rounded-xl text-sm border border-error/20 flex items-center gap-3">
              <X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Request OTP <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex justify-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  className="w-full max-w-[200px] text-center text-3xl font-black tracking-[0.5em] py-4 bg-surface-container-high border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-outline"
                />
              </div>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-sm text-on-surface-variant font-medium hover:text-primary transition-colors"
                >
                  Didn't get the code? Try again
                </button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-6">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  We've verified your identity using the OTP. For security, Firebase requires you to use the link sent to your email to finally update your password.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold hover:bg-primary-hover transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
