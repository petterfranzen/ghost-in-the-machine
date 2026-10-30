// The renderer, exercised without a browser.
//
// app.js is a browser ES module: it wants a canvas, a hint, a button and
// requestAnimationFrame. Node has none of them, so this file hands it the
// smallest stand-ins that behave like the real things — including a 2D context
// that counts every call instead of painting — and then runs the app the way a
// thumb would: some idle frames, a tap, a drag, a hundred more frames.
//
// It cannot see the pixels. What it can prove is that the wiring holds: that the
// tap reaches the simulation, that the koi chase the food down, and that every
// drawing call the renderer makes exists on a real 2D context.

import { strict as assert } from "node:assert";

const WIDTH = 390;
const HEIGHT = 780;

const draws = new Map();
const gradient = { addColorStop() {} };

const context2d = new Proxy(
  {},
  {
    get(_target, key) {
      if (key === "createLinearGradient" || key === "createRadialGradient") {
        draws.set(key.toString(), (draws.get(key.toString()) ?? 0) + 1);
        return () => gradient;
      }
      if (typeof key !== "string") return undefined;
      return (...args) => {
        draws.set(key, (draws.get(key) ?? 0) + 1);
        void args;
      };
    },
    set() {
      return true;
    },
  },
);

const listeners = new Map();
const element = (id, extra = {}) => ({
  id,
  clientWidth: WIDTH,
  clientHeight: HEIGHT,
  width: 0,
  height: 0,
  getBoundingClientRect: () => ({ left: 0, top: 0, right: WIDTH, bottom: HEIGHT }),
  addEventListener: (type, handler) => listeners.set(`${id}:${type}`, handler),
  setAttribute() {},
  classList: { add() {}, remove() {} },
  ...extra,
});

const canvas = element("stage", { getContext: () => context2d });
const nodes = new Map([
  ["stage", canvas],
  ["hint", element("hint")],
  ["sound", element("sound")],
]);

// The app reads the clock for two things: frame deltas and how often a drag is
// allowed to drop food. Both go through `performance.now`, so a virtual clock
// makes the whole run reproducible and lets a hundred frames take a millisecond.
let clock = 0;
globalThis.performance = { now: () => clock };

const frames = [];
globalThis.window = {
  devicePixelRatio: 1,
  innerWidth: WIDTH,
  innerHeight: HEIGHT,
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  addEventListener() {},
  __koi: null,
};
globalThis.document = {
  hidden: false,
  getElementById: (id) => nodes.get(id) ?? null,
  addEventListener() {},
};
globalThis.requestAnimationFrame = (callback) => frames.push(callback) ?? frames.length;

await import("../dist/app.js");

const pond = () => globalThis.window.__koi;

function run(frameCount, startMs) {
  for (let i = 0; i < frameCount; i++) {
    clock = startMs + i * 16.7;
    const due = frames.splice(0, frames.length);
    if (due.length === 0) throw new Error("the app stopped asking for frames");
    for (const callback of due) callback(clock);
  }
}

run(90, 0);
assert.ok(pond(), "the app exposes the pond it is drawing");
assert.equal(pond().koi.toArray().length, 5, "five koi are drawn from the start");

const untouched = pond().eaten;

// A tap, then a slow drag across the pond — the two gestures the app offers.
const tap = listeners.get("stage:pointerdown");
const drag = listeners.get("stage:pointermove");
assert.ok(tap && drag, "the canvas listens for pointer events");
tap({ preventDefault() {}, clientX: 200, clientY: 430 });
run(60, 2000);

const afterTap = pond();
assert.equal(afterTap.fed, 1, "the tap became one crumb");
assert.ok(afterTap.rings.toArray().length >= 2, "the tap left a ring on the water");

for (let i = 0; i < 12; i++) {
  drag({ clientX: 160 + i * 6, clientY: 500 - i * 4 });
  run(12, 4000 + i * 200);
}
assert.ok(pond().fed >= 3, "the drag drops a trail of food");

run(1200, 6000);
assert.ok(pond().eaten > untouched, "the koi found and took food while the renderer ran");

// Everything a real 2D context offers, called at least once.
for (const name of ["fillRect", "arc", "ellipse", "stroke", "fill", "clip", "rotate", "setTransform"]) {
  assert.ok((draws.get(name) ?? 0) > 0, `the renderer calls ctx.${name}`);
}
assert.ok((draws.get("createRadialGradient") ?? 0) > 0, "the renderer paints gradients");

console.log(`  ok  made ${[...draws.values()].reduce((a, b) => a + b, 0)} 2D calls across ${draws.size} methods`);
console.log(`  ..  fed ${pond().fed} crumbs, the koi ate ${pond().eaten}`);
console.log("render smoke: the wiring holds.");
