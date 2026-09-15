const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence/jhak';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();

  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  // Click "All বাঁক runs (1)"
  const btn = page.locator('button, a').filter({ hasText: 'run' }).first();
  try {
    await page.click('text=/All.*runs/i', { timeout: 5000 });
  } catch (e) {
    console.log('Could not click "All runs" button directly:', e.message);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/01-all-runs-list.png`, fullPage: true });
  console.log('URL after click:', page.url());

  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  fs.writeFileSync(`${OUT_DIR}/01-all-runs-bodytext.txt`, bodyText.slice(0, 3000));

  await browser.close();
})();
