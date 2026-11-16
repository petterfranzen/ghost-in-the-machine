#!/usr/bin/env node
// tools/audio-check.mjs — a smoke check for the fairy ring's sound.
//
// It serves the committed dist/, opens it on a 390x844 touch phone, checks the
// page is silent at load, taps the sound button (which builds the AudioContext
// on the gesture), then taps a mushroom. It asserts the AudioParams really
// took effect — an assignment to `.frequency`/`.gain`/... is a silent no-op in
// the browser, which is exactly the bug this guards against:
//
//   * the unmute chime plays at 659.25 / 987.77 Hz as the source asks;
//   * the master gain reads 0.6 (the brief's 0.5-0.7);
//   * the limiter reads threshold -14, knee 24, ratio 3.5 (not the defaults);
//   * no oscillator is left at the 440 Hz default — the voices differ.
//
//   node tools/audio-check.mjs
//
// Needs Playwright + Chromium. In the sandbox a clean run is:
//   export PW_CHROMIUM_PATH=$(find /opt/ms-playwright -type f -name 'chrome-headless-shell' | head -1)
//   PLAYWRIGHT=/usr/local/lib/node_modules/playwright/index.mjs \
//     PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright \
//     flock /tmp/browser.lock timeout 180 node tools/audio-check.mjs
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, '..', 'dist');

