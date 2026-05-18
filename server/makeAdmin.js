const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const adminEmail = 'md.imranabid@gmail.com'; 

async function grantAdminRole() {
  try {
    const user = await admin.auth().getUserByEmail(adminEmail);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ SUCCESS: The 'admin' badge has been granted to ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

grantAdminRole();
