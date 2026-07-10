const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function purgeGhosts() {
  try {
    const protectedEmail = 'md.imranabid@gmail.com';
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();

    let deletedCount = 0;
    const batch = db.batch();

    snapshot.forEach(doc => {
      const userData = doc.data();
      // Delete the document if it doesn't match the admin email
      if (userData.email !== protectedEmail) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    if (deletedCount === 0) {
      console.log('✅ DATABASE CLEAN: No ghost users found.');
      process.exit(0);
    }

    await batch.commit();
    console.log(`🔥 EXORCISM COMPLETE: Successfully purged ${deletedCount} fake users from Firestore!`);
    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

purgeGhosts();
