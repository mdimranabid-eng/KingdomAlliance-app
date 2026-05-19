const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function disableAuthenticatorMFA() {
  try {
    console.log("⏳ Connecting to Google Cloud Identity Platform...");
    
    const configManager = admin.auth().projectConfigManager();
    const projectConfig = await configManager.getProjectConfig();
    
    const currentProviders = projectConfig.multiFactorConfig?.providerConfigs || [];
    
    // Safely remove only the TOTP configuration, leaving SMS or others intact
    const newProviders = currentProviders.filter(
      provider => !provider.totpProviderConfig
    );

    await configManager.updateProjectConfig({
      multiFactorConfig: {
        providerConfigs: newProviders
      }
    });

    console.log("🛑 SUCCESS: TOTP (Authenticator App) MFA has been completely disabled!");
    process.exit(0);
  } catch (error) {
    console.error("❌ FAILED to disable TOTP:", error);
    process.exit(1);
  }
}

disableAuthenticatorMFA();
