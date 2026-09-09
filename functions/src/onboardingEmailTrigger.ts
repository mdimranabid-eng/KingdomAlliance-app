import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const getDb = () => admin.firestore();

/**
 * Firestore trigger: fires exactly once when a user doc is CREATED with
 * onboardingComplete === true. This is the source of truth for the onboarding
 * PDF + welcome email — robust against client-side abandonment / refresh.
 *
 * Reuses the same biodata PDF generator + email template as the
 * /api/send-onboarding-email HTTP route so output is identical.
 */
export const onOnboardingComplete = onDocumentCreated(
  {
    document: 'users/{userId}',
    secrets: ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT'],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('[OnboardingEmailTrigger] No snapshot — skipping.');
      return;
    }

    const userData = snapshot.data() || {};
    const uid = event.params.userId;

    // Only handle profiles that are marked onboarding-complete at creation time.
    if (userData.onboardingComplete !== true) {
      console.log(`[OnboardingEmailTrigger] User ${uid} onboardingComplete !== true — skipping.`);
      return;
    }

    // Idempotency guard: the HTTP route sets this flag after sending. If it's
    // already present, the email was already dispatched (e.g. via HTTP) and we
    // must not duplicate-send.
    if (userData.onboardingEmailSent === true) {
      console.log(`[OnboardingEmailTrigger] User ${uid} already has onboardingEmailSent=true — skipping.`);
      return;
    }

    const email = userData.email;
    const name = userData.fullName || userData.name || 'Member';
    const profileId = userData.profileId || `KA-${uid.slice(0, 6).toUpperCase()}`;

    if (!email) {
      console.warn(`[OnboardingEmailTrigger] User ${uid} has no email — cannot send onboarding email.`);
      return;
    }

    try {
      // Generate the biodata PDF (same generator the HTTP route uses).
      const { generateBiodataPdf } = await import('./biodataPdf');
      const pdfBuffer = await generateBiodataPdf({ ...userData, profileId });
      const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

      // Send the onboarding_complete email with the PDF attached + BCC owner.
      const { dispatchEmail } = await import('./services/emailProvider');
      await dispatchEmail(
        email,
        null,
        'onboarding_complete',
        name,
        'Kingdom Alliance',
        pdfBase64,
        `KA_Biodata_${profileId}.pdf`,
        'themaster@thekingdomalliances.com'
      );

      // Mark as sent so neither this trigger nor the HTTP route ever re-sends.
      await getDb()
        .collection('users')
        .doc(uid)
        .set({ onboardingEmailSent: true, onboardingEmailSentAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

      console.log(`✅ [OnboardingEmailTrigger] Sent onboarding PDF email to ${email} (uid: ${uid}).`);
    } catch (err: any) {
      console.error(`❌ [OnboardingEmailTrigger] Failed for ${uid}:`, err.message || err);
      // Do not throw — Firestore triggers retry on unhandled errors, which could
      // spam the user. Leaving the flag unset means a manual re-send is still possible.
    }
  }
);
