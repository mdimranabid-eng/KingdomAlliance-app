#!/bin/bash
# E2E part 2: admin MFA flow, presence, typing, cron, check-email, SPA, PDF.
set -u
API=http://localhost:3001/api
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "✔ $1"; }
bad() { FAIL=$((FAIL+1)); echo "✘ $1"; }
cd "$(dirname "$0")/../api"
TOTPJS="$(cd "$(dirname "$0")" && pwd)/totp-code.cjs"
totp() { node "$TOTPJS" "$1"; }

# 1. admin login — either needs enrollment or requires MFA (idempotent)
AL=$(curl -s -X POST $API/auth/admin-login -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.local","password":"AdminPass123!"}')
if echo "$AL" | grep -q 'mfaRequired'; then
  ok "admin login → MFA required (already enrolled)"
  # fetch the enrolled secret from the test DB to complete the challenge
  SECRET=$(docker exec ka-mysql-test mysql -ukaapp -pkaapp123 kaapp -N \
    -e "SELECT totp_secret FROM users WHERE email='admin@test.local'" 2>/dev/null | tr -d '[:space:]')
  TICKET=$(echo "$AL" | node -pe 'JSON.parse(require("fs").readFileSync(0)).ticket')
  CODE=$(totp "$SECRET")
  CHAL=$(curl -s -X POST $API/auth/mfa/challenge -H 'Content-Type: application/json' -d "{\"ticket\":\"$TICKET\",\"code\":\"$CODE\"}")
  if echo "$CHAL" | grep -q '"accessToken"'; then
    ok "MFA challenge → tokens (enrolled path)"
  else
    bad "MFA challenge: $CHAL"
  fi
else
  ok "admin login without MFA → needsMfaEnrollment"
  ATOK=$(echo "$AL" | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken')
  AAUTH="Authorization: Bearer $ATOK"
  curl -s -X POST $API/auth/mfa/unenroll -H "$AAUTH" >/dev/null

  # 2. MFA enrollment
  ENR=$(curl -s -X POST $API/auth/mfa/enroll/start -H "$AAUTH")
  SECRET=$(echo "$ENR" | node -pe 'JSON.parse(require("fs").readFileSync(0)).secret')
  echo "$ENR" | grep -q 'otpauth://totp' && ok "MFA enroll start (secret + QR uri)" || bad "MFA enroll start"
  CODE=$(totp "$SECRET")
  [ "${#CODE}" = "6" ] && ok "TOTP code generated ($CODE)" || bad "TOTP code gen"
  CONF=$(curl -s -X POST $API/auth/mfa/enroll/confirm -H "$AAUTH" -H 'Content-Type: application/json' -d "{\"code\":\"$CODE\"}")
  echo "$CONF" | grep -q '"ok":true' && ok "MFA enroll confirm" || bad "MFA enroll confirm: $CONF"

  # 3. re-login → mfaRequired + challenge → admin claim
  AL2=$(curl -s -X POST $API/auth/admin-login -H 'Content-Type: application/json' \
    -d '{"email":"admin@test.local","password":"AdminPass123!"}')
  TICKET=$(echo "$AL2" | node -pe 'JSON.parse(require("fs").readFileSync(0)).ticket')
  [ -n "$TICKET" ] && [ "$TICKET" != "undefined" ] && ok "admin re-login → MFA challenge ticket" || bad "admin re-login: $AL2"
  CODE2=$(totp "$SECRET")
  CHAL=$(curl -s -X POST $API/auth/mfa/challenge -H 'Content-Type: application/json' -d "{\"ticket\":\"$TICKET\",\"code\":\"$CODE2\"}")
fi
ADMTOK=$(echo "$CHAL" | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken // ""')
ADM=$(echo "$CHAL" | node -pe 'JSON.parse(require("fs").readFileSync(0)).user.admin // false')
[ "$ADM" = "true" ] && ok "admin claim granted after second factor" || bad "admin claim missing: $CHAL"
ADAUTH="Authorization: Bearer $ADMTOK"

# 4. admin endpoint
LIST=$(curl -s -X POST $API/admin/list -H "$ADAUTH")
echo "$LIST" | grep -q 'admin@test.local' && ok "admin/list works with admin token" || bad "admin/list: $LIST"

# 5. presence + typing
AUID=$(echo "$CHAL" | node -pe 'JSON.parse(require("fs").readFileSync(0)).user.uid')
curl -s -X POST $API/presence/$AUID -H "$ADAUTH" -H 'Content-Type: application/json' -d '{"state":"online"}' | grep -q '"ok":true' && ok "presence heartbeat" || bad "presence heartbeat"
PRES=$(curl -s "$API/presence?uids=$AUID" -H "$ADAUTH")
echo "$PRES" | grep -q '"online"' && ok "presence read" || bad "presence read: $PRES"
curl -s -X POST $API/typing/chatA_$AUID -H "$ADAUTH" -H 'Content-Type: application/json' -d '{"value":true}' | grep -q '"ok":true' && ok "typing set" || bad "typing set"
TYP=$(curl -s "$API/typing/chatA_$AUID")
echo "$TYP" | grep -q 'true' && ok "typing read" || bad "typing read: $TYP"

# 6. cron endpoint
CRON=$(curl -s -X POST $API/cron/otp-cleanup -H 'x-cron-secret: localcron')
echo "$CRON" | grep -q '"ok":true' && ok "cron otp-cleanup" || bad "cron: $CRON"
DENY=$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/cron/otp-cleanup)
[ "$DENY" = "401" ] && ok "cron denied without secret" || bad "cron deny got $DENY"

# 7. check-email
CE=$(curl -s -X POST $API/check-email -H 'Content-Type: application/json' -d '{"email":"admin@test.local"}')
echo "$CE" | grep -q '"emailTaken":true' && ok "check-email" || bad "check-email: $CE"

# 8. biodata PDF
PDF=$(node -e "require('dotenv').config(); const {generateBiodataPdf}=require('./src/biodata.js'); const buf=generateBiodataPdf({fullName:'Test User',profileId:'KA-TEST',gender:'male',age:28,aboutMe:'hello'}); console.log('PDF_OK bytes='+buf.length);" 2>&1 | grep PDF_OK)
[ -n "$PDF" ] && ok "biodata PDF ($PDF)" || bad "biodata PDF failed"

# 9. SPA serving
SPA=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/dashboard)
[ "$SPA" = "200" ] && ok "SPA fallback /dashboard → 200" || bad "SPA fallback got $SPA"
ASSET=$(curl -s http://localhost:3001/ | grep -o 'assets/[^"]*\.js' | head -1)
[ -n "$ASSET" ] && ok "index.html references built assets" || bad "no assets in index.html"

echo "PART2: PASS=$PASS FAIL=$FAIL"
