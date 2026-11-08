// Dune Drift — a quiet moonlit dune field.
//
// AssemblyScript -> WebAssembly. The module has no imports and touches no DOM:
// it owns the terrain, the weather and the frame. The host only resizes it,
// taps it, steps it and blits the index buffer it hands back.
//
// Terrain is a per-column height field: sand stacks, so a dune is just a
// number, and a dune that gets too steep slumps one grain at a time until it
// rests at REPOSE. Nothing here can be destroyed — a tap either lets sand
// fall (the field grows) or nudges a crest downhill (the field shifts).
//
// Coordinates that reach this module are CSS pixels already mapped to cells
// and are plain doubles: fractional pointer positions must survive, so tap()
// takes f64 and never assumes whole numbers (the Aurora Ridge lesson).

const MAXW: i32 = 160;   // widest grid we will ever size to
const MAXH: i32 = 260;   // tallest grid
const NPART: i32 = 192;  // grains in flight
const NDUST: i32 = 160;  // dust motes
const NSTAR: i32 = 56;   // sky stars
const REPOSE: i32 = 4;   // cells of slope a dune keeps before it slumps

// --- static linear memory: fixed addresses, no allocator, no GC ------------
const HBUF  = memory.data(MAXW * 4, 4);       // i32 per column: grains of sand
const FBUF  = memory.data(MAXW * MAXH, 4);    // u8  per cell:   colour index
const PX    = memory.data(NPART * 8, 8);      // f64 grain positions / velocity
const PY    = memory.data(NPART * 8, 8);
const PV    = memory.data(NPART * 8, 8);
const PLIVE = memory.data(NPART * 4, 4);      // i32 grain live flag
const DX    = memory.data(NDUST * 8, 8);      // f64 dust motes
const DY    = memory.data(NDUST * 8, 8);
const DVX   = memory.data(NDUST * 8, 8);
const DVY   = memory.data(NDUST * 8, 8);
const DL    = memory.data(NDUST * 8, 8);      // f64 dust life, 1 -> 0
const SX    = memory.data(NSTAR * 8, 8);      // f64 star position / brightness
const SY    = memory.data(NSTAR * 8, 8);
const SA    = memory.data(NSTAR * 8, 8);

let dW: i32 = 96;        // current grid
let dH: i32 = 160;
let rng: u32 = 0x9e3779b9;

let settle: f64 = 0;     // whole-scene give: an eased spring, +down, rests at 0
let settleV: f64 = 0;    // its velocity; a landing adds only a small impulse
let moonGlow: f64 = 0;   // host-driven 0..1: warms the halo as a slow press nears
let wave: f64 = 0;       // hidden: a slow ripple run across the field
let waveX: f64 = 0;
let gustT: f64 = 9;      // seconds until the next slow gust
let gust: f64 = 0;
let twk: f64 = 0;        // star twinkle phase
let reduce: i32 = 0;     // prefers-reduced-motion
let events: i32 = 0;     // landings + nudges since the host last polled
let moonXf: f64 = 0.78;  // moon centre, as a fraction of the grid
let moonYf: f64 = 0.17;

// --- small deterministic PRNG (xorshift32) so tests can rely on it ---------
function frand(): f64 {
  rng ^= rng << 13;
  rng ^= rng >> 17;
  rng ^= rng << 5;
  return f64(rng) / 4294967296.0;
}

@inline function hGet(x: i32): i32 { return load<i32>(HBUF + (x << 2)); }
@inline function hSet(x: i32, v: i32): void { store<i32>(HBUF + (x << 2), v); }
@inline function cl(v: i32, lo: i32, hi: i32): i32 { return v < lo ? lo : (v > hi ? hi : v); }
@inline function f2c(v: f64, hi: i32): i32 { const i = i32(Math.floor(v)); return cl(i, 0, hi); }

// --- terrain ---------------------------------------------------------------

