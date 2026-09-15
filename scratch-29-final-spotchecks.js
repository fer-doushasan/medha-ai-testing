const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/spotchecks';
const STATE_DIR = './.state';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();

  // Getting started
  await page.goto('https://app.medha.pro/learn', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT_DIR}/01-getting-started.png`, fullPage: true });

  // Skills catalog
  await page.goto('https://app.medha.pro/skills', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);
  await page.click('text=Catalog');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT_DIR}/02-skills-catalog.png`, fullPage: true });

  // Agent detail - open Project Architect
  await page.goto('https://app.medha.pro/agents', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(800);
  await page.click('text=Edit');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT_DIR}/03-agent-edit.png`, fullPage: true });

  // Vision check: chat defaults / model guide vision filter already seen; check notification bell + eye icon
  await page.goto('https://app.medha.pro/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('[aria-label="Notifications"], button:has(svg)  >> nth=0').catch(() => {});
  await page.locator('button').filter({ has: page.locator('svg') }).nth(1).click().catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT_DIR}/04-top-icons.png` });

  await browser.close();
})();
