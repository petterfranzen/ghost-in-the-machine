const std = @import("std");
const world = @import("world.zig");
const IDX = world.IDX;
const L = world.L;

test "the walker heads for the tap" {
    world.reset();
    const x0 = world.s[IDX.cx];
    const y0 = world.s[IDX.cy];
    world.tap(x0 + 40, y0 - 40);
    var i: usize = 0;
    while (i < 20) : (i += 1) world.step(1.0 / 60.0);
    try std.testing.expect(world.s[IDX.cx] > x0 + 4);
    try std.testing.expect(world.s[IDX.cy] < y0 - 4);
    try std.testing.expectEqual(@as(f32, 1), world.s[IDX.facing]);
}

test "a light within reach starts following" {
    world.reset();
    world.s[IDX.cx] = 100;
    world.s[IDX.cy] = 100;
    world.s[IDX.tx] = 100;
    world.s[IDX.ty] = 100;
    world.s[world.IDX.lights + L.x] = 104;
    world.s[world.IDX.lights + L.y] = 96;
    world.step(1.0 / 60.0);
    try std.testing.expectEqual(@as(f32, 1), world.s[world.IDX.lights + L.state]);
}

test "carrying three lights to the stone completes the clearing" {
    world.reset();
    for (0..world.N_LIGHTS) |i| {
        world.s[world.IDX.lights + i * L.stride + L.state] = 1;
        world.s[world.IDX.lights + i * L.stride + L.x] = world.s[IDX.cx];
        world.s[world.IDX.lights + i * L.stride + L.y] = world.s[IDX.cy];
    }
    world.s[IDX.cx] = world.s[IDX.sx];
    world.s[IDX.cy] = world.s[IDX.sy];
    world.s[IDX.tx] = world.s[IDX.sx];
    world.s[IDX.ty] = world.s[IDX.sy];
    var i: usize = 0;
    while (i < 400) : (i += 1) world.step(1.0 / 60.0);
    try std.testing.expectEqual(@as(f32, 3), world.s[IDX.gathered]);
    try std.testing.expectEqual(@as(f32, 1), world.s[IDX.complete]);
    try std.testing.expect(world.s[IDX.awake] > 0.9);
}

test "the walker stays inside the clearing" {
    world.reset();
    world.tap(-500, -500);
    var i: usize = 0;
    while (i < 600) : (i += 1) world.step(1.0 / 60.0);
    try std.testing.expect(world.s[IDX.cx] >= 6);
    try std.testing.expect(world.s[IDX.cy] >= 40);
    try std.testing.expect(world.s[IDX.cy] <= world.H);
}

test "a tap near a drifting light gives chase and carries it home" {
    world.reset();
    world.s[IDX.cx] = 120;
    world.s[IDX.cy] = 120;
    const li = world.IDX.lights;
    world.s[li + L.x] = 158;
    world.s[li + L.y] = 108;
    world.s[li + L.state] = 0;
    world.tap(154, 110);
    try std.testing.expectEqual(@as(f32, 1), world.s[IDX.seek]);
    var i: usize = 0;
    while (i < 240) : (i += 1) {
        world.step(1.0 / 60.0);
        if (world.s[li + L.state] == 1) break;
    }
    try std.testing.expectEqual(@as(f32, 1), world.s[li + L.state]);
    // and then it walks back toward the stone without another tap
    try std.testing.expectEqual(world.s[IDX.sx], world.s[IDX.tx]);
}
