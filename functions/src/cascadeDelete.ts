import * as admin from 'firebase-admin';
import { getDatabaseWithUrl } from 'firebase-admin/database';

export type DeleteLogger = (message: string) => void;
export type CleanupDependencies = {
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  bucket: { deleteFiles(options: { prefix: string }): Promise<unknown> };
  realtime: admin.database.Database;
  values?: typeof admin.firestore.FieldValue;
};

async function deleteDocs(db: admin.firestore.Firestore, docs: admin.firestore.QueryDocumentSnapshot[]) {
  const unique = [...new Map(docs.map(doc => [doc.ref.path, doc])).values()];
  for (let i = 0; i < unique.length; i += 400) {
    const batch = db.batch();
    unique.slice(i, i + 400).forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}

// Each step is idempotent. Keep the profile/retry marker until every cleanup
// succeeds. Derive chats independently of interests so retries still find them.
export async function cascadeDeleteUser(uid: string, log: DeleteLogger, dependencies?: CleanupDependencies): Promise<void> {
  const deps: CleanupDependencies = dependencies || { db: admin.firestore(), auth: admin.auth(), bucket: admin.storage().bucket(), realtime: getDatabaseWithUrl(admin.app().options.databaseURL || `https://${admin.app().options.projectId || process.env.GCLOUD_PROJECT}-default-rtdb.firebaseio.com`) };
  const { db, auth, bucket, realtime } = deps;
  const values = deps.values || admin.firestore.FieldValue;
  const user = db.collection('users').doc(uid);
  const profile = (await user.get()).data();
  await user.set({ deletionStatus: 'deleting', deletionCleanupStartedAt: values.serverTimestamp(),
    ...(!profile?.scheduledDeletionAt ? { scheduledDeletionAt: admin.firestore.Timestamp.now() } : {}),
  }, { merge: true });
  try { await auth.deleteUser(uid); }
  catch (error: any) { if (error.code !== 'auth/user-not-found') throw error; }
  log('Authentication account removed.');

  for (const [collection, keys] of [
    ['photoModeration', ['uid', 'userId']], ['uploadedImages', ['uid']],
    ['interests', ['fromId', 'toId']], ['shortlists', ['userId', 'targetId']],
    ['notifications', ['userId', 'fromId']], ['profileViews', ['viewerId', 'profileId']],
  ] as [string, string[]][]) {
    const snapshots = await Promise.all(keys.map(key => db.collection(collection).where(key, '==', uid).get()));
    await deleteDocs(db, snapshots.flatMap(snapshot => snapshot.docs));
    log(`${collection} records removed.`);
  }

  // listDocuments includes missing parent docs whose message subcollections
  // still exist, unlike a query over only existing chat documents.
  const chats = await db.collection('chats').listDocuments();
  for (const chat of chats) {
    if (!chat.id.startsWith(`${uid}_`) && !chat.id.endsWith(`_${uid}`)) continue;
    await db.recursiveDelete(chat);
  }
  // Remove any legacy message paths keyed independently of chat IDs.
  for (const key of ['senderId', 'receiverId']) {
    await deleteDocs(db, (await db.collectionGroup('messages').where(key, '==', uid).get()).docs);
  }
  const churches = await db.collection('churches').where('members', 'array-contains', uid).get();
  for (const church of churches.docs) await church.ref.update({ members: values.arrayRemove(uid) });

  if (profile?.email) {
    for (const collection of ['temp_otps', 'email_log', 'contact_messages']) {
      await deleteDocs(db, (await db.collection(collection).where('email', '==', profile.email).get()).docs);
    }
  }

  // Internal mail state contains no profile attachments; remove member keys.
  const deliveries = await db.collection('email_deliveries').listDocuments();
  for (const ref of deliveries) {
    if (ref.id === `onboarding_${uid}` || ref.id.endsWith(`_${uid}`) || ref.id.includes(`_${uid}_`)) await ref.delete();
  }
  for (const type of ['connection_request', 'connection_accepted']) await db.collection('email_delivery_limits').doc(`${type}_${uid}`).delete();

  await bucket.deleteFiles({ prefix: `users/${uid}/` });
  await realtime.ref(`status/${uid}`).remove();
  const typing = await realtime.ref('typingStatus').get();
  const updates: Record<string, null> = {};
  typing.forEach(child => { if (child.hasChild(uid)) updates[`${child.key}/${uid}`] = null; });
  if (Object.keys(updates).length) await realtime.ref('typingStatus').update(updates);

  // Last operation: only now remove the durable retry marker.
  await user.delete();
  log('Profile and associated Firebase data permanently removed.');
}
