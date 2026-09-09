import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, serverTimestamp, where, orderBy, limit, deleteDoc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Mail, ShieldAlert, Edit, Trash2, Filter, MoreVertical, CheckCircle, XCircle, Ban, Phone, Database, Loader2, Clock, Download, Info, ShieldCheck, Heart, Church, GraduationCap, Briefcase, Ruler, Activity, Quote, Users, Eye, UserX, UserCheck, Printer, ArrowLeft } from 'lucide-react';
import { cn, handleFirestoreError, OperationType, calculateAge, parseFirestoreDate } from '../../lib/utils';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
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
  status: 'active' | 'suspended' | 'blocked' | 'inactive';
  isApproved: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  mobileNumber?: string;
  createdAt: any;
  lastLoginAt?: any;
  photoUrl?: string;
  photoStatus?: 'pending' | 'approved' | 'rejected' | 'none';
  pendingPhotoUrl?: string;
  gallery?: any[];
  lastActive?: any;
  updatedAt?: any;
  
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
  churchCity?: string;
  churchArea?: string;
  pastorName?: string;
  pastorNumber?: string;
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
  testimony?: string;
  
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
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (filterParam && ['all', 'active', 'inactive', 'suspended', 'blocked', 'active-today', 'new-this-week', 'interest-sent', 'connected-successfully'].includes(filterParam)) {
      setFilterStatus(filterParam);
    } else {
      setFilterStatus('all');
    }
  }, [filterParam]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [pendingSuspendUserId, setPendingSuspendUserId] = useState<string | null>(null);
  const [pendingSuspendStatus, setPendingSuspendStatus] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };



  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Fetch up to 1000 users to make sure matches/interests display properly
      const q = query(usersRef, orderBy('createdAt', 'desc'), limit(1000));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => {
        const data = d.data();
        const age = String(calculateAge(data.dob, data.age));
        return { id: d.id, ...data, age } as UserProfile;
      });
      setUsers(docs);

      const interestsSnap = await getDocs(collection(db, 'interests'));
      const interestsData = interestsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setInterests(interestsData);
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
        isSuspended: newStatus === 'suspended',
        updatedAt: serverTimestamp()
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus, isSuspended: newStatus === 'suspended' } : u));
      if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, status: newStatus, isSuspended: newStatus === 'suspended' } : null);
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
      }
    } finally {
      setDeletingUser(false);
    }
  };

  const getEffectiveStatus = (user: UserProfile) => {
    if (user.status === 'suspended' || user.status === 'blocked') {
      return user.status;
    }
    
    // Check lastLoginAt
    if (user.lastLoginAt) {
      const lastLoginDate = user.lastLoginAt.toDate ? user.lastLoginAt.toDate() : new Date(user.lastLoginAt);
      const daysDiff = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 40) {
        return 'inactive';
      }
    } else if (user.createdAt) {
      const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 40) {
        return 'inactive';
      }
    }
    
    return user.status || 'active';
  };

  const connections = interests.map(interest => {
    const sender = users.find(u => u.uid === interest.fromId || u.id === interest.fromId);
    const receiver = users.find(u => u.uid === interest.toId || u.id === interest.toId);
    return {
      id: interest.id,
      fromId: interest.fromId,
      toId: interest.toId,
      status: interest.status,
      createdAt: interest.createdAt,
      senderName: sender ? `${sender.name} ${sender.lastName || ''}`.trim() : 'Unknown User',
      senderEmail: sender?.email || 'N/A',
      senderType: sender?.profileType || 'N/A',
      receiverName: receiver ? `${receiver.name} ${receiver.lastName || ''}`.trim() : 'Unknown User',
      receiverEmail: receiver?.email || 'N/A',
      receiverType: receiver?.profileType || 'N/A',
    };
  });

  const filteredConnections = connections.filter(conn => {
    if (filterStatus === 'interest-sent' && conn.status !== 'pending') return false;
    if (filterStatus === 'connected-successfully' && conn.status !== 'accepted') return false;
    
    // Exclude connections involving deleted users
    if (conn.senderName === 'Unknown User' || conn.receiverName === 'Unknown User') return false;
    
    const term = searchTerm.toLowerCase();
    return conn.senderName.toLowerCase().includes(term) ||
           conn.receiverName.toLowerCase().includes(term) ||
           conn.senderEmail.toLowerCase().includes(term) ||
           conn.receiverEmail.toLowerCase().includes(term);
  });

  const handlePrintConnections = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const title = filterStatus === 'interest-sent' ? 'Interest Sent (Pending)' : 'Connected Successfully';
    
    const htmlRows = filteredConnections.map((conn, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; height: 40px; font-size: 13px;">
        <td style="padding: 8px; font-weight: bold;">${idx + 1}</td>
        <td style="padding: 8px;">
          <strong>${conn.senderName}</strong><br/>
          <span style="font-size: 11px; color: #4a5568;">${conn.senderEmail} (Gender: ${conn.senderType})</span>
        </td>
        <td style="padding: 8px; text-align: center; font-weight: bold; color: #a0aec0;">&rarr;</td>
        <td style="padding: 8px;">
          <strong>${conn.receiverName}</strong><br/>
          <span style="font-size: 11px; color: #4a5568;">${conn.receiverEmail} (Gender: ${conn.receiverType})</span>
        </td>
        <td style="padding: 8px;">
          ${conn.createdAt?.seconds ? new Date(conn.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
        </td>
        <td style="padding: 8px; text-transform: uppercase; font-weight: bold; font-size: 11px; color: ${conn.status === 'accepted' ? '#16a34a' : '#d97706'};">
          ${conn.status === 'accepted' ? 'Connected' : 'Pending'}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1a202c; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f7fafc; text-align: left; padding: 8px; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; color: #4a5568; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #040e2a; padding-bottom: 10px; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin: 0; color: #040e2a;">The Kingdom Alliances</h2>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #718096;">Matrimonial Platform — Admin Connections Directory</p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0; color: #d4af37;">${title}</h3>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #718096;">Generated: ${new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 40%;">Sender (Initiated By)</th>
                <th style="width: 5%;"></th>
                <th style="width: 40%;">Receiver (Recipient)</th>
                <th style="width: 10%;">Date</th>
                <th style="width: 10%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows.length > 0 ? htmlRows : '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #a0aec0;">No records found.</td></tr>'}
            </tbody>
          </table>
          
          <div class="footer">
            Confidential Report &copy; 2026 The Kingdom Alliances. All rights reserved.
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredUsers = users.filter(u => {
    // Exclude users awaiting approval as they belong in the Approvals page
    if (u.approvalStatus === 'pending' || !u.isApproved) {
      return false;
    }
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = false;
    if (filterStatus === 'all') {
      matchesFilter = true;
    } else if (filterStatus === 'active-today') {
      const lastActive = parseFirestoreDate(u.lastActive);
      if (lastActive) {
        const activeDate = new Date(lastActive);
        const today = new Date();
        matchesFilter = activeDate.getDate() === today.getDate() &&
                        activeDate.getMonth() === today.getMonth() &&
                        activeDate.getFullYear() === today.getFullYear();
      }
    } else if (filterStatus === 'new-this-week') {
      const createdDate = parseFirestoreDate(u.createdAt);
      if (createdDate) {
        matchesFilter = (Date.now() - createdDate.getTime()) < 7 * 24 * 60 * 60 * 1000;
      }
    } else {
      const effectiveStatus = getEffectiveStatus(u);
      matchesFilter = effectiveStatus === filterStatus;
    }
    return matchesSearch && matchesFilter;
  });

  const handleSuspendConfirmed = () => {
    if (pendingSuspendUserId && pendingSuspendStatus) {
      handleUpdateStatus(
        pendingSuspendUserId,
        pendingSuspendStatus as any
      );
    }
    setPendingSuspendUserId(null);
    setPendingSuspendStatus(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="mt-1 p-2 hover:bg-[#1a2e4a]/5 rounded-full transition-colors text-[#64748b]"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-tight">
              {filterStatus === 'interest-sent' ? 'Pending Interests' :
               filterStatus === 'connected-successfully' ? 'Successful Connections' :
               'User Management'}
            </h1>
            <p className="text-sm text-[#64748b] mt-0.5">
              {filterStatus === 'interest-sent' ? 'View and print sent requests waiting for response' :
               filterStatus === 'connected-successfully' ? 'View and print successfully accepted matches' :
               'Search, edit, and manage user accounts'}
            </p>
          </div>
        </div>
        {(filterStatus === 'interest-sent' || filterStatus === 'connected-successfully') && (
          <button
            onClick={handlePrintConnections}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a2e4a] hover:bg-[#0f1d32] text-white rounded-xl text-[13px] font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="admin-card p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-[13px] ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[#1a2e4a]/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#94a3b8]" />
          <select 
            value={filterStatus}
            onChange={(e: any) => {
              const val = e.target.value;
              setFilterStatus(val);
              if (val === 'all') {
                searchParams.delete('filter');
              } else {
                searchParams.set('filter', val);
              }
              setSearchParams(searchParams);
            }}
            className="px-3 py-2.5 bg-white rounded-xl text-[13px] ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[#1a2e4a]/20 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive (&gt;40 days)</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
            <option value="active-today">Active Today</option>
            <option value="new-this-week">New This Week</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead className="border-b border-black/[0.04]">
              {filterStatus === 'interest-sent' || filterStatus === 'connected-successfully' ? (
                <tr>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Sender</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider text-center">Direction</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Receiver</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider text-right">Status</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Photos</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1a2e4a] mx-auto" />
                  </td>
                </tr>
              ) : (filterStatus === 'interest-sent' || filterStatus === 'connected-successfully') ? (
                filteredConnections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-sm text-[#64748b]">
                      No records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredConnections.map((conn) => (
                    <tr key={conn.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-[13px] font-semibold text-[#0f172a]">{conn.senderName}</p>
                          <p className="text-[11px] text-[#64748b]">{conn.senderEmail} <span className="capitalize">({conn.senderType})</span></p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center text-[#94a3b8] font-medium">
                        →
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-[13px] font-semibold text-[#0f172a]">{conn.receiverName}</p>
                          <p className="text-[11px] text-[#64748b]">{conn.receiverEmail} <span className="capitalize">({conn.receiverType})</span></p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#64748b]">
                        {conn.createdAt?.seconds ? new Date(conn.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          conn.status === 'accepted' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        )}>
                          {conn.status === 'accepted' ? 'Connected' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-[#64748b]">
                    No users found matching your criteria.
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
                      {(() => {
                        const effectiveStatus = getEffectiveStatus(user);
                        return (
                          <span className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md inline-flex items-center gap-1",
                            effectiveStatus === 'active' ? "bg-emerald-50 text-emerald-700" : 
                            effectiveStatus === 'inactive' ? "bg-[#f1f5f9] text-[#64748b]" :
                            effectiveStatus === 'suspended' ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                          )}>
                            <div className="w-1 h-1 rounded-full bg-current" />
                            {effectiveStatus}
                          </span>
                        );
                      })()}
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
                          
                          {(() => {
                            const isActive = user.status !== 'suspended' && user.status !== 'blocked';
                            return (
                              <button 
                                onClick={() => {
                                  if (isActive) {
                                    setPendingSuspendUserId(user.id);
                                    setPendingSuspendStatus('suspended');
                                    setShowSuspendConfirm(true);
                                  } else {
                                    handleUpdateStatus(user.id, 'active');
                                  }
                                }}
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                                )}
                                title={isActive ? 'Suspend User' : 'Re-activate User'}
                              >
                                {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                            );
                          })()}

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



      <ConfirmationModal
        isOpen={showSuspendConfirm}
        onClose={() => {
          setShowSuspendConfirm(false);
          setPendingSuspendUserId(null);
          setPendingSuspendStatus(null);
        }}
        onConfirm={handleSuspendConfirmed}
        title="Suspend User"
        message="Are you sure you want to suspend this profile? The user will lose access to the platform immediately."
        confirmText="Yes, Suspend"
        cancelText="No, Keep Active"
        isDestructive={true}
      />
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
