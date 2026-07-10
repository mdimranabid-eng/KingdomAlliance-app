import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'kingdom-alliance-v2'
  });
}

const db = admin.firestore();

async function inspect() {
  try {
    const usersSnap = await db.collection('users').get();
    console.log(`\n=== FIRESTORE USERS INSPECTION ===`);
    console.log(`Total documents in 'users' collection: ${usersSnap.size}`);

    let onboardingCompleteCount = 0;
    let onboardingIncompleteCount = 0;
    const approvalStatusCounts = {};
    const genderCounts = {};
    const createdAts = [];

    usersSnap.forEach(doc => {
      const data = doc.data();
      
      // Onboarding complete
      if (data.onboardingComplete) {
        onboardingCompleteCount++;
      } else {
        onboardingIncompleteCount++;
      }

      // Approval status
      const status = data.approvalStatus || 'none';
      approvalStatusCounts[status] = (approvalStatusCounts[status] || 0) + 1;

      // Gender
      const gender = data.gender || 'none';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;

      // Created at
      if (data.createdAt) {
        try {
          const date = data.createdAt.toDate();
          createdAts.push({ email: data.email, date });
        } catch (e) {
          createdAts.push({ email: data.email, date: new Date(data.createdAt) });
        }
      }
    });

    console.log(`Onboarding Complete: ${onboardingCompleteCount}`);
    console.log(`Onboarding Incomplete: ${onboardingIncompleteCount}`);
    console.log(`Approval Statuses:`, approvalStatusCounts);
    console.log(`Genders:`, genderCounts);

    console.log(`\n=== NEW THIS WEEK CHECK ===`);
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let newThisWeekCount = 0;
    createdAts.forEach(item => {
      const isNew = item.date.getTime() > oneWeekAgo;
      if (isNew) {
        newThisWeekCount++;
        console.log(`- New User: ${item.email} (Created: ${item.date.toISOString()})`);
      }
    });
    console.log(`Total New This Week (using System Date.now()): ${newThisWeekCount}`);
    
    // Also check admins
    const adminsSnap = await db.collection('admins').get();
    console.log(`\nTotal admins in 'admins' collection: ${adminsSnap.size}`);
    adminsSnap.forEach(doc => {
      console.log(`- Admin UID: ${doc.id}, Email: ${doc.data().email}`);
    });
  } catch (err) {
    console.error('Error during inspection:', err);
  }
}

inspect();