// One pass of soft slumping: wherever neighbours differ by more than REPOSE,
// a single grain crosses over. A dune therefore never holds a cliff — it
// gives, a grain at a time, which is the whole point of the piece.
function relax(iters: i32): void {
  for (let k = 0; k < iters; k++) {
    for (let x = 0; x < dW - 1; x++) {
      const d = hGet(x) - hGet(x + 1);
      if (d > REPOSE) { hSet(x, hGet(x) - 1); hSet(x + 1, hGet(x + 1) + 1); }
      else if (d < -REPOSE) { hSet(x, hGet(x) + 1); hSet(x + 1, hGet(x + 1) - 1); }
    }
    for (let x = dW - 2; x >= 0; x--) {
      const d = hGet(x) - hGet(x + 1);
      if (d > REPOSE) { hSet(x, hGet(x) - 1); hSet(x + 1, hGet(x + 1) + 1); }
      else if (d < -REPOSE) { hSet(x, hGet(x) + 1); hSet(x + 1, hGet(x + 1) - 1); }
    }
  }
}

function initField(): void {
  for (let i = 0; i < NPART; i++) store<i32>(PLIVE + (i << 2), 0);
  for (let i = 0; i < NDUST; i++) store<f64>(DL + (i << 3), 0);
  const h0 = f64(dH);
  for (let x = 0; x < dW; x++) {
    const t = f64(x) / f64(dW);
    let h = h0 * 0.30
      + h0 * 0.11 * Math.sin(t * 6.2831853 * 1.15 + 0.7)
      + h0 * 0.05 * Math.sin(t * 6.2831853 * 2.60 + 2.1)
      - h0 * 0.12 * t;                       // a gentle fall to the right
    hSet(x, cl(i32(Math.floor(h)), 2, dH - 4));
  }
  relax(60);
  settle = 0; settleV = 0; wave = 0; gust = 0; gustT = 9;
}

function initStars(): void {
  for (let i = 0; i < NSTAR; i++) {
    store<f64>(SX + (i << 3), frand());
    store<f64>(SY + (i << 3), frand() * 0.55);
    store<f64>(SA + (i << 3), 0.3 + frand() * 0.7);
  }
}

// --- dust ------------------------------------------------------------------
function spawnDust(cx: f64, cy: f64, n: i32, spread: f64): void {
  if (reduce != 0) return;                     // no ambient motion under reduce
  let placed = 0;
  for (let i = 0; i < NDUST && placed < n; i++) {
    if (load<f64>(DL + (i << 3)) > 0) continue;
    store<f64>(DX + (i << 3), cx + (frand() - 0.5) * spread);
    store<f64>(DY + (i << 3), cy - frand() * 1.5);
    store<f64>(DVX + (i << 3), (frand() - 0.5) * 6.0);
    store<f64>(DVY + (i << 3), -(3.0 + frand() * 5.0));
    store<f64>(DL + (i << 3), 1);
    placed++;
  }
}

function spawnGust(): void {
  for (let k = 0; k < 10; k++) {
    const col = f2c(frand() * f64(dW), dW - 1);
    spawnDust(f64(col) + 0.5, f64(dH - hGet(col)) - 1.0, 1, 1.0);
  }
}

// --- public API ------------------------------------------------------------

export function width(): i32 { return dW; }
export function height(): i32 { return dH; }
export function frame(): usize { return FBUF; }
export function amount(): f64 { return settle; }
export function poll(): i32 { const e = events; events = 0; return e; }

export function seed(v: u32): void { rng = v == 0 ? 1 : v; }
export function setReduce(v: i32): void {
  reduce = v != 0 ? 1 : 0;
  if (reduce != 0) { wave = 0; settle = 0; settleV = 0; }
}

// The host decides the grid from the viewport, so the scene fills a phone in
// portrait and a desktop window with no letterboxing and no distortion.
export function resize(w: i32, h: i32): void {
  dW = cl(w, 24, MAXW);
  dH = cl(h, 40, MAXH);
  initField();
  initStars();
}

// A tap carries fractional cell coordinates. On open sky it lets a small
// handful of sand go; on a dune it nudges the crest one grain downhill. Both
// gestures only ever move sand around — nothing is removed, nothing is lost.
export function tap(x: f64, y: f64): void {
  const col = f2c(x, dW - 1);
  const row = f2c(y, dH - 1);
  const skyline = dH - hGet(col);
  if (row >= skyline - 1) { nudge(col, row); return; }
  let n = 7 + i32(frand() * 5.0);
  for (let i = 0; i < NPART && n > 0; i++) {
    if (load<i32>(PLIVE + (i << 2)) != 0) continue;
    store<f64>(PX + (i << 3), f64(col) + 0.5 + (frand() - 0.5) * 5.0);
    store<f64>(PY + (i << 3), f64(row) + frand() * 2.0);
    store<f64>(PV + (i << 3), 2.0 + frand() * 5.0);
    store<i32>(PLIVE + (i << 2), 1);
    n--;
  }
}

