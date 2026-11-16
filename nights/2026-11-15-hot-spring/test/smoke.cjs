// Smoke check for the committed dist/: serves it, then asserts there is no
// console noise, no page scroll, a working sound toggle, and that gestures
// actually change the picture.
//
//   node test/smoke.cjs            (needs playwright and its chromium)
//
// Nothing in build.sh depends on this; it is the check I ran by hand.
const http = require('http'), fs = require('fs'), path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { console.error('this check needs playwright: npm i -D playwright && npx playwright install chromium'); process.exit(2); }

const dist = process.argv[2] || 'dist';
const types = { '.html': 'text/html', '.js': 'application/javascript' };
const server = http.createServer((req, res) => {
  let f = req.url.split('?')[0];
  if (f === '/') f = '/index.html';
  fs.readFile(path.join(dist, f), (e, d) => {
    if (e) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
    res.end(d);
  });
});

const problems = [];
let failed = 0;
const check = (ok, what) => {
  console.log((ok ? 'ok   ' : 'FAIL ') + what);
  if (!ok) { failed++; problems.push(what); }
};

(async () => {
  await new Promise((r) => server.listen(8210, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errs.push('request failed: ' + r.url()));

  await page.goto('http://127.0.0.1:8210/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  const box = await page.evaluate(() => {
    const b = document.querySelector('#sound').getBoundingClientRect();
    const c = document.querySelector('#spring').getBoundingClientRect();
    return {
      btn: [Math.round(b.width), Math.round(b.height)],
      canvas: [Math.round(c.width), Math.round(c.height)],
      scrolls: document.documentElement.scrollHeight > document.documentElement.clientHeight ||
               document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  check(errs.length === 0, 'no console errors or failed requests on load');
  check(!box.scrolls, 'the page does not scroll');
  check(box.canvas[0] >= 390 && box.canvas[1] >= 844, 'the canvas fills the phone viewport');
  check(box.btn[0] >= 44 && box.btn[1] >= 44, 'the sound button is at least 44px (' + box.btn.join('x') + ')');

  const shot = async () => (await page.screenshot()).toString('base64').slice(0, 4000);
  const before = await shot();
  await page.mouse.click(195, 640);
  await page.waitForTimeout(400);
  check(before !== (await shot()), 'a tap on the water changes the picture');

  await page.mouse.move(195, 620);
  await page.mouse.down();
  await page.waitForTimeout(800);
  await page.mouse.up();
  await page.waitForTimeout(400);
  check(before !== (await shot()), 'a long press changes the picture');

  // a real swipe up or down the sky must move the snow (drag down, moves, up)
  const snow = () => page.evaluate(() =>
    (typeof window.steamSpringSnow === 'function' ? window.steamSpringSnow() : null));
  const s0 = await snow();
  await page.mouse.move(195, 150);
  await page.mouse.down();
  await page.mouse.move(195, 330, { steps: 6 });
  await page.mouse.move(195, 520, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  const s1 = await snow();
  check(s0 !== null && s1 !== null && s1 > s0 + 0.02,
    'a swipe down the sky thickens the snow (' + s0 + ' -> ' + s1 + ')');

  for (let i = 0; i < 2; i++) {
    await page.mouse.move(195, 520);
    await page.mouse.down();
    await page.mouse.move(195, 320, { steps: 6 });
    await page.mouse.move(195, 150, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(500);
  }
  const s2 = await snow();
  check(s2 !== null && s2 < s1 - 0.02,
    'a swipe up the sky thins the snow (' + s1 + ' -> ' + s2 + ')');
  check(errs.length === 0, 'no console errors while sweeping the sky');

  await page.click('#sound');
  await page.waitForTimeout(600);
  const sound = await page.evaluate(() => ({
    label: document.querySelector('#sound').textContent,
    on: document.querySelector('#sound').classList.contains('on'),
    stored: localStorage.getItem('steam-spring-sound'),
  }));
  check(sound.on && sound.stored === 'on' && /on/i.test(sound.label), 'sound turns on and is remembered (' + sound.label + ')');
  check(errs.length === 0, 'no console errors during a short play');

  // a user who asked for less motion: the page must still load clean
  const rmCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const rmPage = await rmCtx.newPage();
  const rmErrs = [];
  rmPage.on('console', (m) => { if (m.type() === 'error') rmErrs.push(m.text()); });
  rmPage.on('pageerror', (e) => rmErrs.push(e.message));
  await rmPage.goto('http://127.0.0.1:8210/index.html', { waitUntil: 'load' });
  await rmPage.waitForTimeout(900);
  const rmMoving = await rmPage.evaluate(() => (
    typeof window.steamSpringSnow === 'function' ? window.steamSpringSnow() : null));
  check(rmErrs.length === 0 && rmMoving !== null, 'prefers-reduced-motion still loads and runs');
  await rmCtx.close();

  // and a desktop viewport
  const dCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const dPage = await dCtx.newPage();
  const dErrs = [];
  dPage.on('console', (m) => { if (m.type() === 'error') dErrs.push(m.text()); });
  dPage.on('pageerror', (e) => dErrs.push(e.message));
  await dPage.goto('http://127.0.0.1:8210/index.html', { waitUntil: 'load' });
  await dPage.waitForTimeout(900);
  check(dErrs.length === 0, 'a 1280x800 desktop loads without console errors');
  await dCtx.close();

  await browser.close();
  server.close();
  console.log(problems.length ? '\n' + failed + ' problem(s): ' + problems.join('; ') : '\nall good');
  process.exit(failed ? 1 : 0);
})();
