import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
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
import { cn, handleFirestoreError, OperationType } from '../lib/utils';

export default function InterestsPage() {
  const { user: authUser } = useAuth();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchInterests = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'interests'), 
        where(tab === 'received' ? 'toId' : 'fromId', '==', authUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snap = await getDocs(q);
      const interestDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Fetch user profiles
      const enrichedInterests = await Promise.all(interestDocs.map(async (interest: any) => {
        const targetId = tab === 'received' ? interest.fromId : interest.toId;
        const userSnap = await getDoc(doc(db, 'users', targetId));
        return {
          ...interest,
          user: userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null
        };
      }));

      setInterests(enrichedInterests.filter(i => i.user));
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
      setInterests(prev => prev.map(i => i.id === interestId ? { ...i, status } : i));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `interests/${interestId}`);
    } finally {
      setProcessingId(interestId);
      setTimeout(() => setProcessingId(null), 500);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface">Interests</h1>
          <p className="text-on-surface-variant">Connect with members who share your vision</p>
        </div>

        <div className="flex p-1 bg-surface-container rounded-2xl border border-outline-variant">
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
                isProcessing={processingId === interest.id}
                onAccept={() => handleUpdateStatus(interest.id, 'accepted')}
                onDecline={() => handleUpdateStatus(interest.id, 'declined')}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function InterestCard({ interest, isReceived, isProcessing, onAccept, onDecline }: any) {
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
        
        {isReceived && interest.status === 'pending' ? (
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
          <p className="text-xs text-on-surface-variant italic">
            {interest.status === 'pending' ? "Waiting for response..." : interest.status === 'declined' ? "Interest declined." : ""}
          </p>
        )}
      </div>
    </motion.div>
  );
}
