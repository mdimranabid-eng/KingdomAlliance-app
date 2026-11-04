# Hostinger deployment — kingdom.madebyimran.org + thekingdomalliances.com

## Phase 1 (legacy): kingdom.madebyimran.org — static SPA on Firebase backend

- Static SPA at https://kingdom.madebyimran.org; backend remains Firebase (Auth, Firestore,
  Cloud Functions `kingdom-alliance-v2`). Hostinger shared Node hosting can't run `npm build`,
  so deploys push a prebuilt branch (`hostinger-deploy`) containing `dist/` + `.htaccess`:
  `bash scripts/deployHostinger.sh` builds, force-pushes, and triggers the Hostinger git pull
  (webhook 706991593; account u182908316, order 1010222761).
- Verify after deploy: `/` renders hero, `/login` + `/dashboard` return 200, Firebase
  email/OTP + Google sign-in work.

## Phase 2 (current): thekingdomalliances.com — full Node.js + MySQL app

**Live since 2026-11-04.** The Firebase → Node/MySQL conversion (see
`docs/firebase-migration-audit.md`) is deployed as a real Node.js website on Hostinger:

- **Website**: `thekingdomalliances.com` (Node.js type, account u182908316, order 1010222761).
- **Deploy branch**: `hostinger-node-deploy` — an orphan branch containing the deployment
  `package.json`, `api/src/**` (Express API), `dist/**` (prebuilt SPA). **Auto-deploy is
  active**: every push to the branch triggers a Hostinger build (npm install + Passenger
  restart). Settings: Node 22, express, entry file `api/src/index.js`, npm.
- **Database**: MySQL `u182908316_kaapp` (user `u182908316_kaapp`, localhost:3306). The schema
  self-bootstraps on boot (`api/src/db.js`). Connection details live ONLY in the website's
  environment variables (DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD/DATABASE_URL), written by
  `hosting_databases_setup-website` — never stored in git.
- **Environment variables**: managed via the Hostinger MCP
  (`hosting_nodejs_replace-environment-variables` — full replace!). The app secrets
  (JWT_SECRET, OTP_HASH_SALT, SMTP, CRON_SECRET, BOOTSTRAP_ADMIN_*, etc.) are mirrored locally
  in `api/.env.production-hostinger` (gitignored) — use that file as the source of truth when
  re-saving env vars; the Hostinger API masks values and a replace deletes anything not re-sent.
- **Cron**: runs in-process via node-cron (hourly deletion scheduler, daily OTP cleanup at
  04:00, 8-hour admin moderation alerts). Secret-protected HTTP fallback:
  `POST /api/cron/{deletions|otp-cleanup|approvals-check}` with header `x-cron-secret`.
- **Admin bootstrap**: first boot created `themaster@thekingdomalliances.com` — password is in
  `api/.env.production-hostinger`. Change it after first login; TOTP enrollment is required to
  receive admin claims (two-factor admin login, like the old Firebase MFA flow).
- **Google sign-in**: enabled. Uses the Firebase project's auto-created web OAuth client
  `583391827233-99lkvfsgcbmlssorgj0eatjm1mse61fc.apps.googleusercontent.com`
  (found via the Identity Toolkit `createAuthUri` flow — see `scratch/find-client-id2.cjs`).
  - Frontend: `VITE_GOOGLE_CLIENT_ID` in `.env.production` (local, gitignored) — must be present
    at build time or Google sign-in shows "not configured".
  - Server: `GOOGLE_CLIENT_ID` env var on Hostinger (audience validation in `/api/auth/google`).
  - `thekingdomalliances.com` is already in Firebase authorized domains (auto-synced to the
    OAuth client's authorized JavaScript origins).
- **Known limitation — FCM push**: needs `server/serviceAccountKey.production.json` on the
  server; GitHub secret scanning blocks committing it. Until it is uploaded via hPanel File
  Manager into the app directory and `FIREBASE_SERVICE_ACCOUNT_PATH` is set, push
  notifications are disabled (fail-soft — everything else works).

### How to redeploy

```bash
npm run build        # rebuild dist/ from the main branch
# copy api/src/** + dist/** into the hostinger-node-deploy branch (a git worktree is safest),
# commit, push — Hostinger rebuilds automatically
```

### Verify after deploy

- `https://thekingdomalliances.com/api/health` → `{"status":"ok"}`
- `/login`, `/dashboard` → 200 (SPA fallback)
- Register/login via the UI; admin login via `/admin` (password + TOTP)
- Live smoke test: `bash scratch/e2e-live-test.sh`

## Hostinger MCP access

`npx @hostinger/mcp --login` (credentials: `~/.config/hostinger-mcp/credentials.json`;
refresh via `scratch/mcp-cli-refresh.cjs`). MCP endpoint: `https://mcp.hostinger.com/` —
meta-tools: `search`, `execute`, `multi-execute` (helper: `scratch/hostinger-mcp.cjs`).
