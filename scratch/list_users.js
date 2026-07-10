import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'kingdom-alliance-v2'
  });
}

const auth = admin.auth();

async function listAll() {
  try {
    const listUsersResult = await auth.listUsers();
    console.log('--- Active Auth List ---');
    listUsersResult.users.forEach(user => {
      console.log(`- Email: ${user.email} (UID: ${user.uid})`);
    });
    console.log('------------------------');
  } catch (err) {
    console.error('Error listing users:', err.message);
  }
}

listAll();
