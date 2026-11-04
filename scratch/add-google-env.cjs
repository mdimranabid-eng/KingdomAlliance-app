// Re-save the full env var set on thekingdomalliances.com + add GOOGLE_CLIENT_ID.
// Source of truth: api/.env.production-hostinger (values are masked by the API,
// so the whole set must be re-sent on every replace).
const fs = require('fs');
const { execFileSync } = require('child_process');

const lines = fs.readFileSync(`${__dirname}/../api/.env.production-hostinger`, 'utf8')
  .split('\n').filter((l) => l && !l.startsWith('#'));
const envVars = lines.map((l) => {
  const i = l.indexOf('=');
  return { key: l.slice(0, i), value: l.slice(i + 1).trim() };
});
envVars.push({
  key: 'GOOGLE_CLIENT_ID',
  value: '583391827233-99lkvfsgcbmlssorgj0eatjm1mse61fc.apps.googleusercontent.com',
});

console.log('sending', envVars.length, 'env vars:', envVars.map((v) => v.key).join(', '));
const out = execFileSync('node', ['hostinger-mcp.cjs', 'call', 'execute', JSON.stringify({
  operation: 'hosting_nodejs_replace-environment-variables',
  params: { username: 'u182908316', domain: 'thekingdomalliances.com', env_vars: envVars },
})], { encoding: 'utf8' });
const j = JSON.parse(out);
console.log(j.result.content[0].text.slice(0, 300));
