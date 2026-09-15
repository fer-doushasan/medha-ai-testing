const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence/jhak';
const STATE_DIR = './.state';
const RUN_URL = 'https://app.medha.pro/projects/436/jhak';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();

  await page.goto(RUN_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('text=/^4\\s*Approve/');
  await page.waitForTimeout(1500);

  // Click "Quick" research depth card
  await page.click('text=Quick');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/08-approve-quick-selected.png`, fullPage: true });

  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  fs.writeFileSync(`${OUT_DIR}/08-approve-quick-bodytext.txt`, bodyText.slice(0, 3000));
  console.log('Captured quick-tier approve screen.');

  await browser.close();
})();
