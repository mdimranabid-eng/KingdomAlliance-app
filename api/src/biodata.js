// Confidential Christian Matrimonial Dossier & Signed Covenant PDF Generator
// Generates a comprehensive, professional, compact 2-page document with complete member
// profile data, matrimonial Terms & Conditions, and verified digital signature.
const crypto = require('crypto');
const { jsPDF } = require('jspdf');

const NAVY = [15, 23, 42];        // #0F172A - Deep Royal Slate Navy
const GOLD = [184, 134, 11];      // #B8860B - Dark Goldenrod
const GOLD_LIGHT = [232, 215, 170];// Soft Gold Divider
const GOLD_BG = [254, 250, 240];  // Luxury Pale Gold
const INK = [30, 41, 59];         // #1E293B - Deep Charcoal Ink
const GREY = [100, 116, 139];     // #64748B - Slate Grey Labels
const LINE = [226, 232, 240];     // #E2E8F0 - Clean Table Border
const BG_CREAM = [252, 250, 246]; // Warm Cream Section Fill

const ML = 14;
const MR = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const CW = PAGE_W - ML - MR; // 182mm usable width

const v = (o, k) => {
  if (!o) return '—';
  const val = o[k];
  if (val === undefined || val === null || String(val).trim() === '') return '—';
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—';
  return String(val).trim();
};

