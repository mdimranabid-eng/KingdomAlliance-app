import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from './KingdomCrossIcon';
import { motion, AnimatePresence } from 'motion/react';

export default function PublicNavbar() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
          {/* Logo */}
          <Link to="/" onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2 relative z-50">
            <KingdomCrossIcon size="md" />
            <span className="font-headline text-2xl text-primary font-bold tracking-tight">{settings.siteName}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 font-label-lg">
            <Link 
              to="/about" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              About Us
            </Link>
          </nav>

          {/* Desktop Buttons & Mobile Menu Trigger */}
          <div className="flex items-center gap-4 relative z-50">
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="font-label-lg text-on-surface-variant hover:text-primary">Sign In</Link>
              <Link to="/register" className="bg-primary text-on-primary font-label-lg px-6 py-2.5 rounded-full hover:shadow-lg transition-all hover:-translate-y-0.5">Join Now</Link>
            </div>

            {/* Burger Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 hover:bg-surface-container rounded-lg text-on-surface-variant focus:outline-none"
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/55 z-40 md:hidden backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-surface z-45 md:hidden flex flex-col justify-between border-l border-outline-variant p-6 pt-24 shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                <Link
                  to="/"
                  onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-lg font-medium text-on-surface hover:text-primary transition-colors py-2 border-b border-outline-variant/30"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-lg font-medium text-on-surface hover:text-primary transition-colors py-2 border-b border-outline-variant/30"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-lg font-medium text-on-surface hover:text-primary transition-colors py-2 border-b border-outline-variant/30"
                >
                  Contact Us
                </Link>
                <Link
                  to="/terms"
                  onClick={() => { closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-lg font-medium text-on-surface hover:text-primary transition-colors py-2 border-b border-outline-variant/30"
                >
                  Terms
                </Link>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="w-full text-center py-3 border border-outline rounded-full font-label-lg text-on-surface hover:bg-surface-container transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="w-full text-center py-3 bg-primary text-on-primary rounded-full font-label-lg hover:shadow-lg transition-all"
                >
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
