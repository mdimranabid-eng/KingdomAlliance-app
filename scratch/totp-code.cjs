// Prints a currently-valid TOTP code for the given base32 secret.
const crypto = require('crypto');
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function dec(s) {
  let bits = 0; let v = 0; const out = [];
  for (const ch of String(s).toUpperCase()) {
    const i = B32.indexOf(ch);
    if (i < 0) continue;
    v = (v << 5) | i; bits += 5;
    if (bits >= 8) { out.push((v >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}
function hotp(key, counter) {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter % 2 ** 32, 4);
  const h = crypto.createHmac('sha1', key).update(buf).digest();
  const o = h[h.length - 1] & 15;
  const code = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(code % 1000000).padStart(6, '0');
}
console.log(hotp(dec(process.argv[2]), Math.floor(Date.now() / 30000)));
