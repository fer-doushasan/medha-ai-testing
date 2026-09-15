const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence/jhak';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/') && (res.url().includes('run') || res.url().includes('jhak'))) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      netLog.push({ url: res.url(), status: res.status(), body: body ? body.slice(0, 2000) : null });
    }
  });

  await page.goto(`${BASE}/runs`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('text=Open the run');
  await page.waitForTimeout(2500);
  console.log('URL:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/02-run-detail.png`, fullPage: true });

  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  fs.writeFileSync(`${OUT_DIR}/02-run-detail-bodytext.txt`, bodyText.slice(0, 6000));
  fs.writeFileSync(`${OUT_DIR}/02-run-network.json`, JSON.stringify(netLog, null, 2));

  await browser.close();
})();
