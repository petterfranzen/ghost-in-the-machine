//! The pond's rules. All state lives in one flat f32 array so the JS host, the
//! node smoke test and the Rust unit tests can all read the same numbers.
use crate::paint::{cos_t, hash2, sin_t};

pub const W: i32 = 320;
pub const H: i32 = 240;

// --- pond geometry (also used by the renderer) ------------------------------
pub const PCX: f32 = 158.0;
pub const PCY: f32 = 126.0;
pub const PA: f32 = 124.0;
pub const PB: f32 = 88.0;
/// Where the stone lantern sits, on the mossy bank.
pub const LX: f32 = 263.0;
pub const LY: f32 = 44.0;

/// Normalised distance from the pond's centre: < 1 is water.
#[inline]
pub fn pond_d(x: f32, y: f32) -> f32 {
    let dx = (x - PCX) / PA;
    let dy = (y - PCY) / PB;
    (dx * dx + dy * dy).sqrt()
}

#[inline]
pub fn is_water(x: f32, y: f32) -> bool {
    pond_d(x, y) < 0.965
}

// --- flat state layout -----------------------------------------------------
// header
pub const S_SIG: usize = 0;
pub const S_TIME: usize = 1;
pub const S_SETTLE: usize = 2;
pub const S_SETTLE_T: usize = 3;
pub const S_LANTERN: usize = 4;
pub const S_TAPS: usize = 5;
pub const S_IN_WATER: usize = 6;
pub const S_IN_MOSS: usize = 7;
pub const S_SEEKS: usize = 8;
pub const S_LAST_KIND: usize = 9;
/// When the last pebble landed, so a flurry of pointerdowns is one pebble.
pub const S_LAST_TAP: usize = 10;
pub const S_HEADER: usize = 16;

// koi: x, y, heading, speed, phase, state, tx, ty, mood, wander
pub const KOI_STRIDE: usize = 10;
pub const KOI_N: usize = 4;
pub const KOI_BASE: usize = S_HEADER;
pub const K_X: usize = 0;
pub const K_Y: usize = 1;
pub const K_HEAD: usize = 2;
pub const K_SPEED: usize = 3;
pub const K_PHASE: usize = 4;
pub const K_STATE: usize = 5;
pub const K_TX: usize = 6;
pub const K_TY: usize = 7;
pub const K_MOOD: usize = 8;
pub const K_WANDER: usize = 9;

// ripples: x, y, age, life, speed, strength, rings
pub const RIP_STRIDE: usize = 7;
pub const RIP_N: usize = 24;
pub const RIP_BASE: usize = KOI_BASE + KOI_N * KOI_STRIDE;
pub const R_X: usize = 0;
pub const R_Y: usize = 1;
pub const R_AGE: usize = 2;
pub const R_LIFE: usize = 3;
pub const R_SPEED: usize = 4;
pub const R_STRENGTH: usize = 5;

// impacts: x, y, age, life, kind (0 = water, 1 = moss)
pub const SPL_STRIDE: usize = 5;
pub const SPL_N: usize = 24;
pub const SPL_BASE: usize = RIP_BASE + RIP_N * RIP_STRIDE;
pub const P_X: usize = 0;
pub const P_Y: usize = 1;
pub const P_AGE: usize = 2;
pub const P_LIFE: usize = 3;
pub const P_KIND: usize = 4;

// lily pads: x, y, angle, size, bob phase
pub const PAD_STRIDE: usize = 5;
pub const PAD_N: usize = 6;
pub const PAD_BASE: usize = SPL_BASE + SPL_N * SPL_STRIDE;

// fireflies: x, y, vx, vy, phase
pub const FLY_STRIDE: usize = 5;
pub const FLY_N: usize = 7;
pub const FLY_BASE: usize = PAD_BASE + PAD_N * PAD_STRIDE;

pub const LEN: usize = FLY_BASE + FLY_N * FLY_STRIDE;
/// A signature that f32 can hold exactly (< 2^24), so the host can check it.
pub const SIG: f32 = 202611.0;

pub const KOI_COLORS: [f32; KOI_N] = [0.0, 1.0, 2.0, 1.0];

