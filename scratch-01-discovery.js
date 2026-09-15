// Initial recon: unauthenticated homepage of Medha AI.
const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence';
const BASE_URL = 'https://app.medha.pro/';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const networkRequests = [];
  const consoleMessages = [];
  const pageErrors = [];

  page.on('request', (req) => {
    networkRequests.push({ method: req.method(), url: req.url(), resourceType: req.resourceType() });
  });
  page.on('response', (res) => {
    const idx = networkRequests.findIndex((r) => r.url === res.url() && r.status === undefined);
    if (idx !== -1) networkRequests[idx].status = res.status();
  });
  page.on('console', (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  try {
    const resp = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 45000 });
    console.log('Status:', resp.status(), 'Final URL:', page.url());
  } catch (e) {
    console.error('Navigation error:', e.message);
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT_DIR}/01-homepage.png`, fullPage: true });

  const html = await page.content();
  fs.writeFileSync(`${OUT_DIR}/homepage.html`, html);

  const links = await page.$$eval('a', (as) =>
    as.map((a) => ({ text: a.textContent.trim().slice(0, 80), href: a.getAttribute('href') }))
      .filter((l) => l.text || l.href)
  );
  fs.writeFileSync(`${OUT_DIR}/homepage-links.json`, JSON.stringify(links, null, 2));

  fs.writeFileSync(`${OUT_DIR}/network-requests.json`, JSON.stringify(networkRequests, null, 2));
  fs.writeFileSync(`${OUT_DIR}/console-messages.json`, JSON.stringify(consoleMessages, null, 2));
  fs.writeFileSync(`${OUT_DIR}/page-errors.json`, JSON.stringify(pageErrors, null, 2));

  console.log('Title:', await page.title());
  console.log('Links found:', links.length);
  console.log('Console messages:', consoleMessages.length, 'Page errors:', pageErrors.length);

  await browser.close();
})();
