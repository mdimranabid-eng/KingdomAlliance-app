// Admin management — port of the admin CRUD section of functions/src/api.ts.
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const store = require('../store');
const { adminRequired } = require('../auth');
const { hashOtp } = require('../otp');
const { dispatchEmail } = require('../services/email');
const { cascadeDeleteUser } = require('../cascadeDelete');

const router = express.Router();
const SYSTEM_ADMIN_EMAILS = (process.env.SYSTEM_ADMIN_EMAILS || 'themaster@thekingdomalliances.com').split(',').map((e) => e.trim().toLowerCase());

const validId = (v) => typeof v === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(v);

// ── List admins ───────────────────────────────────────────────────────────────
const listAdminsHandler = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, email_verified, data, created_at FROM admins ORDER BY created_at DESC');
    res.json({
      success: true,
      admins: rows.map((r) => ({
        id: r.id,
        uid: r.id,
        email: r.email,
        emailVerified: !!r.email_verified,
        permissions: (r.data && typeof r.data === 'object' ? r.data : JSON.parse(r.data || '{}')).permissions || [],
        createdAt: new Date(r.created_at).getTime(),
      })),
    });
  } catch (e) {
    console.error('[ListAdmins]', e.message);
    res.status(500).json({ error: 'Failed to list admins.' });
  }
};
router.get(['/admin/list', '/admin/list-admins'], adminRequired, listAdminsHandler);
router.post(['/admin/list', '/admin/list-admins'], adminRequired, listAdminsHandler);

// ── Create admin ──────────────────────────────────────────────────────────────
router.post(['/admin/create', '/admin/create-admin'], adminRequired, async (req, res) => {
  try {
    const { email, password, permissions } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) return res.status(400).json({ error: 'A valid email is required.' });
    const tempPassword = typeof password === 'string' && password.length >= 8
      ? password
      : crypto.randomBytes(9).toString('base64url').slice(0, 12) + 'A1!';
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
    if (existing.length) return res.status(409).json({ error: 'This email is already registered.' });

    const uid = store.uuid();
    await store.writeDoc('users', uid, {
      uid, email: cleanEmail, fullName: 'Administrator', role: 'admin',
      approvalStatus: 'approved', onboardingComplete: true, emailVerified: false,
      isSuspended: false, isBanned: false, authProvider: 'email',
      createdAt: { __st: 1 }, lastActive: { __st: 1 },
    }, { merge: false, createOnly: true });
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(tempPassword, 10), uid]);
    await pool.query(
      `INSERT INTO admins (id, email, email_verified, data) VALUES (?, ?, 0, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data)`,
      [uid, cleanEmail, JSON.stringify({ uid, email: cleanEmail, role: 'admin', isAdmin: true, emailVerified: false, permissions: Array.isArray(permissions) ? permissions : [] })]
    );
    let emailSent = false;
    try {
      emailSent = (await dispatchEmail(cleanEmail, tempPassword, 'admin_invitation', null, 'Kingdom Alliance')) !== false;
    } catch (emailErr) {
      console.warn('[CreateAdmin] Invitation email failed:', emailErr.message);
    }
    res.status(201).json({
      success: true,
      uid,
      email: cleanEmail,
      tempPassword,
      emailSent,
      message: emailSent ? 'Admin account created. Credentials emailed.' : 'Admin account created, but email delivery failed. Copy the temporary password.',
    });
  } catch (e) {
    console.error('[CreateAdmin]', e.message);
    res.status(500).json({ error: 'Failed to create admin.' });
  }
});

// ── Update admin permissions / email-verified ─────────────────────────────────
router.post('/admin/update', adminRequired, async (req, res) => {
  try {
    const { uid, permissions } = req.body || {};
    if (!validId(uid)) return res.status(400).json({ error: 'Missing uid.' });
    const [rows] = await pool.query('SELECT id, email, data FROM admins WHERE id = ? LIMIT 1', [uid]);
    if (!rows.length) return res.status(404).json({ error: 'Admin account not found.' });
    const data = rows[0].data && typeof rows[0].data === 'object' ? rows[0].data : JSON.parse(rows[0].data || '{}');
    data.permissions = Array.isArray(permissions) ? permissions : data.permissions || [];
    data.updatedAt = { __st: 1 };
    await store.writeDoc('admins', uid, data, { merge: true });
    res.json({ success: true, message: 'Admin updated.' });
  } catch (e) {
    console.error('[UpdateAdmin]', e.message);
    res.status(500).json({ error: 'Failed to update admin.' });
  }
});


