// Playtest harness: drives the committed site in Chromium on a phone viewport
// and a desktop one. It asserts rather than only observes — the picture must not
// move when the caption changes, the water must steer the boat, and the tally
// must rise from real pointer input. It saves screenshots, prints everything it
// saw, and exits non-zero if any check fails.
const { chromium } = require('playwright');
const fs = require('fs');

const URL = process.argv[2] || 'file:///dev/null';
const OUT = process.argv[3] || '/tmp/ptcheck';
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DESKTOP = { viewport: { width: 1280, height: 800 } };

const checks = [];
const check = (name, ok, detail) => {
  checks.push({ name, ok: !!ok, detail: detail === undefined ? null : detail });
  return !!ok;
};

/** The gestures, as data: a name, where it starts, and the moves it makes. */
const GESTURES = [
  { name: 'tap-water', at: [90, 120], ms: 0, moves: [] },
  { name: 'hold-water', at: [90, 120], ms: 900, moves: [] },
  { name: 'drag-water', at: [60, 150], ms: 0, moves: [[100, 152], [140, 154]] },
  { name: 'flick', at: [90, 250], ms: 0, moves: [[90, 200]] }
];

const state = p => p.evaluate(() => window.paperTide.read());
const at = (b, wx, wy) => ({ x: b.x + wx * b.w / 180, y: b.y + wy * b.h / 320 });
const gathered = s => Math.max(s.caught || 0, s.best || 0);
const shape = f => JSON.stringify([f.box, f.bar, f.head]);
const sameFrame = (a, b) => shape(a) === shape(b);

async function boot(browser, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errs = [];
  const bad = [];
  const hosts = new Set();
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('requestfailed', r => bad.push('failed: ' + r.url().slice(0, 90)));
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ': ' + r.url().slice(0, 90)); });
  page.on('request', r => {
    const u = r.url();
    if (!u.startsWith('file:') && !u.startsWith('data:')) hosts.add(u.slice(0, 70));
  });
  await page.goto(URL);
  await page.waitForTimeout(1600);
  return { ctx, page, errs, bad, hosts };
}

async function press(p, pt, ms, moves) {
  await p.mouse.move(pt.x, pt.y);
  await p.mouse.down();
  for (const m of moves || []) {
    await p.mouse.move(m.x, m.y);
    await p.waitForTimeout(30);
  }
  if (ms) await p.waitForTimeout(ms);
  await p.mouse.up();
}

async function canvasPng(p, file) {
  const data = await p.evaluate(() => {
    const c = document.getElementById('app');
    const o = document.createElement('canvas');
    o.width = c.width * 3; o.height = c.height * 3;
    const g = o.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(c, 0, 0, o.width, o.height);
    return o.toDataURL('image/png');
  });
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
}

/** Everything that must not move, plus how long the caption is right now. */
const frame = p => p.evaluate(() => {
  const r = v => Math.round(v * 10) / 10;
  const c = document.getElementById('app').getBoundingClientRect();
  const s = document.getElementById('status');
  return {
    box: [r(c.x), r(c.y), r(c.width), r(c.height)],
    bar: Math.round(document.getElementById('statusbar').getBoundingClientRect().height),
    head: Math.round(document.querySelector('header').getBoundingClientRect().height),
    captionLines: Math.round(s.getBoundingClientRect().height),
    captionLength: s.textContent.trim().length,
    over: [document.documentElement.scrollWidth - window.innerWidth,
           document.documentElement.scrollHeight - window.innerHeight]
  };
});

const box = p => p.evaluate(() => {
  const r = document.getElementById('app').getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});

const layout = p => p.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
  scrollH: document.documentElement.scrollHeight, innerH: window.innerHeight,
  pressed: document.getElementById('sound').getAttribute('aria-pressed'),
  label: document.getElementById('sound').textContent,
  btn: Math.round(document.getElementById('sound').getBoundingClientRect().height),
  btnTop: Math.round(document.getElementById('sound').getBoundingClientRect().top),
  touch: [getComputedStyle(document.body).touchAction, getComputedStyle(document.getElementById('app')).touchAction],
  canvasCss: Math.round(document.getElementById('app').getBoundingClientRect().width)
}));

/** Every gesture in turn, reading the state and the geometry back after each. */
async function runGestures(p, b) {
  const gest = [];
  const frames = [];
  for (const g of GESTURES) {
    const moves = g.moves.map(([x, y]) => at(b, x, y));
    await press(p, at(b, g.at[0], g.at[1]), g.ms, moves);
    await p.waitForTimeout(300);
    gest.push(Object.assign({ name: g.name }, await state(p)));
    frames.push(Object.assign({ name: g.name }, await frame(p)));
  }
  return { gest, frames };
}

