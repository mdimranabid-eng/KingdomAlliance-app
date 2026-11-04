// Firebase Admin is kept ONLY for Cloud Messaging (push). Fail-soft: if the
// service account is missing, FCM is disabled and everything else works.
const fs = require('fs');
const path = require('path');

let instance = null;

function admin() {
  if (instance !== null) return instance;
  try {
    const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : null;
    if (!saPath || !fs.existsSync(saPath)) {
      console.warn('[fcm] No service account configured — push notifications disabled.');
      instance = null;
      return null;
    }
    // eslint-disable-next-line global-require
    const firebaseAdmin = require('firebase-admin');
    const cred = firebaseAdmin.credential.cert(JSON.parse(fs.readFileSync(saPath, 'utf8')));
    instance = firebaseAdmin.initializeApp({ credential: cred }, 'ka-messaging');
    console.log('[fcm] Firebase messaging initialized');
    return instance;
  } catch (err) {
    console.warn('[fcm] Initialization skipped:', err.message);
    instance = null;
    return null;
  }
}

async function sendPush(tokens, notification, data) {
  const app = admin();
  if (!app || !tokens || !tokens.length) return { responses: [] };
  try {
    return await app.messaging().sendEachForMulticast({ tokens, notification, data });
  } catch (err) {
    console.error('[fcm] send failed:', err.message);
    return { responses: [] };
  }
}

module.exports = { admin, sendPush };
