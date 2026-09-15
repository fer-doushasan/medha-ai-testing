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

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      netLog.push({ t: Date.now(), url: res.url(), status: res.status(), body: body ? body.slice(0, 1500) : null });
    }
  });

  await page.goto(RUN_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('text=/^3\\s*Staff/');

  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT_DIR}/staff-wait-${i}.png` });
    const txt = await page.evaluate(() => document.querySelector('body').innerText.slice(0, 300));
    console.log(`t+${(i+1)*2}s:`, txt.replace(/\n/g, ' | '));
  }

  fs.writeFileSync(`${OUT_DIR}/staff-wait-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
