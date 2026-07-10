import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function main() {
  const uid = 'ShR4VDT14UQQh9XAwYcTxnmqCVF2';
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      console.log('PROFILE_DATA:', JSON.stringify(docSnap.data(), null, 2));
    } else {
      console.log('User not found.');
    }
  } catch(e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
main();
