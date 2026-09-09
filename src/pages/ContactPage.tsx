import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useSettings } from '../lib/SettingsContext';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      setError("Please complete the verification to confirm you are not a robot.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name,
        email,
        mobile,
        subject,
        message,
        recaptchaToken,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setSuccess(true);
      toast.success("Message sent successfully!");
    } catch (err: any) {
      console.error("Submit failed:", err);
      setError("Failed to send message. Please try again.");
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 40%, #f0e2cc 70%, #faf4ea 100%)' }}>
      
      {/* Exact Header from LandingPage.tsx */}
      <PublicNavbar />

      {/* Ambient background orbs from LoginPage.tsx */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-45"
          style={{ background: 'radial-gradient(circle, #f0e2cc 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, #d4af3720 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #e8f5e9 0%, transparent 70%)' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
      </div>

      {/* Decorative SVG Roses & Leaves - Top Left */}
      <svg className="absolute -top-10 -left-10 w-48 h-48 md:w-80 md:h-80 opacity-30 pointer-events-none select-none z-0" viewBox="0 0 100 100" fill="none">
        <path d="M30 20C20 30 15 50 35 70C55 50 45 35 30 20Z" fill="url(#contact-rose-mint)" opacity="0.85"/>
        <path d="M15 45C5 55 10 70 25 75C40 65 30 50 15 45Z" fill="url(#contact-rose-green)" opacity="0.75"/>
        <path d="M50 15C60 25 55 40 40 45C35 30 40 20 50 15Z" fill="url(#contact-leaf-dark-green)" opacity="0.5"/>
        <path d="M25 60C35 75 55 70 65 85" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>

      {/* Decorative SVG Roses & Leaves - Bottom Right */}
      <svg className="absolute -bottom-10 -right-10 w-48 h-48 md:w-80 md:h-80 opacity-30 pointer-events-none select-none z-0" viewBox="0 0 100 100" fill="none">
        <path d="M70 80C80 70 85 50 65 30C45 50 55 65 70 80Z" fill="url(#contact-rose-mint)" opacity="0.85"/>
        <path d="M85 55C95 45 90 30 75 25C60 35 70 50 85 55Z" fill="url(#contact-rose-green)" opacity="0.75"/>
        <path d="M50 85C40 75 45 60 60 55C65 70 60 80 50 85Z" fill="url(#contact-leaf-dark-green)" opacity="0.5"/>
        <path d="M75 40C65 25 45 30 35 15" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
          <radialGradient id="contact-rose-mint" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#faf4ea" />
            <stop offset="50%" stopColor="#dfc88a" />
            <stop offset="100%" stopColor="#C9A84C" />
          </radialGradient>
          <radialGradient id="contact-rose-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dfc88a" />
            <stop offset="100%" stopColor="#b8860b" />
          </radialGradient>
          <linearGradient id="contact-leaf-dark-green" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0e2cc" />
            <stop offset="100%" stopColor="#8f6337" />
          </linearGradient>
        </defs>
      </svg>

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
              <h2 className="text-2xl font-bold text-[#4a3521]">Message Sent!</h2>
              <p className="text-[#8a7a63] text-sm">Thank you for reaching out. We will get back to you shortly.</p>
              <Link to="/" className="inline-block mt-4 text-[#d4af37] font-medium hover:underline">Return Home</Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-3 mb-8">
                <h1 className="text-3xl font-serif font-bold text-[#b8860b]">Contact Us</h1>
                <p className="text-[#6b5a44] text-sm">We'd love to hear from you. Please send us a message below.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.95)", border: '1px solid #e2ddd2', backdropFilter: 'blur(10px)' }}
                />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mobile Number"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50"
                  style={{ background: "rgba(255,255,255,0.95)", border: '1px solid #e2ddd2', backdropFilter: 'blur(10px)' }}
                />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.95)", border: '1px solid #e2ddd2', backdropFilter: 'blur(10px)' }}
              />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                required
                className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.95)", border: '1px solid #e2ddd2', backdropFilter: 'blur(10px)' }}
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your Message..."
                required
                className="w-full px-4 py-3.5 min-h-[120px] rounded-2xl outline-none transition-all placeholder:text-on-surface-variant/40 text-on-surface text-sm disabled:opacity-50 resize-y"
                style={{ background: "rgba(255,255,255,0.95)", border: '1px solid #e2ddd2', backdropFilter: 'blur(10px)' }}
              />

              {/* Turnstile Verification */}
              <div className="flex justify-center py-2">
                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token) => setRecaptchaToken(token)}
                  onExpire={() => setRecaptchaToken(null)}
                  options={{ theme: 'light', size: 'normal' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #b3804c 0%, #8f6337 100%)',
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                  color: '#ffffff'
                }}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#ffffff]" /> : "Send Message"}
              </button>
            </form>
          </>)}
          </div>
        </motion.div>
      </main>


      {/* Footer from LandingPage */}
      <footer className="py-20 relative z-10 border-t border-[#eee5d2] bg-[#f6ecdd]/70">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-outline-variant/30 pb-16 mb-12">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/logo.jpeg" alt="Kingdom Alliance" className="w-8 h-8 object-contain" />
              <span className="font-headline text-3xl text-on-surface font-bold tracking-tight">{settings.siteName}</span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-x-10 gap-y-6 text-lg font-light">
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-on-surface-variant hover:text-[#8f6337] transition-colors">Home</Link>
              <Link to="/register" className="text-on-surface-variant hover:text-[#8f6337] transition-colors">Register</Link>
              <Link to="/login" className="text-on-surface-variant hover:text-[#8f6337] transition-colors">Login</Link>
              <Link to="/terms" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-on-surface-variant hover:text-[#8f6337] transition-colors">Terms</Link>
              <Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-on-surface-variant hover:text-[#8f6337] transition-colors">Contact Us</Link>
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
