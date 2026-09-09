import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../lib/SettingsContext';
import PublicNavbar from '../components/PublicNavbar';
import { motion } from 'motion/react';

interface TocSection {
  title: string;
  paragraphs: string[];
}

const PART1: TocSection[] = [
  {
    title: '1. ABOUT KINGDOM ALLIANCE',
    paragraphs: [
      'Kingdom Alliance provides a faith-based platform through which eligible adult Christian believers who are genuinely seeking a marriage partner may connect and communicate.',
      'The role of Kingdom Alliance is limited to providing the platform and facilitating introductions and communication between users. Kingdom Alliance does not arrange marriages and does not act as a marriage broker, matrimonial agent, counsellor, church authority, legal adviser, or guarantor of any relationship or marriage.',
      'Kingdom Alliance does not guarantee that any user will find a suitable marriage partner through the platform. Each user remains responsible for his or her own decisions regarding communication, meetings, relationships, engagement, and marriage.',
      'Users are encouraged to exercise wisdom and good judgement and, where appropriate, seek guidance from trusted family members, pastors, church leaders, or other responsible persons.',
    ],
  },
  {
    title: '2. FREE-OF-CHARGE SERVICE',
    paragraphs: [
      'Kingdom Alliance has been created for the benefit of Christian believers seeking a marriage partner and is provided free of charge.',
      'Kingdom Alliance does not charge users any registration fee, membership fee, subscription fee, profile creation fee, matchmaking fee, introduction fee, communication fee, or success fee for engagement or marriage.',
      'Kingdom Alliance is not established as a commercial matrimonial service. Its purpose is to provide a free, faith-based platform through which eligible Christian believers may connect and consider marriage.',
      'No person is authorized to collect any registration, membership, matchmaking, introduction, communication, or success fee on behalf of Kingdom Alliance.',
      'Any person requesting such payment while claiming to represent Kingdom Alliance should be reported to the platform administrators.',
    ],
  },
  {
    title: '3. ELIGIBILITY',
    paragraphs: [
      'A person must be at least 18 years of age to register for or use Kingdom Alliance.',
      'Users must be legally eligible to marry under the laws applicable to them, genuinely seeking a marriage partner, willing to provide truthful and accurate information, and willing to use the platform consistently with its faith-based and marriage-focused purpose.',
      'By creating an account, the user confirms that these eligibility requirements are satisfied.',
      'Kingdom Alliance reserves the right to refuse, restrict, suspend, or terminate access where there are reasonable grounds to believe that a user does not meet the eligibility requirements or is using the platform for purposes inconsistent with its intended purpose.',
    ],
  },
  {
    title: '4. PROFILE INFORMATION AND MARITAL STATUS',
    paragraphs: [
      'Users are responsible for ensuring that the information provided in their profiles is truthful, accurate, current, and not misleading.',
      'This includes information relating to identity, age, marital status, photographs, location, occupation, education, family background, faith-related information, and other material details voluntarily provided through the platform.',
      "Users must not intentionally conceal or misrepresent information that could reasonably influence another person's decision to communicate with or consider them for marriage.",
      "Users must not impersonate another person, use another person's photographs without authorization, create deceptive or fraudulent profiles, maintain multiple accounts for misleading purposes, or falsely represent personal, professional, family, church, ministry, or other material information.",
      'Kingdom Alliance may request additional information where reasonably necessary to support profile authenticity. Any such review does not constitute a guarantee that all information provided by a user is complete or accurate.',
    ],
  },
  {
    title: '5. FAITH-BASED AND MARRIAGE-FOCUSED PURPOSE',
    paragraphs: [
      'Kingdom Alliance is intended for Christian believers genuinely seeking a marriage partner.',
      'Users are expected to respect the faith-based purpose of the platform and communicate with other members honestly, courteously, responsibly, and respectfully.',
      'The platform must not be used for unrelated commercial activities, improper solicitation, unauthorized recruitment, fraudulent activity, or any other purpose inconsistent with the objectives of Kingdom Alliance.',
      "A user's representation regarding his or her Christian faith, church involvement, spiritual background, or personal beliefs is information provided by that user. Kingdom Alliance does not independently determine or guarantee the sincerity of a user's faith, beliefs, character, church involvement, or personal commitment.",
    ],
  },
  {
    title: '6. USER CONDUCT',
    paragraphs: [
      'Users must conduct themselves in a respectful, responsible, and lawful manner when using Kingdom Alliance.',
      'Users must not harass, threaten, intimidate, exploit, deceive, impersonate, defame, or deliberately mislead another person.',
      'Users must not upload, publish, send, or distribute content that is unlawful, offensive, abusive, threatening, fraudulent, misleading, defamatory, or otherwise inappropriate for the nature and purpose of the platform.',
      'Kingdom Alliance must not be used for unauthorized advertising, commercial promotion, spam, mass communication, data harvesting, collection of personal information for unauthorized purposes, or activities that interfere with the proper operation, integrity, or security of the platform.',
      "Users must not attempt unauthorized access to another user's account, Kingdom Alliance systems, or any related technical infrastructure.",
      'Any serious or repeated violation of these requirements may result in restriction, suspension, or termination of an account.',
    ],
  },
  {
    title: '7. FINANCIAL SOLICITATION AND FRAUD PREVENTION',
    paragraphs: [
      'Kingdom Alliance is a free-of-charge service. Users should exercise appropriate caution regarding financial requests made by persons they meet through the platform.',
      'The platform must not be used for fraudulent financial solicitation, unauthorized fundraising, investment schemes, requests for banking credentials, payment-card information, passwords, security codes, or other sensitive financial information.',
      'Users are advised to exercise appropriate judgement before transferring money or providing financial information to anyone introduced through the platform.',
      'Any suspicious financial request, fraudulent activity, or person claiming to collect fees on behalf of Kingdom Alliance should be reported promptly to the platform administrators.',
    ],
  },
];
const PART2: TocSection[] = [
  {
    title: '8. USER SAFETY',
    paragraphs: [
      'Kingdom Alliance facilitates introductions between users but does not control or supervise communications, meetings, or interactions between users outside the platform.',
      'Each user is responsible for exercising appropriate care, judgement, and reasonable precautions when communicating with or meeting another person.',
      'Users are encouraged to verify relevant information independently, exercise caution when sharing sensitive personal information, and take reasonable precautions before arranging an in-person meeting.',
      'Initial meetings should, where appropriate, take place in safe and public locations. Users may also consider informing a trusted family member, friend, pastor, church leader, or other responsible person before meeting another user.',
      'Kingdom Alliance cannot guarantee the conduct, intentions, identity, or behaviour of any individual user.',
    ],
  },
  {
    title: '9. VERIFICATION AND BACKGROUND INFORMATION',
    paragraphs: [
      "Unless expressly stated otherwise, users should not assume that another user's identity, marital status, employment, education, financial position, church membership, ministry role, legal history, immigration status, or other background information has been independently verified by Kingdom Alliance.",
      'Any profile review, email confirmation, telephone confirmation, identity check, document review, or similar process undertaken by Kingdom Alliance is intended only to support platform integrity and should not be interpreted as an endorsement, certification, recommendation, or guarantee of the individual concerned.',
      'Users remain responsible for carrying out any independent verification they consider appropriate before making significant personal or marital decisions.',
    ],
  },
  {
    title: '10. NO ENDORSEMENT OR GUARANTEE OF USERS',
    paragraphs: [
      "Kingdom Alliance does not guarantee or certify any user's identity, character, Christian faith, marital status, family background, education, employment, financial position, legal history, compatibility, intentions, suitability for marriage, or the accuracy or completeness of profile information.",
      "The presence of a user's profile on Kingdom Alliance does not mean that Kingdom Alliance recommends, approves, certifies, or endorses that individual.",
      'Users remain responsible for evaluating information and making their own informed decisions.',
    ],
  },
  {
    title: '11. NO GUARANTEE OF MATCH OR MARRIAGE',
    paragraphs: [
      'Kingdom Alliance does not guarantee that a suitable partner will be identified, that another user will respond to an expression of interest or communication, that two users will be compatible, that a relationship will develop, or that an introduction through the platform will result in engagement or marriage.',
      'Any search tools, preferences, profile suggestions, compatibility features, or recommendations provided by the platform are intended only to assist users in identifying potential connections and should not be regarded as professional, pastoral, legal, or matrimonial advice.',
    ],
  },
  {
    title: '12. USER CONTENT AND PHOTOGRAPHS',
    paragraphs: [
      'Users are responsible for all information, photographs, messages, descriptions, testimonies, and other content they submit through Kingdom Alliance.',
      'By submitting content, users confirm that they have the right to use and share that content.',
      "Users must not upload another person's photographs or personal information without appropriate authorization and must not knowingly provide content that infringes another person's rights.",
      'Users should exercise particular care before uploading information or photographs concerning children, family members, or other third parties.',
      "Kingdom Alliance reserves the right to remove content that violates these Terms, infringes another person's rights, creates a safety or security concern, or is otherwise inappropriate for the platform.",
    ],
  },
  {
    title: '13. PRIVACY AND PERSONAL DATA',
    paragraphs: [
      'Kingdom Alliance respects the privacy of its users and will process personal information in accordance with the Kingdom Alliance Privacy Policy and applicable data-protection requirements.',
      'Information processed through the platform may include registration information, profile information, photographs, contact information, personal preferences, faith-related information, marital status, communications with the platform, technical information, and other information reasonably necessary for the operation, administration, security, and improvement of the service.',
      'Users should carefully consider the information they choose to include in their profiles or make available to other members.',
      'Where consent or any additional authorization is required under applicable law for the processing of personal information, Kingdom Alliance will obtain such consent or authorization as required.',
      'Users should review the Kingdom Alliance Privacy Policy for further information regarding the collection, use, disclosure, storage, retention, security, deletion, and protection of personal information and the exercise of applicable privacy rights.',
    ],
  },
  {
    title: '14. ACCOUNT CLOSURE AND DATA DELETION',
    paragraphs: [
      'Users may deactivate or request closure of their Kingdom Alliance account through the available account controls or by contacting Kingdom Alliance.',
      'Users who become engaged, married, find a suitable partner, or otherwise cease seeking a marriage partner are encouraged to deactivate or close their profiles so that the information displayed to other users remains accurate.',
      'Certain information may be retained following account closure where reasonably necessary or legally required for security, fraud prevention, dispute resolution, recordkeeping, or compliance with applicable law, subject to the Kingdom Alliance Privacy Policy.',
    ],
  },
];
const PART3: TocSection[] = [
  {
    title: '15. REPORTING AND SAFEGUARDING',
    paragraphs: [
      'Users are encouraged to promptly report suspected fake profiles, false or misleading information, fraudulent activity, harassment, impersonation, misuse of photographs, inappropriate solicitation, threatening conduct, safety concerns, or other serious violations of these Terms.',
      'Kingdom Alliance may review reported matters and may warn, restrict, suspend, or terminate an account where reasonably necessary to protect users, maintain the integrity of the platform, or comply with applicable requirements.',
      'Where appropriate and permitted or required by applicable law, Kingdom Alliance may cooperate with competent authorities regarding suspected unlawful activity or serious safety concerns.',
    ],
  },
  {
    title: '16. INTELLECTUAL PROPERTY',
    paragraphs: [
      'The Kingdom Alliance name, logo, website design, original text, graphics, software, and other original materials associated with the platform are owned by or licensed to Kingdom Alliance unless otherwise stated.',
      'Users may not reproduce, distribute, modify, sell, commercially exploit, or create unauthorized derivative works from Kingdom Alliance materials without appropriate permission.',
      'User-generated content remains subject to the rights of the person who submitted it, subject to the limited permissions reasonably required for Kingdom Alliance to display such content and operate the service.',
    ],
  },
  {
    title: '17. THIRD-PARTY SERVICES AND LINKS',
    paragraphs: [
      'Kingdom Alliance may include links to or integrations with third-party websites, communication services, social-media platforms, hosting providers, mapping services, or other external services.',
      'Kingdom Alliance does not control and is not responsible for the content, privacy practices, security, availability, policies, or actions of independent third-party services.',
      'Users should review the applicable terms and privacy policies of third-party services before using them.',
    ],
  },
  {
    title: '18. DISCLAIMER',
    paragraphs: [
      'Kingdom Alliance is provided on an "as is" and "as available" basis, subject to applicable law.',
      'While reasonable efforts are made to maintain the availability, integrity, security, and proper operation of the platform, Kingdom Alliance does not guarantee uninterrupted or error-free access, complete accuracy of user-provided information, appropriate conduct by every user, absence of technical problems, or successful outcomes from introductions made through the platform.',
      'Users remain responsible for decisions made on the basis of information provided by other users.',
    ],
  },
  {
    title: '19. LIMITATION OF LIABILITY',
    paragraphs: [
      'To the fullest extent permitted by applicable law, Kingdom Alliance and persons involved in administering or supporting the platform will not be liable for losses or damages arising solely from reliance on information provided by another user, personal relationship or marriage decisions, voluntary financial transactions between users, misrepresentation by another user, meetings or interactions occurring outside the reasonable control of Kingdom Alliance, or unauthorized or unlawful conduct by another person.',
      'Nothing in these Terms is intended to exclude or limit any liability that cannot lawfully be excluded or limited.',
    ],
  },
  {
    title: '20. USER RESPONSIBILITY FOR MISUSE',
    paragraphs: [
      "Users are responsible for their own use of Kingdom Alliance and for any unlawful activity, violation of these Terms, infringement of another person's rights, fraudulent conduct, or unlawful content submitted through their account.",
      'To the extent permitted by applicable law, users may be responsible for losses, claims, liabilities, or reasonable costs resulting from such misuse.',
    ],
  },
  {
    title: '21. SUSPENSION AND TERMINATION',
    paragraphs: [
      'Kingdom Alliance may restrict, suspend, or terminate an account where there are reasonable grounds to believe that a user has violated these Terms, provided materially false or misleading information, created a fraudulent account, impersonated another person, engaged in inappropriate conduct, presented a reasonable safety or security concern, misused the platform for financial solicitation, or used the service for purposes inconsistent with its faith-based and marriage-focused purpose.',
      'Kingdom Alliance may also deactivate long-term inactive accounts in accordance with its account-management and data-retention practices.',
      'Users may discontinue use of Kingdom Alliance and request closure of their account at any time.',
    ],
  },
];
const PART4: TocSection[] = [
  {
    title: '22. USER RESPONSIBILITY',
    paragraphs: [
      'Each user is personally responsible for deciding whom to communicate with, meet, develop a relationship with, become engaged to, or marry.',
      'Kingdom Alliance encourages users to exercise wisdom, reasonable judgement, independent verification, responsible communication, and, where desired, guidance from trusted family members, pastors, church leaders, or other responsible persons.',
      'Nothing provided through Kingdom Alliance constitutes legal, financial, medical, psychological, pastoral, or professional matrimonial advice.',
    ],
  },
  {
    title: '23. GOVERNING LAW AND JURISDICTION',
    paragraphs: [
      'These Terms shall be governed by and interpreted in accordance with the laws applicable to Kingdom Alliance and its operations.',
      'Any dispute relating to these Terms or use of the platform shall be subject to the jurisdiction of the competent courts or authorities applicable to Kingdom Alliance, subject to any mandatory rights or requirements under applicable law.',
    ],
  },
  {
    title: '24. DISPUTE RESOLUTION',
    paragraphs: [
      'Users are encouraged to contact Kingdom Alliance first regarding concerns relating to the operation of the platform so that reasonable efforts may be made to understand and resolve the matter.',
      'Nothing in these Terms prevents any person from exercising legal rights or remedies available under applicable law.',
    ],
  },
  {
    title: '25. CHANGES TO THESE TERMS',
    paragraphs: [
      'Kingdom Alliance may update these Terms from time to time where reasonably necessary to reflect changes in platform functionality, safety requirements, administrative practices, legal requirements, or operational needs.',
      'Updated Terms and the applicable effective date will be published on the website. Where required by applicable law, users will be appropriately notified or requested to provide renewed acceptance or consent.',
    ],
  },
  {
    title: '26. CONTACT INFORMATION',
    paragraphs: [
      'For questions regarding these Terms, account matters, user reports, suspected fraudulent profiles, privacy concerns, or complaints, please contact:',
      'Kingdom Alliance',
      'Email: themaster@thekingdomalliances.com',
      'Website: thekingdomalliances.com',
      'Where a matter involves an immediate safety concern or suspected unlawful activity, users should contact the appropriate competent authorities where necessary.',
    ],
  },
];

