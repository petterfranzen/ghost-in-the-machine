// Snow Garden — a quiet snowy garden at dusk.
//
// Compiled with rustc straight to WebAssembly: no cargo, no wasm-bindgen, no
// allocator, no import object. The whole scene — sky, snow, walker, fox,
// snowfall and the colour-index frame buffer — lives in this module; the host
// only sizes it, taps it, steps it and blits the frame it hands back.
#![allow(static_mut_refs)]

// ---- palette indices (mirrored in src/host.js) ---------------------------
const C_SKY0: u8 = 1; // 1..=5 are the sky bands, 5 sits on the horizon
const C_HORIZON: u8 = 5;
const C_HEDGE: u8 = 6;
const C_SNOW_FAR: u8 = 8;
const C_SNOW_SHADOW: u8 = 9;
const C_SNOW_DIM: u8 = 10;
const C_SNOW_MID: u8 = 11;
const C_SNOW_LIGHT: u8 = 12;
const C_SNOW_BRIGHT: u8 = 13;
const C_AMBER: u8 = 15;
const C_LAMP: u8 = 16;
const C_STAR_DIM: u8 = 17;
const C_STAR: u8 = 18;
const C_WOOD_DARK: u8 = 19;
const C_WOOD: u8 = 20;
const C_COAT_DARK: u8 = 21;
const C_COAT: u8 = 22;
const C_MOON: u8 = 23;
const C_LAMPLIT: u8 = 24;
const C_PUFF: u8 = 25;
const C_FOOT: u8 = 26;
const C_FOX: u8 = 27;
const C_FOX_DARK: u8 = 28;
const C_FOX_TIP: u8 = 29;
const C_STONE_DARK: u8 = 30;
const C_STONE: u8 = 31;
const C_GATE: u8 = 32;
const C_BIRD: u8 = 33;
const C_BIRD_LIGHT: u8 = 34;

const MAXW: usize = 180;
const MAXH: usize = 280;
const MAGIC: f32 = 6_220_001.0; // < 2^24, so f32 keeps it exact
const SEED0: u32 = 20261110;
const NFLAKE_CALM: usize = 90;   // the snowfall's quiet, everyday count
const NFLAKE_EXTRA: usize = 60;  // the extra flakes a flurry raises
const NFLAKE: usize = NFLAKE_CALM + NFLAKE_EXTRA;
const NTRAIL: usize = 260;       // marks in the trail a drag draws
const NSMAN: usize = 3;          // the garden keeps three snowmen
const TRAIL_LIFE: f32 = 18.0;    // a drawn mark fills in over this long
const MELT_TIME: f32 = 9.0;      // a toppled snowman settles back over this long
const ROLL_TIME: f32 = 1.2;      // a held thumb rolls a ball this long
const BIRD_FLIGHT: f32 = 1.5;
const NPUFF: usize = 200;
const NFOOT: usize = 72;
const NSTAR: usize = 64;
const NEV: usize = 24;
const IDLE_FOX: f32 = 15.0;

/// An 8x8 Bayer matrix: gentle ordered dithering between two palette bands, so
/// a gradient reads as a gradient and not as a handful of hard stripes. Eight
/// is fine enough that the pattern does not read as a lattice on a phone.
const BAYER: [[f32; 8]; 8] = [
    [0.0, 32.0, 8.0, 40.0, 2.0, 34.0, 10.0, 42.0],
    [48.0, 16.0, 56.0, 24.0, 50.0, 18.0, 58.0, 26.0],
    [12.0, 44.0, 4.0, 36.0, 14.0, 46.0, 6.0, 38.0],
    [60.0, 28.0, 52.0, 20.0, 62.0, 30.0, 54.0, 22.0],
    [3.0, 35.0, 11.0, 43.0, 1.0, 33.0, 9.0, 41.0],
    [51.0, 19.0, 59.0, 27.0, 49.0, 17.0, 57.0, 25.0],
    [15.0, 47.0, 7.0, 39.0, 13.0, 45.0, 5.0, 37.0],
    [63.0, 31.0, 55.0, 23.0, 61.0, 29.0, 53.0, 21.0],
];

#[inline]
fn bayer(x: i32, y: i32) -> f32 {
    (BAYER[(y & 7) as usize][(x & 7) as usize] + 0.5) / 64.0
}

// ---- the walker and the fox, drawn as small pixel-art sprites ------------
// (0 is transparent; the numbers are palette indices)
static WALKER: [u8; 60] = [
    0, 0, 21, 21, 0, 0, //
    0, 21, 21, 21, 21, 0, //
    0, 21, 12, 12, 21, 0, //
    0, 15, 15, 15, 15, 0, //
    0, 22, 22, 22, 22, 0, //
    0, 22, 22, 22, 22, 0, //
    0, 21, 22, 22, 21, 0, //
    0, 21, 21, 21, 21, 0, //
    0, 21, 0, 0, 21, 0, //
    0, 21, 0, 0, 21, 0, //
];
static FOX: [u8; 98] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 0, 0, 0, //
    0, 0, 0, 0, 0, 0, 0, 0, 27, 28, 28, 28, 0, 0, //
    29, 27, 27, 27, 27, 27, 27, 27, 28, 28, 27, 0, 0, 0, //
    0, 27, 27, 27, 27, 27, 27, 27, 27, 28, 27, 27, 0, 0, //
    0, 27, 27, 27, 27, 27, 27, 27, 27, 0, 0, 0, 0, 0, //
    0, 28, 0, 28, 0, 0, 28, 0, 0, 0, 0, 0, 0, 0, //
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, //
];

static mut RNG: u32 = 0x1234_5678;
static mut SEED: u32 = SEED0;

static mut W: i32 = 0;
static mut H: i32 = 0;
static mut HORIZON: f32 = 0.0;
static mut REDUCE: i32 = 0;
static mut T: f32 = 0.0;
static mut READY: bool = false;

static mut SETTLE: f32 = 0.0;
static mut SETTLE_V: f32 = 0.0;

static mut WALK_X: f32 = 0.0;
static mut WALK_TX: f32 = 0.0;
static mut WALKING: i32 = 0;
static mut WALK_FRAME: i32 = 0;
static mut STEP_ACC: f32 = 0.0;

static mut LANTERN: i32 = 0;
static mut LAMP_X: f32 = 0.0;
static mut LAMP_Y: f32 = 0.0;

static mut FOX_STATE: i32 = 0; // 0 away, 1 crossing, 2 pausing
static mut FOX_X: f32 = 0.0;
static mut FOX_PAUSE: f32 = 0.0;
static mut FOX_SIDE: f32 = 1.0;
static mut FOX_COOLDOWN: f32 = 0.0;
static mut FOX_PAUSED: bool = false;

// The trail a drag draws in the snow: a ring buffer of marks, each with its own
// age, so the snow can fill it back in like the footprints.
static mut TRX: [f32; NTRAIL] = [0.0; NTRAIL];
static mut TRY: [f32; NTRAIL] = [0.0; NTRAIL];
static mut TRA: [f32; NTRAIL] = [TRAIL_LIFE + 1.0; NTRAIL];
static mut TRHEAD: usize = 0;
static mut TRDRAW: i32 = 0;
static mut TRLASTX: f32 = 0.0;
static mut TRLASTY: f32 = 0.0;

