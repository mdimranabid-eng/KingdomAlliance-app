#!/bin/bash
# Live smoke test against https://thekingdomalliances.com
set -u
API=https://thekingdomalliances.com/api
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "✔ $1"; }
bad() { FAIL=$((FAIL+1)); echo "✘ $1"; }
EMAIL="probe$RANDOM@thekingdomalliances.com"

REG=$(curl -s -m 30 -X POST $API/auth/register -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123\",\"fullName\":\"Deployment Probe\"}")
MUID=$(echo "$REG" | node -pe 'JSON.parse(require("fs").readFileSync(0)).user.uid // ""' 2>/dev/null)
[ -n "$MUID" ] && ok "live register (uid=${MUID:0:8}…)" || bad "live register: $(echo $REG | head -c 150)"

LOGIN=$(curl -s -m 30 -X POST $API/auth/login -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123\"}")
TOK=$(echo "$LOGIN" | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken // ""' 2>/dev/null)
[ -n "$TOK" ] && ok "live login" || bad "live login"
AUTH="Authorization: Bearer $TOK"

ME=$(curl -s -m 30 $API/auth/me -H "$AUTH")
echo "$ME" | grep -q '"uid"' && ok "live /auth/me" || bad "live /auth/me"

GETD=$(curl -s -m 30 $API/fs/users/$MUID -H "$AUTH")
echo "$GETD" | grep -q '"exists":true' && ok "live fs get own doc" || bad "live fs get own doc"

UPD=$(curl -s -m 30 -X PATCH $API/fs/users/$MUID -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"lastActive":{"__st":1}}')
echo "$UPD" | grep -q '"ok":true' && ok "live fs update own doc (sentinel)" || bad "live fs update: $(echo $UPD | head -c 120)"

FORB=$(curl -s -m 30 -o /dev/null -w '%{http_code}' -X PUT $API/fs/users/00000000-0000-0000-0000-000000000000 \
  -H "$AUTH" -H 'Content-Type: application/json' -d '{"data":{"uid":"x"}}')
[ "$FORB" = "403" ] && ok "live rules enforcement (403 on foreign write)" || bad "live rules got $FORB"

Q=$(curl -s -m 30 -o /dev/null -w '%{http_code}' -X POST $API/fs/query -H "$AUTH" -H 'Content-Type: application/json' -d '{"path":["users"],"wheres":[]}')
[ "$Q" = "403" ] && ok "live rules: unapproved member cannot list users" || bad "live users list got $Q"

SPA=$(curl -s -m 30 -o /dev/null -w '%{http_code}' https://thekingdomalliances.com/login)
[ "$SPA" = "200" ] && ok "live SPA route /login" || bad "live SPA got $SPA"

echo "LIVE: PASS=$PASS FAIL=$FAIL (probe account: $EMAIL)"