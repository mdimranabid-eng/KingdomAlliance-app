import { jsPDF } from 'jspdf';

/** Professional member biodata, declaration, reference barcode and full terms. */

// ── Brand palette ─────────────────────────────────────────────────────────────
const NAVY = [10, 20, 40] as const;
const GOLD = [201, 168, 76] as const;
const IVORY = [248, 244, 234] as const;
const GREY = [110, 120, 135] as const;
const GREY_LINE = [225, 220, 210] as const;
const INK = [25, 30, 40] as const;

// ── Geometry ──────────────────────────────────────────────────────────────────
const M_LEFT = 16;
const M_RIGHT = 16;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT;

type Row = [label: string, value: string];
interface Section { title: string; rows: Row[]; }

function v(obj: any, key: string): string {
  const val = obj?.[key];
  if (val === undefined || val === null || String(val).trim() === '') return '—';
  return Array.isArray(val) ? val.join(', ') : String(val).trim();
}

function list(x: any): string | null {
  return Array.isArray(x) && x.length ? x.join(', ') : null;
}

/** Fetch a remote profile photo → base64 data URL. Null on failure (graceful fallback). */
async function fetchPhotoDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const ct = res.headers.get('content-type') || 'image/jpeg';
    return `data:${ct};base64,${Buffer.from(buf).toString('base64')}`;
  } catch {
    return null;
  }
}

function buildSections(u: Record<string, any>): Section[] {
  const pp = u.partnerPreferences || {};
  return [
    {
      title: 'BASIC INFORMATION',
      rows: [
        ['Full Name', [u.name, u.middleName, u.lastName].filter(Boolean).join(' ') || 'Not provided'],
        ['Profile Created For', v(u, 'profileFor')],
        ['Profile Type', v(u, 'profileType')],
        ['Date of Birth', v(u, 'dob')],
        ['Age', v(u, 'age')],
        ['Mobile Number', v(u, 'mobileNumber')],
        ['Citizenship', v(u, 'citizenship')],
        ['Country Living In', v(u, 'countryLiving')],
        ['City Living In', v(u, 'cityLiving')],
        ['Marital Status', v(u, 'maritalStatus')],
        ['Mother Tongue', v(u, 'motherTongue')],
        ['Languages Known', v(u, 'languagesKnown')],
      ],
    },
    {
      title: 'PHYSICAL ATTRIBUTES',
      rows: [
        ['Height', v(u, 'height')],
        ['Weight', v(u, 'weight')],
        ['Body Type', v(u, 'bodyType')],
        ['Complexion', v(u, 'complexion')],
        ['Physical Status', v(u, 'physicalStatus')],
        ['Physical Status Details', v(u, 'physicalStatusDesc')],
      ],
    },
    {
      title: 'FAITH & CHURCH',
      rows: [
        ['Denomination', v(u, 'denomination')],
        ['Diocese', v(u, 'diocese')],
        ['Church Name', v(u, 'churchName')],
        ['Church City', v(u, 'churchCity')],
        ['Church Area', v(u, 'churchArea')],
        ['Baptized', v(u, 'baptized')],
        ['Pastor Name', v(u, 'pastorName')],
        ['Pastor Number', v(u, 'pastorNumber')],
        ['Spiritual Involvement', v(u, 'spiritualInvolvement')],
      ],
    },
    {
      title: 'FAMILY DETAILS',
      rows: [
        ["Father's Name", v(u, 'fathersName')],
        ["Father's Occupation", v(u, 'fathersOccupation')],
        ["Mother's Name", v(u, 'mothersName')],
        ["Mother's Occupation", v(u, 'mothersOccupation')],
        ['Number of Siblings', v(u, 'numberOfSiblings')],
      ],
    },
    {
      title: 'EDUCATION & CAREER',
      rows: [
        ['Education', v(u, 'education')],
        ['Field of Study', v(u, 'fieldOfStudy')],
        ['College / University', v(u, 'college')],
        ['Profession', v(u, 'profession')],
        ['Employment Type', v(u, 'employmentType')],
        ['Annual Income', v(u, 'annualIncome')],
      ],
    },
    {
      title: 'HABITS & ABOUT ME',
      rows: [
        ['Dietary Habits', v(u, 'dietaryHabits')],
        ['Drinking Habits', v(u, 'drinkingHabits')],
        ['Smoking Habits', v(u, 'smokingHabits')],
        ['Hobbies', v(u, 'hobbies')],
        ['About Me', v(u, 'aboutMe')],
      ],
    },
    {
      title: 'PARTNER PREFERENCES',
      rows: [
        ['Age Range', pp.ageMin ? `${pp.ageMin} – ${pp.ageMax} yrs` : '—'],
        ['Height Range', pp.heightMin ? `${pp.heightMin} – ${pp.heightMax}` : '—'],
        ['Marital Status', list(pp.maritalStatus) || 'Any'],
        ['Denominations', list(pp.denominations) || 'Any'],
        ['Mother Tongue', v(pp, 'motherTongue')],
        ['Education Level', v(pp, 'educationLevel')],
        ['Employment Status', v(pp, 'employmentStatus')],
        ['Dietary Habits', v(pp, 'dietaryHabits')],
        ['Drinking Habits', v(pp, 'drinkingHabits')],
        ['Smoking Habits', v(pp, 'smokingHabits')],
        ['Country', v(pp, 'country')],
        ['City', v(pp, 'city')],
        ['Relocation Preference', v(pp, 'relocationPreference')],
        ['Other Preferences', v(pp, 'otherPreferences')],
      ],
    },
  ];
}

