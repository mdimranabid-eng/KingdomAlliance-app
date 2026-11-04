const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 300)));
  page.on('requestfailed', (r) => errors.push('reqfail: ' + r.url().slice(0, 120) + ' :: ' + (r.failure() || {}).errorText));
  await page.goto('https://kingdom.madebyimran.org/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));
  const title = await page.title();
  const hero = await page.evaluate(() => { const h = document.querySelector('h1, h2'); return h ? h.textContent.slice(0, 80) : ''; });
  await page.screenshot({ path: 'tmp/hostinger-deploy-home.png' });
  console.log(JSON.stringify({ title, hero, errors: errors.slice(0, 12) }, null, 2));
  await browser.close();
})();
