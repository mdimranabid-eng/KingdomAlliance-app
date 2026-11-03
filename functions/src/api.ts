import { onRequest } from 'firebase-functions/v2/https';
import { dispatchEmail } from './services/emailProvider';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import * as crypto from 'crypto';
import { consumeOtpInternal, hashOtp } from './otp';
import { cascadeDeleteUser } from './cascadeDelete';
import { createEmailHandlers } from './secureEmail';
import { createDeletionHandlers } from './accountDeletion';

// ============================================================
// Consolidated API Cloud Function (Express App)
// Exposes admin endpoints mapped via firebase.json rewrites
// ============================================================

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// ─── Middleware: Verify Admin Token ───────────────────────────────────────────
async function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization token.' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token, true);

    // Require administrator claims in both production and emulators.
    {
      const userRecord = await admin.auth().getUser(decoded.uid);
      const isAdmin = userRecord.customClaims?.admin === true;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Caller is not an admin.' });
      }
    }

    if (decoded.admin !== true || !decoded.firebase?.sign_in_second_factor) {
      return res.status(403).json({ error: 'Complete two-factor sign-in before using admin functions.' });
    }
    const adminDoc = await admin.firestore().collection('admins').doc(decoded.uid).get();
    if (!adminDoc.exists || adminDoc.data()?.emailVerified !== true) {
      return res.status(403).json({ error: 'Verify your administrator email first.' });
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
router.post('/check-email', async (req, res): Promise<any> => {
  const { email, mobileNumber } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing email field.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  try {
    const db = admin.firestore();
    const result: { emailTaken: boolean; mobileTaken: boolean } = { emailTaken: false, mobileTaken: false };

    const emailQ = db.collection('users').where('email', '==', cleanEmail);
    const emailSnapshot = await emailQ.get();
    result.emailTaken = !emailSnapshot.empty;

    if (mobileNumber && typeof mobileNumber === 'string') {
      const mobileQ = db.collection('users').where('mobileNumber', '==', mobileNumber);
      const mobileSnapshot = await mobileQ.get();
      result.mobileTaken = !mobileSnapshot.empty;
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ [CheckEmail] Failed:', error.message || error);
    return res.status(500).json({ error: 'Unable to verify uniqueness.' });
  }
});

router.get('/health', (req, res): any => {
  return res.json({
    status: 'ok',
    server: 'Kingdom Alliance Admin Cloud API',
    emulatorMode: !!process.env.FIRESTORE_EMULATOR_HOST,
    timestamp: new Date().toISOString(),
  });
});

// ─── Send Email ──────────────────────────────────────────────────────────────
const emailHandlers = createEmailHandlers({ db: admin.firestore(), auth: admin.auth() });
router.post('/send-email', emailHandlers.notification);
router.post('/send-onboarding-email', emailHandlers.onboarding);

// ─── Reset Password ───────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res): Promise<any> => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  try {
    // Server-side OTP verification (hashed, attempt-limited, expiry-checked)
    const result = await consumeOtpInternal(email, otp, 'password_reset');
    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });

    try {
      await dispatchEmail(email, null, 'password_reset_success');
    } catch (emailErr) {
      console.error("Warning: Password reset succeeded, but confirmation email failed to send.", emailErr);
    }

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    console.error("Password Reset Error:", error);
    if (error.code === 'auth/user-not-found') {
      // Anti-enumeration: always return success to avoid leaking account existence
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset has been processed.' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error during password reset.' });
  }
});

// ─── Verify Admin Email ───────────────────────────────────────────────────────
const verifyAdminEmailHandler = async (req: express.Request, res: express.Response): Promise<any> => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing verification token' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    const isAdmin = userRecord.customClaims?.admin === true;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Requires administrator status' });
    }

    const result = await consumeOtpInternal(userRecord.email || '', String(req.body?.otp || ''), 'admin_login');
    if (!result.ok) return res.status(400).json({ error: result.message });
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
};
router.post('/verify-admin-email', verifyAdminEmailHandler);