// ── Full Terms & Conditions (mirrors public Terms page, sections 1–26) ────────
const TERMS: { title: string; paragraphs: string[] }[] = [
  { title: '1. ABOUT KINGDOM ALLIANCE', paragraphs: [
    'Kingdom Alliance provides a faith-based platform through which eligible adult Christian believers who are genuinely seeking a marriage partner may connect and communicate.',
    'The role of Kingdom Alliance is limited to providing the platform and facilitating introductions and communication between users. Kingdom Alliance does not arrange marriages and does not act as a marriage broker, matrimonial agent, counsellor, church authority, legal adviser, or guarantor of any relationship or marriage.',
    'Kingdom Alliance does not guarantee that any user will find a suitable marriage partner through the platform. Each user remains responsible for his or her own decisions regarding communication, meetings, relationships, engagement, and marriage.',
    'Users are encouraged to exercise wisdom and good judgement and, where appropriate, seek guidance from trusted family members, pastors, church leaders, or other responsible persons.',
  ] },
  { title: '2. FREE-OF-CHARGE SERVICE', paragraphs: [
    'Kingdom Alliance has been created for the benefit of Christian believers seeking a marriage partner and is provided free of charge.',
    'Kingdom Alliance does not charge users any registration fee, membership fee, subscription fee, profile creation fee, matchmaking fee, introduction fee, communication fee, or success fee for engagement or marriage.',
    'Kingdom Alliance is not established as a commercial matrimonial service. Its purpose is to provide a free, faith-based platform through which eligible Christian believers may connect and consider marriage.',
    'No person is authorized to collect any registration, membership, matchmaking, introduction, communication, or success fee on behalf of Kingdom Alliance.',
    'Any person requesting such payment while claiming to represent Kingdom Alliance should be reported to the platform administrators.',
  ] },
  { title: '3. ELIGIBILITY', paragraphs: [
    'A person must be at least 18 years of age to register for or use Kingdom Alliance.',
    'Users must be legally eligible to marry under the laws applicable to them, genuinely seeking a marriage partner, willing to provide truthful and accurate information, and willing to use the platform consistently with its faith-based and marriage-focused purpose.',
    'By creating an account, the user confirms that these eligibility requirements are satisfied.',
    'Kingdom Alliance reserves the right to refuse, restrict, suspend, or terminate access where there are reasonable grounds to believe that a user does not meet the eligibility requirements or is using the platform for purposes inconsistent with its intended purpose.',
  ] },
  { title: '4. PROFILE INFORMATION AND MARITAL STATUS', paragraphs: [
    'Users are responsible for ensuring that the information provided in their profiles is truthful, accurate, current, and not misleading.',
    'This includes information relating to identity, age, marital status, photographs, location, occupation, education, family background, faith-related information, and other material details voluntarily provided through the platform.',
    "Users must not intentionally conceal or misrepresent information that could reasonably influence another person's decision to communicate with or consider them for marriage.",
    "Users must not impersonate another person, use another person's photographs without authorization, create deceptive or fraudulent profiles, maintain multiple accounts for misleading purposes, or falsely represent personal, professional, family, church, ministry, or other material information.",
    'Kingdom Alliance may request additional information where reasonably necessary to support profile authenticity. Any such review does not constitute a guarantee that all information provided by a user is complete or accurate.',
  ] },
  { title: '5. FAITH-BASED AND MARRIAGE-FOCUSED PURPOSE', paragraphs: [
    'Kingdom Alliance is intended for Christian believers genuinely seeking a marriage partner.',
    'Users are expected to respect the faith-based purpose of the platform and communicate with other members honestly, courteously, responsibly, and respectfully.',
    'The platform must not be used for unrelated commercial activities, improper solicitation, unauthorized recruitment, fraudulent activity, or any other purpose inconsistent with the objectives of Kingdom Alliance.',
    "A user's representation regarding his or her Christian faith, church involvement, spiritual background, or personal beliefs is information provided by that user. Kingdom Alliance does not independently determine or guarantee the sincerity of a user's faith, beliefs, character, church involvement, or personal commitment.",
  ] },
  { title: '6. USER CONDUCT', paragraphs: [
    'Users must conduct themselves in a respectful, responsible, and lawful manner when using Kingdom Alliance.',
    'Users must not harass, threaten, intimidate, exploit, deceive, impersonate, defame, or deliberately mislead another person.',
    'Users must not upload, publish, send, or distribute content that is unlawful, offensive, abusive, threatening, fraudulent, misleading, defamatory, or otherwise inappropriate for the nature and purpose of the platform.',
    'Kingdom Alliance must not be used for unauthorized advertising, commercial promotion, spam, mass communication, data harvesting, collection of personal information for unauthorized purposes, or activities that interfere with the proper operation, integrity, or security of the platform.',
    "Users must not attempt unauthorized access to another user's account, Kingdom Alliance systems, or any related technical infrastructure.",
    'Any serious or repeated violation of these requirements may result in restriction, suspension, or termination of an account.',
  ] },
  { title: '7. FINANCIAL SOLICITATION AND FRAUD PREVENTION', paragraphs: [
    'Kingdom Alliance is a free-of-charge service. Users should exercise appropriate caution regarding financial requests made by persons they meet through the platform.',
    'The platform must not be used for fraudulent financial solicitation, unauthorized fundraising, investment schemes, requests for banking credentials, payment-card information, passwords, security codes, or other sensitive financial information.',
    'Users are advised to exercise appropriate judgement before transferring money or providing financial information to anyone introduced through the platform.',
    'Any suspicious financial request, fraudulent activity, or person claiming to collect fees on behalf of Kingdom Alliance should be reported promptly to the platform administrators.',
  ] },
  { title: '8. USER SAFETY', paragraphs: [
    'Kingdom Alliance facilitates introductions between users but does not control or supervise communications, meetings, or interactions between users outside the platform.',
    'Each user is responsible for exercising appropriate care, judgement, and reasonable precautions when communicating with or meeting another person.',
    'Users are encouraged to verify relevant information independently, exercise caution when sharing sensitive personal information, and take reasonable precautions before arranging an in-person meeting.',
    'Initial meetings should, where appropriate, take place in safe and public locations. Users may also consider informing a trusted family member, friend, pastor, church leader, or other responsible person before meeting another user.',
    'Kingdom Alliance cannot guarantee the conduct, intentions, identity, or behaviour of any individual user.',
  ] },
  { title: '9. VERIFICATION AND BACKGROUND INFORMATION', paragraphs: [
    "Unless expressly stated otherwise, users should not assume that another user's identity, marital status, employment, education, financial position, church membership, ministry role, legal history, immigration status, or other background information has been independently verified by Kingdom Alliance.",
    'Any profile review, email confirmation, telephone confirmation, identity check, document review, or similar process undertaken by Kingdom Alliance is intended only to support platform integrity and should not be interpreted as an endorsement, certification, recommendation, or guarantee of the individual concerned.',
    'Users remain responsible for carrying out any independent verification they consider appropriate before making significant personal or marital decisions.',
  ] },
  { title: '10. NO ENDORSEMENT OR GUARANTEE OF USERS', paragraphs: [
    "Kingdom Alliance does not guarantee or certify any user's identity, character, Christian faith, marital status, family background, education, employment, financial position, legal history, compatibility, intentions, suitability for marriage, or the accuracy or completeness of profile information.",
    "The presence of a user's profile on Kingdom Alliance does not mean that Kingdom Alliance recommends, approves, certifies, or endorses that individual.",
    'Users remain responsible for evaluating information and making their own informed decisions.',
  ] },
  { title: '11. NO GUARANTEE OF MATCH OR MARRIAGE', paragraphs: [
    'Kingdom Alliance does not guarantee that a suitable partner will be identified, that another user will respond to an expression of interest or communication, that two users will be compatible, that a relationship will develop, or that an introduction through the platform will result in engagement or marriage.',
    'Any search tools, preferences, profile suggestions, compatibility features, or recommendations provided by the platform are intended only to assist users in identifying potential connections and should not be regarded as professional, pastoral, legal, or matrimonial advice.',
  ] },
  { title: '12. USER CONTENT AND PHOTOGRAPHS', paragraphs: [
    'Users are responsible for all information, photographs, messages, descriptions, testimonies, and other content they submit through Kingdom Alliance.',
    'By submitting content, users confirm that they have the right to use and share that content.',
    "Users must not upload another person's photographs or personal information without appropriate authorization and must not knowingly provide content that infringes another person's rights.",
    'Users should exercise particular care before uploading information or photographs concerning children, family members, or other third parties.',
    "Kingdom Alliance reserves the right to remove content that violates these Terms, infringes another person's rights, creates a safety or security concern, or is otherwise inappropriate for the platform.",
  ] },
  { title: '13. PRIVACY AND PERSONAL DATA', paragraphs: [
    'Kingdom Alliance respects the privacy of its users and will process personal information in accordance with the Kingdom Alliance Privacy Policy and applicable data-protection requirements.',
    'Information processed through the platform may include registration information, profile information, photographs, contact information, personal preferences, faith-related information, marital status, communications with the platform, technical information, and other information reasonably necessary for the operation, administration, security, and improvement of the service.',
    'Users should carefully consider the information they choose to include in their profiles or make available to other members.',
    'Where consent or any additional authorization is required under applicable law for the processing of personal information, Kingdom Alliance will obtain such consent or authorization as required.',
    'Users should review the Kingdom Alliance Privacy Policy for further information regarding the collection, use, disclosure, storage, retention, security, deletion, and protection of personal information and the exercise of applicable privacy rights.',
  ] },
  { title: '14. ACCOUNT CLOSURE AND DATA DELETION', paragraphs: [
    'Users may deactivate or request closure of their Kingdom Alliance account through the available account controls or by contacting Kingdom Alliance.',
    'Users who become engaged, married, find a suitable partner, or otherwise cease seeking a marriage partner are encouraged to deactivate or close their profiles so that the information displayed to other users remains accurate.',
    'Certain information may be retained following account closure where reasonably necessary or legally required for security, fraud prevention, dispute resolution, recordkeeping, or compliance with applicable law, subject to the Kingdom Alliance Privacy Policy.',
  ] },
  { title: '15. REPORTING AND SAFEGUARDING', paragraphs: [
    'Users are encouraged to promptly report suspected fake profiles, false or misleading information, fraudulent activity, harassment, impersonation, misuse of photographs, inappropriate solicitation, threatening conduct, safety concerns, or other serious violations of these Terms.',
    'Kingdom Alliance may review reported matters and may warn, restrict, suspend, or terminate an account where reasonably necessary to protect users, maintain the integrity of the platform, or comply with applicable requirements.',
    'Where appropriate and permitted or required by applicable law, Kingdom Alliance may cooperate with competent authorities regarding suspected unlawful activity or serious safety concerns.',
  ] },
  { title: '16. INTELLECTUAL PROPERTY', paragraphs: [
    'The Kingdom Alliance name, logo, website design, original text, graphics, software, and other original materials associated with the platform are owned by or licensed to Kingdom Alliance unless otherwise stated.',
    'Users may not reproduce, distribute, modify, sell, commercially exploit, or create unauthorized derivative works from Kingdom Alliance materials without appropriate permission.',
    'User-generated content remains subject to the rights of the person who submitted it, subject to the limited permissions reasonably required for Kingdom Alliance to display such content and operate the service.',
  ] },
  { title: '17. THIRD-PARTY SERVICES AND LINKS', paragraphs: [
    'Kingdom Alliance may include links to or integrations with third-party websites, communication services, social-media platforms, hosting providers, mapping services, or other external services.',
    'Kingdom Alliance does not control and is not responsible for the content, privacy practices, security, availability, policies, or actions of independent third-party services.',
    'Users should review the applicable terms and privacy policies of third-party services before using them.',
  ] },
  { title: '18. DISCLAIMER', paragraphs: [
    'Kingdom Alliance is provided on an “as is” and “as available” basis, subject to applicable law.',
    'While reasonable efforts are made to maintain the availability, integrity, security, and proper operation of the platform, Kingdom Alliance does not guarantee uninterrupted or error-free access, complete accuracy of user-provided information, appropriate conduct by every user, absence of technical problems, or successful outcomes from introductions made through the platform.',
    'Users remain responsible for decisions made on the basis of information provided by other users.',
  ] },
  { title: '19. LIMITATION OF LIABILITY', paragraphs: [
    'To the fullest extent permitted by applicable law, Kingdom Alliance and persons involved in administering or supporting the platform will not be liable for losses or damages arising solely from reliance on information provided by another user, personal relationship or marriage decisions, voluntary financial transactions between users, misrepresentation by another user, meetings or interactions occurring outside the reasonable control of Kingdom Alliance, or unauthorized or unlawful conduct by another person.',
    'Nothing in these Terms is intended to exclude or limit any liability that cannot lawfully be excluded or limited.',
  ] },
  { title: '20. USER RESPONSIBILITY FOR MISUSE', paragraphs: [
    "Users are responsible for their own use of Kingdom Alliance and for any unlawful activity, violation of these Terms, infringement of another person's rights, fraudulent conduct, or unlawful content submitted through their account.",
    'To the extent permitted by applicable law, users may be responsible for losses, claims, liabilities, or reasonable costs resulting from such misuse.',
  ] },
  { title: '21. SUSPENSION AND TERMINATION', paragraphs: [
    'Kingdom Alliance may restrict, suspend, or terminate an account where there are reasonable grounds to believe that a user has violated these Terms, provided materially false or misleading information, created a fraudulent account, impersonated another person, engaged in inappropriate conduct, presented a reasonable safety or security concern, misused the platform for financial solicitation, or used the service for purposes inconsistent with its faith-based and marriage-focused purpose.',
    'Kingdom Alliance may also deactivate long-term inactive accounts in accordance with its account-management and data-retention practices.',
    'Users may discontinue use of Kingdom Alliance and request closure of their account at any time.',
  ] },
  { title: '22. USER RESPONSIBILITY', paragraphs: [
    'Each user is personally responsible for deciding whom to communicate with, meet, develop a relationship with, become engaged to, or marry.',
    'Kingdom Alliance encourages users to exercise wisdom, reasonable judgement, independent verification, responsible communication, and, where desired, guidance from trusted family members, pastors, church leaders, or other responsible persons.',
    'Nothing provided through Kingdom Alliance constitutes legal, financial, medical, psychological, pastoral, or professional matrimonial advice.',
  ] },
  { title: '23. GOVERNING LAW AND JURISDICTION', paragraphs: [
    'These Terms shall be governed by and interpreted in accordance with the laws applicable to Kingdom Alliance and its operations.',
    'Any dispute relating to these Terms or use of the platform shall be subject to the jurisdiction of the competent courts or authorities applicable to Kingdom Alliance, subject to any mandatory rights or requirements under applicable law.',
  ] },
  { title: '24. DISPUTE RESOLUTION', paragraphs: [
    'Users are encouraged to contact Kingdom Alliance first regarding concerns relating to the operation of the platform so that reasonable efforts may be made to understand and resolve the matter.',
    'Nothing in these Terms prevents any person from exercising legal rights or remedies available under applicable law.',
  ] },
  { title: '25. CHANGES TO THESE TERMS', paragraphs: [
    'Kingdom Alliance may update these Terms from time to time where reasonably necessary to reflect changes in platform functionality, safety requirements, administrative practices, legal requirements, or operational needs.',
    'Updated Terms and the applicable effective date will be published on the website. Where required by applicable law, users will be appropriately notified or requested to provide renewed acceptance or consent.',
  ] },
  { title: '26. CONTACT INFORMATION', paragraphs: [
    'For questions regarding these Terms, account matters, user reports, suspected fraudulent profiles, privacy concerns, or complaints, please contact:',
    'Kingdom Alliance — Email: themaster@thekingdomalliances.com — Website: thekingdomalliances.com',
    'Where a matter involves an immediate safety concern or suspected unlawful activity, users should contact the appropriate competent authorities where necessary.',
  ] },
];



