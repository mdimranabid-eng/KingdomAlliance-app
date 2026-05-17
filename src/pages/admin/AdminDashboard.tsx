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
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminReportModal from '../../components/admin/AdminReportModal';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeToday: 0,
    newThisWeek: 0
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
      
      const pending = usersData.filter(u => u.approvalStatus === 'pending' && u.onboardingComplete === true).length;
      const males = usersData.filter(u => u.gender === 'male').length;
      const females = usersData.filter(u => u.gender === 'female').length;

      setStats({
        totalUsers: usersData.length,
        pendingApprovals: pending,
        activeToday: Math.floor(usersData.length * 0.1),
        newThisWeek: usersData.filter(u => {
          const created = u.createdAt?.toDate?.() || new Date(0);
          return (Date.now() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
        }).length
      });

      setMaleFemaleRatio({ male: males, female: females });
      setLoading(false);
    }, (error) => {
      console.error("Error listening for user stats:", error);
      setLoading(false);
    });

    // Real-time listener for photo moderation queue
    const photoQuery = query(collection(db, 'users'), where('photoStatus', '==', 'pending'));
    const unsubPhotos = onSnapshot(photoQuery, (snapshot) => {
      setPhotoPendingCount(snapshot.size);
    }, (error) => {
      console.error("Error listening for photo moderation count:", error);
    });

    return () => {
      unsubUsers();
      unsubPhotos();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard label="Total Users" value={stats.totalUsers} icon={Users} color="navy" />
        <AdminStatCard label="Pending Approvals" value={stats.pendingApprovals} icon={Hourglass} color="gold" />
        <AdminStatCard label="Active Today" value={stats.activeToday} icon={TrendingUp} color="navy" />
        <AdminStatCard label="New This Week" value={stats.newThisWeek} icon={ShieldCheck} color="gold" />
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
                   style={{ width: `${(maleFemaleRatio.male / (stats.totalUsers || 1)) * 100}%` }} 
                 />
                 <div 
                   className="h-full bg-secondary-container" 
                   style={{ width: `${(maleFemaleRatio.female / (stats.totalUsers || 1)) * 100}%` }} 
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
                className="relative flex flex-col items-center text-center p-6 bg-[#040e2a] text-white rounded-[12px] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="p-3 bg-white/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-7 h-7" />
                </div>
                <span className="font-bold text-lg">User Approvals</span>
                <span className="text-xs text-white/60 mt-1">Review and approve pending registrations</span>
                
                {stats.pendingApprovals > 0 && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-3 py-1 bg-error text-white text-[10px] font-bold rounded-full animate-pulse-red shadow-lg border-2 border-surface">
                    {stats.pendingApprovals} pending
                  </div>
                )}
              </Link>

              {/* Photo Moderation Button */}
              <Link 
                to="/admin/photos"
                className="relative flex flex-col items-center text-center p-6 bg-[#d4af37] text-[#040e2a] rounded-[12px] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="p-3 bg-[#040e2a]/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <Image className="w-7 h-7" />
                </div>
                <span className="font-bold text-lg">Photo Moderation</span>
                <span className="text-xs text-[#040e2a]/60 mt-1">Review and moderate uploaded profile photos</span>
                
                {photoPendingCount > 0 && (
                  <div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-3 py-1 bg-error text-white text-[10px] font-bold rounded-full animate-pulse-red shadow-lg border-2 border-surface">
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

function AdminStatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-2xl transition-transform group-hover:scale-110",
          color === 'navy' ? "bg-primary-container/10 text-primary-container" : "bg-primary/10 text-primary"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-label-lg text-on-surface-variant uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-headline text-on-surface">{value}</p>
        </div>
      </div>
    </div>
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
