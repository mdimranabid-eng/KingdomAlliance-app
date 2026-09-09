import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, Play, Shield, Users, MessageCircle, Heart, Lock, Eye, ShieldCheck, Database, Star, CheckCircle2, HelpCircle, ArrowUp } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';
import PublicNavbar from '../components/PublicNavbar';
import ScrollDown from '../components/ScrollDown';
import landingVideo from '../assets/landing-video.mp4';

const proverbs = [
  { ref: 'Proverbs 18:22', text: '"He who finds a wife finds a good thing and obtains favor from the Lord."' },
  { ref: 'Proverbs 19:14', text: '"Houses and wealth are an inheritance from fathers, but a prudent wife is from the Lord."' },
  { ref: 'Proverbs 31:10', text: '"An excellent wife who can find? She is far more precious than jewels."' },
  { ref: 'Proverbs 12:4', text: '"An excellent wife is the crown of her husband, but she who brings shame is like rottenness in his bones."' },
  { ref: 'Proverbs 31:11', text: '"The heart of her husband trusts in her, and he will have no lack of gain."' },
  { ref: 'Ecclesiastes 4:9', text: '"Two are better than one, because they have a good reward for their toil."' },
  { ref: 'Genesis 2:18', text: '"Then the Lord God said, \'It is not good that the man should be alone; I will make him a helper fit for him.\'"' },
  { ref: 'Proverbs 5:18-19', text: '"Let your fountain be blessed, and rejoice in the wife of your youth."' },
  { ref: 'Song of Solomon 8:6', text: '"Set me as a seal upon your heart, as a seal upon your arm, for love is strong as death."' },
  { ref: '1 Corinthians 13:4-7', text: '"Love is patient and kind; love does not envy or boast; it does not insist on its own way."' },
  { ref: 'Ephesians 5:25', text: '"Husbands, love your wives, as Christ loved the church and gave himself up for her."' },
  { ref: 'Colossians 3:14', text: '"Above all, put on love, which binds everything together in perfect harmony."' },
  { ref: '1 Peter 4:8', text: '"Above all, keep loving one another earnestly, since love covers a multitude of sins."' },
  { ref: 'Romans 12:9', text: '"Let love be genuine. Abhor what is evil; hold fast to what is good."' },
  { ref: 'Song of Solomon 2:10', text: '"Behold, my beloved speaks and says to me: Arise, my love, my fair one, and come away."' },
  { ref: 'Proverbs 3:3-4', text: '"Let not steadfast love and faithfulness forsake you; bind them around your neck; write them on the tablet of your heart."' },
  { ref: 'Jeremiah 29:11', text: '"For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope."' },
  { ref: 'Psalm 37:4', text: '"Delight yourself in the Lord, and he will give you the desires of your heart."' },
  { ref: 'Proverbs 10:12', text: '"Hatred stirs up strife, but love covers all offenses."' },
  { ref: '1 John 4:19', text: '"We love because he first loved us."' },
  { ref: 'Proverbs 31:26', text: '"She opens her mouth with wisdom, and the teaching of kindness is on her tongue."' },
  { ref: 'Song of Solomon 4:7', text: '"You are altogether beautiful, my love; there is no flaw in you."' },
  { ref: 'Proverbs 17:17', text: '"A friend loves at all times, and a brother is born for adversity."' },
  { ref: 'Matthew 19:6', text: '"So they are no longer two but one flesh. What therefore God has joined together, let not man separate."' },
  { ref: 'Proverbs 31:30', text: '"Charm is deceitful, and beauty is vain, but a woman who fears the Lord is to be praised."' },
];

const howItWorks = [
  { num: 1, title: 'Create Your Profile', desc: 'Share your faith journey, values, and what you\'re looking for. Every profile is personally reviewed.', color: 'terracotta' },
  { num: 2, title: 'Send Interests', desc: 'Browse matches and send interests to people who share your faith. Up to 5 per day.', color: 'coral' },
  { num: 3, title: 'Connect & Chat', desc: 'Once interests are accepted, start meaningful conversations in a secure environment.', color: 'sage' },
];

const benefits = [
  { title: 'Admin-Verified Profiles', desc: 'Every profile is manually reviewed. No catfish, no scammers — just real Christians seeking real relationships.' },
  { title: 'Denomination Focus', desc: 'Find someone who shares your specific theological background — Catholic, Protestant, Orthodox, or non-denominational.' },
];

