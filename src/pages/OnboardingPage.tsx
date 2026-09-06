import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Mail, MapPin, Church, GraduationCap, ShieldCheck, Camera, UserPlus, Users, Heart, Globe, Lock, Briefcase, Home, FileText, Scale, Ruler, Eye, EyeOff, Hourglass } from 'lucide-react';
import { cn, formatAuthError, generateUniqueProfileId, calculateAge } from '../lib/utils';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import { uploadUserPhotos } from '../lib/storage';
import { HEIGHT_FT, WORLD_COUNTRIES, getCitiesForCountry, AGE_OPTIONS } from '../lib/locationData';
import ConfirmationModal from '../components/ConfirmationModal';
import StepIndicator from '../components/onboarding/StepIndicator';
import CollapsibleCard from '../components/onboarding/CollapsibleCard';
import { CardField, FieldInput, FieldSelect, FieldTextarea } from '../components/onboarding/CardField';
import BottomSheet, { MobileSelectTrigger } from '../components/onboarding/BottomSheet';
import PhotoPicker from '../components/onboarding/PhotoPicker';
import TurnstileWidget from '../components/onboarding/TurnstileWidget';

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Who are you?' },
  { id: 2, title: 'Personal, Career & Lifestyle', description: 'All about you' },
  { id: 3, title: 'Family Background', description: 'Your roots & religion' },
  { id: 4, title: 'Partner Preferences', description: 'Who you seek' },
  { id: 5, title: 'Photos', description: 'Show your best self' }
];

const POPULAR_DENOMINATIONS = [
  'Catholic', 'Protestant', 'Orthodox', 'Anglican / Episcopalian', 'Baptist', 'Methodist',
  'Lutheran', 'Pentecostal', 'Presbyterian', 'Evangelical', 'Non-denominational', 'Other'
];

const COUNTRY_CODES = [
  { code: '+1', name: 'US/CA' }, { code: '+44', name: 'UK' }, { code: '+61', name: 'AU' },
  { code: '+91', name: 'IN' }, { code: '+86', name: 'CN' }, { code: '+81', name: 'JP' },
  { code: '+49', name: 'DE' }, { code: '+33', name: 'FR' }, { code: '+39', name: 'IT' },
  { code: '+34', name: 'ES' }, { code: '+7', name: 'RU' }, { code: '+55', name: 'BR' },
  { code: '+52', name: 'MX' }, { code: '+27', name: 'ZA' }, { code: '+82', name: 'KR' },
  { code: '+971', name: 'AE' }, { code: '+966', name: 'SA' }, { code: '+65', name: 'SG' },
  { code: '+60', name: 'MY' }, { code: '+62', name: 'ID' }, { code: '+63', name: 'PH' },
  { code: '+64', name: 'NZ' }, { code: '+41', name: 'CH' }, { code: '+46', name: 'SE' },
  { code: '+47', name: 'NO' }, { code: '+45', name: 'DK' }, { code: '+358', name: 'FI' },
  { code: '+31', name: 'NL' }, { code: '+32', name: 'BE' }, { code: '+43', name: 'AT' },
  { code: '+30', name: 'GR' }, { code: '+351', name: 'PT' }, { code: '+48', name: 'PL' },
  { code: '+420', name: 'CZ' }, { code: '+36', name: 'HU' }, { code: '+40', name: 'RO' },
  { code: '+353', name: 'IE' }, { code: '+92', name: 'PK' }, { code: '+880', name: 'BD' },
  { code: '+94', name: 'LK' }, { code: '+977', name: 'NP' }, { code: '+95', name: 'MM' },
];

const INDIAN_LANGUAGES = [
  'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Maithili', 'Santali', 'Kashmiri', 'Nepali', 'Konkani', 'Sindhi', 'Dogri', 'Manipuri', 'Bodo', 'Sanskrit'
];

export interface UserOnboardingData {
  name: string;
  middleName: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  password?: string;
  profileFor: string;
  profileType: string;
  gender: string;
  dob: string;
  age: string;
  citizenship: string;
  countryLiving: string;
  cityLiving: string;
  maritalStatus: string;
  height: string;
  weight: string;
  bodyType: string;
  complexion: string;
  physicalStatus: string;
  physicalStatusDesc: string;
  denomination: string;
  churchName: string;
  diocese: string;
  baptized: string;
  pastorName?: string;
  pastorNumber?: string;
  churchArea?: string;
  spiritualInvolvement: string[];
  motherTongue: string;
  languagesKnown: string[];
  education: string;
  fieldOfStudy: string;
  college: string;
  profession: string;
  employmentType: string;
  annualIncome: string;
  dietaryHabits: string;
  drinkingHabits: string;
  smokingHabits: string;
  hobbies: string[];
  country: string;
  state: string;
  city: string;
  address: string;
  aboutMe: string;
  fathersName: string;
  fathersOccupation: string;
  mothersName: string;
  mothersOccupation: string;
  numberOfSiblings: string;
  churchCity: string;
  photoUrl: string;
  photoPrivacy: string;
  pendingPhotoUrl: string;
  pendingPhotoThumbUrl: string;
  photoStatus: string;
  gallery: { id: string; url: string; thumbUrl?: string; status: 'pending' | 'approved' | 'rejected' }[];
  partnerPreferences: {
    ageMin: string;
    ageMax: string;
    heightMin: string;
    heightMax: string;
    maritalStatus: string[];
    denominations: string[];
    motherTongue: string[];
    educationLevel: string;
    employmentStatus: string;
    dietaryHabits: string;
    drinkingHabits: string;
    smokingHabits: string;
    country: string;
    city: string;
    relocationPreference: string;
    otherPreferences?: string;
  };
}

