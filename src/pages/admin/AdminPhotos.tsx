import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, RefreshCcw, Camera, Image as ImageIcon, User, ShieldAlert, Check, X, Trash2, Bell } from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../../lib/utils';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  pendingPhotoUrl?: string;
  photoStatus?: 'pending' | 'approved' | 'rejected' | 'idle';
  gallery: { id: string, url: string, status: 'pending' | 'approved' | 'rejected', rejectionReason?: string }[];
}

export default function AdminPhotos() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingPhotos = async () => {
    setLoading(true);
    try {
      // Fetch users who have either main photo pending or gallery items pending
      // Since Firestore doesn't support complex "OR" on nested arrays easily, 
      // we'll fetch all with main photo pending then client-side filter or fetch all active users
      // For scale, we'd use multiple queries. Here we'll do main photo pending first.
      const qMain = query(collection(db, 'users'), where('photoStatus', '==', 'pending'));
      const snapMain = await getDocs(qMain);
      
      const usersMap = new Map<string, PendingUser>();
      
      snapMain.docs.forEach(doc => {
        usersMap.set(doc.id, { id: doc.id, ...doc.data() } as PendingUser);
      });

      // Also search for gallery pendings (limited in firestore, so we might need a better index or just fetch recent updates)
      // For this applet, let's just fetch all and filter in memory if users are few, 
      // but better to fetch users whose status is 'pending' (could be profile or photo)
      // Actually, let's just use photoStatus: 'pending' for the main queue.
      
      setUsers(Array.from(usersMap.values()));
    } catch (err) {
      console.error("Error fetching pending photos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPhotos();
  }, []);

  const addNotification = async (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        notifications: arrayUnion({
          id: Math.random().toString(36).substring(7),
          title,
          message,
          type,
          read: false,
          createdAt: new Date().toISOString()
        }),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };

  const sendModerationEmail = (email: string, subject: string, message: string) => {
    // In a real production app, this would call a cloud function or email API (SendGrid, etc.)
    console.log(`[EMAIL SYSTEM] Sending to: ${email}`);
    console.log(`[EMAIL SYSTEM] Subject: ${subject}`);
    console.log(`[EMAIL SYSTEM] Message: ${message}`);
  };

  const handleApproveMain = async (userId: string, pendingUrl: string) => {
    setProcessing(userId + '_main');
    try {
      await updateDoc(doc(db, 'users', userId), {
        photoUrl: pendingUrl,
        pendingPhotoUrl: '',
        photoStatus: 'approved',
        photoApproved: true, // legacy field
        updatedAt: serverTimestamp()
      });
      
      await addNotification(
        userId, 
        "Photo Approved", 
        "Great news! Your profile photo has been reviewed and approved by our team. It is now visible on your profile.",
        "success"
      );

      const user = users.find(u => u.id === userId);
      if (user?.email) {
        sendModerationEmail(
          user.email,
          "Kingdom Alliance - Profile Photo Approved",
          `Dear ${user.name},\n\nGreat news! Your profile photo has been reviewed and approved by our moderation team. It is now visible to the community.\n\nThank you for helping us maintain a high-standard environment for our members.\n\nBlessings,\nThe Kingdom Alliance Team`
        );
      }

      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, photoUrl: pendingUrl, pendingPhotoUrl: '', photoStatus: 'approved' as const };
        }
        return u;
      }).filter(u => !!u.pendingPhotoUrl || (u.gallery && u.gallery.some(p => p.status === 'pending'))));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectMain = async (userId: string, reason: string = 'Inappropriate or low quality') => {
    setProcessing(userId + '_main');
    try {
      await updateDoc(doc(db, 'users', userId), {
        pendingPhotoUrl: '',
        photoStatus: 'rejected',
        photoRejectionReason: reason,
        updatedAt: serverTimestamp()
      });

      await addNotification(
        userId, 
        "Photo Moderation Update", 
        "Your profile photo update could not be approved due to visibility, clarity, or community guidelines reasons. Please upload a clear, professional photo.",
        "warning"
      );

      const user = users.find(u => u.id === userId);
      if (user?.email) {
        sendModerationEmail(
          user.email,
          "Kingdom Alliance - Photo Moderation Update",
          `Dear ${user.name},\n\nWe have reviewed your profile photo update. Unfortunately, we cannot approve it at this time because it does not meet our visibility or clarity standards as outlined in our Community Guidelines.\n\nTo ensure the best experience for all members, please upload a clear, professional photo that meets these standards.\n\nThank you for your understanding.\n\nBlessings,\nThe Kingdom Alliance Team`
        );
      }

      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, pendingPhotoUrl: '', photoStatus: 'rejected' as const };
        }
        return u;
      }).filter(u => !!u.pendingPhotoUrl || (u.gallery && u.gallery.some(p => p.status === 'pending'))));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteMain = async (userId: string) => {
    if (!window.confirm("Permanently delete this user's main photo?")) return;
    setProcessing(userId + '_main_delete');
    try {
      await updateDoc(doc(db, 'users', userId), {
        photoUrl: '',
        pendingPhotoUrl: '',
        photoStatus: 'idle',
        updatedAt: serverTimestamp()
      });

      await addNotification(
        userId, 
        "Photo Removed by Moderator", 
        "Your profile photo has been removed by a moderator as it did not meet our community standards. Please upload a new photo.",
        "error"
      );

      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, photoStatus: 'idle' as const, photoUrl: '', pendingPhotoUrl: '' };
        }
        return u;
      }).filter(u => !!u.pendingPhotoUrl || (u.gallery && u.gallery.some(p => p.status === 'pending'))));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveGallery = async (userId: string, photoId: string) => {
    setProcessing(userId + '_' + photoId);
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newGallery = user.gallery.map(p => 
        p.id === photoId ? { ...p, status: 'approved' as const } : p
      );

      await updateDoc(doc(db, 'users', userId), {
        gallery: newGallery,
        updatedAt: serverTimestamp()
      });
      
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, gallery: newGallery };
        }
        return u;
      }).filter(u => !!u.pendingPhotoUrl || (u.gallery && u.gallery.some(p => p.status === 'pending'))));
      
      await addNotification(
        userId, 
        "Gallery Photo Approved", 
        "One of your gallery photos has been approved and added to your profile.",
        "success"
      );

      if (user.email) {
        sendModerationEmail(
          user.email,
          "Kingdom Alliance - Gallery Photo Approved",
          `Dear ${user.name},\n\nYour gallery photo has been approved and is now visible on your profile.\n\nThank you for being a part of Kingdom Alliance.\n\nBlessings,\nThe Kingdom Alliance Team`
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectGallery = async (userId: string, photoId: string, reason: string = 'Inappropriate content') => {
    setProcessing(userId + '_' + photoId);
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newGallery = user.gallery.map(p => 
        p.id === photoId ? { ...p, status: 'rejected' as const, rejectionReason: reason } : p
      );

      await updateDoc(doc(db, 'users', userId), {
        gallery: newGallery,
        updatedAt: serverTimestamp()
      });
      
      await addNotification(
        userId, 
        "Gallery Photo Moderation Update", 
        "A photo in your gallery could not be approved due to visibility or community guidelines. Please upload a different photo.",
        "warning"
      );

      if (user.email) {
        sendModerationEmail(
          user.email,
          "Kingdom Alliance - Gallery Photo Update",
          `Dear ${user.name},\n\nWe have reviewed the photo you added to your gallery. Unfortunately, we cannot approve it at this time because it does not meet our visibility or clarity standards as outlined in our Community Guidelines.\n\nPlease upload a different photo that meets these standards.\n\nThank you for your understanding.\n\nBlessings,\nThe Kingdom Alliance Team`
        );
      }

      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, gallery: newGallery };
        }
        return u;
      }).filter(u => !!u.pendingPhotoUrl || (u.gallery && u.gallery.some(p => p.status === 'pending'))));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteGallery = async (userId: string, photoId: string) => {
    if (!window.confirm("Delete this gallery photo permanently?")) return;
    setProcessing(userId + '_' + photoId + '_delete');
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newGallery = user.gallery.filter(p => p.id !== photoId);

      await updateDoc(doc(db, 'users', userId), {
        gallery: newGallery,
        updatedAt: serverTimestamp()
      });
      
      await addNotification(
        userId, 
        "Gallery Photo Deleted", 
        "A photo from your gallery has been removed by an admin.",
        "error"
      );

      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, gallery: newGallery };
        }
        return u;
      }).filter(u => !!u.pendingPhotoUrl || (u.gallery && u.gallery.some(p => p.status === 'pending'))));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleCompleteReview = async (userId: string) => {
    setProcessing(userId + '_complete');
    try {
      await updateDoc(doc(db, 'users', userId), {
        photoStatus: 'approved',
        updatedAt: serverTimestamp()
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
      await addNotification(
        userId, 
        "Profile Review Complete", 
        "An admin has completed the review of your latest photo updates.",
        "success"
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl text-on-surface">Photo Moderation</h1>
          <p className="text-on-surface-variant">Review and approve user profile and gallery photos</p>
        </div>
        <button 
          onClick={fetchPendingPhotos}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-xl hover:bg-surface-variant transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh Queue
        </button>
      </div>

      {users.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border-2 border-dashed border-outline-variant">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-on-surface-variant/30" />
          </div>
          <h3 className="font-headline text-2xl text-on-surface">Queue Empty</h3>
          <p className="text-on-surface-variant">No photos are currently awaiting moderation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {users.map((user) => (
            <motion.div 
              key={user.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {user.photoUrl ? (
                        <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">{user.name}</h3>
                    <p className="text-xs text-on-surface-variant">User ID: {user.id}</p>
                  </div>
                </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      Overall Status
                    </span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleCompleteReview(user.id)}
                        disabled={!!processing}
                        className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark All Complete
                      </button>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-gold/10 text-gold px-3 py-1 border border-gold/20 rounded-full flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Moderation Pending
                      </span>
                    </div>
                  </div>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Main Photo Moderation */}
                {user.pendingPhotoUrl && (
                  <div className="space-y-6">
                    <h4 className="font-label-lg text-on-surface uppercase tracking-widest flex items-center gap-2">
                      <Camera className="w-4 h-4" /> New Profile Photo
                    </h4>
                    <div className="aspect-video rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-high relative group">
                      <img src={user.pendingPhotoUrl} alt="Pending Main" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                         <button 
                           onClick={() => window.open(user.pendingPhotoUrl, '_blank')}
                           className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold"
                         >
                           View Full Size
                         </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApproveMain(user.id, user.pendingPhotoUrl!)}
                        disabled={!!processing}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" /> Approve
                      </button>
                        <button 
                          onClick={() => handleRejectMain(user.id, "Visibility, Clarity, and Community Guidelines")}
                          disabled={!!processing}
                          className="flex-1 flex items-center justify-center gap-2 py-3 border border-outline-variant text-on-surface-variant hover:bg-surface-variant rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5 text-gold" /> Reject
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Permanently delete this photo from the database?")) {
                              handleDeleteMain(user.id);
                            }
                          }}
                          disabled={!!processing}
                          className="px-4 py-3 text-error hover:bg-error/5 rounded-xl transition-all disabled:opacity-50"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                {/* Gallery Photos Moderation */}
                <div className="space-y-6">
                  <h4 className="font-label-lg text-on-surface uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Gallery Items
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {user.gallery.filter(p => p.status === 'pending').map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant group">
                        <img src={photo.url} alt="Gallery item" className="w-full h-full object-cover" />
                        {photo.status === 'pending' ? (
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleApproveGallery(user.id, photo.id)}
                              className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleRejectGallery(user.id, photo.id, "Visibility, Clarity, and Community Guidelines")}
                              className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center shadow-lg"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm("Delete this gallery photo?")) {
                                  handleDeleteGallery(user.id, photo.id);
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-error text-white flex items-center justify-center shadow-lg"
                              title="Delete Permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className={cn(
                            "absolute bottom-0 left-0 right-0 py-1 px-2 text-[8px] font-bold text-center text-white",
                            photo.status === 'approved' ? "bg-primary" : "bg-error"
                          )}>
                            {photo.status.toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                    {user.gallery.length === 0 && (
                      <p className="col-span-full py-8 text-center text-on-surface-variant text-sm border-2 border-dashed border-outline-variant rounded-xl">
                        No gallery photos
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
