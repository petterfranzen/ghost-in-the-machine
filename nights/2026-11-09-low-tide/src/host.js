/* Low Tide — the host around the PureScript rules in src/Sim.purs.
   It owns the pixels (a pixel-art framebuffer), the input, the small sound
   and the little DOM. Everything it needs is local; nothing is fetched. */
import * as S from '../output/Sim/index.js';

const TAU = Math.PI * 2;

const sim = {
  initial: (w, h, m) => S.initial(w)(h)(m),
  resize: (w, h, s) => S.resize(w)(h)(s),
  motion: (m, s) => S.withMotion(m)(s),
  tick: (dt, s) => S.tick(dt)(s),
  tap: (x, y, s) => S.tap(x)(y)(s),
  press: (x, y, s) => S.press(x)(y)(s),
  move: (x, y, s) => S.move(x)(y)(s),
  release: (s) => S.release(s),
};

const canvas = document.getElementById('sea');
const ctx = canvas.getContext('2d', { alpha: false });
const soundBtn = document.getElementById('sound');
const statusEl = document.getElementById('status');

const off = document.createElement('canvas');
const octx = off.getContext('2d', { alpha: false });

// ----------------------------------------------------------------- palette
const pack = (hex) => (0xff000000 | ((hex & 0xff) << 16) | (hex & 0xff00) | ((hex >> 16) & 0xff)) >>> 0;
const C = {
  sky0: pack(0x131a2c), sky1: pack(0x232c4c), sky2: pack(0x3a3a60), sky3: pack(0x5c4a63), sky4: pack(0x7d5f6c),
  star: pack(0xe9e6d8),
  moon: pack(0xf8f3df), halo: pack(0xbfae8c),
  sea: pack(0x1a2a46), sea2: pack(0x243c5e), shimmer: pack(0x507da8), foam: pack(0xd8e6ef),
  glade: pack(0x2d5878),
  rock: pack(0x2f2b38), rock2: pack(0x3b3547), rock3: pack(0x4a4255), rockHi: pack(0x5d5466), rockDk: pack(0x221f29),
  pool: pack(0x14303e), pool2: pack(0x1b4257), rim: pack(0x53747f), wetHi: pack(0x8dbcc8),
  crab: pack(0xc06b55), crabDk: pack(0x8a4436),
  sf: pack(0xd2a061), sfDk: pack(0x9a6c39),
  anem: pack(0x8a5a94), anemDk: pack(0x5f3f6b), anemTip: pack(0xd79ad0),
  goby: pack(0x86cbc0), gobyDk: pack(0x4f8f86),
  seal: pack(0x6f6f84), sealDk: pack(0x474656),
};

// ----------------------------------------------------------------- buffers
let W = 0, H = 0, SCALE = 2, vw = 0, vh = 0;
let buf = null, backdrop = null, offImg = null, stars = [];
let motion = 1;
let state = null;
let fade = 0;
let frames = 0, lastFrameMs = 0;
let lastSeq = 0;

const ihash = (x, y) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177 | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

function blend(c1, c2, a) {
  const t = a <= 0 ? 0 : a >= 1 ? 1 : a;
  const r = (c1 & 255) + (((c2 & 255) - (c1 & 255)) * t);
  const g = ((c1 >> 8) & 255) + ((((c2 >> 8) & 255) - ((c1 >> 8) & 255)) * t);
  const b = ((c1 >> 16) & 255) + ((((c2 >> 16) & 255) - ((c1 >> 16) & 255)) * t);
  return (0xff000000 | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0)) >>> 0;
}

function put(x, y, c) {
  x |= 0; y |= 0;
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  buf[y * W + x] = c;
}

function bput(x, y, c, a) {
  if (a <= 0) return;
  x |= 0; y |= 0;
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = y * W + x;
  buf[i] = blend(buf[i], c, a);
}