// The snowball a long press rolls, and the snowmen it leaves behind.
static mut BALL: i32 = 0;
static mut BALLX: f32 = 0.0;
static mut BALLY: f32 = 0.0;
static mut BALLR: f32 = 0.0;
static mut BALLTICK: f32 = 0.0;

static mut SMX: [f32; NSMAN] = [0.0; NSMAN];
static mut SMY: [f32; NSMAN] = [0.0; NSMAN];
static mut SMR: [f32; NSMAN] = [0.0; NSMAN];
static mut SMA: [i32; NSMAN] = [0; NSMAN];
static mut SMAGE: [f32; NSMAN] = [0.0; NSMAN];

// The bird on the tree, and the flurry a swipe across the sky raises.
static mut BIRD: i32 = 0;      // 0 on the tree, 1 flying, 2 on the gate
static mut BIRDT: f32 = 0.0;
static mut BIRDDIR: i32 = 1;   // 1 tree -> gate, -1 gate -> tree
static mut FLURRY: f32 = 0.0;

static mut IDLE: f32 = 0.0;

static mut EV: [i32; NEV] = [0; NEV];
static mut EV_HEAD: usize = 0;
static mut EV_TAIL: usize = 0;

static mut FOOTX: [f32; NFOOT] = [0.0; NFOOT];
static mut FOOTY: [f32; NFOOT] = [0.0; NFOOT];
static mut FOOTA: [f32; NFOOT] = [0.0; NFOOT];
static mut NFOOTING: usize = 0;

static mut PX: [f32; NPUFF] = [0.0; NPUFF];
static mut PY: [f32; NPUFF] = [0.0; NPUFF];
static mut PVX: [f32; NPUFF] = [0.0; NPUFF];
static mut PVY: [f32; NPUFF] = [0.0; NPUFF];
static mut PL: [f32; NPUFF] = [0.0; NPUFF];
static mut NPF: usize = 0;

static mut FX: [f32; NFLAKE] = [0.0; NFLAKE];
static mut FY: [f32; NFLAKE] = [0.0; NFLAKE];
static mut FS: [f32; NFLAKE] = [0.0; NFLAKE];
static mut FP: [f32; NFLAKE] = [0.0; NFLAKE];

static mut SX: [f32; NSTAR] = [0.0; NSTAR];
static mut SY: [f32; NSTAR] = [0.0; NSTAR];
static mut SP: [f32; NSTAR] = [0.0; NSTAR];
static mut SS: [f32; NSTAR] = [0.0; NSTAR];

static mut FRAME: [u8; MAXW * MAXH] = [0; MAXW * MAXH];

// ---- small helpers -------------------------------------------------------

#[inline]
fn hash2(x: i32, y: i32) -> f32 {
    let mut h = (x as u32).wrapping_mul(0x27d4_eb2d) ^ (y as u32).wrapping_mul(0x1656_67b1);
    h ^= h >> 15;
    h = h.wrapping_mul(0x2545_f491);
    h ^= h >> 13;
    (h & 0xffff) as f32 / 65536.0
}

#[inline]
unsafe fn rnd() -> f32 {
    RNG ^= RNG << 13;
    RNG ^= RNG >> 17;
    RNG ^= RNG << 5;
    ((RNG >> 8) as f32) / 16_777_216.0
}

#[inline]
unsafe fn rr(a: f32, b: f32) -> f32 {
    a + (b - a) * rnd()
}

#[inline]
unsafe fn put(x: i32, y: i32, c: u8) {
    if x >= 0 && y >= 0 && x < W && y < H {
        FRAME[(y as usize) * MAXW + x as usize] = c;
    }
}

#[inline]
unsafe fn get(x: i32, y: i32) -> u8 {
    if x >= 0 && y >= 0 && x < W && y < H {
        FRAME[(y as usize) * MAXW + x as usize]
    } else {
        0
    }
}

unsafe fn rect(x0: i32, y0: i32, x1: i32, y1: i32, c: u8) {
    let mut y = y0;
    while y <= y1 {
        let mut x = x0;
        while x <= x1 {
            put(x, y, c);
            x += 1;
        }
        y += 1;
    }
}

unsafe fn hline(x0: i32, x1: i32, y: i32, c: u8) {
    let mut x = x0;
    while x <= x1 {
        put(x, y, c);
        x += 1;
    }
}

unsafe fn line(x0: f32, y0: f32, x1: f32, y1: f32, c: u8) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    let n = dx.abs().max(dy.abs()).max(1.0);
    let mut i = 0.0;
    while i <= n {
        let t = i / n;
        put((x0 + dx * t).round() as i32, (y0 + dy * t).round() as i32, c);
        i += 1.0;
    }
}

/// Blit a sprite at (x0, y0). `flip` mirrors it left-to-right — for a sprite
/// drawn facing right, so a creature walking left still leads with its nose.
unsafe fn sprite(x0: i32, y0: i32, w: i32, h: i32, data: &[u8], flip: bool) {
    let mut j = 0;
    while j < h {
        let mut i = 0;
        while i < w {
            let si = if flip { w - 1 - i } else { i };
            let c = data[(j * w + si) as usize];
            if c != 0 {
                put(x0 + i, y0 + j, c);
            }
            i += 1;
        }
        j += 1;
    }
}

/// The line the snow surface runs along: the walker walks it, the props stand
/// on it, and the renderer fills below it.
#[inline]
unsafe fn snow_y(x: f32) -> f32 {
    let ground = ((H as f32) - HORIZON).max(1.0);
    let a = (x * 0.085).sin() * (ground * 0.030).clamp(1.0, 3.0);
    let b = (x * 0.27 + 1.7).sin() * (ground * 0.016).clamp(0.5, 1.6);
    HORIZON + ground * 0.42 + a + b
}

unsafe fn push_ev(code: i32) {
    let next = (EV_TAIL + 1) % NEV;
    if next == EV_HEAD {
        return; // full: drop the event, never block the scene
    }
    EV[EV_TAIL] = code;
    EV_TAIL = next;
}

unsafe fn spawn_puff(x: f32, y: f32, vx: f32, vy: f32, life: f32) {
    if NPF >= NPUFF {
        return;
    }
    PX[NPF] = x;
    PY[NPF] = y;
    PVX[NPF] = vx;
    PVY[NPF] = vy;
    PL[NPF] = life;
    NPF += 1;
}

/// A soft bloom of lifted snow: a tap's answer.
unsafe fn spawn_bloom(x: f32, y: f32, n: usize) {
    let mut i = 0;
    while i < n {
        let a = rr(0.0, 6.2832);
        let s = rr(1.5, 7.0);
        spawn_puff(
            x + rr(-2.5, 2.5),
            y - rr(0.0, 3.0),
            a.cos() * s,
            -a.sin().abs() * rr(1.0, 4.5),
            rr(0.6, 1.6),
        );
        i += 1;
    }
}