function nudge(col: i32, row: i32): void {
  const hl = col > 0 ? hGet(col - 1) : 999999;
  const hr = col < dW - 1 ? hGet(col + 1) : 999999;
  const tgt = hl < hr ? col - 1 : col + 1;
  if (tgt >= 0 && tgt < dW && hGet(col) > 1) {
    hSet(col, hGet(col) - 1);
    hSet(tgt, hGet(tgt) + 1);
  }
  spawnDust(f64(col) + 0.5, f64(dH - hGet(col)), 3, 2.2);
  if (reduce == 0) settleV = Math.min(settleV + 4.0, 12.0);
  events++;
}

// Hidden: a slow press on the moon sends a ripple across the whole field.
export function ripple(): void { if (reduce == 0) { wave = 1; waveX = -18; } }

// The host feeds a slow press's progress here; past halfway the moon's halo
// warms a little — the only clue, and only when the secret is nearly there.
export function setMoonGlow(v: f64): void { moonGlow = v < 0 ? 0 : (v > 1 ? 1 : v); }

export function step(dt: f64): void {
  if (dt > 0.05) dt = 0.05;
  if (dt < 0) dt = 0;

  if (reduce == 0) {
    gustT -= dt;
    if (gustT <= 0) { gustT = 6 + frand() * 9; gust = 1; spawnGust(); }
    gust = Math.max(0, gust - dt * 0.7);
  }

  for (let i = 0; i < NPART; i++) {
    if (load<i32>(PLIVE + (i << 2)) == 0) continue;
    const x = load<f64>(PX + (i << 3));
    let v = load<f64>(PV + (i << 3)) + 120.0 * dt;
    let y = load<f64>(PY + (i << 3)) + v * dt;
    store<f64>(PV + (i << 3), v);
    const col = f2c(x, dW - 1);
    const top = f64(dH - hGet(col));
    if (y >= top) {
      hSet(col, cl(hGet(col) + 1, 0, dH - 2));
      store<i32>(PLIVE + (i << 2), 0);
      // Ease the landing: a capped impulse, never a snap, and a soft puff of
      // dust rather than a burst, so grains arrive softly.
      if (reduce == 0) {
        settleV = Math.min(settleV + 7.0, 12.0);
        spawnDust(x, top, 2, 1.6);
      }
      events++;
    } else {
      store<f64>(PY + (i << 3), y);
    }
  }

  relax(reduce == 0 ? 3 : 8);

  // The whole-scene give is a damped spring (critically damped, so no
  // overshoot): sand landing nudges its velocity down a little and the frame
  // eases back to rest, a breath instead of a jerk.
  if (reduce == 0) {
    settleV += (-settle * 40.0 - settleV * 12.6) * dt;
    settle += settleV * dt;
    if (settle > 0.55) { settle = 0.55; if (settleV > 0) settleV = 0; }
    if (settle < -0.20) { settle = -0.20; if (settleV < 0) settleV = 0; }
    if (Math.abs(settle) < 0.0015 && Math.abs(settleV) < 0.02) { settle = 0; settleV = 0; }
  } else {
    settle = 0; settleV = 0;
  }

  if (wave > 0) {
    waveX += dt * 22;
    wave = Math.max(0, wave - dt * 0.10);
    if (waveX > f64(dW) + 30) wave = 0;
  }

  for (let i = 0; i < NDUST; i++) {
    let l = load<f64>(DL + (i << 3));
    if (l <= 0) continue;
    l -= dt * (reduce == 0 ? 0.75 : 3.5);
    store<f64>(DY + (i << 3), load<f64>(DY + (i << 3)) + load<f64>(DVY + (i << 3)) * dt);
    store<f64>(DX + (i << 3), load<f64>(DX + (i << 3)) + load<f64>(DVX + (i << 3)) * dt);
    store<f64>(DVY + (i << 3), load<f64>(DVY + (i << 3)) * 0.96);
    store<f64>(DVX + (i << 3), load<f64>(DVX + (i << 3)) * 0.97 + gust * 6.0 * dt);
    store<f64>(DL + (i << 3), l > 0 ? l : 0);
  }
  if (reduce == 0) twk += dt;
}

