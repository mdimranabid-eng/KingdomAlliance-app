import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Loader2, 
  Search,
  Check,
  X,
  AlertCircle,
  Phone,
  Ban
} from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../../lib/utils';

export default function AdminApprovals() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'), 
        where('isApproved', '==', false)
      );
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'users');
      }
      if (querySnapshot) {
        const pendingUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(pendingUsers);
      }
    } catch (err) {
      console.error("Error fetching pending users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, data: any) => {
    setProcessingId(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = (userId: string) => handleUpdateStatus(userId, { isApproved: true });
  
  const handleReject = (userId: string) => {
    const reason = prompt("Enter rejection reason:", "Profile information incomplete or invalid");
    if (reason) handleUpdateStatus(userId, { 
      isApproved: false, 
      status: 'active',
      rejectionReason: reason 
    });
  };

  const handleBlock = (userId: string) => {
    if (confirm("Are you sure you want to PERMANENTLY block this user?")) {
      handleUpdateStatus(userId, { isApproved: false, status: 'blocked' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-on-surface">Member Approvals</h1>
        <p className="text-on-surface-variant">Review and verify new profiles for the community</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl overflow-hidden shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex h-[400px] flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="font-label-lg text-on-surface-variant">Fetching pending profiles...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center text-center p-8 gap-4">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-2xl text-on-surface">No Pending Approvals</h3>
              <p className="text-on-surface-variant max-w-xs">All caught up! New registrations will appear here for review.</p>
            </div>
            <button 
              onClick={fetchPendingUsers} 
              className="px-6 py-2 border border-outline-variant rounded-xl font-label-lg hover:bg-surface-container transition-colors"
            >
              Refresh List
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 font-label-caps text-on-surface-variant text-xs uppercase tracking-widest">Profile</th>
                  <th className="px-6 py-4 font-label-caps text-on-surface-variant text-xs uppercase tracking-widest">Denomination</th>
                  <th className="px-6 py-4 font-label-caps text-on-surface-variant text-xs uppercase tracking-widest">Profession</th>
                  <th className="px-6 py-4 font-label-caps text-on-surface-variant text-xs uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                <AnimatePresence>
                  {users.map((user) => (
                    <motion.tr 
                      key={user.id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-surface-variant/10 group"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full border-2 border-primary-container overflow-hidden group-hover:scale-110 transition-transform">
                            <img 
                              src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-base font-bold text-on-surface">{user.name}</p>
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                <span className="capitalize">{user.gender}</span> • <span>{user.age} yrs</span> • <span>{user.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                <Phone className="w-3 h-3" /> {user.mobileNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-inter text-sm text-on-surface-variant">
                        {user.denomination}
                      </td>
                      <td className="px-6 py-6 font-inter text-sm text-on-surface-variant">
                        {user.profession}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            disabled={processingId === user.id}
                            onClick={() => handleApprove(user.id)}
                            className="p-2 bg-green-100 text-green-700 hover:bg-green-700 hover:text-white rounded-xl transition-all disabled:opacity-50"
                            title="Approve Profile"
                          >
                            {processingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                          </button>
                          <button 
                            disabled={processingId === user.id}
                            onClick={() => handleReject(user.id)}
                            className="p-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-xl transition-all disabled:opacity-50"
                            title="Reject Profile"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button 
                            disabled={processingId === user.id}
                            onClick={() => handleBlock(user.id)}
                            className="p-2 bg-on-surface-variant/10 text-on-surface-variant hover:bg-on-surface-variant hover:text-white rounded-xl transition-all disabled:opacity-50"
                            title="Block User"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-6 bg-surface-container rounded-3xl border border-outline-variant flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-primary flex-shrink-0" />
        <div className="space-y-1">
          <p className="font-label-lg text-on-surface">Review Guidelines</p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Ensure the profile photo is clear and respectful. Review the denomination and church details to maintain community integrity.
            Profiles rejected will not be visible to other members.
          </p>
        </div>
      </div>
    </div>
  );
}
