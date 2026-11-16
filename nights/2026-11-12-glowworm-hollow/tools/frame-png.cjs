'use strict';
// Render frames of the module from Node: the fast art loop, no browser.
//   node tools/frame-png.cjs out.png [--w 195 --h 422 --seed 7 --seconds 2]
//        [--tap x,y] [--drag x,y;x,y;...] [--hold x,y] [--flick dx,dy] [--scale 2]
//        [--motion 1] [--csv] [--frames 4]
const fs = require('fs');
const path = require('path');
const { writePng } = require('./png.cjs');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : def;
}
const out = process.argv[2] || 'frame.png';
const w = parseInt(arg('w', '195'), 10), h = parseInt(arg('h', '422'), 10);
const seed = parseInt(arg('seed', '7'), 10);
const scale = parseInt(arg('scale', '2'), 10);
const motion = parseFloat(arg('motion', '1'));
const wasm = arg('wasm', path.join(__dirname, '..', 'build', 'sim.wasm'));

const s = new WebAssembly.Instance(new WebAssembly.Module(fs.readFileSync(wasm)), {}).exports;
// the module keeps a MAXW-wide framebuffer: copy it row by row, never flat
function px() {
  const stride = s.stride() * 4;
  const src = new Uint8Array(s.memory.buffer, s.rgbaPtr(), stride * s.height());
  const tight = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) tight.set(src.subarray(y * stride, y * stride + w * 4), y * w * 4);
  return tight;
}
function lightHist() {
  let hi = 0, n = 0, sum = 0;
  for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) {
    const v = s.lightAt(x, y); n++; sum += v; if (v > hi) hi = v;
  }
  return { max: hi, mean: (sum / n).toFixed(1) };
}
s.init();
s.seed(seed);
s.setMotion(motion);
s.resize(w, h);
const worldW = s.width(), worldH = s.height();

function ticks(seconds) { const n = Math.max(1, Math.round(seconds * 60)); for (let i = 0; i < n; i++) s.tick(1 / 60); }
function parsePts(str) {
  return (str || '').split(';').filter(Boolean).map((p) => p.split(',').map(Number));
}
// gestures before the wait
const dragPts = parsePts(arg('drag', ''));
if (dragPts.length) {
  s.press(dragPts[0][0] * worldW, dragPts[0][1] * worldH);
  for (let i = 1; i < dragPts.length; i++) {
    s.moveTo(dragPts[i][0] * worldW, dragPts[i][1] * worldH);
    ticks(0.05);
  }
  const last = dragPts[dragPts.length - 1];
  s.release(last[0] * worldW, last[1] * worldH);
}
const holdPts = parsePts(arg('hold', ''));
if (holdPts.length) {
  s.press(holdPts[0][0] * worldW, holdPts[0][1] * worldH);
  ticks(1.3);
  s.release(holdPts[0][0] * worldW, holdPts[0][1] * worldH);
}
const tapPts = parsePts(arg('tap', ''));
for (const p of tapPts) {
  s.press(p[0] * worldW, p[1] * worldH);
  s.release(p[0] * worldW, p[1] * worldH);
  ticks(0.08);
}
const flick = (arg('flick', '') || '').split(',').map(Number);
if (flick.length === 2) {
  s.press(0.5 * worldW, 0.5 * worldH);
  s.moveTo(0.5 * worldW + flick[0], 0.5 * worldH + flick[1]);
  ticks(0.05);
  s.release(0.5 * worldW + flick[0], 0.5 * worldH + flick[1]);
}
ticks(parseFloat(arg('seconds', '2')));
s.clearEvents();

// the index frame, for the palette histogram
const frame = new Uint8Array(s.memory.buffer, s.frame(), s.stride() * worldH);
const hist = new Map();
for (let y = 0; y < worldH; y++) for (let x = 0; x < worldW; x++) {
  const v = frame[y * s.stride() + x];
  hist.set(v, (hist.get(v) || 0) + 1);
}
const info = writePng(out, worldW, worldH, px(), scale);
console.log(`${out}: ${info.W}x${info.H} ${(info.bytes / 1024).toFixed(1)} KB  world ${worldW}x${worldH}  litWorms=${s.stats(0)}  worms=${s.wormCount()}  elder=${s.stats(1)} rune=${s.stats(2)} mite=${s.stats(3)} stars=${s.stats(4)} light=${JSON.stringify(lightHist())}`);
console.log('palette: ' + [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}:${(100 * v / (worldW * worldH)).toFixed(1)}%`).join(' '));
