import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Rocket,
  UserCheck,
  Image,
  Users,
  Megaphone,
  Church,
  Shield,
  BarChart3,
  HelpCircle,
  SearchX,
  BookOpen,
  Printer,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  items: FaqItem[];
}

const HELP_DATA: FaqCategory[] = [
  {
    title: 'Getting Started',
    icon: Rocket,
    color: '#3b82f6',
    bg: 'bg-blue-500/10',
    items: [
      {
        q: 'What is the Admin Portal?',
        a: `The Admin Portal is a secure dashboard for managing the Kingdom Alliance platform. It gives you full control over user approvals, photo moderation, user management, announcements, and platform analytics.\n\nAll admin actions are audited and tied to your admin account for accountability.`,
      },
      {
        q: 'How do I log in?',
        a: `1. Navigate to /admin/login\n2. Enter your admin email and password\n3. Complete the email OTP verification (first-time admins)\n4. Enter your 2FA code from your authenticator app\n\nNote: Admin sessions expire after 10 minutes of inactivity for security.`,
      },
      {
        q: 'What is MFA and how do I set it up?',
        a: `MFA (Multi-Factor Authentication) is a mandatory security layer for all admin accounts. It uses TOTP (Time-based One-Time Password) via an authenticator app like Google Authenticator or Authy.\n\nDuring your first login:\n1. You'll see a QR code on screen\n2. Scan it with your authenticator app\n3. Enter the 6-digit code displayed in the app\n4. Click "Verify & Complete Setup"\n\nAfter enrollment, you'll need to enter a 6-digit code from your app every time you log in.`,
      },
      {
        q: 'Understanding the Dashboard Overview',
        a: `The dashboard shows real-time platform metrics:\n\n• Total Users — Count of all approved profiles\n• Pending — Users waiting for admin approval\n• Active — Users active within the selected timeframe (7D/30D/All)\n• New — Users who registered within the timeframe\n• Interests Sent — Pending interest requests\n• Matches — Successful connections\n\nYou can switch between 7-day, 30-day, and "All" timeframes using the toggle in the hero banner.`,
      },
    ],
  },
  {
    title: 'User Approvals',
    icon: UserCheck,
    color: '#f59e0b',
    bg: 'bg-amber-500/10',
    items: [
      {
        q: 'How to review pending profiles?',
        a: `Go to Approvals (via the dashboard quick actions or directly at /admin/approvals).\n\nYou'll see a queue of users who completed onboarding and are awaiting review. Each card shows:\n• Profile photo and name\n• Gender, age, denomination, location\n• How long ago they applied\n\nClick "View" to see their full profile details before making a decision.`,
      },
      {
        q: 'What does Approve vs Reject do?',
        a: `Approve:\n• Sets the user's status to "approved"\n• They gain full platform access\n• They receive a "Profile Approved" notification\n• They appear in search results and matches\n\nReject:\n• Sets the user's status to "rejected"\n• They lose platform access\n• You must provide a rejection reason\n• They receive a notification with the reason\n• They can update their profile and reapply`,
      },
      {
        q: 'Can I see why a user was rejected?',
        a: `Yes. Go to Rejected Profiles (/admin/rejected) to see all rejected and suspended users. The rejection reason is stored with the user record.\n\nYou can also reinstate (reactivate) rejected users from this page if needed.`,
      },
      {
        q: 'How to reinstate a rejected user?',
        a: `Go to Rejected Profiles (/admin/rejected) and find the user.\n\n1. Click "Approve" or the reinstate button\n2. Confirm the reinstatement\n3. The user's status resets to active and approved\n4. They regain full platform access\n5. They receive a "Profile Approved" notification\n\nThis resets all approval-related flags in a single action.`,
      },
    ],
  },
  {
    title: 'Photo Moderation',
    icon: Image,
    color: '#8b5cf6',
    bg: 'bg-violet-500/10',
    items: [
      {
        q: 'How to moderate photos?',
        a: `Go to Photo Moderation (/admin/photos) to see the queue of pending photos.\n\nYou can filter by:\n• All Pending\n• Profile Photos only\n• Gallery Photos only\n\nEach card shows the full photo, the user's name (linked to their profile), and the photo type.`,
      },
      {
        q: 'What are the rejection reasons?',
        a: `When rejecting a photo, you must select a reason:\n\n• Inappropriate content\n• Face not clearly visible\n• Not a real photo of yourself\n• Low quality / blurry\n• Other (requires custom text)\n\nThe user receives the rejection reason and can upload a new photo.`,
      },
      {
        q: 'What happens after approving a photo?',
        a: `Once approved:\n• The photo becomes visible on the user's profile\n• The user receives a "Photo Approved" notification\n• The photo appears in search results and matches\n• The photo status updates to "approved" in the system`,
      },
      {
        q: 'Why do some photos appear twice?',
        a: `The system has a safety-net that checks both the photoModeration collection and the users collection for pending photos. If a photo somehow missed the moderation queue, it will still appear.\n\nDeduplication logic ensures the same photo doesn't appear twice — the system prefers the canonical moderation record when one exists.`,
      },
    ],
  },
  {
    title: 'User Management',
    icon: Users,
    color: '#3b82f6',
    bg: 'bg-blue-500/10',
    items: [
      {
        q: 'How to search for users?',
        a: `Go to User Management (/admin/users) and use the search bar at the top.\n\nYou can search by:\n• User name\n• Email address\n\nResults filter in real-time as you type.`,
      },
      {
        q: 'How to suspend a user?',
        a: `1. Find the user in User Management\n2. Click the suspend button (⏸) in the Actions column\n3. Confirm the suspension\n\nThe user immediately loses platform access and sees a "Suspended" page when they try to log in.\n\nYou can reactivate them at any time from the same interface.`,
      },
      {
        q: 'How to reactivate a suspended user?',
        a: `1. Filter by "Suspended" in User Management\n2. Find the user\n3. Click the reactivate button (▶)\n4. Confirm the reactivation\n\nTheir status returns to "active" and they regain full platform access.`,
      },
      {
        q: 'How to permanently delete a user?',
        a: `⚠️ This action is irreversible.\n\n1. Click the delete button (🗑) next to the user\n2. Review the cascading deletion warning\n3. Confirm deletion\n\nWhat gets deleted:\n• User profile and all personal data\n• All interests (sent and received)\n• All shortlists\n• All chat messages and conversations\n• All photo moderation records\n• Cloudinary hosted images\n\nThe user will need to create a new account if they want to return.`,
      },
      {
        q: 'Understanding user statuses',
        a: `Active — User has full platform access and can use all features.\n\nInactive — User hasn't logged in for over 40 days. They still have access but may need re-engagement.\n\nSuspended — Admin has suspended the user. They cannot access the platform. Can be reactivated.\n\nBlocked — User has been blocked by another user or by admin. More severe than suspended.\n\nPending — User completed onboarding but hasn't been approved yet. They see the Waiting Room page.`,
      },
      {
        q: 'What are the filter options?',
        a: `The User Management page offers these filters:\n\n• All — Every approved user\n• Active — Users active within the timeframe\n• Inactive — Users who haven't logged in for 40+ days\n• Suspended — Users with suspended status\n• Blocked — Users with blocked status\n• Active Today — Users active today\n• New This Week — Users who registered this week\n\nFilters can be combined with search. Filter states are saved in the URL, so you can bookmark or share filtered views.`,
      },
    ],
  },
  {
    title: 'Announcements',
    icon: Megaphone,
    color: '#10b981',
    bg: 'bg-emerald-500/10',
    items: [
      {
        q: 'How to send an announcement?',
        a: `1. Go to Announcements (/admin/announcements)\n2. Select your target audience:\n   • All Users\n   • Unverified Users\n   • Active Today\n3. Enter a subject line\n4. Write your message\n5. Click "Send Announcement Now"\n\nThe announcement is queued for delivery. A background process will handle sending to all targeted users.`,
      },
      {
        q: 'Who receives announcements?',
        a: `It depends on the target you select:\n\n• All Users — Every registered user on the platform\n• Unverified — Users who haven't completed email verification\n• Active Today — Users who were active today\n\nChoose your target carefully to avoid sending irrelevant messages to the wrong audience.`,
      },
      {
        q: 'What happens after sending?',
        a: `After clicking send:\n1. The announcement is saved to Firestore with status "queued"\n2. A background Cloud Function processes the queue\n3. Emails are dispatched to the targeted users\n4. You'll see a success confirmation\n\nTip: Avoid sending announcements too frequently. Follow the anti-spam best practices shown on the page.`,
      },
    ],
  },
  {
    title: 'Church Directory',
    icon: Church,
    color: '#C9A84C',
    bg: 'bg-[#C9A84C]/10',
    items: [
      {
        q: 'How to view the church directory?',
        a: `Go to Church Info (/admin/church-info) to see a searchable, paginated directory of all churches and pastors in the system.\n\nThe directory includes:\n• Church name\n• City and area\n• Pastor name and contact number\n• Number of members`,
      },
      {
        q: 'How to print the church directory?',
        a: `1. Go to Church Info (/admin/church-info)\n2. Click "Print / Save PDF" button\n3. A print-optimized view opens with Kingdom Alliance branding\n4. Use your browser's print dialog to save as PDF or print\n\nThe print layout includes:\n• Kingdom Alliance header with logo\n• Full directory table (not paginated)\n• Footer with generation date\n• A4-optimized formatting`,
      },
    ],
  },
  {
    title: 'Settings & Security',
    icon: Shield,
    color: '#ef4444',
    bg: 'bg-red-500/10',
    items: [
      {
        q: 'How to enable 2FA?',
        a: `Go to Settings (/admin/settings) and find the Two-Factor Authentication section.\n\n1. Click "Enable Authenticator 2FA"\n2. Scan the QR code with your authenticator app\n3. Enter the 6-digit code from the app\n4. Click "Verify & Complete Setup"\n\nYour 2FA status will show as "Active" with a green badge.`,
      },
      {
        q: 'How to add a new admin?',
        a: `1. Go to Settings (/admin/settings)\n2. Scroll to the Admin Accounts section\n3. Click "Add Admin"\n4. Enter the new admin's email address\n5. A temporary password will be generated\n6. Share the temp password securely with the new admin\n\nThe new admin must:\n1. Log in with the temp password\n2. Complete email OTP verification\n3. Set up 2FA (mandatory)\n4. Change their password`,
      },
      {
        q: 'How to delete an admin?',
        a: `1. Go to Settings (/admin/settings)\n2. Find the admin in the Admin Accounts list\n3. Click the delete button (🗑)\n4. Confirm the deletion\n\nNote: System admins (hardcoded accounts) cannot be deleted. The delete button is hidden for system admin accounts.`,
      },
      {
        q: 'What are System Admins?',
        a: `System admins are hardcoded administrator accounts that have special protections:\n\n• They cannot be deleted via the admin interface\n• They are synced across staging and production environments\n• They have permanent access to the platform\n\nCurrently, two system admin emails are protected:\n• themaster@thekingdomalliances.com\n• md.imranabid@gmail.com\n\nThese are the "super admin" accounts for the platform owner.`,
      },
    ],
  },
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    color: '#06b6d4',
    bg: 'bg-cyan-500/10',
    items: [
      {
        q: 'How to generate a report?',
        a: `From the Dashboard, click "Generate Report" in the sidebar (or the report button in the Operations panel).\n\nA comprehensive analytics modal opens with:\n• Summary cards (Total Users, Pending, Active Today, New This Week)\n• Engagement funnel visualization\n• Interest analytics with acceptance rate\n• Profile completeness metrics\n• Gender and denomination distributions\n• Age range and geographic data\n• Photo moderation stats\n• Recent registrations table`,
      },
      {
        q: "What's in the engagement funnel?",
        a: `The engagement funnel tracks the user journey:\n\nOnboarded → Approved → Sent Interest → Matched → Messaged\n\nThis shows how many users progress through each stage. A large drop-off at any stage indicates where users are disengaging and where improvements may be needed.`,
      },
      {
        q: 'How to print a report?',
        a: `1. Open the Report modal from the dashboard\n2. Wait for all data to load\n3. Click the "Print" button in the top-right corner\n4. A new window opens with a print-optimized A4 layout\n5. Use your browser's print dialog to print or save as PDF\n\nThe printed report includes Kingdom Alliance branding, all charts, tables, and a confidential watermark.`,
      },
    ],
  },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-[#1a2e4a]/8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <h3 className="text-[13px] font-semibold text-[#0f172a] leading-relaxed">{item.q}</h3>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180 text-white' : 'text-[#64748b]'}`} />
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
            <div className="px-5 pb-5">
              <div className="text-[13px] leading-[1.8] text-[#64748b] font-light whitespace-pre-line">
                {item.a}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminHelpCenter() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return HELP_DATA;

    const lower = search.toLowerCase();
    return HELP_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(lower) ||
          item.a.toLowerCase().includes(lower)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  const activeCategory = selectedCategory
    ? HELP_DATA.find((c) => c.title === selectedCategory)
    : null;

  const displayedItems = useMemo(() => {
    if (!search.trim()) {
      return activeCategory
        ? [{ ...activeCategory }]
        : [];
    }
    return filteredCategories;
  }, [search, activeCategory, filteredCategories]);

  const totalQuestions = HELP_DATA.reduce((sum, cat) => sum + cat.items.length, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Page Header */}
      <div className="flex items-start gap-3 print:hidden">
        <button
          onClick={() => navigate('/admin')}
          className="mt-1 p-2 hover:bg-[#1a2e4a]/5 rounded-full transition-colors text-[#64748b]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-tight">Help Center</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Guides and documentation for managing the Kingdom Alliance platform
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="mt-1 p-2 hover:bg-[#1a2e4a]/5 rounded-full transition-colors text-[#64748b]"
          title="Print this page"
        >
          <Printer className="w-5 h-5" />
        </button>
      </div>

      {/* Print Header (only visible when printing) */}
      <div className="hidden print:block mb-6">
        <div className="flex items-center gap-3 border-b border-[#e0e0e0] pb-4">
          <HelpCircle className="w-6 h-6 text-[#0f172a]" />
          <div>
            <h1 className="text-xl font-bold text-[#0f172a]">Kingdom Alliance — Admin Help Center</h1>
            <p className="text-xs text-[#64748b]">Comprehensive guide for platform administrators</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-[#1a2e4a]/8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex items-center gap-3 print:hidden">
        <Search className="w-5 h-5 text-[#94a3b8] flex-shrink-0" />
        <input
          type="text"
          placeholder="Search help topics..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value) setSelectedCategory(null);
          }}
          className="flex-1 border-none outline-none text-sm text-[#0f172a] placeholder:text-[#94a3b8]"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory(null);
            }}
            className="text-xs text-[#64748b] hover:text-[#0f172a] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats Ribbon */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2e4a]/5 rounded-full">
          <BookOpen className="w-3.5 h-3.5 text-[#1a2e4a]" />
          <span className="text-xs font-semibold text-[#1a2e4a]">{HELP_DATA.length} Categories</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2e4a]/5 rounded-full">
          <HelpCircle className="w-3.5 h-3.5 text-[#1a2e4a]" />
          <span className="text-xs font-semibold text-[#1a2e4a]">{totalQuestions} Topics</span>
        </div>
      </div>

      {/* Search Results Info */}
      {search && (
        <div className="text-sm text-[#64748b] print:hidden">
          {filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0)} results for "{search}"
        </div>
      )}

      {/* Category Cards Grid (when no search and no category selected) */}
      {!search && !selectedCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {HELP_DATA.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.title}
                onClick={() => setSelectedCategory(cat.title)}
                whileHover={{ y: -2 }}
                className="admin-card-hover text-left p-5 group"
              >
                <div className={`p-2.5 ${cat.bg} rounded-xl w-fit mb-3`}>
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <h3 className="text-sm font-semibold text-[#0f172a] group-hover:text-[#1a2e4a] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#94a3b8] mt-1">
                  {cat.items.length} {cat.items.length === 1 ? 'topic' : 'topics'}
                </p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Category Detail View (when a category is selected and no search) */}
      {activeCategory && !search && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-sm font-medium text-[#64748b] hover:text-[#0f172a] transition-colors print:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all categories
          </button>

          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${activeCategory.bg} rounded-xl`}>
              <activeCategory.icon className="w-5 h-5" style={{ color: activeCategory.color }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0f172a]">{activeCategory.title}</h2>
              <p className="text-xs text-[#94a3b8]">
                {activeCategory.items.length} {activeCategory.items.length === 1 ? 'topic' : 'topics'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeCategory.items.map((item) => (
              <FaqAccordionItem key={item.q} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Search Results (showing all matching items grouped by category) */}
      {search && filteredCategories.length > 0 && (
        <div className="space-y-6">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.title} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 ${cat.bg} rounded-lg`}>
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#0f172a]">{cat.title}</h3>
                  <span className="text-xs text-[#94a3b8]">({cat.items.length})</span>
                </div>
                <div className="space-y-3 ml-9">
                  {cat.items.map((item) => (
                    <FaqAccordionItem key={item.q} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {search && filteredCategories.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#f1f5f9]">
            <SearchX className="w-7 h-7 text-[#94a3b8]" />
          </div>
          <h3 className="text-base font-semibold text-[#0f172a] mb-1">No results found</h3>
          <p className="text-sm text-[#64748b]">
            Try a different search term or browse categories above.
          </p>
        </div>
      )}

      {/* Print-only: All content */}
      <div className="hidden print:block">
        {HELP_DATA.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.title} className="mb-8" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e0e0e0]">
                <Icon className="w-4 h-4" style={{ color: cat.color }} />
                <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">{cat.title}</h2>
              </div>
              {cat.items.map((item) => (
                <div key={item.q} className="mb-4">
                  <h3 className="text-[13px] font-semibold text-[#0f172a] mb-1">{item.q}</h3>
                  <p className="text-[12px] leading-relaxed text-[#64748b] whitespace-pre-line">{item.a}</p>
                </div>
              ))}
            </div>
          );
        })}
        <div className="text-center pt-6 border-t border-[#e0e0e0] text-[10px] text-[#94a3b8]">
          Kingdom Alliance — Admin Help Center | Generated {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
