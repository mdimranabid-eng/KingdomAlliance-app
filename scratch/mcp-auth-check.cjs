// Inspect Hostinger MCP auth (tokens only, no secrets printed in full).
const fs = require('fs');
const a = JSON.parse(fs.readFileSync(`${process.env.HOME}/.local/share/opencode/mcp-auth.json`, 'utf8')).hostinger;
console.log('top-level keys:', Object.keys(a));
console.log('token keys:', Object.keys(a.tokens || {}));
const t = a.tokens || {};
console.log('has refresh:', !!t.refreshToken);
console.log('access exp:', t.accessToken ? (JSON.parse(Buffer.from(t.accessToken.split('.')[1], 'base64').toString()).exp * 1000) : null, '->', new Date((JSON.parse(Buffer.from(t.accessToken.split('.')[1], 'base64').toString()).exp || 0) * 1000).toISOString());
console.log('now:', new Date().toISOString());