// Professional print layout. All coordinates are in millimetres.
const BODY_TOP = 42;
const BODY_BOTTOM = 272;

function text(doc: jsPDF, value: string, x: number, y: number, size = 9.5,
  color: readonly [number, number, number] = INK, font = 'helvetica', style = 'normal') {
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.text(value, x, y);
}

function line(doc: jsPDF, x: number, y: number, w = CONTENT_W) {
  doc.setDrawColor(...GREY_LINE);
  doc.setLineWidth(0.22);
  doc.line(x, y, x + w, y);
}

function wrapped(doc: jsPDF, value: string, width: number, size = 9.5, font = 'helvetica', style = 'normal'): string[] {
  doc.setFont(font, style);
  doc.setFontSize(size);
  return doc.splitTextToSize(value.replace(/[–—]/g, '-'), width);
}

function heading(doc: jsPDF, title: string, subtitle: string) {
  text(doc, title, M_LEFT, 32, 23, NAVY, 'times');
  text(doc, subtitle, M_LEFT, 38, 8, GREY);
}

function section(doc: jsPDF, title: string, y: number) {
  doc.setFillColor(...GOLD);
  doc.rect(M_LEFT, y - 3, 1, 4, 'F');
  text(doc, title, M_LEFT + 4, y, 8, NAVY, 'helvetica', 'bold');
  line(doc, M_LEFT, y + 3);
  return y + 11;
}

