# Kingdom Alliance — Technical Blueprint

## 1. Project Structure

- **src/** (Root application directory)
  - **components/** (Reusable UI components)
    - `AuthGuard.tsx` - Protects authenticated routes.
    - `BlockedUsersList.tsx` - Admin/User view for blocked users.
    - `ConfirmationModal.tsx` - Generic modal for destructive actions.
    - `ForgotPasswordModal.tsx` - Password reset flow.
    - `KingdomCrossIcon.tsx` - SVG asset component.
    - `Layout.tsx` - Main app shell, navigation, global notifications.
    - `NotificationListener.tsx` - Background listener for toasts.
    - `OnlineIndicator.tsx` - Highly optimized IntersectionObserver presence dot.
    - **admin/** - Contains admin-specific UI components (e.g. `AdminReportModal.tsx`).
  - **pages/** (Application route views)
    - `DashboardPage.tsx` - Main feed, recent activity, daily match suggestions.
    - `InterestsPage.tsx` - Manages sent, received, accepted, and declined requests.
    - `LandingPage.tsx` - Public marketing site.
    - `LoginPage.tsx` - Authentication entry point.
    - `MatchesPage.tsx` - Global discovery grid and direct Profile ID search.
    - `MessagesPage.tsx` - Real-time chat engine.
    - `OnboardingPage.tsx` - Multi-step registration and data collection.
    - `ProfilePage.tsx` - Detailed user view and interaction gates.
    - `RegisterPage.tsx` - Initial account creation and OTP flow.
    - `ShortlistsPage.tsx` - Saved profiles.
    - **admin/** - Admin dashboards (`AdminUserManagement.tsx`, `AdminPhotos.tsx`, etc.).
  - **services/** (External API handlers)
    - `authService.ts` - Firebase Authentication wrappers.
  - **lib/** (Utilities and configurations)
    - `AuthContext.tsx` - React Context for global auth state.
    - `firebase.ts` - Firebase initialization and exported instances.
    - `utils.ts` - Shared helper functions (ID generation, Match Engine scoring, etc.).
    - `cloudinary.ts` - Image compression and CDN upload logic.
    - `email.ts` - Backend email dispatch wrappers.
  - **firestore.rules** (Root directory) - Strict security and RBAC definitions for Firebase.

## 2. Feature Implementation Status

### COMMUNICATION SYSTEM
- **Complete:** Interest sending / receiving
- **Complete:** Accept / Decline / Withdraw
- **Complete:** Withdraw & Decline (block)
- **Complete:** Unblock & Accept
- **Complete:** Tab routing (Sent/Received/Accepted/Declined)
- **Complete:** Exclusion rule (blockee hidden from dashboard)

### PRIVACY & SECURITY
- **Complete:** Profile photo blur on declined status
- **Complete:** Gallery image blur on declined status
- **Complete:** Name replacement ("Profile Unavailable")
- **Complete:** RBAC client-side guards (all 5 handlers)
- **Complete:** Firestore security rules (all 5 rules)
- **Complete:** `declinedBy` directionality enforcement

### MESSAGING SYSTEM
- **Complete:** Real-time onSnapshot kill-switch
- **Complete:** Fail-closed UI lock (accepted only)
- **Complete:** Hard send gate (handleSendMessage)
- **Complete:** Chat bouncer (boot on block)
- **Complete:** Notification sweeper
- **Complete:** Chat restoration on unblock

### MATCH ENGINE
- **Complete:** 24-hour cache (`localStorage`)
- **Complete:** Exclusion set (interactions + reports)
- **Complete:** Mutual gender preference gates
- **Complete:** Age range filter
- **Complete:** 90-point scoring algorithm (Values 40 + Location 30 + Interests 20)
- **Complete:** lastActive tiebreaker
- **Complete:** Compatibility badge (score/90 * 100)

### PROFILE ID SYSTEM
- **Complete:** `generateProfileId()` utility
- **Complete:** `generateUniqueProfileId()` async wrapper
- **Complete:** New user assignment on registration
- **Complete:** Backfill for existing users
- **Complete:** Profile ID display UI with copy button
- **Complete:** Direct search in MatchesPage
- **Complete:** Privacy shield on search results
- **Complete:** 6-character minimum gate
- **Complete:** Case normalization (`toUpperCase`)

### ONLINE PRESENCE SYSTEM
- **Complete:** `isUserOnline()` utility (5-minute window)
- **Complete:** Keep-alive ping (every 4 minutes)
- **Complete:** Tab visibility handler
- **Complete:** `OnlineIndicator` component
- **Complete:** IntersectionObserver optimization
- **Complete:** Real-time onSnapshot per card

### DISCOVERY / SEARCH
- **Complete:** Standard discovery feed
- **Complete:** Profile ID direct search
- **Complete:** Architectural separation (Dashboard filtered, Discover open)
- **Complete:** Schema sniffer (removed after fix)

## 3. Database Schema

### `users` collection
Contains the core profile data for every member.
- `uid` (string)
- `email` (string)
- `name` (string)
- `profileType` ('bride' | 'groom')
- `aboutMe` (string)
- `denomination` (string)
- `church` (string)
- `education` (string)
- `profession` (string)
- `location` (string)
- `mobileNumber` (string)
- `emailVerified` (boolean)
- `familyDetails` (string)
- `photoUrl` (string)
- `pendingPhotoUrl` (string)
- `photoStatus` ('idle' | 'pending' | 'approved' | 'rejected')
- `photoPrivacy` ('public' | 'accepted_only')
- `photoRejectionReason` (string)
- `approvalStatus` ('incomplete' | 'pending' | 'approved' | 'rejected')
- `onboardingComplete` (boolean)
- `age` (number)
- `height` (number)
- `gender` ('male' | 'female' | '')
- `gallery` (array)
**System-Injected Fields:**
- `profileId` (string, generated 8-character ID)
- `lastActive` (timestamp)
- `dailyMatches` (array of UIDs, legacy/migration cache)

### `interests` collection
Tracks the bidirectional connection requests and blocks between members.
- `fromId` (string)
- `toId` (string)
- `status` ('pending' | 'accepted' | 'declined')
- `declinedBy` (string, the UID of the user who initiated the block)
- `createdAt` (timestamp)

### `notifications` collection
Tracks system alerts and interaction notifications.
- `type` ('interest' | 'accepted' | 'message')
- `fromId` (string)
- `toId` (string)
- `read` (boolean)
- `createdAt` (timestamp)

### `chats` & `messages` collections
- `chats`: Tracked implicitly via `interests` where status is 'accepted'.
- `messages`: Subcollection under `chats/{chatId}` tracking the individual message payloads (`senderId`, `receiverId`, `text`, `read`, `createdAt`).

## 4. Security Rules Reference

The `firestore.rules` file enforces strict backend validation:

- **Global:** Blocks all reads/writes by default.
- **`users`:** 
  - *Read:* Allowed if the requester is the owner, an Admin, or if the requester is `isApproved()` and reading an `isApproved` profile.
  - *Create:* Enforced payload validation via `isValidUser()`.
  - *Update:* Restricts modifiable fields strictly based on owner vs. Admin access.
- **`interests`:**
  - *Create:* Must map to Kingdom Alliance rules (requester is approved, target exists).
  - *Update:* Enforces strict RBAC state transitions (Receiver only can accept/decline; `declinedBy` logic strictly monitored).
- **`messages` (Collection Group & Subcollection):**
  - *Read/List:* Only allowed if `isParticipant()`.
  - *Create:* Requires the parent `interests` document to have a status of `'accepted'`.
- **`photoModeration` / `admins`:**
  - Strict Admin-only access paths utilizing custom claims or hardcoded super-admin emails.

## 5. Component Architecture

The application utilizes a modular React structure bound deeply to real-time Firebase listeners.
- **State Machines:** UI components react instantly to database updates (e.g. `MessagesPage` kill-switch listener enforcing fail-closed if a connection is severed).
- **Optimization:** Memory leaks are mitigated through aggressive cleanup and native browser APIs (e.g. `IntersectionObserver` in the `OnlineIndicator`).
- **Privacy:** Bouncers and Guards wrap high-sensitivity areas, heavily reliant on `excludedUids` block sets and `declinedBy` filters dynamically injected into the render cycles.

## 6. Known Issues & Technical Debt

- **TODOs:** 
  - `DashboardPage.tsx`: "Migrate this cache (`kingdomAlliance_dailyMatches`) to the user's Firestore document (or a Cloud Function) once the platform scales, to ensure the daily batch remains consistent across multiple devices."
- **Console Logs:** 
  - Significant debugging logs remain active in `OnboardingPage.tsx` (Cloudinary/Firebase upload tracing), `AdminPhotos.tsx`, `AdminUserManagement.tsx`, `RejectedProfilesPage.tsx`, `InterestsPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordModal.tsx`, `AdminReportModal.tsx`, `Layout.tsx`, `email.ts`, and `cloudinary.ts`.
- **Hardcoded Data:** 
  - Super-admin email (`md.imranabid@gmail.com`) is hardcoded directly into `firestore.rules`.
  - DICEBEAR API fallback avatars are hardcoded across several grid components.

## 7. Next Features Recommended

1. **Cloud Functions Migration:** Move the 24-hour match caching and 90-point algorithm to a secure, scheduled Firebase Cloud Function to prevent client-side manipulation and reduce device payload.
2. **Global Logger Cleanup:** Institute a global logging utility that strips `console.log` statements in production builds to secure sensitive UID operations.
3. **Environment-Based Admin Config:** Extract the hardcoded admin email out of the rules file and rely entirely on Firebase Custom Claims mapped through an authenticated backend.
