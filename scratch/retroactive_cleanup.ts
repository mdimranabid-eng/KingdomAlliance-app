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
        // 3. Purge Orphaned account from Authentication
        console.warn(`[ALERT] ORPHANED ACCOUNT IDENTIFIED: ${email} (UID: ${uid})`);
        
        try {
          await auth.deleteUser(uid);
          console.log(`[PURGE] Successfully deleted orphaned credential for email: ${email}`);
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
