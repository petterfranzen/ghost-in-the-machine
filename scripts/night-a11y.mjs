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

//
// The checks are tables: STATIC_CHECKS below, BROWSER_CHECKS in
// night-a11y-browser.mjs. night-a11y-scope.mjs holds the JS-scope reader the
// audio check uses.

import { createRequire } from 'node:module';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mask, behindGesture } from './night-a11y-scope.mjs';
import { browserChecks } from './night-a11y-browser.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FAILS = [];
const WARNS = [];
const NOTES = [];
const report = {
  fail: (check, msg) => FAILS.push({ check, msg }),
  warn: (check, msg) => WARNS.push({ check, msg }),
  note: (msg) => NOTES.push(msg),
};

// ---------------------------------------------------------------- arguments

const hasBuild = (d) => existsSync(join(d, 'dist', 'index.html'));

// The unique night folder whose name is a or ends in "-a"; null when none.
function matchNightName(a) {
  const nightsDir = join(REPO, 'nights');
  if (!existsSync(nightsDir)) return null;
  const hit = readdirSync(nightsDir).filter((d) => d === a || d.endsWith(`-${a}`))
    .map((d) => join(nightsDir, d)).filter(hasBuild);
  if (hit.length > 1) {
    console.error(`night-a11y: "${a}" matches more than one night: ${hit.map((d) => relative(REPO, d)).join(', ')}`);
    process.exit(2);
  }
  return hit[0] ?? null;
}

// Accept "nights/2026-11-03-pebble-pond", the folder name, or its unique tail
// ("pebble-pond" for "2026-11-03-pebble-pond").
function resolveNight(a) {
  const tries = [resolve(REPO, a.replace(/\/+$/, '')), join(REPO, 'nights', a.replace(/\/+$/, ''))];
  return tries.find(hasBuild) ?? matchNightName(a) ?? tries[0];
}

const HELP = new Set(['-h', '--help']);

function parseArgs(arg) {
  if (!arg || HELP.has(arg)) {
    console.error('usage: night-a11y <nights/DATE-name>   (a night folder, or its bare name)');
    process.exit(arg ? 0 : 2);
  }
  const nightDir = resolveNight(arg);
  const night = { distDir: join(nightDir, 'dist'), name: relative(REPO, nightDir) || arg };
  if (!existsSync(join(night.distDir, 'index.html'))) {
    console.error(`night-a11y: ${night.name} has no dist/index.html to check (build it first)`);
    process.exit(2);
  }
  return night;
}

// ------------------------------------------------------------ read the page

const isRemote = (url) => /^(https?:)?\/\//.test(url);

