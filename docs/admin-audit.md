# Admin dashboard audit — 5 October 2026

The original audit identified the issues below. They have now been addressed locally; production deployment and real sign-in/mail testing remain pending. The audit reproduced defects using a local Firestore emulator, synthetic profiles, mocked Authentication and email, and a local browser with external requests blocked. No real accounts were modified or email sent. The initial audit was followed by the fixes summarized here.

## Fixes and verification

- Removed Announcements and its help content; existing bookmarks redirect to the dashboard.
- Require a completed MFA session, current admin privileges and verified admin record for administrative API access. Database admin permissions also require MFA and verified email. Admin records cannot be edited by clients.
- Initial admin email verification now consumes the submitted OTP on the server. Codes can only be requested by that administrator; the generic OTP endpoint cannot consume admin-login codes. MFA enrollment requires signing in again with the enrolled authenticator.
- Administrator deletion requires an expiring, attempt-limited code bound to caller and target. Codes are single-use; requests have a two-minute cooldown. The general member-deletion endpoint blocks administrator and protected accounts.
- Enforce suspension/bans in database permissions; admins can manage incomplete drafts without complete-profile validation blocking status updates.
- Use the same API app in local development and production, including the shared retryable cascade. Removed unsafe browser deletion fallbacks.
- Keep items visible until approval/rejection/deletion succeeds; display failures. Preserve existing embedded notifications when adding approval/rejection notifications.
- Return actual email delivery status for admin invitations/password resets and show an accurate message. Roll back newly created Auth accounts when administrator setup fails.

Validation: root TypeScript check, production frontend build and Functions compilation passed. 40 admin API/database regression checks and 21 existing security/member-deletion tests passed against isolated demo databases, with Authentication, mail and destructive admin operations mocked. Signed-out browser route checks passed. Real Firebase TOTP sign-in, SMTP delivery, authenticated dashboard interactions and deployed triggers still require staging verification. These checks do not establish that every production dashboard workflow works.

## Original confirmed issues (historical)

1. **Suspension is not enforced by database permissions.** AdminUserManagement writes `isSuspended` and `status`, but `isApproved()` in firestore.rules checks approval and deletion state without checking suspension or bans. A synthetic suspended member with `isApproved: true` successfully read another approved profile with a non-admin JWT. The interface redirect does not protect direct database access.
2. **MFA is not required by the admin API or database admin permissions.** The API checks the caller's admin custom claim, but does not verify that the session completed a second factor. An admin token with no second-factor claim successfully listed admins and performed administrative actions in the audit. The React route checks enrollment, which is not a backend authorization check.
3. **Admin deletion bypasses verification and protected-account checks.** `/admin/delete-admin` accepts only `uid`, and succeeded without an OTP. Although `/admin/send-deletion-otp` exists, the deletion route never consumes the code and the settings page never submits one. Furthermore, `/admin/delete-user` does not reject administrator targets; the audit's mock cascade was invoked on the requesting admin UID. This bypasses the own-account/system-account protections present in the specialized admin endpoint. The general cascade also does not remove the associated admins document.
4. **Announcements do not deliver.** The page only writes a queued document to `announcements`; there is no deployed-source worker for that collection and no Firestore permission granting admins that write. A synthetic admin write was denied. The “Recent Sent” example and engagement tracking statement are hardcoded interface content, not delivery records.
5. **Admin account settings are incomplete in local development.** The local Express server lacks list-admins, create-admin, delete-admin and reset-admin-password endpoints, even though the settings page calls them. Corresponding consolidated Cloud Function routes exist and their mocked handlers were tested.
6. **Some incomplete profiles cannot be managed.** The users rule requires the complete result to satisfy `isValidUser`, including age >=18. An existing age-zero draft could not be suspended by an admin. AdminUserManagement includes drafts in its general users query, so these actions are offered on records the rules reject.
7. **User-deletion fallback can leave partial deletion.** AdminUserManagement and RejectedProfilesPage attempt a browser-side cascade after any backend failure. The browser cannot delete Authentication credentials or stored images, and the users rule does not allow deleting the main user document. Other related records can be removed before that final denial. The separate local admin-deletion handler also retains older cleanup code rather than using the updated shared cascade.
8. **Failures can look like success or disappear from view.** Approvals/rejections remove users optimistically before the write, then only log failures without restoring the item or reporting the failure prominently. Admin creation/password reset reports credentials were emailed even when SMTP failure was caught and ignored.

## What was exercised

| Area | Local result | Limits |
| --- | --- | --- |
| Login screen | Renders; no browser JavaScript exceptions | Actual credential login, email OTP and TOTP require staging verification |
| Protected admin routes | Nine routes redirect signed-out users to login | Signed-in page interactions were not exercised in the browser |
| API access controls | Seven admin endpoints reject anonymous and ordinary-member tokens | Auth token validation itself was mocked; MFA gap reproduced |
| Profile approval/rejection | Normal valid-profile writes accepted | Draft/legacy validation can deny actions |
| Suspension/restoration | Status writes accepted | Suspended users remain authorized by database approval rules |
| Photo moderation | Primary photo approval and gallery rejection update correct fields | Real uploads, photo rendering, storage permissions and notification triggers unverified |
| Admin account creation/reset | Handler logic succeeds with mocked Auth/mail | Real account setup, TOTP and SMTP not exercised |
| Admin deletion | Missing OTP and general-route protection bypass reproduced | All destructive Authentication/cascade calls were mocked |
| Church directory | Source reads match admin-only rules | Authenticated UI paging/search not exercised |
| Reports | Source inspection: data reads and calculations implemented | No authenticated report/PDF export browser test |
| Dashboard statistics | Source reads/listeners implemented | Values and live listener behavior not checked against a staging dataset |
| Help center | Static page is routed behind admin login | Content accuracy not audited |
| Announcements | Admin writes denied; delivery worker absent | Feature is not operational |
| Scheduled email functions | Source reviewed | Deployment, schedule activation, SMTP and real trigger delivery remain unverified |

## Evidence

40 local API/rule regression checks are in `tmp/admin-audit/results.json`. Nine browser redirect checks and login-page inspection are in `tmp/admin-audit/browser-results.json`; login screenshot is alongside them. The repeatable mocked backend audit script is `functions/test/admin-audit.cjs`, with a guard requiring the isolated emulator. TypeScript checks and backend compilation passed.

Next step: verify complete workflows with a dedicated staging admin, then deploy the functions, rules and frontend together. Announcements has been removed.
