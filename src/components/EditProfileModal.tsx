import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Check, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const BIO_LIMIT = 1200;

const EDITABLE_SECTIONS = [
  {
    id: 'about',
    title: 'About Me',
    fields: [
      { key: 'aboutMe', label: 'About Me', type: 'textarea', placeholder: 'Share your story — your faith, the ways you serve, and the kind of home you hope to build.', maxLength: BIO_LIMIT },
    ],
  },
  {
    id: 'basic',
    title: 'Basic Info & Lifestyle',
    fields: [
      { key: 'height', label: 'Height', type: 'text', placeholder: "e.g. 5'6\"" },
      { key: 'weight', label: 'Weight', type: 'text', placeholder: 'e.g. 65 kg' },
      { key: 'bodyType', label: 'Body Type', type: 'text', placeholder: 'e.g. Slim, Athletic' },
      { key: 'complexion', label: 'Complexion', type: 'text', placeholder: 'e.g. Fair, Wheatish' },
      { key: 'physicalStatusDesc', label: 'Physical Status', type: 'text', placeholder: 'e.g. No disability' },
      { key: 'languagesKnown', label: 'Languages Known', type: 'text', placeholder: 'e.g. English, Swahili' },
      { key: 'dietaryHabits', label: 'Eating Habits', type: 'text', placeholder: 'e.g. Non-vegetarian' },
      { key: 'drinkingHabits', label: 'Drinking', type: 'text', placeholder: 'e.g. Never, Occasionally' },
      { key: 'smokingHabits', label: 'Smoking', type: 'text', placeholder: 'e.g. Never' },
      { key: 'hobbies', label: 'Hobbies', type: 'text', placeholder: 'e.g. Reading, Music' },
    ],
  },
  {
    id: 'career',
    title: 'Education & Career',
    fields: [
      { key: 'fieldOfStudy', label: 'Field of Study', type: 'text', placeholder: 'e.g. Computer Science' },
      { key: 'college', label: 'College / University', type: 'text', placeholder: 'e.g. University of Nairobi' },
      { key: 'profession', label: 'Profession', type: 'text', placeholder: 'e.g. Software Engineer' },
      { key: 'employmentType', label: 'Employment Type', type: 'text', placeholder: 'e.g. Employed, Self-employed' },
      { key: 'annualIncome', label: 'Annual Income', type: 'text', placeholder: 'e.g. KES 1.2M - 2M' },
    ],
  },
  {
    id: 'location',
    title: 'Location',
    fields: [
      { key: 'countryLiving', label: 'Country', type: 'text', placeholder: 'e.g. Kenya' },
      { key: 'cityLiving', label: 'City', type: 'text', placeholder: 'e.g. Nairobi' },
      { key: 'country', label: 'Country of Origin', type: 'text', placeholder: 'e.g. Kenya' },
      { key: 'state', label: 'State / Province', type: 'text', placeholder: 'e.g. Nairobi County' },
      { key: 'city', label: 'City of Origin', type: 'text', placeholder: 'e.g. Nairobi' },
      { key: 'address', label: 'Address', type: 'text', placeholder: 'e.g. 123 Main St' },
    ],
  },
  {
    id: 'faith',
    title: 'Faith & Church',
    fields: [
      { key: 'pastorName', label: 'Pastor Name', type: 'text', placeholder: 'e.g. Pastor James' },
      { key: 'churchArea', label: 'Church Area', type: 'text', placeholder: 'e.g. Westlands' },
      { key: 'churchCity', label: 'Church City', type: 'text', placeholder: 'e.g. Nairobi' },
      { key: 'spiritualInvolvement', label: 'Spiritual Involvement', type: 'text', placeholder: 'e.g. Choir, Sunday School' },
    ],
  },
  {
    id: 'partnerPrefs',
    title: 'Partner Preferences',
    fields: [
      { key: 'partnerPreferences.ageMin', label: 'Preferred Age Min', type: 'number', placeholder: 'e.g. 25' },
      { key: 'partnerPreferences.ageMax', label: 'Preferred Age Max', type: 'number', placeholder: 'e.g. 35' },
      { key: 'partnerPreferences.heightMin', label: 'Preferred Height Min', type: 'text', placeholder: "e.g. 5'2\"" },
      { key: 'partnerPreferences.heightMax', label: 'Preferred Height Max', type: 'text', placeholder: "e.g. 5'10\"" },
      { key: 'partnerPreferences.maritalStatus', label: 'Preferred Marital Status', type: 'text', placeholder: 'e.g. Never married' },
      { key: 'partnerPreferences.denominations', label: 'Preferred Denominations', type: 'text', placeholder: 'e.g. Catholic, SDA' },
      { key: 'partnerPreferences.motherTongue', label: 'Preferred Mother Tongue', type: 'text', placeholder: 'e.g. Kikuyu, Swahili' },
      { key: 'partnerPreferences.educationLevel', label: 'Preferred Education', type: 'text', placeholder: 'Graduate & above' },
      { key: 'partnerPreferences.employmentStatus', label: 'Preferred Employment', type: 'text', placeholder: 'e.g. Employed' },
      { key: 'partnerPreferences.country', label: 'Preferred Country', type: 'text', placeholder: 'e.g. Kenya' },
      { key: 'partnerPreferences.city', label: 'Preferred City', type: 'text', placeholder: 'e.g. Nairobi' },
      { key: 'partnerPreferences.dietaryHabits', label: 'Preferred Eating Habits', type: 'text', placeholder: 'e.g. Non-vegetarian' },
      { key: 'partnerPreferences.relocationPreference', label: 'Willing to Relocate', type: 'text', placeholder: 'e.g. Open to relocate' },
      { key: 'partnerPreferences.otherPreferences', label: 'Other Preferences', type: 'textarea', placeholder: 'Any other preferences...' },
    ],
  },
];

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ''), obj);
}

