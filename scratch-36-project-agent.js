const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/project-agent';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();

  const netLog = [];
  page.on('response', async (res) => {
    if (res.url().includes('/api/projects/436') || res.url().includes('/api/agents')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      netLog.push({ url: res.url(), status: res.status(), body: body ? body.slice(0, 2500) : null });
    }
  });

  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT_DIR}/01-projects-list.png`, fullPage: true });

  // hover the project card to reveal action buttons, then click Workspace by raw coordinates
  const card = page.locator('text=AI Tour Guide').first();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.move(box.x + 20, box.y + 400, { steps: 5 });
  await page.waitForTimeout(300);
  await page.mouse.click(391, 667);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/02-workspace-panel.png`, fullPage: true });
  console.log('URL:', page.url());

  fs.writeFileSync(`${OUT_DIR}/project-agent-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
