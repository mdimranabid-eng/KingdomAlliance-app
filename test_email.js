const fs = require('fs');
// Simple .env parser
function parseEnv(path) {
  const data = fs.readFileSync(path, { encoding: 'utf8' });
  const lines = data.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
  return env;
}

const env = parseEnv('.env');
const PUBLIC_KEY = env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = env.VITE_EMAILJS_TEMPLATE_ID;

function sendEmail({ to_email, type }) {
  const isPlaceholder =
    !PUBLIC_KEY || PUBLIC_KEY === 'your_public_key' ||
    !SERVICE_ID || SERVICE_ID === 'your_service_id' ||
    !TEMPLATE_ID || TEMPLATE_ID.includes('your_');

  if (isPlaceholder) {
    console.log('\n==================================================');
    console.log(`[SIMULATED EMAIL] To: ${to_email}`);
    console.log('Subject: Welcome to Kingdom Alliance');
    console.log('--------------------------------------------------');
    console.log('Content:\nWelcome! This is a simulated email to confirm the email system is working.');
    console.log('==================================================\n');
    return { status: 200, text: 'Simulated success' };
  }
  // Real email sending would go here using EmailJS.
  console.log('Attempting real email send (not implemented in this environment).');
  return { status: 500, text: 'Real email not configured' };
}

(async () => {
  try {
    const result = sendEmail({ to_email: 'md.imranabid@gmail.com', type: 'welcome' });
    console.log('Email send result:', result);
  } catch (err) {
    console.error('Error sending email:', err);
  }
})();
