// Email dispatcher — port of functions/src/services/emailProvider.ts (nodemailer).
// dispatchEmail(to, secret_value, type, custom_reason?, senderName?, attachmentBase64?, attachmentFilename?, bcc?)
const nodemailer = require('nodemailer');

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(String(process.env.SMTP_PORT || '465').trim());
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    auth: { user: (process.env.SMTP_USER || '').trim(), pass: (process.env.SMTP_PASS || '').trim() },
  });
  return transporter;
}

const wrap = (title, body) => `
  <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
    <h2 style="color: #d4af37; margin-top: 0;">${title}</h2>
    ${body}
    <p style="margin-bottom: 5px;">Regards,</p>
    <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
    <p style="font-size: 12px; color: #999999; margin: 0; text-align: center;">Kingdom Alliance — Christian Matrimony Platform</p>
    <p style="font-size: 12px; color: #999999; margin: 4px 0 0 0; text-align: center;">thekingdomalliances.com</p>
  </div>`;

const codeBlock = (code) => `
  <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
    <h1 style="color: #040e2a; letter-spacing: 4px; margin: 0;">${code}</h1>
  </div>`;

function template(type, secret, reason, senderName) {
  switch (type) {
    case 'otp':
      return ['Your Kingdom Alliance Verification Code', wrap('Verification Required',
        '<p>Hello,</p><p>Your secure Kingdom Alliance verification code is:</p>' + codeBlock(secret) +
        '<p style="font-size: 14px; color: #64748b;">If you did not request this change, please ignore this email. Your account remains secure.</p>')];
    case 'password_reset':
      return ['Your Password Reset OTP - Kingdom Alliance', wrap('Password Reset Request',
        '<p>Hello,</p><p>We received a request to reset the password for your Kingdom Alliance account. Please use the verification code below to proceed:</p>' + codeBlock(secret) +
        '<p style="font-size: 14px; color: #64748b;">If you did not request this change, please ignore this email. Your account remains secure.</p>')];
    case 'password_reset_success':
      return ['Your Password at Kingdom Alliance was reset', wrap('Password Reset Successful',
        '<p>Hello,</p><p>Your Kingdom Alliance account password was successfully reset. If you did not perform this reset, contact support immediately.</p>')];
    case 'connection_request':
      return ['You have a new connection request on Kingdom Alliance', wrap('New Connection Request',
        `<p>Hello,</p><p><strong>${senderName || 'A member'}</strong> has sent you a connection request on Kingdom Alliance.</p>
         <p style="font-size: 14px; color: #64748b;">Log in to your account to view the request and respond.</p>`)];
    case 'connection_accepted':
      return ['Your connection request was accepted on Kingdom Alliance', wrap('Connection Accepted',
        `<p>Hello,</p><p><strong>${senderName || 'A member'}</strong> accepted your connection request! You can now start messaging each other.</p>`)];
    case 'onboarding_complete':
      return ['Welcome to Kingdom Alliance — Profile & Signed Covenant Attached', wrap('Profile Completed & Covenant Confirmed',
        `<p>Hello <strong>${secret || 'Member'}</strong>,</p>
         <p>Welcome to Kingdom Alliance! Your official profile registration and Christian matrimony onboarding have been successfully completed.</p>
         <p>Attached to this email is your confidential <strong>Member Profile Record & Signed Terms & Conditions Agreement</strong> (PDF), complete with your electronic signature certificate and verification timestamp.</p>
         <p>Our administration team will review your profile shortly. You will receive an email once the verification is complete.</p>
         <p style="font-size: 13px; color: #64748b; margin-top: 18px;">Please retain this attached document for your personal records.</p>`)];
    case 'account_deletion_scheduled':
      return ['Your Kingdom Alliance account deletion is scheduled', wrap('Account Deletion Scheduled',
        `<p>Hello,</p><p>We received your request to delete your Kingdom Alliance account. Your account and all associated data will be permanently deleted on <strong>${reason || 'the scheduled date'}</strong>.</p>
         <p>If you change your mind, simply sign in and choose <strong>Reactivate</strong> before the deadline to cancel the deletion.</p>`)];
    case 'account_deletion_reminder':
      return ['Reminder: your Kingdom Alliance account will be deleted soon', wrap('Deletion Reminder',
        '<p>Hello,</p><p>This is a reminder that your Kingdom Alliance account is scheduled for permanent deletion within the next 24 hours.</p><p>Sign in and choose Reactivate before the deadline if you wish to keep your account.</p>')];
    case 'account_reactivated':
      return ['Your Kingdom Alliance account is active again', wrap('Account Reactivated',
        '<p>Hello,</p><p>Your Kingdom Alliance account deletion was cancelled and your account is fully active again. Welcome back!</p>')];
    case 'account_deleted':
      return ['Your Kingdom Alliance account has been deleted', wrap('Account Deleted',
        '<p>Hello,</p><p>Your Kingdom Alliance account and all associated data have been permanently deleted as requested.</p><p>We are sorry to see you go.</p>')];

    case 'admin_password_reset':
      return ['Your Kingdom Alliance administrator password was reset', wrap('Administrator Password Reset',
        `<p>Hello,</p><p>Your Kingdom Alliance administrator password was reset by a system administrator. Your temporary password is:</p>` + codeBlock(secret) +
        '<p>Sign in and change your password immediately.</p>')];
    case 'admin_deletion_otp':
      return ['Admin Deletion Verification Code — Kingdom Alliance',
        `<div style="font-family: Arial, Helvetica, sans-serif; color: #333333; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #dddddd; border-radius: 4px; overflow: hidden;">
          <div style="background: #1a1a2e; padding: 24px 30px; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">KINGDOM ALLIANCE</h1>
            <p style="color: #999999; margin: 4px 0 0 0; font-size: 11px; letter-spacing: 1px;">ADMIN DELETION VERIFICATION</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1a1a2e; font-size: 18px; margin: 0 0 16px 0;">Deletion Verification Code</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 12px 0;">An administrator is requesting to delete an admin account. Use the code below to verify this action.</p>
            <div style="background: #fef2f2; border-left: 3px solid #dc2626; padding: 12px 16px; margin: 16px 0;">
              <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0; text-align: center; letter-spacing: 6px;">${secret || ''}</p>
            </div>
            <p style="font-size: 13px; color: #999999; margin: 0 0 8px 0;">This code expires in 10 minutes. If you did not request this deletion, please disregard this email and contact the platform owner immediately.</p>
          </div>
        </div>`];
    default:
      return ['Your Kingdom Alliance Verification Code',
        `<div style="font-family: Arial, sans-serif; color: #040e2a;"><h2>Your Verification Code</h2>
         <p>Your code is: <strong>${secret}</strong></p><p>Regards,<br/>The Kingdom Alliance Team</p></div>`];
  }
}