function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

const validateContactInfo = (text: string): string | null => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+?\d[\s.-]?){7,15}/g;
  if (emailRegex.test(text)) return "Email addresses are not allowed in the bio for security reasons.";
  if (phoneRegex.test(text.replace(/[\s.-]/g, ''))) return "Mobile numbers are not allowed in the bio for security reasons.";
  return null;
};

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSaved: (updatedProfile: any) => void;
}

export default function EditProfileModal({ isOpen, onClose, profile: initialProfile, onSaved }: EditProfileModalProps) {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeSection, setActiveSection] = useState('about');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialProfile) {
      const flat: Record<string, any> = {};
      EDITABLE_SECTIONS.forEach((section) => {
        section.fields.forEach((field) => {
          flat[field.key] = getNestedValue(initialProfile, field.key) || '';
        });
      });
      setFormData(flat);
      setError(null);
      setActiveSection('about');
    }
  }, [isOpen, initialProfile]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    // Validate aboutMe if it's being edited
    const aboutMeVal = formData['aboutMe']?.toString().trim() || '';
    if (aboutMeVal) {
      const validationError = validateContactInfo(aboutMeVal);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const updates: Record<string, any> = {};
      EDITABLE_SECTIONS.forEach((section) => {
        section.fields.forEach((field) => {
          const val = formData[field.key]?.toString().trim() || '';
          if (val) {
            const keys = field.key.split('.');
            if (keys.length === 2) {
              if (!updates[keys[0]]) updates[keys[0]] = { ...getNestedValue(initialProfile, keys[0]) };
              updates[keys[0]][keys[1]] = val;
            } else {
              updates[field.key] = val;
            }
          }
        });
      });
      updates.updatedAt = serverTimestamp();
      await updateDoc(doc(db, 'users', currentUser.uid), updates);

      // Sync church info to churches collection
      const churchName = (formData['churchName'] || initialProfile?.churchName || '').toString().trim();
      const churchCity = (formData['churchCity'] || initialProfile?.churchCity || '').toString().trim();
      const churchArea = (formData['churchArea'] || initialProfile?.churchArea || '').toString().trim();
      const pastorName = (formData['pastorName'] || initialProfile?.pastorName || '').toString().trim();
      const pastorNumber = (formData['pastorNumber'] || initialProfile?.pastorNumber || '').toString().trim();
      if (churchName) {
        try {
          const churchKey = [churchName, churchCity, churchArea, pastorName, pastorNumber]
            .map(s => s.toLowerCase().trim()).join('||');
          const churchDocId = churchKey.replace(/[^a-z0-9||]/g, '_').substring(0, 120);
          const churchRef = doc(db, 'churches', churchDocId);
          const churchSnap = await getDocs(query(collection(db, 'churches'), where('__name__', '==', churchDocId)));
          if (churchSnap.empty) {
            await setDoc(churchRef, {
              churchName, churchCity, churchArea, pastorName, pastorNumber,
              members: [currentUser.uid], createdAt: serverTimestamp(), updatedAt: serverTimestamp()
            });
          } else {
            await setDoc(churchRef, { members: arrayUnion(currentUser.uid), updatedAt: serverTimestamp() }, { merge: true });
          }
        } catch (churchErr) {
          console.warn('Church sync failed (non-blocking):', churchErr);
        }
      }
      const merged = { ...initialProfile };
      Object.entries(formData).forEach(([key, val]) => {
        if (val) setNestedValue(merged, key, val);
      });
      onSaved(merged);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const currentSection = EDITABLE_SECTIONS.find((s) => s.id === activeSection);
  const aboutMeLength = (formData['aboutMe'] || '').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#eee5d2]">
              <h2 className="font-headline text-xl font-semibold text-[#4a3521]">Edit Profile</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-[#faf4ea] transition-colors">
                <X className="w-5 h-5 text-[#8a7a65]" />
              </button>
            </div>

            <div className="shrink-0 flex gap-1 overflow-x-auto px-6 py-3 border-b border-[#f0ead9] bg-[#fdfaf5]">
              {EDITABLE_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors',
                    activeSection === section.id
                      ? 'bg-[#b3804c] text-white'
                      : 'text-[#8a7a65] hover:bg-[#f4eedf]'
                  )}
                >
                  {section.title}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-[12px] border border-[#f6d9d6] bg-[#fdf1f0] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#b3261e]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-px" /> {error}
                </div>
              )}

              {currentSection?.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[#a89f8d] mb-1">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <div className="relative">
                      <textarea
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={5}
                        maxLength={field.maxLength}
                        className="w-full rounded-[12px] border border-[#e2ddd2] bg-[#fffdf9] px-3.5 py-2.5 pb-9 text-[14px] font-medium text-[#4a3521] outline-none transition-shadow placeholder:text-[#c4b8a6] focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/15 resize-none"
                      />
                      {field.maxLength && (
                        <span className={cn(
                          'absolute bottom-3 right-4 text-[10.5px] font-bold tracking-[0.8px]',
                          aboutMeLength > field.maxLength - 120 ? 'text-[#b8860b]' : 'text-[#a89f8d]'
                        )}>
                          {aboutMeLength} / {field.maxLength}
                        </span>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-[12px] border border-[#e2ddd2] bg-[#fffdf9] px-3.5 py-2.5 text-[14px] font-medium text-[#4a3521] outline-none transition-shadow placeholder:text-[#c4b8a6] focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/15"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-[#eee5d2] bg-[#fdfaf5]">
              <button onClick={onClose} className="px-5 py-2.5 rounded-[12px] border-[1.5px] border-[#e5dcc9] bg-white text-[12.5px] font-bold text-[#8a7a65] transition-colors hover:border-[#d8cbb4] hover:text-[#4a3521]">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[12px] text-[12.5px] font-bold text-white shadow-[0_12px_28px_-12px_rgba(143,99,55,0.55)] transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #b3804c 0%, #96683a 100%)' }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
