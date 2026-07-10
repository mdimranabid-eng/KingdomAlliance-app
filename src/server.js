import express from 'express';
import admin from 'firebase-admin';
import crypto from 'crypto';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'kingdom-alliance-v2'
  });
  console.log('[Admin Server] Firebase Admin SDK initialized.');
}

const app = express();
const PORT = 3001;

// Manual robust CORS configuration (no 'cors' package needed)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

/**
 * Middleware: Verifies Firebase ID Token and checks for Admin Custom Claims
 */
const verifyAdminToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token format.' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if user is admin
    const isAdmin = decodedToken.role === 'admin' || decodedToken.admin === true || decodedToken.email?.endsWith('@kingdomalliance.com');
    if (!isAdmin) {
      res.status(403).json({ error: 'Access Denied: Administrative privileges required.' });
      return;
    }

    req.adminUser = decodedToken;
    next();
  } catch (error) {
    console.error('[Admin Server] Token verification failed:', error.message);
    res.status(401).json({ error: `Unauthorized: Token verification failed: ${error.message}` });
  }
};

/**
 * POST /api/admin/delete-user
 * Complete cascade deletion workflow for a user account from Auth and Database.
 */
app.post('/api/admin/delete-user', verifyAdminToken, async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
     res.status(400).json({ error: 'Bad Request: Target user uid is required.' });
     return;
  }

  console.log(`\n--- BEGIN CASCADING PURGE FOR USER: ${uid} ---`);
  const logs = [];

  const logStep = (msg) => {
    console.log(`[Admin Cascade] ${msg}`);
    logs.push(msg);
  };

  const db = admin.firestore();

  // 1. Purge Cloudinary physical assets via REST API (No Cloudinary package needed)
  try {
    logStep('Auditing user document for Cloudinary uploads...');
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data() || {};
      
      const configDoc = await db.collection('settings').doc('site_config').get();
      const configData = configDoc.exists ? configDoc.data() : {};
      const cloudName = configData?.cloudinaryCloudName || process.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiKey = configData?.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY;
      const apiSecret = configData?.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET;

      if (cloudName && apiKey && apiSecret) {
        const urlsToDelete = new Set();
        if (userData.photoUrl) urlsToDelete.add(userData.photoUrl);
        if (userData.pendingPhotoUrl) urlsToDelete.add(userData.pendingPhotoUrl);
        if (Array.isArray(userData.gallery)) {
          userData.gallery.forEach((g) => {
            if (g && g.url) urlsToDelete.add(g.url);
          });
        }

        for (const url of urlsToDelete) {
          if (url && url.includes('cloudinary.com')) {
            const matches = url.match(/\/v\d+\/([^\s.]+)\./);
            if (matches && matches[1]) {
              const publicId = matches[1];
              logStep(`Purging Cloudinary asset public ID via REST: ${publicId}`);
              try {
                const timestamp = Math.round(new Date().getTime() / 1000);
                const signatureStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
                const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

                const formData = new URLSearchParams();
                formData.append('public_id', publicId);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp.toString());
                formData.append('signature', signature);

                const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                  method: 'POST',
                  body: formData
                });
                
                const cloudJson = await cloudRes.json();
                logStep(`Cloudinary REST response for ${publicId}: ${JSON.stringify(cloudJson)}`);
              } catch (cloudinaryErr) {
                console.error(`[Cloudinary Purge Error] ${cloudinaryErr.message}`);
              }
            }
          }
        }
      } else {
        logStep('Cloudinary credentials not fully configured. Skipping asset purging.');
      }
    } else {
      logStep('User document already missing. Skipping Cloudinary purge.');
    }
  } catch (error) {
    logStep(`Exception during Cloudinary purging: ${error.message}`);
  }

  // 2. Cascade Delete /interests where fromId or toId is target uid
  let relatedUids = [];
  try {
    logStep('Scanning interests table for matching records...');
    const interestsFrom = await db.collection('interests').where('fromId', '==', uid).get();
    const interestsTo = await db.collection('interests').where('toId', '==', uid).get();

    const batch = db.batch();
    interestsFrom.docs.forEach(doc => {
      batch.delete(doc.ref);
      const data = doc.data();
      if (data.toId) relatedUids.push(data.toId);
    });
    interestsTo.docs.forEach(doc => {
      batch.delete(doc.ref);
      const data = doc.data();
      if (data.fromId) relatedUids.push(data.fromId);
    });

    await batch.commit();
    logStep(`Purged ${interestsFrom.docs.length + interestsTo.docs.length} interest documents.`);
  } catch (error) {
    logStep(`Exception during interests purge: ${error.message}`);
  }

  // 3. Cascade Delete /shortlists where userId or targetId is target uid
  try {
    logStep('Scanning shortlists table for matching records...');
    const shortlistsUser = await db.collection('shortlists').where('userId', '==', uid).get();
    const shortlistsTarget = await db.collection('shortlists').where('targetId', '==', uid).get();

    const batch = db.batch();
    shortlistsUser.docs.forEach(doc => batch.delete(doc.ref));
    shortlistsTarget.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    logStep(`Purged ${shortlistsUser.docs.length + shortlistsTarget.docs.length} shortlist documents.`);
  } catch (error) {
    logStep(`Exception during shortlists purge: ${error.message}`);
  }

  // 4. Cascade Delete /chats and subcollection /messages matching derived chatIds
  try {
    logStep('Scanning chats and subcollection messages...');
    const chatIds = Array.from(new Set(relatedUids.map(otherId => [uid, otherId].sort().join('_'))));

    for (const cid of chatIds) {
      logStep(`Purging subcollection messages for chat: ${cid}`);
      const messagesRef = db.collection(`chats/${cid}/messages`);
      const messagesSnap = await messagesRef.get();
      
      const batch = db.batch();
      messagesSnap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      logStep(`Purging parent chat document chats/${cid}`);
      await db.collection('chats').doc(cid).delete();
    }
    logStep(`Chat cascade completed.`);
  } catch (error) {
    logStep(`Exception during chat cascade: ${error.message}`);
  }

  // 5. Delete Photo Moderation records
  try {
    logStep('Scanning photo moderation collection...');
    const moderationSnap = await db.collection('photoModeration').where('userId', '==', uid).get();
    const batch = db.batch();
    moderationSnap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    logStep(`Purged ${moderationSnap.docs.length} photoModeration records.`);
  } catch (error) {
    logStep(`Exception during photoModeration purge: ${error.message}`);
  }

  // 6. Delete Authentication Credentials from Firebase Auth (strict idempotent catch)
  try {
    logStep('Executing Firebase Authentication deletion...');
    await admin.auth().deleteUser(uid);
    logStep('Firebase Authentication account successfully deleted.');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      logStep('User was not found in Firebase Authentication (already deleted).');
    } else {
      logStep(`Auth deletion warning (continuing cascade): ${error.message}`);
    }
  }

  // 7. Delete Firestore main profile document `users/{uid}`
  try {
    logStep(`Purging main user document: users/${uid}`);
    await db.collection('users').doc(uid).delete();
    logStep('Main Firestore document successfully deleted.');
  } catch (error) {
    logStep(`Exception during main user document purge: ${error.message}`);
  }

  logStep('--- CASACADING PURGE END ---');
  res.status(200).json({
    success: true,
    message: 'User account and all related database records were permanently purged.',
    logs
  });
});

app.listen(PORT, () => {
  console.log(`[Admin Server] Running on http://localhost:${PORT}`);
});
