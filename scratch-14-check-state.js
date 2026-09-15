const { chromium } = require('playwright');
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: './discovery-evidence/jhak/state-check.png', fullPage: true });
  const resp = await page.evaluate(async () => {
    const r = await fetch('/api/projects', { credentials: 'include' });
    return r.json();
  });
  console.log(JSON.stringify(resp, null, 2));
  await browser.close();
})();