// ── Reset admin password ──────────────────────────────────────────────────────
router.post('/admin/reset-admin-password', adminRequired, async (req, res) => {
  try {
    const { uid } = req.body || {};
    if (!validId(uid)) return res.status(400).json({ error: 'Missing uid.' });
    const [rows] = await pool.query('SELECT id, email FROM admins WHERE id = ? LIMIT 1', [uid]);
    if (!rows.length) return res.status(404).json({ error: 'Admin account not found.' });
    if (SYSTEM_ADMIN_EMAILS.includes(String(rows[0].email).toLowerCase())) {
      return res.status(403).json({ error: 'System accounts cannot have their password reset.' });
    }
    const newPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12) + 'A1!';
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(newPassword, 10), uid]);
    let emailSent = false;
    try {
      emailSent = (await dispatchEmail(rows[0].email, newPassword, 'admin_password_reset', null, 'Kingdom Alliance')) !== false;
    } catch (e) { console.warn('[ResetAdminPassword] email failed:', e.message); }
    res.json({
      success: true, uid, email: rows[0].email, tempPassword: newPassword, emailSent,
      message: emailSent ? 'Password reset. New password emailed.' : 'Password reset, but email delivery failed. Copy the temporary password.',
    });
  } catch (e) {
    console.error('[ResetAdminPassword]', e.message);
    res.status(500).json({ error: 'Failed to reset admin password.' });
  }
});

// ── Admin deletion flow (OTP via admin email) ─────────────────────────────────
router.post('/admin/send-deletion-otp', adminRequired, async (req, res) => {
  try {
    const { uid } = req.body || {};
    if (!validId(uid)) return res.status(400).json({ error: 'Missing uid.' });
    if (req.uid === uid) return res.status(403).json({ error: 'You cannot delete your own account.' });
    const [target] = await pool.query('SELECT id, email FROM admins WHERE id = ? LIMIT 1', [uid]);
    if (!target.length) return res.status(404).json({ error: 'Admin account not found.' });
    if (SYSTEM_ADMIN_EMAILS.includes(String(target[0].email).toLowerCase())) {
      return res.status(403).json({ error: 'System accounts cannot be deleted.' });
    }
    const otpCode = String(crypto.randomInt(100000, 1000000));
    const key = `admin_deletion:${req.uid}:${uid}`;
    const existing = await store.getDoc('adminDeletionRequests', `${req.uid}_${uid}`);
    if (existing && existing.data.createdAt && existing.data.createdAt.__ts > Date.now() - 120000) {
      return res.status(429).json({ error: 'Wait two minutes before requesting another code.' });
    }
    await store.writeDoc('adminDeletionRequests', `${req.uid}_${uid}`, {
      otpHash: hashOtp(key, otpCode), attempts: 0,
      expiresAt: { __ts: Date.now() + 600000 }, createdAt: { __st: 1 },
    }, { merge: true });
    const [caller] = await pool.query('SELECT email FROM users WHERE id = ? LIMIT 1', [req.uid]);
    try {
      await dispatchEmail(caller[0]?.email || '', otpCode, 'admin_deletion_otp', otpCode, 'Kingdom Alliance');
    } catch (e) {
      await store.deleteDoc('adminDeletionRequests', `${req.uid}_${uid}`);
      throw e;
    }
    res.json({ success: true, message: 'Verification code sent to your administrator email.' });
  } catch (e) {
    console.error('[SendDeletionOTP]', e.message);
    res.status(500).json({ error: e.message || 'Failed to send verification code.' });
  }
});

