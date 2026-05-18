import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XCircle, 
  Download, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Info, 
  Church, 
  Users, 
  Activity, 
  Quote, 
  Heart,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { generateBiodataPDF } from '../../lib/BiodataGenerator';

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  middleName?: string;
  lastName?: string;
  email: string;
  profileType: 'bride' | 'groom';
  status: 'active' | 'suspended' | 'blocked';
  isApproved: boolean;
  mobileNumber?: string;
  createdAt: any;
  photoUrl?: string;
  photoStatus?: 'pending' | 'approved' | 'rejected' | 'none';
  pendingPhotoUrl?: string;
  gallery?: any[];
  
  // Detailed Fields
  age?: string;
  dob?: string;
  gender?: string;
  citizenship?: string;
  countryLiving?: string;
  cityLiving?: string;
  maritalStatus?: string;
  noOfChildren?: string;
  height?: string;
  weight?: string;
  bodyType?: string;
  complexion?: string;
  physicalStatus?: string;
  physicalStatusDesc?: string;
  
  // Faith
  denomination?: string;
  faithBackground?: string;
  churchName?: string;
  churchAddress?: string;
  diocese?: string;
  baptized?: string;
  baptismYear?: string;
  spiritualInvolvement?: string[];
  spiritualGifts?: string;
  
  // Education & Professional
  education?: string;
  fieldOfStudy?: string;
  college?: string;
  profession?: string;
  employmentType?: string;
  annualIncome?: string;
  
  // Family Background
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  noOfSiblings?: string;
  fathersName?: string;
  fathersOccupation?: string;
  mothersName?: string;
  mothersOccupation?: string;
  numberOfSiblings?: string;
  familyType?: string;
  familyFaith?: string;

  // Lifestyle & Hobbies
  motherTongue?: string | string[];
  languagesKnown?: string[];
  dietaryHabits?: string;
  drinkingHabits?: string;
  smokingHabits?: string;
  hobbies?: string[];
  
  // Contact
  address?: string;
  aboutMe?: string;
  testimony?: string;
  
  partnerPreferences?: {
    ageMin: string;
    ageMax: string;
    heightMin?: string;
    heightMax?: string;
    maritalStatus: string[];
    denominations: string[];
    motherTongue?: string[];
    educationLevel: string;
    employmentStatus?: string;
    dietaryHabits?: string;
    drinkingHabits?: string;
    smokingHabits?: string;
    country?: string;
    city?: string;
    relocationPreference?: string;
  };
}

interface AdminUserDetailModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onUpdateStatus?: (userId: string, status: UserProfile['status']) => Promise<void> | void;
  onDelete?: () => void;
  actions?: React.ReactNode;
}

