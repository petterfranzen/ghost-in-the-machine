// Render frames headlessly, with no browser and no canvas, and dump the raw
// RGBA so a frame can be looked at as an image. Also times the render loop —
// this is the cheapest way to catch a slow frame before it reaches a phone.
//   node tools/frame.mjs .build/pond.wasm .build/frame.raw [script]
import { readFileSync, writeFileSync } from 'node:fs';

const [, , wasmPath, outPath = '.build/frame.raw', script = 'default'] = process.argv;
const { instance } = await WebAssembly.instantiate(readFileSync(wasmPath), {});
const e = instance.exports;

const W = 320, H = 240;
const px = () => new Uint8ClampedArray(e.memory.buffer, e.fb_ptr(), e.fb_len());
const S = () => new Float32Array(e.memory.buffer, e.state_ptr(), e.state_len());

e.init(20261103);
if (script === 'tap') {
  e.tap(120.0, 150.0);           // one pebble on the water
  for (let i = 0; i < 34; i++) e.frame(1 / 60);
} else if (script === 'moss') {
  e.tap(24.0, 20.0);             // one pebble on the moss
  for (let i = 0; i < 26; i++) e.frame(1 / 60);
} else if (script === 'koi') {
  for (let i = 0; i < 600; i++) e.frame(1 / 60);
} else {
  for (let i = 0; i < 2; i++) e.frame(1 / 60);
}

const raw = Uint8Array.from(px());
writeFileSync(outPath, raw);
const s = S();
console.log(`frame ${s[1].toFixed(2)}s settle=${s[2].toFixed(2)} lantern=${s[4].toFixed(2)} ` +
            `koi=${s.slice(16, 20).map(v => v.toFixed(0)).join(',')} -> ${outPath}`);

// timing: 600 frames, the way the page would run them
const t = [0, 0];
for (let k = 0; k < 600; k++) {
  if (k % 120 === 0) e.tap(40 + (k * 7) % 240, 60 + (k * 11) % 140);
  const t0 = performance.now();
  e.frame(1 / 60);
  t[0] += performance.now() - t0;
}
console.log(`600 frames in ${t[0].toFixed(0)} ms  (${(t[0] / 600).toFixed(2)} ms/frame)`);
