// Auth routes — replaces Firebase Auth (email/password, Google, TOTP MFA, JWT sessions).
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../db');
const store = require('../store');
const totp = require('../totp');
const {
  signAccessToken, verifyAccessToken, sha256, authRequired,
  createSession, consumeSession, revokeSession,
} = require('../auth');
const { issueOtp, consumeOtp, describeExistingAccount } = require('../otp');
const { dispatchEmail } = require('../services/email');

const router = express.Router();
const INITIAL_PROFILE = {
  role: 'user', approvalStatus: 'incomplete', onboardingComplete: false, emailVerified: false,
  isSuspended: false, isBanned: false, photoUrl: '', authProvider: 'email',
  dob: '', age: 0, gender: '', height: '', weight: '', complexion: '', motherTongue: '',
  nationality: '', maritalStatus: '', denomination: '', churchName: '', ministryRole: '',
  mobileNumber: '', aboutMe: '', education: '', fieldOfStudy: '', college: '', profession: '',
  employmentType: '', annualIncome: '', fathersName: '', fathersOccupation: '', mothersName: '',
  mothersOccupation: '', numberOfSiblings: '', familyType: '', familyFaithBackground: '',
  hobbies: [], languagesKnown: [], dietaryHabits: '', drinkingHabits: '', smokingHabits: '',
  partnerPreferences: { ageRange: '', heightRange: '', education: '', location: '' },
};

async function findUserRow(email) {
  const [rows] = await pool.query(
    'SELECT id, email, password_hash, role, auth_provider, approval_status, onboarding_complete, is_approved, totp_secret, totp_enabled, email_verified, is_banned, is_suspended, deletion_status, data FROM users WHERE email = ? LIMIT 1',
    [String(email || '').trim().toLowerCase()]
  );
  return rows.length ? rows[0] : null;
}

async function sendTokens(res, row, secondFactor) {
  const isAdmin = row.role === 'admin';
  const accessToken = signAccessToken(
    { id: row.id, email: row.email, role: row.role, isAdmin, emailVerified: !!row.email_verified },
    { secondFactor: secondFactor || '' }
  );
  const refreshToken = await createSession(row.id);
  return {
    accessToken, refreshToken,
    user: publicUser(row, { admin: isAdmin, secondFactor: secondFactor || '' }),
  };
}

function publicUser(row, extra = {}) {
  const data = row.data && typeof row.data === 'object' ? row.data : JSON.parse(row.data || '{}');
  return {
    uid: row.id,
    email: row.email,
    emailVerified: !!row.email_verified || !!data.emailVerified,
    authProvider: row.auth_provider || data.authProvider || 'email',
    displayName: data.fullName || data.name || '',
    photoURL: data.photoURL || data.photoUrl || '',
    role: row.role,
    mfaEnrolled: !!row.totp_enabled,
    ...extra,
  };
}

function authError(code, message, status = 400, extra = {}) {
  const e = new Error(message); e.code = code; e.status = status; Object.assign(e, extra);
  return e;
}

// ── Register (called after OTP 'register' verification, like createUserWithEmailAndPassword) ──
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) throw authError('auth/invalid-email', 'Invalid email address.');
    if (typeof password !== 'string' || password.length < 8) throw authError('auth/weak-password', 'Password must be at least 8 characters.');
    const existingRow = await findUserRow(cleanEmail);
    if (existingRow) throw authError('auth/email-already-in-use', describeExistingAccount(existingRow), 409);

    const uid = store.uuid();
    await store.writeDoc('users', uid, {
      uid, email: cleanEmail, fullName: String(fullName || '').slice(0, 128),
      ...INITIAL_PROFILE, createdAt: { __st: 1 }, lastActive: { __st: 1 },
    }, { merge: false, createOnly: true });
    await pool.query('UPDATE users SET password_hash = ?, last_login_at = NOW() WHERE id = ?',
      [await bcrypt.hash(password, 10), uid]);

    const row = await findUserRow(cleanEmail);
    const out = await sendTokens(res, row, '');
    res.json(out);
  } catch (e) {
    if (e.code && String(e.code).startsWith('auth/')) return res.status(e.status || 400).json({ error: { code: e.code, message: e.message } });
    console.error('[auth/register]', e);
    res.status(500).json({ error: { code: 'internal', message: 'Registration failed.' } });
  }
});


