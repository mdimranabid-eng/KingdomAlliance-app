import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Users, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import landingVideo from '../assets/landing-video.mp4';

export default function LandingPage() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <KingdomCrossIcon size="md" />
            <span className="font-headline text-2xl text-primary font-bold tracking-tight">{settings.siteName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-label-lg">
            <a href="#how-it-works" className="text-on-surface-variant hover:text-primary transition-colors">How It Works</a>
            <a href="#success-stories" className="text-on-surface-variant hover:text-primary transition-colors">Success Stories</a>
            <a href="#about" className="text-on-surface-variant hover:text-primary transition-colors">About Us</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="font-label-lg text-on-surface-variant hover:text-primary">Sign In</Link>
            <Link to="/register" className="bg-primary text-on-primary font-label-lg px-6 py-2.5 rounded-full hover:shadow-lg transition-all hover:-translate-y-0.5">Join Now</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative w-screen min-h-screen h-screen m-0 p-0 overflow-hidden bg-slate-950 select-none">
          {/* Video background layer stretched to absolute screen size boundaries */}
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-screen h-screen object-cover z-0 pointer-events-none"
          >
            <source src={landingVideo} type="video/mp4" />
          </video>

          {/* Overlay Mask layer stretched to absolute screen size boundaries - Gradient Untouched */}
          <div
            className="absolute inset-0 w-screen h-screen z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(250,250,250,0.05) 0%, rgba(250,250,250,0.60) 60%, rgba(250,250,250,1) 100%)'
            }}
          />

          {/* Core Screen-Size Centering Frame Layer */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8 select-none pointer-events-none">
            <div className="w-full max-w-5xl pointer-events-auto flex flex-col items-center justify-center">

              {/* Brand Tagline - Tightly packed frosted glass wrapper matching exact typography variables from the cards below */}
              <div className="inline-flex items-center justify-center py-1 px-3.5 rounded-full bg-white/[0.02] backdrop-blur-md border border-white/10 shadow-lg mb-2 animate-fade-in">
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide select-none">
                  Faith-Led Matchmaking
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-3 leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                Find Your God-Given <br className="hidden sm:inline" /> Life Partner
              </h1>

              {/* Subtext Description */}
              <p className="text-sm sm:text-base md:text-lg font-light opacity-90 max-w-xl mx-auto mb-6 text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                Christian Matrimony Rooted in Faith & Values
              </p>

              {/* Primary Action Button Cluster - Maximized bottom margin gaps to drop cards right down to the base perimeter view */}
              <div className="flex flex-row items-center justify-center gap-3 mb-16 sm:mb-24 md:mb-32">
                <Link to="/register">
                  <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold px-6 sm:px-8 py-2.5 rounded-full transition-all duration-300 shadow-md transform hover:scale-105 text-xs sm:text-sm md:text-base">
                    Join Now
                  </button>
                </Link>
                <Link to="/login">
                  <button className="bg-white/10 hover:bg-white/15 text-white font-medium px-6 sm:px-8 py-2.5 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm md:text-base">
                    Sign In
                  </button>
                </Link>
              </div>

              {/* Neat & Compact Onboarding Journey Grid - Firmly anchored to the lower edge layout with mt-auto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl px-4 mt-auto mb-2 sm:mb-4 animate-fade-in-up">
                
                {/* Step Card 1 */}
                <div className="flex items-start text-left p-4 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-amber-500/20 transition-all duration-300 shadow-xl">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-serif font-bold text-sm mr-3.5 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1 tracking-wide">
                      Create Profile
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      Share your story, your values, and your faith journey in a detailed, elegant profile.
                    </p>
                  </div>
                </div>

                {/* Step Card 2 */}
                <div className="flex items-start text-left p-4 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-amber-500/20 transition-all duration-300 shadow-xl">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-serif font-bold text-sm mr-3.5 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1 tracking-wide">
                      Connect
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      Browse hand-picked matches and initiate meaningful conversations in a secure environment.
                    </p>
                  </div>
                </div>

                {/* Step Card 3 */}
                <div className="flex items-start text-left p-4 rounded-xl bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-amber-500/20 transition-all duration-300 shadow-xl">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-serif font-bold text-sm mr-3.5 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1 tracking-wide">
                      Start Your Story
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      Meet in person and begin building a lifelong partnership rooted in profound love.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <section className="py-32 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="font-headline text-4xl md:text-6xl text-on-surface mb-12 tracking-tight">Built on Values, <br /> Rooted in Trust</h2>
                <div className="space-y-8">
                  {[
                    { icon: Shield, title: "Admin Approved Profiles", text: "Every profile is manually verified by our team to ensure a high-quality community." },
                    { icon: Users, title: "Focus on Denominations", text: "Find someone who shares your specific theological background." },
                    { icon: MessageCircle, title: "Meaningful Interaction", text: "Our interest-based system encourages slow, intentional acquaintance." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 bg-surface p-6 rounded-3xl border border-outline-variant">
                      <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <item.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-headline text-2xl text-on-surface mb-2">{item.title}</h4>
                        <p className="text-on-surface-variant font-light">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&q=80&w=1000"
                    alt="Happy Couple"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-12 -left-12 bg-surface p-10 rounded-[2rem] shadow-2xl border border-outline-variant hidden md:block">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex -space-x-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-14 h-14 rounded-full border-4 border-surface overflow-hidden bg-surface-container">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Avatar" />
                        </div>
                      ))}
                    </div>
                    <span className="font-bold text-lg text-primary">12k+ Members</span>
                  </div>
                  <p className="text-lg text-on-surface-variant max-w-[250px] font-light">Join thousands finding their lifelong partner everyday.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-outline-variant/30 pb-16 mb-12">
            <Link to="/" className="flex items-center gap-3">
              <KingdomCrossIcon size="md" />
              <span className="font-headline text-3xl text-on-surface font-bold tracking-tight">{settings.siteName}</span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-x-10 gap-y-6 text-lg font-light">
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Home</Link>
              <Link to="/register" className="text-on-surface-variant hover:text-primary transition-colors">Register</Link>
              <Link to="/login" className="text-on-surface-variant hover:text-primary transition-colors">Login</Link>
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Terms</Link>
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Privacy</Link>
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
