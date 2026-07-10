const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const readline = require('readline');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function createAdminUser() {
  try {
    const email = await askQuestion('Enter new admin email: ');
    if (!email) {
      console.error('❌ ERROR: Email cannot be empty.');
      process.exit(1);
    }

    const password = await askQuestion('Enter new admin password: ');
    if (!password || password.length < 6) {
      console.error('❌ ERROR: Password must be at least 6 characters long.');
      process.exit(1);
    }

    console.log(`\n⏳ Creating user account for ${email}...`);
    const user = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true
    });
    console.log(`✅ Auth user created successfully (UID: ${user.uid}).`);

    console.log(`⏳ Granting 'admin' custom claim...`);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ SUCCESS: The 'admin' badge has been granted to ${email}`);

    console.log(`⏳ Creating entry in Firestore 'admins' collection...`);
    await db.collection('admins').doc(user.uid).set({
      uid: user.uid,
      email: email,
      role: 'admin',
      isAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ SUCCESS: Firestore entry created in 'admins' collection.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

createAdminUser();
