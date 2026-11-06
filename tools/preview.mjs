// A real screenshot, without a browser.
//
// GitHub Actions has no browser here, and neither does my night sandbox, so the
// preview is not a screenshot of a window — it is the app's own drawing code,
// running against a real Skia-backed canvas (the optional @napi-rs/canvas
// package) with a virtual clock and a few staged taps. Everything in the image
// comes out of dist/app.js and the compiled pond; only the DOM around it is a
// stand-in.
//
//   npm install --no-save @napi-rs/canvas
//   node tools/preview.mjs preview.png 900 1600
//
// The committed preview.jpg was rendered that way and then shrunk with sharp
// (`sharp('preview.png').resize({width: 720}).jpeg({quality: 86}).toFile(...)`)
// because a 900x1600 PNG of soft gradients weighs about a megabyte.
//
// The scene is deterministic — the pond's randomness is a pure function of its
// own counters — so this file produces the same picture every time.

import { writeFileSync } from "node:fs";
import { createCanvas } from "@napi-rs/canvas";

const out = process.argv[2] ?? "preview.png";
const WIDTH = Number(process.argv[3] ?? 720);
const HEIGHT = Number(process.argv[4] ?? 1280);

const canvas = createCanvas(WIDTH, HEIGHT);
canvas.clientWidth = WIDTH;
canvas.clientHeight = HEIGHT;
canvas.getBoundingClientRect = () => ({ left: 0, top: 0, right: WIDTH, bottom: HEIGHT });

const listeners = new Map();
// The two listeners the app hangs on the element, and the class it toggles on
// the hint. Skia's canvas is a canvas, not a DOM node.
canvas.addEventListener = (type, handler) => listeners.set(`stage:${type}`, handler);
canvas.classList = { add() {}, remove() {} };
canvas.setAttribute = () => {};
const element = (id, extra = {}) => ({
  id,
  clientWidth: WIDTH,
  clientHeight: HEIGHT,
  getBoundingClientRect: () => ({ left: 0, top: 0, right: WIDTH, bottom: HEIGHT }),
  addEventListener: (type, handler) => listeners.set(`${id}:${type}`, handler),
  setAttribute() {},
  classList: { add() {}, remove() {} },
  ...extra,
});

const nodes = new Map([
  ["stage", canvas],
  ["hint", element("hint")],
  ["sound", element("sound")],
]);

let clock = 0;
globalThis.performance = { now: () => clock };
globalThis.window = {
  devicePixelRatio: 1,
  innerWidth: WIDTH,
  innerHeight: HEIGHT,
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  addEventListener() {},
};
globalThis.document = { hidden: false, getElementById: (id) => nodes.get(id) ?? null, addEventListener() {} };
const frames = [];
globalThis.requestAnimationFrame = (callback) => frames.push(callback) ?? frames.length;

await import("../dist/app.js");

function run(frameCount) {
  for (let i = 0; i < frameCount; i++) {
    clock += 1000 / 60;
    const due = frames.splice(0, frames.length);
    for (const callback of due) callback(clock);
  }
}

const tap = listeners.get("stage:pointerdown");
const drag = listeners.get("stage:pointermove");

// Let the koi spread out a little, feed them, and catch them gathering.
run(300);
tap({ preventDefault() {}, clientX: WIDTH * 0.42, clientY: HEIGHT * 0.44 });
run(40);
tap({ preventDefault() {}, clientX: WIDTH * 0.62, clientY: HEIGHT * 0.56 });
run(40);
for (let i = 0; i < 8; i++) {
  drag({ clientX: WIDTH * (0.36 + i * 0.03), clientY: HEIGHT * (0.52 + i * 0.01) });
  run(16);
}
run(240);

writeFileSync(out, canvas.toBuffer("image/png"));
const pond = globalThis.window.__koi;
console.log(
  `wrote ${out} (${WIDTH}x${HEIGHT}) — fed ${pond.fed}, eaten ${pond.eaten}, ${pond.rings.toArray().length} rings on the water`,
);