unsafe fn start_fox() {
    FOX_STATE = 1;
    FOX_PAUSED = false;
    FOX_SIDE = if rnd() < 0.5 { 1.0 } else { -1.0 };
    FOX_X = if FOX_SIDE > 0.0 { -14.0 } else { (W as f32) + 14.0 };
    push_ev(2); // "a fox crosses the garden"
}

/// A filled disc of snow, for the ball and the snowmen.
unsafe fn disc(cx: f32, cy: f32, r: f32, c: u8) {
    if r <= 0.2 {
        put(cx.round() as i32, cy.round() as i32, c);
        return;
    }
    let r2 = r * r;
    let mut y = (cy - r - 0.5).floor() as i32;
    let top = (cy + r + 0.5).ceil() as i32;
    while y <= top {
        let mut x = (cx - r - 0.5).floor() as i32;
        let right = (cx + r + 0.5).ceil() as i32;
        while x <= right {
            let dx = x as f32 + 0.5 - cx;
            let dy = y as f32 + 0.5 - cy;
            if dx * dx + dy * dy <= r2 {
                put(x, y, c);
            }
            x += 1;
        }
        y += 1;
    }
}

/// A drag in the snow draws a groove that fills in like the footprints; a drag
/// through the sky raises a flurry instead.
unsafe fn stroke_at(x: f32, y: f32) {
    if y < HORIZON {
        start_flurry();
        return;
    }
    let sx = x.clamp(2.0, (W as f32) - 2.0);
    let sy = y.clamp(HORIZON + 1.0, (H as f32) - 2.0);
    if TRDRAW == 0 {
        TRDRAW = 1;
        add_trail(sx, sy);
        spawn_bloom(sx, sy, 2);
    } else {
        let dx = sx - TRLASTX;
        let dy = sy - TRLASTY;
        let d = (dx * dx + dy * dy).sqrt();
        if d > 0.6 {
            let n = if d > 3.0 { (d / 1.4).ceil() } else { 1.0 };
            let mut k = 1.0;
            while k <= n {
                add_trail(TRLASTX + dx * (k / n), TRLASTY + dy * (k / n));
                k += 1.0;
            }
            if d > 6.0 {
                spawn_bloom(sx, sy, 1);
            }
        } else {
            TRLASTX = sx;
            TRLASTY = sy;
            return;
        }
    }
    TRLASTX = sx;
    TRLASTY = sy;
}

unsafe fn add_trail(x: f32, y: f32) {
    TRX[TRHEAD] = x;
    TRY[TRHEAD] = y;
    TRA[TRHEAD] = 0.0;
    TRHEAD = (TRHEAD + 1) % NTRAIL;
}

unsafe fn trail_live() -> i32 {
    let mut n = 0;
    let mut i = 0;
    while i < NTRAIL {
        if TRA[i] < TRAIL_LIFE {
            n += 1;
        }
        i += 1;
    }
    n
}

/// Heavier snowfall for a few seconds, then it calms down again by itself.
unsafe fn start_flurry() {
    if FLURRY < 0.20 {
        push_ev(5);
    }
    FLURRY = 1.0;
}

/// A ball sits on the snow: never above the surface line, never off the frame.
unsafe fn ball_place(x: f32, y: f32) -> (f32, f32) {
    let sx = x.clamp(3.0, (W as f32) - 3.0);
    // the foot of the frame sits under the dock's scrim, so a snowman stops
    // just above it and stays readable
    let floor = ((H as f32) * 0.90).max(HORIZON + 6.0);
    let sy = y.max(snow_y(sx)).clamp(HORIZON + 3.0, floor);
    (sx, sy)
}

unsafe fn start_ball(x: f32, y: f32) {
    let (sx, sy) = ball_place(x, y);
    BALL = 1;
    BALLX = sx;
    BALLY = sy;
    BALLR = 0.0;
    BALLTICK = 0.0;
}

unsafe fn roll_ball(x: f32, y: f32) {
    if BALL != 0 {
        let (sx, sy) = ball_place(x, y);
        BALLX = sx;
        BALLY = sy;
    }
}

unsafe fn release_ball() {
    if BALL == 0 {
        return;
    }
    BALL = 0;
    if BALLR < 0.12 {
        return; // held too briefly to gather any snow
    }
    let mut slot = -1;
    let mut k = 0;
    while k < NSMAN {
        if SMA[k] == 0 {
            slot = k as i32;
            break;
        }
        k += 1;
    }
    if slot < 0 {
        // Three already stand: the oldest settles back into the snow, so the
        // garden keeps three without ever losing one unasked.
        let mut oldest = 0;
        let mut best = -1.0;
        let mut j = 0;
        while j < NSMAN {
            if SMAGE[j] > best {
                best = SMAGE[j];
                oldest = j;
            }
            j += 1;
        }
        SMA[oldest] = 2;
        SMAGE[oldest] = 0.0;
        push_ev(9);
        slot = oldest as i32;
    }
    let i = slot as usize;
    SMX[i] = BALLX;
    SMY[i] = BALLY;
    SMR[i] = BALLR.clamp(0.35, 1.0);
    SMA[i] = 1;
    SMAGE[i] = 0.0;
    push_ev(8);
}

unsafe fn snowmen_standing() -> i32 {
    let mut n = 0;
    let mut k = 0;
    while k < NSMAN {
        if SMA[k] != 0 {
            n += 1;
        }
        k += 1;
    }
    n
}

/// Where the bird perches: the tree's lower branches, or the gate's snow cap.
unsafe fn perch(which: i32) -> (f32, f32) {
    if which == 0 {
        let tx = (W as f32) * 0.17;
        (tx + 4.0, snow_y(tx) - (H as f32) * 0.30 * 0.58)
    } else {
        let gx = (W as f32) * 0.72;
        (gx + 1.0, HORIZON - 13.0)
    }
}

unsafe fn bird_pos() -> (f32, f32) {
    let from = if BIRDDIR > 0 { 0 } else { 1 };
    let a = perch(from);
    let b = perch(1 - from);
    if BIRD != 1 {
        return if BIRD == 0 { perch(0) } else { perch(1) };
    }
    let t = BIRDT.clamp(0.0, 1.0);
    let e = t * t * (3.0 - 2.0 * t);
    let x = a.0 + (b.0 - a.0) * e;
    let y = a.1 + (b.1 - a.1) * e - 6.0 * (3.14159 * t).sin();
    let flap = ((T * 20.0).sin() * 1.2).round();
    (x, y + flap)
}

/// Tap the branches: a soft puff of snow comes off, and the bird flutters to
/// the other perch. He never leaves the garden.
unsafe fn shake_tree() {
    let tx = (W as f32) * 0.17;
    let base = snow_y(tx);
    let th = (H as f32) * 0.30;
    let mut i = 0;
    while i < 26 {
        let a = rr(0.0, 6.2832);
        let d = rnd();
        spawn_puff(
            tx + a.cos() * (th * 0.34) * d,
            base - th * 0.62 + a.sin() * (th * 0.24) * d,
            rr(-1.6, 1.6),
            rr(0.4, 2.6),
            rr(0.9, 2.2),
        );
        i += 1;
    }
    if BIRD == 1 {
        push_ev(6); // mid-flight: only the snow answers
    } else {
        BIRDDIR = if BIRD == 0 { 1 } else { -1 };
        BIRD = 1;
        BIRDT = 0.0;
        push_ev(7);
    }
}

