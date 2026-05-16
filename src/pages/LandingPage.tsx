import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Users, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';

export default function LandingPage() {
  const { settings } = useSettings();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
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
        <section className="relative pt-32 pb-32 md:pt-48 md:pb-48 overflow-hidden bg-surface">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2069" 
              alt="Background" 
              className="w-full h-full object-cover opacity-[0.07]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/80 to-surface" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-bold uppercase tracking-[0.2em] border border-primary/20 mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Faith-Led Matchmaking
              </div>
              <h1 className="font-headline text-5xl md:text-8xl text-on-surface mb-8 leading-[0.9] tracking-tighter">
                Find Your God-Given <br />
                <span className="text-primary italic font-serif">Life Partner</span>
              </h1>
              <p className="max-w-xl mx-auto text-lg md:text-2xl text-on-surface-variant mb-12 leading-relaxed font-light">
                {settings.siteTagline}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/register" className="w-full sm:w-auto bg-primary text-on-primary font-bold px-10 py-5 rounded-2xl text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                  Join Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto bg-surface-container text-on-surface font-bold px-10 py-5 rounded-2xl text-lg border border-outline-variant hover:border-primary transition-all">
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="how-it-works" className="py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="font-headline text-4xl md:text-6xl text-on-surface mb-6 tracking-tight">The Journey to Your Sacred Union</h2>
              <p className="text-xl text-on-surface-variant max-w-xl mx-auto font-light">A thoughtful, guided process designed to help you find a partner who shares your faith and values.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Create Profile", text: "Share your story, your values, and your faith journey in a detailed, elegant profile." },
                { step: "2", title: "Connect", text: "Browse hand-picked matches and initiate meaningful conversations in a secure environment." },
                { step: "3", title: "Start Your Story", text: "Meet in person and begin building a lifelong partnership rooted in profound love." },
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -10 }}
                  className="bg-surface-container-lowest p-10 rounded-[2rem] border border-outline-variant shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-8 text-primary border border-primary/10">
                    <span className="text-3xl font-bold">{item.step}</span>
                  </div>
                  <h3 className="font-headline text-2xl text-on-surface mb-4">{item.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-32 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="font-headline text-4xl md:text-6xl text-on-surface mb-12 tracking-tight">Built on Values, <br/> Rooted in Trust</h2>
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
                      {[1,2,3,4].map(i => (
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