pub struct World {
    pub s: [f32; LEN],
    rng: u32,
}

impl World {
    /// A zeroed pond, for the static slot; `new` seeds the real thing.
    pub const fn empty() -> Self {
        World { s: [0.0; LEN], rng: 1 }
    }

    pub fn new(seed: u32) -> Self {
        // the sine table must exist before anything is placed with cos_t/sin_t
        crate::paint::init_trig();
        let mut w = World { s: [0.0; LEN], rng: seed | 1 };
        w.s[S_SIG] = SIG;
        w.s[S_LAST_TAP] = -10.0;
        for i in 0..KOI_N {
            let b = KOI_BASE + i * KOI_STRIDE;
            let a = i as f32 / KOI_N as f32;
            w.s[b + K_X] = PCX + cos_t(a) * PA * 0.45;
            w.s[b + K_Y] = PCY + sin_t(a) * PB * 0.45;
            w.s[b + K_HEAD] = a + 0.5;
            w.s[b + K_SPEED] = 9.0;
            w.s[b + K_PHASE] = w.rand() * 1.0;
            w.s[b + K_STATE] = 0.0;
            w.s[b + K_MOOD] = 0.0;
            w.s[b + K_WANDER] = 2.0 + w.rand() * 5.0;
            let (tx, ty) = w.wander_point();
            w.s[b + K_TX] = tx;
            w.s[b + K_TY] = ty;
        }
        for i in 0..PAD_N {
            let b = PAD_BASE + i * PAD_STRIDE;
            let a = (i as f32 * 0.618 + 0.13) % 1.0;
            w.s[b] = PCX + cos_t(a) * PA * (0.30 + 0.42 * ((i as f32 * 0.37) % 1.0));
            w.s[b + 1] = PCY + sin_t(a) * PB * (0.22 + 0.48 * ((i as f32 * 0.53) % 1.0));
            w.s[b + 2] = w.rand();
            w.s[b + 3] = 7.0 + w.rand() * 4.0;
            w.s[b + 4] = w.rand();
        }
        for i in 0..FLY_N {
            let b = FLY_BASE + i * FLY_STRIDE;
            // on the rim at dusk: just outside the water's edge, all the way round
            let a = (i as f32 * 0.37 + w.rand() * 0.25) % 1.0;
            let f = 1.05 + w.rand() * 0.22;
            w.s[b] = (PCX + cos_t(a) * PA * f).clamp(7.0, W as f32 - 7.0);
            w.s[b + 1] = (PCY + sin_t(a) * PB * f).clamp(7.0, H as f32 - 7.0);
            w.s[b + 2] = (w.rand() - 0.5) * 6.0;
            w.s[b + 3] = (w.rand() - 0.5) * 4.0;
            w.s[b + 4] = w.rand();
        }
        w
    }

    #[inline]
    fn rand(&mut self) -> f32 {
        // xorshift32 -> [0,1)
        self.rng ^= self.rng << 13;
        self.rng ^= self.rng >> 17;
        self.rng ^= self.rng << 5;
        (self.rng >> 8) as f32 / 16777216.0
    }

    /// A new aim point out in the open water, comfortably inside the shallows.
    fn wander_point(&mut self) -> (f32, f32) {
        let a = self.rand();
        let r = (0.12 + 0.62 * self.rand()).sqrt();
        (PCX + cos_t(a) * PA * 0.72 * r, PCY + sin_t(a) * PB * 0.72 * r)
    }

    pub fn koi(&self, i: usize) -> usize {
        KOI_BASE + i * KOI_STRIDE
    }

