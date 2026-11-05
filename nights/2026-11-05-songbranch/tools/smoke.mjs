/* Songbranch smoke test — runs the real wasm module in Node, with no browser.
 *
 * It answers the questions the build and QA care about, in order:
 *   does the module start, does the tree paint, does a tap reach a bird,
 *   does the whole tree come back to rest, and does less motion mean less?
 *
 *   node tools/smoke.mjs .build/game.wasm [path/to/wasm_exec.js]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const [wasmPath, execArg] = process.argv.slice(2);
if (!wasmPath) {
  console.error('usage: node tools/smoke.mjs <game.wasm> [wasm_exec.js]');
  process.exit(2);
}
const require = createRequire(import.meta.url);
globalThis.require = require;

const execPath = execArg || path.join(process.env.GOROOT || '', 'lib/wasm/wasm_exec.js');
eval(fs.readFileSync(execPath, 'utf8'));

const go = new globalThis.Go();
const { instance } = await WebAssembly.instantiate(fs.readFileSync(wasmPath), go.importObject);
go.run(instance).catch(() => {});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (msg) => { console.error('FAIL ' + msg); process.exitCode = 1; };
const ok = (msg) => console.log('ok   ' + msg);

for (let i = 0; i < 200 && !globalThis.songbranchReady; i++) await wait(10);
if (!globalThis.songbranchReady) { fail('module did not become ready'); process.exit(1); }
ok('module ready');

const W = 176, H = 312;

function render(times = 1, tap = null, motion = 1) {
  globalThis.songbranchBoot(motion);
  if (tap) globalThis.songbranchTap(tap[0], tap[1]);
  for (let i = 0; i < times; i++) globalThis.songbranchStep(1 / 60);
  const buf = new Uint8Array(W * H * 4);
  globalThis.songbranchFrame(buf);
  return buf;
}

/* 1. the first frame paints a real scene, not a flat colour */
const first = render(2);
const colours = new Set();
let dark = 0, light = 0, alphaBad = 0;
for (let i = 0; i < first.length; i += 4) {
  colours.add(first[i] + ',' + first[i + 1] + ',' + first[i + 2]);
  const lum = (first[i] * 3 + first[i + 1] * 4 + first[i + 2] * 2) / 9;
  if (lum < 70) dark++; else if (lum > 150) light++;
  if (first[i + 3] !== 255) alphaBad++;
}
if (colours.size < 40) fail(`first frame has only ${colours.size} colours`); else ok(`first frame: ${colours.size} colours`);
if (alphaBad) fail(`${alphaBad} pixels not opaque`); else ok('every pixel opaque');
if (dark < 0.35 * W * H) fail(`only ${(100 * dark / (W * H)).toFixed(0)}% of the frame is dusk-dark`); else ok(`dusk covers ${(100 * dark / (W * H)).toFixed(0)}%`);
if (light < 120) fail(`only ${light} lit pixels: the moon and birds are missing`); else ok(`lit accents: ${light} px (${(100 * light / (W * H)).toFixed(2)}%)`);
const skyMean = (() => { let s2 = 0, n = 0; for (let y = 0; y < 190; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; s2 += (first[i] * 3 + first[i + 1] * 4 + first[i + 2] * 2) / 9; n++; } return s2 / n; })();
if (skyMean > 120) fail(`the sky above the hills averages ${skyMean.toFixed(0)}: too bright for dusk`); else ok(`dusk sky averages ${skyMean.toFixed(0)}/255`);

/* 2. deterministic: two loads paint exactly the same still frame */
const a = render(1), b = render(1);
let same = a.length === b.length;
for (let i = 0; same && i < a.length; i++) if (a[i] !== b[i]) same = false;
if (!same) fail('two loads differ on the first frame'); else ok('the tree is identical on every load');

