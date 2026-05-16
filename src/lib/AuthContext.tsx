import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const withTimeout = <T,>(promise: Promise<T>, ms = 10000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout — database may not be set up yet')), ms)
      )
    ]);
  };

  const fetchProfile = async (uid: string, email: string) => {
    try {
      // Bootstrap first admin if email matches developer
      const allowedAdmins = ["md.imranabid@gmail.com", "admin@kingdomalliance.com", "gsmtp22@gmail.com"];
      if (email && allowedAdmins.includes(email)) {
        try {
          await withTimeout(setDoc(doc(db, 'admins', uid), { uid, email }, { merge: true }));
        } catch (e) {
          console.warn("Could not write admin doc (Firestore may not be ready):", e);
        }
      }

      let profileDoc;
      try {
        profileDoc = await withTimeout(getDoc(doc(db, 'users', uid)));
      } catch (e) {
        console.warn("Could not fetch user profile (Firestore may not be ready):", e);
      }

      if (profileDoc?.exists()) {
        const data = profileDoc.data();
        setProfile(data);
      } else {
        setProfile(null);
      }

      // Check if admin
      let adminDoc;
      try {
        adminDoc = await withTimeout(getDoc(doc(db, 'admins', uid)));
      } catch (e) {
        console.warn("Could not fetch admin doc (Firestore may not be ready):", e);
      }
      setIsAdmin(!!adminDoc?.exists());
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid, currentUser.email || "");
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user.email || "");
    }
  };

  const signIn = async (email: string, pass: string) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signOutUser = async () => {
    const { signOut: firebaseSignOut } = await import('firebase/auth');
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin, 
      refreshProfile,
      signIn,
      signOut: signOutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
