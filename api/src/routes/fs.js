// Firestore-compatible REST layer. The frontend shim (src/lib/fbc/*) talks to
// these endpoints; every request passes through rules.js (ported firestore.rules).
const express = require('express');
const { verifyAccessToken } = require('../auth');
const store = require('../store');
const rules = require('../rules');
const { onDocWrite } = require('../triggers');

const router = express.Router();

function authOf(req) {
  const h = req.headers.authorization;
  const token = h && h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return null;
  try {
    const p = verifyAccessToken(token);
    return { uid: p.sub, email: p.email, admin: !!p.admin && !!p.sign_in_second_factor, role: p.role, secondFactor: p.sign_in_second_factor || '' };
  } catch { return null; }
}

async function callerContext(req) {
  const auth = authOf(req);
  let callerUserDoc = null;
  if (auth) {
    const u = await store.getDoc('users', auth.uid);
    callerUserDoc = u ? u.data : null;
  }
  return { auth, callerUserDoc };
}

const parsePath = (p) => (
  Array.isArray(p)
    ? p.flatMap((s) => String(s || '').split('/'))
    : String(p || '').split('/')
).filter(Boolean);

function errRes(res, e) {
  const status = e.code === 'permission-denied' ? 403
    : e.code === 'not-found' ? 404
    : e.code === 'already-exists' ? 409
    : e.code === 'invalid-argument' ? 400 : 500;
  if (status === 500) console.error('[fs]', e);
  res.status(status).json({ error: e.code || 'internal', message: e.message });
}

const docPayload = (d, collPath) => ({ id: d.id, data: d.data, path: `${collPath}/${d.id}`, updatedMs: d.updatedMs });

async function extraChecks(result) {
  if (result && result.needTarget) {
    const target = await store.getDoc('users', result.needTarget);
    if (!target) throw Object.assign(new Error('Target user does not exist'), { code: 'invalid-argument' });
  }
  if (result && result.needInterest) {
    let interest = await store.getDoc('interests', result.needInterest);
    if (!interest || interest.data.status !== 'accepted') {
      const parts = String(result.needInterest).split('_');
      if (parts.length === 2) {
        const docs = await store.queryDocs('interests', {
          wheres: [
            {
              composite: 'or',
              filters: [
                {
                  composite: 'and',
                  filters: [
                    { field: 'fromId', op: '==', value: parts[0] },
                    { field: 'toId', op: '==', value: parts[1] }
                  ]
                },
                {
                  composite: 'and',
                  filters: [
                    { field: 'fromId', op: '==', value: parts[1] },
                    { field: 'toId', op: '==', value: parts[0] }
                  ]
                }
              ]
            }
          ]
        });
        const matched = docs.find((d) => d.data && d.data.status === 'accepted');
        if (matched) interest = matched;
      }
    }
    if (!interest || interest.data.status !== 'accepted') {
      throw Object.assign(new Error('Messages require an accepted connection'), { code: 'permission-denied' });
    }
  }
}

// ── Query ─────────────────────────────────────────────────────────────────────
router.post('/fs/query', async (req, res) => {
  try {
    const { path, wheres, orderBys, limit, collectionGroup } = req.body || {};
    const segs = parsePath(path);
    if (!segs.length || segs.length % 2 === 0) return res.status(400).json({ error: 'invalid-argument', message: 'path must be a collection path' });
    const ctx = await callerContext(req);
    const collPath = segs.join('/');
    const result = await rules.check({ ...ctx, op: 'list', collPath, id: null });
    let docs = await store.queryDocs(collPath, { wheres, orderBys, limit, collectionGroup });
    if (result && result.filter) docs = docs.filter((d) => result.filter(d.data));
    res.json({ docs: docs.map((d) => docPayload(d, collPath)) });
  } catch (e) { errRes(res, e); }
});

// ── Watch (polling snapshot for onSnapshot) ───────────────────────────────────
router.post('/fs/watch', async (req, res) => {
  try {
    const { docPath, path, wheres, orderBys, limit, collectionGroup } = req.body || {};
    const ctx = await callerContext(req);
    if (docPath) {
      const segs = parsePath(docPath);
      if (segs.length % 2 !== 0) return res.status(400).json({ error: 'invalid-argument' });
      const id = segs.pop();
      const collPath = segs.join('/');
      const d = await store.getDoc(collPath, id);
      try {
        await rules.check({ ...ctx, op: 'get', collPath, id, existing: d ? d.data : null });
      } catch { return res.json({ docs: [] }); }
      return res.json({ docs: d ? [docPayload(d, collPath)] : [] });
    }
    const segs = parsePath(path);
    const collPath = segs.join('/');
    const result = await rules.check({ ...ctx, op: 'list', collPath, id: null });
    let docs = await store.queryDocs(collPath, { wheres, orderBys, limit, collectionGroup });
    if (result && result.filter) docs = docs.filter((d) => result.filter(d.data));
    res.json({ docs: docs.map((d) => docPayload(d, collPath)) });
  } catch (e) { errRes(res, e); }
});

// ── Get doc ───────────────────────────────────────────────────────────────────
router.get('/fs/*', async (req, res) => {
  try {
    const segs = parsePath(req.params[0]);
    if (!segs.length || segs.length % 2 !== 0) return res.status(400).json({ error: 'invalid-argument' });
    const id = segs.pop();
    const collPath = segs.join('/');
    const ctx = await callerContext(req);
    const d = await store.getDoc(collPath, id);
    await rules.check({ ...ctx, op: 'get', collPath, id, existing: d ? d.data : null });
    if (!d) return res.json({ exists: false, id });
    res.json({ exists: true, ...docPayload(d, collPath) });
  } catch (e) { errRes(res, e); }
});


