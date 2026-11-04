//! Pebble Pond — a calm pixel-art koi pond, in Rust, compiled to WebAssembly.
//!
//! The module owns everything except the screen: the pond's rules, the koi, the
//! ripples, and the pixels themselves. The host in `app.js` only instantiates
//! it, hands it a tap and a `dt`, and blits the returned framebuffer.
mod paint;
mod render;
mod world;

use paint::{init_trig, Painter};
use world::{World, H, LEN, W};

const FB_LEN: usize = (W as usize) * (H as usize) * 4;

static mut FB: [u8; FB_LEN] = [0; FB_LEN];
static mut WORLD: World = World::empty();

/// How much the whole scene is allowed to move: 1.0 normally, 0.5 when the
/// reader prefers reduced motion. The host sets it once at startup and the
/// settle (the frame's give) is scaled by it in `render`.
static mut MOTION: f32 = 1.0;

#[inline]
fn fb() -> &'static mut [u8] {
    unsafe { core::slice::from_raw_parts_mut((&raw mut FB).cast::<u8>(), FB_LEN) }
}

#[inline]
fn world() -> &'static mut World {
    unsafe { &mut *(&raw mut WORLD) }
}

/// The current motion scale — see [`set_motion_scale`].
#[inline]
pub fn motion() -> f32 {
    unsafe { MOTION }
}

/// Set the motion scale. `0.5` halves the whole-scene settle for a reader who
/// prefers reduced motion. The value is clamped to `0.0..=1.0` and non-finite
/// input is ignored, so a host can only make the pond calmer, never wilder.
#[no_mangle]
pub extern "C" fn set_motion_scale(scale: f32) {
    if scale.is_finite() && (0.0..=1.0).contains(&scale) {
        unsafe { MOTION = scale };
    }
}

/// The current motion scale, exported so a headless check can read it back.
#[no_mangle]
pub extern "C" fn motion_scale() -> f32 {
    motion()
}

/// Seed the pond. Called once when the module instantiates.
#[no_mangle]
pub extern "C" fn init(seed: u32) {
    init_trig();
    *world() = World::new(seed);
    // the painter writes colour only, so start every pixel fully opaque
    fb().fill(0xff);
    draw();
}

/// One step of time and one frame, in seconds. The host calls this per rAF.
#[no_mangle]
pub extern "C" fn frame(dt: f32) {
    world().step(dt);
    draw();
}

/// A thumb, in canvas coordinates.
#[no_mangle]
pub extern "C" fn tap(x: f32, y: f32) {
    world().tap(x, y);
}

fn draw() {
    let w = world();
    let mut p = Painter::new(fb(), W, H);
    render::draw_scene(&mut p, w);
}

/// 0 if the last pebble landed on water, 1 on moss — the host picks the sound.
#[no_mangle]
pub extern "C" fn last_kind() -> i32 {
    world().s[world::S_LAST_KIND] as i32
}

#[no_mangle]
pub extern "C" fn taps() -> f32 {
    world().s[world::S_TAPS]
}

#[no_mangle]
pub extern "C" fn fb_ptr() -> *const u8 {
    fb().as_ptr()
}

#[no_mangle]
pub extern "C" fn fb_len() -> usize {
    FB_LEN
}

#[no_mangle]
pub extern "C" fn state_ptr() -> *const f32 {
    world().s.as_ptr()
}

#[no_mangle]
pub extern "C" fn state_len() -> usize {
    LEN
}

#[cfg(test)]
mod tests {
    #[test]
    fn the_flat_state_holds_every_creature() {
        use crate::world::*;
        assert!(LEN >= FLY_BASE + FLY_N * FLY_STRIDE);
        assert_eq!(SIG, 202611.0);
    }

    #[test]
    fn reduced_motion_halves_the_settle() {
        use crate::render::settle_offsets;
        use crate::world::{World, S_SETTLE, S_SETTLE_T};
        use crate::{motion, set_motion_scale};
        let mut w = World::new(7);
        w.s[S_SETTLE] = 1.0;
        w.s[S_SETTLE_T] = 0.31;
        set_motion_scale(1.0);
        let full = settle_offsets(&w);
        set_motion_scale(0.5);
        let half = settle_offsets(&w);
        assert!((half.0 * 2.0 - full.0).abs() < 1e-5, "oy did not halve");
        assert!((half.1 * 2.0 - full.1).abs() < 1e-5, "ox did not halve");
        set_motion_scale(1.0); // leave the module as we found it
    }

    #[test]
    fn the_motion_scale_can_only_calm_the_pond() {
        use crate::{motion, set_motion_scale};
        set_motion_scale(1.0);
        set_motion_scale(4.0); // nonsense: ignored
        assert_eq!(motion(), 1.0);
        set_motion_scale(-1.0); // nonsense: ignored
        assert_eq!(motion(), 1.0);
        set_motion_scale(f32::NAN); // nonsense: ignored
        assert_eq!(motion(), 1.0);
        set_motion_scale(0.5);
        assert_eq!(motion(), 0.5);
        set_motion_scale(1.0);
    }
}
