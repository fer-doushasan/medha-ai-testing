const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/chat';
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

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/chat') || res.url().includes('/api/messages')) {
      netLog.push({ url: res.url(), status: res.status() });
    }
  });

  await page.goto(`${BASE}/chat`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  const t0 = Date.now();
  await page.fill('textarea', 'In one sentence, what can you help me with as Medha? Then tell me a fact you are NOT sure about, and label it as uncertain.');
  await page.keyboard.press('Enter');

  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT_DIR}/01-sent.png` });

  // wait for response to appear/stabilize
  await page.waitForTimeout(9000);
  const t1 = Date.now();
  await page.screenshot({ path: `${OUT_DIR}/02-response.png`, fullPage: true });

  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/02-response-text.txt`, text.slice(0, 4000));
  console.log('Elapsed ms to first screenshot after send:', t1 - t0);

  fs.writeFileSync(`${OUT_DIR}/chat-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
