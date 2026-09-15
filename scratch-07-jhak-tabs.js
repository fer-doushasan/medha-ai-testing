const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence/jhak';
const STATE_DIR = './.state';
const RUN_URL = 'https://app.medha.pro/projects/436/jhak';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1100 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/jhak') || res.url().includes('/api/run')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      netLog.push({ url: res.url(), status: res.status(), body: body ? body.slice(0, 3000) : null });
    }
  });

  await page.goto(RUN_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Scroll to see step 6 and beyond on the Think tab
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT_DIR}/03-think-scrolled.png`, fullPage: true });

  // Click "3 Staff" tab
  try {
    await page.click('text=/^3\\s*Staff/', { timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT_DIR}/04-staff-tab.png`, fullPage: true });
    console.log('Staff tab URL:', page.url());
  } catch (e) { console.log('Staff tab click failed:', e.message); }

  // Click "4 Approve" tab
  try {
    await page.click('text=/^4\\s*Approve/', { timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT_DIR}/05-approve-tab.png`, fullPage: true });
    console.log('Approve tab URL:', page.url());
  } catch (e) { console.log('Approve tab click failed:', e.message); }

  // Click "1 Read" tab
  try {
    await page.click('text=/^1\\s*Read/', { timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT_DIR}/06-read-tab.png`, fullPage: true });
    console.log('Read tab URL:', page.url());
  } catch (e) { console.log('Read tab click failed:', e.message); }

  // Click "5 Run" tab
  try {
    await page.click('text=/^5\\s*Run/', { timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT_DIR}/07-run-tab.png`, fullPage: true });
    console.log('Run tab URL:', page.url());
  } catch (e) { console.log('Run tab click failed:', e.message); }

  fs.writeFileSync(`${OUT_DIR}/03-07-network.json`, JSON.stringify(netLog, null, 2));

  await browser.close();
})();
