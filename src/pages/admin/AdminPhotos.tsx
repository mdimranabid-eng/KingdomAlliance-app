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
  orderBy
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
  ChevronDown
} from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';

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
}

const REJECTION_REASONS = [
  "Inappropriate content",
  "Face not clearly visible",
  "Not a real photo of yourself",
  "Low quality / blurry",
  "Other (type reason)"
];

export default function AdminPhotos() {
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
    // 1. Listen for pending photos in the photoModeration collection directly
    const qPending = query(
      collection(db, 'photoModeration'), 
      where('photoStatus', '==', 'pending')
    );

    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      const newItems = snapshot.docs.map(doc => {
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

      // Sort client-side in desc order of uploadedAt
      newItems.sort((a, b) => {
        const timeA = a.uploadedAt?.toDate?.()?.getTime() || a.uploadedAt?.seconds || 0;
        const timeB = b.uploadedAt?.toDate?.()?.getTime() || b.uploadedAt?.seconds || 0;
        return timeB - timeA;
      });

      setItems(newItems);
      setStats(prev => ({ ...prev, pending: newItems.length }));
      setLoading(false);
    }, (error) => {
      console.error("Error listening for pending photos:", error);
      setLoading(false);
    });

    // 2. Listen for stats (Approved/Rejected Today)
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
      unsubscribeStats();
    };
  }, []);

  const handleApprove = async (item: ModerationItem) => {
    setProcessingId(item.id);
    const adminId = auth.currentUser?.uid || 'system';

    try {
      // 1. Try updating photoModeration collection
      try {
        await updateDoc(doc(db, 'photoModeration', item.id), {
          photoStatus: 'approved',
          status: 'approved',
          reviewedAt: serverTimestamp(),
          reviewedBy: adminId
        });
      } catch (e) {
        console.log("No photoModeration document to update");
      }

      // 2. Update User Document
      if (item.uid) {
        const userRef = doc(db, 'users', item.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const targetPhoto = item.pendingPhotoUrl || item.photoURL;
          
          if (item.photoType === 'profilePhoto') {
            await updateDoc(userRef, {
              photoUrl: targetPhoto,
              photoURL: targetPhoto,
              pendingPhotoUrl: '',
              photoStatus: 'approved',
              updatedAt: serverTimestamp(),
              notifications: arrayUnion({
                id: crypto.randomUUID(),
                title: 'Photo Approved',
                message: 'Your profile photo has been approved.',
                type: 'success',
                read: false,
                createdAt: new Date().toISOString()
              })
            });
          } else {
            const gallery = userData.gallery || [];
            const updatedGallery = gallery.map((p: any) => 
              p.url === item.photoURL ? { ...p, status: 'approved' } : p
            );
            
            await updateDoc(userRef, {
              gallery: updatedGallery,
              updatedAt: serverTimestamp(),
              notifications: arrayUnion({
                id: crypto.randomUUID(),
                title: 'Gallery Photo Approved',
                message: 'Your gallery photo has been approved.',
                type: 'success',
                read: false,
                createdAt: new Date().toISOString()
              })
            });
          }
        }
      }
    } catch (err) {
      console.error("Error approving photo:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: ModerationItem) => {
    const state = rejectionStates[item.id];
    const finalReason = state?.reason === "Other (type reason)" ? state.customReason : state?.reason;
    
    if (!finalReason) return;

    setProcessingId(item.id);
    const adminId = auth.currentUser?.uid || 'system';

    try {
      // 1. Try updating photoModeration collection
      try {
        await updateDoc(doc(db, 'photoModeration', item.id), {
          photoStatus: 'rejected',
          status: 'rejected',
          reviewedAt: serverTimestamp(),
          reviewedBy: adminId,
          rejectedReason: finalReason
        });
      } catch (e) {
        console.log("No photoModeration document to update");
      }

      // 2. Notify User and clear pending photo state on user document
      if (item.uid) {
        const userRef = doc(db, 'users', item.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          if (item.photoType === 'profilePhoto') {
            await updateDoc(userRef, {
              photoStatus: 'rejected',
              pendingPhotoUrl: '',
              notifications: arrayUnion({
                id: crypto.randomUUID(),
                title: 'Profile Photo Rejected',
                message: `Your profile photo was not approved: ${finalReason}. Please upload a new one.`,
                type: 'alert',
                read: false,
                createdAt: new Date().toISOString()
              }),
              updatedAt: serverTimestamp()
            });
          } else {
            const gallery = userSnap.data().gallery || [];
            const updatedGallery = gallery.map((p: any) => 
              p.url === item.photoURL ? { ...p, status: 'rejected', rejectionReason: finalReason } : p
            );
            await updateDoc(userRef, {
              gallery: updatedGallery,
              notifications: arrayUnion({
                id: crypto.randomUUID(),
                title: 'Gallery Photo Rejected',
                message: `Your gallery photo was not approved: ${finalReason}.`,
                type: 'alert',
                read: false,
                createdAt: new Date().toISOString()
              }),
              updatedAt: serverTimestamp()
            });
          }
        }
      }
    } catch (err) {
      console.error("Error rejecting photo:", err);
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
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-playfair text-4xl font-bold text-[#040e2a]">Photo Moderation</h1>
          <span className="bg-[#d4af37]/20 text-[#d4af37] px-4 py-1 rounded-full text-sm font-bold border border-[#d4af37]/30">
            {stats.pending} Pending
          </span>
        </div>
        <p className="text-on-surface-variant mt-2 text-lg">Review and approve member photo uploads</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#d4af37] p-6 rounded-2xl shadow-lg text-[#040e2a]">
          <p className="text-sm font-bold uppercase tracking-wider opacity-80">Pending Photos</p>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-surface-container p-1 rounded-2xl w-fit">
        {(['all', 'profile', 'gallery'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              filterTab === tab 
                ? "bg-white text-[#040e2a] shadow-sm" 
                : "text-on-surface-variant hover:text-on-surface"
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
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-on-surface-variant font-medium">Loading photos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-surface-container rounded-3xl border border-dashed border-outline-variant text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-on-surface">No photos awaiting moderation.</h3>
            <p className="text-on-surface-variant mt-2">All uploads have been processed.</p>
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
                  className="bg-white border border-outline-variant rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
                >
                  {/* Photo Preview */}
                  <div className="relative h-[240px] bg-surface-container overflow-hidden flex items-center justify-center">
                    {!item.pendingPhotoUrl || imageErrors[item.id] ? (
                      <div className="w-full h-full bg-gradient-to-br from-[#040e2a] to-[#0d2159] p-6 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-[#d4af37]">
                          <Camera className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">No Image Data Found</p>
                          <p className="text-white/60 text-xs mt-1 font-medium">{item.userName}</p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={item.pendingPhotoUrl} 
                        alt={item.userName} 
                        onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute top-4 left-4 z-10">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-md",
                        item.photoType === 'profilePhoto' ? "bg-[#040e2a] text-white" : "bg-purple-600 text-white"
                      )}>
                        {item.photoType === 'profilePhoto' ? 'Profile Photo' : `Gallery — Pos ${item.galleryPosition}`}
                      </span>
                    </div>
                    {item.pendingPhotoUrl && !imageErrors[item.id] && (
                      <button
                        onClick={() => window.open(item.pendingPhotoUrl, '_blank')}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors z-10"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#040e2a]">{item.userName}</h4>
                        <button onClick={() => window.open(`/profile/${item.uid}`, '_blank')}>
                          <ExternalLink className="w-3 h-3 text-on-surface-variant hover:text-primary" />
                        </button>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        {formatRelativeTime(item.uploadedAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={!!processingId}
                        className="w-full py-3 bg-[#16a34a] text-white rounded-2xl font-bold text-sm hover:bg-[#15803d] transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        {processingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve Photo
                      </button>

                      <div className="relative">
                        {!rejectionStates[item.id]?.isOpen ? (
                          <button
                            onClick={() => setRejectionStates(prev => ({ ...prev, [item.id]: { isOpen: true, reason: '', customReason: '' } }))}
                            disabled={!!processingId}
                            className="w-full py-3 bg-[#dc2626] text-white rounded-2xl font-bold text-sm hover:bg-[#b91c1c] transition-all flex items-center justify-center gap-2 shadow-md"
                          >
                            <X className="w-4 h-4" />
                            Reject Photo
                          </button>
                        ) : (
                          <div className="bg-surface-container p-3 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-on-surface-variant uppercase">Reject Reason</span>
                              <button 
                                onClick={() => setRejectionStates(prev => ({ ...prev, [item.id]: { ...prev[item.id], isOpen: false } }))}
                                className="text-on-surface-variant hover:text-on-surface"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <select
                              value={rejectionStates[item.id].reason}
                              onChange={(e) => setRejectionStates(prev => ({ 
                                ...prev, 
                                [item.id]: { ...prev[item.id], reason: e.target.value } 
                              }))}
                              className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-error outline-none"
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
                                className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-error outline-none"
                              />
                            )}

                            <button
                              onClick={() => handleReject(item)}
                              disabled={!!processingId || !rejectionStates[item.id].reason || (rejectionStates[item.id].reason === "Other (type reason)" && !rejectionStates[item.id].customReason)}
                              className="w-full py-2 bg-[#dc2626] text-white rounded-xl font-bold text-xs hover:bg-[#b91c1c] transition-all disabled:opacity-50"
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
