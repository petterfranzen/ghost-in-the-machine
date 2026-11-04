/* Smoke check: wakes the whole pond on a phone viewport with real touch taps.
 * Fails on console errors, failed requests, sideways scrolling, or if the
 * pond cannot be woken. Run:
 *   flock /tmp/browser.lock timeout 120 node check.js */
const { chromium } = require('playwright');

(async () => {
  const errors = [];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, hasTouch: true, isMobile: true,
  });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => errors.push('request failed: ' + r.url()));

  await page.goto('file://' + __dirname + '/dist/index.html');
  await page.waitForFunction(() => window.NightPond && window.NightPond.read().lanterns);

  const read = () => page.evaluate(() => window.NightPond.read());

  /* a first tap on open water, to make sure ripples appear without a lantern */
  const box = await page.locator('#stage').boundingBox();
  const toScreen = (x, y) => ({
    x: box.x + (x / 320) * box.width,
    y: box.y + (y / 320) * box.height,
  });
  let p = toScreen(160, 162);
  await page.touchscreen.tap(p.x, p.y);
  await page.waitForTimeout(300);

  let snaps = 0;
  for (let attempt = 0; attempt < 40; attempt++) {
    const st = await read();
    if (st.complete) break;
    const target = st.lanterns.find(l => !l.lit);
    if (target) {
      p = toScreen(target.x, target.y);
      await page.touchscreen.tap(p.x, p.y);
      snaps++;
    }
    await page.waitForTimeout(500);
  }

  const end = await read();
  await page.waitForTimeout(900);
  await page.screenshot({ path: __dirname + '/phone-check.png' });

  const scroll = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
    sh: document.documentElement.scrollHeight,
    ih: window.innerHeight,
  }));

  await browser.close();

  const fail = [];
  if (!end.complete) fail.push(`pond not woken (lit ${end.lit} of ${end.lanterns.length})`);
  if (errors.length) fail.push(...errors);
  if (scroll.sw > scroll.iw + 1) fail.push(`sideways scroll: ${scroll.sw} > ${scroll.iw}`);
  if (scroll.sh > scroll.ih + 1) fail.push(`vertical scroll: ${scroll.sh} > ${scroll.ih}`);
  if (snaps < 2) fail.push(`only ${snaps} lantern taps issued`);

  if (fail.length) { console.error('FAIL\n' + fail.join('\n')); process.exit(1); }
  console.log(`OK  complete=${end.complete} lit=${end.lit} taps=${snaps + 1} ` +
              `scroll=${scroll.sw}x${scroll.sh} in ${scroll.iw}x${scroll.ih} errors=0`);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
