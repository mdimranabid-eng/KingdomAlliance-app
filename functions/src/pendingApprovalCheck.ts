import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

//ADD THIS — Initialize before any Firebase service call
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const getDb = () => admin.firestore();

// ============================================================
// EMAIL DISPATCHER
// Mirrors server/services/emailProvider.js exactly
// ============================================================

const sendAdminAlert = async (
  toEmails: string[],
  pendingUsersCount: number,
  pendingPhotosCount: number,
  pendingUsers: { name: string; email: string }[],
  pendingPhotos: { userId: string }[]
) => {
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const pendingUsersRows = pendingUsers.map(u => `
    <tr>
      <td style="padding:10px 12px; font-size:14px; color:#1a2e4a;
        border-bottom:1px solid #f1f5f9;">${u.name}</td>
      <td style="padding:10px 12px; font-size:14px; color:#64748b;
        border-bottom:1px solid #f1f5f9;">${u.email}</td>
    </tr>
  `).join('');

  const usersSection = pendingUsersCount > 0 ? `
    <h3 style="color:#1a2e4a; margin:0 0 12px;">
      👤 Pending Profile Approvals (${pendingUsersCount})
    </h3>
    <table style="width:100%; border-collapse:collapse;
      margin-bottom:28px; border-radius:8px; overflow:hidden;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px 12px; text-align:left;
            font-size:11px; color:#64748b; text-transform:uppercase;
            letter-spacing:0.05em;">Name</th>
          <th style="padding:10px 12px; text-align:left;
            font-size:11px; color:#64748b; text-transform:uppercase;
            letter-spacing:0.05em;">Email</th>
        </tr>
      </thead>
      <tbody>${pendingUsersRows}</tbody>
    </table>
  ` : `
    <p style="color:#16a34a; font-size:14px; margin-bottom:24px;">
      ✅ No pending profile approvals.
    </p>
  `;

  const photosSection = pendingPhotosCount > 0 ? `
    <h3 style="color:#1a2e4a; margin:0 0 12px;">
      📷 Pending Photo Moderation (${pendingPhotosCount})
    </h3>
    <p style="font-size:14px; color:#64748b; margin-bottom:28px;">
      ${pendingPhotosCount} photo(s) are awaiting review
      in the Admin Photo Moderation panel.
    </p>
  ` : `
    <p style="color:#16a34a; font-size:14px; margin-bottom:24px;">
      ✅ No pending photos.
    </p>
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #040e2a;
      max-width: 600px; margin: 0 auto; padding: 0;
      border: 1px solid #e2e8f0; border-radius: 12px;
      overflow: hidden;">

      <div style="background: linear-gradient(135deg, #040e2a 0%, #1a2e4a 100%);
        padding: 28px; text-align: center;">
        <h1 style="color: #d4af37; margin: 0; font-size: 22px;
          letter-spacing: 0.05em;">✝ Kingdom Alliance</h1>
        <p style="color: rgba(255,255,255,0.60); margin: 8px 0 0;
          font-size: 13px;">Admin Alert — 8-Hour Moderation Check</p>
      </div>

      <div style="padding: 28px;">
        <div style="background: #fff8e6; border: 1px solid #d4af3740;
          border-radius: 10px; padding: 16px; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 14px; color: #1a2e4a;">
            ⚠️ <strong>Action Required:</strong>
            ${pendingUsersCount} pending profile(s) and
            ${pendingPhotosCount} pending photo(s)
            require your attention.
          </p>
        </div>

        ${usersSection}
        ${photosSection}

        <div style="text-align: center; margin-top: 8px;">
          <a href="https://kingdom-alliance-v2.web.app/admin/approvals"
            style="display: inline-block;
              background: linear-gradient(135deg, #040e2a, #1a2e4a);
              color: #ffffff; padding: 13px 28px; border-radius: 8px;
              text-decoration: none; font-weight: 600; font-size: 13px;
              margin-right: 10px;">
            Review Profiles
          </a>
          <a href="https://kingdom-alliance-v2.web.app/admin/photos"
            style="display: inline-block;
              background: linear-gradient(135deg, #d4af37, #b8860b);
              color: #040e2a; padding: 13px 28px; border-radius: 8px;
              text-decoration: none; font-weight: 600; font-size: 13px;">
            Review Photos
          </a>
        </div>
      </div>

      <div style="padding: 18px 28px; background: #f8fafc;
        text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          Automated alert from Kingdom Alliance.
          Sent every 8 hours only when action is required.
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
    to: toEmails.join(', '),
    subject: `⚠️ Kingdom Alliance — ${pendingUsersCount} Profile(s) & ${pendingPhotosCount} Photo(s) Pending Review`,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Admin alert sent to ${toEmails.join(', ')} (ID: ${info.messageId})`);
};

