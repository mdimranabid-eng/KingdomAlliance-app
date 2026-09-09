import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Key, X, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { requestOtp } from '../services/otpService';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

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

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<TurnstileInstance>(null);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!recaptchaToken) {
      setError("Please complete the verification to confirm you are not a robot.");
      setLoading(false);
      return;
    }

    try {
      // OTP is generated, stored (hashed) and emailed entirely server-side.
      // The server responds identically whether or not the account exists,
      // to prevent user enumeration.
      await requestOtp(email, 'password_reset', recaptchaToken);
      // Token was just consumed server-side — force a fresh check for retries
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);

      // Change step state to 2
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
              <div className="flex justify-center py-2">
                <Turnstile
                  ref={recaptchaRef}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token) => setRecaptchaToken(token)}
                  onExpire={() => setRecaptchaToken(null)}
                  options={{ theme: 'light', size: 'normal' }}
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
