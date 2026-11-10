// Smoke test for the Snow Garden simulation. Drives the compiled module in
// plain Node — no browser — so the rules can be checked in a second:
//
//   node tools/smoke.cjs build/snow_garden.wasm
//
// It checks the exported surface, the geometry of the drawn garden, that taps
// land (including fractional ones), the lantern and the bench, the fox that
// comes when the garden is left alone, the reduced-motion variant, that the
// frame buffer only ever holds known palette indices, and the frame budget.
const fs = require('node:fs');

const file = process.argv[2] || 'build/snow_garden.wasm';
const bytes = fs.readFileSync(file);
const PAL_LEN = 33;
const MAGIC = 6220001;

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };

const sim = (async () => {
  const { instance } = await WebAssembly.instantiate(bytes, {});
  return instance.exports;
})();

function buf(e, n) {
  const w = e.probe(1) | 0, h = e.probe(2) | 0, st = e.stride();
  const src = new Uint8Array(e.memory.buffer, e.frame(), st * h);
  if (st === w) return src.subarray(0, n);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) out.set(src.subarray(y * st, y * st + w), y * w);
  return out;
}

function fnv(e) {
  const w = e.probe(1) | 0, h = e.probe(2) | 0;
  const b = buf(e, w * h);
  let x = 2166136261;
  for (let i = 0; i < b.length; i++) { x ^= b[i]; x = Math.imul(x, 16777619); }
  return x >>> 0;
}

function stepFor(e, seconds, dt) {
  dt = dt || 1 / 60;
  for (let t = 0; t < seconds; t += dt) e.step(dt);
}

function colourOk(e) {
  const w = e.probe(1) | 0, h = e.probe(2) | 0;
  const b = buf(e, w * h);
  for (let i = 0; i < b.length; i++) if (b[i] >= PAL_LEN) return b[i];
  return -1;
}

