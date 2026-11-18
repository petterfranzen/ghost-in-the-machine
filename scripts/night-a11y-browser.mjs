// night-a11y-browser — the half of night-a11y that needs a real Chromium.
//
// Serves dist/ the way Pages does, opens it at 390x844 with touch, and runs
// BROWSER_CHECKS in order. Each check reports through { fail, warn, note }.

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
};
const extToType = (p) => TYPES[extname(p)] || 'application/octet-stream';

// Only a file inside dist/ is served.
function isServable(distDir, p) {
  if (!p.startsWith(distDir)) return false;
  return existsSync(p) && statSync(p).isFile();
}

function serveFile(distDir, rq, rs) {
  const rel = decodeURIComponent(rq.url.split('?')[0]);
  // Chromium asks for /favicon.ico on its own; answer it so a missing favicon
  // never surfaces as a flaky console 404. A real 404 still fails below.
  if (rel === '/favicon.ico') { rs.statusCode = 204; return rs.end(); }
  const p = resolve(distDir, rel.replace(/^\/+/, '') || 'index.html');
  if (!isServable(distDir, p)) { rs.statusCode = 404; return rs.end(); }
  rs.setHeader('content-type', extToType(p));
  return rs.end(readFileSync(p));
}

async function startServer(distDir) {
  const server = createServer((rq, rs) => serveFile(distDir, rq, rs));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return server;
}

async function launchBrowser(chromium, report) {
  const launch = { args: ['--no-sandbox', '--disable-dev-shm-usage'] };
  if (process.env.PW_CHROMIUM_PATH) launch.executablePath = process.env.PW_CHROMIUM_PATH;
  try {
    return await chromium.launch(launch);
  } catch (e) {
    report.warn('browser', `skipped: could not launch Chromium (${String(e.message).split('\n')[0]}); static checks only`);
    return null;
  }
}

function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const loc = m.location(); // log the URL, so a real 404 names its resource
    errors.push('console: ' + m.text() + (loc && loc.url ? ` (${loc.url})` : ''));
  });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => errors.push('request failed: ' + r.url()));
  return errors;
}

// Count audio the way the house rule means it: constructions, not intentions.
function countAudioConstructions() {
  window.__audioCount = 0;
  for (const k of ['AudioContext', 'webkitAudioContext', 'Audio']) {
    const Orig = window[k];
    if (!Orig) continue;
    window[k] = new Proxy(Orig, { construct(t, a, n) { window.__audioCount++; return Reflect.construct(t, a, n); } });
  }
}

async function openPage(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
  });
  const page = await ctx.newPage();
  const consoleErrors = collectConsoleErrors(page);
  await page.addInitScript(countAudioConstructions);
  return { page, consoleErrors };
}

// ------------------------------------------------- functions run in the page
// These are serialised into the page, so each uses only its parameters.

// "tag#id.firstClass", the way a finding names an element.
function elName(el) {
  const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '';
  return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls;
}

function isLabel(el) {
  const t = el.tagName.toLowerCase();
  const labelTags = ['label', 'legend', 'kbd', 'code', 'abbr', 'time', 'button', 'input', 'select', 'textarea'];
  if (labelTags.includes(t)) return true;
  if (el.closest('label') || el.getAttribute('role') === 'button') return true;
  // A short label may sit at 12 px. "eyebrow" and "kicker" are the
  // design system's label classes (crew/design: --fs-xs, the floor).
  const re = /(^|[^a-z0-9])(label|tag|badge|chip|kbd|caption|eyebrow|kicker)($|[^a-z0-9])/i;
  if (re.test(String(el.className))) return true;
  const holder = el.closest('[class]');
  return re.test(String(holder ? holder.className : ''));
}

function tapTargetOf(el, name) {
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null; // hidden
  // WCAG 2.5.8 inline exception: a link that flows inside a sentence.
  if (el.tagName === 'A' && cs.display === 'inline') return null;
  const txt = el.textContent.trim() ? ` "${el.textContent.trim().slice(0, 24)}"` : '';
  return { name: name(el) + txt, w: Math.round(r.width), h: Math.round(r.height) };
}

