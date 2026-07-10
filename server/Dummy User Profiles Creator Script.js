/**
 * The Kingdom Alliances — Dummy User Profiles Creator Script
 * 
 * Creates 10 Grooms and 10 Brides in Saudi Arabia with fully filled fields.
 * Denominations distribution includes exactly 4 Catholics and 4 Protestants.
 * 
 * Usage: node server/"Dummy User Profiles Creator Script.js"
 */

const admin = require('firebase-admin');

// Determine target environment (defaults to staging)
const env = (process.argv[2] || 'staging').toLowerCase();
const keyPath = env === 'production' ? './serviceAccountKey.production.json' : './serviceAccountKey.staging.json';

console.log(`🎯 Seeding target environment: ${env.toUpperCase()}`);
const serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const MALE_NAMES = ["Gabriel", "Nathaniel", "Samuel", "Caleb", "Isaac", "Joshua", "Elijah", "Daniel", "Luke", "Matthew"];
const FEMALE_NAMES = ["Seraphina", "Evangeline", "Grace", "Hope", "Faith", "Charity", "Mercy", "Patience", "Verity", "Felicity"];
const SURNAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson"];

const SAUDI_CITIES = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Mecca", "Medina", "Jubail", "Hofuf", "Tabuk", "Taif"];

const HEIGHTS = ["5.2", "5.4", "5.6", "5.8", "5.10", "6.0", "6.2"];
const MOTHER_TONGUES = ["English", "Spanish", "French", "German", "Hindi", "Malayalam", "Tamil"];
const PROFS = ["Software Engineer", "Medical Doctor", "High School Teacher", "Architect", "Project Manager", "UX Designer", "Pharmacist", "Graphic Artist", "Registered Nurse", "Senior Accountant"];

// Distribute exactly 4 Catholics and 4 Protestants across 20 profiles
// Brides: 2 Catholic, 2 Protestant, 6 Others
// Grooms: 2 Catholic, 2 Protestant, 6 Others
const BRIDE_DENOMS = ["Catholic", "Catholic", "Protestant", "Protestant", "Orthodox", "Baptist", "Pentecostal", "Anglican / Episcopalian", "Methodist", "Lutheran"];
const GROOM_DENOMS = ["Catholic", "Catholic", "Protestant", "Protestant", "Orthodox", "Baptist", "Pentecostal", "Anglican / Episcopalian", "Methodist", "Lutheran"];

function generateProfileId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const getLetter = () => letters[Math.floor(Math.random() * 26)];
  const getNumber = () => numbers[Math.floor(Math.random() * 10)];
  return `${getLetter()}${getLetter()}${getLetter()}${getNumber()}${getLetter()}${getLetter()}${getLetter()}${getNumber()}`;
}

async function getOrCreateAuthUser(email, password, displayName) {
  try {
    const user = await auth.createUser({
      email,
      password,
      emailVerified: true,
      displayName
    });
    console.log(`✅ Auth user created (UID: ${user.uid})`);
    return user;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      const user = await auth.getUserByEmail(email);
      console.log(`ℹ️ Auth user already exists (UID: ${user.uid}). Re-using and writing/updating profile...`);
      return user;
    }
    throw error;
  }
}

