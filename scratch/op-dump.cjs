const { execFileSync } = require('child_process');
const q = process.argv[2];
const out = execFileSync('node', ['hostinger-mcp.cjs', 'call', 'search', JSON.stringify({ query: q })], { encoding: 'utf8' });
const j = JSON.parse(out);
const ops = JSON.parse(j.result.content[0].text);
for (const o of ops) {
  console.log('==', o.operation, '==');
  console.log(' desc:', o.description.split('\n')[0]);
  console.log(' params:', JSON.stringify(o.inputSchema, null, 1).slice(0, 900));
}
