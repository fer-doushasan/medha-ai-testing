const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/chat';
const STATE_DIR = './.state';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();
  await page.goto('https://app.medha.pro/chat?id=3637', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT_DIR}/03-final-response.png`, fullPage: true });
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/03-final-response-text.txt`, text.slice(0, 4000));
  await browser.close();
})();
