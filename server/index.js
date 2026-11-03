/** Local development uses the same API and cleanup handlers as production. */
'use strict';
const { createRequire } = require('node:module');
const path = require('node:path');
const runtimeRequire = createRequire(require.resolve('../functions/lib/api'));
const admin = runtimeRequire('firebase-admin');
if (!admin.apps.length) {
  const projectId = process.env.GCLOUD_PROJECT || 'kingdom-alliance-v2';
  const emulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  const options = { projectId };
  if (!emulator) {
    options.credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? admin.credential.applicationDefault()
      : admin.credential.cert(require(path.join(__dirname, 'serviceAccountKey.json')));
  }
  if (process.env.FIREBASE_DATABASE_URL) options.databaseURL = process.env.FIREBASE_DATABASE_URL;
  if (process.env.FIREBASE_STORAGE_BUCKET) options.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  admin.initializeApp(options);
}
const { adminApiApp } = require('../functions/lib/api');
const port = process.env.ADMIN_SERVER_PORT || 3001;
adminApiApp.listen(port, '127.0.0.1', () => console.log(`Admin API listening on http://localhost:${port}`));
