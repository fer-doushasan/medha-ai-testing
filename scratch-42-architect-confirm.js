const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/project-agent';
const STATE_DIR = './.state';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto('https://app.medha.pro/chat?id=3654', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.fill('textarea', "Yes, that looks right — please design the full setup proposal.");
  await page.keyboard.press('Enter');
  await page.waitForTimeout(18000);
  await page.screenshot({ path: `${OUT_DIR}/10-full-proposal.png`, fullPage: true });
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/10-full-proposal.txt`, text.slice(0, 8000));
  await browser.close();
})();
