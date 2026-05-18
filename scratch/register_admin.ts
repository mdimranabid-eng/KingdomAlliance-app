import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

const configPath = path.resolve('firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  const email = "admin@kingdomalliance.com";
  const password = "Admin123!";
  
  console.log(`Checking/Registering admin: ${email}...`);
  
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Created Firebase Auth user successfully:", res.user.uid);
    
    // Add to Firestore user and admin collections
    await setDoc(doc(db, 'users', res.user.uid), {
      uid: res.user.uid,
      name: "System Admin",
      email: email,
      emailVerified: true,
      role: 'admin',
      status: 'active'
    });
    
    await setDoc(doc(db, 'admins', res.user.uid), {
      uid: res.user.uid,
      email: email
    });
    
    console.log("Admin Firestore records created successfully!");
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log("Email already in use, signing in to update/ensure admin status in Firestore...");
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        console.log("Signed in successfully:", res.user.uid);
        
        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          name: "System Admin",
          email: email,
          emailVerified: true,
          role: 'admin',
          status: 'active'
        }, { merge: true });
        
        await setDoc(doc(db, 'admins', res.user.uid), {
          uid: res.user.uid,
          email: email
        }, { merge: true });
        
        console.log("Admin Firestore records updated/ensured successfully!");
      } catch (signInErr) {
        console.error("Sign in failed (might be password mismatch):", signInErr);
      }
    } else {
      console.error("Error registering admin:", err);
    }
  }
  process.exit(0);
}

run();
