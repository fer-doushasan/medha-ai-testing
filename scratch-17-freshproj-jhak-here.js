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
  const card = page.locator('text=QA Fresh Test').first();
  await card.hover();
  await page.waitForTimeout(400);
  await page.click('button:has-text("ঝাঁক here"), a:has-text("ঝাঁক here")');
  await page.waitForTimeout(2000);
  console.log('URL:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/freshproj-04-jhak-page.png`, fullPage: true });

  // Now enter a fresh, unrelated objective
  const objective = 'List the first 5 prime numbers.';
  const ta = await page.$('textarea');
  if (ta) {
    await ta.fill(objective);
    await page.screenshot({ path: `${OUT_DIR}/freshproj-05-objective-filled.png` });
    await page.click('button:has-text("Start")');
  } else {
    console.log('No textarea found on this page');
  }
  await page.waitForTimeout(5000);
  console.log('URL after start:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/freshproj-06-after-start.png`, fullPage: true });

  fs.writeFileSync(`${OUT_DIR}/freshproj-jhak-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