const SECTIONS: TocSection[] = [...PART1, ...PART2, ...PART3, ...PART4];

export default function TermsPage() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden text-[#4a3521]"
      style={{
        fontFamily: "'Outfit', sans-serif",
        background: 'linear-gradient(180deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)'
      }}
    >
      <PublicNavbar />

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-45"
          style={{ background: 'radial-gradient(circle, rgba(196,133,106,0.22) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, rgba(143,99,55,0.16) 0%, transparent 70%)' }} />
      </div>

      <main className="flex-1 relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16 text-center shadow-[0_30px_60px_-30px_rgba(143,99,55,0.5)]"
            style={{ background: 'linear-gradient(135deg, #4a3521 0%, #2d1f13 50%, #1a120b 100%)' }}
          >
            <h1 className="text-[clamp(36px,5vw,54px)] font-extralight text-white tracking-tight" style={{ letterSpacing: '-0.025em' }}>
              Terms &amp; Conditions
            </h1>
            <p className="mt-5 text-white/60 text-[16px] max-w-xl mx-auto leading-relaxed font-light">
              The covenant that governs our community. Please read these terms carefully before registering, creating a profile, or using the platform.
            </p>
            <div className="mt-8 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-5 py-2 text-[12px] font-light tracking-wider text-white/50">
              Effective 25 August 2026 &nbsp;·&nbsp; Last updated 25 August 2026
            </div>
          </motion.div>

          {/* Document */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="relative mt-8 rounded-[2.5rem] bg-white border border-[#e2ddd2] shadow-[0_40px_80px_-40px_rgba(143,99,55,0.15)] p-6 sm:p-12 lg:p-16"
          >
            <div className="space-y-14">
              {/* Intro */}
              <div className="rounded-[1.5rem] bg-[#faf4ea] border border-[#f0e2cc] p-6 sm:p-9">
                <p className="text-[#C4856A] text-[22px] font-semibold mb-4">Welcome to Kingdom Alliance.</p>
                <div className="space-y-4">
                  <p className="text-[#7A6E68] leading-[1.85] text-[15px] font-light">
                    Kingdom Alliance is a faith-based platform created to help adult Christian believers connect with other Christian believers for the purpose of considering marriage.
                  </p>
                  <p className="text-[#7A6E68] leading-[1.85] text-[15px] font-light">
                    Kingdom Alliance is provided free of charge for the benefit of believers and is not established as a commercial matrimonial or dating service.
                  </p>
                  <p className="text-[#7A6E68] leading-[1.85] text-[15px] font-light">
                    By registering, creating a profile, accessing, or using Kingdom Alliance, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
                  </p>
                </div>
              </div>

              {SECTIONS.map((section) => {
                const num = section.title.split('.')[0];
                const heading = section.title.replace(/^\d+\.\s*/, '');
                return (
                  <section key={section.title} id={`section-${num}`}>
                    <div className="flex items-baseline gap-4 sm:gap-6">
                      <span className="text-[26px] sm:text-[32px] font-extralight leading-none text-[#C4856A] shrink-0 w-10 sm:w-12 text-right">
                        {num}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[16px] sm:text-[20px] font-semibold text-[#4a3521] tracking-wider uppercase">
                          {heading}
                        </h2>
                        <div className="mt-3 h-px bg-gradient-to-r from-[#C4856A]/30 via-[#e2ddd2] to-transparent" />
                      </div>
                    </div>
                    <div className="mt-5 space-y-4 sm:pl-[4.5rem]">
                      {section.paragraphs.map((para, idx) => (
                        <p key={idx} className="text-[#7A6E68] leading-[1.85] text-[15px] font-light">{para}</p>
                      ))}
                    </div>
                  </section>
                );
              })}

              {/* OUR PURPOSE */}
              <div className="rounded-[1.5rem] border border-[#e2ddd2] border-l-4 border-l-[#C4856A] bg-[#faf4ea] p-6 sm:p-10 shadow-[0_20px_45px_-35px_rgba(143,99,55,0.2)]">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#C4856A]/40" />
                  <h2 className="text-[18px] sm:text-[22px] font-extralight text-[#C4856A] tracking-widest uppercase text-center">Our Purpose</h2>
                  <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#C4856A]/40" />
                </div>
                <div className="space-y-4 max-w-2xl mx-auto">
                  <p className="text-[#7A6E68] leading-[1.85] text-[15px] font-light">
                    Kingdom Alliance has been established as a free-of-charge, faith-based service for the benefit of
                    Christian believers seeking a marriage partner.
                  </p>
                  <p className="text-[#7A6E68] leading-[1.85] text-[15px] font-light">
                    There is no registration fee, membership fee, subscription fee, matchmaking fee, introduction fee,
                    communication fee, or success fee for users of the platform.
                  </p>
                  <p className="text-[#7A6E68] leading-[1.85] text-[15px] font-light">
                    Kingdom Alliance is not intended to operate as a commercial matrimonial service or to profit from
                    bringing believers together.
                  </p>
                  <p className="text-[#7A6E68] leading-[1.85] text-[15px] font-light">
                    Its purpose is to provide a respectful and responsible platform through which Christian believers may
                    connect, communicate, and consider marriage.
                  </p>
                  <p className="text-[#4a3521] leading-[1.85] text-[15px] font-medium">
                    Every member is expected to use Kingdom Alliance with truthfulness, integrity, respect,
                    responsibility, and due regard for the dignity and safety of other users.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-11 px-6 border-t border-black/[0.04] relative z-10 mt-auto" style={{ background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)' }}>
        <div className="max-w-[960px] mx-auto flex flex-col items-center gap-5">
          <Link to="/" className="flex items-center gap-2.5 no-underline text-[#4a3521]">
            <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-9 h-9 object-contain" />
            <span className="font-extralight text-[14px]">{settings.siteName}</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 list-none">
            <li><Link to="/" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Home</Link></li>
            <li><Link to="/register" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Register</Link></li>
            <li><Link to="/login" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Login</Link></li>
            <li><Link to="/terms" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Terms</Link></li>
            <li><Link to="/contact" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Contact Us</Link></li>
          </nav>
          <p className="text-[11.5px] text-[#AEA49E]">&copy; {new Date().getFullYear()} {settings.siteName}. Built on Faith, Rooted in Love.</p>
        </div>
      </footer>
    </div>
  );
}
