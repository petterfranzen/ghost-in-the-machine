/* Smoke check: plays the whole quest on a phone viewport with touch taps.
 * Fails on console errors, failed requests, sideways scrolling, or if the
 * clearing cannot be completed. Run:
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
  await page.waitForFunction(() => window.LanternMoss && window.LanternMoss.read());

  const box = await page.locator('#stage').boundingBox();
  const toScreen = (x, y) => ({
    x: box.x + (x / 320) * box.width,
    y: box.y + (y / 240) * box.height,
  });

  const readLight = () => page.evaluate(() => {
    const s = window.LanternMoss.read(), I = window.LanternMoss.constants.I,
      L = window.LanternMoss.constants.L;
    const out = [];
    for (let i = 0; i < 3; i++) {
      const b = I.lights + i * L.stride;
      out.push({ x: s[b + L.x], y: s[b + L.y], state: s[b + L.state] });
    }
    return { lights: out, gathered: s[I.gathered], complete: s[I.complete],
             cx: s[I.cx], cy: s[I.cy] };
  });

  let snaps = 0;
  for (let attempt = 0; attempt < 40; attempt++) {
    const st = await readLight();
    if (st.complete > 0.5) break;
    const target = st.lights.find(l => l.state < 0.5);
    if (target) {
      const p = toScreen(target.x, target.y);
      await page.touchscreen.tap(p.x, p.y);
      snaps++;
    }
    await page.waitForTimeout(400);
  }

  const end = await readLight();
  await page.waitForTimeout(600);
  await page.screenshot({ path: __dirname + '/phone-check.png' });

  const scroll = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
  }));

  await browser.close();

  const fail = [];
  if (end.complete < 0.5) fail.push(`quest not completed (gathered ${end.gathered})`);
  if (errors.length) fail.push(...errors);
  if (scroll.sw > scroll.iw + 1) fail.push(`sideways scroll: ${scroll.sw} > ${scroll.iw}`);
  if (snaps < 3) fail.push(`only ${snaps} taps issued`);

  if (fail.length) { console.error('FAIL\n' + fail.join('\n')); process.exit(1); }
  console.log(`OK  complete=${end.complete} gathered=${end.gathered} taps=${snaps} ` +
              `scroll=${scroll.sw}/${scroll.iw} errors=0`);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
