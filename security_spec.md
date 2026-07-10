# Security Specification - Kingdom Alliance

## 1. Data Invariants
- A User profile is `isApproved: false` by default upon creation.
- Only Admins can set `isApproved: true`.
- Users must be approved (`isApproved == true`) to list or view other users' profiles (except their own).
- Interests can only be initiated by approved users towards other existing users.
- Messages can only be read/written by participants in the chat (identifiable by `chatId`).
- Admin privileges are verified against the `/admins/` collection, not client-side claims.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Self-Approval Attack**: User tries to create a profile with `isApproved: true`.
2. **Identity Spoofing**: User tries to create a profile for a different `uid` than their own.
3. **Privilege Escalation**: User tries to add themselves to the `/admins/` collection.
4. **Data Poisoning**: User tries to inject a 1MB string into their `name` or `aboutMe` field.
5. **Unauthorized Snooping (Profile)**: A non-approved user tries to list/get other users' profiles.
6. **Unauthorized Snooping (Chat)**: User A tries to read messages in a chat between User B and User C.
7. **Message Impersonation**: User A tries to send a message in a chat but sets `senderId` to User B.
8. **Interest Spam**: User tries to create an interest towards a non-existent `toId`.
9. **Unapproved Interest**: An unapproved user tries to send an interest.
10. **Admin Bypass**: User tries to update their own `status` or `isApproved` flag.
11. **ID Poisoning (Path)**: User tries to access `/users/some-extremely-long-garbage-string`.
12. **Relational Break**: User tries to create a message without a valid `chatId` they belong to.

## 3. Implementation Plan
- Harden `firestore.rules` with `isValidId` and strict `affectedKeys()` checks.
- Implement `isValid[Entity]` helpers for all writes.
- Enforce immutable fields (`uid`, `email`, `createdAt`).
- Use `request.time` for all timestamps.
