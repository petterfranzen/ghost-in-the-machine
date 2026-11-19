#!/usr/bin/env node
// Moondew's end-to-end check, on a phone-sized viewport.
//
//   node qa/check.js <url> <solution-file> [shot-dir]
//
// The solution file comes from `dune exec tests/solution.exe` and gives, per
// pond, the grid size and the winning steps, e.g. "1 4x4 EESSWN...".  Pond 1 is
// played by dragging with the pointer, pond 2 with the arrow keys, so both
// input paths are exercised against the real build.

const fs = require('fs');
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://127.0.0.1:8099/';
const solutionFile = process.argv[3];
const shotDir = process.argv[4] || '.';

let failures = 0;
const check = (name, ok, extra) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !extra ? '' : ` (${extra})`}`);
  if (!ok) failures += 1;
};

const parse = (path) =>
  fs.readFileSync(path, 'utf8').trim().split('\n').map((line) => {
    const [index, size, steps] = line.split(' ');
    const [cols, rows] = size.split('x').map(Number);
    return { index: Number(index), cols, rows, steps };
  });

const move = { N: [0, -1], S: [0, 1], W: [-1, 0], E: [1, 0] };

async function geometry(page, cols, rows) {
  const geo = await page.evaluate(() => {
    const c = document.getElementById('pond');
    const r = c.getBoundingClientRect();
    return { left: r.left, top: r.top, w: c.width, h: c.height, rectW: r.width, rectH: r.height };
  });
  const dpr = geo.w / geo.rectW;
  const tile = Math.max(6, Math.floor(Math.min(geo.w / (cols + 0.7), geo.h / (rows + 0.9))));
  const ox = Math.floor((geo.w - cols * tile) / 2);
  const oy = Math.floor((geo.h - rows * tile) / 2 - tile * 0.25);
  return {
    centre: (x, y) => ({
      x: geo.left + (ox + (x + 0.5) * tile) / dpr,
      y: geo.top + (oy + (y + 0.5) * tile) / dpr,
    }),
  };
}

async function dragSolution(page, pond) {
  const geo = await geometry(page, pond.cols, pond.rows);
  let x = Math.floor(pond.cols / 2);
  let y = pond.rows - 1;
  const start = geo.centre(x, y);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (const step of pond.steps) {
    const [dx, dy] = move[step];
    x += dx;
    y += dy;
    if ((await page.textContent('#pond-label')) !== 'Pond 1 of 12') break;
    const to = geo.centre(x, y);
    for (let k = 1; k <= 6; k += 1) {
      await page.mouse.move(start.x + ((to.x - start.x) * k) / 6, start.y + ((to.y - start.y) * k) / 6);
      await page.waitForTimeout(12);
    }
  }
  await page.mouse.up();
}

async function main() {
  const ponds = parse(solutionFile);
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(800);

  const label = () => page.textContent('#pond-label');
  const hint = () => page.textContent('#hint');

  check('pond 1 starts loaded', (await label()) === 'Pond 1 of 12', await label());
  check('the pond is on screen', await page.evaluate(() => {
    const c = document.getElementById('pond');
    return c.width > 100 && c.height > 100;
  }));
  check('nothing scrolls sideways', await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1));

  // Pond 1: the whole winning trail, drawn with the pointer.
  await dragSolution(page, ponds[0]);
  await page.waitForTimeout(4800);
  check('dragging the solution wakes pond 1', (await label()) === 'Pond 2 of 12', await label());
  check('a flower lit up for the pond', await page.evaluate(
    () => document.querySelectorAll('#flowers i.on').length === 1));

  // Pond 2: the same, with the arrow keys.
  const arrows = { N: 'ArrowUp', S: 'ArrowDown', W: 'ArrowLeft', E: 'ArrowRight' };
  for (const step of ponds[1].steps) {
    await page.keyboard.press(arrows[step]);
    await page.waitForTimeout(15);
  }
  await page.waitForTimeout(4800);
  check('the arrow keys wake pond 2', (await label()) === 'Pond 3 of 12', await label());

  // Tap the head of the trail: one step back, no complaints.
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(60);
  const before = await page.screenshot({ clip: { x: 0, y: 300, width: 390, height: 120 } });
  const geo = await geometry(page, ponds[2].cols, ponds[2].rows);
  const head = geo.centre(Math.floor(ponds[2].cols / 2), ponds[2].rows - 1);
  await page.mouse.click(head.x, head.y);
  await page.waitForTimeout(200);
  const after = await page.screenshot({ clip: { x: 0, y: 300, width: 390, height: 120 } });
  check('tapping the head changes the pond', Buffer.compare(before, after) !== 0);

  // Long press, held still: the nudge appears.
  await page.mouse.move(195, 420);
  await page.mouse.down();
  await page.waitForTimeout(900);
  await page.mouse.up();
  check('a long press offers a nudge', /leads|remembers|drifted/.test(await hint()), await hint());

  // Sound: the button answers at once and stays on.
  await page.click('#sound');
  await page.waitForTimeout(700);
  check('sound turns on', (await page.textContent('#sound')) === 'Sound on');
  check('sound is remembered', await page.evaluate(() => localStorage.getItem('moondew.sound') === 'on'));

  check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  await page.screenshot({ path: `${shotDir}/phone.png` });
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${shotDir}/desktop.png` });
  check('no sideways scroll on desktop', await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1));

  await browser.close();
  console.log(failures === 0 ? '\nevery check passed' : `\n${failures} checks failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => { console.error(err); process.exit(1); });
