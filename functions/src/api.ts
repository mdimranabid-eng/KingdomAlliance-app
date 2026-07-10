import { onRequest } from 'firebase-functions/v2/https';
import { dispatchEmail } from './services/emailProvider';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import * as crypto from 'crypto';

// ============================================================
// Consolidated API Cloud Function (Express App)
// Exposes admin endpoints mapped via firebase.json rewrites
// ============================================================

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Helper to extract Cloudinary Public ID
function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;
    const pathPart = parts[1];
    const pathSegments = pathPart.split('/');
    const cleanSegments = pathSegments.filter(seg => {
      const isVersion = /^v\d+$/.test(seg);
      const isTransformation = seg.includes('_') && seg.length < 20;
      return !isVersion && !isTransformation;
    });
    const fullIdWithExt = cleanSegments.join('/');
    const lastDotIdx = fullIdWithExt.lastIndexOf('.');
    if (lastDotIdx === -1) return fullIdWithExt;
    return fullIdWithExt.substring(0, lastDotIdx);
  } catch (e) {
    console.error("Error extracting public ID from Cloudinary URL:", e);
    return null;
  }
}

// ─── Middleware: Verify Admin Token ───────────────────────────────────────────
async function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');

  const isEmulatorMode =
    !!process.env.FIRESTORE_EMULATOR_HOST || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization token.' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // In emulator mode, any valid token is accepted as admin.
    if (!isEmulatorMode) {
      const userRecord = await admin.auth().getUser(decoded.uid);
      const isAdmin = userRecord.customClaims?.admin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Caller is not an admin.' });
      }
    }

    (req as any).adminUid = decoded.uid;
    return next();
  } catch (err: any) {
    console.error('[Auth Middleware] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

const router = express.Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (req, res): any => {
  return res.json({
    status: 'ok',
    server: 'Kingdom Alliance Admin Cloud API',
    emulatorMode: !!process.env.FIRESTORE_EMULATOR_HOST,
    timestamp: new Date().toISOString(),
  });
});

// ─── Send Email ──────────────────────────────────────────────────────────────
router.post('/send-email', async (req, res): Promise<any> => {
  const { to_email, otp_code, type, reason, senderName } = req.body;

  if (!to_email || !type) {
    return res.status(400).json({
      error: 'Missing required fields: to_email, type'
    });
  }

  try {
    await dispatchEmail(to_email, otp_code, type, reason, senderName);
    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error(`❌ [API] Email failed for ${to_email}:`, error.message);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

// ─── Reset Password ───────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res): Promise<any> => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  try {
    const db = admin.firestore();
    const tempOtpsRef = db.collection('temp_otps');
    const snapshot = await tempOtpsRef
      .where('email', '==', email)
      .where('otp', '==', otp)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ success: false, message: 'Invalid or incorrect OTP.' });
    }

    const otpDoc = snapshot.docs[0];
    const otpData = otpDoc.data();

    const now = admin.firestore.Timestamp.now();
    if (otpData.expiresAt.toMillis() < now.toMillis()) {
      await otpDoc.ref.delete();
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });

    await otpDoc.ref.delete();

    try {
      await dispatchEmail(email, null, 'password_reset_success');
    } catch (emailErr) {
      console.error("Warning: Password reset succeeded, but confirmation email failed to send.", emailErr);
    }

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    console.error("Password Reset Error:", error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error during password reset.' });
  }
});

