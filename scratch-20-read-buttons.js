const { chromium } = require('playwright');
const fs = require('fs');
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
  await page.click('text=/^1\\s*Read/');
  await page.waitForTimeout(1500);

  const buttons = await page.$$eval('button', (els) => els.map((e) => e.textContent.trim()).filter(Boolean));
  console.log('BUTTONS:', JSON.stringify(buttons, null, 2));

  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('./discovery-evidence/jhak/freshproj-read-fulltext.txt', text);
  console.log('Text length:', text.length);
  await browser.close();
})();
