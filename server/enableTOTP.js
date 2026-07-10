const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function enableAuthenticatorMFA() {
  try {
    console.log("⏳ Connecting to Google Cloud Identity Platform...");
    
    await admin.auth().projectConfigManager().updateProjectConfig({
      multiFactorConfig: {
        providerConfigs: [
          {
            state: "ENABLED",
            totpProviderConfig: {
              adjacentIntervals: 5 
            }
          }
        ]
      }
    });

    console.log("✅ SUCCESS: TOTP (Authenticator App) MFA is now permanently enabled on your project!");
    process.exit(0);
  } catch (error) {
    console.error("❌ FAILED to enable TOTP:", error);
    process.exit(1);
  }
}

enableAuthenticatorMFA();
