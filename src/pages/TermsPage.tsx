import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../lib/SettingsContext';
import { KingdomCrossIcon } from '../components/KingdomCrossIcon';
import PublicNavbar from '../components/PublicNavbar';
import { motion } from 'motion/react';

export default function TermsPage() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden text-slate-800"
      style={{
        background: 'linear-gradient(135deg, #f1f8f3 0%, #e3f2e6 40%, #c8e6c9 70%, #f1f8f3 100%)'
      }}
    >
      
      {/* Exact Header from LandingPage.tsx */}
      <PublicNavbar />

      {/* Ambient background orbs from LoginPage.tsx */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-45"
          style={{ background: 'radial-gradient(circle, #c8e6c9 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl opacity-35"
          style={{ background: 'radial-gradient(circle, #d4af3720 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #e8f5e9 0%, transparent 70%)' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
      </div>

      {/* Decorative SVG Roses & Leaves - Top Left */}
      <svg className="absolute -top-10 -left-10 w-48 h-48 md:w-80 md:h-80 opacity-30 pointer-events-none select-none z-0" viewBox="0 0 100 100" fill="none">
        <path d="M30 20C20 30 15 50 35 70C55 50 45 35 30 20Z" fill="url(#rose-mint)" opacity="0.85"/>
        <path d="M15 45C5 55 10 70 25 75C40 65 30 50 15 45Z" fill="url(#rose-green)" opacity="0.75"/>
        <path d="M50 15C60 25 55 40 40 45C35 30 40 20 50 15Z" fill="url(#leaf-dark-green)" opacity="0.5"/>
        <path d="M25 60C35 75 55 70 65 85" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>

      {/* Decorative SVG Roses & Leaves - Bottom Right */}
      <svg className="absolute bottom-10 -right-10 w-48 h-48 md:w-80 md:h-80 opacity-30 pointer-events-none select-none z-0" viewBox="0 0 100 100" fill="none">
        <path d="M70 80C80 70 85 50 65 30C45 50 55 65 70 80Z" fill="url(#rose-mint)" opacity="0.85"/>
        <path d="M85 55C95 45 90 30 75 25C60 35 70 50 85 55Z" fill="url(#rose-green)" opacity="0.75"/>
        <path d="M50 85C40 75 45 60 60 55C65 70 60 80 50 85Z" fill="url(#leaf-dark-green)" opacity="0.5"/>
        <path d="M75 40C65 25 45 30 35 15" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
          <radialGradient id="rose-mint" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f1f8f3" />
            <stop offset="50%" stopColor="#a5d6a7" />
            <stop offset="100%" stopColor="#81c784" />
          </radialGradient>
          <radialGradient id="rose-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a5d6a7" />
            <stop offset="100%" stopColor="#4caf50" />
          </radialGradient>
          <linearGradient id="leaf-dark-green" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8e6c9" />
            <stop offset="100%" stopColor="#2e7d32" />
          </linearGradient>
        </defs>
      </svg>

      <main className="flex-1 relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-4xl rounded-[2.5rem] overflow-hidden p-8 sm:p-12"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.80)',
            boxShadow: '0 32px 64px -12px rgba(26,46,74,0.12), inset 0 1px 0 rgba(255,255,255,0.90), inset 0 -1px 0 rgba(0,0,0,0.04)'
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, transparent 50%, rgba(0,0,0,0.02) 100%)'
            }} />

          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#b8860b] mb-8 tracking-tight">
              TERMS AND CONDITIONS OF USE FOR KINGDOM ALLIANCE WEBSITE
            </h1>
            
            <div className="text-slate-800 leading-relaxed space-y-8 text-sm sm:text-base font-light">
            <p><strong>Effective Date:</strong> 26/05/2026</p>
            
            <p>
              Welcome to Kingdom Alliance (the "Site"), owned and operated by Kingdom Alliance ("we," "us," or "our"). 
              By accessing, browsing, or using the Site and our services (the "Service"), you agree to be bound by these 
              Terms and Conditions ("Terms" or "Agreement"). If you do not agree to all of these Terms, please do not use the Site.
            </p>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">1. ABOUT US AND THE SERVICE</h2>
              <p className="mb-3"><strong>1.1. Platform Purpose:</strong> Kingdom Alliance is an online matchmaking platform designed specifically for Christian singles looking for life partners within the Christian faith. The Service is provided with the bonafide intention of facilitating marriage.</p>
              <p className="mb-3"><strong>1.2. Role of Facilitator:</strong> You understand and agree that we act solely as a facilitator to help members discover and connect with each other. We are not a dating service for casual relationships. We do not provide any guarantees, explicit or implicit, regarding:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The number of matches you will receive.</li>
                <li>The compatibility of any suggested matches.</li>
                <li>The likelihood of a marriage or successful relationship.</li>
                <li>The truthfulness or accuracy of information provided by other members.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">2. ELIGIBILITY AND REGISTRATION</h2>
              <p className="mb-3"><strong>2.1. Minimum Age:</strong> You must be at least 18 years old to register as a member.</p>
              <p className="mb-3"><strong>2.2. Faith Basis:</strong> Membership is strictly for practicing Christians who align with the statement of faith or denomination requirements of the Site. By registering, you warrant that you meet this criterion.</p>
              <p className="mb-3"><strong>2.3. Marital Status:</strong> You must be legally single and free to marry. This includes:</p>
              <ul className="list-disc pl-6 space-y-2 mb-3">
                <li>Never married.</li>
                <li>Widowed.</li>
                <li>Legally divorced. (Members in the process of a divorce must declare themselves as "Awaiting Divorce").</li>
              </ul>
              <p className="mb-3"><strong>2.4. Truthfulness:</strong> You agree to provide true, accurate, and current information during registration and to maintain and promptly update your profile. Providing false, misleading, or fraudulent information is a material breach of these Terms.</p>
              <p><strong>2.5. Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and are fully responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">3. USER CONDUCT AND PROHIBITED ACTIVITIES</h2>
              <p className="mb-4">To maintain a respectful and safe community in line with Christian values, you agree to the following code of conduct.</p>
              <p className="mb-3"><strong>3.1. You Will Not:</strong></p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Misrepresent yourself: Creating profiles for others, using fake photos, or providing false details about your age, education, profession, or marital status is prohibited.</li>
                <li>Post harmful content: Including but not limited to material that is abusive, defamatory, obscene, indecent, menacing, racially offensive, threatening, unlawful, or promotes illegal activity.</li>
                <li>Solicit other members for money, goods, or services.</li>
                <li>Engage in commercial activities: Including advertising competing services, multi-level marketing schemes, or spamming.</li>
                <li>Upload viruses or other malicious code.</li>
                <li>Harass other members: Repeated undesired contact, sending offensive messages, or other stalker-like behavior.</li>
                <li>Post "Synthetically Generated Information (SGI)" as your content without full and explicit disclosure, as per our policy.</li>
              </ul>
              <p><strong>3.2. Christian Values:</strong> You agree to use the Service in a manner that aligns with Christian principles of truth, respect, charity, and purity. This platform may not be used to promote illicit sexual relations or extramarital affairs.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">4. CONTENT OWNERSHIP AND LICENSING</h2>
              <p className="mb-3"><strong>4.1. Your Content:</strong> You retain ownership of all information and photos you post to your profile ("Your Content"). However, by posting Your Content, you grant us a perpetual, irrevocable, worldwide, non-exclusive, royalty-free license to use, copy, display, distribute, and modify Your Content for the sole purpose of operating, improving, and promoting the Service.</p>
              <p><strong>4.2. Our Right to Review:</strong> We reserve the right, but have no obligation, to review, monitor, remove, or edit Your Content at our sole discretion, particularly if we believe it violates these Terms or Christian community standards.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">5. PRIVACY</h2>
              <p>Your privacy is paramount. Use of the Site is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please read it carefully to understand how we collect, use, and share your personal data.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">6. DISCLAIMER OF WARRANTIES</h2>
              <p className="uppercase mb-3">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
              <p className="uppercase">WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT OTHER MEMBERS' PROFILES OR INFORMATION ARE ACCURATE.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">7. LIMITATION OF LIABILITY</h2>
              <p className="uppercase mb-3">TO THE MAXIMUM EXTENT PERMITTED BY LAW, KINGDOM ALLIANCE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM:</p>
              <ul className="list-disc pl-6 space-y-2 mb-3 uppercase">
                <li>YOUR USE OF THE SERVICE.</li>
                <li>THE CONDUCT OF OTHER USERS.</li>
                <li>ANY INTERACTIONS, DISPUTES, OR TRANSACTIONS BETWEEN YOU AND OTHER USERS.</li>
                <li>EMOTIONAL DISTRESS, LOSS, OR INJURY RESULTING FROM ANY RELATIONSHIP FORMED THROUGH THE SERVICE.</li>
              </ul>
              <p className="uppercase">OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM THESE TERMS OR THE SERVICE IS LIMITED TO THE AMOUNT PAID BY YOU, IF ANY, FOR THE SERVICE.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">8. INDEMNIFICATION</h2>
              <p className="mb-3">You agree to indemnify and hold harmless Kingdom Alliance website and its officers, directors, employees, and agents from any and all claims, demands, losses, liabilities, and expenses (including attorneys' fees) arising out of or in connection with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your Content.</li>
                <li>Your use of the Service.</li>
                <li>Your violation of these Terms.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">9. TERMINATION</h2>
              <p>We reserve the right to terminate or suspend your account, remove your profile, or deny you access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms, is harmful to other users, or is detrimental to the Site's mission. Duplicate profiles may be suspended without notice.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">10. GOVERNING LAW</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia, without regard to its conflict of law principles.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">11. DISPUTE RESOLUTION</h2>
              <p>Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall be resolved through good-faith mediation.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">12. CHANGES TO TERMS</h2>
              <p>We reserve the right to update or modify these Terms at any time. We will notify you of any material changes by posting the new Terms on the Site. Your continued use of the Site after any such changes constitutes your acceptance of the new Terms.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#d4af37] mb-4">13. CONTACT INFORMATION</h2>
              <p>If you have any questions about these Terms, please contact us via our Contact Us page.</p>
            </div>

            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer from LandingPage */}
      <footer className="bg-surface-container-highest py-20 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-outline-variant/30 pb-16 mb-12">
            <Link to="/" className="flex items-center gap-3">
              <KingdomCrossIcon size="md" />
              <span className="font-headline text-3xl text-on-surface font-bold tracking-tight">{settings.siteName}</span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-x-10 gap-y-6 text-lg font-light">
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-on-surface-variant hover:text-primary transition-colors">Home</Link>
              <Link to="/register" className="text-on-surface-variant hover:text-primary transition-colors">Register</Link>
              <Link to="/login" className="text-on-surface-variant hover:text-primary transition-colors">Login</Link>
              <Link to="/terms" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-on-surface-variant hover:text-primary transition-colors">Terms</Link>
              <Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-on-surface-variant hover:text-primary transition-colors">Contact Us</Link>
            </nav>
          </div>
          <div className="text-center text-on-surface-variant text-base font-light">
            &copy; {new Date().getFullYear()} {settings.siteName}. Built on Faith, Rooted in Love.
          </div>
        </div>
      </footer>
    </div>
  );
}
