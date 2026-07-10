const admin = require('firebase-admin');

try {
  const serviceAccount = require('../server/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  admin.initializeApp();
}

const db = admin.firestore();

async function run() {
  console.log('--- ALL USERS IN DB ---');
  const snap = await db.collection('users').get();
  console.log(`Total: ${snap.size}`);
  snap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id}`);
    console.log(`  Name: ${data.name}`);
    console.log(`  Gender: ${data.gender}, ProfileType: ${data.profileType}`);
    console.log(`  isApproved: ${data.isApproved}, approvalStatus: ${data.approvalStatus}`);
    console.log(`  isBanned: ${data.isBanned}, isSuspended: ${data.isSuspended}`);
    console.log(`  status: ${data.status}`);
  });
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
