import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, 
  BookmarkCheck, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Users,
  Search,
  Loader2,
  Trash2,
  Star,
  Church
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, handleFirestoreError, OperationType, calculateMatchScore } from '../lib/utils';

export default function ShortlistsPage() {
  const { profile, user: authUser } = useAuth();
  const [shortlistedProfiles, setShortlistedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShortlisted = async () => {
    if (!authUser || !profile) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'shortlists'), where('userId', '==', authUser.uid));
      const snap = await getDocs(q);
      const shortlistDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const profiles = await Promise.all(shortlistDocs.map(async (item: any) => {
        const userSnap = await getDoc(doc(db, 'users', item.targetId));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          return {
            id: userSnap.id,
            shortlistDocId: item.id,
            ...userData,
            matchScore: calculateMatchScore(profile, userData)
          };
        }
        return null;
      }));

      setShortlistedProfiles(profiles.filter(p => p !== null));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlisted();
  }, [authUser, profile]);

  const handleRemove = async (shortlistId: string) => {
    try {
      await deleteDoc(doc(db, 'shortlists', shortlistId));
      setShortlistedProfiles(prev => prev.filter(p => p.shortlistDocId !== shortlistId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `shortlists/${shortlistId}`);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-on-surface">Shortlisted Profiles</h1>
        <p className="text-on-surface-variant">Profiles you've saved to review later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="aspect-[3/4] bg-surface-container-low rounded-[2rem] animate-pulse border border-outline-variant" />
          ))}
        </div>
      ) : shortlistedProfiles.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
            <Bookmark className="w-10 h-10" />
          </div>
          <h3 className="font-headline text-2xl text-on-surface">Your Shortlist is Empty</h3>
          <p className="text-on-surface-variant max-w-sm mx-auto">Explore matches and save profiles you're interested in for quick access.</p>
          <Link to="/matches" className="inline-block text-primary font-bold hover:underline">Start Exploring</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {shortlistedProfiles.map((user) => (
              <motion.div 
                key={user.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-ambient border border-outline-variant flex flex-col hover-lift"
              >
                <Link to={`/profile/${user.id}`} className="block relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                    alt={user.name} 
                    className="w-full h-full object-cover transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center gap-1.5 text-white shadow-xl">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="text-xs font-bold leading-none">{user.matchScore}% Match</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(user.shortlistDocId);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-on-secondary border border-secondary shadow-lg z-10"
                    title="Remove from Shorthlist"
                  >
                    <BookmarkCheck className="w-5 h-5" />
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <h3 className="font-headline text-2xl">{user.name}, {user.age}</h3>
                    <p className="text-xs font-label-lg flex items-center gap-1 opacity-90 tracking-wide">
                      <MapPin className="w-3.5 h-3.5" /> {user.location}
                    </p>
                  </div>
                </Link>
                
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-on-surface-variant text-sm line-clamp-2 leading-relaxed italic mb-6">
                    "{user.aboutMe || 'Looking for a faith partner.'}"
                  </p>

                  <div className="mt-auto flex gap-3">
                    <Link 
                      to={`/profile/${user.id}`}
                      className="flex-1 py-3 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                    >
                      View Profile
                    </Link>
                    <button 
                      onClick={() => handleRemove(user.shortlistDocId)}
                      className="p-3 bg-surface-container-high text-error rounded-2xl border border-outline-variant hover:bg-error/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