    // --- the one gesture ----------------------------------------------------
    /// A pebble from the thumb. `kind` comes back in the state so the host can
    /// choose a soft plop for water or a duller tap for moss.
    pub fn tap(&mut self, x: f32, y: f32) {
        let t = self.s[S_TIME];
        if t - self.s[S_LAST_TAP] < 0.06 {
            return; // a flurry of pointerdowns should not stack pebbles
        }
        let x = x.clamp(4.0, W as f32 - 4.0);
        let y = y.clamp(4.0, H as f32 - 4.0);
        let water = is_water(x, y);
        self.s[S_TAPS] += 1.0;
        self.s[S_SETTLE] = 1.0;
        self.s[S_SETTLE_T] = 0.0;
        self.s[S_LANTERN] = (self.s[S_LANTERN] + 0.5).min(1.0);
        if water {
            self.s[S_IN_WATER] += 1.0;
            self.s[S_LAST_KIND] = 0.0;
            for k in 0..3 {
                let b = self.spawn_ripple();
                let f = k as f32;
                self.s[b + R_X] = x;
                self.s[b + R_Y] = y;
                self.s[b + R_AGE] = -0.24 * f;
                self.s[b + R_LIFE] = 3.4 + 0.55 * f;
                self.s[b + R_SPEED] = 30.0 - 6.0 * f;
                self.s[b + R_STRENGTH] = 1.0 / (1.0 + 0.75 * f);
            }
            let b = self.spawn_impact();
            self.s[b + P_X] = x;
            self.s[b + P_Y] = y;
            self.s[b + P_AGE] = 0.0;
            self.s[b + P_LIFE] = 1.5;
            self.s[b + P_KIND] = 0.0;
            // every koi within reach turns to look, then drifts over
            for i in 0..KOI_N {
                let b = self.koi(i);
                let dx = self.s[b + K_X] - x;
                let dy = self.s[b + K_Y] - y;
                if dx * dx + dy * dy < 150.0 * 150.0 {
                    if self.s[b + K_STATE] != 2.0 {
                        self.s[b + K_STATE] = 1.0;
                        self.s[b + K_TX] = x;
                        self.s[b + K_TY] = y;
                        self.s[S_SEEKS] += 1.0;
                    }
                }
            }
        } else {
            self.s[S_IN_MOSS] += 1.0;
            self.s[S_LAST_KIND] = 1.0;
            let b = self.spawn_impact();
            self.s[b + P_X] = x;
            self.s[b + P_Y] = y;
            self.s[b + P_AGE] = 0.0;
            self.s[b + P_LIFE] = 0.9;
            self.s[b + P_KIND] = 1.0;
        }
        self.s[S_LAST_TAP] = t;
    }

    fn spawn_ripple(&mut self) -> usize {
        // reuse the oldest finished ripple if the pool is full
        let mut best = RIP_BASE;
        let mut best_age = -1e9;
        for i in 0..RIP_N {
            let b = RIP_BASE + i * RIP_STRIDE;
            let dead = self.s[b + R_AGE] >= self.s[b + R_LIFE];
            let age = if dead { 1e9 } else { self.s[b + R_AGE] };
            if age > best_age {
                best_age = age;
                best = b;
            }
        }
        best
    }

    fn spawn_impact(&mut self) -> usize {
        let mut best = SPL_BASE;
        let mut best_age = -1e9;
        for i in 0..SPL_N {
            let b = SPL_BASE + i * SPL_STRIDE;
            let dead = self.s[b + P_AGE] >= self.s[b + P_LIFE];
            let age = if dead { 1e9 } else { self.s[b + P_AGE] };
            if age > best_age {
                best_age = age;
                best = b;
            }
        }
        best
    }

