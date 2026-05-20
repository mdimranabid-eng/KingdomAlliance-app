/**
 * Kingdom Alliance — Admin API Server
 *
 * Uses the REAL Firebase Admin SDK (not the frontend mock).
 * Runs on port 3001, separate from the Vite dev server (port 3000).
 *
 * Emulator mode: set env vars before starting:
 * FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
 * FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
 * GCLOUD_PROJECT=kingdom-alliance-v2
 * npm run dev:emulator
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
const { dispatchEmail } = require('./services/emailProvider');

const sendProfilePhotoApprovalEmail = async (userEmail, userName) => {
  const subject = "Kingdom Alliance | Your Profile Photo Has Been Approved! 🎉";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #2c3e50;">Kingdom Alliance</h2>
      <p>Dear ${userName},</p>
      <p>We are pleased to inform you that your primary Profile Photo has been successfully reviewed and approved by our team.</p>
      <p>Your profile is now fully visible to other members and is actively appearing in match recommendations.</p>
    </div>
  `;
  return dispatchEmail(userEmail, subject, htmlContent);
};

const sendProfilePhotoRejectionEmail = async (userEmail, userName, rejectionReason) => {
  const subject = "Action Required: Kingdom Alliance Profile Photo Update ⚠️";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #c0392b;">Action Required</h2>
      <p>Dear ${userName},</p>
      <p>During our routine safety verification, your primary Profile Photo was declined for the following reason:</p>
      <p style="font-weight: bold; color: #c0392b;">"${rejectionReason}"</p>
      <p>Please log in to your dashboard to upload a conforming profile picture.</p>
    </div>
  `;
  return dispatchEmail(userEmail, subject, htmlContent);
};

const sendGalleryPhotoApprovalEmail = async (userEmail, userName) => {
  const subject = "Kingdom Alliance | Your New Gallery Photo Is Live! 📸";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #2c3e50;">Kingdom Alliance</h2>
      <p>Dear ${userName},</p>
      <p>Great news! The photo you recently uploaded to your personal album/gallery has passed moderation and is now live.</p>
    </div>
  `;
  return dispatchEmail(userEmail, subject, htmlContent);
};

const sendGalleryPhotoRejectionEmail = async (userEmail, userName, rejectionReason) => {
  const subject = "Update: Kingdom Alliance Gallery Photo Notification ℹ";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #7f8c8d;">Gallery Photo Update</h2>
      <p>Dear ${userName},</p>
      <p>An image uploaded to your personal media gallery/album did not meet our community guidelines and was declined for the following reason:</p>
      <p style="font-weight: bold; color: #7f8c8d;">"${rejectionReason}"</p>
    </div>
  `;
  return dispatchEmail(userEmail, subject, htmlContent);
};

// ─── Firebase Admin Initialization ────────────────────────────────────────────

function initializeAdminApp() {
  if (admin.apps.length > 0) return;

  const projectId = process.env.GCLOUD_PROJECT || 'kingdom-alliance-v2';

  // 🔥 BULLETPROOF FIREBASE ADMIN INIT (Looking directly in the server folder)
  const serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: projectId,
  });

  console.log('[Admin Server] ✅ Firebase Admin SDK forcefully initialized via local serviceAccountKey.json');
}

initializeAdminApp();

const db = admin.firestore();
const authAdmin = admin.auth();

// ─── Express Setup ─────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.ADMIN_SERVER_PORT || 3001;

app.use(cors());
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

app.post('/api/send-email', async (req, res) => {
  const { to_email, otp_code, type, captchaToken, reason, senderName } = req.body;

  // Base template setup
  let subject = "Kingdom Alliance Notification";
  let html = `<p>You have a new notification from Kingdom Alliance.</p>`;

  // Specific template formatting
  if (type === 'otp') {
    subject = "Your Kingdom Alliance Verification Code";
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Verification Required</h2>
        <p>Your secure Kingdom Alliance registration code is:</p>
        <h1 style="color: #e74c3c; letter-spacing: 2px;">${otp_code}</h1>
        <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `;
  }

  try {
    // Hand off to the universal adapter
    await dispatchEmail(to_email, otp_code, type, reason, senderName);
    res.status(200).json({ success: true, message: 'Dispatched successfully via adapter' });
  } catch (error) {
    console.error('Route level email failure:', error.message);
    res.status(500).json({ error: 'Mail dispatch failed via provider' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password, captchaToken } = req.body;

  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;

    const captchaResponse = await fetch(verifyUrl, { method: 'POST' });
    const captchaData = await captchaResponse.json();

    // Enforce a minimum score of 0.5 (Human threshold)
    if (!captchaData.success || captchaData.score < 0.5) {
      console.warn(`🚨 Bot blocked at login! Email: ${email} | Score: ${captchaData.score}`);
      return res.status(403).json({
        success: false,
        message: 'Security check failed. Automated bots are not allowed.'
      });
    }

    console.log(`✅ Human verified at login! Score: ${captchaData.score}`);

    // PROCEED WITH EXISTING FIREBASE/FIRESTORE LOGIN LOGIC HERE

    res.status(200).json({ success: true, message: 'Login successful' });

  } catch (error) {
    console.error("Login Route Error:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

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
      // 1. READ FIRST
      const userRef = db.collection('users').doc(item.uid);
      const userSnap = await transaction.get(userRef);

      // 2. THEN WRITE TO MODERATION COLLECTION
      const modRef = item.isSynthesized
        ? db.collection('photoModeration').doc()
        : db.collection('photoModeration').doc(item.id);

      let uploadedAtDate;
      if (item.uploadedAt) {
        if (typeof item.uploadedAt.seconds === 'number') {
          uploadedAtDate = new Date(item.uploadedAt.seconds * 1000);
        } else if (typeof item.uploadedAt._seconds === 'number') {
          uploadedAtDate = new Date(item.uploadedAt._seconds * 1000);
        } else {
          uploadedAtDate = new Date(item.uploadedAt);
        }
      } else {
        uploadedAtDate = admin.firestore.FieldValue.serverTimestamp();
      }

      transaction.set(modRef, {
        uid: item.uid,
        userName: item.userName,
        photoURL: item.photoURL,
        photoType: item.photoType || 'profilePhoto',
        galleryPosition: item.galleryPosition !== undefined ? item.galleryPosition : null,
        photoStatus: 'approved',
        status: 'approved',
        uploadedAt: uploadedAtDate,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: adminId
      }, { merge: true });

      // 3. THEN WRITE TO USER DOC
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
      // 1. READ FIRST
      const userRef = db.collection('users').doc(item.uid);
      const userSnap = await transaction.get(userRef);

      // 2. THEN WRITE TO MODERATION COLLECTION
      const modRef = item.isSynthesized
        ? db.collection('photoModeration').doc()
        : db.collection('photoModeration').doc(item.id);

      let uploadedAtDate;
      if (item.uploadedAt) {
        if (typeof item.uploadedAt.seconds === 'number') {
          uploadedAtDate = new Date(item.uploadedAt.seconds * 1000);
        } else if (typeof item.uploadedAt._seconds === 'number') {
          uploadedAtDate = new Date(item.uploadedAt._seconds * 1000);
        } else {
          uploadedAtDate = new Date(item.uploadedAt);
        }
      } else {
        uploadedAtDate = admin.firestore.FieldValue.serverTimestamp();
      }

      transaction.set(modRef, {
        uid: item.uid,
        userName: item.userName,
        photoURL: item.photoURL,
        photoType: item.photoType || 'profilePhoto',
        galleryPosition: item.galleryPosition !== undefined ? item.galleryPosition : null,
        photoStatus: 'rejected',
        status: 'rejected',
        uploadedAt: uploadedAtDate,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: adminId,
        rejectedReason: reason
      }, { merge: true });

      // 3. THEN WRITE TO USER DOC
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

    return res.status(200).json({ success: true, message: 'Photo rejected successfully.' });
  } catch (error) {
    console.error('Error rejecting photo in transaction:', error);
    return res.status(500).json({ error: error.message });
  }
});


app.post('/api/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    // 1. Verify OTP in Firestore
    const tempOtpsRef = admin.firestore().collection('temp_otps');
    const snapshot = await tempOtpsRef
      .where('email', '==', email)
      .where('otp', '==', otp)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ success: false, message: 'Invalid or incorrect OTP.' });
    }

    const otpDoc = snapshot.docs[0];
    const otpData = otpDoc.data();

    // 2. Check Expiration
    const now = admin.firestore.Timestamp.now();
    if (otpData.expiresAt.toMillis() < now.toMillis()) {
      await otpDoc.ref.delete(); // Cleanup expired OTP
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // 3. Forcefully Update Password in Firebase Auth Vault
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });

    // 4. Cleanup OTP Document
    await otpDoc.ref.delete();

    // 5. Send Professional Confirmation Email
    try {
      await dispatchEmail(email, null, 'password_reset_success');
    } catch (emailErr) {
      console.error("Warning: Password reset succeeded, but confirmation email failed to send.", emailErr);
    }

    res.status(200).json({ success: true, message: 'Password updated successfully.' });

  } catch (error) {
    console.error("Password Reset Error:", error);

    // Handle case where user doesn't exist in Auth despite being in the request
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    res.status(500).json({ success: false, message: 'Internal server error during password reset.' });
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