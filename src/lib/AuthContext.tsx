import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { auth, db, messaging, handleFirestoreError, OperationType } from './firebase';
import { calculateAge } from './utils';

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
  refreshProfile: async () => { },
  signIn: async () => { },
  signOut: async () => { },
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

  const registerFCMToken = async (uid: string) => {
    if (typeof window === 'undefined' || !('Notification' in window) || !messaging) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.warn("FCM VAPID key is missing in .env configurations.");
          return;
        }
        const token = await getToken(messaging, { vapidKey });
        if (token) {
          const userRef = doc(db, 'users', uid);
          await updateDoc(userRef, {
            fcmTokens: arrayUnion(token)
          });
          console.log("FCM device token registered successfully");
        }
      }
    } catch (err) {
      console.error("Error registering FCM token:", err);
    }
  };

  const fetchProfile = async (uid: string, email: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const idTokenResult = await user.getIdTokenResult();
      let isAdmin = !!idTokenResult.claims.admin;

      if (isAdmin) {
        try {
          const adminDoc = await withTimeout(getDoc(doc(db, 'admins', uid)));
          if (adminDoc.exists() && adminDoc.data()?.emailVerified !== true) {
            isAdmin = false;
          }
        } catch (e) {
          console.warn("Could not fetch admin details:", e);
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
        const age = calculateAge(data.dob, data.age);
        setProfile({ ...data, age });

        // Update login stats if lastLoginAt is blank, >40 days ago, or status is currently 'inactive'
        const lastLogin = data.lastLoginAt?.toDate?.() || (data.lastLoginAt ? new Date(data.lastLoginAt) : null);
        const daysDiff = lastLogin ? (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24) : 999;
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        if (!lastLogin || lastLogin < fiveMinutesAgo || data.status === 'inactive' || daysDiff > 40) {
          try {
            const userRef = doc(db, 'users', uid);
            const updates: any = {
              lastLoginAt: serverTimestamp()
            };
            if (data.status === 'inactive' || !data.status || daysDiff > 40) {
              updates.status = 'active';
            }
            await updateDoc(userRef, updates);
          } catch (err) {
            console.warn("Error updating user active status on login:", err);
          }
        }
        registerFCMToken(uid);
      } else {
        setProfile(null);
      }

      setIsAdmin(isAdmin);
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

  useEffect(() => {
    if (!user) return;

    // 10 minutes for admins, 15 minutes for standard users
    const timeoutDuration = isAdmin ? 10 * 60 * 1000 : 15 * 60 * 1000;
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        console.log("Session inactive. Auto logging out...");
        try {
          await signOutUser();
          alert("You have been logged out due to inactivity.");
        } catch (err) {
          console.error("Auto logout error:", err);
        }
      }, timeoutDuration);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleEvent = () => resetTimer();

    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [user, isAdmin]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user.email || "");
    }
  };

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signOutUser = async () => {
    await signOut(auth);
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
