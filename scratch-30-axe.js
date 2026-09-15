const { chromium } = require('playwright');
const fs = require('fs');
const STATE_DIR = './.state';
const AXE_PATH = require.resolve('axe-core/axe.min.js', { paths: ['/Users/bdfb/thaura ai testing/node_modules'] });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  const results = {};

  for (const [name, url] of [['home', 'https://app.medha.pro/'], ['chat', 'https://app.medha.pro/chat'], ['jobs', 'https://app.medha.pro/jobs']]) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.addScriptTag({ path: AXE_PATH });
    const r = await page.evaluate(async () => {
      const res = await axe.run(document, { resultTypes: ['violations'] });
      return res.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }));
    });
    results[name] = r;
    console.log(name, JSON.stringify(r));
  }

  fs.writeFileSync('./discovery-evidence/axe-results.json', JSON.stringify(results, null, 2));
  await browser.close();
})();
