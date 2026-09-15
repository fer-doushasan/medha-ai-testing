const { chromium } = require('playwright');
const OUT_DIR = './discovery-evidence/profiles';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto(`${BASE}/profiles`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('text=Browse templates');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/06-browse-templates.png`, fullPage: true });
  await browser.close();
})();
