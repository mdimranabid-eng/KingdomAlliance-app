// Trigger hooks — port of the Cloud Functions Firestore triggers:
// onUserStatusChanged, onOnboardingComplete/Updated, syncProfileChurch,
// enforceInterestRateLimit, onInterestCreated, onInterestAccepted,
// onChatMessageCreated, onContactMessageCreated.
const { getDoc, writeDoc, addDoc, queryDocs, deleteDoc, tsWrap } = require('./store');
const { dispatchEmail } = require('./services/email');
const { sendPush } = require('./firebaseadmin');
const { generateBiodataPdf } = require('./biodata');

const g = (d, k, def) => (d && typeof d === 'object' && k in d ? d[k] : def);
const CHURCH_FIELDS = ['churchName', 'churchCity', 'churchArea', 'pastorName', 'pastorNumber'];

async function fcmToUser(uid, title, body, data) {
  try {
    const user = await getDoc('users', uid);
    if (!user) return;
    const tokens = Array.isArray(user.data.fcmTokens) ? user.data.fcmTokens : [];
    if (!tokens.length) return;
    const resp = await sendPush(tokens, { title, body }, data || {});
    const bad = [];
    (resp.responses || []).forEach((r, i) => {
      if (!r.success) bad.push(tokens[i]);
    });
    if (bad.length) {
      await writeDoc('users', uid, { fcmTokens: { __ar: bad } }, { merge: true });
    }
  } catch (err) {
    console.error('[triggers] fcmToUser failed:', err.message);
  }
}

// ── users doc changed: status emails + church sync (onUserStatusChanged etc.) ──
async function onUserWrite(id, before, after) {
  if (!after) return;
  const email = g(after, 'email');
  const name = g(after, 'name') || g(after, 'fullName') || 'Member';
  if (email && before) {
    const approvedNow = g(before, 'approvalStatus') !== 'approved' && g(after, 'approvalStatus') === 'approved';
    const rejectedNow = g(before, 'approvalStatus') !== 'rejected' && g(after, 'approvalStatus') === 'rejected';
    try {
      const { sendRaw } = require('./services/email');
      if (approvedNow) {
        await sendRaw(email, 'Congratulations! Your Kingdom Alliance profile is approved',
          `<div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #16a34a; margin-top: 0;">Welcome to Kingdom Alliance!</h2>
            <p>Hello ${name},</p><p><strong>Congratulations! Your Kingdom Alliance profile has been approved by our administration team.</strong></p>
            <p>You now have full access to search and connect with other members. Log in immediately to start your journey.</p>
            <p style="margin-bottom: 5px;">Regards,</p><p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p></div>`);
      } else if (rejectedNow) {
        const reason = g(after, 'rejectedReason') || 'Please review your profile details and submit again.';
        await sendRaw(email, 'Action Required: Kingdom Alliance Profile Update',
          `<div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #dc2626; margin-top: 0;">Profile Update Required</h2>
            <p>Hello ${name},</p><p>After review, your profile needs some updates before approval:</p>
            <p style="background:#fef2f2; padding:12px; border-left:4px solid #dc2626;"><em>${reason}</em></p>
            <p>Please sign in to update your profile and resubmit for review.</p>
            <p style="margin-bottom: 5px;">Regards,</p><p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p></div>`);
      }
    } catch (err) {
      console.error('[triggers] status email failed:', err.message);
    }
  }

  // onboarding complete (false → true, or created complete)
  const onboardingNow = g(after, 'onboardingComplete') === true && (!before || g(before, 'onboardingComplete') !== true);
  if (onboardingNow && g(after, 'onboardingEmailSent') !== true) {
    sendOnboardingEmail(id, after).catch((e) => console.error('[triggers] onboarding email failed:', e.message));
  }

  // syncProfileChurch
  if (g(after, 'onboardingComplete') === true) {
    const changed = !before || CHURCH_FIELDS.some((f) => g(before, f) !== g(after, f));
    if (changed) {
      const values = CHURCH_FIELDS.map((f) => String(g(after, f) || '').trim());
      if (values[0]) {
        const churchId = values.map((v) => v.toLowerCase()).join('||').replace(/[^a-z0-9|]/g, '_').substring(0, 120);
        const existing = await getDoc('churches', churchId);
        if (existing) {
          await writeDoc('churches', churchId, { members: { __au: [id] }, updatedAt: { __st: 1 } }, { merge: true });
        } else {
          await writeDoc('churches', churchId, {
            ...Object.fromEntries(CHURCH_FIELDS.map((f, i) => [f, values[i]])),
            members: [id],
            createdAt: { __st: 1 },
            updatedAt: { __st: 1 },
          }, { createOnly: true });
        }
      }
    }
  }
}


