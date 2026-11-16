// A dev tool: render one frame of the simulation to a PNG, straight from Node.
// Faster to iterate on the art than a browser, and it shows what the module
// actually draws:
//
//   node tools/frame-png.cjs build/snow_garden.wasm out.png 98 211 [seconds] [taps...]
//
// `taps` are x,y pairs applied before the frames are stepped.
const fs = require('node:fs');
const zlib = require('node:zlib');

const PALETTE = [
  [0, 0, 0], [6, 11, 9], [8, 17, 16], [10, 26, 23], [13, 36, 31], [18, 46, 39],
  [10, 22, 18], [17, 36, 29], [26, 52, 44], [44, 78, 66], [74, 112, 96],
  [120, 164, 142], [176, 210, 190], [224, 240, 228], [140, 255, 190],
  [255, 180, 84], [255, 224, 170], [127, 149, 138], [207, 230, 216],
  [9, 16, 13], [22, 40, 32], [14, 24, 20], [36, 66, 54], [91, 231, 216],
  [46, 84, 72], [240, 250, 246], [58, 88, 74], [196, 140, 88], [156, 96, 56],
  [232, 244, 236], [26, 44, 38], [150, 186, 166], [60, 96, 80],
];

function crc32(b) {
  let c, t = [];
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  let x = 0xffffffff;
  for (let i = 0; i < b.length; i++) x = t[(x ^ b[i]) & 0xff] ^ (x >>> 8);
  return (x ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

(async () => {
  const [file, out, ws, hs, ss, ...rest] = process.argv.slice(2);
  const w = parseInt(ws, 10), h = parseInt(hs, 10), secs = parseFloat(ss || '0');
  const bytes = fs.readFileSync(file);
  const { instance } = await WebAssembly.instantiate(bytes, {});
  const m = instance.exports;
  m.seed(20261110);
  m.resize(w, h);
  for (let i = 0; i + 1 < rest.length; i += 2) m.tap(parseFloat(rest[i]), parseFloat(rest[i + 1]));
  for (let t = 0; t < secs; t += 1 / 60) m.step(1 / 60);
  m.render();
  const S = parseInt(process.env.SCALE || '1', 10);   // nearest-neighbour zoom for looking
  const st = m.stride();
  const src = new Uint8Array(m.memory.buffer, m.frame(), st * h);
  const idx = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) idx.set(src.subarray(y * st, y * st + w), y * w);
  const rgba = Buffer.alloc(w * S * h * S * 4);
  for (let y = 0; y < h * S; y++) {
    for (let x = 0; x < w * S; x++) {
      const c = PALETTE[idx[((y / S) | 0) * w + ((x / S) | 0)]] || [255, 0, 255];
      const o = (y * w * S + x) * 4;
      rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255;
    }
  }
  fs.writeFileSync(out, png(w * S, h * S, rgba));
  console.log(`${out}: ${w}x${h} after ${secs}s, ${m.probe(10)} footprints, fox ${m.probe(7)}`);
})().catch(e => { console.error(e); process.exit(1); });
