import React, { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, updateDoc, arrayRemove, collection, query, where, getDocs, deleteField } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldX, UserMinus, ShieldAlert, MapPin, Church } from 'lucide-react';

interface BlockedUser {
  uid: string;
  name: string;
  photoUrl?: string;
  denomination?: string;
  location?: string;
}

export default function BlockedUsersList() {
  const { user: currentUser } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const blockedUids = userData.blockedUsers || [];
        
        if (blockedUids.length === 0) {
          setBlockedUsers([]);
          setLoading(false);
          return;
        }

        try {
          const profiles = await Promise.all(
            blockedUids.map(async (uid: string) => {
              const profileSnap = await getDoc(doc(db, 'users', uid));
              if (profileSnap.exists()) {
                const data = profileSnap.data();
                const name = data.name || data.displayName || 'Kingdom Alliance Member';
                return {
                  uid: profileSnap.id,
                  name,
                  photoUrl: data.photoUrl || data.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
                  denomination: data.denomination,
                  location: data.city || data.location
                } as BlockedUser;
              }
              return null;
            })
          );
          setBlockedUsers(profiles.filter((p): p is BlockedUser => p !== null));
        } catch (err) {
          console.error("Error fetching blocked user profiles:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }, (error) => {
      console.error("Error listening to user settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleUnblock = async (targetUid: string) => {
    if (!currentUser) return;
    setUnblockingId(targetUid);
    
    // UI Update: Immediately update local state for absolute responsiveness
    setBlockedUsers(prev => prev.filter(u => u.uid !== targetUid));

    try {
      // 1. Remove from blockedUsers array
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        blockedUsers: arrayRemove(targetUid)
      });

      // 2. Restore interest to accepted
      const interestsRef = collection(db, 'interests');
      const q1 = query(interestsRef, where('fromId', '==', currentUser.uid), where('toId', '==', targetUid));
      const q2 = query(interestsRef, where('fromId', '==', targetUid), where('toId', '==', currentUser.uid));
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const interestDoc = snap1.docs[0] || snap2.docs[0];
      if (interestDoc) {
        await updateDoc(interestDoc.ref, {
          status: 'accepted',
          blocked: deleteField(),
          declinedBy: deleteField()
        });
      }

      toast.success('User unblocked and connection restored');
    } catch (err) {
      console.error("Error unblocking user:", err);
      toast.error('Failed to unblock user');
      // Natural refresh will happen via onSnapshot in case of error
    } finally {
      setUnblockingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Loading blocked users list...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldX className="w-7 h-7 text-error" /> Blocked Users
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Manage members you have blocked. Blocked users cannot view your profile or message you.
          </p>
        </div>
        <span className="self-start md:self-auto bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
          {blockedUsers.length} Blocked
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {blockedUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-850">Your block list is empty</h3>
            <p className="text-slate-500 mt-1 text-xs max-w-xs">
              No members are currently blocked. You can block users directly from their profiles if needed.
            </p>
          </motion.div>
        ) : (
          <div className="divide-y divide-slate-100">
            {blockedUsers.map((user) => (
              <motion.div
                key={user.uid}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="py-5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-slate-850 hover:text-primary transition-colors text-base">{user.name}</h4>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1">
                      {user.denomination && (
                        <>
                          <span className="flex items-center gap-1">
                            <Church className="w-3.5 h-3.5" />
                            {user.denomination}
                          </span>
                          <span className="text-slate-300">•</span>
                        </>
                      )}
                      {user.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {user.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  disabled={unblockingId === user.uid}
                  onClick={() => handleUnblock(user.uid)}
                  className="px-4 py-2 bg-slate-50 text-slate-700 hover:bg-error/10 hover:text-error rounded-xl font-bold text-xs border border-slate-200 hover:border-error/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {unblockingId === user.uid ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserMinus className="w-3.5 h-3.5" />
                  )}
                  <span>Unblock</span>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
