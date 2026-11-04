//! Drawing the pond. One full-frame pass paints water and moss, then the
//! living things go on top, ripples last so they read as light on the surface.
use crate::paint::{cos_t, hash2, hash3, mix, shade, sin_t, Painter, Rgb};
use crate::world::*;

// --- palette: dusk, moss, copper koi ---------------------------------------
const WATER_DEEP: Rgb = [26, 52, 60];
const WATER_MID: Rgb = [37, 70, 74];
const WATER_SHALLOW: Rgb = [54, 96, 90];
const WATER_RIM: Rgb = [18, 34, 40];
const FOAM: Rgb = [196, 226, 218];

const MOSS_DARK: Rgb = [26, 42, 32];
const MOSS_MID: Rgb = [43, 64, 42];
const MOSS_LIGHT: Rgb = [59, 85, 50];
const MOSS_EDGE: Rgb = [71, 97, 56];

const PAD_MID: Rgb = [86, 126, 82];
const PAD_DARK: Rgb = [54, 88, 60];
const PAD_EDGE: Rgb = [126, 168, 112];

const STONE: Rgb = [126, 124, 116];
const STONE_DARK: Rgb = [74, 72, 68];
const STONE_LIGHT: Rgb = [176, 172, 160];
const FLAME: Rgb = [255, 214, 148];
const WARM: Rgb = [255, 186, 104];
const FIREFLY: Rgb = [255, 238, 176];
const FLOWER: Rgb = [214, 226, 214];

const KOI_SKINS: [(Rgb, Rgb, Rgb); 3] = [
    ([240, 236, 226], [224, 122, 62], [124, 70, 44]), // cream and copper
    ([246, 243, 239], [196, 62, 60], [122, 42, 42]),  // white and red
    ([228, 198, 118], [150, 94, 44], [88, 56, 28]),   // dusk gold
];

/// The whole scene's give, in pixels, at this instant: a gentle shudder that
/// fades, damped by the motion scale so a reader who prefers reduced motion
/// gets half of it (see `set_motion_scale`).
pub fn settle_offsets(w: &World) -> (f32, f32) {
    let s = w.s[S_SETTLE] * crate::motion();
    (
        s * 2.1 * sin_t(w.s[S_SETTLE_T] * 3.4),
        s * 0.5 * sin_t(w.s[S_SETTLE_T] * 2.6 + 0.25),
    )
}

pub fn draw_scene(p: &mut Painter, w: &World) {
    let t = w.s[S_TIME];
    // the settle the scene reads, already damped by the motion scale
    let settle = w.s[S_SETTLE] * crate::motion();
    let (oy, ox) = settle_offsets(w);
    p.oy = oy;
    p.ox = 0.0;
    background(p, t, w.s[S_LANTERN]);
    p.ox = ox;
    lantern(p, w, t);
    pads(p, w, t, settle);
    for i in 0..KOI_N {
        koi(p, w, i, true);
    }
    for i in 0..KOI_N {
        koi(p, w, i, false);
    }
    ripples(p, w, t);
    impacts(p, w, t);
    fireflies(p, w, t);
    p.ox = 0.0;
    p.oy = 0.0;
}

#[inline]
fn vignette(fx: f32, fy: f32) -> f32 {
    let vx = (fx - 160.0) * (1.0 / 168.0);
    let vy = (fy - 120.0) * (1.0 / 132.0);
    let r2 = vx * vx + vy * vy;
    (1.0 - 0.34 * (r2 - 0.20).max(0.0)).clamp(0.0, 1.0)
}

