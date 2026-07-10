const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const email = 'md.imranabid@gmail.com';

async function verifyUserEmail() {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { emailVerified: true });
    console.log(`✅ SUCCESS: ${email} is now marked as verified in Firebase Auth!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ FAILED to verify email:", error);
    process.exit(1);
  }
}

verifyUserEmail();
