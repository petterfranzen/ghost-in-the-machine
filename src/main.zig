//! The wasm face of the clearing: five exports and a pointer to the state.

const world = @import("world.zig");

export fn init() void {
    world.reset();
}

export fn step(dt: f32) void {
    world.step(dt);
}

export fn tap(x: f32, y: f32) void {
    world.tap(x, y);
}

export fn state_ptr() usize {
    return @intFromPtr(&world.s);
}
