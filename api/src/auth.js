const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('./db');

// ─────────────────────────────────────────────────────────────────────────────
// Auth: bcrypt passwords + access JWT (short) + refresh token
// (opaque random, hashed in `sessions` table) + role claims.
// ─────────────────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[auth] FATAL: JWT_SECRET env var is required');
  process.exit(1);
}
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TTL_DAYS || 30);

function signAccessToken(user, opts = {}) {
  // Claims mirror the old Firebase custom-claims shape so that anything
  // reading `claims.admin === true` / sign_in_second_factor keeps working.
  return jwt.sign(
    {
      sub: user.id,
      email: user.email || null,
      role: user.role || 'user',
      admin: !!user.isAdmin,
      email_verified: !!user.emailVerified,
      sign_in_second_factor: opts.secondFactor || '',
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const opaque = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// ── Session helpers (sessions table) ──────────────────────────────────────────

async function createSession(userId, userAgent = '') {
  const refreshToken = opaque(48);
  const id = require('./store').uuid();
  await pool.query(
    'INSERT INTO sessions (id, user_id, refresh_token_hash, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))',
    [id, userId, sha256(refreshToken), String(userAgent).slice(0, 250), REFRESH_TTL_DAYS]
  );
  return refreshToken;
}

async function consumeSession(refreshToken) {
  const [rows] = await pool.query(
    'SELECT * FROM sessions WHERE refresh_token_hash = ? AND revoked = 0 AND expires_at > NOW() LIMIT 1',
    [sha256(refreshToken)]
  );
  if (!rows.length) return null;
  await pool.query('UPDATE sessions SET revoked = 1 WHERE id = ?', [rows[0].id]);
  return rows[0].user_id;
}

async function revokeSession(refreshToken) {
  await pool.query('UPDATE sessions SET revoked = 1 WHERE refresh_token_hash = ?', [sha256(refreshToken)]);
}

// ── Middleware ────────────────────────────────────────────────────────────────

function extractToken(req) {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) return h.slice(7);
  const c = req.cookies && req.cookies.ka_access;
  return c || null;
}

function authRequired(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'unauthenticated' });
  try {
    const payload = verifyAccessToken(token);
    req.uid = payload.sub;
    req.email = payload.email;
    req.role = payload.role;
    req.isAdmin = !!payload.admin;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'unauthenticated' });
  }
}

// Allows anonymous, but attaches identity when a valid token exists
function authOptional(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = verifyAccessToken(token);
      req.uid = payload.sub;
      req.email = payload.email;
      req.role = payload.role;
      req.isAdmin = !!payload.admin;
    }
  } catch { /* anonymous */ }
  next();
}

// Old flow double-checked the admins table + email_verified
function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (!req.isAdmin) return res.status(403).json({ error: 'permission-denied' });
    pool
      .query('SELECT email_verified FROM admins WHERE id = ? OR email = ? LIMIT 1', [req.uid, req.email])
      .then(([rows]) => {
        if (!rows.length || !rows[0].email_verified) {
          return res.status(403).json({ error: 'permission-denied' });
        }
        next();
      })
      .catch((e) => {
        console.error('[auth] admin check failed:', e.message);
        res.status(500).json({ error: 'internal' });
      });
  });
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  sha256,
  opaque,
  authRequired,
  authOptional,
  adminRequired,
  createSession,
  consumeSession,
  revokeSession,
  REFRESH_TTL_DAYS,
};
