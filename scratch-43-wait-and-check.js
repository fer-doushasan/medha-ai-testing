const { chromium } = require('playwright');
const fs = require('fs');
const OUT_DIR = './discovery-evidence/project-agent';
const STATE_DIR = './.state';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, storageState: `${STATE_DIR}/storageState.json` });
  const page = await context.newPage();
  await page.goto('https://app.medha.pro/chat?id=3654', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(12000);
  await page.screenshot({ path: `${OUT_DIR}/11-after-more-wait.png`, fullPage: true });
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync(`${OUT_DIR}/11-after-more-wait.txt`, text.slice(0, 8000));

  // Now check the project workspace goal/plan state directly via API
  const plan = await page.evaluate(async () => (await fetch('/api/projects/436/plan', { credentials: 'include' })).json());
  const workspace = await page.evaluate(async () => (await fetch('/api/projects/436/workspace', { credentials: 'include' })).json());
  fs.writeFileSync(`${OUT_DIR}/plan-after-architect.json`, JSON.stringify({ plan, workspace }, null, 2));
  console.log('GOAL:', workspace.goal);
  console.log('PLAN goal_snapshot:', plan.plan ? plan.plan.goal_snapshot : plan);

  await browser.close();
})();
