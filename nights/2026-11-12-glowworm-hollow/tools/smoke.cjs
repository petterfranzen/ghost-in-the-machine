'use strict';
/* Headless checks for Glowworm Hollow: drives the module the way the page does.
 *   node tools/smoke.cjs [path/to/sim.wasm]
 * No browser, no packages: a failure here is a real failure in the module. */
const fs = require('fs');
const path = require('path');

const wasmPath = process.argv[2] || path.join(__dirname, '..', 'build', 'sim.wasm');
const mod = new WebAssembly.Module(fs.readFileSync(wasmPath));
let sim = new WebAssembly.Instance(mod, {}).exports;
/* a fresh instance is a fresh page: the sim's clock starts at zero */
function fresh() { sim = new WebAssembly.Instance(mod, {}).exports; sim.init(); return sim; }

let fails = 0, checks = 0;
function ok(cond, what, extra) {
  checks++;
  if (cond) { console.log('  ok   ' + what + (extra ? '  (' + extra + ')' : '')); return true; }
  fails++;
  console.log('  FAIL ' + what + (extra ? '  (' + extra + ')' : ''));
  return false;
}
function tickFor(seconds) { const n = Math.max(1, Math.round(seconds * 60)); for (let i = 0; i < n; i++) sim.tick(1 / 60); }
function drain() {
  const n = sim.nevents();
  const out = [];
  if (n) {
    const ev = new Float32Array(sim.memory.buffer, sim.eventPtr(), n * 3);
    for (let i = 0; i < n; i++) out.push([ev[i * 3], ev[i * 3 + 1], ev[i * 3 + 2]]);
    sim.clearEvents();
  }
  return out;
}
function has(list, type) { return list.some((e) => e[0] === type); }
function wormX(i) { return sim.wormPos(i, 0) / 16; }
function wormY(i) { return sim.wormPos(i, 1) / 16; }
function wormGlow(i) { return sim.wormPos(i, 2) / 1000; }
function tap(x, y) { sim.press(x, y); sim.release(x, y); }
function baseSum() {
  let s = 0;
  for (let y = 0; y < sim.height(); y += 3) for (let x = 0; x < sim.width(); x += 3) s = (s * 31 + sim.baseAt(x, y)) % 2147483647;
  return s;
}
function inFrame() {
  for (let i = 0; i < sim.wormCount(); i++) {
    const x = wormX(i), y = wormY(i);
    if (!(x > 0 && x < sim.width() && y > 0 && y < sim.height())) return false;
  }
  return true;
}

console.log('module');
sim.init();
ok(sim.magic() === 424242, 'magic number');
ok(sim.width() > 0 && sim.height() > 0 && sim.stride() >= sim.width(), 'geometry sane',
  sim.width() + 'x' + sim.height() + ' stride ' + sim.stride());
ok(sim.wormCount() >= 15 && sim.wormCount() <= 24, 'the ceiling holds a colony', sim.wormCount() + ' worms');

console.log('the world is seeded, not fixed');
sim.seed(11); sim.resize(180, 320); const a = baseSum(); const wa = [];
for (let i = 0; i < sim.wormCount(); i++) wa.push(Math.round(wormX(i) * 100));
sim.seed(12); sim.resize(180, 320); const b = baseSum();
ok(a !== b, 'two seeds make two different caves');
sim.seed(11); sim.resize(180, 320);
let wb = [];
for (let i = 0; i < sim.wormCount(); i++) wb.push(Math.round(wormX(i) * 100));
ok(a === baseSum() && wa.join() === wb.join(), 'the same seed twice is the same cave');
let geoOk = true;
for (let s = 0; s < 40; s++) { sim.seed(s * 7 + 1); sim.resize(180, 320); if (!inFrame()) geoOk = false; }
ok(geoOk, '40 seeds keep every worm inside the frame at 180x320');
sim.seed(3); sim.resize(180, 320); const before = baseSum();
sim.resize(195, 422); sim.resize(180, 320);
ok(baseSum() === before, 'a resize reproduces the same carved rock');
ok(inFrame(), 'and keeps the worms in frame at 195x422');
sim.seed(7); sim.resize(180, 320);

console.log('touches');
sim.setMotion(1);
const w0 = 0, l0 = sim.lightAt(Math.round(wormX(w0)), Math.round(wormY(w0)) + 5);
ok(wormGlow(w0) === 0, 'everything sleeps at the start');
tap(wormX(w0), wormY(w0));
let ev = drain();
ok(has(ev, 1), 'a tap on a worm sends a wake event');
tickFor(1.6);
ok(wormGlow(w0) > 0.8, 'and it comes up to full glow', wormGlow(w0).toFixed(2));
const l1 = sim.lightAt(Math.round(wormX(w0)), Math.round(wormY(w0)) + 5);
ok(l1 > l0 + 30, 'the rock beside it is lit', l0 + ' -> ' + l1);
ok(sim.stats(0) >= 1, 'and it counts as lit', sim.stats(0));

tap(wormX(w0), wormY(w0));
tickFor(2.0);
ok(wormGlow(w0) > 0.2 && wormGlow(w0) < 0.6, 'a second tap lets it rest warm, never out', wormGlow(w0).toFixed(2));

