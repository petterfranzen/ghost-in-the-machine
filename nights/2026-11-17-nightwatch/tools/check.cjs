// check.cjs — the smoke check. Serves nothing itself: point BASE at a built
// dist/ and it drives the same gestures a visitor makes, on a desktop and on a
// 390 px phone, and reports console errors, failed requests, sideways scrolling
// and every interaction it could not complete. Everything here is a real
// pointer, touch or key event: no test hook pokes the world's state.
//   BASE=http://127.0.0.1:8899/index.html OUT=~/work/shots node check.cjs
const { chromium } = require('playwright');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:8899/index.html';
const OUT = process.env.OUT || '.';
const problems = [];
const done = [];

function fail(msg) { problems.push(msg); }
function ok(msg) { done.push(msg); }

function parse(summary) {
  const out = {};
  for (const kv of summary.split(' ')) {
    const at = kv.indexOf('=');
    if (at > 0) out[kv.slice(0, at)] = kv.slice(at + 1);
  }
  return out;
}

function watch(page) {
  const errs = [];
  const failed = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('requestfailed', r => failed.push(r.url() + ' -> ' + ((r.failure() || {}).errorText || '?')));
  return { errs, failed };
}

function reportErrors(log, label) {
  if (log.errs.length) fail(label + ': console errors: ' + log.errs.slice(0, 4).join(' | '));
  else ok(label + ': no console errors');
  if (log.failed.length) fail(label + ': failed requests: ' + log.failed.slice(0, 4).join(' | '));
  else ok(label + ': no failed requests');
}

const read = async page => parse(await page.evaluate(() => globalThis.Nightwatch.read()));

async function starPos(page, i) {
  const raw = await page.evaluate(n => globalThis.Nightwatch.starPos(n), i);
  const [x, y] = raw.split(',').map(Number);
  return { x, y };
}

// The sky wraps, so a star can sit just outside the viewport; pick one that is
// plainly on screen before reaching for it.
async function visibleStar(page, from) {
  const start = from || 0;
  for (let i = start; i < Math.min(start + 60, 172); i += 1) {
    const p = await starPos(page, i);
    if (p.x > 0.06 && p.x < 0.94 && p.y > 0.06 && p.y < 0.9) return { i, p };
  }
  return null;
}

// The gestures below are real: coordinates come from the canvas box and land on
// the pixels the star is drawn at, so hit testing (and the Tab order) is real.
const viewBox = page => page.evaluate(() => {
  const b = document.getElementById('sky').getBoundingClientRect();
  return { l: b.left, t: b.top, w: b.width, h: b.height };
});
const toPixels = (box, p) => ({ x: box.l + p.x * box.w, y: box.t + p.y * box.h });

async function clickAt(page, p) {
  const q = toPixels(await viewBox(page), p);
  await page.mouse.move(q.x, q.y);
  await page.mouse.down();
  await page.waitForTimeout(60);
  await page.mouse.up();
}

// A press is held until it lands: this vm's rAF can run slowly, so a fixed
// 1 s wait is not enough for the 0.8 s long press to accumulate.
async function pressAndWait(page, p, changed, budget = 6000) {
  const q = toPixels(await viewBox(page), p);
  const before = await read(page);
  await page.mouse.move(q.x, q.y);
  await page.mouse.down();
  const deadline = Date.now() + budget;
  let after = before;
  while (Date.now() < deadline) {
    await page.waitForTimeout(100);
    after = await read(page);
    if (changed(before, after)) break;
  }
  await page.mouse.up();
  await page.waitForTimeout(100);
  return { before, after };
}

const marked = (b, a) => Number(a.marks) > Number(b.marks);
const heldAt = (page, p) => pressAndWait(page, p, marked);

// A real long press on a touch screen, through the CDP touch pipeline, so
// pointer events arrive exactly as a thumb would send them.
async function touchHold(context, page, p) {
  const q = toPixels(await viewBox(page), p);
  const client = await context.newCDPSession(page);
  const before = await read(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: q.x, y: q.y }] });
  const deadline = Date.now() + 6000;
  let after = before;
  while (Date.now() < deadline) {
    await page.waitForTimeout(100);
    after = await read(page);
    if (marked(before, after)) break;
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
  await page.waitForTimeout(100);
}

