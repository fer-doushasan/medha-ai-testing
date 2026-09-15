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
  await page.click('button:has-text("Set up with AI")');
  await page.waitForTimeout(2000);
  console.log('URL:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/06-setup-with-ai.png`, fullPage: true });
  await browser.close();
})();
