import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, limit, serverTimestamp, addDoc } from 'firebase/firestore';
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
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, calculateMatchScore, resolveApprovalStatus } from '../lib/utils';

const getOptimizedImageUrl = (url: string) => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  return `${parts[0]}/upload/c_fill,w_600,h_800,g_face,q_auto,f_auto/${parts[1]}`;
};

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([]);
  const [matchLoading, setMatchLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!profile) return;
      try {
        const userRole = (profile.profileType || '').toLowerCase();
        let oppositeRole = 'bride';
        if (userRole === 'groom') {
          oppositeRole = 'bride';
        } else if (userRole === 'bride') {
          oppositeRole = 'groom';
        } else {
          oppositeRole = profile.gender === 'male' ? 'bride' : 'groom';
        }

        const q = query(
          collection(db, 'users'),
          where('profileType', '==', oppositeRole),
          where('isApproved', '==', true),
          limit(100)
        );
        const snap = await getDocs(q);
        const currentUserUid = profile.uid || profile.id;
        const docs = snap.docs
          .map(d => ({
            id: d.id,
            ...d.data()
          }) as any)
          .filter(u => {
            const uStatus = resolveApprovalStatus(u);
            const isApprovedUser = u.isApproved === true || uStatus === 'approved';
            const isNotSelf = u.uid !== currentUserUid && u.id !== currentUserUid;
            const isNotBannedOrPending = uStatus !== 'banned' && uStatus !== 'pending' && uStatus !== 'suspended' && !u.isBanned && !u.isSuspended;
            return isApprovedUser && isNotSelf && isNotBannedOrPending;
          })
          .map(u => ({
            ...u,
            matchScore: calculateMatchScore(profile, u)
          }))
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 2);
        
        setSuggestedMatches(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setMatchLoading(false);
      }
    };

    if (profile) fetchSuggestions();
  }, [profile]);

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
              value="128" 
              icon={Eye} 
              trend="+12% from last week" 
              color="primary"
            />
            <StatCard 
              label="Interests Received" 
              value="42" 
              icon={Heart} 
              trend="5 new today" 
              color="secondary"
            />
            <StatCard 
              label="Active Chats" 
              value="7" 
              icon={MessageSquare} 
              trend="2 unread messages" 
              color="primary"
            />
            <StatCard 
              label="Match Score" 
              value="85%" 
              icon={TrendingUp} 
              trend="Based on 12 criteria" 
              color="secondary"
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
                  [1,2].map(i => <div key={i} className="aspect-[4/3] bg-surface-container-high rounded-3xl animate-pulse" />)
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
                    />
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <h2 className="font-headline text-2xl text-on-surface">Recent Activity</h2>
              <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant space-y-4 shadow-sm">
                <ActivityItem 
                  user="Michael" 
                  action="viewed your profile" 
                  time="2 hours ago" 
                  icon={Eye} 
                />
                <ActivityItem 
                  user="Emily" 
                  action="sent an interest" 
                  time="5 hours ago" 
                  icon={Heart} 
                />
                <ActivityItem 
                  user="James" 
                  action="sent a message" 
                  time="Yesterday" 
                  icon={MessageSquare} 
                />
                <button className="w-full mt-4 py-3 text-center text-primary font-label-lg hover:bg-primary/5 rounded-xl transition-colors">
                  View All Activity
                </button>
              </div>
              
              {/* Profile Completion Card */}
              <div className="bg-primary-container p-6 rounded-3xl text-on-primary-container space-y-3 shadow-xl">
                <p className="font-label-lg uppercase tracking-widest text-xs opacity-80">Profile Strength</p>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-headline">75%</span>
                  <Link to={`/profile/${profile?.uid}`} className="text-sm font-bold underline">Complete Profile</Link>
                </div>
                <div className="w-full bg-on-primary-container/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: '75%' }} />
                </div>
                <p className="text-xs">Add family details to reach 90% strength and get more matches.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
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
    </div>
  );
}

function MatchCard({ id, name, age, location, denomination, matchScore, imageUrl }: any) {
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
          <h3 className="font-headline text-xl text-on-surface">{name}, {age}</h3>
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