/// One pixel of water. Kept free of libm: a smoothstep instead of a power, and
/// one sine per pixel at most, so a phone can paint the whole pond at 60 fps.
#[inline]
fn water_color(fx: f32, fy: f32, d: f32, t: f32, vig: f32, caust_y: f32) -> Rgb {
    let depth = d.clamp(0.0, 1.0);
    let sm = depth * depth * (3.0 - 2.0 * depth);
    let mut c = mix(WATER_DEEP, WATER_SHALLOW, sm);
    let sn = hash2((fx as i32) >> 2, (fy as i32) >> 2);
    if sn > 0.93 {
        c = mix(c, WATER_MID, 0.85);
    } else if sn < 0.05 {
        c = mix(c, WATER_DEEP, 0.45);
    }
    if depth > 0.06 {
        let caustic = sin_t(fx * 0.0105 + t * 0.043) * caust_y;
        if caustic > 0.62 {
            c = mix(c, FOAM, (caustic - 0.62) * 0.45 * depth);
        }
    }
    if depth > 0.90 {
        c = mix(c, WATER_RIM, (depth - 0.90) * 5.5); // shadow under the bank
    }
    shade(c, vig)
}

/// One pixel of moss. The texture never animates: the moss is the still part.
#[inline]
fn moss_color(fx: f32, fy: f32, d: f32, vig: f32) -> Rgb {
    let (x, y) = (fx as i32, fy as i32);
    let e = d - 1.0;
    let n = hash2(x >> 1, y >> 1);
    let mut c = if n < 0.30 {
        MOSS_DARK
    } else if n < 0.74 {
        MOSS_MID
    } else {
        MOSS_LIGHT
    };
    if e < 0.030 {
        c = mix(c, WATER_RIM, 0.55); // the wet dark line at the water's edge
    } else if e < 0.075 {
        c = mix(c, MOSS_EDGE, 0.55);
    } else if hash3(x >> 1, y >> 1, 7) > 0.955 {
        c = mix(c, MOSS_EDGE, 0.8); // a longer tuft
    } else if e > 0.05 && hash3(x >> 2, y >> 2, 11) > 0.9975 {
        c = mix(FLOWER, MOSS_LIGHT, 0.62); // a small pale bloom in the moss
    }
    shade(c, vig)
}

fn background(p: &mut Painter, t: f32, lantern: f32) {
    let oy = p.oy; // the shore moves with the settle, so the frame flexes
    let lantern = 0.35 + 0.65 * lantern;
    let (pw, ph) = (p.w, p.h);
    let w = pw as usize;
    let buf: &mut [u8] = p.buf;
    // The moss and water are painted two pixels at a time with direct byte
    // stores: it is flat colour and dither, so blending would be wasted work.
    let mut y = 0;
    while y < ph {
        let fy = y as f32 + 0.5;
        let dy = (fy - (PCY + oy)) / PB;
        let caust_y = sin_t((((y >> 1) << 1) as f32) * 0.017 - t * 0.031);
        let mut x = 0;
        while x < pw {
            let fx = x as f32 + 0.5;
            let dx = (fx - PCX) / PA;
            let d = (dx * dx + dy * dy).sqrt() + (hash2(x >> 2, y >> 2) - 0.5) * 0.085;
            let vig = vignette(fx, fy);
            if (d - 1.0).abs() >= 0.07 {
                let c = if d < 1.0 {
                    water_color(fx, fy, d, t, vig, caust_y)
                } else {
                    moss_color(fx, fy, d, vig)
                };
                let yy = (y + 2).min(ph);
                let xx = (x + 2).min(pw);
                for py in y..yy {
                    let row = py as usize * w;
                    for px in x..xx {
                        let i = (row + px as usize) * 4;
                        buf[i] = c[0];
                        buf[i + 1] = c[1];
                        buf[i + 2] = c[2];
                        buf[i + 3] = 255;
                    }
                }
            } else {
                // on the shoreline the water's edge has to stay crisp
                for py in y..(y + 2).min(ph) {
                    for px in x..(x + 2).min(pw) {
                        let (fxp, fyp) = (px as f32, py as f32);
                        let dxp = (fxp - PCX) / PA;
                        let dyp = (fyp - (PCY + oy)) / PB;
                        let dp = (dxp * dxp + dyp * dyp).sqrt()
                            + (hash2(px >> 2, py >> 2) - 0.5) * 0.085;
                        let cyp = sin_t((((py >> 1) << 1) as f32) * 0.017 - t * 0.031);
                        let vp = vignette(fxp, fyp);
                        let c = if dp < 1.0 {
                            water_color(fxp, fyp, dp, t, vp, cyp)
                        } else {
                            moss_color(fxp, fyp, dp, vp)
                        };
                        let i = (py as usize * w + px as usize) * 4;
                        buf[i] = c[0];
                        buf[i + 1] = c[1];
                        buf[i + 2] = c[2];
                        buf[i + 3] = 255;
                    }
                }
            }
            x += 2;
        }
        y += 2;
    }
    // the lantern's reflection: a warm, wobbling column in the water below it
    let wob = sin_t(t * 0.21) * 1.6 + sin_t(t * 0.37 + 0.3) * 0.9;
    let lx = LX + wob;
    let y0 = (LY + 6.0) as i32;
    for yy in y0..(H - 4) {
        let fy = yy as f32;
        for x in ((LX - 9.0) as i32)..=((LX + 9.0) as i32) {
            let fx = x as f32;
            let dx = (fx - PCX) / PA;
            let dy = (fy - PCY) / PB;
            let d = (dx * dx + dy * dy).sqrt();
            if d >= 0.97 {
                continue;
            }
            let off = (fx - lx).abs() / 8.0;
            if off >= 1.0 {
                continue;
            }
            let fall = (1.0 - off) * (1.0 - off);
            let ripple = sin_t(fy * 0.028 + t * 0.33) * 0.5 + 0.5;
            let a = fall * (0.10 + 0.15 * ripple) * (0.35 + 0.65 * d) * lantern;
            p.add(x, yy, WARM, a);
        }
    }
}


