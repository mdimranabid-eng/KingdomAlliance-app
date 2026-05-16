import { db } from '../src/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function findUser() {
  const email = 'motoindia.2018@gmail.com';
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('User not found in Firestore.');
      return;
    }
    
    snapshot.forEach(doc => {
      console.log('User Found:');
      console.log('UID:', doc.id);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

findUser();
