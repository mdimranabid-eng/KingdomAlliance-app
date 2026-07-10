# Kingdom Alliance Web Application Blueprint

## 1. Project Overview
* **App Name:** Kingdom Alliance
* **Purpose:** A premium, faith-led Christian matrimonial and matchmaking platform designed to foster meaningful, Christ-centered relationships.
* **Target Audience:** Single Christians seeking serious relationships, marriage, and shared spiritual values.

---

## 2. Tech Stack
* **Frontend:** React 19, TypeScript, Vite 6
* **Styling & Animation:** Tailwind CSS v4, Motion (Framer Motion), Lucide React
* **Backend:** Firebase Backend-as-a-Service (BaaS), Firebase Cloud Functions (Node.js 20)
* **Database:** Firebase Cloud Firestore
* **Hosting:** Firebase Hosting (for SPA)
* **Authentication:** Firebase Authentication (Email/Password, Google OAuth)
* **Third-Party Integrations:** Cloudinary (Image hosting/optimization), Nodemailer (SMTP email dispatch), Google ReCAPTCHA v3 (Bot protection), Google GenAI, Dicebear (Avatars).

---

## 3. Architecture
The application employs a highly decoupled **Client-Serverless Architecture**:
* **Client:** The React frontend directly securely interacts with Firebase Auth, Firestore, and Storage using client SDKs, constrained by rigorous Firestore Security Rules.
* **Serverless Backend:** Dedicated Firebase Cloud Functions handle scheduled CRON jobs (e.g., 4-hour pending approval alerts) and sensitive operations that shouldn't be exposed to the client.

**Directory Structure:**
* `src/pages/` - Core application route views (public, user, admin, and status gates).
* `src/components/` - Reusable UI elements, moduls, and layout wrappers.
* `src/services/` - External service API wrappers (e.g., `authService.ts`).
* `src/lib/` - Context providers (`AuthContext`, `SettingsContext`), Firebase initialization, and utility helpers.
* `functions/src/` - Node.js Cloud Functions source code.
* `firebase.json` & `*.rules` - Deployment configuration and security definitions.

---

## 4. Pages & Routing
* **Public / Authentication Routes:**
  * `/` - `LandingPage.tsx` (Public marketing and hero site)
  * `/login` - `LoginPage.tsx` (Authentication entry point)
  * `/register` - `RegisterPage.tsx` (Sign up)
  * `/onboarding` - `OnboardingPage.tsx` (Profile creation and intake form)
* **Protected User Routes:**
  * `/dashboard` - `DashboardPage.tsx` (Filtered match discovery feed)
  * `/interests` - `InterestsPage.tsx` (Sent, received, and accepted connections)
  * `/matches` - `MatchesPage.tsx` (Direct search and 90-point matches)
  * `/messages` - `MessagesPage.tsx` (Real-time chat interface)
  * `/profile` - `ProfilePage.tsx` (Current user profile editing & viewing)
  * `/shortlists` - `ShortlistsPage.tsx` (Saved profiles for later review)
* **Status / Gating Routes:**
  * `/banned`, `/waiting-room`, `/rejected`, `/suspended` - Account status lockouts.
* **Admin Routes:**
  * `/admin/dashboard`, `/admin/approvals`, `/admin/photos`, `/admin/users`, `/admin/settings` - Restricted to verified administrators.

---

## 5. Components
* **`Layout.tsx` & `AuthGuard.tsx`:** The core architectural wrappers. They manage role-based routing, listen for authentication context changes, and prevent standard users from hitting admin routes (and vice versa).
* **`OnlineIndicator.tsx`:** Tracks and displays user presence in real-time.
* **`NotificationListener.tsx`:** Sweeps background events and displays UI toasts.
* **Admin Modals:** `AdminReportModal.tsx` and `AdminUserDetailModal.tsx` allow admins to review flagged content directly over the dashboard UI without context switching.

---

## 6. Features & Functionality
* **Match Engine:** A complex 90-point scoring algorithm matching users on Values (40pts), Location (30pts), and Interests (20pts), backed by strict gender and age filters.
* **Communication System:** Users can send, accept, decline, and withdraw interests. Real-time chat (`MessagesPage.tsx`) operates on a fail-closed model—only mutually accepted connections can message. Blocking a user instantly severs the chat thread.
* **Profile ID Engine:** Unique 6-character profile IDs (`generateUniqueProfileId`) are assigned to users, enabling direct privacy-shielded searches.
* **Online Presence:** Employs an IntersectionObserver and keep-alive ping (every 4 minutes) to flag a 5-minute "Online" presence window.
* **Automated Moderation Alerts:** A Cloud Function wakes up every 4 hours to sweep the database for pending approvals/photos and sends an HTML alert to the admin team via SMTP.
* **Privacy Controls:** Declined or unapproved connections will see blurred gallery images and generic profile names ("Profile Unavailable").