const privacyFeatures = [
  'Photos blur until connections are accepted',
  'Block anyone discreetly — they\'ll never know',
  'Decline interests silently — no notifications',
  'Your data is never shared or sold',
];

const testimonials = [
  { initials: 'D&M', name: 'David & Maria', text: '"After years of dating apps that led nowhere, I found someone who shared my faith and values. The intentional approach made all the difference."' },
  { initials: 'J&A', name: 'James & Anna', text: '"The privacy features gave me confidence to be myself. I didn\'t feel pressured. When I was ready, I found someone truly special."' },
  { initials: 'R&C', name: 'Rachel & Chris', text: '"We connected on Kingdom Alliance and knew from our first conversation that God had brought us together. We\'re now married with our first child on the way."' },
];

const trustCards = [
  { icon: Lock, title: 'Photo Privacy', desc: 'Your photos blur until you accept a connection. You control who sees you.', color: 'terracotta' },
  { icon: Eye, title: 'Discreet Blocking', desc: 'Block anyone silently. They\'ll never know, and can\'t contact you again.', color: 'coral' },
  { icon: ShieldCheck, title: 'Admin Moderation', desc: 'Every profile and photo is reviewed by our team before going live.', color: 'sage' },
  { icon: Database, title: 'Data Protection', desc: 'Your information is encrypted, never shared, and never sold.', color: 'sand' },
];

const faqs = [
  { q: 'How does photo privacy work?', a: 'Your photos are automatically blurred until you both accept a connection. You can also set your visibility to "Accepted Connections Only" in Privacy Settings.' },
  { q: 'Is there a limit to how many people I can contact?', a: 'Yes, you can send up to 5 interests per day. This encourages quality over quantity. The limit resets 24 hours after your first interest of the day.' },
  { q: 'How do you verify profiles?', a: 'Every profile is manually reviewed by our admin team. We check for completeness, photo quality, and authenticity. This usually takes within 24 hours.' },
  { q: 'Can I block someone without them knowing?', a: 'Yes. When you block someone, they receive no notification. They simply can\'t see your profile or send you messages anymore.' },
];

