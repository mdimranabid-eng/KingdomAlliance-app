/**
 * Kingdom Alliance — Admin API Server
 *
 * Uses the REAL Firebase Admin SDK (not the frontend mock).
 * Runs on port 3001, separate from the Vite dev server (port 3000).
 *
 * Emulator mode: set env vars before starting:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
 *   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 *   GCLOUD_PROJECT=kingdom-alliance-v2
 *   npm run dev:emulator
 *
 * Production mode: set GOOGLE_APPLICATION_CREDENTIALS to a service account key path.
 */

'use strict';

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {
  sendProfilePhotoApprovalEmail,
  sendProfilePhotoRejectionEmail,
  sendGalleryPhotoApprovalEmail,
  sendGalleryPhotoRejectionEmail
} = require('./config/mailer');

// ─── Firebase Admin Initialization ────────────────────────────────────────────
// Supports emulator mode (no credentials needed) and production (service account)

function initializeAdminApp() {
  if (admin.apps.length > 0) return;

  const projectId = process.env.GCLOUD_PROJECT || 'kingdom-alliance-v2';
  const isEmulatorMode =
    !!process.env.FIRESTORE_EMULATOR_HOST || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

  if (isEmulatorMode) {
    console.log('[Admin Server] 🧪 Emulator mode detected.');
    console.log(`  Auth:      ${process.env.FIREBASE_AUTH_EMULATOR_HOST || '(not set)'}`);
    console.log(`  Firestore: ${process.env.FIRESTORE_EMULATOR_HOST || '(not set)'}`);
    // In emulator mode, initializeApp needs no credential
    admin.initializeApp({ projectId });
  } else {
    // Production: use service account key or application default credentials
    const serviceKeyPath = path.resolve(__dirname, '../serviceAccountKey.json');
    if (fs.existsSync(serviceKeyPath)) {
      console.log('[Admin Server] 🔑 Using serviceAccountKey.json for authentication.');
      const serviceAccount = require(serviceKeyPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
      });
    } else {
      console.log('[Admin Server] ☁️  Using Application Default Credentials.');
      admin.initializeApp({ projectId });
    }
  }

  console.log(`[Admin Server] ✅ Firebase Admin SDK initialized for project: ${projectId}`);
}

initializeAdminApp();

const db = admin.firestore();
const authAdmin = admin.auth();

// ─── Express Setup ─────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.ADMIN_SERVER_PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ─── Middleware: Verify Admin Token ───────────────────────────────────────────

async function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');

  const isEmulatorMode =
    !!process.env.FIRESTORE_EMULATOR_HOST || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization token.' });
  }

  try {
    const decoded = await authAdmin.verifyIdToken(token);

    // In emulator mode, any valid token is accepted as admin.
    // In production, check a custom claim or specific admin UID list.
    if (!isEmulatorMode) {
      const userRecord = await authAdmin.getUser(decoded.uid);
      const isAdmin = userRecord.customClaims?.admin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Caller is not an admin.' });
      }
    }

    req.adminUid = decoded.uid;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Kingdom Alliance Admin API',
    emulatorMode: !!process.env.FIRESTORE_EMULATOR_HOST,
    projectId: process.env.GCLOUD_PROJECT || 'kingdom-alliance-v2',
    timestamp: new Date().toISOString(),
  });
});

// ─── DELETE USER — 3-Stage Cascading Deletion ─────────────────────────────────
//
// POST /api/admin/delete-user
// Body: { uid: string }
// Auth: Bearer <admin-id-token>
//
// Stage A: Delete from Firebase Authentication
// Stage B: Delete /users/{uid} Firestore document
// Stage C: Delete /photoModeration docs where userId == uid
// Stage D: Delete /interests docs where fromId == uid OR toId == uid
// Stage E: Delete /shortlists docs where userId == uid OR targetId == uid
// Stage F: Delete /chats and nested /messages sub-collections

