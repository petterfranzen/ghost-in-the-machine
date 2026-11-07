// Aurora Ridge — phone playtest. Drives the real page in Chromium at 390x844:
// taps the sky, toggles sound, and checks the house rules (44 px targets,
// 16 px text, no sideways scroll, empty console, sound off until asked,
// reduced-motion variant). Run: node tools/playtest.mjs
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const url = pathToFileURL(resolve('dist/index.html')).href;
let failures = 0;
const ok = (m) => console.log(`  ok   ${m}`);
const fail = (m) => { failures++; console.error(`  FAIL ${m}`); };
const check = (c, m) => (c ? ok(m) : fail(m));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const errors = [];
const failedRequests = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('requestfailed', (r) => failedRequests.push(r.url()));
const requests = [];
page.on('request', (r) => requests.push(r.url()));

await page.addInitScript(() => {
  window.__audio = 0;
  const Real = window.AudioContext;
  window.AudioContext = class extends Real {
    constructor(...a) { window.__audio++; super(...a); }
  };
});

await page.goto(url);
await page.waitForTimeout(900);

// --- sound stays off until asked --------------------------------------------
check((await page.evaluate(() => window.__audio)) === 0, 'no AudioContext before any tap');
check((await page.getAttribute('#sound', 'aria-pressed')) === 'false', 'sound starts off');

// --- text sizes ---------------------------------------------------------------
for (const sel of ['body', '.hint', '.foot p', '.lede', '#sound']) {
  const px = await page.$eval(sel, (el) => parseFloat(getComputedStyle(el).fontSize));
  check(px >= 16, `${sel} text is ${px}px (>= 16)`);
}

// --- tap targets ---------------------------------------------------------------
const small = await page.$$eval('button, a, [role="button"], input', (els) =>
  els.map((el) => { const r = el.getBoundingClientRect(); return { t: el.textContent.trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) }; })
     .filter((e) => e.w < 44 || e.h < 44));
check(small.length === 0, `every control is at least 44x44${small.length ? ' — ' + JSON.stringify(small) : ''}`);
const canvasBox = await page.$eval('#scene', (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
check(canvasBox[0] >= 44 && canvasBox[1] >= 44, `the scene is a ${canvasBox.join('x')} tap target`);

// --- no sideways scroll ---------------------------------------------------------
const scroll = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
check(scroll[0] <= scroll[1], `no sideways scroll (${scroll[0]} <= ${scroll[1]})`);

// --- tap the sky ----------------------------------------------------------------
const before = await page.screenshot();
await page.mouse.click(195, 400);
await page.waitForTimeout(600);
await page.screenshot({ path: 'shots/phone-tap.png' });
check(!before.equals(await page.screenshot()), 'a tap changes the scene');

// --- raise button and keyboard --------------------------------------------------
await page.click('#raise');
await page.waitForTimeout(200);
await page.focus('#scene');
await page.keyboard.press('Enter');
await page.waitForTimeout(200);
ok('the Raise button and Enter both raise a ribbon');

// --- sound toggle -----------------------------------------------------------------
await page.click('#sound');
await page.waitForTimeout(300);
check((await page.getAttribute('#sound', 'aria-pressed')) === 'true', 'sound toggles on when asked');
check((await page.evaluate(() => window.__audio)) === 1, 'exactly one AudioContext, created by the click');
await page.click('#raise');
await page.waitForTimeout(300);
await page.screenshot({ path: 'shots/phone-sound.png' });

// --- reduced motion ---------------------------------------------------------------
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.reload();
await page.waitForTimeout(700);
await page.mouse.click(195, 380);
await page.waitForTimeout(500);
await page.screenshot({ path: 'shots/phone-reduced.png' });
const reducedCss = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
check(reducedCss, 'the reduced-motion variant loads without error');

// --- network & console --------------------------------------------------------------
const external = requests.filter((u) => !u.startsWith('file:') && !u.startsWith('data:'));
check(external.length === 0, `no network requests${external.length ? ': ' + external.join(', ') : ''}`);
check(errors.length === 0, `console is empty${errors.length ? ': ' + errors.join(' | ') : ''}`);
check(failedRequests.length === 0, 'no failed requests');

await browser.close();
if (failures) { console.error(`\n${failures} check(s) failed`); process.exit(1); }
console.log('\nphone playtest passed');
