import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Key, X, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { sendEmail } from '../lib/email';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const generateOTP = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(array[0] % 900000 + 100000);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!executeRecaptcha) {
      setError("Security check loading, please try again in a second.");
      setLoading(false);
      return;
    }

    try {
      // 1. Validate the reCAPTCHA token
      const token = await executeRecaptcha('forgot_password');

      // 2. Check if the user exists in Firestore users collection
      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      const userSnap = await getDocs(userQuery);
      if (userSnap.empty) {
        setError("User does not exist.");
        setLoading(false);
        return;
      }

      // 3. Generate a 6-digit numeric OTP
      const code = generateOTP();

      // Log OTP in local dev console
      console.log(`🔑 [DEV ONLY] Generated Password Reset OTP for ${email}: ${code}`);

      // 4. Delete any old OTPs for this email in Firestore temp_otps collection
      const oldOtpsQuery = query(collection(db, 'temp_otps'), where('email', '==', email));
      const oldOtpsSnap = await getDocs(oldOtpsQuery);
      const deletePromises = oldOtpsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // 5. Save the new OTP to temp_otps with a 10-minute expiration (expiresAt)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await addDoc(collection(db, 'temp_otps'), {
        email,
        otp: code,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp()
      });

      // 6. Call the existing sendEmail function from src/lib/email.ts
      await sendEmail({
        to_email: email,
        otp_code: code,
        type: 'password_reset',
        captchaToken: token
      } as any);

      // 7. Change step state to 2
      setStep(2);
    } catch (err: any) {
      console.error('OTP Request failed:', err);
      setError(err.message || 'Failed to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Verify newPassword === confirmPassword
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // 2. Send POST request to VITE_BACKEND_URL + '/api/reset-password'
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      // 3. Show success message
      setSuccessMessage("Password updated successfully. You may now log in.");
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setError(err.message || 'Verification or password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset states when closed
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-surface rounded-[2.5rem] shadow-2xl border border-outline-variant overflow-hidden"
      >
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              {successMessage ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : step === 1 ? (
                <Mail className="w-8 h-8" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
            
            <h2 className="font-headline text-3xl text-on-surface mb-2 font-bold">
              {successMessage ? "Success" : step === 1 ? "Forgot Password?" : "Reset Password"}
            </h2>
            <p className="text-on-surface-variant text-sm px-4">
              {successMessage 
                ? successMessage 
                : step === 1 
                  ? "Enter your email address and we'll send you an OTP to verify your identity." 
                  : "Enter the OTP sent to your email and your new password."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container text-error rounded-xl text-sm border border-error/20 flex items-center gap-3">
              <X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {successMessage ? (
            <div className="space-y-6">
              <button
                onClick={handleClose}
                className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold hover:bg-primary-hover transition-all"
              >
                Close
              </button>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface"
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
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative flex justify-center gap-2 mb-2">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="OTP Code"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder:text-outline"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface"
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
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface"
                />
              </div>
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-on-surface-variant font-medium hover:text-primary transition-colors"
                >
                  Back to Email
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
