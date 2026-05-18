import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { KingdomCrossIcon } from './KingdomCrossIcon';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    let profileLoaded = false;
    let adminLoaded = false;

    const checkLoading = () => {
      if (profileLoaded && adminLoaded) {
        setLoading(false);
      }
    };

    // Real-time listener for user profile
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile(null);
      }
      profileLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Error fetching profile:", error);
      profileLoaded = true;
      checkLoading();
    });

    // Real-time listener for admin status
    const unsubscribeAdmin = onSnapshot(doc(db, 'admins', user.uid), (docSnap) => {
      setIsAdmin(docSnap.exists());
      adminLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Error fetching admin status:", error);
      adminLoaded = true;
      checkLoading();
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAdmin();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#f9f9f6] flex flex-col items-center justify-center z-50">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <KingdomCrossIcon size="sm" />
          </div>
        </div>
        <h2 className="mt-6 font-headline text-2xl text-[#040e2a] animate-pulse">Kingdom Alliance</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Administrators bypass all standard user matrimonial flow redirections
  if (isAdmin) {
    return <>{children}</>;
  }

  // Redirect standard users without a profile to onboarding
  if (!profile) {
    if (location.pathname === '/onboarding') {
      return <>{children}</>;
    }
    return <Navigate to="/onboarding" replace />;
  }

  // 1. Strict Email Verification Check (Email Auth Users)
  if (profile.authProvider === 'email' && !profile.emailVerified) {
    return <Navigate to="/register" replace />;
  }

  const status = (profile.status || profile.approvalStatus || '').toLowerCase();

  // 2. Global Status Checks
  if (status === 'banned' || profile.isBanned) return <Navigate to="/banned" replace />;
  if (status === 'suspended' || profile.isSuspended) return <Navigate to="/suspended" replace />;
  if (status === 'rejected') return <Navigate to="/rejected" replace />;

  const isOnboardingPath = location.pathname === '/onboarding';

  // Route-specific logic
  if (isOnboardingPath) {
    if (profile.onboardingComplete) {
      if (status === 'approved') {
        return <Navigate to="/dashboard" replace />;
      }
      if (status === 'not_approved' || status === 'pending') {
        return <Navigate to="/waiting-room" replace />;
      }
    }
    // Otherwise allow access to onboarding
    return <>{children}</>;
  }

  // Protection for all other routes
  if (!profile.onboardingComplete || status === 'incomplete') {
    return <Navigate to="/onboarding" replace />;
  }

  if (status === 'not_approved' || status === 'pending') {
    return <Navigate to="/waiting-room" replace />;
  }

  return <>{children}</>;
};
