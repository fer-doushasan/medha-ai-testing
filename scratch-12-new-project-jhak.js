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

  // Create a new project
  await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('button:has-text("New project")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT_DIR}/newproj-01-dialog.png` });

  // Fill project name if a text field appears
  const nameInput = await page.$('input[type="text"], input[placeholder*="name" i], input[placeholder*="Name" i]');
  if (nameInput) {
    await nameInput.fill('QA Test Project');
  }
  await page.screenshot({ path: `${OUT_DIR}/newproj-02-filled.png` });

  // Try to submit / confirm creation
  const createBtn = await page.$('button:has-text("Create")');
  if (createBtn) {
    await createBtn.click();
  } else {
    const addBtn = await page.$('button:has-text("Add")');
    if (addBtn) await addBtn.click();
  }
  await page.waitForTimeout(2000);
  console.log('URL after project create:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/newproj-03-after-create.png`, fullPage: true });

  fs.writeFileSync(`${OUT_DIR}/newproj-network.json`, JSON.stringify(netLog, null, 2));
  await browser.close();
})();