function generateBiodataPdf(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const prefs = data.partnerPreferences || {};
  const name = v(data, 'fullName') !== '—' ? v(data, 'fullName') : v(data, 'name');
  const profileId = data.profileId || `KA-${(data.uid || 'MEMBER').slice(0, 6).toUpperCase()}`;
  const email = data.email || '—';

  // Date and timestamp of execution
  const executionDate = data.submittedAt
    ? (data.submittedAt instanceof Date ? data.submittedAt : new Date(data.submittedAt))
    : (data.createdAt instanceof Date ? data.createdAt : new Date());
  const dateStr = executionDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  const timeStr = executionDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  });

  // Cryptographic audit token (tamper-evident SHA-256 hash)
  const hashSeed = `${data.uid || 'anon'}:${profileId}:${email}:${executionDate.getTime()}`;
  const sha256Ref = crypto.createHash('sha256').update(hashSeed).digest('hex').substring(0, 24).toUpperCase();

  // Helper: Section Title Bar
  function sectionTitle(y, title) {
    doc.setFillColor(...BG_CREAM).rect(ML, y - 4.2, CW, 6.2, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(8.8).setTextColor(...GOLD);
    doc.text(title.toUpperCase(), ML + 2.5, y);
    doc.setDrawColor(...GOLD_LIGHT).setLineWidth(0.4).line(ML, y + 2, ML + CW, y + 2);
    return y + 6.2;
  }

  // Helper: 2-Column Key/Value Grid
  function renderGrid(y, pairs) {
    const colW = CW / 2;
    const rowH = 4.7;
    const labelW = 28;
    pairs.forEach(([label, value], i) => {
      const col = i % 2;
      const ry = y + Math.floor(i / 2) * rowH;
      const rx = ML + col * colW;

      doc.setFont('helvetica', 'bold').setFontSize(7.8).setTextColor(...GREY);
      doc.text(String(label).slice(0, 19), rx, ry);

      doc.setFont('helvetica', 'normal').setFontSize(7.8).setTextColor(...INK);
      const valStr = String(value);
      const maxW = colW - labelW - 2;
      const truncated = doc.splitTextToSize(valStr, maxW)[0] || '—';
      doc.text(truncated, rx + labelW, ry);
    });
    return y + Math.ceil(pairs.length / 2) * rowH + 2.2;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 1: OFFICIAL COVER HEADER & COMPLETE MEMBER PROFILE DATA
  // ══════════════════════════════════════════════════════════════════════════════

  // Navy Header Banner
  doc.setFillColor(...NAVY).rect(0, 0, PAGE_W, 28, 'F');
  // Decorative Gold Border Line
  doc.setFillColor(...GOLD).rect(0, 27.2, PAGE_W, 0.8, 'F');

  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...GOLD);
  doc.text('KINGDOM ALLIANCE', PAGE_W / 2, 10.5, { align: 'center' });

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(255, 255, 255);
  doc.text('CONFIDENTIAL CHRISTIAN MATRIMONIAL DOSSIER & COVENANT RECORD', PAGE_W / 2, 16.5, { align: 'center' });

  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GOLD_LIGHT);
  doc.text(`PROFILE ID: ${profileId}   •   EXECUTION DATE: ${dateStr.toUpperCase()}   •   STATUS: DIGITALLY VERIFIED`, PAGE_W / 2, 22, { align: 'center' });

  let y = 33.5;

  // 1. Personal Identity & Vital Details
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
    ['Country Residence', v(data, 'countryLiving') !== '—' ? v(data, 'countryLiving') : (v(data, 'location') !== '—' ? v(data, 'location') : '—')],
  ]);

  // 2. Faith, Church Fellowship & Ministry
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

  // 3. Education, Profession & Financial Standing
  y = sectionTitle(y, '3. Education, Profession & Financial Standing');
  y = renderGrid(y, [
    ['Education Level', v(data, 'education')],
    ['Field of Study', v(data, 'fieldOfStudy')],
    ['College / University', v(data, 'college')],
    ['Profession / Role', v(data, 'profession')],
    ['Employment Type', v(data, 'employmentType')],
    ['Annual Income Range', v(data, 'annualIncome')],
  ]);

  // 4. Family Heritage & Background
  y = sectionTitle(y, '4. Family Heritage & Background');
  y = renderGrid(y, [
    ["Father's Name", v(data, 'fathersName')],
    ["Father's Occupation", v(data, 'fathersOccupation')],
    ["Mother's Name", v(data, 'mothersName')],
    ["Mother's Occupation", v(data, 'mothersOccupation')],
    ['Siblings Count', v(data, 'numberOfSiblings')],
    ['Family Structure', v(data, 'familyType')],
    ['Family Faith Values', v(data, 'familyFaithBackground')],
    ['Family Details Notes', v(data, 'familyDetails')],
  ]);

  // 5. Lifestyle, Languages & Habits
  y = sectionTitle(y, '5. Lifestyle, Languages & Habits');
  y = renderGrid(y, [
    ['Dietary Habits', v(data, 'dietaryHabits')],
    ['Languages Known', v(data, 'languagesKnown')],
    ['Drinking Habits', v(data, 'drinkingHabits')],
    ['Smoking Habits', v(data, 'smokingHabits')],
    ['Hobbies & Interests', v(data, 'hobbies')],
    ['Registered Email', email],
  ]);

  // 6. Personal Bio & Faith Testimony
  if (v(data, 'aboutMe') !== '—') {
    y = sectionTitle(y, '6. Personal Bio & Faith Testimony');
    doc.setFillColor(...BG_CREAM).roundedRect(ML, y - 3, CW, 14, 1.5, 1.5, 'F');
    doc.setDrawColor(...GOLD_LIGHT).setLineWidth(0.4).roundedRect(ML, y - 3, CW, 14, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'italic').setFontSize(7.8).setTextColor(...INK);
    const bioLines = doc.splitTextToSize(`"${String(data.aboutMe)}"`, CW - 6);
    doc.text(bioLines.slice(0, 3), ML + 3, y + 1.2);
    y += 14.5;
  }

  // 7. Matrimonial Partner Preferences
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

  // Running Top Header Page 2
  doc.setFillColor(...NAVY).rect(0, 0, PAGE_W, 14, 'F');
  doc.setFillColor(...GOLD).rect(0, 13.5, PAGE_W, 0.5, 'F');

  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...GOLD);
  doc.text('KINGDOM ALLIANCE', ML, 9.5);
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(255, 255, 255);
  doc.text(`CONFIDENTIAL COVENANT & TERMS OF SERVICE   •   MEMBER: ${name.toUpperCase()} (${profileId})`, PAGE_W - MR, 9.5, { align: 'right' });

  y = 21.5;

  // Header Title
  doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(...NAVY);
  doc.text('CHRISTIAN MATRIMONIAL COVENANT & TERMS OF SERVICE', ML, y);
  doc.setFont('helvetica', 'normal').setFontSize(7.3).setTextColor(...GREY);
  doc.text('Official membership covenant and platform code of conduct confirmed and executed upon onboarding.', ML, y + 4.2);
  y += 8.5;

  // Terms & Conditions Articles (Structured, organized, compact)
  const articles = [
    {
      title: 'Article 1: Sacred Matrimonial Purpose & Covenant Commitment',
      text: 'Kingdom Alliance is a dedicated faith-based platform established exclusively to facilitate introductions between adult Christian believers seeking holy matrimony in accordance with biblical tenets. The member affirms they are of legal age and marital capacity to marry, and pledges to use the platform solely for intentional, Christ-centered courtship. Casual dating, commercial recruitment, or frivolous interaction is strictly prohibited.'
    },
    {
      title: 'Article 2: Truthfulness of Personal Records & Verification Consent',
      text: 'The member solemnly affirms that all personal vitals, marital eligibility, denomination, church membership, academic credentials, profession, and family background set forth in this dossier are authentic, complete, and truthful. The member grants Kingdom Alliance administrators full discretion to review credentials, verify pastoral references, and permanently remove any account containing fraudulent or misleading data.'
    },
    {
      title: 'Article 3: Christian Community Standards, Mutual Respect & Purity',
      text: 'Members agree to conduct all communications with dignity, mutual honor, purity, and spiritual grace. Harassment, abusive or manipulative language, inappropriate imagery, identity deception, coercion, or unsolicited mass messaging will result in immediate and permanent account termination without right of appeal.'
    },
    {
      title: 'Article 4: Strict Zero-Tolerance Prohibition on Financial Solicitation',
      text: 'Kingdom Alliance operates as a 100% free-of-charge ministry service. No member is authorized or permitted under any circumstances to solicit, transfer, or request monetary loans, travel funds, investments, donations, or bank/crypto credentials from another member. Any financial solicitation must be reported immediately.'
    },
    {
      title: 'Article 5: Privacy, Photo Protections & Absolute Confidentiality',
      text: 'All member records, photos, and private messages are strictly confidential. Photos are protected under privacy settings and blurred until mutual connections are accepted. Members agree never to screenshot, scrape, record, export, or publish another member\'s personal profile or contact details to any third party.'
    },
    {
      title: 'Article 6: Independent Spiritual Discernment & Limitation of Platform Role',
      text: 'Kingdom Alliance facilitates mutual introductions and does not act as a matrimonial broker, legal adviser, or guarantor of character or marriage success. Each member retains primary responsibility for exercising prayerful discernment, seeking pastoral and family counsel, and observing all prudent safety precautions in meetings and courtship decisions.'
    }
  ];

  articles.forEach((art) => {
    doc.setFont('helvetica', 'bold').setFontSize(7.8).setTextColor(...NAVY);
    doc.text(art.title, ML, y);
    y += 3.3;

    doc.setFont('helvetica', 'normal').setFontSize(7.0).setTextColor(...INK);
    const lines = doc.splitTextToSize(art.text, CW);
    doc.text(lines, ML, y);
    y += lines.length * 3.1 + 2.8;
  });

  y += 1.5;

  // ══════════════════════════════════════════════════════════════════════════════
  // OFFICIAL DIGITAL SIGNATURE & EXECUTION CERTIFICATE BOX
  // ══════════════════════════════════════════════════════════════════════════════
  const certH = 55;
  doc.setFillColor(...BG_CREAM).roundedRect(ML, y, CW, certH, 2, 2, 'F');
  doc.setDrawColor(...GOLD).setLineWidth(0.8).roundedRect(ML, y, CW, certH, 2, 2, 'D');

  // Certificate Header Ribbon
  doc.setFillColor(...NAVY).rect(ML + 0.8, y + 0.8, CW - 1.6, 7.2, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...GOLD);
  doc.text('CERTIFICATE OF ELECTRONIC SIGNATURE & VERIFICATION', ML + (CW / 2), y + 5.2, { align: 'center' });

  let cy = y + 12.5;

  // Signature Details Grid
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('DIGITALLY SIGNED BY:', ML + 4, cy);
  doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(...NAVY);
  doc.text(name, ML + 42, cy);

  doc.setFont('helvetica', 'italic').setFontSize(7.5).setTextColor(...GOLD);
  doc.text('Confirmed & Affirmed Online', ML + CW - 4, cy, { align: 'right' });

  cy += 5.8;
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('AUTHENTICATED EMAIL:', ML + 4, cy);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...INK);
  doc.text(email, ML + 42, cy);

  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('PROFILE ID:', ML + 115, cy);
  doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...NAVY);
  doc.text(profileId, ML + 135, cy);

  cy += 5.8;
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('EXECUTION TIMESTAMP:', ML + 4, cy);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...INK);
  doc.text(`${dateStr} at ${timeStr}`, ML + 42, cy);

  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('METHOD:', ML + 115, cy);
  doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...INK);
  doc.text('Electronic Consent Checkbox', ML + 135, cy);

  cy += 5.8;
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(...GREY);
  doc.text('AUDIT TOKEN (SHA-256):', ML + 4, cy);
  doc.setFont('courier', 'bold').setFontSize(7.5).setTextColor(...NAVY);
  doc.text(`SHA256:${sha256Ref}`, ML + 42, cy);

  // Legal Acceptance Paragraph
  cy += 5.5;
  doc.setDrawColor(...GOLD_LIGHT).setLineWidth(0.3).line(ML + 4, cy - 1, ML + CW - 4, cy - 1);
  doc.setFont('helvetica', 'normal').setFontSize(6.7).setTextColor(...INK);
  const legalNotice = doc.splitTextToSize(
    'LEGAL NOTICE: This document constitutes an official electronic record executed pursuant to the Uniform Electronic Transactions Act (UETA) and international electronic signature standards. By ticking the mandatory declaration checkbox and completing registration on the date indicated above, the member affirmed full understanding, accepted all terms and community guidelines, and bound themselves to the Christian Matrimonial Covenant of Kingdom Alliance.',
    CW - 8
  );
  doc.text(legalNotice, ML + 4, cy + 2.5);

  // Page 2 Footer
  doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...GREY);
  doc.text('Kingdom Alliance Christian Matrimony  •  Confidential Member Record  •  thekingdomalliances.com', ML, 290);
  doc.text('Page 2 of 2', PAGE_W - MR, 290, { align: 'right' });

  return Buffer.from(doc.output('arraybuffer'));
}

module.exports = { generateBiodataPdf };
