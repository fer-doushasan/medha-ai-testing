const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence/jhak';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/jhak') || res.url().includes('/api/projects/440')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      const req = res.request();
      let reqBody = null;
      try { reqBody = req.postData(); } catch (e) {}
      netLog.push({ url: res.url(), method: req.method(), status: res.status(), reqBody, body: body ? body.slice(0, 3000) : null });
    }
  });

  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT_DIR}/freshproj-01-list.png`, fullPage: true });

  // hover/click on the QA Fresh Test card to reveal its action buttons, then click its জাঁক/here action
  const card = page.locator('text=QA Fresh Test').first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT_DIR}/freshproj-02-hover.png`, fullPage: true });

  // Click "Open" on that card if present, to go to project workspace
  const projectCardArea = page.locator('div', { hasText: 'QA Fresh Test' }).first();
  try {
    await page.click('text=Open', { timeout: 3000 });
  } catch (e) { console.log('No Open button, trying direct nav'); await page.goto(`${BASE}/projects/440`, { waitUntil: 'networkidle', timeout: 20000 }); }

  await page.waitForTimeout(1500);
  console.log('URL:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/freshproj-03-workspace.png`, fullPage: true });

  fs.writeFileSync(`${OUT_DIR}/freshproj-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