// ── onboarding email with exactly-once lease (port of secureEmail.ts) ─────────
async function deliverOnce(key, send) {
  const existing = await getDoc('email_deliveries', key);
  if (existing && existing.data.sent === true) return false;
  if (existing && existing.data.leaseUntil && existing.data.leaseUntil > Date.now()) return false;
  await writeDoc('email_deliveries', key, { lease: `${Date.now()}`, leaseUntil: Date.now() + 10 * 60 * 1000, sent: false }, { merge: true });
  try {
    await send();
    await writeDoc('email_deliveries', key, { sent: true, sentAt: tsWrap(Date.now()), leaseUntil: 0 }, { merge: true });
    return true;
  } catch (err) {
    await writeDoc('email_deliveries', key, { leaseUntil: 0 }, { merge: true });
    throw err;
  }
}

async function sendOnboardingEmail(uid, profileData) {
  const user = await getDoc('users', uid);
  if (!user) return false;
  const data = profileData || user.data;
  if (data.onboardingComplete !== true) return false;
  if (data.onboardingEmailSent === true) return false;
  const email = String(data.email || '').toLowerCase();
  const sent = await deliverOnce(`onboarding_${uid}`, async () => {
    const profileId = data.profileId || `KA-${uid.slice(0, 6).toUpperCase()}`;
    const pdf = await generateBiodataPdf({ ...data, profileId });
    const bcc = process.env.ONBOARDING_BCC_EMAILS || 'themaster@thekingdomalliances.com';
    await dispatchEmail(email, data.fullName || data.name || 'Member', 'onboarding_complete',
      null, 'Kingdom Alliance',
      pdf.toString('base64'), `KA_Biodata_${profileId}.pdf`, bcc);
  });
  await writeDoc('users', uid, { onboardingEmailSent: true, onboardingEmailSentAt: tsWrap(Date.now()) }, { merge: true });
  return sent;
}

// ── interests: rate limit + push (enforceInterestRateLimit, onInterestCreated) ─
async function onInterestWrite(id, before, after) {
  if (!after) return;
  const created = !before;
  if (created && g(after, 'status') === 'pending') {
    const fromId = g(after, 'fromId');
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const recent = await queryDocs('interests', {
      wheres: [{ field: 'fromId', op: '==', value: fromId },
        { field: 'createdAt', op: '>=', value: { __ts: since } }],
    });
    if (recent.length > 5) {
      await deleteDoc('interests', id);
      await addDoc('notifications', {
        userId: fromId, type: 'rate_limit', title: 'Interest Limit Reached',
        message: `You can send up to 5 interests per day. Your limit will reset around ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}.`,
        read: false, createdAt: tsWrap(Date.now()),
      });
      return;
    }
    const toId = g(after, 'toId');
        const sender = await getDoc('users', fromId);
    const senderName = (sender && (sender.data.name || sender.data.fullName)) || 'A member';
    await fcmToUser(toId, 'New Connection Request', `${senderName} wants to connect with you!`,
      { type: 'interest', fromId, connectionId: id });
    return;
  }
  if (before && g(before, 'status') === 'pending' && g(after, 'status') === 'accepted') {
    const fromId = g(after, 'fromId');
    const toId = g(after, 'toId');
    const accepter = await getDoc('users', toId);
    const accepterName = (accepter && (accepter.data.name || accepter.data.fullName)) || 'A member';
    await fcmToUser(fromId, 'Connection Accepted!', `${accepterName} accepted your connection request!`,
      { type: 'accepted', fromId: toId, connectionId: id });
  }
}

