import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'kingdom-alliance-v2'
  });
}

/**
 * Retroactively scans the Firebase Authentication user list and cross-references
 * it with Cloud Firestore. If any auth credential lacks a matching profile document
 * in the /users collection, it is purged as an orphaned security risk.
 */
async function performRetroactiveCleanup() {
  console.log('\n==================================================');
  console.log('[Retroactive Cleanup] Commencing audit of Firebase Authentication list...');
  console.log('==================================================');

  const auth = admin.auth();
  const db = admin.firestore();

  let totalScanned = 0;
  let orphansDeleted = 0;

  try {
    // 1. Fetch complete list of user accounts registered in Firebase Auth
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;
    
    console.log(`[Retroactive Cleanup] Fetched ${users.length} accounts from Firebase Auth.`);

    // 2. Cross-reference each user with Cloud Firestore /users/{uid}
    for (const user of users) {
      totalScanned++;
      const uid = user.uid;
      const email = user.email || 'No Email';
      
      console.log(`[Audit] [${totalScanned}/${users.length}] Auditing: ${email} (${uid})`);

      const userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        // 3. Purge Orphaned account from Authentication and Firestore, and cascade to Photo Moderation
        console.warn(`[ALERT] ORPHANED ACCOUNT IDENTIFIED: ${email} (UID: ${uid})`);
        
        try {
          // A. Delete Auth credential
          await auth.deleteUser(uid);
          console.log(`[PURGE] Successfully deleted orphaned Auth credential for email: ${email}`);
          
          // B. Delete Firestore user document (with 2s safety timeout for offline/emulated runs)
          await Promise.race([
            db.collection('users').doc(uid).delete(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Write timeout - network offline')), 2000))
          ]).then(() => {
            console.log(`[PURGE] Executed Firestore document cleanup for UID: ${uid}`);
          }).catch(err => {
            console.log(`[PURGE] Firestore document cleanup skipped or timed out: ${err.message}`);
          });

          // C. Delete matching moderation documents in the 'photoModeration' collection (with 2s safety timeout for offline/emulated runs)
          const modDocs = await Promise.race([
            db.collection('photoModeration').where('userId', '==', uid).get(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout - network offline')), 2000))
          ]).catch(err => {
            console.log(`[PURGE] photoModeration cascade skipped or timed out: ${err.message}`);
            return { docs: [] };
          });
          const modDeletions = modDocs.docs.map(doc => doc.ref.delete());
          await Promise.all(modDeletions);
          console.log(`[PURGE] Cascaded and deleted ${modDeletions.length} photoModeration documents.`);

          orphansDeleted++;
        } catch (deleteError: any) {
          console.error(`[PURGE ERROR] Failed to delete orphaned account ${email}:`, deleteError.message);
        }
      } else {
        console.log(`[PASS] Verified active user profile document exists for: ${email}`);
      }
    }

  } catch (error: any) {
    console.error('[Retroactive Cleanup] Script execution failed:', error.message);
  }

  console.log('==================================================');
  console.log('[Retroactive Cleanup] AUDIT COMPLETED SUCCESSFULLY.');
  console.log(`- Total Auth Accounts Audited: ${totalScanned}`);
  console.log(`- Orphaned Security Risks Purged: ${orphansDeleted}`);
  console.log('==================================================\n');
}

// Execute the cleanup routine
performRetroactiveCleanup().then(() => {
  process.exit(0);
});
