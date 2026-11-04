// Scheduled jobs — port of processPendingDeletions, cleanupExpiredOtps,
// checkPendingApprovalsEvery8Hours. Runs in-process via node-cron AND is exposed
// as secret-protected HTTP endpoints (Hostinger cron can call them).
const { pool } = require('./db');
const store = require('./store');
const { cascadeDeleteUser } = require('./cascadeDelete');
const { dispatchEmail, sendRaw } = require('./services/email');

const ts = (v) => (v && typeof v === 'object' && typeof v.__ts === 'number' ? v.__ts : 0);

// ── Deletion scheduler (hourly) ───────────────────────────────────────────────
async function runDeletionSchedule() {
  const now = Date.now();
  const users = await store.queryDocs('users', {
    wheres: [{ field: 'deletionStatus', op: 'in', value: ['pending_deletion', 'deleting'] }],
  });
  for (const u of users) {
    const d = u.data;
    if (!['pending_deletion', 'deleting'].includes(d.deletionStatus)) continue;
    const due = ts(d.scheduledDeletionAt);
    if (!due || due > now || ts(d.deletionLeaseUntil) > now) continue;
    await store.writeDoc('users', u.id, { deletionStatus: 'deleting', deletionLeaseUntil: { __ts: now + 30 * 60 * 1000 } }, { merge: true });
    try {
      await cascadeDeleteUser(u.id, (m) => console.log(`[DeletionScheduler] ${m}`));
    } catch (err) {
      console.error(`[DeletionScheduler] Cleanup will retry for ${u.id}:`, err.message);
      await store.writeDoc('users', u.id, { deletionLeaseUntil: { __ts: 0 } }, { merge: true }).catch(() => undefined);
      continue;
    }
    if (d.email) {
      try { await dispatchEmail(d.email, null, 'account_deleted'); } catch (e) { console.error('[DeletionScheduler] Final email failed:', e.message); }
    }
    await store.addDoc('deletion_audit', { uid: u.id, completedAt: { __st: 1 } });
  }
  // reminders: pending deletions due within 24h
  for (const u of users) {
    const d = u.data;
    if (d.deletionStatus !== 'pending_deletion' || d.deletionReminderSent || !d.email) continue;
    const due = ts(d.scheduledDeletionAt);
    if (!due || due <= now || due > now + 24 * 60 * 60 * 1000) continue;
    try {
      await dispatchEmail(d.email, null, 'account_deletion_reminder');
      await store.writeDoc('users', u.id, { deletionReminderSent: true }, { merge: true });
    } catch (e) { console.error('[DeletionScheduler] Reminder failed:', e.message); }
  }
}

// ── OTP cleanup (daily 04:00) ─────────────────────────────────────────────────
async function cleanupExpiredOtps() {
  const [r] = await pool.query('DELETE FROM otps WHERE expires_at < NOW()');
  const [r2] = await pool.query('DELETE FROM verification_tokens WHERE expires_at < NOW()');
  console.log(`[OTP Cleanup] Removed ${r.affectedRows} otps, ${r2.affectedRows} tokens.`);
}