// Colour indices written here are mapped to RGBA by the host:
//  1..6 sky gradient · 7 ripple glow · 8 moon halo · 9 moon · 10..15 sand
//  (deep -> rim) · 16/17 star · 18 dust · 19 falling grain
export function render(): void {
  for (let x = 0; x < dW; x++) {
    const hh = cl(hGet(x), 0, dH);
    const top = dH - hh;
    const slope = hGet(x < dW - 1 ? x + 1 : x) - hGet(x > 0 ? x - 1 : x);
    for (let y = 0; y < top; y++) {
      // Six sky colours, stippled across the band edges so the gradient reads
      // as a wash instead of six flat stripes.
      const bf = (f64(y) * 5.0) / f64(dH);
      let band = i32(Math.floor(bf));
      if (bf - f64(band) > 0.62 && ((x + y) & 1) == 0) band += 1;
      let idx = 1 + cl(band, 0, 5);
      if (wave > 0) {
        const b = f64(x) - waveX;
        if (b > -7.0 && b < 7.0) idx = 7;
      }
      store<u8>(FBUF + y * dW + x, u8(idx));
    }
    for (let y = top; y < dH; y++) {
      const depth = y - top;
      let s = 11;                                   // level ground, mid shade
      if (slope < -3) s = 15;                       // the lit face of a dune
      else if (slope < -1) s = 13;
      else if (slope > 1) s = 10;                   // the shadowed face
      if (depth > 7) s = 10;
      else if (depth > 3) s = cl(s, 10, 11);
      else if (depth > 1) s = cl(s, 10, 12);
      // stipple the depth steps so the shadow under each crest shades out
      if (depth > 1 && ((x + y) & 1) == 0) s = cl(s - 1, 10, 15);
      if (depth == 0) s = 14;                       // the crest catches the moon
      store<u8>(FBUF + y * dW + x, u8(s));
    }
  }

  for (let i = 0; i < NSTAR; i++) {
    const x = f2c(load<f64>(SX + (i << 3)) * f64(dW), dW - 1);
    const y = f2c(load<f64>(SY + (i << 3)) * f64(dH), dH - 1);
    if (y >= dH - hGet(x)) continue;                // hidden behind the dunes
    let a = load<f64>(SA + (i << 3));
    if (reduce == 0) a *= 0.55 + 0.45 * Math.sin(twk * 1.7 + f64(i));
    store<u8>(FBUF + y * dW + x, u8(a > 0.62 ? 17 : 16));
  }

  const mx = moonXf * f64(dW);
  const my = moonYf * f64(dH);
  const mr = Math.max(4.0, f64(dW) * 0.045);
  const x0 = i32(mx - mr - 4.0), x1 = i32(mx + mr + 4.0);
  const y0 = i32(my - mr - 4.0), y1 = i32(my + mr + 4.0);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (x < 0 || x >= dW || y < 0 || y >= dH) continue;
      const dx = f64(x) + 0.5 - mx, dy = f64(y) + 0.5 - my;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= mr) store<u8>(FBUF + y * dW + x, 9);
      else if (d <= mr + 3.5 + moonGlow * 4.0) store<u8>(FBUF + y * dW + x, moonGlow > 0.2 ? 7 : 8);
    }
  }

  for (let i = 0; i < NDUST; i++) {
    if (load<f64>(DL + (i << 3)) <= 0) continue;
    const x = f2c(load<f64>(DX + (i << 3)), dW - 1);
    const y = f2c(load<f64>(DY + (i << 3)), dH - 1);
    store<u8>(FBUF + y * dW + x, 18);
  }

  for (let i = 0; i < NPART; i++) {
    if (load<i32>(PLIVE + (i << 2)) == 0) continue;
    const x = f2c(load<f64>(PX + (i << 3)), dW - 1);
    const y = f2c(load<f64>(PY + (i << 3)), dH - 1);
    store<u8>(FBUF + y * dW + x, 19);
  }
}

// Exposed for the smoke test only.
export function heightAt(x: i32): i32 { return hGet(cl(x, 0, dW - 1)); }
export function liveGrains(): i32 {
  let n = 0;
  for (let i = 0; i < NPART; i++) if (load<i32>(PLIVE + (i << 2)) != 0) n++;
  return n;
}
export function cellAt(x: i32, y: i32): i32 {
  if (x < 0 || x >= dW || y < 0 || y >= dH) return -1;
  return i32(load<u8>(FBUF + y * dW + x));
}
