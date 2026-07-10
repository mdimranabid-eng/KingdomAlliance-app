# Kingdom Alliance — Admin API Server

## Overview

This Express server uses the **real Firebase Admin SDK** (separate from the frontend mock)
to perform privileged operations that cannot be done from the browser:

- **Auth deletion** (`admin.auth().deleteUser()`)
- **Full cascading Firestore cleanup** across 6 collections

It runs on **port 3001** alongside your Vite dev server (port 3000).

---

## Setup (One Time)

```bash
# From the project root:
cd server
npm install
```

---

## Running Against Local Emulators

Make sure your emulators are already running (`firebase emulators:start --only auth,firestore`), then in a **new terminal tab**:

```bash
cd server
npm run dev:emulator
```

This sets the correct environment variables:
```
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
GCLOUD_PROJECT=kingdom-alliance-v2
```

### Verify the server is live

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "server": "Kingdom Alliance Admin API",
  "emulatorMode": true,
  "projectId": "kingdom-alliance-v2"
}
```

---

## Purge a Specific User (Task 1 — imran@gmail.com)

With the server running against the emulator, execute this in your terminal:

```bash
# 1. Get an admin ID token from your running React app's browser console:
#    > firebase.auth().currentUser.getIdToken(true).then(t => console.log(t))
#    Paste that token below as TOKEN

TOKEN="<paste-admin-id-token-here>"
UID="IlTEL7c0vgVtw7zcvj9kVAhA9vz2"

curl -X POST http://localhost:3001/api/admin/delete-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"uid\": \"$UID\"}"
```

**Alternatively, delete directly via the emulator REST API (no token needed in emulator mode):**

```bash
# Direct emulator Auth deletion (no auth required in emulator)
curl -X DELETE \
  "http://127.0.0.1:9099/emulator/v1/projects/kingdom-alliance-v2/accounts/IlTEL7c0vgVtw7zcvj9kVAhA9vz2"

# Then delete the Firestore document
curl -X DELETE \
  "http://127.0.0.1:8080/v1/projects/kingdom-alliance-v2/databases/(default)/documents/users/IlTEL7c0vgVtw7zcvj9kVAhA9vz2"
```

---

## Running in Production

Place your `serviceAccountKey.json` in the project root (it's gitignored), then:

```bash
cd server
npm start
```

---

## API Reference

### `POST /api/admin/delete-user`
- **Auth**: `Authorization: Bearer <admin-id-token>`
- **Body**: `{ "uid": "string" }`
- **Stages**:
  - A: Firebase Auth deletion
  - B: `/users/{uid}` document
  - C: `/photoModeration` where `userId == uid`
  - D: `/interests` where `fromId == uid` or `toId == uid`
  - E: `/shortlists` where `userId == uid` or `targetId == uid`
  - F: `/chats/{chatId}/messages` subcollections + `/chats/{chatId}`

### `GET /api/health`
Returns server status, emulator mode, and project ID.
