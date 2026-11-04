// Refresh the Hostinger MCP CLI credentials (access_token via refresh_token).
const fs = require('fs');
const path = `${process.env.HOME}/.config/hostinger-mcp/credentials.json`;
const c = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('expires_at:', new Date(c.expires_at).toISOString(), '| now:', new Date().toISOString());

async function main() {
  const res = await fetch('https://auth.hostinger.com/api/external/v1/oauth-server/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: c.refresh_token,
      client_id: c.client_id,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.access_token) {
    c.access_token = data.access_token;
    if (data.refresh_token) c.refresh_token = data.refresh_token;
    c.expires_at = Date.now() + (data.expires_in || 3600) * 1000;
    fs.writeFileSync(path, JSON.stringify(c, null, 2));
    console.log('REFRESHED, expires', new Date(c.expires_at).toISOString());
  } else {
    console.log('refresh failed:', res.status, JSON.stringify(data).slice(0, 200));
  }
}
main().catch((e) => console.log('ERR', e.message));
