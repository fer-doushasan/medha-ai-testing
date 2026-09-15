// Login flow test. Credentials from env vars only; nothing sensitive is logged or written to disk.
const { chromium } = require('playwright');
const fs = require('fs');

const OUT_DIR = './discovery-evidence';
const STATE_DIR = './.state';
const BASE_URL = 'https://app.medha.pro/';

const EMAIL = process.env.MEDHA_EMAIL;
const PASSWORD = process.env.MEDHA_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error('MEDHA_EMAIL / MEDHA_PASSWORD env vars not set');
  process.exit(1);
}

const SENSITIVE_KEYS = /token|secret|password|otp|api[_-]?key|session|cookie|auth(?!entication_error|entication_required)/i;
function redact(obj) {
  if (Array.isArray(obj)) return obj.map(redact);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = SENSITIVE_KEYS.test(k) ? '<REDACTED>' : redact(v);
    return out;
  }
  return obj;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const authRequests = [];
  page.on('request', (req) => {
    if (/login|auth|signin|session/i.test(req.url())) {
      let body = null;
      try { body = req.postData(); } catch (e) {}
      let parsedBody = null;
      if (body) { try { parsedBody = redact(JSON.parse(body)); } catch (e) { parsedBody = '<non-json>'; } }
      authRequests.push({ method: req.method(), url: req.url(), body: parsedBody });
    }
  });
  page.on('response', async (res) => {
    if (/login|auth|signin|session/i.test(res.url())) {
      const entry = authRequests.find((r) => r.url === res.url() && r.status === undefined);
      if (entry) entry.status = res.status();
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 45000 });
  await page.fill('input[type="email"], input#email, input[name="email"]', EMAIL).catch(async () => {
    const inputs = await page.$$('input');
    if (inputs[0]) await inputs[0].fill(EMAIL);
  });
  await page.fill('input[type="password"], input#password, input[name="password"]', PASSWORD).catch(async () => {
    const inputs = await page.$$('input');
    if (inputs[1]) await inputs[1].fill(PASSWORD);
  });

  await page.screenshot({ path: `${OUT_DIR}/02-login-filled.png` });

  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {}),
    page.click('button:has-text("Sign in")'),
  ]);

  await page.waitForTimeout(3000);
  console.log('Post-login URL:', page.url());
  await page.screenshot({ path: `${OUT_DIR}/03-post-login.png`, fullPage: true });

  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  fs.writeFileSync(`${OUT_DIR}/03-post-login-bodytext.txt`, bodyText);

  fs.writeFileSync(`${OUT_DIR}/auth-requests-redacted.json`, JSON.stringify(authRequests, null, 2));

  // Save storage state for reuse in subsequent scripts (gitignored .state dir)
  await context.storageState({ path: `${STATE_DIR}/storageState.json` });

  console.log('Login flow complete. Auth requests captured:', authRequests.length);
  await browser.close();
})();
