import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, limit, serverTimestamp, addDoc, updateDoc, doc, collectionGroup, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  AlertCircle,
  Hourglass,
  CheckCircle,
  Eye,
  Heart,
  MessageSquare,
  Users,
  Search,
  ArrowRight,
  TrendingUp,
  Bell,
  Camera,
  Clock,
  ShieldCheck,
  Star,
  MapPin,
  ChevronRight,
  Loader2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, calculateMatchScore, resolveApprovalStatus, calculateAge, generateUniqueProfileId, isUserOnline } from '../lib/utils';

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  return `${parts[0]}/upload/c_fill,w_600,h_800,g_face,q_auto,f_auto/${parts[1]}`;
};

function timeAgo(date: Date): string {
  const seconds = Math.floor(
    (Date.now() - date.getTime()) / 1000
  );
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function calculateProfileStrength(profile: any): {
  percentage: number;
  hint: string;
} {
  const checks = [
    // Step 1 — Basic Info (Required)
    { field: profile?.profileType, label: 'profileType' },
    { field: profile?.name, label: 'name' },
    { field: profile?.lastName, label: 'lastName' },
    { field: profile?.mobileNumber, label: 'mobileNumber' },
    { field: profile?.dob, label: 'dob' },
    { field: profile?.citizenship, label: 'citizenship' },
    { field: profile?.countryLiving, label: 'countryLiving' },
    { field: profile?.cityLiving, label: 'cityLiving' },
    { field: profile?.denomination, label: 'denomination' },
    { field: profile?.churchName, label: 'churchName' },
    { field: profile?.churchCity, label: 'churchCity' },
    { field: profile?.maritalStatus, label: 'maritalStatus' },

    // Step 2 — Personal, Career & Lifestyle (Required)
    { field: profile?.height, label: 'height' },
    { field: profile?.weight, label: 'weight' },
    { field: profile?.bodyType, label: 'bodyType' },
    { field: profile?.complexion, label: 'complexion' },
    { field: profile?.physicalStatus, label: 'physicalStatus' },
    { field: profile?.motherTongue, label: 'motherTongue' },
    { field: profile?.education, label: 'education' },
    { field: profile?.profession, label: 'profession' },
    { field: profile?.dietaryHabits, label: 'dietaryHabits' },
    { field: profile?.drinkingHabits, label: 'drinkingHabits' },
    { field: profile?.smokingHabits, label: 'smokingHabits' },
    { field: profile?.aboutMe, label: 'aboutMe' },

    // Step 3 — Family Background (Required)
    { field: profile?.fathersName, label: 'fathersName' },
    { field: profile?.fathersOccupation, label: 'fathersOccupation' },
    { field: profile?.mothersName, label: 'mothersName' },
    { field: profile?.mothersOccupation, label: 'mothersOccupation' },
    { field: profile?.numberOfSiblings !== undefined && 
             profile?.numberOfSiblings !== '', 
      label: 'numberOfSiblings' },

    // Step 4 — Partner Preferences (Required)
    { field: profile?.partnerPreferences?.ageMin, label: 'prefAgeMin' },
    { field: profile?.partnerPreferences?.ageMax, label: 'prefAgeMax' },
    { field: profile?.partnerPreferences?.heightMin, label: 'prefHeightMin' },
    { field: profile?.partnerPreferences?.heightMax, label: 'prefHeightMax' },
    { field: profile?.partnerPreferences?.educationLevel, label: 'prefEducation' },
    { field: profile?.partnerPreferences?.country, label: 'prefCountry' },
    { field: profile?.partnerPreferences?.city, label: 'prefCity' },
    { field: profile?.partnerPreferences?.maritalStatus, label: 'prefMaritalStatus' },

    // Step 5 — Photos (Required)
    { field: profile?.photoUrl || profile?.photoURL || profile?.pendingPhotoUrl, label: 'photo' },
  ];

  const filled = checks.filter(c => !!c.field).length;
  const percentage = Math.round((filled / checks.length) * 100);

  const missing = checks.find(c => !c.field);

  const hintMap: Record<string, string> = {
    profileType: 'Select who this profile is for.',
    name: 'Add your first name to complete your profile.',
    lastName: 'Add your last name to complete your profile.',
    mobileNumber: 'Add your mobile number for verification.',
    dob: 'Add your date of birth to appear in searches.',
    citizenship: 'Add your citizenship to complete your profile.',
    countryLiving: 'Add the country you are living in.',
    cityLiving: 'Add the city you are living in.',
    denomination: 'Add your denomination to find faith-compatible matches.',
    churchName: 'Add your church name to strengthen your profile.',
    churchCity: 'Add your church city to complete your profile.',
    maritalStatus: 'Add your marital status to appear in searches.',
    height: 'Add your height to appear in partner searches.',
    weight: 'Add your weight to complete your profile.',
    bodyType: 'Add your body type to complete your profile.',
    complexion: 'Add your complexion to complete your profile.',
    physicalStatus: 'Add your physical status to complete your profile.',
    motherTongue: 'Add your mother tongue to find compatible matches.',
    education: 'Add your education details to reach more matches.',
    profession: 'Add your profession to complete your profile.',
    dietaryHabits: 'Add your dietary habits to complete your profile.',
    drinkingHabits: 'Add your drinking habits to complete your profile.',
    smokingHabits: 'Add your smoking habits to complete your profile.',
    aboutMe: 'Write an About Me to attract more interest.',
    fathersName: 'Add your father\'s name to complete family details.',
    fathersOccupation: 'Add your father\'s occupation to complete family details.',
    mothersName: 'Add your mother\'s name to complete family details.',
    mothersOccupation: 'Add your mother\'s occupation to complete family details.',
    numberOfSiblings: 'Add number of siblings to complete family details.',
    prefAgeMin: 'Add partner age preference to improve suggestions.',
    prefAgeMax: 'Add partner age preference to improve suggestions.',
    prefHeightMin: 'Add partner height preference to improve suggestions.',
    prefHeightMax: 'Add partner height preference to improve suggestions.',
    prefEducation: 'Add partner education preference to improve suggestions.',
    prefCountry: 'Add partner country preference to improve suggestions.',
    prefCity: 'Add partner city preference to improve suggestions.',
    prefMaritalStatus: 'Add partner marital status preference.',
    photo: 'Add a profile photo to get 5x more matches.',
  };

  const hint = missing
    ? hintMap[missing.label]
    : 'Your profile is complete! You are getting maximum visibility.';

  return { percentage, hint };
}

export default function DashboardPage() {
  const { user: authUser, profile, loading: authLoading } = useAuth();
  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([]);
  const [matchLoading, setMatchLoading] = useState(true);
  const [profileViewsCount, setProfileViewsCount] = useState(0);
  const [interestsCount, setInterestsCount] = useState(0);
  const [activeChatsCount, setActiveChatsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [topMatchScore, setTopMatchScore] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [viewsModalOpen, setViewsModalOpen] = useState(false);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [visitorsLoading, setVisitorsLoading] = useState(false);

  const handleOpenViewsModal = async () => {
    if (!authUser) return;
    setViewsModalOpen(true);
    setVisitorsLoading(true);
    try {
      const viewsSnap = await getDocs(
        query(
          collection(db, 'profileViews'),
          where('profileId', '==', authUser.uid)
        )
      );

      const sortedDocs = [...viewsSnap.docs].sort((a, b) => {
        const aTime = a.data().viewedAt?.seconds || 0;
        const bTime = b.data().viewedAt?.seconds || 0;
        return bTime - aTime;
      });

      const enrichedVisitors: any[] = [];
      for (const d of sortedDocs) {
        const viewData = d.data();
        const viewerId = viewData.viewerId;
        if (!viewerId) continue;
        
        try {
          const userDoc = await getDoc(doc(db, 'users', viewerId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const age = calculateAge(userData.dob, userData.age);
            enrichedVisitors.push({
              id: viewerId,
              name: userData.name || 'Someone',
              age: age || '',
              location: userData.cityLiving || userData.countryLiving || 'Unknown location',
              denomination: userData.denomination || 'Unknown denomination',
              photoUrl: getOptimizedImageUrl(userData.photoUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewerId}`,
              viewedAt: viewData.viewedAt?.toDate ? viewData.viewedAt.toDate() : new Date(),
            });
          }
        } catch (err) {
          console.error(`Error fetching user details for ${viewerId}:`, err);
        }
      }

      setVisitors(enrichedVisitors);
    } catch (err) {
      console.error('Error fetching visitors list:', err);
    } finally {
      setVisitorsLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!profile || !authUser) return;
      try {
        if (!profile.profileId) {
          const newId = await generateUniqueProfileId();
          await updateDoc(doc(db, 'users', authUser.uid), { profileId: newId });
        }
        setMatchLoading(true);

        // Task 1: The 24-Hour Cache Check (localStorage)
        const cachedStr = localStorage.getItem('kingdomAlliance_dailyMatches');
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr);
            const now = Date.now();
            const ageHours = (now - cached.generatedAt) / (1000 * 60 * 60);

            if (ageHours < 24 && Array.isArray(cached.profiles) && cached.profiles.length > 0) {
              setSuggestedMatches(cached.profiles);
              return; // Return early, do not run the engine
            }
          } catch (e) {
            console.error("Failed to parse cached matches", e);
          }
        }

        // TODO: Migrate this cache to the user's Firestore document (or a Cloud Function) once the platform scales, to ensure the daily batch remains consistent across multiple devices.

        // Force Cache Invalidation to purge legacy/unfiltered matches
        localStorage.removeItem('kingdomAlliance_dailyMatches');

        const currentUserUid = authUser.uid;

        // Task 2: The Ultimate Privacy Shield (Exclusion Set)
        const excludedUids = new Set<string>();
        excludedUids.add(currentUserUid);

        const [snapSent, snapReceived] = await Promise.all([
          getDocs(query(collection(db, 'interests'), where('fromId', '==', currentUserUid))),
          getDocs(query(collection(db, 'interests'), where('toId', '==', currentUserUid)))
        ]);

        snapSent.docs.forEach(doc => excludedUids.add(doc.data().toId));
        snapReceived.docs.forEach(doc => excludedUids.add(doc.data().fromId));

        // If there are blocked/reports collections, we would query them here:
        // const snapBlocks = await getDocs(query(collection(db, 'blocked'), where('blockerId', '==', currentUserUid)));
        // snapBlocks.docs.forEach(doc => excludedUids.add(doc.data().blockedId));

        // Task 3: The Mutual Hard Gates (Base Fetch)
        const myGender = profile.gender?.toLowerCase() || '';
        const myPreference = profile.partnerPreferences?.gender?.toLowerCase() ||
          (profile.profileType === 'bride' ? 'male' : 'female');

        const qCandidates = query(
          collection(db, 'users'),
          where('gender', '==', myPreference),
          where('isApproved', '==', true),
          limit(200)
        );
        const snapCandidates = await getDocs(qCandidates);

        let candidates = snapCandidates.docs.map(d => {
          const data = d.data();
          return { id: d.id, ...data, age: calculateAge(data.dob, data.age) } as any;
        });

        candidates = candidates.filter(u => {
          // 1. Mutual Gender Preference
          const uPreference = u.partnerPreferences?.gender?.toLowerCase() ||
            (u.profileType === 'bride' ? 'male' : 'female');
          if (uPreference !== myGender) return false;

          // 2. Age Range
          const uAge = u.age;
          const myMinAge = profile.partnerPreferences?.ageMin || 18;
          const myMaxAge = profile.partnerPreferences?.ageMax || 100;
          if (uAge < myMinAge || uAge > myMaxAge) return false;

          // Sanity check for account validity
          const uStatus = resolveApprovalStatus(u);
          if (uStatus === 'banned' || uStatus === 'pending' || uStatus === 'suspended' || u.isBanned || u.isSuspended) return false;

          return true;
        });

        // PRIVACY SHIELD: Strictly enforced on Dashboard to ensure Daily Matches only surface fresh, un-interacted profiles.
        const filteredCandidates = candidates.filter(user => !excludedUids.has(user.uid || user.id));
        console.log('Privacy Shield active. Candidates remaining:', filteredCandidates.length, '| Excluded UIDs:', excludedUids.size);
        candidates = filteredCandidates;

        // Task 4: The 90-Point Scoring Engine & Tiebreakers
        candidates = candidates.map(u => {
          let score = 0;

          // 1. Core Values (Max 40)
          if (u.denomination && profile.denomination && u.denomination === profile.denomination) {
            score += 40;
          }

          // 2. Location (Max 30)
          const myCity = (profile.cityLiving || profile.city || '').toLowerCase().trim();
          const myCountry = (profile.countryLiving || profile.country || '').toLowerCase().trim();
          const uCity = (u.cityLiving || u.city || '').toLowerCase().trim();
          const uCountry = (u.countryLiving || u.country || '').toLowerCase().trim();

          if (myCity && uCity && myCity === uCity) {
            score += 30;
          } else if (myCountry && uCountry && myCountry === uCountry) {
            score += 15;
          }

          // 3. Interests (Max 20)
          const myInterests = Array.isArray(profile.hobbies) ? profile.hobbies : [];
          const uInterests = Array.isArray(u.hobbies) ? u.hobbies : [];
          let interestMatchCount = 0;
          for (const myInterest of myInterests) {
            if (typeof myInterest === 'string' && uInterests.some(i => typeof i === 'string' && i.toLowerCase().trim() === myInterest.toLowerCase().trim())) {
              interestMatchCount++;
            }
          }
          score += Math.min(interestMatchCount * 5, 20);

          // Task 5.2 Compatibility Badge Percentage
          const matchPercentage = Math.round((score / 90) * 100);

          return { ...u, engineMatchScore: score, matchScore: matchPercentage };
        });

        // 4. Tiebreaker Optimization
        candidates.sort((a, b) => {
          if (b.engineMatchScore !== a.engineMatchScore) {
            return b.engineMatchScore - a.engineMatchScore;
          }
          const aActive = a.lastActive?.seconds || 0;
          const bActive = b.lastActive?.seconds || 0;
          return bActive - aActive;
        });

        // Task 5: State Save & UI Rendering
        const topCandidates = candidates.slice(0, 10);

        localStorage.setItem('kingdomAlliance_dailyMatches', JSON.stringify({
          profiles: topCandidates,
          generatedAt: Date.now()
        }));

        setSuggestedMatches(topCandidates);
      } catch (err) {
        console.error(err);
      } finally {
        setMatchLoading(false);
      }
    };

    if (profile && authUser) fetchSuggestions();
  }, [profile, authUser]);

  useEffect(() => {
    if (!profile || !authUser) return;
    const uid = authUser.uid;

    const fetchStats = async () => {
      try {
        setStatsLoading(true);

        // 1. Profile Views
        try {
          const viewsSnap = await getDocs(
            query(
              collection(db, 'profileViews'),
              where('profileId', '==', uid)
            )
          );
          setProfileViewsCount(viewsSnap.size);
        } catch (err) {
          console.error('Error fetching profile views:', err);
        }

        // 2. Interests Received (Pending Only)
        try {
          const interestsSnap = await getDocs(
            query(
              collection(db, 'interests'),
              where('toId', '==', uid),
              where('status', '==', 'pending')
            )
          );
          setInterestsCount(interestsSnap.size);
        } catch (err) {
          console.error('Error fetching interests count:', err);
        }

        // 3. Active Chats
        try {
          const [chats1, chats2] = await Promise.all([
            getDocs(query(
              collection(db, 'interests'),
              where('toId', '==', uid),
              where('status', '==', 'accepted')
            )),
            getDocs(query(
              collection(db, 'interests'),
              where('fromId', '==', uid),
              where('status', '==', 'accepted')
            ))
          ]);
          setActiveChatsCount(chats1.size + chats2.size);
        } catch (err) {
          console.error('Error fetching active chats:', err);
        }

        // 4. Unread Messages
        try {
          const unreadSnap = await getDocs(
            query(
              collectionGroup(db, 'messages'),
              where('receiverId', '==', uid),
              where('read', '==', false)
            )
          );
          setUnreadMessagesCount(unreadSnap.size);
        } catch (err) {
          console.error('Error fetching unread messages:', err);
        }

        // 5. Recent Activity from notifications
        try {
          const activitySnap = await getDocs(
            query(
              collection(db, 'notifications'),
              where('userId', '==', uid),
              orderBy('createdAt', 'desc'),
              limit(5)
            )
          );

          const activities = await Promise.all(
            activitySnap.docs.map(async (d) => {
              const data = d.data();
              const senderDoc = await getDoc(
                doc(db, 'users', data.fromId)
              );
              const senderName = senderDoc.exists()
                ? senderDoc.data()?.name
                : 'Someone';
              return {
                id: d.id,
                user: senderName,
                action: data.type === 'interest'
                  ? 'sent an interest'
                  : data.type === 'accepted'
                    ? 'accepted your interest'
                    : 'sent a message',
                time: data.createdAt?.toDate
                  ? timeAgo(data.createdAt.toDate())
                  : 'Recently',
                icon: data.type === 'message'
                  ? 'message'
                  : data.type === 'accepted'
                    ? 'accepted'
                    : 'interest',
                type: data.type
              };
            })
          );
          setRecentActivity(activities);
        } catch (err) {
          console.error('Error fetching recent activity:', err);
        }

      } catch (err) {
        console.error('Stats fetch error:', err);

      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [profile, authUser]);

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const isApproved = profile?.isApproved;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface">Your Dashboard</h1>
          <p className="text-on-surface-variant">Welcome back, {profile?.name}</p>
        </div>

        {!isApproved ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/10 border border-primary-container text-on-primary-container rounded-full animate-pulse shadow-sm">
            <Hourglass className="w-4 h-4" />
            <span className="font-label-lg">Approval Pending</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-2">
            {profile?.isApproved === false ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-full shadow-sm">
                <Clock className="w-4 h-4" />
                <span className="font-label-lg">Under Admin Review</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container/10 border border-secondary-container text-on-secondary-container rounded-full shadow-sm">
                <CheckCircle className="w-4 h-4" />
                <span className="font-label-lg">Profile Approved</span>
              </div>
            )}

            {profile?.photoStatus === 'pending' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-full shadow-sm">
                <Camera className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Photo Reviewing</span>
              </div>
            )}

            {profile?.photoStatus === 'rejected' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-error text-on-error rounded-full shadow-sm">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Photo Rejected</span>
              </div>
            )}
          </div>
        )}
      </div>

      {!isApproved ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low border border-outline-variant p-8 md:p-12 rounded-3xl text-center space-y-6 max-w-3xl mx-auto mt-12"
        >
          <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Hourglass className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-headline text-2xl text-on-surface">Awaiting Verification</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Your profile is currently being reviewed by our administrative team.
              To ensure the sanctity and safety of our community, we manually verify every profile.
              You'll be notified via email once your profile is approved and you can start meeting matches.
            </p>
          </div>
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-surface rounded-2xl border border-outline-variant flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-on-surface">Profile Status</p>
                <p className="text-xs text-on-surface-variant">Profile verification typically takes 24-48h.</p>
              </div>
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-outline-variant flex items-start gap-3">
              <Camera className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-on-surface">Photo Moderation</p>
                {profile?.photoStatus === 'pending' ? (
                  <p className="text-xs text-secondary font-medium">Your photos are currently in the moderation queue.</p>
                ) : profile?.photoStatus === 'rejected' ? (
                  <div className="space-y-2">
                    <p className="text-xs text-error font-medium">Photo rejected: {profile.photoRejectionReason}</p>
                    <Link to="/register" className="text-[10px] bg-error text-on-error px-2 py-1 rounded uppercase font-bold inline-block hover:scale-105 transition-transform">Re-upload Photos</Link>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant">Profiles with clear photos get 5x more matches.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Stats Grid */}
          {profile?.isApproved === false && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-3xl p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-headline text-2xl text-on-surface">Your profile is under review</h3>
                <p className="text-on-surface-variant">
                  To keep our community safe and sacred, each profile is manually verified.
                  We'll notify you within 24 hours.
                </p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Profile Views"
              value={statsLoading ? '...' : profileViewsCount}
              icon={Eye}
              trend="Total profile views"
              color="primary"
              onClick={handleOpenViewsModal}
            />
            <StatCard
              label="Interests Received"
              value={statsLoading ? '...' : interestsCount}
              icon={Heart}
              trend="Total interests received"
              color="secondary"
              to="/interests"
            />
            <StatCard
              label="Active Chats"
              value={statsLoading ? '...' : activeChatsCount}
              icon={MessageSquare}
              trend={`${unreadMessagesCount} unread messages`}
              color="primary"
              to="/messages"
            />

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Suggested Matches */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-2xl text-on-surface">Daily Match Suggestions</h2>
                <Link to="/matches" className="text-primary hover:underline font-label-lg flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchLoading ? (
                  [1, 2].map(i => <div key={i} className="aspect-[4/3] bg-surface-container-high rounded-3xl animate-pulse" />)
                ) : suggestedMatches.length === 0 ? (
                  <div className="col-span-full py-12 bg-surface-container rounded-3xl border border-outline-dashed flex flex-col items-center gap-4 text-center">
                    <Users className="w-10 h-10 text-on-surface-variant" />
                    <p className="text-on-surface-variant">Update your profile to get personalized suggestions</p>
                  </div>
                ) : (
                  suggestedMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      id={match.id}
                      name={match.name}
                      age={match.age}
                      location={match.location}
                      denomination={match.denomination}
                      matchScore={match.matchScore}
                      imageUrl={getOptimizedImageUrl(match.photoUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.id}`}
                      lastActive={match.lastActive}
                    />
                  ))
                )}
              </div>
            </div>


          </div>
        </>
      )}

      {/* Views Modal Overlay */}
      {viewsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setViewsModalOpen(false)}
        >
          <div 
            className="bg-surface-container-lowest border border-outline-variant rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="font-headline text-xl text-on-surface">Profile Viewers</h3>
                <p className="text-xs text-on-surface-variant">People who viewed your profile recently</p>
              </div>
              <button 
                onClick={() => setViewsModalOpen(false)}
                className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {visitorsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-on-surface-variant">Loading viewers...</p>
                </div>
              ) : visitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <Users className="w-12 h-12 text-on-surface-variant/50" />
                  <p className="text-on-surface-variant font-medium">No profile views yet</p>
                  <p className="text-xs text-on-surface-variant max-w-xs">Complete and share your profile to gain more visibility!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {visitors.map((visitor) => (
                    <div 
                      key={visitor.id} 
                      className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container/30 border border-outline-variant/50 hover:bg-surface-container/50 transition-colors"
                    >
                      <img 
                        src={visitor.photoUrl} 
                        alt={visitor.name} 
                        className="w-12 h-12 rounded-full object-cover border border-outline-variant"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <h4 className="font-bold text-on-surface truncate">{visitor.name}</h4>
                          {visitor.age && <span className="text-sm text-on-surface-variant">({visitor.age})</span>}
                        </div>
                        <p className="text-xs text-on-surface-variant truncate">
                          {visitor.denomination} • {visitor.location}
                        </p>
                        <p className="text-[10px] text-primary font-medium mt-1">
                          Viewed {timeAgo(visitor.viewedAt)}
                        </p>
                      </div>
                      <Link
                        to={`/profile/${visitor.id}`}
                        onClick={() => setViewsModalOpen(false)}
                        className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/95 text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-surface-container border-t border-outline-variant flex justify-end">
              <button
                onClick={() => setViewsModalOpen(false)}
                className="px-5 py-2 bg-surface-container-high hover:bg-surface-variant text-sm font-medium rounded-xl text-on-surface transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color, to, onClick }: any) {
  const CardContent = (
    <>
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        color === 'primary' ? "bg-primary-container" : "bg-secondary"
      )} />
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-label-lg text-on-surface-variant uppercase tracking-widest">{label}</p>
        <div className={cn(
          "p-2 rounded-xl transition-transform group-hover:scale-110",
          color === 'primary' ? "bg-primary-container/10 text-primary" : "bg-secondary-container/10 text-secondary"
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-4xl font-headline text-on-surface mb-2">{value}</p>
      <p className="text-xs text-on-surface-variant flex items-center gap-1">
        <Bell className="w-3 h-3" /> {trend}
      </p>
    </>
  );

  const classes = "block w-full text-left bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer";

  if (onClick) {
    return (
      <button onClick={onClick} className={classes} type="button">
        {CardContent}
      </button>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes}>
        {CardContent}
      </Link>
    );
  }

  return (
    <div className={classes}>
      {CardContent}
    </div>
  );
}

function MatchCard({ id, name, age, location, denomination, matchScore, imageUrl, lastActive }: any) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant hover:-translate-y-1 transition-all duration-300 group">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center gap-1.5 text-white shadow-xl">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-xs font-bold leading-none">{matchScore}% Match</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
          <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-center">
            <h3 className="font-headline text-xl text-on-surface">{name}, {age}</h3>
            {isUserOnline(lastActive) && (
              <div className="relative flex h-3 w-3 ml-2" title="Online Now">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
            )}
          </div>
          <p className="text-xs text-on-surface-variant flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {location}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-surface-container text-xs font-label-lg rounded-full border border-outline-variant">
            {denomination}
          </span>
        </div>
        <Link
          to={`/profile/${id}`}
          className="block w-full text-center py-2.5 bg-surface-container-high border border-outline-variant rounded-xl text-sm font-label-lg hover:bg-surface-variant transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, time, icon: Icon }: any) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/30 last:border-0 last:pb-0">
      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface truncate">
          <span className="font-bold text-on-surface">{user}</span> {action}
        </p>
        <p className="text-xs text-on-surface-variant">{time}</p>
      </div>
    </div>
  );
}
