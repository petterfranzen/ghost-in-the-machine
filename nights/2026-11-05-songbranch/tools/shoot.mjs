/* Real-browser screenshots of dist/index.html: desktop, phone, a tapped bird,
 * and phone with reduced motion. Also fails the run if the page asks for
 * anything off-origin or logs a console error — "no external requests" and a
 * quiet console are house rules, so they are asserted, not just observed.
 */
import pw from '/usr/local/lib/node_modules/playwright/index.js';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = pw;
const url = pathToFileURL(path.resolve('dist/index.html')).href;
const browser = await chromium.launch();
const problems = [];

async function shot(name, opts, action) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const logs = [];
  const urls = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
  page.on('request', (r) => urls.push(r.url()));
  page.on('requestfailed', (r) => logs.push('requestfailed: ' + r.url()));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1400);
  if (action) await action(page);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `shots/${name}.png` });
  const info = await page.evaluate(() => {
    const r = document.getElementById('stage').getBoundingClientRect();
    const b = document.getElementById('sound').getBoundingClientRect();
    const doc = document.documentElement;
    return {
      canvas: { w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
      sound: { w: +b.width.toFixed(1), h: +b.height.toFixed(1) },
      scroll: { x: doc.scrollWidth > innerWidth, y: doc.scrollHeight > innerHeight },
      caption: document.getElementById('caption').textContent,
      pressed: document.getElementById('sound').getAttribute('aria-pressed'),
      hintPx: getComputedStyle(document.getElementById('hint')).fontSize,
      captionPx: getComputedStyle(document.getElementById('caption')).fontSize
    };
  });
  const external = urls.filter((u) => !u.startsWith('file:') && !u.startsWith('data:'));
  if (external.length) problems.push(name + ': external requests ' + JSON.stringify(external));
  if (logs.length) problems.push(name + ': console ' + JSON.stringify(logs));
  if (info.scroll.x || info.scroll.y) problems.push(name + ': page scrolls');
  console.log(name, JSON.stringify(info));
  await ctx.close();
  return info;
}

await shot('desktop', { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
await shot('phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await shot('phone-tap', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  async (page) => {
    const p = await page.evaluate(() => ({ x: songbranchBirdX(1), y: songbranchBirdY(1) }));
    const r = await page.evaluate(() => {
      const b = document.getElementById('stage').getBoundingClientRect();
      return { left: b.left, top: b.top, w: b.width, h: b.height };
    });
    await page.mouse.click(r.left + (p.x / 176) * r.w, r.top + (p.y / 312) * r.h);
  });
await shot('phone-reduced', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' },
  async (page) => {
    const r = await page.evaluate(() => {
      const b = document.getElementById('stage').getBoundingClientRect();
      return { left: b.left, top: b.top, w: b.width, h: b.height };
    });
    await page.mouse.click(r.left + r.w * 0.5, r.top + r.h * 0.72);
  });

await browser.close();
if (problems.length) {
  console.error('\nPROBLEMS\n' + problems.join('\n'));
  process.exit(1);
}
console.log('\nshots clean: no external requests, no console noise, no page scroll');
