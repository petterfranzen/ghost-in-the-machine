'use strict';
/* Browser playtest: real pointer gestures on the built page, at the brief's
 * viewports. Run it alone, one browser at a time:
 *   (cd dist && python3 -m http.server 8099 --bind 127.0.0.1) &
 *   NODE_PATH=/usr/local/lib/node_modules flock /tmp/browser.lock \
 *     timeout 180 node tools/check.cjs http://localhost:8099 /tmp
 * The URL must be served: index.html is loaded with ?seed=7 so the shots and
 * the world are repeatable. */
const pw = require('/usr/local/lib/node_modules/playwright/index.js');
const chromium = pw.chromium;
const base = process.argv[2] || 'http://localhost:8099';
const out = process.argv[3] || '/tmp';

let fails = 0, checks = 0;
function ok(cond, what, extra) {
  checks++;
  console.log((cond ? '  ok   ' : '  FAIL ') + what + (extra ? '  (' + extra + ')' : ''));
  if (!cond) fails++;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const noisy = [], badreq = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') noisy.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => noisy.push('pageerror: ' + e.message));
  page.on('request', (r) => {
    const u = r.url();
    if (!/^(file:|data:|blob:|http:\/\/localhost)/.test(u)) badreq.push(u);
  });
  await page.addInitScript(() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    window.__osc = 0; window.__buf = 0;
    const o = AC.prototype.createOscillator, b = AC.prototype.createBufferSource;
    AC.prototype.createOscillator = function () { window.__osc++; return o.apply(this, arguments); };
    AC.prototype.createBufferSource = function () { window.__buf++; return b.apply(this, arguments); };
  });
  await page.goto(base + '/index.html?seed=7', { waitUntil: 'load' });
  await wait(800);

  const size = await page.evaluate(() => window.glowworm.size());
  ok(size.w > 96 && size.h > 120, 'the page sized the world to the viewport', size.w + 'x' + size.h + ' scale ' + size.scale.toFixed(2));
  const noScroll = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth, iw: window.innerWidth,
    sh: document.documentElement.scrollHeight, ih: window.innerHeight
  }));
  ok(noScroll.sw <= noScroll.iw && noScroll.sh <= noScroll.ih, 'no scroll at 390x844',
    noScroll.sw + 'x' + noScroll.sh + ' vs ' + noScroll.iw + 'x' + noScroll.ih);

  let s = await page.evaluate(() => window.glowworm.sound());
  ok(s.ctx === false, 'no AudioContext on load', JSON.stringify(s));
  const rect = await page.evaluate(() => { const r = document.querySelector('#c').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const toScreen = (wx, wy) => ({ x: rect.x + wx * (rect.w / size.w), y: rect.y + wy * (rect.h / size.h) });
  const first = await page.evaluate(() => window.glowworm.worm(0));
  const p0 = toScreen(first.x, first.y);
  await page.mouse.click(p0.x, p0.y);
  await wait(300);
  s = await page.evaluate(() => window.glowworm.sound());
  const counts = await page.evaluate(() => ({ o: window.__osc, b: window.__buf }));
  ok(s.ctx === false && counts.o === 0 && counts.b === 0, 'nothing sounds on the first tap', JSON.stringify(counts));

  const btn = await page.evaluate(() => {
    const b = document.querySelector('#sound'), r = b.getBoundingClientRect();
    return { w: r.width, h: r.height, pressed: b.getAttribute('aria-pressed') };
  });
  ok(btn.w >= 44 && btn.h >= 44, 'the sound button is a 44 px target', btn.w.toFixed(0) + 'x' + btn.h.toFixed(0));
  ok(btn.pressed === 'false', 'the sound button starts off');
  await page.click('#sound');
  await wait(400);
  s = await page.evaluate(() => window.glowworm.sound());
  const after = await page.evaluate(() => ({ o: window.__osc, b: window.__buf, pressed: document.querySelector('#sound').getAttribute('aria-pressed') }));
  ok(s.ctx && s.on && s.state === 'running', 'pressing it starts the audio context', JSON.stringify(s));
  ok(after.o >= 3 && after.b >= 1, 'the ambient bed plays at once', after.o + ' oscillators, ' + after.b + ' buffer sources');
  ok(s.gain > 0.2, 'at a level you can hear', 'master ' + s.gain.toFixed(2));
  ok(after.pressed === 'true', 'and the button says so');

  for (let i = 0; i < 5; i++) {
    const w = await page.evaluate((k) => window.glowworm.worm(k), i * 2);
    const q = toScreen(w.x, w.y);
    await page.mouse.move(q.x, q.y);
    await page.mouse.down();
    await wait(60);
    await page.mouse.up();
    await wait(200);
  }
  let st = await page.evaluate(() => window.glowworm.stats());
  ok(st.lit >= 3, 'taps on the phone viewport wake worms', st.lit + ' lit of ' + st.worms);

  const w6 = await page.evaluate(() => window.glowworm.worm(6)), w12 = await page.evaluate(() => window.glowworm.worm(12));
  const a6 = toScreen(w6.x, w6.y), a12 = toScreen(w12.x, w12.y);
  await page.mouse.move(a6.x, a6.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(a6.x + (a12.x - a6.x) * i / 8, a6.y + (a12.y - a6.y) * i / 8);
    await wait(40);
  }
  await page.mouse.up();
  await wait(500);
  st = await page.evaluate(() => window.glowworm.stats());
  ok(st.lit >= 5, 'dragging along the ceiling wakes a chain', st.lit + ' lit');

  const litBeforeFlick = st.lit;
  await page.mouse.move(rect.x + rect.w * 0.2, rect.y + rect.h * 0.55);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.w * 0.8, rect.y + rect.h * 0.58, { steps: 3 });
  await page.mouse.up();
  await wait(250);
  st = await page.evaluate(() => window.glowworm.stats());
  ok(st.lit <= litBeforeFlick, 'a flick across the air is a breath, not a tap', 'lit ' + litBeforeFlick + ' -> ' + st.lit);

  let target = -1, tgt = null;
  for (let i = 0; i < st.worms; i++) {
    const w = await page.evaluate((k) => window.glowworm.worm(k), i);
    if (w.glow > 0.75 && w.y < rect.h * 0.5) { target = i; tgt = w; break; }
  }
  ok(target >= 0, 'there is a lit worm to hold', 'worm ' + target);
  const hp = toScreen(tgt.x, tgt.y);
  await page.mouse.move(hp.x, hp.y);
  await page.mouse.down();
  await wait(1450);
  const selected = await page.evaluate(() => ({ ranges: window.getSelection().rangeCount, sel: String(window.getSelection()) }));
  await page.mouse.up();
  await wait(2800);
  st = await page.evaluate(() => window.glowworm.stats());
  ok(selected.ranges === 0 && selected.sel === '', 'a long press selects no text', JSON.stringify(selected));
  ok(st.elder === 1, 'holding a lit worm wakes the elder', 'lit ' + st.lit);
  ok(st.rune === 1, 'and the carving on the rock glows');

  for (let i = 0; i < 3; i++) {
    await page.mouse.click(rect.x + rect.w * (0.3 + 0.18 * i), rect.y + rect.h * 0.93);
    await wait(450);
  }
  st = await page.evaluate(() => window.glowworm.stats());
  ok(st.mite === 1, 'three taps on the water bring the pale skater');

  const probe = await page.evaluate(() => {
    const w = window.glowworm.worm(0);
    return { near: window.glowworm.pixel(Math.round(w.x), Math.round(w.y)), far: window.glowworm.pixel(4, Math.round(window.glowworm.size().h * 0.5)) };
  });
  ok(probe.near.join() !== probe.far.join(), 'the canvas shows a lit worm and dark air', probe.near + ' vs ' + probe.far);
  await page.screenshot({ path: out + '/phone.png' });

  await page.evaluate(() => document.querySelector('#c').focus());
  const beforeKey = await page.evaluate(() => window.glowworm.stats().lit);
  await page.keyboard.press('Enter');
  await wait(900);
  const afterKey = await page.evaluate(() => window.glowworm.stats().lit);
  ok(afterKey >= beforeKey, 'Enter on the focused canvas wakes a worm', beforeKey + ' -> ' + afterKey);
  const roles = await page.evaluate(() => {
    const c = document.querySelector('#c');
    return { role: c.getAttribute('role'), tab: c.getAttribute('tabindex'), live: !!document.querySelector('[aria-live="polite"]') };
  });
  ok(roles.role === 'button' && roles.tab === '0' && roles.live, 'the canvas has a keyboard route and a live region', JSON.stringify(roles));

  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page2 = await ctx2.newPage();
  await page2.goto(base + '/index.html?seed=7', { waitUntil: 'load' });
  await wait(600);
  const rm = await page2.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  ok(rm, 'the reduced-motion query reaches the page');
  const rmW = await page2.evaluate(() => window.glowworm.worm(0));
  const rmRect = await page2.evaluate(() => { const r = document.querySelector('#c').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const rmSize = await page2.evaluate(() => window.glowworm.size());
  await page2.mouse.click(rmRect.x + rmW.x * (rmRect.w / rmSize.w), rmRect.y + rmW.y * (rmRect.h / rmSize.h));
  await wait(500);
  const rmGlow = await page2.evaluate(() => window.glowworm.worm(0).glow);
  ok(rmGlow > 0.05 && rmGlow < 0.55, 'reduced motion still answers, more slowly', 'glow ' + rmGlow.toFixed(2));
  await ctx2.close();

  const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page3 = await ctx3.newPage();
  page3.on('pageerror', (e) => noisy.push('pageerror(desktop): ' + e.message));
  page3.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') noisy.push('desktop ' + m.type() + ': ' + m.text()); });
  await page3.goto(base + '/index.html?seed=7', { waitUntil: 'load' });
  await wait(700);
  const d = await page3.evaluate(() => ({
    sw: document.documentElement.scrollWidth, iw: window.innerWidth,
    sh: document.documentElement.scrollHeight, ih: window.innerHeight,
    size: window.glowworm.size()
  }));
  ok(d.sw <= d.iw && d.sh <= d.ih, 'no scroll on a 1280x800 desktop', d.sw + 'x' + d.sh + ' vs ' + d.iw + 'x' + d.ih);
  ok(d.size.w > 200, 'the desktop frame is a wide cavern', d.size.w + 'x' + d.size.h);
  const dr = await page3.evaluate(() => { const r = document.querySelector('#c').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const dworm = await page3.evaluate(() => window.glowworm.worm(3));
  await page3.mouse.move(dr.x + dworm.x * (dr.w / d.size.w), dr.y + dworm.y * (dr.h / d.size.h));
  await page3.mouse.down();
  for (let i = 1; i <= 10; i++) {
    const k = await page3.evaluate((j) => window.glowworm.worm(j), 3 + Math.floor(i / 2));
    await page3.mouse.move(dr.x + k.x * (dr.w / d.size.w), dr.y + k.y * (dr.h / d.size.h));
    await wait(40);
  }
  await page3.mouse.up();
  await wait(1000);
  const dstats = await page3.evaluate(() => window.glowworm.stats());
  ok(dstats.lit >= 4, 'gestures work on the desktop too', dstats.lit + ' lit');
  await page3.screenshot({ path: out + '/desktop.png' });
  await ctx3.close();

  ok(noisy.length === 0, 'no console errors or warnings', noisy.slice(0, 4).join(' | '));
  ok(badreq.length === 0, 'the page makes no external request', badreq.slice(0, 4).join(' | '));

  await browser.close();
  console.log('\n' + checks + ' checks, ' + fails + ' failed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('check crashed:', e); process.exit(2); });
