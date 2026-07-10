import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import PublicNavbar from '../components/PublicNavbar';
import { motion } from 'motion/react';
import { BookOpen, Church, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden text-slate-800"
         style={{ background: 'linear-gradient(135deg, #f5f0e8 0%, #fafaf8 40%, #f0ece4 70%, #faf8f2 100%)' }}>
      
      {/* Header */}
      <PublicNavbar />

      {/* Main Content */}
      <main className="flex-1 relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            {settings.siteName}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mt-2 font-medium">
            Our Story and Noble Purpose
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column */}
          <div className="space-y-10">
            {/* Section 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-6 h-6 text-slate-800" />
                <h2 className="text-2xl font-bold text-slate-900 uppercase">OUR FAITH-BASED FOUNDATION</h2>
              </div>
              <p className="text-slate-700 leading-relaxed text-[1.05rem]">
                At {settings.siteName}, we believe that a truly successful marriage is built on a shared foundation of faith in Jesus Christ. We are more than a <span className="font-bold">matrimonial website</span>; we are a <span className="font-bold">community-led initiative</span> driven by a noble purpose.
              </p>
            </motion.div>

            {/* Section 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <h2 className="text-2xl font-bold text-slate-900 uppercase mb-3">GUIDING VALUES</h2>
              <p className="text-slate-700 leading-relaxed text-[1.05rem]">
                Our core values are deeply rooted in biblical teachings. We emphasize the sanctity of marriage, the importance of mutual respect, and the power of a Christ-centered relationship to weather life's challenges. These values guide everything we do, ensuring your search for a life partner is aligned with your faith.
              </p>
            </motion.div>

            {/* Section 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">
                {settings.siteName} Difference
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Card 1 */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-4 items-start">
                  <div className="p-3 bg-[#e8cdb0]/30 rounded-xl">
                    <BookOpen className="w-6 h-6 text-[#9a6a42]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Faith-First Matching</h4>
                    <p className="text-sm text-slate-600 leading-snug">Our faith-first matching is dedicated to putting faith at the center of your relationship.</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-4 items-start">
                  <div className="p-3 bg-[#c9b78a]/30 rounded-xl">
                    <Church className="w-6 h-6 text-[#a38a4b]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Church Endorsement</h4>
                    <p className="text-sm text-slate-600 leading-snug">Designed to honor the church and protect the sanctity of marriages.</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-4 items-start">
                  <div className="p-3 bg-[#e0aa96]/30 rounded-xl">
                    <HeartHandshake className="w-6 h-6 text-[#b66c4c]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Community Support</h4>
                    <p className="text-sm text-slate-600 leading-snug">We actively support our community and foster strong, lasting relationships.</p>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-4 items-start">
                  <div className="p-3 bg-[#8fb3a4]/30 rounded-xl">
                    <ShieldCheck className="w-6 h-6 text-[#4a7563]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Focus on Integrity</h4>
                    <p className="text-sm text-slate-600 leading-snug">Focus on truth and maintaining absolute integrity in everything we do.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* Right Column - Illustration Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#78968d] rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between shadow-2xl border border-white/10"
          >
            <div className="flex justify-between gap-6 mb-6">
              <p className="text-white/95 text-sm font-medium w-[45%] leading-relaxed drop-shadow-sm">
                Run by a dedicated team to honor the bonds of parents and present healthy weddings.
              </p>
              <p className="text-white/95 text-sm font-medium w-[45%] text-right leading-relaxed drop-shadow-sm">
                Our ultimate goal is to bless families and glorify God to help believers with their partners.
              </p>
            </div>

            <div className="flex-1 flex items-center justify-center py-4">
              <img 
                src="/images/church-rings.png" 
                alt="Church and Wedding Rings" 
                className="w-full max-w-[85%] object-contain mix-blend-multiply opacity-90 filter contrast-125"
              />
            </div>

            <div className="bg-[#f0ece4] rounded-2xl p-6 mt-6 shadow-inner text-center">
              <p className="text-slate-800 font-medium text-[1.05rem] leading-relaxed">
                If you are a Christian single looking for a partner who will honor God alongside you, we invite you to join our community. Your story of faith and love begins here.
              </p>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest py-20 relative z-10 border-t border-black/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-outline-variant/30 pb-16 mb-12">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3">
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
