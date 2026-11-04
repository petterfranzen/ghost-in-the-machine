/* A thumb on a phone: taps the pond through a real browser and checks that it
 * answers — ripples, a seek, no console errors, no failed requests, no
 * sideways scrolling, and a canvas that is actually painting. It also checks
 * the calm defaults: sound off until the note is tapped, the instruction line
 * legible, the note button a full thumb target, and a reader who prefers
 * reduced motion getting half the settle.
 * Run: flock /tmp/browser.lock timeout 180 node check.js */
const { chromium } = require('playwright');
const fs = require('fs');

const CHROME = process.env.CHROME_PATH ||
  '/opt/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const URL = 'file://' + __dirname + '/dist/index.html';

(async () => {
  const fail = [];
  const errors = [];
  const args = fs.existsSync(CHROME) ? { executablePath: CHROME } : {};
  const browser = await chromium.launch(args);
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, hasTouch: true, isMobile: true,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errors.push('request failed: ' + r.url()));

  await page.goto(URL);
  await page.waitForFunction(() => window.PebblePond && window.PebblePond.read(), null, { timeout: 15000 });

  // --- the page's calm defaults, before any tap ------------------------------
  const opening = await page.evaluate(() => {
    const b = document.getElementById('sound');
    const r = b.getBoundingClientRect();
    return {
      pressed: b.getAttribute('aria-pressed'),
      lit: b.classList.contains('on'),
      w: Math.round(r.width), h: Math.round(r.height),
      hintPx: parseFloat(getComputedStyle(document.getElementById('hint')).fontSize),
      motion: window.PebblePond.exports.motion_scale(),
    };
  });

  const before = await page.evaluate(() => Array.from(window.PebblePond.read()));
  const box = await page.locator('#stage').boundingBox();
  const toScreen = (x, y) => ({ x: box.x + (x / 320) * box.width, y: box.y + (y / 240) * box.height });

  // three pebbles: one in the middle of the water, two wider out — silent
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

  // --- one tap on the note wakes the sound -----------------------------------
  await page.click('#sound');
  await page.waitForTimeout(60);
  const woken = await page.evaluate(() => {
    const b = document.getElementById('sound');
    return { pressed: b.getAttribute('aria-pressed'), lit: b.classList.contains('on') };
  });
  // and a pebble with sound on still lands, with no console noise
  const q = toScreen(150, 150);
  await page.touchscreen.tap(q.x, q.y);
  await page.waitForTimeout(200);

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

  // --- a reader who asked for less motion ------------------------------------
  const calmBrowser = await chromium.launch(args);
  const calmCtx = await calmBrowser.newContext({
    viewport: { width: 390, height: 844 }, reducedMotion: 'reduce',
    hasTouch: true, isMobile: true,
  });
  const calmPage = await calmCtx.newPage();
  const calmErrors = [];
  calmPage.on('pageerror', (e) => calmErrors.push('pageerror: ' + e.message));
  await calmPage.goto(URL);
  await calmPage.waitForFunction(() => window.PebblePond && window.PebblePond.read(), null, { timeout: 15000 });
  const reduced = await calmPage.evaluate(() => window.PebblePond.exports.motion_scale());
  await calmBrowser.close();

  // --- the verdict -----------------------------------------------------------
  const I = { taps: 5, water: 6, moss: 7, seeks: 8 };
  if (after[I.taps] < 5) fail.push(`only ${after[I.taps]} of 6 taps registered`);
  if (after[I.water] < 4) fail.push(`only ${after[I.water]} pebbles reached the water`);
  if (after[I.moss] < 1) fail.push('the pebble on the moss was lost');
  if (!(after[I.seeks] >= 1)) fail.push('no koi turned towards a pebble');
  if (!(before[I.taps] === 0)) fail.push('the pond was already tapped before the check ran');
  if (colours < 20) fail.push(`the canvas looks blank (${colours} distinct colours)`);
  if (scroll.sw > scroll.iw + 1) fail.push(`sideways scroll: ${scroll.sw} > ${scroll.iw}`);
  if (!/ripple|koi|still/.test(scroll.caption)) fail.push(`caption never changed: ${scroll.caption}`);
  if (errors.length) fail.push(...errors);
  if (calmErrors.length) fail.push(...calmErrors);

  // calm defaults
  if (opening.pressed !== 'false') fail.push(`sound starts pressed: aria-pressed="${opening.pressed}"`);
  if (opening.lit) fail.push('the note button starts lit (sound on)');
  if (opening.w < 44 || opening.h < 44) fail.push(`the note button is ${opening.w}x${opening.h}, under 44 px`);
  if (!(opening.hintPx >= 14)) fail.push(`the instruction line is ${opening.hintPx} px, under 14`);
  if (opening.motion !== 1) fail.push(`motion scale starts at ${opening.motion}, not 1`);
  if (woken.pressed !== 'true' || !woken.lit) fail.push(`tapping the note did not turn sound on: ${JSON.stringify(woken)}`);
  if (reduced !== 0.5) fail.push(`prefers-reduced-motion did not halve the settle: motion scale ${reduced}`);

  if (fail.length) { console.error('FAIL\n' + fail.join('\n')); process.exit(1); }
  console.log(`OK  taps=${after[I.taps]} water=${after[I.water]} moss=${after[I.moss]} seeks=${after[I.seeks]} ` +
    `colours=${colours} scroll=${scroll.sw}/${scroll.iw} caption="${scroll.caption}" errors=0 ` +
    `sound=${opening.pressed}->${woken.pressed} note=${opening.w}x${opening.h} hint=${opening.hintPx}px ` +
    `motion=${opening.motion}/reduced=${reduced}`);
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
