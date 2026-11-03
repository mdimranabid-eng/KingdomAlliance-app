import { onDocumentCreated, onDocumentUpdated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { sendOnboardingEmail } from './secureEmail';

if (admin.apps.length === 0) admin.initializeApp();

// Keep the existing creation trigger name/type so deployment can update it.
const onboardingOptions = {
  document: 'users/{userId}',
  secrets: ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT'],
  retry: true,
};
export const onOnboardingComplete = onDocumentCreated(onboardingOptions, async event => {
  if (event.data?.data().onboardingComplete !== true) return;
  await sendOnboardingEmail(event.params.userId, { db: admin.firestore(), auth: admin.auth() });
});

// Completion of an existing draft must send the same email as a new profile.
export const onOnboardingUpdated = onDocumentUpdated(onboardingOptions, async event => {
  if (event.data?.after.data().onboardingComplete !== true ||
      event.data.before.data().onboardingComplete === true) return;
  await sendOnboardingEmail(event.params.userId, { db: admin.firestore(), auth: admin.auth() });
});

// Members submit church information in their own profile; the backend writes
// the shared directory without overwriting existing church details.
export const syncProfileChurch = onDocumentWritten(
  { document: 'users/{userId}', retry: true },
  async event => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    const fields = ['churchName', 'churchCity', 'churchArea', 'pastorName', 'pastorNumber'];
    if (!after?.onboardingComplete || (before?.onboardingComplete &&
        fields.every(field => before[field] === after[field]))) return;
    const values = fields.map(field => String(after[field] || '').trim());
    if (!values[0]) return;
    const id = values.map(value => value.toLowerCase()).join('||').replace(/[^a-z0-9|]/g, '_').substring(0, 120);
    const ref = admin.firestore().collection('churches').doc(id);
    await admin.firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (snap.exists) {
        tx.update(ref, { members: admin.firestore.FieldValue.arrayUnion(event.params.userId), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      } else {
        tx.create(ref, {
          ...Object.fromEntries(fields.map((field, i) => [field, values[i]])),
          members: [event.params.userId],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });
  }
);
