/* Songbranch smoke test — runs the real wasm module in Node, with no browser.
 *
 * It answers the questions the build and QA care about, in order:
 *   does the module start, does the tree paint, does a tap NUDGE a bird
 *   (not kill it), does a pair answer, do the secrets answer, does the whole
 *   tree come back to rest, does a tall phone frame work, and does less
 *   motion mean less?
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

/* 1. the first frame paints a real scene, not a flat colour */
function boot(motion = 1, w = 176, h = 312) {
  globalThis.songbranchBoot(motion, w, h);
  for (let i = 0; i < 2; i++) globalThis.songbranchStep(1 / 60);
}
function grab(w = 176, h = 312) {
  const buf = new Uint8Array(w * h * 4);
  globalThis.songbranchFrame(buf);
  return buf;
}
boot();
const first = grab();
const colours = new Set();
let dark = 0, light = 0, alphaBad = 0;
for (let i = 0; i < first.length; i += 4) {
  colours.add(first[i] + ',' + first[i + 1] + ',' + first[i + 2]);
  const lum = (first[i] * 3 + first[i + 1] * 4 + first[i + 2] * 2) / 9;
  if (lum < 70) dark++; else if (lum > 150) light++;
  if (first[i + 3] !== 255) alphaBad++;
}
const N = 176 * 312;
if (colours.size < 40) fail(`first frame has only ${colours.size} colours`); else ok(`first frame: ${colours.size} colours`);
if (alphaBad) fail(`${alphaBad} pixels not opaque`); else ok('every pixel opaque');
if (dark < 0.35 * N) fail(`only ${(100 * dark / N).toFixed(0)}% of the frame is dusk-dark`); else ok(`dusk covers ${(100 * dark / N).toFixed(0)}%`);
if (light < 120) fail(`only ${light} lit pixels: the moon and birds are missing`); else ok(`lit accents: ${light} px (${(100 * light / N).toFixed(2)}%)`);

/* 2. deterministic: two loads paint exactly the same still frame */
const a = (boot(), grab()), b = (boot(), grab());
let same = a.length === b.length;
for (let i = 0; same && i < a.length; i++) if (a[i] !== b[i]) same = false;
if (!same) fail('two loads differ on the first frame'); else ok('the tree is identical on every load');

/* 3. a tap on a bird NUDGES: it sings, it stays on its branch, nothing dies */
boot();
const birdsBefore = globalThis.songbranchBirds();
const bx = globalThis.songbranchBirdX(0), by = globalThis.songbranchBirdY(0);
globalThis.songbranchTap(bx, by);
const kind = globalThis.songbranchEvent();
const hz = globalThis.songbranchNoteHz();
if (kind !== 1) fail(`tap on bird returned event ${kind}, wanted 1 (note)`); else ok('tap on a bird sings');
if (!(hz > 200 && hz < 1200)) fail(`note frequency ${hz} outside the birds' range`); else ok(`note at ${hz.toFixed(1)} Hz`);
if (globalThis.songbranchNotes() !== 1) fail('the song was not counted'); else ok('one song counted');
if (globalThis.songbranchBirds() !== birdsBefore) fail('a bird vanished'); else ok('the bird stays in the tree');
if (Math.hypot(globalThis.songbranchBirdX(0) - bx, globalThis.songbranchBirdY(0) - by) > 0.001) fail('the bird left its branch'); else ok('the bird stays on its branch');
globalThis.songbranchClear();
if (globalThis.songbranchEvent() !== 0) fail('clear did not clear the event'); else ok('event clears after the host answers');
for (let i = 0; i < 300; i++) globalThis.songbranchStep(1 / 60);
if (globalThis.songbranchSway() > 0.35) fail('the tree did not settle after a nudge'); else ok('the tree settles after a nudge');

/* 4. a tap on the trunk moves the whole tree, and it comes back to rest */
boot();
globalThis.songbranchTap(88, 250);
const k2 = globalThis.songbranchEvent();
if (k2 !== 2) fail(`tap on trunk returned event ${k2}, wanted 2 (knock)`); else ok('tap on the trunk knocks');
let swayAfter = 0;
for (let i = 0; i < 120; i++) { globalThis.songbranchStep(1 / 60); swayAfter = Math.max(swayAfter, globalThis.songbranchSway()); }
if (!(swayAfter > 0.6)) fail(`the trunk tap barely moved the tree (${swayAfter.toFixed(2)} px)`); else ok(`tree swayed ${swayAfter.toFixed(2)} px`);
for (let i = 0; i < 600; i++) globalThis.songbranchStep(1 / 60); // 10 s
const settled = globalThis.songbranchSway();
if (!(settled < 0.35)) fail(`tree did not settle: sway ${settled.toFixed(2)} after 10 s`); else ok(`tree settled to ${settled.toFixed(3)} px in 10 s`);

/* 5. a pair answers: the neighbour sings a beat after the first bird */
boot();
const before = globalThis.songbranchNotes();
globalThis.songbranchTap(globalThis.songbranchBirdX(0), globalThis.songbranchBirdY(0));
let answered = false;
for (let i = 0; i < 120; i++) {
  globalThis.songbranchStep(1 / 60);
  if (globalThis.songbranchNotes() > before + 1) answered = true;
}
if (!answered) fail('the pair never answered'); else ok('a pair trades a slow answer');

