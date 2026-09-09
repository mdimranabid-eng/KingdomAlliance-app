import * as admin from 'firebase-admin';

// ============================================================
// Shared cascading user-deletion logic.
// Used by:
//   - Admin endpoint /api/admin/delete-user  (immediate)
//   - Scheduled function processPendingDeletions (7-day grace expiry)
// ============================================================

export type DeleteLogger = (msg: string) => void;

// Firestore batches are limited to 500 ops — commit deletes in safe chunks.
async function deleteDocsChunked(
  db: admin.firestore.Firestore,
  docs: admin.firestore.QueryDocumentSnapshot[],
  label: string,
  log: DeleteLogger
): Promise<number> {
  const CHUNK = 400;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = db.batch();
    docs.slice(i, i + CHUNK).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  log(`   → ${docs.length} ${label} record(s) deleted.`);
  return docs.length;
}

// Permanently deletes one user: Auth record, Firestore data and Firebase Storage images.
// NEVER call this for a uid that did not request deletion / was not admin-approved.
export async function cascadeDeleteUser(uid: string, log: DeleteLogger): Promise<void> {
  const db = admin.firestore();

  // Stage A: Auth Account
  try {
    await admin.auth().deleteUser(uid);
    log(`✅ Stage A: Auth account deleted for UID: ${uid}`);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      log(`⚠️  Stage A: Auth account not found (already deleted or never existed): ${uid}`);
    } else {
      log(`❌ Stage A: Auth deletion FAILED: ${err.message}`);
      throw err;
    }
  }

  // Stage B: /users document
  try {
    await db.collection('users').doc(uid).delete();
    log(`✅ Stage B: Firestore /users/${uid} document deleted.`);
  } catch (err: any) {
    log(`❌ Stage B: Firestore /users/${uid} deletion FAILED: ${err.message}`);
  }

  // Stage C: /photoModeration collection
  try {
    const moderationSnap = await db.collection('photoModeration').where('userId', '==', uid).get();
    const count = await deleteDocsChunked(db, moderationSnap.docs, '/photoModeration', log);
    log(`✅ Stage C: ${count} /photoModeration record(s) deleted.`);
  } catch (err: any) {
    log(`❌ Stage C: /photoModeration deletion FAILED: ${err.message}`);
  }

  // Stage C2: /uploadedImages hash records (duplicate-prevention cache)
  try {
    const imgSnap = await db.collection('uploadedImages').where('uid', '==', uid).get();
    const count = await deleteDocsChunked(db, imgSnap.docs, '/uploadedImages', log);
    log(`✅ Stage C2: ${count} /uploadedImages record(s) deleted.`);
  } catch (err: any) {
    log(`❌ Stage C2: /uploadedImages deletion FAILED: ${err.message}`);
  }

  // Stage D/E/F: interests, shortlists, chats+messages
  try {
    const [fromSnap, toSnap] = await Promise.all([
      db.collection('interests').where('fromId', '==', uid).get(),
      db.collection('interests').where('toId', '==', uid).get(),
    ]);

    // De-duplicate: an interest could theoretically match on both sides
    const interestDocs = Array.from(
      new Map([...fromSnap.docs, ...toSnap.docs].map((d) => [d.id, d])).values()
    );
    const totalInterests = await deleteDocsChunked(db, interestDocs, '/interests', log);
    log(`✅ Stage D: ${totalInterests} /interests record(s) deleted.`);

    const [slUserSnap, slTargetSnap] = await Promise.all([
      db.collection('shortlists').where('userId', '==', uid).get(),
      db.collection('shortlists').where('targetId', '==', uid).get(),
    ]);
    const shortlistDocs = Array.from(
      new Map([...slUserSnap.docs, ...slTargetSnap.docs].map((d) => [d.id, d])).values()
    );
    const totalShortlists = await deleteDocsChunked(db, shortlistDocs, '/shortlists', log);
    log(`✅ Stage E: ${totalShortlists} /shortlists record(s) deleted.`);

    const allInterestDocs = [...fromSnap.docs, ...toSnap.docs];
    const chatIds = new Set<string>();
    allInterestDocs.forEach((d) => {
      const data = d.data();
      if (data.fromId && data.toId) {
        chatIds.add([data.fromId, data.toId].sort().join('_'));
      }
    });

    let deletedChats = 0;
    let deletedMessages = 0;
    for (const chatId of chatIds) {
      const messagesSnap = await db.collection(`chats/${chatId}/messages`).get();
      const count = await deleteDocsChunked(db, messagesSnap.docs, `chats/${chatId}/messages`, log);
      deletedMessages += count;
      await db.collection('chats').doc(chatId).delete();
      deletedChats++;
    }
    log(`✅ Stage F: ${deletedChats} chat(s) and ${deletedMessages} message(s) deleted.`);
  } catch (err: any) {
    log(`❌ Stage D-F: interests/shortlists/chats deletion FAILED: ${err.message}`);
  }

  // Stage G: Firebase Storage images (new upload path + legacy fallback files)
  try {
    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({ prefix: `users/${uid}/` });
    log(`✅ Stage G: Firebase Storage assets under "users/${uid}/" deleted.`);
  } catch (err: any) {
    // 404 simply means nothing was stored in the bucket for this user
    if (err?.code === 404) {
      log(`ℹ️  Stage G: no Firebase Storage assets found for ${uid}.`);
    } else {
      log(`❌ Stage G: Firebase Storage deletion FAILED: ${err.message}`);
    }
  }

  log(`🏁 Cascading deletion COMPLETE for UID: ${uid}`);
}
