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
  console.log('--- FINDING USER BY PROFILE ID NYJ6FIE9 ---');
  const userSnap = await db.collection('users')
    .where('profileId', '==', 'NYJ6FIE9')
    .get();

  if (userSnap.empty) {
    console.log('No user found with profileId "NYJ6FIE9". Checking case-insensitively...');
    const allUsers = await db.collection('users').get();
    let found = false;
    allUsers.docs.forEach(d => {
      const data = d.data();
      if (data.profileId && data.profileId.toUpperCase() === 'NYJ6FIE9') {
        console.log(`Found match (case-insensitive): ${d.id}`, data);
        found = true;
      }
    });
    if (!found) {
      console.log('Truly no user found with profileId NYJ6FIE9.');
      process.exit(0);
    }
  }

  const userDoc = userSnap.docs[0];
  const uid = userDoc.id;
  const userData = userDoc.data();
  console.log(`Found User: ${uid}`);
  console.log(`Name: ${userData.name}`);
  console.log(`profileId: ${userData.profileId}`);

  console.log('\n--- INTERESTS RECEIVED BY THIS USER ---');
  const interestsSnap = await db.collection('interests')
    .where('toId', '==', uid)
    .get();

  console.log(`Total Interests Received: ${interestsSnap.size}`);
  interestsSnap.docs.forEach(d => {
    console.log(`Interest ID: ${d.id}`, d.data());
  });

  console.log('\n--- NOTIFICATIONS FOR THIS USER ---');
  const notifSnap = await db.collection('notifications')
    .where('userId', '==', uid)
    .get();
  console.log(`Total Notifications: ${notifSnap.size}`);
  notifSnap.docs.forEach(d => {
    console.log(`Notification ID: ${d.id}`, d.data());
  });

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