fn lantern(p: &mut Painter, w: &World, t: f32) {
    let lit = w.s[S_LANTERN];
    let flick = 0.86 + 0.14 * sin_t(t * 0.9) * sin_t(t * 0.37 + 0.2);
    let (x, y) = (LX, LY);
    // plinth and pillar
    p.rect(x - 9.0, y + 14.0, 18.0, 4.0, STONE_DARK, 1.0);
    p.rect(x - 7.0, y + 13.0, 14.0, 2.0, STONE, 1.0);
    p.rect(x - 3.0, y + 4.0, 6.0, 10.0, STONE, 1.0);
    p.rect(x - 3.0, y + 4.0, 1.5, 10.0, STONE_LIGHT, 0.7);
    // light box: three openings, a small flame behind each
    p.rect(x - 6.0, y - 7.0, 12.0, 11.0, STONE_DARK, 1.0);
    p.rect(x - 5.0, y - 6.0, 10.0, 9.0, STONE, 1.0);
    for k in 0..3 {
        let ox = -3.5 + k as f32 * 3.5;
        p.rect(x + ox, y - 4.5, 2.0, 6.0, shade(WARM, 0.55 + 0.45 * lit), 1.0);
        p.add((x + ox + 1.0) as i32, (y - 2.0) as i32, FLAME, 0.20 + 0.55 * lit * flick);
    }
    // roof and finial
    p.rect(x - 11.0, y - 10.0, 22.0, 3.0, STONE_DARK, 1.0);
    p.rect(x - 9.0, y - 12.0, 18.0, 2.0, STONE, 1.0);
    p.rect(x - 1.5, y - 15.0, 3.0, 3.0, STONE_LIGHT, 1.0);
    // its light on the moss, and a soft halo around the box
    p.glow(x, y - 1.0, 34.0 + 20.0 * lit, WARM, 0.10 + 0.16 * lit * flick, 2.1);
    p.glow(x, y - 2.0, 12.0 + 8.0 * lit, FLAME, 0.22 + 0.5 * lit * flick, 1.7);
}

