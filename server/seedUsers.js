/**
 * Kingdom Alliance — Database Seeding Script
 * 
 * Creates dummy matrimonial profiles (both in Firebase Auth and Firestore 'users' collection)
 * using the Firebase Admin SDK.
 * 
 * Usage: node server/seedUsers.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const MALE_NAMES = ["Gabriel", "Nathaniel", "Samuel", "Caleb", "Isaac", "Joshua", "Elijah", "Daniel", "Luke", "Matthew"];
const FEMALE_NAMES = ["Seraphina", "Evangeline", "Grace", "Hope", "Faith", "Charity", "Mercy", "Patience", "Verity", "Felicity"];
const SURNAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson"];
const DENOMS = ["Catholic", "Orthodox", "Protestant", "Pentecostal", "Baptist", "Methodist", "Anglican"];
const PROFS = ["Software Engineer", "Medical Doctor", "High School Teacher", "Architect", "Project Manager", "UX Designer", "Pharmacist", "Graphic Artist", "Registered Nurse", "Senior Accountant"];
const COUNTRIES = ["Saudi Arabia", "United Arab Emirates", "United Kingdom", "United States", "Canada"];
const CITIES = {
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  "United Kingdom": ["London", "Manchester", "Birmingham"],
  "United States": ["New York", "Los Angeles", "Chicago"],
  "Canada": ["Toronto", "Vancouver", "Montreal"]
};
const HEIGHTS = ["5.2", "5.4", "5.6", "5.8", "5.10", "6.0", "6.2"];
const MOTHER_TONGUES = ["English", "Spanish", "French", "German", "Hindi", "Malayalam", "Tamil"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateProfileId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const getLetter = () => letters[Math.floor(Math.random() * 26)];
  const getNumber = () => numbers[Math.floor(Math.random() * 10)];
  return `${getLetter()}${getLetter()}${getLetter()}${getNumber()}${getLetter()}${getLetter()}${getLetter()}${getNumber()}`;
}

async function seedData() {
  console.log('🚀 Starting profile seeding process...');
  const count = 5; // Create 5 Grooms and 5 Brides (10 total profiles)

  try {
    // 1. Seed Grooms
    for (let i = 0; i < count; i++) {
      const firstName = MALE_NAMES[i];
      const lastName = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
      const fullName = `${firstName} ${lastName}`;
      const email = `groom.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const password = 'password123';
      const country = getRandomItem(COUNTRIES);
      const city = getRandomItem(CITIES[country]);

      console.log(`\n⏳ Creating Auth account for Groom: ${email}...`);
      const authUser = await auth.createUser({
        email,
        password,
        emailVerified: true,
        displayName: fullName
      });

      console.log(`✅ Auth user created (UID: ${authUser.uid})`);

      const profileData = {
        uid: authUser.uid,
        name: firstName,
        middleName: '',
        lastName: lastName,
        email: email,
        mobileNumber: `+1 555-010${i}`,
        profileType: 'groom',
        profileFor: 'Self',
        gender: 'male',
        dob: '1995-06-15',
        age: 26 + i,
        citizenship: country,
        countryLiving: country,
        cityLiving: city,
        maritalStatus: 'Never Married',
        height: getRandomItem(HEIGHTS),
        weight: `${70 + i * 2} kg`,
        bodyType: 'Athletic',
        complexion: 'Fair',
        physicalStatus: 'Normal',
        physicalStatusDesc: '',
        denomination: getRandomItem(DENOMS),
        churchName: 'Grace Community Church',
        churchCity: city,
        fathersName: `Arthur ${lastName}`,
        fathersOccupation: 'Retired Officer',
        mothersName: `Mary ${lastName}`,
        mothersOccupation: 'Teacher',
        numberOfSiblings: '2',
        diocese: 'Central',
        baptized: 'Yes',
        spiritualInvolvement: ['Youth Ministry', 'Sunday School'],
        motherTongue: getRandomItem(MOTHER_TONGUES),
        languagesKnown: ['English', getRandomItem(MOTHER_TONGUES)],
        education: 'Bachelors Degree',
        fieldOfStudy: 'Computer Science',
        college: 'State University',
        profession: getRandomItem(PROFS),
        employmentType: 'Full-Time',
        annualIncome: '$80,000 - $100,000',
        dietaryHabits: 'Non-Vegetarian',
        drinkingHabits: 'Never',
        smokingHabits: 'Never',
        hobbies: ['Reading', 'Hiking', 'Photography'],
        aboutMe: 'I am a committed Christian trying to grow in my faith daily. Looking for a partner who shares the same values and loves community service.',
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
        photoPrivacy: 'public',
        pendingPhotoUrl: '',
        photoStatus: 'approved',
        gallery: [],
        partnerPreferences: {
          ageMin: '22',
          ageMax: '30',
          heightMin: '5.0',
          heightMax: '5.8',
          maritalStatus: ['Never Married'],
          denominations: DENOMS,
          motherTongue: MOTHER_TONGUES,
          educationLevel: 'Bachelors Degree',
          employmentStatus: 'Employed',
          dietaryHabits: 'Any',
          drinkingHabits: 'Never',
          smokingHabits: 'Never',
          country: country,
          city: city,
          relocationPreference: 'Yes'
        },
        emailVerified: true,
        authProvider: 'email',
        role: 'user',
        isSuspended: false,
        isBanned: false,
        isApproved: true, // Auto-approve dummy profile
        onboardingComplete: true,
        approvalStatus: 'approved',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
        profileId: generateProfileId()
      };

      console.log(`⏳ Writing Groom document to Firestore collection 'users'...`);
      await db.collection('users').doc(authUser.uid).set(profileData);
      console.log(`✅ Firestore document created!`);
    }

    // 2. Seed Brides
    for (let i = 0; i < count; i++) {
      const firstName = FEMALE_NAMES[i];
      const lastName = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
      const fullName = `${firstName} ${lastName}`;
      const email = `bride.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const password = 'password123';
      const country = getRandomItem(COUNTRIES);
      const city = getRandomItem(CITIES[country]);

      console.log(`\n⏳ Creating Auth account for Bride: ${email}...`);
      const authUser = await auth.createUser({
        email,
        password,
        emailVerified: true,
        displayName: fullName
      });

      console.log(`✅ Auth user created (UID: ${authUser.uid})`);

      const profileData = {
        uid: authUser.uid,
        name: firstName,
        middleName: '',
        lastName: lastName,
        email: email,
        mobileNumber: `+1 555-020${i}`,
        profileType: 'bride',
        profileFor: 'Self',
        gender: 'female',
        dob: '1997-08-20',
        age: 23 + i,
        citizenship: country,
        countryLiving: country,
        cityLiving: city,
        maritalStatus: 'Never Married',
        height: getRandomItem(HEIGHTS),
        weight: `${55 + i} kg`,
        bodyType: 'Slim',
        complexion: 'Very Fair',
        physicalStatus: 'Normal',
        physicalStatusDesc: '',
        denomination: getRandomItem(DENOMS),
        churchName: 'Trinity Anglican Church',
        churchCity: city,
        fathersName: `Joseph ${lastName}`,
        fathersOccupation: 'Engineer',
        mothersName: `Sarah ${lastName}`,
        mothersOccupation: 'Homemaker',
        numberOfSiblings: '1',
        diocese: 'Eastern',
        baptized: 'Yes',
        spiritualInvolvement: ['Choir', 'Bible Study Group'],
        motherTongue: getRandomItem(MOTHER_TONGUES),
        languagesKnown: ['English', getRandomItem(MOTHER_TONGUES)],
        education: 'Masters Degree',
        fieldOfStudy: 'Literature',
        college: 'City College',
        profession: getRandomItem(PROFS),
        employmentType: 'Full-Time',
        annualIncome: '$60,000 - $80,000',
        dietaryHabits: 'Vegetarian',
        drinkingHabits: 'Never',
        smokingHabits: 'Never',
        hobbies: ['Music', 'Painting', 'Baking'],
        aboutMe: 'I value honesty, faith, and family. I enjoy singing in the choir and spending time with family. Seeking a life partner who is caring, mature, and centered in Christ.',
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
        photoPrivacy: 'public',
        pendingPhotoUrl: '',
        photoStatus: 'approved',
        gallery: [],
        partnerPreferences: {
          ageMin: '24',
          ageMax: '32',
          heightMin: '5.4',
          heightMax: '6.2',
          maritalStatus: ['Never Married'],
          denominations: DENOMS,
          motherTongue: MOTHER_TONGUES,
          educationLevel: 'Bachelors Degree',
          employmentStatus: 'Employed',
          dietaryHabits: 'Any',
          drinkingHabits: 'Never',
          smokingHabits: 'Never',
          country: country,
          city: city,
          relocationPreference: 'Yes'
        },
        emailVerified: true,
        authProvider: 'email',
        role: 'user',
        isSuspended: false,
        isBanned: false,
        isApproved: true, // Auto-approve dummy profile
        onboardingComplete: true,
        approvalStatus: 'approved',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
        profileId: generateProfileId()
      };

      console.log(`⏳ Writing Bride document to Firestore collection 'users'...`);
      await db.collection('users').doc(authUser.uid).set(profileData);
      console.log(`✅ Firestore document created!`);
    }

    console.log('\n🎉 SUCCESS: Seeding completed! Created 10 dummy profiles with password: password123');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR during seeding:', error.message || error);
    process.exit(1);
  }
}

seedData();
