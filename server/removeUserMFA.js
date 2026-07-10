const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const readline = require('readline');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

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

async function disableUserMFA() {
  try {
    const email = await askQuestion('Enter The user login to unenroll the Google 2FA: ');
    if (!email) {
      console.error('❌ ERROR: Email cannot be empty.');
      process.exit(1);
    }

    const user = await admin.auth().getUserByEmail(email);
    
    // Clear all enrolled MFA factors and mark email as unverified
    await admin.auth().updateUser(user.uid, {
      emailVerified: false,
      multiFactor: {
        enrolledFactors: null
      }
    });
    
    console.log(`✅ SUCCESS: MFA (Google 2FA) has been removed from user account ${email}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ FAILED to remove user MFA:", error.message || error);
    process.exit(1);
  }
}

disableUserMFA();