export default function AdminUserDetailModal({
  user,
  onClose,
  onUpdateStatus,
  onDelete,
  actions
}: AdminUserDetailModalProps) {
  if (!user) return null;

  const displayPhoto = user.pendingPhotoUrl || user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative w-full max-w-2xl max-h-[90vh] bg-surface-container-lowest rounded-[2.5rem] shadow-2xl border border-outline-variant flex flex-col overflow-hidden"
        >
          {/* Sticky Header with Action Button */}
          <div className="sticky top-0 z-20 bg-surface-container-lowest p-8 pb-4 border-b border-outline-variant/50 backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full border-2 border-primary overflow-hidden relative flex-shrink-0">
                  <img src={displayPhoto} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-headline text-3xl text-on-surface">{user.name} {user.lastName || ''}</h2>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <span className="text-sm text-on-surface-variant flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-surface-variant rounded-md border border-outline-variant text-[10px] font-bold uppercase tracking-wider">
                        {user.profileType}
                      </span>
                      {user.gender} • {user.age} Years
                      {user.pendingPhotoUrl && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Pending Photo Verification
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button 
                  onClick={() => generateBiodataPDF(user)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-xl text-sm font-bold hover:bg-gold/20 transition-all shadow-sm whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant flex-shrink-0">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto flex-1 p-8 pt-4 space-y-8">

            {/* Admin-only Privileged Section */}
            <div className="p-8 bg-primary/[0.03] rounded-[2.5rem] border-2 border-primary/10 shadow-sm space-y-6 w-full box-border overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold uppercase tracking-[0.2em] text-[10px]">Admin-only Confidential Details</h3>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-tighter">Secure View</span>
              </div>
              
              <div className="flex flex-col w-full">
                {/* Email Row */}
                <div className="flex items-start gap-4 pb-[10px] border-b border-primary/5">
                  <p className="flex-[0_0_auto] min-w-[140px] text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest pt-2">Email Address</p>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-lg flex items-center gap-3 whitespace-normal break-words overflow-wrap-break-word">
                      <Mail className="w-5 h-5 text-primary/60 flex-shrink-0" /> 
                      <span className="break-all">{user.email}</span>
                    </p>
                  </div>
                </div>

                {/* Mobile Row */}
                <div className="flex items-start gap-4 py-[10px] border-b border-primary/5">
                  <p className="flex-[0_0_auto] min-w-[140px] text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest pt-2">Verified Mobile</p>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-lg flex items-center gap-3 whitespace-normal break-words overflow-wrap-break-word">
                      <Phone className="w-5 h-5 text-primary/60 flex-shrink-0" /> 
                      <span>{user.mobileNumber || 'Not Provided'}</span>
                    </p>
                  </div>
                </div>

                {/* Address Row */}
                {user.address && (
                  <div className="flex items-start gap-4 pt-[10px]">
                    <p className="flex-[0_0_auto] min-w-[140px] text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest pt-1">Residential Address</p>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-on-surface leading-relaxed whitespace-normal break-words overflow-wrap-break-word">
                        {user.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Basic & Personal */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Personal Details</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <DetailItem label="Full Name" value={`${user.name} ${user.middleName || ''} ${user.lastName || ''}`} colSpan={2} />
                  <DetailItem label="Age" value={user.age ? `${user.age} Years` : null} />
                  <DetailItem label="DOB" value={user.dob} />
                  <DetailItem label="Gender" value={user.gender} />
                  <DetailItem label="Marital Status" value={user.maritalStatus} />
                  <DetailItem label="Height" value={user.height} />
                  <DetailItem label="Weight" value={user.weight ? `${user.weight} kg` : 'N/A'} />
                  <DetailItem label="Body Type" value={user.bodyType} />
                  <DetailItem label="Complexion" value={user.complexion} />
                  <DetailItem label="Physical Status" value={user.physicalStatus} colSpan={2} />
                  {user.physicalStatusDesc && <DetailItem label="Disability Info" value={user.physicalStatusDesc} colSpan={2} />}
                  <DetailItem label="Mother Tongue" value={Array.isArray(user.motherTongue) ? user.motherTongue.join(', ') : user.motherTongue} />
                  <DetailItem label="Citizenship" value={user.citizenship} />
                </div>
              </div>

              {/* Faith */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Church className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Faith Background</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <DetailItem label="Denomination" value={user.denomination} />
                  <DetailItem label="Baptized" value={user.baptized} />
                  <DetailItem label="Church" value={user.churchName} colSpan={2} />
                  <DetailItem label="Diocese" value={user.diocese} colSpan={2} />
                  <DetailItem label="Spiritual Involvement" value={user.spiritualInvolvement?.join(', ') || 'None'} colSpan={2} />
                  <DetailItem label="Spiritual Gifts" value={user.spiritualGifts} colSpan={2} />
                  <DetailItem label="Faith Background" value={user.faithBackground} colSpan={2} />
                </div>
              </div>

              {/* Family Details */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Family Background</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <DetailItem label="Father's Name" value={user.fathersName || user.fatherName} />
                  <DetailItem label="Father's Job" value={user.fathersOccupation || user.fatherOccupation} />
                  <DetailItem label="Mother's Name" value={user.mothersName || user.motherName} />
                  <DetailItem label="Mother's Job" value={user.mothersOccupation || user.motherOccupation} />
                  <DetailItem label="Siblings" value={user.numberOfSiblings || user.noOfSiblings} />
                  <DetailItem label="Family Type" value={user.familyType} />
                  <DetailItem label="Family Faith" value={user.familyFaith} colSpan={2} />
                </div>
              </div>

              {/* Lifestyle & Hobbies */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Lifestyle & Hobbies</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <DetailItem label="Dietary Habits" value={user.dietaryHabits} />
                  <DetailItem label="Drinking" value={user.drinkingHabits} />
                  <DetailItem label="Smoking" value={user.smokingHabits} />
                  <DetailItem label="Languages" value={user.languagesKnown?.join(', ') || 'N/A'} />
                  <DetailItem label="Hobbies / Interests" value={user.hobbies?.join(', ') || 'None'} colSpan={2} />
                </div>
              </div>

              {/* About & Summary */}
              <div className="col-span-full space-y-5">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Quote className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">About Me</h4>
                </div>
                <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant italic text-on-surface-variant leading-relaxed">
                  {user.aboutMe || 'No description provided.'}
                </div>
              </div>

              {/* Testimony / Church & Faith (For Approvals page support) */}
              {user.testimony && (
                <div className="col-span-full space-y-5">
                  <div className="flex items-center gap-2 text-primary">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Church className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm uppercase tracking-wider">Testimony</h4>
                  </div>
                  <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant italic text-on-surface-variant leading-relaxed">
                    {user.testimony}
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div className="col-span-full space-y-5">
                <div className="flex items-center gap-2 text-secondary">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">Partner Preferences</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-secondary/5 rounded-3xl border border-secondary/20">
                  <DetailItem label="Age Range" value={user.partnerPreferences?.ageMin ? `${user.partnerPreferences?.ageMin} - ${user.partnerPreferences?.ageMax} Years` : null} />
                  <DetailItem label="Height Range" value={user.partnerPreferences?.heightMin ? `${user.partnerPreferences?.heightMin} - ${user.partnerPreferences?.heightMax} ft` : null} />
                  <DetailItem label="Marital Status" value={user.partnerPreferences?.maritalStatus?.join(', ') || 'Any'} />
                  <DetailItem label="Denominations" value={user.partnerPreferences?.denominations?.join(', ') || 'Any'} />
                  <DetailItem label="Education" value={user.partnerPreferences?.educationLevel || 'Any'} />
                  <DetailItem label="Employment" value={user.partnerPreferences?.employmentStatus || 'Any'} />
                  <DetailItem label="Location" value={user.partnerPreferences?.city || user.partnerPreferences?.country ? `${user.partnerPreferences?.city || 'Any City'}, ${user.partnerPreferences?.country || 'Any Country'}` : 'Any'} />
                  <DetailItem label="Relocation" value={user.partnerPreferences?.relocationPreference || 'Any'} />
                  <DetailItem label="Diet/Drink/Smoke" value={user.partnerPreferences ? `${user.partnerPreferences?.dietaryHabits || 'Any'} / ${user.partnerPreferences?.drinkingHabits || 'Any'} / ${user.partnerPreferences?.smokingHabits || 'Any'}` : 'Any'} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
                <p className="font-bold text-on-surface flex items-center gap-2">
                   <span className={cn("w-2 h-2 rounded-full", user.status === 'active' ? "bg-green-500" : "bg-error")} />
                   {user.status ? user.status.toUpperCase() : 'UNKNOWN'}
                </p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Approval</p>
                <p className="font-bold text-on-surface">
                  {user.isApproved ? "APPROVED ✅" : "PENDING ⏳"}
                </p>
              </div>
            </div>

            {/* Render actions prop if provided, else default administrative actions */}
            {actions ? (
              <div className="space-y-4">
                <h4 className="font-bold text-on-surface">Administrative Actions</h4>
                {actions}
              </div>
            ) : (
              (onUpdateStatus || onDelete) && (
                <div className="space-y-4">
                  <h4 className="font-bold text-on-surface">Administrative Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    {onUpdateStatus && (
                      <button 
                        onClick={() => onUpdateStatus(user.id, 'suspended')}
                        disabled={user.status === 'suspended'}
                        className="px-6 py-2 border border-outline-variant rounded-xl text-sm font-bold hover:bg-surface-variant transition-colors disabled:opacity-50"
                      >
                        Suspend Account
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={onDelete}
                        className="px-6 py-2 border border-error text-error rounded-xl text-sm font-bold hover:bg-error/5 transition-colors"
                      >
                        Delete User
                      </button>
                    )}
                    {onUpdateStatus && (
                      <button 
                         onClick={() => onUpdateStatus(user.id, 'active')}
                         disabled={user.status === 'active'}
                         className="px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        Activate / Unban
                      </button>
                    )}
                  </div>
                </div>
              )
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DetailItem({ label, value, colSpan = 1 }: { label: string, value: any, colSpan?: number }) {
  if (!value) return null;
  const spanClass = colSpan === 2 ? "col-span-2" : colSpan === 3 ? "col-span-1 md:col-span-3" : "";
  return (
    <div className={cn("space-y-1", spanClass)}>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
      <p className="font-medium text-on-surface text-sm">{value}</p>
    </div>
  );
}
