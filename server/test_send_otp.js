'use strict';

const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ─── Manual Environment Variable Loader ──────────────────────────────────────
function loadEnv() {
  const envFiles = ['.env', '.env.development', '.env.production', '.env.staging'];
  let loaded = false;
  for (const file of envFiles) {
    const envPath = path.resolve(__dirname, '../', file);
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
      console.log('✅ Environment variables loaded from:', envPath);
      loaded = true;
    }
  }
  if (!loaded) {
    console.warn('⚠️ No env files found at project root.');
  }
}

loadEnv();

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized with serviceAccountKey.json');
} catch (err) {
  console.log('⚠️ Failed to load serviceAccountKey.json, trying default initialization...');
  admin.initializeApp();
}

const db = admin.firestore();
const TARGET_EMAIL = 'md.imranabid@gmail.com';

async function run() {
  console.log(`🔍 Searching for OTP in 'temp_otps' collection for: ${TARGET_EMAIL}...`);
  
  const snapshot = await db.collection('temp_otps')
    .where('email', '==', TARGET_EMAIL)
    .get();

  let otpCode = '';
  let otpDocId = '';

  if (snapshot.empty) {
    console.log(`ℹ️ No existing OTP found for ${TARGET_EMAIL}. Generating a temporary test OTP...`);
    otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    const newDoc = await db.collection('temp_otps').add({
      email: TARGET_EMAIL,
      otp: otpCode,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    otpDocId = newDoc.id;
    console.log(`✅ Created temporary OTP document: ${otpDocId} with code: ${otpCode}`);
  } else {
    // Sort in-memory by createdAt descending
    const docs = [...snapshot.docs].sort((a, b) => {
      const aTime = a.data().createdAt ? a.data().createdAt.toMillis() : 0;
      const bTime = b.data().createdAt ? b.data().createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    const doc = docs[0];
    const data = doc.data();
    otpCode = data.otp;
    otpDocId = doc.id;
    console.log(`✅ Found existing OTP in database (Doc ID: ${otpDocId}): ${otpCode}`);
  }

  // SMTP Settings
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
  const SMTP_USER = process.env.SMTP_USER || 'gsmtp22@gmail.com';
  const SMTP_PASS = process.env.SMTP_PASS || 'dkkpigtpxgnvysvs';

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

  console.log('⚡ Verifying transporter connection...');
  await transporter.verify();
  console.log('✅ SMTP Transporter verified successfully!');

  console.log(`✉️ Sending OTP email to ${TARGET_EMAIL}...`);
  const info = await transporter.sendMail({
    from: `"Kingdom Alliance" <${SMTP_USER}>`,
    to: TARGET_EMAIL,
    subject: 'Your Kingdom Alliance Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #d4af37;">Verification Required</h2>
          <p>Hello,</p>
          <p>Your secure Kingdom Alliance verification code retrieved from the database is:</p>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #040e2a; letter-spacing: 4px; margin: 0;">${otpCode}</h1>
          </div>
          <p style="font-size: 14px; color: #64748b;">This code was fetched from your temporary OTP collection record.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `
  });

  console.log('🎉 OTP Email sent successfully! Message ID:', info.messageId);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