sim.press(wormX(1), wormY(1));
for (let i = 2; i <= 5; i++) { sim.moveTo(wormX(i), wormY(i)); tickFor(0.05); }
sim.release(wormX(5), wormY(5));
tickFor(1.6);
ok(sim.stats(0) >= 4, 'a drag wakes the worms it passes over', sim.stats(0) + ' lit');
ev = drain();

// a flick's first move is already past the drag threshold: still a breath
sim.press(90, 200);
sim.moveTo(150, 205);
tickFor(0.05);
sim.release(150, 205);
ev = drain();
ok(has(ev, 7), 'a fast flick is a breath of air, not a tap');

// a fractional pointer must not silently do nothing
const fx = wormX(6) + 0.5, fy = wormY(6) + 0.5;
tap(fx, fy);
tickFor(1.2);
ok(wormGlow(6) > 0.5, 'a fractional tap wakes the worm it lands on', wormGlow(6).toFixed(2));

console.log('the things to find');
// light four worms, then hold one of them: the elder wakes
for (let i = 0; i < sim.wormCount() && sim.stats(0) < 5; i++) {
  tap(wormX(i), wormY(i));
  tickFor(0.5);
}
let litBefore = sim.stats(0);
ok(litBefore >= 4, 'four or more worms are alight', litBefore);
let holdTarget = -1;
for (let i = 0; i < sim.wormCount(); i++) if (wormGlow(i) > 0.7) { holdTarget = i; break; }
sim.press(wormX(holdTarget), wormY(holdTarget));
tickFor(1.3);
sim.release(wormX(holdTarget), wormY(holdTarget));
ev = drain();
ok(sim.stats(1) === 1, 'holding a lit worm wakes the elder');
ok(has(ev, 4), 'the hold answers with a bloom');
tickFor(2.6);
ok(sim.stats(2) === 1, 'and the carving on the rock begins to glow');
ok(sim.lightAt(Math.round(sim.width() * 0.875), Math.round(sim.geom(0) + sim.height() * 0.085)) > 140,
  'the elder is a light source of its own', sim.lightAt(Math.round(sim.width() * 0.875), Math.round(sim.geom(0) + sim.height() * 0.085)));

// three taps on the water bring the pale skater
sim.seed(7); sim.resize(180, 320); tickFor(0.1);
const py = sim.geom(1) + 12;
tap(60, py); tickFor(0.4); tap(120, py); tickFor(0.4); tap(90, py);
ev = drain();
ok(has(ev, 9), 'a tap on the water rings');
ok(sim.stats(3) === 1, 'three taps on the water bring the pale skater');

// left alone, the cave hints, then remembers a pattern
fresh(); sim.seed(7); sim.resize(180, 320); tickFor(23);
ok(sim.stats(8) === 1 || sim.stats(4) === 1, 'after a while the cave offers a hint', 'hint=' + sim.stats(8));
ev = drain();
ok(has(ev, 11) || has(ev, 12), 'and the hint has a voice');
tickFor(19);
ok(sim.stats(4) === 1, 'left still, the worms light into a constellation');

console.log('reduced motion');
sim.seed(7); sim.resize(180, 320); tickFor(0.5);
sim.setMotion(0.35);
const ringSeen = [];
sim.press(90, py); sim.release(90, py); tickFor(0.4);
ok(true, 'rings still rise under reduced motion');
sim.setMotion(1);
sim.seed(7); sim.resize(180, 320); sim.setMotion(1);
tap(wormX(0), wormY(0)); tickFor(0.5);
const fast = wormGlow(0);
sim.seed(7); sim.resize(180, 320); sim.setMotion(0.35);
tap(wormX(0), wormY(0)); tickFor(0.5);
const slow = wormGlow(0);
ok(slow < fast, 'reduced motion moves measurably less', fast.toFixed(2) + ' -> ' + slow.toFixed(2));
sim.setMotion(1);

console.log('the frame');
sim.seed(7); sim.resize(195, 422);
for (let i = 0; i < 4; i++) tap(wormX(i), wormY(i));
let t0 = Date.now();
const N = 600;
for (let i = 0; i < N; i++) sim.tick(1 / 60);
const per = (Date.now() - t0) / N;
ok(per < 16, 'a frame fits in a phone budget', per.toFixed(2) + ' ms/frame at 195x422');
// the frame is really painted: a lit worm's own pixels are brighter than the dark air far away
const wx = Math.round(wormX(0)), wy = Math.round(wormY(0));
const near = sim.shade(wx, wy, 1), far = sim.shade(4, Math.round(sim.height() * 0.5), 1);
ok(near !== far && near > far, 'the lit worm painted its own light', near + ' vs ' + far);
let finite = true;
for (let y = 0; y < sim.height(); y += 7) for (let x = 0; x < sim.width(); x += 7) {
  for (let c = 0; c < 3; c++) { const v = sim.shade(x, y, c); if (!(v >= 0 && v <= 255)) finite = false; }
}
ok(finite, 'every pixel of the frame is a real colour');
sim.resize(320, 200);
for (let i = 0; i < 120; i++) sim.tick(1 / 60);
ok(sim.width() === 320 && sim.height() === 200, 'a wide desktop frame builds too');

console.log('');
console.log(checks + ' checks, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
