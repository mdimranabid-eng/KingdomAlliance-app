# Hostinger deployment — kingdom.madebyimran.org + thekingdomalliances.com

## Domains served from the same `hostinger-deploy` branch

| Domain | Docroot | Auto-deploy webhook (GitHub repo) |
|---|---|---|
| kingdom.madebyimran.org | /home/u182908316/domains/madebyimran.org/public_html/kingdom | hook 706991593 |
| thekingdomalliances.com | /home/u182908316/domains/thekingdomalliances.com/public_html | hook 706993121 |

One push to `hostinger-deploy` auto-deploys to **both** domains. Both are registered as Git deployments under Hostinger account order 1010222761, username u182908316.

## Phase 1 status (done)


- Frontend is deployed at https://kingdom.madebyimran.org (static SPA, Hostinger shared hosting, Node website `u182908316`, order 1010222761).
- Backend remains Firebase (Auth, Firestore, Cloud Functions `kingdom-alliance-v2`), so the app is fully functional as on Firebase Hosting.
- `kingdom.madebyimran.org` and `madebyimran.org` were added to Firebase Auth authorized domains (Google sign-in popups depend on it) — via Identity Toolkit admin API using the firebase-cli refresh token.
- Deployment mechanics: Hostinger shared Node hosting can't run `npm build`, so deploys push a **prebuilt branch** (`hostinger-deploy`) containing `dist/` + `.htaccess` (SPA rewrite, HTTPS force, cache policy). Hostinger pulls it into the subdomain docroot.
- **Auto-deploy sync is active**: the repository is registered in Hostinger Git deployment (`hosting_git_list-website-repositories`) and a push webhook (`https://webhooks.hostinger.com/deploy/69b2aa4c…`) is installed in the GitHub repo (hook id 706991593). Pushing `hostinger-deploy` deploys automatically; `scripts/deployHostinger.sh` works either way since it also waits for the MCP-triggered pull (idempotent).

## How to redeploy

```bash
bash scripts/deployHostinger.sh
```

Builds, force-pushes the `hostinger-deploy` branch to GitHub, and triggers the Hostinger git pull through the Hostinger MCP (`hosting_git_deploy-website-repository`). Requires the local Hostinger MCP OAuth credentials (already authorized; re-auth with `npx @hostinger/mcp --login` if expired).

## Verify after deploy

- `/` renders hero with no console errors
- `/login`, `/dashboard` return 200 (SPA fallback via .htaccess)
- Firebase auth: email/OTP and Google sign-in work (authorized domain present)

## Constraints / notes

- `index.html` is served no-store; hashed assets get 1y immutable cache.
- Works offline of Firebase: none — Phase 1 keeps Firebase as live backend.
- Hostinger MCP operations used: `hosting_identity_*` none; only git deploy. Read-only ops used to verify.

## Phase 2 (planned)

- Build `api/` (Express) on the same Node website, MySQL DB (schema in `api/src/db.js` is ready to bootstrap), OTP/email/notifications/trigger logic inlined into routes, schedulers via Hostinger cron (`hosting_cron-jops_list` → create via hPanel or MCP-supported ops).
- Client data layer: replace Firebase SDK direct-access + onSnapshot listeners with API client + long polling (chat).
- Schedulers: list existing cron via `hosting_cron-jobs_list`; processPendingDeletions / cleanupExpiredOtps / pendingApprovalCheck become cron entries.
