import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import { consumeOtpInTransaction } from './otp';
import { dispatchEmail } from './services/emailProvider';

export const DELETION_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
export type DeletionDependencies = {
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  values?: typeof admin.firestore.FieldValue;
  send?: typeof dispatchEmail;
};
export class DeletionError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function createDeletionHandlers(deps: DeletionDependencies) {
  const values = deps.values || admin.firestore.FieldValue;
  const handler = (operation: (uid: string, req: Request) => Promise<unknown>) =>
    async (req: Request, res: Response): Promise<any> => {
      try {
        const token = /^Bearer (\S+)$/.exec(req.headers.authorization || '')?.[1];
        if (!token) throw new DeletionError(401, 'Please sign in.');
        let uid: string;
        try { uid = (await deps.auth.verifyIdToken(token, true)).uid; }
        catch { throw new DeletionError(401, 'Please sign in again.'); }
        const result = await operation(uid, req);
        return res.json({ success: true, ...result as object });
      } catch (error) {
        if (error instanceof DeletionError) return res.status(error.status).json({ error: error.message });
        console.error('[AccountDeletion]', error);
        return res.status(500).json({ error: 'Unable to update account deletion. Please try again.' });
      }
    };
  const email = async (recipient: string | undefined, type: string, reason?: string) => {
    if (!recipient) return;
    try { await (deps.send || dispatchEmail)(recipient, null, type, reason); }
    catch (error) { console.error('[AccountDeletion] Confirmation email failed:', error); }
  };
  return {
    deleteAccount: handler(async (uid, req) => {
      const account = await deps.auth.getUser(uid);
      if (account.customClaims?.admin) throw new DeletionError(403, 'Administrator accounts require the administrator deletion process.');
      const ref = deps.db.collection('users').doc(uid);
      const result = await deps.db.runTransaction(async tx => {
        const data = (await tx.get(ref)).data();
        if (!data) throw new DeletionError(404, 'Profile not found.');
        if (data.deletionStatus === 'deleting') throw new DeletionError(409, 'Permanent deletion is already in progress.');
        if (data.deletionStatus === 'pending_deletion') return { at: data.scheduledDeletionAt.toMillis(), already: true };
        if (typeof req.body?.otp !== 'string' || !/^\d{6}$/.test(req.body.otp)) {
          throw new DeletionError(400, 'Enter the six-digit email verification code.');
        }
        if (!account.email) throw new DeletionError(409, 'Account has no email address.');
        const verified = await consumeOtpInTransaction(tx, deps.db, account.email, req.body.otp, 'delete_account');
        // Return rather than throw so failed-attempt counters are committed.
        if (!verified.ok) return { error: verified.message };
        const at = Date.now() + DELETION_GRACE_MS;
        tx.update(ref, {
          deletionStatus: 'pending_deletion', deletionRequestedAt: values.serverTimestamp(),
          scheduledDeletionAt: admin.firestore.Timestamp.fromMillis(at), deletionReminderSent: false,
          updatedAt: values.serverTimestamp(),
        });
        return { at, already: false };
      }).catch(async error => {
        // If a simultaneous request already committed scheduling, return its
        // confirmed result instead of failing the second browser request.
        const committed = (await ref.get()).data();
        if (committed?.deletionStatus === 'pending_deletion' && committed.scheduledDeletionAt) {
          return { at: committed.scheduledDeletionAt.toMillis() as number, already: true };
        }
        throw error;
      });
      if ('error' in result) throw new DeletionError(400, result.error || 'Invalid verification code.');
      if (!result.already) await email(account.email, 'account_deletion_scheduled', new Date(result.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Riyadh' }));
      return { scheduledDeletionAt: result.at, message: 'Deletion scheduled. Sign in and choose Reactivate before the deadline to cancel.' };
    }),
    reactivateAccount: handler(async uid => {
      const ref = deps.db.collection('users').doc(uid);
      const changed = await deps.db.runTransaction(async tx => {
        const data = (await tx.get(ref)).data();
        if (!data) throw new DeletionError(404, 'Profile not found.');
        if (data.deletionStatus === 'deleting' || (data.deletionStatus === 'pending_deletion' &&
            (!data.scheduledDeletionAt || data.scheduledDeletionAt.toMillis() <= Date.now()))) {
          throw new DeletionError(409, 'The recovery period has ended. This account cannot be reactivated.');
        }
        if (data.deletionStatus !== 'pending_deletion') return false;
        tx.update(ref, { deletionStatus: values.delete(), deletionRequestedAt: values.delete(),
          scheduledDeletionAt: values.delete(), deletionReminderSent: values.delete(), updatedAt: values.serverTimestamp() });
        return true;
      });
      if (changed) await email((await deps.auth.getUser(uid)).email, 'account_reactivated');
      return { message: 'Your account is active.' };
    }),
  };
}
