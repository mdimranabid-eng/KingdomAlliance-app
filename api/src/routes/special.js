// Special endpoints — port of the Cloud Function REST API (api.ts) +
// secureEmail + accountDeletion handlers.
const express = require('express');
const { pool } = require('../db');
const store = require('../store');
const { authRequired, adminRequired } = require('../auth');
const { consumeOtp, describeExistingAccount } = require('../otp');
const { dispatchEmail } = require('../services/email');
const { sendOnboardingEmail, deliverOnce } = require('../triggers');

const router = express.Router();
const DELETION_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
const ts = (v) => (v && typeof v === 'object' && typeof v.__ts === 'number' ? v.__ts : 0);

// ── Health ────────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'Kingdom Alliance Node API', timestamp: new Date().toISOString() });
});

function isCompletedOrLockedRow(row) {
  const data = row.data && typeof row.data === 'object' ? row.data : (() => { try { return JSON.parse(row.data || '{}'); } catch { return {}; } })();
  return !!(
    row.onboarding_complete ||
    data.onboardingComplete ||
    (row.approval_status && row.approval_status !== 'incomplete') ||
    (data.approvalStatus && data.approvalStatus !== 'incomplete') ||
    row.is_banned ||
    row.is_suspended ||
    data.isBanned ||
    data.isSuspended ||
    row.deletion_status ||
    data.deletionStatus
  );
}

// ── check-email (registration uniqueness) ─────────────────────────────────────
router.post('/check-email', async (req, res) => {
  const { email, mobileNumber, excludeUid } = req.body || {};
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'Missing email field.' });
  const cleanEmail = email.trim().toLowerCase();
  const safeExcludeUid = typeof excludeUid === 'string' ? excludeUid.trim() : '';
  try {
    const [emailRows] = await pool.query(
      'SELECT id, email, auth_provider, onboarding_complete, approval_status, is_approved, is_banned, is_suspended, deletion_status, data FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );
    let emailTaken = false;
    let emailMessage = '';
    if (emailRows.length > 0) {
      const r = emailRows[0];
      if (r.id !== safeExcludeUid || isCompletedOrLockedRow(r)) {
        emailTaken = true;
        emailMessage = describeExistingAccount(r);
      }
    }

    let mobileTaken = false;
    let mobileMessage = '';
    if (mobileNumber && typeof mobileNumber === 'string') {
      const normalizedDigits = mobileNumber.replace(/[^0-9]/g, '');
      if (normalizedDigits.length >= 7) {
        const [mobileRows] = await pool.query(
          `SELECT id, onboarding_complete, approval_status, is_approved, is_banned, is_suspended, deletion_status, data
           FROM users
           WHERE REGEXP_REPLACE(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(data, '$.mobileNumber')), ''), '[^0-9]', '') = ?
           LIMIT 1`,
          [normalizedDigits]
        );
        if (mobileRows.length > 0) {
          const mr = mobileRows[0];
          if (mr.id !== safeExcludeUid || isCompletedOrLockedRow(mr)) {
            mobileTaken = true;
            mobileMessage = 'This mobile number is already registered with an existing account. You cannot sign up again.';
          }
        }
      }
    }
    return res.status(200).json({ emailTaken, emailMessage, mobileTaken, mobileMessage });
  } catch (error) {
    console.error('❌ [CheckEmail] Failed:', error.message);
    return res.status(500).json({ error: 'Unable to verify uniqueness.' });
  }
});

// ── Account deletion (accountDeletion.ts deleteAccount) ───────────────────────
router.post(['/account/delete', '/delete-account'], authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT role, email FROM users WHERE id = ? LIMIT 1', [req.uid]);
    if (!rows.length) return res.status(404).json({ error: 'Profile not found.' });
    if (rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Administrator accounts require the administrator deletion process.' });
    }
    const user = await store.getDoc('users', req.uid);
    const data = user ? user.data : null;
    if (!data) return res.status(404).json({ error: 'Profile not found.' });
    if (data.deletionStatus === 'deleting') return res.status(409).json({ error: 'Permanent deletion is already in progress.' });
    if (data.deletionStatus === 'pending_deletion' && data.scheduledDeletionAt) {
      return res.json({ success: true, scheduledDeletionAt: ts(data.scheduledDeletionAt), message: 'Deletion already scheduled.' });
    }
    const otp = (req.body || {}).otp;
    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Enter the six-digit email verification code.' });
    }
    const verified = await consumeOtp(rows[0].email, otp, 'delete_account');
    if (!verified.ok) return res.status(400).json({ error: verified.message });
    const at = Date.now() + DELETION_GRACE_MS;
    await store.writeDoc('users', req.uid, {
      deletionStatus: 'pending_deletion', deletionRequestedAt: { __st: 1 },
      scheduledDeletionAt: { __ts: at }, deletionReminderSent: false, updatedAt: { __st: 1 },
    }, { merge: true });
    try {
      await dispatchEmail(rows[0].email, null, 'account_deletion_scheduled',
        new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' }));
    } catch (e) { console.error('[account/delete] email failed:', e.message); }
    return res.json({ success: true, scheduledDeletionAt: at, message: 'Deletion scheduled. Sign in and choose Reactivate before the deadline to cancel.' });
  } catch (e) {
    console.error('[account/delete]', e);
    res.status(500).json({ error: 'Unable to update account deletion. Please try again.' });
  }
});


