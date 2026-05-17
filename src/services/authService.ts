import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface AuthResponse {
  user: User;
  isNewUser: boolean;
  status?: 'incomplete' | 'pending' | 'approved' | 'rejected';
  onboardingComplete?: boolean;
}

const checkUserStatus = async (user: User): Promise<{ isNewUser: boolean; status: 'incomplete' | 'pending' | 'approved' | 'rejected'; onboardingComplete: boolean }> => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // New Google user initialization
    const newUserProfile = {
      uid: user.uid,
      email: user.email,
      fullName: user.displayName || '',
      photoURL: user.photoURL || '',
      authProvider: 'google',
      role: 'user',
      approvalStatus: 'incomplete',
      onboardingComplete: false,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    };
    await setDoc(userRef, newUserProfile);
    return { isNewUser: true, status: 'incomplete', onboardingComplete: false };
  }

  const data = userDoc.data();

  // 1. Banned Check
  if (data.isBanned) {
    await signOut(auth);
    throw new Error("Your account has been permanently closed. Please contact support.");
  }

  // 2. Suspended Check
  if (data.isSuspended) {
    await signOut(auth);
    throw new Error("Your account has been suspended. Please contact support@kingdomalliance.com");
  }

  // 3. Rejected Check
  if (data.approvalStatus === 'rejected') {
    await signOut(auth);
    throw new Error("Your application was not approved. Please contact support.");
  }

  // Update last active
  await updateDoc(userRef, { lastActive: serverTimestamp() });

  return { 
    isNewUser: false, 
    status: data.approvalStatus as 'incomplete' | 'pending' | 'approved' | 'rejected',
    onboardingComplete: !!data.onboardingComplete
  };
};

export const signInWithGoogle = async (): Promise<AuthResponse> => {
  const result = await signInWithPopup(auth, googleProvider);
  const { isNewUser, status, onboardingComplete } = await checkUserStatus(result.user);
  return { user: result.user, isNewUser, status, onboardingComplete };
};

export const signInWithEmail = async (email: string, pass: string): Promise<AuthResponse> => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const { isNewUser, status, onboardingComplete } = await checkUserStatus(result.user);
  return { user: result.user, isNewUser, status, onboardingComplete };
};

export const registerWithEmail = async (email: string, pass: string, fullName: string): Promise<AuthResponse> => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  
  // Create profile immediately
  const userRef = doc(db, 'users', result.user.uid);
  await setDoc(userRef, {
    uid: result.user.uid,
    email: result.user.email,
    fullName,
    photoURL: '',
    authProvider: 'email',
    role: 'user',
    approvalStatus: 'incomplete',
    onboardingComplete: false,
    emailVerified: false,
    isSuspended: false,
    isBanned: false,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp()
  });

  await sendEmailVerification(result.user);
  return { user: result.user, isNewUser: true, status: 'incomplete', onboardingComplete: false };
};

export const logOut = async () => {
  await signOut(auth);
  window.location.href = window.location.origin;
};
