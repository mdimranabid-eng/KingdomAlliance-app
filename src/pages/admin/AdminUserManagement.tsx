import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, serverTimestamp, where, orderBy, limit, deleteDoc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Mail, ShieldAlert, Edit, Trash2, Filter, MoreVertical, CheckCircle, XCircle, Ban, Phone, Database, Loader2, Clock, Download, Info, ShieldCheck, Heart, Church, GraduationCap, Briefcase, Ruler, Activity, Quote, Users, Printer, Eye, UserX, UserCheck } from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { seedTestData } from '../../lib/seeder';
import { generateBiodataPDF } from '../../lib/BiodataGenerator';
import AdminUserDetailModal from '../../components/admin/AdminUserDetailModal';
import { deleteFromCloudinary } from '../../lib/cloudinary';

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
  
  partnerPreferences?: {
    ageMin: string;
    ageMax: string;
    heightMin?: string;
    heightMax?: string;
    maritalStatus: string[];
    denominations: string[];
    motherTongue?: string[];
    educationLevel: string;
    employmentStatus?: string;
    dietaryHabits?: string;
    drinkingHabits?: string;
    smokingHabits?: string;
    country?: string;
    city?: string;
    relocationPreference?: string;
  };
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSeedConfirm = async () => {
    setShowSeedConfirm(false);
    setSeeding(true);
    try {
      const count = await seedTestData();
      showToast(`Successfully seeded ${count} test profiles!`, 'success');
      fetchUsers(); // Refresh list
    } catch (err: any) {
      showToast("Seeding failed: " + err.message, 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleSeed = () => setShowSeedConfirm(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // For now we fetch all, or we could add search/filter query
      const q = query(usersRef, orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserProfile));
      setUsers(docs);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: UserProfile['status']) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
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
      
      const response = await fetch('http://localhost:3001/api/admin/delete-user', {
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
        // 1. Fetch Cloudinary config credentials from Firestore setting
        const configDoc = await getDoc(doc(db, 'settings', 'site_config'));
        let cloudName = '';
        let apiKey = '';
        let apiSecret = '';
        if (configDoc.exists()) {
          const data = configDoc.data();
          cloudName = data.cloudinaryCloudName || '';
          apiKey = data.cloudinaryApiKey || '';
          apiSecret = data.cloudinaryApiSecret || '';
        }

        // 2. Programmatically delete Cloudinary assets if config is available
        if (cloudName && apiKey && apiSecret) {
          const urlsToDelete = new Set<string>();
          if (selectedUser.photoUrl) urlsToDelete.add(selectedUser.photoUrl);
          if (selectedUser.pendingPhotoUrl) urlsToDelete.add(selectedUser.pendingPhotoUrl);
          if (Array.isArray(selectedUser.gallery)) {
            selectedUser.gallery.forEach((p: any) => {
              if (p && p.url) urlsToDelete.add(p.url);
            });
          }

          // Delete each Cloudinary URL
          for (const url of urlsToDelete) {
            if (url && url.includes('cloudinary.com')) {
              try {
                await deleteFromCloudinary(url, cloudName, apiKey, apiSecret);
              } catch (cloudinaryErr) {
                console.error(`[Admin Delete Fallback] Failed Cloudinary asset purge: ${url}`, cloudinaryErr);
              }
            }
          }
        }

        // 3. Purge all Documents in /interests where fromId == targetUserUid or toId == targetUserUid
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
      }
    } finally {
      setDeletingUser(false);
    }
  };

  const filteredUsers = users.filter(u => {
    // Exclude users awaiting approval as they belong in the Approvals page
    if (u.approvalStatus === 'pending' || !u.isApproved) {
      return false;
    }
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl text-on-surface">User Management</h1>
          <p className="text-on-surface-variant">Search, edit, and manage user accounts</p>
        </div>
        <button 
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-6 py-3 bg-secondary-container text-on-secondary-container rounded-2xl font-bold hover:bg-secondary-container/80 transition-all disabled:opacity-50 shadow-sm"
        >
          {seeding ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Seeding...</>
          ) : (
            <><Database className="w-5 h-5" /> Seed Test Data</>
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-container-low p-4 rounded-3xl border border-outline-variant">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-on-surface-variant ml-2" />
          <select 
            value={filterStatus}
            onChange={(e: any) => setFilterStatus(e.target.value)}
            className="flex-1 px-4 py-3 bg-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">Photos</th>
                <th className="px-6 py-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-variant/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container">
                          <img 
                            src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                            className="w-full h-full object-cover" 
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{user.name}</p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                        user.profileType === 'bride' ? "bg-secondary-container/10 text-secondary-container" : "bg-primary-container/10 text-primary-container"
                      )}>
                        {user.profileType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 w-fit",
                        user.status === 'active' ? "bg-green-100 text-green-700" : 
                        user.status === 'suspended' ? "bg-gold/10 text-gold" : "bg-error/10 text-error"
                      )}>
                        <div className="w-1 h-1 rounded-full bg-current" />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.photoStatus === 'pending' || (user.gallery && user.gallery.some((p: any) => p.status === 'pending')) ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1 w-fit animate-pulse">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      ) : user.photoStatus === 'rejected' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-error/10 text-error rounded-full flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button 
                            onClick={() => generateBiodataPDF(user)}
                            className="p-2.5 bg-[#0d9488] text-white rounded-xl hover:bg-[#0f766e] hover:scale-110 active:scale-95 transition-all shadow-sm group relative"
                            title="Print Biodata"
                          >
                            <Printer className="w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Print Biodata</span>
                          </button>
                          
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="p-2.5 bg-[#2563eb] text-white rounded-xl hover:bg-[#1d4ed8] hover:scale-110 active:scale-95 transition-all shadow-sm group relative"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">View Details</span>
                          </button>
                          
                          <button 
                            onClick={() => handleUpdateStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                            className={cn(
                              "p-2.5 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm group relative",
                              user.status === 'active' ? "bg-[#dc2626] hover:bg-[#b91c1c]" : "bg-[#d97706] hover:bg-[#c2410c]"
                            )}
                            title={user.status === 'active' ? 'Suspend User' : 'Re-activate User'}
                          >
                            {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                              {user.status === 'active' ? 'Suspend User' : 'Re-activate User'}
                            </span>
                          </button>

                          <button 
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2.5 bg-[#ef4444] text-white rounded-xl hover:bg-[#dc2626] hover:scale-110 active:scale-95 transition-all shadow-sm group relative"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                              Delete User
                            </span>
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
        onUpdateStatus={handleUpdateStatus}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      {/* Permanent Deletion Confirmation [Point 4] */}
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
              className="relative w-full max-w-md bg-surface-container-lowest rounded-[2rem] p-8 shadow-2xl border border-error/20"
            >
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-8 h-8 text-error" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline text-2xl text-on-surface font-semibold text-error">User Data will be Permanently Deleted</h3>
                  <div className="text-sm text-on-surface-variant space-y-4 pt-4 text-left bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
                    <p className="font-bold text-error uppercase tracking-widest text-[10px]">Cascading Deletion Process will purge:</p>
                    <ul className="space-y-2 list-disc pl-4 font-medium text-xs">
                      <li>Personal Profile Details & Document `/users`</li>
                      <li>Cloudinary profile images and active gallery</li>
                      <li>All sent & received connection `/interests`</li>
                      <li>User bookmarks & `/shortlists` mappings</li>
                      <li>All peer-to-peer `/chats` & nested messaging history</li>
                    </ul>
                    <p className="text-[11px] font-semibold text-on-surface-variant mt-2">This operation is irreversible.</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    disabled={deletingUser}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 bg-surface-container text-on-surface rounded-xl font-bold hover:bg-surface-variant transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={deletingUser}
                    onClick={handleDeleteUser}
                    className="flex-1 py-3 bg-error text-white rounded-xl font-bold hover:bg-error/80 transition-all shadow-lg shadow-error/20 flex items-center justify-center gap-2"
                  >
                    {deletingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Proceed'}
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
              "fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md font-semibold text-sm",
              notification.type === 'success' 
                ? "bg-[#15803d]/90 text-white border-green-500/20" 
                : "bg-error/90 text-white border-error-container/20"
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

      {/* Custom Seed Confirmation Modal */}
      <AnimatePresence>
        {showSeedConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !seeding && setShowSeedConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl z-10 text-center"
            >
              <div className="w-16 h-16 bg-secondary-container/20 rounded-full flex items-center justify-center text-secondary mx-auto mb-6">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#040e2a]">Seed Test Data?</h3>
              <p className="text-on-surface-variant mt-4 leading-relaxed">
                This will add 20 dummy matrimonial profiles to your database. Would you like to continue?
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  disabled={seeding}
                  onClick={() => setShowSeedConfirm(false)}
                  className="px-6 py-3 rounded-xl font-bold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  disabled={seeding}
                  onClick={handleSeedConfirm}
                  className="px-6 py-3 bg-[#004b87] text-white rounded-xl font-bold hover:bg-[#003a6a] transition-all flex items-center justify-center gap-2"
                >
                  {seeding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, colSpan = 1 }: { label: string, value: any, colSpan?: number }) {
  if (!value) return null;
  const spanClass = colSpan === 2 ? "col-span-2" : colSpan === 3 ? "col-span-1 md:col-span-3" : "";
  return (
    <div className={cn("space-y-1", spanClass)}>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
      <p className="font-medium text-on-surface text-sm">{value}</p>
    </div>
  );
}
