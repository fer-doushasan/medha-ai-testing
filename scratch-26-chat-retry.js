const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/chat';
const STATE_DIR = './.state';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto('https://app.medha.pro/chat', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.fill('textarea', 'What is the capital of Bangladesh?');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(12000);
  console.log('URL:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/04-retry-response.png`, fullPage: true });

  const chatId = page.url().split('id=')[1];
  if (chatId) {
    const resp = await page.evaluate(async (id) => {
      const r = await fetch(`/api/chats/${id}/messages?limit=100`, { credentials: 'include' });
      return r.json();
    }, chatId);
    fs.writeFileSync(`${OUT_DIR}/retry-messages-api.json`, JSON.stringify(resp, null, 2));
    console.log(JSON.stringify(resp).slice(0, 1500));
  }
  await browser.close();
})();