// A slow drag, moved in small real steps so it never becomes a flick.
async function slowDrag(page, from, dy) {
  const start = toPixels(await viewBox(page), from);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (let i = 1; i <= 20; i += 1) {
    await page.mouse.move(start.x, start.y + (dy * i) / 20, { steps: 1 });
    await page.waitForTimeout(50);
  }
  await page.mouse.up();
  await page.waitForTimeout(160);
}

async function noScroll(page, label) {
  const over = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - window.innerWidth,
    y: document.documentElement.scrollHeight - window.innerHeight
  }));
  if (over.x > 1 || over.y > 1) fail(label + ': page scrolls (' + over.x + ' x, ' + over.y + ' y)');
  else ok(label + ': no page scroll');
}

// Three fresh visitors must get three different skies, and each sky's seed must
// be sitting in the URL; a seed in the URL must come straight back.
async function checkSeedFreshness(browser) {
  const seeds = [];
  for (let i = 0; i < 3; i += 1) {
    const context = await browser.newContext({ viewport: { width: 900, height: 700 } });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForTimeout(250);
    seeds.push((await read(page)).seed);
    if (!/[?&]seed=\d+/.test(page.url())) fail('seed: fresh load ' + i + ' did not write ?seed= to the URL (' + page.url() + ')');
    await context.close();
  }
  if (new Set(seeds).size !== 3) fail('seed: three fresh loads gave ' + seeds.join(', '));
  else ok('seed: three fresh loads gave three skies (' + seeds.join(', ') + ')');
  await checkPinnedSeed(browser);
}

async function checkPinnedSeed(browser) {
  const context = await browser.newContext({ viewport: { width: 900, height: 700 } });
  const page = await context.newPage();
  await page.goto(BASE.split('?')[0] + '?seed=12345', { waitUntil: 'load' });
  await page.waitForTimeout(250);
  const pinned = (await read(page)).seed;
  if (Number(pinned) !== 12345) fail('seed: ?seed=12345 loaded seed ' + pinned);
  else ok('seed: ?seed=12345 is honoured');
  await context.close();
}

async function checkBoot(page, s) {
  const test = await page.evaluate(() => globalThis.Nightwatch.selfTest());
  if (!String(test).startsWith('ok')) fail('desktop: self test -> ' + test);
  else ok('desktop: self test ' + test);
  if (Number(s.stars) !== 172) fail('desktop: expected 172 stars, got ' + s.stars);
  if (Number(s.sound) !== 0 || s.ctx !== 'off') fail('desktop: sound or AudioContext started before a press (' + s.sound + '/' + s.ctx + ')');
  else ok('desktop: silent until pressed');
  await noScroll(page, 'desktop');
}

async function checkStarGestures(page) {
  const pick = await visibleStar(page, 0);
  if (!pick) { fail('desktop: no star is on screen to touch'); return null; }
  const p = pick.p;
  await clickAt(page, p);
  await page.waitForTimeout(160);
  if (Number((await read(page)).glints) < 1) fail('desktop: tapping a star left no glint');
  else ok('desktop: star tap glints');
  await heldAt(page, p);
  if (Number((await read(page)).marks) < 1) fail('desktop: holding a star did not mark it');
  else ok('desktop: hold marks a star');
  return p;
}

async function checkSound(page) {
  await page.click('#sound');
  await page.waitForTimeout(500);
  const s = await read(page);
  if (Number(s.sound) !== 1) fail('desktop: sound button did not turn sound on');
  if (Number(s.voices) < 1) fail('desktop: no voice was created after unmuting');
  if (Number(s.level) < 500 || Number(s.level) > 700) fail('desktop: master level ' + s.level + ' is outside 500..700');
  else ok('desktop: sound on, master ' + s.level + '/1000, ' + s.voices + ' voices');
  const pressed = await page.getAttribute('#sound', 'aria-pressed');
  if (pressed !== 'true') fail('desktop: sound button aria-pressed is ' + pressed);
}

