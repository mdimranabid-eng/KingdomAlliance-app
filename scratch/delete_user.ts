import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'kingdom-alliance-v2'
  });
}

/**
 * Cascade-deletes a user from Firebase Auth and Firestore by UID.
 * Implements strict idempotent cleanup logic to ensure failures in one layer
 * do not block cleanup in other layers.
 */
export async function deleteUserPermanently(uid: string) {
  console.log(`\n============================`);
  console.log(`[Admin SDK] Starting full cascading delete for UID: ${uid}`);
  console.log(`============================`);

  // 1. Purge Authentication Account
  try {
    console.log(`[Admin SDK] Deleting user from Firebase Auth...`);
    await admin.auth().deleteUser(uid);
    console.log(`[Admin SDK] Firebase Auth deletion complete.`);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.warn(`[Admin SDK] User UID ${uid} was not found in Firebase Auth. Continuing...`);
    } else {
      console.error(`[Admin SDK] Error during Firebase Auth deletion:`, error.message);
    }
  }

  // 2. Purge Firestore Document
  try {
    console.log(`[Admin SDK] Deleting Firestore user document users/${uid}...`);
    await admin.firestore().collection('users').doc(uid).delete();
    console.log(`[Admin SDK] Firestore document deletion complete.`);
  } catch (error: any) {
    console.error(`[Admin SDK] Error during Firestore document deletion:`, error.message);
  }

  // 3. Purge Photo Moderation Records
  try {
    console.log(`[Admin SDK] Purging photo moderation records for UID: ${uid}...`);
    const modDocs = await admin.firestore()
      .collection('photoModeration')
      .where('userId', '==', uid)
      .get();
    
    const modDeletions = modDocs.docs.map(doc => doc.ref.delete());
    await Promise.all(modDeletions);
    console.log(`[Admin SDK] Purged ${modDeletions.length} photoModeration records.`);
  } catch (error: any) {
    console.error(`[Admin SDK] Error during photoModeration cleanup:`, error.message);
  }

  console.log(`[Admin SDK] Cascading deletion workflow finalized for UID: ${uid}.`);
  console.log(`============================\n`);
}

// Script run wrapper
const targetEmail = 'motoindia.2018@gmail.com';
async function runScript() {
  try {
    // Look up user UID by email in Firestore
    const userDocs = await admin.firestore()
      .collection('users')
      .where('email', '==', targetEmail)
      .get();
    
    if (userDocs.empty) {
      console.log(`[Admin SDK Script] No user found with email: ${targetEmail}`);
      return;
    }
    
    for (const doc of userDocs.docs) {
      await deleteUserPermanently(doc.id);
    }
  } catch (error: any) {
    console.error(`[Admin SDK Script] Execution failed:`, error.message);
  }
}

// Run the script directly if invoked
if (process.argv[1]?.includes('delete_user')) {
  runScript().then(() => {
    console.log('Script execution finished.');
    process.exit(0);
  });
}
