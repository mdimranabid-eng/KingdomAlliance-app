// File storage — replaces Firebase Storage. Files are persisted in BOTH
// a shared disk directory AND the MySQL `uploaded_files` table so that
// Hostinger hbuilds/versions/<uuid> redeployments never lose uploaded photos.
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { pool, withReady } = require('../db');
const { authRequired } = require('../auth');

const router = express.Router();

function resolveUploadRoot() {
  const cwd = process.cwd();
  // On Hostinger Node.js hosting, cwd is .../domains/<domain>/hbuilds/versions/<uuid>/nodejs
  // Placing uploads at .../domains/<domain>/uploads keeps them outside ephemeral build folders.
  if (cwd.includes('/hbuilds/versions/') && (!process.env.UPLOAD_DIR || process.env.UPLOAD_DIR === 'uploads')) {
    const domainRoot = cwd.split('/hbuilds/versions/')[0];
    return path.join(domainRoot, 'uploads');
  }
  return path.resolve(cwd, process.env.UPLOAD_DIR || 'uploads');
}

const UPLOAD_ROOT = resolveUploadRoot();
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const sanitizeRelPath = (raw) =>
  String(raw || '')
    .replace(/\\/g, '/')
    .replace(/\.\./g, '')
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9/_\-.]/g, '_');

const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 10);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_MB * 1024 * 1024,
    fields: 10,
    fieldNestingDepth: 2,
    fieldArrayIndexLimit: 10,
  },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file format. Please upload JPEG, PNG, or WEBP.'));
  },
});

const publicUrl = (rel) => `${process.env.PUBLIC_BASE_URL || ''}/uploads/${String(rel).replace(/\\/g, '/')}`;

router.post('/storage/upload', authRequired, upload.single('file'), async (req, res) => {
  try {
    const rel = sanitizeRelPath(req.body?.path || '');
    // Only allow writes under users/{own uid}/ or moderators' photoModeration paths
    if (!rel.startsWith(`users/${req.uid}/`)) {
      return res.status(403).json({ error: { code: 'storage/unauthorized', message: 'You can only upload to your own folder.' } });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: { code: 'storage/invalid-argument', message: 'No file uploaded.' } });
    }
    const full = path.join(UPLOAD_ROOT, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, req.file.buffer);

    await withReady();
    await pool.query(
      `INSERT INTO uploaded_files (path, mime_type, content, size) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE mime_type = VALUES(mime_type), content = VALUES(content), size = VALUES(size)`,
      [rel, req.file.mimetype || 'image/jpeg', req.file.buffer, req.file.buffer.length]
    );

    res.json({ url: publicUrl(rel), fullPath: rel, path: rel });
  } catch (e) {
    res.status(e.message?.includes('Invalid file') ? 400 : 500).json({ error: { code: 'storage/unknown', message: e.message } });
  }
});

router.post('/storage/delete', authRequired, async (req, res) => {
  try {
    const { paths } = req.body || {};
    const list = Array.isArray(paths) ? paths : typeof paths === 'string' ? [paths] : [];
    let deleted = 0;
    await withReady();
    for (const p of list) {
      const raw = String(p || '');
      const isUrl = raw.startsWith('http') || raw.includes('/uploads/');
      const extracted = isUrl ? decodeURIComponent(raw.split('/uploads/')[1] || '') : raw;
      const relPath = sanitizeRelPath(extracted);
      if (!relPath) continue;
      // owner or admin only
      if (!relPath.startsWith(`users/${req.uid}/`) && !req.isAdmin) continue;
      const full = path.join(UPLOAD_ROOT, relPath);
      if (full.startsWith(UPLOAD_ROOT) && fs.existsSync(full)) {
        fs.unlinkSync(full);
        deleted += 1;
      }
      const [r] = await pool.query('DELETE FROM uploaded_files WHERE path = ?', [relPath]);
      if (r.affectedRows > 0 && deleted === 0) deleted += 1;
    }
    res.json({ deleted });
  } catch (e) {
    res.status(500).json({ error: { code: 'storage/unknown', message: e.message } });
  }
});

// Signed URL emulation: the shim calls getDownloadURL(ref) — for already-uploaded
// paths we just return the public URL.
router.post('/storage/url', authRequired, (req, res) => {
  const rel = sanitizeRelPath((req.body || {}).path || '');
  res.json({ url: publicUrl(rel) });
});

function guessMime(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

// Serve /uploads/* from disk cache, sibling hbuilds folders, or MySQL uploaded_files
async function serveUpload(req, res) {
  try {
    const rel = sanitizeRelPath(req.params[0] || req.path.replace(/^\/uploads\/?/, ''));
    if (!rel) return res.status(404).end();

    const diskPath = path.join(UPLOAD_ROOT, rel);
    if (diskPath.startsWith(UPLOAD_ROOT) && fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
      res.setHeader('Content-Type', guessMime(rel));
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      return res.sendFile(diskPath);
    }

    await withReady();
    const [rows] = await pool.query('SELECT mime_type, content FROM uploaded_files WHERE path = ? LIMIT 1', [rel]);
    if (rows.length && rows[0].content) {
      try {
        fs.mkdirSync(path.dirname(diskPath), { recursive: true });
        fs.writeFileSync(diskPath, rows[0].content);
      } catch { /* ignore disk cache write failure */ }
      res.setHeader('Content-Type', rows[0].mime_type || guessMime(rel));
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      return res.end(rows[0].content);
    }

    return res.status(404).end();
  } catch (e) {
    console.error('[uploads]', e.message);
    return res.status(500).end();
  }
}

function walkFiles(dir, baseDir = dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, baseDir, acc);
    else if (entry.isFile()) acc.push({ full, rel: path.relative(baseDir, full).replace(/\\/g, '/') });
  }
  return acc;
}

async function rescuePreviousBuildUploads() {
  try {
    await withReady();
    const dirsToScan = new Set([
      UPLOAD_ROOT,
      path.resolve(process.cwd(), 'uploads'),
    ]);
    const cwd = process.cwd();
    if (cwd.includes('/hbuilds/versions/')) {
      const versionsRoot = path.join(cwd.split('/hbuilds/versions/')[0], 'hbuilds', 'versions');
      if (fs.existsSync(versionsRoot)) {
        for (const ver of fs.readdirSync(versionsRoot)) {
          dirsToScan.add(path.join(versionsRoot, ver, 'nodejs', 'uploads'));
        }
      }
    }

    let rescued = 0;
    for (const dir of dirsToScan) {
      for (const f of walkFiles(dir)) {
        const rel = sanitizeRelPath(f.rel);
        if (!rel) continue;
        const buf = fs.readFileSync(f.full);
        if (!buf.length) continue;
        const target = path.join(UPLOAD_ROOT, rel);
        if (target !== f.full && !fs.existsSync(target)) {
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, buf);
        }
        await pool.query(
          `INSERT IGNORE INTO uploaded_files (path, mime_type, content, size) VALUES (?, ?, ?, ?)`,
          [rel, guessMime(rel), buf, buf.length]
        );
        rescued += 1;
      }
    }
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM uploaded_files');
    console.log(`[uploads] root=${UPLOAD_ROOT}, scanned=${rescued}, db_files=${total}`);
  } catch (e) {
    console.warn('[uploads] rescue scan error:', e.message);
  }
}

router.UPLOAD_ROOT = UPLOAD_ROOT;
router.serveUpload = serveUpload;
router.rescuePreviousBuildUploads = rescuePreviousBuildUploads;
module.exports = router;
