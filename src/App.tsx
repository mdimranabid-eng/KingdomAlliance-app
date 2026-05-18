/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import ShortlistsPage from './pages/ShortlistsPage';
import InterestsPage from './pages/InterestsPage';
import OnboardingPage from './pages/OnboardingPage';

// Status Pages
import PendingApprovalPage from './pages/status/PendingApprovalPage';
import SuspendedPage from './pages/status/SuspendedPage';
import BannedPage from './pages/status/BannedPage';
import RejectedPage from './pages/status/RejectedPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminPhotos from './pages/admin/AdminPhotos';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import RejectedProfilesPage from './pages/admin/RejectedProfilesPage';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" />;

  return <>{children}</>;
};

const ProfileRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={user ? `/profile/${user.uid}` : '/login'} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Status Routes (Publicly accessible but usually redirected to) */}
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/waiting-room" element={<PendingApprovalPage />} />
          <Route path="/suspended" element={<SuspendedPage />} />
          <Route path="/banned" element={<BannedPage />} />
          <Route path="/rejected" element={<RejectedPage />} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* Protected Routes */}
          <Route element={<AuthGuard><Layout /></AuthGuard>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:id" element={<MessagesPage />} />
            <Route path="/shortlist" element={<ShortlistsPage />} />
            <Route path="/interests" element={<InterestsPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfileRedirect />} />
          </Route>

          {/* Onboarding Protected Route (Independent from Sidebar/Header Layout) */}
          <Route path="/onboarding" element={<AuthGuard><OnboardingPage /></AuthGuard>} />

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute><Layout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/approvals" element={<AdminApprovals />} />
            <Route path="/admin/photos" element={<AdminPhotos />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/rejected" element={<RejectedProfilesPage />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
