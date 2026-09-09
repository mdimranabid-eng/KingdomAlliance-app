import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { multiFactor, TotpMultiFactorGenerator } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, 
  Loader2,
  CheckCircle2,
  UserPlus,
  Copy,
  X,
  Users,
  Trash2,
  Crown,
  Clock,
  Mail,
  Search,
  UserX,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSettings() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [mfaMessage, setMfaMessage] = useState('');

  const [admins, setAdmins] = useState<any[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState<{ email: string; tempPassword: string } | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const SYSTEM_ADMIN_EMAILS = ['themaster@thekingdomalliances.com', 'md.imranabid@gmail.com'];
  const [deletingAdmin, setDeletingAdmin] = useState<{ uid: string; email: string } | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);

  const [resetTarget, setResetTarget] = useState<{ uid: string; email: string } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetCopied, setResetCopied] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ email: string; tempPassword: string } | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [deletingUser, setDeletingUser] = useState<{ uid: string; email: string; name: string } | null>(null);
  const [deletingUserConfirm, setDeletingUserConfirm] = useState(false);
  const [userDeleteError, setUserDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      const enrolled = multiFactor(auth.currentUser).enrolledFactors.length > 0;
      setIsEnrolled(enrolled);
    }
    setLoading(false);
  }, []);

  const startEnrollment = async () => {
    try {
      setMfaMessage('');
      const multiFactorSession = await multiFactor(auth.currentUser!).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);
      setTotpSecret(secret);
      setQrCodeUrl(secret.generateQrCodeUrl(auth.currentUser!.email!, "Kingdom Alliance"));
    } catch (err: any) {
      setMfaMessage("Error starting 2FA: " + err.message);
    }
  };

  const verifyAndEnroll = async () => {
    try {
      setMfaMessage('');
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, verificationCode);
      await multiFactor(auth.currentUser!).enroll(assertion, "Admin Authenticator");
      setIsEnrolled(true);
      setQrCodeUrl('');
      setMfaMessage("2FA is now active!");
    } catch (err: any) {
      setMfaMessage("Invalid Code: " + err.message);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAdmins = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/admin/list-admins`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setAdmins(data.admins);
      } catch (err) {
        console.error('Failed to fetch admins:', err);
      } finally {
        setAdminsLoading(false);
      }
    };
    fetchAdmins();

    const fetchUsers = async () => {
      try {
        const usersQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(usersQ);
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [isAdmin]);

  const handleCreateAdmin = async () => {
    setAdminError(null);
    if (!newAdminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail.trim())) {
      setAdminError('Please enter a valid email address.');
      return;
    }
    setCreatingAdmin(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newAdminEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');
      setCreatedAdmin({ email: data.email, tempPassword: data.tempPassword });
      setNewAdminEmail('');
      setAdmins(prev => [{ uid: data.uid, email: data.email, createdAt: new Date(), emailVerified: false }, ...prev]);
    } catch (err: any) {
      setAdminError(err.message);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const copyPassword = () => {
    if (createdAdmin) {
      navigator.clipboard.writeText(createdAdmin.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openDeletionModal = (uid: string, email: string) => {
    setDeletingAdmin({ uid, email });
    setDeletionError(null);
  };

  const handleDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    setDeletingAccount(true);
    setDeletionError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/admin/delete-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: deletingAdmin.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete admin');
      setAdmins(prev => prev.filter(a => (a.id || a.uid) !== deletingAdmin.uid));
      setDeletingAdmin(null);
    } catch (err: any) {
      setDeletionError(err.message);
    } finally {
      setDeletingAccount(false);
    }
  };

  const openResetModal = (uid: string, email: string) => {
    setResetTarget({ uid, email });
    setResetError(null);
    setResetResult(null);
    setResetCopied(false);
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResetting(true);
    setResetError(null);
    setResetResult(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/admin/reset-admin-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: resetTarget.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setResetResult({ email: data.email, tempPassword: data.tempPassword });
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetting(false);
    }
  };

  const copyResetPassword = () => {
    if (resetResult) {
      navigator.clipboard.writeText(resetResult.tempPassword);
      setResetCopied(true);
      setTimeout(() => setResetCopied(false), 2000);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeletingUserConfirm(true);
    setUserDeleteError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/admin/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: deletingUser.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      setUsers(prev => prev.filter(u => u.uid !== deletingUser.uid));
      setDeletingUser(null);
    } catch (err: any) {
      setUserDeleteError(err.message);
    } finally {
      setDeletingUserConfirm(false);
    }
  };

  const verifiedCount = admins.filter(a => a.emailVerified).length;
  const pendingCount = admins.length - verifiedCount;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ─── Page Header ─── */}
      <div>
        <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-tight">Admin Settings</h1>
        <p className="text-sm text-[#64748b] mt-0.5">Manage administrator accounts and security</p>

        {/* Stat ribbon */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2e4a]/5 rounded-full">
            <Users className="w-3.5 h-3.5 text-[#1a2e4a]" />
            <span className="text-xs font-semibold text-[#1a2e4a]">{admins.length} Total</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">{verifiedCount} Verified</span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">{pendingCount} Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Two-Factor Authentication Section ─── */}
      <section
        className="admin-card p-6 overflow-hidden"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: isEnrolled ? '#10b981' : '#f59e0b',
          background: isEnrolled
            ? 'linear-gradient(to right, rgba(16,185,129,0.04), transparent)'
            : 'linear-gradient(to right, rgba(245,158,11,0.04), transparent)'
        }}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${isEnrolled ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[#1a2e4a]">Two-Factor Authentication</h3>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
              Add an extra layer of security to your administrator account.
            </p>

            <div className="mt-4">
              {isEnrolled ? (
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  2FA is Active
                </div>
              ) : (
                <>
                  {!qrCodeUrl ? (
                    <button
                      type="button"
                      onClick={startEnrollment}
                      className="sanctuary-btn !w-auto !px-6 !py-2.5 !text-sm !rounded-xl"
                    >
                      Enable Authenticator 2FA
                    </button>
                  ) : (
                    <div className="space-y-5 max-w-md">
                      <div className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-center shadow-inner">
                        <QRCodeSVG value={qrCodeUrl} size={200} />
                      </div>
                      <p className="text-sm" style={{ color: '#64748b' }}>
                        Scan the QR code with your authenticator app, then enter the 6-digit code below.
                      </p>
                      <div className="s-field">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder=" "
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="!text-center !font-mono !text-xl !tracking-widest"
                        />
                        <label>Verification Code</label>
                      </div>
                      <button
                        type="button"
                        onClick={verifyAndEnroll}
                        className="sanctuary-btn !w-full !rounded-xl"
                      >
                        Verify & Save
                      </button>
                    </div>
                  )}
                </>
              )}

              {mfaMessage && (
                <div className={`mt-4 p-3 rounded-xl text-sm font-medium border ${
                  mfaMessage.includes('active') || mfaMessage.includes('now active')
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {mfaMessage.startsWith('Invalid') || mfaMessage.startsWith('Error') ? '❌ ' : '✅ '}{mfaMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Admin Management Section ─── */}
      <section className="admin-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-[#1a2e4a] flex items-center gap-2.5">
              <div className="p-2 bg-[#1a2e4a]/5 rounded-xl">
                <Users className="w-5 h-5 text-[#1a2e4a]" />
              </div>
              Admin Accounts
            </h3>
            <p className="text-sm mt-0.5 ml-[42px]" style={{ color: '#64748b' }}>
              Manage administrator access to the platform
            </p>
          </div>
          <button
            onClick={() => { setShowAddAdminModal(true); setAdminError(null); setCreatedAdmin(null); }}
            className="sanctuary-btn !w-auto !px-5 !py-2.5 !text-sm !rounded-xl flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add Admin
          </button>
        </div>

        {/* Admins list */}
        {adminsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-on-surface-variant" />
            </div>
            <h4 className="text-base font-semibold text-[#1a2e4a] mb-1">No admin accounts found</h4>
            <p className="text-sm mb-5" style={{ color: '#64748b' }}>
              Add the first administrator to get started.
            </p>
            <button
              onClick={() => { setShowAddAdminModal(true); setAdminError(null); setCreatedAdmin(null); }}
              className="sanctuary-btn !w-auto !px-6 !py-2.5 !text-sm !rounded-xl flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add First Admin
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {admins.map((admin: any, index: number) => {
              const isSystem = SYSTEM_ADMIN_EMAILS.includes(admin.email?.toLowerCase());
              const initial = admin.email?.charAt(0).toUpperCase() || '?';

              return (
                <motion.div
                  key={admin.id || admin.uid}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-xl border border-black/[0.04] hover:border-[#C9A84C]/30 hover:shadow-sm transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#1a2e4a] truncate">{admin.email}</p>
                      {isSystem && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#C9A84C]/10 rounded-full" title="System Account">
                          <Crown className="w-3 h-3 text-[#C9A84C]" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8f6337]">System</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {admin.emailVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isSystem && (
                      <>
                        <button
                          onClick={() => openResetModal(admin.id || admin.uid, admin.email)}
                          className="p-2 text-on-surface-variant hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Reset password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeletionModal(admin.id || admin.uid, admin.email)}
                          className="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Delete admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── User Management Section ─── */}
      <section className="admin-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-[#1a2e4a] flex items-center gap-2.5">
              <div className="p-2 bg-[#1a2e4a]/5 rounded-xl">
                <UserX className="w-5 h-5 text-[#1a2e4a]" />
              </div>
              User Management
            </h3>
            <p className="text-sm mt-0.5 ml-[42px]" style={{ color: '#64748b' }}>
              Delete user accounts permanently
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2e4a]/5 rounded-full">
            <Users className="w-3.5 h-3.5 text-[#1a2e4a]" />
            <span className="text-xs font-semibold text-[#1a2e4a]">{users.length} Users</span>
          </div>
        </div>

        <div className="mb-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-black/[0.06] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all"
          />
        </div>

        {usersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {users
              .filter(u => {
                const search = userSearch.toLowerCase();
                return !search || (u.name || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search);
              })
              .map((u: any) => {
                const isSystem = SYSTEM_ADMIN_EMAILS.includes(u.email?.toLowerCase());
                const isAdminUser = admins.some(a => a.email?.toLowerCase() === u.email?.toLowerCase());
                return (
                  <div key={u.id} className="flex items-center gap-4 p-3 bg-[#f8fafc] rounded-xl border border-black/[0.04] hover:border-[#C9A84C]/30 hover:shadow-sm transition-all duration-200 group">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 overflow-hidden">
                      {u.photoUrl ? (
                        <img src={u.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (u.name || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#1a2e4a] truncate text-sm">{u.name || 'Unnamed'}</p>
                        {isSystem && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#C9A84C]/10 rounded-full">
                            <Crown className="w-2.5 h-2.5 text-[#C9A84C]" />
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#8f6337]">System</span>
                          </span>
                        )}
                        {isAdminUser && !isSystem && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 rounded-full">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-blue-600">Admin</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{u.email}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {!isSystem && (
                        <button
                          onClick={() => setDeletingUser({ uid: u.uid, email: u.email, name: u.name })}
                          className="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* ─── Add Admin Modal ─── */}
      <AnimatePresence>
        {showAddAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/[0.06]"
            >
              {/* Gold accent bar */}
              <div className="h-1.5" style={{ background: 'linear-gradient(to right, #C9A84C, #8f6337)' }} />

              <div className="px-6 py-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0f172a]">
                  {createdAdmin ? 'Admin Created' : 'Add New Admin'}
                </h3>
                <button onClick={() => { setShowAddAdminModal(false); setCreatedAdmin(null); setNewAdminEmail(''); setAdminError(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" style={{ color: '#64748b' }} />
                </button>
              </div>

              <div className="px-6 pb-6">
                {createdAdmin ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-800">Admin account created successfully</p>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-surface-container-low rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>Email</p>
                        <p className="text-sm font-medium text-[#1a2e4a]">{createdAdmin.email}</p>
                      </div>
                      <div className="p-3 bg-surface-container-low rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>Password</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-bold text-[#1a2e4a] flex-1">{createdAdmin.tempPassword}</code>
                          <button onClick={copyPassword} className="p-2 hover:bg-white rounded-lg transition-colors" title="Copy password">
                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" style={{ color: '#64748b' }} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
                      Credentials have been sent via email. The admin must verify their email and set up 2FA on first login.
                    </p>
                    <button
                      onClick={() => { setShowAddAdminModal(false); setCreatedAdmin(null); }}
                      className="sanctuary-btn !w-full !rounded-xl"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      Enter the email address for the new admin. A password will be generated and sent via email.
                    </p>
                    {adminError && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200">{adminError}</div>
                    )}
                    <div className="s-field">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#94a3b8', zIndex: 1 }} />
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => { setNewAdminEmail(e.target.value); setAdminError(null); }}
                        placeholder=" "
                        className="!pl-12"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateAdmin(); }}
                        autoFocus
                      />
                      <label style={{ left: 48 }}>Email Address</label>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => { setShowAddAdminModal(false); setNewAdminEmail(''); setAdminError(null); }}
                        className="flex-1 py-3 rounded-xl border border-outline-variant font-medium hover:bg-gray-50 transition-all text-sm"
                        style={{ color: '#64748b' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateAdmin}
                        disabled={creatingAdmin || !newAdminEmail}
                        className="sanctuary-btn !flex-1 !rounded-xl !text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {creatingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        {creatingAdmin ? 'Creating...' : 'Create Admin'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Admin Modal ─── */}
      <AnimatePresence>
        {deletingAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/[0.06]"
            >
              <div className="h-1.5 bg-gradient-to-r from-red-500 to-red-700" />
              <div className="px-6 py-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0f172a]">Delete Admin Account</h3>
                <button onClick={() => { setDeletingAdmin(null); setDeletionError(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" style={{ color: '#64748b' }} />
                </button>
              </div>
              <div className="px-6 pb-6 space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-sm font-semibold text-red-800">Are you sure?</p>
                  <p className="text-xs text-red-600 mt-1">
                    This will permanently delete the admin account for <strong>{deletingAdmin.email}</strong>.
                  </p>
                </div>
                {deletionError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200">{deletionError}</div>
                )}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setDeletingAdmin(null); setDeletionError(null); }}
                    className="flex-1 py-3 rounded-xl border border-outline-variant font-medium hover:bg-gray-50 transition-all text-sm"
                    style={{ color: '#64748b' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAdmin}
                    disabled={deletingAccount}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deletingAccount ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Reset Admin Password Modal ─── */}
      <AnimatePresence>
        {resetTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/[0.06]"
            >
              <div className="h-1.5 bg-gradient-to-r from-[#C9A84C] to-[#8f6337]" />
              <div className="px-6 py-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0f172a]">
                  {resetResult ? 'Password Reset' : 'Reset Admin Password'}
                </h3>
                <button onClick={() => { setResetTarget(null); setResetError(null); setResetResult(null); setResetCopied(false); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" style={{ color: '#64748b' }} />
                </button>
              </div>
              <div className="px-6 pb-6 space-y-4">
                {resetResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-800">Password reset successfully</p>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 bg-surface-container-low rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>Email</p>
                        <p className="text-sm font-medium text-[#1a2e4a]">{resetResult.email}</p>
                      </div>
                      <div className="p-3 bg-surface-container-low rounded-xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>Password</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-bold text-[#1a2e4a] flex-1">{resetResult.tempPassword}</code>
                          <button onClick={copyResetPassword} className="p-2 hover:bg-white rounded-lg transition-colors" title="Copy password">
                            {resetCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" style={{ color: '#64748b' }} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
                      A new password has been sent via email. The admin can log in with it directly — no change required.
                    </p>
                    <button
                      onClick={() => { setResetTarget(null); setResetResult(null); setResetCopied(false); }}
                      className="sanctuary-btn !w-full !rounded-xl"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#C9A84C]/10 rounded-xl border border-[#C9A84C]/30 text-center">
                      <div className="w-12 h-12 bg-[#C9A84C]/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <KeyRound className="w-6 h-6 text-[#8f6337]" />
                      </div>
                      <p className="text-sm font-semibold text-[#1a2e4a]">Reset password for {resetTarget.email}?</p>
                      <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                        A new password will be generated and sent via email. The admin can log in with it directly.
                      </p>
                    </div>
                    {resetError && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200">{resetError}</div>
                    )}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => { setResetTarget(null); setResetError(null); setResetResult(null); }}
                        className="flex-1 py-3 rounded-xl border border-outline-variant font-medium hover:bg-gray-50 transition-all text-sm"
                        style={{ color: '#64748b' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResetPassword}
                        disabled={resetting || !!resetResult}
                        className="sanctuary-btn !flex-1 !rounded-xl !text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        {resetting ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete User Modal ─── */}
      <AnimatePresence>
        {deletingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/[0.06]"
            >
              <div className="h-1.5 bg-gradient-to-r from-red-500 to-red-700" />
              <div className="px-6 py-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0f172a]">Delete User</h3>
                <button onClick={() => { setDeletingUser(null); setUserDeleteError(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" style={{ color: '#64748b' }} />
                </button>
              </div>
              <div className="px-6 pb-6 space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-sm font-semibold text-red-800">Permanently delete this user?</p>
                  <p className="text-xs text-red-600 mt-1">
                    <strong>{deletingUser.name}</strong> ({deletingUser.email}) will be permanently removed along with all their data, photos, messages, and matches.
                  </p>
                </div>
                {userDeleteError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200">{userDeleteError}</div>
                )}
                <p className="text-sm" style={{ color: '#64748b' }}>
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { setDeletingUser(null); setUserDeleteError(null); }}
                    className="flex-1 py-3 rounded-xl border border-outline-variant font-medium hover:bg-gray-50 transition-all text-sm"
                    style={{ color: '#64748b' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={deletingUserConfirm}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    {deletingUserConfirm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deletingUserConfirm ? 'Deleting...' : 'Delete Permanently'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
