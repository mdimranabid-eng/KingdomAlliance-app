import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from './firebase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function formatAuthError(err: any): string {
  const code = err?.code || '';
  
  if (code === 'auth/email-already-in-use') {
    return "This email is already registered. Please sign in instead.";
  }
  if (code === 'auth/weak-password') {
    return "Password is too weak. Please use at least 6 characters with numbers/symbols.";
  }
  if (code === 'auth/network-request-failed') {
    return "Network error. Please check your internet connection.";
  }

  // List of codes that should return "Invalid Credential" for security obfuscation
  const securityCodes = [
    'auth/invalid-credential',
    'auth/wrong-password',
    'auth/user-not-found',
    'auth/invalid-email',
    'auth/internal-error'
  ];

  if (securityCodes.some(c => code.includes(c))) {
    return "Invalid Credential";
  }

  if (code.includes('auth/too-many-requests')) {
    return "Too many attempts. Please try again later.";
  }

  return "An unexpected error occurred. Please try again.";
}

export function calculateMatchScore(me: any, other: any) {
  if (!me || !other) return 0;
  let score = 0;

  // 1. Denomination match: 25 points
  if (other.denomination === me.denomination) {
    score += 25;
  }

  // 2. Location match (same city/state): 20 points
  if (other.location && me.location) {
    const myLoc = me.location.toLowerCase();
    const otherLoc = other.location.toLowerCase();
    if (myLoc === otherLoc || myLoc.includes(otherLoc) || otherLoc.includes(myLoc)) {
      score += 20;
    }
  }

  // 3. Age within preferred range: 20 points
  const ageMin = me.partnerPreferences?.ageMin || 18;
  const ageMax = me.partnerPreferences?.ageMax || 100;
  if (other.age >= ageMin && other.age <= ageMax) {
    score += 20;
  }

  // 4. Education level compatible: 15 points
  if (other.educationLevel && me.educationLevel && other.educationLevel === me.educationLevel) {
    score += 15;
  }

  // 5. Lifestyle preferences match: 10 points
  let lifestyleScore = 0;
  if (me.lifestyle && other.lifestyle) {
    if (me.lifestyle.smoking === other.lifestyle.smoking) lifestyleScore += 5;
    if (me.lifestyle.drinking === other.lifestyle.drinking) lifestyleScore += 5;
  }
  score += lifestyleScore;

  // 6. Height within preferred range: 10 points
  const heightMin = me.partnerPreferences?.heightMin || 0;
  const heightMax = me.partnerPreferences?.heightMax || 300;
  if (other.height >= heightMin && other.height <= heightMax) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function formatRelativeTime(date: any): string {
  if (!date) return 'some time ago';
  
  let targetDate: Date;
  
  if (date.toDate) {
    targetDate = date.toDate();
  } else if (date instanceof Date) {
    targetDate = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    targetDate = new Date(date);
  } else {
    return 'some time ago';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  
  return targetDate.toLocaleDateString();
}

export function resolveApprovalStatus(data: any): 'incomplete' | 'pending' | 'approved' | 'rejected' | 'banned' | 'suspended' | 'not_approved' {
  const rawApproval = data?.approvalStatus || '';
  const rawStatus = data?.status || '';
  
  // Normalize inputs
  const check = (rawApproval || rawStatus).toLowerCase();
  
  // Strictly validate against valid administrative states
  if (['pending', 'approved', 'rejected', 'banned', 'suspended', 'not_approved'].includes(check)) {
    return check as any;
  }
  
  return 'incomplete'; // Default safe fallback
}

export function parseFirestoreDate(field: any): Date | null {
  if (!field) return null;
  if (typeof field.toDate === 'function') return field.toDate();
  if (field.seconds !== undefined) return new Date(field.seconds * 1000);
  if (field._seconds !== undefined) return new Date(field._seconds * 1000);
  const date = new Date(field);
  return isNaN(date.getTime()) ? null : date;
}


