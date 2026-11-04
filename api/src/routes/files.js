// File storage — replaces Firebase Storage.
// Binary image files live strictly on Hostinger's persistent domain disk
// (.../domains/<domain>/uploads, outside ephemeral hbuilds/versions/<uuid>/ folders)
// while MySQL stores only the URL string and metadata.
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
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

// Inspect binary magic bytes to verify genuine JPEG, PNG, or WebP content
function detectImageMime(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return 'image/png';
  }
  // WebP: RIFF....WEBP
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

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

const publicUrl = (rel) => `/uploads/${String(rel).replace(/\\/g, '/')}`;

router.post('/storage/upload', authRequired, upload.single('file'), async (req, res) => {
  try {
    const rel = sanitizeRelPath(req.body?.path || '');
    // Only allow writes under users/{own uid}/
    if (!rel.startsWith(`users/${req.uid}/`)) {
      return res.status(403).json({ error: { code: 'storage/unauthorized', message: 'You can only upload to your own folder.' } });
    }
    const ext = path.extname(rel).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return res.status(400).json({ error: { code: 'storage/invalid-argument', message: 'Invalid image file extension.' } });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: { code: 'storage/invalid-argument', message: 'No file uploaded.' } });
    }
    const detectedMime = detectImageMime(req.file.buffer);
    if (!detectedMime) {
      return res.status(400).json({ error: { code: 'storage/invalid-argument', message: 'Uploaded file failed binary image signature verification.' } });
    }

    const full = path.resolve(UPLOAD_ROOT, rel);
    if (!full.startsWith(UPLOAD_ROOT + path.sep)) {
      return res.status(403).json({ error: { code: 'storage/unauthorized', message: 'Invalid upload path.' } });
    }
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, req.file.buffer, { mode: 0o640 });

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
    for (const p of list) {
      const raw = String(p || '');
      const isUrl = raw.startsWith('http') || raw.includes('/uploads/');
      const extracted = isUrl ? decodeURIComponent(raw.split('/uploads/')[1] || '') : raw;
      const relPath = sanitizeRelPath(extracted);
      if (!relPath) continue;
      // owner or admin only
      if (!relPath.startsWith(`users/${req.uid}/`) && !req.isAdmin) continue;
      const full = path.resolve(UPLOAD_ROOT, relPath);
      if (full.startsWith(UPLOAD_ROOT + path.sep) && fs.existsSync(full)) {
        fs.unlinkSync(full);
        deleted += 1;
      }
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

// Serve /uploads/* from persistent disk with strict security headers
function serveUpload(req, res) {
  try {
    const rel = sanitizeRelPath(req.params[0] || req.path.replace(/^\/uploads\/?/, ''));
    if (!rel) return res.status(404).end();
    const ext = path.extname(rel).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) return res.status(404).end();

    const diskPath = path.resolve(UPLOAD_ROOT, rel);
    if (!diskPath.startsWith(UPLOAD_ROOT + path.sep)) return res.status(403).end();
    if (!fs.existsSync(diskPath) || !fs.statSync(diskPath).isFile()) {
      return res.status(404).end();
    }

    res.setHeader('Content-Type', guessMime(rel));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; sandbox");
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    return res.sendFile(diskPath);
  } catch (e) {
    console.error('[uploads]', e.message);
    return res.status(500).end();
  }
}

function urlToRelPath(u) {
  if (!u || typeof u !== 'string') return '';
  const trimmed = u.trim();
  if (!trimmed.includes('/uploads/')) return '';
  return sanitizeRelPath(decodeURIComponent(trimmed.split('/uploads/')[1] || ''));
}

function fileExistsInRoot(rel) {
  if (!rel) return false;
  const full = path.resolve(UPLOAD_ROOT, rel);
  return full.startsWith(UPLOAD_ROOT + path.sep) && fs.existsSync(full) && fs.statSync(full).isFile();
}

function copyDirRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0;
  let copied = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copied += copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile() && !fs.existsSync(destPath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      copied += 1;
    }
  }
  return copied;
}

