import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../lib/SettingsContext';
import PublicNavbar from '../components/PublicNavbar';
import { motion } from 'motion/react';
import { BookOpen, Church, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden"
         style={{
           fontFamily: "'Outfit', sans-serif",
           background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 40%, #f0e2cc 70%, #faf4ea 100%)'
         }}>
      
      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-45"
          style={{ background: 'radial-gradient(circle, #f0e2cc 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, #8f633720 0%, transparent 70%)' }} />
      </div>
      
      <PublicNavbar />

      <main className="flex-1 relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-[clamp(36px,5vw,54px)] font-extralight text-[#4a3521] tracking-tight" style={{ letterSpacing: '-0.025em' }}>
            {settings.siteName}
          </h1>
          <p className="text-[17px] text-[#7A6E68] mt-3 font-light">
            Our Story and Noble Purpose
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column */}
          <div className="space-y-10">
            {/* Section 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-6 h-6 text-[#C4856A]" />
                <h2 className="text-[20px] font-semibold text-[#C4856A] uppercase tracking-wider">Our Faith-Based Foundation</h2>
              </div>
              <p className="text-[#4a3521]/80 leading-relaxed text-[16px] font-light">
                At {settings.siteName}, we believe that a truly successful marriage is built on a shared foundation of faith in Jesus Christ. We are more than a <span className="font-medium text-[#4a3521]">matrimonial website</span>; we are a <span className="font-medium text-[#4a3521]">community-led initiative</span> driven by a noble purpose.
              </p>
            </motion.div>

            {/* Section 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <h2 className="text-[20px] font-semibold text-[#C4856A] uppercase tracking-wider mb-3">Guiding Values</h2>
              <p className="text-[#4a3521]/80 leading-relaxed text-[16px] font-light">
                Our core values are deeply rooted in biblical teachings. We emphasize the sanctity of marriage, the importance of mutual respect, and the power of a Christ-centered relationship to weather life's challenges. These values guide everything we do, ensuring your search for a life partner is aligned with your faith.
              </p>
            </motion.div>

            {/* Section 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <h3 className="text-[22px] font-extralight text-[#4a3521] mb-6" style={{ letterSpacing: '-0.01em' }}>
                {settings.siteName} Difference
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Card 1 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-white/50 flex gap-4 items-start">
                  <div className="p-3 bg-[#F5E6DE] rounded-xl">
                    <BookOpen className="w-6 h-6 text-[#C4856A]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[16px] text-[#4a3521] mb-1">Faith-First Matching</h4>
                    <p className="text-[14px] text-[#7A6E68] leading-snug font-light">Our faith-first matching is dedicated to putting faith at the center of your relationship.</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-white/50 flex gap-4 items-start">
                  <div className="p-3 bg-[#F5E6DE] rounded-xl">
                    <Church className="w-6 h-6 text-[#C4856A]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[16px] text-[#4a3521] mb-1">Church Endorsement</h4>
                    <p className="text-[14px] text-[#7A6E68] leading-snug font-light">Designed to honor the church and protect the sanctity of marriages.</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-white/50 flex gap-4 items-start">
                  <div className="p-3 bg-[#F5E6DE] rounded-xl">
                    <HeartHandshake className="w-6 h-6 text-[#C4856A]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[16px] text-[#4a3521] mb-1">Community Support</h4>
                    <p className="text-[14px] text-[#7A6E68] leading-snug font-light">We actively support our community and foster strong, lasting relationships.</p>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-white/50 flex gap-4 items-start">
                  <div className="p-3 bg-[#F5E6DE] rounded-xl">
                    <ShieldCheck className="w-6 h-6 text-[#C4856A]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[16px] text-[#4a3521] mb-1">Focus on Integrity</h4>
                    <p className="text-[14px] text-[#7A6E68] leading-snug font-light">Focus on truth and maintaining absolute integrity in everything we do.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="sanctuary-panel rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between shadow-2xl border border-white/10"
          >
            <div className="flex justify-between gap-6 mb-6">
              <p className="text-white/95 text-[15px] font-light w-[45%] leading-relaxed drop-shadow-sm">
                Run by a dedicated team to honor the bonds of parents and present healthy weddings.
              </p>
              <p className="text-white/95 text-[15px] font-light w-[45%] text-right leading-relaxed drop-shadow-sm">
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

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-6 shadow-inner text-center border border-white/10">
              <p className="text-white/90 font-light text-[16px] leading-relaxed">
                If you are a Christian single looking for a partner who will honor God alongside you, we invite you to join our community. Your story of faith and love begins here.
              </p>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-11 px-6 border-t border-black/[0.04] relative z-10 mt-auto" style={{ background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)' }}>
        <div className="max-w-[960px] mx-auto flex flex-col items-center gap-5">
          <Link to="/" className="flex items-center gap-2.5 no-underline text-[#4a3521]">
            <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-9 h-9 object-contain" />
            <span className="font-extralight text-[14px]" style={{ fontFamily: "'Outfit', sans-serif" }}>{settings.siteName}</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 list-none">
            <li><Link to="/" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Home</Link></li>
            <li><Link to="/register" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Register</Link></li>
            <li><Link to="/login" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Login</Link></li>
            <li><Link to="/terms" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Terms</Link></li>
            <li><Link to="/contact" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Contact Us</Link></li>
          </nav>
          <p className="text-[11.5px] text-[#AEA49E]">&copy; {new Date().getFullYear()} {settings.siteName}. Built on Faith, Rooted in Love.</p>
        </div>
      </footer>
    </div>
  );
}
