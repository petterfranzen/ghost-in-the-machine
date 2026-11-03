/* A thumb on a phone: taps the pond through a real browser and checks that it
 * answers — ripples, a seek, no console errors, no failed requests, no
 * sideways scrolling, and a canvas that is actually painting.
 * Run: flock /tmp/browser.lock timeout 180 node check.js */
const { chromium } = require('playwright');
const fs = require('fs');

const CHROME = process.env.CHROME_PATH ||
  '/opt/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';

(async () => {
  const errors = [];
  const browser = await chromium.launch(fs.existsSync(CHROME) ? { executablePath: CHROME } : {});
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, hasTouch: true, isMobile: true,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errors.push('request failed: ' + r.url()));

  await page.goto('file://' + __dirname + '/dist/index.html');
  await page.waitForFunction(() => window.PebblePond && window.PebblePond.read(), null, { timeout: 15000 });

  const before = await page.evaluate(() => Array.from(window.PebblePond.read()));
  const box = await page.locator('#stage').boundingBox();
  const toScreen = (x, y) => ({ x: box.x + (x / 320) * box.width, y: box.y + (y / 240) * box.height });

  // three pebbles: one in the middle of the water, two wider out
  const spots = [[160, 130], [110, 100], [215, 165]];
  for (const [px, py] of spots) {
    const p = toScreen(px, py);
    await page.touchscreen.tap(p.x, p.y);
    await page.waitForTimeout(520);
  }
  // and one on the moss, which should answer with dust, not rings
  const moss = toScreen(24, 30);
  await page.touchscreen.tap(moss.x, moss.y);
  await page.waitForTimeout(160);

  // catch the ripples while they are still spreading
  const p = toScreen(190, 120);
  await page.touchscreen.tap(p.x, p.y);
  await page.waitForTimeout(420);
  await page.screenshot({ path: __dirname + '/phone-check.png' });

  const after = await page.evaluate(() => Array.from(window.PebblePond.read()));
  const scroll = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
    caption: document.getElementById('caption').textContent,
  }));
  // is the canvas really painting? count distinct colours in a slice of it
  const colours = await page.evaluate(() => {
    const c = document.getElementById('stage');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    const seen = new Set();
    for (let i = 0; i < d.length; i += 4 * 97) seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
    return seen.size;
  });
  await browser.close();

  const I = { taps: 5, water: 6, moss: 7, seeks: 8 };
  const fail = [];
  if (after[I.taps] < 4) fail.push(`only ${after[I.taps]} of 5 taps registered`);
  if (after[I.water] < 3) fail.push(`only ${after[I.water]} pebbles reached the water`);
  if (after[I.moss] < 1) fail.push('the pebble on the moss was lost');
  if (!(after[I.seeks] >= 1)) fail.push('no koi turned towards a pebble');
  if (!(before[I.taps] === 0)) fail.push('the pond was already tapped before the check ran');
  if (colours < 20) fail.push(`the canvas looks blank (${colours} distinct colours)`);
  if (scroll.sw > scroll.iw + 1) fail.push(`sideways scroll: ${scroll.sw} > ${scroll.iw}`);
  if (!/ripple|koi|still/.test(scroll.caption)) fail.push(`caption never changed: ${scroll.caption}`);
  if (errors.length) fail.push(...errors);

  if (fail.length) { console.error('FAIL\n' + fail.join('\n')); process.exit(1); }
  console.log(`OK  taps=${after[I.taps]} water=${after[I.water]} moss=${after[I.moss]} seeks=${after[I.seeks]} ` +
    `colours=${colours} scroll=${scroll.sw}/${scroll.iw} caption="${scroll.caption}" errors=0`);
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
