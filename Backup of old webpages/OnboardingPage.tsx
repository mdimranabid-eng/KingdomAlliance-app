import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { sendEmailVerification, reload, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, CheckCircle2, Upload, Camera, Scale, MapPin, Church, GraduationCap, Briefcase, Ruler, ShieldCheck, X, Plus, Mail, Phone, Loader2, Lock, Eye, EyeOff, Globe, MapPinHouse, Hourglass } from 'lucide-react';
import { cn, formatAuthError, generateUniqueProfileId, calculateAge } from '../lib/utils';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import { uploadUserPhotos } from '../lib/storage';
import { HEIGHT_FT, WORLD_COUNTRIES, getCitiesForCountry, AGE_OPTIONS } from '../lib/locationData';
import { sendEmail } from '../lib/email';
import ConfirmationModal from '../components/ConfirmationModal';

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Who are you?' },
  { id: 2, title: 'Personal, Career & Lifestyle', description: 'All about you' },
  { id: 3, title: 'Family Background', description: 'Your roots & religion' },
  { id: 4, title: 'Partner Preferences', description: 'Who you seek' },
  { id: 5, title: 'Photos', description: 'Show your best self' }
];

const POPULAR_DENOMINATIONS = [
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
  { code: '+420', name: 'CZ' }, { code: '+36', name: 'HU' }, { code: '+4罗马尼亚', name: 'RO' },
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
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [galleryPhotoFiles, setGalleryPhotoFiles] = useState<{ id: string; file: File }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [showLanguagesDropdown, setShowLanguagesDropdown] = useState(false);
  const languagesDropdownRef = useRef<HTMLDivElement>(null);

  const [showPrefMotherTongueDropdown, setShowPrefMotherTongueDropdown] = useState(false);
  const prefMotherTongueDropdownRef = useRef<HTMLDivElement>(null);

  const [showPrefDenominationDropdown, setShowPrefDenominationDropdown] = useState(false);
  const prefDenominationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languagesDropdownRef.current && !languagesDropdownRef.current.contains(event.target as Node)) {
        setShowLanguagesDropdown(false);
      }
      if (prefMotherTongueDropdownRef.current && !prefMotherTongueDropdownRef.current.contains(event.target as Node)) {
        setShowPrefMotherTongueDropdown(false);
      }
      if (prefDenominationDropdownRef.current && !prefDenominationDropdownRef.current.contains(event.target as Node)) {
        setShowPrefDenominationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [formData, setFormData] = useState<UserOnboardingData>({
    name: '',
    middleName: '',
    lastName: '',
    email: '',
    countryCode: '+966',
    mobileNumber: '',
    password: '',
    profileFor: '',
    profileType: '',
    gender: '',
    dob: '',
    age: '',
    citizenship: '',
    countryLiving: 'Saudi Arabia',
    cityLiving: '',
    maritalStatus: '',
    height: '',
    weight: '',
    bodyType: '',
    complexion: '',
    physicalStatus: '',
    physicalStatusDesc: '',
    denomination: '',
    churchName: '',
    diocese: '',
    baptized: '',
    pastorName: '',
    pastorNumber: '',
    churchArea: '',
    spiritualInvolvement: [] as string[],
    motherTongue: '',
    languagesKnown: [] as string[],
    education: '',
    fieldOfStudy: '',
    college: '',
    profession: '',
    employmentType: '',
    annualIncome: '',
    dietaryHabits: '',
    drinkingHabits: '',
    smokingHabits: '',
    hobbies: [] as string[],
    country: '',
    state: '',
    city: '',
    address: '',
    aboutMe: '',
    fathersName: '',
    fathersOccupation: '',
    mothersName: '',
    mothersOccupation: '',
    numberOfSiblings: '',
    churchCity: '',
    // ... photos
    photoUrl: '',
    photoPrivacy: 'public',
    pendingPhotoUrl: '',
    pendingPhotoThumbUrl: '',
    photoStatus: 'idle',
    gallery: [] as { id: string, url: string, status: 'pending' | 'approved' | 'rejected' }[],
    partnerPreferences: {
      ageMin: '',
      ageMax: '',
      heightMin: '',
      heightMax: '',
      maritalStatus: [] as string[],
      denominations: [] as string[],
      motherTongue: [] as string[],
      educationLevel: '',
      employmentStatus: '',
      dietaryHabits: '',
      drinkingHabits: '',
      smokingHabits: '',
      country: 'Saudi Arabia',
      city: '',
      relocationPreference: '',
      otherPreferences: ''
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

    if (profile && profile.onboardingComplete && 
      profile.approvalStatus === 'approved') {
      navigate('/dashboard');
    }
  }, [user, profile, navigate, formData.email, isGoogleUser]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (invalidFields.includes(field)) {
      setInvalidFields(prev => prev.filter(f => f !== field));
    }
  };

  const FieldLabel = ({ label, field, isOptional = false }: { label: string, field: string, isOptional?: boolean }) => (
    <label className="block font-label-sm text-on-surface uppercase tracking-wider sm:whitespace-nowrap sm:overflow-hidden sm:text-ellipsis">
      {label}
      {!isOptional ? (
        <span className="text-[#dc2626] font-bold text-[14px] ml-[3px]">*</span>
      ) : (
        <span className="text-[#9ca3af] italic text-[12px] ml-[4px]">(Optional)</span>
      )}
    </label>
  );

  const ErrorMessage = ({ field, message }: { field: string, message: string }) => {
    if (!invalidFields.includes(field)) return null;
    return (
      <p className="text-[#dc2626] text-[12px] font-inter mt-1">
        {message}
      </p>
    );
  };

  // Uploads are deferred to final submission — photos are processed by
  // uploadUserPhotos() (full + thumb variants into Firebase Storage).


  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert("Invalid file format. Please upload JPEG, PNG, or WEBP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size >= 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Defer the upload: store file and local object URL
    setProfilePhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    updateFormData('pendingPhotoUrl', localUrl);
    updateFormData('photoStatus', 'pending');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = formData.gallery.length;
    const remainingSlots = 3 - currentCount;

    if (remainingSlots <= 0) {
      setShowLimitAlert(true);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      return;
    }

    if (files.length > remainingSlots) {
      setShowLimitAlert(true);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
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
      newPhotos.push({
        id: photoId,
        url: localUrl,
        status: 'pending' as const
      });
    }

    setGalleryPhotoFiles(prev => [...prev, ...newFiles]);
    updateFormData('gallery', [...formData.gallery, ...newPhotos]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryPhoto = async (id: string) => {
    updateFormData('gallery', formData.gallery.filter(p => p.id !== id));
    setGalleryPhotoFiles(prev => prev.filter(f => f.id !== id));
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

      // Update form state with trimmed values
      setFormData(prev => ({
        ...prev,
        name: trimmedName,
        lastName: trimmedLastName,
        churchName: trimmedChurchName,
        churchCity: trimmedChurchCity,
        churchArea: trimmedChurchArea,
        pastorName: trimmedPastorName,
        pastorNumber: trimmedPastorNumber
      }));

      const required = [
        'profileFor', 'profileType', 'name', 'lastName', 'email', 'mobileNumber', 
        'dob', 'citizenship', 'countryLiving', 'cityLiving', 'denomination', 
        'churchName', 'churchCity', 'baptized', 'churchArea', 'pastorName', 'pastorNumber'
      ];

      const valMap: Record<string, string> = {
        profileFor: formData.profileFor,
        profileType: formData.profileType,
        name: trimmedName,
        lastName: trimmedLastName,
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        dob: formData.dob,
        citizenship: formData.citizenship,
        countryLiving: formData.countryLiving,
        cityLiving: formData.cityLiving,
        denomination: formData.denomination,
        churchName: trimmedChurchName,
        churchCity: trimmedChurchCity,
        baptized: formData.baptized,
        churchArea: trimmedChurchArea,
        pastorName: trimmedPastorName,
        pastorNumber: trimmedPastorNumber
      };

      errors = required.filter(f => !valMap[f]);
      if (errors.length > 0) {
        setInvalidFields(errors);
        setErrorMsg("Please fill in all mandatory fields.");
        scrollToFirstError(errors);
        return;
      }

      // Pastor Number Format Validation (exactly 10 digits)
      if (!/^[0-9]{10}$/.test(trimmedPastorNumber)) {
        setErrorMsg("Pastor Number must be exactly 10 digits.");
        setInvalidFields(['pastorNumber']);
        scrollToFirstError(['pastorNumber']);
        return;
      }

      // 1. Email Format Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEmail = formData.email.trim();
      if (!emailRegex.test(cleanEmail)) {
        setErrorMsg("Please enter a valid email address.");
        setInvalidFields(['email']);
        scrollToFirstError(['email']);
        return;
      }

      // 2. Date of Birth Age Check (under 18 rejected)
      if (formData.dob) {
        const dobDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (age < 18) {
          setErrorMsg("You must be at least 18 years of age to register.");
          setInvalidFields(['dob']);
          scrollToFirstError(['dob']);
          return;
        }
      }

      // 3. Mobile Number Numeric Format and Length Check (ignoring spaces/hyphens)
      const cleanMobile = formData.mobileNumber.replace(/[\s-]/g, '');
      if (!/^\d+$/.test(cleanMobile) || cleanMobile.length < 7 || cleanMobile.length > 15) {
        setErrorMsg("Mobile number must be standard numeric format between 7 and 15 digits.");
        setInvalidFields(['mobileNumber']);
        scrollToFirstError(['mobileNumber']);
        return;
      }

      setLoading(true);
      try {
        // Live check against Firestore '/users' collection for duplicate email
        const emailQ = query(collection(db, "users"), where("email", "==", cleanEmail));
        const emailSnapshot = await getDocs(emailQ);
        const existingEmailDocs = emailSnapshot.docs.filter(doc => doc.id !== user?.uid);

        if (existingEmailDocs.length > 0) {
          setErrorMsg("Email already registered. Please log in or use another email.");
          setInvalidFields(['email']);
          scrollToFirstError(['email']);
          setLoading(false);
          return;
        }

        // Live check against Firestore for duplicate mobile number
        const fullMobile = `${formData.countryCode} ${cleanMobile}`;
        const mobileQ = query(collection(db, "users"), where("mobileNumber", "==", fullMobile));
        const mobileSnapshot = await getDocs(mobileQ);
        const existingMobileDocs = mobileSnapshot.docs.filter(doc => doc.id !== user?.uid);

        if (existingMobileDocs.length > 0) {
          setErrorMsg("The mobile number entered is already registered.");
          setInvalidFields(['mobileNumber']);
          scrollToFirstError(['mobileNumber']);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error verifying registration uniqueness:", err);
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
      const trimmedCollege = formData.college.trim();
      const trimmedFieldOfStudy = formData.fieldOfStudy.trim();

      setFormData(prev => ({
        ...prev,
        aboutMe: trimmedAboutMe,
        college: trimmedCollege,
        fieldOfStudy: trimmedFieldOfStudy
      }));

      const required = [
        'maritalStatus', 'height', 'weight', 'bodyType', 'complexion',
        'physicalStatus', 'motherTongue', 'education', 'profession',
        'dietaryHabits', 'drinkingHabits', 'smokingHabits', 'aboutMe'
      ];

      const valMap: Record<string, string> = {
        maritalStatus: formData.maritalStatus,
        height: formData.height,
        weight: formData.weight,
        bodyType: formData.bodyType,
        complexion: formData.complexion,
        physicalStatus: formData.physicalStatus,
        motherTongue: formData.motherTongue,
        education: formData.education,
        profession: formData.profession,
        dietaryHabits: formData.dietaryHabits,
        drinkingHabits: formData.drinkingHabits,
        smokingHabits: formData.smokingHabits,
        aboutMe: trimmedAboutMe
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
        ...prev,
        fathersName: trimmedFathersName,
        fathersOccupation: trimmedFathersOccupation,
        mothersName: trimmedMothersName,
        mothersOccupation: trimmedMothersOccupation
      }));

      const required = [
        'fathersName', 'fathersOccupation', 'mothersName', 'mothersOccupation',
        'numberOfSiblings'
      ];

      const valMap: Record<string, string> = {
        fathersName: trimmedFathersName,
        fathersOccupation: trimmedFathersOccupation,
        mothersName: trimmedMothersName,
        mothersOccupation: trimmedMothersOccupation,
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

    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      setInvalidFields([]);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Final check for Step 5 (Photo)
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

          if (creds.fullName) {
            await updateProfile(activeUser, { displayName: creds.fullName });
          }
        }
      }

      if (!activeUser) {
        throw new Error("No active user session or registration credentials found. Please sign up again.");
      }

      // Now we have the activeUser and his UID. Let's upload the deferred photos!
      let finalProfilePhotoUrl = formData.photoUrl || '';
      let finalPendingPhotoUrl = formData.pendingPhotoUrl;
      let finalPendingThumbUrl = formData.pendingPhotoThumbUrl || '';
      let finalPhotoStatus = formData.photoStatus;

      // Get user name for moderation
      const userName = formData.name ? `${formData.name} ${formData.lastName}` : (activeUser.displayName || 'User');

      // 1. Upload main profile photo if it was selected locally
      if (profilePhotoFile) {
        console.log("Uploading main profile photo...");
        const pair = await uploadUserPhotos(profilePhotoFile, activeUser.uid, 'profile');
        finalPendingPhotoUrl = pair.url;
        finalPendingThumbUrl = pair.thumbUrl;
        finalPhotoStatus = 'pending';

        // Create photoModeration document
        await addDoc(collection(db, 'photoModeration'), {
          uid: activeUser.uid,
          userId: activeUser.uid,
          userName: userName,
          photoURL: pair.url,
          thumbUrl: pair.thumbUrl,
          photoType: 'profilePhoto',
          galleryPosition: null,
          photoStatus: 'pending',
          uploadedAt: serverTimestamp(),
          reviewedAt: null,
          reviewedBy: null,
          rejectedReason: null
        });
      }

      // 2. Upload gallery photos if they were selected locally
      const finalGallery = [...formData.gallery];
      for (let i = 0; i < finalGallery.length; i++) {
        const galleryItem = finalGallery[i];
        const matchingLocalFile = galleryPhotoFiles.find(f => f.id === galleryItem.id);

        if (matchingLocalFile) {
          console.log(`Uploading gallery photo ${i + 1}...`);
          const pair = await uploadUserPhotos(matchingLocalFile.file, activeUser.uid, 'gallery');

          galleryItem.url = pair.url; // Update with the real URL
          galleryItem.thumbUrl = pair.thumbUrl;

          // Create photoModeration document for each gallery photo
          await addDoc(collection(db, 'photoModeration'), {
            uid: activeUser.uid,
            userId: activeUser.uid,
            userName: userName,
            photoURL: pair.url,
            thumbUrl: pair.thumbUrl,
            photoType: 'galleryPhoto',
            galleryPosition: i + 1,
            photoStatus: 'pending',
            uploadedAt: serverTimestamp(),
            reviewedAt: null,
            reviewedBy: null,
            rejectedReason: null
          });
        }
      }

      const authProvider = savedCredsStr ? JSON.parse(savedCredsStr).authProvider : (activeUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email');

      const profileData = {
        name: formData.name,
        middleName: formData.middleName,
        lastName: formData.lastName,
        mobileNumber: `${formData.countryCode} ${formData.mobileNumber}`,
        profileType: formData.profileType,
        profileFor: formData.profileFor,
        gender: formData.gender,
        dob: formData.dob,
        age: formData.dob
          ? calculateAge(formData.dob, 0)
          : Number(formData.age) || 0,
        citizenship: formData.citizenship,
        countryLiving: formData.countryLiving,
        cityLiving: formData.cityLiving,
        maritalStatus: formData.maritalStatus,
        height: formData.height,
        weight: formData.weight,
        bodyType: formData.bodyType,
        complexion: formData.complexion,
        physicalStatus: formData.physicalStatus,
        physicalStatusDesc: formData.physicalStatusDesc,
        denomination: formData.denomination,
        churchName: formData.churchName,
        churchCity: formData.churchCity,
        fathersName: formData.fathersName,
        fathersOccupation: formData.fathersOccupation,
        mothersName: formData.mothersName,
        mothersOccupation: formData.mothersOccupation,
        numberOfSiblings: formData.numberOfSiblings,
        diocese: formData.diocese,
        baptized: formData.baptized,
        pastorName: formData.pastorName || '',
        pastorNumber: formData.pastorNumber || '',
        churchArea: formData.churchArea || '',
        spiritualInvolvement: formData.spiritualInvolvement,
        motherTongue: formData.motherTongue,
        languagesKnown: formData.languagesKnown,
        education: formData.education,
        fieldOfStudy: formData.fieldOfStudy,
        college: formData.college,
        profession: formData.profession,
        employmentType: formData.employmentType,
        annualIncome: formData.annualIncome,
        dietaryHabits: formData.dietaryHabits,
        drinkingHabits: formData.drinkingHabits,
        smokingHabits: formData.smokingHabits,
        hobbies: formData.hobbies,
        aboutMe: formData.aboutMe,
        photoUrl: finalProfilePhotoUrl,
        photoPrivacy: formData.photoPrivacy,
        pendingPhotoUrl: finalPendingPhotoUrl,
        pendingPhotoThumbUrl: finalPendingThumbUrl,
        photoStatus: finalPhotoStatus,
        gallery: finalGallery,
        partnerPreferences: {
          ageMin: formData.partnerPreferences.ageMin,
          ageMax: formData.partnerPreferences.ageMax,
          heightMin: formData.partnerPreferences.heightMin,
          heightMax: formData.partnerPreferences.heightMax,
          maritalStatus: formData.partnerPreferences.maritalStatus,
          denominations: formData.partnerPreferences.denominations,
          motherTongue: formData.partnerPreferences.motherTongue,
          educationLevel: formData.partnerPreferences.educationLevel,
          employmentStatus: formData.partnerPreferences.employmentStatus,
          dietaryHabits: formData.partnerPreferences.dietaryHabits,
          drinkingHabits: formData.partnerPreferences.drinkingHabits,
          smokingHabits: formData.partnerPreferences.smokingHabits,
          country: formData.partnerPreferences.country,
          city: formData.partnerPreferences.city,
          relocationPreference: formData.partnerPreferences.relocationPreference,
          otherPreferences: formData.partnerPreferences.otherPreferences || ''
        },
        uid: activeUser.uid,
        email: formData.email || activeUser.email || '',
        emailVerified: emailVerifiedLocal,
        authProvider: authProvider,
        role: 'user',
        isBanned: false,
        isSuspended: false,
        onboardingComplete: true,
        approvalStatus: 'pending',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Ensure createdAt is always present (in case user registered via a flow that missed it)
        ...((profile && profile.createdAt) ? {} : { createdAt: serverTimestamp() }),
        lastActive: serverTimestamp(),
        profileId: await generateUniqueProfileId()
      };

      await setDoc(doc(db, 'users', activeUser.uid), {
        ...profileData,             // Preserves all collected matrimonial info
        onboardingComplete: true,   // 🔥 Set to true to confirm form completion
        approvalStatus: 'pending',   // 🔥 Advance status to alert the admin panel
        updatedAt: new Date()
      }, { merge: true });


      // Clean up temporary registration session details on success
      sessionStorage.removeItem('saved_credentials');

      // Send onboarding email with PDF attachment and BCC
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        await fetch(`${backendUrl}/api/send-onboarding-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      style={{
        background: 'linear-gradient(135deg, #fff0f3 0%, #ffe3e8 40%, #ffccd5 70%, #fff0f3 100%)'
      }}
    >
      <style>{`
        @keyframes mandatoryFlash {
          0%   { border-color: #dc2626; box-shadow: 0 0 0 0 rgba(220,38,38,0); }
          25%  { border-color: #dc2626; box-shadow: 0 0 0 6px rgba(220,38,38,0.4); }
          50%  { border-color: #dc2626; box-shadow: 0 0 0 0 rgba(220,38,38,0); }
          75%  { border-color: #dc2626; box-shadow: 0 0 0 6px rgba(220,38,38,0.3); }
          100% { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.2); }
        }
        .field-error-animation {
          animation: mandatoryFlash 0.8s ease-in-out forwards;
          border: 1.5px solid #dc2626 !important;
        }
        .field-error-persistent {
          border: 1.5px solid #dc2626 !important;
          box-shadow: 0 0 0 3px rgba(220,38,38,0.15) !important;
        }
      `}</style>

      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-45"
          style={{ background: 'radial-gradient(circle, #ffccd5 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, #d4af3725 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #ffe5ec 0%, transparent 70%)' }} />
      </div>

      {/* Decorative SVG Roses & Leaves - Top Left */}
      <svg className="absolute -top-10 -left-10 w-48 h-48 md:w-80 md:h-80 opacity-25 pointer-events-none select-none" viewBox="0 0 100 100" fill="none">
        <path d="M30 20C20 30 15 50 35 70C55 50 45 35 30 20Z" fill="url(#rose-pink)" opacity="0.8"/>
        <path d="M15 45C5 55 10 70 25 75C40 65 30 50 15 45Z" fill="url(#rose-red)" opacity="0.7"/>
        <path d="M50 15C60 25 55 40 40 45C35 30 40 20 50 15Z" fill="url(#leaf-green)" opacity="0.5"/>
        <path d="M25 60C35 75 55 70 65 85" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>

      {/* Decorative SVG Roses & Leaves - Bottom Right */}
      <svg className="absolute -bottom-10 -right-10 w-48 h-48 md:w-80 md:h-80 opacity-25 pointer-events-none select-none" viewBox="0 0 100 100" fill="none">
        <path d="M70 80C80 70 85 50 65 30C45 50 55 65 70 80Z" fill="url(#rose-pink)" opacity="0.8"/>
        <path d="M85 55C95 45 90 30 75 25C60 35 70 50 85 55Z" fill="url(#rose-red)" opacity="0.7"/>
        <path d="M50 85C40 75 45 60 60 55C65 70 60 80 50 85Z" fill="url(#leaf-green)" opacity="0.5"/>
        <path d="M75 40C65 25 45 30 35 15" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
          <radialGradient id="rose-pink" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff0f3" />
            <stop offset="50%" stopColor="#ffb3c1" />
            <stop offset="100%" stopColor="#ff4d6d" />
          </radialGradient>
          <radialGradient id="rose-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb3c1" />
            <stop offset="100%" stopColor="#c9184a" />
          </radialGradient>
          <linearGradient id="leaf-green" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a3b18a" />
            <stop offset="100%" stopColor="#588157" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header */}
      <header className="w-full h-16 bg-transparent border-b border-white/10 flex items-center justify-center relative z-10">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <KingdomCrossIcon size="md" />
          <span className="font-headline text-2xl text-on-surface font-bold tracking-tight">{settings.siteName}</span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-6xl px-4 py-8 lg:py-16 flex flex-col lg:flex-row gap-12 relative z-0">
        {/* Horizontal Mobile Stepper (Hidden on Desktop) */}
        <div className="lg:hidden w-full flex flex-col items-center gap-4 mb-4">
          <h2 className="font-headline text-2xl text-on-surface text-center">Registration</h2>
          <div className="flex items-center justify-between w-full max-w-xs relative px-4">
            {/* Background line connecting the steps */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-outline-variant -translate-y-1/2 z-0" />
            
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-inter text-xs font-semibold",
                    isActive ? "bg-primary border-primary text-on-primary shadow-lg shadow-primary/20" :
                      isCompleted ? "bg-secondary border-secondary text-on-secondary" :
                        "bg-surface border-outline-variant text-on-surface-variant"
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center px-4">
            <p className="font-bold text-primary text-sm">{STEPS[currentStep - 1].title}</p>
            <p className="text-xs text-on-surface-variant">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Stepper Nav (Hidden on Mobile, Visible on Desktop) */}
        <aside className="hidden lg:block lg:w-1/4">
          <div className="sticky top-8 space-y-8">
            <h2 className="font-headline text-3xl text-on-surface">Registration</h2>
            <div className="space-y-6">
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        isActive ? "bg-primary border-primary text-on-primary shadow-lg shadow-primary/20" :
                          isCompleted ? "bg-secondary border-secondary text-on-secondary" :
                            "bg-surface border-outline-variant text-on-surface-variant"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : step.id}
                      </div>
                      {step.id !== STEPS.length && (
                        <div className={cn(
                          "w-0.5 h-10 my-2 rounded-full",
                          isCompleted ? "bg-secondary" : "bg-outline-variant"
                        )} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={cn(
                        "font-label-lg transition-colors",
                        isActive ? "text-primary font-bold" : isCompleted ? "text-secondary" : "text-on-surface-variant"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-on-surface-variant">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Form Area */}
        <div 
          className="flex-1 rounded-[2.5rem] overflow-hidden flex flex-col"
          style={{
            background: 'rgba(255, 255, 255, 0.62)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 32px 64px -12px rgba(26,46,74,0.12), inset 0 1px 0 rgba(255,255,255,0.90), inset 0 -1px 0 rgba(0,0,0,0.04)'
          }}
        >
          <div className="p-8 lg:p-12 border-b border-white/20"
            style={{ background: 'rgba(255, 255, 255, 0.3)' }}
          >
            <h3 className="font-headline text-3xl text-on-surface mb-2">{STEPS[currentStep - 1].title}</h3>
            <p className="text-on-surface-variant">{STEPS[currentStep - 1].description}</p>
          </div>

          <div className="flex-1 p-8 lg:p-12">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-error-container text-error rounded-xl border border-error/20 flex items-center gap-3"
              >
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Profile Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2" id="field-profileFor">
                        <FieldLabel label="Profile created for" field="profileFor" />
                        <select
                          value={formData.profileFor}
                          onChange={(e) => updateFormData('profileFor', e.target.value)}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary",
                            invalidFields.includes('profileFor') && "field-error-animation"
                          )}
                        >
                          <option value="">Select option</option>
                          {['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative', 'Friend'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ErrorMessage field="profileFor" message="This field is required." />
                      </div>
                      <div className="space-y-2" id="field-profileType">
                        <FieldLabel label="Profile Type" field="profileType" />
                        <div className="flex gap-4">
                          {['bride', 'groom'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => { updateFormData('profileType', type); updateFormData('gender', type === 'groom' ? 'male' : 'female'); }}
                              className={cn(
                                "flex-1 p-3 rounded-xl border-2 capitalize transition-colors font-medium",
                                formData.profileType === type ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/50",
                                invalidFields.includes('profileType') && "field-error-animation"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <ErrorMessage field="profileType" message="Please select your gender." />
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2" id="field-name">
                      <FieldLabel label="Full Name" field="name" />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateFormData('name', e.target.value)}
                            placeholder="First Name"
                            className={cn(
                              "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary",
                              invalidFields.includes('name') && "field-error-animation"
                            )}
                          />
                          <ErrorMessage field="name" message="Full name is required." />
                        </div>
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={formData.middleName}
                            onChange={(e) => updateFormData('middleName', e.target.value)}
                            placeholder="Middle Name"
                            className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary"
                          />
                          <span className="text-[10px] text-on-surface-variant italic ml-2">(Optional)</span>
                        </div>
                        <div className="flex-1 space-y-1" id="field-lastName">
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => updateFormData('lastName', e.target.value)}
                            placeholder="Last Name"
                            className={cn(
                              "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary",
                              invalidFields.includes('lastName') && "field-error-animation"
                            )}
                          />
                          <ErrorMessage field="lastName" message="Last name is required." />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2" id="field-email">
                      <FieldLabel label="Email Address" field="email" />
                      <div className="relative group">
                        <input
                          type="email"
                          value={formData.email}
                          placeholder="Email address"
                          readOnly
                          className="w-full pl-4 pr-32 py-3 bg-surface-variant/30 text-on-surface-variant border border-outline-variant rounded-xl outline-none cursor-not-allowed"
                        />
                        {isGoogleUser ? (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                            <Lock className="w-3 h-3" /> GOOGLE AUTH
                          </div>
                        ) : (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                            <CheckCircle2 className="w-3 h-3 text-green-600" /> VERIFIED
                          </div>
                        )}
                      </div>
                      <ErrorMessage field="email" message="This field is required." />
                      <p className="text-[10px] text-on-surface-variant italic">Email address cannot be changed once verification is completed.</p>
                    </div>

                    {/* Mobile & DOB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2" id="field-mobileNumber">
                        <FieldLabel label="Mobile Number" field="mobileNumber" />
                        <div className={cn(
                          "flex bg-surface border border-outline-variant rounded-xl overflow-hidden focus-within:border-primary transition-colors",
                          invalidFields.includes('mobileNumber') && "field-error-animation"
                        )}>
                          <select
                            value={formData.countryCode}
                            onChange={(e) => updateFormData('countryCode', e.target.value)}
                            className="px-3 py-3 bg-surface border-r border-outline-variant outline-none text-on-surface text-center font-medium min-w-[80px]"
                          >
                            {COUNTRY_CODES.map((c, i) => (
                              <option key={i} value={c.code}>{c.code} {c.name}</option>
                            ))}
                          </select>
                          <input type="tel" value={formData.mobileNumber} onChange={(e) => updateFormData('mobileNumber', e.target.value)} placeholder="e.g. 234 567 8900" className="w-full px-4 py-3 bg-transparent outline-none flex-1" />
                        </div>
                        <ErrorMessage field="mobileNumber" message="Phone number is required." />
                      </div>
                      <div className="space-y-2" id="field-dob">
                        <FieldLabel label="Date of Birth" field="dob" />
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => updateFormData('dob', e.target.value)}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary",
                            invalidFields.includes('dob') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="dob" message="Date of birth is required." />
                      </div>
                    </div>

                    {/* Account notice */}
                    <p className="text-xs text-on-surface-variant italic -mt-2">
                      “Your mobile number will be used for account verification and important communication related to your profile.”
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2" id="field-citizenship">
                        <FieldLabel label="Citizenship" field="citizenship" />
                        <select
                          value={formData.citizenship}
                          onChange={(e) => updateFormData('citizenship', e.target.value)}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary",
                            invalidFields.includes('citizenship') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Citizenship</option>
                          {WORLD_COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                        </select>
                        <ErrorMessage field="citizenship" message="This field is required." />
                      </div>
                      <div className="space-y-2" id="field-countryLiving">
                        <FieldLabel label="Country Living" field="countryLiving" />
                        <select
                          value={formData.countryLiving}
                          onChange={(e) => {
                            updateFormData('countryLiving', e.target.value);
                            updateFormData('cityLiving', ''); // Reset city when country changes
                          }}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary",
                            invalidFields.includes('countryLiving') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Country</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                        </select>
                        <p className="text-xs text-on-surface-variant/80 italic mt-1 font-medium">
                          Only applicants living in Saudi Arabia may register.
                        </p>
                        <ErrorMessage field="countryLiving" message="Please select your country." />
                      </div>
                      <div className="space-y-2" id="field-cityLiving">
                        <FieldLabel label="City" field="cityLiving" />
                        <select
                          value={formData.cityLiving}
                          onChange={(e) => updateFormData('cityLiving', e.target.value)}
                          disabled={!formData.countryLiving}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary disabled:opacity-50",
                            invalidFields.includes('cityLiving') && "field-error-animation"
                          )}
                        >
                          <option value="">Select City</option>
                          {getCitiesForCountry(formData.countryLiving).map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                        <ErrorMessage field="cityLiving" message="City is required." />
                      </div>
                    </div>

                    <h4 className="font-headline text-2xl text-on-surface mt-6">Religion & Church</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1" id="field-denomination">
                        <FieldLabel label="Denomination" field="denomination" />
                        <select
                          value={formData.denomination}
                          onChange={(e) => updateFormData('denomination', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('denomination') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Denomination</option>
                          {POPULAR_DENOMINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ErrorMessage field="denomination" message="Required." />
                      </div>
                      <div className="space-y-1" id="field-churchName">
                        <FieldLabel label="Church Name" field="churchName" />
                        <input
                          type="text"
                          value={formData.churchName}
                          onChange={(e) => updateFormData('churchName', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('churchName') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="churchName" message="Required." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1" id="field-churchCity">
                        <FieldLabel label="Church City" field="churchCity" />
                        <select
                          value={formData.churchCity}
                          onChange={(e) => updateFormData('churchCity', e.target.value)}
                          disabled={!formData.countryLiving}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm disabled:opacity-50",
                            invalidFields.includes('churchCity') && "field-error-animation"
                          )}
                        >
                          <option value="">Select City</option>
                          {formData.countryLiving ? getCitiesForCountry(formData.countryLiving).map(city => <option key={city} value={city}>{city}</option>) : null}
                        </select>
                        <ErrorMessage field="churchCity" message="Required." />
                      </div>

                      <div className="space-y-1" id="field-churchArea">
                        <FieldLabel label="Church in Area" field="churchArea" />
                        <input
                          type="text"
                          value={formData.churchArea || ''}
                          onChange={(e) => updateFormData('churchArea', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('churchArea') && "field-error-animation"
                          )}
                          placeholder="e.g. Downtown, Sector 4"
                        />
                        <ErrorMessage field="churchArea" message="Required." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1" id="field-baptized">
                        <FieldLabel label="Baptized" field="baptized" />
                        <select
                          value={formData.baptized}
                          onChange={(e) => updateFormData('baptized', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('baptized') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        <ErrorMessage field="baptized" message="Required." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1" id="field-pastorName">
                        <FieldLabel label="Pastor Name" field="pastorName" />
                        <input
                          type="text"
                          value={formData.pastorName || ''}
                          onChange={(e) => updateFormData('pastorName', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('pastorName') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="pastorName" message="Required." />
                      </div>

                      <div className="space-y-1" id="field-pastorNumber">
                        <FieldLabel label="Pastor Number" field="pastorNumber" />
                        <input
                          type="text"
                          value={formData.pastorNumber || ''}
                          onChange={(e) => updateFormData('pastorNumber', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('pastorNumber') && "field-error-animation"
                          )}
                          placeholder="10-digit number"
                        />
                        <ErrorMessage field="pastorNumber" message="Required. Must be exactly 10 digits." />
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-surface-variant/30 rounded-xl border border-outline-variant/30 flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-sm text-red-600 font-bold leading-relaxed">
                        Your Email, Mobile number, Pastor Name &amp; Number will not be visible to other users
                      </p>
                    </div>

                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h4 className="font-headline text-xl text-on-surface">Personal Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1" id="field-maritalStatus">
                        <FieldLabel label="Marital Status" field="maritalStatus" />
                        <select
                          value={formData.maritalStatus}
                          onChange={(e) => updateFormData('maritalStatus', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('maritalStatus') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Status</option>
                          {['Never Married', 'Annulled', 'Divorced', 'Widowed'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage field="maritalStatus" message="This field is required." />
                      </div>
                      <div className="space-y-1" id="field-height">
                        <FieldLabel label="Height (ft)" field="height" />
                        <select
                          value={formData.height}
                          onChange={(e) => updateFormData('height', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('height') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Height</option>
                          {HEIGHT_FT.map(h => <option key={h} value={h}>{h} ft</option>)}
                        </select>
                        <ErrorMessage field="height" message="This field is required." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1" id="field-weight">
                        <FieldLabel label="Weight (kg)" field="weight" />
                        <input
                          type="number"
                          value={formData.weight}
                          onChange={(e) => updateFormData('weight', e.target.value)}
                          placeholder="E.g. 70"
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('weight') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="weight" message="This field is required." />
                      </div>
                      <div className="space-y-1" id="field-bodyType">
                        <FieldLabel label="Body Type" field="bodyType" />
                        <select
                          value={formData.bodyType}
                          onChange={(e) => updateFormData('bodyType', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('bodyType') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Body Type</option>
                          {['Slim', 'Average', 'Athletic', 'Heavy'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage field="bodyType" message="This field is required." />
                      </div>
                      <div className="space-y-1" id="field-complexion">
                        <FieldLabel label="Complexion" field="complexion" />
                        <select
                          value={formData.complexion}
                          onChange={(e) => updateFormData('complexion', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('complexion') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Complexion</option>
                          {['Fair', 'Light', 'Medium', 'Olive', 'Dark'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage field="complexion" message="This field is required." />
                      </div>
                    </div>
                    <div className="flex flex-row flex-nowrap gap-4 w-full">
                      <div className="flex-1 min-w-0 space-y-1" id="field-physicalStatus">
                        <FieldLabel label="Physical Status" field="physicalStatus" />
                        <select
                          value={formData.physicalStatus}
                          onChange={(e) => updateFormData('physicalStatus', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('physicalStatus') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Physical Status</option>
                          {['Normal', 'Physically Challenged'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage field="physicalStatus" message="This field is required." />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1" id="field-motherTongue">
                        <FieldLabel label="Mother Tongue" field="motherTongue" />
                        <select
                          value={formData.motherTongue}
                          onChange={(e) => updateFormData('motherTongue', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('motherTongue') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Mother Tongue</option>
                          {['English', ...INDIAN_LANGUAGES].map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                        <ErrorMessage field="motherTongue" message="This field is required." />
                      </div>

                      <div ref={languagesDropdownRef} className="flex-1 min-w-0 space-y-1 relative" id="field-languagesKnown">
                        <FieldLabel label="Languages I Know" field="languagesKnown" isOptional={true} />
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowLanguagesDropdown(!showLanguagesDropdown)}
                            className={cn(
                              "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm text-left flex justify-between items-center transition-all focus:border-primary",
                              invalidFields.includes('languagesKnown') && "field-error-animation"
                            )}
                          >
                            <span className="truncate">
                              {formData.languagesKnown.length > 0
                                ? formData.languagesKnown.join(', ')
                                : "Select Languages"
                              }
                            </span>
                            <svg className="w-4 h-4 text-on-surface-variant transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {showLanguagesDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-y-auto p-2 space-y-1 font-sans">
                              <label className="flex items-center space-x-2 p-1.5 rounded hover:bg-surface-variant cursor-pointer text-sm">
                                <input
                                  type="checkbox"
                                  checked={formData.languagesKnown.includes('English')}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const next = checked
                                      ? [...formData.languagesKnown, 'English']
                                      : formData.languagesKnown.filter(l => l !== 'English');
                                    updateFormData('languagesKnown', next);
                                  }}
                                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-on-surface font-medium">English</span>
                              </label>
                              <div className="border-t border-outline-variant my-1"></div>
                              {INDIAN_LANGUAGES.map(lang => (
                                <label key={lang} className="flex items-center space-x-2 p-1.5 rounded hover:bg-surface-variant cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    checked={formData.languagesKnown.includes(lang)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const next = checked
                                        ? [...formData.languagesKnown, lang]
                                        : formData.languagesKnown.filter(l => l !== lang);
                                      updateFormData('languagesKnown', next);
                                    }}
                                    className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                  />
                                  <span className="text-on-surface">{lang}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <ErrorMessage field="languagesKnown" message="Please select at least one language." />
                      </div>
                    </div>

                    <h4 className="font-headline text-xl text-on-surface pt-4 border-t border-outline-variant">Career Path</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1" id="field-education">
                        <FieldLabel label="Education" field="education" />
                        <select
                          value={formData.education}
                          onChange={(e) => updateFormData('education', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('education') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Education</option>
                          {['High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Professional'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage field="education" message="This field is required." />
                      </div>
                      <div className="space-y-1" id="field-profession">
                        <FieldLabel label="Profession" field="profession" />
                        <input
                          type="text"
                          value={formData.profession}
                          onChange={(e) => updateFormData('profession', e.target.value)}
                          placeholder="E.g. Software Engineer"
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('profession') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="profession" message="This field is required." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1" id="field-fieldOfStudy">
                        <FieldLabel label="Field of Study" field="fieldOfStudy" isOptional={true} />
                        <input
                          type="text"
                          value={formData.fieldOfStudy}
                          onChange={(e) => updateFormData('fieldOfStudy', e.target.value)}
                          placeholder="E.g. Computer Science"
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('fieldOfStudy') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="fieldOfStudy" message="This field is required." />
                      </div>
                      <div className="space-y-1" id="field-annualIncome">
                        <FieldLabel label="Annual Income" field="annualIncome" isOptional={true} />
                        <input
                          type="text"
                          value={formData.annualIncome}
                          onChange={(e) => updateFormData('annualIncome', e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm"
                          placeholder="E.g. 500k+"
                        />
                      </div>
                    </div>

                    <h4 className="font-headline text-xl text-on-surface pt-4 border-t border-outline-variant">Lifestyle</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1" id="field-dietaryHabits">
                        <FieldLabel label="Diet" field="dietaryHabits" />
                        <select
                          value={formData.dietaryHabits}
                          onChange={(e) => updateFormData('dietaryHabits', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('dietaryHabits') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Diet</option>
                          {['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage field="dietaryHabits" message="This field is required." />
                      </div>
                      <div className="space-y-1" id="field-drinkingHabits">
                        <FieldLabel label="Drinking" field="drinkingHabits" />
                        <select
                          value={formData.drinkingHabits}
                          onChange={(e) => updateFormData('drinkingHabits', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('drinkingHabits') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Drinking Habit</option>
                          {['Never', 'Socially', 'Regularly'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage field="drinkingHabits" message="This field is required." />
                      </div>
                      <div className="space-y-1" id="field-smokingHabits">
                        <FieldLabel label="Smoking" field="smokingHabits" />
                        <select
                          value={formData.smokingHabits}
                          onChange={(e) => updateFormData('smokingHabits', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('smokingHabits') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Smoking Habit</option>
                          {['Never', 'Occasionally', 'Regularly'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage field="smokingHabits" message="This field is required." />
                      </div>
                    </div>
                    <div className="space-y-1" id="field-hobbies">
                      <FieldLabel label="Hobbies" field="hobbies" isOptional={true} />
                      <input
                        type="text"
                        value={formData.hobbies.join(', ')}
                        onChange={(e) => updateFormData('hobbies', e.target.value.split(',').map(s => s.trim()))}
                        placeholder="E.g. Reading, Traveling"
                        className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-1" id="field-aboutMe">
                      <FieldLabel label="About Me" field="aboutMe" />
                      <textarea
                        value={formData.aboutMe}
                        onChange={(e) => updateFormData('aboutMe', e.target.value)}
                        placeholder="Describe yourself, your family, and what you are looking for..."
                        rows={4}
                        className={cn(
                          "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm resize-none transition-colors focus:border-primary",
                          invalidFields.includes('aboutMe') && "field-error-animation"
                        )}
                      />
                      <ErrorMessage field="aboutMe" message="Please write a short description about yourself." />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8">
                    <h4 className="font-headline text-2xl text-on-surface">Family Background</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1" id="field-fathersName">
                        <FieldLabel label="Father's Name" field="fathersName" />
                        <input
                          type="text"
                          value={formData.fathersName}
                          onChange={(e) => updateFormData('fathersName', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('fathersName') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="fathersName" message="Required." />
                      </div>
                      <div className="space-y-1" id="field-fathersOccupation">
                        <FieldLabel label="Father's Occupation" field="fathersOccupation" />
                        <input
                          type="text"
                          value={formData.fathersOccupation}
                          onChange={(e) => updateFormData('fathersOccupation', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('fathersOccupation') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="fathersOccupation" message="Required." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1" id="field-mothersName">
                        <FieldLabel label="Mother's Name" field="mothersName" />
                        <input
                          type="text"
                          value={formData.mothersName}
                          onChange={(e) => updateFormData('mothersName', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('mothersName') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="mothersName" message="Required." />
                      </div>
                      <div className="space-y-1" id="field-mothersOccupation">
                        <FieldLabel label="Mother's Occupation" field="mothersOccupation" />
                        <input
                          type="text"
                          value={formData.mothersOccupation}
                          onChange={(e) => updateFormData('mothersOccupation', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('mothersOccupation') && "field-error-animation"
                          )}
                        />
                        <ErrorMessage field="mothersOccupation" message="Required." />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1" id="field-numberOfSiblings">
                        <FieldLabel label="Number of Siblings" field="numberOfSiblings" />
                        <select
                          value={formData.numberOfSiblings}
                          onChange={(e) => updateFormData('numberOfSiblings', e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm",
                            invalidFields.includes('numberOfSiblings') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Option</option>
                          <option value="None">None</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5+">5+</option>
                        </select>
                        <ErrorMessage field="numberOfSiblings" message="Required." />
                      </div>
                    </div>

                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8">
                    <h4 className="font-headline text-2xl text-on-surface">Age, Height & Language Preferences</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2" id="field-ageMin">
                        <FieldLabel label="Min Age" field="ageMin" />
                        <select
                          value={formData.partnerPreferences.ageMin}
                          onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, ageMin: e.target.value })}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none",
                            invalidFields.includes('ageMin') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Min Age</option>
                          {AGE_OPTIONS.map(age => <option key={age} value={age}>{age}</option>)}
                        </select>
                        <ErrorMessage field="ageMin" message="Required." />
                      </div>
                      <div className="space-y-2" id="field-ageMax">
                        <FieldLabel label="Max Age" field="ageMax" />
                        <select
                          value={formData.partnerPreferences.ageMax}
                          onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, ageMax: e.target.value })}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none",
                            invalidFields.includes('ageMax') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Max Age</option>
                          {AGE_OPTIONS.map(age => <option key={age} value={age}>{age}</option>)}
                        </select>
                        <ErrorMessage field="ageMax" message="Required." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2" id="field-heightMin">
                        <FieldLabel label="Min Height (ft)" field="heightMin" />
                        <select
                          value={formData.partnerPreferences.heightMin}
                          onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, heightMin: e.target.value })}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none",
                            invalidFields.includes('heightMin') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Min Height</option>
                          {HEIGHT_FT.map(h => <option key={h} value={h}>{h} ft</option>)}
                        </select>
                        <ErrorMessage field="heightMin" message="Required." />
                      </div>
                      <div className="space-y-2" id="field-heightMax">
                        <FieldLabel label="Max Height (ft)" field="heightMax" />
                        <select
                          value={formData.partnerPreferences.heightMax}
                          onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, heightMax: e.target.value })}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none",
                            invalidFields.includes('heightMax') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Max Height</option>
                          {HEIGHT_FT.map(h => <option key={h} value={h}>{h} ft</option>)}
                        </select>
                        <ErrorMessage field="heightMax" message="Required." />
                      </div>
                      <div ref={prefMotherTongueDropdownRef} className="space-y-2 relative" id="field-pref-motherTongue">
                        <FieldLabel label="Mother Tongue" field="pref-motherTongue" isOptional={true} />
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowPrefMotherTongueDropdown(!showPrefMotherTongueDropdown)}
                            className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none text-sm text-left flex justify-between items-center transition-all focus:border-primary"
                          >
                            <span className="truncate">
                              {formData.partnerPreferences.motherTongue.length > 0 && !formData.partnerPreferences.motherTongue.includes('Any')
                                ? formData.partnerPreferences.motherTongue.join(', ')
                                : "Any"
                              }
                            </span>
                            <svg className="w-4 h-4 text-on-surface-variant transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
 
                          {showPrefMotherTongueDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-surface border border-outline-variant rounded-xl shadow-lg max-h-60 overflow-y-auto p-2 space-y-1 font-sans">
                              {/* "Any" Option */}
                              <label className="flex items-center space-x-2 p-1.5 rounded hover:bg-surface-variant cursor-pointer text-sm font-semibold border-b border-outline-variant pb-2 mb-1">
                                <input
                                  type="checkbox"
                                  checked={formData.partnerPreferences.motherTongue.includes('Any')}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const next = checked ? ['Any'] : [];
                                    updateFormData('partnerPreferences', { ...formData.partnerPreferences, motherTongue: next });
                                  }}
                                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-on-surface">Any</span>
                              </label>

                              <label className="flex items-center space-x-2 p-1.5 rounded hover:bg-surface-variant cursor-pointer text-sm">
                                <input
                                  type="checkbox"
                                  checked={formData.partnerPreferences.motherTongue.includes('English')}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const next = checked
                                      ? [...formData.partnerPreferences.motherTongue.filter(l => l !== 'Any'), 'English']
                                      : formData.partnerPreferences.motherTongue.filter(l => l !== 'English');
                                    updateFormData('partnerPreferences', { ...formData.partnerPreferences, motherTongue: next });
                                  }}
                                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-on-surface font-medium">English</span>
                              </label>
                              <div className="border-t border-outline-variant my-1"></div>
                              {INDIAN_LANGUAGES.map(lang => (
                                <label key={lang} className="flex items-center space-x-2 p-1.5 rounded hover:bg-surface-variant cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    checked={formData.partnerPreferences.motherTongue.includes(lang)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const next = checked
                                        ? [...formData.partnerPreferences.motherTongue.filter(l => l !== 'Any'), lang]
                                        : formData.partnerPreferences.motherTongue.filter(l => l !== lang);
                                      updateFormData('partnerPreferences', { ...formData.partnerPreferences, motherTongue: next });
                                    }}
                                    className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                  />
                                  <span className="text-on-surface">{lang}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <h4 className="font-headline text-2xl text-on-surface">Lifestyle & References</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2" id="field-dietaryHabits-pref">
                        <FieldLabel label="Dietary Habits" field="dietaryHabits-pref" isOptional={true} />
                        <select value={formData.partnerPreferences.dietaryHabits} onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, dietaryHabits: e.target.value })} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                          <option value="">Select Dietary Habit</option>
                          {['No Preference', 'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2" id="field-drinkingHabits-pref">
                        <FieldLabel label="Drinking Habits" field="drinkingHabits-pref" isOptional={true} />
                        <select value={formData.partnerPreferences.drinkingHabits} onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, drinkingHabits: e.target.value })} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                          <option value="">Select Drinking Habit</option>
                          {['No Preference', 'Never', 'Socially', 'Regularly'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2" id="field-smokingHabits-pref">
                      <FieldLabel label="Smoking Habits" field="smokingHabits-pref" isOptional={true} />
                      <select value={formData.partnerPreferences.smokingHabits} onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, smokingHabits: e.target.value })} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                        <option value="">Select Smoking Habit</option>
                        {['No Preference', 'Never', 'Occasionally', 'Regularly'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                     <h4 className="font-headline text-2xl text-on-surface">Background & Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div ref={prefDenominationDropdownRef} className="space-y-2 relative" id="field-pref-denominations">
                        <FieldLabel label="Denomination Preference" field="pref-denominations" />
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowPrefDenominationDropdown(!showPrefDenominationDropdown)}
                            className={cn(
                              "w-full px-4 py-3 bg-surface border rounded-xl outline-none text-sm text-left flex justify-between items-center transition-all focus:border-primary",
                              invalidFields.includes('pref-denominations') ? "border-[#dc2626] field-error-animation" : "border-outline-variant"
                            )}
                          >
                            <span className="truncate">
                              {formData.partnerPreferences.denominations.length > 0
                                ? formData.partnerPreferences.denominations.join(', ')
                                : "Select Denominations"
                              }
                            </span>
                            <svg className="w-4 h-4 text-on-surface-variant transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                           {showPrefDenominationDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-surface border border-outline-variant rounded-xl shadow-lg max-h-60 overflow-y-auto p-2 space-y-1 font-sans">
                              {/* "Any" Option */}
                              <label className="flex items-center space-x-2 p-1.5 rounded hover:bg-surface-variant cursor-pointer text-sm font-semibold border-b border-outline-variant pb-2 mb-1">
                                <input
                                  type="checkbox"
                                  checked={formData.partnerPreferences.denominations.includes('Any')}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const next = checked ? ['Any'] : [];
                                    updateFormData('partnerPreferences', { ...formData.partnerPreferences, denominations: next });
                                  }}
                                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                />
                                <span className="text-on-surface">Any</span>
                              </label>

                              {POPULAR_DENOMINATIONS.map(denom => (
                                <label key={denom} className="flex items-center space-x-2 p-1.5 rounded hover:bg-surface-variant cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    checked={formData.partnerPreferences.denominations.includes(denom)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const next = checked
                                        ? [...formData.partnerPreferences.denominations.filter(d => d !== 'Any'), denom]
                                        : formData.partnerPreferences.denominations.filter(d => d !== denom);
                                      updateFormData('partnerPreferences', { ...formData.partnerPreferences, denominations: next });
                                    }}
                                    className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                  />
                                  <span className="text-on-surface">{denom}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <ErrorMessage field="pref-denominations" message="Required." />
                      </div>

                      <div className="space-y-2" id="field-educationLevel">
                        <FieldLabel label="Education Level" field="educationLevel" />
                        <select
                          value={formData.partnerPreferences.educationLevel}
                          onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, educationLevel: e.target.value })}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none",
                            invalidFields.includes('educationLevel') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Education Level</option>
                          {['Any', 'High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Professional'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrorMessage field="educationLevel" message="Required." />
                      </div>
                      <div className="space-y-2" id="field-country">
                        <FieldLabel label="Country Preference" field="country" />
                        <select
                          value={formData.partnerPreferences.country}
                          onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, country: e.target.value, city: '' })}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none",
                            invalidFields.includes('country') && "field-error-animation"
                          )}
                        >
                          <option value="">Select Country</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                        </select>
                        <ErrorMessage field="country" message="Required." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2" id="field-city">
                        <FieldLabel label="City Preference" field="city" />
                        <select
                          value={formData.partnerPreferences.city}
                          onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, city: e.target.value })}
                          disabled={!formData.partnerPreferences.country || formData.partnerPreferences.country === 'Any'}
                          className={cn(
                            "w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none disabled:opacity-50",
                            invalidFields.includes('city') && "field-error-animation"
                          )}
                        >
                          <option value="">Select City</option>
                          <option value="Any">Any</option>
                          {getCitiesForCountry(formData.partnerPreferences.country).map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                        <ErrorMessage field="city" message="Required." />
                      </div>
                    </div>
                    <div className="space-y-4" id="field-pref-maritalStatus">
                      <FieldLabel label="Marital Status Preference" field="pref-maritalStatus" />
                      <div className={cn(
                        "flex flex-wrap gap-2",
                        invalidFields.includes('pref-maritalStatus') && "field-error-animation"
                      )}>
                        {['Never Married', 'Annulled', 'Divorced', 'Widowed'].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              const current = formData.partnerPreferences.maritalStatus;
                              const next = current.includes(status) ? current.filter(s => s !== status) : [...current, status];
                              updateFormData('partnerPreferences', { ...formData.partnerPreferences, maritalStatus: next });
                              if (next.length > 0) setInvalidFields(prev => prev.filter(f => f !== 'pref-maritalStatus'));
                            }}
                            className={cn(
                              "px-4 py-2 rounded-full border text-sm transition-all",
                              formData.partnerPreferences.maritalStatus.includes(status)
                                ? "bg-primary text-on-primary border-primary"
                                : "bg-surface border-outline-variant hover:border-primary"
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                      <ErrorMessage field="pref-maritalStatus" message="Please select at least one option." />
                    </div>

                    <div className="space-y-2" id="field-pref-otherPreferences">
                      <FieldLabel label="My Desired Partner" field="pref-otherPreferences" isOptional={true} />
                      <textarea
                        value={formData.partnerPreferences.otherPreferences || ''}
                        onChange={(e) => updateFormData('partnerPreferences', { ...formData.partnerPreferences, otherPreferences: e.target.value })}
                        placeholder="Describe any additional qualities, background, or criteria you are looking for in a partner..."
                        rows={4}
                        className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none resize-none focus:ring-2 focus:ring-primary text-on-surface"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-8">
                    {/* Profile Photo */}
                    <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant" id="field-pendingPhotoUrl">
                      <h4 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" />
                        <FieldLabel label="Profile Photo" field="pendingPhotoUrl" />
                      </h4>
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-24 h-24 rounded-2xl bg-surface-variant flex items-center justify-center border-2 border-dashed border-outline-variant overflow-hidden shadow-inner flex-shrink-0 relative",
                          invalidFields.includes('pendingPhotoUrl') && "field-error-animation"
                        )}>
                          {uploading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-surface-variant/80 backdrop-blur-sm z-10">
                              <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                          ) : null}

                          {formData.pendingPhotoUrl ? (
                            <div className="relative w-full h-full">
                              <img src={formData.pendingPhotoUrl} alt="Main" className="w-full h-full object-cover" />
                              {formData.photoStatus === 'pending' && (
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                                  <div className="bg-gold text-[#040e2a] text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg border border-gold/50">
                                    <Hourglass className="w-3 h-3 text-[#040e2a]" /> Awaiting Approval
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <Camera className="w-8 h-8 text-outline" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-on-surface-variant">Upload a clear, high-quality portrait photo for your main profile.</p>
                          <label className={cn(
                            "inline-block cursor-pointer bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors",
                            uploading && "opacity-50 cursor-not-allowed pointer-events-none"
                          )}>
                            {formData.pendingPhotoUrl ? "Change Photo" : "Upload Photo"}
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleMainPhotoChange}
                              className="hidden"
                              accept="image/jpeg, image/png, image/webp, .jpg, .jpeg, .png, .webp"
                              disabled={uploading}
                            />
                          </label>
                          <ErrorMessage field="pendingPhotoUrl" message="Profile photo is required. Please upload a clear photo of yourself." />
                          <p className="text-[10px] text-on-surface-variant mt-1">Please upload .Jpg files only and not more than 500 KB file size.</p>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-outline-variant">
                        <h4 className="text-sm font-semibold text-on-surface mb-4">Photo Privacy Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button type="button" onClick={() => updateFormData('photoPrivacy', 'public')} className={cn("p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-colors", formData.photoPrivacy === 'public' ? "border-primary bg-primary/5 text-primary" : "border-outline-variant hover:border-primary/50 text-on-surface-variant")}>
                            <Eye className="w-6 h-6" />
                            <div>
                              <div className="font-bold text-sm">Public</div>
                              <div className="text-xs opacity-80 mt-1">Visible to all members</div>
                            </div>
                          </button>

                          <button type="button" onClick={() => updateFormData('photoPrivacy', 'accepted_only')} className={cn("p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-colors", formData.photoPrivacy === 'accepted_only' ? "border-primary bg-primary/5 text-primary" : "border-outline-variant hover:border-primary/50 text-on-surface-variant")}>
                            <Lock className="w-6 h-6" />
                            <div>
                              <div className="font-bold text-sm">Protected</div>
                              <div className="text-xs opacity-80 mt-1">Visible to accepted matches</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Gallery Photos */}
                    <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant">
                      <h4 className="text-lg font-semibold text-on-surface mb-2 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        <FieldLabel label="Gallery Photos" field="gallery" isOptional={true} />
                      </h4>
                      <p className="text-sm text-on-surface-variant mb-6">Add up to 3 additional photos to showcase your lifestyle and personality.</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.gallery.slice(0, 3).map(photo => (
                          <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant group">
                            <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                            {photo.status === 'pending' && (
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                                <div className="bg-gold text-[#040e2a] text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-gold/50">
                                  <Hourglass className="w-2.5 h-2.5 text-[#040e2a]" /> Pending
                                </div>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeGalleryPhoto(photo.id);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all z-20"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {formData.gallery.length < 3 && (
                          <label className={cn(
                            "aspect-square rounded-2xl border-2 border-dashed border-outline-variant bg-surface flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all relative",
                            uploading && "opacity-50 cursor-not-allowed pointer-events-none"
                          )}>
                            {uploading ? (
                              <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-8 h-8 text-outline" />
                                <span className="text-xs text-outline mt-2 font-medium">Add Photo</span>
                              </>
                            )}
                            <input
                              type="file"
                              ref={galleryInputRef}
                              onChange={handleGalleryAdd}
                              className="hidden"
                              accept="image/jpeg, image/png, image/webp, .jpg, .jpeg, .png, .webp"
                              multiple
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-3 text-center">Please upload .Jpg files only and not more than 500 KB file size.</p>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="p-8 lg:p-12 border-t border-white/20 flex justify-between items-center mt-auto"
            style={{ background: 'rgba(255, 255, 255, 0.3)' }}
          >
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-10 py-3 bg-primary text-on-primary rounded-xl font-label-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 disabled:opacity-0 transition-all font-inter"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-10 py-3 bg-primary text-on-primary rounded-xl font-label-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 disabled:opacity-50 font-inter"
            >
              {loading ? "Submitting..." : currentStep === STEPS.length ? "Submit Profile" : "Continue"}
              {!loading && currentStep !== STEPS.length && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </main>

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
    </div>
  );
}