// ── Shared write executor (also used by batch/transaction) ────────────────────
async function applyWrite(ctx, opKind, collPath, id, data, opts = {}) {
  const existing = await store.getDoc(collPath, id);
  const now = Date.now();
  const future = opKind === 'create'
    ? store.mergeDoc(null, data, now, false)
    : store.mergeDoc(existing && existing.data, data, now, opKind === 'update' || opts.merge);
  if (existing && existing.data.createdAt !== undefined) {
    if (future.createdAt === undefined || (collPath === 'users' && existing.data.onboardingComplete === false)) {
      future.createdAt = existing.data.createdAt;
      if (data && typeof data === 'object' && 'createdAt' in data) {
        data = { ...data, createdAt: existing.data.createdAt };
      }
    }
  }
  const ruleOp = opKind === 'delete' ? 'delete' : existing ? 'update' : 'create';
  const result = await rules.check({
    ...ctx, op: ruleOp, collPath, id,
    incoming: ruleOp === 'delete' ? null : future,
    existing: existing ? existing.data : null,
  });
  await extraChecks(result);
  if (ruleOp === 'delete') {
    await store.deleteDoc(collPath, id);
  } else if (opKind === 'create') {
    await store.writeDoc(collPath, id, future, { merge: false });
  } else if (opKind === 'update') {
    if (!existing) throw Object.assign(new Error('not-found'), { code: 'not-found' });
    await store.writeDoc(collPath, id, data, { merge: true, mustExist: true });
  } else { // set (replace or merge)
    await store.writeDoc(collPath, id, data, { merge: !!opts.merge });
  }
  // Triggers (port of Firestore triggers). Fire-and-log so email/FCM failures
  // never fail the client write.
  const after = ruleOp === 'delete' ? null : await store.getDoc(collPath, id);
  onDocWrite(collPath, id, existing ? existing.data : null, after ? after.data : null);
  return { id, data: after ? after.data : null, existed: !!existing };
}

function resolveDocPath(bodyPath) {
  const segs = parsePath(bodyPath);
  if (!segs.length || segs.length % 2 !== 0) {
    throw Object.assign(new Error('path must be a doc path'), { code: 'invalid-argument' });
  }
  const id = segs.pop();
  return { collPath: segs.join('/'), id };
}

// ── setDoc (PUT) ──────────────────────────────────────────────────────────────
router.put('/fs/*', async (req, res) => {
  try {
    const segs = parsePath(req.params[0]);
    if (!segs.length || segs.length % 2 !== 0) return res.status(400).json({ error: 'invalid-argument' });
    const id = segs.pop();
    const collPath = segs.join('/');
    const { data, merge } = req.body || {};
    const ctx = await callerContext(req);
    const result = await applyWrite(ctx, 'set', collPath, id, data || {}, { merge: !!merge });
    res.json({ ok: true, id: result.id });
  } catch (e) { errRes(res, e); }
});

// ── updateDoc (PATCH) ─────────────────────────────────────────────────────────
router.patch('/fs/*', async (req, res) => {
  try {
    const { collPath, id } = resolveDocPath(req.params[0]);
    const ctx = await callerContext(req);
    const result = await applyWrite(ctx, 'update', collPath, id, req.body || {});
    res.json({ ok: true, id: result.id });
  } catch (e) { errRes(res, e); }
});

// ── deleteDoc (DELETE) ────────────────────────────────────────────────────────
router.delete('/fs/*', async (req, res) => {
  try {
    const { collPath, id } = resolveDocPath(req.params[0]);
    const ctx = await callerContext(req);
    await applyWrite(ctx, 'delete', collPath, id, null);
    res.json({ ok: true });
  } catch (e) { errRes(res, e); }
});

// ── addDoc ────────────────────────────────────────────────────────────────────
router.post('/fs/add', async (req, res) => {
  try {
    const { path, data } = req.body || {};
    const segs = parsePath(path);
    if (!segs.length || segs.length % 2 === 0) return res.status(400).json({ error: 'invalid-argument' });
    const collPath = segs.join('/');
    const ctx = await callerContext(req);
    const id = store.uuid();
    await applyWrite(ctx, 'create', collPath, id, data || {});
    res.json({ id });
  } catch (e) { errRes(res, e); }
});

// ── writeBatch / runTransaction ───────────────────────────────────────────────
router.post(['/fs/batch', '/fs/transaction'], async (req, res) => {
  try {
    const { ops } = req.body || {};
    if (!Array.isArray(ops) || !ops.length || ops.length > 500) {
      return res.status(400).json({ error: 'invalid-argument', message: 'ops must be a non-empty array (max 500)' });
    }
    const ctx = await callerContext(req);
    const results = [];
    for (const op of ops) {
      const { op: kind, path, data, merge } = op || {};
      const { collPath, id } = resolveDocPath(path);
      results.push(await applyWrite(ctx, kind === 'delete' ? 'delete' : kind === 'update' ? 'update'
        : kind === 'create' ? 'create' : 'set', collPath, id, data || {}, { merge }));
    }
    res.json({ ok: true, results: results.map((r) => ({ id: r.id })) });
  } catch (e) { errRes(res, e); }
});

module.exports = router;
