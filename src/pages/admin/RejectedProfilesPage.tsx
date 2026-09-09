import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, serverTimestamp, getDoc, deleteDoc, where, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Trash2, CheckCircle, XCircle, Ban, Loader2, Clock, Eye, UserCheck, Check, MapPin, ArrowLeft } from 'lucide-react';
import { cn, handleFirestoreError, OperationType, calculateAge } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import AdminUserDetailModal from '../../components/admin/AdminUserDetailModal';

const BACKEND_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_BACKEND_URL || '');

interface UserProfile {
  id: string;
  uid: string;
  name: string;
  middleName?: string;
  lastName?: string;
  email: string;
  profileType: 'bride' | 'groom';
  status: 'active' | 'suspended' | 'blocked';
  isApproved: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  mobileNumber?: string;
  createdAt: any;
  photoUrl?: string;
  photoStatus?: 'pending' | 'approved' | 'rejected' | 'none';
  pendingPhotoUrl?: string;
  gallery?: any[];
  
  // Detailed Fields
  age?: string;
  dob?: string;
  gender?: string;
  citizenship?: string;
  countryLiving?: string;
  cityLiving?: string;
  maritalStatus?: string;
  noOfChildren?: string;
  height?: string;
  weight?: string;
  bodyType?: string;
  complexion?: string;
  physicalStatus?: string;
  physicalStatusDesc?: string;
  
  // Faith
  denomination?: string;
  faithBackground?: string;
  churchName?: string;
  churchAddress?: string;
  diocese?: string;
  baptized?: string;
  baptismYear?: string;
  spiritualInvolvement?: string[];
  spiritualGifts?: string;
  
  // Education & Professional
  education?: string;
  fieldOfStudy?: string;
  college?: string;
  profession?: string;
  employmentType?: string;
  annualIncome?: string;
  
  // Family Background
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  noOfSiblings?: string;
  fathersName?: string;
  fathersOccupation?: string;
  mothersName?: string;
  mothersOccupation?: string;
  numberOfSiblings?: string;
  familyType?: string;
  familyFaith?: string;

  // Lifestyle & Hobbies
  motherTongue?: string | string[];
  languagesKnown?: string[];
  dietaryHabits?: string;
  drinkingHabits?: string;
  smokingHabits?: string;
  hobbies?: string[];
  
  // Contact
  address?: string;
  aboutMe?: string;
}