// ---- layout (deterministic: same seed, same sky, every visit) ------------

unsafe fn place_stars() {
    let mut r = SEED ^ 0x51ed_2707;
    let mut i = 0;
    while i < NSTAR {
        r ^= r << 13;
        r ^= r >> 17;
        r ^= r << 5;
        let a = ((r >> 8) & 0xffff) as f32 / 65536.0;
        r ^= r << 13;
        r ^= r >> 17;
        r ^= r << 5;
        let b = ((r >> 8) & 0xffff) as f32 / 65536.0;
        r ^= r << 13;
        r ^= r >> 17;
        r ^= r << 5;
        let c = ((r >> 8) & 0xffff) as f32 / 65536.0;
        SX[i] = 1.0 + a * ((W as f32) - 3.0);
        SY[i] = 2.0 + b * (HORIZON * 0.80);
        SP[i] = c * 6.2832;
        SS[i] = 0.4 + c * 1.2;
        i += 1;
    }
}

unsafe fn place_flakes() {
    let mut r = SEED ^ 0x9e37_79b9;
    let mut i = 0;
    while i < NFLAKE {
        r ^= r << 13;
        r ^= r >> 17;
        r ^= r << 5;
        let a = ((r >> 8) & 0xffff) as f32 / 65536.0;
        r ^= r << 13;
        r ^= r >> 17;
        r ^= r << 5;
        let b = ((r >> 8) & 0xffff) as f32 / 65536.0;
        r ^= r << 13;
        r ^= r >> 17;
        r ^= r << 5;
        let c = ((r >> 8) & 0xffff) as f32 / 65536.0;
        FX[i] = a * (W as f32);
        FY[i] = b * (H as f32);
        FS[i] = 3.0 + c * 16.0;
        FP[i] = c * 6.2832;
        i += 1;
    }
}

// ---- the exported surface ------------------------------------------------

#[no_mangle]
pub extern "C" fn magic() -> f32 {
    MAGIC
}

#[no_mangle]
pub extern "C" fn seed(s: u32) {
    unsafe {
        SEED = if s == 0 { SEED0 } else { s };
        RNG = SEED ^ 0x5eed_1234;
        T = 0.0;
        LANTERN = 0;
        FOX_STATE = 0;
        FOX_X = -40.0;
        FOX_COOLDOWN = 0.0;
        IDLE = 0.0;
        NFOOTING = 0;
        NPF = 0;
        TRHEAD = 0;
        TRDRAW = 0;
        TRA = [TRAIL_LIFE + 1.0; NTRAIL];
        BALL = 0;
        BALLR = 0.0;
        SMA = [0; NSMAN];
        SMAGE = [0.0; NSMAN];
        BIRD = 0;
        BIRDT = 0.0;
        BIRDDIR = 1;
        FLURRY = 0.0;
        SETTLE = 0.0;
        SETTLE_V = 0.0;
        EV_HEAD = 0;
        EV_TAIL = 0;
        READY = false;
    }
}

#[no_mangle]
pub extern "C" fn resize(w: i32, h: i32) {
    unsafe {
        W = w.clamp(24, MAXW as i32);
        H = h.clamp(40, MAXH as i32);
        HORIZON = (H as f32) * 0.52;
        LAMP_X = (W as f32) * 0.88;
        LAMP_Y = snow_y(LAMP_X) - (H as f32) * 0.16;
        if !READY {
            READY = true;
            WALK_X = (W as f32) * 0.30;
            WALK_TX = WALK_X;
            WALKING = 0;
            FOX_X = -40.0;
        } else {
            WALK_X = WALK_X.clamp(4.0, (W as f32) - 4.0);
            WALK_TX = WALK_TX.clamp(4.0, (W as f32) - 4.0);
            FOX_X = FOX_X.min((W as f32) + 20.0);
            let mut k = 0;
            while k < NSMAN {
                if SMA[k] != 0 {
                    SMX[k] = SMX[k].clamp(3.0, (W as f32) - 3.0);
                    SMY[k] = SMY[k].clamp(HORIZON + 4.0, (H as f32) - 3.0);
                }
                k += 1;
            }
        }
        place_stars();
        place_flakes();
    }
}

#[no_mangle]
pub extern "C" fn set_reduce(on: i32) {
    unsafe {
        REDUCE = if on != 0 { 1 } else { 0 };
        if REDUCE != 0 {
            SETTLE = 0.0;
            SETTLE_V = 0.0;
        }
    }
}

#[no_mangle]
pub extern "C" fn tap(x: f32, y: f32) {
    unsafe {
        if !READY {
            return;
        }
        IDLE = 0.0;

        // The lantern: a small thing with a generous 18x18 world-pixel box.
        if (x - LAMP_X).abs() <= 9.0 && (y - LAMP_Y).abs() <= 9.0 {
            LANTERN = if LANTERN == 0 { 1 } else { 0 };
            push_ev(if LANTERN == 1 { 3 } else { 4 });
            spawn_bloom(LAMP_X, LAMP_Y + 2.0, 8);
            return;
        }

        // The stone bench: a still place. Resting a thumb on it calls the fox
        // out, so patience is never the only way to meet him.
        let bx = (W as f32) * 0.42;
        let by = snow_y(bx);
        if (x - bx).abs() <= 7.0 && (y - by).abs() <= 5.0 {
            if FOX_STATE == 0 && FOX_COOLDOWN <= 0.0 {
                start_fox();
            }
            spawn_bloom(bx, by, 8);
            return;
        }

        // A snowman you tap topples over; he settles back into the snow after a
        // while, so nothing is ever lost.
        let mut k = 0;
        while k < NSMAN {
            if SMA[k] != 0 {
                let r = 3.4 * SMR[k].clamp(0.35, 1.0);
                if (x - SMX[k]).abs() <= r + 3.0 && y >= SMY[k] - r * 5.0 - 2.0 && y <= SMY[k] + 3.0 {
                    if SMA[k] == 1 {
                        SMA[k] = 2;
                        SMAGE[k] = 0.0;
                        push_ev(10);
                    }
                    spawn_bloom(SMX[k], SMY[k], 10);
                    return;
                }
            }
            k += 1;
        }

        // The tree's branches: a tap shakes off a soft puff of snow.
        let tx = (W as f32) * 0.17;
        let tb = snow_y(tx);
        let th = (H as f32) * 0.30;
        if (x - tx).abs() <= 11.0 && y >= tb - th - 6.0 && y <= tb - th * 0.30 {
            shake_tree();
            spawn_bloom(tx, tb, 6);
            return;
        }

        // Anywhere else: the walker trudges there, and the whole scene gives.
        let tx = x.clamp(3.0, (W as f32) - 3.0);
        WALK_TX = tx;
        WALKING = 1;
        STEP_ACC = 0.0;
        if REDUCE == 0 {
            SETTLE_V = 4.2;
        }
        spawn_bloom(tx, snow_y(tx), 16);
    }
}

