// Self-check for the built page, in a real browser, against the house rules.
// Playwright is not a build dependency, so point NODE_PATH at a global install:
//
//   NODE_PATH=/usr/local/lib/node_modules node tools/browser-check.cjs
//
// It checks: no console errors or warnings, no external requests, a 44 px sound
// control that starts off, no AudioContext until the toggle is pressed, no page
// scroll at phone and desktop sizes, fractional pointer coordinates, the
// keyboard route, a long press that does not select, the lantern, the fox, the
// sound of a tap, and the reduced-motion variant.
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const url = pathToFileURL(path.resolve('dist/index.html')).href;
const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };

function lum(c) {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
}
function ratio(a, b) {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
const parse = s => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ---- the phone, with the audio instrumentation in place ------------------
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('request', r => requests.push(r.url()));

  await page.addInitScript(() => {
    window.__ac = 0; window.__osc = 0; window.__src = 0;
    const Real = window.AudioContext || window.webkitAudioContext;
    if (!Real) return;
    const W = function (...a) {
      window.__ac++;
      const c = new Real(...a);
      const oc = c.createOscillator.bind(c);
      c.createOscillator = () => { window.__osc++; return oc(); };
      const bs = c.createBufferSource.bind(c);
      c.createBufferSource = () => { window.__src++; return bs(); };
      return c;
    };
    W.prototype = Real.prototype;
    window.AudioContext = W; window.webkitAudioContext = W;
  });

  await page.goto(url);
  await page.waitForTimeout(1500);

  ok(errors.length === 0, 'no console errors or warnings' + (errors.length ? ': ' + errors.join(' | ') : ''));
  const ext = requests.filter(u => !u.startsWith('file://') && !u.startsWith('data:'));
  ok(ext.length === 0, 'no external requests' + (ext.length ? ': ' + ext.join(', ') : ''));
  ok(requests.every(u => !u.endsWith('/favicon.ico')), 'no favicon request (the icon is inlined)');

  const btn = page.locator('#sound');
  const bb = await btn.boundingBox();
  ok(bb.width >= 44 && bb.height >= 44, `sound control is ${bb.width.toFixed(1)}x${bb.height.toFixed(1)} CSS px (>= 44)`);
  ok((await btn.getAttribute('aria-pressed')) === 'false', 'sound starts off');
  ok(/off/.test(await btn.innerText()), 'the sound button reads "off"');

  const scroll = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight,
  }));
  ok(scroll.sw <= scroll.cw + 1, `no sideways scroll (${scroll.sw} <= ${scroll.cw})`);
  ok(scroll.sh <= scroll.ch + 1, `the scene fits the screen (${scroll.sh} <= ${scroll.ch})`);
  const btnInView = bb.y + bb.height <= 844 + 1 && bb.y >= 0;
  ok(btnInView, `the sound control sits inside the viewport (y ${bb.y.toFixed(0)}..${(bb.y + bb.height).toFixed(0)})`);

  // the canvas fills the viewport (no letterbox beyond one world pixel)
  const canvasBox = await page.locator('#stage').boundingBox();
  ok(canvasBox.width >= 390 - 6 && canvasBox.height >= 844 - 6,
    `the scene fills the phone (${canvasBox.width.toFixed(0)}x${canvasBox.height.toFixed(0)} of 390x844)`);

  // the caption and the button read against the scrim over the brightest snow
  const colours = await page.evaluate(() => ({
    caption: getComputedStyle(document.querySelector('.caption')).color,
    btnText: getComputedStyle(document.querySelector('#sound')).color,
    btnBg: getComputedStyle(document.querySelector('#sound')).backgroundColor,
    btnBorder: getComputedStyle(document.querySelector('#sound')).borderTopColor,
    scrim: getComputedStyle(document.querySelector('.dock')).backgroundImage,
  }));
  const snow = [224, 240, 228];
  const plate = snow.map((v, i) => Math.round(6 * 0.9 + v * 0.1));   // the scrim at 90 % over the snow
  const capRatio = ratio(parse(colours.caption), plate);
  ok(capRatio >= 4.5, `the caption reads over the brightest snow (${capRatio.toFixed(1)}:1, want >= 4.5)`);
  const btnTextRatio = ratio(parse(colours.btnText), plate);
  ok(btnTextRatio >= 4.5, `the sound label reads (${btnTextRatio.toFixed(1)}:1)`);
  const borderRatio = ratio(parse(colours.btnBorder), plate);
  ok(borderRatio >= 3.0, `the sound button's edge reads (${borderRatio.toFixed(1)}:1, want >= 3)`);

  // sound: nothing until the toggle is pressed
  const counts0 = await page.evaluate(() => [window.__ac, window.__osc, window.__src]);
  ok(counts0[0] === 0 && counts0[1] === 0 && counts0[2] === 0, `no AudioContext on load (${counts0.join(',')})`);

  const before = await page.locator('#stage').screenshot();
  await page.mouse.click(canvasBox.x + 120.4, canvasBox.y + 300.7);  // fractional on purpose
  // the give is a short damped settle: watch it rather than read it once
  let tf = '';
  for (let i = 0; i < 16 && !/translateY/.test(tf); i++) {
    tf = await page.evaluate(() => document.getElementById('stage').style.transform);
    if (!/translateY/.test(tf)) await page.waitForTimeout(20);
  }
  ok(/translateY/.test(tf), `the whole scene gives on a tap (${tf || 'none'})`);
  await page.waitForTimeout(900);
  ok(Buffer.compare(before, await page.locator('#stage').screenshot()) !== 0, 'a tap at fractional coordinates changes the garden');
  const counts1 = await page.evaluate(() => [window.__ac, window.__osc, window.__src]);
  ok(counts1[0] === 0 && counts1[1] === 0 && counts1[2] === 0, `the first tap makes no sound (${counts1.join(',')})`);

  const afterTap = await page.evaluate(() => window.SnowGarden.read());
  ok(Math.abs(afterTap.target - (120.4 / canvasBox.width) * afterTap.w) < 1.5, `the tap lands where it was aimed (target ${afterTap.target.toFixed(1)} of w ${afterTap.w})`);
  // the keyboard route
  await page.waitForTimeout(1200);
  const beforeKey = await page.evaluate(() => window.SnowGarden.read().target);
  await page.locator('#stage').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const afterKey = await page.evaluate(() => window.SnowGarden.read());
  ok(Math.abs(afterKey.target - beforeKey) > 1, `Enter moves the walker (${beforeKey.toFixed(1)} -> ${afterKey.target.toFixed(1)})`);

  // the lantern: a small object in the scene
  const lamp = afterKey.lamp;
  const sx = canvasBox.x + (lamp[0] / afterKey.w) * canvasBox.width;
  const sy = canvasBox.y + (lamp[1] / afterKey.h) * canvasBox.height;
  await page.mouse.click(sx + 0.3, sy + 0.4);
  await page.waitForTimeout(400);
  const lit = await page.evaluate(() => window.SnowGarden.read());
  ok(lit.lantern === 1, 'tapping the lantern post lights it');
  ok(/lantern/i.test(await page.locator('#hint').innerText()), 'the lighting is announced politely');

  // the bench calls the fox
  const benchX = 0.42 * lit.w, benchY = lit.ground;
  const bx = canvasBox.x + (benchX / lit.w) * canvasBox.width;
  const by = canvasBox.y + (benchY / lit.h) * canvasBox.height;
  await page.mouse.click(bx, by);
  await page.waitForTimeout(400);
  const fox = await page.evaluate(() => window.SnowGarden.read());
  ok(fox.fox >= 1, `the bench calls the fox (state ${fox.fox})`);
  ok(/fox/i.test(await page.locator('#hint').innerText()), 'the fox is announced');

  // the sound toggle
  await btn.click();
  await page.waitForTimeout(200);
  ok((await btn.getAttribute('aria-pressed')) === 'true', 'sound turns on when asked');
  ok(/on/.test(await btn.innerText()), 'the sound button reads "on"');
  const counts2 = await page.evaluate(() => [window.__ac, window.__osc, window.__src]);
  ok(counts2[0] === 1, `pressing the toggle creates exactly one AudioContext (${counts2[0]})`);
  await page.mouse.click(canvasBox.x + 60.4, canvasBox.y + 400.5);
  await page.waitForTimeout(900);
  const counts3 = await page.evaluate(() => [window.__ac, window.__osc, window.__src]);
  ok(counts3[1] + counts3[2] > 0, `with sound on, a tap makes a sound (${counts3[1]} oscillators, ${counts3[2]} noise sources)`);
  await btn.click();
  ok((await btn.getAttribute('aria-pressed')) === 'false', 'sound turns off again');

  // a long press pours (a held thumb on a canvas must never select)
  const ta = await page.$eval('#stage', el => getComputedStyle(el).touchAction);
  const us = await page.$eval('#stage', el => getComputedStyle(el).userSelect);
  ok(ta === 'none', `the canvas owns its gesture (touch-action ${ta})`);
  ok(us === 'none', `the canvas is not selectable (user-select ${us})`);
  await page.mouse.move(canvasBox.x + 200, canvasBox.y + 400);
  await page.mouse.down();
  await page.waitForTimeout(900);
  const sel = await page.evaluate(() => window.getSelection().rangeCount);
  await page.mouse.up();
  ok(sel === 0, `a long press selects nothing (ranges ${sel})`);

  // canvas pixels: the frame really paints sky above and snow below
  const px = await page.evaluate(() => {
    const c = document.getElementById('stage');
    const g = c.getContext('2d');
    const at = (fx, fy) => Array.from(g.getImageData(Math.floor(c.width * fx), Math.floor(c.height * fy), 1, 1).data);
    return { sky: at(0.5, 0.04), snow: at(0.5, 0.94), alpha: at(0.5, 0.5)[3] };
  });
  ok(px.sky[3] === 255 && lum(px.sky) < 0.06, `the top of the canvas is dark sky (${px.sky.slice(0, 3)})`);
  ok(lum(px.snow) > 0.5, `the foot of the canvas is bright snow (${px.snow.slice(0, 3)})`);

  // ---- the new gestures, driven for real ------------------------------------
  const preDrag = await page.evaluate(() => window.SnowGarden.read());
  await page.mouse.move(canvasBox.x + 60, canvasBox.y + 560);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 90, canvasBox.y + 580);
  await page.mouse.move(canvasBox.x + 120, canvasBox.y + 600);
  await page.mouse.up();
  await page.waitForTimeout(250);
  const drew = await page.evaluate(() => window.SnowGarden.read());
  ok(drew.trail > preDrag.trail + 5, `a drag draws a trail in the snow (${preDrag.trail} -> ${drew.trail})`);
  ok(Math.abs(drew.target - preDrag.target) < 0.5, 'a drag leaves the walker where he was');

  // a swipe across the sky raises a flurry, which then calms down
  await page.mouse.move(canvasBox.x + 40, canvasBox.y + 70);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 110, canvasBox.y + 60);
  await page.mouse.move(canvasBox.x + 180, canvasBox.y + 66);
  await page.mouse.up();
  await page.waitForTimeout(140);
  const fl = await page.evaluate(() => window.SnowGarden.read());
  ok(fl.flurry > 0.5, `a swipe across the sky raises a flurry (${fl.flurry.toFixed(2)})`);
  ok(/heavier/i.test(await page.locator('#hint').innerText()), 'the flurry is announced politely');
  await page.waitForTimeout(3600);
  ok((await page.evaluate(() => window.SnowGarden.read())).flurry === 0, 'the flurry calms down again');

  // a long press rolls a ball, and letting go leaves a snowman
  const held = await page.evaluate(() => window.SnowGarden.read().snowmen);
  await page.mouse.move(canvasBox.x + 250, canvasBox.y + 620);
  await page.mouse.down();
  await page.waitForTimeout(900);
  const rolling = await page.evaluate(() => window.SnowGarden.read());
  ok(rolling.rolling && rolling.ball > 0.4, `a held press rolls a snowball (${rolling.ball.toFixed(2)})`);
  await page.mouse.up();
  await page.waitForTimeout(250);
  const built = await page.evaluate(() => window.SnowGarden.read());
  ok(built.snowmen === held + 1, `letting go leaves a snowman (${held} -> ${built.snowmen})`);
  ok(/snowman/i.test(await page.locator('#hint').innerText()), 'the snowman is announced');
  const smOld = await page.evaluate(() => window.SnowGarden.snowman(1));
  await page.mouse.click(
    canvasBox.x + (smOld.x / built.w) * canvasBox.width,
    canvasBox.y + ((smOld.y - 4) / built.h) * canvasBox.height);
  await page.waitForTimeout(250);
  ok((await page.evaluate(() => window.SnowGarden.snowman(1))).state === 2, 'tapping a snowman knocks him over');

  // the tree: a puff of snow, and the bird flutters to the other perch
  let bird0 = await page.evaluate(() => window.SnowGarden.read());
  if (bird0.bird === 1) {            // an earlier tap may have caught him mid-flight
    await page.waitForTimeout(2000);
    bird0 = await page.evaluate(() => window.SnowGarden.read());
  }
  const wasOnTree = bird0.bird === 0;
  await page.mouse.click(
    canvasBox.x + 0.17 * canvasBox.width,
    canvasBox.y + ((bird0.birdPos[1] + 4) / bird0.h) * canvasBox.height);
  await page.waitForTimeout(250);
  const shook = await page.evaluate(() => window.SnowGarden.read());
  ok(shook.puffs > 12, `tapping the tree shakes off a puff of snow (${shook.puffs} puffs)`);
  ok(shook.bird === 1, 'and the bird sets off');
  ok(/bird|tree/i.test(await page.locator('#hint').innerText()), 'the bird is announced');
  await page.waitForTimeout(2000);
  const landed = await page.evaluate(() => window.SnowGarden.read());
  ok(landed.bird === (wasOnTree ? 2 : 0), `he settles on the other perch (state ${landed.bird})`);
  ok(Math.abs(landed.birdPos[0] - bird0.birdPos[0]) > landed.w * 0.3,
    `which is across the garden (${bird0.birdPos[0].toFixed(0)} -> ${landed.birdPos[0].toFixed(0)})`);
  ok(errors.length === 0, 'no console errors after the new gestures' + (errors.length ? ': ' + errors.join(' | ') : ''));

  // ---- reduced motion ------------------------------------------------------
  const rm = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page2 = await rm.newPage();
  const errors2 = [];
  page2.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors2.push(m.text()); });
  page2.on('pageerror', e => errors2.push('pageerror: ' + e.message));
  await page2.goto(url);
  await page2.waitForTimeout(1200);
  ok(errors2.length === 0, 'reduced motion: no console errors' + (errors2.length ? ': ' + errors2.join(' | ') : ''));
  const r0 = await page2.evaluate(() => window.SnowGarden.read());
  ok(r0.reduce === 1, 'reduced motion reaches the simulation');
  const c2 = await page2.locator('#stage').boundingBox();
  await page2.mouse.click(c2.x + 90.5, c2.y + 320.5);
  await page2.waitForTimeout(700);
  const tf2 = await page2.evaluate(() => document.getElementById('stage').style.transform);
  ok(tf2 === '', `reduced motion: no whole-scene give (transform "${tf2}")`);
  const r1 = await page2.evaluate(() => window.SnowGarden.read());
  ok(r1.walker !== r0.walker, 'reduced motion: the walker still sets off');
  const trans = await page2.$eval('#hint', el => getComputedStyle(el).transitionDuration);
  ok(trans === '0s', `reduced motion: the hint does not fade (${trans})`);

  // ---- the desktop viewport ------------------------------------------------
  const dsk = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page3 = await dsk.newPage();
  const errors3 = [], req3 = [];
  page3.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors3.push(m.text()); });
  page3.on('pageerror', e => errors3.push('pageerror: ' + e.message));
  page3.on('request', r => req3.push(r.url()));
  await page3.goto(url);
  await page3.waitForTimeout   (1200);
  const sc3 = await page3.evaluate(() => ({
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight,
  }));
  ok(errors3.length === 0, 'desktop: no console errors' + (errors3.length ? ': ' + errors3.join(' | ') : ''));
  ok(sc3.sw <= sc3.cw + 1 && sc3.sh <= sc3.ch + 1, `desktop: no page scroll (${sc3.sw}x${sc3.sh} in ${sc3.cw}x${sc3.ch})`);
  const ext3 = req3.filter(u => !u.startsWith('file://') && !u.startsWith('data:'));
  ok(ext3.length === 0, 'desktop: no external requests');
  const cb3 = await page3.locator('#stage').boundingBox();
  ok(cb3.width >= 1280 - 8 && cb3.height >= 800 - 8, `desktop: the scene fills the window (${cb3.width.toFixed(0)}x${cb3.height.toFixed(0)})`);
  const bb3 = await page3.locator('#sound').boundingBox();
  ok(bb3.y + bb3.height <= 800 + 1, `desktop: the sound control is inside the window (bottom ${(bb3.y + bb3.height).toFixed(0)})`);

  // ---- a small phone in portrait and in landscape ---------------------------
  for (const [w, h] of [[360, 640], [844, 390]]) {
    const c4 = await browser.newContext({ viewport: { width: w, height: h } });
    const p4 = await c4.newPage();
    await p4.goto(url);
    await p4.waitForTimeout(900);
    const sc4 = await p4.evaluate(() => ({
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight,
    }));
    ok(sc4.sw <= sc4.cw + 1 && sc4.sh <= sc4.ch + 1, `${w}x${h}: no page scroll (${sc4.sw}x${sc4.sh})`);
    await c4.close();
  }

  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall good');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
