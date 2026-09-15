const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/project-agent';
const STATE_DIR = './.state';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto('https://app.medha.pro/chat?id=3654', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.fill('textarea', "I want this project to be an AI Tour Guide that helps travelers plan trips around Bangladesh.");
  await page.keyboard.press('Enter');
  await page.waitForTimeout(11000);
  await page.screenshot({ path: `${OUT_DIR}/07-architect-response.png`, fullPage: true });
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/07-architect-response.txt`, text.slice(0, 4000));
  await browser.close();
})();
