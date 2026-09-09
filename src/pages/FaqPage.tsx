import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../lib/SettingsContext';
import PublicNavbar from '../components/PublicNavbar';

const FAQ_DATA = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'How do I create an account?',
        a: `You can sign up in two ways:\n\n1. Google Sign-Up — Click "Sign up with Google" and select your Google account. Quick and easy.\n\n2. Email Sign-Up — Enter your email and create a password. You'll receive a 6-digit verification code in your email.\n\nBoth methods require you to complete the Cloudflare verification (checkbox) before proceeding.`,
      },
      {
        q: 'What happens after I sign up?',
        a: `1. Verify your email — Enter the 6-digit code sent to your inbox (email sign-up only).\n\n2. Complete your profile — Fill in your details: name, age, height, church, lifestyle, preferences, and upload a photo.\n\n3. Wait for admin review — Our team reviews your profile and photo. This usually takes within 24 hours.\n\n4. Start connecting — Once approved, you can browse matches, send interests, and chat.`,
      },
      {
        q: 'Why was I redirected to the Waiting Room?',
        a: `After completing your profile, you'll see a "Waiting Room" page while our team reviews your application. This is normal! You'll receive an email as soon as your profile is approved.\n\nPlease be patient — we personally review every profile to maintain a safe, faith-centered community.`,
      },
    ],
  },
  {
    section: 'Profile & Photos',
    items: [
      {
        q: 'How does photo moderation work?',
        a: `Every photo uploaded to Kingdom Alliance is reviewed by our moderation team to ensure it meets our community guidelines.\n\n• Approved — Your photo is now visible to other members.\n• Pending — Your photo is under review. It's not visible to others yet.\n• Rejected — Your photo doesn't meet our guidelines. You'll receive an email with the reason and can upload a new one.\n\nWe'll send you an email notification for every photo status change so you're always updated.`,
      },
      {
        q: 'What are the photo guidelines?',
        a: `• Photo must clearly show your face\n• No group photos as your main profile picture\n• No sunglasses or face-covering accessories\n• No inappropriate or suggestive content\n• No screenshots or low-quality images\n• Recent photos preferred (within last 2 years)`,
      },
      {
        q: 'Can I see other users\' photos before connecting?',
        a: `Photos are blurred until your connection is accepted. This protects everyone's privacy. Once you send an interest and they accept, both of your photos become visible to each other.\n\nYou control who sees your photos. In Privacy Settings, you can change your photo visibility to "Accepted Connections Only."`,
      },
    ],
  },
  {
    section: 'Connections & Messaging',
    items: [
      {
        q: 'Is there a limit to how many interests I can send?',
        a: `Yes, you can send up to 5 interests per day (within a 24-hour window). This helps maintain quality connections and prevents spam.\n\n• If you've reached the limit, you'll see a notification with the reset time\n• The limit resets 24 hours after your first interest of the day\n• Declining or blocking does not count toward your limit\n• Only sent interests count — receiving interests has no limit\n\nTip: Be selective! Choose profiles that truly match your preferences to make the most of your daily limit.`,
      },
      {
        q: 'How do I send an interest?',
        a: `Browse your matches and click the "Send Interest" button on any profile you like. They'll receive a notification (push notification and/or email) letting them know you're interested.\n\nOnce they accept, you'll both be connected and can start chatting!`,
      },
      {
        q: 'What happens when someone sends me an interest?',
        a: `You'll receive a push notification on your device and/or an email notification (if you're offline). You can view all received interests in the Interests tab.\n\nFrom there, you can:\n• Accept — You'll be connected and can start messaging\n• Decline — They won't know you declined, and they can't send another interest`,
      },
      {
        q: 'How does messaging work?',
        a: `Once a connection is accepted, you can message each other in real-time. Your chat history is preserved and secure.\n\n• Messages are sent and received instantly\n• You'll see when the other person is typing\n• Online status shows if they're currently active\n• If you're offline, you'll receive an email notification for new messages`,
      },
      {
        q: 'Will I be notified by email?',
        a: `Yes! Here's when you'll receive email notifications:\n\n• Email verification — 6-digit code during registration\n• Profile approved — When your profile goes live\n• Profile rejected — With reason and next steps\n• Photo approved — Your photo is now visible\n• Photo rejected — With reason, you can upload a new one\n• New message — When someone messages you (only if you're offline)\n• New interest — When someone sends you an interest\n• Interest accepted — When someone accepts your interest\n\nYou won't receive duplicate emails. If you're online, push notifications are used instead of email.`,
      },
    ],
  },
  {
    section: 'Privacy & Safety',
    items: [
      {
        q: 'How do I decline someone?',
        a: `When you receive an interest, go to the Interests tab and click "Decline."\n\n• The other person will not be notified that you declined\n• They cannot send you another interest\n• Your profile remains hidden from them\n\nDeclining is completely private — no one knows except you.`,
      },
      {
        q: 'How do I block someone?',
        a: `You can block someone from their profile or from your chat conversation:\n\n1. Go to their profile or open your chat with them\n2. Click the ⋮ menu (three dots) in the top right\n3. Select "Block User"\n\nAfter blocking:\n• They cannot see your profile\n• They cannot send you messages\n• Your chat history is preserved (visible to you only)\n• They won't be notified that you blocked them`,
      },
      {
        q: 'How do I unblock someone?',
        a: `Go to Settings → Privacy and find the Blocked Users section. Click "Unblock" next to their name to restore the connection.\n\nUnblocking restores your connection. You can then message each other again.`,
      },
      {
        q: 'What happens when I block someone I was chatting with?',
        a: `The chat will show a message: "You can no longer chat with this person." The message input will be disabled.\n\nIf you unblock them later, the chat will be restored and you can continue messaging.`,
      },
    ],
  },
  {
    section: 'Account & Settings',
    items: [
      {
        q: 'How do I change my password?',
        a: `Click "Forgot password?" on the login page. You'll receive a verification code to reset your password.`,
      },
      {
        q: 'What does "Keep me signed in" do?',
        a: `When checked, you'll stay logged in even after closing your browser. If unchecked, you'll be logged out when you close the browser.`,
      },
      {
        q: 'How do I delete my account?',
        a: `Go to Settings → Account and click "Delete Account." This action is permanent and cannot be undone. All your data, photos, and connections will be removed.\n\nIf you're unsure, consider contacting support first.`,
      },
    ],
  },
  {
    section: 'Troubleshooting',
    items: [
      {
        q: "I didn't receive the verification code. What should I do?",
        a: `• Check your spam/junk folder\n• Make sure you entered the correct email address\n• Wait a few minutes — email delivery can sometimes be delayed\n• Click "Resend OTP" after the timer expires (120 seconds)`,
      },
      {
        q: "I'm getting \"Too many attempts\" error. What should I do?",
        a: `This means you've made too many login attempts. Please wait a few minutes and try again. This is a security measure to protect your account.`,
      },
      {
        q: "The Cloudflare check isn't working. What should I do?",
        a: `• Make sure you're using a supported browser (Chrome, Firefox, Safari, Edge)\n• Disable any ad blockers or VPN that might block the verification\n• Try refreshing the page and completing the check again\n• Clear your browser cache and cookies`,
      },
    ],
  },
];

function FaqItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#eee7d8] shadow-[0_2px_12px_rgba(74,53,33,0.06)] overflow-hidden transition-shadow hover:shadow-[0_8px_24px_rgba(74,53,33,0.1)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <h3 className="font-medium text-[15px] text-[#4a3521] leading-relaxed">{item.q}</h3>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? 'bg-[#C9A84C]' : 'bg-[#faf4ea]'}`}>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180 text-white' : 'text-[#b8860b]'}`} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6">
              <div className="text-[14px] leading-[1.8] text-[#6b5e4f] font-light whitespace-pre-line">
                {item.a}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const { settings } = useSettings();
  const [search, setSearch] = useState('');

  const filtered = FAQ_DATA.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf4ea] via-[#f6ecdd] to-[#f0e2cc]" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <PublicNavbar />

      {/* Header */}
      <div className="pt-24 pb-20 px-4 relative overflow-hidden">
        <div className="absolute right-[10%] top-1/2 -translate-y-1/2 font-headline text-[200px] opacity-[0.06] text-[#4a3521] leading-none select-none pointer-events-none">✝</div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="font-headline text-4xl md:text-5xl text-[#4a3521] mb-4">Help Center</h1>
          <p className="text-[#8a7a65] text-[15px] max-w-md mx-auto">
            Everything you need to know about finding your God-centered match
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_-25px_rgba(74,53,33,0.2)] p-5 mb-10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#a89f8d] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search your question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-none outline-none text-[15px] font-light text-[#4a3521] placeholder:text-[#c4bba8]"
          />
        </div>

        {/* Sections */}
        {filtered.map((section) => (
          <div key={section.section} className="mb-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[2px] text-[#b8860b] mb-4 px-1">
              {section.section}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <FaqItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#a89f8d] text-[15px]">No results found. Try a different search term.</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="text-center mt-12 pt-10 border-t border-[#e8e2d5]">
          <p className="text-[14px] text-[#8a7a65]">
            Still have questions?{' '}
            <Link to="/contact" className="font-semibold text-[#b8860b] hover:underline">
              Contact us
            </Link>{' '}
            — we're happy to help.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-11 px-6 border-t border-black/[0.04] relative z-10 mt-auto" style={{ background: 'linear-gradient(135deg, #faf4ea 0%, #f6ecdd 50%, #f0e2cc 100%)' }}>
        <div className="max-w-[960px] mx-auto flex flex-col items-center gap-5">
          <Link to="/" className="flex items-center gap-2.5 no-underline text-[#4a3521]">
            <img src="/images/logo2.png" alt="Kingdom Alliance" className="w-9 h-9 object-contain" />
            <span className="font-extralight text-[14px]">{settings.siteName}</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 list-none">
            <li><Link to="/" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Home</Link></li>
            <li><Link to="/about" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">About</Link></li>
            <li><Link to="/faq" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">FAQ</Link></li>
            <li><Link to="/terms" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Terms</Link></li>
            <li><Link to="/contact" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Contact</Link></li>
            <li><Link to="/login" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Sign In</Link></li>
            <li><Link to="/register" className="text-[15px] text-[#7A6E68] no-underline hover:text-[#C4856A] transition-colors">Register</Link></li>
          </nav>
          <p className="text-[11.5px] text-[#AEA49E]">&copy; {new Date().getFullYear()} {settings.siteName}. Built on Faith, Rooted in Love.</p>
        </div>
      </footer>
    </div>
  );
}