function listFilesRecursive(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(listFilesRecursive(full, base));
    } else if (entry.isFile()) {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

async function reconcileUploads(pool) {
  try {
    const cwd = process.cwd();
    let migrated = 0;
    if (cwd.includes('/hbuilds/versions/')) {
      const domainRoot = cwd.split('/hbuilds/versions/')[0];
      const versionsDir = path.join(domainRoot, 'hbuilds', 'versions');
      if (fs.existsSync(versionsDir)) {
        for (const ver of fs.readdirSync(versionsDir)) {
          const oldUploads = path.join(versionsDir, ver, 'nodejs', 'uploads');
          if (oldUploads !== UPLOAD_ROOT && fs.existsSync(oldUploads)) {
            migrated += copyDirRecursive(oldUploads, UPLOAD_ROOT);
          }
        }
      }
    }
    const filesOnDisk = listFilesRecursive(UPLOAD_ROOT);
    console.log(`[uploads] root=${UPLOAD_ROOT} migrated=${migrated} filesOnDisk=${filesOnDisk.length} list=${JSON.stringify(filesOnDisk.slice(0, 30))}`);

    if (!pool) return;
    // Purge stale uploadedImages hash cache entries whose files are missing on disk
    const [hashRows] = await pool.query("SELECT id, data FROM coll_store WHERE coll = 'uploadedImages'");
    let purgedHashes = 0;
    for (const row of hashRows) {
      let d = {};
      try { d = typeof row.data === 'object' ? row.data : JSON.parse(row.data || '{}'); } catch {}
      const rel = urlToRelPath(d.url || '');
      if (!rel || !fileExistsInRoot(rel)) {
        await pool.query("DELETE FROM coll_store WHERE coll = 'uploadedImages' AND id = ?", [row.id]);
        purgedHashes += 1;
      }
    }
    if (purgedHashes > 0) {
      console.log(`[uploads] purged ${purgedHashes} stale uploadedImages hash cache entries`);
    }

    // Clean up any orphaned photoModeration records or user pendingPhotoUrl references whose local /uploads/ file is missing on disk
    const [modRows] = await pool.query("SELECT id, data FROM coll_store WHERE coll = 'photoModeration'");
    for (const r of modRows) {
      let d = {};
      try { d = typeof r.data === 'object' ? r.data : JSON.parse(r.data || '{}'); } catch {}
      const url = d.photoURL || d.photoUrl || d.pendingPhotoUrl || '';
      const rel = urlToRelPath(url);
      if (d.photoStatus === 'pending' && (!rel || !fileExistsInRoot(rel))) {
        await pool.query("DELETE FROM coll_store WHERE coll = 'photoModeration' AND id = ?", [r.id]);
        console.log(`[uploads] removed orphaned pending photoModeration record ${r.id} (missing file on disk)`);
      }
    }

    const [userRows] = await pool.query("SELECT id, data FROM users WHERE role != 'admin'");
    for (const r of userRows) {
      let d = {};
      try { d = typeof r.data === 'object' ? r.data : JSON.parse(r.data || '{}'); } catch {}
      const pending = d.pendingPhotoUrl || '';
      const relPending = urlToRelPath(pending);
      if (d.photoStatus === 'pending' && (!relPending || !fileExistsInRoot(relPending))) {
        const store = require('../store');
        await store.writeDoc('users', r.id, {
          pendingPhotoUrl: '',
          pendingPhotoThumbUrl: '',
          photoStatus: d.photoUrl ? 'approved' : 'idle',
        }, { merge: true });
        console.log(`[uploads] cleared orphaned pendingPhotoUrl for user ${r.id}`);
      }

      // Reconcile gallery photos whose moderation record was already approved (or has no pending moderation record while file exists on disk)
      if (Array.isArray(d.gallery) && d.gallery.length > 0) {
        let galleryChanged = false;
        const nextGallery = d.gallery.map((g) => {
          if (!g || g.status === 'approved') return g;
          const relG = urlToRelPath(g.url || '');
          const isApprovedInMod = modRows.some((mr) => {
            let md = {};
            try { md = typeof mr.data === 'object' ? mr.data : JSON.parse(mr.data || '{}'); } catch {}
            return (md.uid === r.id || md.userId === r.id) &&
              (md.photoStatus === 'approved' || md.status === 'approved') &&
              urlToRelPath(md.photoURL || md.photoUrl || '') === relG;
          });
          const hasPendingMod = modRows.some((mr) => {
            let md = {};
            try { md = typeof mr.data === 'object' ? mr.data : JSON.parse(mr.data || '{}'); } catch {}
            return (md.uid === r.id || md.userId === r.id) &&
              md.photoStatus === 'pending' &&
              urlToRelPath(md.photoURL || md.photoUrl || '') === relG;
          });
          if (isApprovedInMod || (g.status === 'pending' && !hasPendingMod && relG && fileExistsInRoot(relG))) {
            galleryChanged = true;
            return {
              ...g,
              url: relG ? `/uploads/${relG}` : g.url,
              thumbUrl: urlToRelPath(g.thumbUrl || '') ? `/uploads/${urlToRelPath(g.thumbUrl || '')}` : g.thumbUrl,
              status: 'approved',
            };
          }
          return g;
        });
        if (galleryChanged) {
          const store = require('../store');
          await store.writeDoc('users', r.id, { gallery: nextGallery }, { merge: true });
          console.log(`[uploads] reconciled approved gallery photo status for user ${r.id}`);
        }
      }
    }
  } catch (e) {
    console.error('[uploads] reconcile error:', e.message);
  }
}

router.UPLOAD_ROOT = UPLOAD_ROOT;
router.serveUpload = serveUpload;
router.reconcileUploads = reconcileUploads;
module.exports = router;
