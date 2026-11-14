// Cascade user deletion — port of functions/src/cascadeDelete.ts.
// Purges all user records across MySQL tables, coll_store documents, and disk photo uploads.
const fs = require('fs');
const path = require('path');
const { pool, pj } = require('./db');
const store = require('./store');

async function deleteWhere(coll, key, uid) {
  const docs = await store.queryDocs(coll, { wheres: [{ field: key, op: '==', value: uid }] });
  for (const d of docs) await store.deleteDoc(coll, d.id);
  return docs.length;
}

function extractUploadRelPath(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed.includes('/uploads/')) return '';
  const after = decodeURIComponent(trimmed.split('/uploads/')[1] || '').split('?')[0];
  return after
    .replace(/\\/g, '/')
    .replace(/\.\./g, '')
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9/_\-.]/g, '_');
}

function collectPhotoRelPaths(obj, set) {
  if (!obj || typeof obj !== 'object') return;
  for (const val of Object.values(obj)) {
    if (typeof val === 'string' && val.includes('/uploads/')) {
      const rel = extractUploadRelPath(val);
      if (rel) set.add(rel);
    } else if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === 'string' && item.includes('/uploads/')) {
          const rel = extractUploadRelPath(item);
          if (rel) set.add(rel);
        } else if (item && typeof item === 'object') {
          collectPhotoRelPaths(item, set);
        }
      }
    }
  }
}