/** Two taps beside the boat push the water, and the boat, the other way. */
async function tapSteer(p, b, dir) {
  let from = null;
  let to = null;
  let made = 0;
  for (let i = 0; i < 12 && made < 2; i++) {
    const s = await state(p);
    const tx = s.boatX - dir * 34;
    if (s.boatState !== 0 || tx < 12 || tx > 168) {
      await p.waitForTimeout(700);
      continue;
    }
    from = from === null ? s.boatX : from;
    await press(p, at(b, tx, s.boatY), 0, []);
    await p.waitForTimeout(700);
    const t = await state(p);
    if (t.boatState !== 0) {
      made = 0;
      from = null;
      continue;
    }
    to = t.boatX;
    made++;
  }
  return made === 2 ? { from, to, dx: Math.round((to - from) * 100) / 100 } : null;
}

/** Wait for the boat to reach the grate, so the run is banked and stored. */
async function runEnds(p, ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    const s = await state(p);
    if (s.last >= 0) return s;
    await p.waitForTimeout(600);
  }
  return await state(p);
}

/** Steer for the nearest lantern ahead, with taps, until the tally rises. */
async function gather(p, b, goal) {
  let taps = 0;
  for (let i = 0; i < 18; i++) {
    const s = await state(p);
    if (gathered(s) > goal) break;
    if (s.boatState !== 0 || s.aimX < 0) {
      await p.waitForTimeout(700);
      continue;
    }
    if (Math.abs(s.aimX - s.boatX) > 4) {
      const tx = Math.min(168, Math.max(12, s.boatX - Math.sign(s.aimX - s.boatX) * 32));
      await press(p, at(b, tx, s.boatY), 0, []);
      taps++;
    }
    await p.waitForTimeout(650);
  }
  return { taps, before: goal, after: gathered(await state(p)) };
}

/** The phone pass: gestures, sound, steering, the tally, and a long idle. */
async function phonePass(browser, out) {
  const m = await boot(browser, PHONE);
  const b = await box(m.page);
  out.phone = { start: await state(m.page), layout: await layout(m.page) };
  await m.page.screenshot({ path: OUT + '/phone.png' });
  await canvasPng(m.page, OUT + '/phone-canvas.png');

  const opened = await frame(m.page);
  const run = await runGestures(m.page, b);
  await m.page.click('#sound');
  await m.page.waitForTimeout(600);
  const on = await state(m.page);
  const onFrame = await frame(m.page);
  await press(m.page, at(b, 70, 200), 0, []);
  await m.page.waitForTimeout(250);
  const afterTap = await state(m.page);
  await m.page.click('#sound');
  await m.page.waitForTimeout(400);
  const offFrame = await frame(m.page);
  await m.page.waitForTimeout(1400);
  const idleFrame = await frame(m.page);

  const frames = [opened].concat(run.frames, [onFrame, offFrame, idleFrame]);
  const captions = [...new Set(frames.map(f => f.captionLength))];
  out.phone.gestures = run.gest;
  out.phone.frames = frames;
  out.phone.soundVoices = { before: on.played, after: afterTap.played };
  out.phone.storage = await m.page.evaluate(() => localStorage.getItem('papertide.sound'));
  out.phone.best = await m.page.evaluate(() => localStorage.getItem('papertide.best'));

  check('phone: the page never scrolls',
    out.phone.layout.scrollW <= out.phone.layout.innerW && out.phone.layout.scrollH <= out.phone.layout.innerH,
    out.phone.layout);
  check('phone: the picture does not move when the caption changes',
    frames.every(f => sameFrame(f, opened)) && captions.length >= 3,
    { captions, bar: opened.bar, moved: frames.filter(f => !sameFrame(f, opened)).map(f => f.name) });
  check('phone: the footer holds two lines and no more',
    frames.every(f => f.bar === opened.bar && f.captionLines <= 44),
    { bar: opened.bar, lines: [...new Set(frames.map(f => f.captionLines))] });
  check('phone: sound plays on a real tap',
    afterTap.played > on.played && out.phone.layout.pressed === 'false', out.phone.storage);
  check('phone: the sound button is at least 44 pixels tall', out.phone.layout.btn >= 44, out.phone.layout.btn);
  check('phone: the sound button sits in the thumb zone, at the bottom',
    out.phone.layout.btnTop > out.phone.layout.innerH * 0.75, out.phone.layout.btnTop);
  check('phone: a double tap cannot zoom the page',
    out.phone.layout.touch[0] === 'manipulation' && out.phone.layout.touch[1] === 'none', out.phone.layout.touch);
  check('phone: a lantern is on the water to steer for', out.phone.start.lanterns > 0, out.phone.start.lanterns);
  const right = await tapSteer(m.page, b, 1);
  const left = await tapSteer(m.page, b, -1);
  out.phone.steering = { right, left };
  check('phone: a tap beside the boat steers it the other way',
    right && right.dx > 6 && left && left.dx < -6, out.phone.steering);

  const before = gathered(await state(m.page));
  const scored = await gather(m.page, b, before);
  out.phone.score = scored;
  out.phone.bestAfter = await m.page.evaluate(() => localStorage.getItem('papertide.best'));
  check('phone: steering gathers lanterns, so the tally rises from pointer input',
    scored.after > before && scored.taps > 0, scored);
  const shown = await m.page.evaluate(() => document.getElementById('tally').textContent);
  const now = await state(m.page);
  check('phone: the tally above the water reads the score',
    shown.startsWith(now.caught >= 5 ? 'String lit, ' + now.caught : now.caught + ' of 5 lanterns')
    && shown.endsWith('best ' + Math.max(now.best, now.caught)),
    { shown, caught: now.caught, best: now.best });
  check('phone: the boat carries what it gathered',
    (await state(m.page)).towed > 0 || scored.after === 0, await state(m.page));
  await canvasPng(m.page, OUT + '/towed-canvas.png');

  await m.page.bringToFront();
  out.phone.ended = await runEnds(m.page, 40000);
  out.phone.storedBest = await m.page.evaluate(() => localStorage.getItem('papertide.best'));
  out.phone.idle20 = await state(m.page);
  await canvasPng(m.page, OUT + '/idle-canvas.png');
  check('phone: the run ends at the grate and the record reaches localStorage',
    out.phone.ended.last >= 0 && out.phone.ended.best > 0
    && Number(out.phone.storedBest) === out.phone.ended.best,
    { last: out.phone.ended.last, best: out.phone.ended.best, stored: out.phone.storedBest });
  check('phone: no console errors, no failed requests',
    m.errs.length === 0 && m.bad.length === 0, { errs: m.errs, bad: m.bad });

  await m.page.reload();
  await m.page.waitForTimeout(1800);
  const back = await state(m.page);
  out.phone.reloaded = back;
  check('phone: the record is still there after a reload',
    back.best === out.phone.ended.best && m.errs.length === 0, { best: back.best });
  out.phone.errs = m.errs;
  out.phone.bad = m.bad;
  out.phone.hosts = [...m.hosts];
  return m;
}

