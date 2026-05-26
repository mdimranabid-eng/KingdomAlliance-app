# Kingdom Alliance Features Documentation

## Module: Automated Admin Moderation Alerts
* **Type:** Firebase Cloud Function v2 (`onSchedule`)
* **Schedule:** Every 4 hours (`every 4 hours`, timezone: `Asia/Kolkata`)
* **Location:** `functions/src/pendingApprovalCheck.ts`
* **Dependencies:** `firebase-admin`, `firebase-functions`, `nodemailer`
* **Logic Flow:**
  1. Wakes up every 4 hours.
  2. Scans the `admins` Firestore collection to build a dynamic mailing list.
  3. Queries `users` where `onboardingComplete == true` and `approvalStatus == 'pending'`.
  4. Queries `photoModeration` where `photoStatus == 'pending'`.
  5. If both queues are empty, the function gracefully exits.
  6. If items are pending, it compiles a styled HTML summary and dispatches it via Google SMTP using `nodemailer`.
  7. Writes an execution log to the `admin-alerts` Firestore collection.
