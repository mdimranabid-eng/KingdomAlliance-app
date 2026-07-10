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
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminReportModal from '../../components/admin/AdminReportModal';
import { parseFirestoreDate } from '../../lib/utils';

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

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-headline text-lg">Loading Administrator Panel...</p>
      </div>
    );
  }

  // Circular Chart math
  const totalProfiles = maleFemaleRatio.male + maleFemaleRatio.female;
  const malePercentage = totalProfiles > 0 ? (maleFemaleRatio.male / totalProfiles) * 100 : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const maleStrokeDash = (malePercentage / 100) * circumference;
  const femaleStrokeDash = circumference - maleStrokeDash;

  return (
    <div className="space-y-8 p-6 bg-[#edf5f0]/80 rounded-[2.5rem] border border-[#d6ebd9]/50 min-h-screen text-slate-800">
      
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-[#0d2a1d] font-bold leading-tight">Administrator Panel</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">User Profile Management</p>
        </div>
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="hidden md:block bg-[#0b291a] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#0b291a]/90 hover:-translate-y-0.5 transition-all"
        >
          Generate Report
        </button>
      </div>

      {/* Top 6 Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
        
        {/* Total Users */}
        <Link 
          to="/admin/users" 
          className="bg-white border border-[#e4ebe6] rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#3b82f6]/40 hover:bg-[#e8f0fe]/10 transition-all duration-300 group"
        >
          <div className="p-3 bg-[#e8f0fe] text-[#2563eb] rounded-2xl group-hover:bg-[#2563eb] group-hover:text-white transition-colors duration-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 group-hover:text-slate-500 transition-colors">Total Users</p>
            <p className="text-3xl font-extrabold text-slate-800 leading-tight mt-0.5">{stats.totalUsers}</p>
          </div>
        </Link>

        {/* Pending Approvals */}
        <Link 
          to="/admin/approvals" 
          className="bg-white border border-[#e4ebe6] rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#d97706]/40 hover:bg-[#fef3c7]/10 transition-all duration-300 group"
        >
          <div className="p-3 bg-[#fef3c7] text-[#d97706] rounded-2xl group-hover:bg-[#d97706] group-hover:text-white transition-colors duration-300">
            <Hourglass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 group-hover:text-slate-500 transition-colors">Pending Approvals</p>
            <p className="text-3xl font-extrabold text-slate-800 leading-tight mt-0.5">{stats.pendingApprovals}</p>
          </div>
        </Link>

        {/* Active Today */}
        <Link 
          to="/admin/users?filter=active-today" 
          className="bg-white border border-[#e4ebe6] rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#7c3aed]/40 hover:bg-[#f3e8ff]/10 transition-all duration-300 group"
        >
          <div className="p-3 bg-[#f3e8ff] text-[#7c3aed] rounded-2xl group-hover:bg-[#7c3aed] group-hover:text-white transition-colors duration-300">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 group-hover:text-slate-500 transition-colors">Active Today</p>
            <p className="text-3xl font-extrabold text-slate-800 leading-tight mt-0.5">{stats.activeToday}</p>
          </div>
        </Link>

        {/* New This Week */}
        <Link 
          to="/admin/users?filter=new-this-week" 
          className="bg-white border border-[#e4ebe6] rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#16a34a]/40 hover:bg-[#dcfce7]/10 transition-all duration-300 group"
        >
          <div className="p-3 bg-[#dcfce7] text-[#16a34a] rounded-2xl group-hover:bg-[#16a34a] group-hover:text-white transition-colors duration-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 group-hover:text-slate-500 transition-colors">New This Week</p>
            <p className="text-3xl font-extrabold text-slate-800 leading-tight mt-0.5">{stats.newThisWeek}</p>
          </div>
        </Link>

        {/* Interests Sent */}
        <Link 
          to="/admin/users?filter=interest-sent" 
          className="bg-white border border-[#e4ebe6] rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#e11d48]/40 hover:bg-[#ffe4e6]/10 transition-all duration-300 group"
        >
          <div className="p-3 bg-[#ffe4e6] text-[#e11d48] rounded-2xl group-hover:bg-[#e11d48] group-hover:text-white transition-colors duration-300">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 group-hover:text-slate-500 transition-colors">Interests Sent</p>
            <p className="text-3xl font-extrabold text-slate-800 leading-tight mt-0.5">{stats.interestsSent}</p>
          </div>
        </Link>

        {/* Matches Made */}
        <Link 
          to="/admin/users?filter=connected-successfully" 
          className="bg-white border border-[#e4ebe6] rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#16a34a]/40 hover:bg-[#dcfce7]/10 transition-all duration-300 group"
        >
          <div className="p-3 bg-[#dcfce7] text-[#16a34a] rounded-2xl group-hover:bg-[#16a34a] group-hover:text-white transition-colors duration-300">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 group-hover:text-slate-500 transition-colors">Matches Made</p>
            <p className="text-3xl font-extrabold text-slate-800 leading-tight mt-0.5">{stats.connectedSuccessfully}</p>
          </div>
        </Link>
      </div>

      {/* Row 1 Navigation Cards (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* User Approvals Action Card */}
        <Link 
          to="/admin/approvals"
          className="relative bg-white border border-[#e4ebe6] rounded-[1.75rem] p-6 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#0b291a]/40 hover:bg-[#0b291a]/5 transition-all duration-300 group"
        >
          <div className="p-3 bg-slate-100 text-[#475569] rounded-2xl flex-shrink-0 group-hover:bg-[#0b291a] group-hover:text-white transition-colors duration-300">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">User Approvals</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">Review & Approve</p>
          </div>
          {stats.pendingApprovals > 0 && (
            <div className="absolute top-4 right-4 bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {stats.pendingApprovals} pending
            </div>
          )}
        </Link>

        {/* Photo Moderation Action Card */}
        <Link 
          to="/admin/photos"
          className="relative bg-white border border-[#e4ebe6] rounded-[1.75rem] p-6 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#0b291a]/40 hover:bg-[#0b291a]/5 transition-all duration-300 group"
        >
          <div className="p-3 bg-slate-100 text-[#475569] rounded-2xl flex-shrink-0 group-hover:bg-[#0b291a] group-hover:text-white transition-colors duration-300">
            <Image className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Photo Moderation</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">Moderate Photos</p>
          </div>
          {photoPendingCount > 0 && (
            <div className="absolute top-4 right-4 bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {photoPendingCount} pending
            </div>
          )}
        </Link>
      </div>

      {/* Row 2 Navigation Cards (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* User Management Action Card */}
        <Link 
          to="/admin/users"
          className="bg-white border border-[#e4ebe6] rounded-[1.75rem] p-6 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#0b291a]/40 hover:bg-[#0b291a]/5 transition-all duration-300 group"
        >
          <div className="p-3 bg-slate-100 text-[#475569] rounded-2xl flex-shrink-0 group-hover:bg-[#0b291a] group-hover:text-white transition-colors duration-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Management</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">User Management</p>
          </div>
        </Link>

        {/* Rejected Profiles Action Card */}
        <Link 
          to="/admin/rejected"
          className="bg-white border border-[#e4ebe6] rounded-[1.75rem] p-6 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#0b291a]/40 hover:bg-[#0b291a]/5 transition-all duration-300 group"
        >
          <div className="p-3 bg-slate-100 text-[#475569] rounded-2xl flex-shrink-0 group-hover:bg-[#0b291a] group-hover:text-white transition-colors duration-300">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Moderation</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">Rejected Profiles</p>
          </div>
        </Link>

        {/* Pastor & Church Info Action Card */}
        <Link 
          to="/admin/church-info"
          className="bg-white border border-[#e4ebe6] rounded-[1.75rem] p-6 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#0b291a]/40 hover:bg-[#0b291a]/5 transition-all duration-300 group"
        >
          <div className="p-3 bg-slate-100 text-[#475569] rounded-2xl flex-shrink-0 group-hover:bg-[#0b291a] group-hover:text-white transition-colors duration-300">
            <Church className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Configuration</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">Church Info</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User Profiles Composition (Donut Chart) */}
          <div className="bg-white rounded-[2.25rem] p-8 border border-[#e4ebe6] shadow-sm space-y-6">
            <h2 className="font-serif text-2xl text-[#0d2a1d] font-bold">User Profiles Composition</h2>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
              
              {/* Donut Chart SVG */}
              <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle 
                    cx="80" 
                    cy="80" 
                    r={radius} 
                    fill="none" 
                    stroke="#f472b6" 
                    strokeWidth="16" 
                  />
                  {totalProfiles > 0 && (
                    <circle 
                      cx="80" 
                      cy="80" 
                      r={radius} 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="16" 
                      strokeDasharray={circumference}
                      strokeDashoffset={femaleStrokeDash}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-2xl font-extrabold text-slate-800 leading-none">{totalProfiles}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Profiles</p>
                </div>
              </div>

              {/* Composition Details */}
              <div className="space-y-4 w-full max-w-[200px]">
                <div className="flex items-center justify-between p-3 bg-[#e8f0fe] rounded-2xl border border-[#dbe8fc]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                    <span className="text-xs font-bold text-slate-700">Grooms (Male)</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{maleFemaleRatio.male}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#fdf2f8] rounded-2xl border border-[#fbcfe8]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f472b6]" />
                    <span className="text-xs font-bold text-slate-700">Brides (Female)</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{maleFemaleRatio.female}</span>
                </div>
              </div>

            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-[2.25rem] p-8 border border-[#e4ebe6] shadow-sm flex flex-col justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl text-[#0d2a1d] font-bold mb-6">System Health</h2>
              <div className="grid grid-cols-3 gap-4">
                
                {/* Latency */}
                <div className="bg-[#e8f5e9]/50 border border-[#c8e6c9]/50 rounded-2xl p-4 flex flex-col gap-1 items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Firestore Latency</span>
                  <span className="text-base font-extrabold text-[#2e7d32] mt-1">45ms</span>
                  <span className="text-[9px] text-[#2e7d32]/70 font-semibold mt-0.5">(Optimal)</span>
                </div>

                {/* Auth */}
                <div className="bg-[#e8f5e9]/50 border border-[#c8e6c9]/50 rounded-2xl p-4 flex flex-col gap-1 items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Auth Services</span>
                  <span className="text-base font-extrabold text-[#2e7d32] mt-1">Active</span>
                  <span className="text-[9px] text-[#2e7d32]/70 font-semibold mt-0.5">(Optimal)</span>
                </div>

                {/* Verification */}
                <div className="bg-[#e8f5e9]/50 border border-[#c8e6c9]/50 rounded-2xl p-4 flex flex-col gap-1 items-center justify-center text-center">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Image Verification</span>
                  <span className="text-base font-extrabold text-[#2e7d32] mt-1">
                    {photoPendingCount > 0 ? `${photoPendingCount} queued` : "Clean"}
                  </span>
                  <span className="text-[9px] text-[#2e7d32]/70 font-semibold mt-0.5">
                    {photoPendingCount > 0 ? "(Reviewing)" : "(Optimal)"}
                  </span>
                </div>

              </div>
            </div>

            {/* Health Alert Box */}
            <div className="p-4 bg-[#e8eedc] rounded-2xl border border-[#ceddb2]/40 flex items-start gap-4 text-slate-700">
              <Info className="w-5 h-5 text-[#42591e] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-extrabold text-[#42591e]">
                  {stats.pendingApprovals > 0 ? "Approval Queue Growing" : "Queue Healthy"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
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