async function cascadeDeleteUser(uid, log = console.log) {
  if (!uid || typeof uid !== 'string') throw new Error('Invalid uid for cascadeDeleteUser');

  // 1. Gather user profile and email before deletion
  const user = await store.getDoc('users', uid);
  const [userRows] = await pool.query('SELECT id, email, photo_url, data FROM users WHERE id = ? LIMIT 1', [uid]).catch(() => [[]]);
  const rowData = userRows.length ? pj(userRows[0].data, {}) : {};
  const profile = (user && user.data) ? user.data : rowData;
  const rawEmail = (userRows[0] && userRows[0].email) || (profile && profile.email) || '';
  const email = String(rawEmail).trim().toLowerCase();

  // Collect all photo relative paths associated with this user
  const photoRelPaths = new Set();
  if (userRows[0] && userRows[0].photo_url) {
    const rel = extractUploadRelPath(userRows[0].photo_url);
    if (rel) photoRelPaths.add(rel);
  }
  collectPhotoRelPaths(profile, photoRelPaths);

  if (user) {
    await store.writeDoc('users', uid, {
      deletionStatus: 'deleting',
      deletionCleanupStartedAt: { __st: 1 },
      ...(profile && !profile.scheduledDeletionAt ? { scheduledDeletionAt: { __st: 1 } } : {}),
    }, { merge: true }).catch(() => undefined);
  }

  // 2. Remove authentication sessions, tokens, and OTPs
  await pool.query('DELETE FROM sessions WHERE user_id = ?', [uid]).catch(() => undefined);
  await pool.query('DELETE FROM verification_tokens WHERE user_id = ?', [uid]).catch(() => undefined);
  await pool.query('DELETE FROM user_deletions WHERE uid = ?', [uid]).catch(() => undefined);
  if (email) {
    await pool.query('DELETE FROM otps WHERE LOWER(email) = ?', [email]).catch(() => undefined);
    await pool.query('DELETE FROM otp_requests_log WHERE LOWER(email) = ?', [email]).catch(() => undefined);
    await pool.query('DELETE FROM email_log WHERE LOWER(email) = ?', [email]).catch(() => undefined);
  }
  log('Authentication sessions, tokens, and OTP logs removed.');

  // 3. Collect photo URLs from photoModeration & uploadedImages before deleting those docs
  try {
    const [modRows] = await pool.query(
      "SELECT id, data FROM coll_store WHERE coll IN ('photoModeration', 'uploadedImages')"
    );
    for (const r of modRows) {
      const d = pj(r.data, {});
      if (d.uid === uid || d.userId === uid || String(d.url || '').includes(`/uploads/users/${uid}/`) || String(d.photoURL || '').includes(`/uploads/users/${uid}/`)) {
        collectPhotoRelPaths(d, photoRelPaths);
        await pool.query('DELETE FROM coll_store WHERE id = ?', [r.id]).catch(() => undefined);
      }
    }
  } catch (e) {
    log(`Photo metadata pre-scan notice: ${e.message}`);
  }

  // 4. Delete Firestore-emulated collections in coll_store
  for (const [coll, keys] of [
    ['photoModeration', ['uid', 'userId']],
    ['uploadedImages', ['uid', 'userId']],
    ['interests', ['fromId', 'toId']],
    ['shortlists', ['userId', 'targetId']],
    ['notifications', ['userId', 'fromId', 'uid', 'actorId', 'targetId']],
    ['profileViews', ['viewerId', 'profileId', 'viewedId']],
    ['blocked', ['blockerId', 'blockedId', 'userId', 'targetId']],
    ['blocks', ['blockerId', 'blockedId', 'userId', 'targetId']],
    ['success_stories', ['uid', 'userId', 'authorId', 'submittedBy']],
  ]) {
    let n = 0;
    for (const key of keys) n += await deleteWhere(coll, key, uid);
    log(`${coll} records removed (${n}).`);
  }

  // Also delete any interests whose doc id is `${uid}_${other}` or `${other}_${uid}`
  await pool.query(
    "DELETE FROM coll_store WHERE coll = 'interests' AND (id LIKE ? OR id LIKE ?)",
    [`${uid}_%`, `%_${uid}`]
  ).catch(() => undefined);

  // 5. Delete chats and nested messages involving the user
  const chats = await store.listDocs('chats');
  for (const chat of chats) {
    const cData = chat.data || {};
    const parts = Array.isArray(cData.participants) ? cData.participants : [];
    const isParticipant =
      chat.id.startsWith(`${uid}_`) ||
      chat.id.endsWith(`_${uid}`) ||
      chat.id.includes(`_${uid}_`) ||
      parts.includes(uid) ||
      cData.userA === uid ||
      cData.userB === uid;
    if (!isParticipant) continue;
    const msgs = await store.listDocs(`chats/${chat.id}/messages`);
    for (const m of msgs) {
      collectPhotoRelPaths(m.data, photoRelPaths);
      await store.deleteDoc(`chats/${chat.id}/messages`, m.id);
    }
    await store.deleteDoc('chats', chat.id);
  }
  // Direct SQL sweep for any subcollection messages under chats involving uid (even if parent chat doc didn't exist)
  await pool.query(
    "DELETE FROM coll_store WHERE coll LIKE ? OR coll LIKE ? OR (coll LIKE 'chats/%/messages' AND (JSON_UNQUOTE(JSON_EXTRACT(data, '$.senderId')) = ? OR JSON_UNQUOTE(JSON_EXTRACT(data, '$.receiverId')) = ?))",
    [`chats/${uid}_%/messages`, `chats/%_${uid}/messages`, uid, uid]
  ).catch(() => undefined);
  // Legacy flat messages collection
  for (const key of ['senderId', 'receiverId']) await deleteWhere('messages', key, uid);
  log('Chats and messages removed.');

  // 6. Clean up churches membership (and remove church doc if no members remain)
  const churches = await store.queryDocs('churches', { wheres: [{ field: 'members', op: 'array-contains', value: uid }] });
  for (const c of churches) {
    const remaining = (Array.isArray(c.data?.members) ? c.data.members : []).filter((m) => m !== uid);
    if (remaining.length === 0) {
      await store.deleteDoc('churches', c.id);
    } else {
      await store.writeDoc('churches', c.id, { members: remaining }, { merge: true });
    }
  }
  await pool.query('DELETE FROM churches WHERE id = ?', [uid]).catch(() => undefined);

  // 7. Remove uid from other users' blockedUsers arrays
  try {
    const blockedByUsers = await store.queryDocs('users', { wheres: [{ field: 'blockedUsers', op: 'array-contains', value: uid }] });
    for (const bu of blockedByUsers) {
      if (bu.id === uid) continue;
      await store.writeDoc('users', bu.id, { blockedUsers: { __ar: [uid] } }, { merge: true });
    }
  } catch (e) {
    log(`blockedUsers cleanup notice: ${e.message}`);
  }

  // 8. Clean up contact messages and email delivery tracking
  if (email) {
    for (const coll of ['contact_messages']) {
      const docs = await store.queryDocs(coll, { wheres: [{ field: 'email', op: '==', value: email }] });
      for (const d of docs) await store.deleteDoc(coll, d.id);
    }
    await pool.query("DELETE FROM contact_messages WHERE LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.email'))) = ?", [email]).catch(() => undefined);
  }
  await deleteWhere('contact_messages', 'uid', uid);

  const deliveries = await store.listDocs('email_deliveries');
  for (const d of deliveries) {
    if (d.id === `onboarding_${uid}` || d.id.endsWith(`_${uid}`) || d.id.includes(`_${uid}_`)) {
      await store.deleteDoc('email_deliveries', d.id);
    }
  }
  const deliveryLimits = await store.listDocs('email_delivery_limits');
  for (const d of deliveryLimits) {
    if (d.id.endsWith(`_${uid}`) || d.id.includes(`_${uid}_`)) {
      await store.deleteDoc('email_delivery_limits', d.id);
    }
  }

  // 9. Sweep dedicated SQL tables + any remaining coll_store entries owned by uid
  await pool.query('DELETE FROM interests WHERE from_uid = ? OR to_uid = ?', [uid, uid]).catch(() => undefined);
  await pool.query('DELETE FROM shortlists WHERE owner_uid = ? OR target_uid = ?', [uid, uid]).catch(() => undefined);
  await pool.query('DELETE FROM blocked WHERE blocker_uid = ? OR blocked_uid = ?', [uid, uid]).catch(() => undefined);
  await pool.query('DELETE FROM messages WHERE sender_uid = ? OR chat_id LIKE ? OR chat_id LIKE ?', [uid, `${uid}_%`, `%_${uid}`]).catch(() => undefined);
  await pool.query('DELETE FROM chats WHERE user_a = ? OR user_b = ? OR id LIKE ? OR id LIKE ?', [uid, uid, `${uid}_%`, `%_${uid}`]).catch(() => undefined);
  await pool.query('DELETE FROM notifications WHERE uid = ? OR actor_id = ? OR target_id = ?', [uid, uid, uid]).catch(() => undefined);
  await pool.query('DELETE FROM photo_moderation WHERE uid = ?', [uid]).catch(() => undefined);
  await pool.query('DELETE FROM profile_views WHERE viewer_uid = ? OR viewed_uid = ?', [uid, uid]).catch(() => undefined);
  await pool.query('DELETE FROM presence WHERE uid = ?', [uid]).catch(() => undefined);
  await pool.query('DELETE FROM typing WHERE uid = ? OR chat_id LIKE ? OR chat_id LIKE ?', [uid, `${uid}_%`, `%_${uid}`]).catch(() => undefined);
  await pool.query("DELETE FROM coll_store WHERE owner_uid = ? OR id = ? OR id LIKE ? OR id LIKE ?", [uid, uid, `${uid}_%`, `%_${uid}`]).catch(() => undefined);
  log('All dedicated SQL tables and coll_store records purged.');

  // 10. Delete all uploaded photo files on disk (including any legacy hbuilds version directories)
  try {
    const { UPLOAD_ROOT } = require('./routes/files');
    const uploadRoots = new Set([UPLOAD_ROOT]);

    const cwd = process.cwd();
    if (cwd.includes('/hbuilds/versions/')) {
      const domainRoot = cwd.split('/hbuilds/versions/')[0];
      const versionsDir = path.join(domainRoot, 'hbuilds', 'versions');
      if (fs.existsSync(versionsDir)) {
        for (const ver of fs.readdirSync(versionsDir)) {
          const verUploads = path.join(versionsDir, ver, 'nodejs', 'uploads');
          if (fs.existsSync(verUploads)) uploadRoots.add(path.resolve(verUploads));
        }
      }
    }

    let removedDirs = 0;
    let removedFiles = 0;
    for (const rootDir of uploadRoots) {
      // Remove users/{uid} folder
      const userDir = path.resolve(rootDir, 'users', uid);
      if (userDir.startsWith(rootDir + path.sep) && fs.existsSync(userDir)) {
        fs.rmSync(userDir, { recursive: true, force: true });
        removedDirs += 1;
      }
      // Remove any individual referenced photo files (in case stored outside users/{uid})
      for (const rel of photoRelPaths) {
        const filePath = path.resolve(rootDir, rel);
        if (filePath.startsWith(rootDir + path.sep) && fs.existsSync(filePath)) {
          fs.rmSync(filePath, { force: true });
          removedFiles += 1;
        }
      }
    }
    log(`Uploaded photos removed from disk (dirs=${removedDirs}, extraFiles=${removedFiles}).`);
  } catch (e) {
    log(`Upload cleanup notice: ${e.message}`);
  }

  // 11. Finally remove the user record from users & admins tables
  await store.deleteDoc('users', uid);
  await pool.query('DELETE FROM users WHERE id = ?', [uid]).catch(() => undefined);
  if (email) {
    await pool.query("DELETE FROM users WHERE LOWER(email) = ? AND role != 'admin'", [email]).catch(() => undefined);
  }
  log('Profile and all associated SQL & photo data permanently removed.');
}

module.exports = { cascadeDeleteUser };
