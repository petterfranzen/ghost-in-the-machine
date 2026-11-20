'use strict';
/* The checks build.sh runs: every circle solvable, the gestures reach the rules,
 * the frame is painted and stays inside its budget. */
const fs = require('fs');
const path = require('path');

const wasm = fs.readFileSync(path.join(__dirname, '..', 'build', 'sim.wasm'));
const S = new WebAssembly.Instance(new WebAssembly.Module(wasm), {}).exports;

let failed = 0;
function check(name, ok, extra) {
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (extra ? '  ' + extra : ''));
  if (!ok) failed++;
}

function fresh(level) {
  S.init();
  S.seed(4242);
  S.resize(195, 422);
  S.setLevel(level);
  S.clearEvents();
}

function stoneXY(i) {
  return [S.stonePos(i, 0) / 16, S.stonePos(i, 1) / 16];
}

/* every circle can be woken by its own hint sequence */
function solveAll() {
  for (let lv = 0; lv <= 5; lv++) {
    fresh(lv);
    const n = S.stoneCount();
    let moves = 0, guard = 0;
    while (!S.allLit() && guard++ < 40) {
      const h = S.hintStone();
      if (h < 0) break;
      S.tapStone(h);
      moves++;
    }
    check(`circle ${lv} solvable (${n} stones, ${moves} moves)`, S.allLit() && S.solvable() === 1);
  }
}

/* a quick press is a tap; a long one asks for a hint */
function gestures() {
  fresh(1);
  const before = S.stats(0);
  const [x, y] = stoneXY(0);
  S.press(x, y);
  S.tick(0.12);
  S.release(x, y);
  check('quick press wakes a stone', S.stats(0) !== before, `lit ${before} -> ${S.stats(0)}`);

  fresh(1);
  S.clearEvents();
  S.press(x, y);
  for (let i = 0; i < 24; i++) S.tick(0.05);
  const ev = new Int32Array(S.memory.buffer, S.eventPtr(), S.nevents() * 3);
  let hint = false;
  for (let i = 0; i < S.nevents(); i++) if (ev[i * 3] === 7) hint = true;
  S.release(x, y);
  check('long press asks for a hint', hint);

  fresh(1);
  const lit0 = S.stats(0);
  S.press(x, y);
  S.tapStone(2);
  S.release(-1000, -1000);
  check('a drag does not tap twice', S.stats(0) !== lit0 && S.stats(0) !== -1);
}

/* the frame is painted, and painted fast enough for a phone */
function paint() {
  fresh(4);
  S.render();
  const st = S.stride(), p = S.rgbaPtr();
  const px = new Uint8Array(S.memory.buffer, p, st * 422);
  let lit = 0, sum = 0;
  for (let i = 0; i < px.length; i += 4) { sum += px[i] + px[i + 1] + px[i + 2]; if (px[i + 3]) lit++; }
  check('frame is opaque and painted', lit === 195 * 422, `${lit} px, mean ${(sum / (lit * 3)).toFixed(1)}`);
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 40; i++) S.render();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 40;
  check('render under 12 ms', ms < 12, ms.toFixed(2) + ' ms/frame');
}

/* the events table drives the page's sound; a tap must produce one */
function events() {
  fresh(0);
  S.clearEvents();
  S.tapStone(0);
  const n = S.nevents();
  const ev = new Int32Array(S.memory.buffer, S.eventPtr(), n * 3);
  check('tap emits an event', n > 0 && ev[0] === 1, `${n} events, first type ${ev[0]}`);
  S.clearEvents();
  check('clearEvents empties the queue', S.nevents() === 0);
}

solveAll();
gestures();
paint();
events();
if (failed) { console.log(`${failed} check(s) failed`); process.exit(1); }
console.log('all checks passed');
