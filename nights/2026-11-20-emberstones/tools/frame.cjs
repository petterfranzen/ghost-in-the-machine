'use strict';
// Render one frame of the module from Node: the fast art loop, no browser.
//   node tools/frame.cjs out.png [--w 195 --h 422 --seed 7 --level 0]
//        [--tap 0,3 --seconds 2 --scale 2 --motion 1]
const fs = require('fs');
const path = require('path');
const { writePng } = require('./png.cjs');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : def;
}
const out = process.argv[2] || 'frame.png';
const w = parseInt(arg('w', '195'), 10), h = parseInt(arg('h', '422'), 10);
const scale = parseInt(arg('scale', '2'), 10);
const level = parseInt(arg('level', '0'), 10);
const seconds = parseFloat(arg('seconds', '1.5'));
const motion = parseFloat(arg('motion', '1'));
const seed = parseInt(arg('seed', '7'), 10);
const wasm = arg('wasm', path.join(__dirname, '..', 'build', 'sim.wasm'));

const s = new WebAssembly.Instance(new WebAssembly.Module(fs.readFileSync(wasm)), {}).exports;
s.init();
s.setMotion(motion);
s.seed(seed);
s.resize(w, h);
s.setLevel(level);
for (const t of String(arg('tap', '')).split(',')) {
  if (t !== '') s.tapStone(parseInt(t, 10));
}
for (let i = 0; i < Math.round(seconds * 60); i++) s.tick(1 / 60);
s.render();
// the module keeps a MAXW-wide framebuffer: copy row by row, never flat
const stride = s.stride();   /* already bytes: MAXW * 4 */
const src = new Uint8Array(s.memory.buffer, s.rgbaPtr(), stride * s.height());
const tight = new Uint8Array(w * h * 4);
for (let y = 0; y < h; y++) tight.set(src.subarray(y * stride, y * stride + w * 4), y * w * 4);
const r = writePng(out, w, h, tight, scale);
console.log(JSON.stringify({ out, ...r, level, lit: s.stats(0), of: s.stats(1), stones: s.stoneCount(), solvable: s.solvable() }));
