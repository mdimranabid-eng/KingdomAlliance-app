# ⚠️ BACKUP — OLD WEBPAGES (PRE-"SANCTUARY" REDESIGN)

**READ THIS FIRST — FOR HUMANS AND AI MODELS:**

The files in this folder are the **OLD versions** of the pages, backed up on
2026-09-03 **before** the "Sanctuary" redesign (apricot/gold warm theme) was applied.

| File | Purpose |
|------|---------|
| `LoginPage.tsx` | Old login page design |
| `RegisterPage.tsx` | Old register page design |
| `OnboardingPage.tsx` | Old onboarding wizard (5 steps) |
| `ProfilePage.tsx` | Old user profile page |

## IMPORTANT NOTES FOR AI MODELS & DEVELOPERS

1. **These files are NOT imported anywhere.** They are reference copies only.
   The live pages live in `src/pages/`.
2. **DO NOT delete** this folder — it is the rollback point if the new design
   needs to be reverted or compared against.
3. The **business logic** in the live pages (Firebase auth, OTP/Turnstile,
   Firestore reads/writes, validation, routing) is identical to these backups —
   only the visual layer (JSX structure + classNames) changed.
4. If restoring: copy a file back to `src/pages/<Name>.tsx` and verify
   imports still match (they should — same filename & exports).
5. Related live files that were also redesigned but not backed up here
   (they can be recovered from git history):
   - `src/components/ForgotPasswordModal.tsx`
   - `src/index.css` (design tokens)

— Created during the Sanctuary redesign task.