/* 3. a tap on a bird sings a note in the pentatonic scale */
const bx = globalThis.songbranchBirdX(0), by = globalThis.songbranchBirdY(0);
globalThis.songbranchBoot(1);
globalThis.songbranchTap(bx, by);
const kind = globalThis.songbranchEvent();
const hz = globalThis.songbranchNoteHz();
if (kind !== 1) fail(`tap on bird returned event ${kind}, wanted 1 (note)`); else ok('tap on a bird sings');
if (!(hz > 200 && hz < 900)) fail(`note frequency ${hz} outside the birds' range`); else ok(`note at ${hz.toFixed(1)} Hz`);
if (globalThis.songbranchNotes() !== 1) fail('the song was not counted'); else ok('one song counted');
globalThis.songbranchClear();
if (globalThis.songbranchEvent() !== 0) fail('clear did not clear the event'); else ok('event clears after the host answers');

/* 4. a tap on the trunk moves the whole tree, and it comes back to rest */
globalThis.songbranchBoot(1);
globalThis.songbranchTap(88, 250);
const k2 = globalThis.songbranchEvent();
if (k2 !== 2) fail(`tap on trunk returned event ${k2}, wanted 2 (knock)`); else ok('tap on the trunk knocks');
let swayAfter = 0;
for (let i = 0; i < 120; i++) { globalThis.songbranchStep(1 / 60); swayAfter = Math.max(swayAfter, globalThis.songbranchSway()); }
if (!(swayAfter > 0.6)) fail(`the trunk tap barely moved the tree (${swayAfter.toFixed(2)} px)`); else ok(`tree swayed ${swayAfter.toFixed(2)} px`);
for (let i = 0; i < 600; i++) globalThis.songbranchStep(1 / 60); // 10 s
const settled = globalThis.songbranchSway();
if (!(settled < 0.35)) fail(`tree did not settle: sway ${settled.toFixed(2)} after 10 s`); else ok(`tree settled to ${settled.toFixed(3)} px in 10 s`);

/* 5. a bird tapped again hops, and lands back on a branch */
globalThis.songbranchBoot(1);
globalThis.songbranchTap(globalThis.songbranchBirdX(1), globalThis.songbranchBirdY(1));
if (globalThis.songbranchFlying() < 1) fail('the bird did not leave its branch'); else ok('the bird hops');
for (let i = 0; i < 120; i++) globalThis.songbranchStep(1 / 60); // 2 s
if (globalThis.songbranchFlying() !== 0) fail('the bird never landed'); else ok('the bird lands within 2 s');

/* 6. less motion means measurably less movement, and the piece still works */
function peakSway(motion) {
  globalThis.songbranchBoot(motion);
  globalThis.songbranchTap(88, 250);
  let peak = 0;
  for (let i = 0; i < 90; i++) {
    globalThis.songbranchStep(1 / 60);
    peak = Math.max(peak, globalThis.songbranchSway());
  }
  return peak;
}
const full = peakSway(1), reduced = peakSway(0.35);
if (!(reduced < full * 0.65)) fail(`reduced motion sway ${reduced.toFixed(2)} vs full ${full.toFixed(2)}`); else ok(`reduced motion: ${reduced.toFixed(2)} px vs ${full.toFixed(2)} px`);
globalThis.songbranchBoot(0.35);
globalThis.songbranchTap(globalThis.songbranchBirdX(0), globalThis.songbranchBirdY(0));
if (globalThis.songbranchEvent() !== 1) fail('reduced motion broke the birds'); else ok('birds still answer with less motion');
globalThis.songbranchClear();
for (let i = 0; i < 400; i++) globalThis.songbranchStep(1 / 60);
const still = globalThis.songbranchSway();
if (!(still < 0.35)) fail(`reduced motion did not settle (${still.toFixed(2)})`); else ok('reduced motion settles too');

/* 7. big frame gaps are clamped, so a backgrounded tab returns calm */
globalThis.songbranchBoot(1);
globalThis.songbranchTap(88, 250);
globalThis.songbranchStep(8.0); // pretend the tab was hidden for eight seconds
const clamped = globalThis.songbranchSway();
if (clamped > 30) fail(`one huge step threw the tree (${clamped.toFixed(1)} px)`); else ok(`huge frame gap clamped (${clamped.toFixed(2)} px)`);
for (let i = 0; i < 300; i++) globalThis.songbranchStep(1 / 60);

console.log(process.exitCode ? '\nSMOKE FAILED' : '\nsmoke passed');
process.exit(process.exitCode || 0);
