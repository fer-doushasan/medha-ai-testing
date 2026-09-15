const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/project-agent';
const STATE_DIR = './.state';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto('https://app.medha.pro/projects/436', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);

  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT_DIR}/03-workspace-scrolled1.png` });

  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT_DIR}/04-workspace-scrolled2.png` });

  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT_DIR}/05-workspace-scrolled3.png` });

  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/workspace-fulltext.txt`, text.slice(0, 6000));

  await browser.close();
})();
