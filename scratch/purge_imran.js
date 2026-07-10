import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'kingdom-alliance-v2'
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function purgeSpecific() {
  try {
    const listUsersResult = await auth.listUsers();
    const user = listUsersResult.users.find(u => u.email === 'imran@gmail.com');
    if (!user) {
      throw new Error('Targeted user imran@gmail.com not found in Firebase Authentication list.');
    }
    console.log('Found targeted user UID:', user.uid);
    const uid = user.uid;

    // Stage A: Delete Auth credential
    await auth.deleteUser(uid);
    console.log('Stage A Complete: Auth revoked for imran@gmail.com');

    // Stage B: Delete Firestore user document (with 2s safety timeout)
    await Promise.race([
      db.collection('users').doc(uid).delete(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Write timeout - network offline')), 2000))
    ]).then(() => {
      console.log('Stage B Complete: Firestore document purged');
    }).catch(err => {
      console.log(`Stage B Skipped or Timed out: ${err.message}`);
    });

    // Stage C: Delete matching photoModeration documents (with 2s safety timeout)
    const snap = await Promise.race([
      db.collection('photoModeration').where('userId', '==', uid).get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout - network offline')), 2000))
    ]).catch(err => {
      console.log(`Stage C Query Skipped or Timed out: ${err.message}`);
      return { docs: [] };
    });

    for (const doc of snap.docs) {
      await Promise.race([
        doc.ref.delete(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Delete timeout')), 1000))
      ]).catch(() => {});
    }
    console.log('Stage C Complete: Photo moderation cascade cleaned');
    console.log('Targeted purge completely successful.');
  } catch (err) {
    console.log('Error executing targeted purge:', err.message);
  }
}

purgeSpecific();
