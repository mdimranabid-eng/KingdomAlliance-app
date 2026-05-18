import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// ─── Manual Environment Variable Loader ──────────────────────────────────────
function loadEnv(): void {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const data = fs.readFileSync(envPath, { encoding: 'utf8' });
    const lines = data.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

loadEnv();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const isPlaceholder = !SMTP_USER || !SMTP_PASS || SMTP_USER.includes('your_') || SMTP_PASS.includes('your_');

const isProduction = process.env.NODE_ENV === 'production';

let transporter: nodemailer.Transporter | null = null;

if (!isPlaceholder && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    tls: {
      rejectUnauthorized: isProduction
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ [Mailer TS] SMTP connection verification FAILED:', error);
    } else {
      console.log('✅ [Mailer TS] SMTP transporter successfully verified & active!');
    }
  });
} else {
  console.warn('⚠️ [Mailer TS] SMTP credentials missing or using placeholders. Running in SIMULATION mode.');
}

/**
 * 1. PROFILE PHOTO APPROVAL PIPELINE
 */
export async function sendProfilePhotoApprovalEmail(userEmail: string, userName: string): Promise<any> {
  const subject = "Kingdom Alliance | Your Profile Photo Has Been Approved! 🎉";
  const fromName = "Kingdom Alliance";
  const fromEmail = SMTP_USER || "no-reply@kingdomalliance.com";

  const htmlContent = `
<div style="font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E6E1E5; border-radius: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: rgba(103, 80, 164, 0.1); border-radius: 16px; margin-bottom: 16px; color: #6750A4; font-size: 28px; font-weight: bold; text-align: center;">†</div>
    <h2 style="font-size: 24px; font-weight: 800; color: #1C1B1F; margin: 0; font-family: 'Outfit', 'Inter', sans-serif;">Kingdom Alliance</h2>
    <p style="font-size: 13px; color: #958DA5; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Matrimony Rooted in Faith & Values</p>
  </div>
  <div style="color: #49454F; line-height: 1.7; font-size: 15px;">
    <p style="font-size: 17px; font-weight: 700; color: #1C1B1F; margin-top: 0; margin-bottom: 16px;">Dear ${userName},</p>
    <p style="margin-bottom: 16px;">We are pleased to inform you that your primary Profile Photo has been successfully reviewed and approved by our team.</p>
    <p style="margin-bottom: 24px; background-color: #F6F4F9; border-left: 4px solid #6750A4; padding: 16px; border-radius: 8px; color: #1C1B1F;">
      Your profile is now fully visible to other members and is actively appearing in match recommendations.
    </p>
    <p style="margin-bottom: 0;">Thank you for maintaining an authentic community profile!</p>
  </div>
  <div style="margin-top: 36px; text-align: center;">
    <a href="http://localhost:3000/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #6750A4; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(103, 80, 164, 0.2); transition: all 0.2s;">Access My Dashboard</a>
  </div>
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #E6E1E5; text-align: center; font-size: 12px; color: #958DA5;">
    <p style="margin: 0;">You received this safety update because you are a registered member of Kingdom Alliance.</p>
    <p style="margin: 4px 0 0 0;">Riyadh, Saudi Arabia | support@kingdomalliance.com</p>
  </div>
</div>
  `;

  if (isPlaceholder || !transporter) {
    console.log(`\n==================================================`);
    console.log(`[SIMULATED EMAIL] To: ${userEmail} (${userName})`);
    console.log(`Subject: ${subject}`);
    console.log(`--------------------------------------------------`);
    console.log(`Content:\nWe are pleased to inform you that your primary Profile Photo has been approved.`);
    console.log(`==================================================\n`);
    return { status: 200, text: 'Simulated success' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
      text: `Dear ${userName},\n\nWe are pleased to inform you that your primary Profile Photo has been successfully reviewed and approved by our team. Your profile is now fully visible to other members and is actively appearing in match recommendations. Thank you for maintaining an authentic community profile!`
    });
    return info;
  } catch (error) {
    console.error(`❌ [Mailer TS] Failed to send Profile Photo Approval email:`, error);
    throw error;
  }
}

/**
 * 2. PROFILE PHOTO REJECTION PIPELINE
 */
