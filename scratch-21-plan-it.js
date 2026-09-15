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

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/jhak') || res.url().includes('/api/projects/440')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      netLog.push({ url: res.url(), status: res.status(), body: body ? body.slice(0, 3000) : null });
    }
  });

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.click('text=/^1\\s*Read/');
  await page.waitForTimeout(1000);
  await page.click('text=Looks right — plan it');

  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT_DIR}/freshproj-plan-wait-${i}.png`, fullPage: true });
  }

  fs.writeFileSync(`${OUT_DIR}/freshproj-planit-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
