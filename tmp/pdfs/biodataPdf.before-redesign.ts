import { jsPDF } from 'jspdf';

/**
 * Biodata PDF Generator — Kingdom Alliance (High-End Redesign)
 * -------------------------------------------------------------
 * Page 1  : Hero cover  — photo, name, profile ID, golden hairline
 * Page 2  : Biodata     — organized bento sections, all fields
 * Page 3  : Declaration — digital-signature panel with PDF417 barcode
 * Pages 4+: Full Terms & Conditions (all 26 sections)
 * Every page carries a refined header + footer.
 *
 * Design language: editorial luxury — deepest navy, champagne gold,
 * warm ivory, refined serif headings / grotesk body, airy whitespace.
 */

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
const M_TOP = 28;
const M_BOTTOM = 22;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT;

type Row = [label: string, value: string];
interface Section { title: string; rows: Row[]; }

function v(obj: any, key: string): string {
  const val = obj?.[key];
  if (val === undefined || val === null || String(val).trim() === '') return '—';
  return String(val).trim();
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
        ['Full Name', `${v(u, 'name')} ${v(u, 'lastName')}`.trim()],
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



// ── Painters & layout helpers ─────────────────────────────────────────────────
function paintHeader(doc: jsPDF, profileId: string): void {
  // Thin gold hairline at the very top
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(0, 0, PAGE_W, 2.4, 'F');
  // Wordmark
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('KINGDOM ALLIANCE', M_LEFT, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(GREY[0], GREY[1], GREY[2]);
  doc.text('Christian Matrimony · Rooted in Faith & Values', M_LEFT, 18);
  // Profile ID chip (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text(`Profile ID · ${profileId}`, PAGE_W - M_RIGHT, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(GREY[0], GREY[1], GREY[2]);
  doc.text(`Generated ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, PAGE_W - M_RIGHT, 18, { align: 'right' });
  doc.setDrawColor(GREY_LINE[0], GREY_LINE[1], GREY_LINE[2]);
  doc.setLineWidth(0.3);
  doc.line(M_LEFT, 21, PAGE_W - M_RIGHT, 21);
}

function paintFooter(doc: jsPDF): void {
  const page = doc.getCurrentPageInfo().pageNumber;
  const total = doc.getNumberOfPages();
  doc.setDrawColor(GREY_LINE[0], GREY_LINE[1], GREY_LINE[2]);
  doc.setLineWidth(0.3);
  doc.line(M_LEFT, PAGE_H - 16, PAGE_W - M_RIGHT, PAGE_H - 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(GREY[0], GREY[1], GREY[2]);
  doc.text('Confidential · Kingdom Alliance Member Biodata', M_LEFT, PAGE_H - 11);
  doc.text(`Page ${page} of ${total}`, PAGE_W - M_RIGHT, PAGE_H - 11, { align: 'right' });
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - M_BOTTOM) {
    doc.addPage();
    return M_TOP;
  }
  return y;
}

/** Rounded-rect card with a subtle ivory fill + hairline border. */
function card(doc: jsPDF, x: number, y: number, w: number, h: number): void {
  doc.setFillColor(IVORY[0], IVORY[1], IVORY[2]);
  doc.setDrawColor(GREY_LINE[0], GREY_LINE[1], GREY_LINE[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');
}

/** Small uppercase section label with a gold tick. */
function sectionLabel(doc: jsPDF, x: number, y: number, title: string): void {
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(x, y - 2.4, 1.4, 4.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(title, x + 4, y);
}

/** A two-column key/value row inside a card. Returns the y after the row. */
function kvRow(doc: jsPDF, x: number, y: number, w: number, label: string, value: string): number {
  const labelW = 46;
  const valW = w - labelW;
  const valLines = doc.splitTextToSize(value, valW - 4) as string[];
  const rowH = Math.max(5.2, valLines.length * 4.0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(GREY[0], GREY[1], GREY[2]);
  doc.text(label, x + 3, y + 3.4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text(valLines, x + labelW, y + 3.4);
  // hairline divider
  doc.setDrawColor(GREY_LINE[0], GREY_LINE[1], GREY_LINE[2]);
  doc.setLineWidth(0.2);
  doc.line(x + 2, y + rowH, x + w - 2, y + rowH);
  return y + rowH;
}

// ── Main generator ────────────────────────────────────────────────────────────
export async function generateBiodataPdf(userData: Record<string, any>): Promise<Buffer> {
  const u = userData || {};
  const fullName = `${u.name || ''} ${u.lastName || ''}`.trim() || 'Member';
  const profileId = u.profileId || 'KA-UNKNOWN';
  const mobile = u.mobileNumber || '';
  const citizenship = u.citizenship || '';

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── PAGE 1: HERO COVER ─────────────────────────────────────────────────────
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, PAGE_W, 120, 'F');
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(0, 120, PAGE_W, 1.2, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('KINGDOM ALLIANCE', M_LEFT, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text('CHRISTIAN MATRIMONY · ROOTED IN FAITH & VALUES', M_LEFT, 37);

  // Profile photo (or monogram fallback)
  const photoUrl = u.photoUrl || u.photoURL || u.pendingPhotoUrl || '';
  const photoData = photoUrl ? await fetchPhotoDataUrl(photoUrl) : null;
  const photoSize = 46;
  const photoX = PAGE_W - M_RIGHT - photoSize;
  const photoY = 50;
  if (photoData) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 1.6, 'F');
      doc.addImage(photoData, 'JPEG', photoX, photoY, photoSize, photoSize, undefined, 'FAST');
    } catch {
      drawMonogram(doc, photoX, photoY, photoSize, fullName);
    }
  } else {
    drawMonogram(doc, photoX, photoY, photoSize, fullName);
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(34);
  doc.setTextColor(255, 255, 255);
  doc.text(fullName, M_LEFT, 78);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  const subtitle = [u.profileType, u.profileFor && u.profileFor !== 'Self' ? `Profile for ${u.profileFor}` : null, u.cityLiving ? `${u.cityLiving}, ${u.countryLiving}` : null]
    .filter(Boolean).join('  ·  ');
  doc.text(subtitle || 'Matrimonial Biodata', M_LEFT, 86);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`PROFILE ID · ${profileId}`, M_LEFT, 100);

  // Cover meta row (on ivory body)
  let y = 138;
  const metaItems: [string, string][] = [
    ['Submitted', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })],
    ['Status', 'Pending Approval'],
    ['Document', 'Confidential Biodata'],
  ];
  const metaW = CONTENT_W / metaItems.length;
  metaItems.forEach((m, i) => {
    const mx = M_LEFT + i * metaW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(GREY[0], GREY[1], GREY[2]);
    doc.text(m[0].toUpperCase(), mx, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(m[1], mx, y + 6);
  });
  doc.setDrawColor(GREY_LINE[0], GREY_LINE[1], GREY_LINE[2]);
  doc.setLineWidth(0.3);
  doc.line(M_LEFT, y + 12, PAGE_W - M_RIGHT, y + 12);

  y += 24;
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  const intro = 'A complete matrimonial profile, prayerfully prepared and digitally attested by the member below.';
  const introLines = doc.splitTextToSize(intro, CONTENT_W) as string[];
  doc.text(introLines, M_LEFT, y);
  y += introLines.length * 5.5 + 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text('CONTENTS', M_LEFT, y);
  y += 5;
  const contents = ['01  Biodata Profile', '02  Declaration & Digital Signature', '03  Terms & Conditions'];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  for (const c of contents) {
    doc.text(c, M_LEFT, y);
    y += 6;
  }

  // ── PAGE 2: BIODATA (bento sections) ───────────────────────────────────────
  doc.addPage();
  y = M_TOP;
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('01 · Biodata Profile', M_LEFT, y);
  y += 3;
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.6);
  doc.line(M_LEFT, y, M_LEFT + 36, y);
  y += 9;

  const sections = buildSections(u);
  const colGap = 6;
  const leftW = CONTENT_W * 0.56;
  const rightW = CONTENT_W - leftW - colGap;

  const sectionHeight = (s: Section, w: number): number => {
    let h = 9;
    for (const [, val] of s.rows) {
      const lines = doc.splitTextToSize(val, w - 50) as string[];
      h += Math.max(5.2, lines.length * 4.0);
    }
    return h + 3;
  };

  let leftY = y;
  let rightY = y;
  sections.forEach((s, i) => {
    if (i % 2 === 0) {
      const w = leftW;
      const h = sectionHeight(s, w);
      leftY = ensureSpace(doc, leftY, h + 4);
      card(doc, M_LEFT, leftY, w, h);
      sectionLabel(doc, M_LEFT, leftY + 7, s.title);
      let ry = leftY + 11;
      for (const [label, val] of s.rows) {
        ry = kvRow(doc, M_LEFT, ry, w, label, val);
      }
      leftY += h + 5;
    } else {
      const w = rightW;
      const h = sectionHeight(s, w);
      const x = M_LEFT + leftW + colGap;
      rightY = ensureSpace(doc, rightY, h + 4);
      card(doc, x, rightY, w, h);
      sectionLabel(doc, x, rightY + 7, s.title);
      let ry = rightY + 11;
      for (const [label, val] of s.rows) {
        ry = kvRow(doc, x, ry, w, label, val);
      }
      rightY += h + 5;
    }
  });
  y = Math.max(leftY, rightY) + 4;

  // ── PAGE 3: DECLARATION & DIGITAL SIGNATURE ──────────────────────────────────
  doc.addPage();
  y = M_TOP;
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('02 · Declaration & Digital Signature', M_LEFT, y);
  y += 3;
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.6);
  doc.line(M_LEFT, y, M_LEFT + 36, y);
  y += 12;

  // Declaration card
  const declText =
    'I hereby declare that the information furnished above is true and correct to the best of my knowledge and belief. I have read and accept the Kingdom Alliance Terms & Conditions set out on the following pages, and I agree to use the platform in accordance with its faith-based and marriage-focused purpose.';
  const declLines = doc.splitTextToSize(declText, CONTENT_W - 12) as string[];
  const declH = declLines.length * 5.0 + 16;
  card(doc, M_LEFT, y, CONTENT_W, declH);
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text(declLines, M_LEFT + 6, y + 10);
  y += declH + 10;

  // Signature panel (navy card with gold border)
  const sigH = 64;
  y = ensureSpace(doc, y, sigH + 6);
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.roundedRect(M_LEFT, y, CONTENT_W, sigH, 3, 3, 'F');
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(M_LEFT, y, CONTENT_W, sigH, 3, 3, 'S');

  // Signature line + name
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(fullName, M_LEFT + 8, y + 18);
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.3);
  doc.line(M_LEFT + 8, y + 22, M_LEFT + 90, y + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text('SIGNED BY MEMBER', M_LEFT + 8, y + 26);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(220, 220, 220);
  doc.text(`Profile ID · ${profileId}`, M_LEFT + 8, y + 34);
  doc.text(`Date · ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, M_LEFT + 8, y + 40);

  // PDF417 digitally-signed barcode (right side of the panel)
  try {
    const bwipjs: any = await import('bwip-js');
    const barcodePayload = `${fullName}|${mobile}|${citizenship}|${profileId}`;
    const png: Buffer = await (bwipjs.toBuffer ? bwipjs : bwipjs.default).toBuffer({
      bcid: 'pdf417', text: barcodePayload, scale: 2, eclevel: 5,
      columns: 8, rowmult: 3, padding: 6, barcolor: 'C9A84C',
    });
    const bDataUrl = `data:image/png;base64,${png.toString('base64')}`;
    const bw = 70;
    const bh = 22;
    doc.addImage(bDataUrl, 'PNG', PAGE_W - M_RIGHT - bw - 6, y + 10, bw, bh);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text('DIGITALLY SIGNED', PAGE_W - M_RIGHT - bw / 2 - 6, y + 38, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(180, 180, 180);
    doc.text('Scan to verify · Name | Mobile | Citizenship | Profile ID', PAGE_W - M_RIGHT - bw / 2 - 6, y + 43, { align: 'center' });
  } catch (e: any) {
    console.error('[BiodataPDF] Barcode generation failed:', e.message);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text(`Digitally Signed · ${fullName} (${profileId})`, PAGE_W - M_RIGHT - 80, y + 24);
  }
  y += sigH + 8;

  // ── PAGES 4+: FULL TERMS & CONDITIONS ───────────────────────────────────────
  doc.addPage();
  y = M_TOP;
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.text('03 · Terms & Conditions', M_LEFT, y);
  y += 3;
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.6);
  doc.line(M_LEFT, y, M_LEFT + 36, y);
  y += 10;

  for (const section of TERMS) {
    y = ensureSpace(doc, y, 16);
    sectionLabel(doc, M_LEFT, y, section.title);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.6);
    doc.setTextColor(INK[0], INK[1], INK[2]);
    for (const para of section.paragraphs) {
      const lines = doc.splitTextToSize(para, CONTENT_W) as string[];
      const h = lines.length * 4.1;
      if (y + h > PAGE_H - M_BOTTOM) {
        doc.addPage();
        y = M_TOP;
      }
      doc.text(lines, M_LEFT, y);
      y += h + 1.6;
    }
    y += 3.4;
  }

  // ── Paint header/footer on all pages (skip the hero cover) ──────────────────
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    paintHeader(doc, profileId);
    paintFooter(doc);
  }

  return Buffer.from(doc.output('arraybuffer'));
}

/** Draw a navy circle monogram with the user's initials (photo fallback). */
function drawMonogram(doc: jsPDF, x: number, y: number, size: number, name: string): void {
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.circle(x + size / 2, y + size / 2, size / 2 + 1.6, 'F');
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F');
  const initials = (name.split(' ').map(w => w[0]).slice(0, 2).join('') || 'KA').toUpperCase();
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(initials, x + size / 2, y + size / 2 + 2, { align: 'center' });
}

