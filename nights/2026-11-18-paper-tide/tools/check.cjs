// Playtest harness: drives the committed site in Chromium, phone and desktop.
const { chromium } = require('playwright');
const fs = require('fs');

const URL = process.argv[2] || 'file:///dev/null';
const OUT = process.argv[3] || '/tmp/ptcheck';

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

const state = p => p.evaluate(() => window.paperTide.read());
const box = p => p.evaluate(() => {
  const r = document.getElementById('app').getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
const at = (b, wx, wy) => ({ x: b.x + wx * b.w / 180, y: b.y + wy * b.h / 320 });
const press = async (p, pt, ms, moves) => {
  await p.mouse.move(pt.x, pt.y);
  await p.mouse.down();
  for (const m of moves || []) { await p.mouse.move(m.x, m.y); await p.waitForTimeout(30); }
  if (ms) await p.waitForTimeout(ms);
  await p.mouse.up();
};
const canvasPng = async (p, file) => {
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
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const out = {};
  try {
    // --- phone, fresh context, exactly what a newcomer gets -----------------
    const m = await boot(browser, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    out.phone = { start: await state(m.page) };
    out.phone.layout = await m.page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
      scrollH: document.documentElement.scrollHeight, innerH: window.innerHeight,
      pressed: document.getElementById('sound').getAttribute('aria-pressed'),
      label: document.getElementById('sound').textContent,
      btn: Math.round(document.getElementById('sound').getBoundingClientRect().height),
      canvasCss: Math.round(document.getElementById('app').getBoundingClientRect().width)
    }));
    const b = await box(m.page);
    await m.page.screenshot({ path: OUT + '/phone.png' });
    await canvasPng(m.page, OUT + '/phone-canvas.png');

    // every gesture, one after another, with the state read back each time
    const gest = [];
    const note = async (name) => gest.push(Object.assign({ name }, await state(m.page)));
    await press(m.page, at(b, 90, 120), 0, []);              // tap the water
    await m.page.waitForTimeout(200); await note('tap-water');
    await press(m.page, at(b, 90, 120), 900, []);            // long press the water
    await m.page.waitForTimeout(200); await note('hold-water');
    await press(m.page, at(b, 60, 150), 0, [at(b, 100, 152), at(b, 140, 154)]);  // sideways drag
    await m.page.waitForTimeout(200); await note('drag');
    await press(m.page, at(b, 90, 250), 0, [at(b, 90, 200)]); // fast flick downwards
    await m.page.waitForTimeout(300); await note('flick');
    out.phone.gestures = gest;

    // the sound button
    await m.page.click('#sound');
    await m.page.waitForTimeout(600);
    out.phone.afterSound = await state(m.page);
    await m.page.click('#sound');
    await m.page.waitForTimeout(300);
    out.phone.afterOff = await state(m.page);
    await m.page.click('#sound');
    await m.page.waitForTimeout(300);
    const before = await state(m.page);
    await press(m.page, at(b, 70, 200), 0, []);
    await m.page.waitForTimeout(250);
    out.phone.soundVoices = { before: before.played, after: (await state(m.page)).played };
    out.phone.storage = await m.page.evaluate(() => localStorage.getItem('papertide.sound'));
    out.phone.errs = m.errs; out.phone.bad = m.bad; out.phone.hosts = [...m.hosts];

    // --- the boat's secret: hold still on it -------------------------------
    const boat = await state(m.page);
    const bp = at(b, boat.boatX ? boat.boatX : 0, 0);
    out.phone.boat = boat;

    // --- desktop -----------------------------------------------------------
    const d = await boot(browser, { viewport: { width: 1440, height: 900 } });
    out.desktop = { start: await state(d.page) };
    out.desktop.layout = await d.page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
      scrollH: document.documentElement.scrollHeight, innerH: window.innerHeight,
      canvasCss: Math.round(document.getElementById('app').getBoundingClientRect().width)
    }));
    await d.page.screenshot({ path: OUT + '/desktop.png' });
    await canvasPng(d.page, OUT + '/desktop-canvas.png');
    out.desktop.errs = d.errs; out.desktop.bad = d.bad; out.desktop.hosts = [...d.hosts];

    // --- reduced motion ----------------------------------------------------
    const r = await boot(browser, { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    out.reduced = { start: await state(r.page) };
    await r.page.waitForTimeout(1500);
    out.reduced.later = await state(r.page);
    out.reduced.errs = r.errs;
    await canvasPng(r.page, OUT + '/reduced-canvas.png');

    // --- long idle: the cat, the lamp, the stars ---------------------------
    await m.page.bringToFront();
    await m.page.waitForTimeout(20000);
    out.phone.idle20 = await state(m.page);
    await canvasPng(m.page, OUT + '/idle-canvas.png');
    out.phone.errs2 = m.errs;
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify(out, null, 1));
})();
