import * as admin from 'firebase-admin';

// Initialize Firebase Admin globally first
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Export all Cloud Functions
export * from './pendingApprovalCheck';
export * from './userNotifications';
export * from './api';
