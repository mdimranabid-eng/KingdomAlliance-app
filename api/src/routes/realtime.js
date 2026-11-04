// Realtime-ish endpoints — replace Firebase RTDB presence/typing with heartbeat
// + will-state + lazy sweep, plus FCM token registration and settings.
const express = require('express');
const { pool } = require('../db');
const store = require('../store');
const { authRequired, authOptional } = require('../auth');

const router = express.Router();
const PRESENCE_TTL_SEC = 45; // heartbeat gap before a user is swept to offline
const TYPING_TTL_SEC = 8;

async function sweepStale() {
  await pool.query(
    `UPDATE presence SET state = 'offline', will = NULL, last_changed = NOW()
     WHERE state = 'online' AND last_seen < DATE_SUB(NOW(), INTERVAL ? SECOND)`,
    [PRESENCE_TTL_SEC]
  );
  await pool.query(
    'DELETE FROM typing WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? SECOND)',
    [TYPING_TTL_SEC]
  );
}

// ── Presence ──────────────────────────────────────────────────────────────────
router.post('/presence/:uid', authRequired, async (req, res) => {
  try {
    if (req.params.uid !== req.uid) return res.status(403).json({ error: 'permission-denied' });
    const { state, will } = req.body || {};
    await pool.query(
      `INSERT INTO presence (uid, state, will, last_seen, last_changed) VALUES (?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE state = VALUES(state), will = VALUES(will), last_seen = NOW(), last_changed = NOW()`,
      [req.uid, state === 'online' ? 'online' : 'offline', will ? JSON.stringify(will) : null]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'internal' }); }
});

router.get('/presence', authOptional, async (req, res) => {
  try {
    await sweepStale();
    const uids = String(req.query.uids || '').split(',').filter(Boolean).slice(0, 100);
    if (!uids.length) return res.json({});
    const [rows] = await pool.query('SELECT uid, state, last_changed FROM presence WHERE uid IN (?)', [uids]);
    const out = {};
    for (const r of rows) {
      out[r.uid] = { state: r.state, last_changed: new Date(r.last_changed).getTime() };
    }
    res.json(out);
  } catch (e) { res.status(500).json({ error: 'internal' }); }
});

router.delete('/presence/:uid', authRequired, async (req, res) => {
  try {
    if (req.params.uid !== req.uid) return res.status(403).json({ error: 'permission-denied' });
    await pool.query('DELETE FROM presence WHERE uid = ?', [req.uid]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'internal' }); }
});

// ── Typing indicators ─────────────────────────────────────────────────────────
router.post('/typing/:chatId', authRequired, async (req, res) => {
  try {
    const { value } = req.body || {};
    if (value) {
      await pool.query(
        `INSERT INTO typing (chat_id, uid) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE updated_at = NOW()`,
        [req.params.chatId, req.uid]
      );
    } else {
      await pool.query('DELETE FROM typing WHERE chat_id = ? AND uid = ?', [req.params.chatId, req.uid]);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'internal' }); }
});

router.get('/typing/:chatId', authOptional, async (req, res) => {
  try {
    await sweepStale();
    const [rows] = await pool.query('SELECT uid FROM typing WHERE chat_id = ? AND updated_at > DATE_SUB(NOW(), INTERVAL ? SECOND)', [req.params.chatId, TYPING_TTL_SEC]);
    const out = {};
    for (const r of rows) out[r.uid] = true;
    res.json(out);
  } catch (e) { res.status(500).json({ error: 'internal' }); }
});

// ── FCM token registration (users.fcmTokens arrayUnion/Remove) ────────────────
router.post('/fcm/token', authRequired, async (req, res) => {
  try {
    const { token } = req.body || {};
    if (typeof token !== 'string' || !token) return res.status(400).json({ error: 'invalid-argument' });
    await store.writeDoc('users', req.uid, { fcmTokens: { __au: [token] } }, { merge: true });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'internal' }); }
});

router.delete('/fcm/token', authRequired, async (req, res) => {
  try {
    const { token } = req.body || {};
    if (typeof token !== 'string' || !token) return res.status(400).json({ error: 'invalid-argument' });
    await store.writeDoc('users', req.uid, { fcmTokens: { __ar: [token] } }, { merge: true });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'internal' }); }
});

module.exports = router;
