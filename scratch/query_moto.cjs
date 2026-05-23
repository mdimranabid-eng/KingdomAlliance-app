const admin = require('firebase-admin');
const serviceAccount = require('../server/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'kingdom-alliance-v2'
});

const db = admin.firestore();

async function main() {
  const email = 'motoindia.2018@gmail.com';
  try {
    const snap = await db.collection('users').where('email', '==', email).get();
    if (snap.empty) {
      console.log('User not found.');
    } else {
      snap.forEach(doc => {
        console.log('USER_DOC:', JSON.stringify(doc.data(), null, 2));
      });
    }
  } catch(e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
main();