function sprite(ox, oy, rows, colors) {
  const cx = ox - (rows[0].length >> 1), cy = oy - (rows.length >> 1);
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const c = colors[row[i]];
      if (c !== undefined) put(cx + i, cy + j, c);
    }
  }
}

// ---------------------------------------------------------------- backdrop
// small stones, fixed in relative terms so the shore reads the same each time
const STONE_SEED = [
  { x: 0.13, y: 0.72, r: 2 }, { x: 0.27, y: 0.88, r: 3 },
  { x: 0.41, y: 0.63, r: 2 }, { x: 0.63, y: 0.79, r: 3 },
  { x: 0.72, y: 0.94, r: 2 }, { x: 0.88, y: 0.69, r: 2 },
  { x: 0.95, y: 0.87, r: 3 }, { x: 0.52, y: 0.95, r: 2 },
];
let stones = STONE_SEED.map((s) => ({ ...s }));

function buildBackdrop() {
  const bd = new Uint32Array(W * H);
  const seaY = H * 0.40;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let c;
      if (y < seaY) {
        const t = y / Math.max(1, seaY);
        c = t < 0.55 ? blend(C.sky0, C.sky1, t / 0.55) : blend(C.sky1, C.sky2, (t - 0.55) / 0.45);
        if (t > 0.82) c = blend(c, C.sky4, ((t - 0.82) / 0.18) * 0.45);
      } else {
        const t = (y - seaY) / Math.max(1, H - seaY);
        const n = ihash(x * 3, y * 3);
        c = n < 0.34 ? C.rock : n < 0.72 ? C.rock2 : C.rock3;
        // long, lazy ripples combed across the wet rock, broken up so they
        // never read as scan lines
        const ripple = ((x + y * 2 + Math.round(Math.sin(x * 0.075 + y * 0.21) * 3)) % 11 + 11) % 11;
        if (ripple === 0) c = blend(c, C.rockHi, 0.42);
        else if (ripple === 1) c = blend(c, C.rockDk, 0.22);
        if (n > 0.986) c = C.rockHi;
        if (n < 0.045) c = C.rockDk;
        // a handful of small stones sitting proud of the rock
        for (const st of stones) {
          const sx = Math.abs(x - st.x), sy = Math.abs(y - st.y);
          if (sx <= st.r && sy <= st.r) {
            const dd = sx * sx + sy * sy;
            if (dd <= st.r * st.r) c = st.y === y ? C.rockHi : C.rock2;
            else if (dd <= (st.r + 1) * (st.r + 1) && y > st.y) c = blend(c, C.rockDk, 0.45);
          }
        }
        c = blend(c, C.rockDk, t * 0.45);
      }
      bd[y * W + x] = c;
    }
  }
  return bd;
}

function makeStars() {
  const out = [];
  const seaY = H * 0.40;
  for (let i = 0; i < 30; i++) {
    out.push({
      x: Math.floor(ihash(i, 11) * W),
      y: Math.floor(ihash(i, 23) * (seaY * 0.9)),
      ph: ihash(i, 37) * TAU,
      sp: 0.35 + ihash(i, 53) * 0.5,
    });
  }
  return out;
}

function relayout() {
  vw = Math.max(1, Math.floor(window.innerWidth));
  vh = Math.max(1, Math.floor(window.innerHeight));
  SCALE = Math.max(2, Math.min(6, Math.floor(Math.min(vw / 180, vh / 200))));
  W = Math.max(48, Math.floor(vw / SCALE));
  H = Math.max(48, Math.floor(vh / SCALE));
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = vw + 'px';
  canvas.style.height = vh + 'px';
  off.width = W;
  off.height = H;
  ctx.imageSmoothingEnabled = false;
  buf = new Uint32Array(W * H);
  offImg = octx.createImageData(W, H);
  stones = STONE_SEED.map((s) => ({ ...s, x: Math.round(s.x * W), y: Math.round(s.y * H) }));
  backdrop = buildBackdrop();
  stars = makeStars();
  state = state ? sim.resize(W, H, state) : sim.initial(W, H, motion);
}

