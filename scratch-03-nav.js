const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence';
const STATE_DIR = './.state';
const BASE_URL = 'https://app.medha.pro/';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('response', (res) => { if (res.status() >= 400) failedRequests.push({ url: res.url(), status: res.status() }); });

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);

  // Try to close the Command Center overlay if present
  const closeBtn = page.locator('button:has(svg)').filter({ hasText: '' });
  try {
    const xButtons = await page.$$('button');
    for (const b of xButtons) {
      const box = await b.boundingBox();
      if (box && box.x > 1200 && box.y < 60) { await b.click(); break; }
    }
  } catch (e) {}

  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/04-after-close-overlay.png`, fullPage: true });

  // Extract all visible nav-like links/buttons in a probable sidebar
  const navItems = await page.$$eval('a, button', (els) =>
    els.map((e) => ({
      tag: e.tagName,
      text: e.textContent.trim().slice(0, 60),
      href: e.getAttribute('href'),
    })).filter((e) => e.text && e.text.length > 0 && e.text.length < 40)
  );
  fs.writeFileSync(`${OUT_DIR}/nav-items-raw.json`, JSON.stringify(navItems, null, 2));

  fs.writeFileSync(`${OUT_DIR}/console-errors-dashboard.json`, JSON.stringify(consoleErrors, null, 2));
  fs.writeFileSync(`${OUT_DIR}/failed-requests-dashboard.json`, JSON.stringify(failedRequests, null, 2));

  console.log('Nav items found:', navItems.length);
  console.log('Console errors:', consoleErrors.length, 'Failed requests:', failedRequests.length);
  console.log('Current URL:', page.url());

  await browser.close();
})();
