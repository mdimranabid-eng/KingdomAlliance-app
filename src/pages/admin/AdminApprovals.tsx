import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  onSnapshot,
  Timestamp,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Check,
  X,
  Clock,
  MapPin,
  User,
  MoreVertical,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Ban
} from 'lucide-react';
import { cn, formatRelativeTime, calculateAge } from '../../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import AdminUserDetailModal from '../../components/admin/AdminUserDetailModal';
import { sendEmail } from '../../lib/email';

export default function AdminApprovals() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; userId: string | null; reason: string }>({
    isOpen: false,
    userId: null,
    reason: ''
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; userId: string | null; name: string }>({
    isOpen: false,
    userId: null,
    name: ''
  });

  useEffect(() => {
    let unsubscribePending: () => void;
    let unsubscribeStats: () => void;

    const setupListeners = async () => {
      try {
        // Fetch the list of authenticated admin UIDs from Firestore
        const adminSnapshot = await getDocs(collection(db, 'admins'));
        const adminIds = adminSnapshot.docs.map(doc => doc.id);

        // 1. Listen for pending users
        const pendingUsersQuery = query(
          collection(db, 'users'),
          where('onboardingComplete', '==', true),
          where('approvalStatus', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );

        unsubscribePending = onSnapshot(pendingUsersQuery, (snapshot) => {
          const pendingData = snapshot.docs
            .map(d => {
              const data = d.data();
              const age = calculateAge(data.dob, data.age);
              return { id: d.id, ...data, age } as any;
            })
            .filter(u => !adminIds.includes(u.id));
          setUsers(pendingData);
          setStats(prev => ({ ...prev, pending: pendingData.length }));
          setLoading(false);
        }, (error) => {
          console.error("Error listening for pending users:", error);
          setLoading(false);
        });

        // 2. Listen for stats (Approved/Rejected Today)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayTimestamp = Timestamp.fromDate(startOfToday);

        const qStats = query(
          collection(db, 'users'),
          where('updatedAt', '>=', todayTimestamp)
        );

        unsubscribeStats = onSnapshot(qStats, (snapshot) => {
          const data = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as any))
            .filter(u => !adminIds.includes(u.id));
          const approvedToday = data.filter(u => u.approvalStatus === 'approved').length;
          const rejectedToday = data.filter(u => u.approvalStatus === 'rejected').length;
          setStats(prev => ({ ...prev, approvedToday, rejectedToday }));
        }, (error) => {
          console.error("Error listening for approval stats:", error);
        });
      } catch (err) {
        console.error("Failed to load admin list for filtering in AdminApprovals:", err);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribePending) unsubscribePending();
      if (unsubscribeStats) unsubscribeStats();
    };
  }, []);

  const handleApprove = async (userId: string) => {
    // Optimistic frontend state update for instant reactivity
    setUsers(prev => prev.filter(u => u.id !== userId));
    setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));

    setProcessingId(userId);
    try {
      const currentAdminId = auth.currentUser?.uid || 'system';
      await updateDoc(doc(db, 'users', userId), {
        approvalStatus: 'approved',
        isApproved: true,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedBy: currentAdminId,
        'notifications': [
          {
            id: crypto.randomUUID(),
            title: 'Profile Approved',
            message: 'Congratulations! Your Kingdom Alliance profile has been approved.',
            type: 'system',
            createdAt: new Date().toISOString(),
            read: false
          }
        ]
      });

      const userToApprove = users.find(u => u.id === userId) || selectedUser;

      setConfirmModal({ isOpen: false, userId: null, name: '' });
    } catch (error) {
      console.error("Error approving user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionModal.userId || !rejectionModal.reason.trim()) return;
    
    const targetUserId = rejectionModal.userId;
    // Optimistic frontend state update for instant reactivity
    setUsers(prev => prev.filter(u => u.id !== targetUserId));
    setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));

    setProcessingId(targetUserId);
    try {
      const currentAdminId = auth.currentUser?.uid || 'system';
      await updateDoc(doc(db, 'users', targetUserId), {
        approvalStatus: 'rejected',
        isApproved: false,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rejectedBy: currentAdminId,
        rejectedReason: rejectionModal.reason,
        'notifications': [
          {
            id: crypto.randomUUID(),
            title: 'Profile Update',
            message: `Your profile requires updates: ${rejectionModal.reason}`,
            type: 'alert',
            createdAt: new Date().toISOString(),
            read: false
          }
        ]
      });

      setRejectionModal({ isOpen: false, userId: null, reason: '' });
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="mt-1 p-2 hover:bg-[#1a2e4a]/5 rounded-full transition-colors text-[#64748b]"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-tight">User Approvals</h1>
              <span className="bg-[#1a2e4a]/10 text-[#1a2e4a] px-3 py-1 rounded-full text-xs font-bold">
                {stats.pending} Pending
              </span>
            </div>
            <p className="text-sm text-[#64748b] mt-0.5">Review and approve new member applications</p>
          </div>
        </div>
        <Link
          to="/admin/rejected"
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <Ban className="w-4 h-4" />
          View Rejected
        </Link>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card p-5 flex items-center gap-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#f59e0b' }}>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Pending Queue</p>
            <p className="text-[28px] font-semibold text-[#0f172a] leading-none mt-0.5">{stats.pending}</p>
          </div>
        </div>
        <div className="admin-card p-5 flex items-center gap-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#10b981' }}>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Approved Today</p>
            <p className="text-[28px] font-semibold text-[#0f172a] leading-none mt-0.5">{stats.approvedToday}</p>
          </div>
        </div>
        <div className="admin-card p-5 flex items-center gap-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#ef4444' }}>
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Rejected Today</p>
            <p className="text-[28px] font-semibold text-[#0f172a] leading-none mt-0.5">{stats.rejectedToday}</p>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a2e4a]" />
            <p className="text-sm text-[#64748b]">Loading applications...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-card p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-[#0f172a]">All caught up!</h3>
            <p className="text-sm text-[#64748b] mt-1">No pending applications at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="popLayout">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="admin-card p-5 flex flex-col md:flex-row items-center justify-between gap-5"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-shrink-0">
                      <img 
                        src={user.photoUrl || user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                        alt="" 
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-[#0f172a] truncate">{user.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#64748b] mt-1">
                        <span className="font-medium">{user.gender || 'N/A'}</span>
                        <span className="text-[#cbd5e1]">·</span>
                        <span>{user.age || 'N/A'} yrs</span>
                        <span className="text-[#cbd5e1]">·</span>
                        <span>{user.denomination || 'N/A'}</span>
                        <span className="text-[#cbd5e1]">·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.city || user.location || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8] mt-1.5">
                        <Clock className="w-3 h-3" />
                        <span>Applied {formatRelativeTime(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-[#1a2e4a] bg-[#1a2e4a]/5 hover:bg-[#1a2e4a]/10 rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, userId: user.id, name: user.name })}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[13px] font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectionModal({ isOpen: true, userId: user.id, reason: '' })}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl text-[13px] font-medium hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setConfirmModal({ isOpen: false, userId: null, name: '' })}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative z-10 ring-1 ring-black/[0.06]"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-5">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f172a] text-center">Approve Application?</h3>
              <p className="text-sm text-[#64748b] mt-2 text-center leading-relaxed">
                Approve <strong className="text-[#0f172a]">{confirmModal.name}</strong>'s application? They will gain full access to the platform.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, userId: null, name: '' })}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmModal.userId && handleApprove(confirmModal.userId)}
                  disabled={!!processingId}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {rejectionModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setRejectionModal({ isOpen: false, userId: null, reason: '' })}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative z-10 ring-1 ring-black/[0.06]"
            >
              <div className="h-1.5 bg-gradient-to-r from-red-500 to-red-700 -mx-8 -mt-8 rounded-t-[2rem]" />
              <h3 className="text-xl font-semibold text-[#0f172a] text-center mt-4">Reject Application</h3>
              <p className="text-sm text-[#64748b] mt-1.5 text-center">Provide a reason — the user will see this message.</p>
              
              <div className="mt-5 space-y-4">
                <textarea
                  value={rejectionModal.reason}
                  onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Profile photo is not clear, please upload a new one."
                  className="w-full h-28 bg-[#f8fafc] rounded-xl p-3.5 text-sm text-[#0f172a] ring-1 ring-black/[0.06] focus:ring-2 focus:ring-red-500/40 transition-all resize-none outline-none"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRejectionModal({ isOpen: false, userId: null, reason: '' })}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!!processingId || !rejectionModal.reason.trim()}
                    className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Profile Side Panel / Modal */}
      <AdminUserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        actions={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                setConfirmModal({ isOpen: true, userId: selectedUser.id, name: selectedUser.name });
                setSelectedUser(null);
              }}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => {
                setRejectionModal({ isOpen: true, userId: selectedUser.id, reason: '' });
                setSelectedUser(null);
              }}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 shadow-sm flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        }
      />
    </div>
  );
}
