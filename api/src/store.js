// Doc store: Firestore-like documents over MySQL.
// users → dedicated `users` table (full doc in `data` JSON + synced indexed columns)
// admins → dedicated `admins` table. Everything else → `coll_store`
// (coll = full collection path, e.g. 'interests' or 'chats/{id}/messages').
const crypto = require('crypto');
const { pool, pj, withReady } = require('./db');

const uuid = () => crypto.randomUUID();

// ── Sentinels (from the frontend shim) ────────────────────────────────────────
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const isSent = (v) => isObj(v) && ('__st' in v || '__ts' in v || '__au' in v || '__ar' in v || '__df' in v || '__inc' in v);
const tsWrap = (ms) => ({ __ts: ms });
const unwrapTs = (v) => (isObj(v) && typeof v.__ts === 'number' ? v.__ts : v);

const DELETE_FIELD = { __deleteMarker: true };
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

function deepEq(a, b) {
  const x = unwrapTs(a); const y = unwrapTs(b);
  if (typeof x === 'number' && typeof y === 'number') return x === y;
  if (typeof x === 'string' && typeof y === 'string') return x === y;
  if (typeof x === 'number' && typeof y === 'string') return String(x) === y;
  if (typeof x === 'string' && typeof y === 'number') return x === String(y);
  return JSON.stringify(x === undefined ? null : x) === JSON.stringify(y === undefined ? null : y);
}

function getPath(obj, dotted) {
  return String(dotted).split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}
function setPath(obj, dotted, value) {
  const keys = String(dotted).split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!isObj(cur[keys[i]])) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  const last = keys[keys.length - 1];
  if (value === DELETE_FIELD) delete cur[last]; else cur[last] = value;
}

// Resolve transform sentinels against the existing value. Returns DELETE_FIELD
// for deleteField(), otherwise the final JSON-safe value.
function resolveValue(v, existing, now) {
  if (isSent(v)) {
    if ('__st' in v) return tsWrap(now);
    if ('__ts' in v) return tsWrap(v.__ts);
    if (v.__au) {
      const cur = Array.isArray(existing) ? existing : [];
      return cur.concat(v.__au.filter((x) => !cur.some((y) => deepEq(x, y))));
    }
    if (v.__ar) {
      const cur = Array.isArray(existing) ? existing : [];
      return cur.filter((y) => !v.__ar.some((x) => deepEq(x, y)));
    }
    if ('__df' in v) return DELETE_FIELD;
    if ('__inc' in v) return (typeof existing === 'number' ? existing : 0) + Number(v.__inc);
  }
  if (isObj(v)) {
    let changed = false;
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      const r = resolveValue(val, existing ? existing[k] : undefined, now);
      if (r === DELETE_FIELD) { changed = true; continue; }
      if (r !== val) changed = true;
      out[k] = r;
    }
    return changed ? out : v;
  }
  return v;
}

// Compute the next document state from a patch (updateDoc / setDoc-merge).
// merge=true → Firestore setDoc(..., {merge:true}) / updateDoc semantics.
// merge=false → full replace (setDoc without merge), transforms still resolve.
function mergeDoc(existingData, patch, now, merge) {
  const root = merge && existingData ? clone(existingData) : {};
  for (const [key, raw] of Object.entries(patch || {})) {
    const existingVal = key.includes('.') ? getPath(root, key) : root[key];
    const resolved = resolveValue(raw, existingVal, now);
    if (key.includes('.')) {
      setPath(root, key, resolved === DELETE_FIELD ? DELETE_FIELD : resolved);
    } else if (resolved === DELETE_FIELD) {
      delete root[key];
    } else {
      root[key] = resolved;
    }
  }
  return root;
}


// ── users table column sync ───────────────────────────────────────────────────
const toDate = (v) => (v && v.__ts ? new Date(v.__ts) : null);
const str = (v, d = '') => (typeof v === 'string' ? v : v == null ? d : String(v));

