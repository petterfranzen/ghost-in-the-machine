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

#[inline]
fn fb() -> &'static mut [u8] {
    unsafe { core::slice::from_raw_parts_mut((&raw mut FB).cast::<u8>(), FB_LEN) }
}

#[inline]
fn world() -> &'static mut World {
    unsafe { &mut *(&raw mut WORLD) }
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
}
