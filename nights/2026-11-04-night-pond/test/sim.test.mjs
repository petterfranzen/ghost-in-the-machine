/* Night Pond — the pond without a browser.
 *
 * Steps the ReScript simulation directly, so the parts that actually matter
 * (a tap becoming ripples, a seed finding its lantern, koi staying in the
 * water, the pond waking exactly once) are checked by `./build.sh` and by
 * anyone running `node test/sim.test.mjs`. */

import * as Pond from "../src/Pond.res.js";

const DT = 1 / 60;

let passed = 0;
const failures = [];

function check(name, ok, detail = "") {
  if (ok) {
    passed++;
  } else {
    failures.push(`${name}${detail ? " — " + detail : ""}`);
  }
}

function run(state, seconds) {
  const steps = Math.round(seconds / DT);
  for (let i = 0; i < steps; i++) Pond.step(state, DT);
}

const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

/* --- a pond at rest ---------------------------------------------------- */
{
  const s = Pond.make();
  run(s, 1.0);
  const st = JSON.parse(Pond.read(s));
  check("four koi", st.koi.length === 4, `got ${st.koi.length}`);
  check("three sleeping lanterns", st.lit === 0, `lit ${st.lit}`);
  check("not complete", st.complete === false);
  check("no ripples yet", st.ripples === 0, `got ${st.ripples}`);
  let inside = true;
  for (const k of st.koi) if (!Pond.inWater(k.x, k.y)) inside = false;
  check("koi start in the water", inside);
}

/* --- a tap is a tap ---------------------------------------------------- */
{
  const s = Pond.make();
  Pond.tap(s, 120, 120);
  const st = JSON.parse(Pond.read(s));
  check("a tap makes three rings", st.ripples === 3, `got ${st.ripples}`);
  check("a tap drops one seed", st.seeds === 1, `got ${st.seeds}`);
  check("a tap settles the scene", near(st.settle, 1.0));
  const ev = Pond.drainEvents(s);
  check("a tap on water plops", ev.includes("plop"), ev.join(","));
  check("events drain once", Pond.drainEvents(s).length === 0);
}

/* --- a tap on the bank is quieter, and drops nothing ------------------- */
{
  const s = Pond.make();
  Pond.tap(s, 3, 3);
  const st = JSON.parse(Pond.read(s));
  check("a bank tap drops no seed", st.seeds === 0, `got ${st.seeds}`);
  check("a bank tap still ripples a little", st.ripples === 3);
  check("a bank tap thuds", Pond.drainEvents(s).includes("thud"));
  check("out-of-bounds taps are clamped", Pond.inWater(3, 3) === false);
  Pond.tap(s, -50, 900);
  check("a wild tap is still a tap", JSON.parse(Pond.read(s)).taps === 2);
}

/* --- one tap, one lantern waking -------------------------------------- */
{
  const s = Pond.make();
  const t0 = JSON.parse(Pond.read(s)).lanterns;
  Pond.tap(s, t0[0].x, t0[0].y - 12);
  run(s, 18);
  const st = JSON.parse(Pond.read(s));
  check("a seed reaches its lantern", st.lit === 1, `lit ${st.lit}`);
  check("the lantern warms up", st.lanterns[0].awake > 0.9, `awake ${st.lanterns[0].awake.toFixed(2)}`);
  check("the seed is gone", st.seeds === 0, `seeds ${st.seeds}`);
  check("ripples fade away", st.ripples === 0, `ripples ${st.ripples}`);
}

/* --- the whole pond, woken in three taps ------------------------------ */
{
  const s = Pond.make();
  const start = JSON.parse(Pond.read(s)).lanterns;
  const wakes = [];
  for (const l of start) {
    Pond.tap(s, l.x + 6, l.y + 6);
    run(s, 14);
  }
  for (const ev of Pond.drainEvents(s)) if (ev === "wake") wakes.push(ev);
  const st = JSON.parse(Pond.read(s));
  check("three taps wake three lanterns", st.lit === 3, `lit ${st.lit}`);
  check("the pond is awake", st.complete === true);
  check("each lantern wakes once", wakes.length === 3, `events ${wakes.length}`);
}

/* --- a second seed for a lantern that is already lit just dissolves --- */
{
  const s = Pond.make();
  const l = JSON.parse(Pond.read(s)).lanterns[1];
  Pond.tap(s, l.x, l.y);
  Pond.tap(s, l.x + 4, l.y + 4);
  check("two taps, two seeds", JSON.parse(Pond.read(s)).seeds === 2);
  Pond.drainEvents(s);
  run(s, 20);
  const after = JSON.parse(Pond.read(s));
  const wakes = Pond.drainEvents(s).filter(e => e === "wake");
  check("both seeds settle on one lantern", after.lit === 1, `lit ${after.lit}`);
  check("the extra seed dissolves quietly", after.seeds === 0, `seeds ${after.seeds}`);
  check("one lantern, one chime", wakes.length === 1, `wakes ${wakes.length}`);
}

/* --- koi stay in the pond, for a long while ---------------------------- */
{
  const s = Pond.make();
  let strayed = 0;
  let maxSpeed = 0;
  let prev = JSON.parse(Pond.read(s)).koi;
  for (let i = 0; i < 60 * 60; i++) {
    Pond.step(s, DT);
    if (i % 20 === 0) {
      const st = JSON.parse(Pond.read(s));
      for (const k of st.koi) if (!Pond.inWater(k.x, k.y)) strayed++;
    }
    if (i % 60 === 0) {
      const now = JSON.parse(Pond.read(s)).koi;
      for (let j = 0; j < now.length; j++) {
        const d = Math.hypot(now[j].x - prev[j].x, now[j].y - prev[j].y);
        maxSpeed = Math.max(maxSpeed, d);
      }
      prev = now;
    }
  }
  check("koi never leave the water", strayed === 0, `${strayed} strays`);
  check("koi glide, they don't bolt", maxSpeed < 40, `fastest ${maxSpeed.toFixed(1)} px/s`);
  const st = JSON.parse(Pond.read(s));
  check("sixty idle seconds make no lanterns", st.lit === 0, `lit ${st.lit}`);
}

/* --- the pond starts the same way every time -------------------------- */
{
  const a = Pond.make();
  const b = Pond.make();
  run(a, 6);
  run(b, 6);
  check("the pond is deterministic", Pond.read(a) === Pond.read(b));
}

/* --- a long session stays bounded ------------------------------------- */
{
  const s = Pond.make();
  for (let i = 0; i < 40; i++) {
    Pond.tap(s, 30 + (i * 53) % 250, 40 + (i * 37) % 150);
    run(s, 0.9);
  }
  const st = JSON.parse(Pond.read(s));
  check("ripples are capped", st.ripples < 60, `ripples ${st.ripples}`);
  check("motes are capped", st.motes < 120, `motes ${st.motes}`);
  check("everything stays on screen", st.koi.every(k => k.x > 0 && k.x < 320 && k.y > 0 && k.y < 320));
}

if (failures.length) {
  console.error(`FAIL (${failures.length})`);
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log(`ok — ${passed} checks: rest, taps, wake, koi, determinism`);
