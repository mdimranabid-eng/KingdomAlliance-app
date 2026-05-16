import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function deleteUserByEmail(email) {
  console.log(`Searching for user: ${email}`);
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('User not found in Firestore.');
      return;
    }
    
    for (const userDoc of snapshot.docs) {
      const uid = userDoc.id;
      console.log(`Found user with UID: ${uid}. Deleting Firestore document...`);
      await deleteDoc(doc(db, 'users', uid));
      console.log('Firestore document deleted successfully.');
    }
  } catch (error) {
    console.error('Error during deletion:', error);
  }
}

deleteUserByEmail('motoindia.2018@gmail.com').then(() => {
    console.log('Process finished.');
    process.exit(0);
});
