// A headless walk through the clearing: no canvas, no browser, just the wasm.
// It checks that the module loads, that a tap moves the walker, that a light is
// caught, and that carrying all three to the stone completes the quest.
import { readFileSync } from 'node:fs';

const wasm = readFileSync(process.argv[2] || '.build/game.wasm');
const { instance } = await WebAssembly.instantiate(wasm, {});
const e = instance.exports;

const N = 256;
const S = () => new Float32Array(e.memory.buffer, e.state_ptr(), N);
const I = { time: 0, cx: 1, cy: 2, tx: 3, ty: 4, facing: 5, walking: 6, bob: 7, sx: 8, sy: 9, glow: 10, gathered: 11, complete: 12, awake: 13, lights: 20 };
const L = { x: 0, y: 1, ph: 2, vx: 3, vy: 4, state: 5, glow: 6, seed: 7, stride: 8 };

const fail = (m) => { console.error('FAIL: ' + m); process.exit(1); };
const ok = (m) => console.log('ok   ' + m);
const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) e.step(dt); };

e.init();
let s = S();
if (s[I.cx] < 1 || s[I.cy] < 1) fail('walker not placed');
ok(`clearing opens: walker at ${s[I.cx].toFixed(1)}, ${s[I.cy].toFixed(1)}`);

const x0 = s[I.cx], y0 = s[I.cy];
e.tap(x0 + 50, y0 - 40);
step(30);
s = S();
if (!(s[I.cx] > x0 + 2 && s[I.cy] < y0 - 2)) fail('tap did not move the walker');
if (s[I.walking] !== 1) fail('walking flag not set');
ok(`tap walks: ${x0.toFixed(1)},${y0.toFixed(1)} -> ${s[I.cx].toFixed(1)},${s[I.cy].toFixed(1)}`);

// walk straight onto a light and stop there
const lx = s[I.lights + L.x], ly = s[I.lights + L.y];
s[I.cx] = lx; s[I.cy] = ly + 2; s[I.tx] = lx; s[I.ty] = ly + 2;
step(4);
s = S();
if (s[I.lights + L.state] !== 1) fail('light was not caught');
ok('a light is caught and starts following');

// carry all three to the stone
for (let i = 0; i < 3; i++) s[I.lights + i * L.stride + L.state] = 1;
s[I.cx] = s[I.sx]; s[I.cy] = s[I.sy]; s[I.tx] = s[I.sx]; s[I.ty] = s[I.sy];
step(400);
s = S();
if (s[I.gathered] !== 3) fail(`gathered=${s[I.gathered]}, expected 3`);
if (s[I.complete] !== 1) fail('quest did not complete');
if (s[I.awake] < 0.95) fail('stone did not wake');
ok('three lights at the stone: the clearing completes');

// the whole state must stay finite — one NaN would freeze the drawing
for (let i = 0; i < N; i++) if (!Number.isFinite(s[i])) fail(`state[${i}] is ${s[i]}`);
ok('every state value is finite');

const bytes = wasm.byteLength;
console.log(`smoke passed: ${bytes} bytes of wasm, quest reachable end to end`);
