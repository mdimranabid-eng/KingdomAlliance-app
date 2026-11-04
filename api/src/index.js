// Kingdom Alliance Node API — Express app for Hostinger (Passenger-compatible).
// Serves: /api/* (this API), /uploads/* (user photos), and the built SPA (dist/).
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { pool, initDb } = require('./db');
const store = require('./store');
const { startCron, JOBS } = require('./cron');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(require('cors')({ origin: corsOrigin === '*' ? true : corsOrigin.split(','), credentials: false }));
app.use(express.json({ limit: '12mb' }));

const filesRouter = require('./routes/files');

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/fs'));
app.use('/api', require('./routes/special'));
app.use('/api', require('./routes/realtime'));
app.use('/api', filesRouter);
app.use('/api', require('./routes/adminApi'));

// ── Cron endpoints (secret-protected; also run in-process) ────────────────────
app.post('/api/cron/:job', async (req, res) => {
  if (!process.env.CRON_SECRET || req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const job = JOBS[req.params.job];
  if (!job) return res.status(404).json({ error: 'unknown job' });
  try { await job(); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Static: uploads + SPA ─────────────────────────────────────────────────────
app.get('/uploads/*', filesRouter.serveUpload);

const DIST = path.resolve(process.cwd(), process.env.DIST_DIR || '../dist');
if (fs.existsSync(path.join(DIST, 'index.html'))) {
  app.use(express.static(DIST, { index: false, maxAge: '1y', setHeaders: (res, p) => { if (p.endsWith('index.html')) res.setHeader('Cache-Control', 'no-store'); } }));
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => res.sendFile(path.join(DIST, 'index.html')));
  console.log(`[spa] serving built frontend from ${DIST}`);
} else {
  console.log(`[spa] no dist/ found at ${DIST} — API-only mode`);
}

// ── Errors ────────────────────────────────────────────────────────────────────
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[express]', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: { code: 'storage/too-large', message: 'File too large.' } });
  res.status(500).json({ error: 'internal' });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function bootstrapAdmin() {
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) return;
  const [existingUsers] = await pool.query('SELECT id, role, password_hash FROM users WHERE email = ? LIMIT 1', [email]);
  let uid;
  if (existingUsers.length > 0) {
    uid = existingUsers[0].id;
    if (existingUsers[0].role !== 'admin' || !existingUsers[0].password_hash) {
      await store.writeDoc('users', uid, {
        uid, email, fullName: 'System Administrator', role: 'admin',
        approvalStatus: 'approved', onboardingComplete: true, emailVerified: true,
        isSuspended: false, isBanned: false, authProvider: 'email',
      }, { merge: true });
      if (!existingUsers[0].password_hash) {
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(password, 10), uid]);
      }
      await pool.query('UPDATE users SET role = ?, email_verified = 1 WHERE id = ?', ['admin', uid]);
    }
  } else {
    const [rows] = await pool.query('SELECT COUNT(*) AS n FROM admins');
    if (rows[0].n > 0) return;
    uid = store.uuid();
    await store.writeDoc('users', uid, {
      uid, email, fullName: 'System Administrator', role: 'admin',
      approvalStatus: 'approved', onboardingComplete: true, emailVerified: true,
      isSuspended: false, isBanned: false, authProvider: 'email',
      createdAt: { __st: 1 }, lastActive: { __st: 1 },
    }, { merge: false, createOnly: true });
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(password, 10), uid]);
  }
  await pool.query(
    `INSERT INTO admins (id, email, email_verified, data) VALUES (?, ?, 1, ?)
     ON DUPLICATE KEY UPDATE id = VALUES(id), email_verified = 1, data = VALUES(data)`,
    [uid, email, JSON.stringify({ uid, email, role: 'admin', isAdmin: true, emailVerified: true, permissions: ['*'] })]
  );
  console.log(`[bootstrap] admin account ready for ${email}`);
}

async function main() {
  const ok = await initDb();
  if (ok) {
    await bootstrapAdmin().catch((e) => console.error('[bootstrap]', e.message));
    await filesRouter.reconcileUploads(pool).catch((e) => console.error('[uploads]', e.message));
    startCron();
  }
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => console.log(`[api] Kingdom Alliance API listening on :${port}`));
}

// Passenger requires this module as the startup file (require.main !== module),
// so boot unconditionally; app.listen uses the Passenger-provided PORT when set.
main();

module.exports = app;