fn pads(p: &mut Painter, w: &World, t: f32, settle: f32) {
    for i in 0..PAD_N {
        let b = PAD_BASE + i * PAD_STRIDE;
        let ph = w.s[b + 4];
        let bob = sin_t(t * 0.13 + ph) * 0.9 + settle * sin_t(w.s[S_SETTLE_T] * 3.1 + ph) * 1.6;
        let (x, y) = (w.s[b], w.s[b + 1] + bob);
        let r = w.s[b + 3];
        let a = w.s[b + 2];
        p.rot_ellipse(x + 2.0, y + 3.0, r * 1.02, r * 0.86, a, WATER_RIM, 0.30);
        let ca = cos_t(a);
        let sa = sin_t(a);
        for dy in -(r.ceil() as i32 + 1)..=(r.ceil() as i32 + 1) {
            for dx in -(r.ceil() as i32 + 1)..=(r.ceil() as i32 + 1) {
                let u = (dx as f32) * ca + (dy as f32) * sa;
                let v = -(dx as f32) * sa + (dy as f32) * ca;
                let q = (u / r) * (u / r) + (v / (r * 0.86)) * (v / (r * 0.86));
                if q > 1.0 {
                    continue;
                }
                // a wedge cut out of the near edge, as lily pads have
                if v > 0.0 && u.abs() < r * 0.30 {
                    continue;
                }
                let edge = q > 0.72;
                let c = if edge { PAD_EDGE } else { PAD_MID };
                let speck = hash2(dx + 8, dy + 8);
                let c = if speck > 0.87 { PAD_DARK } else { c };
                p.blend_xy(x + dx as f32, y + dy as f32, c, if edge { 0.95 } else { 1.0 });
            }
        }
        // a single pale blossom on the third pad
        if i == 2 {
            p.blend_xy(x - 1.0, y - 1.0, [246, 226, 232], 0.9);
            p.blend_xy(x + 1.0, y, [246, 226, 232], 0.7);
            p.blend_xy(x, y + 1.0, [236, 200, 212], 0.7);
        }
    }
}

fn koi(p: &mut Painter, w: &World, i: usize, shadow: bool) {
    let b = KOI_BASE + i * KOI_STRIDE;
    let skin = KOI_SKINS[(KOI_COLORS[i] as usize).min(KOI_SKINS.len() - 1)];
    let (base, patch, dark) = skin;
    let x = w.s[b + K_X] + if shadow { 1.6 } else { 0.0 };
    let y = w.s[b + K_Y] + if shadow { 3.2 } else { 0.0 };
    let h = w.s[b + K_HEAD];
    let phase = w.s[b + K_PHASE];
    let dx = cos_t(h);
    let dy = sin_t(h);
    let px_ = -dy;
    let py = dx;
    let a = if shadow { 0.26 } else { 1.0 };
    let len = 10.5f32;
    let wid = 4.7f32;
    let x0 = (x - 20.0).floor() as i32;
    let x1 = (x + 20.0).ceil() as i32;
    let y0 = (y - 20.0).floor() as i32;
    let y1 = (y + 20.0).ceil() as i32;
    for yy in y0..=y1 {
        for xx in x0..=x1 {
            let rx = xx as f32 - x;
            let ry = yy as f32 - y;
            let u = (rx * dx + ry * dy) / len;
            if !(-1.62..=1.02).contains(&u) {
                continue;
            }
            let v = rx * px_ + ry * py;
            let sway = ((1.0 - u).clamp(0.0, 2.6) * 0.55 + 0.12).min(1.25);
            let wave = sin_t(u * 0.31 + phase) * 3.0 * sway;
            let vv = v - wave;
            let (inside, edge, belly) = if u >= -1.02 {
                let body = wid * (0.52 + 0.48 * (1.0 - u * u).max(0.0).sqrt()) * (0.84 + 0.16 * u);
                (vv.abs() <= body, vv.abs() > body - 1.05, vv > body * 0.34)
            } else {
                // tail fin: two lobes with a notch between them
                let k = (-(u) - 1.02) / 0.60;
                let span = 0.5 + 3.0 * k;
                let notch = k > 0.40 && vv.abs() < 0.9;
                (vv.abs() <= span && !notch, vv.abs() > span - 0.85, false)
            };
            if !inside {
                continue;
            }
            let c = if shadow {
                WATER_RIM
            } else if edge {
                dark
            } else {
                let pe = hash2((u * 6.0 + 30.0) as i32, (vv * 1.1 + 12.0) as i32);
                if pe > 0.63 {
                    patch
                } else if belly {
                    mix(base, [255, 253, 246], 0.5)
                } else {
                    base
                }
            };
            p.blend_xy(xx as f32, yy as f32, c, a);
        }
    }
    if shadow {
        return;
    }
    // pectoral fins
    let fx = x + dx * len * 0.28;
    let fy = y + dy * len * 0.28;
    for s in [-1.0f32, 1.0] {
        let ox = px_ * s * (wid + 1.9);
        let oy = py * s * (wid + 1.9);
        p.rot_ellipse(fx + ox, fy + oy, 3.4, 1.7, h + s * 0.06, mix(base, dark, 0.35), 0.85);
    }
    // a small caught light on the head
    p.add_xy(x + dx * len * 0.86, y + dy * len * 0.86, [255, 252, 240], 0.10);
}

