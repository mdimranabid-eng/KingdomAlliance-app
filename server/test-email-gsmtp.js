'use strict';

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ─── Manual Environment Variable Loader ──────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
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
    console.log('✅ Environment variables successfully loaded from:', envPath);
  } else {
    console.warn('⚠️ No .env file found at:', envPath);
  }
}

loadEnv();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

if (!SMTP_USER || !SMTP_PASS) {
  console.error('❌ Error: SMTP_USER or SMTP_PASS environment variables are missing!');
  process.exit(1);
}

console.log('📬 Initializing transporter with user:', SMTP_USER);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

(async () => {
  try {
    console.log('⚡ Verifying transporter connection...');
    await transporter.verify();
    console.log('✅ SMTP Transporter verified successfully!');

    console.log(`✉️ Sending test email to ${SMTP_USER}...`);
    const info = await transporter.sendMail({
      from: `"Kingdom Alliance Test" <${SMTP_USER}>`,
      to: SMTP_USER,
      subject: "Kingdom Alliance SMTP Test",
      text: "Hello! This is a secure test email validating the direct Google SMTP (Nodemailer) pipeline for Kingdom Alliance v2.",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #6750A4;">Kingdom Alliance</h2>
          <p>This is a secure test email validating the direct Google SMTP (Nodemailer) pipeline for Kingdom Alliance v2.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });

    console.log('🎉 Email sent successfully! Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Test failed with error:', error);
  }
})();
