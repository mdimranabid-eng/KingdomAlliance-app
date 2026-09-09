import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

const db = () => admin.firestore();

/**
 * Enforce interest rate limit: max 5 interests per user per 24 hours.
 * Runs as a Firestore trigger so it works regardless of how the interest
 * was created (frontend, API, direct SDK, etc.).
 */
export const enforceInterestRateLimit = onDocumentWritten(
  'interests/{connectionId}',
  async (event) => {
    // Only react to new document creations
    if (!event.data?.after.exists) return;
    if (event.data?.before.exists) return;

    const interest = event.data.after.data();
    if (!interest) return;
    if (interest.status !== 'pending') return;

    const fromUid = interest.fromId;
    if (!fromUid) return;

    const now = Date.now();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    // Count interests from this user in the last 24 hours
    const interestsSnap = await db()
      .collection('interests')
      .where('fromId', '==', fromUid)
      .where('createdAt', '>=', twentyFourHoursAgo)
      .get();

    const MAX_DAILY_INTERESTS = 5;

    // If this creation pushes them over the limit, delete the new interest
    if (interestsSnap.size > MAX_DAILY_INTERESTS) {
      const interestRef = db().collection('interests').doc(event.params.connectionId);
      await interestRef.delete();

      // Log the rate limit violation
      console.warn(
        `Rate limit hit: user ${fromUid} sent interest ${event.params.connectionId} ` +
        `but already had ${interestsSnap.size - 1} interests in the last 24h. Interest deleted.`
      );

      // Notify the sender
      const earliestReset = new Date(now + 24 * 60 * 60 * 1000);
      await db().collection('notifications').add({
        userId: fromUid,
        type: 'rate_limit',
        title: 'Interest Limit Reached',
        message: `You can send up to ${MAX_DAILY_INTERESTS} interests per day. Your limit will reset around ${earliestReset.toLocaleString()}.`,
        read: false,
        createdAt: admin.firestore.Timestamp.now(),
      });
    }
  }
);