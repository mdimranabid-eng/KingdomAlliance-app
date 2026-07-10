const admin = require('firebase-admin');

try {
  const serviceAccount = require('./server/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  // If serviceAccountKey is missing, try initializing without it (might be on emulator)
  admin.initializeApp();
}

const db = admin.firestore();

db.collection('admins').get().then(snap => {
  if (snap.empty) { 
    console.log('Admins collection is empty or does not exist.'); 
    process.exit(0); 
  }
  snap.docs.forEach(doc => {
    console.log('---');
    console.log('Doc ID:', doc.id);
    const data = doc.data();
    console.log('Field Names:', Object.keys(data).join(', '));
    console.log('Has email field?', 'email' in data);
    console.log('Exact Values:');
    for (const [key, val] of Object.entries(data)) {
        console.log(`  ${key}:`, val);
    }
  });
  process.exit(0);
}).catch(err => {
  console.error('Error querying Firestore:', err);
  process.exit(1);
});