#[no_mangle]
pub extern "C" fn step(dt: f32) {
    unsafe {
        if !READY {
            return;
        }
        let dt = dt.clamp(0.0, 0.05);
        let ms = if REDUCE != 0 { 0.35 } else { 1.0 };
        T += dt;

        // snowfall drifts down and across — more of it, and faster, in a flurry
        let wind = 1.0 + 1.7 * FLURRY * ms;
        let mut i = 0;
        while i < NFLAKE {
            FY[i] += FS[i] * ms * wind * dt;
            FX[i] += ((T * 0.4 + FP[i]).sin() * 7.0 + 1.4 * ms * wind) * ms * dt * 4.0;
            if FX[i] > (W as f32) {
                FX[i] -= (W as f32);
            } else if FX[i] < 0.0 {
                FX[i] += (W as f32);
            }
            if FY[i] > (H as f32) {
                FY[i] = -1.0;
                FX[i] = rnd() * (W as f32);
            }
            i += 1;
        }

        // the walker
        if WALKING != 0 {
            let dx = WALK_TX - WALK_X;
            let speed = 15.0 * ms;
            if dx.abs() <= speed * dt + 0.4 {
                WALK_X = WALK_TX;
                WALKING = 0;
            } else {
                let step = if dx > 0.0 { speed * dt } else { -speed * dt };
                WALK_X += step;
                STEP_ACC += step.abs();
                WALK_FRAME += 1;
                if STEP_ACC > 5.0 {
                    STEP_ACC = 0.0;
                    let fy = snow_y(WALK_X);
                    if NFOOTING < NFOOT {
                        FOOTX[NFOOTING] = WALK_X;
                        FOOTY[NFOOTING] = fy + 1.0;
                        FOOTA[NFOOTING] = 0.0;
                        NFOOTING += 1;
                    }
                    spawn_bloom(WALK_X, fy + 1.0, 3);
                    push_ev(1); // a soft footstep
                }
                WALK_X = WALK_X.clamp(2.0, (W as f32) - 2.0);
            }
        }

        // lifted snow settles back
        i = 0;
        while i < NPF {
            PL[i] -= dt;
            if PL[i] <= 0.0 {
                let last = NPF - 1;
                PX[i] = PX[last];
                PY[i] = PY[last];
                PVX[i] = PVX[last];
                PVY[i] = PVY[last];
                PL[i] = PL[last];
                NPF -= 1;
                continue;
            }
            PVY[i] += 16.0 * dt;
            PX[i] += PVX[i] * ms * dt;
            PY[i] += PVY[i] * ms * dt;
            i += 1;
        }

        // the drawn trail fills in the same way
        i = 0;
        while i < NTRAIL {
            TRA[i] += dt;
            i += 1;
        }

        // a flurry dies down again on its own
        if FLURRY > 0.0 {
            FLURRY = (FLURRY - dt * 0.32).max(0.0);
        }

        // the snowball grows while the thumb is held
        if BALL != 0 {
            BALLR = (BALLR + dt / ROLL_TIME).min(1.0);
            BALLTICK += dt;
            if BALLTICK > 0.10 {
                BALLTICK = 0.0;
                spawn_puff(
                    BALLX + rr(-2.0, 2.0),
                    BALLY - rr(0.0, 3.0),
                    rr(-0.8, 0.8),
                    rr(-1.2, -0.2),
                    rr(0.4, 0.9),
                );
            }
        }

        // a toppled snowman settles back into the snow
        let mut k = 0;
        while k < NSMAN {
            if SMA[k] != 0 {
                SMAGE[k] += dt;
                if SMA[k] == 2 && SMAGE[k] > MELT_TIME {
                    SMA[k] = 0;
                }
            }
            k += 1;
        }

        // the bird's flight, perch to perch
        if BIRD == 1 {
            BIRDT += dt / BIRD_FLIGHT;
            if BIRDT >= 1.0 {
                BIRDT = 1.0;
                BIRD = if BIRDDIR > 0 { 2 } else { 0 };
            }
        }

        // footprints fill in slowly
        i = 0;
        while i < NFOOTING {
            FOOTA[i] += dt;
            if FOOTA[i] > 26.0 {
                let last = NFOOTING - 1;
                FOOTX[i] = FOOTX[last];
                FOOTY[i] = FOOTY[last];
                FOOTA[i] = FOOTA[last];
                NFOOTING -= 1;
                continue;
            }
            i += 1;
        }

        // the whole-scene give
        if REDUCE == 0 {
            SETTLE_V += (-42.0 * SETTLE - 9.0 * SETTLE_V) * dt;
            SETTLE += SETTLE_V * dt;
            if SETTLE.abs() < 0.0005 && SETTLE_V.abs() < 0.0005 {
                SETTLE = 0.0;
                SETTLE_V = 0.0;
            }
        } else {
            SETTLE = 0.0;
            SETTLE_V = 0.0;
        }

        // the fox: he crosses when the garden has been left alone a while
        IDLE += dt;
        if FOX_COOLDOWN > 0.0 {
            FOX_COOLDOWN -= dt;
        }
        if FOX_STATE == 0 && IDLE > IDLE_FOX && FOX_COOLDOWN <= 0.0 {
            start_fox();
        }
        if FOX_STATE == 1 {
            FOX_X += 9.0 * ms * dt * FOX_SIDE;
            let done = if FOX_SIDE > 0.0 {
                FOX_X > (W as f32) + 16.0
            } else {
                FOX_X < -16.0
            };
            let mid = (FOX_X - (W as f32) * 0.5).abs() < 4.0;
            if !FOX_PAUSED && mid {
                FOX_PAUSED = true;
                FOX_STATE = 2;
                FOX_PAUSE = 3.2;
            } else if done {
                FOX_STATE = 0;
                FOX_COOLDOWN = 20.0;
                IDLE = 0.0;
            }
        } else if FOX_STATE == 2 {
            FOX_PAUSE -= dt;
            if FOX_PAUSE <= 0.0 {
                FOX_STATE = 1;
            }
        }
    }
}

#[no_mangle]
pub extern "C" fn poll() -> i32 {
    unsafe {
        if EV_HEAD == EV_TAIL {
            return 0;
        }
        let v = EV[EV_HEAD];
        EV_HEAD = (EV_HEAD + 1) % NEV;
        v
    }
}

#[no_mangle]
pub extern "C" fn amount() -> f32 {
    unsafe { SETTLE }
}

/// The number of bytes between two rows of the frame buffer. The buffer is a
/// fixed MAXW x MAXH canvas, so a host drawing at another width must walk rows.
#[no_mangle]
pub extern "C" fn stride() -> i32 {
    MAXW as i32
}

#[no_mangle]
pub extern "C" fn frame() -> *const u8 {
    unsafe { FRAME.as_ptr() }
}

