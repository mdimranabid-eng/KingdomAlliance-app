// Zero-Firebase server stub.
// Push notifications are replaced by Hostinger realtime in-app events + SMTP offline email digests.

async function sendPush(_tokens, _notification, _data) {
  // Push notifications retired in favor of native realtime + SMTP digests
  return { responses: [] };
}

function admin() {
  return null;
}

module.exports = { admin, sendPush };
