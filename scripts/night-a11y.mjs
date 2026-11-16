#!/usr/bin/env node
// night-a11y — check one night's built page against the house rules.
//
//   node scripts/night-a11y.mjs nights/2026-11-03-pebble-pond
//
// The house rules live in nights/README.md: calm; no timers, scores or streaks;
// sound off until the user asks for it; one thumb, 44 px targets, no sideways
// scroll; body and hint text at 16 px on a phone; a prefers-reduced-motion
// variant. This checks the ones a machine can check.
//
// What it does:
//   static  — reads dist/index.html and every CSS/JS file dist/ loads. Always runs.
//   browser — drives a real Chromium at 390x844 with touch, if Playwright and a
//             Chromium are available (PLAYWRIGHT_BROWSERS_PATH, the usual
//             Playwright cache, or PW_CHROMIUM_PATH for an explicit binary).
//             With no browser it says so on one line and exits on the static
//             result alone, so CI and a bare clone still get the static half.
//
// Exit status is 0 when nothing failed, 1 when a finding failed, 2 on a usage
// error or a night that has no build to check. One line per finding:
//
//   FAIL  <check>  <what was seen>            (fails the run)
//   WARN  <check>  <what was seen, and why>   (does not fail the run)
//
// It only reads built files. It never writes, and it never rebuilds: a stale
// dist/ is the build's problem, not this script's.

import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FAILS = [];
const WARNS = [];
const NOTES = [];
const fail = (check, msg) => FAILS.push({ check, msg });
const warn = (check, msg) => WARNS.push({ check, msg });
const note = (msg) => NOTES.push(msg);

// ---------------------------------------------------------------- arguments

const arg = process.argv[2];
if (!arg || arg === '-h' || arg === '--help') {
  console.error('usage: night-a11y <nights/DATE-name>   (a night folder, or its bare name)');
  process.exit(arg ? 0 : 2);
}
// Accept "nights/2026-11-03-pebble-pond", the folder name, or its unique tail
// ("pebble-pond" for "2026-11-03-pebble-pond").
function resolveNight(a) {
  const tries = [resolve(REPO, a.replace(/\/+$/, '')), join(REPO, 'nights', a.replace(/\/+$/, ''))];
  for (const t of tries) if (existsSync(join(t, 'dist', 'index.html'))) return t;
  const nightsDir = join(REPO, 'nights');
  if (existsSync(nightsDir)) {
    const hit = readdirSync(nightsDir).filter((d) => d === a || d.endsWith(`-${a}`))
      .map((d) => join(nightsDir, d)).filter((d) => existsSync(join(d, 'dist', 'index.html')));
    if (hit.length === 1) return hit[0];
    if (hit.length > 1) {
      console.error(`night-a11y: "${a}" matches more than one night: ${hit.map((d) => relative(REPO, d)).join(', ')}`);
      process.exit(2);
    }
  }
  return tries[0];
}
const nightDir = resolveNight(arg);
const distDir = join(nightDir, 'dist');
const indexHtml = join(distDir, 'index.html');
const nightName = relative(REPO, nightDir) || arg;

if (!existsSync(indexHtml)) {
  console.error(`night-a11y: ${nightName} has no dist/index.html to check (build it first)`);
  process.exit(2);
}

console.log(`night-a11y: ${nightName}`);

// ------------------------------------------------------------ read the page

const html = readFileSync(indexHtml, 'utf8');

