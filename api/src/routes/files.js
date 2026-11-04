// File storage — replaces Firebase Storage. Files live under api/uploads/ and
// are served from /uploads/* (same origin, no CORS issues).
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authRequired } = require('../auth');

const router = express.Router();
const UPLOAD_ROOT = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 10);
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_ROOT),
    filename: (req, file, cb) => {
      // final name = safe relative path from client, joined under UPLOAD_ROOT
      const rel = String(req.body?.path || '').replace(/\\/g, '/').replace(/\.\./g, '').replace(/^\/+/, '');
      const safe = rel.replace(/[^a-zA-Z0-9/_\-.]/g, '_');
      const full = path.join(UPLOAD_ROOT, safe);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      cb(null, safe);
    },
  }),
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file format. Please upload JPEG, PNG, or WEBP.'));
  },
});

const publicUrl = (rel) => `${process.env.PUBLIC_BASE_URL || ''}/uploads/${String(rel).replace(/\\/g, '/')}`;

router.post('/storage/upload', authRequired, upload.single('file'), (req, res) => {
  try {
    const rel = String(req.body?.path || '').replace(/\\/g, '/').replace(/\.\./g, '').replace(/^\/+/, '');
    // Only allow writes under users/{own uid}/ or moderators' photoModeration paths
    if (!rel.startsWith(`users/${req.uid}/`)) {
      return res.status(403).json({ error: { code: 'storage/unauthorized', message: 'You can only upload to your own folder.' } });
    }
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
      const rel = String(p || '').replace(/\\/g, '/').replace(/\.\./g, '').replace(/^\/+/, '');
      const isUrl = rel.startsWith('http');
      const relPath = isUrl ? decodeURIComponent(rel.split('/uploads/')[1] || '') : rel;
      if (!relPath) continue;
      // owner or admin only
      if (!relPath.startsWith(`users/${req.uid}/`) && !req.isAdmin) continue;
      const full = path.join(UPLOAD_ROOT, relPath);
      if (full.startsWith(UPLOAD_ROOT) && fs.existsSync(full)) {
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
  const rel = String((req.body || {}).path || '').replace(/\\/g, '/').replace(/\.\./g, '').replace(/^\/+/, '');
  res.json({ url: publicUrl(rel) });
});

module.exports = router;