export async function sendProfilePhotoRejectionEmail(userEmail: string, userName: string, rejectionReason: string): Promise<any> {
  const subject = "Action Required: Kingdom Alliance Profile Photo Update ⚠️";
  const fromName = "Kingdom Alliance";
  const fromEmail = SMTP_USER || "no-reply@kingdomalliance.com";

  const htmlContent = `
<div style="font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E6E1E5; border-radius: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: rgba(179, 38, 30, 0.1); border-radius: 16px; margin-bottom: 16px; color: #B3261E; font-size: 28px; font-weight: bold; text-align: center;">⚠️</div>
    <h2 style="font-size: 24px; font-weight: 800; color: #1C1B1F; margin: 0; font-family: 'Outfit', 'Inter', sans-serif;">Kingdom Alliance</h2>
    <p style="font-size: 13px; color: #958DA5; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Action Required: Profile Photo Update</p>
  </div>
  <div style="color: #49454F; line-height: 1.7; font-size: 15px;">
    <p style="font-size: 17px; font-weight: 700; color: #1C1B1F; margin-top: 0; margin-bottom: 16px;">Dear ${userName},</p>
    <p style="margin-bottom: 16px;">During our routine safety verification, your primary Profile Photo was declined for the following reason:</p>
    <div style="background-color: #FFF0F0; border-left: 4px solid #B3261E; padding: 18px; border-radius: 12px; color: #B3261E; font-weight: 600; font-size: 15px; margin-bottom: 24px; line-height: 1.5;">
      "${rejectionReason}"
    </div>
    <p style="margin-bottom: 16px; color: #1C1B1F; font-weight: 500;">
      As a result, your primary photo has been safely blurred on your profile layout.
    </p>
    <p style="margin-bottom: 0;">Please log in to your dashboard to upload a conforming profile picture so matches can see you clearly.</p>
  </div>
  <div style="margin-top: 36px; text-align: center;">
    <a href="http://localhost:3000/register" style="display: inline-block; padding: 14px 32px; background-color: #B3261E; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(179, 38, 30, 0.2); transition: all 0.2s;">Re-upload Profile Photo</a>
  </div>
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #E6E1E5; text-align: center; font-size: 12px; color: #958DA5;">
    <p style="margin: 0;">You received this safety update because you are a registered member of Kingdom Alliance.</p>
    <p style="margin: 4px 0 0 0;">Riyadh, Saudi Arabia | support@kingdomalliance.com</p>
  </div>
</div>
  `;

  if (isPlaceholder || !transporter) {
    console.log(`\n==================================================`);
    console.log(`[SIMULATED EMAIL] To: ${userEmail} (${userName})`);
    console.log(`Subject: ${subject}`);
    console.log(`--------------------------------------------------`);
    console.log(`Content:\nYour primary Profile Photo was declined. Reason: ${rejectionReason}`);
    console.log(`==================================================\n`);
    return { status: 200, text: 'Simulated success' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
      text: `Dear ${userName},\n\nDuring our routine safety verification, your primary Profile Photo was declined for the following reason:\n\n"${rejectionReason}"\n\nAs a result, your photo has been safely blurred on your profile. Please log in to upload a conforming profile picture.`
    });
    return info;
  } catch (error) {
    console.error(`❌ [Mailer TS] Failed to send Profile Photo Rejection email:`, error);
    throw error;
  }
}

/**
 * 3. GALLERY PHOTO APPROVAL PIPELINE
 */
export async function sendGalleryPhotoApprovalEmail(userEmail: string, userName: string): Promise<any> {
  const subject = "Kingdom Alliance | Your New Gallery Photo Is Live! 📸";
  const fromName = "Kingdom Alliance";
  const fromEmail = SMTP_USER || "no-reply@kingdomalliance.com";

  const htmlContent = `
<div style="font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E6E1E5; border-radius: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: rgba(103, 80, 164, 0.1); border-radius: 16px; margin-bottom: 16px; color: #6750A4; font-size: 28px; font-weight: bold; text-align: center;">📸</div>
    <h2 style="font-size: 24px; font-weight: 800; color: #1C1B1F; margin: 0; font-family: 'Outfit', 'Inter', sans-serif;">Kingdom Alliance</h2>
    <p style="font-size: 13px; color: #958DA5; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Media Gallery Live Update</p>
  </div>
  <div style="color: #49454F; line-height: 1.7; font-size: 15px;">
    <p style="font-size: 17px; font-weight: 700; color: #1C1B1F; margin-top: 0; margin-bottom: 16px;">Dear ${userName},</p>
    <p style="margin-bottom: 16px;">Great news! The photo you recently uploaded to your personal album/gallery has passed moderation and is now live.</p>
    <p style="margin-bottom: 24px; background-color: #F6F4F9; border-left: 4px solid #6750A4; padding: 16px; border-radius: 8px; color: #1C1B1F;">
      Other members visiting your full profile can now view this update in your media gallery.
    </p>
    <p style="margin-bottom: 0;">Enhancing your photo album is a wonderful way to tell your story and connect with matching profiles.</p>
  </div>
  <div style="margin-top: 36px; text-align: center;">
    <a href="http://localhost:3000/profile" style="display: inline-block; padding: 14px 32px; background-color: #6750A4; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(103, 80, 164, 0.2); transition: all 0.2s;">View My Profile</a>
  </div>
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #E6E1E5; text-align: center; font-size: 12px; color: #958DA5;">
    <p style="margin: 0;">You received this safety update because you are a registered member of Kingdom Alliance.</p>
    <p style="margin: 4px 0 0 0;">Riyadh, Saudi Arabia | support@kingdomalliance.com</p>
  </div>
</div>
  `;

  if (isPlaceholder || !transporter) {
    console.log(`\n==================================================`);
    console.log(`[SIMULATED EMAIL] To: ${userEmail} (${userName})`);
    console.log(`Subject: ${subject}`);
    console.log(`--------------------------------------------------`);
    console.log(`Content:\nGreat news! The photo you recently uploaded to your gallery is now live.`);
    console.log(`==================================================\n`);
    return { status: 200, text: 'Simulated success' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
      text: `Dear ${userName},\n\nGreat news! The photo you recently uploaded to your personal album/gallery has passed moderation and is now live. Other members visiting your full profile can now view this update in your media gallery.`
    });
    return info;
  } catch (error) {
    console.error(`❌ [Mailer TS] Failed to send Gallery Photo Approval email:`, error);
    throw error;
  }
}

