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
const PAL_LEN = 35;
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
    'render', 'poll', 'amount', 'frame', 'stride', 'probe', 'pixel',
    'stroke', 'stroke_end', 'press', 'press_move', 'release', 'snowman', 'trail_n'];
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

  // ---- the fox faces the way he walks --------------------------------------
  // The sprite is drawn nose-to-the-right, so a right-to-left crossing has to
  // be mirrored or the fox walks backwards. Force one of each with the seed
  // and read his own pixels: the tail tip is a single palette-29 pixel, and
  // the ear is the topmost pixel of his coat — one trails, the other leads.
  function foxPixels(e) {
    const w = e.probe(1) | 0, h = e.probe(2) | 0;
    const b = buf(e, w * h);
    let tip = -1, tips = 0, ear = -1, minY = 1e9;
    for (let i = 0; i < b.length; i++) {
      const v = b[i], y = (i / w) | 0, x = i - y * w;
      if (v === 29) { tip = x; tips++; }
      if ((v === 27 || v === 28) && y < minY) { minY = y; ear = x; }
    }
    return { tip, tips, ear };
  }
  for (const [s, toTheLeft] of [[20261110, true], [222, false]]) {
    m.seed(s);
    m.resize(98, 211);
    stepFor(m, 20);                        // patience alone brings him out
    const side = m.probe(19), fx = m.probe(8), st = m.probe(7);
    ok(st !== 0, `seed ${s}: the fox is crossing the garden`);
    ok(toTheLeft ? side < 0 : side > 0,
      `seed ${s}: he walks ${toTheLeft ? 'right to left' : 'left to right'} (side ${side})`);
    m.render();
    const { tip, tips, ear } = foxPixels(m);
    ok(tips === 1, `seed ${s}: the tail tip is the one palette-29 pixel (${tips})`);
    ok(toTheLeft ? tip > fx : tip < fx,
      `seed ${s}: the tail trails behind him (tail ${tip} vs body ${fx.toFixed(1)})`);
    ok(toTheLeft ? ear < fx : ear > fx,
      `seed ${s}: his nose leads the way (ear ${ear} vs body ${fx.toFixed(1)})`);
  }

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

  // ---- a drag draws a trail that the snow fills back in ---------------------
  m.seed(20261110);
  m.resize(98, 211);
  const hz = m.probe(15);
  m.stroke(20.0, 160.0);
  ok(m.trail_n() === 1, `the first point of a drag draws one mark (${m.trail_n()})`);
  m.stroke(40.5, 160.25);
  const marks = m.trail_n();
  ok(marks >= 6, `a dragged groove is filled in between the points (${marks} marks)`);
  m.stroke_end();
  m.render();
  // the middle of the groove (no bloom was lifted there, so only ink can be)
  const drawn = m.pixel(31, 160);
  ok(drawn === 26, `the drawn groove draws as a footprint (index ${drawn})`);
  ok(m.pixel(31, 168) !== 26, 'the snow beside the groove is untouched');
  ok(colourOk(m) < 0, 'the drawn trail draws in palette colours');
  stepFor(m, 20);
  ok(m.trail_n() === 0, `the snow fills the drawing back in (${m.trail_n()} marks left)`);

  // ---- a swipe across the sky raises a flurry -------------------------------
  m.seed(20261110);
  m.resize(98, 211);
  ok(m.probe(21) === 0, 'the snow falls quietly to start');
  m.stroke(10.0, 20.0);
  ok(m.probe(21) > 0.9, `a swipe across the sky raises a flurry (${m.probe(21).toFixed(2)})`);
  ok(m.poll() === 5, 'the flurry is announced as event 5');
  ok(m.trail_n() === 0, 'a swipe in the sky draws nothing in the snow');
  m.render();
  ok(colourOk(m) < 0, 'the heavier fall still draws palette colours');
  m.stroke(60.0, 30.0);
  ok(m.probe(21) > 0.9, 'a second swipe keeps it going');
  stepFor(m, 5);
  ok(m.probe(21) === 0, `the flurry calms down by itself (${m.probe(21)})`);
  ok(hz > 0 && m.probe(15) === hz, 'the horizon is where it was (the flurry does not move the scene)');

  // ---- a long press rolls a snowball into a snowman -------------------------
  m.seed(20261110);
  m.resize(98, 211);
  m.press(50.0, 170.0);
  ok(m.probe(26) === 1, 'a long press starts a ball under the thumb');
  stepFor(m, 0.5);
  ok(m.probe(27) > 0.3 && m.probe(27) < 0.6, `the ball grows while it is held (${m.probe(27).toFixed(2)})`);
  ok(m.probe(12) > 0, `the ball gathers puffs of snow (${m.probe(12)})`);
  stepFor(m, 0.9);
  ok(m.probe(27) > 0.99, `held to the end, the ball is full size (${m.probe(27).toFixed(2)})`);
  m.render();
  ok(colourOk(m) < 0, 'the ball draws in palette colours');
  m.release();
  ok(m.poll() === 8, 'leaving the snowman is announced as event 8');
  ok(m.probe(28) === 1, `letting go leaves one snowman (${m.probe(28)})`);
  let sm = m.snowman(0, 0);
  ok(Math.abs(sm - 50.0) < 0.6, `the snowman stands where the ball was (${sm.toFixed(1)})`);
  ok(m.snowman(0, 2) === 1 && m.snowman(0, 3) > 0.9, 'he stands, and at full size');
  m.render();
  ok(colourOk(m) < 0, 'the snowman draws in palette colours');

  // the garden keeps three, and the oldest settles back in for a new one
  for (const x of [20.0, 32.0, 64.0]) { m.press(x, 172.0); stepFor(m, 1.3); m.release(); }
  ok(m.probe(28) === 3, `the garden keeps three snowmen (${m.probe(28)})`);
  m.press(80.0, 174.0);
  stepFor(m, 1.3);
  m.release();
  ok(m.probe(28) === 3, `a fourth is still three — one settled back in (${m.probe(28)})`);
  let slot80 = 0;
  for (let i = 0; i < 3; i++) if (Math.abs(m.snowman(i, 0) - 80.0) < 1.0) slot80 = i;
  ok(Math.abs(m.snowman(slot80, 0) - 80.0) < 0.6, `the new snowman stands where the fourth ball was (slot ${slot80})`);

  // a tap knocks one over, and he settles back into the snow
  while (m.poll() !== 0) { /* drain the placement announcements */ }
  const victim = slot80 === 1 ? 0 : 1;
  const kx = m.snowman(victim, 0), ky = m.snowman(victim, 1);
  m.tap(kx, ky - 4.0);
  ok(m.snowman(victim, 2) === 2, `tapping a snowman knocks him over (state ${m.snowman(victim, 2)})`);
  ok(m.poll() === 10, 'the topple is announced as event 10');
  m.render();
  ok(colourOk(m) < 0, 'a toppled snowman draws in palette colours');
  stepFor(m, 10);
  ok(m.snowman(victim, 2) === 0, `a toppled snowman settles back into the snow (state ${m.snowman(victim, 2)})`);

  // a tap that misses every prop still sends the walker
  m.seed(20261110);
  m.resize(98, 211);
  m.tap(60.0, 190.0);
  ok(Math.abs(m.probe(4) - 60.0) < 0.01, 'a tap on bare snow still sends the walker');

  // ---- the tree shakes, and the bird flutters to the other perch ------------
  m.seed(20261110);
  m.resize(98, 211);
  ok(m.probe(22) === 0, 'the bird starts on the tree');
  const bx0 = m.probe(23), by0 = m.probe(24);
  ok(bx0 > 4 && bx0 < 34 && by0 > 60 && by0 < 150, `the bird perches on the tree (${bx0.toFixed(1)}, ${by0.toFixed(1)})`);
  const puff0 = m.probe(12);
  m.tap(98 * 0.17, by0 + 4.0);
  ok(m.probe(12) > puff0 + 12, `tapping the branches shakes off a puff of snow (${m.probe(12)} puffs)`);
  ok(m.probe(22) === 1, 'the bird sets off');
  ok(m.poll() === 7, 'the bird leaving is announced as event 7');
  m.tap(98 * 0.17, by0 + 4.0);   // a second tap mid-flight only shakes the snow
  ok(m.probe(22) === 1 && m.poll() === 6, 'a tap while he is flying only shakes the snow (event 6)');
  stepFor(m, 1.7);
  ok(m.probe(22) === 2, `the bird reaches the gate (state ${m.probe(22)})`);
  const bx1 = m.probe(23), by1 = m.probe(24);
  ok(bx1 > 60 && Math.abs(by1 - (m.probe(15) - 13)) < 3.0, `he settles by the gate (${bx1.toFixed(1)}, ${by1.toFixed(1)})`);
  m.render();
  ok(colourOk(m) < 0, 'the bird draws in palette colours');
  m.tap(98 * 0.17, by0 + 4.0);
  stepFor(m, 1.7);
  ok(m.probe(22) === 0, 'a second tap brings him home to the tree');
  ok(Math.abs(m.probe(23) - bx0) < 0.7, `he is back on his branch (${m.probe(23).toFixed(1)})`);

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