let chromium;
try {
  ({ chromium } = process.env.PLAYWRIGHT
    ? await import(process.env.PLAYWRIGHT)
    : await import('playwright'));
} catch (e) {
  console.error(`audio-check: cannot load Playwright (${e.message}). Set PLAYWRIGHT=<path>/index.mjs.`);
  process.exit(2);
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const server = createServer((req, res) => {
  const rel = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const file = join(DIST, rel === '/' ? 'index.html' : rel);
  try {
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

// The mushroom geometry, mirroring src/fairy_ring/world.cljs layout/mk-mushroom.
function mushroomPoint(w, h, i) {
  const s = Math.min(w, h) < 560 ? 2 : 3;
  const vw = Math.max(96, Math.round(w / s));
  const vh = Math.max(96, Math.round(h / s));
  const horizon = vh * 0.54, ground = vh - horizon;
  const rx = Math.min(vw * 0.28, vh * 0.20, 74), ry = rx * 0.56;
  const cx = vw * 0.5, cy = horizon + ground * 0.34;
  const scale = Math.min(1.6, Math.max(0.7, rx / 58));
  const ang = Math.PI / 2 - (2 * Math.PI * i) / 7;
  const depth = Math.min(1, Math.max(0, 0.5 + 0.5 * Math.sin(ang)));
  const elder = i === 0;
  const sc = scale * (0.80 + 0.32 * depth);
  const stalkH = sc * (elder ? 16 : 11);
  const x = cx + rx * Math.cos(ang);
  const y = cy + ry * Math.sin(ang) - 0.8 * stalkH;
  return { x: x * (w / vw), y: y * (h / vh) };
}

const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;
const fails = [];
const ok = (cond, msg) => { console.log(`${cond ? '  ok  ' : '  FAIL'} ${msg}`); if (!cond) fails.push(msg); };

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM_PATH || undefined,
});
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
  });
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(String(e)));

  // Instrument the AudioContext before any page script runs.
  await page.addInitScript(() => {
    const Real = window.AudioContext || window.webkitAudioContext;
    window.__acCount = 0; window.__osc = []; window.__gain = []; window.__comp = [];
    function Patched(...args) {
      const ctx = new Real(...args);
      window.__acCount += 1;
      const co = ctx.createOscillator.bind(ctx);
      const cg = ctx.createGain.bind(ctx);
      const cc = ctx.createDynamicsCompressor.bind(ctx);
      ctx.createOscillator = (...a) => { const n = co(...a); window.__osc.push(n); return n; };
      ctx.createGain = (...a) => { const n = cg(...a); window.__gain.push(n); return n; };
      ctx.createDynamicsCompressor = (...a) => { const n = cc(...a); window.__comp.push(n); return n; };
      return ctx;
    }
    window.AudioContext = Patched;
    window.webkitAudioContext = Patched;
  });

  const read = () => page.evaluate(() => ({
    ac: window.__acCount,
    osc: window.__osc.map((o) => Math.round(o.frequency.value * 100) / 100),
    masterGain: window.__gain.length ? Math.round(window.__gain[0].gain.value * 1000) / 1000 : null,
    comp: window.__comp.length ? {
      threshold: window.__comp[0].threshold.value,
      knee: window.__comp[0].knee.value,
      ratio: window.__comp[0].ratio.value,
    } : null,
  }));

  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const atLoad = await read();
  ok(atLoad.ac === 0, `sound off at load (AudioContexts created: ${atLoad.ac})`);
  ok(consoleErrors.length === 0, `no console errors at load${consoleErrors.length ? ': ' + consoleErrors.join(' | ') : ''}`);

  // Unmute — the AudioContext is built on this tap.
  await page.click('#sound');
  await page.waitForTimeout(350);
  const chime = await read();
  ok(chime.ac >= 1, `unmute created an AudioContext (${chime.ac})`);
  ok(chime.osc.some((f) => near(f, 659.25)), `unmute chime has 659.25 Hz (heard: ${chime.osc.join(', ')})`);
  ok(chime.osc.some((f) => near(f, 987.77)), `unmute chime has 987.77 Hz`);
  ok(chime.masterGain === 0.6, `master gain reads 0.6 (read: ${chime.masterGain})`);
  ok(chime.comp && near(chime.comp.threshold, -14, 0.01), `limiter threshold -14 (read: ${chime.comp?.threshold})`);
  ok(chime.comp && near(chime.comp.knee, 24, 0.01), `limiter knee 24 (read: ${chime.comp?.knee})`);
  ok(chime.comp && near(chime.comp.ratio, 3.5, 0.01), `limiter ratio 3.5 (read: ${chime.comp?.ratio})`);
  ok(chime.osc.filter((f) => near(f, 440)).length < chime.osc.length - 1,
     `oscillators are not all at the 440 Hz default (${chime.osc.length} voices)`);

  // Tap a mushroom (i=2, the first non-elder in the ring).
  const p = mushroomPoint(390, 844, 2);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(250);
  const after = await read();
  const fresh = after.osc.slice(chime.osc.length);
  // The shimmer's lower voice glides 392 -> 587 Hz, so at read time it sits
  // somewhere in between; the steady upper voice is at 784 Hz.
  const shimmer = fresh.some((f) => near(f, 784.0, 0.5)) && fresh.some((f) => f > 390 && f < 590);
  ok(fresh.length > 0, `the mushroom tap made sound (${fresh.length} new voices: ${fresh.join(', ')})`);
  ok(shimmer, `the tap landed on a mushroom (shimmer 392->587 + 784 Hz)`);
  ok(after.osc.filter((f) => near(f, 440)).length < after.osc.length - 1,
     `still not all 440 Hz after the tap`);
  ok(consoleErrors.length === 0, `no console errors at the end${consoleErrors.length ? ': ' + consoleErrors.join(' | ') : ''}`);

  // Reduced motion must not silence the page: the scene holds nearly still but
  // every interaction still answers. The live change listener follows the
  // emulated setting, so this also exercises the toggle.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(450);
  const mm = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  ok(mm === true, 'reduced-motion emulation is active');
  const beforeRM = (await read()).osc.length;
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(250);
  const rm = await read();
  ok(rm.osc.length > beforeRM, `a mushroom tap still sounds under reduced motion (${rm.osc.slice(beforeRM).join(', ')})`);
  ok(consoleErrors.length === 0, `no console errors under reduced motion`);
} finally {
  await browser.close().catch(() => {});
  server.close();
}

if (fails.length) {
  console.log(`audio-check: ${fails.length} failed`);
  process.exit(1);
}
console.log('audio-check: ok');
