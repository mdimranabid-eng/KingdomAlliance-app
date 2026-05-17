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
  orderBy
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
  Loader2
} from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import AdminUserDetailModal from '../../components/admin/AdminUserDetailModal';

export default function AdminApprovals() {
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
    // 1. Listen for pending users
    const qPending = query(
      collection(db, 'users'),
      where('approvalStatus', '==', 'pending'),
      where('onboardingComplete', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      const pendingData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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

    const unsubscribeStats = onSnapshot(qStats, (snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      const approvedToday = data.filter(u => u.approvalStatus === 'approved').length;
      const rejectedToday = data.filter(u => u.approvalStatus === 'rejected').length;
      setStats(prev => ({ ...prev, approvedToday, rejectedToday }));
    }, (error) => {
      console.error("Error listening for approval stats:", error);
    });

    return () => {
      unsubscribePending();
      unsubscribeStats();
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
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-playfair text-4xl font-bold text-[#040e2a]">User Approvals</h1>
            <span className="bg-[#d4af37]/20 text-[#d4af37] px-4 py-1 rounded-full text-sm font-bold border border-[#d4af37]/30">
              {stats.pending} Pending
            </span>
          </div>
          <p className="text-on-surface-variant mt-2 text-lg">Review and approve new member applications</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#d4af37] p-6 rounded-2xl shadow-lg text-[#040e2a]">
          <p className="text-sm font-bold uppercase tracking-wider opacity-80">Pending Queue</p>
          <p className="text-4xl font-black mt-1">{stats.pending}</p>
        </div>
        <div className="bg-[#16a34a] p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm font-bold uppercase tracking-wider opacity-80">Approved Today</p>
          <p className="text-4xl font-black mt-1">{stats.approvedToday}</p>
        </div>
        <div className="bg-[#dc2626] p-6 rounded-2xl shadow-lg text-white">
          <p className="text-sm font-bold uppercase tracking-wider opacity-80">Rejected Today</p>
          <p className="text-4xl font-black mt-1">{stats.rejectedToday}</p>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-on-surface-variant font-medium">Loading applications...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-surface-container rounded-3xl border border-dashed border-outline-variant text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface">All caught up!</h3>
            <p className="text-on-surface-variant mt-2">No pending applications at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white border border-outline-variant rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative">
                      <img 
                        src={user.photoUrl || user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                        alt="" 
                        className="w-[60px] h-[60px] rounded-full object-cover border-2 border-primary-container shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-outline-variant">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#040e2a] group-hover:text-primary transition-colors">{user.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant mt-1">
                        <span className="capitalize">{user.gender || 'N/A'}</span>
                        <span className="text-outline-variant">•</span>
                        <span>{user.age || 'N/A'} yrs</span>
                        <span className="text-outline-variant">•</span>
                        <span>{user.denomination || 'N/A'}</span>
                        <span className="text-outline-variant">•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{user.city || user.location || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60 mt-2">
                        <Clock className="w-3 h-3" />
                        <span>Applied {formatRelativeTime(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-2 px-4 py-2 border border-[#040e2a] text-[#040e2a] rounded-xl font-bold text-sm hover:bg-[#040e2a]/5 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, userId: user.id, name: user.name })}
                      className="flex items-center gap-2 px-5 py-2 bg-[#16a34a] text-white rounded-xl font-bold text-sm hover:bg-[#15803d] transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setRejectionModal({ isOpen: true, userId: user.id, reason: '' })}
                      className="flex items-center gap-2 px-5 py-2 bg-[#dc2626] text-white rounded-xl font-bold text-sm hover:bg-[#b91c1c] transition-colors shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
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
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#040e2a]">Approve Application?</h3>
              <p className="text-on-surface-variant mt-4 leading-relaxed">
                Are you sure you want to approve <strong>{confirmModal.name}</strong>'s application? They will gain full access to the platform.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, userId: null, name: '' })}
                  className="px-6 py-3 rounded-xl font-bold text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmModal.userId && handleApprove(confirmModal.userId)}
                  disabled={!!processingId}
                  className="px-6 py-3 bg-[#16a34a] text-white rounded-xl font-bold hover:bg-[#15803d] transition-all flex items-center justify-center gap-2"
                >
                  {processingId ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
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
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10"
            >
              <h3 className="text-2xl font-bold text-[#040e2a] text-center">Reject Application</h3>
              <p className="text-on-surface-variant mt-2 text-center">Please provide a reason for the rejection. The user will see this message.</p>
              
              <div className="mt-6 space-y-4">
                <textarea
                  value={rejectionModal.reason}
                  onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Profile photo is not clear, please upload a new one."
                  className="w-full h-32 bg-surface-container rounded-2xl p-4 text-on-surface border-none focus:ring-2 focus:ring-error transition-all resize-none"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setRejectionModal({ isOpen: false, userId: null, reason: '' })}
                    className="px-6 py-3 rounded-xl font-bold text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!!processingId || !rejectionModal.reason.trim()}
                    className="px-6 py-3 bg-[#dc2626] text-white rounded-xl font-bold hover:bg-[#b91c1c] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processingId ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reject'}
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
          <div className="flex gap-4 w-full">
            <button
              onClick={() => {
                setConfirmModal({ isOpen: true, userId: selectedUser.id, name: selectedUser.name });
                setSelectedUser(null);
              }}
              className="flex-1 py-4 bg-[#16a34a] text-white rounded-2xl font-bold hover:bg-[#15803d] shadow-lg flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Approve
            </button>
            <button
              onClick={() => {
                setRejectionModal({ isOpen: true, userId: selectedUser.id, reason: '' });
                setSelectedUser(null);
              }}
              className="flex-1 py-4 bg-[#dc2626] text-white rounded-2xl font-bold hover:bg-[#b91c1c] shadow-lg flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Reject
            </button>
          </div>
        }
      />
    </div>
  );
}
