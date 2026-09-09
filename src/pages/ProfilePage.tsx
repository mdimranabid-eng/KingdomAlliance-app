import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, addDoc, serverTimestamp, setDoc, getDocs, deleteDoc, updateDoc, runTransaction, deleteField, writeBatch, collectionGroup, Timestamp, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { sendEmail } from '../lib/email';
import { useSettings } from '../lib/SettingsContext';
import { uploadUserPhotos, deleteStoredPhoto } from '../lib/storage';
import { requestOtp, verifyOtp } from '../services/otpService';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Heart,
  User,
  MessageSquare,
  MessageCircle,
  MapPin,
  Check,
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
  Pencil,
  Upload,
  ExternalLink,
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
  Share2,
  AlertTriangle,
  LogOut,
  ScrollText,
  PenLine,
  ChevronDown,
  UserRound,
  BookOpenCheck,
  Landmark,
  Banknote,
  Feather,
  House,
  Utensils,
  Wine,
  Cigarette,
  Cake,
  Gem,
  Cross,
  Droplet,
  Sparkles,
  Lock
} from 'lucide-react';
import { cn, handleFirestoreError, OperationType, calculateMatchScore, calculateAge, shouldBlurPhoto } from '../lib/utils';
import { useLogout } from '../hooks/useLogout';
import BlockedUsersList from '../components/BlockedUsersList';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import { DetailItem, ProfileSection, Detail, PillGroup, hasValue } from '../components/ProfileCards';
import { OnlineIndicator } from '../components/OnlineIndicator';
import EditProfileModal from '../components/EditProfileModal';

const BACKEND_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_BACKEND_URL || '');
import toast from 'react-hot-toast';
const glassCardStyle = {
  background: '#ffffff',
  border: '1px solid #eee7d8',
  boxShadow: '0 20px 50px -25px rgba(143,99,55,0.18)'
};

/* ===== About tab: Sanctuary "register" card system ===== */
const BIO_CLAMP_HEIGHT = 176; // ~6 lines of the bio measure
const BIO_PREVIEW_LENGTH = 380;

const toList = (v: any): string[] => {
  if (Array.isArray(v)) return v.map((i) => String(i).trim()).filter(Boolean);
  if (!hasValue(v)) return [];
  return String(v)
    .split(/[,;·|]/)
    .map((i) => i.trim())
    .filter(Boolean);
};

