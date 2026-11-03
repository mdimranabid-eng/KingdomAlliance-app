const fs = require('node:fs');
const path = require('node:path');
const { generateBiodataPdf } = require('../lib/biodataPdf');
const root = path.resolve(__dirname,'../..');
const sample = {
  documentSample:true,name:'Anna',middleName:'Grace',lastName:'Thomas',profileId:'KA-SAMPLE-001',profileFor:'Self',profileType:'Bride',submittedAt:'2026-10-05T09:00:00+03:00',approvalStatus:'pending',
  dob:'14 March 1998',age:28,mobileNumber:'+00 000 000 0000',citizenship:'Indian',countryLiving:'United Arab Emirates',cityLiving:'Dubai',maritalStatus:'Never married',motherTongue:'Malayalam',languagesKnown:['English','Malayalam','Hindi'],
  height:'165 cm',weight:'58 kg',bodyType:'Average',complexion:'Wheatish',physicalStatus:'No reported disability',physicalStatusDesc:'Not applicable',
  denomination:'Pentecostal',diocese:'Not applicable',churchName:'Grace Community Church (sample)',churchCity:'Dubai',churchArea:'Al Nahda',baptized:'Yes',pastorName:'Rev. David Mathew (fictional)',pastorNumber:'+00 000 000 0000',spiritualInvolvement:'Sunday school volunteer and worship team member',
  fathersName:'Thomas Joseph (fictional)',fathersOccupation:'Retired teacher',mothersName:'Mary Thomas (fictional)',mothersOccupation:'Homemaker',numberOfSiblings:'One younger brother',
  education:"Master's degree",fieldOfStudy:'Business Administration',college:'Sample University',profession:'Human Resources Specialist',employmentType:'Full-time',annualIncome:'Prefer to discuss personally',
  dietaryHabits:'Non-vegetarian',drinkingHabits:'Never',smokingHabits:'Never',hobbies:'Reading, baking, travel and community service',
  aboutMe:'I value a Christ-centred home, close family relationships and meaningful service. I enjoy quiet weekends, good books and exploring new places. I hope to build a marriage grounded in kindness, mutual respect and a shared commitment to faith.',
  partnerPreferences:{ageMin:28,ageMax:34,heightMin:'170 cm',heightMax:'190 cm',maritalStatus:['Never married'],denominations:['Pentecostal','Independent evangelical'],motherTongue:'Malayalam or English',educationLevel:"Bachelor's degree or above",employmentStatus:'Employed or self-employed',dietaryHabits:'Flexible',drinkingHabits:'Never',smokingHabits:'Never',country:'India or United Arab Emirates',city:'Flexible',relocationPreference:'Open to discussion',otherPreferences:'A kind, emotionally mature believer who values family, honest communication and shared responsibility.'}
};
(async()=>{
  fs.writeFileSync(path.join(root,'output/pdf/kingdom-alliance-biodata-sample.pdf'),await generateBiodataPdf(sample));
  fs.writeFileSync(path.join(root,'tmp/pdfs/long-profile-check.pdf'),await generateBiodataPdf({...sample,name:'Alexandra',middleName:'Elizabeth',lastName:'Montgomery-Wellington',aboutMe:Array(18).fill(sample.aboutMe).join(' ')}));
})();
