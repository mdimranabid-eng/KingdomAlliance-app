# Firebase → Node.js/MySQL migration (Hostinger)

State: IN PROGRESS — continuation of the opencode session `ses_e5d14b26fffeRAjNv3oZxdxN1d`
("convert this firebase website to hostinger web app using node.js + mysql, deploy to thekingdomalliances.com").

Locked decisions (from that session):
- **Architecture**: keep the existing Vite + React 19 + Tailwind 4 SPA (static), add an Express (Node.js) API on Hostinger.
- **Database**: fresh empty MySQL (schema bootstraps itself via `api/src/db.js`).
- **Scope**: full feature parity. Firebase **Cloud Messaging (FCM) stays** on Firebase for web push; everything else moves off Firebase.

## 1. Frontend Firebase coupling audit (todo 0 — complete)

38 source files import `firebase/*`. Exact surface used:

| Module | Files | Functions used |
|---|---|---|
| firebase/firestore | 33 | getFirestore, doc, collection, collectionGroup, query, where, orderBy, limit, getDoc, getDocFromServer, getDocs, setDoc, updateDoc, addDoc, deleteDoc, onSnapshot, serverTimestamp, Timestamp, deleteField, arrayUnion, arrayRemove, writeBatch, runTransaction |
| firebase/auth | 12 | getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, updateProfile, reload, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, GoogleAuthProvider, signInWithPopup, multiFactor, TotpMultiFactorGenerator (generateSecret/assertionForEnrollment/assertionForSignIn), getMultiFactorResolver, User |
| firebase/database (presence + typing) | 5 | getDatabase, ref, set, onValue, onDisconnect, remove, serverTimestamp — paths: `status/{uid}`, `typingStatus/{chatId}/{uid}`, `.info/connected` |
| firebase/storage | 3 | getStorage, ref, uploadBytes, getDownloadURL, deleteObject |
| firebase/messaging | 3 | getMessaging, getToken, onMessage (**stays on Firebase**) |
| firebase/functions | 1 | getFunctions, httpsCallable → `requestOtp`, `verifyOtp` |
| firebase/app | 2 | initializeApp, getApp (real Firebase app stays initialized for FCM) |

Collections used by the client: `users`, `interests`, `shortlists`, `chats` + `chats/{id}/messages` (+ collectionGroup `messages`), `notifications`, `profileViews`, `photoModeration`, `uploadedImages`, `settings/site_config`, `admins`, `churches`, `contact_messages`, `blocked`.

## 2. Architecture (todo 1 — design)

**Why a compat layer instead of a rewrite of 38 files:** the frontend is ~14k lines importing the
Firestore/Auth SDK directly. A drop-in shim (`src/lib/fbc/*`) + Vite aliases
(`firebase/firestore|auth|storage|database|functions` → shim) gives full parity with zero
source-file changes. `firebase/app`, `firebase/app-check`, `firebase/messaging` remain the real
Firebase SDK so FCM web push keeps working.

- `onSnapshot` → polling (`POST /api/fs/watch`, changes-since cursor, ~4s interval).
- `serverTimestamp()` → `{__ts: <millis>}` stored in JSON; shim rehydrates `{__ts}` into Timestamp objects on read.
- Transforms (`arrayUnion`, `arrayRemove`, `deleteField`, `increment`) → sentinels applied server-side.
- Presence/typing (RTDB) → heartbeat + will-state + lazy sweep (`/api/presence`, `/api/typing`).

**API surface** (Express, mounted at `/api`, serves SPA `dist/` + `/uploads/` on same origin):

- Auth: `POST /auth/register|login|admin-login|mfa/challenge|mfa/enroll/start|mfa/enroll/confirm|mfa/unenroll|google|refresh|logout`, `GET /auth/me`
- OTP: `POST /otp/request|verify`; `POST /reset-password`; `POST /verify-admin-email`
- Firestore-compat: `GET|PUT|PATCH|DELETE /fs/{path...}`, `POST /fs/add|query|batch|transaction|watch`
- Special: `POST /check-email|contact|account/delete|account/reactivate|send-email|send-onboarding-email`
- Admin mgmt: `POST /admin/list|create|update|delete|reset-admin-password|send-deletion-otp`
- Presence/typing/FCM/settings/storage: `POST|GET /presence`, `/typing`, `POST /fcm/token`, `GET|PUT /settings`, `POST /storage/upload|delete`
- Cron (secret-protected, also run in-process via node-cron): `POST /cron/deletions|otp-cleanup|approvals-check`

**Data storage**: dedicated `users` table holds the full profile doc in `data` JSON + synced
indexed columns (auth: email, password_hash, role, totp). All other collections → generic
`coll_store` (coll = full collection path e.g. `chats/{id}/messages`, id, data JSON, updated_at).
Internal tables: `sessions`, `otps`, `otp_requests_log`, `verification_tokens` (MFA tickets),
`admins`, `email_log`, `user_deletions`, `presence`, `typing`.

**Security**: `api/src/rules.js` ports `firestore.rules` 1:1 (isUsableAccount / isApproved /
isAdmin / owner checks / field-diff restrictions / per-collection read filters).

**Triggers inlined** (were Cloud Functions): user status-change emails, onboarding email + biodata
PDF, church sync from profiles, interest rate limit (5/24h), interest created/accepted FCM,
chat message FCM + offline digest email, contact-message admin email, admin alert cron (8h),
deletion scheduler (hourly), OTP cleanup (daily).

## 3. Status

- [x] Audit + design (todos 0, 1)
- [x] Express API (todos 2, 3)
- [x] Frontend shim + Vite aliases (todo 4)
- [x] Local verification (todo 5)
- [ ] Hostinger: create MySQL DB + Node app (todo 6)
- [ ] Deploy to thekingdomalliances.com + verify (todo 7)
