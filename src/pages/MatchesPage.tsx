import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { sendEmail } from '../lib/email';
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
import { cn, handleFirestoreError, OperationType, calculateMatchScore, resolveApprovalStatus, calculateAge, isUserOnline } from '../lib/utils';
import toast from 'react-hot-toast';

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  return `${parts[0]}/upload/c_fill,w_600,h_800,g_face,q_auto,f_auto/${parts[1]}`;
};

const DENOMINATIONS = [
  'Catholic',
  'Protestant',
  'Orthodox',
  'Anglican / Episcopalian',
  'Baptist',
  'Methodist',
  'Lutheran',
  'Pentecostal',
  'Presbyterian',
  'Evangelical',
  'Non-denominational',
  'Other'
];

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
    searchTerm: ''
  });
  const [profileIdSearch, setProfileIdSearch] = useState('');
  const [searchToast, setSearchToast] = useState<{message: string, type: 'error'|'success'} | null>(null);

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

  const fetchMatches = async (isDirectSearch = false) => {
    setLoading(true);
    setSearchToast(null);
    try {
      const currentUserUid = profile?.uid || profile?.id;
      
      const excludedUids = new Set<string>();
      excludedUids.add(currentUserUid);
      const [snapSent, snapReceived] = await Promise.all([
        getDocs(query(collection(db, 'interests'), where('fromId', '==', currentUserUid))),
        getDocs(query(collection(db, 'interests'), where('toId', '==', currentUserUid)))
      ]);
      snapSent.docs.forEach(doc => excludedUids.add(doc.data().toId));
      snapReceived.docs.forEach(doc => excludedUids.add(doc.data().fromId));

      const interests = [
        ...snapSent.docs.map(doc => doc.data()),
        ...snapReceived.docs.map(doc => doc.data())
      ];

      // Users the current user has explicitly declined/blocked
      const blockedUids = new Set(
        interests
          .filter(i => i.status === 'declined' && i.declinedBy === currentUserUid)
          .map(i => i.fromId === currentUserUid ? i.toId : i.fromId)
      );

      // Users who have explicitly declined/blocked the current user
      const blockedByOthers = new Set(
        interests
          .filter(i => i.status === 'declined' && i.declinedBy !== currentUserUid)
          .map(i => i.fromId === currentUserUid ? i.toId : i.fromId)
      );

      if (isDirectSearch && profileIdSearch) {
        if (profileIdSearch.trim().length < 6) {
          setSearchToast({ message: "Profile ID must be at least 6 characters", type: 'error' });
          setLoading(false);
          return;
        }
        
        const normalizedId = profileIdSearch.trim().toUpperCase();
        const q = query(collection(db, 'users'), where('profileId', '==', normalizedId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const searchedUser = { id: snap.docs[0].id, ...docData, age: calculateAge(docData.dob, docData.age) } as any;
          searchedUser.matchScore = calculateMatchScore(profile, searchedUser);
          
          // 1. STRICT PRIVACY SHIELD: Do not allow bypassed searches for blocked/excluded users
          if (
            searchedUser.id === currentUserUid || 
            searchedUser.uid === currentUserUid ||
            blockedUids.has(searchedUser.id) || blockedUids.has(searchedUser.uid) ||
            blockedByOthers.has(searchedUser.id) || blockedByOthers.has(searchedUser.uid)
          ) {
            toast.error('This profile is unavailable.');
            setLoading(false);
            return; 
          }
          
          // 2. FORCE UI UPDATE: Update the grid with ONLY this user.
          setMatches([searchedUser]); 
          
          // 3. SUCCESS UX
          toast.success('Profile Found!');
          
          // 4. CRITICAL HALT: Stop execution immediately so the standard fetch doesn't run and overwrite the state.
          setLoading(false);
          return; 
        } else {
          toast.error('No Profile Found');
          setMatches([]);
          setLoading(false);
          return;
        }
      }

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
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      let docs = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          const calculatedAge = data.dob
            ? calculateAge(data.dob, data.age)
            : data.age || 0;
          return {
            id: doc.id,
            ...data,
            age: calculatedAge
          } as any;
        })
        .filter(u => {
          const uStatus = resolveApprovalStatus(u);
          const isApprovedUser = u.isApproved === true || uStatus === 'approved';
          const isNotSelf = u.uid !== currentUserUid && u.id !== currentUserUid;
          const isNotBannedOrPending = uStatus !== 'banned' && uStatus !== 'pending' && uStatus !== 'suspended' && !u.isBanned && !u.isSuspended;
          return isApprovedUser && isNotSelf && isNotBannedOrPending;
        });

      // Apply Filters Locally for complex ones
      docs = docs.filter(u => {
        const ageMatch = (!u.age || u.age === 0 ||
          (u.age >= filters.minAge && u.age <= filters.maxAge));
        const denomMatch = filters.denomination === 'All' || 
          u.denomination?.toLowerCase() === 
            filters.denomination?.toLowerCase();
        const locMatch = !filters.location || 
          u.cityLiving?.toLowerCase().includes(
            filters.location.toLowerCase()
          ) ||
          u.countryLiving?.toLowerCase().includes(
            filters.location.toLowerCase()
          ) ||
          u.location?.toLowerCase().includes(
            filters.location.toLowerCase()
          );
        const eduMatch = filters.education === 'All' || 
          u.education?.toLowerCase().includes(
            filters.education.toLowerCase()
          );
        const martMatch = filters.maritalStatus === 'All' || u.maritalStatus === filters.maritalStatus;
        const profMatch = !filters.profession || u.profession?.toLowerCase().includes(filters.profession.toLowerCase());
        // Height stored as string e.g "5'8" — skip
        // filter if no UI height filter is active
        const heightMatch = 
          (filters.minHeight === 0 && filters.maxHeight === 250) 
            ? true 
            : (() => {
                if (!u.height) return true;
                const heightStr = String(u.height);
                const parts = heightStr.split("'");
                const feet = parseInt(parts[0]) || 0;
                const inches = parseInt(parts[1]) || 0;
                const totalInches = (feet * 12) + inches;
                return totalInches >= filters.minHeight && 
                       totalInches <= filters.maxHeight;
              })();
        const verifyMatch = !filters.verifiedOnly || u.emailVerified;
        // Search Term (Name or Profession)
        const nameMatch = !filters.searchTerm || u.name?.toLowerCase().includes(filters.searchTerm.toLowerCase());
        
        let activeMatch = true;
        if (filters.recentlyActive) {
          if (u.lastActive) {
            const twentyFourHoursAgo = new Date(
              Date.now() - 24 * 60 * 60 * 1000
            );
            const lastActiveDate = u.lastActive?.toDate
              ? u.lastActive.toDate()
              : new Date(u.lastActive);
            activeMatch = lastActiveDate >= twentyFourHoursAgo;
          } else {
            activeMatch = false;
          }
        }

        return ageMatch && denomMatch && locMatch && eduMatch && martMatch && profMatch && heightMatch && verifyMatch && activeMatch && nameMatch && !excludedUids.has(u.uid || u.id);
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
                    <option value="All">All</option>
                    {DENOMINATIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
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
                    <option value="All">All</option>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor">Bachelor's</option>
                    <option value="Master">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="Professional">Professional</option>
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
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={profileIdSearch}
                      onChange={(e) => setProfileIdSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchMatches(true)}
                      placeholder="e.g. AB1234"
                      className="w-full p-3 bg-surface rounded-xl border border-outline-variant text-sm focus:ring-2 focus:ring-primary outline-none uppercase" 
                    />
                    <button 
                      onClick={() => fetchMatches(true)}
                      className="px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                      Find
                    </button>
                  </div>
                  {searchToast && (
                    <p className={`text-xs font-bold ${searchToast.type === 'error' ? 'text-error' : 'text-primary'}`}>
                      {searchToast.message}
                    </p>
                  )}
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
            onClick={() => {
              setFilters({
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
                searchTerm: ''
              });
              setProfileIdSearch('');
            }}
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
      const connectionId = [currentUser.uid, user.id].sort().join('_');
      await setDoc(doc(db, 'interests', connectionId), {
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

      // Fetch target user email to dispatch notification
      const targetUserId = user.id;
      const targetUserSnap = await getDoc(doc(db, 'users', targetUserId));
      if (targetUserSnap.exists() && targetUserSnap.data()?.email) {
          await sendEmail({
              to_email: targetUserSnap.data().email,
              type: 'connection_request',
              senderName: currentUser.displayName || 'A member'
          });
      }

      setInterestSent(true);
      toast.success(`Interest successfully sent to ${user.name}!`);
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
            <div className="flex items-center">
              <h3 className="font-headline text-2xl">{user.name}, {user.age}</h3>
              {isUserOnline(user.lastActive) && (
                <div className="relative flex h-3 w-3 ml-2" title="Online Now">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
              )}
            </div>
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
