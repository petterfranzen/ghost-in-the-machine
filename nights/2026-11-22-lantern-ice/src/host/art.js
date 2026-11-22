function hash(x, y, salt) {
  const n = Math.sin(x * 127.1 + y * 311.7 + (salt || 0) * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

const KEEPER = { robe: '#1b2f45', trim: '#33597a', hood: '#3f6b90', lamp: '#ffd28a' };
const GLOW = '#ffcb7a';

// A rounded rectangle from a record: one argument, and the call sites read
// like the shape they describe.
function roundRect(ctx, box) {
  const { x, y, w, h, r } = box;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// The lantern's light, as a soft pool that fades to nothing at the rim.
function lamp(c, at) {
  const { x, y, r, alpha } = at;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255, 214, 148, ${alpha})`);
  g.addColorStop(0.45, `rgba(255, 190, 112, ${alpha * 0.32})`);
  g.addColorStop(1, 'rgba(255, 176, 96, 0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, 6.2832);
  c.fill();
}

// The tile, keeper and effect brushes: plain drawings, one per kind, picked
// out of tables so the painter itself stays a short loop.
// --- tiles, one function per kind, drawn from a table ------------------------

window.LakeArt = (function () {
const TILE_DRAW = [
  drawIce, drawRock, drawSnow, drawThin, drawWater, drawPost, drawBlock, drawFrozen,
];

function drawIce(c, p, at) {
  const g = c.createLinearGradient(p.px, p.py, p.px, p.py + p.s);
  g.addColorStop(0, hash(at.x, at.y, 1) > 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.055)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.fillRect(p.px, p.py, p.s, p.s);
  // A seam on two edges only: enough to read the grid, quiet enough to forget.
  c.strokeStyle = 'rgba(160,215,245,0.22)';
  c.lineWidth = Math.max(0.6, p.s * 0.016);
  c.beginPath();
  c.moveTo(p.px + p.s, p.py);
  c.lineTo(p.px + p.s, p.py + p.s);
  c.moveTo(p.px, p.py + p.s);
  c.lineTo(p.px + p.s, p.py + p.s);
  c.stroke();
  if (hash(at.x, at.y, 7) > 0.86) {
    c.strokeStyle = 'rgba(190,224,240,0.10)';
    c.lineWidth = Math.max(0.6, p.s * 0.02);
    c.beginPath();
    c.moveTo(p.px + p.s * 0.2, p.py + p.s * 0.7);
    c.lineTo(p.px + p.s * 0.75, p.py + p.s * 0.45);
    c.stroke();
  }
}

function drawRock(c, p, at) {
  c.fillStyle = '#232a33';
  roundRect(c, { x: p.px + p.s * 0.08, y: p.py + p.s * 0.12, w: p.s * 0.84, h: p.s * 0.8, r: p.s * 0.22 });
  c.fill();
  c.fillStyle = 'rgba(210,226,238,0.85)';
  roundRect(c, { x: p.px + p.s * 0.12, y: p.py + p.s * 0.08, w: p.s * 0.76, h: p.s * 0.26, r: p.s * 0.13 });
  c.fill();
  c.fillStyle = 'rgba(0,0,0,0.25)';
  roundRect(c, { x: p.px + p.s * 0.16, y: p.py + p.s * 0.6, w: p.s * 0.68, h: p.s * 0.3, r: p.s * 0.12 });
  c.fill();
}

function drawSnow(c, p, at) {
  c.fillStyle = 'rgba(215,232,244,0.92)';
  roundRect(c, { x: p.px + p.s * 0.06, y: p.py + p.s * 0.16, w: p.s * 0.88, h: p.s * 0.78, r: p.s * 0.3 });
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 3; i++) {
    const hx = hash(at.x, at.y, i + 3);
    const hy = hash(at.x, at.y, i + 11);
    c.beginPath();
    c.arc(p.px + p.s * (0.2 + hx * 0.6), p.py + p.s * (0.3 + hy * 0.5), p.s * 0.05, 0, 6.2832);
    c.fill();
  }
}

function drawThin(c, p, at) {
  c.fillStyle = 'rgba(150,215,240,0.13)';
  c.fillRect(p.px + p.s * 0.02, p.py + p.s * 0.02, p.s * 0.96, p.s * 0.96);
  c.strokeStyle = 'rgba(180,230,255,0.30)';
  c.lineWidth = Math.max(0.7, p.s * 0.025);
  c.strokeRect(p.px + p.s * 0.02, p.py + p.s * 0.02, p.s * 0.96, p.s * 0.96);
}

function drawWater(c, p, at) {
  c.fillStyle = '#040b14';
  roundRect(c, { x: p.px - p.s * 0.04, y: p.py - p.s * 0.04, w: p.s * 1.08, h: p.s * 1.08, r: p.s * 0.28 });
  c.fill();
  c.strokeStyle = 'rgba(120,200,235,0.22)';
  c.lineWidth = Math.max(1, p.s * 0.045);
  c.stroke();
  const t = at.t;
  const r = p.s * (0.2 + 0.14 * (0.5 + 0.5 * Math.sin(t * 1.1 + hash(at.x, at.y) * 6)));
  c.strokeStyle = 'rgba(150,215,240,0.13)';
  c.lineWidth = Math.max(0.6, p.s * 0.02);
  c.beginPath();
  c.arc(p.px + p.s / 2, p.py + p.s / 2, r, 0, 6.2832);
  c.stroke();
}

function drawPost(c, p, at) {
  const cx = p.px + p.s / 2;
  const base = p.py + p.s * 0.76;
  const on = at.lit;
  // the ironwork: a thin post and a hoop, so the lantern reads as a made thing
  c.fillStyle = on ? '#3a3226' : '#2b3440';
  c.fillRect(cx - p.s * 0.035, base - p.s * 0.5, p.s * 0.07, p.s * 0.5);
  c.fillRect(cx - p.s * 0.13, base - p.s * 0.06, p.s * 0.26, p.s * 0.06);
  c.strokeStyle = on ? 'rgba(255,214,150,0.95)' : 'rgba(130,152,172,0.65)';
  c.lineWidth = Math.max(0.9, p.s * 0.035);
  c.beginPath();
  c.arc(cx, base - p.s * 0.62, p.s * 0.17, 0, 6.2832);
  c.stroke();
  // the glass: cold and grey until lit, warm and full when it is
  c.fillStyle = on ? GLOW : '#46536a';
  c.beginPath();
  c.arc(cx, base - p.s * 0.62, p.s * 0.12, 0, 6.2832);
  c.fill();
  if (on) {
    c.fillStyle = 'rgba(255,246,214,0.95)';
    c.beginPath();
    c.arc(cx, base - p.s * 0.64, p.s * 0.055, 0, 6.2832);
    c.fill();
  }
  // a small finial, the detail that makes it look deliberate
  c.fillStyle = on ? '#4a3f2e' : '#33404f';
  c.beginPath();
  c.moveTo(cx, base - p.s * 0.86);
  c.lineTo(cx + p.s * 0.06, base - p.s * 0.78);
  c.lineTo(cx - p.s * 0.06, base - p.s * 0.78);
  c.closePath();
  c.fill();
}

function drawBlock(c, p, at) {
  c.fillStyle = 'rgba(0,0,0,0.3)';
  roundRect(c, { x: p.px + p.s * 0.12, y: p.py + p.s * 0.62, w: p.s * 0.76, h: p.s * 0.28, r: p.s * 0.1 });
  c.fill();
  const g = c.createLinearGradient(p.px, p.py, p.px, p.py + p.s);
  g.addColorStop(0, '#b9d8ee');
  g.addColorStop(1, '#7ba2bf');
  c.fillStyle = g;
  roundRect(c, { x: p.px + p.s * 0.14, y: p.py + p.s * 0.2, w: p.s * 0.72, h: p.s * 0.66, r: p.s * 0.14 });
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.5)';
  c.lineWidth = Math.max(0.7, p.s * 0.025);
  c.beginPath();
  c.moveTo(p.px + p.s * 0.26, p.py + p.s * 0.72);
  c.lineTo(p.px + p.s * 0.46, p.py + p.s * 0.34);
  c.stroke();
}

function drawFrozen(c, p, at) {
  c.fillStyle = 'rgba(160,215,240,0.16)';
  roundRect(c, { x: p.px - p.s * 0.03, y: p.py - p.s * 0.03, w: p.s * 1.06, h: p.s * 1.06, r: p.s * 0.26 });
  c.fill();
  c.strokeStyle = 'rgba(210,240,255,0.34)';
  c.lineWidth = Math.max(0.7, p.s * 0.025);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * 6.2832 + hash(at.x, at.y) * 2;
    c.beginPath();
    c.moveTo(p.px + p.s / 2, p.py + p.s / 2);
    c.lineTo(p.px + p.s / 2 + Math.cos(a) * p.s * 0.4, p.py + p.s / 2 + Math.sin(a) * p.s * 0.4);
    c.stroke();
  }
}

function drawSkid(c, p, dir, alpha) {
  c.save();
  c.globalAlpha = alpha * 0.5;
  c.strokeStyle = 'rgba(200,236,255,0.75)';
  c.lineWidth = Math.max(0.6, p.s * 0.03);
  const horizontal = dir === 1 || dir === 3;
  for (let i = -1; i <= 1; i++) {
    c.beginPath();
    if (horizontal) {
      c.moveTo(p.px + p.s * 0.1, p.py + p.s * (0.5 + i * 0.14));
      c.lineTo(p.px + p.s * 0.9, p.py + p.s * (0.5 + i * 0.14 + 0.05));
    } else {
      c.moveTo(p.px + p.s * (0.5 + i * 0.14), p.py + p.s * 0.1);
      c.lineTo(p.px + p.s * (0.5 + i * 0.14 + 0.05), p.py + p.s * 0.9);
    }
    c.stroke();
  }
  c.restore();
}

function drawCrack(c, p, at) {
  const { n, cx, cy } = at;
  c.save();
  c.strokeStyle = 'rgba(190,236,255,0.7)';
  c.lineWidth = Math.max(0.7, p.s * 0.028);
  for (let i = 0; i < n; i++) {
    const a = hash(cx, cy, i) * 6.2832;
    const mid = { x: p.px + p.s / 2 + Math.cos(a) * p.s * 0.16, y: p.py + p.s / 2 + Math.sin(a) * p.s * 0.16 };
    c.beginPath();
    c.moveTo(p.px + p.s / 2, p.py + p.s / 2);
    c.lineTo(mid.x, mid.y);
    c.lineTo(mid.x + Math.cos(a + 0.5) * p.s * 0.2, mid.y + Math.sin(a + 0.5) * p.s * 0.2);
    c.stroke();
  }
  c.restore();
}

// --- the keeper, one drawing per mode ----------------------------------------

const KEEPER_DRAW = [keepStill, keepSlide, keepSit, keepFall, keepWarm];

function keeperBody(c, at) {
  const { x, y, s, squash, warm } = at;
  c.fillStyle = 'rgba(0,0,0,0.34)';
  c.beginPath();
  c.ellipse(x, y + s * 0.46 * squash, s * 0.3, s * 0.1, 0, 0, 6.2832);
  c.fill();
  c.fillStyle = KEEPER.robe;
  roundRect(c, { x: x - s * 0.2, y: y - s * 0.22 * squash, w: s * 0.4, h: s * 0.66 * squash, r: s * 0.16 });
  c.fill();
  c.fillStyle = KEEPER.trim;
  roundRect(c, { x: x - s * 0.2, y: y + s * 0.26 * squash, w: s * 0.4, h: s * 0.16, r: s * 0.07 });
  c.fill();
  c.fillStyle = KEEPER.hood;
  c.beginPath();
  c.arc(x, y - s * 0.3 * squash, s * 0.16, 0, 6.2832);
  c.fill();
  const lampY = y + s * (warm ? 0.16 : 0.06);
  c.fillStyle = 'rgba(255,205,140,0.9)';
  c.beginPath();
  c.arc(x + s * 0.28, lampY, s * 0.07, 0, 6.2832);
  c.fill();
  c.save();
  c.globalCompositeOperation = 'lighter';
  lamp(c, { x: x + s * 0.28, y: lampY, r: s * 1.7, alpha: warm ? 0.5 : 0.34 });
  c.restore();
}

function keepStill(c, at) {
  const { x, y, s, t } = at;
  keeperBody(c, { x, y: y + Math.sin(t * 1.6 + 1) * s * 0.01, s, squash: 1, warm: false });
}

function keepSlide(c, at) {
  const { x, y, s, t } = at;
  c.save();
  c.translate(x, y);
  c.rotate(Math.sin(t * 22) * 0.04);
  keeperBody(c, { x: 0, y: 0, s, squash: 0.94, warm: false });
  c.strokeStyle = 'rgba(190,230,255,0.35)';
  c.lineWidth = Math.max(0.8, s * 0.03);
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.moveTo(-s * (0.3 + i * 0.16), -s * 0.05 + i * s * 0.08);
    c.lineTo(-s * (0.55 + i * 0.16), -s * 0.05 + i * s * 0.08);
    c.stroke();
  }
  c.restore();
}

function keepSit(c, at) {
  const { x, y, s, t } = at;
  keeperBody(c, { x, y: y + s * 0.2, s, squash: 0.66, warm: false });
  c.fillStyle = 'rgba(255,215,150,0.5)';
  c.beginPath();
  c.arc(x + s * 0.3, y + s * 0.42, s * 0.05 + Math.sin(t * 3) * s * 0.01, 0, 6.2832);
  c.fill();
}

function keepFall(c, at) {
  const { x, y, s, k } = at;
  const sink = Math.min(1, k.fallT * 1.4);
  c.save();
  c.globalAlpha = 1 - sink * 0.8;
  keeperBody(c, { x, y: y + s * sink * 0.7, s: s * (1 - sink * 0.4), squash: 0.9, warm: false });
  c.restore();
}

function keepWarm(c, at) {
  const { x, y, s, k } = at;
  keeperBody(c, { x, y: y + s * 0.1, s, squash: 0.82, warm: true });
  c.save();
  c.globalCompositeOperation = 'lighter';
  const r = s * (0.6 + k.warm * 1.8);
  c.strokeStyle = `rgba(255,190,120,${0.4 * (1 - k.warm * 0.4)})`;
  c.lineWidth = Math.max(1, s * 0.05);
  c.beginPath();
  c.arc(x, y + s * 0.3, r, 0, 6.2832);
  c.stroke();
  c.restore();
}

// --- effects ------------------------------------------------------------------

const FX_LIFE = { puff: 0.8, chip: 0.9, drop: 1.1, ring: 1.3, shimmer: 1.6, fish: 4.2, spark: 0.7 };

const FX_DRAW = {
  puff: (c, f, p, k) => {
    c.globalAlpha = (1 - k) * 0.5;
    c.fillStyle = '#dbe9f5';
    c.beginPath();
    c.arc(p.px + p.s / 2, p.py + p.s / 2, p.s * (0.15 + k * 0.4), 0, 6.2832);
    c.fill();
  },
  chip: (c, f, p, k) => {
    c.globalAlpha = 1 - k;
    c.fillStyle = 'rgba(200,238,255,0.9)';
    const a = f.seed * 6.2832;
    const d = p.s * (0.2 + k * 0.9);
    c.fillRect(p.px + p.s / 2 + Math.cos(a) * d, p.py + p.s / 2 + Math.sin(a) * d - k * p.s * 0.3, p.s * 0.09, p.s * 0.09);
  },
  drop: (c, f, p, k) => {
    c.globalAlpha = 1 - k;
    c.fillStyle = 'rgba(170,225,250,0.85)';
    const a = f.seed * 6.2832;
    const d = p.s * (0.3 + k * 1.2);
    c.beginPath();
    c.arc(p.px + p.s / 2 + Math.cos(a) * d, p.py + p.s / 2 + Math.sin(a) * d, p.s * 0.05, 0, 6.2832);
    c.fill();
  },
  ring: (c, f, p, k) => {
    c.globalAlpha = (1 - k) * 0.6;
    c.strokeStyle = f.arg > 0 ? 'rgba(255,205,140,0.9)' : 'rgba(180,230,255,0.85)';
    c.lineWidth = Math.max(1, p.s * 0.05);
    c.beginPath();
    c.arc(p.px + p.s / 2, p.py + p.s / 2, p.s * (0.2 + k * 1.1), 0, 6.2832);
    c.stroke();
  },
  shimmer: (c, f, p, k) => {
    c.globalAlpha = Math.sin(k * 3.14) * 0.5;
    c.fillStyle = 'rgba(255,220,170,0.8)';
    c.beginPath();
    c.arc(p.px + p.s / 2, p.py + p.s / 2, p.s * (0.1 + Math.sin(k * 6) * 0.06 + 0.2), 0, 6.2832);
    c.fill();
  },
  fish: (c, f, p, k) => {
    c.globalAlpha = Math.sin(k * 3.14) * 0.7;
    c.fillStyle = 'rgba(150,215,245,0.7)';
    const x = p.px + p.s / 2 + Math.sin(k * 6.2832 + f.seed * 3) * p.s * 1.6;
    const y = p.py + p.s / 2 + Math.sin(k * 9.4 + f.seed) * p.s * 0.5;
    c.beginPath();
    c.ellipse(x, y, p.s * 0.22, p.s * 0.09, 0, 0, 6.2832);
    c.fill();
    c.beginPath();
    c.moveTo(x + p.s * 0.2, y);
    c.lineTo(x + p.s * 0.34, y - p.s * 0.09);
    c.lineTo(x + p.s * 0.34, y + p.s * 0.09);
    c.fill();
  },
  spark: (c, f, p, k) => {
    c.globalAlpha = (1 - k) * 0.9;
    c.strokeStyle = 'rgba(255,235,190,0.9)';
    c.lineWidth = Math.max(0.6, p.s * 0.025);
    const a = f.seed * 6.2832;
    c.beginPath();
    c.moveTo(p.px + p.s / 2, p.py + p.s / 2);
    c.lineTo(p.px + p.s / 2 + Math.cos(a) * p.s * 0.5, p.py + p.s / 2 + Math.sin(a) * p.s * 0.5);
    c.stroke();
  },
};

return { TILE_DRAW, KEEPER_DRAW, FX_LIFE, FX_DRAW, drawSkid, drawCrack, hash, roundRect, lamp, KEEPER, GLOW };
})();