async function dispatchEmail(toEmail, secretValue, type, customReason = null, senderName = 'A member',
  attachmentBase64, attachmentFilename, bccEmail) {
  // Legacy raw-HTML signature (type is HTML, secret is the subject)
  const isOld = typeof type === 'string' && (type.trim().startsWith('<') || type.includes('<div') || type.includes('<p'));
  let subject; let html;
  if (isOld) {
    subject = secretValue || 'Notification';
    html = type;
  } else {
    [subject, html] = template(type, secretValue, customReason, senderName);
  }
  const mailOptions = {
    from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    html,
  };
  if (bccEmail) mailOptions.bcc = bccEmail;
  if (attachmentBase64 && attachmentFilename) {
    const b64 = String(attachmentBase64).includes(';base64,')
      ? String(attachmentBase64).split(';base64,').pop()
      : attachmentBase64;
    mailOptions.attachments = [{ filename: attachmentFilename, content: b64, encoding: 'base64' }];
  }
  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log(`✅ [EMAIL] Dispatched to ${toEmail} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ [EMAIL] Delivery failure for ${toEmail}:`, error.message);
    throw new Error('Provider failed to dispatch email');
  }
}

// Per-email/per-type abuse limiter (port of checkEmailRateLimit)
const { pool } = require('../db');
async function checkEmailRateLimit(email, kind, maxPerHour = 8) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS n FROM email_log WHERE email = ? AND template = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
    [String(email).toLowerCase(), kind]
  );
  if (rows[0].n >= maxPerHour) {
    throw new Error(`Too many emails sent to ${email} in the last hour. Please try again later.`);
  }
  await pool.query('INSERT INTO email_log (email, template, ok) VALUES (?, ?, 1)', [String(email).toLowerCase(), kind]);
}

async function sendRaw(toEmail, subject, html) {
  try {
    const info = await getTransporter().sendMail({
      from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
      to: toEmail, subject, html,
    });
    console.log(`✅ [EMAIL] Raw dispatch to ${toEmail} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ [EMAIL] Raw delivery failure for ${toEmail}:`, error.message);
    throw new Error('Provider failed to dispatch email');
  }
}

module.exports = { dispatchEmail, sendRaw, checkEmailRateLimit, getTransporter };
