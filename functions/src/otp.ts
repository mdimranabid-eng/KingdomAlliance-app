import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { dispatchEmail } from './services/emailProvider';

// ============================================================
// Server-side OTP module
// - OTPs are generated server-side (crypto.randomInt)
// - Stored hashed (SHA-256 + salt), never in plaintext
// - Attempt-limited (5 tries) and rate-limited (5 req/hr, 2 min cooldown)
// - temp_otps is inaccessible to clients via Firestore rules;
//   only the Admin SDK (these functions) can touch it.
// ============================================================

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes between OTP requests

const VALID_PURPOSES = ['register', 'password_reset', 'contact', 'admin_login', 'delete_account'];

const db = () => admin.firestore();

export function hashOtp(email: string, otp: string): string {
  const salt = process.env.OTP_HASH_SALT;
  if (!salt) {
    throw new Error('OTP_HASH_SALT environment variable is required. Set it via `firebase functions:secrets:set OTP_HASH_SALT`');
  }
  return crypto
    .createHash('sha256')
    .update(`${salt}:${email.toLowerCase()}:${otp}`)
    .digest('hex');
}

// ─── Cloudflare Turnstile verification (fail-open only when secret is not configured) ───
export async function verifyCaptcha(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[OTP/Captcha] TURNSTILE_SECRET_KEY is not configured — skipping captcha verification. ' +
      'Set it via `firebase functions:secrets:set TURNSTILE_SECRET_KEY` to enforce.');
    return true;
  }
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    });
    const data: any = await res.json();
    if (data.success !== true) {
      // error-codes: 'invalid-input-secret' → wrong secret, 'invalid-input-response' →
      // token expired/already used, 'timeout-or-duplicate' → token replayed
      console.warn('[OTP/Captcha] Turnstile verification rejected:', JSON.stringify(data['error-codes'] || data));
    }
    return data.success === true;
  } catch (err: any) {
    console.error('[OTP/Captcha] Verification request failed:', err.message);
    return false;
  }
}

