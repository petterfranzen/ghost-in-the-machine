// check.cjs — the smoke check. Serves nothing itself: point BASE at a built
// dist/ and it drives the same gestures a visitor makes, on a desktop and on a
// 390 px phone, and reports console errors, failed requests, sideways scrolling
// and every interaction it could not complete.
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

const read = async page => parse(await page.evaluate(() => globalThis.Nightwatch.read()));
const starPos = async (page, i) => {
  const raw = await page.evaluate(n => globalThis.Nightwatch.starPos(n), i);
  const [x, y] = raw.split(',').map(Number);
  return { x, y };
};
const tapStar = (page, p) => page.evaluate(q => globalThis.Nightwatch.tap(q.x, q.y), p);
const holdStar = async (page, p) => {
  await page.evaluate(q => globalThis.Nightwatch.hold(q.x, q.y), p);
  await page.waitForTimeout(70);
  await page.evaluate(() => globalThis.Nightwatch.holdEnd());
};

async function noScroll(page, label) {
  const over = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - window.innerWidth,
    y: document.documentElement.scrollHeight - window.innerHeight
  }));
  if (over.x > 1 || over.y > 1) fail(label + ': page scrolls (' + over.x + ' x, ' + over.y + ' y)');
  else ok(label + ': no page scroll');
}