// ------------------------------------------------------------------ pieces
function drawStars(st) {
  for (const s of stars) {
    const a = 0.22 + 0.62 * (0.5 + 0.5 * Math.sin(st.t * s.sp + s.ph));
    bput(s.x, s.y, C.star, a * 0.8);
    if (s.x + 1 < W) bput(s.x + 1, s.y, C.star, a * 0.18);
  }
}

function drawMoon(st) {
  const mx = Math.round(st.moonX), my = Math.round(st.moonY);
  for (let dy = -6; dy <= 6; dy++) {
    for (let dx = -6; dx <= 6; dx++) {
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 3.4) put(mx + dx, my + dy, C.moon);
      else if (d <= 6.4) bput(mx + dx, my + dy, C.halo, (1 - (d - 3.4) / 3) * 0.5);
    }
  }
  if (st.hint > 0.01) {
    for (let dy = -11; dy <= 11; dy++) {
      for (let dx = -11; dx <= 11; dx++) {
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 6.4 && d <= 11) {
          const e = (d - 6.4) / 4.6;
          bput(mx + dx, my + dy, C.halo, st.hint * 0.30 * (1 - e) * e * 3.2);
          }
      }
    }
  }
}

function drawSea(st, seaY, seaFront) {
  const drift = Math.floor(st.t * 0.9);
  const y0 = Math.max(0, Math.floor(seaY)), y1 = Math.min(H, Math.ceil(seaFront));
  for (let y = y0; y < y1; y++) {
    const depth = (y - seaY) / Math.max(1, seaFront - seaY);
    const base = blend(C.sea, C.sea2, depth * 0.9);
    for (let x = 0; x < W; x++) {
      const n = ihash(x, y * 5 + drift * 7);
      // sparkle scatters over the water; the phase mixes x and y so it never
      // lines up into vertical stripes
      buf[y * W + x] = n > 0.90
        ? blend(base, C.shimmer, 0.20 + 0.20 * Math.sin(st.t * 0.6 + x * 0.31 + y * 0.83))
        : base;
    }
  }
  for (let x = 0; x < W; x++) {
    const yf = seaFront + Math.sin(x * 0.16 + st.t * 0.7) * 1.3;
    bput(x, yf, C.foam, 0.34);
    bput(x, yf + 1, C.foam, 0.13);
  }
}

function drawGlade(st, seaY, seaFront) {
  const g = st.glade;
  const mx = st.moonX;
  for (let y = Math.floor(seaY); y < Math.min(H, Math.ceil(seaFront)); y++) {
    const depth = (y - seaY) / Math.max(1, seaFront - seaY);
    const half = Math.max(3, W * 0.06 + W * 0.36 * g * depth);
    const x0 = Math.max(0, Math.floor(mx - half)), x1 = Math.min(W, Math.ceil(mx + half));
    for (let x = x0; x < x1; x++) {
      const edge = 1 - Math.abs(x - mx) / half;
      const a = 0.55 * g * edge * (0.60 + 0.40 * Math.sin(st.t * 0.5 + y * 0.3));
      bput(x, y, C.glade, a);
      // a brighter, narrower core so the path reads as moonlight rather than a haze
      const core = 1 - Math.abs(x - mx) / Math.max(2, half * 0.42);
      if (core > 0) {
        const ca = 0.22 * g * core * (0.55 + 0.45 * Math.sin(st.t * 0.7 + y * 0.55));
        if (ihash(x + Math.floor(st.t * 2.2), y + 3) > 0.72) bput(x, y, C.wetHi, ca);
      }
    }
  }
}