// ─── Verify Admin Email ───────────────────────────────────────────────────────
router.post('/verify-admin-email', async (req, res): Promise<any> => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing verification token' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    const isAdmin = userRecord.customClaims?.admin === true;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Requires administrator status' });
    }

    const uid = decodedToken.uid;
    await admin.auth().updateUser(uid, {
      emailVerified: true
    });
    console.log(`✅ [Auth] Marked admin email verified for UID: ${uid}`);

    const db = admin.firestore();
    await db.collection('admins').doc(uid).update({
      emailVerified: true
    });
    console.log(`✅ [Firestore] Updated emailVerified to true in admins collection for UID: ${uid}`);

    return res.status(200).json({
      success: true,
      message: 'Administrator email successfully verified in Auth and Firestore.'
    });
  } catch (error: any) {
    console.error('❌ Error executing verify-admin-email:', error.message || error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ─── Secure Admin Photo Deletion ──────────────────────────────────────────────
router.post('/admin/delete-photo', requireAdminAuth, async (req, res): Promise<any> => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url in request body.' });
  }

  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  let apiKey = process.env.CLOUDINARY_API_KEY || '';
  let apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  // Fallback to reading from Firestore site_config if env/secrets are missing
  if (!cloudName || !apiKey || !apiSecret) {
    try {
      const siteConfigSnap = await admin.firestore().collection('settings').doc('site_config').get();
      if (siteConfigSnap.exists) {
        const data = siteConfigSnap.data();
        if (data) {
          cloudName = cloudName || data.cloudinaryCloudName || '';
          apiKey = apiKey || data.cloudinaryApiKey || '';
          apiSecret = apiSecret || data.cloudinaryApiSecret || '';
        }
      }
    } catch (dbErr: any) {
      console.error('⚠️ Could not load settings from Firestore:', dbErr.message);
    }
  }

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Cloudinary configuration missing on the backend.');
    return res.status(500).json({ error: 'Cloudinary credentials not configured on the backend.' });
  }

  const publicId = extractPublicId(url);
  if (!publicId) {
    return res.status(400).json({ error: 'Failed to parse public ID from URL.' });
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString();
  const signString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

  try {
    const signature = crypto.createHash('sha1').update(signString).digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary responded with status ${response.status}`);
    }

    const result = await response.json();
    if (result.result === 'ok') {
      console.log(`✅ [Cloudinary] Successfully deleted asset: ${publicId}`);
      return res.status(200).json({ success: true, message: 'Image deleted successfully.' });
    } else {
      console.warn(`⚠️ [Cloudinary] Deletion response result: ${result.result}`);
      return res.status(500).json({ error: `Cloudinary delete response: ${result.result}` });
    }
  } catch (error: any) {
    console.error('❌ Failed to delete asset from Cloudinary:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to delete photo from Cloudinary.' });
  }
});

// ─── Secure User Photo Deletion (Standard User) ──────────────────────────────
router.post('/user/delete-photo', async (req, res): Promise<any> => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');
  const { url } = req.body;

  if (!token || !url) {
    return res.status(401).json({ error: 'Unauthorized: Missing token or photo url.' });
  }

  try {
    // 1. Verify user's auth token
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // 2. Security Check: Verify the user actually owns this photo
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const userData = userDoc.data();
    const isProfilePhoto = userData?.photoUrl === url || userData?.pendingPhotoUrl === url;
    const isInGallery = (userData?.gallery || []).some((img: any) => img.url === url);

    if (!isProfilePhoto && !isInGallery) {
      return res.status(403).json({ error: 'Forbidden: You do not own this photo.' });
    }

    // 3. Load Cloudinary Credentials
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
    let apiKey = process.env.CLOUDINARY_API_KEY || '';
    let apiSecret = process.env.CLOUDINARY_API_SECRET || '';

    if (!cloudName || !apiKey || !apiSecret) {
      const siteConfigSnap = await db.collection('settings').doc('site_config').get();
      if (siteConfigSnap.exists) {
        const data = siteConfigSnap.data();
        if (data) {
          cloudName = cloudName || data.cloudinaryCloudName || '';
          apiKey = apiKey || data.cloudinaryApiKey || '';
          apiSecret = apiSecret || data.cloudinaryApiSecret || '';
        }
      }
    }

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Cloudinary configuration missing on the backend.');
      return res.status(500).json({ error: 'Cloudinary credentials not configured on the backend.' });
    }

    const publicId = extractPublicId(url);
    if (!publicId) {
      return res.status(400).json({ error: 'Failed to parse public ID from URL.' });
    }

    // 4. Perform Cloudinary Deletion
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const signString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signString).digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary responded with status ${response.status}`);
    }

    const result = await response.json();
    if (result.result === 'ok') {
      console.log(`✅ [Cloudinary] User ${uid} successfully deleted asset: ${publicId}`);
      return res.status(200).json({ success: true, message: 'Image deleted successfully.' });
    } else {
      console.warn(`⚠️ [Cloudinary] Deletion response result: ${result.result}`);
      return res.status(500).json({ error: `Cloudinary delete response: ${result.result}` });
    }
  } catch (error: any) {
    console.error('❌ Failed to delete asset from Cloudinary:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to delete photo from Cloudinary.' });
  }
});

