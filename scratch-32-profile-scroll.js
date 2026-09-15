const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/profiles';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();

  await page.goto(`${BASE}/profiles`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('text=Case');
  await page.waitForTimeout(1200);

  // scroll the modal/panel itself, not the page
  const panel = page.locator('[role="dialog"], .modal, div:has(> h2:has-text("Case"))').first();
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT_DIR}/03-case-editor-scrolled.png`, fullPage: false });

  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT_DIR}/04-case-editor-scrolled2.png`, fullPage: false });

  const bodyText = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/case-editor-fulltext.txt`, bodyText.slice(0, 5000));

  await browser.close();
})();
