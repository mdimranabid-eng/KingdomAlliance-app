/**
 * One-time backfill: send the onboarding PDF email to existing users who
 * completed onboarding but never received the email (i.e. created before the
 * Firestore onDocumentCreated trigger was deployed).
 *
 * Usage:
 *   cd functions && GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json \
 *     npx ts-node ../scripts/backfillOnboardingEmails.ts [--dry-run]
 *
 * Safety:
 *   - Respects the `onboardingEmailSent` flag (never re-sends).
 *   - Only targets users with onboardingComplete === true.
 *   - --dry-run lists candidates without sending.
 */
import * as admin from 'firebase-admin';

const dryRun = process.argv.includes('--dry-run');

if (admin.apps.length === 0) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

async function main() {
  const { generateBiodataPdf } = await import('../functions/src/biodataPdf');
  const { dispatchEmail } = await import('../functions/src/services/emailProvider');

  console.log(`[Backfill] ${dryRun ? 'DRY RUN — ' : ''}Scanning users with onboardingComplete === true ...`);
  const snap = await db.collection('users').where('onboardingComplete', '==', true).get();
  console.log(`[Backfill] Found ${snap.size} onboarding-complete users.`);

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const d of snap.docs) {
    const u: any = d.data() || {};
    const uid = d.id;

    if (u.onboardingEmailSent === true) {
      skipped++;
      continue;
    }
    if (!u.email) {
      console.warn(`[Backfill] ⚠ ${uid}: no email — skipping.`);
      skipped++;
      continue;
    }

    const email: string = u.email;
    const name = u.fullName || u.name || 'Member';
    const profileId = u.profileId || `KA-${uid.slice(0, 6).toUpperCase()}`;

    if (dryRun) {
      console.log(`[Backfill] [DRY] would send to ${email} (${profileId})`);
      continue;
    }

    try {
      const pdfBuffer = await generateBiodataPdf({ ...u, profileId });
      const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
      await dispatchEmail(
        email, null, 'onboarding_complete', name, 'Kingdom Alliance',
        pdfBase64, `KA_Biodata_${profileId}.pdf`, 'themaster@thekingdomalliances.com'
      );
      await db.collection('users').doc(uid).set({
        onboardingEmailSent: true,
        onboardingEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      sent++;
      console.log(`[Backfill] ✅ ${email} (${profileId})`);
    } catch (err: any) {
      failed++;
      console.error(`[Backfill] ❌ ${email}: ${err.message || err}`);
    }
  }

  console.log(`\n[Backfill] Done. Sent: ${sent} · Skipped (already sent / no email): ${skipped} · Failed: ${failed}`);
}

main().catch((e) => { console.error('[Backfill] Fatal:', e); process.exit(1); });
