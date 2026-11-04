// A headless minnow: no canvas, no browser, just the module. Checks that the
// pond boots, that a pebble ripples it, that a koi comes to look, that the
// water goes still again, and that a frame stays inside a phone's budget.
import { readFileSync } from 'node:fs';

const wasm = readFileSync(process.argv[2] || '.build/pond.wasm');
const { instance } = await WebAssembly.instantiate(wasm, {});
const e = instance.exports;
const S = () => new Float32Array(e.memory.buffer, e.state_ptr(), e.state_len());
const fail = (m) => { console.error('FAIL: ' + m); process.exit(1); };
const ok = (m) => console.log('ok   ' + m);
const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) e.frame(dt); };
const I = { time: 1, settle: 2, lantern: 4, taps: 5, water: 6, moss: 7, seeks: 8, kind: 9 };
const K = { base: 16, stride: 10, x: 0, y: 1, state: 5 };
const R = { base: 16 + 4 * 10, stride: 7, age: 2, life: 3 };

if (e.fb_len() !== 320 * 240 * 4) fail(`unexpected framebuffer: ${e.fb_len()}`);
ok(`framebuffer ${e.fb_len()} bytes (320x240 RGBA), state ${e.state_len()} floats`);

e.init(20261103);
let s = S();
if (s[0] !== 202611) fail(`bad signature: ${s[0]}`);
ok('pond opens');

// a pebble on the water: rings, a bloom, a koi turning, the frame settling
e.tap(150, 140);
step(1);
s = S();
if (s[I.water] !== 1) fail('the pebble did not land on water');
if (e.last_kind() !== 0) fail('the host was told to play the moss sound');
if (!(s[I.settle] > 0.9)) fail('the frame did not settle');
if (!(s[I.lantern] > 0.4)) fail('the lantern did not answer');
if (!(s[I.seeks] >= 1)) fail('no koi turned to look');
const ringing = (() => { let n = 0; for (let i = 0; i < 24; i++) if (s[R.base + i * R.stride + R.life] > 0) n++; return n; })();
if (ringing !== 3) fail(`expected 3 rings, got ${ringing}`);
ok('a pebble lands: 3 rings, a bloom, a seek, the lantern lifts');

// the nearest koi reaches it and circles
let arrived = false;
for (let i = 0; i < 900 && !arrived; i++) { e.frame(1 / 60); s = S(); for (let k = 0; k < 4; k++) if (s[K.base + k * K.stride + K.state] === 2) arrived = true; }
if (!arrived) fail('no koi reached the pebble');
ok('a koi arrives and circles the splash');

// a pebble on the moss: duller, no rings
const before = S()[I.moss];
e.tap(20, 18);
step(1);
s = S();
if (s[I.moss] !== before + 1) fail('the moss pebble was not counted');
if (e.last_kind() !== 1) fail('the host was not told it was moss');
ok('a pebble on the moss: a puff, no rings, a duller sound');

// it all comes back to rest
step(600);
s = S();
for (let i = 0; i < 24; i++) if (s[R.base + i * R.stride + R.age] < s[R.base + i * R.stride + R.life]) fail('a ripple never died');
if (s[I.settle] > 0.01) fail('the frame never settled');
ok('the water goes still again');

// nothing may ever be NaN — one would blank the canvas
step(1200);
s = S();
for (let i = 0; i < s.length; i++) if (!Number.isFinite(s[i])) fail(`state[${i}] is ${s[i]}`);
const fb = new Uint8ClampedArray(e.memory.buffer, e.fb_ptr(), e.fb_len());
let opaque = 0;
for (let i = 3; i < fb.length; i += 4) if (fb[i] === 255) opaque++;
if (opaque !== 320 * 240) fail(`only ${opaque} of ${320 * 240} pixels are opaque`);
ok('every pixel is opaque and every number is finite');

const t0 = performance.now();
step(600);
const ms = (performance.now() - t0) / 600;
if (ms > 16) fail(`${ms.toFixed(2)} ms/frame is too slow for 60 fps`);
ok(`${ms.toFixed(2)} ms/frame at 320x240 (${wasm.byteLength} bytes of wasm)`);
console.log('smoke passed: the pond holds together headlessly');
