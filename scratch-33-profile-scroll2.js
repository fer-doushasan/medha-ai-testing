const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/profiles';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();

  await page.goto(`${BASE}/profiles`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('text=Case');
  await page.waitForTimeout(1200);

  const scrolled = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const candidates = all.filter(el => {
      const s = getComputedStyle(el);
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 20;
    });
    candidates.forEach(el => { el.scrollTop = el.scrollHeight; });
    return candidates.map(el => ({ tag: el.tagName, cls: el.className, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));
  });
  console.log('Scrollable candidates:', JSON.stringify(scrolled));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT_DIR}/05-case-editor-bottom.png` });

  const bodyText = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/case-editor-fulltext.txt`, bodyText.slice(0, 6000));

  await browser.close();
})();