/* 6. less motion means measurably less movement, and the piece still works */
function peakSway(motion) {
  boot(motion);
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
boot(0.35);
globalThis.songbranchTap(globalThis.songbranchBirdX(0), globalThis.songbranchBirdY(0));
if (globalThis.songbranchEvent() !== 1) fail('reduced motion broke the birds'); else ok('birds still answer with less motion');
globalThis.songbranchClear();
for (let i = 0; i < 400; i++) globalThis.songbranchStep(1 / 60);
const still = globalThis.songbranchSway();
if (!(still < 0.35)) fail(`reduced motion did not settle (${still.toFixed(2)})`); else ok('reduced motion settles too');

/* 7. the moon keeps a secret */
boot();
globalThis.songbranchTap(globalThis.songbranchMoonX(), globalThis.songbranchMoonY());
if (globalThis.songbranchEvent() !== 5) fail(`tap on the moon returned ${globalThis.songbranchEvent()}, wanted 5`); else ok('the moon answers');
globalThis.songbranchClear();

/* 8. the nest keeps a secret, but only under a long press */
boot();
const nx = globalThis.songbranchNestX(), ny = globalThis.songbranchNestY();
if (globalThis.songbranchHold(nx, ny, 0.2) !== 0) fail('a short press on the nest answered too early'); else ok('a short press is only a touch');
if (globalThis.songbranchHold(nx, ny, 0.8) !== 6) fail('a long press did not wake the nest'); else ok('holding the nest wakes a chick');
globalThis.songbranchClear();

/* 9. a stroke through the leaves lifts the fireflies */
boot();
if (globalThis.songbranchSwipe(40, 300, 130, 296) !== 7) fail('a swipe did not lift the fireflies'); else ok('a swipe lifts the fireflies');
globalThis.songbranchClear();

/* 9b. a hidden melody: four different birds, tapped low to high */
boot();
let lastRising = 0;
for (let i = 0; i < 4; i++) {
  globalThis.songbranchTap(globalThis.songbranchBirdX(i), globalThis.songbranchBirdY(i));
  lastRising = globalThis.songbranchEvent();
  globalThis.songbranchClear();
}
if (lastRising !== 8) fail(`rising taps gave event ${lastRising}, wanted 8 (chime)`); else ok('a rising melody is remembered');
if (globalThis.songbranchDiscoveries() < 1) fail('the melody did not count as a discovery'); else ok('the melody counts as a discovery');

/* 10. a tall phone frame fills the viewport and still works */
const fw = globalThis.songbranchViewW ? globalThis.songbranchViewW() : 176;
const fh = globalThis.songbranchViewH ? globalThis.songbranchViewH() : 312;
// the app fits the viewport first: 390x844 becomes a 176x381 frame
globalThis.songbranchBoot(1, 176, 381);
const vw = globalThis.songbranchViewW(), vh = globalThis.songbranchViewH();
if (vw !== 176) fail(`portrait frame width ${vw}, wanted 176`); else ok('portrait frame keeps the art width');
if (!(vh >= 312)) fail(`portrait frame height ${vh} is smaller than the art`); else ok(`portrait frame grows to ${vh} px tall`);
const tall = grab(vw, vh);
if (tall.length !== vw * vh * 4) fail('the tall frame is the wrong size'); else ok(`tall frame paints ${vw}x${vh}`);
let tallLit = 0;
for (let i = 0; i < tall.length; i += 4) if ((tall[i] * 3 + tall[i + 1] * 4 + tall[i + 2] * 2) / 9 > 150) tallLit++;
if (tallLit < 120) fail('the tall frame is missing its birds'); else ok('the tall frame keeps the birds');
const tx = globalThis.songbranchBirdX(0), ty = globalThis.songbranchBirdY(0);
if (tx < 0 || tx > vw || ty < 0 || ty > vh) fail(`bird at ${tx},${ty} is outside the tall frame`); else ok('the birds sit inside the tall frame');
globalThis.songbranchTap(tx + 0.37, ty - 0.42);
if (globalThis.songbranchEvent() !== 1) fail('a fractional tap missed the bird in the tall frame'); else ok('fractional taps land in the tall frame');
globalThis.songbranchClear();

/* 11. big frame gaps are clamped, so a backgrounded tab returns calm */
boot();
globalThis.songbranchTap(88, 250);
globalThis.songbranchStep(8.0); // pretend the tab was hidden for eight seconds
const clamped = globalThis.songbranchSway();
if (clamped > 30) fail(`one huge step threw the tree (${clamped.toFixed(1)} px)`); else ok(`huge frame gap clamped (${clamped.toFixed(2)} px)`);
for (let i = 0; i < 300; i++) globalThis.songbranchStep(1 / 60);

console.log(process.exitCode ? '\nSMOKE FAILED' : '\nsmoke passed');
process.exit(process.exitCode || 0);