function drawPools(st) {
  for (const p of st.pools) {
    const pad = 4;
    const x0 = Math.max(0, Math.floor(p.cx - p.rx - pad)), x1 = Math.min(W, Math.ceil(p.cx + p.rx + pad));
    const y0 = Math.max(0, Math.floor(p.cy - p.ry - pad)), y1 = Math.min(H, Math.ceil(p.cy + p.ry + pad));
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const dx = (x - p.cx) / (p.rx || 1), dy = (y - p.cy) / (p.ry || 1);
        const d2 = dx * dx + dy * dy;
        if (d2 > 1) {
          // the rock lip: wet rock glistens in a thin ring, and a shadow
          // gathers under the pool so it sits in the shore rather than on it
          if (d2 <= 1.55) {
            const edge = 1 - (d2 - 1) / 0.55;
            bput(x, y, C.rock3, edge * 0.26 * (0.4 + 0.6 * p.wet));
          }
          if (d2 <= 2.1) {
            const edge = 1 - (d2 - 1.55) / 0.55;
            if (edge > 0) bput(x, y, C.rockDk, edge * (dy > 0 ? 0.34 : 0.12));
          }
          continue;
        }
        if (d2 > 0.84) {
          // the waterline is broken up so the ellipse never reads as a sticker
          const h = ihash(x + 7, y + 3);
          const shore = clamp01((d2 - 0.84) / 0.16);
          if (h < 0.42 + shore * 0.5) {
            bput(x, y, C.rockDk, 0.22 * shore);
            continue;
          }
          bput(x, y, C.rim, 0.30 + 0.28 * p.wet);
          continue;
        }
        // shallow water: pale near the far lip, deepening toward the middle,
        // with a still reflection line where the sky meets it
        const depth = clamp01((d2 - 0.06) / 0.94);
        let c = blend(C.pool2, C.pool, depth);
        c = blend(c, C.rim, 0.16 * p.wet * (1 - depth));
        if (dy < -0.52 && d2 < 0.82) {
          const band = clamp01((-dy - 0.52) / 0.30) * 0.55;
          c = blend(c, C.wetHi, band * 0.42);
        }
        c = blend(c, C.wetHi, p.wet * 0.14 * (0.5 + 0.5 * Math.sin(st.t * 1.1 + x * 0.35 + y * 0.9)));
        if (ihash(x + Math.floor(st.t * 2), y) > 0.975) c = blend(c, C.wetHi, 0.42);
        if (st.glade > 0.01) c = blend(c, C.glade, st.glade * 0.26);
        buf[y * W + x] = c;
      }
    }
  }
}

function drawBeasts(st) {
  for (const b of st.beasts) {
    const on = clamp01((b.awake - 0.18) / 0.6);
    if (on <= 0.02) continue;
    const x = Math.round(b.x), y = Math.round(b.y);
    if (b.kind === 0) {
      const leg = Math.round(Math.sin(b.phase * 6) * 1.2 * on);
      sprite(x, y, ['..x.x..', 'xxxxxxx', 'xxxxxxx', '.x...x.'], { x: C.crab });
      put(x - 4 + leg, y + 2, C.crabDk);
      put(x + 4 - leg, y + 2, C.crabDk);
    } else if (b.kind === 1) {
      const s = on > 0.6 ? 1 : 0;
      sprite(x, y, ['..x..', 'xxxxx', '.xxx.', 'x.x.x', 'x' + (s ? '.' : 'x') + 'x' + (s ? '.' : 'x') + 'x'], { x: C.sf });
      put(x, y, C.sfDk);
    } else if (b.kind === 2) {
      put(x, y, C.anem);
      put(x, y + 1, C.anem);
      put(x, y + 2, C.anem);
      put(x - 1, y + 2, C.anemDk);
      put(x + 1, y + 2, C.anemDk);
      put(x - 1, y + 3, C.anemDk);
      put(x + 1, y + 3, C.anemDk);
      for (let k = -2; k <= 2; k++) {
        const sway = Math.round(Math.sin(b.phase * 2 + k) * 1.6 * on);
        put(x + k, y - 1 + sway, C.anemTip);
        if (Math.abs(k) < 2) put(x + k, y - 2 + sway, C.anemTip);
      }
    } else {
      const flip = Math.cos(b.phase) < 0;
      const rows = flip ? ['..xx.', 'xxxxx'] : ['xx..', 'xxxxx'];
      sprite(x, y, rows, { x: C.goby });
      put(x + (flip ? -2 : 2), y - 1, C.gobyDk);
    }
  }
}

