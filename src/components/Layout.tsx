import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, collectionGroup, query, where, onSnapshot } from 'firebase/firestore';
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
  Megaphone,
  CheckCircle,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from './KingdomCrossIcon';

export default function Layout() {
  const { settings } = useSettings();
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = React.useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = React.useState(0);
  const [pendingPhotosCount, setPendingPhotosCount] = React.useState(0);
  const [toast, setToast] = React.useState<{ title: string; message: string; type: 'message' | 'interest' } | null>(null);
  const isInitialLoadMessages = React.useRef(true);
  const isInitialLoadNotifications = React.useRef(true);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  React.useEffect(() => {
    if (!user) return;

    // Listen for all unread messages where the current user is the receiver
    const q = query(
      collectionGroup(db, 'messages'),
      where('receiverId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      // Play sound for new messages if not initial load
      const docChanges = snapshot.docChanges();
      const hasNew = docChanges.some(change => change.type === 'added');
      
      if (hasNew && !isInitialLoadMessages.current && !snapshot.metadata.hasPendingWrites) {
        const latestDoc = docChanges.find(change => change.type === 'added')?.doc;
        if (latestDoc) {
          const data = latestDoc.data();
          setToast({
            title: 'New Message',
            message: data.text?.substring(0, 60) + (data.text?.length > 60 ? '...' : ''),
            type: 'message'
          });
          setTimeout(() => setToast(null), 5000);
        }

        console.log("Global: New message received, playing sound...");
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(e => console.warn('Global audio blocked:', e));
      }
      setUnreadCount(snapshot.size);
      isInitialLoadMessages.current = false;
    }, (error) => {
      console.error("Unread count listener failed:", error);
    });

    // Listen for unread interest notifications
    const nq = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribeNotifications = onSnapshot(nq, (snapshot) => {
      // Play sound for new interest notifications
      const docChanges = snapshot.docChanges();
      const hasNew = docChanges.some(change => change.type === 'added');
      
      if (hasNew && !isInitialLoadNotifications.current && !snapshot.metadata.hasPendingWrites) {
        const latestDoc = docChanges.find(change => change.type === 'added')?.doc;
        if (latestDoc) {
          const data = latestDoc.data();
          setToast({
            title: data.title || 'New Interest',
            message: data.message || 'Someone has expressed interest in your profile!',
            type: 'interest'
          });
          setTimeout(() => setToast(null), 5000);
        }

        console.log("Global: New interest notification received, playing sound...");
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(e => console.warn('Global audio blocked:', e));
      }
      setUnreadNotificationsCount(snapshot.size);
      isInitialLoadNotifications.current = false;
    }, (error) => {
      console.error("Unread notifications listener failed:", error);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeNotifications();
    };
  }, [user]);

  React.useEffect(() => {
    if (!user || !isAdmin) return;

    // Listen for pending approvals
    const qApprovals = query(
      collection(db, 'users'), 
      where('approvalStatus', '==', 'pending'),
      where('onboardingComplete', '==', true)
    );
    const unsubscribeApprovals = onSnapshot(qApprovals, (snapshot) => {
      setPendingApprovalsCount(snapshot.size);
    }, (error) => {
      console.error("Error listening for pending approvals:", error);
    });

    // Listen for pending photos in the photoModeration collection directly
    const qPhotos = query(
      collection(db, 'photoModeration'), 
      where('photoStatus', '==', 'pending')
    );
    const unsubscribePhotos = onSnapshot(qPhotos, (snapshot) => {
      setPendingPhotosCount(snapshot.size);
    }, (error) => {
      console.error("Error listening for pending photos:", error);
    });

    return () => {
      unsubscribeApprovals();
      unsubscribePhotos();
    };
  }, [user, isAdmin]);

  let navItems: any[] = [
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
      { label: 'User Approvals', path: '/admin/approvals', icon: CheckCircle },
      { label: 'Photo Moderation', path: '/admin/photos', icon: Camera },
      { label: 'User Management', path: '/admin/users', icon: Users },
      { label: 'Rejected Profiles', path: '/admin/rejected', icon: Ban },
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
            <KingdomCrossIcon size="md" className="group-hover:scale-110 transition-transform" />
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
                <div className="relative">
                  <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
                  {((item.label === 'Messages' && unreadCount > 0) || 
                    (item.label === 'Interests' && unreadNotificationsCount > 0) ||
                    (item.badgeCount && item.badgeCount > 0)) && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        "absolute -top-1.5 -right-1.5 flex items-center justify-center bg-error rounded-full border-2 border-surface shadow-[0_0_10px_rgba(255,0,0,0.5)] text-white text-[8px] font-bold",
                        item.badgeCount ? "min-w-[18px] h-[18px] px-1" : "w-3 h-3"
                      )}
                    >
                      {item.badgeCount || ""}
                      <motion.span 
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-error rounded-full -z-10" 
                      />
                    </motion.span>
                  )}
                </div>
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
                  <KingdomCrossIcon size="sm" />
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
                      <div className="relative">
                        <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
                        {((item.label === 'Messages' && unreadCount > 0) || 
                          (item.label === 'Interests' && unreadNotificationsCount > 0) ||
                          (item.badgeCount && item.badgeCount > 0)) && (
                          <motion.span
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                              "absolute -top-1.5 -right-1.5 flex items-center justify-center bg-error rounded-full border-2 border-surface shadow-[0_0_10px_rgba(255,0,0,0.5)] text-white text-[8px] font-bold",
                              item.badgeCount ? "min-w-[18px] h-[18px] px-1" : "w-3 h-3"
                            )}
                          >
                            {item.badgeCount || ""}
                            <motion.span 
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute inset-0 bg-error rounded-full -z-10" 
                            />
                          </motion.span>
                        )}
                      </div>
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

      {/* Global Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-4 z-[100] w-full max-w-sm px-4 md:px-0"
          >
            <div className="bg-surface border border-outline-variant p-4 rounded-2xl shadow-2xl backdrop-blur-xl bg-opacity-95 flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                toast.type === 'message' ? "bg-primary text-on-primary" : "bg-error text-on-error"
              )}>
                {toast.type === 'message' ? <MessageSquare className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-on-surface truncate">{toast.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
