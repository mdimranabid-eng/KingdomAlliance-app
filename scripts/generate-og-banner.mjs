/**
 * Generates a 1200×630px OG social sharing banner for Kingdom Alliance.
 * Uses Puppeteer to render a self-contained HTML page and capture a screenshot.
 *
 * Usage: node scripts/generate-og-banner.mjs
 */

import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the logo as base64
const logoPath = resolve(__dirname, '..', 'public', 'images', 'logo.jpeg');
const logoBase64 = readFileSync(logoPath).toString('base64');
const logoDataUri = `data:image/jpeg;base64,${logoBase64}`;
const bannerHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 630px; overflow: hidden;
      font-family: 'Inter', -apple-system, sans-serif;
      background: linear-gradient(135deg, #f5f0e8 0%, #fdfcfa 50%, #f5f0e8 100%);
      display: flex; align-items: center; justify-content: center; position: relative;
    }
    .orb-1 {
      position: absolute; top: -100px; left: -100px;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, #ede4d6 0%, transparent 70%);
      opacity: 0.5; pointer-events: none;
    }
    .orb-2 {
      position: absolute; bottom: -120px; right: -80px;
      width: 500px; height: 500px; border-radius: 50%;
      background: radial-gradient(circle, #d4af37 0%, #ede4d6 40%, transparent 70%);
      opacity: 0.2; pointer-events: none;
    }
    .orb-3 {
      position: absolute; top: 40%; right: 30%;
      width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, #d4af37 0%, transparent 60%);
      opacity: 0.12; pointer-events: none;
    }
    .corner-tl {
      position: absolute; top: 30px; left: 30px;
      width: 80px; height: 80px;
      border-top: 2px solid #d4af37; border-left: 2px solid #d4af37; opacity: 0.4;
    }
    .corner-br {
      position: absolute; bottom: 30px; right: 30px;
      width: 80px; height: 80px;
      border-bottom: 2px solid #d4af37; border-right: 2px solid #d4af37; opacity: 0.4;
    }
    .content { text-align: center; position: relative; z-index: 1; padding: 40px; }
    .logo-wrapper {
      width: 200px; height: 200px; margin: 0 auto 20px; border-radius: 32px;
      background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
      border: 1px solid rgba(212,175,55,0.35);
      box-shadow: 0 8px 32px rgba(212,175,55,0.15);
      display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 20px;
    }
    .logo-wrapper img { width: 100%; height: 100%; object-fit: contain; }
    h1 {
      font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700;
      color: #1a2e4a; letter-spacing: -0.02em; margin-bottom: 8px;
    }
    .divider {
      width: 80px; height: 3px; margin: 16px auto; border-radius: 2px;
      background: linear-gradient(90deg, transparent, #d4af37, transparent);
    }
    .tagline { font-size: 20px; font-weight: 400; color: #1a2e4a; opacity: 0.7; letter-spacing: 0.02em; margin-bottom: 4px; }
    .subtitle { font-size: 15px; font-weight: 300; color: #1a2e4a; opacity: 0.5; letter-spacing: 0.05em; text-transform: uppercase; }
    .bottom-decoration { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; opacity: 0.3; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #d4af37; }
  </style>
</head>
<body>
  <div class="orb-1"></div><div class="orb-2"></div><div class="orb-3"></div>
  <div class="corner-tl"></div><div class="corner-br"></div>
  <div class="content">
    <div class="logo-wrapper"><img src="${logoDataUri}" alt="Kingdom Alliance" /></div>
    <h1>Kingdom Alliance</h1>
    <div class="divider"></div>
    <p class="tagline">Christian Matrimony Rooted in Faith &amp; Values</p>
    <p class="subtitle">Find Your God-Given Life Partner</p>
  </div>
  <div class="bottom-decoration">
    <div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div>
  </div>
</body>
</html>`;

async function generate() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Users/i.abid/.cache/puppeteer/chrome/mac_arm-152.0.7977.54/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.setContent(bannerHtml, { waitUntil: 'networkidle0' });

  // Wait for Google Fonts to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  const outputDir = resolve(__dirname, '..', 'public', 'images');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = resolve(outputDir, 'og-banner.png');

  await page.screenshot({
    path: outputPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });

  await browser.close();
  console.log('✅ OG banner generated:', outputPath);
}

generate().catch(err => {
  console.error('❌ Failed to generate OG banner:', err);
  process.exit(1);
});