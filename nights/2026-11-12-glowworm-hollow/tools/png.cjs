'use strict';
// Minimal PNG writer: stdlib zlib only, so the tools need no packages.
const zlib = require('zlib');
let T = null;
function table() {
  if (T) return T;
  T = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    T[n] = c;
  }
  return T;
}
function crc32(buf) {
  const t = table();
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
// rgba: Uint8Array, w*h*4. scale: integer nearest-neighbour upscale.
function writePng(file, w, h, rgba, scale) {
  const s = Math.max(1, scale | 0 || 1);
  const W = w * s, H = h * s;
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) {
    let o = y * (W * 4 + 1);
    raw[o++] = 0;
    const sy = (y / s) | 0;
    for (let x = 0; x < W; x++) {
      const sx = (x / s) | 0, p = (sy * w + sx) * 4;
      raw[o++] = rgba[p]; raw[o++] = rgba[p + 1]; raw[o++] = rgba[p + 2]; raw[o++] = rgba[p + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  require('fs').writeFileSync(file, png);
  return { W, H, bytes: png.length };
}
module.exports = { writePng };