// ── Admin moderation alert (every 8h) ─────────────────────────────────────────
async function checkPendingApprovals() {
  const pendingUsers = (await store.queryDocs('users', {
    wheres: [{ field: 'onboardingComplete', op: '==', value: true },
      { field: 'approvalStatus', op: '==', value: 'pending' }],
    orderBys: [{ field: 'createdAt', dir: 'desc' }],
  })).map((u) => ({ id: u.id, name: u.data.name || u.data.fullName || 'Unknown', email: u.data.email || 'No email' }));

  const pendingPhotos = await store.queryDocs('photoModeration', {
    wheres: [{ field: 'photoStatus', op: '==', value: 'pending' }],
  });

  if (!pendingUsers.length && !pendingPhotos.length) {
    console.log('[AdminCheck] Nothing pending. No email sent.');
    return;
  }
  let adminEmails = [];
  try {
    const admins = await store.listDocs('admins');
    adminEmails = admins.map((a) => a.data.email).filter(Boolean);
  } catch { /* ignore */ }
  if (!adminEmails.length) adminEmails = [process.env.ADMIN_EMAIL_FALLBACK || 'stars@thekingdomalliances.com'];

  const rows = pendingUsers.map((u) => `<tr>
    <td style="padding:10px 12px; font-size:14px; color:#1a2e4a; border-bottom:1px solid #f1f5f9;">${u.name}</td>
    <td style="padding:10px 12px; font-size:14px; color:#64748b; border-bottom:1px solid #f1f5f9;">${u.email}</td></tr>`).join('');
  const usersSection = pendingUsers.length ? `
    <h3 style="color:#1a2e4a; margin:0 0 12px;">👤 Pending Profile Approvals (${pendingUsers.length})</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom:28px; border-radius:8px; overflow:hidden;">
      <thead><tr style="background:#f1f5f9;">
        <th style="padding:10px 12px; text-align:left; font-size:11px; color:#64748b; text-transform:uppercase;">Name</th>
        <th style="padding:10px 12px; text-align:left; font-size:11px; color:#64748b; text-transform:uppercase;">Email</th>
      </tr></thead><tbody>${rows}</tbody></table>`
    : '<p style="color:#16a34a; font-size:14px; margin-bottom:24px;">✅ No pending profile approvals.</p>';
  const photosSection = pendingPhotos.length ? `
    <h3 style="color:#1a2e4a; margin:0 0 12px;">📷 Pending Photo Moderation (${pendingPhotos.length})</h3>
    <p style="font-size:14px; color:#64748b; margin-bottom:28px;">${pendingPhotos.length} photo(s) are awaiting review in the Admin Photo Moderation panel.</p>`
    : '<p style="color:#16a34a; font-size:14px; margin-bottom:24px;">✅ No pending photos.</p>';

  for (const email of adminEmails) {
    try {
      await sendRaw(email, 'Admin Alert — Pending Moderation',
        `<div style="font-family: Arial, sans-serif; color:#040e2a; max-width:600px; margin:0 auto; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
          <div style="background:#040e2a; padding:28px; text-align:center;">
            <h1 style="color:#d4af37; margin:0; font-size:22px; letter-spacing:0.05em;">✝ Kingdom Alliance</h1>
            <p style="color:rgba(255,255,255,0.6); margin:8px 0 0; font-size:13px;">Admin Alert — 8-Hour Moderation Check</p>
          </div>
          <div style="padding:28px;">${usersSection}${photosSection}</div></div>`);
    } catch (e) { console.error('[AdminCheck] email failed:', e.message); }
  }
  await store.addDoc('admin-alerts', {
    type: 'pending_check', pendingUsersCount: pendingUsers.length,
    pendingPhotosCount: pendingPhotos.length, adminEmailsSentTo: adminEmails, timestamp: { __st: 1 },
  });
}

const JOBS = { deletions: runDeletionSchedule, 'otp-cleanup': cleanupExpiredOtps, 'approvals-check': checkPendingApprovals };

function startCron() {
  try {
    const cron = require('node-cron');
    cron.schedule('0 * * * *', () => runDeletionSchedule().catch((e) => console.error('[cron] deletions:', e.message)));
    cron.schedule('0 4 * * *', () => cleanupExpiredOtps().catch((e) => console.error('[cron] otp:', e.message)));
    cron.schedule('0 */8 * * *', () => checkPendingApprovals().catch((e) => console.error('[cron] approvals:', e.message)));
    console.log('[cron] scheduled jobs started (hourly deletions, daily otp cleanup, 8h admin alerts)');
  } catch (e) {
    console.warn('[cron] node-cron unavailable — use Hostinger cron against /api/cron/:job:', e.message);
  }
}

module.exports = { JOBS, startCron, runDeletionSchedule, cleanupExpiredOtps, checkPendingApprovals };
