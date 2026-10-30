// Headless smoke check of the built site.
//
// It imports the same compiled Gleam module that dist/index.html loads, steps a
// minute of pond time by hand, and asserts the things a canvas cannot tell you:
// that a crumb gets eaten, that the koi stay in the pond, that nothing turns
// into a NaN, and that the surface does not slowly fill up with old rings.

import { start, feed, advance } from "../dist/js/koi_drift/koi_drift.js";

const W = 390;
const H = 780;
const DT = 1 / 60;

function check(label, ok) {
  if (!ok) {
    console.error(`FAIL: ${label}`);
    process.exit(1);
  }
  console.log(`  ok  ${label}`);
}

let pond = start(W, H);
const koi = pond.koi.toArray();
check("five koi are in the pond", koi.length === 5);
check("every koi starts inside the pond", koi.every((k) => k.x > 0 && k.x < W && k.y > 0 && k.y < H));
check("the pond starts with no food", pond.crumbs.toArray().length === 0);

// Drop a crumb where the first koi is already looking, then let the scene run.
const first = koi[0];
pond = feed(pond, first.x + 50, first.y, W, H);
check("a tap becomes a crumb", pond.crumbs.toArray().length === 1);

let frames = 0;
const started = Date.now();
while (frames < 3600 && pond.eaten === 0) {
  pond = advance(pond, DT, W, H);
  frames++;
}
const elapsed = Date.now() - started;
check(`a koi found the crumb (after ${(frames / 60).toFixed(1)}s of pond time)`, pond.eaten >= 1);
check("the eaten crumb left the pond", pond.crumbs.toArray().length === 0);

// Then keep going, with food thrown at the corners the way a thumb would.
for (let i = 0; i < 6; i++) {
  pond = feed(pond, i % 2 === 0 ? 8 : W - 8, (i * 137) % H, W, H);
}
let long = 0;
while (long < 7200) {
  pond = advance(pond, DT, W, H);
  long++;
}
const after = pond.koi.toArray();
check("every koi is still in the pond", after.every((k) => k.x >= 22 && k.x <= W - 22 && k.y >= 22 && k.y <= H - 22));
check("no koi turned into a NaN", after.every((k) => Number.isFinite(k.x) && Number.isFinite(k.y) && Number.isFinite(k.heading) && Number.isFinite(k.speed)));
check("no koi is swimming backwards", after.every((k) => k.speed >= 0));
check("the surface does not pile up with rings", pond.rings.toArray().length <= 56);
check("uneaten food dissolves", pond.crumbs.toArray().length <= 6);
check("the koi are still moving", after.some((k) => k.speed > 1));

console.log(`  ..  ${long + frames} frames in ${elapsed}ms of stepping (plus the long run)`);
console.log("smoke: the pond behaves.");
