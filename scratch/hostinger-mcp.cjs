// Minimal Hostinger MCP (Streamable HTTP JSON-RPC) client.
// Usage:
//   node hostinger-mcp.cjs list
//   node hostinger-mcp.cjs call <toolName> '<json-args>'
const fs = require('fs');

const CRED_PATH = `${process.env.HOME}/.config/hostinger-mcp/credentials.json`;
const SERVER = 'https://mcp.hostinger.com/';

function loadToken() {
  const c = JSON.parse(fs.readFileSync(CRED_PATH, 'utf8'));
  // find the access token wherever the CLI stored it
  const tok = c.access_token || c.accessToken || c.token || (c.tokens && c.tokens.accessToken);
  if (!tok) {
    console.error('Could not find access token. Keys:', JSON.stringify(Object.keys(c)));
    process.exit(1);
  }
  return tok;
}

async function rpc(method, params, id) {
  const res = await fetch(SERVER, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${loadToken()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  const text = await res.text();
  if (!res.ok) return { httpStatus: res.status, body: text.slice(0, 500) };
  // may be SSE framed
  if (text.startsWith('event:') || text.startsWith('data:')) {
    const lines = text.split('\n').filter((l) => l.startsWith('data:'));
    for (const l of lines) {
      try { return JSON.parse(l.slice(5).trim()); } catch { /* skip */ }
    }
    return { parseError: text.slice(0, 300) };
  }
  try { return JSON.parse(text); } catch { return { parseError: text.slice(0, 300) }; }
}

async function main() {
  const [cmd, tool, argsJson] = process.argv.slice(2);
  const init = await rpc('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'ka-deploy', version: '1.0.0' },
  }, 1);
  if (init.error) { console.error('INIT FAILED:', JSON.stringify(init).slice(0, 300)); process.exit(1); }
  await rpc('notifications/initialized', {}, 2).catch(() => undefined);

  if (cmd === 'list') {
    const out = await rpc('tools/list', {}, 3);
    const tools = out.result && out.result.tools ? out.result.tools : [];
    if (!tools.length) console.error('RAW LIST RESPONSE:', JSON.stringify(out).slice(0, 2000));
    for (const t of tools) console.log(`${t.name} :: ${t.description ? t.description.split('\n')[0].slice(0, 100) : ''}`);
    console.log(`\n(${tools.length} tools)`);
  } else if (cmd === 'call') {
    const args = argsJson ? JSON.parse(argsJson) : {};
    const out = await rpc('tools/call', { name: tool, arguments: args }, 4);
    console.log(JSON.stringify(out, null, 2).slice(0, 12000));
  } else {
    console.error('Usage: node hostinger-mcp.cjs list | call <tool> <json>');
  }
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
