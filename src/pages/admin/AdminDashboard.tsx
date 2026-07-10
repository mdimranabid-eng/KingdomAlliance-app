import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'motion/react';
import { 
  Users, 
  Hourglass, 
  CheckCircle, 
  TrendingUp, 
  Search, 
  MoreVertical,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Image,
  Camera,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminReportModal from '../../components/admin/AdminReportModal';
import { parseFirestoreDate, resolveApprovalStatus } from '../../lib/utils';


export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeToday: 0,
    newThisWeek: 0,
    interestsSent: 0,
    connectedSuccessfully: 0
  });
  const [loading, setLoading] = useState(true);
  const [maleFemaleRatio, setMaleFemaleRatio] = useState({ male: 0, female: 0 });
  const [photoPendingCount, setPhotoPendingCount] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    // Real-time listener for general stats
    const usersRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map(d => d.data());
      
      const approvedUsers = usersData.filter(u => u.isApproved && u.approvalStatus !== 'pending');

      // Total Users: Count of all approved documents in the users collection
      const totalUsersCount = approvedUsers.length;

      // Grooms: where the gender field indicates Male/Groom
      const groomsCount = approvedUsers.filter(u => {
        const gender = (u.gender || '').toLowerCase();
        const pType = (u.profileType || '').toLowerCase();
        return gender === 'male' || gender === 'groom' || pType === 'groom';
      }).length;

      // Brides: where the gender field indicates Female/Bride
      const bridesCount = approvedUsers.filter(u => {
        const gender = (u.gender || '').toLowerCase();
        const pType = (u.profileType || '').toLowerCase();
        return gender === 'female' || gender === 'bride' || pType === 'bride';
      }).length;

      // Pending Approvals: where the account status is pending/unapproved
      const pendingApprovalsCount = usersData.filter(u => {
        return u.onboardingComplete === true && u.approvalStatus === 'pending';
      }).length;

      // Calculate actual active today count
      const activeTodayCount = approvedUsers.filter(u => {
        const lastActive = parseFirestoreDate(u.lastActive);
        if (!lastActive) return false;
        const activeDate = new Date(lastActive);
        const today = new Date();
        return activeDate.getDate() === today.getDate() &&
               activeDate.getMonth() === today.getMonth() &&
               activeDate.getFullYear() === today.getFullYear();
      }).length;

      setStats(prev => ({
        ...prev,
        totalUsers: totalUsersCount,
        pendingApprovals: pendingApprovalsCount,
        activeToday: activeTodayCount,
        newThisWeek: approvedUsers.filter(u => {
          const createdDate = parseFirestoreDate(u.createdAt);
          if (!createdDate) return false;
          return (Date.now() - createdDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
        }).length
      }));

      setMaleFemaleRatio({ male: groomsCount, female: bridesCount });
      setLoading(false);
    }, (error) => {
      console.error("Error listening for user stats:", error);
      setLoading(false);
    });

    // Real-time listener for photo moderation queue
    const photoQuery = query(collection(db, 'photoModeration'), where('photoStatus', '==', 'pending'));
    const unsubPhotos = onSnapshot(photoQuery, (snapshot) => {
      setPhotoPendingCount(snapshot.size);
    }, (error) => {
      console.error("Error listening for photo moderation count:", error);
    });

    // Real-time listener for interests count
    const unsubInterests = onSnapshot(collection(db, 'interests'), (snapshot) => {
      const interestsData = snapshot.docs.map(d => d.data());
      const pendingCount = interestsData.filter(i => i.status === 'pending').length;
      const acceptedCount = interestsData.filter(i => i.status === 'accepted').length;
      setStats(prev => ({
        ...prev,
        interestsSent: pendingCount,
        connectedSuccessfully: acceptedCount
      }));
    }, (error) => {
      console.error("Error listening for interests stats:", error);
    });

    return () => {
      unsubUsers();
      unsubPhotos();
      unsubInterests();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface">Admin Overview</h1>
          <p className="text-on-surface-variant">Manage approvals and community health</p>
        </div>
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-lg shadow-lg flex items-center gap-2 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
        >
          Generate Report
        </button>
      </div>



      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-6">
        <AdminStatCard label="Total Users" value={stats.totalUsers} icon={Users} to="/admin/users" hoverScheme="navy" />
        <AdminStatCard label="Pending Approvals" value={stats.pendingApprovals} icon={Hourglass} to="/admin/approvals" hoverScheme="gold" />
        <AdminStatCard label="Active Today" value={stats.activeToday} icon={TrendingUp} to="/admin/users?filter=active-today" hoverScheme="purple" />
        <AdminStatCard label="New This Week" value={stats.newThisWeek} icon={ShieldCheck} to="/admin/users?filter=new-this-week" hoverScheme="emerald" />
        <AdminStatCard label="Interest Sent" value={stats.interestsSent} icon={Heart} to="/admin/users?filter=interest-sent" hoverScheme="purple" />
        <AdminStatCard label="Connected Successfully" value={stats.connectedSuccessfully} icon={CheckCircle} to="/admin/users?filter=connected-successfully" hoverScheme="emerald" />
      </div>

      {/* System Health / Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant shadow-sm space-y-6">
            <h2 className="font-headline text-2xl text-on-surface">Community Composition</h2>
            <div className="space-y-4">
               <div className="flex justify-between text-sm font-bold">
                 <span>Grooms (Male)</span>
                 <span>{maleFemaleRatio.male}</span>
               </div>
               <div className="w-full h-4 bg-surface-container-highest rounded-full overflow-hidden flex">
                 <div 
                   className="h-full bg-primary-container" 
                   style={{ width: `${(maleFemaleRatio.male / ((maleFemaleRatio.male + maleFemaleRatio.female) || 1)) * 100}%` }} 
                 />
                 <div 
                   className="h-full bg-secondary-container" 
                   style={{ width: `${(maleFemaleRatio.female / ((maleFemaleRatio.male + maleFemaleRatio.female) || 1)) * 100}%` }} 
                 />
               </div>
               <div className="flex justify-between text-sm font-bold">
                  <span>Brides (Female)</span>
                  <span>{maleFemaleRatio.female}</span>
               </div>
            </div>
            <div className="pt-4 flex gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-container" /> Male</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-secondary-container" /> Female</div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant shadow-sm space-y-6">
            <h2 className="font-headline text-2xl text-on-surface">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* User Approvals Button */}
              <Link 
                to="/admin/approvals"
                className="relative bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-[#040e2a] hover:border-[#040e2a] hover:text-white group"
              >
                <div className="p-3 bg-[#040e2a]/10 text-[#040e2a] rounded-2xl transition-all duration-300 group-hover:bg-white/10 group-hover:text-white flex-shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="text-left flex-grow">
                  <p className="text-xs font-label-lg text-on-surface-variant uppercase tracking-widest transition-colors duration-300 group-hover:text-white/70">User Approvals</p>
                  <p className="text-base font-bold text-on-surface transition-colors duration-300 group-hover:text-white leading-tight">Review & Approve</p>
                </div>
                
                {stats.pendingApprovals > 0 && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-3 py-1 bg-error text-white text-[10px] font-bold rounded-full animate-pulse-red shadow-lg border-2 border-surface animate-bounce">
                    {stats.pendingApprovals} pending
                  </div>
                )}
              </Link>

              {/* Photo Moderation Button */}
              <Link 
                to="/admin/photos"
                className="relative bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-[#040e2a] group"
              >
                <div className="p-3 bg-[#d4af37]/10 text-[#d4af37] rounded-2xl transition-all duration-300 group-hover:bg-[#040e2a]/10 group-hover:text-[#040e2a] flex-shrink-0">
                  <Image className="w-6 h-6" />
                </div>
                <div className="text-left flex-grow">
                  <p className="text-xs font-label-lg text-on-surface-variant uppercase tracking-widest transition-colors duration-300 group-hover:text-[#040e2a]/70">Photo Moderation</p>
                  <p className="text-base font-bold text-on-surface transition-colors duration-300 group-hover:text-[#040e2a] leading-tight">Moderate Photos</p>
                </div>
                
                {photoPendingCount > 0 && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-3 py-1 bg-error text-white text-[10px] font-bold rounded-full animate-pulse-red shadow-lg border-2 border-surface animate-bounce">
                    {photoPendingCount} pending
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* System Health / Logs */}
        <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant flex flex-col gap-6 shadow-sm">
          <h2 className="font-headline text-2xl text-on-surface">System Health</h2>
          <div className="space-y-4">
            <HealthItem label="Firestore Latency" status="optimal" value="45ms" />
            <HealthItem label="Auth Services" status="optimal" value="Active" />
            <HealthItem 
              label="Image Verification" 
              status={photoPendingCount > 0 ? "warning" : "optimal"} 
              value={photoPendingCount > 0 ? `${photoPendingCount} queued` : "Clean"} 
            />
          </div>
          <div className="mt-4 p-4 bg-primary-container/10 rounded-2xl border border-primary-container/20 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-primary-container flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-primary-container">
                {stats.pendingApprovals > 0 ? "Approval Queue Growing" : "Queue Healthy"}
              </p>
              <p className="text-xs text-on-surface-variant">
                {stats.pendingApprovals > 0 
                  ? `There are ${stats.pendingApprovals} members waiting for verification.` 
                  : "All registration requests have been processed."}
              </p>
            </div>
          </div>
        </div>
      </div>
      <AdminReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
}