/**
 * 4. GALLERY PHOTO REJECTION PIPELINE
 */
export async function sendGalleryPhotoRejectionEmail(userEmail: string, userName: string, rejectionReason: string): Promise<any> {
  const subject = "Update: Kingdom Alliance Gallery Photo Notification ℹ";
  const fromName = "Kingdom Alliance";
  const fromEmail = SMTP_USER || "no-reply@kingdomalliance.com";

  const htmlContent = `
<div style="font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E6E1E5; border-radius: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: rgba(149, 141, 165, 0.1); border-radius: 16px; margin-bottom: 16px; color: #958DA5; font-size: 28px; font-weight: bold; text-align: center;">ℹ</div>
    <h2 style="font-size: 24px; font-weight: 800; color: #1C1B1F; margin: 0; font-family: 'Outfit', 'Inter', sans-serif;">Kingdom Alliance</h2>
    <p style="font-size: 13px; color: #958DA5; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Media Gallery Notification</p>
  </div>
  <div style="color: #49454F; line-height: 1.7; font-size: 15px;">
    <p style="font-size: 17px; font-weight: 700; color: #1C1B1F; margin-top: 0; margin-bottom: 16px;">Dear ${userName},</p>
    <p style="margin-bottom: 16px;">We are writing to let you know that an image uploaded to your personal media gallery/album did not meet our community guidelines and was declined for the following reason:</p>
    <div style="background-color: #F4F3F6; border-left: 4px solid #958DA5; padding: 18px; border-radius: 12px; color: #49454F; font-weight: 600; font-size: 15px; margin-bottom: 24px; line-height: 1.5;">
      "${rejectionReason}"
    </div>
    <p style="margin-bottom: 16px; color: #1C1B1F;">
      Please note that your primary profile status and overall visibility remain completely unaffected; only this specific gallery item has been hidden.
    </p>
    <p style="margin-bottom: 0;">You are welcome to upload an alternative photo to your album at any time.</p>
  </div>
  <div style="margin-top: 36px; text-align: center;">
    <a href="http://localhost:3000/profile" style="display: inline-block; padding: 14px 32px; background-color: #958DA5; color: #ffffff; text-decoration: none; border-radius: 16px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(149, 141, 165, 0.2); transition: all 0.2s;">Go to My Album</a>
  </div>
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #E6E1E5; text-align: center; font-size: 12px; color: #958DA5;">
    <p style="margin: 0;">You received this safety update because you are a registered member of Kingdom Alliance.</p>
    <p style="margin: 4px 0 0 0;">Riyadh, Saudi Arabia | support@kingdomalliance.com</p>
  </div>
</div>
  `;

  if (isPlaceholder || !transporter) {
    console.log(`\n==================================================`);
    console.log(`[SIMULATED EMAIL] To: ${userEmail} (${userName})`);
    console.log(`Subject: ${subject}`);
    console.log(`--------------------------------------------------`);
    console.log(`Content:\nA gallery photo was declined. Reason: ${rejectionReason}`);
    console.log(`==================================================\n`);
    return { status: 200, text: 'Simulated success' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
      text: `Dear ${userName},\n\nWe are writing to let you know that an image uploaded to your personal media gallery/album did not meet our community guidelines and was declined for the following reason:\n\n"${rejectionReason}"\n\nOnly this specific item was hidden; your primary status is completely unaffected.`
    });
    return info;
  } catch (error) {
    console.error(`❌ [Mailer TS] Failed to send Gallery Photo Rejection email:`, error);
    throw error;
  }
}
