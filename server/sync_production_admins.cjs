const admin = require('firebase-admin');

// Initialize Production app
const productionKey = require('./serviceAccountKey.production.json');
const productionApp = admin.initializeApp({
  credential: admin.credential.cert(productionKey)
}, 'production');

const db = productionApp.firestore();

async function run() {
  try {
    console.log('🔄 Fetching all admin documents from Production...');
    const adminSnap = await db.collection('admins').get();

    if (adminSnap.empty) {
      console.log('⚠️ No admin documents found in Production.');
      return;
    }

    console.log(`⚡ Updating ${adminSnap.size} admin documents in Production...`);

    const batch = db.batch();

    adminSnap.docs.forEach(doc => {
      const data = doc.data();
      const docRef = doc.ref;

      const updates = {
        isAdmin: true,
        role: 'admin'
      };

      // Set createdAt if it doesn't exist yet
      if (!data.createdAt) {
        updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }

      console.log(`   └─ Updating admin: ${data.email || doc.id}`);
      batch.update(docRef, updates);
    });

    await batch.commit();
    console.log('✅ Production admins successfully updated and synchronized to match Staging!');

  } catch (error) {
    console.error('❌ Error updating production admins:', error.message);
  } finally {
    await productionApp.delete();
  }
}

run();