// ============================================================
// SCHEDULED FUNCTION — Every 8 Hours
// ============================================================

export const checkPendingApprovalsEvery8Hours = onSchedule(
  {
    schedule: 'every 8 hours',
    timeZone: 'Asia/Kolkata',
    secrets: ['SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL_FALLBACK']
  },
  async (event: any) => {
    try {
      const db = getDb();
      console.log('🔍 Running 8-hour admin moderation check...');

      // 1. Fetch all admin emails from Firestore
      // with hardcoded fallback for reliability
      const adminsSnap = await db.collection('admins').get();
      let adminEmails: string[] = adminsSnap.docs
        .map((doc: any) => doc.data().email as string)
        .filter(Boolean);

      console.log(`📋 Found ${adminEmails.length} admin(s) in Firestore:`, adminEmails);

      // Fallback to hardcoded email if Firestore
      // admins collection is empty or has no emails
      if (adminEmails.length === 0) {
        const fallback = process.env.ADMIN_EMAIL_FALLBACK || 'stars@thekingdomalliances.com';
        console.warn(`⚠️ No admin emails in Firestore. Using fallback: ${fallback}`);
        adminEmails = [fallback];
      }

      // 2. Check pending user approvals
      const pendingUsersSnap = await db
        .collection('users')
        .where('onboardingComplete', '==', true)
        .where('approvalStatus', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      const pendingUsers = pendingUsersSnap.docs.map((doc: any) => ({
        id: doc.id,
        name: doc.data().name || 'Unknown',
        email: doc.data().email || 'No email'
      }));

      // 3. Check pending photo moderation
      const pendingPhotosSnap = await db
        .collection('photoModeration')
        .where('photoStatus', '==', 'pending')
        .get();

      const pendingPhotos = pendingPhotosSnap.docs.map((doc: any) => ({
        id: doc.id,
        userId: doc.data().userId || 'Unknown'
      }));

      // 4. Stay silent if nothing pending
      if (pendingUsers.length === 0 && pendingPhotos.length === 0) {
        console.log('✅ Nothing pending. No email sent.');
        return;
      }

      // 5. Send the alert email
      console.log(`📧 Sending alert to: ${adminEmails.join(', ')}`);
      console.log(`📊 SMTP_USER set: ${!!process.env.SMTP_USER}`);
      console.log(`📊 SMTP_PASS set: ${!!process.env.SMTP_PASS}`);

      await sendAdminAlert(
        adminEmails,
        pendingUsers.length,
        pendingPhotos.length,
        pendingUsers,
        pendingPhotos
      );

      // 6. Log to Firestore
      await db.collection('admin-alerts').add({
        type: 'pending_check',
        pendingUsersCount: pendingUsers.length,
        pendingPhotosCount: pendingPhotos.length,
        adminEmailsSentTo: adminEmails,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(
        `✅ Done. Users: ${pendingUsers.length} | ` +
        `Photos: ${pendingPhotos.length} | ` +
        `Admins notified: ${adminEmails.length}`
      );

    } catch (error) {
      console.error('❌ Admin check failed:', error);
    }
  }
);