// ─── Admin Delete User ────────────────────────────────────────────────────────
router.post('/admin/delete-user', requireAdminAuth, async (req, res): Promise<any> => {
  const { uid } = req.body;

  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid uid in request body.' });
  }

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(`[Admin Delete] ${msg}`);
    logs.push(msg);
  };

  log(`Starting cascading deletion for UID: ${uid}`);

  const db = admin.firestore();

  // Stage A: Auth Account
  try {
    await admin.auth().deleteUser(uid);
    log(`✅ Stage A: Auth account deleted for UID: ${uid}`);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      log(`⚠️  Stage A: Auth account not found (already deleted or never existed): ${uid}`);
    } else {
      log(`❌ Stage A: Auth deletion FAILED: ${err.message}`);
      return res.status(500).json({ error: `Auth deletion failed: ${err.message}`, logs });
    }
  }

  // Stage B: /users document
  try {
    await db.collection('users').doc(uid).delete();
    log(`✅ Stage B: Firestore /users/${uid} document deleted.`);
  } catch (err: any) {
    log(`❌ Stage B: Firestore /users/${uid} deletion FAILED: ${err.message}`);
  }

  // Stage C: /photoModeration collection
  try {
    const moderationSnap = await db.collection('photoModeration').where('userId', '==', uid).get();
    const batch = db.batch();
    moderationSnap.docs.forEach((d) => batch.delete(d.ref));
    if (!moderationSnap.empty) await batch.commit();
    log(`✅ Stage C: ${moderationSnap.size} /photoModeration record(s) deleted.`);
  } catch (err: any) {
    log(`❌ Stage C: /photoModeration deletion FAILED: ${err.message}`);
  }

  // Stage D: /interests collection
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

    // Stage E: /shortlists collection
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

    // Stage F: /chats + /messages sub-collections
    const allInterestDocs = [...fromSnap.docs, ...toSnap.docs];
    const chatIds = new Set<string>();
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
  } catch (err: any) {
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
router.post('/admin/approve-photo', requireAdminAuth, async (req, res): Promise<any> => {
  const { item } = req.body;
  if (!item || !item.uid) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const adminId = (req as any).adminUid || 'system';
  const db = admin.firestore();

  try {
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(item.uid);
      const userSnap = await transaction.get(userRef);

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

      if (userSnap.exists) {
        const userData = userSnap.data();
        if (userData) {
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
            const updatedGallery = gallery.map((p: any) =>
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
      }
    });

    return res.status(200).json({ success: true, message: 'Photo approved successfully.' });
  } catch (error: any) {
    console.error('Error approving photo in transaction:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Photo Moderation: Reject Photo ──────────────────────────────────────────
router.post('/admin/reject-photo', requireAdminAuth, async (req, res): Promise<any> => {
  const { item, reason } = req.body;
  if (!item || !item.uid || !reason) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const adminId = (req as any).adminUid || 'system';
  const db = admin.firestore();

  try {
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(item.uid);
      const userSnap = await transaction.get(userRef);

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

      if (userSnap.exists) {
        const userData = userSnap.data();
        if (userData) {
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
            const updatedGallery = gallery.map((p: any) =>
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
      }
    });

    return res.status(200).json({ success: true, message: 'Photo rejected successfully.' });
  } catch (error: any) {
    console.error('Error rejecting photo in transaction:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.use('/api', router);
app.use('/', router);

// Consolidated Express Endpoint
export const api = onRequest(
  {
    cors: true,
    secrets: [
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_HOST',
      'SMTP_PORT',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'CLOUDINARY_CLOUD_NAME'
    ]
  },
  app
);

// Standalone Backwards-compatible HTTPS functions
export const sendEmailApi = onRequest(
  {
    cors: true,
    secrets: ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT']
  },
  async (req, res): Promise<any> => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const { to_email, otp_code, type, reason, senderName } = req.body;
    if (!to_email || !type) {
      return res.status(400).json({ error: 'Missing required fields: to_email, type' });
    }
    try {
      await dispatchEmail(to_email, otp_code, type, reason, senderName);
      return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error: any) {
      console.error(`❌ [API] Email failed for ${to_email}:`, error.message);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }
);

export const verifyAdminEmail = onRequest(
  { cors: true },
  async (req, res): Promise<any> => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/, '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing verification token' });
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken.admin) {
        return res.status(403).json({ error: 'Forbidden: Requires administrator status' });
      }
      const uid = decodedToken.uid;
      await admin.auth().updateUser(uid, { emailVerified: true });
      const db = admin.firestore();
      await db.collection('admins').doc(uid).update({ emailVerified: true });
      return res.status(200).json({
        success: true,
        message: 'Administrator email successfully verified in Auth and Firestore.'
      });
    } catch (error: any) {
      console.error('❌ Error executing verifyAdminEmail:', error.message || error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);