function localFiles() {
  // Everything dist/ serves that the page can pull in: linked CSS, script src,
  // plus, as a fallback, any .css sitting next to index.html.
  const out = { css: [], js: [] };
  const seen = new Set();
  const add = (p) => {
    if (!p || seen.has(p)) return;
    seen.add(p);
    const f = resolve(distDir, p.replace(/^\.?\//, ''));
    if (existsSync(f) && statSync(f).isFile()) out[/\.css$/i.test(f) ? 'css' : 'js'].push(f);
  };
  for (const m of html.matchAll(/<link\b[^>]*\brel\s*=\s*["']?stylesheet["']?[^>]*>/gi)) {
    const href = m[0].match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (href && !/^(https?:)?\/\//.test(href[1])) add(href[1]);
  }
  for (const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    if (!/^(https?:)?\/\//.test(m[1])) add(m[1]);
  }
  for (const f of readdirSync(distDir)) if (/\.css$/i.test(f)) add(f);
  return out;
}
const files = localFiles();
const cssText = [
  ...[...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]),
  ...files.css.map((f) => readFileSync(f, 'utf8')),
].join('\n');
const jsText = [
  ...[...html.matchAll(/<script\b(?![^>]*\bsrc=)(?![^>]*type\s*=\s*["']?(?:application\/(?:ld\+)?json|text\/template))[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1] ?? ''),
  ...files.js.map((f) => readFileSync(f, 'utf8')),
].join('\n;\n');

// Strip comments and string bodies to spaces so brace/scope arithmetic below is
// not fooled by a brace inside a string. Length is preserved, so offsets hold.
function mask(src) {
  const out = src.split('');
  let i = 0;
  let mode = null; // null | 'line' | 'block' | quote char
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (mode === null) {
      if (c === '/' && n === '/') { mode = 'line'; i += 2; continue; }
      if (c === '/' && n === '*') { mode = 'block'; i += 2; continue; }
      if (c === "'" || c === '"' || c === '`') { mode = c; i += 1; continue; }
      i += 1; continue;
    }
    if (mode === 'line') { if (c === '\n') mode = null; else out[i] = ' '; i += 1; continue; }
    if (mode === 'block') {
      if (c === '*' && n === '/') { out[i] = out[i + 1] = ' '; i += 2; mode = null; continue; }
      if (c !== '\n') out[i] = ' ';
      i += 1; continue;
    }
    if (c === '\\') { out[i] = ' '; if (src[i + 1] !== '\n') out[i + 1] = ' '; i += 2; continue; }
    if (c === mode) { mode = null; i += 1; continue; }
    if (c !== '\n') out[i] = ' ';
    i += 1;
  }
  return out.join('');
}
const jsMasked = mask(jsText);

// ------------------------------------------------------------ static checks

// 1. prefers-reduced-motion.
if (/prefers-reduced-motion/i.test(cssText)) {
  note('reduced-motion: a CSS prefers-reduced-motion rule is present');
} else if (/prefers-reduced-motion/i.test(jsText)) {
  warn('reduced-motion', 'no CSS prefers-reduced-motion rule; the page only reads it in JS — add a CSS rule beside the animation');
} else {
  fail('reduced-motion', 'no prefers-reduced-motion rule anywhere in dist/ CSS or JS');
}

// 2. No autoplaying audio, and any audio context/player created behind a gesture.
for (const m of html.matchAll(/<(audio|video)\b[^>]*>/gi)) {
  if (/\bautoplay\b/i.test(m[0])) fail('audio', `autoplaying <${m[1]}> element in index.html`);
}
{
  const creations = [...jsMasked.matchAll(/new\s+(?:window\s*\.\s*)?(?:webkit)?Audio(?:Context)?\s*\(/g)];
  const gesture = /addEventListener\s*\(\s*['"`](?:click|pointerdown|pointerup|mousedown|mouseup|touchstart|touchend|keydown|keyup|keypress|input|change|submit)['"`]/;
  if (creations.length && !gesture.test(jsMasked)) {
    fail('audio', 'AudioContext/Audio is created but the page never listens for a user gesture');
  } else if (creations.length) {
    for (const where of behindGesture(creations.map((c) => c.index))) {
      if (!where.ok) fail('audio', `AudioContext/Audio created in ${where.label}, which no user gesture reaches`);
    }
  }
}

// Frame a piece of JS by walking braces over the masked source: label, body
// range, and the identifiers it calls.
function frames(src) {
  const stack = [];
  const out = [];
  const labelFor = (before) => {
    const tail = before.slice(-160);
    let m;
    if ((m = tail.match(/function\s+([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*$/))) return m[1];
    if ((m = tail.match(/([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\s*)?\([^()]*\)\s*=>\s*$/))) return m[1];
    if ((m = tail.match(/([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?(?:function\s*)?\([^()]*\)\s*=>\s*$/))) return m[1];
    if ((m = tail.match(/([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\s*\([^()]*\)\s*$/))) return m[1];
    if ((m = tail.match(/([A-Za-z_$][\w$]*)\s*\([^()]*\)\s*$/))) return m[1];
    if (/=>\s*$/.test(tail)) return '<arrow>';
    if (/\bfunction\s*\(?[^()]*\)?\s*$/.test(tail)) return '<function>';
    return '<block>';
  };
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') {
      const f = { label: labelFor(src.slice(0, i)), start: i, end: -1, calls: new Set() };
      stack.push(f); out.push(f);
    } else if (src[i] === '}') {
      const f = stack.pop(); if (f) f.end = i;
    }
  }
  for (const f of out) {
    if (f.end < 0) f.end = src.length;
    for (const m of src.slice(f.start, f.end).matchAll(/([A-Za-z_$][\w$]*)\s*\(/g)) f.calls.add(m[1]);
  }
  return out;
}

// Is each position inside a function a gesture listener reaches?
function behindGesture(positions) {
  const fs = frames(jsMasked);
  const gestureFrames = new Set();
  const gestureNames = new Set();
  const re = /(?:addEventListener\s*\(\s*['"`](?:click|pointerdown|pointerup|mousedown|mouseup|touchstart|touchend|keydown|keyup|keypress|input|change|submit)['"`]\s*,|\.on(?:click|pointerdown|pointerup|mousedown|mouseup|touchstart|touchend|keydown|keyup)\s*=\s*)/g;
  for (const m of jsMasked.matchAll(re)) {
    const after = m.index + m[0].length;
    const nameM = jsMasked.slice(after, after + 80).match(/^\s*([A-Za-z_$][\w$]*)\s*[,)]/);
    if (nameM) gestureNames.add(nameM[1]);
    for (const f of fs) if (f.start >= after && f.start - after < 40) gestureFrames.add(f);
  }
  // Gesture names may point at frames declared elsewhere ("click -> wake").
  for (const f of fs) if (gestureNames.has(f.label)) gestureFrames.add(f);
  // Walk the call graph: a gesture handler may call a helper that makes audio.
  const reached = new Set(gestureFrames);
  const queue = [...gestureFrames];
  while (queue.length) {
    const f = queue.pop();
    for (const c of f.calls) {
      for (const g of fs) if (g.label === c && !reached.has(g)) { reached.add(g); queue.push(g); }
    }
  }
  return positions.map((pos) => {
    const chain = fs.filter((f) => f.start < pos && pos <= f.end).sort((a, b) => b.start - a.start);
    if (!chain.length) return { ok: false, label: 'the top level (page load)' };
    const ok = chain.some((f) => reached.has(f));
    return { ok, label: ok ? chain[0].label : `${chain[0].label}, which only the top level runs` };
  });
}

// 3. The sound toggle is not on at load.
{
  // The attribute only counts on an element, never inside a <style> selector
  // or a <script> body: drop those first, then look for it inside a tag.
  const markup = html.replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  const pressed = [...markup.matchAll(/<[a-zA-Z][^>]*\baria-pressed\s*=\s*["']true["']/gi)];
  if (pressed.length) fail('sound-default', 'index.html ships aria-pressed="true" on an element (the toggle starts pressed)');
  else if (/aria-pressed\s*=\s*["']true["']/i.test(jsText)) {
    warn('sound-default', 'the built JS contains aria-pressed="true" — check it is only set after a tap, not at load');
  }
  const defaults = [
    [/\bon\s*:\s*true\b/, 'an audio object built with on: true'],
    [/\bsoundOn\s*=\s*true\b/, 'soundOn = true'],
    [/\bmuted\s*=\s*false\b/, 'muted = false'],
    [/\bmute(?:d)?\s*:\s*false\b/, 'mute: false'],
    [/\bsound\s*:\s*true\b/, 'sound: true'],
  ];
  for (const [re, what] of defaults) if (re.test(jsMasked)) fail('sound-default', `sound starts on: ${what}`);
}

// ----------------------------------------------------------- browser checks

const BROWSER = { ok: false, reason: null, chromium: null };
try {
  const req = createRequire(import.meta.url);
  let pw = null;
  try { pw = await import('playwright'); } catch { pw = null; }
  if (!pw) pw = req('playwright');
  BROWSER.chromium = pw.chromium;
  BROWSER.ok = true;
} catch {
  BROWSER.reason = 'playwright is not installed (npm i playwright, or run with NODE_PATH set); static checks only';
}

function extToType(p) {
  return { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' }[extname(p)] || 'application/octet-stream';
}

async function browserChecks(chromium) {
  // Serve dist/ the way Pages does, so absolute paths and fetch() behave.
  const server = createServer((rq, rs) => {
    const rel = decodeURIComponent(rq.url.split('?')[0]);
    // Chromium asks for /favicon.ico on its own; answer it so a missing favicon
    // never surfaces as a flaky console 404. A real 404 still fails below.
    if (rel === '/favicon.ico') { rs.statusCode = 204; return rs.end(); }
    const p = resolve(distDir, rel.replace(/^\/+/, '') || 'index.html');
    if (!p.startsWith(distDir) || !existsSync(p) || !statSync(p).isFile()) { rs.statusCode = 404; return rs.end(); }
    rs.setHeader('content-type', extToType(p));
    rs.end(readFileSync(p));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/index.html`;

  const launch = { args: ['--no-sandbox', '--disable-dev-shm-usage'] };
  if (process.env.PW_CHROMIUM_PATH) launch.executablePath = process.env.PW_CHROMIUM_PATH;

  let browser;
  try {
    browser = await chromium.launch(launch);
  } catch (e) {
    server.close();
    warn('browser', `skipped: could not launch Chromium (${String(e.message).split('\n')[0]}); static checks only`);
    return;
  }

  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const loc = m.location(); // log the URL, so a real 404 names its resource
    consoleErrors.push('console: ' + m.text() + (loc && loc.url ? ` (${loc.url})` : ''));
  });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => consoleErrors.push('request failed: ' + r.url()));

  // Count audio the way the house rule means it: constructions, not intentions.
  await page.addInitScript(() => {
    window.__audioCount = 0;
    for (const k of ['AudioContext', 'webkitAudioContext', 'Audio']) {
      const Orig = window[k];
      if (!Orig) continue;
      window[k] = new Proxy(Orig, { construct(t, a, n) { window.__audioCount++; return Reflect.construct(t, a, n); } });
    }
  });

  try {
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForTimeout(1500); // let load-time timers run, so autoplay shows

    // a. no console noise.
    if (consoleErrors.length) for (const e of consoleErrors) fail('console', e);

    // b. no sideways scroll.
    const scroll = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    if (scroll.sw > scroll.iw + 1) fail('scroll', `sideways scroll at 390 px: ${scroll.sw} > ${scroll.iw}`);

    // c. sound still off, and not switched on at load.
    const before = await page.evaluate(() => window.__audioCount);
    if (before > 0) fail('sound-default', `${before} AudioContext/Audio constructor(s) ran before any gesture`);
    const pressedAtLoad = await page.evaluate(() => document.querySelectorAll('[aria-pressed="true"]').length);
    if (pressedAtLoad > 0) fail('sound-default', `${pressedAtLoad} control(s) show aria-pressed="true" at load`);

    // d. tap targets, 44x44, prose links exempt.
    const targets = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('button, a, [role=button], input')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue; // hidden
        // WCAG 2.5.8 inline exception: a link that flows inside a sentence.
        if (el.tagName === 'A' && cs.display === 'inline') continue;
        const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '';
        const txt = el.textContent.trim() ? ` "${el.textContent.trim().slice(0, 24)}"` : '';
        out.push({ name: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls + txt,
          w: Math.round(r.width), h: Math.round(r.height) });
      }
      return out;
    });
    for (const t of targets) {
      if (t.w < 44 || t.h < 44) fail('tap-target', `${t.name} is ${t.w}x${t.h} px, under 44x44`);
    }

    // e. text size: 16 px, labels may go to 12 px.
    const texts = await page.evaluate(() => {
      const isLabel = (el) => {
        const t = el.tagName.toLowerCase();
        if (['label', 'legend', 'kbd', 'code', 'abbr', 'time'].includes(t)) return true;
        if (el.closest('label')) return true;
        if (['button', 'input', 'select', 'textarea'].includes(t)) return true;
        if (el.getAttribute('role') === 'button') return true;
        // A short label may sit at 12 px. "eyebrow" and "kicker" are the
        // design system's label classes (crew/design: --fs-xs, the floor).
        const re = /(^|[^a-z0-9])(label|tag|badge|chip|kbd|caption|eyebrow|kicker)($|[^a-z0-9])/i;
        return re.test(String(el.className)) || re.test(String(el.closest('[class]') ? el.closest('[class]').className : ''));
      };
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const px = parseFloat(cs.fontSize);
        if (px >= 16) continue;
        const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '';
        out.push({ name: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls + ` "${el.textContent.trim().slice(0, 24)}"`,
          px, label: isLabel(el) });
      }
      return out;
    });
    for (const t of texts) {
      if (t.px < 12) fail('text-size', `${t.name} is ${t.px} px, under 12 px even for a label`);
      else if (t.px < 16 && !t.label) fail('text-size', `${t.name} is ${t.px} px, under 16 px and not a label`);
    }

    // f. the toggle turns sound on: one tap, and only then.
    const toggle = await page.evaluate(() => {
      const el = document.querySelector('[aria-pressed]') ||
        [...document.querySelectorAll('button')].find((b) => /sound|mute|audio/i.test((b.textContent || '') + (b.getAttribute('aria-label') || '')));
      if (!el) return null;
      return { id: el.id || null, label: el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 24) };
    });
    if (!toggle) {
      warn('sound-toggle', 'no sound control found (no [aria-pressed], no sound/mute button)');
    } else {
      const sel = toggle.id ? `#${toggle.id}` : 'button';
      try {
        await page.click(sel, { timeout: 2000 });
        await page.waitForTimeout(400);
        const after = await page.evaluate(() => window.__audioCount);
        if (after > 0) note(`sound-toggle: "${toggle.label}" created ${after} AudioContext/Audio after one tap`);
        else warn('sound-toggle', `tapping "${toggle.label}" did not create an AudioContext — wire it up, or say in the README the night is silent`);
      } catch {
        warn('sound-toggle', `could not tap the sound control "${toggle.label}"`);
      }
    }
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }
}

if (BROWSER.ok) {
  await browserChecks(BROWSER.chromium);
} else {
  warn('browser', `skipped: ${BROWSER.reason}`);
}

// ------------------------------------------------------------------ report

for (const n of NOTES) console.log(`  note  ${n}`);
for (const w of WARNS) console.log(`  WARN  ${w.check}  ${w.msg}`);
for (const f of FAILS) console.log(`  FAIL  ${f.check}  ${f.msg}`);

if (FAILS.length) {
  console.log(`night-a11y: ${FAILS.length} failed, ${WARNS.length} warning(s)`);
  process.exit(1);
}
console.log(`night-a11y: ok${WARNS.length ? ` (${WARNS.length} warning(s))` : ''}`);
