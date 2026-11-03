// Static entry for Hostinger Passenger (hPanel build pipeline).
// Serves the Vite production build (dist/) with SPA fallback.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const app = express();

app.disable('x-powered-by');
app.use(express.static(DIST, {
  setHeaders(res, filePath) {
    if (/(index\.html|\.htaccess)$/.test(filePath || '')) {
      res.set('Cache-Control', 'no-store, must-revalidate');
    }
  },
}));
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.set('Cache-Control', 'no-store, must-revalidate');
  res.sendFile(path.join(DIST, 'index.html'));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '127.0.0.1', () => console.log(`kingdom-alliance web listening on :${PORT} dist=${DIST}`));
