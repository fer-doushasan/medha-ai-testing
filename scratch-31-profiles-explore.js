const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/profiles';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/profiles') || res.url().includes('/api/branding')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      const req = res.request();
      let reqBody = null;
      try { reqBody = req.postData(); } catch (e) {}
      netLog.push({ url: res.url(), method: req.method(), status: res.status(), reqBody, body: body ? body.slice(0, 2500) : null });
    }
  });

  // 1. Full Profiles page, scrolled to bottom
  await page.goto(`${BASE}/profiles`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT_DIR}/01-profiles-top.png`, fullPage: true });

  // 2. Open the "Case" profile editor
  await page.click('text=Case').catch(async () => {
    const card = page.locator('text=Case').first();
    await card.click();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/02-case-editor.png`, fullPage: true });
  console.log('URL after clicking Case:', page.url());

  fs.writeFileSync(`${OUT_DIR}/profiles-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
