# Kingdom Alliance — Workflow Analysis

> **Generated:** 31/08/2026
> **Purpose:** Audit of user workflows, routing logic, data flows, and security posture for the Christian matrimonial platform.
> **Source:** Review of `src/`, `functions/`, `firestore.rules`, `ARCHITECTURE_BLUEPRINT.md`, and `KA Blueprint.md`.

---

## Table of Contents

1. [Critical Issues](#critical-issues)
2. [Moderate Issues](#moderate-issues)
3. [Minor / Consistency Issues](#minor--consistency-issues)
4. [Full User Journey Map](#full-user-journey-map)
5. [Summary Table](#summary-table)

---

## 🔴 Critical Issues

### 1. OTP Security Vulnerability — Client-Generated, Publicly Readable Codes

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/pages/RegisterPage.tsx` (line 97), `firestore.rules` (lines 219-222) |
| **Description** | The 6-digit OTP is generated entirely on the client: `Math.floor(100000 + Math.random() * 900000).toString()`. The Firestore rules for `temp_otps` allow **any signed-in user** to read and delete OTP records (`allow read, delete: if true`). A bad actor could enumerate OTP codes or intercept another user's verification for a different email. |
| **Impact** | An attacker could bypass email verification by reading the stored OTP from Firestore, or generate their own OTP record for someone else's email. |
| **Recommendation** | Generate OTPs server-side via a Cloud Function and restrict `temp_otps` read permissions to only the document owner (by email match). |

### 2. Rejected Users Have No Path to Resubmit (Hard Dead-End)

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/pages/status/RejectedPage.tsx`, `src/components/AuthGuard.tsx` (line 123) |
| **Description** | When an admin rejects a profile: `approvalStatus: 'rejected'`, `isApproved: false`. The `AuthGuard` detects this and permanently redirects the user to `/rejected` (line 123). The `RejectedPage.tsx` only offers a "Sign Out" button — there is **no mechanism** for a rejected user to: (1) See why they were rejected (the `rejectedReason` is stored but never displayed on the page), (2) Edit their profile to address the rejection reason, (3) Resubmit for re-review. Note: `ARCHITECTURE_BLUEPRINT.md` states this page should "Instruct rejected registrations on how to adjust details," but it doesn't. |
| **Impact** | Once rejected, users are permanently locked out with no recourse — they'll never come back. |
| **Recommendation** | Create a "re-apply" flow — allow rejected users to access `/onboarding` again (with their previously submitted data pre-filled), update their info, and resubmit as `pending`. |

### 3. Dual, Independent Auth State Managers Causing Redundant Reads & Potential Sync Issues

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/lib/AuthContext.tsx` and `src/components/AuthGuard.tsx` |
| **Description** | Both components independently: (a) Subscribe to `onAuthStateChanged`, (b) Subscribe to `onSnapshot(doc(db, 'users', uid))` (real-time listener), (c) Subscribe to `onSnapshot(doc(db, 'admins', uid))` (real-time listener), (d) Manage their own `loading`, `user`, `profile`, `isAdmin` state. |
| **Impact** | Duplicate Firestore reads (4 listeners total instead of 2) for every authenticated user on every page. Potential race conditions — `AuthGuard` could decide routing before `AuthContext` has finished loading, or vice versa. Components use `AuthContext`'s profile while `AuthGuard` makes routing decisions based on its own separate snapshot — they can temporarily disagree. |
| **Recommendation** | Consolidate into a single provider. Have `AuthGuard` consume `AuthContext` rather than duplicating all subscriptions. |

---

## 🟠 Moderate Issues

### 4. Deferred Account Creation Can Leave Users in Limbo

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/pages/RegisterPage.tsx` (lines 154-210), `src/pages/OnboardingPage.tsx` (lines 739-752) |
| **Description** | The registration flow: (1) User enters email/password on RegisterPage → saved to `sessionStorage` as `saved_credentials`. (2) OTP verified → `emailVerified: true` set in `sessionStorage` **(but no Firebase Auth account created yet)**. (3) User navigates to `/onboarding` and fills out the multi-step form. (4) Only at **final submission** does `createUserWithEmailAndPassword()` actually create the Firebase Auth user. |
| **Impact** | If the user closes the browser, refreshes, or navigates away between steps 2-4, the Firebase Auth account was **never created**. The OTP was already consumed and deleted. The `sessionStorage` data may or may not survive depending on navigation method. The user loses all their work and cannot recover. |
| **Recommendation** | Create the Auth user immediately after OTP verification (step 2), and only store a placeholder profile document. The onboarding form can then update the existing user document. |

### 5. AuthGuard Ignores Admin Email Verification (Unlike AuthContext)

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/components/AuthGuard.tsx` (lines 59-61) vs `src/lib/AuthContext.tsx` (lines 75-86) |
| **Description** | `AuthContext` checks both custom claims `claims.admin` **and** `admins/{uid}.emailVerified === true` before granting admin status. `AuthGuard` only checks if the `admins/{uid}` document **exists** — no email-verification check. |
| **Impact** | An admin whose email hasn't been verified will have `isAdmin = false` in `AuthContext` (correct), but `isAdmin = true` in `AuthGuard`. They could access admin routes but the components within Admin would get inconsistent admin state. |
| **Recommendation** | Align `AuthGuard` with `AuthContext` — check both the custom claim and `emailVerified`. |

### 6. No Chat Document / Metadata Collection

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/pages/MessagesPage.tsx` (lines 304-316) |
| **Description** | Messages are written directly to `chats/{chatId}/messages/{messageId}` subcollections. There is **no parent chat document** (`chats/{chatId}`). The chat list is entirely reconstructed by querying the `interests` collection for accepted connections (lines 86-98). |
| **Impact** | No native "last message preview" for the chat list. Chat list has to be reconstructed from interests, then each conversation's unread count fetched separately. No chat metadata (last activity timestamp, mute status, etc.). The `onSnapshot` listeners across multiple subcollections could scale poorly with many accepted connections. |
| **Recommendation** | Create a chat document on first message that stores `participants`, `lastMessage`, `lastActivity`, enabling efficient chat list queries and previews. |

---

## 🟡 Minor / Consistency Issues

### 7. `isApproved` Field Never Initialized for New Users

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/services/authService.ts` (line 97), `firestore.rules` (lines 35-39) |
| **Description** | When a user registers, the initial profile sets `approvalStatus: 'incomplete'` but does **not** set `isApproved` at all. Firestore rules check `isApproved == true` to gate access; `undefined != true`, so it works as a default-denied state. Various admin UI components reference `isApproved` directly (e.g., `DashboardPage.tsx` line 511: `profile?.isApproved`). It's only set to `true` on admin approval. |
| **Recommendation** | Explicitly set `isApproved: false` in the initial user document for clarity and consistency. |

### 8. Blueprint/Field Naming Inconsistency

| Attribute | Detail |
|-----------|--------|
| **Files** | `ARCHITECTURE_BLUEPRINT.md` (line 271), `src/pages/admin/AdminPhotos.tsx` (line 98), `src/pages/OnboardingPage.tsx` (line 782) |
| **Description** | The `photoModeration` collection blueprint shows a field called `status`, but throughout the actual codebase it's consistently `photoStatus`. The code works (it's internally consistent) but the blueprint is misleading. |
| **Impact** | Confusion for new developers onboarding. |
| **Recommendation** | Update `ARCHITECTURE_BLUEPRINT.md` to match the actual code field name `photoStatus`. |

### 9. Heavy Firestore Reads for Chat List

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/pages/MessagesPage.tsx` (lines 86-128) |
| **Description** | The chat list is built by querying **all** interests where the user is `fromId` and `toId`, then for each one registering a separate `onSnapshot` on `chats/{chatId}/messages` to listen for unread counts. With even 20 accepted connections, this creates **20+ real-time listeners** on page load. |
| **Recommendation** | Use a chat metadata document with `lastMessage` and `unreadCount` fields, and listen only to the chat list document, not every message subcollection. |

### 10. Unthrottled `lastActive` Writes on Login

| Attribute | Detail |
|-----------|--------|
| **Files** | `src/lib/AuthContext.tsx` (lines 105-118), `src/services/authService.ts` (lines 52-56) |
| **Description** | Every time a user logs in or revisits the app, `lastActive: serverTimestamp()` is written. `authService.checkUserStatus()` does this during **every** `checkUserStatus` call. With many daily active users, this creates unnecessary write load that also increments Firestore usage costs. |
| **Recommendation** | Throttle `lastActive` updates to at most once per minute, or move frequent presence updates to the Realtime Database. |

---

## Full User Journey Map

The platform's intended workflow, as documented in the code:

```
[Public Visitor]
   ├──► / (LandingPage)
   ├──► /login (LoginPage)
   └──► /register (RegisterPage) ──► Email OTP Verification
              │
              ▼
      [Authenticated User]
              │
              ├─► Email Verified? ── NO ──► /register (Resend OTP)
              │
              ├─► Onboarding Complete? ── NO ──► /onboarding (OnboardingPage)
              │
              ├─► Admin Status? ── YES ──► Bypass checks ──► /admin (Admin Panel)
              │
              ▼
      [Account State Review]
              │
              ├─► approvalStatus == 'pending'  ──► /waiting-room (PendingApprovalPage)
              ├─► status == 'suspended'        ──► /suspended (SuspendedPage)
              ├─► status == 'banned'           ──► /banned (BannedPage)
              ├─► status == 'rejected'         ──► /rejected (RejectedPage) ❌ DEAD-END
              │
              ▼ (ALL PASS)
      [Approved Member Access] ──► Render Layout (Sidebar + Header Nav)
              │
              ├───► /dashboard
              ├───► /matches ──► Send Interest → /interests → Accept → /messages
              ├───► /messages / /messages/:id
              ├───► /shortlist
              ├───► /interests
              └───► /profile / /profile/:id
```

**Notable routing observations:**
- Admin users bypass all standard matrimonial routing (see `AuthGuard.tsx` lines 97-103).
- The `/rejected` route is a **dead end** — no recovery path back to `/onboarding`.
- `/onboarding` with saved `sessionStorage` credentials (unauthenticated) is permitted by `AuthGuard` (lines 90-93) to support the deferred account creation flow (Issue #4).

---

## Summary Table

| # | Issue | Severity | Component(s) |
|---|-------|----------|--------------|
| 1 | Client-side OTP generation + publicly readable `temp_otps` | 🔴 Critical | RegisterPage, firestore.rules |
| 2 | Rejected users have no resubmit path | 🔴 Critical | RejectedPage, AuthGuard |
| 3 | Dual auth state managers (AuthContext vs AuthGuard) | 🔴 Critical | AuthContext, AuthGuard |
| 4 | Deferred account creation loses work on navigation away | 🟠 Moderate | RegisterPage, OnboardingPage |
| 5 | AuthGuard bypasses admin email verification | 🟠 Moderate | AuthGuard, AuthContext |
| 6 | No chat metadata document | 🟠 Moderate | MessagesPage |
| 7 | `isApproved` not explicitly initialized for new users | 🟡 Minor | authService, AdminApprovals |
| 8 | Blueprint field name mismatch (`status` vs `photoStatus`) | 🟡 Minor | ARCHITECTURE_BLUEPRINT.md |
| 9 | Heavy Firestore reads for chat list (20+ listeners per user) | 🟡 Minor | MessagesPage |
| 10 | Unthrottled `lastActive` writes on every login | 🟡 Minor | AuthContext, authService |

---

**Overall Assessment:** The architecture is well-designed overall, with a clear user journey (Register → Onboarding → Pending → Approved → Active Member). The critical issues primarily involve security (OTP), user experience dead-ends (rejected users), and architectural performance (dual auth managers). Addressing items 1-3 would resolve the most significant workflow problems.