/// A read-only probe the smoke test and the browser check lean on.
#[no_mangle]
pub extern "C" fn probe(i: i32) -> f32 {
    unsafe {
        match i {
            0 => MAGIC,
            1 => W as f32,
            2 => H as f32,
            3 => WALK_X,
            4 => WALK_TX,
            5 => WALKING as f32,
            6 => LANTERN as f32,
            7 => FOX_STATE as f32,
            8 => FOX_X,
            9 => IDLE,
            10 => NFOOTING as f32,
            11 => SETTLE,
            12 => NPF as f32,
            13 => NFLAKE as f32,
            14 => REDUCE as f32,
            15 => HORIZON,
            16 => LAMP_X,
            17 => LAMP_Y,
            18 => snow_y(WALK_X),
            19 => FOX_SIDE,
            20 => T,
            21 => FLURRY,
            22 => BIRD as f32,
            23 => if BIRD == 1 { bird_pos().0 } else { perch(if BIRD == 0 { 0 } else { 1 }).0 },
            24 => if BIRD == 1 { bird_pos().1 } else { perch(if BIRD == 0 { 0 } else { 1 }).1 },
            25 => trail_live() as f32,
            26 => BALL as f32,
            27 => BALLR,
            28 => snowmen_standing() as f32,
            _ => 0.0,
        }
    }
}

/// A drag through the scene: it draws in the snow, or raises a flurry in the sky.
#[no_mangle]
pub extern "C" fn stroke(x: f32, y: f32) {
    unsafe {
        if !READY {
            return;
        }
        IDLE = 0.0;
        stroke_at(x, y);
    }
}

/// Lift the pen: the next stroke starts a fresh groove instead of joining this
/// one with a straight line across the garden.
#[no_mangle]
pub extern "C" fn stroke_end() {
    unsafe {
        TRDRAW = 0;
    }
}

/// A long press: the thumb rolls a ball where it is held.
#[no_mangle]
pub extern "C" fn press(x: f32, y: f32) {
    unsafe {
        if !READY {
            return;
        }
        IDLE = 0.0;
        start_ball(x, y);
    }
}

#[no_mangle]
pub extern "C" fn press_move(x: f32, y: f32) {
    unsafe {
        if BALL != 0 {
            IDLE = 0.0;
            roll_ball(x, y);
        }
    }
}

/// Let go: the ball becomes a small snowman, and stays.
#[no_mangle]
pub extern "C" fn release() {
    unsafe {
        if !READY {
            return;
        }
        release_ball();
    }
}

/// One snowman, by index: 0 x, 1 y, 2 state, 3 size.
#[no_mangle]
pub extern "C" fn snowman(i: i32, what: i32) -> f32 {
    unsafe {
        if i < 0 || i >= NSMAN as i32 {
            return 0.0;
        }
        let j = i as usize;
        match what {
            0 => SMX[j],
            1 => SMY[j],
            2 => SMA[j] as f32,
            3 => SMR[j],
            _ => 0.0,
        }
    }
}

#[no_mangle]
pub extern "C" fn trail_n() -> i32 {
    unsafe { trail_live() }
}

#[no_mangle]
pub extern "C" fn pixel(x: i32, y: i32) -> i32 {
    unsafe { get(x, y) as i32 }
}

// ---- the frame -----------------------------------------------------------

/// One limb: steps outward along `ang`, forking into two thinner twigs at its
/// tip, and settling a little snow on the fork.
unsafe fn branch(x: f32, y: f32, ang: f32, len: f32, depth: i32, thick: bool) {
    let mut px = x;
    let mut py = y;
    let mut i = 0.0;
    while i < len {
        px += ang.cos();
        py += ang.sin();
        put(px.round() as i32, py.round() as i32, if thick { C_WOOD } else { C_WOOD_DARK });
        if (thick && i < len * 0.45) || depth >= 2 {
            put(px.round() as i32 + 1, py.round() as i32, C_WOOD_DARK);
        }
        i += 1.0;
    }
    if depth > 0 {
        branch(px, py, ang - 0.42, len * 0.66, depth - 1, false);
        branch(px, py, ang + 0.34, len * 0.58, depth - 1, false);
        if depth <= 2 {
            put(px.round() as i32, py.round() as i32, C_SNOW_LIGHT);
        }
    }
}

unsafe fn draw_tree() {
    let tx = (W as f32) * 0.17;
    let base = snow_y(tx);
    let th = (H as f32) * 0.30;
    let fork = base - th * 0.42;
    let mut i = 0.0;
    while i < th * 0.42 {
        let y = (base - i).round() as i32;
        let half = 1.7 - 0.7 * (i / (th * 0.42));
        let x0 = (tx - half).round() as i32;
        let x1 = (tx + half).round() as i32;
        let mut x = x0;
        while x <= x1 {
            put(x, y, if (x as f32) <= tx { C_WOOD } else { C_WOOD_DARK });
            x += 1;
        }
        i += 1.0;
    }
    branch(tx, fork, -1.5708, th * 0.34, 3, true);
    branch(tx - 1.0, fork + 3.0, -2.34, th * 0.32, 2, false);
    branch(tx + 1.0, fork + 5.0, -0.86, th * 0.30, 2, false);
    branch(tx + 1.0, fork + 13.0, -0.52, th * 0.22, 2, false);
    put(tx.round() as i32, fork.round() as i32 - 1, C_SNOW_LIGHT);
}

unsafe fn draw_bench() {
    let bx = (W as f32) * 0.42;
    let by = snow_y(bx).round() as i32;
    let bxr = bx.round() as i32;
    rect(bxr - 6, by - 2, bxr + 6, by - 1, C_STONE);
    hline(bxr - 6, bxr + 6, by - 3, C_SNOW_LIGHT);
    put(bxr - 4, by, C_STONE_DARK);
    put(bxr - 4, by + 1, C_STONE_DARK);
    put(bxr + 4, by, C_STONE_DARK);
    put(bxr + 4, by + 1, C_STONE_DARK);
    hline(bxr - 6, bxr + 6, by + 2, C_SNOW_SHADOW);
}

unsafe fn draw_gate() {
    let gx = (W as f32) * 0.72;
    let gy = HORIZON.round() as i32;
    let gxr = gx.round() as i32;
    rect(gxr - 5, gy - 9, gxr + 5, gy, C_GATE);
    hline(gxr - 5, gxr + 5, gy - 6, C_WOOD_DARK);
    let mut x = gxr - 4;
    while x <= gxr + 4 {
        put(x, gy - 4, C_WOOD_DARK);
        put(x, gy - 2, C_WOOD_DARK);
        x += 2;
    }
    hline(gxr - 6, gxr + 6, gy - 10, C_SNOW_LIGHT);
    hline(gxr - 4, gxr + 4, gy - 11, C_SNOW_MID);
    put(gxr - 5, gy - 9, C_HEDGE);
    put(gxr + 5, gy - 9, C_HEDGE);
}

