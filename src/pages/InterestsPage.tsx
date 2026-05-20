import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc, orderBy, deleteDoc } from 'firebase/firestore';
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
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, handleFirestoreError, OperationType, calculateAge } from '../lib/utils';

export default function InterestsPage() {
  const { user: authUser } = useAuth();
  const [tab, setTab] = useState<'received' | 'sent' | 'declined'>('received');
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchInterests = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'interests'), 
        where(tab === 'sent' ? 'fromId' : 'toId', '==', authUser.uid)
      );
      
      const snap = await getDocs(q);
      let interestDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Sort in-memory to resolve "missing index" error immediately
      // We still recommend creating the index for better performance with large datasets
      interestDocs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      // Fetch user profiles
      const enrichedInterests = await Promise.all(interestDocs.map(async (interest: any) => {
        const targetId = tab === 'sent' ? interest.toId : interest.fromId;
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
      if (tab === 'received') {
        filtered = filtered.filter(i => i.status !== 'declined');
      } else if (tab === 'declined') {
        filtered = filtered.filter(i => i.status === 'declined');
      }
      setInterests(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, [authUser, tab]);

  const handleUpdateStatus = async (interestId: string, status: 'accepted' | 'declined') => {
    setProcessingId(interestId);
    try {
      await updateDoc(doc(db, 'interests', interestId), {
        status,
        updatedAt: serverTimestamp()
      });

      if (status === 'accepted') {
        const request = interests.find(i => i.id === interestId);
        if (request) {
          const currentUser = authUser;
          // Fetch the original sender's email to notify them of acceptance
          const senderSnap = await getDoc(doc(db, 'users', request.fromId));
          if (senderSnap.exists() && senderSnap.data()?.email) {
              await sendEmail({
                  to_email: senderSnap.data().email,
                  type: 'connection_accepted',
                  senderName: currentUser?.displayName || 'A member'
              });
          }
        }
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
      // 1. Delete the specific interest document
      await deleteDoc(doc(db, 'interests', interestId));

      // 2. Query and delete corresponding notifications to reset recipient bell counter
      const qNotif = query(
        collection(db, 'notifications'),
        where('type', '==', 'interest'),
        where('fromId', '==', authUser.uid),
        where('userId', '==', targetUserId)
      );
      const snapNotif = await getDocs(qNotif);
      await Promise.all(snapNotif.docs.map(d => deleteDoc(d.ref)));

      // 3. UI Update: remove from the local state
      setInterests(prev => prev.filter(i => i.id !== interestId));

      toast.success('Interest withdrawn');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `interests/${interestId}`);
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface">Interests</h1>
          <p className="text-on-surface-variant">Connect with members who share your vision</p>
        </div>

        <div className="flex p-1 bg-surface-container rounded-2xl border border-outline-variant flex-wrap gap-1 md:gap-0">
          <button 
            onClick={() => setTab('received')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-label-lg transition-all",
              tab === 'received' ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:bg-surface-variant"
            )}
          >
            Received
          </button>
          <button 
            onClick={() => setTab('sent')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-label-lg transition-all",
              tab === 'sent' ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:bg-surface-variant"
            )}
          >
            Sent
          </button>
          <button 
            onClick={() => setTab('declined')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-label-lg transition-all",
              tab === 'declined' ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:bg-surface-variant"
            )}
          >
            Declined
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
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="font-headline text-2xl text-on-surface">No Interests Yet</h3>
          <p className="text-on-surface-variant max-w-sm mx-auto">
            {tab === 'received' 
              ? "You haven't received any interests yet. Make sure your profile is complete to get more visibility!"
              : "You haven't sent any interests yet. Start exploring matches to find your future partner."}
          </p>
          <Link to="/matches" className="inline-block text-primary font-bold hover:underline">Explore Matches</Link>
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
                onWithdraw={() => handleWithdrawInterest(interest.toId, interest.id)}
                onDelete={() => handleDeletePermanently(interest.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
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
      className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex items-center gap-6"
    >
      <Link to={`/profile/${user.id}`} className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-outline-variant">
        <img src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt={user.name} className="w-full h-full object-cover" />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-headline text-xl text-on-surface truncate">{user.name}, {user.age}</h3>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
            interest.status === 'pending' ? "bg-secondary-container/20 text-secondary" :
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
              onClick={onAccept}
              className="flex-1 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Accept</>}
            </button>
            <button 
              disabled={isProcessing}
              onClick={onDelete}
              className="px-4 py-1.5 bg-error/10 text-error hover:bg-error/20 rounded-xl text-xs font-bold transition-all"
            >
              Delete
            </button>
          </div>
        ) : isReceived && interest.status === 'pending' ? (
          <div className="flex gap-2">
            <button 
              disabled={isProcessing}
              onClick={onAccept}
              className="flex-1 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3.5 h-3.5" /> Accept</>}
            </button>
            <button 
              disabled={isProcessing}
              onClick={onDecline}
              className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-xl text-xs font-bold border border-outline-variant hover:bg-surface-variant transition-all"
            >
              Decline
            </button>
          </div>
        ) : interest.status === 'accepted' ? (
          <Link 
            to={`/messages?chatWith=${user.id}`}
            className="flex items-center gap-2 text-primary font-bold text-xs hover:underline"
          >
            <MessageCircle className="w-4 h-4" /> Start Conversation
          </Link>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-on-surface-variant italic">
              {interest.status === 'pending' ? "Waiting for response..." : interest.status === 'declined' ? "Interest declined." : ""}
            </p>
            {!isReceived && interest.status === 'pending' && (
              <button
                disabled={isProcessing}
                onClick={onWithdraw}
                className="self-start px-3 py-1 bg-error/10 text-error hover:bg-error/20 rounded-lg text-[11px] font-bold transition-all"
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