function drawBubbles(st) {
  for (const b of st.bubbles) {
    const a = (1 - b.life / b.ttl) * 0.7;
    bput(b.x | 0, b.y | 0, C.foam, a);
    bput((b.x | 0) + 1, (b.y | 0) - 1, C.foam, a * 0.6);
  }
}

function drawRipples(st) {
  for (const r of st.ripples) {
    const a = (1 - r.life / r.ttl) * (r.kind === 1 ? 0.55 : 0.42);
    if (a <= 0.02) continue;
    const steps = Math.max(14, Math.floor(r.r * 7));
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * TAU;
      bput(r.x + Math.cos(t) * r.r, r.y + Math.sin(t) * r.r, C.foam, a);
    }
  }
}

function drawVisitor(st, seaFront) {
  const a = st.visitor;
  const x = Math.round(W * 0.60 + Math.sin(st.t * 0.35) * 2);
  const y = Math.round(seaFront - 1 + Math.sin(st.t * 0.5) * 1);
  sprite(x, y, ['..xx..', '.xxxx.', 'xxxxxx', 'x.xx.x'], { x: blend(C.seal, C.sealDk, 0.35) });
  bput(x - 3, y, C.sealDk, 0.7);
  bput(x + 3, y, C.sealDk, 0.7);
  // a small wake behind the visitor
  for (let i = 1; i < 6; i++) {
    bput(x + 4 + i, y + (i % 2), C.foam, a * 0.25 * (1 - i / 6));
    bput(x - 4 - i, y + (i % 2), C.foam, a * 0.25 * (1 - i / 6));
  }
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// ------------------------------------------------------------------ drawing
function drawFrame(st) {
  buf.set(backdrop);
  const seaY = st.seaY;
  const seaFront = seaY + (H - seaY) * (0.16 + 0.22 * st.tide);
  drawStars(st);
  drawMoon(st);
  drawSea(st, seaY, seaFront);
  if (st.glade > 0.01) drawGlade(st, seaY, seaFront);
  drawPools(st);
  drawBubbles(st);
  drawBeasts(st);
  drawRipples(st);
  if (st.visitor > 0.02) drawVisitor(st, seaFront);
}

// -------------------------------------------------------------------- sound
let ac = null, sndOn = false;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function soundToggle() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
  sndOn = !sndOn;
  if (sndOn && ac.state === 'suspended') ac.resume();
  soundBtn.setAttribute('aria-pressed', sndOn ? 'true' : 'false');
  soundBtn.textContent = sndOn ? 'sound on' : 'sound off';
}

function tone(freq, endFreq, gain, len, type) {
  if (!sndOn || !ac) return;
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type || 'triangle';
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t0 + len);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + len + 0.05);
}

function plip() { tone(520, 190, 0.05, 0.26); }
function bell() { tone(660, 300, 0.035, 0.9, 'sine'); }
function shimmer() {
  tone(880, 620, 0.03, 1.6, 'sine');
  setTimeout(() => tone(1320, 990, 0.022, 1.4, 'sine'), 120);
}
function chord() {
  tone(196, 190, 0.03, 3.2, 'sine');
  setTimeout(() => tone(294, 288, 0.026, 3.0, 'sine'), 160);
  setTimeout(() => tone(392, 384, 0.022, 2.8, 'sine'), 320);
}

function announce(st) {
  if (st.seq === lastSeq) return;
  lastSeq = st.seq;
  statusEl.textContent = st.say;
  if (st.evt === 1) bell();
  else if (st.evt === 2) chord();
  else if (st.evt === 3) shimmer();
}