const formatDateValue = (v: any): string | null => {
  if (!hasValue(v)) return null;
  const date = v?.toDate ? v.toDate() : new Date(v);
  if (Number.isNaN(date.getTime())) return String(v);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, profile: currentProfile, isAdmin, signOut } = useAuth();
  const { logout, isLoggingOut } = useLogout();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestJustSent, setInterestJustSent] = useState(false);
  const [connectionState, setConnectionState] = useState<any | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [shortlistId, setShortlistId] = useState<string | null>(null);
  const [togglingShortlist, setTogglingShortlist] = useState(false);
  const [isEditingGallery, setIsEditingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'profile' | 'gallery'>('gallery');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
const [showRateLimitAlert, setShowRateLimitAlert] = useState(false);
  const [rateLimitResetTime, setRateLimitResetTime] = useState<string | null>(null);
  const [showAccountDeleteConfirm, setShowAccountDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountDeleteError, setAccountDeleteError] = useState<string | null>(null);
  const [accountDeleteOtpCode, setAccountDeleteOtpCode] = useState(['', '', '', '', '', '']);
  const [accountDeleteOtpLoading, setAccountDeleteOtpLoading] = useState(false);
  const [accountDeleteOtpError, setAccountDeleteOtpError] = useState<string | null>(null);
  const accountDeleteOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);

  const handleProfileSaved = (updatedProfile: any) => {
    setProfile(updatedProfile);
  };
  const reduceMotion = useReducedMotion();
  const [recommendedMatches, setRecommendedMatches] = useState<any[]>([]);
  const [lightbox, setLightbox] = useState<{ open: boolean, index: number, images: string[] }>({ open: false, index: 0, images: [] });
  const [stats, setStats] = useState({ views: 0, interests: 0, shortlistedBy: 0, unread: 0, connections: 0 });

  const getSecureImageUrl = (url: string, isWatermark: boolean = false) => {
    if (!url) return '';
    return url;
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
          const age = calculateAge(data.dob, data.age);
          setProfile({ id: docSnap.id, ...data, age });

          // --- PROFILE VIEW TRACKING START ---
          // Only track if viewer is not viewing own profile
          if (currentUser?.uid && currentUser.uid !== id) {
            const viewDocId = `${currentUser.uid}_${id}`;
            await setDoc(
              doc(db, 'profileViews', viewDocId),
              {
                viewerId: currentUser.uid,
                profileId: id,
                viewedAt: serverTimestamp()
              },
              { merge: true }
            );
          }
          // --- PROFILE VIEW TRACKING END ---

          if (currentUser) {
            const interestsRef = collection(db, 'interests');
            const q1 = query(interestsRef, where('fromId', '==', currentUser.uid), where('toId', '==', id));
            const q2 = query(interestsRef, where('fromId', '==', id), where('toId', '==', currentUser.uid));
            const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
            if (!snap1.empty) {
              setConnectionState({ id: snap1.docs[0].id, ...snap1.docs[0].data() });
            } else if (!snap2.empty) {
              setConnectionState({ id: snap2.docs[0].id, ...snap2.docs[0].data() });
            }

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

  const handleDeleteMyAccount = async () => {
    if (!currentUser || deletingAccount) return;
    setAccountDeleteOtpLoading(true);
    setAccountDeleteOtpError(null);
    setShowDeleteConfirmation(false);
    try {
      const userEmail = currentUser.email;
      if (!userEmail) throw new Error('No email found on your account.');
      await requestOtp(userEmail, 'delete_account');
      setShowAccountDeleteConfirm(true);
      // Auto-focus first OTP input
      setTimeout(() => accountDeleteOtpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      console.error('OTP send failed:', err);
      setAccountDeleteOtpError(err.message || 'Failed to send verification code.');
    } finally {
      setAccountDeleteOtpLoading(false);
    }
  };

  const handleDeleteOtpVerify = async () => {
    if (!currentUser || deletingAccount) return;
    const otpString = accountDeleteOtpCode.join('');
    if (otpString.length !== 6) {
      setAccountDeleteOtpError('Please enter the full 6-digit code.');
      return;
    }
    setDeletingAccount(true);
    setAccountDeleteOtpError(null);
    try {
      const userEmail = currentUser.email;
      if (!userEmail) throw new Error('No email found.');
      await verifyOtp(userEmail, otpString, 'delete_account');
      // OTP verified — proceed with deletion
      const token = await currentUser.getIdToken();
      const response = await fetch(`${BACKEND_URL}/api/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to schedule account deletion.');
      setShowAccountDeleteConfirm(false);
      await signOut();
      navigate('/');
    } catch (err: any) {
      console.error('Account deletion request failed:', err);
      setAccountDeleteOtpError(err.message || 'Failed to schedule account deletion. Please try again.');
    } finally {
      setDeletingAccount(false);
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

    if (uploadTarget === 'gallery' && (profile.gallery || []).length >= 3) {
      setGalleryError("You have reached the maximum limit of photo you can upload");
      setShowLimitAlert(true);
      setShowUploadModal(false);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert("Invalid file format. Please upload JPEG, PNG, or WEBP.");
      setShowUploadModal(false);
      return;
    }

    if (file.size >= 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      setShowUploadModal(false);
      return;
    }

    setUploadingPhoto(true);
    setGalleryError(null);
    setShowUploadModal(false);

    try {
      const pair = await uploadUserPhotos(
        file,
        currentUser.uid,
        uploadTarget === 'gallery' ? 'gallery' : 'profile'
      );
      const url = pair.url;

      // Get user name for the moderation record
      const userName = profile.fullName || (currentUser.displayName || 'User');

      if (uploadTarget === 'gallery') {
        const newPhoto = {
          id: Math.random().toString(36).substring(7),
          url,
          thumbUrl: pair.thumbUrl,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        const updatedGallery = [...(profile.gallery || []), newPhoto];
        
        // Create photoModeration document for gallery photo
        await addDoc(collection(db, 'photoModeration'), {
          uid: currentUser.uid,
          userId: currentUser.uid,
          userName: userName,
          photoURL: url,
          thumbUrl: pair.thumbUrl,
          photoType: 'galleryPhoto',
          galleryPosition: updatedGallery.length,
          photoStatus: 'pending',
          uploadedAt: serverTimestamp(),
          reviewedAt: null,
          reviewedBy: null,
          rejectedReason: null
        });

        await updateDoc(doc(db, 'users', currentUser.uid), {
          gallery: updatedGallery,
          updatedAt: serverTimestamp()
        });
        setProfile({ ...profile, gallery: updatedGallery });
      } else {
        // Create photoModeration document for profile photo
        await addDoc(collection(db, 'photoModeration'), {
          uid: currentUser.uid,
          userId: currentUser.uid,
          userName: userName,
          photoURL: url,
          thumbUrl: pair.thumbUrl,
          photoType: 'profilePhoto',
          galleryPosition: null,
          photoStatus: 'pending',
          uploadedAt: serverTimestamp(),
          reviewedAt: null,
          reviewedBy: null,
          rejectedReason: null
        });

        await updateDoc(doc(db, 'users', currentUser.uid), {
          pendingPhotoUrl: url,
          pendingPhotoThumbUrl: pair.thumbUrl,
          photoStatus: 'pending',
          rejectedPhotoUrl: '',
          rejectedPhotoReason: '',
          updatedAt: serverTimestamp()
        });
        setProfile({ 
          ...profile, 
          pendingPhotoUrl: url, 
          pendingPhotoThumbUrl: pair.thumbUrl,
          photoStatus: 'pending',
          rejectedPhotoUrl: '',
          rejectedPhotoReason: ''
        });
      }
    } catch (err: any) {
      setGalleryError(err.message || "Upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const confirmDeletePhoto = async () => {
    if (!currentUser || !photoToDelete) return;

    const targetPhoto = profile.gallery.find((p: any) => p.id === photoToDelete);
    if (!targetPhoto) return;
    const deletedPhotoUrl = targetPhoto.url;

    const updatedGallery = profile.gallery.filter((p: any) => p.id !== photoToDelete);
    try {
      await deleteStoredPhoto(deletedPhotoUrl, targetPhoto.thumbUrl);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        gallery: updatedGallery,
        updatedAt: serverTimestamp()
      });

      // Delete corresponding photoModeration documents in Firestore
      const q = query(
        collection(db, 'photoModeration'),
        where('uid', '==', currentUser.uid),
        where('photoURL', '==', deletedPhotoUrl)
      );
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setProfile({ ...profile, gallery: updatedGallery });
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
    // Verbose guards so silent failures are diagnosable from the browser.
    if (!currentUser) {
      toast.error('You must be signed in to send interest.');
      return;
    }
    if (!id) {
      toast.error('Invalid profile.');
      return;
    }
    if (sendingInterest) return;
    if (connectionState) {
      toast.error(`You already have a ${connectionState.status} connection with this member.`);
      return;
    }

    if (currentProfile && profile) {
      if (currentProfile.gender === profile.gender) {
        toast.error(`As a ${currentProfile.gender}, you can only express interest to ${currentProfile.gender === 'Bride' ? 'Grooms' : 'Brides'}.`);
        return;
      }
    }

    // Frontend rate-limit check: max 5 interests per 24 hours.
    // Firestore requires a Timestamp for range filters on Timestamp fields,
    // so we convert via Timestamp.from() instead of passing a JS Date.
    const twentyFourHoursAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
    const recentInterestsQuery = query(
      collection(db, 'interests'),
      where('fromId', '==', currentUser.uid),
      where('createdAt', '>=', twentyFourHoursAgo)
    );

    setSendingInterest(true);
    try {
      const recentInterestsSnap = await getDocs(recentInterestsQuery);
      if (recentInterestsSnap.size >= 5) {
        const resetDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        setRateLimitResetTime(resetDate.toLocaleString());
        setShowRateLimitAlert(true);
        return;
      }

      const connectionId = [currentUser.uid, id].sort().join('_');
      await setDoc(doc(db, 'interests', connectionId), {
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

      // Fetch target user email to dispatch notification
      const targetUserSnap = await getDoc(doc(db, 'users', id));
      if (targetUserSnap.exists() && targetUserSnap.data()?.email) {
          await sendEmail({
              to_email: targetUserSnap.data().email,
              type: 'connection_request',
              senderName: currentUser.displayName || 'A member'
          });
      }

      setConnectionState({ id: connectionId, fromId: currentUser.uid, toId: id, status: 'pending' });
      setInterestJustSent(true);
      toast.success(`Interest successfully sent to ${profile.name}!`);
    } catch (err: any) {
      console.error('[SendInterest] failed:', err);
      toast.error(err?.message || 'Failed to send interest. Please try again.');
    } finally {
      setSendingInterest(false);
    }
  };

  const handleWithdrawInterest = async () => {
    if (!currentUser || !id || !connectionState || sendingInterest) return;
    if (currentUser.uid !== connectionState.fromId) return;
    setSendingInterest(true);
    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, 'interests', connectionState.id);
        const docSnap = await transaction.get(docRef);
        if (!docSnap.exists() || docSnap.data().status !== 'pending') {
          throw new Error('Connection no longer exists or is not pending');
        }
        transaction.delete(docRef);
      });

      const notifRef = collection(db, 'notifications');
      const qNotif = query(notifRef, where('type', '==', 'interest'), where('fromId', '==', currentUser.uid), where('userId', '==', id));
      const snapNotif = await getDocs(qNotif);
      const batch = writeBatch(db);
      snapNotif.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      setConnectionState(null);
      toast.success('Interest withdrawn');
    } catch (err) {
      console.error(err);
      toast.error('Failed to withdraw interest. State may have changed.');
    } finally {
      setSendingInterest(false);
    }
  };

  const handleDeclineInterest = async () => {
    if (!currentUser || !id || !connectionState || sendingInterest) return;
    if (currentUser.uid !== connectionState.fromId && currentUser.uid !== connectionState.toId) return;
    setSendingInterest(true);
    try {
      await updateDoc(doc(db, 'interests', connectionState.id), {
        status: 'declined',
        declinedBy: currentUser.uid
      });

      const notifRef = collection(db, 'notifications');
      const qNotif = query(notifRef, where('type', '==', 'interest'), where('userId', '==', currentUser.uid), where('fromId', '==', id));
      const snapNotif = await getDocs(qNotif);
      
      const qNotif2 = query(notifRef, where('type', '==', 'accepted'), where('userId', '==', currentUser.uid), where('fromId', '==', id));
      const snapNotif2 = await getDocs(qNotif2);

      const qNotif3 = query(notifRef, where('type', '==', 'message'), where('userId', '==', currentUser.uid), where('fromId', '==', id));
      const snapNotif3 = await getDocs(qNotif3);
      
      const batch = writeBatch(db);
      snapNotif.docs.forEach(d => batch.delete(d.ref));
      snapNotif2.docs.forEach(d => batch.delete(d.ref));
      snapNotif3.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      setConnectionState({ ...connectionState, status: 'declined', declinedBy: currentUser.uid });
      toast.success('Connection declined');
    } catch (err) {
      console.error(err);
      toast.error('Failed to decline connection.');
    } finally {
      setSendingInterest(false);
    }
  };

  const handleBlock = async () => {
    if (!currentUser || !id || !connectionState || sendingInterest) return;
    if (currentUser.uid !== connectionState.fromId && currentUser.uid !== connectionState.toId) return;
    setSendingInterest(true);
    try {
      // 1. Decline the connection and mark as blocked
      await updateDoc(doc(db, 'interests', connectionState.id), {
        status: 'declined',
        declinedBy: currentUser.uid,
        blocked: true
      });

      // 2. Add to blockedUsers array
      await updateDoc(doc(db, 'users', currentUser.uid), {
        blockedUsers: arrayUnion(id)
      });

      // 3. Delete all notifications for current user related to this person
      const notifRef = collection(db, 'notifications');
      const batch = writeBatch(db);

      const qNotif1 = query(notifRef, where('userId', '==', currentUser.uid), where('fromId', '==', id));
      const snapNotif1 = await getDocs(qNotif1);
      snapNotif1.docs.forEach(d => batch.delete(d.ref));

      await batch.commit();

      setConnectionState({ ...connectionState, status: 'declined', declinedBy: currentUser.uid, blocked: true });
      toast.success('User blocked');
    } catch (err) {
      console.error(err);
      toast.error('Failed to block user.');
    } finally {
      setSendingInterest(false);
    }
  };

  const handleUnblock = async () => {
    if (!currentUser || !id || !connectionState || sendingInterest) return;
    setSendingInterest(true);
    try {
      // 1. Restore connection to accepted
      await updateDoc(doc(db, 'interests', connectionState.id), {
        status: 'accepted',
        blocked: deleteField(),
        declinedBy: deleteField()
      });

      // 2. Remove from blockedUsers array
      await updateDoc(doc(db, 'users', currentUser.uid), {
        blockedUsers: arrayRemove(id)
      });

      setConnectionState({ ...connectionState, status: 'accepted', blocked: false });
      toast.success('User unblocked. Connection restored.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to unblock user.');
    } finally {
      setSendingInterest(false);
    }
  };

  const handleAcceptInterest = async () => {
    if (!currentUser || !id || !connectionState || sendingInterest) return;
    if (currentUser.uid !== connectionState.toId) return;
    setSendingInterest(true);
    try {
      await updateDoc(doc(db, 'interests', connectionState.id), {
        status: 'accepted'
      });

      await addDoc(collection(db, 'notifications'), {
        userId: id,
        fromId: currentUser.uid,
        type: 'accepted',
        title: 'Connection Accepted',
        message: `${currentUser.displayName || 'Someone'} has accepted your interest!`,
        read: false,
        createdAt: serverTimestamp()
      });

      const notifRef = collection(db, 'notifications');
      const qNotif = query(notifRef, where('type', '==', 'interest'), where('userId', '==', currentUser.uid), where('fromId', '==', id));
      const snapNotif = await getDocs(qNotif);
      const batch = writeBatch(db);
      snapNotif.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      setConnectionState({ ...connectionState, status: 'accepted' });
      toast.success('Interest accepted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to accept connection.');
    } finally {
      setSendingInterest(false);
    }
  };

  const handleUnblockAndAccept = async () => {
    if (!currentUser || !id || !connectionState || sendingInterest) return;
    if (currentUser.uid !== connectionState.declinedBy) return;
    setSendingInterest(true);
    try {
      await updateDoc(doc(db, 'interests', connectionState.id), {
        status: 'accepted',
        declinedBy: deleteField()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: id,
        fromId: currentUser.uid,
        type: 'accepted',
        title: 'Connection Accepted',
        message: `${currentUser.displayName || 'Someone'} has accepted your connection!`,
        read: false,
        createdAt: serverTimestamp()
      });

      const notifRef = collection(db, 'notifications');
      const qNotif = query(notifRef, where('type', '==', 'declined'), where('userId', '==', id), where('fromId', '==', currentUser.uid));
      const snapNotif = await getDocs(qNotif);
      const batch = writeBatch(db);
      snapNotif.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      setConnectionState({ ...connectionState, status: 'accepted', declinedBy: null });
      toast.success('Connection unblocked and accepted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to unblock connection.');
    } finally {
      setSendingInterest(false);
    }
  };

  const isOwnProfile = currentUser?.uid === id;

  // --- Own-profile stats for the pill-bar (views, interests, shortlisted by, unread, connections) ---
  useEffect(() => {
    if (!currentUser || currentUser.uid !== id) return;
    const uid = currentUser.uid;
    const unsubscribers: (() => void)[] = [];

    const unsubViews = onSnapshot(
      query(collection(db, 'profileViews'), where('profileId', '==', uid)),
      (snap) => setStats(prev => ({ ...prev, views: snap.size })),
      (err) => console.error('Profile views listener error:', err)
    );
    unsubscribers.push(unsubViews);

    const unsubInterests = onSnapshot(
      query(collection(db, 'interests'), where('toId', '==', uid)),
      (snap) => setStats(prev => ({ ...prev, interests: snap.size })),
      (err) => console.error('Interests listener error:', err)
    );
    unsubscribers.push(unsubInterests);

    const unsubShortlists = onSnapshot(
      query(collection(db, 'shortlists'), where('targetId', '==', uid)),
      (snap) => setStats(prev => ({ ...prev, shortlistedBy: snap.size })),
      (err) => console.error('Shortlists listener error:', err)
    );
    unsubscribers.push(unsubShortlists);

    const unsubUnread = onSnapshot(
      query(collectionGroup(db, 'messages'), where('receiverId', '==', uid), where('read', '==', false)),
      (snap) => setStats(prev => ({ ...prev, unread: snap.size })),
      (err) => console.error('Unread messages listener error:', err)
    );
    unsubscribers.push(unsubUnread);

    let connSentCount = 0;
    let connRecvCount = 0;
    const unsubConnSent = onSnapshot(
      query(collection(db, 'interests'), where('fromId', '==', uid), where('status', '==', 'accepted')),
      (snap) => {
        connSentCount = snap.size;
        setStats(prev => ({ ...prev, connections: connSentCount + connRecvCount }));
      },
      (err) => console.error('Connections (sent) listener error:', err)
    );
    unsubscribers.push(unsubConnSent);

    const unsubConnRecv = onSnapshot(
      query(collection(db, 'interests'), where('toId', '==', uid), where('status', '==', 'accepted')),
      (snap) => {
        connRecvCount = snap.size;
        setStats(prev => ({ ...prev, connections: connSentCount + connRecvCount }));
      },
      (err) => console.error('Connections (recv) listener error:', err)
    );
    unsubscribers.push(unsubConnRecv);

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [id, currentUser]);


  const tabs = [
    { id: 'about', label: 'About Me', icon: User },
    ...(isOwnProfile ? [{ id: 'privacy', label: 'Privacy / Blocked', icon: ShieldAlert }] : [])
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

  const isDeclinedPrivacy = connectionState?.status === 'declined';
  // Centralised photo privacy check — owner/admin always see; declined always
  // blurred; public profiles visible to everyone; protected profiles only
  // visible after an accepted connection.
  const canViewPhotos = !shouldBlurPhoto(
    profile,
    { uid: currentUser?.uid },
    isAdmin,
    connectionState?.status
  );
  const rawFullName = [profile.name, profile.middleName, profile.lastName]
    .filter(Boolean)
    .map(name => name.trim())
    .join(' ');
  const fullName = isDeclinedPrivacy ? 'Profile Unavailable' : rawFullName;
  const defaultName = isDeclinedPrivacy ? 'Profile Unavailable' : (profile.name || 'Unnamed Member');

  /* --- About tab: bio + curated record groups --- */
  const bio = (profile.aboutMe || '').trim();
  const bioWords = bio ? bio.split(/\s+/).filter(Boolean).length : 0;
  const isLongBio = bio.length > BIO_PREVIEW_LENGTH;
  const clampedBio = isLongBio && !bioExpanded;

  const onlyRows = (rows: DetailItem[]) => rows.filter((row) => hasValue(row.value));

  const locationValue = isDeclinedPrivacy
    ? 'Hidden'
    : (profile.cityLiving || profile.city)
      ? `${profile.cityLiving || profile.city}${profile.countryLiving || profile.state ? `, ${profile.countryLiving || profile.state}` : ''}`
      : '';

  const essentialsRows = onlyRows([
    { label: 'Profile ID', value: isDeclinedPrivacy ? 'HIDDEN' : (profile.profileId || id?.substring(0, 8).toUpperCase()), icon: Gem },
    { label: 'Full Name', value: fullName || defaultName, icon: UserRound, className: 'hidden sm:block' },
    { label: 'Seeking', value: profile.profileType, icon: HeartHandshake },
    { label: 'Date of Birth', value: formatDateValue(profile.dob), icon: Cake },
    { label: 'Age / Height', value: [hasValue(profile.age) ? `${profile.age} yrs` : '', profile.height].filter(Boolean).join(' · '), icon: Ruler },
    { label: 'Marital Status', value: profile.maritalStatus, icon: Users },
    { label: 'Mother Tongue', value: profile.motherTongue || 'English', icon: Languages },
    { label: 'Citizenship', value: profile.citizenship || profile.nationality, icon: Globe },
    { label: 'Complexion / Build', value: [profile.complexion, profile.bodyType].filter(Boolean).join(' · '), icon: Scale },
    { label: 'Religion', value: profile.denomination ? `Christian (${profile.denomination})` : 'Christian', icon: Church },
    { label: 'Location', value: locationValue, icon: MapPin },
  ]);

  const educationRows = onlyRows([
    { label: 'Highest Qualification', value: profile.education, icon: GraduationCap },
    { label: 'Field of Study', value: profile.fieldOfStudy, icon: BookOpenCheck },
    { label: 'College / University', value: profile.college, icon: Landmark },
    { label: 'Profession', value: profile.profession || profile.occupation, icon: Briefcase },
    { label: 'Employment', value: profile.employmentType, icon: Activity },
    { label: 'Annual Income', value: profile.annualIncome || profile.income, icon: Banknote },
  ]);

  const familyRows = onlyRows([
    { label: "Father's Name", value: profile.fathersName, icon: UserRound },
    { label: "Father's Occupation", value: profile.fathersOccupation, icon: Briefcase },
    { label: "Mother's Name", value: profile.mothersName, icon: UserRound },
    { label: "Mother's Occupation", value: profile.mothersOccupation, icon: Briefcase },
    { label: 'Siblings', value: profile.numberOfSiblings, icon: Users },
    { label: 'Family Type', value: profile.familyType, icon: House },
    { label: 'Family Background', value: profile.familyBackground || profile.familyFaithBackground, icon: ScrollText, wide: true },
  ]);

  const lifestyleRows = onlyRows([
    { label: 'Eating Habits', value: profile.dietaryHabits || profile.diet, icon: Utensils },
    { label: 'Drinking', value: profile.drinkingHabits, icon: Wine },
    { label: 'Smoking', value: profile.smokingHabits, icon: Cigarette },
  ]);
  const languageList = toList(profile.languagesKnown || profile.languages);
  const hobbyList = toList(profile.hobbies);
  const hasLifestyle = lifestyleRows.length > 0 || languageList.length > 0 || hobbyList.length > 0;

  const prefs: any = profile.partnerPreferences || {};
  const preferenceRows = onlyRows([
    { label: 'Age range', value: prefs.ageRange || (prefs.ageMin || prefs.ageMax ? `${prefs.ageMin || 21} – ${prefs.ageMax || 35}` : ''), icon: Cake },
    { label: 'Height', value: prefs.heightRange || (prefs.heightMin && prefs.heightMax ? `${prefs.heightMin} – ${prefs.heightMax}` : ''), icon: Ruler },
    { label: 'Marital status', value: toList(prefs.maritalStatus).join(' · ') || 'Never married', icon: Users },
    { label: 'Denomination', value: toList(prefs.denominations || prefs.denomination).join(' · ') || 'Open to all', icon: Church },
    { label: 'Education', value: prefs.educationLevel || prefs.education || 'Graduate & above', icon: GraduationCap },
    { label: 'Location', value: [prefs.city, prefs.country].filter(Boolean).join(', ') || prefs.location || 'Anywhere', icon: MapPin },
    { label: 'Eating habits', value: prefs.dietaryHabits, icon: Utensils },
    { label: 'Willing to relocate', value: prefs.relocationPreference, icon: Globe },
  ]);
  const preferenceTongues = toList(prefs.motherTongue);

  const faithRows = onlyRows([
    { label: 'Denomination', value: profile.denomination, icon: Church },
    { label: 'Baptized', value: profile.baptized, icon: Droplet },
    ...(isOwnProfile || isAdmin ? [
      { label: 'Church', value: profile.churchName, icon: Cross },
      { label: 'Church City', value: profile.churchCity, icon: MapPin },
      { label: 'Church Area', value: profile.churchArea, icon: Globe },
      { label: 'Pastor', value: profile.pastorName, icon: UserRound },
      { label: 'Pastor Number', value: profile.pastorNumber, icon: MessageCircle },
    ] as DetailItem[] : []),
  ]);
  const spiritualList = toList(profile.spiritualInvolvement);

  const updatedAtLabel = formatDateValue(profile.updatedAt);

  return (
    <div className="min-h-screen relative overflow-hidden pb-20"
      style={{
        background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
          {/* Cover banner — Sanctuary "pf2-cover" with overlaid nav */}
          <div className="sanctuary-grain sanctuary-panel rounded-[2rem] h-44 md:h-[190px] relative overflow-hidden">
            <div className="absolute right-10 top-1/2 -translate-y-1/2 font-headline text-[110px] md:text-[150px] opacity-10 text-white leading-none select-none">✝</div>
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 md:px-8 py-4">
              <Link to={`/profile/${id}`} className="flex items-center gap-3 font-headline font-bold text-white hover:opacity-90 transition-opacity">
                <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-16 h-16 object-contain drop-shadow-lg" />
                <span className="text-[17px] md:text-[28px] whitespace-nowrap font-extralight" style={{ fontFamily: "'Outfit', sans-serif" }}>The Kingdom Alliances</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-[12.5px] font-semibold text-white/75">
                <Link to="/matches" className="hover:text-[#dfc88a] transition-colors">Matches</Link>
                <Link to="/messages" className="hover:text-[#dfc88a] transition-colors">Messages</Link>
                <Link to={`/profile/${currentUser?.uid}`} className="text-[#dfc88a]">My Profile</Link>
                <button
                  type="button"
                  onClick={logout}
                  disabled={isLoggingOut}
                  title="Logout"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/25 bg-white/10 text-white/85 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Logout
                </button>
              </nav>
              <button
                type="button"
                onClick={logout}
                disabled={isLoggingOut}
                aria-label="Logout"
                title="Logout"
                className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/25 bg-white/10 text-white/85 text-[11.5px] font-semibold active:bg-white/25 transition-colors disabled:opacity-60"
              >
                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                Logout
              </button>
            </div>
          </div>
          <div className="relative z-10 -mt-11 rounded-[20px] border border-[#eee7d8] bg-white shadow-[0_20px_50px_-25px_rgba(74,53,33,0.25)] sm:-mt-14 sm:rounded-[2rem] md:-mt-16">
            <div className="p-4 sm:p-6 md:p-10">
              <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-8 sm:gap-6">
                {/* Profile Photo with Golden Ring */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div
                    className="w-[86px] h-[86px] rounded-[20px] border-[3px] border-white shadow-2xl overflow-hidden cursor-pointer relative z-10 ring-1 ring-slate-100 sm:w-32 sm:h-32 sm:rounded-[24px] sm:border-[4px] md:w-44 md:h-44 md:rounded-[28px] md:border-[5px]"
                    onClick={() => {
                      const mainPhoto = profile.photoUrl || profile.pendingPhotoUrl;
                      const gallery = (profile.gallery || []).filter((p: any) => p.status === 'approved' || isOwnProfile);
                      openLightbox(0, [mainPhoto, ...gallery.map((p: any) => p.url)]);
                    }}
                  >
                    <PhotoProtector>
                      <img
                        src={getSecureImageUrl(
                          canViewPhotos
                            ? ((isOwnProfile && profile.photoStatus === 'rejected' && profile.rejectedPhotoUrl)
                              ? profile.rejectedPhotoUrl
                              : (profile.photoUrl || profile.pendingPhotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`))
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`
                        )}
                        alt={profile.name}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                          (!canViewPhotos || (isOwnProfile && profile.photoStatus === 'rejected' && profile.rejectedPhotoUrl) || connectionState?.status === 'declined') ? 'blur-md scale-95' : ''
                        }`}
                      />
                    </PhotoProtector>
                    {!canViewPhotos && profile.photoStatus !== 'pending' && !(isOwnProfile && profile.photoStatus === 'rejected' && profile.rejectedPhotoUrl) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px] z-20">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 border border-white/30">
                          <Lock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-white text-[11px] font-semibold text-center leading-tight px-4">
                          Photo visible after<br />connection accepted
                        </p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                    {profile.photoStatus === 'pending' && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Clock className="w-8 h-8 text-white animate-pulse" />
                          <span className="text-white text-xs font-medium">Pending Review</span>
                        </div>
                      </div>
                    )}

                    {isOwnProfile && profile.photoStatus === 'rejected' && profile.rejectedPhotoUrl && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                        <div className="flex flex-col items-center gap-2 max-w-[85%]">
                          <XCircle className="w-9 h-9 text-red-500" />
                          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Photo Rejected</span>
                          <p className="text-white text-[11px] font-medium leading-relaxed px-1 break-words max-h-24 overflow-y-auto">
                            Reason: {profile.rejectedPhotoReason || "Does not meet guidelines"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {isOwnProfile && (
                    <button
                      onClick={() => { setUploadTarget('profile'); setShowUploadModal(true); }}
                      className="absolute bottom-0.5 right-0.5 p-1.5 bg-secondary text-on-secondary rounded-full shadow-lg hover:scale-110 transition-all z-20 ring-2 ring-white sm:p-2"
                    >
                      <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  )}
                </div>

                {/* Identity Info */}
                <div className="flex w-full flex-col items-center gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
                  <div className="space-y-2.5 text-center md:space-y-4 md:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2.5 md:justify-start md:gap-4">
                      <h1 className="member-name text-[27px] leading-[1.05] sm:text-[34px] md:text-[46px] text-[#4a3521]">
                        {fullName || defaultName}
                        {!isDeclinedPrivacy && <span className="member-age">{profile.age} yrs</span>}
                      </h1>

                      <div className="flex gap-1.5 sm:gap-2">
                        {!isOwnProfile && !isAdmin && (
                          <OnlineIndicator uid={id!} initialLastActive={profile.lastActive} />
                        )}
                        {profile.isApproved ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[9px] sm:text-[10.5px] font-bold tracking-[0.6px] sm:tracking-[1px] text-[#3d2f05]"
                            style={{ background: 'linear-gradient(135deg, #dfc88a, #C9A84C)' }}>
                            ✦ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[9px] sm:text-[10.5px] font-bold tracking-[0.6px] sm:tracking-[1px] bg-[#f3ede3] text-[#a89f8d] border border-[#e5dcc9]">
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Pending
                          </span>
                        )}
                        {profile.photoStatus === 'pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[9px] sm:text-[10.5px] font-bold tracking-[0.6px] sm:tracking-[1px] bg-amber-50 text-amber-700 border border-amber-100">
                            <Clock className="w-3 h-3" /> Photo Review
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[#8a7a65] text-[11px] font-medium md:justify-start md:gap-x-2.5 md:gap-y-2 md:text-[13.5px]">
                      {profile.profileId && (
                        <>
                          <span>{profile.profileId}</span>
                          <span className="w-[3px] h-[3px] rounded-full bg-[#c9bda9]" />
                        </>
                      )}
                      <span>
                        {profile.cityLiving || profile.city ? `${profile.cityLiving || profile.city}, ${profile.countryLiving || profile.state || ''}` : 'Location not specified'}
                      </span>
                      <span className="w-[3px] h-[3px] rounded-full bg-[#c9bda9]" />
                      <span>{profile.denomination ? `Christian (${profile.denomination})` : 'Christian'}</span>
                      {profile.createdAt && !isOwnProfile && (
                        <>
                          <span className="w-[3px] h-[3px] rounded-full bg-[#c9bda9]" />
                          <span>Member since {formatDateValue(profile.createdAt) || ''}</span>
                        </>
                      )}
                      {profile.occupation && (
                        <>
                          <span className="w-[3px] h-[3px] rounded-full bg-[#c9bda9]" />
                          <span>{profile.occupation}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {isOwnProfile && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="w-full shrink-0 items-center justify-center gap-2 rounded-[13px] border-[1.5px] border-[#e5dcc9] bg-white px-4 py-2 text-[#8f6337] font-bold text-[12px] flex shadow-[0_6px_18px_-8px_rgba(74,53,33,0.25)] transition-colors hover:border-[#d2a273] whitespace-nowrap sm:w-auto sm:justify-start sm:px-6 sm:py-2.5 sm:text-[13px]"
                    >
                      <PenLine aria-hidden className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Edit Profile
                    </button>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Quick Stats — clickable Sanctuary pill-bar (own profile only) */}
      {isOwnProfile && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-4 border border-[#eee5d2] bg-white rounded-[16px] overflow-hidden shadow-[0_12px_36px_-22px_rgba(143,99,55,0.28)] sm:rounded-[20px] sm:grid-cols-4 xl:grid-cols-8">
          {(() => {
            const completionFields = [
              profile.photoUrl, profile.aboutMe, profile.dob, profile.height,
              profile.education, profile.occupation, profile.city, profile.denomination,
              profile.churchName, profile.maritalStatus
            ];
            const profileComplete = Math.round(completionFields.filter(Boolean).length / completionFields.length * 100);
            const memberSince = profile.createdAt
              ? new Date(profile.createdAt.toDate ? profile.createdAt.toDate() : profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).replace(' ', ' \'')
              : '—';
            const tiles: { v: string | number, k: string, to?: string }[] = [
              { v: stats.views, k: 'Profile Views', to: '/dashboard' },
              { v: stats.interests, k: 'Interests', to: '/interests' },
              { v: stats.shortlistedBy, k: 'Shortlisted By', to: '/shortlist' },
              { v: `${profileComplete}%`, k: 'Profile Complete', to: '/onboarding' },
              { v: stats.unread, k: 'Unread Messages', to: '/messages' },
              { v: stats.connections, k: 'Connections', to: '/messages' },
              { v: recommendedMatches.length || '✦', k: 'Matches', to: '/matches' },
              { v: memberSince, k: 'Member Since' }
            ];
            return tiles.map((s, i) => {
              const isRowStart = i % 4 === 0;
              return (
                <button
                  key={s.k}
                  type="button"
                  onClick={() => s.to && navigate(s.to)}
                  className={
                    'text-center px-1.5 py-3 border-[#eee5d2] transition-colors sm:px-3 sm:py-[18px] ' +
                    (isRowStart ? (i > 0 ? 'xl:border-l' : '') : 'border-l') +
                    (i >= 4 ? ' border-t xl:border-t-0' : '') + ' ' +
                    (s.to ? 'cursor-pointer hover:bg-[#faf4ea] group' : 'cursor-default')
                  }
                >
                  <div className="font-headline text-[18px] font-semibold text-[#8f6337] transition-colors group-hover:text-[#b8860b] sm:text-[24px]">{s.v}</div>
                  <div className="mt-1 text-[7.5px] font-bold uppercase tracking-[0.6px] text-[#a89f8d] whitespace-nowrap sm:text-[9.5px] sm:tracking-[1.4px]">{s.k}</div>
                </button>
              );
            });
          })()}
        </div>
      </div>
      )}


      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-12">
        <div className="grid grid-cols-1 gap-3 sm:gap-5 lg:grid-cols-12">

          {/* Left Column: Navigation & Content */}
          <div className="space-y-3 lg:col-span-7 sm:space-y-4">

            {/* Navigation Tabs */}
            <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-[#eee5d2] bg-white p-1 shadow-[0_10px_28px_-24px_rgba(74,53,33,0.35)] sm:gap-1.5 sm:p-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/60 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[13px]',
                    activeTab === tab.id
                      ? 'text-white shadow-[0_10px_22px_-14px_rgba(143,99,55,0.75)]'
                      : 'text-[#a89f8d] hover:bg-[#faf4ea] hover:text-[#4a3521]'
                  )}
                  style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #b3804c 0%, #96683a 100%)' } : undefined}
                >
                  <tab.icon aria-hidden className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              className="space-y-3.5 sm:space-y-8"
            >
              {activeTab === 'about' && (
                <div className="space-y-3 sm:space-y-4">
                  {/* ─── About Me: the register entry ─── */}
                  <div
                    id="about-card"
                    className="relative rounded-[18px] border border-[#eee5d2] bg-white p-4 sm:rounded-[22px] sm:p-6 lg:p-8 shadow-[0_18px_44px_-30px_rgba(74,53,33,0.28)] transition-shadow duration-300 hover:shadow-[0_26px_56px_-30px_rgba(74,53,33,0.34)]"
                  >
                    <div className="flex items-center gap-2.5 mb-4 sm:gap-3 sm:mb-6">
                      <span className="grid place-items-center w-6 h-6 rounded-[8px] bg-[#faf4ea] border border-[#f0e5cc] text-[#b8860b] shrink-0 sm:w-7 sm:h-7 sm:rounded-[9px]">
                        <ScrollText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                      <h2 className="text-[9.5px] font-bold uppercase tracking-[1.6px] text-[#b8860b] whitespace-nowrap sm:text-[10.5px] sm:tracking-[2.2px]">About Me</h2>
                      <span aria-hidden className="h-px flex-1 bg-[#f0ead9]" />
                    </div>

                    {bio ? (
                      <>
                        <div className="relative">
                          {/* Gilt quotation mark — the register's opening flourish */}
                          <span aria-hidden className="pointer-events-none select-none absolute -top-7 -left-0.5 font-headline text-[64px] leading-none text-[#f3e6cc] sm:-top-9 sm:text-[92px]">&ldquo;</span>

                          <div className="relative border-l-2 border-[#f0e5cc] pl-3.5 sm:pl-5">
                            <motion.div
                              initial={false}
                              animate={{ height: clampedBio ? BIO_CLAMP_HEIGHT : 'auto' }}
                              transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <p className="text-[13.5px] leading-[1.75] font-medium text-[#5c4d3c] whitespace-pre-wrap sm:text-[15px] sm:leading-[1.85] lg:text-[15.5px]">
                                <span className="float-left mt-[2px] mr-2 font-headline text-[34px] leading-[0.78] text-[#b8860b] sm:mt-[3px] sm:mr-2.5 sm:text-[44px]">{bio.charAt(0)}</span>
                                {bio.slice(1)}
                              </p>
                            </motion.div>

                            {clampedBio && (
                              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/85 to-transparent" />
                            )}
                          </div>

                          {isLongBio && (
                            <button
                              onClick={() => setBioExpanded((v) => !v)}
                              aria-expanded={bioExpanded}
                              className="relative mt-3 inline-flex items-center gap-1.5 rounded-full px-1 text-[12px] font-bold text-[#8f6337] transition-colors hover:text-[#b8860b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/60"
                            >
                              {bioExpanded ? 'Show less' : 'Read the full bio'}
                              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-300', bioExpanded && 'rotate-180')} />
                            </button>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[#f4eedf] pt-3.5 sm:mt-6 sm:gap-x-4 sm:pt-4">
                          {updatedAtLabel && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1.4px] text-[#a89f8d]">
                              <Calendar className="w-3.5 h-3.5 text-[#c8b48a]" /> Updated {updatedAtLabel}
                            </span>
                          )}
                          {updatedAtLabel && <span aria-hidden className="hidden sm:block w-px h-3 bg-[#eee5d2]" />}
                          <span className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#a89f8d]">
                            {bioWords} {bioWords === 1 ? 'word' : 'words'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-[14px] border border-dashed border-[#e5dcc9] bg-[#fdfaf4] px-4 py-7 text-center sm:rounded-[16px] sm:px-6 sm:py-9">
                        <Quote className="mx-auto w-6 h-6 text-[#d8cbb4]" />
                        <p className="mt-3 font-headline text-[17px] text-[#4a3521]">
                          {isOwnProfile ? 'Your story is still unwritten' : 'This member has not written a bio yet'}
                        </p>
                        <p className="mx-auto mt-1.5 max-w-sm text-[13px] font-medium leading-relaxed text-[#a89f8d]">
                          {isOwnProfile
                            ? 'A few honest sentences about your faith, your service and the home you hope to build go a long way.'
                            : 'The record below covers the essentials — send an interest to start a conversation.'}
                        </p>
                        {isOwnProfile && (
                          <button
                            onClick={() => setShowEditModal(true)}
                            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-[13px] border-[1.5px] border-[#e5dcc9] bg-white text-[13px] font-bold text-[#8f6337] transition-colors hover:border-[#d2a273] hover:bg-[#fdf8ec] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/60"
                          >
                            <PenLine className="w-4 h-4" /> Write your About Me
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ─── Personal Essentials ─── */}
                  <ProfileSection icon={UserRound} title="Personal Essentials" compact>
                    <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-3">
                      {essentialsRows.map((row) => <Detail key={row.label} dense {...row} />)}
                    </div>
                  </ProfileSection>

                  {/* ─── Education & Career ─── */}
                  {educationRows.length > 0 && (
                    <ProfileSection icon={BookOpenCheck} title="Education & Career" compact>
                      <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-3">
                        {educationRows.map((row) => <Detail key={row.label} dense {...row} />)}
                      </div>
                    </ProfileSection>
                  )}

                  {/* ─── Family & Home ─── */}
                  {familyRows.length > 0 && (
                    <ProfileSection icon={House} title="Family & Home" compact>
                      <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-3">
                        {familyRows.map((row) => <Detail key={row.label} dense {...row} />)}
                      </div>
                    </ProfileSection>
                  )}

                  {/* ─── Lifestyle & Interests ─── */}
                  {hasLifestyle && (
                    <ProfileSection icon={Feather} title="Lifestyle & Interests" compact>
                      {lifestyleRows.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-3">
                          {lifestyleRows.map((row) => <Detail key={row.label} dense {...row} />)}
                        </div>
                      )}
                      {(languageList.length > 0 || hobbyList.length > 0) && (
                        <div className={cn('space-y-2.5', lifestyleRows.length > 0 && 'mt-2.5 pt-2.5 border-t border-[#f4eedf]')}>
                          {languageList.length > 0 && <PillGroup icon={Languages} label="Languages spoken" items={languageList} dense />}
                          {hobbyList.length > 0 && <PillGroup icon={Feather} label="Hobbies & interests" items={hobbyList} dense />}
                        </div>
                      )}
                    </ProfileSection>
                  )}

                </div>
              )}



              {activeTab === 'privacy' && isOwnProfile && (
                <div className="space-y-3 sm:space-y-4">
                  <BlockedUsersList />

                  {/* Danger Zone — Delete My Profile */}
                  <div
                    className="rounded-[2rem] p-8 border-2 border-red-200"
                    style={{ background: 'rgba(254, 242, 242, 0.6)' }}
                  >
                    <h2 className="text-xl font-bold text-red-700 flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6" /> Danger Zone
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-5">
                      Permanently delete your Kingdom Alliance profile. Your account will be
                      disabled immediately and permanently removed after 7 days. Until then you
                      can reactivate it any time by simply logging in.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md flex items-center gap-2 hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" /> Delete My Profile
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">

                  {!isOwnProfile && !isAdmin && (
                    <div className="rounded-[16px] border border-[#eee5d2] bg-white p-3.5 shadow-[0_18px_44px_-30px_rgba(74,53,33,0.28)] sm:rounded-[20px] sm:p-4 lg:p-5">
                      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
                        {/* Three states only:
                            1. No interest yet       -> "Send Interest"
                            2. Sender (just sent)    -> "Interest Sent" (disabled)
                            3. Receiver (pending)    -> "Accept" + "Decline"
                            Every other state (accepted, declined, etc.) is
                            surfaced through dedicated pages (Messages,
                            Interests), not via extra buttons here. */}
                        {((!connectionState || connectionState.status === 'none') && !interestJustSent) && !(connectionState?.status === 'pending' && connectionState?.fromId === currentUser?.uid) && (
                          <button
                            onClick={handleSendInterest}
                            disabled={sendingInterest}
                            className="w-full px-5 py-3 sm:px-10 sm:py-4 rounded-[14px] font-bold text-[15px] transition-all flex items-center justify-center gap-3 text-white shadow-[0_12px_28px_-12px_rgba(143,99,55,0.55)] hover:-translate-y-0.5 active:translate-y-0"
                            style={{ background: 'linear-gradient(135deg, #b3804c 0%, #96683a 100%)' }}
                          >
                            {sendingInterest ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Heart className="w-5 h-5 sm:w-6 sm:h-6" />}
                            Send Interest
                          </button>
                        )}

                        {(interestJustSent || (connectionState?.status === 'pending' && connectionState?.fromId === currentUser?.uid)) && (
                          <button
                            disabled
                            className="w-full px-5 py-3 sm:px-10 sm:py-4 rounded-[14px] font-bold text-[15px] transition-all flex items-center justify-center gap-3 text-white opacity-70 cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #b3804c 0%, #96683a 100%)' }}
                          >
                            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                            Interest Sent
                          </button>
                        )}

                        {connectionState?.status === 'pending' && connectionState?.toId === currentUser?.uid && (
                          <div className="flex flex-col w-full gap-2.5 sm:gap-4">
                            <div className="flex w-full gap-2.5 sm:gap-4">
                              <button
                                onClick={handleAcceptInterest}
                                disabled={sendingInterest}
                                className="flex-1 px-5 py-3 sm:px-8 sm:py-4 rounded-[14px] font-bold text-[13.5px] sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg bg-primary text-on-primary hover:bg-primary/90 hover:-translate-y-1 active:translate-y-0"
                              >
                                {sendingInterest ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Check className="w-5 h-5 sm:w-6 sm:h-6" />}
                                Accept
                              </button>
                              <button
                                onClick={() => setShowDeclineConfirm(true)}
                                disabled={sendingInterest}
                                className="flex-1 px-5 py-3 sm:px-8 sm:py-4 rounded-[14px] font-bold text-[13.5px] sm:text-lg transition-all flex items-center justify-center gap-2 shadow-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-variant hover:-translate-y-1 active:translate-y-0 border border-outline-variant"
                              >
                                Decline
                              </button>
                            </div>
                            <button
                              onClick={() => setShowBlockConfirm(true)}
                              disabled={sendingInterest}
                              className="w-full px-5 py-2.5 sm:py-3 rounded-[14px] font-bold text-[12px] sm:text-[13px] transition-all flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              Block User
                            </button>
                          </div>
                        )}

                        {/* Read-only status chip for resolved connections.
                            Active actions (message, end, unblock) live in the
                            dedicated Messages and Interests pages. */}
                        {connectionState?.status === 'accepted' && (
                          <div className="flex flex-col w-full gap-2.5">
                            <div className="w-full px-5 py-3 sm:px-8 sm:py-4 rounded-[14px] font-bold text-[13.5px] sm:text-lg flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-100">
                              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
                              Connected
                            </div>
                            <button
                              onClick={() => setShowBlockConfirm(true)}
                              disabled={sendingInterest}
                              className="w-full px-5 py-2.5 sm:py-3 rounded-[14px] font-bold text-[12px] sm:text-[13px] transition-all flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              Block User
                            </button>
                          </div>
                        )}

                        {connectionState?.status === 'declined' && (connectionState?.blocked || currentProfile?.blockedUsers?.includes(id)) && connectionState?.declinedBy === currentUser?.uid && (
                          <div className="flex flex-col w-full gap-2.5">
                            <div className="w-full px-5 py-3 sm:px-8 sm:py-4 rounded-[14px] font-bold text-[13.5px] sm:text-lg flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200">
                              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
                              Blocked
                            </div>
                            <button
                              onClick={() => setShowUnblockConfirm(true)}
                              disabled={sendingInterest}
                              className="w-full px-5 py-2.5 sm:py-3 rounded-[14px] font-bold text-[12px] sm:text-[13px] transition-all flex items-center justify-center gap-2 text-green-700 hover:bg-green-50 border border-green-200 hover:border-green-300"
                            >
                              <Check className="w-4 h-4" />
                              Unblock User
                            </button>
                          </div>
                        )}

                        {connectionState?.status === 'declined' && !(connectionState?.blocked || currentProfile?.blockedUsers?.includes(id)) && (
                          <div className="w-full px-5 py-3 sm:px-8 sm:py-4 rounded-[14px] font-bold text-[13.5px] sm:text-lg flex items-center justify-center gap-2 bg-surface-container-high text-on-surface-variant border border-outline-variant">
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            Declined
                          </div>
                        )}
                      </div>
                      <p className="text-center text-xs text-on-surface-variant mt-3 font-medium">Connect meaningfully — every interest is prayerfully considered.</p>
                    </div>
                  )}


                  {/* ─── Photo Gallery ─── */}
                  <ProfileSection
                    icon={ImageIcon}
                    title="Photo Gallery"
                    compact
                    action={isOwnProfile ? (
                      <button
                        onClick={() => {
                          if ((profile.gallery || []).length >= 3) {
                            setShowLimitAlert(true);
                            return;
                          }
                          setUploadTarget('gallery');
                          setShowUploadModal(true);
                        }}
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-[#3d2f05] shadow-[0_8px_20px_-12px_rgba(184,134,11,0.7)] transition-transform hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/60 sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-[11px]"
                        style={{ background: 'linear-gradient(135deg, #dfc88a, #C9A84C)' }}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add photo
                      </button>
                    ) : undefined}
                  >

                    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                      {(profile.gallery || []).filter((p: any) => p.status === 'approved' || isOwnProfile).map((photo: any, index: number) => (
                        <div key={photo.id} className="relative group aspect-[4/5] rounded-[16px] overflow-hidden border border-[#f0ead9] shadow-[0_10px_24px_-18px_rgba(74,53,33,0.4)]">
                          <PhotoProtector showWatermark>
                            <img
                              src={canViewPhotos ? getSecureImageUrl(photo.url) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}-gallery-${index}`}
                              alt="Gallery"
                              className={`w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110 ${
                                (!canViewPhotos || photo.status === 'rejected' || isDeclinedPrivacy) ? 'blur-md scale-95 pointer-events-none' : ''
                              }`}
                              onClick={() => {
                                if (!canViewPhotos || photo.status === 'rejected' || isDeclinedPrivacy) return;
                                const mainPhoto = profile.photoUrl || profile.pendingPhotoUrl;
                                const gallery = (profile.gallery || []).filter((p: any) => p.status === 'approved' || isOwnProfile);
                                openLightbox(index + 1, [mainPhoto, ...gallery.map((p: any) => p.url)]);
                              }}
                            />
                          </PhotoProtector>
                          {!canViewPhotos && photo.status !== 'pending' && photo.status !== 'rejected' && !isDeclinedPrivacy && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px] z-20">
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1.5 border border-white/30">
                                <Lock className="w-4 h-4 text-white" />
                              </div>
                              <p className="text-white text-[9px] font-semibold text-center leading-tight px-3">
                                Connect to<br />view photo
                              </p>
                            </div>
                          )}
                          {photo.status === 'pending' && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Clock className="w-6 h-6 text-white animate-pulse" />
                                <span className="text-white text-xs font-semibold">Moderating</span>
                              </div>
                            </div>
                          )}
                          {photo.status === 'rejected' && (
                            <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center z-10">
                              <div className="flex flex-col items-center gap-1.5 max-w-full">
                                <XCircle className="w-7 h-7 text-red-500" />
                                <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Photo Rejected</span>
                                <p className="text-white text-[11px] font-medium leading-tight px-1 break-words max-h-16 overflow-y-auto">
                                  Reason: {photo.rejectionReason || "Does not meet guidelines"}
                                </p>
                              </div>
                            </div>
                          )}
                          {isOwnProfile && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePhoto(photo.id);
                              }}
                              className="absolute top-3 right-3 p-2.5 bg-error hover:bg-error/90 text-white rounded-xl transition-all shadow-lg z-30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {(!profile.gallery || profile.gallery.length === 0) && (
                        <div className="col-span-full rounded-[14px] border border-dashed border-[#e5dcc9] bg-[#fdfaf4] py-10 text-center sm:rounded-[16px] sm:py-14">
                          <ImageIcon className="mx-auto w-10 h-10 text-[#d8cbb4]" />
                          <p className="mt-3 font-headline text-[16px] text-[#4a3521]">
                            {isOwnProfile ? 'No photos shared yet' : 'This member has no photos yet'}
                          </p>
                          {isOwnProfile && (
                            <p className="mx-auto mt-1.5 max-w-xs text-[12.5px] font-medium leading-relaxed text-[#a89f8d]">
                              Up to three clear, recent photos — faces read best.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </ProfileSection>


            {/* ─── Partner Preferences ─── */}
            <ProfileSection icon={HeartHandshake} title="Partner Preferences" compact>
              {/* Two columns at every width — the full preference set reads in a single glance */}
              <div className="grid grid-cols-2 gap-1.5">
                {preferenceRows.map((row) => <Detail key={row.label} dense {...row} />)}

                {preferenceTongues.length > 0 && (
                  <div className="col-span-full mt-0.5">
                    <PillGroup icon={Languages} label="Preferred mother tongue" items={preferenceTongues} dense />
                  </div>
                )}

                {prefs.otherPreferences && (
                  <Detail label="My desired partner" value={prefs.otherPreferences} icon={ScrollText} wide dense />
                )}
              </div>
              
              {currentProfile && (() => {
                const matchScore = calculateMatchScore(currentProfile, profile);
                return (
                  <div className="mt-2.5 pt-2.5 border-t border-[#f4eedf]">
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <span className="text-[9.5px] font-bold uppercase tracking-[1.5px] text-[#a89f8d]">Match score</span>
                      <span className="font-headline text-[19px] font-semibold leading-none text-[#8f6337]">{matchScore}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#f4eedf] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${matchScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #dfc88a, #b3804c)' }}
                      />
                    </div>
                    <p className="mt-1.5 text-center text-[9.5px] font-bold uppercase tracking-[1.4px] text-[#a89f8d]">Based on your shared values</p>
                  </div>
                );
              })()}
            </ProfileSection>

            {/* ─── Faith & Church ─── */}
            <ProfileSection icon={Cross} title="Faith & Church" compact>
              {faithRows.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {faithRows.map((row) => <Detail key={row.label} dense {...row} />)}
                </div>
              ) : (
                <p className="text-[12.5px] font-medium text-[#a89f8d]">
                  Church details have not been added to this record yet.
                </p>
              )}
              {spiritualList.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-[#f4eedf]">
                  <PillGroup icon={Sparkles} label="Ministry & service" items={spiritualList} dense />
                </div>
              )}
            </ProfileSection>

          </div>
        </div>

        {/* Find Your Match Section */}
        {recommendedMatches.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
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

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-8">
              {recommendedMatches.map((match) => (
                <motion.div
                  key={match.id}
                  whileHover={{ y: -10 }}
                  onClick={() => navigate(`/profile/${match.id}`)}
                  className="rounded-[16px] overflow-hidden cursor-pointer group sm:rounded-[2rem]"
                  style={glassCardStyle}
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img 
                      src={match.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${match.name}`} 
                      alt={match.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6">
                      <h3 className="member-name member-name-sm mb-0.5 text-[18px] text-white sm:mb-1 sm:text-[26px]">
                        {match.name}
                        <span className="member-age !text-[#dfc88a]">{match.age} yrs</span>
                      </h3>
                      <p className="text-white/80 text-[11px] flex items-center gap-1 sm:text-sm">
                        <MapPin className="w-3 h-3" /> {match.location || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6 flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8.5px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Denomination</span>
                      <span className="text-[12px] sm:text-base text-slate-700 font-bold truncate">{match.denomination || 'Christian'}</span>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
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

      {/* Account Deletion Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirmation(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Are you sure?</h2>
                <p className="text-sm text-slate-600">
                  This action cannot be undone. Your profile will be disabled immediately and permanently deleted after a 7-day grace period.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="flex-1 px-6 py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    No, Cancel
                  </button>
                  <button
                    disabled={accountDeleteOtpLoading}
                    onClick={handleDeleteMyAccount}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {accountDeleteOtpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Deletion OTP Verification Modal */}
      <AnimatePresence>
        {showAccountDeleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deletingAccount && setShowAccountDeleteConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="p-8 space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-600"/>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Delete Your Profile?</h2>

                <div className="text-sm text-slate-600 space-y-2 text-left bg-red-50 border border-red-100 rounded-2xl p-4">
                  <p>\u2022 Your account will be <strong>disabled immediately</strong> and hidden from all other members.</p>
                  <p>\u2022 It will be <strong>permanently deleted after 7 days</strong> \u2014 profile, photos, interests, messages and all data.</p>
                  <p>\u2022 <strong>Changed your mind?</strong> Just log in during those 7 days to reactivate and restore everything.</p>
                </div>

                <p className="text-sm text-slate-600">
                  A verification code has been sent to your email. Enter it below to confirm deletion.
                </p>

                <div className="flex justify-center gap-2 py-2">
                  {accountDeleteOtpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { accountDeleteOtpRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const newCode = [...accountDeleteOtpCode];
                        newCode[idx] = val;
                        setAccountDeleteOtpCode(newCode);
                        if (val && idx < 5) accountDeleteOtpRefs.current[idx + 1]?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          accountDeleteOtpRefs.current[idx - 1]?.focus();
                        }
                      }}
                      disabled={deletingAccount}
                      className="w-10 h-12 text-center border-2 border-slate-200 rounded-lg font-bold text-lg outline-none focus:border-primary transition-colors disabled:opacity-50"
                    />
                  ))}
                </div>

                {accountDeleteOtpError && (
                  <p className="text-error text-sm font-medium">{accountDeleteOtpError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowAccountDeleteConfirm(false); setAccountDeleteOtpCode(['','','','','','']); setAccountDeleteOtpError(null); }}
                    disabled={deletingAccount}
                    className="flex-1 px-6 py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteOtpVerify}
                    disabled={deletingAccount || accountDeleteOtpCode.join('').length !== 6}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deletingAccount && <Loader2 className="w-5 h-5 animate-spin" />}
                    Confirm & Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
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
        accept="image/jpeg, image/png, image/webp, .jpg, .jpeg, .png, .webp"
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

      {/* Interest Rate Limit Alert */}
      <ConfirmationModal
        isOpen={showRateLimitAlert}
        onClose={() => setShowRateLimitAlert(false)}
        onConfirm={() => setShowRateLimitAlert(false)}
        title="Interest Limit Reached"
        message={`You have reached the maximum of 5 interests per day. Your limit will reset around ${rateLimitResetTime || 'later today'}.`}
        confirmText="OK"
        isDestructive={false}
        singleButton={true}
      />

      {/* Upload Limit Confirmation Alert */}
      <ConfirmationModal
        isOpen={showLimitAlert}
        onClose={() => setShowLimitAlert(false)}
        onConfirm={() => setShowLimitAlert(false)}
        title="Upload Limit Reached"
        message="You have reached the maximum limit of photo you can upload"
        confirmText="OK"
        isDestructive={false}
        singleButton={true}
      />

      <ConfirmationModal
        isOpen={showWithdrawConfirm}
        onClose={() => setShowWithdrawConfirm(false)}
        onConfirm={handleWithdrawInterest}
        title="Withdraw Interest"
        message="Are you sure you want to withdraw your interest? This action cannot be undone."
        confirmText="Yes, Withdraw"
        cancelText="No, Keep It"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showDeclineConfirm}
        onClose={() => setShowDeclineConfirm(false)}
        onConfirm={handleDeclineInterest}
        title="Decline Interest"
        message="Are you sure you want to decline this interest? You can change your mind later from the Declined tab."
        confirmText="Yes, Decline"
        cancelText="No, Keep It"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={handleBlock}
        title="Block User"
        message="Are you sure you want to block this user? They will no longer be able to message you or see your profile. Your connection will be removed and chat messages will be deleted."
        confirmText="Yes, Block"
        cancelText="No, Cancel"
        isDestructive={true}
      />

      <ConfirmationModal
        isOpen={showUnblockConfirm}
        onClose={() => setShowUnblockConfirm(false)}
        onConfirm={handleUnblock}
        title="Unblock User"
        message="Are you sure you want to unblock this user? Your connection will be restored and they will be able to see your profile again."
        confirmText="Yes, Unblock"
        cancelText="No, Keep Blocked"
        isDestructive={false}
      />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSaved={handleProfileSaved}
      />
    </div>
  );
}

// Helper Components

function PhotoProtector({ children, showWatermark = false }: { children: React.ReactNode; showWatermark?: boolean }) {
  return (
    <div
      className="relative w-full h-full select-none"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
    >
      {children}
      <div className="absolute inset-0 z-10 pointer-events-none" />
      {showWatermark && (
        <div
          className="absolute inset-0 z-20 pointer-events-none flex items-end justify-center pb-2 pr-2"
          aria-hidden="true"
        >
          <span className="text-[8px] font-bold tracking-[1px] text-white/30 uppercase select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            ✦ Kingdom Alliance
          </span>
        </div>
      )}
    </div>
  );
}
