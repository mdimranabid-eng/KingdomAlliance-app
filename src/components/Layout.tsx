import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePresence } from '../hooks/usePresence';
import { useLogout } from '../hooks/useLogout';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, collectionGroup, query, where, onSnapshot, getDocs, getDoc, doc, writeBatch } from 'firebase/firestore';
import {
  Heart,
  MessageSquare,
  User,
  Bookmark,
  Search,
  Settings,
  LogOut,
  ShieldCheck,
  Users,
  Menu,
  X,
  Camera,
  Megaphone,
  CheckCircle,
  Ban,
  Church,
  FileText,
  UserCheck,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, resolveApprovalStatus } from '../lib/utils';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from './KingdomCrossIcon';
import AdminReportModal from './admin/AdminReportModal';

export default function Layout() {
  const { settings } = useSettings();
  const { user, profile, isAdmin } = useAuth();
  usePresence(user?.uid);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [unreadInterestCount, setUnreadInterestCount] = React.useState(0);
  const [unreadMessageNotifCount, setUnreadMessageNotifCount] = React.useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = React.useState(0);
  const [pendingPhotosCount, setPendingPhotosCount] = React.useState(0);
  const [toast, setToast] = React.useState<{ 
    title: string; 
    message: string; 
    type: 'message' | 'interest';
    chatId?: string;
  } | null>(null);
  const isInitialLoadMessages = React.useRef(true);
  const isInitialLoadNotifications = React.useRef(true);
  const pathnameRef = React.useRef(location.pathname);

  React.useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  const { logout: handleLogout } = useLogout();

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collectionGroup(db, 'messages'),
      where('receiverId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribeMessages = onSnapshot(q, async (snapshot) => {
      const docChanges = snapshot.docChanges();
      const hasNew = docChanges.some(change => change.type === 'added');

      if (hasNew && !isInitialLoadMessages.current && !snapshot.metadata.hasPendingWrites) {
        const latestDoc = docChanges.find(change => change.type === 'added')?.doc;
        if (latestDoc) {
          const data = latestDoc.data();
          
          const activeChatUserIdFromPath = pathnameRef.current.startsWith('/messages/') 
            ? pathnameRef.current.split('/')[2] 
            : null;

          if (activeChatUserIdFromPath === data.senderId) {
            return;
          }

          const senderDoc = await getDoc(doc(db, 'users', data.senderId));
          const senderName = senderDoc.exists() ? senderDoc.data()?.name : 'Someone';

          setToast({
            title: `💬 ${senderName}`,
            message: data.text?.substring(0, 60) + (data.text?.length > 60 ? '...' : ''),
            type: 'message',
            chatId: data.senderId
          });
          setTimeout(() => setToast(null), 5000);
        }

        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(e => console.warn('Global audio blocked:', e));
      }
      setUnreadCount(snapshot.size);
      isInitialLoadMessages.current = false;
    }, (error) => {
      console.error("Unread count listener failed:", error);
    });

    const nqInterests = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false),
      where('type', 'in', ['interest', 'accepted'])
    );

    const unsubscribeInterestNotifications = onSnapshot(nqInterests, (snapshot) => {
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

        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(e => console.warn('Global audio blocked:', e));
      }
      setUnreadInterestCount(snapshot.size);
      isInitialLoadNotifications.current = false;
    }, (error) => {
      console.error("Error listening for interest notifications:", error);
    });

    const nqMessages = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false),
      where('type', '==', 'message')
    );

    const unsubscribeMessageNotifications = onSnapshot(nqMessages, (snapshot) => {
      setUnreadMessageNotifCount(snapshot.size);
    }, (error) => {
      console.error("Error listening for message notifications:", error);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeInterestNotifications();
      unsubscribeMessageNotifications();
    };
  }, [user]);

  React.useEffect(() => {
    if (!user || !isAdmin) return;

    let unsubscribeApprovals: () => void;
    let unsubscribePhotos: () => void;

    const setupListeners = async () => {
      try {
        const adminSnapshot = await getDocs(collection(db, 'admins'));
        const adminIds = adminSnapshot.docs.map(doc => doc.id);

        const qApprovals = collection(db, 'users');
        unsubscribeApprovals = onSnapshot(qApprovals, (snapshot) => {
          const usersData = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as any))
            .filter(u => !adminIds.includes(u.id));

          const pendingCount = usersData.filter(u => {
            return u.onboardingComplete === true && u.approvalStatus === 'pending';
          }).length;

          setPendingApprovalsCount(pendingCount);
        }, (error) => {
          console.error("Error listening for pending approvals:", error);
        });
      } catch (err) {
        console.error("Failed to load admin list for filtering:", err);
      }
    };

    setupListeners();

    const qPhotos = query(
      collection(db, 'photoModeration'),
      where('photoStatus', '==', 'pending')
    );
    unsubscribePhotos = onSnapshot(qPhotos, (snapshot) => {
      setPendingPhotosCount(snapshot.size);
    }, (error) => {
      console.error("Error listening for photo moderation count:", error);
    });

    return () => {
      if (unsubscribeApprovals) unsubscribeApprovals();
      if (unsubscribePhotos) unsubscribePhotos();
    };
  }, [user, isAdmin]);

  React.useEffect(() => {
    if (!user) return;
    
    if (location.pathname.startsWith('/messages')) {
      const clearNotifications = async () => {
        try {
          const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('read', '==', false),
            where('type', '==', 'message')
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const batch = writeBatch(db);
            snap.docs.forEach(d => {
              batch.update(d.ref, { read: true });
            });
            await batch.commit();
          }
        } catch (err) {
          console.error('Failed to clear message notifications:', err);
        }
      };
      clearNotifications();
    }
  }, [location.pathname, user]);

  const isAdminArea = isAdmin && location.pathname.startsWith('/admin');

  let navItems: any[] = [
    { label: 'Search', path: '/matches', icon: Search, requiresApproval: true },
    { label: 'Interests', path: '/interests', icon: Heart, requiresApproval: true },
    { label: 'Shortlist', path: '/shortlist', icon: Bookmark, requiresApproval: true },
    { label: 'Messages', path: '/messages', icon: MessageSquare, requiresApproval: true },
    { label: 'My Profile', path: `/profile/${user?.uid}`, icon: User },
  ];

  if (isAdmin && !isAdminArea) {
    navItems = [
      { label: 'Admin Panel', path: '/admin', icon: ShieldCheck }
    ];
  }

  const isApproved = profile?.isApproved;
  const isProfileRoute = location.pathname.startsWith('/profile/');

  const adminNavSections: { title: string; items: any[] }[] = [
    {
      title: 'Overview',
      items: [{ label: 'Dashboard', path: '/admin', icon: ShieldCheck, exact: true }],
    },
    {
      title: 'Configuration',
      items: [
        { label: 'Church Info', path: '/admin/church-info', icon: Church },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', path: '/admin/help', icon: HelpCircle },
      ],
    },
  ];

  const currentAdminLabel = (() => {
    for (const section of adminNavSections) {
      for (const item of section.items) {
        const match = item.exact
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);
        if (match) return item.label;
      }
    }
    return 'Overview';
  })();

  const renderAdminNavLinks = (layoutPrefix: string) => (
    <div className="space-y-6">
      {adminNavSections.map((section) => (
        <div key={section.title}>
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
            {section.title}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-[13px] font-medium group overflow-hidden",
                    isActive
                      ? "admin-sidebar-active"
                      : "admin-sidebar-link"
                  )}
                >
                  <div className="relative flex items-center gap-3 w-full">
                    <div className="relative flex-shrink-0">
                      <Icon className={cn("w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110", isActive && "text-[#C9A84C]")} />
                      {item.badgeCount != null && item.badgeCount > 0 && (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute -top-1.5 -right-1.5 flex min-w-[18px] h-[18px] px-1 items-center justify-center bg-[#C9A84C] rounded-full text-[#0c1829] text-[9px] font-bold"
                        >
                          {item.badgeCount > 99 ? '99+' : item.badgeCount}
                        </motion.span>
                      )}
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={cn("min-h-screen flex relative overflow-hidden", isAdminArea && "bg-[#f8f9fc]")}
      style={
        isAdminArea
          ? undefined
          : { background: 'linear-gradient(180deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)' }
      }
    >
      {/* Ambient background orbs (member area only) */}
      {!isAdminArea && (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-45"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.22) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, rgba(143,99,55,0.16) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(223,200,138,0.25) 0%, transparent 70%)' }} />
      </div>
      )}

      {/* ═══════ ADMIN SIDEBAR — Desktop ═══════ */}
      {isAdminArea && (
      <aside
        className="hidden lg:flex w-[260px] flex-col fixed inset-y-0 left-0 z-20 print:hidden"
        style={{
          background: 'linear-gradient(180deg, #0c1829 0%, #0f1d32 50%, #0c1829 100%)',
        }}
      >
        {/* Subtle gold glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.06) 0%, transparent 60%)' }} />

        {/* Logo */}
        <div className="relative px-6 py-6 flex items-center gap-3">
          <KingdomCrossIcon size="sm" />
          <span
            className="text-lg font-light tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A84C' }}
          >
            {settings.siteName}
          </span>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-white/[0.06]" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto no-scrollbar">
          {renderAdminNavLinks('desktop')}
        </nav>

        {/* Bottom Actions */}
        <div className="relative px-4 py-4 space-y-1 border-t border-white/[0.06]">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="admin-sidebar-link w-full"
          >
            <FileText className="w-[18px] h-[18px]" />
            <span>Generate Report</span>
          </button>
        </div>
      </aside>
      )}

      {/* ═══════ MAIN CONTENT AREA ═══════ */}
      <div className={cn("flex-1 flex flex-col min-w-0 overflow-hidden relative z-10", isAdminArea && "lg:ml-[260px]")}>
        {!isProfileRoute && (
        <header className={cn(
          "h-16 flex items-center justify-between px-4 lg:px-8 z-30 print:hidden",
          isAdminArea
            ? "bg-white/80 backdrop-blur-xl border-b border-black/[0.04]"
            : "bg-transparent border-b border-outline-variant/30"
        )}>
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-surface-container rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className={cn("w-6 h-6", isAdminArea ? "text-[#0f172a]" : "text-on-surface")} />
            </button>

            {/* Member area: site name on mobile */}
            {!isAdminArea && (
              <h2 className="font-headline-sm text-on-surface lg:hidden">{settings.siteName}</h2>
            )}

            {/* Member area: top nav links */}
            {!isAdminArea && (
              <nav className="hidden lg:flex items-center gap-1 ml-4">
                {navItems.map((item) => {
                  const isDisabled = item.requiresApproval && !isApproved;
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={isDisabled ? '#' : item.path}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all",
                        isActive
                          ? "text-white shadow-[0_8px_18px_-8px_rgba(143,99,55,0.6)]"
                          : "text-[#8a7a63] hover:text-[#8f6337] hover:bg-white/70",
                        isDisabled && "opacity-40 cursor-not-allowed"
                      )}
                      style={isActive ? { background: 'linear-gradient(135deg, #b3804c, #8f6337)' } : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {((item.label === 'Messages' && (unreadCount > 0 || unreadMessageNotifCount > 0)) ||
                        (item.label === 'Interests' && unreadInterestCount > 0)) && (
                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-error rounded-full text-white text-[9px] font-bold">
                          {item.badgeCount || ''}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Admin area: breadcrumb header */}
            {isAdminArea && (
              <div className="hidden md:flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-[#0c1829] text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.15em]">
                  Admin
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                <span className="text-sm font-semibold text-[#0f172a]">{currentAdminLabel}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/faq"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-variant/40 rounded-full transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Link>
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-full transition-colors",
                isAdminArea
                  ? "text-[#64748b] hover:text-red-600 hover:bg-red-50"
                  : "text-on-surface-variant hover:text-error hover:bg-error-container"
              )}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            {profile && (
              <Link 
                to={`/profile/${user?.uid}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-1 transition-all duration-200 rounded-full cursor-pointer group",
                  isAdminArea
                    ? "bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-black/[0.04]"
                    : "bg-surface-container-low hover:bg-surface-variant/40 border border-outline-variant"
                )}
              >
                <div className="text-right hidden sm:block">
                  <p className={cn("text-sm font-medium transition-colors", isAdminArea ? "text-[#0f172a] group-hover:text-[#1a2e4a]" : "font-label-lg text-on-surface group-hover:text-primary")}>{profile.name}</p>
                </div>
                <img
                  src={profile.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
                  alt="Avatar"
                  className={cn("w-9 h-9 rounded-full object-cover group-hover:scale-105 transition-transform", isAdminArea ? "border-2 border-[#C9A84C]/30" : "border border-primary-container")}
                />
              </Link>
            )}
          </div>
        </header>
        )}

        <main className={cn("flex-1 overflow-y-auto", !isProfileRoute && "p-4 lg:p-8")}>
          {!isProfileRoute ? (
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          ) : (
            <>
              <button
                className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white/90 backdrop-blur border border-[#e5dcc9] shadow-md"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-[#4a3521]" />
              </button>
              <Outlet />
            </>
          )}
        </main>
      </div>

      {/* ═══════ MOBILE MENU ═══════ */}
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
              className={cn(
                "fixed inset-y-0 left-0 w-72 z-50 lg:hidden flex flex-col shadow-2xl",
                isAdminArea ? "bg-[#0c1829]" : "bg-surface"
              )}
            >
              {/* Mobile menu header */}
              <div className={cn("p-6 flex items-center justify-between", isAdminArea && "border-b border-white/[0.06]")}>
                <div className="flex items-center gap-2">
                  <KingdomCrossIcon size="sm" />
                  {isAdminArea ? (
                    <span className="text-lg font-light tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A84C' }}>
                      {settings.siteName}
                    </span>
                  ) : (
                    <span className="font-headline-md text-primary tracking-tight">{settings.siteName}</span>
                  )}
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className={cn("w-6 h-6", isAdminArea ? "text-white/60 hover:text-white" : "text-on-surface-variant hover:text-on-surface")} />
                </button>
              </div>

              {/* Mobile nav */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {isAdminArea ? (
                  renderAdminNavLinks('mobile')
                ) : (
                navItems.map((item) => {
                  const isDisabled = item.requiresApproval && !isApproved;
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={isDisabled ? '#' : item.path}
                      onClick={() => !isDisabled && setIsMobileMenuOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-label-lg group overflow-hidden",
                        isActive
                          ? "text-on-primary font-bold shadow-lg shadow-primary/20 scale-[1.02] -translate-y-[1px]"
                          : "text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface hover:-translate-y-[0.5px]",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="mobileActiveNavIndicator"
                          className="absolute inset-0 bg-primary -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          style={{ borderRadius: '12px' }}
                        />
                      )}
                      <div className="relative flex items-center gap-3 w-full">
                        <div className="relative flex-shrink-0">
                          <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive && "fill-current")} />
                          {((item.label === 'Messages' && (unreadCount > 0 || unreadMessageNotifCount > 0)) ||
                            (item.label === 'Interests' && unreadInterestCount > 0) ||
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
                        <span className="truncate">{item.label}</span>
                      </div>
                    </Link>
                  );
                })
                )}
              </nav>

              {/* Mobile bottom actions */}
              {isAdmin && isAdminArea && (
                <div className="px-4 py-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsReportModalOpen(true);
                    }}
                    className="admin-sidebar-link w-full"
                  >
                    <FileText className="w-[18px] h-[18px]" />
                    <span>Generate Report</span>
                  </button>
                </div>
              )}

              <div className={cn("p-4 border-t", isAdminArea ? "border-white/[0.06]" : "border-outline-variant")}>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-label-lg",
                    isAdminArea
                      ? "text-white/50 hover:text-red-400 hover:bg-red-500/10"
                      : "text-on-surface-variant hover:text-error hover:bg-error-container"
                  )}
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══════ TOAST NOTIFICATION ═══════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-4 z-[100] w-full max-w-sm px-4 md:px-0"
          >
            <div 
              onClick={() => {
                if (toast.chatId) {
                  navigate(`/messages/${toast.chatId}`);
                  setToast(null);
                }
              }}
              className={cn(
                "bg-surface border border-outline-variant p-4 rounded-2xl shadow-2xl backdrop-blur-xl bg-opacity-95 flex items-start gap-4 transition-all hover:bg-surface-variant/30",
                toast.chatId && "cursor-pointer"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                toast.type === 'message' ? "bg-primary text-on-primary" : "bg-error text-on-error"
              )}>
                {toast.type === 'message' ? <MessageSquare className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-on-surface truncate">{toast.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{toast.message}</p>
                {toast.chatId && (
                  <span className="inline-block text-[10px] font-bold text-primary mt-2 uppercase tracking-wider">
                    Click to Open Chat →
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToast(null);
                }}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-container"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAdmin && (
        <AdminReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
        />
      )}
    </div>
  );
}
