import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, serverTimestamp, where, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Mail, ShieldAlert, Edit, Trash2, Filter, MoreVertical, CheckCircle, XCircle, Ban, Phone, Database, Loader2, Clock, Download, Info, ShieldCheck, Heart, Church, GraduationCap, Briefcase, Ruler, Activity, Quote, Users, Printer, Eye, UserX, UserCheck } from 'lucide-react';
import { cn, handleFirestoreError, OperationType } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { seedTestData } from '../../lib/seeder';
import { generateBiodataPDF } from '../../lib/BiodataGenerator';

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
              className="relative w-full max-w-2xl max-h-[90vh] bg-surface-container-lowest rounded-[2.5rem] shadow-2xl border border-outline-variant flex flex-col overflow-hidden"
            >
              {/* Sticky Header with Action Button */}
              <div className="sticky top-0 z-20 bg-surface-container-lowest p-8 pb-4 border-b border-outline-variant/50 backdrop-blur-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden">
                      <img src={selectedUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`} alt="" />
                    </div>
                    <div>
                      <h2 className="font-headline text-3xl text-on-surface">{selectedUser.name} {selectedUser.lastName}</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-on-surface-variant flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-surface-variant rounded-md border border-outline-variant text-[10px] font-bold uppercase tracking-wider">
                            {selectedUser.profileType}
                          </span>
                          {selectedUser.gender} • {selectedUser.age} Years
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => generateBiodataPDF(selectedUser)}
                      className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-xl text-sm font-bold hover:bg-gold/20 transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Biodata (PDF)
                    </button>
                    <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="overflow-y-auto flex-1 p-8 pt-4 space-y-8">

                  {/* Admin-only Privileged Section */}
                <div className="p-8 bg-primary/[0.03] rounded-[2.5rem] border-2 border-primary/10 shadow-sm space-y-6 w-full box-border overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold uppercase tracking-[0.2em] text-[10px]">Admin-only Confidential Details</h3>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-tighter">Secure View</span>
                  </div>
                  
                  <div className="flex flex-col w-full">
                    {/* Email Row */}
                    <div className="flex items-start gap-4 pb-[10px] border-b border-primary/5">
                      <p className="flex-[0_0_auto] min-w-[140px] text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest pt-2">Email Address</p>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-lg flex items-center gap-3 whitespace-normal break-words overflow-wrap-break-word">
                          <Mail className="w-5 h-5 text-primary/60 flex-shrink-0" /> 
                          <span className="break-all">{selectedUser.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Mobile Row */}
                    <div className="flex items-start gap-4 py-[10px] border-b border-primary/5">
                      <p className="flex-[0_0_auto] min-w-[140px] text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest pt-2">Verified Mobile</p>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-lg flex items-center gap-3 whitespace-normal break-words overflow-wrap-break-word">
                          <Phone className="w-5 h-5 text-primary/60 flex-shrink-0" /> 
                          <span>{selectedUser.mobileNumber || 'Not Provided'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Address Row */}
                    {selectedUser.address && (
                      <div className="flex items-start gap-4 pt-[10px]">
                        <p className="flex-[0_0_auto] min-w-[140px] text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest pt-1">Residential Address</p>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-on-surface leading-relaxed whitespace-normal break-words overflow-wrap-break-word">
                            {selectedUser.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {/* Basic & Personal */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Info className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">Personal Details</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <DetailItem label="Full Name" value={`${selectedUser.name} ${selectedUser.middleName || ''} ${selectedUser.lastName || ''}`} colSpan={2} />
                      <DetailItem label="Age" value={`${selectedUser.age} Years`} />
                      <DetailItem label="DOB" value={selectedUser.dob} />
                      <DetailItem label="Gender" value={selectedUser.gender} />
                      <DetailItem label="Marital Status" value={selectedUser.maritalStatus} />
                      <DetailItem label="Height" value={selectedUser.height} />
                      <DetailItem label="Weight" value={selectedUser.weight ? `${selectedUser.weight} kg` : 'N/A'} />
                      <DetailItem label="Body Type" value={selectedUser.bodyType} />
                      <DetailItem label="Complexion" value={selectedUser.complexion} />
                      <DetailItem label="Physical Status" value={selectedUser.physicalStatus} colSpan={2} />
                      {selectedUser.physicalStatusDesc && <DetailItem label="Disability Info" value={selectedUser.physicalStatusDesc} colSpan={2} />}
                      <DetailItem label="Mother Tongue" value={Array.isArray(selectedUser.motherTongue) ? selectedUser.motherTongue.join(', ') : selectedUser.motherTongue} />
                      <DetailItem label="Citizenship" value={selectedUser.citizenship} />
                    </div>
                  </div>

                  {/* Faith */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Church className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">Faith Background</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <DetailItem label="Denomination" value={selectedUser.denomination} />
                      <DetailItem label="Baptized" value={selectedUser.baptized} />
                      <DetailItem label="Church" value={selectedUser.churchName} colSpan={2} />
                      <DetailItem label="Diocese" value={selectedUser.diocese} colSpan={2} />
                      <DetailItem label="Spiritual Involvement" value={selectedUser.spiritualInvolvement?.join(', ') || 'None'} colSpan={2} />
                      <DetailItem label="Spiritual Gifts" value={selectedUser.spiritualGifts} colSpan={2} />
                      <DetailItem label="Faith Background" value={selectedUser.faithBackground} colSpan={2} />
                    </div>
                  </div>

                  {/* Family Details (Added per request) */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">Family Background</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <DetailItem label="Father's Name" value={selectedUser.fatherName} />
                      <DetailItem label="Father's Job" value={selectedUser.fatherOccupation} />
                      <DetailItem label="Mother's Name" value={selectedUser.motherName} />
                      <DetailItem label="Mother's Job" value={selectedUser.motherOccupation} />
                      <DetailItem label="Siblings" value={selectedUser.noOfSiblings} />
                      <DetailItem label="Family Type" value={selectedUser.familyType} />
                      <DetailItem label="Family Faith" value={selectedUser.familyFaith} colSpan={2} />
                    </div>
                  </div>

                  {/* Lifestyle & Hobbies */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">Lifestyle & Hobbies</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <DetailItem label="Dietary Habits" value={selectedUser.dietaryHabits} />
                      <DetailItem label="Drinking" value={selectedUser.drinkingHabits} />
                      <DetailItem label="Smoking" value={selectedUser.smokingHabits} />
                      <DetailItem label="Languages" value={selectedUser.languagesKnown?.join(', ') || 'N/A'} />
                      <DetailItem label="Hobbies / Interests" value={selectedUser.hobbies?.join(', ') || 'None'} colSpan={2} />
                    </div>
                  </div>

                  {/* About & Summary */}
                  <div className="col-span-full space-y-5">
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Quote className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">About Me</h4>
                    </div>
                    <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant italic text-on-surface-variant leading-relaxed">
                      {selectedUser.aboutMe || 'No description provided.'}
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="col-span-full space-y-5">
                    <div className="flex items-center gap-2 text-secondary">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Heart className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wider">Partner Preferences</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-secondary/5 rounded-3xl border border-secondary/20">
                      <DetailItem label="Age Range" value={`${selectedUser.partnerPreferences?.ageMin} - ${selectedUser.partnerPreferences?.ageMax} Years`} />
                      <DetailItem label="Height Range" value={`${selectedUser.partnerPreferences?.heightMin} - ${selectedUser.partnerPreferences?.heightMax} ft`} />
                      <DetailItem label="Marital Status" value={selectedUser.partnerPreferences?.maritalStatus?.join(', ') || 'Any'} />
                      <DetailItem label="Denominations" value={selectedUser.partnerPreferences?.denominations?.join(', ') || 'Any'} />
                      <DetailItem label="Education" value={selectedUser.partnerPreferences?.educationLevel || 'Any'} />
                      <DetailItem label="Employment" value={selectedUser.partnerPreferences?.employmentStatus || 'Any'} />
                      <DetailItem label="Location" value={`${selectedUser.partnerPreferences?.city || 'Any City'}, ${selectedUser.partnerPreferences?.country || 'Any Country'}`} />
                      <DetailItem label="Relocation" value={selectedUser.partnerPreferences?.relocationPreference || 'Any'} />
                      <DetailItem label="Diet/Drink/Smoke" value={`${selectedUser.partnerPreferences?.dietaryHabits || 'Any'} / ${selectedUser.partnerPreferences?.drinkingHabits || 'Any'} / ${selectedUser.partnerPreferences?.smokingHabits || 'Any'}`} />
                    </div>
                  </div>
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