unsafe fn draw_lantern() {
    let lx = LAMP_X.round() as i32;
    let base = snow_y(LAMP_X);
    let top = LAMP_Y.round() as i32;
    let mut y = top;
    while y <= base.round() as i32 {
        put(lx, y, C_WOOD);
        put(lx + 1, y, C_WOOD_DARK);
        y += 1;
    }
    let core = if LANTERN != 0 { C_LAMP } else { C_AMBER };
    rect(lx - 3, top - 2, lx + 3, top + 2, C_WOOD_DARK);
    rect(lx - 2, top - 1, lx + 2, top + 1, core);
    if LANTERN != 0 {
        put(lx, top, C_LAMPLIT);
        put(lx, top - 1, C_LAMPLIT);
        put(lx, top + 1, C_LAMPLIT);
    }
    hline(lx - 4, lx + 5, top - 4, C_WOOD);
}

unsafe fn draw_snowman(i: usize) {
    if SMA[i] == 0 {
        return;
    }
    let x = SMX[i];
    let y = SMY[i];
    let s = SMR[i].clamp(0.35, 1.0);
    let b = 3.0 * s;
    let m = 2.1 * s;
    let hd = 1.4 * s;
    if SMA[i] == 1 {
        let c1y = y - b + 0.5;
        let c2y = c1y - b - m + 1.0;
        let c3y = c2y - m - hd + 1.0;
        // each ball: a shadow rim, then the snow, then the lit side. Without the
        // rim a white snowman on white snow is only a pair of eyes.
        disc(x, c1y, b + 0.7, C_SNOW_SHADOW);
        disc(x, c1y, b, C_SNOW_LIGHT);
        disc(x - b * 0.30, c1y - b * 0.30, b * 0.55, C_SNOW_BRIGHT);
        disc(x, c2y, m + 0.7, C_SNOW_SHADOW);
        disc(x, c2y, m, C_SNOW_LIGHT);
        disc(x - m * 0.30, c2y - m * 0.30, m * 0.55, C_SNOW_BRIGHT);
        disc(x, c3y, hd + 0.7, C_SNOW_SHADOW);
        disc(x, c3y, hd, C_SNOW_LIGHT);
        disc(x - hd * 0.25, c3y - hd * 0.25, hd * 0.6, C_SNOW_BRIGHT);
        // two eyes, a warm nose, two buttons
        put((x - 1.0).round() as i32, c3y.round() as i32, C_STONE_DARK);
        put((x + 1.0).round() as i32, c3y.round() as i32, C_STONE_DARK);
        put((x + hd + 0.7).round() as i32, (c3y - 0.2).round() as i32, C_AMBER);
        put(x.round() as i32, (c2y - 0.6).round() as i32, C_STONE_DARK);
        put(x.round() as i32, (c2y + 0.9).round() as i32, C_STONE_DARK);
        if s > 0.7 {
            line(x - m - 0.4, c2y, x - m - 2.2, c2y - 1.6, C_WOOD_DARK);
            line(x + m + 0.4, c2y, x + m + 2.2, c2y - 1.6, C_WOOD_DARK);
        }
    } else {
        // knocked over: he lies on his side and settles back into the snow
        let melt = (SMAGE[i] / MELT_TIME).clamp(0.0, 1.0);
        let c = if melt < 0.35 {
            C_SNOW_BRIGHT
        } else if melt < 0.7 {
            C_SNOW_LIGHT
        } else {
            C_SNOW_MID
        };
        let sh = 1.0 - 0.30 * melt;
        disc(x - b * 1.4, y - b * sh + 0.5, b * sh + 0.7, C_SNOW_SHADOW);
        disc(x, y - m * sh + 0.5, m * sh + 0.7, C_SNOW_SHADOW);
        disc(x + (b + m) * 0.8, y - hd * sh + 0.5, hd * sh + 0.7, C_SNOW_SHADOW);
        disc(x - b * 1.4, y - b * sh + 0.5, b * sh, c);
        disc(x, y - m * sh + 0.5, m * sh, c);
        disc(x + (b + m) * 0.8, y - hd * sh + 0.5, hd * sh, c);
        put((x - 1.0).round() as i32, (y - b * sh * 1.5).round() as i32, C_STONE_DARK);
        put((x + 1.0).round() as i32, (y - b * sh * 1.1).round() as i32, C_STONE_DARK);
    }
}

unsafe fn draw_bird() {
    let (bx, by) = bird_pos();
    let x = bx.round() as i32;
    let y = by.round() as i32;
    let f = if BIRDDIR > 0 { 1 } else { -1 };
    let flap = ((T * 18.0).sin() * 1.6).round() as i32;
    put(x, y, C_BIRD);
    put(x + f, y, C_BIRD);
    put(x - f, y + 1, C_BIRD_LIGHT);
    put(x + 2 * f, y - 1, C_BIRD);
    put(x + 3 * f, y - 1, C_BIRD_LIGHT);
    if BIRD == 1 {
        put(x + f, y - 1 - flap.abs(), C_BIRD_LIGHT);
        put(x - f, y + 1 + flap.abs(), C_BIRD_LIGHT);
    } else {
        put(x + f, y - 1, C_BIRD_LIGHT);
    }
}