// ── Login (email + password; TOTP second factor when enrolled) ────────────────
async function loginFlow(req, res, { requireAdmin = false } = {}) {
  const { email, password } = req.body || {};
  const row = await findUserRow(email);
  const ok = row && row.password_hash && await bcrypt.compare(String(password || ''), row.password_hash);
  if (!row || !ok) throw authError('auth/invalid-credential', 'Invalid email or password.', 401);
  const data = row.data && typeof row.data === 'object' ? row.data : JSON.parse(row.data || '{}');
  if (data.isBanned || data.isSuspended) throw authError('auth/user-disabled', 'This account has been disabled.', 403);
  if (requireAdmin && row.role !== 'admin') throw authError('auth/invalid-credential', 'Not an administrator account.', 403);
  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [row.id]);

  if (row.totp_enabled && row.totp_secret) {
    const ticket = crypto.randomBytes(24).toString('hex');
    await pool.query(
      `INSERT INTO verification_tokens (user_id, token_hash, purpose, expires_at)
       VALUES (?, ?, 'mfa', DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
      [row.id, sha256(ticket)]
    );
    return res.json({ mfaRequired: true, ticket, hint: publicUser(row) });
  }
  const out = await sendTokens(res, row, '');
  if (requireAdmin) out.needsMfaEnrollment = true;
  res.json(out);
}

router.post(['/auth/login', '/auth/admin-login'], async (req, res) => {
  try {
    await loginFlow(req, res, { requireAdmin: req.path.endsWith('admin-login') });
  } catch (e) {
    if (e.code && String(e.code).startsWith('auth/')) return res.status(e.status || 400).json({ error: { code: e.code, message: e.message } });
    console.error('[auth/login]', e);
    res.status(500).json({ error: { code: 'internal', message: 'Login failed.' } });
  }
});

// ── MFA challenge (TOTP) ──────────────────────────────────────────────────────
router.post('/auth/mfa/challenge', async (req, res) => {
  try {
    const { ticket, code } = req.body || {};
    const [rows] = await pool.query(
      "SELECT * FROM verification_tokens WHERE token_hash = ? AND purpose = 'mfa' AND used = 0 AND expires_at > NOW() LIMIT 1",
      [sha256(String(ticket || ''))]
    );
    if (!rows.length) return res.status(401).json({ error: { code: 'auth/invalid-verification-code', message: 'Session expired. Sign in again.' } });
    const [userRows] = await pool.query('SELECT id, email, password_hash, role, auth_provider, totp_secret, totp_enabled, email_verified, data FROM users WHERE id = ? LIMIT 1', [rows[0].user_id]);
    const row = userRows[0];
    if (!row || !totp.verifyTotp(row.totp_secret, String(code || ''))) {
      return res.status(401).json({ error: { code: 'auth/invalid-verification-code', message: 'Invalid verification code.' } });
    }
    await pool.query('UPDATE verification_tokens SET used = 1 WHERE id = ?', [rows[0].id]);
    res.json(await sendTokens(res, row, 'totp'));
  } catch (e) { console.error('[auth/mfa/challenge]', e); res.status(500).json({ error: { code: 'internal', message: 'Challenge failed.' } }); }
});

// ── Google sign-in (GIS ID token) ─────────────────────────────────────────────
router.post('/auth/google', async (req, res) => {
  try {
    const { idToken, mode } = req.body || {};
    if (!idToken) return res.status(400).json({ error: { code: 'auth/invalid-credential', message: 'Missing Google credential.' } });
    const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    const info = await r.json();
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!info || !info.email || info.email_verified !== 'true' || (clientId && info.aud !== clientId)) {
      return res.status(401).json({ error: { code: 'auth/invalid-credential', message: 'Google sign-in could not be verified.' } });
    }
    let row = await findUserRow(info.email);
    if (row) {
      const data = row.data && typeof row.data === 'object' ? row.data : (() => { try { return JSON.parse(row.data || '{}'); } catch { return {}; } })();
      const isAlreadyRegistered =
        !!row.onboarding_complete ||
        !!data.onboardingComplete ||
        (row.approval_status && row.approval_status !== 'incomplete') ||
        (data.approvalStatus && data.approvalStatus !== 'incomplete') ||
        !!row.is_banned ||
        !!row.is_suspended ||
        !!data.isBanned ||
        !!data.isSuspended ||
        !!row.deletion_status ||
        !!data.deletionStatus ||
        row.auth_provider === 'email';

      if (mode === 'register' && isAlreadyRegistered) {
        return res.status(409).json({
          error: {
            code: 'auth/email-already-in-use',
            message: describeExistingAccount(row),
          },
        });
      }
      if (row.is_banned || data.isBanned || row.is_suspended || data.isSuspended) {
        return res.status(403).json({
          error: {
            code: 'auth/user-disabled',
            message: 'This account has been suspended or disabled.',
          },
        });
      }
    } else {
      const uid = store.uuid();
      await store.writeDoc('users', uid, {
        uid, email: info.email.toLowerCase(), fullName: info.name || '',
        photoUrl: info.picture || '', ...INITIAL_PROFILE, authProvider: 'google',
        emailVerified: true, createdAt: { __st: 1 }, lastActive: { __st: 1 },
      }, { merge: false, createOnly: true });
      row = await findUserRow(info.email);
    }
    res.json(await sendTokens(res, row, ''));
  } catch (e) { console.error('[auth/google]', e); res.status(500).json({ error: { code: 'internal', message: 'Google sign-in failed.' } }); }
});

// ── Refresh / logout ──────────────────────────────────────────────────────────
router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken, accessToken } = req.body || {};
    const uid = await consumeSession(refreshToken);
    if (!uid) return res.status(401).json({ error: { code: 'auth/user-token-expired', message: 'Session expired.' } });
    let secondFactor = '';
    try {
      const payload = verifyAccessToken(String(accessToken || ''));
      secondFactor = payload.sign_in_second_factor || '';
    } catch { /* expired access token is fine — keep last known factor */ }
    const [rows] = await pool.query('SELECT id, email, password_hash, role, auth_provider, totp_secret, totp_enabled, email_verified, data FROM users WHERE id = ? LIMIT 1', [uid]);
    if (!rows.length) return res.status(401).json({ error: { code: 'auth/user-not-found', message: 'Account not found.' } });
    res.json(await sendTokens(res, rows[0], rows[0].totp_enabled ? secondFactor : ''));
  } catch (e) { console.error('[auth/refresh]', e); res.status(500).json({ error: { code: 'internal', message: 'Refresh failed.' } }); }
});


// ── Me ────────────────────────────────────────────────────────────────────────
router.get('/auth/me', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, password_hash, role, auth_provider, totp_secret, totp_enabled, email_verified, data FROM users WHERE id = ? LIMIT 1', [req.uid]);
    if (!rows.length) return res.status(404).json({ error: { code: 'auth/user-not-found' } });
    const payload = verifyAccessToken(req.headers.authorization.slice(7));
    res.json(publicUser(rows[0], { admin: rows[0].role === 'admin', secondFactor: payload.sign_in_second_factor || '' }));
  } catch (e) { res.status(500).json({ error: { code: 'internal' } }); }
});

// ── MFA enrollment (TOTP) ─────────────────────────────────────────────────────
router.post('/auth/mfa/enroll/start', authRequired, async (req, res) => {
  try {
    const secret = totp.generateSecret();
    await pool.query('UPDATE users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?', [secret, req.uid]);
    res.json({ secret, qrCodeUri: totp.provisioningUri(secret, req.email || ''), email: req.email });
  } catch (e) { res.status(500).json({ error: { code: 'internal' } }); }
});

router.post('/auth/mfa/enroll/confirm', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT totp_secret FROM users WHERE id = ? LIMIT 1', [req.uid]);
    if (!rows.length || !rows[0].totp_secret) {
      return res.status(400).json({ error: { code: 'auth/invalid-verification-code', message: 'Start enrollment first.' } });
    }
    if (!totp.verifyTotp(rows[0].totp_secret, String((req.body || {}).code || ''))) {
      return res.status(401).json({ error: { code: 'auth/invalid-verification-code', message: 'Invalid verification code.' } });
    }
    await pool.query('UPDATE users SET totp_enabled = 1 WHERE id = ?', [req.uid]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: { code: 'internal' } }); }
});

// ── OTP callables (requestOtp / verifyOtp) ────────────────────────────────────
router.post('/otp/request', async (req, res) => {
  try {
    const { email, purpose, captchaToken } = req.body || {};
    if (purpose === 'admin_login' || purpose === 'delete_account') {
      let payload;
      try { payload = verifyAccessToken((req.headers.authorization || '').replace(/^Bearer\s+/, '')); } catch { payload = null; }
      if (!payload) return res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign in first.' } });
      const [rows] = await pool.query('SELECT role, email FROM users WHERE id = ? LIMIT 1', [payload.sub]);
      const isSelf = rows.length && String(rows[0].email).toLowerCase() === String(email || '').trim().toLowerCase();
      if (purpose === 'admin_login' && (!rows.length || rows[0].role !== 'admin' || !isSelf)) {
        return res.status(403).json({ error: { code: 'permission-denied', message: 'Request verification for your own administrator email.' } });
      }
      if (purpose === 'delete_account' && (!rows.length || rows[0].role === 'admin' || !isSelf)) {
        return res.status(403).json({ error: { code: 'permission-denied', message: 'You can only request a deletion code for your own member account.' } });
      }
    }
    await require('../otp').issueOtp(String(email || ''), String(purpose || ''), captchaToken);
    res.json({ result: { success: true }, success: true });
  } catch (e) {
    res.status(e.status || 400).json({ error: { code: e.code || 'failed-precondition', message: e.message } });
  }
});

router.post('/otp/verify', async (req, res) => {
  try {
    const { email, code, purpose } = req.body || {};
    if (purpose === 'delete_account' || purpose === 'admin_login') {
      return res.status(400).json({ error: { code: 'failed-precondition', message: 'Confirm deletion through the account deletion endpoint.' } });
    }
    const result = await require('../otp').consumeOtp(String(email || ''), String(code || ''), String(purpose || 'otp'));
    if (!result.ok) return res.status(400).json({ error: { code: 'failed-precondition', message: result.message } });
    if (String(purpose) === 'register') {
      const row = await findUserRow(email);
      if (row) {
        const isUnverifiedEmailDraft =
          row.auth_provider === 'email' &&
          !row.email_verified &&
          !row.onboarding_complete &&
          (row.approval_status === 'incomplete' || !row.approval_status) &&
          !row.is_banned &&
          !row.is_suspended &&
          !row.deletion_status;
        if (!isUnverifiedEmailDraft) {
          return res.status(409).json({ error: { code: 'already-exists', message: describeExistingAccount(row) } });
        }
      }
    }
    res.json({ result: { success: true }, success: true });
  } catch (e) {
    res.status(400).json({ error: { code: 'failed-precondition', message: e.message } });
  }
});

// ── Reset password (OTP-verified) ─────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body || {};
  if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Missing required fields.' });
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }
  try {
    const result = await require('../otp').consumeOtp(email, otp, 'password_reset');
    if (!result.ok) return res.status(400).json({ success: false, message: result.message });
    const row = await findUserRow(email);
    if (!row) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset has been processed.' });
    }
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(newPassword, 10), row.id]);
    try { await dispatchEmail(row.email, null, 'password_reset_success'); } catch (e) { console.error('[reset-password] email failed:', e.message); }
    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Password Reset Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during password reset.' });
  }
});

// ── Verify admin email (OTP admin_login) ──────────────────────────────────────
router.post('/verify-admin-email', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT role, email FROM users WHERE id = ? LIMIT 1', [req.uid]);
    if (!rows.length || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Requires administrator status' });
    }
    const result = await require('../otp').consumeOtp(rows[0].email || '', String((req.body || {}).otp || ''), 'admin_login');
    if (!result.ok) return res.status(400).json({ error: result.message });
    await pool.query(
      `INSERT INTO admins (id, email, email_verified, data) VALUES (?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE email_verified = 1`,
      [req.uid, String(rows[0].email).toLowerCase(), JSON.stringify({ email: rows[0].email, emailVerified: true })]
    );
    await store.writeDoc('users', req.uid, { emailVerified: true }, { merge: true });
    res.json({ success: true });
  } catch (e) {
    console.error('[verify-admin-email]', e);
    res.status(500).json({ error: 'Unable to verify admin email.' });
  }
});

router.post('/auth/mfa/unenroll', authRequired, async (req, res) => {
  try {
    await pool.query("UPDATE users SET totp_secret = '', totp_enabled = 0 WHERE id = ?", [req.uid]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: { code: 'internal' } }); }
});

router.post('/auth/logout', async (req, res) => {
  try { await revokeSession((req.body || {}).refreshToken); } catch { /* ignore */ }
  res.json({ ok: true });
});

module.exports = router;

