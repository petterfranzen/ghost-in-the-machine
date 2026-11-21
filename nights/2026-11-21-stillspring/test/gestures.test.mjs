// Smoke test for the one-thumb gestures: it drives the real createGestures
// wiring against a fake grid so a drag turns each stone it crosses exactly once,
// including the stone the drag started on, and a tap still fires once.
import { createGestures } from '../src/gestures.js';

// A timer stub keeps the hold timers from firing and from holding Node open.
globalThis.window = { setTimeout: () => 0, clearTimeout: () => {} };

const handlers = {};
const grid = {
  addEventListener: (type, fn) => { (handlers[type] ||= []).push(fn); },
  setPointerCapture: () => {},
};
const fire = (type, ev) => { for (const fn of handlers[type] || []) fn(ev); };

const CELL = 40;
const board = { cellFromEvent: (ev) => ({ x: Math.floor(ev.clientX / CELL), y: Math.floor(ev.clientY / CELL) }) };
const point = (x, y) => ({ clientX: x, clientY: y, button: 0, pointerId: 1, preventDefault: () => {} });

const sweeps = [];
const taps = [];
createGestures({
  grid, board,
  onTap: (x, y) => taps.push(`${x},${y}`),
  onHint: () => {}, onSecret: () => {},
  onSweep: (x, y) => sweeps.push(`${x},${y}`),
  onWake: () => {},
});

const count = (key) => sweeps.filter((s) => s === key).length;

// Drag: press on (2,2), cross the slop while still over (2,2), then out to (3,2).
fire('pointerdown', point(100, 100));
fire('pointermove', point(112, 100)); // slop crossed, same cell
fire('pointermove', point(140, 100)); // new cell (3,2)
fire('pointermove', point(145, 100)); // same cell again
fire('pointermove', point(100, 100)); // back to the start cell
fire('pointerup', point(100, 100));

let failures = 0;
const check = (name, ok, extra = '') => {
  if (ok) console.log(`ok   ${name}`);
  else { failures += 1; console.log(`FAIL ${name}${extra ? ' - ' + extra : ''}`); }
};

check('drag turns the pressed stone once', count('2,2') === 1, `sweeps=${sweeps.join(' ')}`);
check('drag turns each crossed stone once', count('3,2') === 1, `sweeps=${sweeps.join(' ')}`);
check('drag sweeps only the cells crossed', sweeps.length === 2, `sweeps=${sweeps.join(' ')}`);
check('a drag does not also tap', taps.length === 0, `taps=${taps.join(' ')}`);

// Tap: a press and release inside one cell fires the tap, never a sweep.
fire('pointerdown', point(100, 100));
fire('pointerup', point(100, 100));
check('a tap fires once', taps.join(' ') === '2,2', `taps=${taps.join(' ')}`);

if (failures) { console.log(`\n${failures} check(s) failed`); process.exit(1); }
console.log('\nall checks passed');
