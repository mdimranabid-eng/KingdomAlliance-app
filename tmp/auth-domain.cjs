const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const CANDIDATES = ['server/serviceAccountKey.production.json', 'server/serviceAccountKey.json', 'server/Staging serviceAccountKey.json'];
const keyPath = CANDIDATES.find(p => fs.existsSync(p) && /production|kingdom-alliance-v2/i.test(fs.readFileSync(p, 'utf8')));
console.log('using:', keyPath);
(async () => {
  const sa = require(path.resolve(keyPath));
  const projectId = sa.project_id;
  console.log('project:', projectId);
  const auth = new GoogleAuth({ credentials: sa, clientOptions: { scopes: ['https://www.googleapis.com/auth/identitytoolkit', 'https://www.googleapis.com/auth/firebase'] } });
  const client = await auth.getClient();
  const base = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;
  const get = await client.request({ url: base });
  const domains = get.data.authorizedDomains || [];
  console.log('current domains:', domains);
  const has = domains.some(d => /madebyimran\.org$/.test(d));
  const want = [
    'kingdom.madebyimran.org',
    'madebyimran.org',
    domain => has,
  ];
  const updates = [];
  for (const w of ['kingdom.madebyimran.org', 'madebyimran.org']) {
    if (!domains.includes(w)) updates.push(w);
  }
  if (!updates.length) { console.log('already authorized'); return; }
  const patch = await client.request({
    url: base + '?updateMask=authorizedDomains',
    method: 'PATCH',
    data: { authorizedDomains: [...domains, ...updates] },
  });
  console.log('patched. now:', patch.data.authorizedDomains);
})().catch(e => { console.error('ERR', e.response?.status, e.response?.data || e.message); process.exit(1); });
