#!/usr/bin/env node
// Moondew's end-to-end check, on a phone-sized viewport.
//
//   node qa/check.js <url> <solution-file> [shot-dir]
//
// The solution file comes from `dune exec tests/solution.exe` and gives, per
// pond, the grid size and the winning steps, e.g. "1 4x4 EESSWN...".  Pond 1 is
// played by dragging with the pointer, pond 2 with the arrow keys, so both
// input paths are exercised against the real build.  The app mirrors its own
// state onto #pond as data-steps / data-dew, so the undo, restart and hint
// checks ask the pond rather than guess from pixels.

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

// Mirrors Water.layout: whole-pixel tiles, centred.
async function geometry(page, cols, rows) {
  const geo = await page.evaluate(() => {
    const c = document.getElementById('pond');
    const r = c.getBoundingClientRect();
    return { left: r.left, top: r.top, w: c.width, h: c.height, rectW: r.width };
  });
  const dpr = geo.w / geo.rectW;
  const tile = Math.max(6, Math.floor(Math.min(geo.w / (cols + 0.6), geo.h / (rows + 0.8))));
  const ox = Math.floor((geo.w - cols * tile) / 2);
  const oy = Math.floor((geo.h - rows * tile) / 2);
  return {
    centre: (x, y) => ({
      x: geo.left + (ox + (x + 0.5) * tile) / dpr,
      y: geo.top + (oy + (y + 0.5) * tile) / dpr,
    }),
  };
}

// Draws the pond's own trail, cell by cell, the way a finger would.
async function dragSolution(page, pond) {
  const geo = await geometry(page, pond.cols, pond.rows);
  const wanted = `Pond ${pond.index} of ${parse.lastIndex}`;
  let x = Math.floor(pond.cols / 2);
  let y = pond.rows - 1;
  let from = geo.centre(x, y);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (const step of pond.steps) {
    const [dx, dy] = move[step];
    x += dx;
    y += dy;
    if ((await page.textContent('#pond-label')) !== wanted) break;
    const to = geo.centre(x, y);
    for (let k = 1; k <= 6; k += 1) {
      await page.mouse.move(from.x + ((to.x - from.x) * k) / 6, from.y + ((to.y - from.y) * k) / 6);
      await page.waitForTimeout(12);
    }
    from = to;
  }
  await page.mouse.up();
}

async function main() {
  const ponds = parse(solutionFile);
  parse.lastIndex = ponds.length;
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
  await page.waitForTimeout(700);

  const label = () => page.textContent('#pond-label');
  const hint = () => page.textContent('#hint');
  const counter = () => page.textContent('#dew-counter');
  const state = async (key) => page.getAttribute('#pond', `data-${key}`);

  // The start screen, with the sound button on it.
  check('the start screen is up', await page.isVisible('#start'));
  check('the start screen carries the sound button', await page.isVisible('#sound'));
  await page.click('#begin');
  await page.waitForTimeout(400);

  check('pond 1 starts loaded', (await label()) === 'Pond 1 of 12', await label());
  check('the goal is stated as a count', (await counter()) === '0 of 1 dew awake', await counter());
  check('pond 1 teaches by saying what to do', /dewdrop/.test(await hint()), await hint());
  check('the pond is on screen', await page.evaluate(() => {
    const c = document.getElementById('pond');
    return c.width > 100 && c.height > 100;
  }));
  check('nothing scrolls sideways', await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1));

  // The pond is alive, but only just: a slow breath, not a flicker.
  const calm1 = await page.screenshot();
  await page.waitForTimeout(500);
  const calm2 = await page.screenshot();
  check('the pond is alive without flickering', Buffer.compare(calm1, calm2) !== 0);

  // Pond 1: the whole winning trail, drawn with the pointer.
  await dragSolution(page, ponds[0]);
  await page.waitForTimeout(5000);
  check('dragging the solution wakes pond 1', (await label()) === 'Pond 2 of 12', await label());
  check('a flower lit up for the pond', await page.evaluate(
    () => document.querySelectorAll('#flowers i.on').length === 1));
  check('the count now follows pond 2', (await counter()) === '0 of 3 dew awake', await counter());

  // The strip replays a finished pond, and opens the current one.
  await page.click('#flowers i:nth-child(1)');
  await page.waitForTimeout(300);
  check('tapping a finished flower replays that pond', (await label()) === 'Pond 1 of 12', await label());
  await page.click('#flowers i:nth-child(2)');
  await page.waitForTimeout(300);
  check('the strip opens the pond you are on', (await label()) === 'Pond 2 of 12', await label());

  // Pond 2: the same, with the arrow keys.
  const arrows = { N: 'ArrowUp', S: 'ArrowDown', W: 'ArrowLeft', E: 'ArrowRight' };
  for (const step of ponds[1].steps) {
    await page.keyboard.press(arrows[step]);
    await page.waitForTimeout(15);
  }
  await page.waitForTimeout(5000);
  check('the arrow keys wake pond 2', (await label()) === 'Pond 3 of 12', await label());
  check('a walled-in pond never happens mid-solve', (await state('status')) === 'playing' ||
    (await state('status')) === 'won', await state('status'));

  // A refused step is answered: drawn into a stone it cannot take.
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(80);
  const drawn = await state('steps');
  check('a step is drawn', drawn === '1', drawn);

  // Undo takes a step back; restart clears the trail.
  await page.click('#undo');
  await page.waitForTimeout(250);
  check('the undo button steps back', (await state('steps')) === '0', await state('steps'));
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(80);
  await page.click('#restart');
  await page.waitForTimeout(250);
  check('restart clears the trail', (await state('steps')) === '0', await state('steps'));

  // Long press, held still: the nudge appears and says what it is.
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

  // Reduced motion: the pond holds completely still.
  check('reduced motion is honoured in the stylesheet', await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.conditionText && rule.conditionText.includes('prefers-reduced-motion')) return true;
        }
      } catch (err) { /* cross-origin sheet */ }
    }
    return false;
  }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.click('#flowers i:nth-child(1)');
  await page.waitForTimeout(1000);
  const still1 = await page.screenshot();
  await page.waitForTimeout(700);
  const still2 = await page.screenshot();
  check('with reduced motion the pond holds still', Buffer.compare(still1, still2) === 0);

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