function AdminStatCard({ label, value, icon: Icon, to, hoverScheme }: any) {
  const schemes: any = {
    navy: {
      iconBg: 'bg-[#040e2a]/10 text-[#040e2a]',
      hoverClass: 'hover:bg-[#040e2a] hover:border-[#040e2a]',
      hoverIconBg: 'group-hover:bg-white/10 group-hover:text-white',
      textClass: 'group-hover:text-white',
      labelClass: 'group-hover:text-white/70'
    },
    gold: {
      iconBg: 'bg-[#d4af37]/10 text-[#d4af37]',
      hoverClass: 'hover:bg-[#d4af37] hover:border-[#d4af37]',
      hoverIconBg: 'group-hover:bg-[#040e2a]/10 group-hover:text-[#040e2a]',
      textClass: 'group-hover:text-[#040e2a]',
      labelClass: 'group-hover:text-[#040e2a]/70'
    },
    purple: {
      iconBg: 'bg-[#6750A4]/10 text-[#6750A4]',
      hoverClass: 'hover:bg-[#6750A4] hover:border-[#6750A4]',
      hoverIconBg: 'group-hover:bg-white/10 group-hover:text-white',
      textClass: 'group-hover:text-white',
      labelClass: 'group-hover:text-white/70'
    },
    emerald: {
      iconBg: 'bg-[#16a34a]/10 text-[#16a34a]',
      hoverClass: 'hover:bg-[#16a34a] hover:border-[#16a34a]',
      hoverIconBg: 'group-hover:bg-white/10 group-hover:text-white',
      textClass: 'group-hover:text-white',
      labelClass: 'group-hover:text-white/70'
    }
  };

  const scheme = schemes[hoverScheme] || schemes.navy;

  return (
    <Link 
      to={to} 
      className={cn(
        "bg-surface-container-lowest border border-outline-variant rounded-2xl md:rounded-3xl p-2 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group",
        scheme.hoverClass
      )}
    >
      <div className={cn(
        "p-2 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 flex-shrink-0",
        scheme.iconBg,
        scheme.hoverIconBg
      )}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="text-center md:text-left min-w-0">
        <p className={cn("text-[10px] md:text-xs font-label-lg text-on-surface-variant uppercase tracking-widest transition-colors duration-300 hidden md:block", scheme.labelClass)}>{label}</p>
        <p className={cn("text-lg md:text-3xl font-headline text-on-surface transition-colors duration-300 leading-none", scheme.textClass)}>{value}</p>
      </div>
    </Link>
  );
}

function HealthItem({ label, status, value }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-2 h-2 rounded-full",
          status === 'optimal' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-primary-container shadow-[0_0_8px_rgba(212,175,55,0.5)]"
        )} />
        <span className="text-sm font-label-lg text-on-surface">{label}</span>
      </div>
      <span className="text-sm text-on-surface-variant font-inter">{value}</span>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
