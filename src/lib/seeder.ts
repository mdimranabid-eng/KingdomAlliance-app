import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const MALE_NAMES = ["Gabriel", "Nathaniel", "Samuel", "Caleb", "Isaac", "Joshua", "Elijah", "Daniel", "Luke", "Matthew"];
const FEMALE_NAMES = ["Seraphina", "Evangeline", "Grace", "Hope", "Faith", "Charity", "Mercy", "Patience", "Verity", "Felicity"];
const SURNAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson"];
const DENOMS = ["Catholic", "Orthodox", "Protestant", "Pentecostal", "Baptist", "Methodist", "Anglican"];
const PROFS = ["Software Engineer", "Medical Doctor", "High School Teacher", "Architect", "Project Manager", "UX Designer", "Pharmacist", "Graphic Artist", "Registered Nurse", "Senior Accountant"];
const LOCS = ["Riyadh, SA", "Jeddah, SA", "Dammam, SA", "Dubai, UAE", "Abu Dhabi, UAE", "London, UK"];

export async function seedTestData() {
  const usersRef = collection(db, 'users');
  const results = [];

  // Seed 10 Grooms
  for (let i = 0; i < 10; i++) {
    const name = `${MALE_NAMES[i]} ${SURNAMES[Math.floor(Math.random() * 10)]}`;
    const uid = `dummy_groom_${i}_${Date.now()}`;
    results.push(addDoc(usersRef, {
      uid,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      emailVerified: true,
      gender: 'male',
      profileType: 'groom',
      age: 24 + Math.floor(Math.random() * 10),
      maritalStatus: 'Never Married',
      denomination: DENOMS[Math.floor(Math.random() * DENOMS.length)],
      profession: PROFS[Math.floor(Math.random() * PROFS.length)],
      education: 'University Graduate',
      location: LOCS[Math.floor(Math.random() * LOCS.length)],
      aboutMe: "I am a devout Christian looking for a God-fearing partner. I enjoy church activities, traveling, and community service.",
      isApproved: true,
      photoStatus: 'approved',
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      isFeatured: Math.random() > 0.8,
      height: 170 + Math.floor(Math.random() * 20),
      motherTongue: ['English'],
      churchName: 'Grace Cathedral'
    }));
  }

  // Seed 10 Brides
  for (let i = 0; i < 10; i++) {
    const name = `${FEMALE_NAMES[i]} ${SURNAMES[Math.floor(Math.random() * 10)]}`;
    const uid = `dummy_bride_${i}_${Date.now()}`;
    results.push(addDoc(usersRef, {
      uid,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      emailVerified: true,
      gender: 'female',
      profileType: 'bride',
      age: 21 + Math.floor(Math.random() * 10),
      maritalStatus: 'Never Married',
      denomination: DENOMS[Math.floor(Math.random() * DENOMS.length)],
      profession: PROFS[Math.floor(Math.random() * PROFS.length)],
      education: 'University Graduate',
      location: LOCS[Math.floor(Math.random() * LOCS.length)],
      aboutMe: "I am a person of faith seeking a partner to build a God-centered life together. I value tradition and spiritual growth.",
      isApproved: true,
      photoStatus: 'approved',
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      isFeatured: Math.random() > 0.8,
      height: 155 + Math.floor(Math.random() * 15),
      motherTongue: ['English'],
      churchName: 'Zion Church'
    }));
  }

  await Promise.all(results);
  return results.length;
}
