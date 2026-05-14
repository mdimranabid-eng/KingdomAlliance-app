/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
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
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminPhotos from './pages/admin/AdminPhotos';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLoginPage from './pages/admin/AdminLoginPage';

const PrivateRoute = ({ children, requireApproval = true }: { children: React.ReactNode, requireApproval?: boolean }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Block suspended or blocked users from accessing private routes
  if (profile && (profile.status === 'suspended' || profile.status === 'blocked')) {
    return <Navigate to="/login?error=account_restricted" />;
  }
  
  if (requireApproval && profile && !profile.isApproved) {
    return <Navigate to="/dashboard" />; // Show dashboard which should handle pending state
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<PrivateRoute requireApproval={false}><DashboardPage /></PrivateRoute>} />
            <Route path="/matches" element={<PrivateRoute><MatchesPage /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
            <Route path="/messages/:id" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
            <Route path="/shortlist" element={<PrivateRoute><ShortlistsPage /></PrivateRoute>} />
            <Route path="/interests" element={<PrivateRoute><InterestsPage /></PrivateRoute>} />
            <Route path="/profile/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/approvals" element={<AdminRoute><AdminApprovals /></AdminRoute>} />
            <Route path="/admin/photos" element={<AdminRoute><AdminPhotos /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUserManagement /></AdminRoute>} />
            <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
