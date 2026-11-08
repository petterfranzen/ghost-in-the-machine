/* interact.test.mjs — a tiny, dependency-free test for nights/_shared/interact.js.
 *
 *   node nights/_shared/interact.test.mjs
 *
 * interact.js only touches a handful of browser globals, so this file shims
 * just those (window, document, matchMedia, requestAnimationFrame) and drives
 * the four exports with synthetic pointer events. The onTap cases are the ones
 * Togusa's QA hit: a tap, a drag, a drag that starts on the element and ends
 * outside it, and multi-touch. */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';

// --- a very small DOM: just what interact.js touches ------------------------

function makeTarget(bag = {}) {
  return {
    addEventListener(type, fn) { (bag[type] ||= new Set()).add(fn); },
    removeEventListener(type, fn) { bag[type]?.delete(fn); },
    fire(type, ev = {}) { for (const fn of [...(bag[type] || [])]) fn({ type, ...ev }); },
  };
}
function makeEl() {
  const classes = new Set();
  return Object.assign(makeTarget(), {
    style: {},
    dataset: {},
    hidden: false,
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
    },
  });
}

let reduced = false;
const win = makeTarget();
const documentElement = makeEl();
const head = Object.assign(makeTarget(), { children: [], appendChild(c) { this.children.push(c); } });
const document = {
  documentElement,
  head,
  createElement: (tag) => Object.assign(makeEl(), { tagName: tag.toUpperCase(), id: '', textContent: '' }),
  getElementById: () => null,
  fullscreenEnabled: false,
  fullscreenElement: null,
};

let clock = 0;
let rafSeq = 0;
let rafQueue = [];
globalThis.window = win;
globalThis.document = document;
globalThis.matchMedia = (q) => ({
  media: q,
  matches: q.includes('prefers-reduced-motion') ? reduced : false,
});
globalThis.performance = Object.create(globalThis.performance, { now: { value: () => clock } });
globalThis.requestAnimationFrame = (cb) => { const id = ++rafSeq; rafQueue.push({ id, cb }); return id; };
globalThis.cancelAnimationFrame = (id) => { rafQueue = rafQueue.filter((j) => j.id !== id); };
const frame = (ms = 16) => { clock += ms; const due = rafQueue; rafQueue = []; for (const j of due) j.cb(clock); };

const { onTap, nudge, idleHint, fullscreenOnMobile } = await import('./interact.js');

const press = (target, id, x, y) =>
  target.fire('pointerdown', { pointerId: id, pointerType: 'touch', button: 0, clientX: x, clientY: y });
// A release lands on some element and bubbles to window; pass the element it
// lands on, or nothing when the finger left the element before lifting.
const release = (id, x, y, over) => {
  const ev = { pointerId: id, pointerType: 'touch', clientX: x, clientY: y };
  if (over) over.fire('pointerup', ev);
  win.fire('pointerup', ev);
};

// --- onTap ------------------------------------------------------------------

test('onTap: a clean tap fires once', () => {
  const stage = makeEl();
  let taps = 0;
  const off = onTap(stage, () => (taps += 1));
  press(stage, 1, 10, 10);
  release(1, 11, 11, stage);
  assert.equal(taps, 1);
  off();
});

test('onTap: a drag of more than 12 px is not a tap', () => {
  const stage = makeEl();
  let taps = 0;
  const off = onTap(stage, () => (taps += 1));
  press(stage, 1, 10, 10);
  release(1, 60, 10, stage);
  assert.equal(taps, 0);
  off();
});

test('onTap: a drag that ends outside the element does not gag later taps', () => {
  const stage = makeEl();
  let taps = 0;
  const off = onTap(stage, () => (taps += 1));
  press(stage, 1, 10, 10);   // finger down on the element
  release(1, 400, 400);      // ... dragged off it and released elsewhere
  press(stage, 2, 10, 10);   // the next tap must still land
  release(2, 10, 10, stage);
  assert.equal(taps, 1);
  off();
});

test('onTap: multi-touch is ignored, and the next single tap still fires', () => {
  const stage = makeEl();
  let taps = 0;
  const off = onTap(stage, () => (taps += 1));
  press(stage, 1, 10, 10);
  press(stage, 2, 80, 80);   // second finger
  release(1, 10, 10, stage);
  release(2, 80, 80, stage);
  assert.equal(taps, 0);
  press(stage, 3, 10, 10);
  release(3, 10, 10, stage);
  assert.equal(taps, 1);
  off();
});

// --- nudge ------------------------------------------------------------------

test('nudge: ramps while the finger rests, then settles to 0 on release', () => {
  reduced = false;
  clock = 0;
  const stage = makeEl();
  const seen = [];
  const off = nudge(stage, (s) => seen.push(s), { ramp: 300 });
  press(stage, 1, 5, 5);
  frame(0);
  assert.equal(seen.at(-1), 0.15);
  frame(150);
  assert.ok(seen.at(-1) > 0.15 && seen.at(-1) < 1, `mid-ramp ${seen.at(-1)}`);
  frame(200);
  assert.equal(seen.at(-1), 1);
  win.fire('pointerup', { pointerId: 1 });
  assert.equal(seen.at(-1), 0);
  off();
});

test('nudge: under reduced motion it is one static call, then 0', () => {
  reduced = true;
  const stage = makeEl();
  const seen = [];
  const off = nudge(stage, (s) => seen.push(s));
  press(stage, 1, 5, 5);
  assert.deepEqual(seen, [1]);
  win.fire('pointerup', { pointerId: 1 });
  assert.deepEqual(seen, [1, 0]);
  off();
});

// --- idleHint ---------------------------------------------------------------

test('idleHint: shows after the delay, hides on input, at most three times', async () => {
  reduced = false;
  const hint = makeEl();
  let shows = 0, hides = 0;
  const off = idleHint(hint, { after: 5, show: () => (shows += 1), hide: () => (hides += 1) });
  assert.equal(hint.dataset.motion, 'motion');
  await sleep(25);
  assert.equal(shows, 1);
  win.fire('pointerdown', { pointerId: 1 });
  assert.equal(hides, 1);
  await sleep(25);
  assert.equal(shows, 2);
  win.fire('pointerdown', { pointerId: 2 });
  await sleep(25);
  assert.equal(shows, 3);
  win.fire('pointerdown', { pointerId: 3 });   // fourth stillness: capped
  await sleep(25);
  assert.equal(shows, 3);
  off();
});

// --- fullscreenOnMobile -----------------------------------------------------

test('fullscreenOnMobile: fills the screen, reports support, never throws', async () => {
  const fs = fullscreenOnMobile(documentElement, { padding: true });
  assert.ok(documentElement.classList.contains('gim-fill'));
  assert.ok(documentElement.classList.contains('gim-safe'));
  assert.equal(fs.mobile, false);        // not a coarse pointer in this shim
  assert.equal(fs.supported, false);     // no Fullscreen API here
  assert.equal(fs.isOn(), false);
  assert.equal(await fs.enter(), false); // resolves false, does not throw
  assert.equal(await fs.exit(), false);
});