router.post('/admin/delete-admin', adminRequired, async (req, res) => {
  try {
    const { uid, otp } = req.body || {};
    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) return res.status(400).json({ error: 'Enter the six-digit verification code.' });
    if (!validId(uid)) return res.status(400).json({ error: 'Missing uid.' });
    const [target] = await pool.query('SELECT id, email FROM admins WHERE id = ? LIMIT 1', [uid]);
    if (!target.length) return res.status(404).json({ error: 'Admin account not found.' });
    if (SYSTEM_ADMIN_EMAILS.includes(String(target[0].email).toLowerCase())) {
      return res.status(403).json({ error: 'System accounts cannot be deleted.' });
    }
    if (req.uid === uid) return res.status(403).json({ error: 'You cannot delete your own account.' });
    const rec = await store.getDoc('adminDeletionRequests', `${req.uid}_${uid}`);
    const d = rec ? rec.data : null;
    const key = `admin_deletion:${req.uid}:${uid}`;
    if (!d || (d.expiresAt && d.expiresAt.__ts) <= Date.now() || (d.attempts || 0) >= 5) {
      return res.status(400).json({ error: 'Invalid or expired code. Request a new code if needed.' });
    }
    if (d.otpHash !== hashOtp(key, otp)) {
      await store.writeDoc('adminDeletionRequests', `${req.uid}_${uid}`, { attempts: (d.attempts || 0) + 1 }, { merge: true });
      return res.status(400).json({ error: 'Invalid or expired code. Request a new code if needed.' });
    }
    await store.deleteDoc('adminDeletionRequests', `${req.uid}_${uid}`);
    await pool.query('DELETE FROM users WHERE id = ?', [uid]);
    await pool.query('DELETE FROM admins WHERE id = ?', [uid]);
    await pool.query('DELETE FROM sessions WHERE user_id = ?', [uid]);
    res.json({ success: true, message: 'Admin account deleted successfully.' });
  } catch (e) {
    console.error('[DeleteAdmin]', e.message);
    res.status(500).json({ error: e.message || 'Failed to delete admin account.' });
  }
});

// ── Admin delete user (cascade) ───────────────────────────────────────────────
router.post('/admin/delete-user', adminRequired, async (req, res) => {
  const { uid } = req.body || {};
  if (!validId(uid)) return res.status(400).json({ error: 'Missing or invalid uid in request body.' });
  const logs = [];
  const log = (msg) => { console.log(`[Admin Delete] ${msg}`); logs.push(msg); };
  try {
    const [adminRows] = await pool.query('SELECT id FROM admins WHERE id = ? LIMIT 1', [uid]);
    const [userRows] = await pool.query('SELECT role, email FROM users WHERE id = ? LIMIT 1', [uid]);
    const email = String(userRows[0]?.email || '').toLowerCase();
    if (uid === req.uid || adminRows.length || userRows[0]?.role === 'admin' || SYSTEM_ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Administrator accounts must use verified administrator deletion.' });
    }
    await cascadeDeleteUser(uid, log);
    return res.status(200).json({
      success: true,
      uid,
      message: 'User permanently deleted from all associated collections.',
      logs,
    });
  } catch (err) {
    return res.status(500).json({ error: `Deletion failed: ${err.message}`, logs });
  }
});

