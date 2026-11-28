// Pebblewick smoke check: six shelves, each one rollable and never solved at
// the start. It runs the real physics (matter.js) headless in Node and drives
// the pebble with the same tilt a thumb would give it: aim at the next unlit
// mote, then at the hollow, with a nudge when it wedges against something.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
globalThis.Matter = require("../vendor/matter.min.js");

const { LEVELS } = await import("../dist/app/levels.js");
const { Run } = await import("../dist/app/run.js");
const { BOARD, BALL_RADIUS, MOTE_REACH } = await import("../dist/app/types.js");

const FRAMES = 60 * 120;
const STUCK_FRAMES = 24;
const NUDGE_FRAMES = 34;
const NUDGE_ANGLE = 1.0;
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL  ${message}`);
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function inside(disc, p) {
  return dist(disc, p) < disc.r;
}

/** Aim at a point, as a unit tilt. */
function aim(from, to) {
  const d = dist(from, to);
  return d < 0.0001 ? { x: 0, y: 0 } : { x: (to.x - from.x) / d, y: (to.y - from.y) / d };
}

function rotate(t, angle) {
  return { x: t.x * Math.cos(angle) - t.y * Math.sin(angle), y: t.x * Math.sin(angle) + t.y * Math.cos(angle) };
}

/** The shelf's geometry has to hold together before the physics means anything. */
function audit(level, index) {
  const label = `shelf ${index + 1} ${level.name}`;
  for (const [what, p, r] of [
    ["start", level.start, BALL_RADIUS],
    ["hollow", level.hollow, level.hollow.r],
    ...level.motes.map((m, i) => [`mote ${i + 1}`, m, 0]),
  ]) {
    const pad = r + 2;
    if (p.x < pad || p.x > BOARD.w - pad || p.y < pad || p.y > BOARD.h - pad) fail(`${label}: ${what} is off the shelf at ${p.x},${p.y}`);
  }
  for (const m of level.mounds) {
    if (inside(m, level.start)) fail(`${label}: the pebble starts inside the bank at ${m.x},${m.y}`);
    if (inside(m, level.hollow)) fail(`${label}: the hollow is buried in the bank at ${m.x},${m.y}`);
  }
  for (const b of level.bumpers) {
    if (inside(b, level.start)) fail(`${label}: the pebble starts inside a post at ${b.x},${b.y}`);
  }
  if (level.motes.length === 0) fail(`${label}: no motes to roll over`);
  if (level.motes.some((m) => dist(m, level.start) < MOTE_REACH)) fail(`${label}: a mote is lit before the first tilt`);
  if (inside(level.hollow, level.start)) fail(`${label}: the pebble starts in the hollow`);
}

function roll(level) {
  const run = new Run(level);
  let anchor = run.read().ball;
  let stuck = 0;
  let nudge = 0;
  for (let frame = 0; frame < FRAMES; frame += 1) {
    const read = run.read();
    if (run.solved) return { frames: frame };
    const nextMote = level.motes.findIndex((_, k) => !read.lit[k]);
    const target = nextMote === -1 ? level.hollow : level.motes[nextMote];
    let tilt = aim(read.ball, target);
    if (nudge > 0) {
      tilt = rotate(tilt, NUDGE_ANGLE);
      nudge -= 1;
    }
    run.tilt(tilt);
    const moved = dist(run.read().ball, anchor);
    if (moved < 0.5 && run.read().speed < 0.05) {
      stuck += 1;
      if (stuck >= STUCK_FRAMES && nudge === 0) {
        nudge = NUDGE_FRAMES;
        stuck = 0;
      }
    } else {
      stuck = 0;
      anchor = run.read().ball;
    }
  }
  const read = run.read();
  return { frames: FRAMES, lit: read.lit, ball: read.ball };
}

LEVELS.forEach((level, index) => {
  audit(level, index);
  const result = roll(level);
  const label = `shelf ${index + 1} ${level.name}`;
  if (result.lit !== undefined) {
    const litCount = result.lit.filter(Boolean).length;
    fail(`${label}: not rolled home in ${FRAMES} frames (${litCount}/${level.motes.length} motes lit, stopped at ${result.ball.x.toFixed(0)},${result.ball.y.toFixed(0)})`);
    return;
  }
  console.log(`ok    ${label.padEnd(24)} ${level.motes.length} mote(s), rolled home in ${(result.frames / 60).toFixed(1)}s`);
});

if (failures.length > 0) {
  console.error(`${failures.length} check(s) failed`);
  process.exit(1);
}
console.log(`all ${LEVELS.length} shelves roll home`);