    // --- one step of time ---------------------------------------------------
    pub fn step(&mut self, dt: f32) {
        let dt = dt.clamp(0.0, 0.05);
        let t = self.s[S_TIME] + dt;
        self.s[S_TIME] = t;
        let decay = (-2.4 * dt).exp();
        self.s[S_SETTLE] *= decay;
        if self.s[S_SETTLE] < 0.0015 {
            self.s[S_SETTLE] = 0.0;
        }
        self.s[S_SETTLE_T] += dt;
        self.s[S_LANTERN] *= (-1.1 * dt).exp();

        for i in 0..RIP_N {
            let b = RIP_BASE + i * RIP_STRIDE;
            if self.s[b + R_AGE] < self.s[b + R_LIFE] {
                self.s[b + R_AGE] += dt;
            }
        }
        for i in 0..SPL_N {
            let b = SPL_BASE + i * SPL_STRIDE;
            if self.s[b + P_AGE] < self.s[b + P_LIFE] {
                self.s[b + P_AGE] += dt;
            }
        }
        for i in 0..FLY_N {
            let b = FLY_BASE + i * FLY_STRIDE;
            let ph = self.s[b + 4];
            self.s[b + 2] = self.s[b + 2] * (1.0 - 0.7 * dt)
                + cos_t(t * 0.03 + ph) * 5.0 * dt
                + (hash2((t * 37.0) as i32, i as i32) - 0.5) * 6.0 * dt;
            self.s[b + 3] = self.s[b + 3] * (1.0 - 0.7 * dt)
                + sin_t(t * 0.021 + ph * 1.7) * 3.0 * dt
                + (hash2(i as i32, (t * 41.0) as i32) - 0.5) * 4.0 * dt;
            self.s[b] += self.s[b + 2] * dt;
            self.s[b + 1] += self.s[b + 3] * dt;
            // they keep to the moss: never out over the water, never off frame
            let pd = pond_d(self.s[b], self.s[b + 1]);
            if pd < 1.02 {
                let ang = atan2_turns(self.s[b + 1] - PCY, self.s[b] - PCX);
                self.s[b] = PCX + cos_t(ang) * PA * 1.05;
                self.s[b + 1] = PCY + sin_t(ang) * PB * 1.05;
                // slide along the shore instead of stopping dead
                let tx = -sin_t(ang) * 3.0;
                let ty = cos_t(ang) * 3.0;
                self.s[b + 2] = self.s[b + 2] * 0.6 + tx * 0.4;
                self.s[b + 3] = self.s[b + 3] * 0.6 + ty * 0.4;
            }
            let (nx, ny) = (
                self.s[b].clamp(7.0, W as f32 - 7.0),
                self.s[b + 1].clamp(7.0, H as f32 - 7.0),
            );
            if nx != self.s[b] {
                self.s[b + 2] = -self.s[b + 2];
            }
            if ny != self.s[b + 1] {
                self.s[b + 3] = -self.s[b + 3];
            }
            self.s[b] = nx;
            self.s[b + 1] = ny;
        }

        for i in 0..KOI_N {
            self.step_koi(i, dt, t);
        }
    }

