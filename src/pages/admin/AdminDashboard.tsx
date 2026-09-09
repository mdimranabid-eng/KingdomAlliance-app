import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Users,
  Hourglass,
  TrendingUp,
  ShieldCheck,
  Heart,
  CheckCircle,
  UserCheck,
  Image,
  Ban,
  Church,
  Info,
  Loader2,
  FileText,
  ChevronRight,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminReportModal from '../../components/admin/AdminReportModal';
import { parseFirestoreDate, cn } from '../../lib/utils';

function ActivityBadge({ color, label }: { color: string; label: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', color)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeCount: 0,
    newCount: 0,
    interestsSent: 0,
    connectedSuccessfully: 0,
  });
  const [loading, setLoading] = useState(true);
  const [maleFemaleRatio, setMaleFemaleRatio] = useState({ male: 0, female: 0 });
  const [photoPendingCount, setPhotoPendingCount] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d');
  const approvedUsersRef = React.useRef<any[]>([]);

  const recomputeStats = React.useCallback((tf: '7d' | '30d' | 'all') => {
    const now = new Date();
    const approvedUsers = approvedUsersRef.current;

    let cutoffMs = 0;
    if (tf === '7d') cutoffMs = 7 * 24 * 60 * 60 * 1000;
    else if (tf === '30d') cutoffMs = 30 * 24 * 60 * 60 * 1000;

    const activeCount = approvedUsers.filter((u) => {
      const lastActive = parseFirestoreDate(u.lastActive);
      if (!lastActive) return false;
      if (tf === 'all') return true;
      return now.getTime() - lastActive.getTime() <= cutoffMs;
    }).length;

    const newCount = approvedUsers.filter((u) => {
      const createdDate = parseFirestoreDate(u.createdAt);
      if (!createdDate) return false;
      if (tf === 'all') return true;
      return now.getTime() - createdDate.getTime() <= cutoffMs;
    }).length;

    setStats((prev) => ({ ...prev, activeCount, newCount }));
  }, []);

  useEffect(() => {
    recomputeStats(timeframe);
  }, [timeframe, recomputeStats]);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map((d) => d.data());

      const approved = usersData.filter((u) => u.isApproved && u.approvalStatus !== 'pending');
      approvedUsersRef.current = approved;

      const totalUsersCount = approved.length;

      const groomsCount = approved.filter((u) => {
        const gender = (u.gender || '').toLowerCase();
        const pType = (u.profileType || '').toLowerCase();
        return gender === 'male' || gender === 'groom' || pType === 'groom';
      }).length;

      const bridesCount = approved.filter((u) => {
        const gender = (u.gender || '').toLowerCase();
        const pType = (u.profileType || '').toLowerCase();
        return gender === 'female' || gender === 'bride' || pType === 'bride';
      }).length;

      const pendingApprovalsCount = usersData.filter((u) => {
        return u.onboardingComplete === true && u.approvalStatus === 'pending';
      }).length;

      setStats((prev) => ({
        ...prev,
        totalUsers: totalUsersCount,
        pendingApprovals: pendingApprovalsCount,
      }));

      setMaleFemaleRatio({ male: groomsCount, female: bridesCount });
      setLoading(false);

      recomputeStats(timeframe);
    }, (error) => {
      console.error('Error listening for user stats:', error);
      setLoading(false);
    });

    const photoQuery = query(collection(db, 'photoModeration'), where('photoStatus', '==', 'pending'));
    const unsubPhotos = onSnapshot(photoQuery, (snapshot) => {
      setPhotoPendingCount(snapshot.size);
    }, (error) => {
      console.error('Error listening for photo moderation count:', error);
    });

    const unsubInterests = onSnapshot(collection(db, 'interests'), (snapshot) => {
      const interestsData = snapshot.docs.map((d) => d.data());
      const activeUserUids = new Set(approvedUsersRef.current.map((u: any) => u.uid || u.id));
      const pendingCount = interestsData.filter((i) => i.status === 'pending' && activeUserUids.has(i.fromId) && activeUserUids.has(i.toId)).length;
      const acceptedCount = interestsData.filter((i) => i.status === 'accepted' && activeUserUids.has(i.fromId) && activeUserUids.has(i.toId)).length;
      setStats((prev) => ({
        ...prev,
        interestsSent: pendingCount,
        connectedSuccessfully: acceptedCount,
      }));
    }, (error) => {
      console.error('Error listening for interests stats:', error);
    });

    return () => {
      unsubUsers();
      unsubPhotos();
      unsubInterests();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1a2e4a]" />
        <p className="text-sm font-medium text-[#64748b]">Loading dashboard...</p>
      </div>
    );
  }

  const totalProfiles = maleFemaleRatio.male + maleFemaleRatio.female;
  const malePercentage = totalProfiles > 0 ? (maleFemaleRatio.male / totalProfiles) * 100 : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const maleStrokeDash = (malePercentage / 100) * circumference;
  const femaleStrokeDash = circumference - maleStrokeDash;

  return (
    <div className="space-y-6">

      {/* ═══ Hero Banner ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1729] via-[#162236] to-[#0f1729] p-6 lg:p-8 border border-[#1a2e4a]/50 shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#d4af37]/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#d4af37]/3 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-[#94a3b8] mb-3">
              <Link to="/admin" className="hover:text-white transition-colors">Dashboard</Link>
              <ChevronRight className="size-3" />
              <span className="text-[#d4af37]">Overview</span>
            </nav>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">Administration Hub</h1>
            <p className="text-sm text-[#94a3b8] mt-2 max-w-xl">Comprehensive overview of Kingdom Alliance platform metrics and administrative queues.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 backdrop-blur-sm">
              {([
                { key: '7d', label: '7D' },
                { key: '30d', label: '30D' },
                { key: 'all', label: 'All' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeframe(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200',
                    timeframe === key
                      ? 'bg-[#d4af37] text-[#0f172a] shadow-sm'
                      : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Quick Access Row ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <Link to="/admin/users" className="group bg-white border border-[#1a2e4a]/10 rounded-xl p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 flex items-center gap-4">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8]">Management</p>
            <p className="text-[15px] font-semibold text-[#0f172a] mt-0.5">User Management</p>
          </div>
        </Link>
        <Link to="/admin/rejected" className="group bg-white border border-[#1a2e4a]/10 rounded-xl p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 flex items-center gap-4">
          <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
            <Ban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8]">Moderation</p>
            <p className="text-[15px] font-semibold text-[#0f172a] mt-0.5">Rejected Profiles</p>
          </div>
        </Link>
        <Link to="/admin/church-info" className="group bg-white border border-[#1a2e4a]/10 rounded-xl p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 flex items-center gap-4">
          <div className="p-2.5 bg-[#d4af37]/10 text-[#b3804c] rounded-xl">
            <Church className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#94a3b8]">Configuration</p>
            <p className="text-[15px] font-semibold text-[#0f172a] mt-0.5">Church Info</p>
          </div>
        </Link>
      </div>

      {/* ═══ KPI Command Deck ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        {[
          { to: '/admin/users', icon: Users, label: 'Total Users', value: stats.totalUsers, iconBg: 'bg-blue-500/10 text-blue-600' },
          { to: '/admin/approvals', icon: Hourglass, label: 'Pending', value: stats.pendingApprovals, iconBg: 'bg-amber-500/10 text-amber-600' },
          { to: '/admin/users?filter=active', icon: TrendingUp, label: timeframe === 'all' ? 'Active (All)' : timeframe === '7d' ? 'Active (7D)' : 'Active (30D)', value: stats.activeCount, iconBg: 'bg-emerald-500/10 text-emerald-600' },
          { to: '/admin/users?filter=new', icon: ShieldCheck, label: timeframe === 'all' ? 'New (All)' : timeframe === '7d' ? 'New (7D)' : 'New (30D)', value: stats.newCount, iconBg: 'bg-violet-500/10 text-violet-600' },
          { to: '/admin/users?filter=interest-sent', icon: Heart, label: 'Interests Sent', value: stats.interestsSent, iconBg: 'bg-rose-500/10 text-rose-600' },
          { to: '/admin/users?filter=connected-successfully', icon: CheckCircle, label: 'Matches', value: stats.connectedSuccessfully, iconBg: 'bg-teal-500/10 text-teal-600' },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="group bg-white border border-[#1a2e4a]/10 rounded-xl p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('p-2 rounded-lg', s.iconBg)}>
                <s.icon className="size-4" />
              </div>
              <ArrowUpRight className="size-3.5 text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-[#0f172a] tracking-tight">{s.value}</p>
            <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* ═══ Main Content Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">

        {/* ─── User Profiles Composition ─── */}
        <div className="lg:col-span-7 bg-white border border-[#1a2e4a]/10 rounded-xl p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-base font-display font-semibold text-[#0f172a] mb-6">User Profiles Composition</h2>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="18" />
                <circle
                  cx="80" cy="80" r={radius} fill="none" stroke="#fb7185" strokeWidth="18"
                />
                {totalProfiles > 0 && (
                  <circle
                    cx="80" cy="80" r={radius} fill="none" stroke="#3b82f6" strokeWidth="18"
                    strokeDasharray={circumference}
                    strokeDashoffset={femaleStrokeDash}
                    className="transition-all duration-700"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-bold text-[#0f172a] leading-none">{totalProfiles}</p>
                <p className="text-[10px] uppercase tracking-widest text-[#94a3b8] font-semibold mt-1.5">Profiles</p>
              </div>
            </div>
            <div className="space-y-3 w-full max-w-[220px]">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                  <span className="text-xs font-semibold text-[#0f172a]">Grooms</span>
                </div>
                <span className="text-sm font-bold text-[#0f172a]">{maleFemaleRatio.male}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#fb7185]" />
                  <span className="text-xs font-semibold text-[#0f172a]">Brides</span>
                </div>
                <span className="text-sm font-bold text-[#0f172a]">{maleFemaleRatio.female}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Operations & Quick Actions ─── */}
        <div className="lg:col-span-5 bg-[#0f1729] text-white rounded-xl p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <h2 className="text-base font-display font-semibold mb-5">Operations & Quick Actions</h2>

          {/* Status indicators */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">Approvals</span>
                <span className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  stats.pendingApprovals > 0
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-emerald-500/15 text-emerald-400'
                )}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {stats.pendingApprovals > 0 ? 'Pending' : 'Clear'}
                </span>
              </div>
              <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">Photos</span>
                <span className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  photoPendingCount > 0
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-emerald-500/15 text-emerald-400'
                )}>
                  <span className="size-1.5 rounded-full bg-current" />
                  {photoPendingCount > 0 ? 'Pending' : 'Clean'}
                </span>
              </div>
              <p className="text-2xl font-bold">{photoPendingCount}</p>
            </div>
          </div>

          {/* Health Callout */}
          <div className={cn(
            'flex items-start gap-3 p-3.5 rounded-xl border mb-5',
            stats.pendingApprovals > 0
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-emerald-500/10 border-emerald-500/20'
          )}>
            <Info className={cn(
              'w-4 h-4 flex-shrink-0 mt-0.5',
              stats.pendingApprovals > 0 ? 'text-amber-400' : 'text-emerald-400'
            )} />
            <div>
              <p className={cn(
                'text-xs font-bold',
                stats.pendingApprovals > 0 ? 'text-amber-300' : 'text-emerald-300'
              )}>
                {stats.pendingApprovals > 0 ? 'Approval Queue Growing' : 'Queue Healthy'}
              </p>
              <p className="text-[11px] text-[#94a3b8] font-medium mt-0.5">
                {stats.pendingApprovals > 0
                  ? `There are ${stats.pendingApprovals} members waiting for verification.`
                  : 'All registration requests have been processed.'}
              </p>
            </div>
          </div>

          {/* Action tiles */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/approvals" className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3.5 transition-all">
              <div className="p-2 bg-[#d4af37]/15 rounded-lg text-[#d4af37]">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Approvals</p>
                <p className="text-[10px] text-[#94a3b8]">Review queue</p>
              </div>
            </Link>
            <Link to="/admin/photos" className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3.5 transition-all">
              <div className="p-2 bg-[#d4af37]/15 rounded-lg text-[#d4af37]">
                <Image className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Photos</p>
                <p className="text-[10px] text-[#94a3b8]">Moderation</p>
              </div>
            </Link>
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
