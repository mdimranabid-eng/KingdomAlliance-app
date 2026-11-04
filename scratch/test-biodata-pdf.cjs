const fs = require('fs');
const crypto = require('crypto');
const { jsPDF } = require('jspdf');

function generateBiodataPdf(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const ML = 14;
  const MR = 14;
  const CW = PAGE_W - ML - MR; // 182mm

  const NAVY = [15, 23, 42];        // #0F172A
  const GOLD = [184, 134, 11];      // #B8860B / Rich Gold
  const GOLD_LIGHT = [232, 215, 170];
  const INK = [30, 41, 59];         // #1E293B
  const GREY = [100, 116, 139];     // #64748B
  const LINE = [226, 232, 240];     // #E2E8F0
  const BG_CREAM = [252, 250, 246]; // Soft Warm Cream

  const v = (o, k) => {
    if (!o) return '—';
    const val = o[k];
    if (val === undefined || val === null || String(val).trim() === '') return '—';
    if (Array.isArray(val)) return val.length ? val.join(', ') : '—';
    return String(val).trim();
  };

  const name = v(data, 'fullName') !== '—' ? v(data, 'fullName') : v(data, 'name');
  const profileId = data.profileId || `KA-${(data.uid || 'MEMBER').slice(0, 6).toUpperCase()}`;
  const prefs = data.partnerPreferences || {};
  const email = data.email || '—';

  // Date formatted
  const executionDate = data.submittedAt
    ? (data.submittedAt instanceof Date ? data.submittedAt : new Date(data.submittedAt))
    : new Date();
  const dateStr = executionDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const timeStr = executionDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  });

  // Deterministic Cryptographic Verification Hash
  const hashSource = `${data.uid || 'anon'}:${profileId}:${email}:${executionDate.getTime()}`;
  const sha256Ref = crypto.createHash('sha256').update(hashSource).digest('hex').substring(0, 24).toUpperCase();

  // Helper: Section Title
  function sectionTitle(y, title) {
    doc.setFillColor(...BG_CREAM).rect(ML, y - 4, CW, 6.2, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...GOLD);
    doc.text(title.toUpperCase(), ML + 2.5, y + 0.5);
    doc.setDrawColor(...GOLD_LIGHT).setLineWidth(0.4).line(ML, y + 2.2, ML + CW, y + 2.2);
    return y + 6.5;
  }

  // Helper: Key-Value Grid (2 columns)
  function renderGrid(y, pairs) {
    const colW = CW / 2;
    const rowH = 4.8;
    const labelW = 28;
    pairs.forEach(([label, value], i) => {
      const col = i % 2;
      const ry = y + Math.floor(i / 2) * rowH;
      const rx = ML + col * colW;

      doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...GREY);
      doc.text(String(label).slice(0, 18), rx, ry);

      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...INK);
      const valStr = String(value);
      const maxW = colW - labelW - 2;
      const truncated = doc.splitTextToSize(valStr, maxW)[0] || '—';
      doc.text(truncated, rx + labelW, ry);
    });
    return y + Math.ceil(pairs.length / 2) * rowH + 2.5;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER HEADER & COMPLETE PROFILE DATA
  // ══════════════════════════════════════════════════════════════════════════════

  // Top Navy Banner
  doc.setFillColor(...NAVY).rect(0, 0, PAGE_W, 28, 'F');

  // Decorative Gold Line at bottom of banner
  doc.setFillColor(...GOLD).rect(0, 27.2, PAGE_W, 0.8, 'F');

  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...GOLD);
  doc.text('KINGDOM ALLIANCE', PAGE_W / 2, 10.5, { align: 'center' });

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(255, 255, 255);
  doc.text('CONFIDENTIAL CHRISTIAN MATRIMONIAL DOSSIER & COVENANT RECORD', PAGE_W / 2, 16.5, { align: 'center' });

  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GOLD_LIGHT);
  doc.text(`PROFILE ID: ${profileId}   •   EXECUTION DATE: ${dateStr.toUpperCase()}   •   STATUS: DIGITALLY VERIFIED`, PAGE_W / 2, 22, { align: 'center' });

  let y = 34;

  // 1. Personal & Vital Details
  y = sectionTitle(y, '1. Personal Identity & Vital Details');
  y = renderGrid(y, [
    ['Full Name', name],
    ['Profile For', v(data, 'profileFor')],
    ['Gender / Seeking', `${v(data, 'gender')} (${v(data, 'profileType') || 'Bride/Groom'})`],
    ['Marital Status', v(data, 'maritalStatus')],
    ['Age / DOB', `${v(data, 'age')} yrs (${v(data, 'dob')})`],
    ['Height', v(data, 'height')],
    ['Complexion', v(data, 'complexion')],
    ['Body Type', v(data, 'bodyType')],
    ['Mother Tongue', v(data, 'motherTongue')],
    ['Citizenship', v(data, 'citizenship') !== '—' ? v(data, 'citizenship') : v(data, 'nationality')],
    ['Current City', v(data, 'cityLiving') !== '—' ? v(data, 'cityLiving') : v(data, 'city')],
    ['Country of Residence', v(data, 'countryLiving') !== '—' ? v(data, 'countryLiving') : (v(data, 'location') !== '—' ? v(data, 'location') : '—')],
  ]);

  // 2. Faith, Church & Ministry
  y = sectionTitle(y, '2. Faith, Church Fellowship & Ministry');
  y = renderGrid(y, [
    ['Denomination', v(data, 'denomination')],
    ['Baptized Believer', v(data, 'baptized')],
    ['Church Name', v(data, 'churchName') !== '—' ? v(data, 'churchName') : v(data, 'church')],
    ['Diocese / District', v(data, 'diocese')],
    ['Church Location', v(data, 'churchCity') !== '—' ? v(data, 'churchCity') : v(data, 'churchArea')],
    ['Active Ministry Role', v(data, 'ministryRole')],
    ['Pastor Name', v(data, 'pastorName')],
    ['Pastor Contact', v(data, 'pastorNumber')],
  ]);

  // 3. Education & Profession
  y = sectionTitle(y, '3. Education, Profession & Financial Standing');
  y = renderGrid(y, [
    ['Education Level', v(data, 'education')],
    ['Field of Study', v(data, 'fieldOfStudy')],
    ['College / University', v(data, 'college')],
    ['Profession / Role', v(data, 'profession')],
    ['Employment Type', v(data, 'employmentType')],
    ['Annual Income Range', v(data, 'annualIncome')],
  ]);

  // 4. Family Background
  y = sectionTitle(y, '4. Family Heritage & Background');
  y = renderGrid(y, [
    ["Father's Name", v(data, 'fathersName')],
    ["Father's Occupation", v(data, 'fathersOccupation')],
    ["Mother's Name", v(data, 'mothersName')],
    ["Mother's Occupation", v(data, 'mothersOccupation')],
    ['Siblings Count', v(data, 'numberOfSiblings')],
    ['Family Structure', v(data, 'familyType')],
    ['Family Faith Values', v(data, 'familyFaithBackground')],
    ['Family Background Notes', v(data, 'familyDetails')],
  ]);

  // 5. Lifestyle, Habits & Interests
  y = sectionTitle(y, '5. Lifestyle, Languages & Habits');
  y = renderGrid(y, [
    ['Dietary Habits', v(data, 'dietaryHabits')],
    ['Languages Known', v(data, 'languagesKnown')],
    ['Drinking Habits', v(data, 'drinkingHabits')],
    ['Smoking Habits', v(data, 'smokingHabits')],
    ['Hobbies & Interests', v(data, 'hobbies')],
    ['Registered Email', email],
  ]);

  // 6. About Me / Personal Testimony
  if (v(data, 'aboutMe') !== '—') {
    y = sectionTitle(y, '6. Personal Bio & Faith Testimony');
    doc.setFillColor(...BG_CREAM).roundedRect(ML, y - 3, CW, 14, 1.5, 1.5, 'F');
    doc.setDrawColor(...GOLD_LIGHT).setLineWidth(0.4).roundedRect(ML, y - 3, CW, 14, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'italic').setFontSize(7.8).setTextColor(...INK);
    const bioLines = doc.splitTextToSize(`"${String(data.aboutMe)}"`, CW - 6);
    doc.text(bioLines.slice(0, 3), ML + 3, y + 1);
    y += 15;
  }

  // 7. Partner Preferences
  y = sectionTitle(y, '7. Matrimonial Partner Preferences');
  const ageRange = prefs.ageMin && prefs.ageMax ? `${prefs.ageMin} - ${prefs.ageMax} yrs` : (v(prefs, 'ageRange') || 'Flexible');
  const heightRange = prefs.heightMin && prefs.heightMax ? `${prefs.heightMin} - ${prefs.heightMax}` : (v(prefs, 'heightRange') || 'Flexible');
  const denomPref = Array.isArray(prefs.denominations) ? prefs.denominations.join(', ') : v(prefs, 'denominations');
  const locPref = [prefs.city, prefs.country].filter(Boolean).join(', ') || v(prefs, 'location') || 'Open';

  y = renderGrid(y, [
    ['Preferred Age', ageRange],
    ['Preferred Height', heightRange],
    ['Marital Status', v(prefs, 'maritalStatus')],
    ['Denominations', denomPref || 'Christian (Any)'],
    ['Education Pref', v(prefs, 'educationLevel') !== '—' ? v(prefs, 'educationLevel') : v(prefs, 'education')],
    ['Employment Pref', v(prefs, 'employmentStatus')],
    ['Preferred Location', locPref],
    ['Relocation Preference', v(prefs, 'relocationPreference')],
  ]);

  // Page 1 Footer
  doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...GREY);
  doc.text('Kingdom Alliance Christian Matrimony  •  Confidential Member Record  •  thekingdomalliances.com', ML, 290);
  doc.text('Page 1 of 2', PAGE_W - MR, 290, { align: 'right' });


  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 2: TERMS AND CONDITIONS, COVENANT & DIGITAL SIGNATURE
  // ══════════════════════════════════════════════════════════════════════════════
  doc.addPage();

  // Running Header Page 2
  doc.setFillColor(...NAVY).rect(0, 0, PAGE_W, 14, 'F');
  doc.setFillColor(...GOLD).rect(0, 13.5, PAGE_W, 0.5, 'F');

  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...GOLD);
  doc.text('KINGDOM ALLIANCE', ML, 9.5);
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(255, 255, 255);
  doc.text(`CONFIDENTIAL COVENANT & TERMS OF SERVICE   •   MEMBER: ${name.toUpperCase()} (${profileId})`, PAGE_W - MR, 9.5, { align: 'right' });

  y = 22;

  // Header Title
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...NAVY);
  doc.text('CHRISTIAN MATRIMONIAL COVENANT & CODE OF CONDUCT', ML, y);
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...GREY);
  doc.text('Formal membership agreement entered into upon completion of Kingdom Alliance onboarding.', ML, y + 4.5);
  y += 9;

  // Terms Articles (Structured, compact, organized)
  const articles = [
    {
      title: 'Article 1: Sacred Covenant & Matrimonial Purpose',
      text: 'Kingdom Alliance is a faith-based platform dedicated solely to facilitating introductions between adult Christian believers seeking genuine holy matrimony. The member confirms they are legally eligible to marry and shall use this platform exclusively for godly courtship in accordance with Christian principles. Commercial exploitation, dating casualness, or deceptive interaction is strictly prohibited.'
    },
    {
      title: 'Article 2: Truthfulness of Records & Verification Consent',
      text: 'The member solemnly affirms that all personal details, date of birth, marital status, education, profession, family background, and church details set forth in this dossier are complete, accurate, and truthful. The member acknowledges that Kingdom Alliance administrators may review credentials, verify pastoral references, and remove any profile found to contain fraudulent or misleading information.'
    },
    {
      title: 'Article 3: Christian Conduct, Mutual Respect & Purity',
      text: 'Members agree to conduct all communication with brotherly and sisterly honor, purity, integrity, and grace. Harassment, abusive language, inappropriate imagery, coercion, defamation, or unsolicited mass messaging is grounds for immediate, permanent termination without appeal.'
    },
    {
      title: 'Article 4: Strict Zero-Tolerance for Financial Solicitation',
      text: 'Kingdom Alliance is provided 100% free of charge. No member is authorized or permitted to request loans, donations, travel funds, bank credentials, investments, or monetary gifts from another member. Any request of a financial nature must be immediately reported to platform administrators.'
    },
    {
      title: 'Article 5: Privacy, Photo Protection & Confidentiality',
      text: 'All member records, photos, and chat communications are confidential. In accordance with Kingdom Alliance photo privacy protections, images are blurred until mutual interest is formally accepted. Members agree never to capture, screenshot, distribute, or publicly disclose another member\'s profile or contact information.'
    },
    {
      title: 'Article 6: Spiritual Discernment & Limitation of Platform Role',
      text: 'The role of Kingdom Alliance is limited to facilitating introductions. The platform does not arrange marriages, perform pastoral background clearances, or act as legal guarantor. Each member retains primary responsibility for exercising spiritual discernment, seeking pastoral and family counsel, and exercising wisdom in all meetings and courtship decisions.'
    }
  ];

  articles.forEach((art, idx) => {
    // Article Title
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...NAVY);
    doc.text(art.title, ML, y);
    y += 3.5;

    // Article Body
    doc.setFont('helvetica', 'normal').setFontSize(7.2).setTextColor(...INK);
    const lines = doc.splitTextToSize(art.text, CW);
    doc.text(lines, ML, y);
    y += lines.length * 3.3 + 3;
  });

  y += 2;

  // ══════════════════════════════════════════════════════════════════════════════
  // OFFICIAL DIGITAL SIGNATURE & EXECUTION CERTIFICATE BOX
  // ══════════════════════════════════════════════════════════════════════════════
  const certH = 56;
  doc.setFillColor(...BG_CREAM).roundedRect(ML, y, CW, certH, 2, 2, 'F');
  doc.setDrawColor(...GOLD).setLineWidth(0.8).roundedRect(ML, y, CW, certH, 2, 2, 'D');

  // Certificate Header Ribbon
  doc.setFillColor(...NAVY).rect(ML + 0.8, y + 0.8, CW - 1.6, 7.5, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...GOLD);
  doc.text('CERTIFICATE OF ELECTRONIC SIGNATURE & VERIFICATION', ML + (CW / 2), y + 5.5, { align: 'center' });

  let cy = y + 13;

  // 2-Column Signature Details
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('DIGITALLY SIGNED BY:', ML + 4, cy);
  doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(...NAVY);
  doc.text(name, ML + 42, cy);

  // Digital Signature Visual Stamp (italic handwriting style notation)
  doc.setFont('helvetica', 'italic').setFontSize(7.5).setTextColor(...GOLD);
  doc.text('Confirmed & Affirmed Online', ML + CW - 4, cy, { align: 'right' });

  cy += 6;
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('AUTHENTICATED EMAIL:', ML + 4, cy);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...INK);
  doc.text(email, ML + 42, cy);

  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('PROFILE ID:', ML + 115, cy);
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...NAVY);
  doc.text(profileId, ML + 135, cy);

  cy += 6;
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('EXECUTION TIMESTAMP:', ML + 4, cy);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...INK);
  doc.text(`${dateStr} at ${timeStr}`, ML + 42, cy);

  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('METHOD:', ML + 115, cy);
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...INK);
  doc.text('Electronic Consent Checkbox', ML + 135, cy);

  cy += 6;
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('AUDIT TOKEN (SHA-256):', ML + 4, cy);
  doc.setFont('courier', 'bold').setFontSize(7.5).setTextColor(...NAVY);
  doc.text(`SHA256:${sha256Ref}`, ML + 42, cy);

  // Legal Acceptance Paragraph
  cy += 6;
  doc.setDrawColor(...GOLD_LIGHT).setLineWidth(0.3).line(ML + 4, cy - 1, ML + CW - 4, cy - 1);
  doc.setFont('helvetica', 'normal').setFontSize(6.8).setTextColor(...INK);
  const legalNotice = doc.splitTextToSize(
    'LEGAL NOTICE: This document constitutes an official electronic record executed pursuant to the Uniform Electronic Transactions Act and relevant electronic signature standards. By ticking the mandatory declaration checkbox and completing registration on the date indicated above, the member acknowledged full understanding, accepted all terms and community guidelines, and bound themselves to the Christian Matrimonial Covenant of Kingdom Alliance.',
    CW - 8
  );
  doc.text(legalNotice, ML + 4, cy + 2.5);

  // Page 2 Footer
  doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...GREY);
  doc.text('Kingdom Alliance Christian Matrimony  •  Confidential Member Record  •  thekingdomalliances.com', ML, 290);
  doc.text('Page 2 of 2', PAGE_W - MR, 290, { align: 'right' });

  return Buffer.from(doc.output('arraybuffer'));
}

