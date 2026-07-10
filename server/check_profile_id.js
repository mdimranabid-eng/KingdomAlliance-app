const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'kingdom-alliance-staging'
});

const db = admin.firestore();

async function run() {
  console.log('--- FINDING USER BY PROFILE ID NYJ6FIE9 ---');
  const userSnap = await db.collection('users')
    .where('profileId', '==', 'NYJ6FIE9')
    .get();

  if (userSnap.empty) {
    console.log('No user found with profileId "NYJ6FIE9" in kingdom-alliance-staging. Checking case-insensitively...');
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
  console.log(`Found User Document ID (UID): ${uid}`);
  console.log(`Name: ${userData.name}`);
  console.log(`profileId: ${userData.profileId}`);
  console.log(`gender: ${userData.gender}`);
  console.log(`profileType: ${userData.profileType}`);

  console.log('\n--- INTERESTS RECEIVED BY THIS USER ---');
  const interestsSnap = await db.collection('interests')
    .where('toId', '==', uid)
    .get();

  console.log(`Total Interests Received: ${interestsSnap.size}`);
  interestsSnap.docs.forEach(d => {
    console.log(`Interest ID: ${d.id}`, d.data());
  });

  console.log('\n--- INTERESTS SENT BY THIS USER ---');
  const interestsSentSnap = await db.collection('interests')
    .where('fromId', '==', uid)
    .get();

  console.log(`Total Interests Sent: ${interestsSentSnap.size}`);
  interestsSentSnap.docs.forEach(d => {
    console.log(`Interest ID: ${d.id}`, d.data());
  });

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