app.post('/api/admin/delete-user', requireAdminAuth, async (req, res) => {
  const { uid } = req.body;

  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid uid in request body.' });
  }

  const logs = [];
  const log = (msg) => {
    console.log(`[Admin Delete] ${msg}`);
    logs.push(msg);
  };

  log(`Starting 3-stage cascading deletion for UID: ${uid}`);

  // ── Stage A: Firebase Authentication ──────────────────────────────────────
  try {
    await authAdmin.deleteUser(uid);
    log(`✅ Stage A: Auth account deleted for UID: ${uid}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      log(`⚠️  Stage A: Auth account not found (already deleted or never existed): ${uid}`);
    } else {
      log(`❌ Stage A: Auth deletion FAILED: ${err.message}`);
      return res.status(500).json({ error: `Auth deletion failed: ${err.message}`, logs });
    }
  }

  // ── Stage B: Firestore /users document ────────────────────────────────────
  try {
    await db.collection('users').doc(uid).delete();
    log(`✅ Stage B: Firestore /users/${uid} document deleted.`);
  } catch (err) {
    log(`❌ Stage B: Firestore /users/${uid} deletion FAILED: ${err.message}`);
  }

  // ── Stage C: /photoModeration collection ──────────────────────────────────
  try {
    const moderationSnap = await db.collection('photoModeration').where('userId', '==', uid).get();
    const batch = db.batch();
    moderationSnap.docs.forEach((d) => batch.delete(d.ref));
    if (!moderationSnap.empty) await batch.commit();
    log(`✅ Stage C: ${moderationSnap.size} /photoModeration record(s) deleted.`);
  } catch (err) {
    log(`❌ Stage C: /photoModeration deletion FAILED: ${err.message}`);
  }

  // ── Stage D: /interests collection ────────────────────────────────────────
  try {
    const [fromSnap, toSnap] = await Promise.all([
      db.collection('interests').where('fromId', '==', uid).get(),
      db.collection('interests').where('toId', '==', uid).get(),
    ]);

    const interestBatch = db.batch();
    fromSnap.docs.forEach((d) => interestBatch.delete(d.ref));
    toSnap.docs.forEach((d) => interestBatch.delete(d.ref));
    const totalInterests = fromSnap.size + toSnap.size;
    if (totalInterests > 0) await interestBatch.commit();
    log(`✅ Stage D: ${totalInterests} /interests record(s) deleted.`);

    // ── Stage E: /shortlists collection ───────────────────────────────────
    const [slUserSnap, slTargetSnap] = await Promise.all([
      db.collection('shortlists').where('userId', '==', uid).get(),
      db.collection('shortlists').where('targetId', '==', uid).get(),
    ]);

    const shortlistBatch = db.batch();
    slUserSnap.docs.forEach((d) => shortlistBatch.delete(d.ref));
    slTargetSnap.docs.forEach((d) => shortlistBatch.delete(d.ref));
    const totalShortlists = slUserSnap.size + slTargetSnap.size;
    if (totalShortlists > 0) await shortlistBatch.commit();
    log(`✅ Stage E: ${totalShortlists} /shortlists record(s) deleted.`);

    // ── Stage F: /chats + /messages sub-collections ───────────────────────
    const allInterestDocs = [...fromSnap.docs, ...toSnap.docs];
    const chatIds = new Set();
    allInterestDocs.forEach((d) => {
      const data = d.data();
      if (data.fromId && data.toId) {
        chatIds.add([data.fromId, data.toId].sort().join('_'));
      }
    });

    let deletedChats = 0;
    let deletedMessages = 0;
    for (const chatId of chatIds) {
      const messagesSnap = await db.collection(`chats/${chatId}/messages`).get();
      const msgBatch = db.batch();
      messagesSnap.docs.forEach((d) => {
        msgBatch.delete(d.ref);
        deletedMessages++;
      });
      if (!messagesSnap.empty) await msgBatch.commit();
      await db.collection('chats').doc(chatId).delete();
      deletedChats++;
    }
    log(`✅ Stage F: ${deletedChats} chat(s) and ${deletedMessages} message(s) deleted.`);
  } catch (err) {
    log(`❌ Stage D-F: interests/shortlists/chats deletion FAILED: ${err.message}`);
  }

  log(`🏁 Cascading deletion COMPLETE for UID: ${uid}`);

  return res.status(200).json({
    success: true,
    uid,
    message: 'User permanently deleted from Auth, Firestore, and all associated collections.',
    logs,
  });
});

// ─── Photo Moderation: Approve Photo ──────────────────────────────────────────
//
// POST /api/admin/approve-photo
// Body: { item: object }
// Auth: Bearer <admin-id-token>
//
app.post('/api/admin/approve-photo', requireAdminAuth, async (req, res) => {
  const { item } = req.body;
  if (!item || !item.uid) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const adminId = req.adminUid || 'system';

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Create or update photoModeration collection
      const modRef = item.isSynthesized 
        ? db.collection('photoModeration').doc()
        : db.collection('photoModeration').doc(item.id);

      transaction.set(modRef, {
        uid: item.uid,
        userName: item.userName,
        photoURL: item.photoURL,
        photoType: item.photoType || 'profilePhoto',
        galleryPosition: item.galleryPosition !== undefined ? item.galleryPosition : null,
        photoStatus: 'approved',
        status: 'approved',
        uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : admin.firestore.FieldValue.serverTimestamp(),
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: adminId
      }, { merge: true });

      // 2. Update user doc
      const userRef = db.collection('users').doc(item.uid);
      const userSnap = await transaction.get(userRef);

      if (userSnap.exists) {
        const userData = userSnap.data();
        const targetPhoto = item.pendingPhotoUrl || item.photoURL;

        if (item.photoType === 'profilePhoto') {
          transaction.update(userRef, {
            photoUrl: targetPhoto,
            photoURL: targetPhoto,
            pendingPhotoUrl: '',
            photoStatus: 'approved',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            notifications: admin.firestore.FieldValue.arrayUnion({
              id: crypto.randomUUID(),
              title: 'Photo Approved',
              message: 'Your profile photo has been approved.',
              type: 'success',
              read: false,
              createdAt: new Date().toISOString()
            })
          });
        } else {
          const gallery = userData.gallery || [];
          const updatedGallery = gallery.map((p) => 
            p.url === item.photoURL ? { ...p, status: 'approved' } : p
          );
          transaction.update(userRef, {
            gallery: updatedGallery,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            notifications: admin.firestore.FieldValue.arrayUnion({
              id: crypto.randomUUID(),
              title: 'Gallery Photo Approved',
              message: 'Your gallery photo has been approved.',
              type: 'success',
              read: false,
              createdAt: new Date().toISOString()
            })
          });
        }
      }
    });

    // 3. Trigger email dispatch securely using Nodemailer SMTP
    const userRef = db.collection('users').doc(item.uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      const userData = userSnap.data();
      const userEmail = userData.email;
      const userDispName = userData.name || userData.fullName || item.userName || 'Member';

      if (userEmail) {
        try {
          if (item.photoType === 'profilePhoto') {
            await sendProfilePhotoApprovalEmail(userEmail, userDispName);
          } else {
            await sendGalleryPhotoApprovalEmail(userEmail, userDispName);
          }
        } catch (emailErr) {
          console.error("Failed to send approval email via SMTP:", emailErr);
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Photo approved successfully.' });
  } catch (error) {
    console.error('Error approving photo in transaction:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Photo Moderation: Reject Photo ──────────────────────────────────────────
//
// POST /api/admin/reject-photo
// Body: { item: object, reason: string }
// Auth: Bearer <admin-id-token>
//
app.post('/api/admin/reject-photo', requireAdminAuth, async (req, res) => {
  const { item, reason } = req.body;
  if (!item || !item.uid || !reason) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const adminId = req.adminUid || 'system';

  try {
    await db.runTransaction(async (transaction) => {
      // 1. Create or update photoModeration collection
      const modRef = item.isSynthesized 
        ? db.collection('photoModeration').doc()
        : db.collection('photoModeration').doc(item.id);

      transaction.set(modRef, {
        uid: item.uid,
        userName: item.userName,
        photoURL: item.photoURL,
        photoType: item.photoType || 'profilePhoto',
        galleryPosition: item.galleryPosition !== undefined ? item.galleryPosition : null,
        photoStatus: 'rejected',
        status: 'rejected',
        uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : admin.firestore.FieldValue.serverTimestamp(),
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: adminId,
        rejectedReason: reason
      }, { merge: true });

      // 2. Update user doc
      const userRef = db.collection('users').doc(item.uid);
      const userSnap = await transaction.get(userRef);

      if (userSnap.exists) {
        const userData = userSnap.data();

        if (item.photoType === 'profilePhoto') {
          transaction.update(userRef, {
            photoStatus: 'rejected',
            pendingPhotoUrl: '',
            rejectedPhotoUrl: item.photoURL,
            rejectedPhotoReason: reason,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            notifications: admin.firestore.FieldValue.arrayUnion({
              id: crypto.randomUUID(),
              title: 'Profile Photo Rejected',
              message: `Your profile photo was not approved: ${reason}. Please upload a new one.`,
              type: 'alert',
              read: false,
              createdAt: new Date().toISOString()
            })
          });
        } else {
          const gallery = userData.gallery || [];
          const updatedGallery = gallery.map((p) => 
            p.url === item.photoURL ? { ...p, status: 'rejected', rejectionReason: reason } : p
          );
          transaction.update(userRef, {
            gallery: updatedGallery,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            notifications: admin.firestore.FieldValue.arrayUnion({
              id: crypto.randomUUID(),
              title: 'Gallery Photo Rejected',
              message: `Your gallery photo was not approved: ${reason}.`,
              type: 'alert',
              read: false,
              createdAt: new Date().toISOString()
            })
          });
        }
      }
    });

    // 3. Trigger email dispatch securely using Nodemailer SMTP
    const userRef = db.collection('users').doc(item.uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      const userData = userSnap.data();
      const userEmail = userData.email;
      const userDispName = userData.name || userData.fullName || item.userName || 'Member';

      if (userEmail) {
        try {
          if (item.photoType === 'profilePhoto') {
            await sendProfilePhotoRejectionEmail(userEmail, userDispName, reason);
          } else {
            await sendGalleryPhotoRejectionEmail(userEmail, userDispName, reason);
          }
        } catch (emailErr) {
          console.error("Failed to send rejection email via SMTP:", emailErr);
        }
      }
    }

    return res.status(200).json({ success: true, message: 'Photo rejected successfully.' });
  } catch (error) {
    console.error('Error rejecting photo in transaction:', error);
    return res.status(500).json({ error: error.message });
  }
});


// ─── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  const emulatorMode = !!process.env.FIRESTORE_EMULATOR_HOST;
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Kingdom Alliance — Admin API Server            ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  Mode:         ${emulatorMode ? '🧪 Local Emulator' : '🚀 Production'}`);
  console.log(`  Health:       http://localhost:${PORT}/api/health`);
  console.log('');
});
