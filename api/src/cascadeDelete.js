// Cascade user deletion — port of functions/src/cascadeDelete.ts.
// Each step is idempotent; the profile/retry marker is removed last.
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');
const store = require('./store');

async function deleteWhere(coll, key, uid) {
  const docs = await store.queryDocs(coll, { wheres: [{ field: key, op: '==', value: uid }] });
  for (const d of docs) await store.deleteDoc(coll, d.id);
  return docs.length;
}

async function cascadeDeleteUser(uid, log = console.log) {
  const user = await store.getDoc('users', uid);
  const profile = user ? user.data : null;
  await store.writeDoc('users', uid, {
    deletionStatus: 'deleting', deletionCleanupStartedAt: { __st: 1 },
    ...(profile && !profile.scheduledDeletionAt ? { scheduledDeletionAt: { __st: 1 } } : {}),
  }, { merge: true });
  log('Authentication session data removed.');
  await pool.query('DELETE FROM sessions WHERE user_id = ?', [uid]);
  await pool.query("DELETE FROM otps WHERE email = (SELECT email FROM users WHERE id = ?)", [uid]).catch(() => undefined);

  for (const [coll, keys] of [
    ['photoModeration', ['uid', 'userId']], ['uploadedImages', ['uid']],
    ['interests', ['fromId', 'toId']], ['shortlists', ['userId', 'targetId']],
    ['notifications', ['userId', 'fromId']], ['profileViews', ['viewerId', 'profileId']],
  ]) {
    let n = 0;
    for (const key of keys) n += await deleteWhere(coll, key, uid);
    log(`${coll} records removed (${n}).`);
  }

  // chats involving the user (chat ids are `${uidA}_${uidB}` or `${uidA}_..._${uidB}`)
  const chats = await store.listDocs('chats');
  for (const chat of chats) {
    if (!chat.id.startsWith(`${uid}_`) && !chat.id.endsWith(`_${uid}`)) continue;
    const msgs = await store.listDocs(`chats/${chat.id}/messages`);
    for (const m of msgs) await store.deleteDoc(`chats/${chat.id}/messages`, m.id);
    await store.deleteDoc('chats', chat.id);
  }
  // legacy flat messages paths
  for (const key of ['senderId', 'receiverId']) await deleteWhere('messages', key, uid);
  log('Chats and messages removed.');

  const churches = await store.queryDocs('churches', { wheres: [{ field: 'members', op: 'array-contains', value: uid }] });
  for (const c of churches) {
    await store.writeDoc('churches', c.id, { members: { __ar: [uid] } }, { merge: true });
  }

  if (profile && profile.email) {
    const email = String(profile.email).toLowerCase();
    for (const coll of ['contact_messages']) {
      const docs = await store.queryDocs(coll, { wheres: [{ field: 'email', op: '==', value: email }] });
      for (const d of docs) await store.deleteDoc(coll, d.id);
    }
    await pool.query('DELETE FROM email_log WHERE email = ?', [email]);
    await pool.query('DELETE FROM otps WHERE email = ?', [email]);
  }

  // internal mail state
  const deliveries = await store.listDocs('email_deliveries');
  for (const d of deliveries) {
    if (d.id === `onboarding_${uid}` || d.id.endsWith(`_${uid}`) || d.id.includes(`_${uid}_`)) {
      await store.deleteDoc('email_deliveries', d.id);
    }
  }
  for (const type of ['connection_request', 'connection_accepted']) {
    await store.deleteDoc('email_delivery_limits', `${type}_${uid}`).catch(() => undefined);
  }

  // uploaded files
  try {
    const { UPLOAD_ROOT } = require('./routes/files');
    const userDir = path.resolve(UPLOAD_ROOT, 'users', uid);
    if (userDir.startsWith(UPLOAD_ROOT + path.sep) && fs.existsSync(userDir)) {
      fs.rmSync(userDir, { recursive: true, force: true });
    }
  } catch (e) { log(`Upload cleanup skipped: ${e.message}`); }

  // presence + typing
  await pool.query('DELETE FROM presence WHERE uid = ?', [uid]).catch(() => undefined);
  await pool.query('DELETE FROM typing WHERE uid = ?', [uid]).catch(() => undefined);

  // last: remove the durable profile
  await store.deleteDoc('users', uid);
  await pool.query('DELETE FROM verification_tokens WHERE user_id = ?', [uid]).catch(() => undefined);
  log('Profile and associated data permanently removed.');
}

module.exports = { cascadeDeleteUser };
