import * as admin from 'firebase-admin';

// Initialize Firebase Admin globally
admin.initializeApp();

// Export all Cloud Functions
export * from './pendingApprovalCheck';