// ── Photo moderation: approve / reject ────────────────────────────────────────
router.post('/admin/approve-photo', adminRequired, async (req, res) => {
  const { item } = req.body || {};
  if (!item || !validId(item.uid)) return res.status(400).json({ error: 'Missing required fields.' });
  try {
    const modId = item.isSynthesized || !item.id ? store.uuid() : item.id;
    await store.writeDoc('photoModeration', modId, {
      uid: item.uid,
      userName: item.userName || '',
      photoURL: item.photoURL || '',
      photoType: item.photoType || 'profilePhoto',
      galleryPosition: item.galleryPosition !== undefined ? item.galleryPosition : null,
      photoStatus: 'approved',
      status: 'approved',
      uploadedAt: item.uploadedAt || { __st: 1 },
      reviewedAt: { __st: 1 },
      reviewedBy: req.uid || 'system',
    }, { merge: true });

    const userDoc = await store.getDoc('users', item.uid);
    if (userDoc && userDoc.data) {
      const userData = userDoc.data;
      const targetPhoto = item.pendingPhotoUrl || item.photoURL;
      const note = {
        id: crypto.randomUUID(),
        title: item.photoType === 'profilePhoto' ? 'Photo Approved' : 'Gallery Photo Approved',
        message: item.photoType === 'profilePhoto' ? 'Your profile photo has been approved.' : 'Your gallery photo has been approved.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      };
      if (item.photoType === 'profilePhoto' || !item.photoType) {
        await store.writeDoc('users', item.uid, {
          photoUrl: targetPhoto,
          photoURL: targetPhoto,
          thumbUrl: item.thumbUrl || item.pendingThumbUrl || userData.thumbUrl || '',
          pendingPhotoUrl: '',
          pendingPhotoThumbUrl: '',
          photoStatus: 'approved',
          updatedAt: { __st: 1 },
          notifications: { __au: [note] },
        }, { merge: true });
      } else {
        const gallery = Array.isArray(userData.gallery) ? userData.gallery : [];
        const updatedGallery = gallery.map((p) => (p.url === item.photoURL ? { ...p, status: 'approved' } : p));
        await store.writeDoc('users', item.uid, {
          gallery: updatedGallery,
          updatedAt: { __st: 1 },
          notifications: { __au: [note] },
        }, { merge: true });
      }
    }
    return res.status(200).json({ success: true, message: 'Photo approved successfully.' });
  } catch (error) {
    console.error('[ApprovePhoto]', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/admin/reject-photo', adminRequired, async (req, res) => {
  const { item, reason } = req.body || {};
  if (!item || !validId(item.uid) || !reason) return res.status(400).json({ error: 'Missing required fields.' });
  try {
    const modId = item.isSynthesized || !item.id ? store.uuid() : item.id;
    await store.writeDoc('photoModeration', modId, {
      uid: item.uid,
      userName: item.userName || '',
      photoURL: item.photoURL || '',
      photoType: item.photoType || 'profilePhoto',
      galleryPosition: item.galleryPosition !== undefined ? item.galleryPosition : null,
      photoStatus: 'rejected',
      status: 'rejected',
      uploadedAt: item.uploadedAt || { __st: 1 },
      reviewedAt: { __st: 1 },
      reviewedBy: req.uid || 'system',
      rejectedReason: reason,
    }, { merge: true });

    const userDoc = await store.getDoc('users', item.uid);
    if (userDoc && userDoc.data) {
      const userData = userDoc.data;
      const note = {
        id: crypto.randomUUID(),
        title: item.photoType === 'profilePhoto' ? 'Profile Photo Rejected' : 'Gallery Photo Rejected',
        message: item.photoType === 'profilePhoto'
          ? `Your profile photo was not approved: ${reason}. Please upload a new one.`
          : `Your gallery photo was not approved: ${reason}.`,
        type: 'alert',
        read: false,
        createdAt: new Date().toISOString(),
      };
      if (item.photoType === 'profilePhoto' || !item.photoType) {
        await store.writeDoc('users', item.uid, {
          photoStatus: 'rejected',
          pendingPhotoUrl: '',
          rejectedPhotoUrl: item.photoURL,
          rejectedPhotoReason: reason,
          updatedAt: { __st: 1 },
          notifications: { __au: [note] },
        }, { merge: true });
      } else {
        const gallery = Array.isArray(userData.gallery) ? userData.gallery : [];
        const updatedGallery = gallery.map((p) => (p.url === item.photoURL ? { ...p, status: 'rejected', rejectionReason: reason } : p));
        await store.writeDoc('users', item.uid, {
          gallery: updatedGallery,
          updatedAt: { __st: 1 },
          notifications: { __au: [note] },
        }, { merge: true });
      }
    }
    return res.status(200).json({ success: true, message: 'Photo rejected successfully.' });
  } catch (error) {
    console.error('[RejectPhoto]', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
