import { onRequest } from 'firebase-functions/v2/https';
import { dispatchEmail } from './services/emailProvider';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import * as crypto from 'crypto';
import { consumeOtpInternal, verifyCaptcha, checkEmailRateLimit, hashOtp } from './otp';
import { cascadeDeleteUser } from './cascadeDelete';

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
router.post('/send-email', async (req, res): Promise<any> => {
  const { to_email, otp_code, type, reason, senderName, captchaToken, attachmentBase64, attachmentFilename, bccEmail } = req.body;

  if (!to_email || !type) {
    return res.status(400).json({
      error: 'Missing required fields: to_email, type'
    });
  }

  // reCAPTCHA verification (enforced when RECAPTCHA_SECRET_KEY is configured)
  if (!(await verifyCaptcha(captchaToken))) {
    return res.status(403).json({ error: 'Captcha verification failed.' });
  }

  // Per-email rate limit to prevent email abuse
  try {
    await checkEmailRateLimit(to_email, `email_${type}`);
  } catch (err: any) {
    return res.status(429).json({ error: err.message });
  }

  try {
    await dispatchEmail(to_email, otp_code, type, reason, senderName, attachmentBase64, attachmentFilename, bccEmail);
    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error(`❌ [API] Email failed for ${to_email}:`, error.message);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

router.post('/send-onboarding-email', async (req, res): Promise<any> => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'Missing uid' });
  }

  try {
    const db = admin.firestore();
    const userSnap = await db.collection('users').doc(uid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userData = userSnap.data() || {};

    // Idempotency guard: the Firestore onDocumentCreated trigger
    // (onOnboardingComplete) is the source of truth for this email. If the
    // trigger (or a prior call to this route) already sent it, do nothing.
    if (userData.onboardingEmailSent === true) {
      return res.status(200).json({ success: true, message: 'Onboarding email already sent — no action taken.' });
    }

    const email = userData.email;
    const name = userData.fullName || userData.name || 'Member';
    const profileId = userData.profileId || `KA-${uid.slice(0, 6).toUpperCase()}`;

    // Full biodata PDF: Page 1 = complete profile + declaration + PDF417
    // digitally-signed barcode; Pages 2+ = full Terms & Conditions.
    const { generateBiodataPdf } = await import('./biodataPdf');
    const pdfBuffer = await generateBiodataPdf({ ...userData, profileId });
    const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

    // Send email with PDF attachment + BCC
    await dispatchEmail(
      email, null, 'onboarding_complete',
      name, 'Kingdom Alliance',
      pdfBase64,
      `KA_Biodata_${profileId}.pdf`,
      'themaster@thekingdomalliances.com'
    );

    // Mark as sent so the Firestore trigger and any duplicate calls skip.
    await db.collection('users').doc(uid).set({
      onboardingEmailSent: true,
      onboardingEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.status(200).json({ success: true, message: 'Onboarding email sent successfully.' });
  } catch (err: any) {
    console.error('[OnboardingEmail] Failed:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to send onboarding email.' });
  }
});

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

// ─── Middleware: Verify User Token (any authenticated member) ─────────────────
async function requireUserAuth(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization token.' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).callerUid = decoded.uid;
    return next();
  } catch (err: any) {
    console.error('[Auth Middleware] User token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ─── User Self-Service: Request Account Deletion (7-day grace) ────────────────
router.post('/delete-account', requireUserAuth, async (req, res): Promise<any> => {
  const uid = (req as any).callerUid as string;
  const db = admin.firestore();

  try {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    const userData = userSnap.data() || {};

    // Already pending? Idempotent response.
    if (userData.deletionStatus === 'pending_deletion') {
      return res.status(200).json({ success: true, message: 'Deletion already scheduled.' });
    }

    const scheduledDeletionAt = admin.firestore.Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await userRef.update({
      deletionStatus: 'pending_deletion',
      deletionRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
      scheduledDeletionAt,
      deletionReminderSent: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send confirmation email with the exact deletion date
    const deletionDate = scheduledDeletionAt.toDate().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    if (userData.email) {
      try {
        await dispatchEmail(userData.email, '', 'account_deletion_scheduled', deletionDate);
      } catch (err: any) {
        console.error(`[DeleteAccount] Confirmation email failed for ${userData.email}:`, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Your account has been disabled and will be permanently deleted on ${deletionDate}. You can reactivate it any time before then by logging in.`,
      scheduledDeletionAt: scheduledDeletionAt.toMillis()
    });
  } catch (err: any) {
    console.error('[DeleteAccount] Failed:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to schedule account deletion.' });
  }
});

// ─── User Self-Service: Reactivate Account (cancels pending deletion) ─────────
router.post('/reactivate-account', requireUserAuth, async (req, res): Promise<any> => {
  const uid = (req as any).callerUid as string;
  const db = admin.firestore();

  try {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    const userData = userSnap.data() || {};

    if (userData.deletionStatus !== 'pending_deletion') {
      return res.status(200).json({ success: true, message: 'Account is active. No reactivation needed.' });
    }

    await userRef.update({
      deletionStatus: admin.firestore.FieldValue.delete(),
      deletionRequestedAt: admin.firestore.FieldValue.delete(),
      scheduledDeletionAt: admin.firestore.FieldValue.delete(),
      deletionReminderSent: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (userData.email) {
      try {
        await dispatchEmail(userData.email, '', 'account_reactivated');
      } catch (err: any) {
        console.error(`[ReactivateAccount] Email failed for ${userData.email}:`, err.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Your account has been reactivated. Welcome back!' });
  } catch (err: any) {
    console.error('[ReactivateAccount] Failed:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to reactivate account.' });
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

  try {
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

    // 4. Send invitation email with credentials
    try {
      await dispatchEmail(
        normalizedEmail,
        tempPassword,
        'admin_invitation',
        null,
        'Kingdom Alliance'
      );
      console.log(`✅ [CreateAdmin] Invitation email sent to: ${normalizedEmail}`);
    } catch (emailErr: any) {
      console.warn(`⚠️ [CreateAdmin] Invitation email failed (non-blocking):`, emailErr.message);
    }

    return res.status(201).json({
      success: true,
      uid: userRecord.uid,
      email: normalizedEmail,
      tempPassword,
      message: 'Admin account created successfully. Credentials sent via email.',
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

    // Generate OTP
    const otpCode = String(crypto.randomInt(100000, 1000000));
    const email = 'admin_deletion';
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);

    await db.collection('temp_otps').add({
      email,
      purpose: 'admin_deletion',
      otpHash: hashOtp(email, otpCode),
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      meta: { targetUid: uid, targetEmail },
    });

    // Send OTP to both system emails AND the requesting admin
    const callerEmail = (await admin.auth().getUser(callerUid)).email || '';
    const recipients = [...new Set([...SYSTEM_ADMIN_EMAILS, callerEmail].filter(Boolean))];
    for (const recipient of recipients) {
      try {
        await dispatchEmail(recipient, otpCode, 'admin_deletion_otp', otpCode, 'Kingdom Alliance');
      } catch (err: any) {
        console.warn(`⚠️ [DeleteAdmin] Failed to send OTP to ${recipient}:`, err.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Verification code sent to system administrators.' });
  } catch (error: any) {
    console.error('❌ [SendDeletionOTP] Failed:', error.message || error);
    return res.status(500).json({ error: error.message || 'Failed to send verification code.' });
  }
});

// ─── Admin: Delete Admin Account ─────────────────────────────────────────────
router.post('/admin/delete-admin', requireAdminAuth, async (req, res): Promise<any> => {
  const { uid } = req.body;
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

    await admin.auth().deleteUser(uid);
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

    // 2. Send email with the new password (non-blocking)
    try {
      await dispatchEmail(targetEmail, newPassword, 'admin_password_reset', null, 'Kingdom Alliance');
      console.log(`✅ [ResetAdminPassword] Password email sent to: ${targetEmail}`);
    } catch (emailErr: any) {
      console.warn(`⚠️ [ResetAdminPassword] Password email failed (non-blocking):`, emailErr.message);
    }

    return res.status(200).json({
      success: true,
      uid,
      email: targetEmail,
      tempPassword: newPassword,
      message: 'Admin password reset successfully. New password sent via email.',
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
  {
    cors: true,
    secrets: ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT']
  },
  async (req, res): Promise<any> => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const { to_email, otp_code, type, reason, senderName, captchaToken } = req.body;
    if (!to_email || !type) {
      return res.status(400).json({ error: 'Missing required fields: to_email, type' });
    }
    // reCAPTCHA + rate limit (enforced when RECAPTCHA_SECRET_KEY is configured)
    if (!(await verifyCaptcha(captchaToken))) {
      return res.status(403).json({ error: 'Captcha verification failed.' });
    }
    try {
      await checkEmailRateLimit(to_email, `email_${type}`);
    } catch (err: any) {
      return res.status(429).json({ error: err.message });
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