// ── chat messages (onChatMessageCreated): push + offline digest email ─────────
async function onMessageCreate(collPath, id, data) {
  const receiverId = g(data, 'receiverId');
  const senderId = g(data, 'senderId');
  if (!receiverId || !senderId) return;
  const sender = await getDoc('users', senderId);
  const senderName = (sender && (sender.data.name || sender.data.fullName)) || 'A member';
  await fcmToUser(receiverId, `New message from ${senderName}`, 'You have a new message on Kingdom Alliance',
    { type: 'message', fromId: senderId, chatId: g(data, 'chatId') });

  try {
    const receiver = await getDoc('users', receiverId);
    if (!receiver || !receiver.data.email) return;
    const { pool } = require('./db');
    const [pres] = await pool.query('SELECT state FROM presence WHERE uid = ? LIMIT 1', [receiverId]);
    if (pres.length && pres[0].state !== 'offline') return;
    const lastActive = (receiver.data.lastActive && receiver.data.lastActive.__ts) || 0;
    const lastEmailSent = (receiver.data.lastEmailSent && receiver.data.lastEmailSent.__ts) || 0;
    if (lastEmailSent >= lastActive) return;
    const { sendRaw } = require('./services/email');
    await sendRaw(receiver.data.email, 'You have a new message on Kingdom Alliance',
      `<div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #d4af37;">New Message Received</h2>
        <p>Hello,</p><p><strong>${senderName}</strong> has sent you a new message on Kingdom Alliance.</p>
        <p style="font-size: 14px; color: #64748b;">For your privacy and security, we do not include message contents in emails. Please log in to your Kingdom Alliance messages to read and reply.</p>
        <p style="margin-bottom: 5px;">Regards,</p><p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p></div>`);
    await writeDoc('users', receiverId, { lastEmailSent: tsWrap(Date.now()) }, { merge: true });
  } catch (err) {
    console.error('[triggers] offline digest failed:', err.message);
  }
}

// ── contact message → admin email (onContactMessageCreated) ───────────────────
async function onContactMessageCreate(id, data) {
  try {
    let adminEmail = process.env.ADMIN_EMAIL_FALLBACK || 'stars@thekingdomalliances.com';
    const cfg = await getDoc('settings', 'site_config');
    if (cfg && cfg.data.adminNotificationEmails) adminEmail = cfg.data.adminNotificationEmails;
    const { sendRaw } = require('./services/email');
    await sendRaw(adminEmail, `📧 New Contact Form Submission: ${g(data, 'subject') || 'No Subject'}`,
      `<div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #b8860b; margin-top: 0;">New Contact Form Message</h2>
        <p>You have received a new message from the contact form:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td><td>${g(data, 'name') || 'N/A'}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td>${g(data, 'email') || 'N/A'}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Mobile:</td><td>${g(data, 'mobile') || 'N/A'}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Subject:</td><td>${g(data, 'subject') || 'N/A'}</td></tr>
        </table>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #b8860b; border-radius: 4px; margin-top: 15px;">
          <p style="margin: 0; font-weight: bold; margin-bottom: 5px;">Message Details:</p>
          <p style="margin: 0; white-space: pre-wrap; font-style: italic;">${g(data, 'message') || 'No message contents provided.'}</p>
        </div></div>`);
  } catch (err) {
    console.error('[triggers] contact email failed:', err.message);
  }
}

async function onDocWrite(collPath, id, before, after) {
  try {
    if (collPath === 'users') return await onUserWrite(id, before, after);
    if (collPath === 'interests') return await onInterestWrite(id, before, after);
    if (collPath === 'contact_messages') return await onContactMessageCreate(id, after);
    if (collPath.endsWith('/messages')) return await onMessageCreate(collPath, id, after);
  } catch (err) {
    console.error(`[triggers] onDocWrite ${collPath}/${id} failed:`, err.message);
  }
}

module.exports = { onDocWrite, onUserWrite, sendOnboardingEmail, deliverOnce, fcmToUser };

