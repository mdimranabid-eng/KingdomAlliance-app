#!/bin/bash
# End-to-end smoke test for the Kingdom Alliance Node/MySQL API (local).
set -u
API=http://localhost:3001/api
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "✔ $1"; }
bad() { FAIL=$((FAIL+1)); echo "✘ $1"; }
EMAIL="user$RANDOM@test.local"

# 1. member register + login
REG=$(curl -s -X POST $API/auth/register -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123\",\"fullName\":\"Mary Test\"}")
MUID=$(echo "$REG" | node -pe 'JSON.parse(require("fs").readFileSync(0)).user.uid' 2>/dev/null)
[ -n "$MUID" ] && [ "$MUID" != "undefined" ] && ok "register member (uid=$MUID)" || bad "register member: $REG"

LOGIN=$(curl -s -X POST $API/auth/login -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"Password123\"}")
TOK=$(echo "$LOGIN" | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken' 2>/dev/null)
[ -n "$TOK" ] && [ "$TOK" != "undefined" ] && ok "member login" || bad "member login"
AUTH="Authorization: Bearer $TOK"

# 2. me
ME=$(curl -s $API/auth/me -H "$AUTH")
echo "$ME" | grep -q '"uid"' && ok "GET /auth/me" || bad "GET /auth/me"

# 3. fs owner get + owner update (lastActive serverTimestamp sentinel)
GETD=$(curl -s $API/fs/users/$MUID -H "$AUTH")
echo "$GETD" | grep -q '"exists":true' && ok "fs get own user doc" || bad "fs get own user doc"
UPD=$(curl -s -X PATCH $API/fs/users/$MUID -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"lastActive":{"__st":1},"aboutMe":"Hello world"}')
echo "$UPD" | grep -q '"ok":true' && ok "fs update own user doc (sentinel)" || bad "fs update own doc: $UPD"

# 4. unapproved member cannot list users (rules → 403)
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/fs/query -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"path":["users"],"wheres":[]}')
[ "$CODE" = "403" ] && ok "fs users list denied for unapproved member (rules)" || bad "fs users list got $CODE (expected 403)"

# 5. forbidden write to someone else's doc (rules)
FORB=$(curl -s -o /dev/null -w '%{http_code}' -X PUT $API/fs/users/00000000-0000-0000-0000-000000000000 \
  -H "$AUTH" -H 'Content-Type: application/json' -d '{"data":{"uid":"x"}}')
[ "$FORB" = "403" ] && ok "fs write other user doc → 403 (rules)" || bad "fs forbidden write got $FORB"

# 6. notifications create + list own
NID=$(curl -s -X POST $API/fs/add -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"path\":[\"notifications\"],\"data\":{\"userId\":\"$MUID\",\"fromId\":\"$MUID\",\"type\":\"test\",\"read\":false,\"createdAt\":{\"__st\":1}}}" \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')
[ -n "$NID" ] && [ "$NID" != "undefined" ] && ok "fs addDoc notification" || bad "fs addDoc notification"
NL=$(curl -s -X POST $API/fs/query -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"path":["notifications"],"wheres":[]}')
echo "$NL" | grep -q "$NID" && ok "fs query notifications (own)" || bad "fs query notifications: $NL"

echo "PART1: PASS=$PASS FAIL=$FAIL"
