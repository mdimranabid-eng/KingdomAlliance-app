// Sample biodata PDF for groom.nathaniel.johnson@example.com
// Uses the exact Firestore onboarding schema (see OnboardingPage.tsx setDoc payload)
const { generateBiodataPdf } = await import('../functions/lib/biodataPdf.js');
const fs = await import('fs');

const sampleUser = {
  name: 'Nathaniel',
  lastName: 'Johnson',
  email: 'groom.nathaniel.johnson@example.com',
  mobileNumber: '+966 55 123 4567',
  profileId: 'KA-7X2Q4M',
  profileFor: 'Self',
  profileType: 'Groom',
  dob: '1994-06-15',
  age: '31',
  citizenship: 'India',
  countryLiving: 'Saudi Arabia',
  cityLiving: 'Riyadh',
  maritalStatus: 'Never Married',
  motherTongue: 'Malayalam',
  languagesKnown: 'English, Malayalam, Hindi, Tamil',
  height: '5 ft 10 in',
  weight: '75 kg',
  bodyType: 'Average',
  complexion: 'Wheatish',
  physicalStatus: 'Normal',
  physicalStatusDesc: '',
  denomination: 'Church of South India (CSI)',
  diocese: 'Madhya Kerala Diocese',
  churchName: 'St. Thomas Mar Thoma Church',
  churchCity: 'Riyadh',
  churchArea: 'Olaya',
  baptized: 'Yes',
  pastorName: 'Rev. George Mathew',
  pastorNumber: '9876543210',
  spiritualInvolvement: 'Active member of church choir and Sunday school teacher',
  fathersName: 'John Johnson',
  fathersOccupation: 'Retired Bank Manager',
  mothersName: 'Mary Johnson',
  mothersOccupation: 'Homemaker',
  numberOfSiblings: '1 (Elder Sister, Married)',
  education: 'Masters',
  fieldOfStudy: 'Computer Science',
  college: 'Anna University, Chennai',
  profession: 'Software Engineer',
  employmentType: 'Private',
  annualIncome: 'SAR 240,000',
  dietaryHabits: 'Non-Vegetarian',
  drinkingHabits: 'Never',
  smokingHabits: 'Never',
  hobbies: 'Music, Photography, Trekking, Reading',
  aboutMe: 'I am a God-fearing person who values family, faith and honesty. I enjoy an active church life and am looking for a partner who shares the same values.',
  partnerPreferences: {
    ageMin: '25',
    ageMax: '30',
    heightMin: '5 ft 2 in',
    heightMax: '5 ft 8 in',
    maritalStatus: ['Never Married'],
    denominations: ['Church of South India (CSI)', 'Mar Thoma', 'Orthodox'],
    motherTongue: 'Malayalam',
    educationLevel: 'Graduate or above',
    employmentStatus: 'Employed',
    dietaryHabits: 'No Preference',
    drinkingHabits: 'Never',
    smokingHabits: 'Never',
    country: 'India, Saudi Arabia, UAE',
    city: 'Any',
    relocationPreference: 'Willing to relocate',
    otherPreferences: 'Looking for a believing, family-oriented partner with an active church life.',
  },
};

const pdf = await generateBiodataPdf(sampleUser);
const { fileURLToPath } = await import('url');
const out = fileURLToPath(new URL('./sample-biodata-groom-nathaniel.pdf', import.meta.url));
fs.writeFileSync(out, pdf);

console.log('Written:', out, `(${(pdf.length / 1024).toFixed(1)} KB)`);