export default function RegisterPage() {
  const { settings } = useSettings();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [emailVerifiedLocal, setEmailVerifiedLocal] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [galleryPhotoFiles, setGalleryPhotoFiles] = useState<{ id: string; file: File }[]>([]);
  const [turnstileTokens, setTurnstileTokens] = useState<Record<number, string>>({});

  // Bottom sheet states
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetConfig, setSheetConfig] = useState<{
    field: string;
    title: string;
    options: { value: string; label: string }[];
    multiple?: boolean;
  }>({ field: '', title: '', options: [] });
  const [sheetSelectedValues, setSheetSelectedValues] = useState<string[]>([]);

  const [formData, setFormData] = useState<UserOnboardingData>({
    name: '', middleName: '', lastName: '', email: '', countryCode: '+966', mobileNumber: '',
    password: '', profileFor: '', profileType: '', gender: '', dob: '', age: '', citizenship: '',
    countryLiving: 'Saudi Arabia', cityLiving: '', maritalStatus: '', height: '', weight: '',
    bodyType: '', complexion: '', physicalStatus: '', physicalStatusDesc: '', denomination: '',
    churchName: '', diocese: '', baptized: '', pastorName: '', pastorNumber: '', churchArea: '',
    spiritualInvolvement: [], motherTongue: '', languagesKnown: [], education: '', fieldOfStudy: '',
    college: '', profession: '', employmentType: '', annualIncome: '', dietaryHabits: '',
    drinkingHabits: '', smokingHabits: '', hobbies: [], country: '', state: '', city: '',
    address: '', aboutMe: '', fathersName: '', fathersOccupation: '', mothersName: '',
    mothersOccupation: '', numberOfSiblings: '', churchCity: '', photoUrl: '',
    photoPrivacy: 'public', pendingPhotoUrl: '', pendingPhotoThumbUrl: '', photoStatus: 'idle',
    gallery: [],
    partnerPreferences: {
      ageMin: '', ageMax: '', heightMin: '', heightMax: '', maritalStatus: [], denominations: [],
      motherTongue: [], educationLevel: '', employmentStatus: '', dietaryHabits: '',
      drinkingHabits: '', smokingHabits: '', country: 'Saudi Arabia', city: '',
      relocationPreference: '', otherPreferences: ''
    }
  });

  const isGoogleUser = user?.providerData[0]?.providerId === 'google.com';

  useEffect(() => {
    const saved = sessionStorage.getItem('saved_credentials');
    if (saved) {
      const creds = JSON.parse(saved);
      setEmailVerifiedLocal(creds.emailVerified || false);
      setFormData(prev => ({
        ...prev,
        email: creds.email || prev.email,
        name: creds.fullName?.split(' ')[0] || prev.name,
        lastName: creds.fullName?.split(' ').slice(1).join(' ') || prev.lastName,
      }));
    }
    if (user && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        pendingPhotoUrl: prev.pendingPhotoUrl || user.photoURL || ''
      }));
    }
    if (isGoogleUser) {
      setEmailVerifiedLocal(true);
    } else if (profile?.emailVerified || user?.emailVerified) {
      setEmailVerifiedLocal(true);
    }
    if (profile && profile.onboardingComplete && profile.approvalStatus === 'approved') {
      navigate('/profile');
    }
  }, [user, profile, navigate, formData.email, isGoogleUser]);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('onboarding_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('onboarding_draft', JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentObj = prev[parent as keyof UserOnboardingData];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return { ...prev, [parent]: { ...parentObj, [child]: value } };
        }
      }
      return { ...prev, [field]: value };
    });
    if (invalidFields.includes(field)) {
      setInvalidFields(prev => prev.filter(f => f !== field));
    }
  };

  const scrollToFirstError = (errors: string[]) => {
    if (errors.length > 0) {
      setTimeout(() => {
        const firstErrorField = document.getElementById(`field-${errors[0]}`);
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Photo handlers
  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert("Invalid file format. Please upload JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size >= 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }
    setProfilePhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    updateFormData('pendingPhotoUrl', localUrl);
    updateFormData('photoStatus', 'pending');
  };

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const currentCount = formData.gallery.length;
    const remainingSlots = 3 - currentCount;
    if (remainingSlots <= 0 || files.length > remainingSlots) {
      setShowLimitAlert(true);
      return;
    }
    const newPhotos = [];
    const newFiles: { id: string; file: File }[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert("Invalid file format. Please upload JPEG, PNG, or WEBP.");
        return;
      }
      if (file.size >= 10 * 1024 * 1024) {
        alert("File size must be less than 10MB.");
        return;
      }
      const photoId = Math.random().toString(36).substring(7);
      const localUrl = URL.createObjectURL(file);
      newFiles.push({ id: photoId, file });
      newPhotos.push({ id: photoId, url: localUrl, status: 'pending' as const });
    }
    setGalleryPhotoFiles(prev => [...prev, ...newFiles]);
    updateFormData('gallery', [...formData.gallery, ...newPhotos]);
  };

  const removeGalleryPhoto = (id: string) => {
    updateFormData('gallery', formData.gallery.filter(p => p.id !== id));
    setGalleryPhotoFiles(prev => prev.filter(f => f.id !== id));
  };

  // Bottom sheet helpers
  const openSheet = (field: string, title: string, options: { value: string; label: string }[], multiple = false) => {
    setSheetConfig({ field, title, options, multiple });
    if (multiple) {
      const currentVal = Array.isArray(formData[field as keyof UserOnboardingData])
        ? formData[field as keyof UserOnboardingData] as string[]
        : [];
      setSheetSelectedValues(currentVal);
    }
    setSheetOpen(true);
  };

  const handleSheetSelect = (value: string) => {
    updateFormData(sheetConfig.field, value);
  };

  const handleSheetToggleMultiple = (value: string) => {
    setSheetSelectedValues(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSheetClose = () => {
    if (sheetConfig.multiple) {
      updateFormData(sheetConfig.field, sheetSelectedValues);
    }
    setSheetOpen(false);
  };

  // Validation & Step Navigation
  const handleNext = async () => {
    setErrorMsg("");
    let errors: string[] = [];

    if (currentStep === 1) {
      const trimmedName = formData.name.trim();
      const trimmedLastName = formData.lastName.trim();
      const trimmedChurchName = formData.churchName.trim();
      const trimmedChurchCity = formData.churchCity.trim();
      const trimmedChurchArea = (formData.churchArea || '').trim();
      const trimmedPastorName = (formData.pastorName || '').trim();
      const trimmedPastorNumber = (formData.pastorNumber || '').trim();

      setFormData(prev => ({
        ...prev, name: trimmedName, lastName: trimmedLastName, churchName: trimmedChurchName,
        churchCity: trimmedChurchCity, churchArea: trimmedChurchArea,
        pastorName: trimmedPastorName, pastorNumber: trimmedPastorNumber
      }));

      const required = [
        'profileFor', 'profileType', 'name', 'lastName', 'email', 'mobileNumber',
        'dob', 'citizenship', 'countryLiving', 'cityLiving', 'denomination',
        'churchName', 'churchCity', 'baptized', 'churchArea', 'pastorName', 'pastorNumber'
      ];

      const valMap: Record<string, string> = {
        profileFor: formData.profileFor, profileType: formData.profileType,
        name: trimmedName, lastName: trimmedLastName, email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(), dob: formData.dob,
        citizenship: formData.citizenship, countryLiving: formData.countryLiving,
        cityLiving: formData.cityLiving, denomination: formData.denomination,
        churchName: trimmedChurchName, churchCity: trimmedChurchCity,
        baptized: formData.baptized, churchArea: trimmedChurchArea,
        pastorName: trimmedPastorName, pastorNumber: trimmedPastorNumber
      };

      errors = required.filter(f => !valMap[f]);
      if (errors.length > 0) {
        setInvalidFields(errors);
        setErrorMsg("Please fill in all mandatory fields.");
        scrollToFirstError(errors);
        return;
      }

      if (!/^[0-9]{10}$/.test(trimmedPastorNumber)) {
        setErrorMsg("Pastor Number must be exactly 10 digits.");
        setInvalidFields(['pastorNumber']);
        scrollToFirstError(['pastorNumber']);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEmail = formData.email.trim();
      if (!emailRegex.test(cleanEmail)) {
        setErrorMsg("Please enter a valid email address.");
        setInvalidFields(['email']);
        scrollToFirstError(['email']);
        return;
      }

      if (formData.dob) {
        const dobDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
        if (age < 18) {
          setErrorMsg("You must be at least 18 years of age to register.");
          setInvalidFields(['dob']);
          scrollToFirstError(['dob']);
          return;
        }
      }

      const cleanMobile = formData.mobileNumber.replace(/[\s-]/g, '');
      if (!/^\d+$/.test(cleanMobile) || cleanMobile.length < 7 || cleanMobile.length > 15) {
        setErrorMsg("Mobile number must be standard numeric format between 7 and 15 digits.");
        setInvalidFields(['mobileNumber']);
        scrollToFirstError(['mobileNumber']);
        return;
      }

      setLoading(true);
      try {
        const emailQ = query(collection(db, "users"), where("email", "==", cleanEmail));
        const emailSnapshot = await getDocs(emailQ);
        if (emailSnapshot.docs.filter(d => d.id !== user?.uid).length > 0) {
          setErrorMsg("Email already registered. Please log in or use another email.");
          setInvalidFields(['email']);
          scrollToFirstError(['email']);
          setLoading(false);
          return;
        }
        const fullMobile = `${formData.countryCode} ${cleanMobile}`;
        const mobileQ = query(collection(db, "users"), where("mobileNumber", "==", fullMobile));
        const mobileSnapshot = await getDocs(mobileQ);
        if (mobileSnapshot.docs.filter(d => d.id !== user?.uid).length > 0) {
          setErrorMsg("The mobile number entered is already registered.");
          setInvalidFields(['mobileNumber']);
          scrollToFirstError(['mobileNumber']);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.error("Error verifying registration uniqueness:", err);
        setErrorMsg("Unable to verify email uniqueness. Please check your connection and try again.");
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }

      if (!isGoogleUser && !emailVerifiedLocal) {
        setErrorMsg("Please verify your email address via OTP before proceeding to the next step.");
        setInvalidFields(['email']);
        scrollToFirstError(['email']);
        return;
      }
    }

    if (currentStep === 2) {
      const trimmedAboutMe = formData.aboutMe.trim();
      setFormData(prev => ({ ...prev, aboutMe: trimmedAboutMe }));

      const required = ['maritalStatus', 'height', 'weight', 'bodyType', 'complexion',
        'physicalStatus', 'motherTongue', 'education', 'profession',
        'dietaryHabits', 'drinkingHabits', 'smokingHabits', 'aboutMe'];

      const valMap: Record<string, string> = {
        maritalStatus: formData.maritalStatus, height: formData.height, weight: formData.weight,
        bodyType: formData.bodyType, complexion: formData.complexion,
        physicalStatus: formData.physicalStatus, motherTongue: formData.motherTongue,
        education: formData.education, profession: formData.profession,
        dietaryHabits: formData.dietaryHabits, drinkingHabits: formData.drinkingHabits,
        smokingHabits: formData.smokingHabits, aboutMe: trimmedAboutMe
      };

      errors = required.filter(f => !valMap[f]);
      if (errors.length > 0) {
        setInvalidFields(errors);
        setErrorMsg("Please fill in all mandatory fields.");
        scrollToFirstError(errors);
        return;
      }
    }

    if (currentStep === 3) {
      const trimmedFathersName = formData.fathersName.trim();
      const trimmedFathersOccupation = formData.fathersOccupation.trim();
      const trimmedMothersName = formData.mothersName.trim();
      const trimmedMothersOccupation = formData.mothersOccupation.trim();

      setFormData(prev => ({
        ...prev, fathersName: trimmedFathersName, fathersOccupation: trimmedFathersOccupation,
        mothersName: trimmedMothersName, mothersOccupation: trimmedMothersOccupation
      }));

      const required = ['fathersName', 'fathersOccupation', 'mothersName', 'mothersOccupation', 'numberOfSiblings'];
      const valMap: Record<string, string> = {
        fathersName: trimmedFathersName, fathersOccupation: trimmedFathersOccupation,
        mothersName: trimmedMothersName, mothersOccupation: trimmedMothersOccupation,
        numberOfSiblings: formData.numberOfSiblings
      };

      errors = required.filter(f => !valMap[f]);
      if (errors.length > 0) {
        setInvalidFields(errors);
        setErrorMsg("Please fill in all mandatory Family Background fields.");
        scrollToFirstError(errors);
        return;
      }
    }

    if (currentStep === 4) {
      const pref = formData.partnerPreferences;
      const prefRequired = ['ageMin', 'ageMax', 'heightMin', 'heightMax', 'educationLevel', 'country', 'city'];
      errors = prefRequired.filter(f => !pref[f as keyof typeof pref]);
      if (pref.maritalStatus.length === 0) errors.push('pref-maritalStatus');
      if (pref.denominations.length === 0) errors.push('pref-denominations');

      if (errors.length > 0) {
        setInvalidFields(errors);
        setErrorMsg("Please fill in all mandatory Partner Preferences.");
        scrollToFirstError(errors);
        return;
      }
    }

    if (currentStep === 5 && !agreedTerms) {
      setErrorMsg("Please accept the Terms and Conditions before submitting your profile.");
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      setInvalidFields([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setInvalidFields([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!agreedTerms) {
      setErrorMsg("Please accept the Terms and Conditions before submitting your profile.");
      return;
    }

    if (!formData.pendingPhotoUrl) {
      setInvalidFields(['pendingPhotoUrl']);
      setErrorMsg("Profile photo is required.");
      scrollToFirstError(['pendingPhotoUrl']);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      let activeUser = auth.currentUser;
      const savedCredsStr = sessionStorage.getItem('saved_credentials');

      if (!activeUser && savedCredsStr) {
        const creds = JSON.parse(savedCredsStr);
        if (creds.authProvider === 'email') {
          const userCredential = await createUserWithEmailAndPassword(auth, creds.email, creds.password);
          activeUser = userCredential.user;
          if (creds.fullName) await updateProfile(activeUser, { displayName: creds.fullName });
        }
      }

      if (!activeUser) throw new Error("No active user session or registration credentials found. Please sign up again.");

      let finalProfilePhotoUrl = formData.photoUrl || '';
      let finalPendingPhotoUrl = formData.pendingPhotoUrl;
      let finalPendingThumbUrl = formData.pendingPhotoThumbUrl || '';
      let finalPhotoStatus = formData.photoStatus;
      const userName = formData.name ? `${formData.name} ${formData.lastName}` : (activeUser.displayName || 'User');

      if (profilePhotoFile) {
        const pair = await uploadUserPhotos(profilePhotoFile, activeUser.uid, 'profile');
        finalPendingPhotoUrl = pair.url;
        finalPendingThumbUrl = pair.thumbUrl;
        finalPhotoStatus = 'pending';
        await addDoc(collection(db, 'photoModeration'), {
          uid: activeUser.uid, userId: activeUser.uid, userName, photoURL: pair.url,
          thumbUrl: pair.thumbUrl, photoType: 'profilePhoto', galleryPosition: null,
          photoStatus: 'pending', uploadedAt: serverTimestamp(), reviewedAt: null, reviewedBy: null, rejectedReason: null
        });
      }

      const finalGallery = [...formData.gallery];
      for (let i = 0; i < finalGallery.length; i++) {
        const galleryItem = finalGallery[i];
        const matchingLocalFile = galleryPhotoFiles.find(f => f.id === galleryItem.id);
        if (matchingLocalFile) {
          const pair = await uploadUserPhotos(matchingLocalFile.file, activeUser.uid, 'gallery');
          galleryItem.url = pair.url;
          galleryItem.thumbUrl = pair.thumbUrl;
          await addDoc(collection(db, 'photoModeration'), {
            uid: activeUser.uid, userId: activeUser.uid, userName, photoURL: pair.url,
            thumbUrl: pair.thumbUrl, photoType: 'galleryPhoto', galleryPosition: i + 1,
            photoStatus: 'pending', uploadedAt: serverTimestamp(), reviewedAt: null, reviewedBy: null, rejectedReason: null
          });
        }
      }

      const authProvider = savedCredsStr ? JSON.parse(savedCredsStr).authProvider : (activeUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email');

      const profileData = {
        name: formData.name, middleName: formData.middleName, lastName: formData.lastName,
        mobileNumber: `${formData.countryCode} ${formData.mobileNumber}`,
        profileType: formData.profileType, profileFor: formData.profileFor, gender: formData.gender,
        dob: formData.dob, age: formData.dob ? calculateAge(formData.dob, 0) : Number(formData.age) || 0,
        citizenship: formData.citizenship, countryLiving: formData.countryLiving, cityLiving: formData.cityLiving,
        maritalStatus: formData.maritalStatus, height: formData.height, weight: formData.weight,
        bodyType: formData.bodyType, complexion: formData.complexion, physicalStatus: formData.physicalStatus,
        physicalStatusDesc: formData.physicalStatusDesc, denomination: formData.denomination,
        churchName: formData.churchName, churchCity: formData.churchCity,
        fathersName: formData.fathersName, fathersOccupation: formData.fathersOccupation,
        mothersName: formData.mothersName, mothersOccupation: formData.mothersOccupation,
        numberOfSiblings: formData.numberOfSiblings, diocese: formData.diocese, baptized: formData.baptized,
        pastorName: formData.pastorName || '', pastorNumber: formData.pastorNumber || '',
        churchArea: formData.churchArea || '', spiritualInvolvement: formData.spiritualInvolvement,
        motherTongue: formData.motherTongue, languagesKnown: formData.languagesKnown,
        education: formData.education, fieldOfStudy: formData.fieldOfStudy, college: formData.college,
        profession: formData.profession, employmentType: formData.employmentType, annualIncome: formData.annualIncome,
        dietaryHabits: formData.dietaryHabits, drinkingHabits: formData.drinkingHabits,
        smokingHabits: formData.smokingHabits, hobbies: formData.hobbies, aboutMe: formData.aboutMe,
        photoUrl: finalProfilePhotoUrl, photoPrivacy: formData.photoPrivacy,
        pendingPhotoUrl: finalPendingPhotoUrl, pendingPhotoThumbUrl: finalPendingThumbUrl,
        photoStatus: finalPhotoStatus, gallery: finalGallery,
        partnerPreferences: {
          ageMin: formData.partnerPreferences.ageMin, ageMax: formData.partnerPreferences.ageMax,
          heightMin: formData.partnerPreferences.heightMin, heightMax: formData.partnerPreferences.heightMax,
          maritalStatus: formData.partnerPreferences.maritalStatus,
          denominations: formData.partnerPreferences.denominations,
          motherTongue: formData.partnerPreferences.motherTongue,
          educationLevel: formData.partnerPreferences.educationLevel,
          employmentStatus: formData.partnerPreferences.employmentStatus,
          dietaryHabits: formData.partnerPreferences.dietaryHabits,
          drinkingHabits: formData.partnerPreferences.drinkingHabits,
          smokingHabits: formData.partnerPreferences.smokingHabits,
          country: formData.partnerPreferences.country, city: formData.partnerPreferences.city,
          relocationPreference: formData.partnerPreferences.relocationPreference,
          otherPreferences: formData.partnerPreferences.otherPreferences || ''
        },
        uid: activeUser.uid, email: formData.email || activeUser.email || '',
        emailVerified: emailVerifiedLocal, authProvider, role: 'user', isBanned: false, isSuspended: false,
        onboardingComplete: true, approvalStatus: 'pending',
        submittedAt: serverTimestamp(), updatedAt: serverTimestamp(),
        ...((profile && profile.createdAt) ? {} : { createdAt: serverTimestamp() }),
        lastActive: serverTimestamp(), profileId: await generateUniqueProfileId()
      };

      await setDoc(doc(db, 'users', activeUser.uid), {
        ...profileData, onboardingComplete: true, approvalStatus: 'pending', updatedAt: new Date()
      }, { merge: true });

      sessionStorage.removeItem('saved_credentials');
      localStorage.removeItem('onboarding_draft');

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        await fetch(`${backendUrl}/api/send-onboarding-email`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: activeUser.uid })
        });
      } catch (emailErr) {
        console.warn('Onboarding email sending failed (non-blocking):', emailErr);
      }

      setSubmissionSuccess(true);
    } catch (error: any) {
      console.error("Registration submission error:", error);
      setErrorMsg(error.message || "Failed to submit profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center p-4">
        <header className="w-full h-16 bg-surface border-b border-outline-variant flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <KingdomCrossIcon size="md" />
            <span className="font-headline text-2xl text-primary font-bold tracking-tight">{settings.siteName}</span>
          </Link>
        </header>
        <main className="flex-1 w-full max-w-lg flex flex-col items-center justify-center">
          <div className="bg-surface-container-lowest rounded-[2rem] p-10 border border-outline-variant shadow-lg text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-headline text-3xl text-on-surface">Submission Successful</h2>
            <p className="text-on-surface-variant text-base">
              Thank you, <span className="font-bold">{formData.email}</span>. Your profile has been submitted for review and approval.
            </p>
            <div className="p-4 bg-primary/5 rounded-2xl text-sm text-on-surface-variant text-left">
              We'll notify you via your email once your profile is approved.
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden font-body"
      style={{ background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)' }}>

      {/* Header */}
      <header className="sanctuary-grain sanctuary-panel text-white w-full relative overflow-hidden z-10">
        <div className="absolute right-[-30px] top-[-50px] text-[220px] opacity-[0.05] font-headline leading-none select-none pointer-events-none">✝</div>
        <div className="px-6 md:px-12 py-9 md:py-11 max-w-[1100px] mx-auto">
          <div className="san-anim flex items-center gap-3 mb-5">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-11 h-11 object-contain" />
              <div className="text-left">
                <div className="font-headline font-bold text-[15px]">{settings.siteName}</div>
                <div className="text-[#dfc88a] text-[9.5px] tracking-[3px] uppercase font-bold">Christian Matrimony</div>
              </div>
            </Link>
          </div>
          <h2 className="san-headline san-d2 font-headline text-[26px] md:text-[30px] font-medium">
            Tell us about <em className="text-[#dfc88a] font-normal">yourself</em>
          </h2>
          <p className="san-fade san-d3 text-[#e9ddca] text-[13.5px] mt-2 font-light">
            Honest, thoughtful answers help us find the partner God has prepared for you.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-8 md:py-10 flex flex-col items-center relative z-0">
        {/* Progress Stepper */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Form Area */}
        <div className="w-full max-w-[760px] p-2 md:p-3 bg-[#f5f0e6]/60 rounded-[2.5rem] border border-[#e8e1d3]/80 shadow-[0_8px_40px_-12px_rgba(74,53,33,0.12)]">
          <div className="ob-shell rounded-[calc(2.5rem-0.375rem)] overflow-hidden flex flex-col bg-white/95 backdrop-blur-sm border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_3px_rgba(74,53,33,0.06)]">

            {/* Step Header */}
            <div className="px-8 py-6 lg:px-10 lg:py-7 border-b border-[#f0ead9]/80 bg-gradient-to-b from-[#fffdf8] to-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C9A84C]/10 text-[#b8860b] text-[10px] font-bold">{currentStep}</span>
                    <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#b8860b]">Step {currentStep} of {STEPS.length}</p>
                  </div>
                  <h3 className="font-headline text-2xl lg:text-[28px] text-[#4a3521] leading-tight">{STEPS[currentStep - 1].title}</h3>
                  <p className="text-[#a89f8d] text-[13px] mt-0.5">{STEPS[currentStep - 1].description}</p>
                </div>
                <div className="hidden md:flex w-10 h-10 rounded-full bg-[#C9A84C]/8 items-center justify-center">
                  <span className="text-[#C9A84C] text-lg">✝</span>
                </div>
              </div>
            </div>

            <div className="flex-1 px-8 py-6 lg:px-10 lg:py-8">
              {/* Error Message */}
              {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-[#fef2f2] text-[#dc2626] rounded-xl border border-[#dc2626]/20 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMsg}</p>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">

                  {/* ══════ STEP 1: BASIC INFO ══════ */}
                  {currentStep === 1 && (
                    <>
                      <CollapsibleCard title="About You" icon={<User className="w-[18px] h-[18px]" />} iconColor="gold">
                        <div className="space-y-4">
                          <CardField label="Profile created for" field="profileFor">
                            <MobileSelectTrigger value={formData.profileFor} placeholder="Select option"
                              onClick={() => openSheet('profileFor', 'Profile Created For', [
                                { value: 'Self', label: 'Self' }, { value: 'Son', label: 'Son' },
                                { value: 'Daughter', label: 'Daughter' }, { value: 'Brother', label: 'Brother' },
                                { value: 'Sister', label: 'Sister' }, { value: 'Relative', label: 'Relative' },
                                { value: 'Friend', label: 'Friend' }
                              ])} hasError={invalidFields.includes('profileFor')} />
                            <FieldSelect value={formData.profileFor} onChange={(e) => updateFormData('profileFor', e.target.value)}
                              hasError={invalidFields.includes('profileFor')} placeholder="Select option"
                              options={[
                                { value: 'Self', label: 'Self' }, { value: 'Son', label: 'Son' },
                                { value: 'Daughter', label: 'Daughter' }, { value: 'Brother', label: 'Brother' },
                                { value: 'Sister', label: 'Sister' }, { value: 'Relative', label: 'Relative' },
                                { value: 'Friend', label: 'Friend' }
                              ]} />
                          </CardField>

                          <CardField label="Profile Type" field="profileType">
                            <div className="grid grid-cols-2 gap-3">
                              {(['bride', 'groom'] as const).map(type => (
                                <button key={type} type="button" onClick={() => {
                                  updateFormData('profileType', type);
                                  updateFormData('gender', type === 'groom' ? 'male' : 'female');
                                }} className={cn(
                                  "flex items-center gap-3 p-3.5 rounded-[16px] border-[1.5px] transition-all text-left",
                                  formData.profileType === type
                                    ? "border-[#C9A84C] shadow-[0_0_0_3px_rgba(201,168,76,0.12)] bg-[#fffdf6]"
                                    : "border-[#f0ead9] hover:border-[#d2a273] bg-white"
                                )}>
                                  <div className={cn(
                                    "w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors",
                                    type === 'bride'
                                      ? formData.profileType === type ? "bg-[#C9A84C] text-white" : "bg-[rgba(201,168,76,0.1)] text-[#b8860b]"
                                      : formData.profileType === type ? "bg-[#4a3521] text-white" : "bg-[rgba(74,53,33,0.06)] text-[#4a3521]"
                                  )}>
                                    <User className="w-[18px] h-[18px]" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-[13px] capitalize text-[#4a3521]">{type}</div>
                                    <div className="text-[10px] text-[#64748b]">{type === 'bride' ? 'Female profile' : 'Male profile'}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </CardField>

                          <CardField label="Full Name" field="name">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <FieldInput type="text" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)}
                                placeholder="First Name" hasError={invalidFields.includes('name')} />
                              <div>
                                <FieldInput type="text" value={formData.middleName} onChange={(e) => updateFormData('middleName', e.target.value)}
                                  placeholder="Middle Name" />
                                <span className="text-[10px] text-[#c4bba8] italic ml-1">(Optional)</span>
                              </div>
                              <FieldInput type="text" value={formData.lastName} onChange={(e) => updateFormData('lastName', e.target.value)}
                                placeholder="Last Name" hasError={invalidFields.includes('lastName')} />
                            </div>
                          </CardField>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Contact Details" icon={<Mail className="w-[18px] h-[18px]" />} iconColor="apricot">
                        <div className="space-y-4">
                          <CardField label="Email Address" field="email">
                            <div className="relative">
                              <FieldInput type="email" value={formData.email} readOnly />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isGoogleUser ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1a2e4a] bg-[#1a2e4a]/5 px-2 py-1 rounded-md border border-[#1a2e4a]/10">
                                    <Lock className="w-3 h-3" /> GOOGLE AUTH
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16a34a] bg-[#f0fdf4] px-2 py-1 rounded-md border border-[#16a34a]/15">
                                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] text-[#64748b] italic mt-1">Email address cannot be changed once verification is completed.</p>
                          </CardField>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Mobile Number" field="mobileNumber">
                              <div className="flex gap-2">
                                <FieldSelect value={formData.countryCode} onChange={(e) => updateFormData('countryCode', e.target.value)}
                                  options={COUNTRY_CODES.map(c => ({ value: c.code, label: `${c.code} ${c.name}` }))}
                                  className="max-w-[110px] flex-shrink-0" />
                                <FieldInput type="tel" value={formData.mobileNumber} onChange={(e) => updateFormData('mobileNumber', e.target.value)}
                                  placeholder="e.g. 55 123 4567" hasError={invalidFields.includes('mobileNumber')} className="flex-1" />
                              </div>
                            </CardField>
                            <CardField label="Date of Birth" field="dob">
                              <FieldInput type="date" value={formData.dob} onChange={(e) => updateFormData('dob', e.target.value)}
                                hasError={invalidFields.includes('dob')} />
                            </CardField>
                          </div>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Location" icon={<MapPin className="w-[18px] h-[18px]" />} iconColor="ink">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <CardField label="Citizenship" field="citizenship">
                            <MobileSelectTrigger value={formData.citizenship} placeholder="Select Citizenship"
                              onClick={() => openSheet('citizenship', 'Citizenship', WORLD_COUNTRIES.map(c => ({ value: c, label: c })))}
                              hasError={invalidFields.includes('citizenship')} />
                            <FieldSelect value={formData.citizenship} onChange={(e) => updateFormData('citizenship', e.target.value)}
                              hasError={invalidFields.includes('citizenship')} placeholder="Select Citizenship"
                              options={WORLD_COUNTRIES.map(c => ({ value: c, label: c }))} />
                          </CardField>
                          <CardField label="Country Living" field="countryLiving">
                            <FieldInput type="text" value="Saudi Arabia" readOnly />
                            <p className="text-[11px] text-[#64748b]/80 italic mt-1 font-medium">Only applicants living in Saudi Arabia may register.</p>
                          </CardField>
                          <CardField label="City" field="cityLiving">
                            <MobileSelectTrigger value={formData.cityLiving} placeholder="Select City"
                              onClick={() => openSheet('cityLiving', 'City', getCitiesForCountry(formData.countryLiving).map(c => ({ value: c, label: c })))}
                              hasError={invalidFields.includes('cityLiving')} />
                            <FieldSelect value={formData.cityLiving} onChange={(e) => updateFormData('cityLiving', e.target.value)}
                              hasError={invalidFields.includes('cityLiving')} placeholder="Select City"
                              options={getCitiesForCountry(formData.countryLiving).map(c => ({ value: c, label: c }))} />
                          </CardField>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Religion & Church" icon={<Church className="w-[18px] h-[18px]" />} iconColor="gold">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Denomination" field="denomination">
                              <MobileSelectTrigger value={formData.denomination} placeholder="Select Denomination"
                                onClick={() => openSheet('denomination', 'Denomination', POPULAR_DENOMINATIONS.map(d => ({ value: d, label: d })))}
                                hasError={invalidFields.includes('denomination')} />
                              <FieldSelect value={formData.denomination} onChange={(e) => updateFormData('denomination', e.target.value)}
                                hasError={invalidFields.includes('denomination')} placeholder="Select Denomination"
                                options={POPULAR_DENOMINATIONS.map(d => ({ value: d, label: d }))} />
                            </CardField>
                            <CardField label="Church Name" field="churchName">
                              <FieldInput type="text" value={formData.churchName} onChange={(e) => updateFormData('churchName', e.target.value)}
                                hasError={invalidFields.includes('churchName')} />
                            </CardField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Church City" field="churchCity">
                              <MobileSelectTrigger value={formData.churchCity} placeholder="Select City"
                                onClick={() => openSheet('churchCity', 'Church City', getCitiesForCountry(formData.countryLiving).map(c => ({ value: c, label: c })))}
                                hasError={invalidFields.includes('churchCity')} />
                              <FieldSelect value={formData.churchCity} onChange={(e) => updateFormData('churchCity', e.target.value)}
                                hasError={invalidFields.includes('churchCity')} placeholder="Select City"
                                options={getCitiesForCountry(formData.countryLiving).map(c => ({ value: c, label: c }))} />
                            </CardField>
                            <CardField label="Church in Area" field="churchArea">
                              <FieldInput type="text" value={formData.churchArea || ''} onChange={(e) => updateFormData('churchArea', e.target.value)}
                                placeholder="e.g. Downtown, Sector 4" hasError={invalidFields.includes('churchArea')} />
                            </CardField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Baptized" field="baptized">
                              <MobileSelectTrigger value={formData.baptized} placeholder="Select Option"
                                onClick={() => openSheet('baptized', 'Baptized', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }])}
                                hasError={invalidFields.includes('baptized')} />
                              <FieldSelect value={formData.baptized} onChange={(e) => updateFormData('baptized', e.target.value)}
                                hasError={invalidFields.includes('baptized')} placeholder="Select Option"
                                options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} />
                            </CardField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Pastor Name" field="pastorName">
                              <FieldInput type="text" value={formData.pastorName || ''} onChange={(e) => updateFormData('pastorName', e.target.value)}
                                hasError={invalidFields.includes('pastorName')} />
                            </CardField>
                            <CardField label="Pastor Number" field="pastorNumber">
                              <FieldInput type="tel" value={formData.pastorNumber || ''} onChange={(e) => updateFormData('pastorNumber', e.target.value)}
                                placeholder="10-digit number" hasError={invalidFields.includes('pastorNumber')} />
                            </CardField>
                          </div>
                          <div className="p-3.5 bg-[rgba(201,168,76,0.06)] rounded-[14px] border border-[rgba(201,168,76,0.15)] flex items-start gap-2.5">
                            <Lock className="w-4 h-4 text-[#b8860b] shrink-0 mt-0.5" />
                            <p className="text-[12px] text-[#dc2626] font-bold leading-relaxed">
                              Your Email, Mobile number, Pastor Name &amp; Number will not be visible to other users
                            </p>
                          </div>
                        </div>
                      </CollapsibleCard>
                    </>
                  )}

                  {/* ══════ STEP 2: PERSONAL, CAREER & LIFESTYLE ══════ */}
                  {currentStep === 2 && (
                    <>
                      <CollapsibleCard title="Physical Details" icon={<Scale className="w-[18px] h-[18px]" />} iconColor="gold">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Marital Status" field="maritalStatus">
                              <MobileSelectTrigger value={formData.maritalStatus} placeholder="Select Status"
                                onClick={() => openSheet('maritalStatus', 'Marital Status', ['Never Married', 'Annulled', 'Divorced', 'Widowed'].map(s => ({ value: s, label: s })))}
                                hasError={invalidFields.includes('maritalStatus')} />
                              <FieldSelect value={formData.maritalStatus} onChange={(e) => updateFormData('maritalStatus', e.target.value)}
                                hasError={invalidFields.includes('maritalStatus')} placeholder="Select Status"
                                options={['Never Married', 'Annulled', 'Divorced', 'Widowed'].map(s => ({ value: s, label: s }))} />
                            </CardField>
                            <CardField label="Height (ft)" field="height">
                              <MobileSelectTrigger value={formData.height} placeholder="Select Height"
                                onClick={() => openSheet('height', 'Height', HEIGHT_FT.map(h => ({ value: h, label: `${h} ft` })))}
                                hasError={invalidFields.includes('height')} />
                              <FieldSelect value={formData.height} onChange={(e) => updateFormData('height', e.target.value)}
                                hasError={invalidFields.includes('height')} placeholder="Select Height"
                                options={HEIGHT_FT.map(h => ({ value: h, label: `${h} ft` }))} />
                            </CardField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <CardField label="Weight (kg)" field="weight">
                              <FieldInput type="number" value={formData.weight} onChange={(e) => updateFormData('weight', e.target.value)}
                                placeholder="E.g. 70" hasError={invalidFields.includes('weight')} />
                            </CardField>
                            <CardField label="Body Type" field="bodyType">
                              <MobileSelectTrigger value={formData.bodyType} placeholder="Select Body Type"
                                onClick={() => openSheet('bodyType', 'Body Type', ['Slim', 'Average', 'Athletic', 'Heavy'].map(s => ({ value: s, label: s })))}
                                hasError={invalidFields.includes('bodyType')} />
                              <FieldSelect value={formData.bodyType} onChange={(e) => updateFormData('bodyType', e.target.value)}
                                hasError={invalidFields.includes('bodyType')} placeholder="Select Body Type"
                                options={['Slim', 'Average', 'Athletic', 'Heavy'].map(s => ({ value: s, label: s }))} />
                            </CardField>
                            <CardField label="Complexion" field="complexion">
                              <MobileSelectTrigger value={formData.complexion} placeholder="Select Complexion"
                                onClick={() => openSheet('complexion', 'Complexion', ['Fair', 'Light', 'Medium', 'Olive', 'Dark'].map(s => ({ value: s, label: s })))}
                                hasError={invalidFields.includes('complexion')} />
                              <FieldSelect value={formData.complexion} onChange={(e) => updateFormData('complexion', e.target.value)}
                                hasError={invalidFields.includes('complexion')} placeholder="Select Complexion"
                                options={['Fair', 'Light', 'Medium', 'Olive', 'Dark'].map(s => ({ value: s, label: s }))} />
                            </CardField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Physical Status" field="physicalStatus">
                              <MobileSelectTrigger value={formData.physicalStatus} placeholder="Select Physical Status"
                                onClick={() => openSheet('physicalStatus', 'Physical Status', ['Normal', 'Physically Challenged'].map(s => ({ value: s, label: s })))}
                                hasError={invalidFields.includes('physicalStatus')} />
                              <FieldSelect value={formData.physicalStatus} onChange={(e) => updateFormData('physicalStatus', e.target.value)}
                                hasError={invalidFields.includes('physicalStatus')} placeholder="Select Physical Status"
                                options={['Normal', 'Physically Challenged'].map(s => ({ value: s, label: s }))} />
                            </CardField>
                            <CardField label="Mother Tongue" field="motherTongue">
                              <MobileSelectTrigger value={formData.motherTongue} placeholder="Select Mother Tongue"
                                onClick={() => openSheet('motherTongue', 'Mother Tongue', ['English', ...INDIAN_LANGUAGES].map(l => ({ value: l, label: l })))}
                                hasError={invalidFields.includes('motherTongue')} />
                              <FieldSelect value={formData.motherTongue} onChange={(e) => updateFormData('motherTongue', e.target.value)}
                                hasError={invalidFields.includes('motherTongue')} placeholder="Select Mother Tongue"
                                options={['English', ...INDIAN_LANGUAGES].map(l => ({ value: l, label: l }))} />
                            </CardField>
                          </div>
                          <CardField label="Languages I Know" field="languagesKnown" isOptional>
                            <div className="flex flex-wrap gap-2">
                              {['English', ...INDIAN_LANGUAGES].map(lang => (
                                <button key={lang} type="button" onClick={() => {
                                  const next = formData.languagesKnown.includes(lang)
                                    ? formData.languagesKnown.filter(l => l !== lang)
                                    : [...formData.languagesKnown, lang];
                                  updateFormData('languagesKnown', next);
                                }} className={cn(
                                  "px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all",
                                  formData.languagesKnown.includes(lang)
                                    ? "bg-[#C9A84C] text-white border-[#C9A84C]"
                                    : "bg-white border-[#f0ead9] text-[#4a3521] hover:border-[#C9A84C]"
                                )}>{lang}</button>
                              ))}
                            </div>
                          </CardField>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Career Path" icon={<GraduationCap className="w-[18px] h-[18px]" />} iconColor="apricot">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Education" field="education">
                              <MobileSelectTrigger value={formData.education} placeholder="Select Education"
                                onClick={() => openSheet('education', 'Education', ['High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Professional'].map(s => ({ value: s, label: s })))}
                                hasError={invalidFields.includes('education')} />
                              <FieldSelect value={formData.education} onChange={(e) => updateFormData('education', e.target.value)}
                                hasError={invalidFields.includes('education')} placeholder="Select Education"
                                options={['High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Professional'].map(s => ({ value: s, label: s }))} />
                            </CardField>
                            <CardField label="Profession" field="profession">
                              <FieldInput type="text" value={formData.profession} onChange={(e) => updateFormData('profession', e.target.value)}
                                placeholder="E.g. Software Engineer" hasError={invalidFields.includes('profession')} />
                            </CardField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Field of Study" field="fieldOfStudy" isOptional>
                              <FieldInput type="text" value={formData.fieldOfStudy} onChange={(e) => updateFormData('fieldOfStudy', e.target.value)}
                                placeholder="E.g. Computer Science" />
                            </CardField>
                            <CardField label="Annual Income" field="annualIncome" isOptional>
                              <FieldInput type="text" value={formData.annualIncome} onChange={(e) => updateFormData('annualIncome', e.target.value)}
                                placeholder="E.g. 500k+" />
                            </CardField>
                          </div>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Lifestyle" icon={<Briefcase className="w-[18px] h-[18px]" />} iconColor="green">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <CardField label="Diet" field="dietaryHabits">
                              <MobileSelectTrigger value={formData.dietaryHabits} placeholder="Select Diet"
                                onClick={() => openSheet('dietaryHabits', 'Diet', ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'].map(s => ({ value: s, label: s })))}
                                hasError={invalidFields.includes('dietaryHabits')} />
                              <FieldSelect value={formData.dietaryHabits} onChange={(e) => updateFormData('dietaryHabits', e.target.value)}
                                hasError={invalidFields.includes('dietaryHabits')} placeholder="Select Diet"
                                options={['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'].map(s => ({ value: s, label: s }))} />
                            </CardField>
                            <CardField label="Drinking" field="drinkingHabits">
                              <MobileSelectTrigger value={formData.drinkingHabits} placeholder="Select Habit"
                                onClick={() => openSheet('drinkingHabits', 'Drinking', ['Never', 'Socially', 'Regularly'].map(s => ({ value: s, label: s })))}
                                hasError={invalidFields.includes('drinkingHabits')} />
                              <FieldSelect value={formData.drinkingHabits} onChange={(e) => updateFormData('drinkingHabits', e.target.value)}
                                hasError={invalidFields.includes('drinkingHabits')} placeholder="Select Drinking Habit"
                                options={['Never', 'Socially', 'Regularly'].map(s => ({ value: s, label: s }))} />
                            </CardField>
                            <CardField label="Smoking" field="smokingHabits">
                              <MobileSelectTrigger value={formData.smokingHabits} placeholder="Select Habit"
                                onClick={() => openSheet('smokingHabits', 'Smoking', ['Never', 'Occasionally', 'Regularly'].map(s => ({ value: s, label: s })))}
                                hasError={invalidFields.includes('smokingHabits')} />
                              <FieldSelect value={formData.smokingHabits} onChange={(e) => updateFormData('smokingHabits', e.target.value)}
                                hasError={invalidFields.includes('smokingHabits')} placeholder="Select Smoking Habit"
                                options={['Never', 'Occasionally', 'Regularly'].map(s => ({ value: s, label: s }))} />
                            </CardField>
                          </div>
                          <CardField label="Hobbies" field="hobbies" isOptional>
                            <FieldInput type="text" value={formData.hobbies.join(', ')}
                              onChange={(e) => updateFormData('hobbies', e.target.value.split(',').map(s => s.trim()))}
                              placeholder="E.g. Reading, Traveling" />
                          </CardField>
                          <CardField label="About Me" field="aboutMe">
                            <FieldTextarea value={formData.aboutMe} onChange={(e) => updateFormData('aboutMe', e.target.value)}
                              placeholder="Describe yourself, your family, and what you are looking for..." rows={4}
                              hasError={invalidFields.includes('aboutMe')} />
                          </CardField>
                        </div>
                      </CollapsibleCard>
                    </>
                  )}

                  {/* ══════ STEP 3: FAMILY BACKGROUND ══════ */}
                  {currentStep === 3 && (
                    <>
                      <CollapsibleCard title="Parents" icon={<Users className="w-[18px] h-[18px]" />} iconColor="gold">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Father's Name" field="fathersName">
                              <FieldInput type="text" value={formData.fathersName} onChange={(e) => updateFormData('fathersName', e.target.value)}
                                hasError={invalidFields.includes('fathersName')} />
                            </CardField>
                            <CardField label="Father's Occupation" field="fathersOccupation">
                              <FieldInput type="text" value={formData.fathersOccupation} onChange={(e) => updateFormData('fathersOccupation', e.target.value)}
                                hasError={invalidFields.includes('fathersOccupation')} />
                            </CardField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Mother's Name" field="mothersName">
                              <FieldInput type="text" value={formData.mothersName} onChange={(e) => updateFormData('mothersName', e.target.value)}
                                hasError={invalidFields.includes('mothersName')} />
                            </CardField>
                            <CardField label="Mother's Occupation" field="mothersOccupation">
                              <FieldInput type="text" value={formData.mothersOccupation} onChange={(e) => updateFormData('mothersOccupation', e.target.value)}
                                hasError={invalidFields.includes('mothersOccupation')} />
                            </CardField>
                          </div>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Siblings" icon={<UserPlus className="w-[18px] h-[18px]" />} iconColor="apricot">
                        <CardField label="Number of Siblings" field="numberOfSiblings">
                          <MobileSelectTrigger value={formData.numberOfSiblings} placeholder="Select Option"
                            onClick={() => openSheet('numberOfSiblings', 'Number of Siblings', ['None', '1', '2', '3', '4', '5+'].map(s => ({ value: s, label: s })))}
                            hasError={invalidFields.includes('numberOfSiblings')} />
                          <FieldSelect value={formData.numberOfSiblings} onChange={(e) => updateFormData('numberOfSiblings', e.target.value)}
                            hasError={invalidFields.includes('numberOfSiblings')} placeholder="Select Option"
                            options={['None', '1', '2', '3', '4', '5+'].map(s => ({ value: s, label: s }))} />
                        </CardField>
                      </CollapsibleCard>
                    </>
                  )}

                  {/* ══════ STEP 4: PARTNER PREFERENCES ══════ */}
                  {currentStep === 4 && (
                    <>
                      <CollapsibleCard title="Age & Height Preferences" icon={<Ruler className="w-[18px] h-[18px]" />} iconColor="gold">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Min Age" field="ageMin">
                              <MobileSelectTrigger value={formData.partnerPreferences.ageMin} placeholder="Select Min Age"
                                onClick={() => openSheet('partnerPreferences.ageMin', 'Min Age', AGE_OPTIONS.map(a => ({ value: a, label: a })))}
                                hasError={invalidFields.includes('ageMin')} />
                              <FieldSelect value={formData.partnerPreferences.ageMin}
                                onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, ageMin: e.target.value })}
                                hasError={invalidFields.includes('ageMin')} placeholder="Select Min Age"
                                options={AGE_OPTIONS.map(a => ({ value: a, label: a }))} />
                            </CardField>
                            <CardField label="Max Age" field="ageMax">
                              <MobileSelectTrigger value={formData.partnerPreferences.ageMax} placeholder="Select Max Age"
                                onClick={() => openSheet('partnerPreferences.ageMax', 'Max Age', AGE_OPTIONS.map(a => ({ value: a, label: a })))}
                                hasError={invalidFields.includes('ageMax')} />
                              <FieldSelect value={formData.partnerPreferences.ageMax}
                                onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, ageMax: e.target.value })}
                                hasError={invalidFields.includes('ageMax')} placeholder="Select Max Age"
                                options={AGE_OPTIONS.map(a => ({ value: a, label: a }))} />
                            </CardField>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Min Height (ft)" field="heightMin">
                              <MobileSelectTrigger value={formData.partnerPreferences.heightMin} placeholder="Select Min Height"
                                onClick={() => openSheet('partnerPreferences.heightMin', 'Min Height', HEIGHT_FT.map(h => ({ value: h, label: `${h} ft` })))}
                                hasError={invalidFields.includes('heightMin')} />
                              <FieldSelect value={formData.partnerPreferences.heightMin}
                                onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, heightMin: e.target.value })}
                                hasError={invalidFields.includes('heightMin')} placeholder="Select Min Height"
                                options={HEIGHT_FT.map(h => ({ value: h, label: `${h} ft` }))} />
                            </CardField>
                            <CardField label="Max Height (ft)" field="heightMax">
                              <MobileSelectTrigger value={formData.partnerPreferences.heightMax} placeholder="Select Max Height"
                                onClick={() => openSheet('partnerPreferences.heightMax', 'Max Height', HEIGHT_FT.map(h => ({ value: h, label: `${h} ft` })))}
                                hasError={invalidFields.includes('heightMax')} />
                              <FieldSelect value={formData.partnerPreferences.heightMax}
                                onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, heightMax: e.target.value })}
                                hasError={invalidFields.includes('heightMax')} placeholder="Select Max Height"
                                options={HEIGHT_FT.map(h => ({ value: h, label: `${h} ft` }))} />
                            </CardField>
                          </div>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Background Preferences" icon={<Globe className="w-[18px] h-[18px]" />} iconColor="ink">
                        <div className="space-y-4">
                          <CardField label="Denomination Preference" field="pref-denominations">
                            <div className="flex flex-wrap gap-2">
                              {['Any', ...POPULAR_DENOMINATIONS].map(denom => (
                                <button key={denom} type="button" onClick={() => {
                                  const current = formData.partnerPreferences.denominations;
                                  const next = denom === 'Any'
                                    ? (current.includes('Any') ? [] : ['Any'])
                                    : current.includes(denom)
                                      ? current.filter(d => d !== denom)
                                      : [...current.filter(d => d !== 'Any'), denom];
                                  updateFormData('partnerPreferences', { ...formData.partnerPreferences, denominations: next });
                                }} className={cn(
                                  "px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all",
                                  formData.partnerPreferences.denominations.includes(denom)
                                    ? "bg-[#C9A84C] text-white border-[#C9A84C]"
                                    : "bg-white border-[#f0ead9] text-[#4a3521] hover:border-[#C9A84C]"
                                )}>{denom}</button>
                              ))}
                            </div>
                          </CardField>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Education Level" field="educationLevel">
                              <MobileSelectTrigger value={formData.partnerPreferences.educationLevel} placeholder="Select Education Level"
                                onClick={() => openSheet('partnerPreferences.educationLevel', 'Education Level', ['Any', 'High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Professional'].map(s => ({ value: s, label: s })))}
                                hasError={invalidFields.includes('educationLevel')} />
                              <FieldSelect value={formData.partnerPreferences.educationLevel}
                                onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, educationLevel: e.target.value })}
                                hasError={invalidFields.includes('educationLevel')} placeholder="Select Education Level"
                                options={['Any', 'High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Professional'].map(s => ({ value: s, label: s }))} />
                            </CardField>
                            <CardField label="Mother Tongue Preference" field="pref-motherTongue" isOptional>
                              <div className="flex flex-wrap gap-2">
                                {['Any', 'English', ...INDIAN_LANGUAGES].map(lang => (
                                  <button key={lang} type="button" onClick={() => {
                                    const current = formData.partnerPreferences.motherTongue;
                                    const next = lang === 'Any'
                                      ? (current.includes('Any') ? [] : ['Any'])
                                      : current.includes(lang)
                                        ? current.filter(l => l !== lang)
                                        : [...current.filter(l => l !== 'Any'), lang];
                                    updateFormData('partnerPreferences', { ...formData.partnerPreferences, motherTongue: next });
                                  }} className={cn(
                                    "px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all",
                                    formData.partnerPreferences.motherTongue.includes(lang)
                                      ? "bg-[#C9A84C] text-white border-[#C9A84C]"
                                      : "bg-white border-[#f0ead9] text-[#4a3521] hover:border-[#C9A84C]"
                                  )}>{lang}</button>
                                ))}
                              </div>
                            </CardField>
                          </div>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Lifestyle Preferences" icon={<Heart className="w-[18px] h-[18px]" />} iconColor="green">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <CardField label="Dietary Habits" field="partnerPreferences.dietaryHabits" isOptional>
                            <MobileSelectTrigger value={formData.partnerPreferences.dietaryHabits} placeholder="Select"
                              onClick={() => openSheet('partnerPreferences.dietaryHabits', 'Dietary Habits', ['No Preference', 'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'].map(s => ({ value: s, label: s })))} />
                            <FieldSelect value={formData.partnerPreferences.dietaryHabits}
                              onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, dietaryHabits: e.target.value })}
                              placeholder="Select" options={['No Preference', 'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'].map(s => ({ value: s, label: s }))} />
                          </CardField>
                          <CardField label="Drinking Habits" field="partnerPreferences.drinkingHabits" isOptional>
                            <MobileSelectTrigger value={formData.partnerPreferences.drinkingHabits} placeholder="Select"
                              onClick={() => openSheet('partnerPreferences.drinkingHabits', 'Drinking Habits', ['No Preference', 'Never', 'Socially', 'Regularly'].map(s => ({ value: s, label: s })))} />
                            <FieldSelect value={formData.partnerPreferences.drinkingHabits}
                              onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, drinkingHabits: e.target.value })}
                              placeholder="Select" options={['No Preference', 'Never', 'Socially', 'Regularly'].map(s => ({ value: s, label: s }))} />
                          </CardField>
                          <CardField label="Smoking Habits" field="partnerPreferences.smokingHabits" isOptional>
                            <MobileSelectTrigger value={formData.partnerPreferences.smokingHabits} placeholder="Select"
                              onClick={() => openSheet('partnerPreferences.smokingHabits', 'Smoking Habits', ['No Preference', 'Never', 'Occasionally', 'Regularly'].map(s => ({ value: s, label: s })))} />
                            <FieldSelect value={formData.partnerPreferences.smokingHabits}
                              onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, smokingHabits: e.target.value })}
                              placeholder="Select" options={['No Preference', 'Never', 'Occasionally', 'Regularly'].map(s => ({ value: s, label: s }))} />
                          </CardField>
                        </div>
                      </CollapsibleCard>

                      <CollapsibleCard title="Location & Marital" icon={<MapPin className="w-[18px] h-[18px]" />} iconColor="apricot">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CardField label="Country Preference" field="country">
                              <FieldInput type="text" value="Saudi Arabia" readOnly />
                            </CardField>
                            <CardField label="City Preference" field="city">
                              <MobileSelectTrigger value={formData.partnerPreferences.city} placeholder="Select City"
                                onClick={() => openSheet('partnerPreferences.city', 'City Preference', [{ value: 'Any', label: 'Any' }, ...getCitiesForCountry(formData.partnerPreferences.country).map(c => ({ value: c, label: c }))])}
                                hasError={invalidFields.includes('city')} />
                              <FieldSelect value={formData.partnerPreferences.city}
                                onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, city: e.target.value })}
                                hasError={invalidFields.includes('city')} placeholder="Select City"
                                options={[{ value: 'Any', label: 'Any' }, ...getCitiesForCountry(formData.partnerPreferences.country).map(c => ({ value: c, label: c }))]} />
                            </CardField>
                          </div>
                          <CardField label="Marital Status Preference" field="pref-maritalStatus">
                            <div className="flex flex-wrap gap-2">
                              {['Never Married', 'Annulled', 'Divorced', 'Widowed'].map(status => (
                                <button key={status} type="button" onClick={() => {
                                  const current = formData.partnerPreferences.maritalStatus;
                                  const next = current.includes(status) ? current.filter(s => s !== status) : [...current, status];
                                  updateFormData('partnerPreferences', { ...formData.partnerPreferences, maritalStatus: next });
                                }} className={cn(
                                  "px-4 py-2 rounded-full border text-[13px] font-medium transition-all",
                                  formData.partnerPreferences.maritalStatus.includes(status)
                                    ? "bg-[#C9A84C] text-white border-[#C9A84C]"
                                    : "bg-white border-[#f0ead9] text-[#4a3521] hover:border-[#C9A84C]"
                                )}>{status}</button>
                              ))}
                            </div>
                          </CardField>
                          <CardField label="My Desired Partner" field="pref-otherPreferences" isOptional>
                            <FieldTextarea value={formData.partnerPreferences.otherPreferences || ''}
                              onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, otherPreferences: e.target.value })}
                              placeholder="Describe any additional qualities, background, or criteria you are looking for in a partner..." rows={4} />
                          </CardField>
                        </div>
                      </CollapsibleCard>
                    </>
                  )}

                  {/* ══════ STEP 5: PHOTOS ══════ */}
                  {currentStep === 5 && (
                    <>
                      <PhotoPicker
                        pendingPhotoUrl={formData.pendingPhotoUrl}
                        photoStatus={formData.photoStatus}
                        uploading={uploading}
                        onMainPhotoChange={handleMainPhotoChange}
                        gallery={formData.gallery}
                        galleryFiles={galleryPhotoFiles}
                        onGalleryAdd={handleGalleryAdd}
                        onRemoveGallery={removeGalleryPhoto}
                        photoPrivacy={formData.photoPrivacy}
                        onPrivacyChange={(p) => updateFormData('photoPrivacy', p)}
                        hasError={invalidFields.includes('pendingPhotoUrl')}
                      />

                      <div className="mt-6 flex gap-3 items-start p-4 rounded-xl border border-[#e2ddd2]/80 bg-[#fffdf8]/60">
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox" checked={agreedTerms}
                            onChange={(e) => setAgreedTerms(e.target.checked)}
                            className="sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                              agreedTerms
                                ? 'bg-[#C9A84C] border-[#C9A84C] shadow-[0_1px_4px_rgba(201,168,76,0.3)]'
                                : 'bg-white border-[#d8d1c0] hover:border-[#C9A84C]/60'
                            }`}
                          >
                            <svg
                              viewBox="0 0 16 16" fill="none"
                              className={`w-3 h-3 text-white transition-all duration-300 ${agreedTerms ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                            >
                              <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </label>
                        <p className="text-[11.5px] text-[#8a7a65] leading-relaxed">
                          I agree to the <Link to="/terms" className="font-bold text-[#b8860b] hover:underline">Terms</Link> & <Link to="/terms" className="font-bold text-[#b8860b] hover:underline">Privacy Policy</Link>, and affirm the information I provide is truthful.
                        </p>
                      </div>
                    </>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* Turnstile CAPTCHA */}
              <TurnstileWidget
                onVerify={(token) => setTurnstileTokens(prev => ({ ...prev, [currentStep]: token }))}
              />
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-6 lg:px-10 lg:py-7 border-t border-[#f0ead9]/60 bg-gradient-to-t from-[#faf7f0] to-white flex justify-between items-center mt-auto">
              <button onClick={handleBack} disabled={currentStep === 1}
                className="group flex items-center gap-2.5 px-7 py-3 bg-white text-[#4a3521] rounded-full border border-[#e2ddd2] font-semibold text-[13px] shadow-[0_1px_3px_rgba(74,53,33,0.06)] hover:border-[#C9A84C]/50 hover:shadow-[0_2px_8px_rgba(201,168,76,0.12)] transition-all duration-300 active:scale-[0.97] disabled:opacity-0 disabled:pointer-events-none">
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Back
              </button>
              <button onClick={handleNext} disabled={loading}
                className="group relative flex items-center gap-2.5 px-10 py-3 bg-[#4a3521] text-white rounded-full font-semibold text-[13px] shadow-[0_2px_12px_rgba(74,53,33,0.25)] hover:bg-[#3a2a1a] hover:shadow-[0_4px_20px_rgba(74,53,33,0.35)] transition-all duration-300 active:scale-[0.97] disabled:opacity-60">
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : currentStep === STEPS.length ? "Submit Profile" : "Continue"}
                {!loading && currentStep !== STEPS.length && (
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/15 transition-all duration-300 group-hover:bg-white/25 group-hover:translate-x-0.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={handleSheetClose}
        title={sheetConfig.title}
        options={sheetConfig.options}
        selectedValue={sheetConfig.multiple ? undefined : (() => {
          const field = sheetConfig.field;
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            const parentObj = formData[parent as keyof UserOnboardingData];
            if (typeof parentObj === 'object' && parentObj !== null) {
              return (parentObj as Record<string, unknown>)[child] as string;
            }
          }
          return formData[field as keyof UserOnboardingData] as string;
        })()}
        onSelect={handleSheetSelect}
        multiple={sheetConfig.multiple}
        selectedValues={sheetConfig.multiple ? sheetSelectedValues : []}
        onToggleMultiple={sheetConfig.multiple ? handleSheetToggleMultiple : undefined}
      />

      <ConfirmationModal
        isOpen={showLimitAlert}
        onClose={() => setShowLimitAlert(false)}
        onConfirm={() => setShowLimitAlert(false)}
        title="Upload Limit Reached"
        message="You have reached the maximum limit of photos you can upload"
        confirmText="OK"
        isDestructive={false}
        singleButton={true}
      />
    </div>
  );
}
