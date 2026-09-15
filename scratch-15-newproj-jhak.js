const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence/jhak';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/jhak') || res.url().includes('/api/projects')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      const req = res.request();
      let reqBody = null;
      try { reqBody = req.postData(); } catch (e) {}
      netLog.push({ url: res.url(), method: req.method(), status: res.status(), reqBody, body: body ? body.slice(0, 2500) : null });
    }
  });

  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('button:has-text("New project")');
  await page.waitForTimeout(1000);

  // The Name field auto-focuses when the dialog opens; type directly into whatever has focus.
  await page.keyboard.type('QA Fresh Test');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT_DIR}/newproj2-filled.png` });

  await page.click('button:has-text("Create project")');
  await page.waitForTimeout(2500);
  console.log('URL after create:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/newproj2-created.png`, fullPage: true });

  fs.writeFileSync(`${OUT_DIR}/newproj2-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
