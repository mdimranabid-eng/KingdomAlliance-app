// Fetch Firebase/Identity Toolkit project config several ways to find the
// Google OAuth web client ID + current authorized domains.
const fs = require('fs');
const path = require('path');
const sa = require(path.resolve('../server/serviceAccountKey.production.json'));
const API_KEY = 'AIzaSyDXfpTscwOXj_aWofLj3y5mzIQmrAoHoVE'; // production web API key
const PROJECT = sa.project_id;

async function main() {
  // 1) admin v2 config (service account)
  try {
    const { GoogleAuth } = require(path.resolve('../api/node_modules/google-auth-library'));
    const auth = new GoogleAuth({ credentials: sa, clientOptions: { scopes: ['https://www.googleapis.com/auth/identitytoolkit', 'https://www.googleapis.com/auth/firebase', 'https://www.googleapis.com/auth/cloud-platform'] } });
    const client = await auth.getClient();
    const res = await client.request({ url: `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT}/config` });
    console.log('=== admin v2 config keys:', Object.keys(res.data));
    console.log('authorizedDomains:', JSON.stringify(res.data.authorizedDomains));
    console.log('full:', JSON.stringify(res.data).slice(0, 1500));
  } catch (e) {
    console.log('admin v2 ERR:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 300));
  }

  // 2) old public v3 relyingparty getProjectConfig (web API key)
  try {
    const r = await fetch(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${API_KEY}`);
    const t = await r.text();
    console.log('=== v3 getProjectConfig status', r.status, ':', t.slice(0, 800));
  } catch (e) { console.log('v3 ERR', e.message); }
}
main().catch((e) => { console.log('ERR', e.message); process.exit(1); });
