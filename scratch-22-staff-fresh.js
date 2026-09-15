const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/jhak';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro/projects/440/jhak';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.click('text=/^2\\s*Think/');
  await page.waitForTimeout(1500);
  await page.click('text=Staff the crew');

  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(2000);
  }
  await page.screenshot({ path: `${OUT_DIR}/freshproj-10-staffed.png`, fullPage: true });

  await page.click('text=/^4\\s*Approve/');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT_DIR}/freshproj-11-approve.png`, fullPage: true });

  await browser.close();
})();
