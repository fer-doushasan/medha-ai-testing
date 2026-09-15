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
    if (res.url().includes('/api/jhak') || res.url().includes('/api/projects')) {
      let body = null;
      try { body = await res.text(); } catch (e) {}
      const req = res.request();
      let reqBody = null;
      try { reqBody = req.postData(); } catch (e) {}
      netLog.push({ url: res.url(), method: req.method(), status: res.status(), reqBody, body: body ? body.slice(0, 2500) : null });
    }
  });

  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('button:has-text("New project")');
  await page.waitForTimeout(1000);

  await page.fill('input[placeholder=""], div:has-text("Name") + input', '').catch(() => {});
  // Target the Name field precisely: it's the first text input under the "Name" label
  const inputs = await page.$$('input[type="text"]');
  await page.locator('label:has-text("Name")').first();
  const nameBox = page.locator('form input, .modal input, [role="dialog"] input').first();
  await nameBox.fill('QA Test Project');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT_DIR}/newproj-04-name-filled.png` });

  await page.click('button:has-text("Create project")');
  await page.waitForTimeout(2500);
  console.log('URL after project create:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/newproj-05-after-create.png`, fullPage: true });

  // Now trigger Jhak on this new project with a fresh objective
  const objective = 'List the first 5 prime numbers.';
  const ta = await page.$('textarea');
  if (ta) {
    await ta.fill(objective);
    await page.click('button:has-text("Start")').catch(async () => {
      // maybe it's a different jhak trigger inside project view
      await page.click('text=/ঝাঁক here/').catch(() => {});
    });
  } else {
    // Try clicking "বাঁক here" quick action if present on the project card, or open project then find input
    console.log('No textarea found directly, checking page content');
  }
  await page.waitForTimeout(4000);
  console.log('URL after starting jhak on new project:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/newproj-06-jhak-started.png`, fullPage: true });

  fs.writeFileSync(`${OUT_DIR}/newproj-network2.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
