// Server-side OTP — port of functions/src/otp.ts.
// OTPs generated with crypto, stored SHA-256-hashed in `otps`, attempt-limited
// (5 tries) and rate-limited (5 req/hr, 2 min cooldown via `otps` + `otp_requests_log`).
const crypto = require('crypto');
const { pool } = require('./db');
const { dispatchEmail, checkEmailRateLimit } = require('./services/email');

const OTP_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
const MAX_REQUESTS_PER_HOUR = 5;
const COOLDOWN_MS = 2 * 60 * 1000;
const VALID_PURPOSES = ['register', 'password_reset', 'contact', 'admin_login', 'delete_account'];

function hashOtp(email, otp) {
  const salt = process.env.OTP_HASH_SALT;
  if (!salt) throw new Error('OTP_HASH_SALT environment variable is required');
  return crypto.createHash('sha256').update(`${salt}:${String(email).toLowerCase()}:${otp}`).digest('hex');
}

async function verifyCaptcha(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // fail-open when unconfigured (same as original)
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('[OTP/Captcha] Verification request failed:', err.message);
    return false;
  }
}

class OtpError extends Error {
  constructor(status, message, code) { super(message); this.status = status; this.code = code; }
}

async function issueOtp(email, purpose, captchaToken) {
  email = String(email || '').trim().toLowerCase();
  purpose = String(purpose || '');
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new OtpError(400, 'A valid email address is required.', 'invalid-argument');
  if (!VALID_PURPOSES.includes(purpose)) throw new OtpError(400, 'Invalid OTP purpose.', 'invalid-argument');
  if (!(await verifyCaptcha(captchaToken))) throw new OtpError(400, 'Captcha verification failed.', 'invalid-argument');

  const [recent] = await pool.query(
    'SELECT COUNT(*) AS n FROM otp_requests_log WHERE email = ? AND purpose = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
    [email, purpose]
  );
  if (recent[0].n >= MAX_REQUESTS_PER_HOUR) {
    throw new OtpError(429, 'Too many OTP requests. Please try again later.', 'resource-exhausted');
  }
  const [existing] = await pool.query('SELECT last_sent_at FROM otps WHERE email = ? AND purpose = ? LIMIT 1', [email, purpose]);
  if (existing.length && existing[0].last_sent_at && Date.now() - new Date(existing[0].last_sent_at).getTime() < COOLDOWN_MS) {
    throw new OtpError(429, 'Please wait 2 minutes before requesting another code.', 'resource-exhausted');
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const hash = hashOtp(email, code);
  await pool.query(
    `INSERT INTO otps (email, purpose, code_hash, attempts, expires_at, last_sent_at)
     VALUES (?, ?, ?, 0, DATE_ADD(NOW(), INTERVAL ${OTP_TTL_MIN} MINUTE), NOW())
     ON DUPLICATE KEY UPDATE code_hash = VALUES(code_hash), attempts = 0,
       expires_at = VALUES(expires_at), last_sent_at = VALUES(last_sent_at)`,
    [email, purpose, hash]
  );
  await pool.query('INSERT INTO otp_requests_log (email, purpose, ip) VALUES (?, ?, ?)', [email, purpose, '']);

  await checkEmailRateLimit(email, `otp_${purpose}`);
  const emailType = purpose === 'password_reset' ? 'password_reset' : 'otp';
  await dispatchEmail(email, code, emailType);
  return true;
}

async function consumeOtp(email, code, purpose) {
  email = String(email || '').trim().toLowerCase();
  purpose = String(purpose || '');
  const [rows] = await pool.query('SELECT * FROM otps WHERE email = ? AND purpose = ? LIMIT 1', [email, purpose]);
  if (!rows.length) return { ok: false, message: 'Invalid or expired code. Request a new code if needed.' };
  const row = rows[0];
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await pool.query('DELETE FROM otps WHERE email = ? AND purpose = ?', [email, purpose]);
    return { ok: false, message: 'This code has expired. Request a new code.' };
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await pool.query('DELETE FROM otps WHERE email = ? AND purpose = ?', [email, purpose]);
    return { ok: false, message: 'Too many failed attempts. Request a new code.' };
  }
  if (row.code_hash !== hashOtp(email, String(code || ''))) {
    await pool.query('UPDATE otps SET attempts = attempts + 1 WHERE email = ? AND purpose = ?', [email, purpose]);
    return { ok: false, message: 'Invalid or expired code. Request a new code if needed.' };
  }
  await pool.query('DELETE FROM otps WHERE email = ? AND purpose = ?', [email, purpose]);
  return { ok: true };
}

module.exports = { issueOtp, consumeOtp, verifyCaptcha, hashOtp, OtpError, VALID_PURPOSES };
