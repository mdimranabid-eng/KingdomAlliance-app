// Set Node env vars on thekingdomalliances.com via Hostinger MCP.
// Secrets are generated here and saved to api/.env.production-hostinger (local only).
const fs = require('fs');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const gen = (n) => crypto.randomBytes(n).toString('hex');
const JWT_SECRET = gen(48);
const OTP_HASH_SALT = gen(24);
const CRON_SECRET = gen(16);
const ADMIN_PASSWORD = gen(6) + 'A1!'; // 12+ chars, mixed

const envVars = [
  { key: 'NODE_ENV', value: 'production' },
  { key: 'JWT_SECRET', value: JWT_SECRET },
  { key: 'OTP_HASH_SALT', value: OTP_HASH_SALT },
  { key: 'ACCESS_TOKEN_TTL', value: '15m' },
  { key: 'REFRESH_TTL_DAYS', value: '30' },
  { key: 'SMTP_HOST', value: 'smtp.gmail.com' },
  { key: 'SMTP_PORT', value: '465' },
  { key: 'SMTP_USER', value: 'gsmtp22@gmail.com' },
  { key: 'SMTP_PASS', value: 'dkkpigtpxgnvysvs' },
  { key: 'ADMIN_EMAIL_FALLBACK', value: 'stars@thekingdomalliances.com' },
  { key: 'ONBOARDING_BCC_EMAILS', value: 'themaster@thekingdomalliances.com' },
  { key: 'SUPPORT_EMAIL', value: 'support@thekingdomalliances.com' },
  { key: 'SITE_NAME', value: 'The Kingdom Alliances' },
  { key: 'CRON_SECRET', value: CRON_SECRET },
  { key: 'PUBLIC_BASE_URL', value: 'https://thekingdomalliances.com' },
  { key: 'DIST_DIR', value: 'dist' },
  { key: 'UPLOAD_DIR', value: 'uploads' },
  { key: 'MAX_UPLOAD_MB', value: '10' },
  { key: 'BOOTSTRAP_ADMIN_EMAIL', value: 'themaster@thekingdomalliances.com' },
  { key: 'BOOTSTRAP_ADMIN_PASSWORD', value: ADMIN_PASSWORD },
];

// save locally (never committed — .env* is gitignored)
const local = ['# Hostinger production env (set via MCP on thekingdomalliances.com)'];
for (const v of envVars) local.push(`${v.key}=${v.value}`);
fs.writeFileSync(`${__dirname}/../api/.env.production-hostinger`, local.join('\n') + '\n');

const out = execFileSync('node', ['hostinger-mcp.cjs', 'call', 'execute', JSON.stringify({
  operation: 'hosting_nodejs_replace-environment-variables',
  params: {
    username: 'u182908316',
    domain: 'thekingdomalliances.com',
    env_vars: envVars,
  },
})], { encoding: 'utf8' });
const j = JSON.parse(out);
console.log(j.result.content[0].text.slice(0, 400));
console.log('ADMIN PASSWORD:', ADMIN_PASSWORD);