(async () => {
  const m = await sim;

  // ---- the exported surface ------------------------------------------------
  const need = ['memory', 'magic', 'seed', 'resize', 'set_reduce', 'tap', 'step',
    'render', 'poll', 'amount', 'frame', 'stride', 'probe', 'pixel'];
  for (const f of need) ok(typeof m[f] === 'function' || (f === 'memory' && m.memory), `exports.${f}`);
  ok(m.magic() === MAGIC, `magic number survives f32 (${m.magic()})`);

  // ---- the phone viewport and the desktop viewport -------------------------
  for (const [w, h, label] of [[98, 211, 'phone 390x844 @4px'], [160, 100, 'desktop 1280x800 @8px'], [24, 40, 'the smallest size the host can send']]) {
    m.seed(20261110);
    m.resize(w, h);
    m.render();
    ok(Math.abs(m.probe(1) - w) < 0.001 && Math.abs(m.probe(2) - h) < 0.001, `${label}: resize holds its size`);
    const bad = colourOk(m);
    ok(bad < 0, `${label}: every drawn pixel is a known palette index` + (bad >= 0 ? ` (saw ${bad})` : ''));
    const sky = m.pixel((w / 2) | 0, (h * 0.06) | 0);
    const ground = m.pixel((w / 2) | 0, (h * 0.96) | 0);
    ok(sky >= 1 && sky <= 5, `${label}: the top of the frame is sky (index ${sky})`);
    ok(ground >= 8 && ground <= 13, `${label}: the foot of the frame is snow (index ${ground})`);
  }

  // ---- a tap sends the walker there ----------------------------------------
  m.seed(20261110);
  m.resize(98, 211);
  const startX = m.probe(3);
  m.tap(70.5, 150.25);                       // fractional on purpose
  ok(Math.abs(m.probe(4) - 70.5) < 0.001, `a fractional tap sets the target exactly (${m.probe(4)})`);
  ok(m.probe(12) > 0, `the tap lifts a bloom of snow (${m.probe(12)} puffs)`);
  m.step(1 / 60);
  ok(Math.abs(m.probe(11)) > 0.001, `the whole scene gives on a tap (settle ${m.probe(11).toFixed(3)})`);
  let settled = 0;
  for (let i = 0; i < 240; i++) { m.step(1 / 60); if (m.amount() === 0) { settled = i; break; } }
  ok(settled > 0 && settled < 150, `the give comes back to rest (${(settled / 60).toFixed(2)} s)`);
  stepFor(m, 5);
  ok(Math.abs(m.probe(3) - 70.5) < 0.6, `the walker arrives (${startX.toFixed(1)} -> ${m.probe(3).toFixed(1)})`);
  ok(m.probe(5) === 0, 'the walker stops walking on arrival');
  ok(m.probe(10) >= 3, `the walk left footprints (${m.probe(10)})`);
  m.render();
  ok(colourOk(m) < 0, 'footprints draw in palette colours');
  stepFor(m, 30);
  ok(m.probe(10) === 0, `the footprints fill in and go (${m.probe(10)} left after 30 s)`);
  stepFor(m, 4);
  ok(m.probe(12) === 0, `the lifted snow settles and clears (${m.probe(12)} left)`);

  // ---- the lantern, the bench, and the fox ---------------------------------
  m.seed(20261110);
  m.resize(98, 211);
  const lx = m.probe(16), ly = m.probe(17);
  m.tap(lx + 0.4, ly - 0.3);
  ok(m.probe(6) === 1, 'the lantern lights from a tap on the post');
  ok(m.poll() === 3, 'lighting the lantern is announced as event 3');
  m.render();
  const core = m.pixel(Math.round(lx), Math.round(ly));
  ok(core === 16 || core === 24, `the lit lamp draws its bright core (index ${core})`);
  const before = m.pixel(Math.round(lx) + 12, Math.round(m.probe(18)));
  m.tap(lx + 0.4, ly - 0.3);
  ok(m.probe(6) === 0 && m.poll() === 4, 'a second tap dims it again (event 4)');
  m.render();
  ok(m.pixel(Math.round(lx) + 12, Math.round(m.probe(18))) <= before + 1, 'the warm pool goes with the light');

  m.seed(20261110);
  m.resize(98, 211);
  m.tap(98 * 0.42, 200);                     // walk to the bench, then tap it
  stepFor(m, 4);
  m.tap(98 * 0.42, m.probe(18));
  ok(m.probe(7) === 1, 'the bench calls the fox when the garden is empty');
  stepFor(m, 4);
  ok(m.probe(7) >= 1, 'the fox keeps crossing');
  m.render();
  ok(colourOk(m) < 0, 'the fox draws in palette colours');

  // patience alone is enough, too
  m.seed(20261110);
  m.resize(98, 211);
  ok(m.probe(7) === 0, 'the garden starts without a fox');
  stepFor(m, 16);
  ok(m.probe(7) === 1, `standing still for 16 s brings the fox (state ${m.probe(7)})`);
  stepFor(m, 60);
  ok(m.probe(7) === 0, 'the fox goes on his way again');
  ok(m.poll() === 2, 'the fox announced himself once');

  // ---- reduced motion ------------------------------------------------------
  m.seed(20261110);
  m.resize(98, 211);
  m.set_reduce(1);
  ok(m.probe(14) === 1, 'the reduce flag reaches the simulation');
  m.tap(70.5, 150.25);
  ok(m.amount() === 0, 'reduced motion: the whole-scene give stays at rest');
  let peak = 0;
  for (let i = 0; i < 60; i++) { m.step(1 / 60); peak = Math.max(peak, Math.abs(m.probe(3) - 30)); }
  ok(peak < 9, `reduced motion: the walker moves a shorter way in the same second (${peak.toFixed(1)} px)`);
  stepFor(m, 30);
  ok(Math.abs(m.probe(3) - 70.5) < 0.6, 'reduced motion: the walker still gets there');
  m.render();
  ok(colourOk(m) < 0, 'reduced motion: the frame still draws');
  m.seed(20261110);
  m.resize(98, 211);
  m.set_reduce(0);
  let fullPeak = 0;
  m.tap(70.5, 150.25);
  for (let i = 0; i < 60; i++) { m.step(1 / 60); fullPeak = Math.max(fullPeak, Math.abs(m.probe(3) - 30)); }
  ok(peak < fullPeak * 0.65, `reduced motion is measurably smaller (${peak.toFixed(1)} vs ${fullPeak.toFixed(1)} px)`);

  // ---- the same seed, the same garden --------------------------------------
  m.seed(111);
  m.resize(98, 211);
  m.render();
  const a = fnv(m);
  m.resize(160, 100);
  m.resize(98, 211);
  m.render();
  ok(fnv(m) === a, 'the same seed and size redraw the same garden after a resize');
  m.seed(222);
  m.resize(98, 211);
  m.render();
  ok(fnv(m) !== a, 'a different seed draws a different sky');

  // ---- the frame budget ----------------------------------------------------
  m.seed(20261110);
  m.resize(98, 211);
  const t0 = process.hrtime.bigint();
  const N = 600;
  for (let i = 0; i < N; i++) { m.step(1 / 60); m.render(); }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / N;
  ok(ms < 16, `the frame budget: ${ms.toFixed(2)} ms/step+render over ${N} frames (want < 16)`);

  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall good');
  process.exit(fails.length ? 1 : 0);
})().catch(err => { console.error('smoke test blew up:', err); process.exit(1); });
