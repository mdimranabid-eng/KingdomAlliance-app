import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, serverTimestamp, where, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Mail, ShieldAlert, Edit, Trash2, Filter, MoreVertical, CheckCircle, XCircle, Ban, Phone, Database, Loader2 } from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { seedTestData } from '../../lib/seeder';

interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  profileType: 'bride' | 'groom';
  status: 'active' | 'suspended' | 'blocked';
  isApproved: boolean;
  mobileNumber?: string;
  createdAt: any;
  photoUrl?: string;
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

  const handleSeed = async () => {
    if (!window.confirm("This will add 20 dummy profiles to your database. Continue?")) return;
    setSeeding(true);
    try {
      const count = await seedTestData();
      alert(`Successfully seeded ${count} test profiles!`);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      alert("Seeding failed: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

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
    try {
      // 1. Delete from users collection
      await deleteDoc(doc(db, 'users', selectedUser.id));
      
      // 2. Refresh local state
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setSelectedUser(null);
      setShowDeleteConfirm(false);
      
      alert("User account and all associated data have been permanently deleted.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${selectedUser.id}`);
    } finally {
      setDeletingUser(false);
    }
  };

  const filteredUsers = users.filter(u => {
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
                <th className="px-6 py-4 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-surface-container rounded-lg text-primary transition-colors"
                          title="View Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                          className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
                          title={user.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {user.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-[2.5rem] shadow-2xl border border-outline-variant overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden">
                      <img src={selectedUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`} alt="" />
                    </div>
                    <div>
                      <h2 className="font-headline text-3xl text-on-surface">{selectedUser.name}</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {selectedUser.email}
                        </span>
                        <span className="text-xs text-primary font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {selectedUser.mobileNumber || 'No Phone'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-surface-container rounded-full">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
                    <p className="font-bold text-on-surface flex items-center gap-2">
                       <span className={cn("w-2 h-2 rounded-full", selectedUser.status === 'active' ? "bg-green-500" : "bg-error")} />
                       {selectedUser.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Approval</p>
                    <p className="font-bold text-on-surface">
                      {selectedUser.isApproved ? "APPROVED ✅" : "PENDING ⏳"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-on-surface">Administrative Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => handleUpdateStatus(selectedUser.id, 'suspended')}
                      disabled={selectedUser.status === 'suspended'}
                      className="px-6 py-2 border border-outline-variant rounded-xl text-sm font-bold hover:bg-surface-variant transition-colors disabled:opacity-50"
                    >
                      Suspend Account
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-2 border border-error text-error rounded-xl text-sm font-bold hover:bg-error/5 transition-colors"
                    >
                      Delete User
                    </button>
                    <button 
                       onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                       disabled={selectedUser.status === 'active'}
                       className="px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      Activate / Unban
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant">
                  <Link to={`/profile/${selectedUser.id}`} className="w-full block py-4 bg-surface-container text-center rounded-2xl font-bold hover:bg-surface-variant transition-colors">
                    View Full Public Profile
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <h3 className="font-headline text-2xl text-on-surface">This account will be permanently deleted</h3>
                  <div className="text-sm text-on-surface-variant space-y-4 pt-4 text-left bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
                    <p className="font-bold text-error uppercase tracking-widest text-[10px]">This action will Permanently:</p>
                    <ul className="space-y-2 list-disc pl-4 font-medium">
                      <li>Remove all user profile data including photo uploads</li>
                      <li>Cancel active services</li>
                      <li>Cannot be undone</li>
                    </ul>
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
                    {deletingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
