import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db, storage } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { sendEmailVerification, reload, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ArrowRight, ArrowLeft, CheckCircle2, Upload, Camera, Scale, MapPin, Church, GraduationCap, Briefcase, Ruler, ShieldCheck, X, Plus, Mail, Phone, Loader2, Lock, Eye, EyeOff, Globe, MapPinHouse } from 'lucide-react';
import { cn, handleFirestoreError, OperationType, formatAuthError } from '../lib/utils';
import { useSettings } from '../lib/SettingsContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { HEIGHT_FT, WORLD_COUNTRIES, getCitiesForCountry, AGE_OPTIONS } from '../lib/locationData';

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Who are you?' },
  { id: 2, title: 'Personal, Career & Lifestyle', description: 'All about you' },
  { id: 3, title: 'Partner Preferences', description: 'Who you seek' },
  { id: 4, title: 'Photos', description: 'Show your best self' }
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

export default function RegisterPage() {
  const { settings } = useSettings();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailVerifiedLocal, setEmailVerifiedLocal] = useState(false);
  const [showEmailOtpPopup, setShowEmailOtpPopup] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
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
    countryLiving: '',
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
    spiritualInvolvement: [] as string[],
    motherTongue: [] as string[],
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
    // ... photos
    photoUrl: '',
    photoPrivacy: 'public',
    pendingPhotoUrl: '',
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
      country: '',
      city: '',
      relocationPreference: ''
    }
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isEditing = searchParams.get('edit') === 'true';
    
    // Redirect if already has profile, UNLESS we are in edit mode
    if (profile && !isEditing) {
      navigate('/dashboard');
    }
    
    // Test connection
    const testConnection = async () => {
      try {
        await import('firebase/firestore').then(({ doc, getDocFromServer }) => getDocFromServer(doc(db, 'test', 'connection')));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Database connection issue. Check if Firebase is correctly configured.");
        }
      }
    }
    testConnection();
  }, [profile, navigate]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const compressAndUpload = async (file: File, path: string) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/jpeg'
    };

    console.log(`Starting compression for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Compressed to ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      
      // Try Cloudinary first if configured
      if (settings.cloudinaryCloudName && settings.cloudinaryUploadPreset) {
        try {
          console.log("Attempting Cloudinary upload...");
          const url = await uploadToCloudinary(
            compressedFile, 
            settings.cloudinaryCloudName, 
            settings.cloudinaryUploadPreset
          );
          console.log("Cloudinary upload successful:", url);
          return url;
        } catch (cloudinaryError) {
          console.warn("Cloudinary upload failed, falling back to Firebase:", cloudinaryError);
        }
      }

      // Fallback to Firebase Storage
      try {
        console.log("Attempting Firebase Storage upload to:", path);
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, compressedFile);
        const downloadUrl = await getDownloadURL(storageRef);
        console.log("Firebase Storage upload successful:", downloadUrl);
        return downloadUrl;
      } catch (storageError: any) {
        console.error("Firebase Storage upload failed:", storageError);
        
        // If it's a permission error, we should inform the user more clearly
        if (storageError.code === 'storage/unauthorized') {
          throw new Error("Storage permission denied. Please check Firebase Storage rules.");
        }
        
        // Fallback to Data URL for preview purposes if storage fails completely
        console.warn("Falling back to Data URL for preview...");
        const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile);
        return dataUrl;
      }
    } catch (error) {
      console.error("Compression error:", error);
      throw error;
    }
  };

  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const currentUser = auth.currentUser;
    
    if (!file) return;

    if (!file.type.match('image/jp.*')) {
      alert("Please upload .Jpg files only.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("File size must not exceed 1 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    if (!currentUser) {
      console.error("Auth check failed: No authenticated user found during photo upload.");
      alert("Please sign in or complete the first step to upload photos.");
      return;
    }

    setUploading(true);
    try {
      const path = `users/${currentUser.uid}/main_photo_${Date.now()}`;
      const url = await compressAndUpload(file, path);
      updateFormData('pendingPhotoUrl', url);
      updateFormData('photoStatus', 'pending');
    } catch (error: any) {
      console.error("Photo upload process failed:", error);
      alert("Failed to upload photo. " + (error.message || "Please try again."));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploading(false);
    }
  };

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const currentUser = auth.currentUser;
    if (!files || files.length === 0) return;
    if (!currentUser) {
      console.error("Auth check failed: No authenticated user found during gallery upload.");
      alert("Please sign in to upload gallery photos.");
      return;
    }

    setUploading(true);
    try {
      const newPhotos = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image/jp.*')) {
          console.warn(`Skipping ${file.name}: Only .Jpg files allowed.`);
          continue;
        }
        if (file.size > 1024 * 1024) {
          console.warn(`Skipping ${file.name}: Size exceeds 1 MB.`);
          continue;
        }
        
        console.log(`Uploading gallery item ${i + 1}/${files.length}...`);
        const path = `users/${currentUser.uid}/gallery_${Date.now()}_${i}`;
        const url = await compressAndUpload(file, path);
        newPhotos.push({
          id: Math.random().toString(36).substring(7),
          url,
          status: 'pending' as const
        });
      }
      updateFormData('gallery', [...formData.gallery, ...newPhotos]);
    } catch (error: any) {
      console.error("Gallery upload failed:", error);
      alert("Failed to upload gallery photos. " + (error.message || "Please try again."));
    } finally {
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      setUploading(false);
    }
  };

  const removeGalleryPhoto = (id: string) => {
    updateFormData('gallery', formData.gallery.filter(p => p.id !== id));
  };

  const handleNext = async () => {
    setErrorMsg("");
    if (currentStep === 1) {
      if (!formData.mobileNumber || !formData.profileFor || !formData.profileType || !formData.name || !formData.email || !formData.dob || !formData.password || !formData.citizenship || !formData.countryLiving || !formData.cityLiving) {
        setErrorMsg("Please fill in all mandatory fields, including Citizenship and Location.");
        return;
      }

      const today = new Date();
      const dobDate = new Date(formData.dob);
      let calculatedAge = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
        calculatedAge--;
      }
      
      if (calculatedAge < settings.minAge) {
        setErrorMsg(`You must be at least ${settings.minAge} years old to register.`);
        return;
      }

      // Update calculated age in formData
      updateFormData('age', calculatedAge.toString());

      if (!emailVerifiedLocal) {
        setErrorMsg("Please verify your email address to continue.");
        return;
      }

      // Security check: Check if mobile number already exists
      setLoading(true);
      try {
        const fullMobile = `${formData.countryCode} ${formData.mobileNumber}`;
        const q = query(collection(db, "users"), where("mobileNumber", "==", fullMobile));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setErrorMsg("The mobile number entered is already registered.");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error checking mobile existence:", err);
      } finally {
        setLoading(false);
      }
      
      // If user is not yet created, we create them before moving to step 2 verification
      if (!user) {
        setLoading(true);
        try {
          await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        } catch (err: any) {
          setErrorMsg(formatAuthError(err));
          setLoading(false);
          return;
        }
        setLoading(false);
      }
    }

    if (currentStep === 2) {
      const mandatoryFields = [
        'maritalStatus', 'height', 'weight', 'bodyType', 'complexion', 
        'physicalStatus', 'education', 'profession', 'fieldOfStudy', 
        'annualIncome', 'dietaryHabits', 'drinkingHabits', 'smokingHabits'
      ];
      const missing = mandatoryFields.filter(f => !formData[f as keyof typeof formData]);
      if (missing.length > 0) {
        setErrorMsg("Please fill in all mandatory fields in Personal, Career & Lifestyle.");
        return;
      }
    }

    if (currentStep === 3) {
      const pref = formData.partnerPreferences;
      if (!pref.ageMin || !pref.ageMax || !pref.heightMin || !pref.heightMax || !pref.educationLevel || !pref.country || !pref.city || pref.maritalStatus.length === 0) {
        setErrorMsg("Please fill in all mandatory Partner Preferences, including location and marital status.");
        return;
      }
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const profileData = {
        name: formData.name,
        middleName: formData.middleName,
        lastName: formData.lastName,
        mobileNumber: `${formData.countryCode} ${formData.mobileNumber}`,
        profileType: formData.profileType,
        profileFor: formData.profileFor,
        gender: formData.gender,
        dob: formData.dob,
        age: parseInt(formData.age),
        citizenship: formData.citizenship,
        countryLiving: formData.countryLiving,
        cityLiving: formData.cityLiving,
        maritalStatus: formData.maritalStatus,
        height: formData.height, // String (e.g. 5'2")
        weight: formData.weight,
        bodyType: formData.bodyType,
        complexion: formData.complexion,
        physicalStatus: formData.physicalStatus,
        physicalStatusDesc: formData.physicalStatusDesc,
        denomination: formData.denomination,
        churchName: formData.churchName,
        diocese: formData.diocese,
        baptized: formData.baptized,
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
        photoUrl: formData.photoUrl,
        photoPrivacy: formData.photoPrivacy,
        pendingPhotoUrl: formData.pendingPhotoUrl,
        photoStatus: formData.photoStatus,
        gallery: formData.gallery,
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
          relocationPreference: formData.partnerPreferences.relocationPreference
        },
        uid: user.uid,
        email: user.email,
        isApproved: false,
        emailVerified: true,
        mobileVerified: true,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), profileData);
      
      setSubmissionSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center p-4">
        <header className="w-full h-16 bg-surface border-b border-outline-variant flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="font-headline text-2xl text-primary font-bold tracking-tight">Kingdom Alliance</span>
          </div>
        </header>
        <main className="flex-1 w-full max-w-lg flex flex-col items-center justify-center">
            <div className="bg-surface-container-lowest rounded-[2rem] p-10 border border-outline-variant shadow-lg text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-headline text-3xl text-on-surface">Submission Successful</h2>
                <p className="text-on-surface-variant text-base">
                    Thank you, <span className="font-bold">{user?.email}</span>. Your profile has been submitted for review and approval.
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
    <div className="min-h-screen bg-surface flex flex-col items-center">
      {/* Header */}
      <header className="w-full h-16 bg-surface border-b border-outline-variant flex items-center justify-center relative z-10">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          <span className="font-headline text-2xl text-primary font-bold tracking-tight">Kingdom Alliance</span>
        </div>
      </header>

      {/* OTP Popup */}
      <AnimatePresence>
        {showEmailOtpPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button onClick={() => setShowEmailOtpPopup(false)} className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-headline text-2xl text-on-surface mb-2">Verify Email</h3>
              <p className="text-on-surface-variant text-sm mb-6">We've sent a 6-digit OTP to <br/><b className="text-on-surface">{formData.email}</b><br/>Please enter it below.</p>
              
              <div className="space-y-6">
                <input 
                  type="text" 
                  maxLength={6} 
                  value={emailOtp} 
                  onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ''))} 
                  placeholder="e.g. 123456" 
                  className="w-full px-4 py-4 bg-surface border-2 border-outline-variant focus:border-primary rounded-xl outline-none text-center text-2xl tracking-[0.5em] font-mono font-bold transition-colors" 
                  autoFocus
                />
                
                <button 
                  onClick={() => {
                    if (emailOtp.length >= 4) {
                      setEmailVerifiedLocal(true);
                      setShowEmailOtpPopup(false);
                      setErrorMsg("");
                    } else {
                      alert("Please enter a valid OTP.");
                    }
                  }} 
                  className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
                >
                  Submit OTP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-6xl px-4 py-8 lg:py-16 flex flex-col lg:flex-row gap-12 relative z-0">
        {/* Stepper Nav */}
        <aside className="lg:w-1/4">
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
        <div className="flex-1 bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant overflow-hidden flex flex-col">
          <div className="p-8 lg:p-12 bg-surface-container-low border-b border-outline-variant">
            <h3 className="font-headline text-3xl text-on-surface mb-2">{STEPS[currentStep-1].title}</h3>
            <p className="text-on-surface-variant">{STEPS[currentStep-1].description}</p>
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
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Profile created for</label>
                        <select value={formData.profileFor} onChange={(e) => updateFormData('profileFor', e.target.value)} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary">
                          <option value="">Select option</option>
                          {['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Relative', 'Friend'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                         <label className="block font-label-sm text-on-surface uppercase tracking-wider">Profile Type</label>
                         <div className="flex gap-4">
                           {['bride', 'groom'].map(type => (
                             <button key={type} type="button" onClick={() => { updateFormData('profileType', type); updateFormData('gender', type === 'groom' ? 'male' : 'female'); }} className={cn("flex-1 p-3 rounded-xl border-2 capitalize transition-colors font-medium", formData.profileType === type ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary/50")}>{type}</button>
                           ))}
                         </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <label className="block font-label-sm text-on-surface uppercase tracking-wider">Full Name</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} placeholder="First Name" className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary flex-1" />
                        <input type="text" value={formData.middleName} onChange={(e) => updateFormData('middleName', e.target.value)} placeholder="Middle Name (Optional)" className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary flex-1" />
                        <input type="text" value={formData.lastName} onChange={(e) => updateFormData('lastName', e.target.value)} placeholder="Last Name" className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary flex-1" />
                      </div>
                    </div>

                    {/* Mobile & DOB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Mobile Number</label>
                        <div className="flex bg-surface border border-outline-variant rounded-xl overflow-hidden focus-within:border-primary transition-colors">
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
                      </div>
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Date of Birth</label>
                        <input type="date" value={formData.dob} onChange={(e) => updateFormData('dob', e.target.value)} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary" />
                      </div>
                    </div>
                    
                    {/* Account notice */}
                    <p className="text-xs text-on-surface-variant italic -mt-2">
                        “Your mobile number will be used for account verification and important communication related to your profile.”
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Citizenship</label>
                        <select value={formData.citizenship} onChange={(e) => updateFormData('citizenship', e.target.value)} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary">
                          <option value="">Select Citizenship</option>
                          {WORLD_COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Country Living</label>
                        <select value={formData.countryLiving} onChange={(e) => {
                          updateFormData('countryLiving', e.target.value);
                          updateFormData('cityLiving', ''); // Reset city when country changes
                        }} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary">
                          <option value="">Select Country</option>
                          {WORLD_COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">City</label>
                        <select 
                          value={formData.cityLiving} 
                          onChange={(e) => updateFormData('cityLiving', e.target.value)} 
                          disabled={!formData.countryLiving}
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary disabled:opacity-50"
                        >
                          <option value="">Select City</option>
                          {getCitiesForCountry(formData.countryLiving).map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="h-px bg-outline-variant w-full !my-8"></div>

                    {/* Account Setup: Email & Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Email Address</label>
                        <div className="flex gap-2">
                          <input type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} disabled={emailVerifiedLocal} placeholder="Enter your email" className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none flex-1 transition-colors focus:border-primary disabled:opacity-70" />
                          {!emailVerifiedLocal ? (
                            <button type="button" onClick={() => {
                              if (!formData.email) {
                                setErrorMsg("Please enter an email first.");
                                return;
                              }
                              setShowEmailOtpPopup(true);
                            }} className="px-6 bg-primary text-on-primary font-bold rounded-xl whitespace-nowrap hover:shadow-md transition-shadow">Verify</button>
                          ) : (
                            <div className="px-4 py-3 bg-surface text-primary border border-primary/30 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap">
                              <CheckCircle2 className="w-5 h-5 fill-primary text-surface" /> Verified
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Password</label>
                        <input type="password" value={formData.password} onChange={(e) => updateFormData('password', e.target.value)} placeholder="Choose a secure password" className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none transition-colors focus:border-primary" />
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="space-y-6">
                      <h4 className="font-headline text-xl text-on-surface">Personal Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs uppercase tracking-wider text-on-surface-variant">Marital Status</label>
                          <select value={formData.maritalStatus} onChange={(e) => updateFormData('maritalStatus', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm">
                            <option value="">Select Status</option>
                            {['Never Married', 'Annulled', 'Divorced', 'Widowed'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs uppercase tracking-wider text-on-surface-variant">Height (ft)</label>
                          <select value={formData.height} onChange={(e) => updateFormData('height', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm">
                            <option value="">Select Height</option>
                            {HEIGHT_FT.map(h => <option key={h} value={h}>{h} ft</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1"><label className="block text-xs uppercase tracking-wider text-on-surface-variant">Weight (kg)</label><input type="number" value={formData.weight} onChange={(e) => updateFormData('weight', e.target.value)} placeholder="E.g. 70" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm" /></div>
                        <div className="space-y-1">
                          <label className="block text-xs uppercase tracking-wider text-on-surface-variant">Body Type</label>
                          <select value={formData.bodyType} onChange={(e) => updateFormData('bodyType', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm">
                            <option value="">Select Body Type</option>
                            {['Slim', 'Average', 'Athletic', 'Heavy'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs uppercase tracking-wider text-on-surface-variant">Complexion</label>
                          <select value={formData.complexion} onChange={(e) => updateFormData('complexion', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm">
                            <option value="">Select Complexion</option>
                            {['Fair', 'Light', 'Medium', 'Olive', 'Dark'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs uppercase tracking-wider text-on-surface-variant">Physical Status</label>
                        <select value={formData.physicalStatus} onChange={(e) => updateFormData('physicalStatus', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm">
                          <option value="">Select Physical Status</option>
                          {['Normal', 'Physically Challenged'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      
                      <h4 className="font-headline text-xl text-on-surface pt-4 border-t border-outline-variant">Career Path</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="block text-xs uppercase tracking-wider text-on-surface-variant">Education</label>
                          <select value={formData.education} onChange={(e) => updateFormData('education', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm">
                              <option value="">Select Education</option>
                              {['High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Professional'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1"><label className="block text-xs uppercase tracking-wider text-on-surface-variant">Profession</label><input type="text" value={formData.profession} onChange={(e) => updateFormData('profession', e.target.value)} placeholder="E.g. Software Engineer" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1"><label className="block text-xs uppercase tracking-wider text-on-surface-variant">Field of Study</label><input type="text" value={formData.fieldOfStudy} onChange={(e) => updateFormData('fieldOfStudy', e.target.value)} placeholder="E.g. Computer Science" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm" /></div>
                          <div className="space-y-1"><label className="block text-xs uppercase tracking-wider text-on-surface-variant">Annual Income</label><input type="text" value={formData.annualIncome} onChange={(e) => updateFormData('annualIncome', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm" placeholder="E.g. 500k+" /></div>
                      </div>

                      <h4 className="font-headline text-xl text-on-surface pt-4 border-t border-outline-variant">Lifestyle</h4>
                      <div className="grid grid-cols-3 gap-4">
                         <div className="space-y-1">
                          <label className="block text-xs uppercase tracking-wider text-on-surface-variant">Diet</label>
                          <select value={formData.dietaryHabits} onChange={(e) => updateFormData('dietaryHabits', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm">
                            <option value="">Select Diet</option>
                            {['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                         </div>
                         <div className="space-y-1">
                          <label className="block text-xs uppercase tracking-wider text-on-surface-variant">Drinking</label>
                          <select value={formData.drinkingHabits} onChange={(e) => updateFormData('drinkingHabits', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm">
                            <option value="">Select Drinking Habit</option>
                            {['Never', 'Socially', 'Regularly'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                         </div>
                         <div className="space-y-1">
                          <label className="block text-xs uppercase tracking-wider text-on-surface-variant">Smoking</label>
                          <select value={formData.smokingHabits} onChange={(e) => updateFormData('smokingHabits', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm">
                            <option value="">Select Smoking Habit</option>
                            {['Never', 'Occasionally', 'Regularly'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                         </div>
                      </div>
                      <div className="space-y-1"><label className="block text-xs uppercase tracking-wider text-on-surface-variant">Hobbies</label><input type="text" value={formData.hobbies.join(', ')} onChange={(e) => updateFormData('hobbies', e.target.value.split(',').map(s => s.trim()))} placeholder="E.g. Reading, Traveling" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none text-sm" /></div>
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <h4 className="font-headline text-2xl text-on-surface">Age & Height Preferences</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Min Age</label>
                        <select value={formData.partnerPreferences.ageMin} onChange={(e) => updateFormData('partnerPreferences', {...formData.partnerPreferences, ageMin: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                          <option value="">Select Min Age</option>
                          {AGE_OPTIONS.map(age => <option key={age} value={age}>{age}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Max Age</label>
                        <select value={formData.partnerPreferences.ageMax} onChange={(e) => updateFormData('partnerPreferences', {...formData.partnerPreferences, ageMax: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                          <option value="">Select Max Age</option>
                          {AGE_OPTIONS.map(age => <option key={age} value={age}>{age}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Min Height (ft)</label>
                        <select value={formData.partnerPreferences.heightMin} onChange={(e) => updateFormData('partnerPreferences', {...formData.partnerPreferences, heightMin: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                          <option value="">Select Min Height</option>
                          {HEIGHT_FT.map(h => <option key={h} value={h}>{h} ft</option>)}
                        </select>
                       </div>
                       <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Max Height (ft)</label>
                        <select value={formData.partnerPreferences.heightMax} onChange={(e) => updateFormData('partnerPreferences', {...formData.partnerPreferences, heightMax: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                          <option value="">Select Max Height</option>
                          {HEIGHT_FT.map(h => <option key={h} value={h}>{h} ft</option>)}
                        </select>
                       </div>
                    </div>

                    <h4 className="font-headline text-2xl text-on-surface">Lifestyle & References</h4>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Dietary Habits</label>
                        <select value={formData.partnerPreferences.dietaryHabits} onChange={(e) => updateFormData('partnerPreferences', {...formData.partnerPreferences, dietaryHabits: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                          <option value="">Select Dietary Habit</option>
                          {['No Preference', 'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                       </div>
                       <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Drinking Habits</label>
                        <select value={formData.partnerPreferences.drinkingHabits} onChange={(e) => updateFormData('partnerPreferences', {...formData.partnerPreferences, drinkingHabits: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                          <option value="">Select Drinking Habit</option>
                          {['No Preference', 'Never', 'Socially', 'Regularly'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                       </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block font-label-sm text-on-surface uppercase tracking-wider">Smoking Habits</label>
                      <select value={formData.partnerPreferences.smokingHabits} onChange={(e) => updateFormData('partnerPreferences', {...formData.partnerPreferences, smokingHabits: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                        <option value="">Select Smoking Habit</option>
                        {['No Preference', 'Never', 'Occasionally', 'Regularly'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <h4 className="font-headline text-2xl text-on-surface">Background & Location</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Education Level</label>
                        <select value={formData.partnerPreferences.educationLevel} onChange={(e) => updateFormData('partnerPreferences', {...formData.partnerPreferences, educationLevel: e.target.value})} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                          <option value="">Select Education Level</option>
                          {['No Preference', 'High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Professional'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">Country Preference</label>
                        <select value={formData.partnerPreferences.country} onChange={(e) => {
                          updateFormData('partnerPreferences', {...formData.partnerPreferences, country: e.target.value, city: ''});
                        }} className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none">
                            <option value="">Select Country</option>
                            {WORLD_COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block font-label-sm text-on-surface uppercase tracking-wider">City Preference</label>
                        <select 
                          value={formData.partnerPreferences.city} 
                          onChange={(e) => updateFormData('partnerPreferences', {...formData.partnerPreferences, city: e.target.value})} 
                          disabled={!formData.partnerPreferences.country}
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl outline-none disabled:opacity-50"
                        >
                            <option value="">Select City</option>
                            {getCitiesForCountry(formData.partnerPreferences.country).map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block font-label-sm text-on-surface uppercase tracking-wider">Marital Status Preference</label>
                      <div className="flex flex-wrap gap-2">
                        {['Never Married', 'Annulled', 'Divorced', 'Widowed'].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              const current = formData.partnerPreferences.maritalStatus;
                              const next = current.includes(status) ? current.filter(s => s !== status) : [...current, status];
                              updateFormData('partnerPreferences', { ...formData.partnerPreferences, maritalStatus: next });
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
                    </div>
                  </div>
                )}
                
                {currentStep === 4 && (
                  <div className="space-y-8">
                    {/* Profile Photo */}
                    <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant">
                      <h4 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" /> Profile Photo
                      </h4>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-surface-variant flex items-center justify-center border-2 border-dashed border-outline-variant overflow-hidden shadow-inner flex-shrink-0 relative">
                          {uploading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-surface-variant/80 backdrop-blur-sm z-10">
                              <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                          ) : null}
                          
                          {formData.pendingPhotoUrl ? (
                            <img src={formData.pendingPhotoUrl} alt="Main" className="w-full h-full object-cover" />
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
                              accept=".jpg,.jpeg" 
                              disabled={uploading}
                            />
                          </label>
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
                        <Upload className="w-5 h-5 text-primary" /> Gallery Photos
                      </h4>
                      <p className="text-sm text-on-surface-variant mb-6">Add up to 3 additional photos to showcase your lifestyle and personality.</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.gallery.slice(0, 3).map(photo => (
                          <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant group">
                            <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => removeGalleryPhoto(photo.id)} 
                              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                              accept=".jpg,.jpeg" 
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
          <div className="p-8 lg:p-12 bg-surface-container-low border-t border-outline-variant flex justify-between items-center mt-auto">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant disabled:opacity-0 transition-all font-inter"
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
    </div>
  );
}

