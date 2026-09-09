import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';

export default function PublicNavbar() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [onDark, setOnDark] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    let rafId: number;
    let lastValue = false;

    const checkDark = () => {
      const snapContainer = document.querySelector('.snap-container');
      if (!snapContainer) {
        if (lastValue !== false) setOnDark(false);
        rafId = requestAnimationFrame(checkDark);
        return;
      }
      const firstSection = snapContainer.querySelector('section');
      if (!firstSection) {
        if (lastValue !== false) setOnDark(false);
        rafId = requestAnimationFrame(checkDark);
        return;
      }
      const containerTop = snapContainer.getBoundingClientRect().top;
      const sectionBottom = firstSection.getBoundingClientRect().bottom;
      const newValue = sectionBottom > containerTop + 80;
      if (newValue !== lastValue) {
        lastValue = newValue;
        setOnDark(newValue);
      }
      rafId = requestAnimationFrame(checkDark);
    };

    rafId = requestAnimationFrame(checkDark);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const textPrimary = onDark ? 'text-white' : 'text-[#4a3521]';
  const textMuted = onDark ? 'text-white/80' : 'text-[#7A6E68]';

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          onDark
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Logo */}
          <Link to="/" onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2 relative z-50">
            <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-10 h-10 object-contain" />
            <span className={`font-extralight text-lg tracking-tight transition-colors duration-300 ${textPrimary}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
              {settings.siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 text-[15px] font-medium gap-6">
            <Link
              to="/about"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`transition-colors duration-300 ${textMuted} hover:${onDark ? 'text-white' : 'text-[#C4856A]'}`}
            >
              About Us
            </Link>
            <a
              href="/#benefits"
              className={`transition-colors duration-300 ${textMuted} hover:${onDark ? 'text-white' : 'text-[#C4856A]'}`}
            >
              Why Us
            </a>
            <a
              href="/#stories"
              className={`transition-colors duration-300 ${textMuted} hover:${onDark ? 'text-white' : 'text-[#C4856A]'}`}
            >
              Stories
            </a>
            <Link
              to="/faq"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`transition-colors duration-300 ${textMuted} hover:${onDark ? 'text-white' : 'text-[#C4856A]'}`}
            >
              Help Center
            </Link>
          </nav>

          {/* Desktop Buttons & Mobile Menu Trigger */}
          <div className="flex items-center gap-4 relative z-50">
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className={`text-[15px] font-medium transition-colors duration-300 ${textMuted}`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  ...(onDark
                    ? { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }
                    : { backgroundColor: '#4a3521', color: '#dfc88a', border: '1px solid #4a3521' }),
                  transition: 'all 0.3s ease'
                }}
                className="text-[15px] font-medium px-6 py-2.5 rounded-full hover:opacity-80"
              >
                Join Now
              </Link>
            </div>

            {/* Burger Menu Button */}
            <button
              onClick={toggleMenu}
              className={`md:hidden p-2 rounded-lg focus:outline-none transition-colors duration-300 ${textPrimary}`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/55 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-white z-45 md:hidden flex flex-col justify-between border-l border-[#e2ddd2] p-6 pt-24 shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/about', label: 'About Us' },
                  { href: '/#benefits', label: 'Why Us' },
                  { href: '/#stories', label: 'Stories' },
                  { to: '/faq', label: 'Help Center' },
                  { to: '/contact', label: 'Contact Us' },
                  { to: '/terms', label: 'Terms' },
                ].map((item, i) => (
                  item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      onClick={() => { closeMenu(); }}
                      className="text-lg font-medium text-[#4a3521] hover:text-[#C4856A] transition-colors py-2 border-b border-[#e2ddd2]/30"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.to}
                      to={item.to!}
                      onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="text-lg font-medium text-[#4a3521] hover:text-[#C4856A] transition-colors py-2 border-b border-[#e2ddd2]/30"
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </div>
              <div className="flex flex-col gap-4 mt-auto">
                <Link to="/login" onClick={closeMenu} className="w-full text-center py-3 border border-[#e2ddd2] rounded-full text-[15px] font-medium text-[#4a3521] hover:bg-[#faf4ea] transition-colors">
                  Sign In
                </Link>
                <Link to="/register" onClick={closeMenu} className="w-full text-center py-3 bg-[#C4856A] text-white rounded-full text-[15px] font-medium hover:bg-[#D4967E] transition-all">
                  Join Now
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
