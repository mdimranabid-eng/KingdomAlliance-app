// Refresh the Hostinger MCP OAuth token via the refresh_token grant.
const fs = require('fs');
const path = `${process.env.HOME}/.local/share/opencode/mcp-auth.json`;
const auth = JSON.parse(fs.readFileSync(path, 'utf8')).hostinger;
console.log('clientInfo:', JSON.stringify(auth.clientInfo));
console.log('serverUrl:', auth.serverUrl);

async function main() {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: auth.tokens.refreshToken,
    client_id: auth.clientInfo && (auth.clientInfo.client_id || auth.clientInfo.clientId || auth.clientInfo.id),
  });
  if (!body.get('client_id')) {
    console.log('NO CLIENT ID — dumping clientInfo for inspection');
    return;
  }
  const res = await fetch('https://auth.hostinger.com/api/external/v1/oauth-server/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json().catch(() => ({}));
  console.log('status:', res.status);
  if (data.access_token) {
    auth.tokens.accessToken = data.access_token;
    if (data.refresh_token) auth.tokens.refreshToken = data.refresh_token;
    auth.tokens.expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    const full = JSON.parse(fs.readFileSync(path, 'utf8'));
    full.hostinger = auth;
    fs.writeFileSync(path, JSON.stringify(full, null, 2));
    console.log('TOKEN REFRESHED, expires', new Date(auth.tokens.expiresAt).toISOString());
  } else {
    console.log('refresh failed:', JSON.stringify(data).slice(0, 300));
  }
}
main().catch((e) => console.log('ERR', e.message));
