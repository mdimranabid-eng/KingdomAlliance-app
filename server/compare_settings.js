const admin = require('firebase-admin');
const path = require('path');

// Initialize Staging app
const stagingKey = require('./serviceAccountKey.staging.json');
const stagingApp = admin.initializeApp({
  credential: admin.credential.cert(stagingKey)
}, 'staging');

// Initialize Production app
const productionKey = require('./serviceAccountKey.production.json');
const productionApp = admin.initializeApp({
  credential: admin.credential.cert(productionKey)
}, 'production');

async function run() {
  const stagingDb = stagingApp.firestore();
  const productionDb = productionApp.firestore();

  try {
    console.log('🔄 Fetching site_config from Staging...');
    const stagingSnap = await stagingDb.collection('settings').doc('site_config').get();
    const stagingData = stagingSnap.exists ? stagingSnap.data() : null;

    console.log('🔄 Fetching site_config from Production...');
    const productionSnap = await productionDb.collection('settings').doc('site_config').get();
    const productionData = productionSnap.exists ? productionSnap.data() : null;

    if (!stagingData) {
      console.log('❌ site_config document does not exist in Staging.');
      return;
    }

    console.log('\n--- Current Values in Staging ---');
    console.log(JSON.stringify(stagingData, null, 2));

    console.log('\n--- Current Values in Production ---');
    if (productionData) {
      console.log(JSON.stringify(productionData, null, 2));
    } else {
      console.log('⚠️ Document does not exist in Production!');
    }

    // List differences
    const diffs = {};
    const keys = new Set([...Object.keys(stagingData), ...(productionData ? Object.keys(productionData) : [])]);

    for (const key of keys) {
      const stagingVal = stagingData[key];
      const productionVal = productionData ? productionData[key] : undefined;

      if (JSON.stringify(stagingVal) !== JSON.stringify(productionVal)) {
        diffs[key] = {
          staging: stagingVal,
          production: productionVal
        };
      }
    }

    console.log('\n--- Differences Found ---');
    if (Object.keys(diffs).length === 0) {
      console.log('✅ Staging and Production site_config match perfectly!');
    } else {
      console.log(JSON.stringify(diffs, null, 2));
      
      // Replicate staging to production
      console.log('\n🚀 Replicating Staging site_config to Production...');
      await productionDb.collection('settings').doc('site_config').set(stagingData, { merge: true });
      console.log('✅ Replicated successfully!');
    }

  } catch (error) {
    console.error('❌ Error during comparison:', error.message);
  } finally {
    await stagingApp.delete();
    await productionApp.delete();
  }
}

run();
