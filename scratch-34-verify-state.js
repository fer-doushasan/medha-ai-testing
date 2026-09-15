const { chromium } = require('playwright');
const fs = require('fs');
const STATE_DIR = './.state';
const BASE = 'https://app.medha.pro';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto(`${BASE}/profiles`, { waitUntil: 'networkidle', timeout: 30000 });

  const out = {};
  out.branding = await page.evaluate(async () => (await fetch('/api/branding', { credentials: 'include' })).json());
  out.projects = await page.evaluate(async () => (await fetch('/api/projects', { credentials: 'include' })).json());
  out.profiles = await page.evaluate(async () => (await fetch('/api/profiles', { credentials: 'include' })).json());
  out.me = await page.evaluate(async () => (await fetch('/api/auth/me', { credentials: 'include' })).json());

  fs.writeFileSync('./discovery-evidence/profiles/state-check.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2).slice(0, 4000));
  await browser.close();
})();