// Everything dist/ serves that the page can pull in: linked CSS, script src,
// plus, as a fallback, any .css sitting next to index.html.
function stylesheetRefs(html) {
  return [...html.matchAll(/<link\b[^>]*\brel\s*=\s*["']?stylesheet["']?[^>]*>/gi)]
    .map((m) => m[0].match(/\bhref\s*=\s*["']([^"']+)["']/i))
    .filter((href) => href && !isRemote(href[1])).map((href) => href[1]);
}

const scriptRefs = (html) =>
  [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]).filter((src) => !isRemote(src));

function localRefs(html, distDir) {
  const besideIndex = readdirSync(distDir).filter((f) => /\.css$/i.test(f));
  return [...stylesheetRefs(html), ...scriptRefs(html), ...besideIndex];
}

function localFiles(html, distDir) {
  const out = { css: [], js: [] };
  for (const p of new Set(localRefs(html, distDir).filter(Boolean))) {
    const f = resolve(distDir, p.replace(/^\.?\//, ''));
    if (existsSync(f) && statSync(f).isFile()) out[/\.css$/i.test(f) ? 'css' : 'js'].push(f);
  }
  return out;
}

const INLINE_STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const INLINE_SCRIPT = /<script\b(?![^>]*\bsrc=)(?![^>]*type\s*=\s*["']?(?:application\/(?:ld\+)?json|text\/template))[^>]*>([\s\S]*?)<\/script>/gi;

function readPage(distDir) {
  const html = readFileSync(join(distDir, 'index.html'), 'utf8');
  const files = localFiles(html, distDir);
  const read = (f) => readFileSync(f, 'utf8');
  const cssText = [...[...html.matchAll(INLINE_STYLE)].map((m) => m[1]), ...files.css.map(read)].join('\n');
  const jsText = [...[...html.matchAll(INLINE_SCRIPT)].map((m) => m[1] ?? ''), ...files.js.map(read)].join('\n;\n');
  return { html, cssText, jsText, jsMasked: mask(jsText) };
}

// ------------------------------------------------------------ static checks

const GESTURE = /addEventListener\s*\(\s*['"`](?:click|pointerdown|pointerup|mousedown|mouseup|touchstart|touchend|keydown|keyup|keypress|input|change|submit)['"`]/;

// 1. prefers-reduced-motion.
function checkReducedMotion({ cssText, jsText }) {
  if (/prefers-reduced-motion/i.test(cssText)) {
    report.note('reduced-motion: a CSS prefers-reduced-motion rule is present');
  } else if (/prefers-reduced-motion/i.test(jsText)) {
    report.warn('reduced-motion', 'no CSS prefers-reduced-motion rule; the page only reads it in JS — add a CSS rule beside the animation');
  } else {
    report.fail('reduced-motion', 'no prefers-reduced-motion rule anywhere in dist/ CSS or JS');
  }
}

// 2. No autoplaying audio, and any audio context/player created behind a gesture.
function checkAutoplay({ html }) {
  for (const m of html.matchAll(/<(audio|video)\b[^>]*>/gi)) {
    if (/\bautoplay\b/i.test(m[0])) report.fail('audio', `autoplaying <${m[1]}> element in index.html`);
  }
}

function checkAudioBehindGesture({ jsMasked }) {
  const creations = [...jsMasked.matchAll(/new\s+(?:window\s*\.\s*)?(?:webkit)?Audio(?:Context)?\s*\(/g)];
  if (!creations.length) return;
  if (!GESTURE.test(jsMasked)) {
    report.fail('audio', 'AudioContext/Audio is created but the page never listens for a user gesture');
    return;
  }
  for (const where of behindGesture(jsMasked, creations.map((c) => c.index))) {
    if (!where.ok) report.fail('audio', `AudioContext/Audio created in ${where.label}, which no user gesture reaches`);
  }
}

// 3. The sound toggle is not on at load.
function checkPressedAtLoad({ html, jsText }) {
  // The attribute only counts on an element, never inside a <style> selector
  // or a <script> body: drop those first, then look for it inside a tag.
  const markup = html.replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  if (/<[a-zA-Z][^>]*\baria-pressed\s*=\s*["']true["']/i.test(markup)) {
    report.fail('sound-default', 'index.html ships aria-pressed="true" on an element (the toggle starts pressed)');
  } else if (/aria-pressed\s*=\s*["']true["']/i.test(jsText)) {
    report.warn('sound-default', 'the built JS contains aria-pressed="true" — check it is only set after a tap, not at load');
  }
}

const SOUND_DEFAULTS = [
  [/\bon\s*:\s*true\b/, 'an audio object built with on: true'],
  [/\bsoundOn\s*=\s*true\b/, 'soundOn = true'],
  [/\bmuted\s*=\s*false\b/, 'muted = false'],
  [/\bmute(?:d)?\s*:\s*false\b/, 'mute: false'],
  [/\bsound\s*:\s*true\b/, 'sound: true'],
];

function checkSoundDefaults({ jsMasked }) {
  for (const [re, what] of SOUND_DEFAULTS) if (re.test(jsMasked)) report.fail('sound-default', `sound starts on: ${what}`);
}

const STATIC_CHECKS = [
  checkReducedMotion, checkAutoplay, checkAudioBehindGesture, checkPressedAtLoad, checkSoundDefaults,
];

// ----------------------------------------------------------- browser checks

async function loadChromium() {
  try {
    const req = createRequire(import.meta.url);
    let pw = null;
    try { pw = await import('playwright'); } catch { pw = null; }
    if (!pw) pw = req('playwright');
    return { ok: true, chromium: pw.chromium };
  } catch {
    return { ok: false, reason: 'playwright is not installed (npm i playwright, or run with NODE_PATH set); static checks only' };
  }
}

// ------------------------------------------------------------------ report

function printReport() {
  for (const n of NOTES) console.log(`  note  ${n}`);
  for (const w of WARNS) console.log(`  WARN  ${w.check}  ${w.msg}`);
  for (const f of FAILS) console.log(`  FAIL  ${f.check}  ${f.msg}`);
  if (FAILS.length) {
    console.log(`night-a11y: ${FAILS.length} failed, ${WARNS.length} warning(s)`);
    process.exit(1);
  }
  console.log(`night-a11y: ok${WARNS.length ? ` (${WARNS.length} warning(s))` : ''}`);
}

const night = parseArgs(process.argv[2]);
console.log(`night-a11y: ${night.name}`);
const pageText = readPage(night.distDir);
for (const check of STATIC_CHECKS) check(pageText);
const browser = await loadChromium();
if (browser.ok) await browserChecks(browser.chromium, night.distDir, report);
else report.warn('browser', `skipped: ${browser.reason}`);
printReport();