export default function RejectedProfilesPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  // Modal configurations
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [approvingUser, setApprovingUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Retrieve the last 200 users, filter client-side for absolute reliability
      const q = query(usersRef, orderBy('createdAt', 'desc'), limit(200));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => {
        const data = d.data();
        const age = String(calculateAge(data.dob, data.age));
        return { id: d.id, ...data, age } as UserProfile;
      });
      
      // Filter for suspended or rejected profiles
      const filtered = docs.filter(u => 
        u.status === 'suspended' || 
        u.photoStatus === 'rejected' || 
        u.approvalStatus === 'rejected'
      );
      setUsers(filtered);
    } catch (err) {
      console.error("Error fetching rejected/suspended users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApproveUser = async () => {
    if (!selectedUser) return;
    setApprovingUser(true);
    const targetUserId = selectedUser.id;
    
    // Optimistically update frontend state
    setUsers(prev => prev.filter(u => u.id !== targetUserId));
    
    try {
      const currentAdminId = auth.currentUser?.uid || 'system';
      await updateDoc(doc(db, 'users', targetUserId), {
        isApproved: true,
        status: 'active',
        photoStatus: 'approved',
        approvalStatus: 'approved',
        approvedBy: currentAdminId,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        'notifications': [
          {
            id: crypto.randomUUID(),
            title: 'Profile Approved',
            message: 'Congratulations! Your profile has been reviewed and reactivated.',
            type: 'system',
            createdAt: new Date().toISOString(),
            read: false
          }
        ]
      });

      setSelectedUser(null);
      setShowApproveConfirm(false);
    } catch (err) {
      console.error("Error activating rejected user:", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUserId}`);
      // Refresh list to restore state on fail
      fetchUsers();
    } finally {
      setApprovingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeletingUser(true);
    const targetUserId = selectedUser.id;
    const targetUserUid = selectedUser.uid || selectedUser.id;

    // Optimistically update frontend state for instant disappearance
    setUsers(prev => prev.filter(u => u.id !== targetUserId));
    setSelectedUser(null);
    setShowDeleteConfirm(false);

    try {
      console.log(`[Admin Delete] Calling secure Admin SDK cascading delete API for: ${targetUserUid}`);
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/admin/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ uid: targetUserUid })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server deletion endpoint returned failure status.');
      }

      const resJson = await response.json();
      console.log('[Admin Delete] Secure Admin SDK purge successfully completed.', resJson.logs);
      showToast("User account and all authentication credentials have been permanently deleted.", 'success');
    } catch (apiErr: any) {
      console.warn("[Admin Delete] Admin SDK API unreachable or failed. Invoking client-side database cascading fallback...", apiErr.message);
      
      // FALLBACK WORKFLOW: Perform client-side cascade deletions directly if the local Express API is not running
      try {
        // 1. Purge all Documents in /interests where fromId == targetUserUid or toId == targetUserUid
        const interestsQueryFrom = query(collection(db, 'interests'), where('fromId', '==', targetUserUid));
        const interestsQueryTo = query(collection(db, 'interests'), where('toId', '==', targetUserUid));
        const [interestsFromSnap, interestsToSnap] = await Promise.all([
          getDocs(interestsQueryFrom),
          getDocs(interestsQueryTo)
        ]);
        const interestDeletions = [
          ...interestsFromSnap.docs.map(d => deleteDoc(d.ref)),
          ...interestsToSnap.docs.map(d => deleteDoc(d.ref))
        ];
        await Promise.all(interestDeletions);

        // 4. Purge all Documents in /shortlists where userId == targetUserUid or targetId == targetUserUid
        const shortlistsQueryUser = query(collection(db, 'shortlists'), where('userId', '==', targetUserUid));
        const shortlistsQueryTarget = query(collection(db, 'shortlists'), where('targetId', '==', targetUserUid));
        const [shortlistsUserSnap, shortlistsTargetSnap] = await Promise.all([
          getDocs(shortlistsQueryUser),
          getDocs(shortlistsQueryTarget)
        ]);
        const shortlistDeletions = [
          ...shortlistsUserSnap.docs.map(d => deleteDoc(d.ref)),
          ...shortlistsTargetSnap.docs.map(d => deleteDoc(d.ref))
        ];
        await Promise.all(shortlistDeletions);

        // 5. Purge Chats and Subcollection Messages
        const uniqueChatIds = new Set<string>();
        const allRelatedInterests = [...interestsFromSnap.docs, ...interestsToSnap.docs];
        allRelatedInterests.forEach(docSnap => {
          const data = docSnap.data();
          if (data.fromId && data.toId) {
            const cid = [data.fromId, data.toId].sort().join('_');
            uniqueChatIds.add(cid);
          }
        });

        for (const cid of uniqueChatIds) {
          const messagesCollectionRef = collection(db, `chats/${cid}/messages`);
          const messagesSnap = await getDocs(messagesCollectionRef);
          const messageDeletions = messagesSnap.docs.map(d => deleteDoc(d.ref));
          await Promise.all(messageDeletions);
          await deleteDoc(doc(db, 'chats', cid));
        }

        // 6. Delete photoModeration documents for this user
        const moderationQuery = query(collection(db, 'photoModeration'), where('userId', '==', targetUserUid));
        const moderationSnap = await getDocs(moderationQuery);
        const moderationDeletions = moderationSnap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(moderationDeletions);

        // 7. Delete main user document from /users
        await deleteDoc(doc(db, 'users', targetUserId));
        
        showToast("User account and related database entries deleted via client fallback.", 'success');
      } catch (fallbackErr) {
        console.error("[Admin Delete Fallback] Complete deletion failure:", fallbackErr);
        handleFirestoreError(fallbackErr, OperationType.DELETE, `users/${targetUserId}`);
        // Restore user to page view if deletion completely fails
        fetchUsers();
      }
    } finally {
      setDeletingUser(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/admin/approvals')}
            className="mt-1 p-2 hover:bg-[#1a2e4a]/5 rounded-full transition-colors text-[#64748b]"
            title="Back to Approvals"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-tight">Rejected Profiles</h1>
            <p className="text-sm text-[#64748b] mt-0.5">Review, reinstate, or permanently delete rejected or suspended user accounts</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="admin-card p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-[13px] ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[#1a2e4a]/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead className="border-b border-black/[0.04]">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Photos</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1a2e4a] mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-[#64748b]">
                    No rejected or suspended profiles found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#f1f5f9] ring-1 ring-black/[0.04]">
                          <img 
                            src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                            className="w-full h-full object-cover" 
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#0f172a]">{user.name}</p>
                          <p className="text-[11px] text-[#64748b]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        user.profileType === 'bride' ? "bg-pink-50 text-pink-700" : "bg-blue-50 text-blue-700"
                      )}>
                        {user.profileType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                       <span className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md inline-flex items-center gap-1",
                        user.status === 'active' ? "bg-emerald-50 text-emerald-700" : 
                        user.status === 'suspended' ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                      )}>
                        <div className="w-1 h-1 rounded-full bg-current" />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.photoStatus === 'pending' || (user.gallery && user.gallery.some((p: any) => p.status === 'pending')) ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      ) : user.photoStatus === 'rejected' ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-red-50 text-red-700 rounded-md inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 text-[#1a2e4a] hover:bg-[#1a2e4a]/5 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setShowApproveConfirm(true);
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Approve User"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      <AdminUserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        actions={
          selectedUser && (
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowApproveConfirm(true)}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 shadow-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )
        }
      />

      {/* Approve Confirmation Modal */}
      <AnimatePresence>
        {showApproveConfirm && selectedUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !approvingUser && setShowApproveConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl ring-1 ring-black/[0.06] z-10"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-5">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f172a] text-center">Approve Profile?</h3>
              <p className="text-sm text-[#64748b] mt-2 text-center leading-relaxed">
                Reactivate <strong className="text-[#0f172a]">{selectedUser.name}</strong>'s profile? They will regain access to the platform.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  disabled={approvingUser}
                  onClick={() => setShowApproveConfirm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={approvingUser}
                  onClick={handleApproveUser}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  {approvingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permanent Deletion Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deletingUser && setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl ring-1 ring-black/[0.06] z-10"
            >
              <div className="h-1.5 bg-gradient-to-r from-red-500 to-red-700 -mx-8 -mt-8 rounded-t-[2rem]" />
              <div className="text-center space-y-5 mt-4">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#0f172a]">Permanently Delete User</h3>
                  <div className="text-[13px] text-[#64748b] space-y-3 pt-3 text-left bg-[#f8fafc] p-4 rounded-xl ring-1 ring-black/[0.04]">
                    <p className="font-semibold text-red-600 text-[11px] uppercase tracking-wider">Cascading deletion will purge:</p>
                    <ul className="space-y-1.5 list-disc pl-3 text-[12px]">
                      <li>Profile details &amp; document <code className="bg-white px-1 rounded text-[#0f172a]">/users</code></li>
                      <li>Cloudinary images &amp; gallery</li>
                      <li>All <code className="bg-white px-1 rounded text-[#0f172a]">/interests</code> connections</li>
                      <li>Shortlists &amp; bookmarks</li>
                      <li>Chat history &amp; messages</li>
                    </ul>
                    <p className="text-[11px] font-medium text-[#94a3b8] pt-1">This operation is irreversible.</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    disabled={deletingUser}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 bg-[#f1f5f9] text-[#0f172a] rounded-xl text-[13px] font-medium hover:bg-[#e2e8f0] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={deletingUser}
                    onClick={handleDeleteUser}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-[13px] font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                  >
                    {deletingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proceed'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 backdrop-blur-md font-medium text-[13px]",
              notification.type === 'success' 
                ? "bg-emerald-600/95 text-white border-emerald-500/20" 
                : "bg-red-500/95 text-white border-red-400/20"
            )}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-200" />
            ) : (
              <XCircle className="w-5 h-5 text-error-container" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
