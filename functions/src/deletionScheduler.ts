import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { cascadeDeleteUser } from './cascadeDelete';
import { dispatchEmail } from './services/emailProvider';

export type SchedulerDependencies = {
  db: admin.firestore.Firestore;
  cleanup?: typeof cascadeDeleteUser;
  send?: typeof dispatchEmail;
  now?: number;
};

export async function runDeletionSchedule(deps: SchedulerDependencies) {
  const { db } = deps;
  const now = deps.now ?? Date.now();
  // Avoid dependency on compound indexes for deletion eligibility.
  const snapshots = await Promise.all(['pending_deletion', 'deleting'].map(status =>
    db.collection('users').where('deletionStatus', '==', status).get()));
  for (const snapshot of snapshots.flatMap(result => result.docs)) {
    const ref = snapshot.ref;
    const claim = await db.runTransaction(async tx => {
      const data = (await tx.get(ref)).data();
      if (!data || !['pending_deletion', 'deleting'].includes(data.deletionStatus) ||
          !data.scheduledDeletionAt || data.scheduledDeletionAt.toMillis() > now || data.deletionLeaseUntil > now) return null;
      tx.update(ref, { deletionStatus: 'deleting', deletionLeaseUntil: now + 30 * 60 * 1000 });
      return data;
    });
    if (!claim) continue;
    try {
      await (deps.cleanup || cascadeDeleteUser)(snapshot.id, message => console.log(`[DeletionScheduler] ${message}`));
    } catch (error) {
      console.error(`[DeletionScheduler] Cleanup will retry for ${snapshot.id}:`, error);
      await ref.update({ deletionLeaseUntil: 0 }).catch(() => undefined);
      continue;
    }
    // Never tell the member deletion completed until cleanup succeeds.
    if (claim.email) {
      try { await (deps.send || dispatchEmail)(claim.email, null, 'account_deleted'); }
      catch (error) { console.error('[DeletionScheduler] Final email failed:', error); }
    }
    await db.collection('deletion_audit').add({ uid: snapshot.id, completedAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  const pending = await db.collection('users').where('deletionStatus', '==', 'pending_deletion').get();
  for (const snapshot of pending.docs) {
    const data = snapshot.data();
    const due = data.scheduledDeletionAt?.toMillis?.();
    if (!due || due <= now || due > now + 24 * 60 * 60 * 1000 || data.deletionReminderSent || !data.email) continue;
    try {
      await (deps.send || dispatchEmail)(data.email, null, 'account_deletion_reminder');
      await snapshot.ref.update({ deletionReminderSent: true });
    } catch (error) { console.error('[DeletionScheduler] Reminder failed:', error); }
  }
}

export const processPendingDeletions = onSchedule(
  { schedule: 'every 60 minutes', timeZone: 'Asia/Riyadh', secrets: ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT'] },
  async () => { await runDeletionSchedule({ db: admin.firestore() }); }
);