// ─── Simple per-email/per-type rate limiter backed by Firestore ──────────────
export async function checkEmailRateLimit(
  email: string,
  kind: string,
  maxPerHour = 8
): Promise<void> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const snap = await db()
    .collection('email_log')
    .where('email', '==', email.toLowerCase())
    .where('kind', '==', kind)
    .where('createdAt', '>', since)
    .get();
  if (snap.size >= maxPerHour) {
    throw new Error(`Too many emails sent to ${email} in the last hour. Please try again later.`);
  }
  await db().collection('email_log').add({
    email: email.toLowerCase(),
    kind,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function cleanupOldOtps(email: string): Promise<void> {
  const snap = await db()
    .collection('temp_otps')
    .where('email', '==', email.toLowerCase())
    .get();
  const dels = snap.docs.map(d => d.ref.delete());
  await Promise.all(dels);
}

// ─── Issue an OTP ─────────────────────────────────────────────────────────────
async function issueOtp(emailRaw: string, purpose: string, captchaToken?: string): Promise<void> {
  const email = emailRaw.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 256) {
    throw new HttpsError('invalid-argument', 'Please provide a valid email address.');
  }
  if (!VALID_PURPOSES.includes(purpose)) {
    throw new HttpsError('invalid-argument', 'Invalid OTP purpose.');
  }
  // admin_login is exempt from captcha: admins are already protected by
  // password + mandatory TOTP MFA, and the admin login page has no widget.
  if (purpose !== 'admin_login' && !(await verifyCaptcha(captchaToken))) {
    throw new HttpsError('permission-denied', 'Captcha verification failed. Please try again.');
  }

  // Rate limits: hourly cap + cooldown
  const col = db().collection('temp_otps');
  const recent = await col
    .where('email', '==', email)
    .where('purpose', '==', purpose)
    .where('createdAt', '>', new Date(Date.now() - RATE_LIMIT_WINDOW_MS))
    .get();
  if (recent.size >= MAX_REQUESTS_PER_WINDOW) {
    throw new HttpsError('resource-exhausted', 'Too many OTP requests. Please try again in an hour.');
  }
  const last = await col
    .where('email', '==', email)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (!last.empty) {
    const lastMs = last.docs[0].data().createdAt?.toMillis?.() ?? 0;
    if (Date.now() - lastMs < COOLDOWN_MS) {
      throw new HttpsError('resource-exhausted', 'Please wait a moment before requesting another code.');
    }
  }

  await cleanupOldOtps(email);

  const code = crypto.randomInt(100000, 1000000).toString();
  await col.add({
    email,
    purpose,
    otpHash: hashOtp(email, code),
    attempts: 0,
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + OTP_TTL_MS),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Never reveal whether the account exists (anti-enumeration): always succeed
  try {
    await dispatchEmail(email, code, purpose === 'password_reset' ? 'password_reset' : 'otp');
  } catch (err: any) {
    if (err instanceof HttpsError) throw err;
    console.error(`[OTP] Email dispatch failed for ${email}:`, err.message);
  }

  // Log rate limit after email (non-blocking — index may still be building)
  try {
    await checkEmailRateLimit(email, `otp_${purpose}`);
  } catch (err: any) {
    if (err?.message?.includes('Too many emails')) {
      throw new HttpsError('resource-exhausted', err.message);
    }
    console.warn(`[OTP] Rate limit check skipped for ${email}:`, err.message);
  }
}

// ─── Consume (verify) an OTP — shared with /api/reset-password ────────────────
export async function consumeOtpInternal(
  emailRaw: string,
  code: string,
  purpose: string
): Promise<{ ok: boolean; message?: string }> {
  const email = emailRaw.trim().toLowerCase();
  const snap = await db()
    .collection('temp_otps')
    .where('email', '==', email)
    .get();

  if (snap.empty) {
    return { ok: false, message: 'Invalid or incorrect OTP.' };
  }

  // Pick the newest doc for this purpose
  const docs = snap.docs
    .filter(d => d.data().purpose === purpose)
    .sort((a, b) => (b.data().createdAt?.toMillis?.() ?? 0) - (a.data().createdAt?.toMillis?.() ?? 0));

  if (docs.length === 0) {
    return { ok: false, message: 'Invalid or incorrect OTP.' };
  }

  const otpDoc = docs[0];
  const otpData = otpDoc.data();

  if ((otpData.expiresAt?.toMillis?.() ?? 0) < Date.now()) {
    await otpDoc.ref.delete();
    return { ok: false, message: 'OTP has expired. Please request a new one.' };
  }

  if ((otpData.attempts ?? 0) >= MAX_ATTEMPTS) {
    await otpDoc.ref.delete();
    return { ok: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (otpData.otpHash !== hashOtp(email, code)) {
    await otpDoc.ref.update({ attempts: admin.firestore.FieldValue.increment(1) });
    return { ok: false, message: 'Invalid or incorrect OTP.' };
  }

  await otpDoc.ref.delete();
  return { ok: true };
}

// ─── Callable: request an OTP ────────────────────────────────────────────────
export const requestOtp = onCall(
  { cors: true, secrets: ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT', 'TURNSTILE_SECRET_KEY', 'OTP_HASH_SALT'] },
  async (req) => {
    const { email, purpose, captchaToken } = req.data || {};
    await issueOtp(String(email || ''), String(purpose || ''), captchaToken);
    return { success: true };
  }
);

// ─── Callable: verify an OTP ─────────────────────────────────────────────────
export const verifyOtp = onCall({ cors: true, secrets: ['OTP_HASH_SALT'] }, async (req) => {
  const { email, code, purpose } = req.data || {};
  if (!email || !code) {
    throw new HttpsError('invalid-argument', 'Email and code are required.');
  }
  const result = await consumeOtpInternal(String(email), String(code), String(purpose || 'otp'));
  if (!result.ok) {
    throw new HttpsError('failed-precondition', result.message || 'OTP verification failed.');
  }

  // For registration, check for duplicate email after OTP is verified
  if (String(purpose) === 'register') {
    const cleanEmail = String(email).trim().toLowerCase();

    // Check Firebase Auth directly — avoids Firestore permission issues
    try {
      const existingUser = await admin.auth().getUserByEmail(cleanEmail);
      // If we reach here, the email is already taken
      if (!existingUser.emailVerified) {
        await admin.auth().updateUser(existingUser.uid, { emailVerified: true });
      }
      throw new HttpsError('already-exists', 'This email is already registered. Please sign in instead.');
    } catch (err: any) {
      if (err instanceof HttpsError) throw err;
      // auth/user-not-found is expected — email is available, proceed
    }
  }

  return { success: true };
});

// ─── Scheduled: cleanup expired OTPs daily ───────────────────────────────────
export const cleanupExpiredOtps = onSchedule(
  { schedule: 'every day 04:00', timeZone: 'Asia/Kolkata' },
  async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const expiredSnap = await db
      .collection('temp_otps')
      .where('expiresAt', '<', now)
      .limit(500)
      .get();

    if (expiredSnap.empty) {
      console.log('[OTP Cleanup] No expired OTPs found.');
      return;
    }

    const batch = db.batch();
    expiredSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`[OTP Cleanup] Deleted ${expiredSnap.size} expired OTP document(s).`);
  }
);

