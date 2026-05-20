const nodemailer = require('nodemailer');
require('dotenv').config();

// ============================================================================
// EMAIL PROVIDER ADAPTER
// If you ever switch from Google SMTP to AWS SES, SendGrid, or Resend, 
// THIS IS THE ONLY FILE YOU NEED TO EDIT.
// ============================================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

const dispatchEmail = async (to_email, secret_value, type, custom_reason = null, senderName = 'A member') => {
  let mailSubject = '';
  let htmlContent = '';

  const isOldSignature = typeof type === 'string' && (type.trim().startsWith('<') || type.includes('<div') || type.includes('<p'));

  if (isOldSignature) {
    mailSubject = secret_value;
    htmlContent = type;
  } else if (type === 'password_reset') {
      mailSubject = 'Your Password Reset OTP - Kingdom Alliance';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #d4af37;">Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset the password for your Kingdom Alliance account. Please use the verification code below to proceed:</p>
              <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                  <h1 style="color: #040e2a; letter-spacing: 4px; margin: 0;">${secret_value}</h1>
              </div>
              <p style="font-size: 14px; color: #64748b;">If you did not request this change, please ignore this email. Your account remains secure.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
      `;
  } else if (type === 'password_reset_success') {
      mailSubject = 'Your Password at Kingdom Alliance was reset';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #16a34a;">Password Reset Successful</h2>
              <p>Hello,</p>
              <p>This is a quick confirmation that the password for your Kingdom Alliance account has been successfully changed.</p>
              <p style="font-size: 14px; color: #64748b;">If you made this change, no further action is required. If you did not authorize this change, please contact our support team immediately.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
      `;
  } else if (type === 'profile_approved') {
      mailSubject = 'Congratulations! Your Kingdom Alliance profile is approved';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #16a34a;">Welcome to Kingdom Alliance!</h2>
              <p>Hello,</p>
              <p><strong>Congratulations! Your Kingdom Alliance profile has been approved.</strong></p>
              <p>You now have full access to the platform. You can log in immediately to start connecting with other members.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
      `;
  } else if (type === 'profile_rejected') {
      mailSubject = 'Action Required: Kingdom Alliance Profile Update';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #dc2626;">Profile Update Required</h2>
              <p>Hello,</p>
              <p>Thank you for applying to join Kingdom Alliance. <strong>Action Required: Your profile needs a few tweaks before approval.</strong></p>
              <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                  <p style="margin: 0; color: #991b1b;"><strong>Admin Notes:</strong> ${custom_reason || 'Please review your profile details and submit again.'}</p>
              </div>
              <p>Please log back into your account to make the requested changes.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
      `;
  } else if (type === 'photo_approved') {
      mailSubject = 'Your Kingdom Alliance Photo is Approved';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #16a34a;">Photo Approved!</h2>
              <p>Hello,</p>
              <p>Great news! The photo you recently uploaded to your Kingdom Alliance profile has been reviewed and <strong>approved</strong>.</p>
              <p>It is now live on your profile for other members to see.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
      `;
  } else if (type === 'photo_rejected') {
      mailSubject = 'Action Required: Kingdom Alliance Photo Update';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #dc2626;">Photo Update Required</h2>
              <p>Hello,</p>
              <p>We recently reviewed a photo you uploaded to Kingdom Alliance. Unfortunately, it does not meet our community guidelines and has been <strong>rejected</strong>.</p>
              <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                  <p style="margin: 0; color: #991b1b;"><strong>Admin Notes:</strong> ${custom_reason || 'Please ensure your photo is clear, appropriate, and clearly shows your face.'}</p>
              </div>
              <p>Please log in and upload a new photo that adheres to our guidelines.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
      `;
  } else if (type === 'connection_request') {
      mailSubject = 'Someone wants to connect with you on Kingdom Alliance!';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #d4af37;">New Connection Request</h2>
              <p>Hello,</p>
              <p>Great news! <strong>${senderName}</strong> has reviewed your profile and would like to connect with you.</p>
              <p>Log in to your Kingdom Alliance account now to view their profile and accept or decline their request.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
      `;
  } else if (type === 'connection_accepted') {
      mailSubject = 'Your connection request was accepted!';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #16a34a;">Connection Accepted!</h2>
              <p>Hello,</p>
              <p><strong>${senderName}</strong> has accepted your connection request!</p>
              <p>You can now send them direct messages and get to know them better. Log in to start the conversation.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
      `;
  } else if (type === 'new_message') {
      mailSubject = 'You have a new message on Kingdom Alliance';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #d4af37;">New Message Received</h2>
              <p>Hello,</p>
              <p>You have just received a new private message from <strong>${senderName}</strong>.</p>
              <p>For your privacy and security, we do not include message contents in emails. Please log in to your Kingdom Alliance inbox to read and reply.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
      `;
  } else {
      // Default fallback for standard OTPs
      mailSubject = 'Your Kingdom Alliance Verification Code';
      htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #040e2a;">
              <h2>Your Verification Code</h2>
              <p>Your code is: <strong>${secret_value}</strong></p>
              <p>Regards,<br/>The Kingdom Alliance Team</p>
          </div>
      `;
  }

  try {
    const mailOptions = {
      from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
      to: to_email,
      subject: mailSubject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL ADAPTER] Successfully dispatched to ${to_email} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ [EMAIL ADAPTER] Delivery failure for ${to_email}:`, error.message);
    throw new Error('Provider failed to dispatch email');
  }
};

module.exports = { dispatchEmail };
