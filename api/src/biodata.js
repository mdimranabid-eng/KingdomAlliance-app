// Biodata PDF — condensed port of functions/src/biodataPdf.ts (jsPDF, works in Node).
const { jsPDF } = require('jspdf');

const NAVY = [10, 20, 40];
const GOLD = [201, 168, 76];
const GREY = [110, 120, 135];
const LINE = [225, 220, 210];
const INK = [25, 30, 40];

const ML = 16; const PAGE_W = 210; const CW = PAGE_W - 32;

const v = (o, k) => {
  const val = o ? o[k] : undefined;
  if (val === undefined || val === null || String(val).trim() === '') return '—';
  return Array.isArray(val) ? val.join(', ') : String(val).trim();
};

function sectionTitle(doc, y, title) {
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...GOLD);
  doc.text(title.toUpperCase(), ML, y);
  doc.setDrawColor(...LINE).setLineWidth(0.5).line(ML, y + 1.6, ML + CW, y + 1.6);
  return y + 7;
}

function rows(doc, y, pairs) {
  doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(...INK);
  const colW = CW / 2; const rowH = 5.6;
  pairs.forEach(([label, value], i) => {
    const col = i % 2; const ry = y + Math.floor(i / 2) * rowH;
    doc.setFont('helvetica', 'bold').setTextColor(...GREY);
    doc.text(`${label}:`, ML + col * colW, ry);
    doc.setFont('helvetica', 'normal').setTextColor(...INK);
    doc.text(String(value).slice(0, 42), ML + col * colW + 30, ry);
  });
  return y + Math.ceil(pairs.length / 2) * rowH + 4;
}

function generateBiodataPdf(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const prefs = data.partnerPreferences || {};

  // Header
  doc.setFillColor(...NAVY).rect(0, 0, PAGE_W, 30, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...GOLD);
  doc.text('KINGDOM ALLIANCE', PAGE_W / 2, 13, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(255, 255, 255);
  doc.text('Christian Matrimony — Member Biodata', PAGE_W / 2, 20, { align: 'center' });
  doc.setFontSize(8).setTextColor(201, 168, 76);
  doc.text(`Profile ID: ${data.profileId || '—'}`, PAGE_W / 2, 25.5, { align: 'center' });

  let y = 40;
  y = sectionTitle(doc, y, 'Personal Details');
  y = rows(doc, y, [
    ['Full Name', v(data, 'fullName') !== '—' ? v(data, 'fullName') : v(data, 'name')],
    ['Profile For', v(data, 'profileFor')], ['Gender', v(data, 'gender')],
    ['Age', v(data, 'age')], ['Date of Birth', v(data, 'dob')], ['Height', v(data, 'height')],
    ['Complexion', v(data, 'complexion')], ['Marital Status', v(data, 'maritalStatus')],
    ['Mother Tongue', v(data, 'motherTongue')], ['Nationality', v(data, 'nationality')],
    ['Citizenship', v(data, 'citizenship')], ['Location', v(data, 'location') !== '—' ? v(data, 'location') : v(data, 'city')],
  ]);

  y = sectionTitle(doc, y, 'Faith & Ministry');
  y = rows(doc, y, [
    ['Denomination', v(data, 'denomination')], ['Church', v(data, 'churchName') !== '—' ? v(data, 'churchName') : v(data, 'church')],
    ['Church City', v(data, 'churchCity')], ['Church Area', v(data, 'churchArea')],
    ['Pastor Name', v(data, 'pastorName')], ['Ministry Role', v(data, 'ministryRole')],
    ['Baptized', v(data, 'baptized')], ['Diocese', v(data, 'diocese')],
  ]);

  y = sectionTitle(doc, y, 'Education & Career');
  y = rows(doc, y, [
    ['Education', v(data, 'education')], ['Field of Study', v(data, 'fieldOfStudy')],
    ['College', v(data, 'college')], ['Profession', v(data, 'profession')],
    ['Employment', v(data, 'employmentType')], ['Annual Income', v(data, 'annualIncome')],
  ]);

  y = sectionTitle(doc, y, 'Family Background');
  y = rows(doc, y, [
    ["Father's Name", v(data, 'fathersName')], ["Father's Occupation", v(data, 'fathersOccupation')],
    ["Mother's Name", v(data, 'mothersName')], ["Mother's Occupation", v(data, 'mothersOccupation')],
    ['Siblings', v(data, 'numberOfSiblings')], ['Family Type', v(data, 'familyType')],
    ['Family Faith', v(data, 'familyFaithBackground')], ['Family Details', v(data, 'familyDetails')],
  ]);

  y = sectionTitle(doc, y, 'Lifestyle & Interests');
  y = rows(doc, y, [
    ['Hobbies', v(data, 'hobbies')], ['Languages', v(data, 'languagesKnown')],
    ['Diet', v(data, 'dietaryHabits')], ['Drinking', v(data, 'drinkingHabits')],
    ['Smoking', v(data, 'smokingHabits')], ['Mobile', v(data, 'mobileNumber')],
  ]);

  if (String(v(data, 'aboutMe')) !== '—') {
    y = sectionTitle(doc, y, 'About Me');
    doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(...INK);
    const lines = doc.splitTextToSize(String(data.aboutMe), CW);
    doc.text(lines.slice(0, 6), ML, y);
    y += Math.min(lines.length, 6) * 5 + 4;
  }

  y = sectionTitle(doc, y, 'Partner Preferences');
  y = rows(doc, y, [
    ['Age Range', v(prefs, 'ageRange')], ['Height Range', v(prefs, 'heightRange')],
    ['Education', v(prefs, 'education')], ['Location', v(prefs, 'location')],
  ]);

  // Declaration + footer
  if (y > 245) { doc.addPage(); y = 25; }
  doc.setDrawColor(...GOLD).setLineWidth(0.8).rect(ML, y, CW, 24);
  doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(...NAVY);
  doc.text('DECLARATION', ML + 4, y + 6);
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...INK);
  doc.text(doc.splitTextToSize(
    'I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that Kingdom Alliance may verify these details and that any false information may result in the removal of my profile.',
    CW - 8), ML + 4, y + 11);
  doc.setFontSize(8).setTextColor(...GREY);
  doc.text('Kingdom Alliance — thekingdomalliances.com — Generated confidentially for member use only.', ML, 290);

  return Buffer.from(doc.output('arraybuffer'));
}

module.exports = { generateBiodataPdf };