---

## 7. Database Schema (Firestore)
* **`users`:** Owner-writable. Stores core data (`uid`, `email`, `role`, `approvalStatus`), physical traits, faith details, partner preferences, and `lastActive` timestamps.
* **`interests`:** `fromId`, `toId`, `status`, `declinedBy`, `createdAt`.
* **`messages` / `chats`:** `senderId`, `receiverId`, `text`, `read`, `createdAt`.
* **`shortlists`:** `userId`, `targetId`, `createdAt` (Owner only).
* **`notifications`:** `type`, `fromId`, `toId`, `read`, `createdAt`.
* **`admins`:** `email`, `role`, `createdAt`.
* **`photoModeration`:** `userId`, `photoUrl`, `status`, `submittedAt`.
* **`admin-alerts`:** Execution logs generated by the Cloud Function.

---

## 8. Authentication & Authorization
* **Methods:** Firebase Authentication via Email/Password and Google OAuth. Protected against bot attacks via Google ReCAPTCHA v3.
* **Role-Based Access Control (RBAC):** 
  * The frontend `AuthContext` queries the `admins` Firestore collection. If a match is found, the global `isAdmin` boolean unlocks the `/admin` UI.
  * Standard users are funneled through `enforceGatekeeperRouting()` upon login, which checks the `approvalStatus` to determine if they belong in the waiting room, dashboard, or banned page.

---

## 9. APIs & Integrations
* **Firebase SDK:** Direct internal BaaS integration for Auth, Database, and Storage.
* **Google Secret Manager:** Securely injects `SMTP_USER` and `SMTP_PASS` into the Cloud Functions at runtime.
* **Cloudinary API:** Utilized on the frontend for heavy-lifting image compression, transforming uploads before they hit the database.
* **Nodemailer:** Connects to standard SMTP servers to push styled HTML admin alerts.

---

## 10. State Management
* **React Context API:** Global state is managed primarily via `AuthContext.tsx` and `SettingsContext.tsx`.
* **Real-time Subscriptions:** The app heavily utilizes Firestore's `onSnapshot` listeners to push state updates instantly into the UI (used in chat rooms, online indicators, and admin queues).

---

## 11. Styling & UI Design
* **Aesthetics:** The UI utilizes high-end "macOS liquid glass" aesthetics. Extensive use of `backdrop-blur`, frosted glass cards (`rgba(255,255,255,0.70)`), and ambient radial gradients.
* **Design System:** Tailwind CSS v4 provides utility-first tokens, while Framer Motion handles dynamic micro-animations (hover states, modal scaling, route transitions).

---

## 12. Environment Variables & Configuration
* **Frontend (`.env`):** Contains `VITE_FIREBASE_*` (public project keys), `VITE_CLOUDINARY_*` (upload presets), and Google GenAI variables.
* **Backend:** Firebase Cloud Functions dynamically pull `SMTP_USER`, `SMTP_PASS`, and `ADMIN_EMAIL_FALLBACK` from Google Secret Manager. `functions/.gitignore` prevents local `.env` leaks.

---

## 13. Deployment & Hosting
* **Pipeline:** Built using Vite (`npm run build`).
* **Hosting:** Static assets and the SPA bundle are deployed to Firebase Hosting (`firebase deploy --only hosting`), governed by the `firebase.json` rewrite rules to `index.html`.
* **Cloud Functions:** Deployed independently via `firebase deploy --only functions`.

---

## 14. Known Issues & TODOs
* **Match Caching:** Daily match caching inside `DashboardPage.tsx` should eventually be migrated to a Cloud Function to prevent payload desynchronization across multiple devices.
* **Code Splitting:** The Vite bundler currently warns of chunks exceeding 500kB. Dynamic `import()` splitting should be applied heavily in `AuthContext.tsx` to optimize LCP.
* **Cleanup:** Stale `console.log` and trace outputs in `OnboardingPage.tsx` and `AdminPhotos.tsx` should be scrubbed before full production scaling.

---

## 15. Security Considerations
* **Firestore Security Rules (`firestore.rules`):** Global deny-by-default is enforced. Granular rules guarantee users can only write to their own documents, and chat records can only be read by the sender/receiver.
* **Backend Isolation:** Sensitive SMTP alert operations run in sandboxed Firebase Cloud Functions. The frontend never possesses email dispatch capabilities.
* **Client Safeguards:** The `isAdmin` boolean is visually helpful for UI gating, but the actual data protection relies strictly on Firestore Rules and Custom Claims. Unapproved users are fundamentally blocked from database reads regardless of frontend manipulations.
* **Future Hardening:** Implementation of Firebase AppCheck is recommended to prevent unauthenticated API scraping.
