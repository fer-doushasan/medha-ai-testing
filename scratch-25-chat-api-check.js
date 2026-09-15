const { chromium } = require('playwright');
const fs = require('fs');
const STATE_DIR = './.state';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto('https://app.medha.pro/chat?id=3637', { waitUntil: 'networkidle', timeout: 30000 });
  const resp = await page.evaluate(async () => {
    const r = await fetch('/api/chats/3637/messages?limit=100', { credentials: 'include' });
    return r.json();
  });
  fs.writeFileSync('./discovery-evidence/chat/messages-api.json', JSON.stringify(resp, null, 2));
  console.log(JSON.stringify(resp, null, 2).slice(0, 3000));
  await browser.close();
})();