/** The desktop pass: the same water, a wider window, and no scrolling. */
async function desktopPass(browser, out) {
  const d = await boot(browser, DESKTOP);
  const b = await box(d.page);
  const opened = await frame(d.page);
  await d.page.screenshot({ path: OUT + '/desktop.png' });
  await canvasPng(d.page, OUT + '/desktop-canvas.png');
  await press(d.page, at(b, 90, 200), 0, []);
  await d.page.waitForTimeout(300);
  const after = await frame(d.page);
  await d.page.click('#sound');
  await d.page.waitForTimeout(500);
  const off = await frame(d.page);
  out.desktop = {
    start: await state(d.page), layout: await layout(d.page),
    frames: [opened, after, off], errs: d.errs, bad: d.bad, hosts: [...d.hosts]
  };
  check('desktop: the page never scrolls',
    out.desktop.layout.scrollW <= out.desktop.layout.innerW
    && out.desktop.layout.scrollH <= out.desktop.layout.innerH, out.desktop.layout);
  check('desktop: the picture does not move when the caption changes',
    [after, off].every(f => sameFrame(f, opened)), { opened, after, off });
  check('desktop: no console errors, no failed requests',
    d.errs.length === 0 && d.bad.length === 0, { errs: d.errs, bad: d.bad });
}

/** The reduced-motion pass: still loads, still quiet, still no errors. */
async function reducedPass(browser, out) {
  const r = await boot(browser, { viewport: PHONE.viewport, reducedMotion: 'reduce' });
  await r.page.waitForTimeout(1200);
  const held = await frame(r.page);
  await r.page.waitForTimeout(900);
  out.reduced = { start: await state(r.page), frames: [held, await frame(r.page)], errs: r.errs };
  await canvasPng(r.page, OUT + '/reduced-canvas.png');
  check('reduced motion: the picture stays put and nothing errors',
    r.errs.length === 0 && sameFrame(held, out.reduced.frames[1]), out.reduced.errs);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const out = { checks: [] };
  try {
    await phonePass(browser, out);
    await desktopPass(browser, out);
    await reducedPass(browser, out);
  } finally {
    await browser.close();
  }
  out.checks = checks;
  out.passed = checks.every(c => c.ok);
  console.log(JSON.stringify(out, null, 1));
  console.log(checks.map(c => (c.ok ? 'ok   ' : 'FAIL ') + c.name).join('\n'));
  if (!out.passed) process.exitCode = 1;
})();
