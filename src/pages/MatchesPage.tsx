import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Church, 
  MessageCircle,
  X,
  Star,
  ChevronRight,
  Filter,
  Users,
  Bookmark,
  BookmarkCheck,
  Check,
  Loader2,
  Clock,
  Briefcase,
  GraduationCap,
  Ruler
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, handleFirestoreError, OperationType, calculateMatchScore, resolveApprovalStatus } from '../lib/utils';

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  return `${parts[0]}/upload/c_fill,w_600,h_800,g_face,q_auto,f_auto/${parts[1]}`;
};

export default function MatchesPage() {
  const { profile, user: authUser } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 60,
    denomination: 'All',
    location: '',
    education: 'All',
    profession: '',
    minHeight: 0,
    maxHeight: 250,
    maritalStatus: 'All',
    verifiedOnly: false,
    recentlyActive: false,
    profileId: '',
    searchTerm: ''
  });

  const fetchShortlists = async () => {
    if (!authUser) return;
    try {
      const q = query(collection(db, 'shortlists'), where('userId', '==', authUser.uid));
      const snap = await getDocs(q);
      setShortlistedIds(snap.docs.map(doc => doc.data().targetId));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const userRole = (profile?.profileType || '').toLowerCase();
      let oppositeRole = 'bride';
      if (userRole === 'groom') {
        oppositeRole = 'bride';
      } else if (userRole === 'bride') {
        oppositeRole = 'groom';
      } else {
        oppositeRole = profile?.gender === 'male' ? 'bride' : 'groom';
      }

      let q = query(
        collection(db, 'users'), 
        where('profileType', '==', oppositeRole),
        where('isApproved', '==', true),
        limit(100) // Fetch more to filter locally if needed, or refine queries
      );
      
      const querySnapshot = await getDocs(q);
      const currentUserUid = profile?.uid || profile?.id;
      let docs = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as any)
        .filter(u => {
          const uStatus = resolveApprovalStatus(u);
          const isApprovedUser = u.isApproved === true || uStatus === 'approved';
          const isNotSelf = u.uid !== currentUserUid && u.id !== currentUserUid;
          const isNotBannedOrPending = uStatus !== 'banned' && uStatus !== 'pending' && uStatus !== 'suspended' && !u.isBanned && !u.isSuspended;
          return isApprovedUser && isNotSelf && isNotBannedOrPending;
        });

      // Apply Filters Locally for complex ones
      docs = docs.filter(u => {
        const ageMatch = u.age >= filters.minAge && u.age <= filters.maxAge;
        const denomMatch = filters.denomination === 'All' || u.denomination === filters.denomination;
        const locMatch = !filters.location || u.location?.toLowerCase().includes(filters.location.toLowerCase());
        const eduMatch = filters.education === 'All' || u.educationLevel === filters.education;
        const martMatch = filters.maritalStatus === 'All' || u.maritalStatus === filters.maritalStatus;
        const profMatch = !filters.profession || u.profession?.toLowerCase().includes(filters.profession.toLowerCase());
        const heightMatch = u.height >= filters.minHeight && u.height <= filters.maxHeight;
        const verifyMatch = !filters.verifiedOnly || u.emailVerified;
        
        // Search Term (Name or Profession)
        const nameMatch = !filters.searchTerm || u.name?.toLowerCase().includes(filters.searchTerm.toLowerCase());
        
        // Profile ID Match (Check UID or custom profileId if exists)
        const idMatch = !filters.profileId || 
                        u.id?.toLowerCase().includes(filters.profileId.toLowerCase()) || 
                        u.uid?.toLowerCase().includes(filters.profileId.toLowerCase()) ||
                        (u.profileId && u.profileId.toLowerCase().includes(filters.profileId.toLowerCase()));

        // Recently active (last 7 days)
        let activeMatch = true;
        if (filters.recentlyActive && u.updatedAt) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          activeMatch = u.updatedAt.toDate() >= sevenDaysAgo;
        }

        return ageMatch && denomMatch && locMatch && eduMatch && martMatch && profMatch && heightMatch && verifyMatch && activeMatch && nameMatch && idMatch;
      });


      // Calculate scores and sort
      const scoredDocs = docs.map(u => ({
        ...u,
        matchScore: calculateMatchScore(profile, u)
      })).sort((a, b) => b.matchScore - a.matchScore);

      setMatches(scoredDocs);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchMatches();
      fetchShortlists();
    }
  }, [profile, filters]);

  const handleShortlistToggle = async (targetId: string) => {
    if (!authUser) return;
    try {
      if (shortlistedIds.includes(targetId)) {
        // Remove
        const q = query(
          collection(db, 'shortlists'), 
          where('userId', '==', authUser.uid),
          where('targetId', '==', targetId)
        );
        const snap = await getDocs(q);
        snap.docs.forEach(d => deleteDoc(doc(db, 'shortlists', d.id)));
        setShortlistedIds(prev => prev.filter(id => id !== targetId));
      } else {
        // Add
        await addDoc(collection(db, 'shortlists'), {
          userId: authUser.uid,
          targetId,
          createdAt: serverTimestamp()
        });
        setShortlistedIds(prev => [...prev, targetId]);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'shortlists');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface">Find Your Match</h1>
          <p className="text-on-surface-variant">Christian singles sharing your faith and values</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl border border-outline-variant transition-all font-label-lg whitespace-nowrap",
              showFilters ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20" : "bg-surface-container-low text-on-surface hover:bg-surface-variant"
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant shadow-lg space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Age Range */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Age Range</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={filters.minAge} 
                      onChange={(e) => setFilters({...filters, minAge: parseInt(e.target.value)})}
                      className="w-full p-3 bg-surface rounded-xl border border-outline-variant text-sm focus:ring-2 focus:ring-primary outline-none" 
                    />
                    <span className="text-on-surface-variant">to</span>
                    <input 
                      type="number" 
                      value={filters.maxAge} 
                      onChange={(e) => setFilters({...filters, maxAge: parseInt(e.target.value)})}
                      className="w-full p-3 bg-surface rounded-xl border border-outline-variant text-sm focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                </div>

                {/* Denomination */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Denomination</label>
                  <select 
                    value={filters.denomination}
                    onChange={(e) => setFilters({...filters, denomination: e.target.value})}
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option>All</option>
                    <option>Catholic</option>
                    <option>Protestant</option>
                    <option>Baptist</option>
                    <option>Orthodox</option>
                    <option>Non-Denominational</option>
                  </select>
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Education</label>
                  <select 
                    value={filters.education}
                    onChange={(e) => setFilters({...filters, education: e.target.value})}
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option>All</option>
                    <option>School</option>
                    <option>Bachelor</option>
                    <option>Master</option>
                    <option>Doctorate</option>
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input 
                      type="text" 
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      placeholder="City or State"
                      className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border border-outline-variant text-sm focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                </div>

                {/* Profile ID Filter */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Profile ID</label>
                  <input 
                    type="text" 
                    value={filters.profileId}
                    onChange={(e) => setFilters({...filters, profileId: e.target.value})}
                    placeholder="e.g. AB1234"
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant text-sm focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
              </div>

              {/* Advanced Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-outline-variant/30">
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Profession</label>
                  <input 
                    type="text" 
                    value={filters.profession}
                    onChange={(e) => setFilters({...filters, profession: e.target.value})}
                    placeholder="e.g. Engineer"
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant text-sm focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Marital Status</label>
                  <select 
                    value={filters.maritalStatus}
                    onChange={(e) => setFilters({...filters, maritalStatus: e.target.value})}
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant text-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option>All</option>
                    <option>Never Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                    <option>Awaiting Divorce</option>
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-center gap-8 self-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => setFilters({...filters, verifiedOnly: !filters.verifiedOnly})}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-all duration-300",
                        filters.verifiedOnly ? "bg-primary" : "bg-outline-variant"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                        filters.verifiedOnly ? "left-7" : "left-1"
                      )} />
                    </div>
                    <span className="text-sm font-label-lg text-on-surface uppercase tracking-wider">Verified Only</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => setFilters({...filters, recentlyActive: !filters.recentlyActive})}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-all duration-300",
                        filters.recentlyActive ? "bg-secondary" : "bg-outline-variant"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                        filters.recentlyActive ? "left-7" : "left-1"
                      )} />
                    </div>
                    <span className="text-sm font-label-lg text-on-surface uppercase tracking-wider">Recently Active</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-[3/4] bg-surface-container-low rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="font-headline text-2xl text-on-surface">No Matches Found</h3>
          <p className="text-on-surface-variant max-w-sm mx-auto">Try adjusting your filters or completing your profile to get better recommendations.</p>
          <button 
            onClick={() => setFilters({
              minAge: 18,
              maxAge: 60,
              denomination: 'All',
              location: '',
              education: 'All',
              profession: '',
              minHeight: 0,
              maxHeight: 250,
              maritalStatus: 'All',
              verifiedOnly: false,
              recentlyActive: false,
              profileId: '',
              searchTerm: ''
            })}
            className="text-primary font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matches.map((user) => (
            <MatchProfileCard 
              key={user.id} 
              user={user} 
              isShortlisted={shortlistedIds.includes(user.id)}
              onShortlist={() => handleShortlistToggle(user.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchProfileCard({ user, isShortlisted, onShortlist }: { user: any, isShortlisted: boolean, onShortlist: () => void }) {
  const { user: currentUser } = useAuth();
  const [interestSent, setInterestSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (interestSent || sending || !currentUser) return;
    
    setSending(true);
    try {
      // Add interest document
      await addDoc(collection(db, 'interests'), {
        fromId: currentUser.uid,
        toId: user.id,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Add notification document
      await addDoc(collection(db, 'notifications'), {
        userId: user.id,
        fromId: currentUser.uid,
        type: 'interest',
        title: 'New Interest Expressed',
        message: `${currentUser.displayName || 'A member'} has expressed interest in your profile.`,
        read: false,
        createdAt: serverTimestamp()
      });

      setInterestSent(true);
      // Success pop message (alert for now, could be a toast)
      alert(`Interest successfully sent to ${user.name}! They will be notified via email.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'interests');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-ambient border border-outline-variant flex flex-col hover-lift group"
    >
      <Link to={`/profile/${user.id}`} className="block relative aspect-[3/4] overflow-hidden">
        <img 
          src={getOptimizedImageUrl(user.photoUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
          alt={user.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
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
            e.stopPropagation();
            onShortlist();
          }}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-full backdrop-blur-md border transition-all z-10",
            isShortlisted 
              ? "bg-secondary text-on-secondary border-secondary shadow-lg" 
              : "bg-white/20 text-white border-white/30 hover:bg-white/40"
          )}
        >
          {isShortlisted ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-2xl">{user.name}, {user.age}</h3>
            {user.emailVerified && (
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center border border-white/20" title="Verified Member">
                <Check className="w-3 h-3 text-on-primary" />
              </div>
            )}
          </div>
          <p className="text-xs font-label-lg flex items-center gap-1 opacity-90 tracking-wide">
            <MapPin className="w-3.5 h-3.5" /> {user.location}
          </p>
        </div>
      </Link>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full border border-outline-variant flex items-center gap-1 uppercase tracking-widest">
            <Church className="w-3 h-3 text-primary" /> {user.denomination}
          </span>
          {user.educationLevel && (
            <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full border border-outline-variant flex items-center gap-1 uppercase tracking-widest">
              <GraduationCap className="w-3 h-3 text-secondary" /> {user.educationLevel}
            </span>
          )}
        </div>

        <p className="text-on-surface-variant text-sm line-clamp-2 leading-relaxed italic mb-6">
          "{user.aboutMe || 'Peace be with you. I am looking for a partner to share my faith journey with.'}"
        </p>

        <div className="mt-auto grid grid-cols-4 gap-2">
          <button 
            onClick={handleSendInterest}
            disabled={interestSent || sending}
            className={cn(
              "col-span-3 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all",
              interestSent 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-primary text-on-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            )}
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : interestSent ? 'Interest Sent' : 'Send Interest'}
            {!sending && !interestSent && <Heart className="w-5 h-5" />}
          </button>
          <Link 
            to={`/messages?chatWith=${user.id}`}
            className="flex items-center justify-center bg-surface-container-high text-on-surface rounded-2xl border border-outline-variant hover:bg-surface-variant transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
