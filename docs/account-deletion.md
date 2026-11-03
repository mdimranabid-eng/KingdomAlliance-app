# Member account deletion

The profile button requests an email verification code for the authenticated member's own account. These authenticated self-service code requests do not require CAPTCHA; existing OTP cooldown and email limits remain. The browser submits the code to `/api/delete-account`. The backend selects the caller from a checked Firebase ID token and verifies/consumes the code in the same database transaction that schedules deletion. The generic OTP verification callable cannot consume deletion codes.

A successful request hides the profile and starts a seven-day recovery period. Repeat requests do not move the deadline. Members can sign in and choose Reactivate before the deadline. Reactivation and the cleanup worker use transactions so a worker cannot delete an account that was successfully reactivated. Expired or already-processing accounts cannot reactivate. Administrators use the separate admin account deletion process.

The hourly worker claims expired pending requests and resumes failed cleanup. It deletes Authentication, member-associated Firestore records (including orphan chat message collections), Firebase Storage files under `users/{uid}/`, church membership entries and Realtime Database presence/typing records. The profile containing retry state is deleted last. Cleanup failures propagate and remain eligible for retry. The final deletion email is sent only after cleanup succeeds. Minimal deletion audit records are retained.

Reminder emails target accounts whose deadlines fall within the next 24 hours. An hourly schedule means final cleanup starts on a worker run after the seven-day deadline, not precisely at the deadline second.

The development admin server exposes the same scheduling and reactivation handlers as production. It needs `OTP_HASH_SALT` matching the backend that issued the OTP; provide it as a server environment secret. Do not commit secrets.

## Validation and deployment

`FIRESTORE_EMULATOR_HOST=127.0.0.1:8189 npm --prefix functions run test:deletion` runs against an isolated `demo-ka-security` Firestore emulator with Authentication, Storage, Realtime Database and SMTP mocked. No real accounts are deleted and no real email is sent. The earlier security suite remains under `test:security`.

Deploy functions, hosting, Firestore rules and indexes together. Cleanup needs the new collection-group message indexes. Real SMTP delivery, deployed scheduler configuration, Storage and Realtime Database permissions still require staging verification; they were not exercised against live services during this fix.
