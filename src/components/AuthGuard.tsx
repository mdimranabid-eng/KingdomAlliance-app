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

    // Real-time listener for user profile
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  if (loading || (user && !profile)) {
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

  const isOnboardingPath = location.pathname === '/onboarding';

  if (profile) {
    // 1. Strict Email Verification Check (Email Auth Users)
    if (profile.authProvider === 'email' && !profile.emailVerified) {
      return <Navigate to="/register" replace />;
    }

    // 2. Global Status Checks
    if (profile.isBanned) return <Navigate to="/banned" replace />;
    if (profile.isSuspended) return <Navigate to="/suspended" replace />;
    if (profile.approvalStatus === 'rejected') return <Navigate to="/rejected" replace />;

    // Route-specific logic
    if (isOnboardingPath) {
      if (profile.onboardingComplete) {
        if (profile.approvalStatus === 'approved') {
          return <Navigate to="/dashboard" replace />;
        }
        if (profile.approvalStatus === 'pending') {
          return <Navigate to="/pending-approval" replace />;
        }
      }
      // Otherwise allow access to onboarding
      return <>{children}</>;
    }

    // Protection for all other routes
    if (!profile.onboardingComplete || profile.approvalStatus === 'incomplete') {
      return <Navigate to="/onboarding" replace />;
    }

    if (profile.approvalStatus === 'pending') {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  return <>{children}</>;
};
