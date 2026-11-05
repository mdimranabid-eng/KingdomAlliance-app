import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc, orderBy, deleteDoc, writeBatch, runTransaction, deleteField, addDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { sendEmail } from '../lib/email';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Check, 
  X, 
  Clock, 
  User, 
  MapPin, 
  ArrowRight,
  Loader2,
  Mail,
  HeartHandshake,
  Inbox,
  Send,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, handleFirestoreError, OperationType, calculateAge } from '../lib/utils';
import ConfirmationModal from '../components/ConfirmationModal';
import { BlurablePhoto } from '../components/BlurablePhoto';

export default function InterestsPage() {
  const { user: authUser } = useAuth();
  const [tab, setTab] = useState<'received' | 'sent' | 'declined'>('received');
  const [counts, setCounts] = useState({ received: 0, sent: 0, declined: 0 });
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showWithdrawDeclineConfirm, setShowWithdrawDeclineConfirm] = useState(false);
  const [pendingWithdrawId, setPendingWithdrawId] = useState<string | null>(null);
  const [pendingTargetUserId, setPendingTargetUserId] = useState<string | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [pendingWithdrawInterestId, setPendingWithdrawInterestId] = useState<string | null>(null);
  const [pendingWithdrawTargetId, setPendingWithdrawTargetId] = useState<string | null>(null);

  const fetchCounts = async () => {
    if (!authUser) return;
    try {
      const qReceived = query(
        collection(db, 'interests'),
        where('toId', '==', authUser.uid),
        where('status', '==', 'pending')
      );
      const qSent = query(
        collection(db, 'interests'),
        where('fromId', '==', authUser.uid),
        where('status', '==', 'pending')
      );
      const qDeclined1 = query(
        collection(db, 'interests'),
        where('toId', '==', authUser.uid),
        where('status', '==', 'declined')
      );
      const qDeclined2 = query(
        collection(db, 'interests'),
        where('fromId', '==', authUser.uid),
        where('status', '==', 'declined')
      );

      const [snapRec, snapSent, snapDec1, snapDec2] = await Promise.all([
        getDocs(qReceived),
        getDocs(qSent),
        getDocs(qDeclined1),
        getDocs(qDeclined2)
      ]);

      const allDeclined = [...snapDec1.docs, ...snapDec2.docs];
      const myDeclined = allDeclined.filter(d => d.data()?.declinedBy === authUser.uid);

      setCounts({
        received: snapRec.size,
        sent: snapSent.size,
        declined: myDeclined.length
      });
      try {
        localStorage.setItem('ka_acknowledged_interests_count', String(snapRec.size));
      } catch {}
    } catch (e) {
      console.warn('Error fetching interest counts:', e);
    }
  };

  const fetchInterests = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      let interestDocs: any[] = [];
      if (tab === 'declined') {
        const q1 = query(collection(db, 'interests'), where('fromId', '==', authUser.uid), where('status', '==', 'declined'));
        const q2 = query(collection(db, 'interests'), where('toId', '==', authUser.uid), where('status', '==', 'declined'));
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        interestDocs = [...snap1.docs, ...snap2.docs].map(d => ({ id: d.id, ...d.data() }));
      } else {
        const q = query(
          collection(db, 'interests'), 
          where(tab === 'sent' ? 'fromId' : 'toId', '==', authUser.uid)
        );
        const snap = await getDocs(q);
        interestDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // Sort in-memory to resolve "missing index" error immediately
      interestDocs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      // Fetch user profiles
      const enrichedInterests = await Promise.all(interestDocs.map(async (interest: any) => {
        const targetId = interest.fromId === authUser.uid ? interest.toId : interest.fromId;
        const userSnap = await getDoc(doc(db, 'users', targetId));
        let userData = null;
        if (userSnap.exists()) {
          const data = userSnap.data();
          const age = calculateAge(data.dob, data.age);
          userData = { id: userSnap.id, ...data, age };
        }
        return {
          ...interest,
          user: userData
        };
      }));

      let filtered = enrichedInterests.filter(i => i.user);
      
      // The Exclusion Rule: Profiles where status === 'declined' AND declinedBy !== currentUser.uid MUST NOT appear in ANY tab.
      filtered = filtered.filter(i => !(i.status === 'declined' && i.declinedBy !== authUser.uid));

      if (tab === 'received') {
        filtered = filtered.filter(i => i.toId === authUser.uid && i.status === 'pending');
      } else if (tab === 'sent') {
        filtered = filtered.filter(i => i.fromId === authUser.uid && i.status === 'pending');
      } else if (tab === 'declined') {
        filtered = filtered.filter(i => i.status === 'declined' && i.declinedBy === authUser.uid);
      }
      setInterests(filtered);
      fetchCounts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, [authUser, tab]);

  // Auto-clear interests notifications
  useEffect(() => {
    if (!authUser) return;
    const clearNotifications = async () => {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', authUser.uid),
          where('read', '==', false),
          where('type', 'in', ['interest', 'accepted'])
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.docs.forEach(docSnap => {
            batch.update(docSnap.ref, { read: true });
          });
          await batch.commit();
        }
      } catch (err) {
        console.error("Error clearing interest notifications:", err);
      }
    };
    clearNotifications();
  }, [authUser]);

  const handleUpdateStatus = async (interestId: string, status: 'accepted' | 'declined') => {
    setProcessingId(interestId);
    try {
      // --- EXACT INSERTION STARTS HERE ---
      const updatePayload: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'declined') {
        updatePayload.declinedBy = authUser.uid; 
      }

      await updateDoc(doc(db, 'interests', interestId), updatePayload);
      // --- EXACT INSERTION ENDS HERE ---

      if (status === 'accepted') {
        await sendEmail({ interestId, type: 'connection_accepted' });
      }

      setInterests(prev => 
        prev
          .map(i => i.id === interestId ? { ...i, status } : i)
          .filter(i => tab !== 'declined' || i.status === 'declined')
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `interests/${interestId}`);
    } finally {
      setProcessingId(interestId);
      setTimeout(() => setProcessingId(null), 500);
    }
  };

  const handleWithdrawInterest = async (targetUserId: string, interestId: string) => {
    if (!authUser) return;
    setProcessingId(interestId);
    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, 'interests', interestId);
        const docSnap = await transaction.get(docRef);
        if (!docSnap.exists() || docSnap.data().status !== 'pending') {
          throw new Error('Connection no longer exists or is not pending');
        }
        transaction.delete(docRef);
      });

      const qNotif = query(
        collection(db, 'notifications'),
        where('type', '==', 'interest'),
        where('fromId', '==', authUser.uid),
        where('userId', '==', targetUserId)
      );
      const snapNotif = await getDocs(qNotif);
      const batch = writeBatch(db);
      snapNotif.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      setInterests(prev => prev.filter(i => i.id !== interestId));
      toast.success('Interest withdrawn');
    } catch (err) {
      console.error(err);
      toast.error('Failed to withdraw interest. State may have changed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineInterest = async (interestId: string) => {
    await handleUpdateStatus(interestId, 'declined');
    toast.success('Interest declined');
  };

  const handleAcceptInterest = async (interestId: string) => {
    await handleUpdateStatus(interestId, 'accepted');
    toast.success('Interest accepted');
  };

  const handleDeletePermanently = async (interestId: string) => {
    setProcessingId(interestId);
    try {
      await deleteDoc(doc(db, 'interests', interestId));
      setInterests(prev => prev.filter(i => i.id !== interestId));
      toast.success('Interest deleted permanently');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `interests/${interestId}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdrawAndDecline = async (interestId: string, targetUserId: string) => {
    if (!authUser) return;
    setProcessingId(interestId);
    try {
      await updateDoc(doc(db, 'interests', interestId), {
        status: 'declined',
        declinedBy: authUser.uid
      });

      const qNotif = query(
        collection(db, 'notifications'),
        where('type', '==', 'interest'),
        where('userId', '==', targetUserId),
        where('fromId', '==', authUser.uid)
      );
      const snapNotif = await getDocs(qNotif);
      
      const qNotif2 = query(
        collection(db, 'notifications'),
        where('type', '==', 'accepted'),
        where('userId', '==', targetUserId),
        where('fromId', '==', authUser.uid)
      );
      const snapNotif2 = await getDocs(qNotif2);

      const qNotif3 = query(
        collection(db, 'notifications'),
        where('type', '==', 'message'),
        where('userId', '==', targetUserId),
        where('fromId', '==', authUser.uid)
      );
      const snapNotif3 = await getDocs(qNotif3);

      if (!snapNotif.empty || !snapNotif2.empty || !snapNotif3.empty) {
        const batch = writeBatch(db);
        snapNotif.docs.forEach(d => batch.delete(d.ref));
        snapNotif2.docs.forEach(d => batch.delete(d.ref));
        snapNotif3.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      setInterests(prev => prev.filter(i => i.id !== interestId));
      toast.success('Connection withdrawn and declined');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `interests/${interestId}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnblockAndAccept = async (interestId: string, targetUserId: string) => {
    if (!authUser) return;
    setProcessingId(interestId);
    try {
      await updateDoc(doc(db, 'interests', interestId), {
        status: 'accepted',
        declinedBy: deleteField(),
        blocked: deleteField()
      });

      // Remove from blockedUsers array
      await updateDoc(doc(db, 'users', authUser.uid), {
        blockedUsers: arrayRemove(targetUserId)
      });

      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        fromId: authUser.uid,
        type: 'accepted',
        title: 'Connection Accepted',
        message: `${authUser.displayName || 'Someone'} has accepted your connection!`,
        read: false,
        createdAt: serverTimestamp()
      });

      const notifRef = collection(db, 'notifications');
      const qNotif = query(notifRef, where('type', '==', 'declined'), where('userId', '==', targetUserId), where('fromId', '==', authUser.uid));
      const snapNotif = await getDocs(qNotif);
      if (!snapNotif.empty) {
        const batch = writeBatch(db);
        snapNotif.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      setInterests(prev => prev.filter(i => i.id !== interestId));
      toast.success('Connection unblocked and accepted');
      console.log("Unblock success, DB updated to accepted");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `interests/${interestId}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdrawDeclineConfirmed = () => {
    if (pendingWithdrawId && pendingTargetUserId) {
      handleWithdrawAndDecline(
        pendingWithdrawId,
        pendingTargetUserId
      );
    }
    setPendingWithdrawId(null);
    setPendingTargetUserId(null);
  };

  const handleWithdrawConfirmed = () => {
    if (pendingWithdrawTargetId && pendingWithdrawInterestId) {
      handleWithdrawInterest(
        pendingWithdrawTargetId,
        pendingWithdrawInterestId
      );
    }
    setPendingWithdrawTargetId(null);
    setPendingWithdrawInterestId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-headline text-3xl md:text-4xl text-[#4a3521]">Interests</h1>
        <p className="text-[#7A6E68] text-sm">Review incoming interests and track your sent requests</p>
      </div>

      {/* Prominent Tab Navigation Bar - Highly Visible */}
      <div className="w-full bg-[#f6ecdd]/60 p-2 rounded-2xl border border-[#e2ddd2] shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {/* Received Tab */}
          <button 
            type="button"
            onClick={() => setTab('received')}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer",
              tab === 'received' 
                ? "bg-[#4a3521] text-[#dfc88a] shadow-lg ring-1 ring-[#4a3521]" 
                : "bg-white/80 text-[#64748b] hover:bg-white hover:text-[#4a3521]"
            )}
          >
            <Inbox className={cn("w-4 h-4 sm:w-4.5 sm:h-4.5", tab === 'received' ? "text-[#dfc88a]" : "text-[#8a7a65]")} />
            <span>Received</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-bold",
              tab === 'received'
                ? "bg-[#dfc88a] text-[#4a3521]"
                : counts.received > 0
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-600"
            )}>
              {counts.received}
            </span>
          </button>

          {/* Sent Tab */}
          <button 
            type="button"
            onClick={() => setTab('sent')}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer",
              tab === 'sent' 
                ? "bg-[#4a3521] text-[#dfc88a] shadow-lg ring-1 ring-[#4a3521]" 
                : "bg-white/80 text-[#64748b] hover:bg-white hover:text-[#4a3521]"
            )}
          >
            <Send className={cn("w-4 h-4 sm:w-4.5 sm:h-4.5", tab === 'sent' ? "text-[#dfc88a]" : "text-[#8a7a65]")} />
            <span>Sent</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-bold",
              tab === 'sent' ? "bg-[#dfc88a] text-[#4a3521]" : "bg-slate-100 text-slate-600"
            )}>
              {counts.sent}
            </span>
          </button>

          {/* Declined Tab */}
          <button 
            type="button"
            onClick={() => setTab('declined')}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer",
              tab === 'declined' 
                ? "bg-[#4a3521] text-[#dfc88a] shadow-lg ring-1 ring-[#4a3521]" 
                : "bg-white/80 text-[#64748b] hover:bg-white hover:text-[#4a3521]"
            )}
          >
            <XCircle className={cn("w-4 h-4 sm:w-4.5 sm:h-4.5", tab === 'declined' ? "text-[#dfc88a]" : "text-[#8a7a65]")} />
            <span>Declined</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-bold",
              tab === 'declined' ? "bg-[#dfc88a] text-[#4a3521]" : "bg-slate-100 text-slate-600"
            )}>
              {counts.declined}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-surface-container-low rounded-3xl animate-pulse border border-outline-variant" />
          ))}
        </div>
      ) : interests.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white/70 rounded-3xl border border-[#e2ddd2] p-8">
          <div className="w-16 h-16 bg-[#faf4ea] rounded-full flex items-center justify-center mx-auto text-[#b8860b]">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-headline text-2xl text-[#4a3521]">
            {tab === 'received' ? 'No Pending Interests Received' : tab === 'sent' ? 'No Interests Sent' : 'No Declined Interests'}
          </h3>
          <p className="text-[#7A6E68] max-w-md mx-auto text-sm leading-relaxed">
            {tab === 'received' 
              ? "You don't have any pending interests right now. When another member expresses interest in connecting with you, they will appear right here!"
              : tab === 'sent'
              ? "You haven't sent any interests yet. Start exploring matches to find someone who shares your faith and values."
              : "You haven't declined any interests."}
          </p>
          {tab !== 'declined' && (
            <Link to="/matches" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4a3521] text-[#dfc88a] font-bold text-xs hover:opacity-90 transition-all">
              Explore Matches <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {interests.map((interest) => (
              <InterestCard 
                key={interest.id} 
                interest={interest} 
                isReceived={tab === 'received'}
                isDeclinedView={tab === 'declined'}
                isProcessing={processingId === interest.id}
                onAccept={() => handleAcceptInterest(interest.id)}
                onDecline={() => handleDeclineInterest(interest.id)}
                onWithdraw={() => {
                  setPendingWithdrawTargetId(
                    interest.toId === authUser?.uid
                      ? interest.fromId
                      : interest.toId
                  );
                  setPendingWithdrawInterestId(interest.id);
                  setShowWithdrawConfirm(true);
                }}
                onDelete={() => handleDeletePermanently(interest.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmationModal
        isOpen={showWithdrawDeclineConfirm}
        onClose={() => {
          setShowWithdrawDeclineConfirm(false);
          setPendingWithdrawId(null);
          setPendingTargetUserId(null);
        }}
        onConfirm={handleWithdrawDeclineConfirmed}
        title="Withdraw & Decline"
        message="Are you sure you want to withdraw and decline this connection? This will remove the accepted connection and cannot be undone."
        confirmText="Yes, Withdraw & Decline"
        cancelText="No, Keep Connection"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showWithdrawConfirm}
        onClose={() => {
          setShowWithdrawConfirm(false);
          setPendingWithdrawInterestId(null);
          setPendingWithdrawTargetId(null);
        }}
        onConfirm={handleWithdrawConfirmed}
        title="Withdraw Interest"
        message="Are you sure you want to withdraw this interest request? This action cannot be undone."
        confirmText="Yes, Withdraw"
        cancelText="No, Keep It"
        isDestructive={true}
      />
    </div>
  );
}

function InterestCard({ interest, isReceived, isDeclinedView, isProcessing, onAccept, onDecline, onWithdraw, onDelete }: any) {
  const { user } = interest;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-6 rounded-[2rem] flex items-center gap-6"
    >
      <Link to={`/profile/${user.id}`} className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-outline-variant">
        <BlurablePhoto
          targetUid={user.id}
          src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
          fallbackSrc={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
          alt={user.name}
          profile={user}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="member-name member-name-sm truncate text-[22px] text-on-surface">{user.name}, {user.age}</h3>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
            interest.status === 'pending' ? "bg-amber-100 text-amber-800" :
            interest.status === 'accepted' ? "bg-green-100 text-green-700" : "bg-error/10 text-error"
          )}>
            {interest.status}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3" /> {user.location}
        </p>
        
        {isDeclinedView ? (
          <div className="flex gap-2">
            <button 
              disabled={isProcessing}
              onClick={onDelete}
              className="flex-1 py-1.5 bg-error/10 text-error hover:bg-error/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Delete
            </button>
          </div>
        ) : isReceived && interest.status === 'pending' ? (
          <div className="flex gap-2">
            <button 
              disabled={isProcessing}
              onClick={onAccept}
              className="flex-1 py-2 bg-[#4a3521] text-[#dfc88a] rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Accept</>}
            </button>
            <button 
              disabled={isProcessing}
              onClick={onDecline}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Decline
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-on-surface-variant italic">
              {interest.status === 'pending' ? "Waiting for response..." : interest.status === 'declined' ? "Interest declined." : ""}
            </p>
            {!isReceived && interest.status === 'pending' && (
              <button
                disabled={isProcessing}
                onClick={onWithdraw}
                className="self-start px-3 py-1 bg-error/10 text-error hover:bg-error/20 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
              >
                Withdraw
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
