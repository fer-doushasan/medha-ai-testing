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
    if (res.url().includes('/api/jhak') || res.url().includes('/api/run')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      netLog.push({ url: res.url(), status: res.status(), body: body ? body.slice(0, 2000) : null });
    }
  });

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const objective = 'What is the capital of France? Just tell me the answer.';
  await page.fill('textarea, input[placeholder*="Why did"]', objective).catch(async () => {
    const ta = await page.$('textarea');
    if (ta) await ta.fill(objective);
  });
  await page.screenshot({ path: `${OUT_DIR}/09-new-objective-filled.png` });

  await page.click('button:has-text("Start")');
  await page.waitForTimeout(3000);
  console.log('URL after start:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/10-new-run-read.png`, fullPage: true });

  // Wait for Think to finish and move through tabs
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT_DIR}/11-new-run-after-wait.png`, fullPage: true });

  fs.writeFileSync(`${OUT_DIR}/09-11-network.json`, JSON.stringify(netLog, null, 2));
  console.log('Done, URL:', page.url());

  await browser.close();
})();