const deletionHandlers = createDeletionHandlers({ db: admin.firestore(), auth: admin.auth() });
router.post('/delete-account', deletionHandlers.deleteAccount);
router.post('/reactivate-account', deletionHandlers.reactivateAccount);

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

  try {
    const targetDoc = await admin.firestore().collection('admins').doc(uid).get();
    let targetAuth;
    try { targetAuth = await admin.auth().getUser(uid); }
    catch (error: any) { if (error.code !== 'auth/user-not-found') throw error; }
    if (uid === (req as any).adminUid || targetDoc.exists || targetAuth?.customClaims?.admin === true ||
        SYSTEM_ADMIN_EMAILS.includes((targetAuth?.email || '').toLowerCase())) {
      return res.status(403).json({ error: 'Administrator accounts must use verified administrator deletion.' });
    }
    await cascadeDeleteUser(uid, log);
  } catch (err: any) {
    return res.status(500).json({ error: `Auth deletion failed: ${err.message}`, logs });
  }

  return res.status(200).json({
    success: true,
    uid,
    message: 'User permanently deleted from Auth, Firestore, Cloudinary, and all associated collections.',
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
              thumbUrl: (item as any).thumbUrl || (item as any).pendingThumbUrl || userData.thumbUrl || '',
              pendingPhotoUrl: '',
              pendingPhotoThumbUrl: '',
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

// ─── Admin: Create Admin User ────────────────────────────────────────────────
router.post('/admin/create-admin', requireAdminAuth, async (req, res): Promise<any> => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = admin.firestore();

  try {
    // Check if email already exists in Auth
    try {
      const existingUser = await admin.auth().getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }
    } catch (err: any) {
      if (err.code !== 'auth/user-not-found') {
        throw err;
      }
      // user-not-found is expected — proceed with creation
    }

    // Generate random 12-char password
    const tempPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12) + 'A1!';

    // 1. Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email: normalizedEmail,
      password: tempPassword,
      emailVerified: true,
    });
    console.log(`✅ [CreateAdmin] Auth user created: ${userRecord.uid}`);

    try {
    // 2. Set admin custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`✅ [CreateAdmin] Custom claim set for: ${userRecord.uid}`);

    // 3. Create Firestore admins doc (emailVerified: false → forces OTP on first login)
    await db.collection('admins').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: normalizedEmail,
      role: 'admin',
      isAdmin: true,
      emailVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ [CreateAdmin] Firestore admin doc created for: ${userRecord.uid}`);

    } catch (error) {
      // Roll back an Auth account if its administrator setup did not complete.
      await admin.auth().deleteUser(userRecord.uid);
      await db.collection('admins').doc(userRecord.uid).delete();
      throw error;
    }

    // 4. Send invitation email with credentials
    let emailSent = false;
    try {
      emailSent = (await dispatchEmail(
        normalizedEmail,
        tempPassword,
        'admin_invitation',
        null,
        'Kingdom Alliance'
      )) !== false;
      console.log(`✅ [CreateAdmin] Invitation email sent to: ${normalizedEmail}`);
    } catch (emailErr: any) {
      console.warn(`⚠️ [CreateAdmin] Invitation email failed (non-blocking):`, emailErr.message);
    }

    return res.status(201).json({
      success: true,
      uid: userRecord.uid,
      email: normalizedEmail,
      tempPassword,
      emailSent,
      message: emailSent ? 'Admin account created. Credentials emailed.' : 'Admin account created, but email delivery failed. Copy the temporary password.',
    });
  } catch (error: any) {
    console.error('❌ [CreateAdmin] Failed:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to create admin account.' });
  }
});

// ─── Admin: List Admin Users ─────────────────────────────────────────────────
router.get('/admin/list-admins', requireAdminAuth, async (req, res): Promise<any> => {
  const db = admin.firestore();
  try {
    const snapshot = await db.collection('admins').orderBy('createdAt', 'desc').get();
    const admins = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
    }));
    return res.status(200).json({ success: true, admins });
  } catch (error: any) {
    console.error('❌ [ListAdmins] Failed:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to list admins.' });
  }
});

// ─── Admin: Send Deletion OTP ────────────────────────────────────────────────
const SYSTEM_ADMIN_EMAILS = ['themaster@thekingdomalliances.com', 'md.imranabid@gmail.com'];

router.post('/admin/send-deletion-otp', requireAdminAuth, async (req, res): Promise<any> => {
  const { uid } = req.body;
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid uid.' });
  }

  const db = admin.firestore();

  try {
    const targetDoc = await db.collection('admins').doc(uid).get();
    if (!targetDoc.exists) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }
    const targetEmail = targetDoc.data()?.email?.toLowerCase();
    if (SYSTEM_ADMIN_EMAILS.includes(targetEmail)) {
      return res.status(403).json({ error: 'System accounts cannot be deleted.' });
    }

    const callerUid = (req as any).adminUid;
    if (callerUid === uid) {
      return res.status(403).json({ error: 'You cannot delete your own account.' });
    }

    const otpCode = String(crypto.randomInt(100000, 1000000));
    const key = `admin_deletion:${callerUid}:${uid}`;
    const ref = db.collection('adminDeletionRequests').doc(`${callerUid}_${uid}`);
    const reserved = await db.runTransaction(async tx => {
      const previous = await tx.get(ref);
      if ((previous.data()?.createdAt?.toMillis() || 0) > Date.now() - 120000) return false;
      tx.set(ref, { otpHash: hashOtp(key, otpCode), attempts: 0,
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 600000),
        createdAt: admin.firestore.Timestamp.now() });
      return true;
    });
    if (!reserved) return res.status(429).json({ error: 'Wait two minutes before requesting another code.' });
    const callerEmail = (await admin.auth().getUser(callerUid)).email || '';
    try {
      const sent = await dispatchEmail(callerEmail, otpCode, 'admin_deletion_otp', otpCode, 'Kingdom Alliance');
      if (sent === false) throw new Error('Verification email was not delivered.');
    } catch (error) {
      await ref.delete();
      throw error;
    }

    return res.status(200).json({ success: true, message: 'Verification code sent to your administrator email.' });
  } catch (error: any) {
    console.error('❌ [SendDeletionOTP] Failed:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to send verification code.' });
  }
});

// ─── Admin: Delete Admin Account ─────────────────────────────────────────────
router.post('/admin/delete-admin', requireAdminAuth, async (req, res): Promise<any> => {
  const { uid, otp } = req.body;
  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) return res.status(400).json({ error: 'Enter the six-digit verification code.' });
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing uid.' });
  }

  const db = admin.firestore();
  const callerUid = (req as any).adminUid;

  try {
    const targetDoc = await db.collection('admins').doc(uid).get();
    if (!targetDoc.exists) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }
    const targetEmail = targetDoc.data()?.email?.toLowerCase();
    if (SYSTEM_ADMIN_EMAILS.includes(targetEmail)) {
      return res.status(403).json({ error: 'System accounts cannot be deleted.' });
    }
    if (callerUid === uid) {
      return res.status(403).json({ error: 'You cannot delete your own account.' });
    }

    const ref = db.collection('adminDeletionRequests').doc(`${callerUid}_${uid}`);
    const verified = await db.runTransaction(async tx => {
      const record = await tx.get(ref);
      const data = record.data();
      if (!data || data.expiresAt.toMillis() <= Date.now() || data.attempts >= 5) return false;
      if (data.otpHash !== hashOtp(`admin_deletion:${callerUid}:${uid}`, otp)) {
        tx.update(ref, { attempts: data.attempts + 1 });
        return false;
      }
      tx.delete(ref);
      return true;
    });
    if (!verified) return res.status(400).json({ error: 'Invalid or expired code. Request a new code if needed.' });
    try { await admin.auth().deleteUser(uid); }
    catch (error: any) { if (error.code !== 'auth/user-not-found') throw error; }
    console.log(`✅ [DeleteAdmin] Auth user deleted: ${uid}`);

    await db.collection('admins').doc(uid).delete();
    console.log(`✅ [DeleteAdmin] Firestore doc deleted: ${uid}`);

    return res.status(200).json({ success: true, message: 'Admin account deleted successfully.' });
  } catch (error: any) {
    console.error('❌ [DeleteAdmin] Failed:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to delete admin account.' });
  }
});

// ─── Admin: Reset Admin Password ─────────────────────────────────────────────
router.post('/admin/reset-admin-password', requireAdminAuth, async (req, res): Promise<any> => {
  const { uid } = req.body;
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Missing uid.' });
  }

  const db = admin.firestore();

  try {
    const targetDoc = await db.collection('admins').doc(uid).get();
    if (!targetDoc.exists) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }
    const targetEmail = targetDoc.data()?.email?.toLowerCase();
    if (SYSTEM_ADMIN_EMAILS.includes(targetEmail)) {
      return res.status(403).json({ error: 'System accounts cannot have their password reset.' });
    }

    // Generate a new password
    const newPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12) + 'A1!';

    // 1. Update Firebase Auth password
    await admin.auth().updateUser(uid, { password: newPassword });
    console.log(`✅ [ResetAdminPassword] Password updated for Auth user: ${uid}`);

    // 2. Report delivery separately from password reset.
    let emailSent = false;
    try {
      emailSent = (await dispatchEmail(targetEmail, newPassword, 'admin_password_reset', null, 'Kingdom Alliance')) !== false;
      console.log(`✅ [ResetAdminPassword] Password email sent to: ${targetEmail}`);
    } catch (emailErr: any) {
      console.warn(`⚠️ [ResetAdminPassword] Password email failed (non-blocking):`, emailErr.message);
    }

    return res.status(200).json({
      success: true,
      uid,
      email: targetEmail,
      tempPassword: newPassword,
      emailSent,
      message: emailSent ? 'Password reset. New password emailed.' : 'Password reset, but email delivery failed. Copy the temporary password.',
    });
  } catch (error: any) {
    console.error('❌ [ResetAdminPassword] Failed:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to reset admin password.' });
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
      'TURNSTILE_SECRET_KEY',
      'OTP_HASH_SALT'
    ]
  },
  app
);

// Standalone Backwards-compatible HTTPS functions
export const sendEmailApi = onRequest(
  { cors: true, secrets: ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT'] },
  emailHandlers.notification
);

export const verifyAdminEmail = onRequest(
  { cors: true, secrets: ['OTP_HASH_SALT'] },
  verifyAdminEmailHandler
);

// The local server mounts the exact same handlers as the hosted API.
export const adminApiApp = app;
