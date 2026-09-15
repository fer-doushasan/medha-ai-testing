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
  await page.fill('textarea', "3) C - both English and Bengali. 4) I don't have any of those ready yet, let's proceed without them for now.");
  await page.keyboard.press('Enter');
  await page.waitForTimeout(16000);
  await page.screenshot({ path: `${OUT_DIR}/09-architect-proposal.png`, fullPage: true });
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/09-architect-proposal.txt`, text.slice(0, 6000));
  await browser.close();
})();
