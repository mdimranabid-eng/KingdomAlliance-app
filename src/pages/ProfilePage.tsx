import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, addDoc, serverTimestamp, setDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { useSettings } from '../lib/SettingsContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Heart,
  User,
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
  HardDrive,
  Camera,
  Upload,
  ExternalLink,
  Edit,
  Scale,
  Languages,
  Globe,
  ShieldCheck,
  Activity,
  ChevronRight,
  X,
  Maximize2,
  HeartHandshake,
  Quote,
  Share2
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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'profile' | 'gallery'>('gallery');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutMeDraft, setAboutMeDraft] = useState('');
  const [savingAbout, setSavingAbout] = useState(false);
  const [aboutError, setAboutError] = useState<string | null>(null);
  const [recommendedMatches, setRecommendedMatches] = useState<any[]>([]);
  const [lightbox, setLightbox] = useState<{ open: boolean, index: number, images: string[] }>({ open: false, index: 0, images: [] });

  const getSecureImageUrl = (url: string, isWatermark: boolean = false) => {
    if (!url) return '';
    if (!url.includes('cloudinary.com')) return url;

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const watermarkTransform = isWatermark ? 'l_text:Arial_15:ChristianHearts,o_15,g_south_east,y_20,x_20/' : '';
    return `${parts[0]}/upload/c_limit,w_1200,q_auto,f_auto/${watermarkTransform}${parts[1]}`;
  };

  const openLightbox = (index: number, images: string[]) => {
    const validImages = images.filter(Boolean);
    setLightbox({
      open: true,
      index: Math.min(index, validImages.length - 1),
      images: validImages.map(img => getSecureImageUrl(img, true))
    });
  };

  useEffect(() => {
    async function fetchProfileData() {
      if (!id) return;
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'users', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({ id: docSnap.id, ...data });
          setAboutMeDraft(data.aboutMe || '');

          if (currentUser) {
            const interestsRef = collection(db, 'interests');
            const qInterest = query(interestsRef, where('fromId', '==', currentUser.uid), where('toId', '==', id));
            const interestsSnap = await getDocs(qInterest);
            if (!interestsSnap.empty) setInterestSent(true);

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

  const validateContactInfo = (text: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+?\d[\s.-]?){7,15}/g;

    if (emailRegex.test(text)) return "Email addresses are not allowed in the bio for security reasons.";
    if (phoneRegex.test(text.replace(/[\s.-]/g, ''))) return "Mobile numbers are not allowed in the bio for security reasons.";

    return null;
  };

  const handleSaveAboutMe = async () => {
    const error = validateContactInfo(aboutMeDraft);
    if (error) {
      setAboutError(error);
      return;
    }

    setSavingAbout(true);
    setAboutError(null);
    try {
      await updateDoc(doc(db, 'users', id!), {
        aboutMe: aboutMeDraft,
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, aboutMe: aboutMeDraft });
      setIsEditingAbout(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
      setAboutError("Failed to save changes. Please try again.");
    } finally {
      setSavingAbout(false);
    }
  };

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
          targetId: id!,
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 3 * 1024 * 1024) {
      setGalleryError("File size exceeds 3MB limit.");
      setShowUploadModal(false);
      return;
    }

    setUploadingPhoto(true);
    setGalleryError(null);
    setShowUploadModal(false);

    try {
      const options = {
        maxSizeMB: 3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg'
      };

      const compressedFile = await imageCompression(file, options);
      const url = await uploadToCloudinary(
        compressedFile,
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      if (uploadTarget === 'gallery') {
        const newPhoto = {
          id: Math.random().toString(36).substring(7),
          url,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        const updatedGallery = [...(profile.gallery || []), newPhoto];
        await updateDoc(doc(db, 'users', currentUser.uid), {
          gallery: updatedGallery,
          photoStatus: 'pending',
          updatedAt: serverTimestamp()
        });
        setProfile({ ...profile, gallery: updatedGallery, photoStatus: 'pending' });
      } else {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          pendingPhotoUrl: url,
          photoStatus: 'pending',
          updatedAt: serverTimestamp()
        });
        setProfile({ ...profile, pendingPhotoUrl: url, photoStatus: 'pending' });
      }
    } catch (err: any) {
      setGalleryError(err.message || "Upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const confirmDeletePhoto = async () => {
    if (!currentUser || !photoToDelete) return;

    const updatedGallery = profile.gallery.filter((p: any) => p.id !== photoToDelete);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        gallery: updatedGallery,
        photoStatus: 'pending',
        updatedAt: serverTimestamp()
      });
      setProfile({ ...profile, gallery: updatedGallery, photoStatus: 'pending' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    } finally {
      setPhotoToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotoToDelete(photoId);
    setShowDeleteConfirm(true);
  };

  const handleSendInterest = async () => {
    if (!currentUser || !id || sendingInterest || interestSent) return;

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

      // Add notification document
      await addDoc(collection(db, 'notifications'), {
        userId: id,
        fromId: currentUser.uid,
        type: 'interest',
        title: 'New Interest Expressed',
        message: `${currentUser.displayName || 'A member'} has expressed interest in your profile.`,
        read: false,
        createdAt: serverTimestamp()
      });

      setInterestSent(true);
      alert(`Interest successfully sent to ${profile.name}! They will be notified via email.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'interests');
    } finally {
      setSendingInterest(false);
    }
  };

  const isOwnProfile = currentUser?.uid === id;

  const tabs = [
    { id: 'about', label: 'About Me', icon: User },
    { id: 'lifestyle', label: 'Lifestyle', icon: Activity },
    { id: 'faith', label: 'Faith Journey', icon: Church },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-on-surface-variant font-medium">Loading premium profile...</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center space-y-4">
        <XCircle className="w-16 h-16 text-error mx-auto" />
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <button onClick={() => navigate('/matches')} className="text-primary hover:underline">Back to matches</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Premium Hero Banner */}
      <div className="relative">
        <div className="h-64 md:h-96 profile-banner-gradient w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 relative z-10">
          <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden border border-slate-100">
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
                {/* Profile Photo with Golden Ring */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div
                    className="w-48 h-48 md:w-60 md:h-60 rounded-full border-[8px] border-white shadow-2xl overflow-hidden cursor-pointer relative z-10 ring-1 ring-slate-100"
                    onClick={() => {
                      const mainPhoto = profile.photoUrl || profile.pendingPhotoUrl;
                      const gallery = (profile.gallery || []).filter((p: any) => p.status === 'approved' || isOwnProfile);
                      openLightbox(0, [mainPhoto, ...gallery.map((p: any) => p.url)]);
                    }}
                  >
                    <PhotoProtector>
                      <img
                        src={getSecureImageUrl(profile.photoUrl || profile.pendingPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`)}
                        alt={profile.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </PhotoProtector>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                    {profile.photoStatus === 'pending' && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="w-8 h-8 text-white animate-pulse" />
                          <span className="text-white text-xs font-medium">Pending Review</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isOwnProfile && (
                    <button
                      onClick={() => { setUploadTarget('profile'); setShowUploadModal(true); }}
                      className="absolute bottom-4 right-4 p-4 bg-secondary text-on-secondary rounded-full shadow-2xl hover:scale-110 transition-all hover:rotate-12 z-20 ring-4 ring-white"
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Identity Info */}
                <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end gap-8 w-full">
                  <div className="text-center md:text-left space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <h1 className="font-headline text-4xl md:text-5xl text-slate-900 font-bold tracking-tight">
                        {profile.name}, {profile.age}
                      </h1>
                      <div className="flex gap-2">
                        {profile.isApproved ? (
                          <div className="group relative flex items-center">
                            <div className="flex items-center gap-2.5 px-5 py-2 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-[#5d4037] rounded-full text-xs font-bold shadow-[0_2px_15px_rgba(184,134,11,0.4)] border border-[#AA8232]/30 relative overflow-hidden animate-shine-slow">
                              {/* Cross Shield Icon - Made Bigger */}
                              <svg width="18" height="20" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                                <path d="M7 0L1 2.5V7C1 11.08 3.55 14.88 7 16C10.45 14.88 13 11.08 13 7V2.5L7 0Z" fill="currentColor" fillOpacity="0.9" />
                                <path d="M7 4V11M5 6H9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                              </svg>
                              <span className="relative z-10 tracking-tight text-sm">Verified Member</span>

                              {/* Shine Effect Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine transition-all duration-1000" />
                            </div>

                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 font-bold uppercase tracking-wider">
                              Approved Profile
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                          </div>
                        ) : (
                          <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold flex items-center gap-1.5 border border-slate-200">
                            <Clock className="w-3.5 h-3.5" /> Pending Verification
                          </span>
                        )}
                        {profile.photoStatus === 'pending' && (
                          <span className="px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1.5 border border-amber-100">
                            <Clock className="w-3.5 h-3.5" /> Photo Review
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-slate-500 font-medium text-lg">
                      <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary/70" /> {profile.city}, {profile.state}</span>
                      <span className="flex items-center gap-2"><Church className="w-5 h-5 text-primary/70" /> {profile.denomination}</span>
                      <span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary/70" /> {profile.occupation}</span>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <button
                        onClick={handleSendInterest}
                        disabled={interestSent || sendingInterest}
                        className={cn(
                          "flex-1 md:flex-none px-10 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg",
                          interestSent
                            ? "bg-slate-100 text-slate-500 cursor-default"
                            : "bg-primary text-white hover:bg-primary/90 hover:-translate-y-1 active:translate-y-0"
                        )}
                      >
                        {sendingInterest ? <Loader2 className="w-6 h-6 animate-spin" /> : <Heart className={cn("w-6 h-6", interestSent && "fill-current")} />}
                        {interestSent ? "Interest Sent" : "Send Interest"}
                      </button>

                      <button
                        onClick={handleToggleShortlist}
                        disabled={togglingShortlist}
                        className={cn(
                          "p-5 rounded-2xl transition-all shadow-md border-2",
                          isShortlisted
                            ? "bg-secondary/10 border-secondary text-secondary"
                            : "bg-white border-slate-100 text-slate-400 hover:border-secondary/30 hover:text-secondary"
                        )}
                      >
                        <Bookmark className={cn("w-7 h-7", isShortlisted && "fill-current")} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Navigation & Content */}
          <div className="lg:col-span-8 space-y-8">

            {/* Navigation Tabs */}
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 min-w-[120px] py-4 px-6 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {activeTab === 'about' && (
                <div className="space-y-8">
                  {/* About Me Card */}
                  <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Quote className="w-24 h-24 rotate-180" />
                    </div>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <User className="w-7 h-7 text-primary" /> About Me
                      </h2>
                      {isOwnProfile && !isEditingAbout && (
                        <button onClick={() => setIsEditingAbout(true)} className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-colors">
                          <Edit className="w-6 h-6" />
                        </button>
                      )}
                    </div>

                    {isEditingAbout ? (
                      <div className="space-y-4">
                        <textarea
                          value={aboutMeDraft}
                          onChange={(e) => setAboutMeDraft(e.target.value)}
                          className="w-full h-48 p-6 rounded-2xl border-2 border-slate-200 focus:border-primary outline-none text-lg transition-colors resize-none"
                          placeholder="Tell us about yourself..."
                        />
                        {aboutError && <p className="text-error text-sm font-medium">{aboutError}</p>}
                        <div className="flex gap-3 justify-end">
                          <button onClick={() => { setIsEditingAbout(false); setAboutMeDraft(profile.aboutMe || ''); }} className="px-6 py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl">Cancel</button>
                          <button onClick={handleSaveAboutMe} disabled={savingAbout} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg flex items-center gap-2">
                            {savingAbout && <Loader2 className="w-5 h-5 animate-spin" />} Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                        {profile.aboutMe || "No bio added yet."}
                      </p>
                    )}
                  </div>

                  {/* Basic Info Grid */}
                  <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <InfoRow label="Profile ID" value={profile.profileId || id?.substring(0, 8).toUpperCase()} />
                      <InfoRow label="Full Name" value={profile.name} />
                      <InfoRow label="Age / Height" value={`${profile.age} Yrs, ${profile.height || 'N/A'}`} />
                      <InfoRow label="Mother Tongue" value={profile.motherTongue || 'English'} />
                      <InfoRow label="Marital Status" value={profile.maritalStatus} />
                      <InfoRow label="Eating Habits" value={profile.diet || 'N/A'} />
                    </div>
                  </div>

                  {/* Gallery Section - Now directly below Personal Details */}
                  <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <ImageIcon className="w-7 h-7 text-primary" /> Photo Gallery
                      </h2>
                      {isOwnProfile && (
                        <button
                          onClick={() => { setUploadTarget('gallery'); setShowUploadModal(true); }}
                          className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl font-bold shadow-md hover:scale-105 transition-transform"
                        >
                          <Plus className="w-5 h-5" /> Add Photo
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {(profile.gallery || []).filter((p: any) => p.status === 'approved' || isOwnProfile).map((photo: any, index: number) => (
                        <div key={photo.id} className="relative group aspect-[4/5] rounded-2xl overflow-hidden shadow-md border-2 border-slate-50">
                          <PhotoProtector>
                            <img
                              src={getSecureImageUrl(photo.url)}
                              alt="Gallery"
                              className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                              onClick={() => {
                                const mainPhoto = profile.photoUrl || profile.pendingPhotoUrl;
                                const gallery = (profile.gallery || []).filter((p: any) => p.status === 'approved' || isOwnProfile);
                                openLightbox(index + 1, [mainPhoto, ...gallery.map((p: any) => p.url)]);
                              }}
                            />
                          </PhotoProtector>
                          {photo.status === 'pending' && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Clock className="w-6 h-6 text-white animate-pulse" />
                                <span className="text-white text-xs font-semibold">Moderating</span>
                              </div>
                            </div>
                          )}
                          {isOwnProfile && (
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="absolute top-3 right-3 p-2.5 bg-error text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {(!profile.gallery || profile.gallery.length === 0) && (
                        <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                          <ImageIcon className="w-16 h-16 text-slate-300 mx-auto" />
                          <p className="text-slate-400 font-medium text-lg">No photos uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'lifestyle' && (
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <Briefcase className="w-7 h-7 text-primary" /> Career & Education
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wider">Education</h3>
                      <InfoRow label="Qualification" value={profile.education} />
                      <InfoRow label="School/College" value={profile.college || 'N/A'} />
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wider">Profession</h3>
                      <InfoRow label="Occupation" value={profile.occupation} />
                      <InfoRow label="Income" value={profile.income || 'N/A'} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'faith' && (
                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <Church className="w-7 h-7 text-primary" /> Faith Journey
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <InfoRow label="Denomination" value={profile.denomination} />
                    <InfoRow label="Baptized" value={profile.baptized || 'Yes'} />
                    <InfoRow label="Church Name" value={profile.churchName || 'N/A'} />
                    <InfoRow label="Ministry Involvement" value={profile.spiritualInvolvement || 'N/A'} />
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-4 space-y-8">

            {/* Preferred Partner Match Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <HeartHandshake className="w-7 h-7 text-secondary" /> Partner Preferences
              </h2>
              <div className="space-y-6">
                <PreferenceItem label="Age" value={profile.partnerPreferences?.ageRange || `${profile.partnerPreferences?.ageMin || 21} - ${profile.partnerPreferences?.ageMax || 35}`} />
                <PreferenceItem label="Marital Status" value={profile.partnerPreferences?.maritalStatus || 'Never Married'} />
                <PreferenceItem label="Denomination" value={profile.partnerPreferences?.denomination || 'Open to all'} />
                <PreferenceItem label="Education" value={profile.partnerPreferences?.education || 'Graduate & Above'} />
                <PreferenceItem label="Location" value={profile.partnerPreferences?.location || 'Anywhere'} />
              </div>
              
              {currentProfile && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 font-bold">Match Score</span>
                    <span className="text-2xl font-black text-primary">
                      {calculateMatchScore(currentProfile, profile)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateMatchScore(currentProfile, profile)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center uppercase tracking-widest font-bold">Based on your shared values</p>
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl text-white">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-secondary fill-current" /> Premium Benefits
              </h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 text-secondary shrink-0 mt-0.5"><CheckCircle2 className="w-full h-full" /></span>
                  <span className="text-slate-300 font-medium">Direct contact information access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 text-secondary shrink-0 mt-0.5"><CheckCircle2 className="w-full h-full" /></span>
                  <span className="text-slate-300 font-medium">Chat without restrictions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 text-secondary shrink-0 mt-0.5"><CheckCircle2 className="w-full h-full" /></span>
                  <span className="text-slate-300 font-medium">View detailed verified background</span>
                </li>
              </ul>
              <button className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-secondary hover:text-white transition-all shadow-lg active:scale-95">
                Upgrade to Premium
              </button>
            </div>

          </div>
        </div>

        {/* Find Your Match Section */}
        {recommendedMatches.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="font-headline text-3xl md:text-4xl text-slate-900">Find Your Match</h2>
                <p className="text-slate-500">Christian singles sharing your faith and values</p>
              </div>
              <button 
                onClick={() => navigate('/matches')}
                className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
              >
                View all matches <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendedMatches.map((match) => (
                <motion.div
                  key={match.id}
                  whileHover={{ y: -10 }}
                  onClick={() => navigate(`/profile/${match.id}`)}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 cursor-pointer group"
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img 
                      src={match.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${match.name}`} 
                      alt={match.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-xl font-bold text-white mb-1">{match.name}, {match.age}</h3>
                      <p className="text-white/80 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {match.location || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Denomination</span>
                      <span className="text-slate-700 font-bold">{match.denomination || 'Christian'}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex justify-between items-center p-6">
              <span className="text-white font-bold text-lg">{lightbox.index + 1} / {lightbox.images.length}</span>
              <div className="flex gap-4">
                <button onClick={() => { }} className="p-3 text-white hover:bg-white/10 rounded-full transition-colors"><Share2 className="w-6 h-6" /></button>
                <button onClick={() => setLightbox({ ...lightbox, open: false })} className="p-3 text-white hover:bg-white/10 rounded-full transition-colors"><X className="w-8 h-8" /></button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative px-4">
              <button
                onClick={() => setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length })}
                className="absolute left-4 p-4 text-white hover:bg-white/10 rounded-full transition-all z-20"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>

              <motion.img
                key={lightbox.index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={lightbox.images[lightbox.index]}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />

              <button
                onClick={() => setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length })}
                className="absolute right-4 p-4 text-white hover:bg-white/10 rounded-full transition-all z-20"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </div>

            <div className="p-8 flex gap-3 overflow-x-auto justify-center no-scrollbar">
              {lightbox.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox({ ...lightbox, index: i })}
                  className={cn(
                    "w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                    i === lightbox.index ? "border-primary scale-110 shadow-lg shadow-primary/30" : "border-transparent opacity-40 hover:opacity-100"
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <ConfirmationModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title={`Upload ${uploadTarget === 'profile' ? 'Profile Photo' : 'Gallery Photo'}`}
        message="Select a photo to upload. Max size 3MB. All photos are reviewed by moderators."
        confirmText="Choose Photo"
        cancelText="Cancel"
        onConfirm={() => document.getElementById('photo-upload')?.click()}
      />
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeletePhoto}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}

// Helper Components
function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{label}</span>
      <span className="text-slate-800 text-lg font-semibold break-words leading-tight">{value || 'N/A'}</span>
    </div>
  );
}

function PreferenceItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-slate-900 font-bold text-right">{value}</span>
    </div>
  );
}

function PhotoProtector({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full select-none" onContextMenu={(e) => e.preventDefault()}>
      {children}
      <div className="absolute inset-0 z-10" />
    </div>
  );
}
