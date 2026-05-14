import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  Heart, 
  MessageSquare, 
  User, 
  Bookmark,
  Search,
  Settings, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  Users,
  Menu,
  X,
  Camera,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSettings } from '../lib/SettingsContext';

export default function Layout() {
  const { settings } = useSettings();
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  let navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover', path: '/matches', icon: Search, requiresApproval: true },
    { label: 'Interests', path: '/interests', icon: Heart, requiresApproval: true },
    { label: 'Shortlist', path: '/shortlist', icon: Bookmark, requiresApproval: true },
    { label: 'Messages', path: '/messages', icon: MessageSquare, requiresApproval: true },
    { label: 'My Profile', path: `/profile/${user?.uid}`, icon: User },
  ];

  if (isAdmin) {
    navItems = [
      { label: 'Admin Panel', path: '/admin', icon: ShieldCheck },
      { label: 'User Approvals', path: '/admin/approvals', icon: Settings },
      { label: 'Photo Moderation', path: '/admin/photos', icon: Camera },
      { label: 'User Management', path: '/admin/users', icon: Users },
      { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
      { label: 'Site Settings', path: '/admin/settings', icon: Settings },
    ];
  }

  const isApproved = profile?.isApproved;

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-surface-container flex-col border-r border-outline-variant transition-all duration-300">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group">
            <Heart className="w-8 h-8 text-primary fill-primary group-hover:scale-110 transition-transform" />
            <span className="font-headline-md text-primary tracking-tight">{settings.siteName}</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isDisabled = item.requiresApproval && !isApproved;
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={isDisabled ? '#' : item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-label-lg",
                  isActive 
                    ? "bg-secondary-container text-on-secondary-container shadow-sm" 
                    : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-on-surface-variant hover:text-error hover:bg-error-container rounded-xl transition-all duration-200 font-label-lg"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - Mobile & Action Area */}
        <header className="h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-surface-container rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-on-surface" />
            </button>
            <h2 className="font-headline-sm text-on-surface lg:hidden">{settings.siteName}</h2>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <div className="flex items-center gap-3 px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-label-lg text-on-surface">{profile.name}</p>
                </div>
                <img 
                  src={profile.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full border border-primary-container object-cover"
                />
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-surface z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-8 h-8 text-primary fill-primary" />
                  <span className="font-headline-md text-primary tracking-tight">{settings.siteName}</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-on-surface-variant hover:text-on-surface" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => {
                  const isDisabled = item.requiresApproval && !isApproved;
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={isDisabled ? '#' : item.path}
                      onClick={() => !isDisabled && setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-label-lg",
                        isActive 
                          ? "bg-secondary-container text-on-secondary-container shadow-sm" 
                          : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-outline-variant">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-on-surface-variant hover:text-error hover:bg-error-container rounded-xl transition-all duration-200 font-label-lg"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
