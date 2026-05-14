import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, addDoc, serverTimestamp, setDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { useSettings } from '../lib/SettingsContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  MapPin, 
  Church, 
  Briefcase, 
  GraduationCap, 
  Ruler, 
  Users,
  ShieldAlert,
  Calendar,
  ChevronLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Image as ImageIcon,
  Star,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Cloud,
  HardDrive
} from 'lucide-react';
import { cn, handleFirestoreError, OperationType, calculateMatchScore } from '../lib/utils';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, profile: currentProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [shortlistId, setShortlistId] = useState<string | null>(null);
  const [togglingShortlist, setTogglingShortlist] = useState(false);
  const [isEditingGallery, setIsEditingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
      if (!id) return;
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'users', id));
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
          
          if (currentUser) {
            // Check interest
            const interestsRef = collection(db, 'interests');
            const qInterest = query(interestsRef, where('fromId', '==', currentUser.uid), where('toId', '==', id));
            const interestsSnap = await getDocs(qInterest);
            if (!interestsSnap.empty) setInterestSent(true);

            // Check shortlist
            const shortlistRef = collection(db, 'shortlists');
            const qShortlist = query(shortlistRef, where('userId', '==', currentUser.uid), where('targetId', '==', id));
            const shortlistSnap = await getDocs(qShortlist);
            if (!shortlistSnap.empty) {
              setIsShortlisted(true);
              setShortlistId(shortlistSnap.docs[0].id);
            }
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, [id, currentUser]);

  const handleToggleShortlist = async () => {
    if (!currentUser || !id || togglingShortlist) return;
    setTogglingShortlist(true);
    try {
      if (isShortlisted && shortlistId) {
        await deleteDoc(doc(db, 'shortlists', shortlistId));
        setIsShortlisted(false);
        setShortlistId(null);
      } else {
        const docRef = await addDoc(collection(db, 'shortlists'), {
          userId: currentUser.uid,
          targetId: id,
          createdAt: serverTimestamp()
        });
        setIsShortlisted(true);
        setShortlistId(docRef.id);
      }
    } catch (err) {
      handleFirestoreError(err, isShortlisted ? OperationType.DELETE : OperationType.CREATE, 'shortlists');
    } finally {
      setTogglingShortlist(false);
    }
  };
  
  const { settings } = useSettings();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // RULE: 1MB size limit
    if (file.size > 1024 * 1024) {
      setGalleryError("File size exceeds 1MB limit.");
      return;
    }

    // RULE: Max 3 photos
    const currentGallery = profile.gallery || [];
    if (currentGallery.length >= 3) {
      setGalleryError("Maximum 3 photos allowed.");
      return;
    }

    setUploadingPhoto(true);
    setGalleryError(null);
    try {
      const url = await uploadToCloudinary(file, settings.cloudinaryCloudName, settings.cloudinaryUploadPreset);
      
      const newPhoto = {
        id: Math.random().toString(36).substring(7),
        url,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const updatedGallery = [...currentGallery, newPhoto];
      await updateDoc(doc(db, 'users', currentUser.uid), {
        gallery: updatedGallery
      });

      setProfile({ ...profile, gallery: updatedGallery });
    } catch (err: any) {
      setGalleryError(err.message || "Upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!currentUser || !window.confirm("Remove this photo?")) return;
    
    const updatedGallery = profile.gallery.filter((p: any) => p.id !== photoId);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        gallery: updatedGallery
      });
      setProfile({ ...profile, gallery: updatedGallery });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const handleMovePhoto = async (index: number, direction: 'up' | 'down') => {
    if (!currentUser) return;
    const newGallery = [...profile.gallery];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newGallery.length) return;
    
    [newGallery[index], newGallery[newIndex]] = [newGallery[newIndex], newGallery[index]];
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        gallery: newGallery
      });
      setProfile({ ...profile, gallery: newGallery });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };
  const handleSendInterest = async () => {
    if (!currentUser || !id || sendingInterest || interestSent) return;

    // RULE: Same gender interest restriction
    if (currentProfile && profile) {
      if (currentProfile.gender === profile.gender) {
        alert(`As a ${currentProfile.gender}, you can only express interest to ${currentProfile.gender === 'Bride' ? 'Grooms' : 'Brides'}.`);
        return;
      }
    }

    setSendingInterest(true);
    try {
      await addDoc(collection(db, 'interests'), {
        fromId: currentUser.uid,
        toId: id,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setInterestSent(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'interests');
    } finally {
      setSendingInterest(false);
    }
  };

  if (loading) return <div>Loading Profile...</div>;
  if (!profile) return <div>Profile not found</div>;

  const isOwnProfile = currentUser?.uid === id;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-lg"
      >
        <ChevronLeft className="w-5 h-5" /> Back to matches
      </button>

      {/* Hero / Header Card */}
      <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden shadow-2xl border border-outline-variant grid grid-cols-1 md:grid-cols-5 h-full">
        <div className="md:col-span-2 aspect-[4/5] md:aspect-auto relative group">
          <img 
            src={profile.photoUrl || profile.pendingPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} 
            alt={profile.name} 
            className="w-full h-full object-cover" 
          />
          {profile.photoStatus === 'pending' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-6 text-center">
              <div className="text-white space-y-2">
                <ShieldAlert className="w-10 h-10 mx-auto" />
                <p className="font-headline text-lg">Photo Pending Approval</p>
                <p className="text-xs opacity-80">Visible only to you and admins until verified.</p>
              </div>
            </div>
          )}
          {profile.photoStatus === 'rejected' && isOwnProfile && (
            <div className="absolute inset-0 bg-error/60 backdrop-blur-md flex items-center justify-center p-6 text-center">
               <div className="text-white space-y-2">
                <XCircle className="w-10 h-10 mx-auto" />
                <p className="font-headline text-lg">Photo Rejected</p>
                <p className="text-xs font-bold">{profile.photoRejectionReason}</p>
                <button 
                  onClick={() => navigate('/register?edit=true')}
                  className="mt-4 px-4 py-2 bg-white text-error rounded-full text-xs font-bold hover:scale-105 transition-transform"
                >
                  Upload New Photo
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="md:col-span-3 p-8 lg:p-12 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-headline text-4xl lg:text-5xl text-on-surface mb-2">{profile.name}, {profile.age}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-on-surface-variant flex items-center gap-2 font-label-lg">
                    <MapPin className="w-4 h-4 text-primary" /> {profile.location}
                  </p>
                  {!isOwnProfile && currentProfile && (
                    <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Star className="w-4 h-4 fill-primary" />
                      <span className="text-xs font-bold leading-none">{calculateMatchScore(currentProfile, profile)}% Match</span>
                    </div>
                  )}
                </div>
              </div>
              {profile.isApproved && (
                <div className="px-4 py-1.5 bg-secondary-container/10 border border-secondary-container text-on-secondary-container rounded-full flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Verified Member</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              <ProfileMeta icon={Church} label="Denomination" value={profile.denomination} />
              <ProfileMeta icon={Briefcase} label="Profession" value={profile.profession} />
              <ProfileMeta icon={GraduationCap} label="Education" value={profile.education} />
              <ProfileMeta icon={Ruler} label="Height" value={`${profile.height} cm`} />
              <ProfileMeta icon={Users} label="Family Info" value={profile.familyDetails || 'Not shared'} />
              <ProfileMeta icon={Calendar} label="Member Since" value={new Date(profile.createdAt?.seconds * 1000).toLocaleDateString()} />
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-outline-variant">
              <button 
                onClick={handleToggleShortlist}
                disabled={togglingShortlist}
                className={cn(
                  "px-6 flex items-center justify-center gap-2 border rounded-2xl transition-all font-label-lg",
                  isShortlisted 
                    ? "bg-secondary text-on-secondary border-secondary" 
                    : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-variant"
                )}
              >
                {togglingShortlist ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isShortlisted ? (
                  <><BookmarkCheck className="w-5 h-5" /> Saved</>
                ) : (
                  <><Bookmark className="w-5 h-5" /> Shortlist</>
                )}
              </button>
              <button 
                onClick={handleSendInterest}
                disabled={interestSent || sendingInterest}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-label-lg transition-all shadow-xl hover:-translate-y-1",
                  interestSent 
                    ? "bg-surface-container-high text-on-surface-variant cursor-default shadow-none border border-outline-variant" 
                    : "bg-primary text-on-primary hover:shadow-primary/20"
                )}
              >
                {interestSent ? (
                  <><CheckCircle2 className="w-6 h-6" /> Interest Sent</>
                ) : sendingInterest ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <><Heart className="w-6 h-6" /> Send Interest</>
                )}
              </button>
              <button 
                onClick={() => navigate(`/messages?chatWith=${profile.id}`)}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-2xl font-label-lg hover:bg-surface-variant transition-all hover:-translate-y-1"
              >
                <MessageSquare className="w-6 h-6 text-primary" /> Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface-container-lowest p-8 lg:p-12 rounded-[2.5rem] border border-outline-variant shadow-sm space-y-6">
            <h2 className="font-headline text-3xl text-on-surface">About Me</h2>
            <p className="text-on-surface-variant leading-relaxed font-body-lg">
              {profile.aboutMe || "I am a person of faith seeking a partner to build a God-centered life together. I value tradition, family, and spiritual growth."}
            </p>
          </section>

          {(isOwnProfile || (profile.gallery && profile.gallery.filter((p: any) => p.status === 'approved').length > 0)) && (
            <section className="bg-surface-container-lowest p-8 lg:p-12 rounded-[2.5rem] border border-outline-variant shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-3xl text-on-surface">Gallery</h2>
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsEditingGallery(!isEditingGallery)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                      isEditingGallery ? "bg-primary text-on-primary" : "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    {isEditingGallery ? 'Done Editing' : 'Edit Photos'}
                  </button>
                )}
              </div>

              {galleryError && (
                <div className="p-3 bg-error/10 text-error rounded-xl text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> {galleryError}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {profile.gallery?.map((photo: any, idx: number) => {
                    const isPending = photo.status === 'pending';
                    const isRejected = photo.status === 'rejected';
                    
                    if (!isOwnProfile && (isPending || isRejected)) return null;

                    return (
                      <motion.div 
                        layout
                        key={photo.id} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant group bg-surface-variant/10"
                      >
                        <img src={photo.url} alt="Gallery item" className="w-full h-full object-cover" />
                        
                        {/* Overlay for status */}
                        {isOwnProfile && (isPending || isRejected) && (
                          <div className={cn(
                            "absolute inset-0 flex items-center justify-center backdrop-blur-[2px]",
                            isPending ? "bg-black/20" : "bg-error/20"
                          )}>
                            <div className="text-white text-center">
                              {isPending ? <Clock className="w-8 h-8 mx-auto" /> : <XCircle className="w-8 h-8 mx-auto" />}
                              <p className="text-[10px] font-bold uppercase tracking-widest mt-1">
                                {isPending ? 'Pending Approval' : 'Rejected'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Edit Controls */}
                        {isEditingGallery && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleMovePhoto(idx, 'up')}
                                disabled={idx === 0}
                                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full disabled:opacity-30"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleMovePhoto(idx, 'down')}
                                disabled={idx === profile.gallery.length - 1}
                                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full disabled:opacity-30"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                            <button 
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="w-full flex items-center justify-center gap-2 py-2 bg-error text-white rounded-xl text-xs font-bold hover:bg-error/80"
                            >
                              <Trash2 className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Add Photo Button (Point 2) */}
                {isOwnProfile && (!profile.gallery || profile.gallery.length < 3) && (
                  <div className="relative aspect-square">
                    {uploadingPhoto ? (
                      <div className="w-full h-full border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-3 bg-primary/5 animate-pulse">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-[10px] font-bold text-primary uppercase">Uploading...</span>
                      </div>
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-outline-variant rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-on-surface-variant bg-surface-container-low group hover:border-primary/50 transition-colors">
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                           <label className="cursor-pointer p-2 bg-surface hover:bg-primary/10 rounded-lg border border-outline-variant transition-colors" title="Local Drive">
                            <HardDrive className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                          </label>
                          <button 
                            onClick={() => alert("Google Drive integration coming soon. For now, please upload from local drive.")} 
                            className="p-2 bg-surface hover:bg-blue-500/10 rounded-lg border border-outline-variant transition-colors" 
                            title="Google Drive"
                          >
                            <Cloud className="w-4 h-4 text-blue-500" />
                          </button>
                          <button 
                            onClick={() => alert("Dropbox integration coming soon. For now, please upload from local drive.")} 
                            className="p-2 bg-surface hover:bg-blue-400/10 rounded-lg border border-outline-variant transition-colors" 
                            title="Dropbox"
                          >
                            <Cloud className="w-4 h-4 text-blue-400" />
                          </button>
                        </div>
                        <span className="text-[10px] font-bold uppercase opacity-60 text-center">Add Photo</span>
                        <p className="text-[8px] opacity-40 text-center">Max 1MB, Max 3 photos</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-surface-container-lowest p-8 lg:p-12 rounded-[2.5rem] border border-outline-variant shadow-sm space-y-6">
            <h2 className="font-headline text-3xl text-on-surface">My Faith & Values</h2>
            <div className="space-y-4">
              <p className="text-on-surface-variant italic border-l-4 border-primary-container pl-6 py-2">
                "I believe that marriage is a sacred covenant. My vision for a family is one where we worship together and grow in our understanding of God's love."
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/30">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Regular Church Attendee</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-outline-variant/30">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">Active in Ministry</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant shadow-sm space-y-6">
            <h2 className="font-headline text-2xl text-on-surface">Looking For</h2>
            <div className="space-y-6 text-sm">
              <div>
                <p className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">Age Preference</p>
                <p className="font-bold flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded">
                    {profile.partnerPreferences?.ageMin} - {profile.partnerPreferences?.ageMax}
                  </span>
                </p>
              </div>
              <div>
                <p className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">Ideal Qualities</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> God-fearing
                  </li>
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> Family-oriented
                  </li>
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> Same Denomination
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="p-8 rounded-[2.5rem] border-2 border-dashed border-outline-variant text-center space-y-4">
            <ShieldAlert className="w-10 h-10 text-on-surface-variant/30 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-headline text-xl text-on-surface opacity-60">Safety Tip</h3>
              <p className="text-xs text-on-surface-variant font-medium">Never share financial information or your home address with people you haven't met. Stay within the platform for safety.</p>
            </div>
            <button className="text-xs text-error font-bold underline">Report this Profile</button>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProfileMeta({ icon: Icon, label, value }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-on-surface-variant" />
        <span className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-base font-bold text-on-surface truncate">{value}</p>
    </div>
  );
}

