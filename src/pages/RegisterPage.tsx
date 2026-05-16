import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import { signInWithGoogle, registerWithEmail } from '../services/authService';
import { useAuth } from '../lib/AuthContext';
import { Loader2, Eye, EyeOff, CheckCircle2, Heart, Lock as LockIcon, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { sendEmail } from '../lib/email';

export default function RegisterPage() {
  const { user, profile, signOut } = useAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [confirmedChristian, setConfirmedChristian] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInputs, setOtpInputs] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
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
    setGoogleLoading(true);
    setError(null);
    try {
      const response = await signInWithGoogle();
      if (response.onboardingComplete === false || response.status === 'incomplete') {
        navigate('/onboarding');
      } else if (response.status === 'pending') {
        navigate('/pending-approval');
      } else if (response.status === 'approved') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || "Google sign-up failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const sendEmailOtp = async (targetEmail: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Log to developer console for easy local testing & fallback
    console.log(`🔑 [DEV ONLY] Generated OTP for ${targetEmail}: ${code}`);

    const oldOtpsQuery = query(collection(db, 'temp_otps'), where('email', '==', targetEmail));
    const oldOtpsSnap = await getDocs(oldOtpsQuery);
    const deletePromises = oldOtpsSnap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await addDoc(collection(db, 'temp_otps'), {
      email: targetEmail,
      otp: code,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp()
    });

    try {
      await sendEmail({
        to_email: targetEmail,
        otp_code: code,
        type: 'otp'
      });
    } catch (err) {
      console.warn("⚠️ EmailJS failed to send verification email. Falling back to dev-console OTP:", err);
      // Do not rethrow the error so that local development and registration flow is never blocked
    }
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

    if (!agreedTerms || !confirmedChristian) {
      setError("Please agree to all terms and conditions to continue.");
      return;
    }

    setLoading(true);
    try {
      const response = await registerWithEmail(email, password, fullName);
      const uid = response.user.uid;
      setRegisteredUid(uid);

      await sendEmailOtp(email);

      setOtpInputs(['', '', '', '', '', '']);
      setOtpError(null);
      setOtpTimer(60);
      setShowOtpModal(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Sign in instead.");
      } else {
        setError(err.message || "Registration failed.");
      }
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
      const q = query(
        collection(db, 'temp_otps'), 
        where('email', '==', email),
        where('otp', '==', code)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        setOtpError("Invalid verification code. Please check and try again.");
        return;
      }

      const otpData = snap.docs[0].data();
      if (otpData.expiresAt.toDate() < new Date()) {
        setOtpError("This code has expired. Please click Resend OTP to receive a new one.");
        return;
      }

      await deleteDoc(snap.docs[0].ref);

      const userRef = doc(db, 'users', registeredUid);
      await updateDoc(userRef, { emailVerified: true });

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
    setOtpError(null);
    setOtpSending(true);
    try {
      await sendEmailOtp(email);
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
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex font-body bg-[#f9f9f6]">
      {/* LEFT COLUMN - Decorative (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#040e2a] flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <KingdomCrossIcon size="lg" />
            <h1 className="font-headline text-5xl font-bold text-white tracking-tight">Kingdom Alliance</h1>
            <p className="text-[#d4af37] text-xl font-medium">Connecting Hearts Through Faith</p>
          </div>

          <div className="flex flex-col items-center space-y-4 pt-12 text-center">
            <h2 className="font-headline text-3xl font-bold">Join Kingdom Alliance</h2>
            <p className="text-white/70 text-lg">Begin your journey to a faith-filled union</p>
          </div>
        </div>

        <div className="relative z-10 text-center text-white/40 text-sm italic">
          "A sacred space for Christian matrimony"
        </div>

        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* RIGHT COLUMN - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="lg:hidden flex justify-center mb-4">
                  <KingdomCrossIcon size="md" />
                </div>
                <h2 className="font-headline text-3xl text-[#040e2a] font-bold">Create Your Account</h2>
                <p className="text-gray-500 text-sm">Join thousands of faith-filled singles</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <button
                  onClick={handleGoogleSignUp}
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
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span className="font-medium text-gray-700">Sign up with Google</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-200 w-full"></div>
                  <span className="bg-[#f9f9f6] px-4 text-xs text-gray-400 uppercase tracking-widest relative z-10">or register with email</span>
                </div>

                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                  />
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {password && (
                      <div className="space-y-1 px-1">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${strength.color}`} 
                            style={{ width: `${strength.score}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Strength: {strength.label}</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                  />

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0 flex items-center justify-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:bg-[#d4af37] checked:border-[#d4af37] transition-all" 
                        />
                        <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm text-gray-600">
                        I agree to the <Link to="/terms" target="_blank" className="text-[#d4af37] hover:underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-[#d4af37] hover:underline">Privacy Policy</Link>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0 flex items-center justify-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={confirmedChristian}
                          onChange={(e) => setConfirmedChristian(e.target.checked)}
                          className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md checked:bg-[#d4af37] checked:border-[#d4af37] transition-all" 
                        />
                        <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm text-gray-600">
                        I confirm I am a committed Christian seeking a faith-centered marriage
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-4 bg-[#040e2a] hover:bg-[#0a1b4d] text-white rounded-xl font-bold shadow-lg shadow-[#040e2a]/10 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : "Create Account"}
                  </button>
                </form>

                <div className="text-center text-sm pt-4">
                  <span className="text-gray-500">Already have an account? </span>
                  <Link to="/login" className="text-[#d4af37] font-bold hover:underline">
                    Sign In
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md text-center space-y-8"
            >
              <div className="flex justify-center">
                <KingdomCrossIcon size="lg" />
              </div>
              <div className="space-y-4">
                <h2 className="font-headline text-3xl text-[#040e2a] font-bold">Account Created!</h2>
                <p className="text-gray-600">
                  We have sent a verification email to <span className="font-bold text-[#040e2a]">{email}</span>. 
                  Please verify your email then complete your profile.
                </p>
              </div>
              
              <div className="bg-[#d4af37]/10 p-6 rounded-2xl flex items-start gap-4 text-left border border-[#d4af37]/20">
                <ShieldCheck className="w-6 h-6 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#040e2a]/80">
                  Verification ensures a safe and authentic community for everyone. Check your inbox (and spam folder) for the link.
                </p>
              </div>

              <button
                onClick={() => navigate('/onboarding')}
                className="w-full py-4 bg-[#040e2a] hover:bg-[#0a1b4d] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#040e2a]/10"
              >
                Continue to Profile Setup
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
                className="w-full max-w-md p-8 bg-white/95 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden"
              >
                <button
                  onClick={handleCancelAndSignOut}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
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
                    className="w-full py-4 bg-[#040e2a] hover:bg-[#0a1b4d] text-white rounded-xl font-bold shadow-lg shadow-[#040e2a]/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      "Verify OTP"
                    )}
                  </button>

                  <div className="flex flex-col items-center justify-center gap-2 text-sm pt-2">
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
    </div>
  );
}
