const { chromium } = require('playwright');
const STATE_DIR = './.state';
const OUT_DIR = './discovery-evidence/security';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto('https://app.medha.pro/settings', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('text=Data & privacy');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/03-data-privacy.png`, fullPage: true });
  await browser.close();
})();
