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

/**
 * Universal dispatcher function
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML body payload
 */
const dispatchEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL ADAPTER] Successfully dispatched to ${to} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ [EMAIL ADAPTER] Delivery failure for ${to}:`, error.message);
    throw new Error('Provider failed to dispatch email');
  }
};

module.exports = { dispatchEmail };
