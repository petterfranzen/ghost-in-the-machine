//! Tiny software rasteriser: 320x240 RGBA, alpha-blended primitives.
//! Everything is drawn into one flat framebuffer that the JS host blits.
pub type Rgb = [u8; 3];

/// Deterministic noise in [0,1) from an integer lattice point. Used for dither
/// and for the koi's patches, so a pattern stays glued to a fish as it swims.
pub fn hash2(x: i32, y: i32) -> f32 {
    let mut h = (x as u32).wrapping_mul(0x9E37_79B1) ^ (y as u32).wrapping_mul(0x85EB_CA6B);
    h ^= h >> 15;
    h = h.wrapping_mul(0x2545_F491);
    h ^= h >> 13;
    (h & 0xFFFF) as f32 / 65536.0
}

/// A second hash, for slow-drifting things that must not line up with the first.
pub fn hash3(x: i32, y: i32, z: i32) -> f32 {
    let mut h = (x as u32).wrapping_mul(0x9E37_79B1)
        ^ (y as u32).wrapping_mul(0x85EB_CA6B)
        ^ (z as u32).wrapping_mul(0xC2B2_AE35);
    h ^= h >> 16;
    h = h.wrapping_mul(0x7FEB_352D);
    h ^= h >> 15;
    (h & 0xFFFF) as f32 / 65536.0
}

const TBL: usize = 1024;
static mut SIN: [f32; TBL] = [0.0; TBL];

/// One-time: build a sine table so the hot per-pixel loops never call libm.
pub fn init_trig() {
    let t = unsafe { &mut *(&raw mut SIN) };
    for (i, v) in t.iter_mut().enumerate() {
        let a = (i as f32 / TBL as f32) * core::f32::consts::TAU;
        *v = a.sin();
    }
}

/// Sine of `turns`, where 1.0 is a full turn.
#[inline]
pub fn sin_t(turns: f32) -> f32 {
    let i = ((turns * TBL as f32) as i32) & (TBL as i32 - 1);
    unsafe { *(&raw const SIN).cast::<f32>().add(i as usize) }
}

#[inline]
pub fn cos_t(turns: f32) -> f32 {
    sin_t(turns + 0.25)
}

pub fn mix(a: Rgb, b: Rgb, t: f32) -> Rgb {
    let t = t.clamp(0.0, 1.0);
    [
        (a[0] as f32 + (b[0] as f32 - a[0] as f32) * t) as u8,
        (a[1] as f32 + (b[1] as f32 - a[1] as f32) * t) as u8,
        (a[2] as f32 + (b[2] as f32 - a[2] as f32) * t) as u8,
    ]
}

pub fn shade(c: Rgb, k: f32) -> Rgb {
    [
        (c[0] as f32 * k).clamp(0.0, 255.0) as u8,
        (c[1] as f32 * k).clamp(0.0, 255.0) as u8,
        (c[2] as f32 * k).clamp(0.0, 255.0) as u8,
    ]
}

pub struct Painter<'a> {
    pub buf: &'a mut [u8],
    pub w: i32,
    pub h: i32,
    /// Whole-scene offsets, used for the little settle after a pebble lands.
    pub ox: f32,
    pub oy: f32,
}

impl<'a> Painter<'a> {
    pub fn new(buf: &'a mut [u8], w: i32, h: i32) -> Self {
        Painter { buf, w, h, ox: 0.0, oy: 0.0 }
    }

    /// Source-over blend of one pixel.
    #[inline]
    pub fn blend(&mut self, x: i32, y: i32, c: Rgb, a: f32) {
        if a <= 0.0 || x < 0 || y < 0 || x >= self.w || y >= self.h {
            return;
        }
        let a = a.min(1.0);
        let i = ((y * self.w + x) * 4) as usize;
        let ia = 1.0 - a;
        for k in 0..3 {
            let d = self.buf[i + k] as f32;
            self.buf[i + k] = (d * ia + c[k] as f32 * a).clamp(0.0, 255.0) as u8;
        }
    }

    /// Additive blend — what makes light feel like light and never goes flat.
    #[inline]
    pub fn add(&mut self, x: i32, y: i32, c: Rgb, a: f32) {
        if a <= 0.0 || x < 0 || y < 0 || x >= self.w || y >= self.h {
            return;
        }
        let i = ((y * self.w + x) * 4) as usize;
        for k in 0..3 {
            let d = self.buf[i + k] as f32 + c[k] as f32 * a;
            self.buf[i + k] = d.clamp(0.0, 255.0) as u8;
        }
    }