function addContinuation(doc: jsPDF, title: string) {
  doc.addPage();
  heading(doc, title, 'Member biodata / continued');
  return BODY_TOP + 6;
}

// Labelled fields use equal-width columns; long answers use the full width.
function fields(doc: jsPDF, group: Section, start: number): number {
  let y = start;
  if (y + 30 > BODY_BOTTOM) y = addContinuation(doc, 'Profile details');
  y = section(doc, group.title, y);
  const rows = [...group.rows];
  while (rows.length) {
    const first = rows.shift()!;
    const wide = first[1].length > 160;
    const pair = wide ? [first] : [first, ...(rows[0] && rows[0][1].length <= 160 ? [rows.shift()!] : [])];
    const w = wide ? CONTENT_W : (CONTENT_W - 10) / 2;
    const values = pair.map(row => wrapped(doc, row[1] === '—' ? 'Not provided' : row[1], w, 9.5));
    const height = Math.max(...values.map(value => value.length)) * 4.7 + 8;
    if (y + height > BODY_BOTTOM) {
      y = addContinuation(doc, 'Profile details');
      y = section(doc, `${group.title} / CONTINUED`, y);
    }
    if (height > BODY_BOTTOM - y) {
      // Extremely long free text flows across pages without clipping.
      text(doc, first[0].toUpperCase(), M_LEFT, y, 7, GREY);
      y += 6;
      for (const value of values[0]) {
        if (y + 5 > BODY_BOTTOM) y = addContinuation(doc, `${first[0]} / continued`);
        text(doc, value, M_LEFT, y);
        y += 4.7;
      }
      y += 7;
      continue;
    }
    pair.forEach((row, i) => {
      const x = M_LEFT + i * (w + 10);
      text(doc, row[0].toUpperCase(), x, y, 7, GREY);
      values[i].forEach((value, j) => text(doc, value, x, y + 5.3 + j * 4.7));
      line(doc, x, y + height - 3, w);
    });
    y += height + 1;
  }
  return y + 8;
}

