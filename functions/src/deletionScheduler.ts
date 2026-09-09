import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { cascadeDeleteUser } from './cascadeDelete';
import { dispatchEmail } from './services/emailProvider';

// ============================================================
// Daily scheduled job: permanently deletes accounts whose
// 7-day grace window (requested by the user themselves) has
// expired. Only touches users where:
//   deletionStatus == 'pending_deletion' AND
//   scheduledDeletionAt < now
// ============================================================

const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const processPendingDeletions = onSchedule(
  {
    schedule: 'every day 03:00',
    timeZone: 'Asia/Kolkata',
    secrets: ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT']
  },
  async (event) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // 1) Permanent deletions: grace window expired
    const expiredSnap = await db.collection('users')
      .where('deletionStatus', '==', 'pending_deletion')
      .where('scheduledDeletionAt', '<=', now)
      .get();

    console.log(`[DeletionScheduler] ${expiredSnap.size} account(s) due for permanent deletion.`);

    for (const doc of expiredSnap.docs) {
      const uid = doc.id;
      const logs: string[] = [];
      const log = (msg: string) => {
        console.log(`[DeletionScheduler] ${msg}`);
        logs.push(msg);
      };

      // Send the final confirmation email BEFORE destroying the account
      // (the Auth record is deleted in Stage A, so do this first).
      const email = doc.data().email;
      if (email) {
        try {
          await dispatchEmail(email, '', 'account_deleted');
        } catch (err: any) {
          log(`⚠️  Could not send account_deleted email to ${email}: ${err.message}`);
        }
      }

      try {
        await cascadeDeleteUser(uid, log);
      } catch (err: any) {
        console.error(`[DeletionScheduler] Cascade deletion failed for ${uid}, will retry next run:`, err.message);
        continue; // keep deletionStatus so the next run retries
      }

      // Record that deletion completed (audit trail survives the user doc)
      await db.collection('deletion_audit').add({
        uid,
        email: email || null,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        logs
      }).catch(() => undefined);
    }

    // 2) Final reminders: exactly ~24h before deletion (between day 6 and day 7)
    const reminderFrom = admin.firestore.Timestamp.fromMillis(Date.now() + GRACE_PERIOD_MS - 24 * 60 * 60 * 1000);
    const reminderSnap = await db.collection('users')
      .where('deletionStatus', '==', 'pending_deletion')
      .where('scheduledDeletionAt', '>=', reminderFrom)
      .where('scheduledDeletionAt', '<=', admin.firestore.Timestamp.fromMillis(Date.now() + GRACE_PERIOD_MS))
      .get();

    for (const doc of reminderSnap.docs) {
      const data = doc.data();
      if (data.deletionReminderSent) continue; // only once
      if (!data.email) continue;
      try {
        await dispatchEmail(data.email, '', 'account_deletion_reminder');
        await doc.ref.update({ deletionReminderSent: true });
        console.log(`[DeletionScheduler] Final reminder sent to ${data.email}`);
      } catch (err: any) {
        console.error(`[DeletionScheduler] Reminder email failed for ${data.email}:`, err.message);
      }
    }

    console.log('[DeletionScheduler] Run complete.');
  }
);
