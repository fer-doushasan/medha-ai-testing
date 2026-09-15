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
    if (res.url().includes('/api/')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      const req = res.request();
      let reqBody = null;
      try { reqBody = req.postData(); } catch (e) {}
      netLog.push({ url: res.url(), method: req.method(), status: res.status(), reqBody: reqBody ? reqBody.slice(0,1000) : null, body: body ? body.slice(0, 3000) : null });
    }
  });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const objective = 'Convert 100 USD to BDT using today\'s approximate rate. Just give me the number.';
  const ta = await page.$('textarea');
  await ta.fill(objective);
  await page.click('button:has-text("Start")');

  // Poll for up to 20s, screenshotting every 2s
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT_DIR}/trace-${i}.png`, fullPage: true });
    console.log(`t+${(i+1)*2}s URL:`, page.url());
  }

  fs.writeFileSync(`${OUT_DIR}/full-trace-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
