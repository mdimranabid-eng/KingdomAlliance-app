import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldCheck, X, CheckCircle2 } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { sendEmail } from '../lib/email';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import PublicNavbar from '../components/PublicNavbar';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInputs, setOtpInputs] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  const sendEmailOtp = async (targetEmail: string) => {
    const token = recaptchaToken || "";
    const code = Math.floor(100000 + Math.random() * 900000).toString();

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
        type: 'otp',
        captchaToken: token
      });
    } catch (err: any) {
      console.error("OTP Dispatch Failed:", err.message);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !mobile || !subject || !message) {
      setError("Please fill in all fields.");
      return;
    }

    const cleanMobile = mobile.replace(/[\s-]/g, '');
    if (!/^\d{10}$/.test(cleanMobile)) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    if (subject.trim().length > 100) {
      setError("Subject must not exceed 100 characters.");
      return;
    }

    if (message.trim().length > 1000) {
      setError("Message must not exceed 1000 characters.");
      return;
    }

    if (!recaptchaToken) {
      setError("Please check the reCAPTCHA box to verify you are human.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await sendEmailOtp(email);
      setOtpInputs(['', '', '', '', '', '']);
      setOtpError(null);
      setOtpTimer(60);
      setShowOtpModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const submitMessage = async () => {
    const token = recaptchaToken || "";
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name,
        email,
        mobile,
        subject,
        message,
        recaptchaToken: token,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setSuccess(true);
      toast.success("Message sent successfully!");
    } catch (err: any) {
      console.error("Submit failed:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
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
      setIsVerified(true);
      setShowOtpModal(false);
      await submitMessage();
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
      if (otpRefs.current[0]) otpRefs.current[0].focus();
    } catch (err: any) {
      console.error("Failed to resend code:", err);
      setOtpError("Failed to resend verification code. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!isVerified) return;
    await submitMessage();
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #fafaf8 40%, #f0ece4 70%, #faf8f2 100%)' }}>
      
      {/* Exact Header from LandingPage.tsx */}
      <PublicNavbar />

      {/* Ambient background orbs from LoginPage.tsx */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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

      <main className="flex-1 relative z-10 flex items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-lg rounded-[2.5rem] overflow-hidden p-8 sm:p-10"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.80)',
            boxShadow: '0 32px 64px -12px rgba(26,46,74,0.12), inset 0 1px 0 rgba(255,255,255,0.90), inset 0 -1px 0 rgba(0,0,0,0.04)'
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, transparent 50%, rgba(0,0,0,0.02) 100%)'
            }} />

          <div className="relative z-10">
          {success ? (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#d4af37]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Message Sent!</h2>
              <p className="text-slate-600 text-sm">Thank you for reaching out. We will get back to you shortly.</p>
              <Link to="/" className="inline-block mt-4 text-[#d4af37] font-medium hover:underline">Return Home</Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-3 mb-8">
                <h1 className="text-3xl font-serif font-bold text-[#b8860b]">Contact Us</h1>
                <p className="text-slate-700 text-sm">We'd love to hear from you. Please send us a message below.</p>
              </div>
              <form onSubmit={handleRequestOtp} className="space-y-4">
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  disabled={isVerified}
                  className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(26,46,74,0.12)', backdropFilter: 'blur(10px)' }}
                />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mobile Number"
                  required
                  disabled={isVerified}
                  className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(26,46,74,0.12)', backdropFilter: 'blur(10px)' }}
                />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                disabled={isVerified}
                className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(26,46,74,0.12)', backdropFilter: 'blur(10px)' }}
              />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                required
                disabled={isVerified}
                className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(26,46,74,0.12)', backdropFilter: 'blur(10px)' }}
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your Message..."
                required
                disabled={isVerified}
                className="w-full px-4 py-3.5 min-h-[120px] rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50 resize-y"
                style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(26,46,74,0.12)', backdropFilter: 'blur(10px)' }}
              />

              {/* reCAPTCHA Checkbox */}
              {!isVerified && (
                <div className="flex justify-center py-2">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}
                    onChange={(token) => setRecaptchaToken(token)}
                  />
                </div>
              )}

              {!isVerified ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.80)',
                    border: '1px solid rgba(26, 46, 74, 0.12)',
                    color: '#374151',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.90)'
                  }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-600" /> : "Verify Email to Send"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                    boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    color: '#0a0f1e'
                  }}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#0a0f1e]" /> : "Send Message"}
                </button>
              )}
            </form>
          </>)}
          </div>
        </motion.div>
      </main>

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md p-8 bg-[#faf8f2] rounded-3xl shadow-2xl border border-[#d4af37]/20 relative overflow-hidden"
            >
              <button
                onClick={() => setShowOtpModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                    <ShieldCheck className="w-8 h-8 text-[#d4af37]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-headline text-2xl text-slate-800 font-bold">Verify Your Email</h3>
                  <p className="text-sm text-slate-600">
                    We have sent a 6-digit verification code to<br />
                    <span className="font-bold text-[#d4af37]">{email}</span>
                  </p>
                </div>

                {otpError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-left font-medium"
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
                      className="w-12 h-14 text-center text-xl font-bold border border-slate-300 rounded-xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40 outline-none transition-all bg-white text-slate-800"
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
                  {otpTimer > 0 ? (
                    <span className="text-slate-600">
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
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer from LandingPage */}
      <footer className="bg-surface-container-highest py-20 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-outline-variant/30 pb-16 mb-12">
            <Link to="/" className="flex items-center gap-3">
              <KingdomCrossIcon size="md" />
              <span className="font-headline text-3xl text-on-surface font-bold tracking-tight">{settings.siteName}</span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-x-10 gap-y-6 text-lg font-light">
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-on-surface-variant hover:text-primary transition-colors">Home</Link>
              <Link to="/register" className="text-on-surface-variant hover:text-primary transition-colors">Register</Link>
              <Link to="/login" className="text-on-surface-variant hover:text-primary transition-colors">Login</Link>
              <Link to="/terms" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-on-surface-variant hover:text-primary transition-colors">Terms</Link>
              <Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-on-surface-variant hover:text-primary transition-colors">Contact Us</Link>
            </nav>
          </div>
          <div className="text-center text-on-surface-variant text-base font-light">
            &copy; {new Date().getFullYear()} {settings.siteName}. Built on Faith, Rooted in Love.
          </div>
        </div>
      </footer>
    </div>
  );
}
