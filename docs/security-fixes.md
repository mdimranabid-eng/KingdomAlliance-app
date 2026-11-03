# Account and email access-control fixes

New profiles cannot set admin, approval, ban, moderation approval, or email-delivery fields. Members can complete an existing draft, but completed profiles cannot reset onboarding or change locked identity fields. Interest participants cannot rewrite sender/recipient identities. Church directory writes require admin privileges; the backend synchronizes submitted profile church information.

Both the consolidated API and legacy `sendEmailApi` now verify authentication. General client notifications accept only `interestId` and a connection event type, verify the saved relationship/action, and select the recipient and sender name on the server. Account and administrative emails remain in their dedicated backend flows.

Onboarding email requires owner or admin authorization, a complete profile, and a profile email matching Firebase Auth. The creation trigger, draft-completion trigger, manual HTTP request and backfill use the same delivery service. A transaction lease prevents simultaneous sends and a server-only delivery record prevents repeats after success. Failed SMTP sends release the lease for retry. SMTP itself cannot guarantee exactly-once delivery if a process crashes after sending and before saving success.

The redesigned biodata PDF includes clearly separated profile sections, a member declaration, a profile-reference PDF417 barcode, and the full terms. The barcode is not a cryptographic PDF certificate signature. BCC defaults to the existing `themaster@thekingdomalliances.com` recipient. Additional recipients can be configured using the server environment variable `ONBOARDING_BCC_EMAILS` (comma-separated). Browser requests cannot override BCC or supply onboarding attachments.

## Verification

Build the website with `npm run build` and check it with `npm run lint`. Build backend code with `npm --prefix functions run build`.

The backend security suite uses an isolated demo project, local Firestore emulator and mocked mail delivery; it sends no real email. Start a Java 21 Firestore emulator on `127.0.0.1:8189` with project `demo-ka-security` and the root `firestore.rules`, then run:

```
FIRESTORE_EMULATOR_HOST=127.0.0.1:8189 npm --prefix functions run test:security
```

The admin server builds the shared backend automatically before starting. The maintenance backfill now lives within backend dependency scope and can be run with `npm --prefix functions run backfill:onboarding -- --dry-run`. No backfill was executed during the fix.

## Deployment

Deploy the functions, website, and Firestore rules together; deploying hosting/functions alone leaves the old database permissions active. No live deployment or real SMTP send was performed during these changes. Review existing approved accounts separately: tighter rules do not undo approval flags already written under previous rules.
