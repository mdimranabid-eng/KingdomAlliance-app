import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import { dispatchEmail } from './services/emailProvider';
import { generateBiodataPdf } from './biodataPdf';

type Dependencies = {
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
  send?: typeof dispatchEmail;
  pdf?: typeof generateBiodataPdf;
  fieldValue?: typeof admin.firestore.FieldValue;
};

export class EmailRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const validId = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value);

async function caller(req: Request, auth: admin.auth.Auth) {
  const match = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  if (!match) throw new EmailRequestError(401, 'Authentication required.');
  try {
    return await auth.verifyIdToken(match[1], true);
  } catch {
    throw new EmailRequestError(401, 'Invalid or expired token.');
  }
}

// A lease serializes trigger/HTTP delivery. SMTP cannot guarantee exactly-once
// delivery if the process dies after sending but before recording success.
async function deliverOnce(db: admin.firestore.Firestore, key: string, send: () => Promise<void>, values = admin.firestore.FieldValue) {
  const ref = db.collection('email_deliveries').doc(key);
  const lease = `${Date.now()}-${Math.random()}`;
  const acquired = await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const data = snap.data();
    if (data?.sent === true) return false;
    if (data?.leaseUntil > Date.now()) throw new EmailRequestError(409, 'Email delivery is already in progress.');
    tx.set(ref, { lease, leaseUntil: Date.now() + 10 * 60 * 1000, sent: false });
    return true;
  });
  if (!acquired) return false;
  try {
    await send();
    await ref.set({ sent: true, sentAt: values.serverTimestamp(), leaseUntil: 0 }, { merge: true });
    return true;
  } catch (error) {
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (snap.data()?.lease === lease && !snap.data()?.sent) tx.update(ref, { leaseUntil: 0 });
    });
    throw error;
  }
}

export async function sendOnboardingEmail(uid: string, deps: Dependencies) {
  if (!validId(uid)) throw new EmailRequestError(400, 'Invalid user ID.');
  const ref = deps.db.collection('users').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) throw new EmailRequestError(404, 'User not found.');
  const data = snap.data()!;
  if (data.onboardingComplete !== true) throw new EmailRequestError(409, 'Onboarding is not complete.');
  const member = await deps.auth.getUser(uid);
  if (!member.email || member.email.toLowerCase() !== String(data.email).toLowerCase()) {
    throw new EmailRequestError(409, 'Profile email does not match the account.');
  }
  if (data.onboardingEmailSent === true) return false;
  const sent = await deliverOnce(deps.db, `onboarding_${uid}`, async () => {
    const profileId = data.profileId || `KA-${uid.slice(0, 6).toUpperCase()}`;
    const pdf = await (deps.pdf || generateBiodataPdf)({ ...data, profileId });
    // BCC is controlled exclusively by server configuration.
    const bcc = process.env.ONBOARDING_BCC_EMAILS || 'themaster@thekingdomalliances.com';
    await (deps.send || dispatchEmail)(member.email!, null, 'onboarding_complete',
      data.fullName || data.name || 'Member', 'Kingdom Alliance',
      `data:application/pdf;base64,${pdf.toString('base64')}`, `KA_Biodata_${profileId}.pdf`, bcc);
  }, deps.fieldValue);
  await ref.set({ onboardingEmailSent: true, onboardingEmailSentAt: (deps.fieldValue || admin.firestore.FieldValue).serverTimestamp() }, { merge: true });
  return sent;
}

export function createEmailHandlers(deps: Dependencies) {
  const handle = (operation: (req: Request) => Promise<unknown>) => async (req: Request, res: Response): Promise<any> => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
    try {
      const result = await operation(req);
      return res.json({ success: true, sent: result });
    } catch (error) {
      if (error instanceof EmailRequestError) return res.status(error.status).json({ error: error.message });
      console.error('[SecureEmail] Delivery failed:', error);
      return res.status(500).json({ error: 'Unable to send email.' });
    }
  };
  return {
    onboarding: handle(async req => {
      const decoded = await caller(req, deps.auth);
      const uid = req.body?.uid;
      if (!validId(uid)) throw new EmailRequestError(400, 'Invalid user ID.');
      const record = await deps.auth.getUser(decoded.uid);
      if (uid !== decoded.uid && (record.customClaims?.admin !== true || decoded.admin !== true || !decoded.firebase?.sign_in_second_factor)) {
        throw new EmailRequestError(403, 'Only the owner or an administrator may request this email.');
      }
      return sendOnboardingEmail(uid, deps);
    }),
    notification: handle(async req => {
      const decoded = await caller(req, deps.auth);
      const { type, interestId } = req.body || {};
      if (!['connection_request', 'connection_accepted'].includes(type) || !validId(interestId)) {
        throw new EmailRequestError(400, 'Use the dedicated account endpoints for account emails.');
      }
      const interest = (await deps.db.collection('interests').doc(interestId).get()).data();
      const request = type === 'connection_request';
      if (!interest || (request ? interest.fromId : interest.toId) !== decoded.uid ||
          interest.status !== (request ? 'pending' : 'accepted')) {
        throw new EmailRequestError(403, 'No matching connection action.');
      }
      const sender = (await deps.db.collection('users').doc(decoded.uid).get()).data();
      if (!sender?.isApproved || sender.isBanned || sender.isSuspended) {
        throw new EmailRequestError(403, 'An approved active account is required.');
      }
      const recipient = await deps.auth.getUser(request ? interest.toId : interest.fromId);
      if (!recipient.email) throw new EmailRequestError(409, 'Recipient has no email.');
      return deliverOnce(deps.db, `${type}_${interestId}`, async () => {
        // Bound mail volume even when an approved member creates many interests.
        const limit = deps.db.collection('email_delivery_limits').doc(`${type}_${recipient.uid}`);
        await deps.db.runTransaction(async tx => {
          const data = (await tx.get(limit)).data();
          const now = Date.now();
          const current = data && now - data.startedAt < 60 * 60 * 1000;
          if (current && data.count >= 8) throw new EmailRequestError(429, 'Too many notification emails. Try again later.');
          tx.set(limit, { startedAt: current ? data.startedAt : now, count: current ? data.count + 1 : 1 });
        });
        await (deps.send || dispatchEmail)(recipient.email!, null, type, null,
          String(sender.name || 'A member').replace(/[<>&"']/g, ''));
      }, deps.fieldValue);
    }),
  };
}