    #[inline]
    pub fn blend_xy(&mut self, x: f32, y: f32, c: Rgb, a: f32) {
        self.blend((x + self.ox) as i32, (y + self.oy) as i32, c, a);
    }

    #[inline]
    pub fn add_xy(&mut self, x: f32, y: f32, c: Rgb, a: f32) {
        self.add((x + self.ox) as i32, (y + self.oy) as i32, c, a);
    }

    pub fn disc(&mut self, cx: f32, cy: f32, r: f32, c: Rgb, a: f32) {
        let x0 = (cx - r).floor() as i32;
        let x1 = (cx + r).ceil() as i32;
        let y0 = (cy - r).floor() as i32;
        let y1 = (cy + r).ceil() as i32;
        let r2 = r * r;
        for y in y0..=y1 {
            for x in x0..=x1 {
                let dx = x as f32 - cx;
                let dy = y as f32 - cy;
                if dx * dx + dy * dy <= r2 {
                    self.blend_xy(x as f32, y as f32, c, a);
                }
            }
        }
    }

    /// A soft radial light. `falloff` is how quickly it dies away.
    pub fn glow(&mut self, cx: f32, cy: f32, r: f32, c: Rgb, a: f32, falloff: f32) {
        if a <= 0.001 || r <= 0.2 {
            return;
        }
        let x0 = (cx - r).floor() as i32;
        let x1 = (cx + r).ceil() as i32;
        let y0 = (cy - r).floor() as i32;
        let y1 = (cy + r).ceil() as i32;
        let inv = 1.0 / (r * r);
        for y in y0..=y1 {
            for x in x0..=x1 {
                let dx = x as f32 - cx;
                let dy = y as f32 - cy;
                let d2 = (dx * dx + dy * dy) * inv;
                if d2 >= 1.0 {
                    continue;
                }
                let f0 = 1.0 - d2;
                let f = if falloff >= 1.9 { f0 * f0 } else { f0 * f0.sqrt() };
                self.add_xy(x as f32, y as f32, c, a * f);
            }
        }
    }

    /// An expanding ring, walked along the circle so the cost grows with the
    /// radius and not with its square. The stroke is a chain of 2x2 dots,
    /// which is exactly what a pixel-art ripple looks like.
    pub fn ring(&mut self, cx: f32, cy: f32, r: f32, c: Rgb, a: f32) {
        if a <= 0.004 || r <= 0.2 {
            return;
        }
        let steps = ((r * 5.0).ceil() as i32).clamp(30, 1200);
        let inv = 1.0 / steps as f32;
        for i in 0..steps {
            let an = i as f32 * inv;
            let xi = (cx + cos_t(an) * r) as i32;
            let yi = (cy + sin_t(an) * r) as i32;
            self.blend_xy(xi as f32, yi as f32, c, a * 0.55);
            self.blend_xy((xi + 1) as f32, yi as f32, c, a * 0.30);
            self.blend_xy(xi as f32, (yi + 1) as f32, c, a * 0.30);
        }
    }

    /// A rotated ellipse with a soft edge — the brush the koi are painted with.
    pub fn rot_ellipse(&mut self, cx: f32, cy: f32, a: f32, b: f32, ang_turns: f32, c: Rgb, alpha: f32) {
        let ca = cos_t(ang_turns);
        let sa = sin_t(ang_turns);
        let rad = a.max(b) + 1.0;
        let x0 = (cx - rad).floor() as i32;
        let x1 = (cx + rad).ceil() as i32;
        let y0 = (cy - rad).floor() as i32;
        let y1 = (cy + rad).ceil() as i32;
        for y in y0..=y1 {
            for x in x0..=x1 {
                let dx = x as f32 - cx;
                let dy = y as f32 - cy;
                let u = dx * ca + dy * sa;
                let v = -dx * sa + dy * ca;
                let q = (u / a) * (u / a) + (v / b) * (v / b);
                if q <= 1.0 {
                    let e = (1.0 - q).sqrt().min(1.0);
                    self.blend_xy(x as f32, y as f32, c, alpha * (0.45 + 0.55 * e));
                }
            }
        }
    }
}

impl<'a> Painter<'a> {
    /// Axis-aligned rectangle, softened at the edges by half a pixel.
    pub fn rect(&mut self, x0: f32, y0: f32, w: f32, h: f32, c: Rgb, a: f32) {
        let xa = x0.floor() as i32;
        let xb = (x0 + w).ceil() as i32;
        let ya = y0.floor() as i32;
        let yb = (y0 + h).ceil() as i32;
        for y in ya..yb {
            for x in xa..xb {
                self.blend_xy(x as f32, y as f32, c, a);
            }
        }
    }
}