function smallTextOf(el, name, label) {
  const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  if (!own) return null;
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return null;
  if (+cs.opacity === 0) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  const px = parseFloat(cs.fontSize);
  if (px >= 16) return null;
  return { name: name(el) + ` "${el.textContent.trim().slice(0, 24)}"`, px, label: label(el) };
}

function collect(selector, pick, ...helpers) {
  return [...document.querySelectorAll(selector)].map((el) => pick(el, ...helpers)).filter(Boolean);
}

function findSoundToggle() {
  const el = document.querySelector('[aria-pressed]') ||
    [...document.querySelectorAll('button')].find((b) => /sound|mute|audio/i.test((b.textContent || '') + (b.getAttribute('aria-label') || '')));
  if (!el) return null;
  return { id: el.id || null, label: el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 24) };
}

// Run collect(selector, pick, ...helpers) in the page; functions travel as source.
const collectInPage = (page, selector, pick, ...helpers) =>
  page.evaluate(`(${collect})(${JSON.stringify(selector)}, ${[pick, ...helpers].join(', ')})`);

// ------------------------------------------------------------ the checks

// a. no console noise.
function checkConsole({ consoleErrors, report }) {
  for (const e of consoleErrors) report.fail('console', e);
}

// b. no sideways scroll.
async function checkScroll({ page, report }) {
  const scroll = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  if (scroll.sw > scroll.iw + 1) report.fail('scroll', `sideways scroll at 390 px: ${scroll.sw} > ${scroll.iw}`);
}

// c. sound still off, and not switched on at load.
async function checkSoundAtLoad({ page, report }) {
  const before = await page.evaluate(() => window.__audioCount);
  if (before > 0) report.fail('sound-default', `${before} AudioContext/Audio constructor(s) ran before any gesture`);
  const pressedAtLoad = await page.evaluate(() => document.querySelectorAll('[aria-pressed="true"]').length);
  if (pressedAtLoad > 0) report.fail('sound-default', `${pressedAtLoad} control(s) show aria-pressed="true" at load`);
}

// d. tap targets, 44x44, prose links exempt.
async function checkTapTargets({ page, report }) {
  const targets = await collectInPage(page, 'button, a, [role=button], input', tapTargetOf, elName);
  for (const t of targets) {
    if (t.w < 44 || t.h < 44) report.fail('tap-target', `${t.name} is ${t.w}x${t.h} px, under 44x44`);
  }
}

// e. text size: 16 px, labels may go to 12 px.
async function checkTextSize({ page, report }) {
  const texts = await collectInPage(page, 'body *', smallTextOf, elName, isLabel);
  for (const t of texts) {
    if (t.px < 12) report.fail('text-size', `${t.name} is ${t.px} px, under 12 px even for a label`);
    else if (!t.label) report.fail('text-size', `${t.name} is ${t.px} px, under 16 px and not a label`);
  }
}

// f. the toggle turns sound on: one tap, and only then.
async function checkSoundToggle({ page, report }) {
  const toggle = await page.evaluate(findSoundToggle);
  if (!toggle) {
    report.warn('sound-toggle', 'no sound control found (no [aria-pressed], no sound/mute button)');
    return;
  }
  try {
    await page.click(toggle.id ? `#${toggle.id}` : 'button', { timeout: 2000 });
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.__audioCount);
    if (after > 0) report.note(`sound-toggle: "${toggle.label}" created ${after} AudioContext/Audio after one tap`);
    else report.warn('sound-toggle', `tapping "${toggle.label}" did not create an AudioContext — wire it up, or say in the README the night is silent`);
  } catch {
    report.warn('sound-toggle', `could not tap the sound control "${toggle.label}"`);
  }
}

export const BROWSER_CHECKS = [
  checkConsole, checkScroll, checkSoundAtLoad, checkTapTargets, checkTextSize, checkSoundToggle,
];

export async function browserChecks(chromium, distDir, report) {
  const server = await startServer(distDir);
  const browser = await launchBrowser(chromium, report);
  if (!browser) { server.close(); return; }
  const { page, consoleErrors } = await openPage(browser);
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: 'load' });
    await page.waitForTimeout(1500); // let load-time timers run, so autoplay shows
    for (const check of BROWSER_CHECKS) await check({ page, consoleErrors, report });
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }
}