const sampleData = {
  uid: 'usr_89234710',
  profileId: 'KA-89241',
  fullName: 'Jonathan David Edwards',
  email: 'jonathan.edwards@example.com',
  profileType: 'Groom',
  profileFor: 'Self',
  gender: 'Male',
  age: 28,
  dob: '1998-05-14',
  height: "5' 11\" (180 cm)",
  complexion: 'Fair',
  bodyType: 'Athletic',
  maritalStatus: 'Never Married',
  motherTongue: 'English',
  nationality: 'American',
  citizenship: 'United States',
  location: 'Dallas, Texas, United States',
  cityLiving: 'Dallas',
  countryLiving: 'United States',
  mobileNumber: '+1 214-555-0199',
  denomination: 'Baptist (Reformed)',
  churchName: 'Grace Community Bible Church',
  churchCity: 'Dallas, TX',
  diocese: 'North Texas Fellowship',
  pastorName: 'Pastor Robert Lawson',
  pastorNumber: '+1 214-555-0144',
  baptized: 'Yes (Believer\'s Baptism)',
  ministryRole: 'Youth Ministry & Worship Leader',
  education: 'Master of Science (M.S.)',
  fieldOfStudy: 'Computer Science & Software Architecture',
  college: 'University of Texas at Dallas',
  profession: 'Senior Software Engineer',
  employmentType: 'Full Time (Private Tech)',
  annualIncome: '$140,000 - $160,000 USD',
  fathersName: 'David Matthew Edwards',
  fathersOccupation: 'Civil Engineer (Retired)',
  mothersName: 'Mary Elizabeth Edwards',
  mothersOccupation: 'High School Literature Teacher',
  numberOfSiblings: '2 (1 Brother, 1 Sister)',
  familyType: 'Nuclear Family (Christian Values)',
  familyFaithBackground: 'Born and raised in a devoted Christian household; active church members for over 30 years.',
  familyDetails: 'Close-knit, God-fearing family centered on regular family prayer, Scripture reading, and fellowship.',
  dietaryHabits: 'Non-Vegetarian',
  drinkingHabits: 'Non-Drinker',
  smokingHabits: 'Non-Smoker',
  hobbies: 'Guitar, Hiking, Theology books, Cooking, Christian apologetics',
  languagesKnown: 'English (Fluent), Spanish (Conversational)',
  aboutMe: 'I am a born-again Christian seeking a partner with whom I can build a Christ-centered home, love and serve the local church, and walk humbly in faith. I value deep conversations about God\'s Word, intentional courtship, mutual kindness, and shared vision for godly family life.',
  partnerPreferences: {
    ageMin: 22,
    ageMax: 29,
    heightMin: "5' 2\"",
    heightMax: "5' 10\"",
    maritalStatus: 'Never Married',
    denominations: ['Baptist', 'Presbyterian', 'Evangelical', 'Non-Denominational'],
    educationLevel: 'Bachelor\'s Degree or higher',
    employmentStatus: 'Employed / Career-minded / Homemaker',
    city: 'Dallas',
    country: 'United States',
    relocationPreference: 'Willing to discuss relocation within USA',
  },
  submittedAt: new Date(),
};

const buf = generateBiodataPdf(sampleData);
fs.writeFileSync('/tmp/test-output.pdf', buf);
console.log('PDF successfully written to /tmp/test-output.pdf. Size:', buf.length);
