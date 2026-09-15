const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence/tour';
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const ROUTES = [
  ['home', '/'],
  ['getting-started', '/learn'],
  ['chat', '/chat'],
  ['agents', '/agents'],
  ['skills', '/skills'],
  ['content-journey', '/content-media'],
  ['elements', '/elements'],
  ['projects', '/projects'],
  ['profiles', '/profiles'],
  ['jobs', '/jobs'],
  ['tools', '/tools'],
  ['model-guide', '/models'],
  ['chats-list', '/chats'],
  ['usage', '/usage'],
  ['ads-dashboard', '/ads'],
  ['command-center', '/command-center'],
  ['life-os', '/life'],
  ['connections', '/connections'],
  ['scheduled-posts', '/schedule'],
  ['custom-mcp', '/custom-mcp'],
  ['settings', '/settings'],
  ['account', '/account'],
  ['studios', '/studios'],
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    storageState: `${STATE_DIR}/storageState.json`,
  });
  const page = await context.newPage();

  const summary = [];

  for (const [name, path] of ROUTES) {
    const consoleErrors = [];
    const failedRequests = [];
    const onConsole = (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 300)); };
    const onResp = (res) => { if (res.status() >= 400) failedRequests.push({ url: res.url(), status: res.status() }); };
    page.on('console', onConsole);
    page.on('response', onResp);

    let status = 'ok';
    let finalUrl = '';
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1200);
      finalUrl = page.url();
    } catch (e) {
      status = `nav-error: ${e.message.slice(0, 150)}`;
    }

    try {
      await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: true });
    } catch (e) {
      status = `screenshot-error: ${e.message.slice(0, 150)}`;
    }

    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    fs.writeFileSync(`${OUT_DIR}/${name}-text.txt`, bodyText.slice(0, 5000));

    page.off('console', onConsole);
    page.off('response', onResp);

    summary.push({ name, path, requestedFinalUrl: finalUrl, status, consoleErrors, failedRequests });
    console.log(name, '->', finalUrl || status, '| errs:', consoleErrors.length, '| failedReq:', failedRequests.length);
  }

  fs.writeFileSync(`${OUT_DIR}/_summary.json`, JSON.stringify(summary, null, 2));
  await browser.close();
})();