// -------------------------------------------------------------------- input
let pointerId = null;

function worldFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * W,
    y: ((e.clientY - rect.top) / rect.height) * H,
  };
}

function onDown(e) {
  if (pointerId !== null) return;
  pointerId = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
  const p = worldFromEvent(e);
  state = sim.press(p.x, p.y, sim.tap(p.x, p.y, state));
  plip();
  if (e.cancelable) e.preventDefault();
}

function onMove(e) {
  if (pointerId === null || e.pointerId !== pointerId) return;
  const p = worldFromEvent(e);
  state = sim.move(p.x, p.y, state);
  if (e.cancelable) e.preventDefault();
}

function onUp(e) {
  if (pointerId === null || e.pointerId !== pointerId) return;
  pointerId = null;
  state = sim.release(state);
}

function onKey(e) {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    const x = W * 0.5, y = H * 0.62;
    state = sim.tap(x, y, state);
    plip();
  }
}

const swallow = (e) => e.preventDefault();

canvas.addEventListener('pointerdown', onDown, { passive: false });
canvas.addEventListener('pointermove', onMove, { passive: false });
canvas.addEventListener('pointerup', onUp);
canvas.addEventListener('pointercancel', onUp);
canvas.addEventListener('lostpointercapture', onUp);
canvas.addEventListener('keydown', onKey);
canvas.addEventListener('contextmenu', swallow);
canvas.addEventListener('selectstart', swallow);
canvas.addEventListener('dragstart', swallow);
canvas.addEventListener('touchstart', swallow, { passive: false });
canvas.addEventListener('touchmove', swallow, { passive: false });
soundBtn.addEventListener('click', soundToggle);
window.addEventListener('resize', relayout);
window.addEventListener('orientationchange', relayout);
reduced.addEventListener('change', (e) => {
  motion = e.matches ? 0.35 : 1.0;
  state = sim.motion(motion, state);
});

// -------------------------------------------------------------------- loop
let last = 0;

function frame(now) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
  last = now;
  const t0 = performance.now();
  state = sim.tick(dt, state);
  announce(state);
  drawFrame(state);
  offImg.data.set(new Uint8Array(buf.buffer));
  octx.putImageData(offImg, 0, 0);
  fade = Math.min(1, fade + dt / 1.1);
  ctx.globalAlpha = fade;
  ctx.drawImage(off, 0, 0);
  ctx.globalAlpha = 1;
  frames++;
  lastFrameMs = performance.now() - t0;
  requestAnimationFrame(frame);
}

relayout();
motion = reduced.matches ? 0.35 : 1.0;
state = sim.motion(motion, state);
requestAnimationFrame(frame);

// A small read-only handle so a smoke check can drive the piece.
window.lowTide = {
  size: () => ({ w: W, h: H, scale: SCALE }),
  read: () => JSON.parse(JSON.stringify(state)),
  poolCentre: (i) => {
    const p = state.pools[i];
    return { x: p.cx, y: p.cy };
  },
  tapWorld: (x, y) => { state = sim.tap(x, y, state); },
  pressWorld: (x, y) => { state = sim.press(x, y, state); },
  releaseWorld: () => { state = sim.release(state); },
  stats: () => ({
    frames,
    lastFrameMs,
    wakes: state.wakes,
    done: state.done,
    tide: state.tide,
    glade: state.glade,
    hint: state.hint,
    seq: state.seq,
    say: state.say,
    ripples: state.ripples.length,
  }),
  pixel: (x, y) => {
    const v = buf[Math.round(y) * W + Math.round(x)];
    return [v & 255, (v >> 8) & 255, (v >> 16) & 255];
  },
  budget: (n) => {
    const t0 = performance.now();
    let s = state;
    for (let i = 0; i < n; i++) s = sim.tick(0.0166, s);
    return (performance.now() - t0) / n;
  },
};
