#!/bin/bash
# Deploy the production build to kingdom.madebyimran.org (Hostinger).
# Pushes a prebuilt hostinger-deploy branch, then triggers Hostinger git pull.
set -euo pipefail

BRANCH="hostinger-deploy"
REPO_URL="https://github.com/mdimranabid-eng/KingdomAlliance-app.git"
DOMAIN="kingdom.madebyimran.org"
USER="u182908316"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Building production bundle"
cd "$ROOT"
npm run build

echo "==> Preparing deploy branch"
GIT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/ka-deploy.XXXXXX")"
TAG="$(git --git-dir="$ROOT/.git" worktree add --orphan -b "$BRANCH" "$GIT_DIR" && echo ok)"
trap 'git --git-dir="$ROOT/.git" worktree remove --force "$GIT_DIR" 2>/dev/null; git --git-dir="$ROOT/.git" worktree prune' EXIT
cp -R dist/. "$GIT_DIR/"
cat > "$GIT_DIR/.htaccess" << 'HT'
# Kingdom Alliance SPA — route everything to index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{HTTPS} !=on
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>
<FilesMatch "^(index\.html|\.htaccess)$">
  Header set Cache-Control "no-store, must-revalidate"
</FilesMatch>
<IfModule mod_headers.c>
  <FilesMatch "\.(js|css|png|jpg|jpeg|gif|svg|woff2?)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
HT

cd "$GIT_DIR"
git add -A
if git -c user.name="deploy" -c user.email="deploy@local" commit -q -m "Hostinger deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"; then
  git push -f origin "$BRANCH"
else
  echo "Nothing changed since last deploy"
fi
cd "$ROOT"

echo "==> Triggering Hostinger deploy"
cat > "$TEMP/hmcp-deploy.$$.cjs" << 'EOJS'
const { spawn } = require('child_process');
const DOMAIN = process.env.HS_DOMAIN, USER = process.env.HS_USER, REPO = process.env.HS_REPO, BRANCH = process.env.HS_BRANCH;
const child = spawn('npx', ['-y', '@hostinger/mcp'], { stdio: ['pipe', 'pipe', 'pipe'] });
let buf = ''; const pending = new Map(); let id = 1;
child.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) !== -1) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!l) continue; let m; try { m = JSON.parse(l); } catch { continue; } if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } } });
const send = (method, params) => new Promise((res, rej) => { const i = id++; pending.set(i, res); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: i, method, params }) + '\n'); setTimeout(() => { if (pending.has(i)) { pending.delete(i); rej(new Error('timeout')); } }, 300000); });
(async () => {
  await send('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'deploy', version: '1' } });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const r = await send('tools/call', { name: 'execute', arguments: { operation: 'hosting_git_deploy-website-repository', params: { username: USER, domain: DOMAIN, repository_url: REPO, branch: BRANCH } } });
  console.log((r.result?.content || []).map(c => c.text).join('\n'));
  child.kill();
})().catch(e => { console.error('ERR', e.message); child.kill(); process.exit(1); });
EOJS
HS_DOMAIN="$DOMAIN" HS_USER="$USER" HS_REPO="$REPO_URL" HS_BRANCH="$BRANCH" \
  node "$TEMP/hmcp-deploy.$$.cjs"

echo "Done: https://$DOMAIN/"