function userColumns(data) {
  return {
    email: str(data.email).trim().toLowerCase() || null,
    full_name: str(data.fullName || data.name).slice(0, 191),
    photo_url: str(data.photoURL || data.photoUrl).slice(0, 512),
    role: str(data.role, 'user').slice(0, 32),
    approval_status: str(data.approvalStatus, 'incomplete').slice(0, 32),
    onboarding_complete: data.onboardingComplete === true ? 1 : 0,
    email_verified: data.emailVerified === true ? 1 : 0,
    is_suspended: data.isSuspended === true ? 1 : 0,
    is_banned: data.isBanned === true ? 1 : 0,
    is_approved: data.isApproved === true ? 1 : 0,
    gender: str(data.gender).slice(0, 32),
    age: Number(data.age) || 0,
    dob: str(data.dob).slice(0, 32),
    city: str(data.city || data.location).slice(0, 120),
    country: str(data.country).slice(0, 120),
    marital_status: str(data.maritalStatus).slice(0, 64),
    profession: str(data.profession).slice(0, 120),
    denomination: str(data.denomination).slice(0, 120),
    ministry_role: str(data.ministryRole).slice(0, 120),
    status: str(data.status, 'active').slice(0, 32),
    deletion_status: str(data.deletionStatus || '').slice(0, 32),
    auth_provider: str(data.authProvider, 'email').slice(0, 32),
    last_active_at: toDate(data.lastActive),
    last_login_at: toDate(data.lastLogin),
  };
}

const toMs = (d) => (d instanceof Date ? d.getTime() : d ? new Date(d).getTime() : 0);

function rowToDoc(row) {
  const docData = pj(row.data, {});
  if (docData.createdAt === undefined) docData.createdAt = tsWrap(toMs(row.created_at));
  if (docData.updatedAt === undefined) docData.updatedAt = tsWrap(toMs(row.updated_at));
  return { id: row.id, data: docData, createdMs: toMs(row.created_at), updatedMs: toMs(row.updated_at) };
}

// ── Reads ─────────────────────────────────────────────────────────────────────
async function getDoc(collPath, id) {
  await withReady();
  if (collPath === 'users') {
    const [rows] = await pool.query('SELECT id, data, created_at, updated_at FROM users WHERE id = ? LIMIT 1', [id]);
    return rows.length ? rowToDoc(rows[0]) : null;
  }
  if (collPath === 'admins') {
    const [rows] = await pool.query('SELECT id, data, created_at, updated_at FROM admins WHERE id = ? LIMIT 1', [id]);
    return rows.length ? rowToDoc(rows[0]) : null;
  }
  const [rows] = await pool.query('SELECT id, data, created_at, updated_at FROM coll_store WHERE coll = ? AND id = ? LIMIT 1', [collPath, id]);
  return rows.length ? rowToDoc(rows[0]) : null;
}

async function listDocs(collPath, { collectionGroup = false } = {}) {
  await withReady();
  if (collPath === 'users') {
    const [rows] = await pool.query('SELECT id, data, created_at, updated_at FROM users');
    return rows.map(rowToDoc);
  }
  if (collPath === 'admins') {
    const [rows] = await pool.query('SELECT id, data, created_at, updated_at FROM admins');
    return rows.map(rowToDoc);
  }
  if (collectionGroup) {
    const [rows] = await pool.query('SELECT id, coll, data, created_at, updated_at FROM coll_store WHERE coll = ? OR coll LIKE ?', [collPath.split('/').pop(), `%/${collPath.split('/').pop()}`]);
    return rows.map(rowToDoc);
  }
  const [rows] = await pool.query('SELECT id, data, created_at, updated_at FROM coll_store WHERE coll = ? LIMIT 5000', [collPath]);
  return rows.map(rowToDoc);
}