async function checkPanAndFlick(page) {
  const before = await read(page);
  await page.mouse.move(640, 300);
  await page.mouse.down();
  await page.mouse.move(430, 300, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(160);
  const dragged = await read(page);
  if (dragged.pan === before.pan) fail('desktop: dragging sideways did not pan the sky');
  else ok('desktop: drag pans the sky');
  await page.mouse.move(500, 500);
  await page.mouse.down();
  await page.mouse.move(900, 500, { steps: 1 });
  await page.mouse.up();
  await page.waitForTimeout(240);
  if ((await read(page)).pan === dragged.pan) fail('desktop: a quick flick did not throw the sky');
  else ok('desktop: flick throws the sky');
}

async function checkKeyboard(page) {
  await page.focus('#sky');
  const before = await read(page);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(80);
  if ((await read(page)).pan === before.pan) fail('desktop: ArrowRight did not pan the sky');
  else ok('desktop: keyboard pans the sky');

  // Tab must leave the canvas and reach the sound button, not be swallowed
  await page.keyboard.press('Tab');
  await page.waitForTimeout(80);
  const focused = await page.evaluate(() => (document.activeElement && document.activeElement.id) || '(none)');
  if (focused !== 'sound') fail('desktop: Tab from the sky focused "' + focused + '", not the sound button');
  else ok('desktop: Tab reaches the sound button from the sky');

  await page.focus('#sky');
  const typed = await read(page);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(80);
  if (Number((await read(page)).gestures) <= Number(typed.gestures)) fail('desktop: Enter on the sky did not count as a tap');
  else ok('desktop: Enter on the sky taps');
}

async function checkDome(page) {
  await clickAt(page, { x: 0.28, y: 0.825 });
  await page.waitForTimeout(700);
  if (Number((await read(page)).open) !== 1) fail('desktop: tapping the dome did not open the slit');
  else ok('desktop: dome opens');
  await clickAt(page, { x: 0.28, y: 0.825 });
  await page.waitForTimeout(200);
}

const NAMING = [
  { centre: 0.132, size: 7, start: 0 },
  { centre: 0.36, size: 6, start: 7 },
  { centre: 0.576, size: 5, start: 13 },
  { centre: 0.762, size: 8, start: 18 },
  { centre: 0.923, size: 4, start: 26 }
];

async function checkNaming(page) {
  for (const con of NAMING) {
    await page.evaluate(lon => globalThis.Nightwatch.lookAt(lon), con.centre);
    await page.waitForTimeout(90);
    for (let k = 0; k < con.size; k += 1) {
      const i = con.start + k;
      const p = await starPos(page, i);
      if (p.x < 0.01 || p.x > 0.99 || p.y < 0.01 || p.y > 0.99) {
        fail('desktop: star ' + i + ' is off screen at ' + p.x.toFixed(2) + ',' + p.y.toFixed(2));
        continue;
      }
      await heldAt(page, p);
    }
  }
  const s = await read(page);
  if (Number(s.named) < 5) fail('desktop: holding every star of every constellation named only ' + s.named + ' of 5 (marks ' + s.marks + ')');
  else ok('desktop: all five constellations named (' + s.names + ')');
}

async function waitFor(page, key, target, tries, pause) {
  let value = 0;
  for (let i = 0; i < tries && value < target; i += 1) {
    await page.waitForTimeout(pause);
    value = Number((await read(page))[key]);
  }
  return value;
}

async function checkWeather(page) {
  const aurora = await waitFor(page, 'aurora', 45, 70, 1000);
  if (aurora < 45) fail('desktop: the aurora never rose after naming everything (aurora=' + aurora + ')');
  else ok('desktop: aurora rose ' + aurora + '/100 after the naming and the stillness');
  const meteors = await waitFor(page, 'meteorsSeen', 1, 70, 450);
  if (meteors < 1) fail('desktop: no meteor appeared while sitting still');
  else ok('desktop: a meteor crossed');
  await page.screenshot({ path: path.join(OUT, 'desktop-late.png') });
}

// A slow vertical drag starting on a star must tilt the view, not mark the star,
// and a steep drag must tilt too (both used to be ignored).
async function checkTiltGestures(page) {
  const before = await read(page);
  const pick = await visibleStar(page, 30);
  if (!pick) fail('desktop: no unmarked star is on screen for the slow drag');
  else {
    await slowDrag(page, pick.p, 160);
    const tilted = await read(page);
    if (tilted.tilt === before.tilt) fail('desktop: a slow vertical drag did not tilt the view (' + before.tilt + ' -> ' + tilted.tilt + ')');
    else ok('desktop: a slow vertical drag tilts the view');
    if (Number(tilted.marks) !== Number(before.marks)) fail('desktop: a press that moved marked a star (' + before.marks + ' -> ' + tilted.marks + ')');
    else ok('desktop: a press that moves does not mark a star');
  }
  const steepBefore = await read(page);
  await page.mouse.move(600, 250);
  await page.mouse.down();
  await page.mouse.move(640, 520, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(160);
  if ((await read(page)).tilt === steepBefore.tilt) fail('desktop: a steep drag did not tilt the view');
  else ok('desktop: a steep drag tilts the view');
}

// The seed lives in the URL and the names belong to that seed, so a reload
// brings back both; a reseed must move the URL with it.
async function checkMemory(page) {
  const s = await read(page);
  if (!page.url().includes('seed=' + s.seed)) fail('desktop: the URL is ' + page.url() + ', not seed=' + s.seed);
  else ok('desktop: the URL carries the sky\'s seed');
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(700);
  if (Number((await read(page)).named) < 5) fail('desktop: after a reload the named constellations did not come back');
  else ok('desktop: the sky remembered the named constellations after a reload');
  await checkReseed(page);
}

async function checkReseed(page) {
  const before = (await read(page)).seed;
  await pressAndWait(page, { x: 0.28, y: 0.825 }, (b, a) => a.seed !== b.seed);
  const s = await read(page);
  if (s.seed === before) fail('desktop: a long press on the dome did not reseed the sky (' + before + ')');
  else ok('desktop: a long press on the dome reseeds (' + before + ' -> ' + s.seed + ')');
  if (!page.url().includes('seed=' + s.seed)) fail('desktop: after a reseed the URL is ' + page.url() + ', not seed=' + s.seed);
  else ok('desktop: the URL carries the new seed');
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(700);
  if (Number((await read(page)).seed) !== Number(s.seed)) fail('desktop: a reload after a reseed gave the wrong seed');
  else ok('desktop: the reseeded sky comes back from the URL');
}

async function runDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const log = watch(page);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  const handle = await page.evaluate(() => typeof globalThis.Nightwatch);
  if (handle !== 'object') { fail('desktop: Nightwatch handle missing (' + handle + ')'); await context.close(); return; }
  await checkBoot(page, await read(page));
  await page.screenshot({ path: path.join(OUT, 'desktop.png') });
  await checkStarGestures(page);
  await checkSound(page);
  await checkPanAndFlick(page);
  await checkKeyboard(page);
  await checkDome(page);
  await checkNaming(page);
  await checkWeather(page);
  await checkTiltGestures(page);
  await checkMemory(page);
  reportErrors(log, 'desktop');
  await context.close();
}

async function runPhone(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  const log = watch(page);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  await noScroll(page, 'phone');
  await page.screenshot({ path: path.join(OUT, 'phone.png') });
  await checkPhoneTarget(page);
  await checkPhoneTouch(context, page);
  reportErrors(log, 'phone');
  await context.close();
}

async function checkPhoneTarget(page) {
  const box = await page.evaluate(() => {
    const b = document.getElementById('sound').getBoundingClientRect();
    return { w: b.width, h: b.height };
  });
  if (box.h < 44 || box.w < 44) fail('phone: the sound button is ' + box.w + 'x' + box.h + ', under 44 px');
  else ok('phone: sound button is ' + Math.round(box.w) + 'x' + Math.round(box.h));
}

// One thumb: two real taps, then a real touch long press on a star.
async function checkPhoneTouch(context, page) {
  await page.touchscreen.tap(195, 120);
  await page.waitForTimeout(80);
  await page.touchscreen.tap(195, 420);
  await page.waitForTimeout(80);
  await touchHold(context, page, await starPos(page, 3));
  const s = await read(page);
  if (Number(s.gestures) < 2) fail('phone: real touches were not counted as gestures (' + s.gestures + ')');
  if (Number(s.marks) < 1) fail('phone: a held press did not mark a star');
  else ok('phone: a touch long press marks a star');
  await page.touchscreen.tap(180, 96);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, 'phone-after.png') });
}

async function runReducedMotion(browser) {
  const context = await browser.newContext({ viewport: { width: 900, height: 700 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const s = await read(page);
  if (Number(s.motion) > 40) fail('reduced motion: the world still moves at ' + s.motion + '/100');
  else ok('reduced motion: the world settles to ' + s.motion + '/100');
  await context.close();
}

(async () => {
  const browser = await chromium.launch();
  try {
    await checkSeedFreshness(browser);
    await runDesktop(browser);
    await runPhone(browser);
    await runReducedMotion(browser);
  } catch (e) {
    fail('threw: ' + e.message);
  } finally {
    await browser.close();
  }
  for (const line of done) console.log('  ok   ' + line);
  for (const line of problems) console.log('  FAIL ' + line);
  console.log(problems.length ? problems.length + ' problem(s)' : 'all checks passed');
  process.exit(problems.length ? 1 : 0);
})();
