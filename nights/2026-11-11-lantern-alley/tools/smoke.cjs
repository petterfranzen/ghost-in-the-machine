#!/usr/bin/env node
/* A smoke check for Lantern Alley: drives the built page in a phone-sized
 * Chromium, taps, drags and flicks it the way a thumb would, and asserts what
 * the scene did in reply. It also collects console errors and checks that the
 * page never scrolls.
 *
 *   node tools/smoke.cjs [--shots <dir>]
 *
 * The browser is the sandbox's own Chromium; override with PW_CHROMIUM_PATH.
 * `window.alley` is the handle the app exposes (src/jsapi.scala) — the checks
 * use it to read the state and to place the walker, but everything they assert
 * about behaviour is driven through real pointer events.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SHOT_DIR = process.argv.includes('--shots')
  ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const EXEC = process.env.PW_CHROMIUM_PATH
  || '/opt/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const PAGE = 'file://' + path.resolve(__dirname, '..', 'dist', 'index.html');

let failures = 0;
function check(name, ok, extra) {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${extra ? '  (' + extra + ')' : ''}`);
  if (!ok) failures++;
}

async function shot(page, name) {
  if (!SHOT_DIR) return;
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, name) });
}

const state = (page) => page.evaluate(() => window.alley.state());
const at = (page, x, y) => page.evaluate(([x, y]) => {
  const r = document.getElementById('c').getBoundingClientRect();
  const sc = r.width / 112;
  return [r.left + x * sc, r.top + (y - window.alley.state().camY) * sc];
}, [x, y]);
const lanternPos = async (page, i) => {
  const p = (await state(page)).lanterns;
  return [p[i * 2], p[i * 2 + 1]];
};

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--single-process', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  await page.goto(PAGE);
  await page.waitForFunction('window.alley && window.alley.state().time > 0.4', null, { timeout: 20000 });

  // --- the page itself
  const canvas = await page.evaluate(() => {
    const c = document.getElementById('c');
    const r = c.getBoundingClientRect();
    return { w: r.width, h: r.height, sw: c.width, sh: c.height };
  });
  check('canvas fills the phone, 112x300 logical pixels',
    canvas.w > 200 && canvas.h > 200 && canvas.sw === 112 && canvas.sh === 300,
    `${Math.round(canvas.w)}x${Math.round(canvas.h)} css, ${canvas.sw}x${canvas.sh} logical`);

  const btn = await page.evaluate(() => {
    const r = document.getElementById('sound').getBoundingClientRect();
    return { w: r.width, h: r.height, label: document.getElementById('sound').getAttribute('aria-label') };
  });
  check('sound button is at least 44x44 and labelled',
    btn.w >= 44 && btn.h >= 44 && /Sound (on|off)/.test(btn.label),
    `${Math.round(btn.w)}x${Math.round(btn.h)} "${btn.label}"`);

  await page.click('#sound');
  await page.waitForTimeout(150);
  let s = await state(page);
  check('tapping the sound button starts the audio context', s.sound === true);
  const audio = await page.evaluate(() => alley.audio());
  check('the audio context is running, not suspended', audio === 'running', audio);
  check('the sound choice is remembered in localStorage',
    (await page.evaluate(() => localStorage.getItem('lantern-alley-sound'))) === 'on');

  // --- tap a lantern: it warms
  const [lx, ly] = await lanternPos(page, 5);
  const before = s.warm[5];
  const [px, py] = await at(page, lx, ly);
  await page.mouse.click(px, py);
  await page.waitForTimeout(500);
  s = await state(page);
  check('tapping a lantern warms it', s.warm[5] > before + 0.2, `${before} -> ${s.warm[5]}`);

  // --- long press the same lantern: tended, steadier, tinted
  await page.mouse.move(px, py);
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
  await page.waitForTimeout(250);
  s = await state(page);
  check('a long press tends the lantern', s.steady[5] === true && s.hue[5] !== 0,
    `steady=${s.steady[5]} hue=${s.hue[5]}`);

  // --- drag: the walker follows a thumb held down
  await page.evaluate(() => { alley.warmLantern(3); alley.warmLantern(4); });
  const start = await state(page);
  const [wx0, wy0] = await at(page, start.wx, start.wy);
  await page.mouse.move(wx0, wy0);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    const [mx, my] = await at(page, 56 + Math.sin(i) * 10, start.wy - 60 - i * 12);
    await page.mouse.move(mx, my);
    await page.waitForTimeout(60);
  }
  await page.mouse.up();
  await page.waitForTimeout(2500);
  const dragged = await state(page);
  check('dragging with a thumb walks the walker up the alley', dragged.wy < start.wy - 20,
    `wy ${start.wy} -> ${dragged.wy}`);

  await page.waitForTimeout(700);
  await shot(page, '01-alley-phone.png');

  // --- stand still: the cat comes back
  await page.evaluate(() => alley.standStill());
  await page.waitForTimeout(1700);
  s = await state(page);
  check('standing still brings the cat back to the alley', s.cat === 1 || s.cat === 2, `catMode=${s.cat}`);

  // --- two quick flicks wake the rain
  for (let k = 0; k < 2; k++) {
    const [fx0, fy0] = await at(page, 40, 420);
    await page.mouse.move(fx0, fy0);
    await page.mouse.down();
    await page.mouse.move(fx0 + 130, fy0 - 8, { steps: 3 });
    await page.mouse.up();
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(3500);
  s = await state(page);
  check('two quick flicks raise the rain', s.rain > 0.15, `rain=${s.rain}`);

  // --- a coin in the dark: it only shows once its lantern is warm
  const coinPos = (await state(page)).coinsAt;
  const cx = coinPos[0], cy = coinPos[1];
  const litBefore = await page.evaluate(([x, y]) => alley.lightAt(x, y), [cx, cy]);
  await page.evaluate(() => alley.warmLantern(2));
  await page.waitForTimeout(250);
  const litAfter = await page.evaluate(([x, y]) => alley.lightAt(x, y), [cx, cy]);
  check('a coin in a dark corner is invisible until its lantern is warm',
    litBefore < 0.05 && litAfter > 0.2, `${litBefore.toFixed(2)} -> ${litAfter.toFixed(2)}`);
  await page.evaluate(([x, y]) => alley.place(x, y + 7), [cx, cy]);
  await page.waitForTimeout(1300);
  s = await state(page);
  check('walking over a lit coin picks it up', s.coins >= 1, `coins=${s.coins}`);
  await shot(page, '02-rain-phone.png');

  // --- the far end: the courtyard, the well and the moon
  await page.evaluate(() => {
    alley.place(56, 150);
    for (let i = 0; i < 6; i++) alley.warmLantern(i);
  });
  await page.waitForTimeout(2200);
  await shot(page, '03-courtyard-phone.png');
  s = await state(page);
  check('the camera follows the walker up to the courtyard', s.camY < 80, `camY=${s.camY}`);

  // --- the barred window, and three knocks on the door
  await page.evaluate(() => alley.place(56, 300));
  await page.waitForTimeout(700);
  const win = await page.evaluate(() => alley.windowAt());
  const [wpx, wpy] = await at(page, win[0], win[1]);
  await page.mouse.click(wpx, wpy);
  await page.waitForTimeout(900);
  s = await state(page);
  check('tapping the barred window lights a room behind it', s.window > 0.5, `window=${s.window.toFixed(2)}`);

  const door = await page.evaluate(() => alley.doorAt());
  const [dpx, dpy] = await at(page, door[0], door[1]);
  for (let k = 0; k < 3; k++) { await page.mouse.click(dpx, dpy); await page.waitForTimeout(220); }
  await page.waitForTimeout(1400);
  s = await state(page);
  check('three knocks and something answers from behind the door', s.door > 0.5, `door=${s.door.toFixed(2)}`);

  // --- the page never scrolls under a thumb
  await page.mouse.move(195, 500);
  await page.mouse.down();
  await page.mouse.move(195, 250, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const scrolled = await page.evaluate(() => window.scrollY);
  check('the page does not scroll', scrolled === 0, `scrollY=${scrolled}`);

  // --- desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.reload();
  await page.waitForFunction('window.alley && window.alley.state().time > 0.4', null, { timeout: 20000 });
  const wide = page;
  await wide.evaluate(() => {
    alley.place(56, 430);
    alley.warmLantern(2); alley.warmLantern(3); alley.warmLantern(4);
    alley.tendLantern(3);
  });
  await wide.waitForTimeout(2000);
  await shot(wide, '04-alley-desktop.png');
  check('the desktop page does not scroll either',
    (await wide.evaluate(() => window.scrollY)) === 0);

  check('no console errors', errors.length === 0, errors.slice(0, 4).join(' | '));

  await browser.close();
  console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