function formatDate(value: any): string {
  const date = value?.toDate?.() || (value ? new Date(value) : new Date());
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleDateString('en-GB',
    { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Riyadh' });
}

function headerFooter(doc: jsPDF, id: string, sample: boolean) {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    // A small cross emblem and wordmark replace the heavy banner.
    doc.setFillColor(...NAVY);
    doc.rect(M_LEFT, 12, 2, 8, 'F');
    doc.rect(M_LEFT - 2, 14, 6, 2, 'F');
    text(doc, 'KINGDOM ALLIANCE', M_LEFT + 9, 16, 11, NAVY, 'times', 'bold');
    text(doc, 'FAITH. FAMILY. A SHARED FUTURE.', M_LEFT + 9, 20, 6.5, GREY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(sample ? 'SAMPLE / FICTIONAL PROFILE' : 'CONFIDENTIAL MEMBER RECORD', PAGE_W - M_RIGHT, 15, { align: 'right' });
    doc.text(id, PAGE_W - M_RIGHT, 20, { align: 'right' });
    line(doc, M_LEFT, 24);
    line(doc, M_LEFT, 280);
    text(doc, 'Kingdom Alliance  /  Member biodata', M_LEFT, 286, 7, GREY);
    doc.text(`${String(page).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, PAGE_W - M_RIGHT, 286, { align: 'right' });
  }
}

export async function generateBiodataPdf(userData: Record<string, any>): Promise<Buffer> {
  const u = userData || {};
  const fullName = [u.name, u.middleName, u.lastName].filter(Boolean).join(' ') || u.fullName || 'Member';
  const profileId = u.profileId || 'KA-UNKNOWN';
  const sample = u.documentSample === true;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setProperties({ title: `${fullName} - Kingdom Alliance Biodata`, author: 'Kingdom Alliance', subject: 'Member biodata, declaration and terms' });
  const sections = buildSections(u);

  // Page 1: a concise identity block and useful personal information.
  text(doc, 'MEMBER BIODATA', M_LEFT, 34, 8, GREY, 'helvetica', 'bold');
  const nameLines = wrapped(doc, fullName, 125, 28, 'times');
  nameLines.forEach((value, i) => text(doc, value, M_LEFT, 47 + i * 10, 28, NAVY, 'times'));
  const identityBottom = 47 + nameLines.length * 10;
  const location = [u.cityLiving, u.countryLiving].filter(Boolean).join(', ');
  text(doc, location || 'Location not provided', M_LEFT, identityBottom + 1, 10, GREY);
  text(doc, `Profile for ${u.profileFor || 'Self'}  /  ${u.profileType || 'Member'}`, M_LEFT, identityBottom + 8, 8.5, GREY);

  const photo = u.photoUrl || u.photoURL || u.pendingPhotoUrl;
  const image = photo ? await fetchPhotoDataUrl(photo) : null;
  doc.setFillColor(...IVORY);
  doc.rect(151, 32, 43, 46, 'F');
  let hasPhoto = false;
  if (image) {
    try { doc.addImage(image, 152, 33, 41, 44); hasPhoto = true; } catch { /* initials fallback */ }
  }
  if (!hasPhoto) {
    text(doc, fullName.split(' ').map((name: string) => name[0]).slice(0, 2).join(''), 163, 56, 23, NAVY, 'times');
    text(doc, 'MEMBER PROFILE', 157, 69, 6.5, GREY);
  }
  let y = Math.max(90, identityBottom + 22);
  doc.setFillColor(...IVORY);
  doc.rect(M_LEFT, y - 7, CONTENT_W, 16, 'F');
  const status = u.approvalStatus === 'approved' ? 'Approved' : u.approvalStatus === 'rejected' ? 'Requires review' : 'Submitted for review';
  text(doc, `RECORD STATUS   ${sample ? 'Sample only' : status}`, M_LEFT + 5, y, 8, NAVY);
  text(doc, `SUBMITTED   ${formatDate(u.submittedAt || u.createdAt)}`, 121, y, 8, NAVY);
  y += 21;
  y = fields(doc, sections[0], y);
  y = fields(doc, sections[1], y);
  // Career begins on a fresh page: predictable pagination, generous type.
  doc.addPage();
  heading(doc, 'Faith, family & career', 'The people, convictions and work that shape your life.');
  y = fields(doc, sections[2], BODY_TOP + 8);
  y = fields(doc, sections[3], y);
  y = fields(doc, sections[4], y);

  doc.addPage();
  heading(doc, 'Lifestyle & preferences', 'Personal interests and hopes for a shared future.');
  y = fields(doc, sections[5], BODY_TOP + 8);
  y = fields(doc, sections[6], y);

  doc.addPage();
  heading(doc, 'Member declaration', 'Submitted information and profile reference.');
  y = section(doc, 'DECLARATION', BODY_TOP + 12);
  const declaration = 'I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief. I have read and accept the Kingdom Alliance Terms & Conditions set out on the following pages, and I agree to use the platform in accordance with its faith-based and marriage-focused purpose.';
  const lines = wrapped(doc, declaration, CONTENT_W - 12, 11, 'times');
  doc.setFillColor(...IVORY);
  doc.rect(M_LEFT, y - 4, CONTENT_W, lines.length * 5.5 + 14, 'F');
  lines.forEach((value, i) => text(doc, value, M_LEFT + 6, y + 4 + i * 5.5, 11, NAVY, 'times'));
  y += lines.length * 5.5 + 27;
  text(doc, fullName, M_LEFT, y, 19, NAVY, 'times', 'italic');
  line(doc, M_LEFT, y + 5, 106);
  text(doc, 'MEMBER NAME', M_LEFT, y + 12, 7, GREY);
  text(doc, `Submission date: ${formatDate(u.submittedAt || u.createdAt)}`, M_LEFT, y + 23, 9, GREY);
  y += 45;
  y = section(doc, 'PROFILE REFERENCE', y);
  try {
    const bwipjs: any = await import('bwip-js');
    const png: Buffer = await (bwipjs.toBuffer ? bwipjs : bwipjs.default).toBuffer({
      bcid: 'pdf417', text: `${fullName}|${u.mobileNumber || ''}|${u.citizenship || ''}|${profileId}`,
      scale: 3, eclevel: 5, columns: 8, rowmult: 3, padding: 8,
    });
    // Keep the barcode's native aspect ratio so scanners can read it.
    const properties = doc.getImageProperties(`data:image/png;base64,${png.toString('base64')}`);
    const w = 84;
    const h = w * properties.height / properties.width;
    doc.addImage(png, 'PNG', M_LEFT, y, w, h);
    text(doc, profileId, 112, y + 8, 15, NAVY, 'times');
    text(doc, 'Profile reference barcode', 112, y + 16, 8, GREY);
    text(doc, 'Name / Mobile / Citizenship / Profile ID', 112, y + 23, 7, GREY);
    y += Math.max(h, 30) + 10;
  } catch (error: any) {
    console.error('[BiodataPDF] Barcode generation failed:', error.message);
    text(doc, `Profile reference: ${profileId}`, M_LEFT, y, 10, NAVY);
    y += 15;
  }
  text(doc, 'This record includes a member declaration and profile reference.', M_LEFT, y, 8, GREY);
  text(doc, 'It does not contain a certificate-based digital signature.', M_LEFT, y + 5, 8, GREY);
  if (sample) text(doc, 'Sample profile: all personal details are fictional.', M_LEFT, y + 16, 9, NAVY);

  // Preserve every term verbatim; paginate by rendered lines, never clip text.
  doc.addPage();
  heading(doc, 'Terms & conditions', 'The full terms accompanying this member record.');
  y = BODY_TOP + 9;
  for (const term of TERMS) {
    const titles = wrapped(doc, term.title, CONTENT_W - 4, 8.5, 'helvetica', 'bold');
    if (y + titles.length * 4.6 + 21 > BODY_BOTTOM) {
      doc.addPage(); heading(doc, 'Terms & conditions', 'Continued'); y = BODY_TOP + 9;
    }
    titles.forEach((title, i) => text(doc, title, M_LEFT, y + i * 4.6, 8.5, NAVY, 'helvetica', 'bold'));
    y += titles.length * 4.6 + 5;
    for (const paragraph of term.paragraphs) {
      for (const value of wrapped(doc, paragraph, CONTENT_W, 9)) {
        if (y + 4.4 > BODY_BOTTOM) {
          doc.addPage(); heading(doc, 'Terms & conditions', 'Continued'); y = BODY_TOP + 9;
        }
        text(doc, value, M_LEFT, y, 9);
        y += 4.4;
      }
      y += 2.8;
    }
    y += 6;
  }
  headerFooter(doc, profileId, sample);
  return Buffer.from(doc.output('arraybuffer'));
}
