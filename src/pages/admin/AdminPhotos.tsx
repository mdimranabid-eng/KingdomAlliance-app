import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  arrayUnion, 
  getDoc,
  Timestamp,
  orderBy,
  addDoc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  XCircle, 
  Camera, 
  Image as ImageIcon, 
  User, 
  Check, 
  X, 
  ExternalLink,
  Loader2,
  Clock,
  Filter,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { sendEmail } from '../../lib/email';

// Dynamic environment-aware backend URL to prevent Mixed Content errors under HTTPS
const BACKEND_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_BACKEND_URL || '');

// Legacy email triggers removed; now processed securely on the backend server.


interface ModerationItem {
  id: string;
  uid: string;
  userName: string;
  photoURL: string;
  photoUrl?: string;
  pendingPhotoUrl?: string;
  photoType: 'profilePhoto' | 'galleryPhoto';
  galleryPosition: number | null;
  photoStatus: 'pending' | 'approved' | 'rejected';
  uploadedAt: any;
  isSynthesized?: boolean;
}

const REJECTION_REASONS = [
  "Inappropriate content",
  "Face not clearly visible",
  "Not a real photo of yourself",
  "Low quality / blurry",
  "Other (type reason)"
];

export default function AdminPhotos() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0
  });
  const [filterTab, setFilterTab] = useState<'all' | 'profile' | 'gallery'>('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionStates, setRejectionStates] = useState<Record<string, { isOpen: boolean; reason: string; customReason: string }>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let activeModeration: ModerationItem[] = [];
    let activeUsers: ModerationItem[] = [];

    const updateCombinedItems = () => {
      const moderationUids = new Set(activeModeration.map(item => item.uid));
      const filteredUsers = activeUsers.filter(userItem => !moderationUids.has(userItem.uid));
      const combined = [...activeModeration, ...filteredUsers];

      combined.sort((a, b) => {
        const timeA = a.uploadedAt?.toDate?.()?.getTime() || a.uploadedAt?.seconds || 0;
        const timeB = b.uploadedAt?.toDate?.()?.getTime() || b.uploadedAt?.seconds || 0;
        return timeB - timeA;
      });

      setItems(combined);
      setStats(prev => ({ ...prev, pending: combined.length }));
    };

    // 1. Listen for pending photos in the photoModeration collection directly
    const qPending = query(
      collection(db, 'photoModeration'), 
      where('photoStatus', '==', 'pending')
    );

    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      activeModeration = snapshot.docs.map(doc => {
        const data = doc.data();
        const userName = data.userName || data.name || 'Unnamed User';
        return {
          id: doc.id,
          uid: data.userId || data.uid || '',
          userName: userName,
          photoURL: data.photoUrl || data.photoURL || '',
          photoUrl: data.photoUrl || data.photoURL || '',
          pendingPhotoUrl: data.photoUrl || data.photoURL || '',
          photoType: data.photoType || 'profilePhoto',
          galleryPosition: data.galleryPosition !== undefined ? data.galleryPosition : null,
          photoStatus: data.photoStatus || 'pending',
          uploadedAt: data.uploadedAt || data.createdAt || null
        };
      }) as ModerationItem[];

      updateCombinedItems();
      setLoading(false);
    }, (error) => {
      console.error("Error listening for pending photos:", error);
      setLoading(false);
    });

    // 2. Safety Net: Listen for users with photoStatus == 'pending' (to reconcile missing moderation records)
    const qPendingUsers = query(
      collection(db, 'users'),
      where('photoStatus', '==', 'pending')
    );

    const unsubscribePendingUsers = onSnapshot(qPendingUsers, (snapshot) => {
      activeUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        const userName = data.name ? `${data.name} ${data.lastName || ''}`.trim() : 'Unnamed User';
        const photo = data.pendingPhotoUrl || data.photoUrl || data.photoURL || '';
        return {
          id: `user-sync-${doc.id}`,
          uid: doc.id,
          userName: userName,
          photoURL: photo,
          photoUrl: photo,
          pendingPhotoUrl: photo,
          photoType: 'profilePhoto',
          galleryPosition: null,
          photoStatus: 'pending',
          uploadedAt: data.submittedAt || data.updatedAt || null,
          isSynthesized: true
        };
      }) as ModerationItem[];

      updateCombinedItems();
    }, (error) => {
      console.error("Error listening for pending users:", error);
    });

    // 3. Listen for stats (Approved/Rejected Today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(startOfToday);

    const qStats = query(
      collection(db, 'photoModeration'),
      where('reviewedAt', '>=', todayTimestamp)
    );

    const unsubscribeStats = onSnapshot(qStats, (snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      const approvedToday = data.filter(u => u.photoStatus === 'approved').length;
      const rejectedToday = data.filter(u => u.photoStatus === 'rejected').length;
      setStats(prev => ({ ...prev, approvedToday, rejectedToday }));
    }, (error) => {
      console.error("Error listening for moderation stats:", error);
    });

    return () => {
      unsubscribePending();
      unsubscribePendingUsers();
      unsubscribeStats();
    };
  }, []);

  const handleApprove = async (item: ModerationItem) => {
    setProcessingId(item.id);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/admin/approve-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ item })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve photo');
      }

      console.log("Photo approved successfully via backend.");
    } catch (err) {
      console.error("Error approving photo:", err);
      alert(err instanceof Error ? err.message : "Error approving photo");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: ModerationItem) => {
    const state = rejectionStates[item.id];
    const finalReason = state?.reason === "Other (type reason)" ? state.customReason : state?.reason;
    
    if (!finalReason) return;

    setProcessingId(item.id);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/admin/reject-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ item, reason: finalReason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject photo');
      }

      console.log("Photo rejected successfully via backend.");
      
      // Close rejection dialog
      setRejectionStates(prev => ({
        ...prev,
        [item.id]: { isOpen: false, reason: '', customReason: '' }
      }));
    } catch (err) {
      console.error("Error rejecting photo:", err);
      alert(err instanceof Error ? err.message : "Error rejecting photo");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredItems = items.filter(item => {
    if (filterTab === 'all') return true;
    if (filterTab === 'profile') return item.photoType === 'profilePhoto';
    if (filterTab === 'gallery') return item.photoType === 'galleryPhoto';
    return true;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
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
            <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-tight">Photo Moderation</h1>
            <span className="bg-[#1a2e4a]/10 text-[#1a2e4a] px-3 py-1 rounded-full text-xs font-bold">
              {stats.pending} Pending
            </span>
          </div>
          <p className="text-sm text-[#64748b] mt-0.5">Review and approve member photo uploads</p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card p-5 flex items-center gap-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#f59e0b' }}>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Camera className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">Pending Photos</p>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl ring-1 ring-black/[0.04] w-fit shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {(['all', 'profile', 'gallery'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
              filterTab === tab 
                ? "bg-[#1a2e4a] text-white shadow-sm" 
                : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]"
            )}
          >
            {tab === 'all' && 'All Pending'}
            {tab === 'profile' && 'Profile Photos'}
            {tab === 'gallery' && 'Gallery Photos'}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a2e4a]" />
            <p className="text-sm text-[#64748b]">Loading photos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="admin-card p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-[#0f172a]">No photos awaiting moderation</h3>
            <p className="text-sm text-[#64748b] mt-1">All uploads have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="admin-card overflow-hidden flex flex-col group"
                >
                  {/* Photo Preview */}
                  <div className="relative h-[220px] bg-[#f1f5f9] overflow-hidden flex items-center justify-center">
                    {!item.pendingPhotoUrl || imageErrors[item.id] ? (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a2e4a] to-[#2d4a6f] p-6 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                          <Camera className="w-6 h-6 text-white/70" />
                        </div>
                        <div>
                          <p className="text-white/90 font-medium text-sm">No Image Data</p>
                          <p className="text-white/50 text-xs mt-0.5">{item.userName}</p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={item.pendingPhotoUrl} 
                        alt={item.userName} 
                        onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-3 left-3 z-10">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur-md",
                        item.photoType === 'profilePhoto' ? "bg-[#1a2e4a]/90 text-white" : "bg-purple-600/90 text-white"
                      )}>
                        {item.photoType === 'profilePhoto' ? 'Profile' : `Gallery #${item.galleryPosition}`}
                      </span>
                    </div>
                    {item.pendingPhotoUrl && !imageErrors[item.id] && (
                      <button
                        onClick={() => window.open(item.pendingPhotoUrl, '_blank')}
                        className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-md transition-colors z-10"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[13px] font-semibold text-[#0f172a] truncate">{item.userName}</h4>
                        <button onClick={() => window.open(`/profile/${item.uid}`, '_blank')}>
                          <ExternalLink className="w-3 h-3 text-[#94a3b8] hover:text-[#1a2e4a]" />
                        </button>
                      </div>
                      <span className="text-[11px] text-[#94a3b8]">
                        {formatRelativeTime(item.uploadedAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={!!processingId}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        {processingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </button>

                      <div className="relative">
                        {!rejectionStates[item.id]?.isOpen ? (
                          <button
                            onClick={() => setRejectionStates(prev => ({ ...prev, [item.id]: { isOpen: true, reason: '', customReason: '' } }))}
                            disabled={!!processingId}
                            className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-[13px] font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        ) : (
                          <div className="bg-[#f8fafc] p-3 rounded-xl space-y-2.5 ring-1 ring-black/[0.04]">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Reject Reason</span>
                              <button 
                                onClick={() => setRejectionStates(prev => ({ ...prev, [item.id]: { ...prev[item.id], isOpen: false } }))}
                                className="text-[#94a3b8] hover:text-[#0f172a]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <select
                              value={rejectionStates[item.id].reason}
                              onChange={(e) => setRejectionStates(prev => ({ 
                                ...prev, 
                                [item.id]: { ...prev[item.id], reason: e.target.value } 
                              }))}
                              className="w-full bg-white rounded-lg px-3 py-2 text-[13px] ring-1 ring-black/[0.06] focus:ring-2 focus:ring-red-500/40 outline-none"
                            >
                              <option value="">Select reason...</option>
                              {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>

                            {rejectionStates[item.id].reason === "Other (type reason)" && (
                              <input
                                type="text"
                                placeholder="Type custom reason..."
                                value={rejectionStates[item.id].customReason}
                                onChange={(e) => setRejectionStates(prev => ({ 
                                  ...prev, 
                                  [item.id]: { ...prev[item.id], customReason: e.target.value } 
                                }))}
                                className="w-full bg-white rounded-lg px-3 py-2 text-[13px] ring-1 ring-black/[0.06] focus:ring-2 focus:ring-red-500/40 outline-none"
                              />
                            )}

                            <button
                              onClick={() => handleReject(item)}
                              disabled={!!processingId || !rejectionStates[item.id].reason || (rejectionStates[item.id].reason === "Other (type reason)" && !rejectionStates[item.id].customReason)}
                              className="w-full py-2 bg-red-500 text-white rounded-lg text-[12px] font-medium hover:bg-red-600 transition-all disabled:opacity-40"
                            >
                              {processingId === item.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Confirm Rejection'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