async function seedData() {
  console.log('🚀 Starting profile creation process...');
  const count = 10;

  try {
    // 1. Seed Grooms
    for (let i = 0; i < count; i++) {
      const firstName = MALE_NAMES[i];
      const lastName = SURNAMES[i];
      const fullName = `${firstName} ${lastName}`;
      const email = `groom.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const password = 'Password123!';
      const city = SAUDI_CITIES[i]; // Different city for each
      const denom = GROOM_DENOMS[i];
      const age = 18 + Math.floor(Math.random() * 18); // age range 18 to 35
      const birthYear = 2026 - age;

      console.log(`\n⏳ Creating/Fetching Auth account for Groom: ${email}...`);
      const authUser = await getOrCreateAuthUser(email, password, fullName);

      const profileData = {
        uid: authUser.uid,
        name: firstName,
        middleName: 'Joseph',
        lastName: lastName,
        email: email,
        mobileNumber: `+966 50 123 45${i.toString().padStart(2, '0')}`,
        profileType: 'groom',
        profileFor: 'Self',
        gender: 'male',
        dob: `${birthYear}-06-15`,
        age: age,
        citizenship: 'Saudi Arabia',
        countryLiving: 'Saudi Arabia',
        cityLiving: city,
        maritalStatus: 'Never Married',
        height: HEIGHTS[i % HEIGHTS.length],
        weight: `${70 + i} kg`,
        bodyType: 'Athletic',
        complexion: 'Fair',
        physicalStatus: 'Normal',
        physicalStatusDesc: 'Excellent health',
        denomination: denom,
        churchName: `${denom} Grace Church`,
        churchCity: city,
        fathersName: `Arthur ${lastName}`,
        fathersOccupation: 'Retired Officer',
        mothersName: `Mary ${lastName}`,
        mothersOccupation: 'Teacher',
        numberOfSiblings: '2',
        diocese: 'Riyadh Diocese',
        baptized: 'Yes',
        spiritualInvolvement: ['Youth Ministry', 'Sunday School'],
        motherTongue: 'English',
        languagesKnown: ['English', 'Arabic'],
        education: 'Bachelors Degree',
        fieldOfStudy: 'Computer Science',
        college: 'King Saud University',
        profession: PROFS[i % PROFS.length],
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
          ageMin: 18,
          ageMax: 35,
          heightMin: '5.0',
          heightMax: '5.8',
          maritalStatus: ['Never Married'],
          denominations: [denom],
          motherTongue: ['English'],
          educationLevel: 'Bachelors Degree',
          employmentStatus: 'Employed',
          dietaryHabits: 'Any',
          drinkingHabits: 'Never',
          smokingHabits: 'Never',
          country: 'Saudi Arabia',
          city: city,
          relocationPreference: 'Yes',
          otherPreferences: 'Looking for a faith-centered partner.'
        },
        emailVerified: true,
        authProvider: 'email',
        role: 'user',
        status: 'active',
        isSuspended: false,
        isBanned: false,
        isApproved: true,
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
      const lastName = SURNAMES[(i + 5) % SURNAMES.length];
      const fullName = `${firstName} ${lastName}`;
      const email = `bride.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const password = 'Password123!';
      const city = SAUDI_CITIES[(i + 3) % SAUDI_CITIES.length]; // Different city for each
      const denom = BRIDE_DENOMS[i];
      const age = 18 + Math.floor(Math.random() * 18); // age range 18 to 35
      const birthYear = 2026 - age;

      console.log(`\n⏳ Creating/Fetching Auth account for Bride: ${email}...`);
      const authUser = await getOrCreateAuthUser(email, password, fullName);

      const profileData = {
        uid: authUser.uid,
        name: firstName,
        middleName: 'Marie',
        lastName: lastName,
        email: email,
        mobileNumber: `+966 50 123 46${i.toString().padStart(2, '0')}`,
        profileType: 'bride',
        profileFor: 'Self',
        gender: 'female',
        dob: `${birthYear}-08-20`,
        age: age,
        citizenship: 'Saudi Arabia',
        countryLiving: 'Saudi Arabia',
        cityLiving: city,
        maritalStatus: 'Never Married',
        height: HEIGHTS[(i + 2) % HEIGHTS.length],
        weight: `${55 + i} kg`,
        bodyType: 'Slim',
        complexion: 'Very Fair',
        physicalStatus: 'Normal',
        physicalStatusDesc: 'Excellent health',
        denomination: denom,
        churchName: `${denom} Covenant Church`,
        churchCity: city,
        fathersName: `Joseph ${lastName}`,
        fathersOccupation: 'Engineer',
        mothersName: `Sarah ${lastName}`,
        mothersOccupation: 'Homemaker',
        numberOfSiblings: '1',
        diocese: 'Jeddah Diocese',
        baptized: 'Yes',
        spiritualInvolvement: ['Choir', 'Bible Study Group'],
        motherTongue: 'English',
        languagesKnown: ['English', 'Arabic'],
        education: 'Masters Degree',
        fieldOfStudy: 'Literature',
        college: 'King Abdulaziz University',
        profession: PROFS[(i + 3) % PROFS.length],
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
          ageMin: 18,
          ageMax: 35,
          heightMin: '5.4',
          heightMax: '6.2',
          maritalStatus: ['Never Married'],
          denominations: [denom],
          motherTongue: ['English'],
          educationLevel: 'Bachelors Degree',
          employmentStatus: 'Employed',
          dietaryHabits: 'Any',
          drinkingHabits: 'Never',
          smokingHabits: 'Never',
          country: 'Saudi Arabia',
          city: city,
          relocationPreference: 'Yes',
          otherPreferences: 'Looking for a faith-centered partner.'
        },
        emailVerified: true,
        authProvider: 'email',
        role: 'user',
        status: 'active',
        isSuspended: false,
        isBanned: false,
        isApproved: true,
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

    console.log('\n🎉 Successfully created 10 Grooms and 10 Brides in Saudi Arabia!');
  } catch (error) {
    console.error('❌ Seeding process encountered an error:', error);
  } finally {
    process.exit(0);
  }
}

seedData();
