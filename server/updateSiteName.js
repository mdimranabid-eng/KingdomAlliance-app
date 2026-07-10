const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function updateSiteName() {
  try {
    const docRef = db.collection('settings').doc('site_config');
    await docRef.set({
      siteName: "The Kingdom Alliances"
    }, { merge: true });
    console.log('✅ Successfully updated siteName to "The Kingdom Alliances" in Firestore staging!');
  } catch (error) {
    console.error('❌ Failed to update siteName:', error.message);
  } finally {
    process.exit(0);
  }
}

updateSiteName();