#[no_mangle]
pub extern "C" fn render() {
    unsafe {
        if W < 1 || H < 1 {
            return;
        }
        let w = W;
        let h = H;

        // 1. the sky, banded from --bg up to a glow on the horizon
        let mut y = 0;
        while y < h {
            let row = (y as usize) * MAXW;
            let mut x = 0;
            while x < w {
                let t = (y as f32) / HORIZON.max(1.0);
                let f = (t * 4.0).min(3.999);
                let fl = f.floor();
                let mut c = C_SKY0 + fl as u8;
                if f - fl > bayer(x, y) {
                    c = (c + 1).min(C_HORIZON);
                }
                FRAME[row + x as usize] = c;
                x += 1;
            }
            y += 1;
        }

        // 2. stars
        let mut i = 0;
        while i < NSTAR {
            let tw = if REDUCE != 0 {
                1.0
            } else {
                0.55 + 0.45 * (T * SS[i] + SP[i]).sin()
            };
            let c = if tw > 0.72 {
                C_STAR
            } else if tw > 0.32 {
                C_STAR_DIM
            } else {
                0
            };
            if c != 0 {
                put(SX[i].round() as i32, SY[i].round() as i32, c);
            }
            i += 1;
        }

        // 3. the moon, a thin crescent high in the sky
        let mx = (w as f32) * 0.80;
        let my = (h as f32) * 0.15;
        let r = ((w as f32) * 0.035).max(3.0);
        let mut yy = (my - r - 1.0) as i32;
        while yy <= (my + r + 1.0) as i32 {
            let mut xx = (mx - r - 1.0) as i32;
            while xx <= (mx + r + 1.0) as i32 {
                let dx = xx as f32 + 0.5 - mx;
                let dy = yy as f32 + 0.5 - my;
                let d1 = (dx * dx + dy * dy).sqrt();
                let ex = xx as f32 + 0.5 - (mx + r * 0.44);
                let ey = yy as f32 + 0.5 - (my - r * 0.24);
                let d2 = (ex * ex + ey * ey).sqrt();
                if d1 <= r && d2 > r * 0.97 {
                    put(xx, yy, C_MOON);
                }
                xx += 1;
            }
            yy += 1;
        }

        // 4. the far hedge along the horizon, with a snow cap on its top
        let hb = HORIZON.round() as i32;
        let mut x = 0;
        while x < w {
            let wob = (x as f32 * 0.07).sin() * 1.2 + (x as f32 * 0.23 + 2.0).sin() * 0.6;
            let ht = (HORIZON - 4.0 + wob).round() as i32;
            let mut y2 = ht;
            while y2 < hb {
                put(x, y2, if y2 <= ht + 1 { C_SNOW_MID } else { C_HEDGE });
                y2 += 1;
            }
            x += 1;
        }

        // 5. the snow field: a dim far field, bright snow toward the viewer
        let mut y = hb;
        while y < h {
            let mut x2 = 0;
            while x2 < w {
                let sy = snow_y(x2 as f32);
                let c = if (y as f32) < sy {
                    let span = (sy - HORIZON).max(1.0);
                    let r = ((y as f32) - HORIZON) / span;
                    if r > 0.55 + 0.35 * bayer(x2, y) {
                        C_SNOW_SHADOW
                    } else {
                        C_SNOW_FAR
                    }
                } else if (y as f32) < sy + 1.0 {
                    C_SNOW_LIGHT
                } else {
                    let span = ((h as f32) - sy).max(1.0);
                    let t = ((y as f32) - sy) / span;
                    let wob = (x2 as f32 * 0.11 + y as f32 * 0.07).sin() * 0.05;
                    let f = ((t + wob) * 3.2).clamp(0.0, 2.999);
                    let fl = f.floor();
                    let mut base = C_SNOW_DIM + fl as u8;
                    if f - fl > bayer(x2, y) {
                        base = (base + 1).min(C_SNOW_BRIGHT);
                    }
                    // the odd glint, clustered so it reads as snow and not static
                    if base < C_SNOW_BRIGHT && hash2(x2 >> 1, y >> 1) > 0.993 {
                        base = C_SNOW_BRIGHT;
                    }
                    base
                };
                put(x2, y, c);
                x2 += 1;
            }
            y += 1;
        }

        // 6. the lantern's warm pool, drawn before the props in front of it
        if LANTERN != 0 {
            let gy = snow_y(LAMP_X);
            let gr = ((h as f32) * 0.17).clamp(10.0, 26.0);
            let mut yy = (gy - gr * 0.4) as i32;
            while yy <= (gy + gr) as i32 {
                let mut xx = (LAMP_X - gr) as i32;
                while xx <= (LAMP_X + gr) as i32 {
                    let dx = xx as f32 + 0.5 - LAMP_X;
                    let dy = yy as f32 + 0.5 - gy;
                    let d = (dx * dx + dy * dy).sqrt();
                    if d < gr {
                        let c = get(xx, yy);
                        if c >= C_SNOW_FAR && c <= C_SNOW_BRIGHT {
                            let boost = if d < gr * 0.40 {
                                2
                            } else if d < gr * 0.72 {
                                1
                            } else {
                                0
                            };
                            put(xx, yy, (c + boost).min(C_SNOW_BRIGHT));
                        }
                    }
                    xx += 1;
                }
                yy += 1;
            }
        }

        // 7. footprints, filling in as they age
        let mut i = 0;
        while i < NFOOTING {
            let a = FOOTA[i];
            let c = if a < 7.0 {
                C_FOOT
            } else if a < 15.0 {
                C_SNOW_SHADOW
            } else {
                C_SNOW_MID
            };
            let fx = FOOTX[i].round() as i32;
            let fy = FOOTY[i].round() as i32;
            put(fx, fy, c);
            put(fx + 1, fy - 1, c);
            i += 1;
        }

        // 7b. the trail you drew, filling in as it ages
        let mut i = 0;
        while i < NTRAIL {
            let a = TRA[i];
            if a < TRAIL_LIFE {
                let c = if a < 6.0 {
                    C_FOOT
                } else if a < 13.0 {
                    C_SNOW_SHADOW
                } else {
                    C_SNOW_MID
                };
                put(TRX[i].round() as i32, TRY[i].round() as i32, c);
            }
            i += 1;
        }

        // 8. the garden
        draw_tree();
        draw_bench();
        draw_gate();
        draw_lantern();

        // 8b. the snowmen, and the ball still being rolled
        let mut k = 0;
        while k < NSMAN {
            draw_snowman(k);
            k += 1;
        }
        if BALL != 0 {
            let r = 1.0 + 2.4 * BALLR;
            disc(BALLX, BALLY - r + 0.5, r + 0.7, C_SNOW_SHADOW);
            disc(BALLX, BALLY - r + 0.5, r, C_SNOW_LIGHT);
            disc(BALLX - r * 0.30, BALLY - r * 1.3 + 0.5, r * 0.55, C_SNOW_BRIGHT);
        }

        // 9. the fox
        if FOX_STATE != 0 {
            let fy = snow_y(FOX_X);
            let bob = if FOX_STATE == 1 {
                ((T * 9.0).sin() * 0.5).round() as i32
            } else {
                0
            };
            // The fox is drawn nose-to-the-right, so mirror him when he walks
            // left and he leads with his nose both ways. The sprite carries two
            // clear columns on its right, so the flipped box shifts them to the
            // left: the offset moves 2 px the other way to keep him centred on
            // FOX_X whichever way he is going.
            let fx = if FOX_SIDE > 0.0 {
                FOX_X - 6.0
            } else {
                FOX_X - 8.0
            };
            sprite(
                fx.round() as i32,
                fy.round() as i32 - 6 + bob,
                14,
                7,
                &FOX,
                FOX_SIDE < 0.0,
            );
        }

        // 9b. the bird
        draw_bird();

        // 10. the walker
        let wy = snow_y(WALK_X).round() as i32;
        let bob = if WALKING != 0 && (WALK_FRAME / 4) % 2 == 0 {
            0
        } else if WALKING != 0 {
            1
        } else {
            0
        };
        sprite(WALK_X.round() as i32 - 3, wy - 9 + bob, 6, 10, &WALKER, false);

        // 11. snowfall: the quiet count, and the extra a flurry raises
        let extra = (NFLAKE_EXTRA as f32 * (FLURRY * 1.6).min(1.0)).round() as usize;
        let mut i = 0;
        while i < NFLAKE_CALM + extra {
            let c = if FS[i] > 12.0 {
                C_PUFF
            } else if FS[i] > 7.0 {
                C_SNOW_LIGHT
            } else {
                C_SNOW_MID
            };
            put(FX[i].round() as i32, FY[i].round() as i32, c);
            i += 1;
        }

        // 12. lifted snow, nearest of all
        let mut i = 0;
        while i < NPF {
            put(PX[i].round() as i32, PY[i].round() as i32, C_PUFF);
            i += 1;
        }
    }
}

fn main() {}