async function runDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const log = watch(page);
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(900);

  const handle = await page.evaluate(() => typeof globalThis.Nightwatch);
  if (handle !== 'object') { fail('desktop: Nightwatch handle missing (' + handle + ')'); return; }

  const test = await page.evaluate(() => globalThis.Nightwatch.selfTest());
  if (!String(test).startsWith('ok')) fail('desktop: self test -> ' + test);
  else ok('desktop: self test ' + test);

  let s = await read(page);
  if (Number(s.stars) !== 172) fail('desktop: expected 172 stars, got ' + s.stars);
  if (Number(s.sound) !== 0 || s.ctx !== 'off') fail('desktop: sound or AudioContext started before a press (' + s.sound + '/' + s.ctx + ')');
  else ok('desktop: silent until pressed');
  await noScroll(page, 'desktop');
  await page.screenshot({ path: path.join(OUT, 'desktop.png') });

  // the sky: tap a star, hold a star
  const before = s;
  const p0 = await starPos(page, 0);
  await tapStar(page, p0);
  await page.waitForTimeout(120);
  s = await read(page);
  if (Number(s.glints) < 1) fail('desktop: tapping a star left no glint');
  else ok('desktop: star tap glints');

  await holdStar(page, p0);
  await page.waitForTimeout(120);
  s = await read(page);
  if (Number(s.marks) < 1) fail('desktop: holding a star did not mark it');
  else ok('desktop: hold marks a star');

  // the sound button: must answer at once
  await page.click('#sound');
  await page.waitForTimeout(500);
  s = await read(page);
  if (Number(s.sound) !== 1) fail('desktop: sound button did not turn sound on');
  if (Number(s.voices) < 1) fail('desktop: no voice was created after unmuting');
  if (Number(s.level) < 500 || Number(s.level) > 700) fail('desktop: master level ' + s.level + ' is outside 500..700');
  else ok('desktop: sound on, master ' + s.level + '/1000, ' + s.voices + ' voices');
  const pressed = await page.getAttribute('#sound', 'aria-pressed');
  if (pressed !== 'true') fail('desktop: sound button aria-pressed is ' + pressed);

  // drag, flick and the keyboard
  await page.mouse.move(640, 300);
  await page.mouse.down();
  await page.mouse.move(430, 300, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(120);
  const dragged = await read(page);
  if (dragged.pan === before.pan) fail('desktop: dragging sideways did not pan the sky');
  else ok('desktop: drag pans the sky');

  await page.mouse.move(500, 500);
  await page.mouse.down();
  await page.mouse.move(900, 500, { steps: 1 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const flicked = await read(page);
  if (flicked.pan === dragged.pan) fail('desktop: a quick flick did not throw the sky');
  else ok('desktop: flick throws the sky');

  await page.focus('#sky');
  const keyBefore = await read(page);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(80);
  const keyAfter = await read(page);
  if (keyAfter.pan === keyBefore.pan) fail('desktop: ArrowRight did not pan the sky');
  else ok('desktop: keyboard pans the sky');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(80);

  // the dome
  await tapStar(page, { x: 0.28, y: 0.825 });
  await page.waitForTimeout(700);
  s = await read(page);
  if (Number(s.open) !== 1) fail('desktop: tapping the dome did not open the slit');
  else ok('desktop: dome opens');
  await tapStar(page, { x: 0.28, y: 0.825 });
  await page.waitForTimeout(200);

  // name every constellation, then wait for the aurora
  const centres = [0.132, 0.36, 0.576, 0.762, 0.923];
  for (let ci = 0; ci < 5; ci += 1) {
    const size = [7, 6, 5, 8, 4][ci];
    const start = [0, 7, 13, 18, 26][ci];
    await page.evaluate(lon => globalThis.Nightwatch.lookAt(lon), centres[ci]);
    await page.waitForTimeout(90);
    for (let k = 0; k < size; k += 1) {
      const p = await starPos(page, start + k);
      if (p.x < 0.01 || p.x > 0.99 || p.y < 0.01 || p.y > 0.99) {
        fail('desktop: star ' + (start + k) + ' of constellation ' + ci + ' is off screen at ' + p.x.toFixed(2) + ',' + p.y.toFixed(2));
        continue;
      }
      await holdStar(page, p);
    }
  }
  s = await read(page);
  if (Number(s.named) < 5) fail('desktop: holding every star of every constellation named only ' + s.named + ' of 5');
  else ok('desktop: all five constellations named (' + s.names + ')');

  let aurora = 0;
  for (let i = 0; i < 30 && aurora < 45; i += 1) {
    await page.waitForTimeout(1000);
    s = await read(page);
    aurora = Number(s.aurora);
  }
  if (aurora < 45) fail('desktop: the aurora never rose after naming everything (aurora=' + aurora + ')');
  else ok('desktop: aurora rose ' + aurora + '/100 after the naming and the stillness');

  let meteors = 0;
  for (let i = 0; i < 70 && meteors < 1; i += 1) {
    await page.waitForTimeout(450);
    s = await read(page);
    meteors = Number(s.meteorsSeen);
  }
  if (meteors < 1) fail('desktop: no meteor appeared while sitting still');
  else ok('desktop: a meteor crossed');

  await page.screenshot({ path: path.join(OUT, 'desktop-late.png') });

  // it remembers
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(700);
  s = await read(page);
  if (Number(s.named) < 5) fail('desktop: after a reload only ' + s.named + ' of 5 named constellations came back');
  else ok('desktop: the sky remembered the named constellations after a reload');

  if (log.errs.length) fail('desktop: console errors: ' + log.errs.slice(0, 4).join(' | '));
  else ok('desktop: no console errors');
  if (log.failed.length) fail('desktop: failed requests: ' + log.failed.slice(0, 4).join(' | '));
  else ok('desktop: no failed requests');
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

  const box = await page.evaluate(() => {
    const b = document.getElementById('sound').getBoundingClientRect();
    return { w: b.width, h: b.height };
  });
  if (box.h < 44 || box.w < 44) fail('phone: the sound button is ' + box.w + 'x' + box.h + ', under 44 px');
  else ok('phone: sound button is ' + Math.round(box.w) + 'x' + Math.round(box.h));

  // one thumb: pan, tap a star, hold another
  await page.touchscreen.tap(195, 120);
  await page.waitForTimeout(80);
  await page.touchscreen.tap(195, 420);
  await page.waitForTimeout(80);
  const p = await starPos(page, 3);
  await page.evaluate(q => globalThis.Nightwatch.hold(q.x, q.y), p);
  await page.waitForTimeout(900);
  const s = await read(page);
  if (Number(s.gestures) < 2) fail('phone: real touches were not counted as gestures (' + s.gestures + ')');
  if (Number(s.marks) < 1) fail('phone: a held press did not mark a star');
  else ok('phone: hold on a touch screen marks a star');

  await page.touchscreen.tap(180, 96);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, 'phone-after.png') });

  if (log.errs.length) fail('phone: console errors: ' + log.errs.slice(0, 4).join(' | '));
  else ok('phone: no console errors');
  await context.close();
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