// ── Account reactivation ──────────────────────────────────────────────────────
router.post(['/account/reactivate', '/reactivate-account'], authRequired, async (req, res) => {
  try {
    const user = await store.getDoc('users', req.uid);
    if (!user) return res.status(404).json({ error: 'Profile not found.' });
    const d = user.data;
    if (d.deletionStatus === 'deleting' ||
      (d.deletionStatus === 'pending_deletion' && ts(d.scheduledDeletionAt) <= Date.now())) {
      return res.status(409).json({ error: 'The recovery period has ended. This account cannot be reactivated.' });
    }
    if (d.deletionStatus === 'pending_deletion') {
      await store.writeDoc('users', req.uid, {
        deletionStatus: { __df: 1 }, deletionRequestedAt: { __df: 1 },
        scheduledDeletionAt: { __df: 1 }, deletionReminderSent: { __df: 1 }, updatedAt: { __st: 1 },
      }, { merge: true });
      const [rows] = await pool.query('SELECT email FROM users WHERE id = ? LIMIT 1', [req.uid]);
      try { if (rows.length) await dispatchEmail(rows[0].email, null, 'account_reactivated'); } catch { /* non-blocking */ }
    }
    return res.json({ success: true, message: 'Your account is active.' });
  } catch (e) {
    console.error('[account/reactivate]', e);
    res.status(500).json({ error: 'Unable to update account deletion. Please try again.' });
  }
});

// ── Contact form ──────────────────────────────────────────────────────────────
router.post('/contact', async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.name || !data.email || !data.mobile || !data.subject || !data.message) {
      return res.status(400).json({ error: 'Missing fields.' });
    }
    const id = await store.addDoc('contact_messages', { ...data, status: 'new', createdAt: { __st: 1 } });
    res.json({ success: true, id });
  } catch (e) {
    console.error('[contact]', e.message);
    res.status(500).json({ error: 'Unable to submit contact message.' });
  }
});

// ── Secure email endpoints (secureEmail.ts) ───────────────────────────────────
router.post('/send-email', authRequired, async (req, res) => {
  try {
    const { type, interestId } = req.body || {};
    if (!['connection_request', 'connection_accepted'].includes(type) || typeof interestId !== 'string') {
      return res.status(400).json({ error: 'Use the dedicated account endpoints for account emails.' });
    }
    const request = type === 'connection_request';
    const interest = await store.getDoc('interests', interestId);
    const iData = interest ? interest.data : null;
    if (!iData || (request ? iData.fromId : iData.toId) !== req.uid ||
      iData.status !== (request ? 'pending' : 'accepted')) {
      return res.status(403).json({ error: 'No matching connection action.' });
    }
    const sender = await store.getDoc('users', req.uid);
    const sData = sender ? sender.data : {};
    if (!sData.isApproved || sData.isBanned || sData.isSuspended) {
      return res.status(403).json({ error: 'An approved active account is required.' });
    }
    const recipientId = request ? iData.toId : iData.fromId;
    const recipient = await store.getDoc('users', recipientId);
    if (!recipient || !recipient.data.email) return res.status(409).json({ error: 'Recipient has no email.' });
    const [lim] = await pool.query(
      'SELECT COUNT(*) AS n FROM email_log WHERE email = ? AND template = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
      [String(recipient.data.email).toLowerCase(), type]
    );
    if (lim[0].n >= 8) return res.status(429).json({ error: 'Too many notification emails. Try again later.' });
    const sent = await deliverOnce(`${type}_${interestId}`, async () => {
      await pool.query('INSERT INTO email_log (email, template, ok) VALUES (?, ?, 1)',
        [String(recipient.data.email).toLowerCase(), type]);
      await dispatchEmail(recipient.data.email, null, type, null,
        String(sData.name || sData.fullName || 'A member').replace(/[<>&"']/g, ''));
    });
    return res.json({ success: true, sent });
  } catch (error) {
    console.error('[SecureEmail] Delivery failed:', error);
    return res.status(500).json({ error: 'Unable to send email.' });
  }
});

router.post('/send-onboarding-email', authRequired, async (req, res) => {
  try {
    const uid = (req.body || {}).uid;
    if (typeof uid !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(uid)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }
    if (uid !== req.uid && !req.isAdmin) {
      return res.status(403).json({ error: 'Only the owner or an administrator may request this email.' });
    }
    const sent = await sendOnboardingEmail(uid);
    return res.json({ success: true, sent });
  } catch (error) {
    console.error('[SecureEmail] Onboarding failed:', error);
    return res.status(500).json({ error: 'Unable to send email.' });
  }
});

module.exports = router;
