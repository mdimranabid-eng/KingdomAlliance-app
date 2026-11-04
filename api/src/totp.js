// RFC 6238 TOTP (SHA-1, 6 digits, 30s step) + base32 — replaces Firebase Auth TOTP MFA.
const crypto = require('crypto');

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf) {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(s) {
  let bits = 0, value = 0; const out = [];
  for (const ch of String(s).toUpperCase().replace(/=+$/, '').replace(/\s+/g, '')) {
    const idx = B32.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function hotp(secretB32, counter) {
  const key = base32Decode(secretB32);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter % 2 ** 32, 4);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(code % 1000000).padStart(6, '0');
}

/** Verify a 6-digit TOTP. Accepts previous/next window (clock drift). */
function verifyTotp(secretB32, code, window = 1) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(Date.now() / 30000);
  for (let i = -window; i <= window; i++) {
    if (hotp(secretB32, counter + i) === code) return true;
  }
  return false;
}

function generateSecret() {
  return base32Encode(crypto.randomBytes(20));
}

function provisioningUri(secretB32, account, issuer = 'Kingdom Alliance') {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secretB32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

module.exports = { generateSecret, verifyTotp, provisioningUri, base32Encode, base32Decode };