// ── Query (JS-side filtering — Firestore semantics, MySQL/MariaDB agnostic) ──
function cmpValues(a, b) {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'boolean' || typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1;
  const an = Number(a); const bn = Number(b);
  if (a !== '' && b !== '' && !Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
  const as = String(a); const bs = String(b);
  return as < bs ? -1 : as > bs ? 1 : 0;
}

function matches(doc, w) {
  if (!w) return true;
  // composite or(...)/and(...) filters (from the frontend shim or nested queries)
  if (w.composite === 'or' || w.__or) {
    const list = w.filters || w.__or || [];
    return list.some((f) => matches(doc, f));
  }
  if (w.composite === 'and' || w.__and) {
    const list = w.filters || w.__and || [];
    return list.every((f) => matches(doc, f));
  }
  const v = unwrapTs(getPath(doc.data, w.field));
  const t = unwrapTs(w.value);
  switch (w.op) {
    case '==': return deepEq(v, t);
    case '!=': return v !== undefined && !deepEq(v, t);
    case '<': return v != null && cmpValues(v, t) < 0;
    case '<=': return v != null && cmpValues(v, t) <= 0;
    case '>': return v != null && cmpValues(v, t) > 0;
    case '>=': return v != null && cmpValues(v, t) >= 0;
    case 'array-contains': return Array.isArray(v) && v.some((x) => deepEq(x, t));
    case 'array-contains-any': return Array.isArray(v) && v.some((x) => (w.value || []).some((tt) => deepEq(x, tt)));
    case 'in': return (w.value || []).some((tt) => deepEq(v, tt));
    case 'not-in': return v == null || !(w.value || []).some((tt) => deepEq(v, tt));
    default: return false;
  }
}

async function queryDocs(collPath, q = {}) {
  let docs = await listDocs(collPath, { collectionGroup: !!q.collectionGroup });
  if (q.wheres && q.wheres.length) docs = docs.filter((d) => q.wheres.every((w) => matches(d, w)));
  for (const ob of q.orderBys || []) {
    docs.sort((a, b) => (ob.dir === 'desc' ? -1 : 1) * cmpValues(unwrapTs(getPath(a.data, ob.field)), unwrapTs(getPath(b.data, ob.field))));
  }
  if (q.limit) docs = docs.slice(0, q.limit);
  return docs;
}

// ── Writes ────────────────────────────────────────────────────────────────────
const OWNER_KEYS = ['fromId', 'userId', 'viewerId', 'uid', 'senderId', 'blockerId', 'profileId'];

function ownerOf(data) {
  for (const k of OWNER_KEYS) if (typeof data[k] === 'string' && data[k]) return data[k];
  return null;
}

async function writeDoc(collPath, id, patch, { merge = false, createOnly = false, mustExist = false } = {}) {
  await withReady();
  const now = Date.now();
  const existing = await getDoc(collPath, id);
  if (mustExist && !existing) throw Object.assign(new Error('not-found'), { code: 'not-found' });
  if (createOnly && existing) throw Object.assign(new Error('already-exists'), { code: 'already-exists' });

  const nextData = mergeDoc(existing && existing.data, patch, now, merge || mustExist);
  if (existing && existing.data && existing.data.createdAt !== undefined && nextData.createdAt === undefined) {
    nextData.createdAt = existing.data.createdAt;
  }

  if (collPath === 'users') {
    const cols = userColumns(nextData);
    const entries = Object.entries(cols);
    await pool.query(
      `INSERT INTO users (id, ${entries.map(([k]) => `\`${k}\``).join(',')}, data) VALUES (?, ${entries.map(() => '?').join(',')}, ?)
       ON DUPLICATE KEY UPDATE ${entries.map(([k]) => `\`${k}\` = VALUES(\`${k}\`)`).join(',')}, data = VALUES(data)`,
      [id, ...entries.map(([, v]) => (v === undefined ? null : v)), JSON.stringify(nextData)]
    );
  } else if (collPath === 'admins') {
    await pool.query(
      `INSERT INTO admins (id, email, email_verified, data) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data)`,
      [id, str(nextData.email).toLowerCase() || null, nextData.emailVerified === true ? 1 : 0, JSON.stringify(nextData)]
    );
  } else {
    await pool.query(
      `INSERT INTO coll_store (coll, id, owner_uid, data) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data), owner_uid = VALUES(owner_uid)`,
      [collPath, id, ownerOf(nextData), JSON.stringify(nextData)]
    );
  }
  return { before: existing, after: { id, data: nextData, updatedMs: now }, created: !existing };
}

async function addDoc(collPath, data) {
  const id = uuid();
  await writeDoc(collPath, id, data, { merge: false, createOnly: true });
  return id;
}

async function deleteDoc(collPath, id) {
  await withReady();
  if (collPath === 'users') await pool.query('DELETE FROM users WHERE id = ?', [id]);
  else if (collPath === 'admins') await pool.query('DELETE FROM admins WHERE id = ?', [id]);
  else await pool.query('DELETE FROM coll_store WHERE coll = ? AND id = ?', [collPath, id]);
}

module.exports = {
  uuid, tsWrap, unwrapTs, isSent, getPath, setPath, mergeDoc, resolveValue,
  getDoc, listDocs, queryDocs, writeDoc, addDoc, deleteDoc, userColumns, deepEq, DELETE_FIELD,
};

