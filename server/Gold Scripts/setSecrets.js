const { execSync } = require('child_process');

const secrets = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '465',
  SMTP_USER: 'gsmtp22@gmail.com',
  SMTP_PASS: 'dkkpigtpxgnvysvs',
  ADMIN_EMAIL_FALLBACK: 'stars@thekingdomalliances.com'
};

function setFirebaseSecrets() {
  console.log('🚀 Starting to configure Firebase Secrets for Cloud Functions...\n');

  for (const [key, value] of Object.entries(secrets)) {
    try {
      console.log(`⏳ Setting secret ${key}...`);
      
      // We pass the secret value via stdin (input option)
      execSync(`npx firebase functions:secrets:set ${key}`, {
        input: value + '\n',
        encoding: 'utf-8',
        stdio: ['pipe', 'inherit', 'inherit']
      });
      
      console.log(`✅ Successfully set ${key}!\n`);
    } catch (error) {
      console.error(`❌ Failed to set secret ${key}:`, error.message);
    }
  }

  console.log('🎉 All secrets have been processed.');
}

setFirebaseSecrets();