const starIcon = (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#B89A72] text-[#B89A72]">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export default function LandingPage() {
  const { settings } = useSettings();
  const [currentVerse, setCurrentVerse] = useState(0);
  const [verseFading, setVerseFading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVerseFading(true);
      setTimeout(() => {
        setCurrentVerse(prev => (prev + 1) % proverbs.length);
        setVerseFading(false);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Desktop wheel interceptor — one scroll = one section, snappy
  useEffect(() => {
    const container = document.querySelector('.snap-container') as HTMLElement;
    if (!container) return;

    let isScrolling = false;
    const NAV_HEIGHT = 64;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0 || isScrolling) return;
      e.preventDefault();

      const sections = Array.from(container.querySelectorAll('section'));
      if (!sections.length) return;

      const scrollTop = container.scrollTop;
      let currentIndex = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= scrollTop + 10) {
          currentIndex = i;
        }
      }

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));

      if (nextIndex === currentIndex) return;

      isScrolling = true;
      const targetTop = Math.max(0, sections[nextIndex].offsetTop - NAV_HEIGHT);
      container.scrollTo({ top: targetTop, behavior: 'instant' });

      setTimeout(() => { isScrolling = false; }, 500);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const colors: Record<string, { bg: string; text: string }> = {
    terracotta: { bg: 'bg-[#F5E6DE]', text: 'text-[#C4856A]' },
    coral: { bg: 'bg-[#F8ECE6]', text: 'text-[#D4967E]' },
    sage: { bg: 'bg-[#E2EDE0]', text: 'text-[#8CA888]' },
    sand: { bg: 'bg-[#F0E8DC]', text: 'text-[#B89A72]' },
  };

  return (
    <div className="snap-container flex flex-col h-screen overflow-y-scroll snap-y snap-mandatory" style={{ fontFamily: "'Outfit', sans-serif", background: '#faf4ea', color: '#4a3521', scrollPaddingTop: '64px' }}>
      <PublicNavbar />

      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden snap-start">
          {/* Video Background */}
          <div className="absolute inset-0 overflow-hidden bg-[#3a2e28]">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute top-1/2 left-1/2 w-[1920px] h-[1080px] min-w-[100vw] min-h-[100vh] pointer-events-none border-0 object-cover"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <source src={landingVideo} type="video/mp4" />
            </video>
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(74,53,33,0.50) 0%, rgba(196,133,106,0.15) 40%, rgba(74,53,33,0.55) 100%)', zIndex: 1 }}
            />
          </div>

          <div className="relative z-10 text-center max-w-[760px] px-5 sm:px-6 pt-24 pb-20 sm:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/18 backdrop-blur-md border border-white/22 shadow-lg mb-5 sm:mb-7"
            >
              <div className="w-[5px] h-[5px] rounded-full bg-[#C4856A] animate-pulse" />
              <span className="text-[12px] sm:text-[14px] font-medium text-white tracking-widest uppercase">Faith-Led Matchmaking</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-[clamp(36px,7vw,80px)] font-extralight text-white leading-[1.06] tracking-tight mb-5 sm:mb-7"
              style={{ letterSpacing: '-0.035em' }}
            >
              Find Your <br />
              <em className="not-italic font-light text-[#F5E6DE]">God-Given</em> Partner
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="text-[clamp(14px,2vw,19px)] text-white/82 max-w-[520px] mx-auto mb-7 sm:mb-10 font-light leading-relaxed"
            >
              A private, faith-centered community where Christian singles meet with intention, guided by prayer and rooted in shared values.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              <Link to="/register" className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#C4856A] text-white font-medium text-[14px] sm:text-[15px] rounded-full hover:bg-[#D4967E] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(192,120,80,0.40)] transition-all duration-500">
                Begin Your Journey
                <span className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] rounded-full bg-white/18 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-white" />
                </span>
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent text-white font-medium text-[14px] sm:text-[15px] rounded-full border-[1.5px] border-white/30 hover:border-[#F5E6DE] hover:text-[#F5E6DE] hover:-translate-y-0.5 transition-all duration-500">
                <Play className="w-4 h-4" />
                About Us
              </Link>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <ScrollDown />
          </div>
        </section>
        {/* ===== SCRIPTURE / PROVERBS ===== */}
        <section className="h-screen flex items-center justify-center px-5 sm:px-6 snap-start" style={{ background: 'linear-gradient(135deg, #f0e2cc 0%, #faf4ea 50%, #f6ecdd 100%)' }}>
          <div className="max-w-[700px] mx-auto flex items-center gap-6 sm:gap-12">
            <div className="shrink-0 relative w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] hidden md:flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#F5E6DE] opacity-30" />
              <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 sm:w-16 sm:h-16 text-[#C4856A] opacity-70" style={{ animation: 'gentlePulse 4s ease-in-out infinite' }}>
                <path d="M32 8 L32 56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M18 24 L46 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M32 8 L28 14 M32 8 L36 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                <path d="M18 24 L22 20 M18 24 L22 28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                <path d="M46 24 L42 20 M46 24 L42 28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                <circle cx="32" cy="24" r="3" stroke="currentColor" strokeWidth="1" opacity="0.4" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="inline-block text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#C4856A] bg-[#F5E6DE] px-3 sm:px-3.5 py-1 rounded-full mb-4 sm:mb-5 transition-all duration-500" key={currentVerse}>
                {proverbs[currentVerse].ref}
              </span>
              <blockquote
                className="text-[clamp(18px,3.5vw,28px)] font-light text-[#4a3521] leading-relaxed italic mb-5 sm:mb-6 min-h-[80px] sm:min-h-[100px] transition-opacity duration-500"
                style={{ opacity: verseFading ? 0 : 1, letterSpacing: '-0.01em' }}
                key={`text-${currentVerse}`}
              >
                {proverbs[currentVerse].text}
              </blockquote>
              <div className="w-10 h-[1.5px] bg-gradient-to-r from-[#C4856A] to-[#D4967E] rounded mb-3 sm:mb-4" />
              <p className="text-[14px] sm:text-[16px] text-[#7A6E68] leading-relaxed">
                Every love story on Kingdom Alliance begins with prayer and ends with purpose.
              </p>
            </div>
          </div>
        </section>
        {/* ===== HOW IT WORKS ===== */}
        <section className="h-screen flex flex-col justify-center px-5 sm:px-6 snap-start" style={{ background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)' }}>
          <div className="text-center max-w-[560px] mx-auto mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E6DE] mb-4 sm:mb-5">
              <span className="text-[11px] sm:text-[13px] font-semibold tracking-widest uppercase text-[#C4856A]">How It Works</span>
            </div>
            <h2 className="text-[clamp(28px,5vw,50px)] font-extralight text-[#4a3521] leading-tight mb-4 sm:mb-5" style={{ letterSpacing: '-0.025em' }}>
              Three Steps to<br />Meaningful Connection
            </h2>
            <p className="text-[15px] sm:text-[17px] text-[#7A6E68] leading-relaxed">No swiping. No games. Just intentional people seeking God-centered relationships.</p>
          </div>

          <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-12 left-[33.33%] w-[33.33%] h-px bg-gradient-to-r from-[#F5E6DE] to-[#F8ECE6]" />
            <div className="hidden md:block absolute top-12 left-[66.66%] w-[33.33%] h-px bg-gradient-to-r from-[#F8ECE6] to-[#E2EDE0]" />

            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6, boxShadow: '0 20px 48px -12px rgba(0,0,0,0.08)' }}
                className="relative bg-white/85 backdrop-blur-md rounded-[20px] border border-black/[0.04] p-6 sm:p-8 pt-8 sm:pt-10"
              >
                <div
                  className={`absolute -top-3.5 left-5 sm:left-7 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-[13px] sm:text-[14px] font-semibold shadow-lg`}
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, #C4856A, #D4967E)' : i === 1 ? 'linear-gradient(135deg, #D4967E, #B89A72)' : 'linear-gradient(135deg, #B89A72, #8CA888)',
                    boxShadow: i === 0 ? '0 4px 12px -2px rgba(196,133,106,0.3)' : i === 1 ? '0 4px 12px -2px rgba(212,150,126,0.3)' : '0 4px 12px -2px rgba(184,154,114,0.3)',
                  }}
                >
                  {step.num}
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] sm:rounded-[14px] flex items-center justify-center mb-4 sm:mb-5 ${colors[step.color].bg}`}>
                  {i === 0 && <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${colors[step.color].text}`} />}
                  {i === 1 && <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${colors[step.color].text}`} />}
                  {i === 2 && <MessageCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${colors[step.color].text}`} />}
                </div>
                <h3 className="font-semibold text-[17px] sm:text-[20px] text-[#4a3521] mb-2 sm:mb-2.5" style={{ letterSpacing: '-0.01em' }}>{step.title}</h3>
                <p className="text-[14px] sm:text-[16px] text-[#7A6E68] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
        {/* ===== BENEFITS ===== */}
        <section id="benefits" className="h-screen flex flex-col justify-center px-5 sm:px-6 snap-start" style={{ background: 'linear-gradient(135deg, #f6ecdd 0%, #faf4ea 50%, #f0e2cc 100%)' }}>
          <div className="text-center max-w-[560px] mx-auto mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E6DE] mb-4 sm:mb-5">
              <span className="text-[11px] sm:text-[13px] font-semibold tracking-widest uppercase text-[#C4856A]">Why Kingdom Alliances</span>
            </div>
            <h2 className="text-[clamp(28px,5vw,50px)] font-extralight text-[#4a3521] leading-tight" style={{ letterSpacing: '-0.025em' }}>
              Built on Values,<br />Rooted in Trust
            </h2>
          </div>

          <div className="max-w-[960px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Featured Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 rounded-[20px] p-6 sm:p-8 lg:p-11 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center"
              style={{ background: 'linear-gradient(135deg, #F5E6DE 0%, #F8ECE6 40%, #F0E8DC 100%)' }}
            >
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] sm:rounded-[14px] bg-white flex items-center justify-center mb-4 sm:mb-5 shadow-sm">
                  <Lock className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#C4856A]" />
                </div>
                <h3 className="font-semibold text-[20px] sm:text-[24px] text-[#4a3521] mb-2 sm:mb-2.5" style={{ letterSpacing: '-0.01em' }}>Your Privacy is Sacred</h3>
                <p className="text-[14px] sm:text-[16px] text-[#7A6E68] leading-relaxed">We believe your journey should be private until you're ready. Every feature is built with discretion in mind.</p>
              </div>
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {privacyFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-2.5 p-3 sm:p-3.5 bg-white/65 backdrop-blur-md rounded-[12px] sm:rounded-[14px] hover:bg-white/85 hover:translate-x-1 transition-all duration-300">
                    <div className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full bg-[#8CA888] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                    </div>
                    <span className="text-[14px] sm:text-[16px] text-[#4a3521] leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Regular Cards */}
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 16px 40px -10px rgba(0,0,0,0.06)' }}
                className="rounded-[20px] border border-black/[0.04] bg-white/50 p-6 sm:p-8 lg:p-9"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] sm:rounded-[14px] bg-white flex items-center justify-center mb-4 sm:mb-5 shadow-sm">
                  {i === 0 ? <Shield className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#C4856A]" /> : <Users className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#D4967E]" />}
                </div>
                <h3 className="font-semibold text-[17px] sm:text-[20px] text-[#4a3521] mb-2 sm:mb-2.5" style={{ letterSpacing: '-0.01em' }}>{b.title}</h3>
                <p className="text-[14px] sm:text-[16px] text-[#7A6E68] leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
        {/* ===== TESTIMONIALS ===== */}
        <section id="stories" className="h-screen flex flex-col justify-center px-5 sm:px-6 snap-start" style={{ background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)' }}>
          <div className="text-center max-w-[560px] mx-auto mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E6DE] mb-4 sm:mb-5">
              <span className="text-[11px] sm:text-[13px] font-semibold tracking-widest uppercase text-[#C4856A]">Success Stories</span>
            </div>
            <h2 className="text-[clamp(28px,5vw,50px)] font-extralight text-[#4a3521] leading-tight mb-4 sm:mb-5" style={{ letterSpacing: '-0.025em' }}>
              Love Stories That<br />Began in Faith
            </h2>
            <p className="text-[15px] sm:text-[17px] text-[#7A6E68] leading-relaxed">Real couples who found their God-given partner through our community.</p>
          </div>

          <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 12px 36px -8px rgba(0,0,0,0.07)' }}
                className="bg-white/85 backdrop-blur-md rounded-[20px] border border-black/[0.04] p-5 sm:p-7 lg:p-8"
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <span key={j}>{starIcon}</span>)}
                </div>
                <p className="text-[14px] sm:text-[16px] text-[#4a3521] leading-relaxed mb-4 sm:mb-5 italic">{t.text}</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-semibold text-[#C4856A]" style={{ background: 'linear-gradient(135deg, #F5E6DE, #F8ECE6)' }}>
                    {t.initials}
                  </div>
                  <span className="font-semibold text-[12px] sm:text-[13px] text-[#4a3521]">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        {/* ===== TRUST / PRIVACY ===== */}
        <section className="h-screen flex flex-col justify-center px-5 sm:px-6 snap-start" style={{ background: 'linear-gradient(135deg, #f6ecdd 0%, #faf4ea 50%, #f0e2cc 100%)' }}>
          <div className="text-center max-w-[560px] mx-auto mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E6DE] mb-4 sm:mb-5">
              <span className="text-[11px] sm:text-[13px] font-semibold tracking-widest uppercase text-[#C4856A]">Privacy & Safety</span>
            </div>
            <h2 className="text-[clamp(28px,5vw,50px)] font-extralight text-[#4a3521] leading-tight mb-4 sm:mb-5" style={{ letterSpacing: '-0.025em' }}>
              Your Journey,<br />Protected
            </h2>
            <p className="text-[15px] sm:text-[17px] text-[#7A6E68] leading-relaxed">Every feature is designed to keep you safe and in control.</p>
          </div>

          <div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
            {trustCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -3, boxShadow: '0 12px 32px -8px rgba(0,0,0,0.06)' }}
                  className="bg-white/50 rounded-[20px] border border-black/[0.04] p-5 sm:p-7 lg:p-8"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] sm:rounded-[14px] flex items-center justify-center mb-4 sm:mb-5 ${colors[card.color].bg}`}>
                    <Icon className={`w-5 h-5 sm:w-[22px] sm:h-[22px] ${colors[card.color].text}`} />
                  </div>
                  <h3 className="font-semibold text-[17px] sm:text-[20px] text-[#4a3521] mb-1.5 sm:mb-2" style={{ letterSpacing: '-0.01em' }}>{card.title}</h3>
                  <p className="text-[14px] sm:text-[16px] text-[#7A6E68] leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>
        {/* ===== FAQ ===== */}
        <section className="h-screen flex flex-col justify-center px-5 sm:px-6 snap-start" style={{ background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)' }}>
          <div className="text-center max-w-[560px] mx-auto mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E6DE] mb-4 sm:mb-5">
              <span className="text-[11px] sm:text-[13px] font-semibold tracking-widest uppercase text-[#C4856A]">Common Questions</span>
            </div>
            <h2 className="text-[clamp(28px,5vw,50px)] font-extralight text-[#4a3521] leading-tight" style={{ letterSpacing: '-0.025em' }}>
              Frequently Asked
            </h2>
          </div>

          <div className="max-w-[640px] mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-black/[0.06]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full py-4 sm:py-5 font-medium text-[15px] sm:text-[17px] text-[#4a3521] flex justify-between items-center transition-colors hover:text-[#C4856A]"
                >
                  {faq.q}
                  <span className={`text-[#C4856A] font-light text-lg transition-transform duration-300 shrink-0 ml-3 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-400 ease-out"
                  style={{ maxHeight: openFaq === i ? '200px' : '0px', opacity: openFaq === i ? 1 : 0 }}
                >
                  <p className="pb-4 sm:pb-5 text-[14px] sm:text-[16px] text-[#7A6E68] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-9">
            <Link to="/faq" className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent text-[#C4856A] font-medium text-[14px] sm:text-[15px] rounded-full border-[1.5px] border-black/10 hover:border-[#C4856A]/40 hover:text-[#C4856A] transition-all duration-500">
              View All Questions
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="h-screen flex items-center justify-center px-5 sm:px-6 snap-start relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #F5E6DE 0%, #F8ECE6 40%, #F0E8DC 80%, #F2E6E2 100%)' }}>
          <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-30 -top-[20%] -right-[5%]" style={{ background: '#F5E6DE' }} />
          <div className="absolute w-[250px] h-[250px] rounded-full blur-[80px] opacity-30 -bottom-[15%] left-[10%]" style={{ background: '#F2E6E2' }} />

          <div className="text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 mb-4 sm:mb-5">
              <span className="text-[11px] sm:text-[13px] font-semibold tracking-widest uppercase text-[#C4856A]">Start Today</span>
            </div>
            <h2 className="text-[clamp(28px,6vw,54px)] font-extralight text-[#4a3521] mb-4 sm:mb-5 leading-tight" style={{ letterSpacing: '-0.025em' }}>
              Your God-Given Partner<br />Is Waiting
            </h2>
            <p className="text-[15px] sm:text-[18px] text-[#7A6E68] max-w-[480px] mx-auto mb-7 sm:mb-10 leading-relaxed">
              Join thousands of Christian singles seeking meaningful, faith-centered relationships. Your journey begins with one step.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#C4856A] text-white font-medium text-[14px] sm:text-[15px] rounded-full hover:bg-[#D4967E] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(192,120,80,0.40)] transition-all duration-500">
              Create Your Profile
              <span className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] rounded-full bg-white/18 flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-white" />
              </span>
            </Link>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <ScrollDown toTop />
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 sm:py-11 px-5 sm:px-6 border-t border-black/[0.04] snap-start" style={{ background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)' }}>
        <div className="max-w-[960px] mx-auto flex flex-col items-center gap-4 sm:gap-5">
          <Link to="/" className="flex items-center gap-2.5 no-underline text-[#4a3521]">
            <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
            <span className="font-semibold text-[13px] sm:text-[14px]">{settings.siteName}</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-4 sm:gap-x-5 gap-y-1.5 sm:gap-y-2 list-none">
            <li><Link to="/" className="text-[13px] sm:text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Home</Link></li>
            <li><Link to="/about" className="text-[13px] sm:text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">About</Link></li>
            <li><Link to="/faq" className="text-[13px] sm:text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">FAQ</Link></li>
            <li><Link to="/terms" className="text-[13px] sm:text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Terms</Link></li>
            <li><Link to="/contact" className="text-[13px] sm:text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Contact</Link></li>
            <li><Link to="/login" className="text-[13px] sm:text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Sign In</Link></li>
            <li><Link to="/register" className="text-[13px] sm:text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Register</Link></li>
          </nav>
          <p className="text-[11px] sm:text-[11.5px] text-[#AEA49E]">&copy; {new Date().getFullYear()} {settings.siteName}. Built on Faith, Rooted in Love.</p>
        </div>
      </footer>

      {/* Inline keyframes for this page only */}
      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        @keyframes gentlePulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes bounceArrow {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(6px); opacity: 1; }
        }
        @keyframes bounceArrowUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