    fn step_koi(&mut self, i: usize, dt: f32, t: f32) {
        let b = self.koi(i);
        let state = self.s[b + K_STATE];
        let (k_x, k_y) = (self.s[b + K_X], self.s[b + K_Y]);
        let mut tx = self.s[b + K_TX];
        let mut ty = self.s[b + K_TY];
        let mut want: f32 = 11.0;
        let mut turn = 0.5;

        match state as i32 {
            0 => {
                let d = dist(k_x, k_y, tx, ty);
                self.s[b + K_WANDER] -= dt;
                if d < 16.0 || self.s[b + K_WANDER] <= 0.0 {
                    let (nx, ny) = self.wander_point();
                    tx = nx;
                    ty = ny;
                    self.s[b + K_WANDER] = 3.0 + self.rand() * 6.0;
                }
                // curious koi may notice a pebble even from a distance
                if self.s[S_SETTLE] > 0.45 && self.rand() < 0.02 {
                    self.s[b + K_STATE] = 1.0; // notices the splash next step
                }
            }
            1 => {
                want = 26.0;
                turn = 1.4;
                let d = dist(k_x, k_y, tx, ty);
                if d < 22.0 {
                    self.s[b + K_STATE] = 2.0;
                    self.s[b + K_MOOD] = 3.5 + self.rand() * 3.5;
                }
            }
            _ => {
                want = 13.0;
                turn = 1.1;
                self.s[b + K_MOOD] -= dt;
                // circle the pebble for a while: aim at a point that walks
                // around the splash
                let a = t * 0.11 + self.s[b + K_PHASE];
                tx = self.s[b + K_TX] + cos_t(a) * 19.0;
                ty = self.s[b + K_TY] + sin_t(a) * 14.0;
                if self.s[b + K_MOOD] <= 0.0 {
                    let (nx, ny) = self.wander_point();
                    self.s[b + K_STATE] = 0.0;
                    tx = nx;
                    ty = ny;
                    self.s[b + K_WANDER] = 4.0 + self.rand() * 6.0;
                }
            }
        }

        // steer: turn towards the aim point at a limited rate, so a koi carves
        // a curve instead of snapping to a new heading
        let desire = atan2_turns(ty - k_y, tx - k_x);
        let mut delta = desire - self.s[b + K_HEAD];
        while delta > 0.5 {
            delta -= 1.0;
        }
        while delta < -0.5 {
            delta += 1.0;
        }
        let lim = turn * dt;
        self.s[b + K_HEAD] += delta.clamp(-lim, lim);

        // keep to the water: past the shallows, turn back towards the middle
        let pd = pond_d(k_x, k_y);
        if pd > 0.80 {
            let home = atan2_turns(PCY - k_y, PCX - k_x);
            let mut d2 = home - self.s[b + K_HEAD];
            while d2 > 0.5 {
                d2 -= 1.0;
            }
            while d2 < -0.5 {
                d2 += 1.0;
            }
            self.s[b + K_HEAD] += d2.clamp(-2.6 * dt, 2.6 * dt);
            if pd > 0.94 {
                want = want.min(8.0);
            }
        }

        let sp = self.s[b + K_SPEED] + (want - self.s[b + K_SPEED]) * (1.2 * dt).min(1.0);
        self.s[b + K_SPEED] = sp;
        self.s[b + K_HEAD] = self.s[b + K_HEAD].rem_euclid(1.0);
        let h = self.s[b + K_HEAD];
        self.s[b + K_X] = k_x + cos_t(h) * sp * dt;
        self.s[b + K_Y] = k_y + sin_t(h) * sp * dt;
        self.s[b + K_TX] = tx;
        self.s[b + K_TY] = ty;
        self.s[b + K_PHASE] += (0.35 + sp * 0.045) * dt;
        if self.s[b + K_PHASE] > 1.0 {
            self.s[b + K_PHASE] -= 1.0;
        }
    }
}

#[inline]
fn dist(ax: f32, ay: f32, bx: f32, by: f32) -> f32 {
    let dx = ax - bx;
    let dy = ay - by;
    (dx * dx + dy * dy).sqrt()
}

/// atan2 in turns (1.0 = a full circle), so it can feed sin_t/cos_t directly.
#[inline]
pub fn atan2_turns(y: f32, x: f32) -> f32 {
    let a = y.atan2(x);
    a / core::f32::consts::TAU
}

#[cfg(test)]
mod tests {
    use super::*;

    fn world() -> World {
        World::new(7)
    }

    #[test]
    fn opens_with_four_koi_in_the_water() {
        let w = world();
        assert_eq!(w.s[S_SIG], SIG);
        for i in 0..KOI_N {
            let b = w.koi(i);
            assert!(pond_d(w.s[b + K_X], w.s[b + K_Y]) < 0.9, "koi {i} starts on the bank");
            assert!(w.s[b + K_SPEED] > 0.0);
        }
        for i in 0..PAD_N {
            let b = PAD_BASE + i * PAD_STRIDE;
            assert!(pond_d(w.s[b], w.s[b + 1]) < 0.95, "a lily pad floats on land");
        }
        for i in 0..FLY_N {
            let b = FLY_BASE + i * FLY_STRIDE;
            assert!(pond_d(w.s[b], w.s[b + 1]) > 0.9, "a firefly is over the water");
        }
    }

    #[test]
    fn a_pebble_on_the_water_ripples_and_settles_the_scene() {
        let mut w = world();
        w.step(1.0 / 60.0);
        w.tap(PCX, PCY);
        assert_eq!(w.s[S_IN_WATER], 1.0);
        assert_eq!(w.s[S_IN_MOSS], 0.0);
        assert_eq!(w.s[S_LAST_KIND], 0.0);
        assert!(w.s[S_SETTLE] > 0.9, "the scene should settle when a pebble lands");
        assert!(w.s[S_LANTERN] > 0.4, "the lantern answers a pebble");
        let live = (0..RIP_N)
            .filter(|i| {
                let b = RIP_BASE + i * RIP_STRIDE;
                w.s[b + R_LIFE] > 0.0
            })
            .count();
        assert_eq!(live, 3, "three rings per pebble");
        assert!(w.s[S_SEEKS] >= 1.0, "at least one koi should come to look");
    }