fn ripples(p: &mut Painter, w: &World, _t: f32) {
    for i in 0..RIP_N {
        let b = RIP_BASE + i * RIP_STRIDE;
        let life = w.s[b + R_LIFE];
        let age = w.s[b + R_AGE];
        if life <= 0.0 || age < 0.0 || age >= life {
            continue;
        }
        let k = age / life;
        let a = w.s[b + R_STRENGTH] * (1.0 - k).powf(1.7);
        let r = 1.6 + w.s[b + R_SPEED] * age;
        let (x, y) = (w.s[b + R_X], w.s[b + R_Y]);
        // rings only live on the water: skip what has reached the shore
        if pond_d(x + r, y) > 0.99 || pond_d(x, y + r) > 0.99 {
            continue;
        }
        p.ring(x, y, r, FOAM, a * 0.45);
    }
}

fn impacts(p: &mut Painter, w: &World, t: f32) {
    for i in 0..SPL_N {
        let b = SPL_BASE + i * SPL_STRIDE;
        let life = w.s[b + P_LIFE];
        let age = w.s[b + P_AGE];
        if life <= 0.0 || age >= life {
            continue;
        }
        let k = age / life;
        let (x, y) = (w.s[b + P_X], w.s[b + P_Y]);
        if w.s[b + P_KIND] < 0.5 {
            // a bloom of light where the pebble went in, then it is gone
            let r = 4.0 + 26.0 * k;
            p.glow(x, y, r, [236, 244, 236], 0.55 * (1.0 - k).powf(1.6), 1.8);
            p.glow(x, y, 7.0 + 9.0 * k, WARM, 0.25 * (1.0 - k).powf(2.0), 1.5);
            // the pebble itself, sinking and dimming
            let s = (1.0 - k * 1.2).max(0.0);
            p.disc(x, y, 1.5 * s + 0.4, [46, 46, 48], 0.75 * (1.0 - k));
            // a little crown of spray
            for n in 0..7 {
                let an = n as f32 / 7.0 + hash2(i as i32, n) * 0.1;
                let d = 2.0 + 9.0 * k;
                let sx = x + cos_t(an) * d;
                let sy = y + sin_t(an) * d * 0.7;
                p.blend_xy(sx, sy, FOAM, 0.5 * (1.0 - k).powf(2.2));
            }
        } else {
            // moss: a small puff of dust and loosened needles
            let n = 6;
            for j in 0..n {
                let an = hash3(i as i32, j, 1);
                let d = 1.5 + 10.0 * k;
                let sx = x + cos_t(an) * d;
                let sy = y + sin_t(an) * d * 0.6 - 3.0 * k;
                let c = if j % 2 == 0 { MOSS_EDGE } else { MOSS_LIGHT };
                p.blend_xy(sx, sy, c, 0.85 * (1.0 - k).powf(1.4));
            }
            let _ = t;
        }
    }
}

fn fireflies(p: &mut Painter, w: &World, t: f32) {
    for i in 0..FLY_N {
        let b = FLY_BASE + i * FLY_STRIDE;
        let ph = w.s[b + 4];
        let blink = sin_t(t * 0.055 + ph * 2.7);
        let lit = if blink > 0.0 { blink.powf(1.6) } else { 0.0 };
        if lit < 0.02 {
            continue;
        }
        let (x, y) = (w.s[b], w.s[b + 1]);
        p.glow(x, y, 7.0, FIREFLY, 0.30 * lit, 2.2);
        p.add_xy(x, y, [255, 250, 224], (0.85 * lit).min(1.0));
    }
}
