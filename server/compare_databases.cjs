const admin = require('firebase-admin');

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

async function getCollectionStats(db) {
  const collections = await db.listCollections();
  const stats = {};

  for (const collection of collections) {
    const colId = collection.id;
    const snap = await collection.limit(5).get();
    const countSnap = await collection.count().get();
    const count = countSnap.data().count;

    // Get sample fields from the first document if available
    let fields = [];
    if (!snap.empty) {
      fields = Object.keys(snap.docs[0].data());
    }

    stats[colId] = {
      count,
      fields: fields.sort()
    };
  }

  return stats;
}

async function run() {
  const stagingDb = stagingApp.firestore();
  const productionDb = productionApp.firestore();

  try {
    console.log('🔄 Querying Staging database structures...');
    const stagingStats = await getCollectionStats(stagingDb);

    console.log('🔄 Querying Production database structures...');
    const productionStats = await getCollectionStats(productionDb);

    console.log('\n==================================================');
    console.log('DATABASE STRUCTURE COMPARISON REPORT (NO CHANGES)');
    console.log('==================================================\n');

    const allCollections = new Set([...Object.keys(stagingStats), ...Object.keys(productionStats)]);

    console.log(String.prototype.padEnd ? 
      `| ${'Collection'.padEnd(20)} | ${'Staging Count'.padEnd(15)} | ${'Prod Count'.padEnd(12)} | ${'Status/Mismatch'.padEnd(30)} |` :
      `| Collection | Staging Count | Prod Count | Status/Mismatch |`
    );
    console.log('|' + '-'.repeat(22) + '|' + '-'.repeat(17) + '|' + '-'.repeat(14) + '|' + '-'.repeat(32) + '|');

    for (const col of allCollections) {
      const staging = stagingStats[col];
      const prod = productionStats[col];

      let status = 'Matching';
      if (!staging) {
        status = '⚠️ Only exists in Production';
      } else if (!prod) {
        status = '⚠️ Only exists in Staging';
      } else {
        // Compare fields
        const missingInProd = staging.fields.filter(f => !prod.fields.includes(f));
        const missingInStaging = prod.fields.filter(f => !staging.fields.includes(f));
        
        if (missingInProd.length > 0 || missingInStaging.length > 0) {
          status = '❌ Field structure mismatch';
        }
      }

      console.log(String.prototype.padEnd ?
        `| ${col.padEnd(20)} | ${String(staging ? staging.count : 0).padEnd(15)} | ${String(prod ? prod.count : 0).padEnd(12)} | ${status.padEnd(30)} |` :
        `| ${col} | ${staging ? staging.count : 0} | ${prod ? prod.count : 0} | ${status} |`
      );
    }

    console.log('\n--- Field Structure Mismatches Detail ---');
    let hasMismatches = false;
    for (const col of allCollections) {
      const staging = stagingStats[col];
      const prod = productionStats[col];
      if (staging && prod) {
        const missingInProd = staging.fields.filter(f => !prod.fields.includes(f));
        const missingInStaging = prod.fields.filter(f => !staging.fields.includes(f));

        if (missingInProd.length > 0 || missingInStaging.length > 0) {
          hasMismatches = true;
          console.log(`\nCollection [${col}]:`);
          if (missingInProd.length > 0) {
            console.log(`  - Fields in Staging but missing in Production: ${JSON.stringify(missingInProd)}`);
          }
          if (missingInStaging.length > 0) {
            console.log(`  - Fields in Production but missing in Staging: ${JSON.stringify(missingInStaging)}`);
          }
        }
      }
    }
    if (!hasMismatches) {
      console.log('✅ No document field mismatches found in any collection!');
    }

  } catch (error) {
    console.error('❌ Error comparing databases:', error.message);
  } finally {
    await stagingApp.delete();
    await productionApp.delete();
  }
}

run();