    #[test]
    fn moss_takes_a_pebble_without_a_ripple() {
        let mut w = world();
        w.tap(12.0, 12.0);
        assert_eq!(w.s[S_IN_MOSS], 1.0);
        assert_eq!(w.s[S_IN_WATER], 0.0);
        assert_eq!(w.s[S_LAST_KIND], 1.0);
        for i in 0..RIP_N {
            let b = RIP_BASE + i * RIP_STRIDE;
            assert_eq!(w.s[b + R_LIFE], 0.0, "moss does not ripple");
        }
        assert!(w.s[S_SETTLE] > 0.9, "a pebble on the bank still settles the frame");
    }

    #[test]
    fn two_pebbles_in_the_same_instant_do_not_stack() {
        let mut w = world();
        w.tap(PCX, PCY);
        w.tap(PCX + 4.0, PCY);
        assert_eq!(w.s[S_TAPS], 1.0);
    }

    #[test]
    fn ripples_fade_out_and_the_water_goes_still() {
        let mut w = world();
        w.tap(PCX, PCY);
        for _ in 0..400 {
            w.step(1.0 / 60.0);
        }
        for i in 0..RIP_N {
            let b = RIP_BASE + i * RIP_STRIDE;
            assert!(w.s[b + R_AGE] >= w.s[b + R_LIFE], "ripple {i} never died");
        }
        assert!(w.s[S_SETTLE] < 0.01, "the scene should come fully to rest");
        assert!(w.s[S_LANTERN] < 0.01, "the lantern should dim back down");
    }

    #[test]
    fn a_koi_visits_then_goes_back_to_its_wandering() {
        let mut w = world();
        w.tap(PCX, PCY);
        let mut saw_circle = false;
        let mut back_to_wander = false;
        for _ in 0..2400 {
            w.step(1.0 / 60.0);
            for i in 0..KOI_N {
                let st = w.s[w.koi(i) + K_STATE];
                if st == 2.0 {
                    saw_circle = true;
                } else if saw_circle && st == 0.0 {
                    back_to_wander = true;
                }
            }
        }
        assert!(saw_circle, "no koi ever reached the pebble");
        assert!(back_to_wander, "a koi stayed curious for ever");
    }

    #[test]
    fn koi_stay_in_the_water_however_long_it_runs() {
        let mut w = world();
        for k in 0..1800 {
            if k % 90 == 0 {
                let a = (k as f32 * 0.137) % 1.0;
                w.tap(PCX + cos_t(a) * 100.0, PCY + sin_t(a) * 70.0);
            }
            w.step(1.0 / 60.0);
            for i in 0..KOI_N {
                let b = w.koi(i);
                assert!(pond_d(w.s[b + K_X], w.s[b + K_Y]) < 1.0, "koi {i} left the pond");
            }
        }
    }

    #[test]
    fn every_number_stays_finite() {
        let mut w = world();
        for k in 0..3000 {
            if k % 40 == 0 {
                w.tap(20.0 + (k as f32 * 13.0) % 280.0, 20.0 + (k as f32 * 7.0) % 200.0);
            }
            w.step(1.0 / 60.0);
        }
        for i in 0..LEN {
            assert!(w.s[i].is_finite(), "state[{i}] is {}", w.s[i]);
        }
    }

    #[test]
    fn fireflies_never_sit_on_the_water() {
        let mut w = world();
        for _ in 0..2000 {
            w.step(1.0 / 60.0);
            for i in 0..FLY_N {
                let b = FLY_BASE + i * FLY_STRIDE;
                assert!(pond_d(w.s[b], w.s[b + 1]) > 0.9, "a firefly drifted out over the pond");
                assert!(w.s[b] >= 0.0 && w.s[b] <= W as f32, "a firefly left the frame");
            }
        }
    }
}
