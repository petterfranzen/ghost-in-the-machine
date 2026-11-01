//! Lantern Moss — the clearing's whole simulation, as one flat array of floats.
//!
//! The renderer never owns a position: it reads this array every frame. `step`
//! takes a delta in seconds and returns nothing, so the same code runs under
//! `zig test` on the host and compiled to wasm32-freestanding in the browser.

const std = @import("std");

pub const W: f32 = 320.0;
pub const H: f32 = 240.0;
pub const N_LIGHTS: usize = 3;
pub const N_MOTES: usize = 40;
pub const STATE_LEN: usize = 256;

pub const IDX = struct {
    pub const time: usize = 0;
    pub const cx: usize = 1;
    pub const cy: usize = 2;
    pub const tx: usize = 3;
    pub const ty: usize = 4;
    pub const facing: usize = 5;
    pub const walking: usize = 6;
    pub const bob: usize = 7;
    pub const sx: usize = 8;
    pub const sy: usize = 9;
    pub const glow: usize = 10;
    pub const gathered: usize = 11;
    pub const complete: usize = 12;
    pub const awake: usize = 13;
    pub const rix: usize = 14;
    pub const riy: usize = 15;
    pub const rage: usize = 16;
    pub const place_t: usize = 17;
    pub const seek: usize = 18;
    pub const lights: usize = 20;
    pub const motes: usize = 48;
    pub const nmotes: usize = 208;
};

pub const L = struct {
    pub const x: usize = 0;
    pub const y: usize = 1;
    pub const ph: usize = 2;
    pub const vx: usize = 3;
    pub const vy: usize = 4;
    pub const state: usize = 5;
    pub const glow: usize = 6;
    pub const seed: usize = 7;
    pub const stride: usize = 8;
};

pub const M = struct {
    pub const x: usize = 0;
    pub const y: usize = 1;
    pub const ph: usize = 2;
    pub const size: usize = 3;
    pub const stride: usize = 4;
};

pub var s: [STATE_LEN]f32 = [_]f32{0} ** STATE_LEN;

var rng: u32 = 0x9E37_79B9;

fn rnd() f32 {
    rng ^= rng << 13;
    rng ^= rng >> 17;
    rng ^= rng << 5;
    return @as(f32, @floatFromInt(rng & 0xFF_FFFF)) / 16_777_216.0;
}

fn rrange(a: f32, b: f32) f32 {
    return a + (b - a) * rnd();
}

fn clamp(v: f32, lo: f32, hi: f32) f32 {
    return if (v < lo) lo else if (v > hi) hi else v;
}

fn dist2(ax: f32, ay: f32, bx: f32, by: f32) f32 {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
}

pub fn light(i: usize, field: usize) *f32 {
    return &s[IDX.lights + i * L.stride + field];
}

pub fn reset() void {
    rng = 0x9E37_79B9;
    for (&s) |*v| v.* = 0;
    s[IDX.sx] = W * 0.5;
    s[IDX.sy] = H * 0.44;
    s[IDX.cx] = W * 0.5;
    s[IDX.cy] = H - 26;
    s[IDX.tx] = s[IDX.cx];
    s[IDX.ty] = s[IDX.cy];
    s[IDX.facing] = 1;
    s[IDX.rage] = 99;
    s[IDX.nmotes] = @floatFromInt(N_MOTES);

    const spots = [N_LIGHTS][2]f32{
        .{ W * 0.20, H * 0.70 },
        .{ W * 0.80, H * 0.66 },
        .{ W * 0.52, H * 0.24 },
    };
    for (0..N_LIGHTS) |i| {
        s[IDX.lights + i * L.stride + L.x] = spots[i][0];
        s[IDX.lights + i * L.stride + L.y] = spots[i][1];
        s[IDX.lights + i * L.stride + L.ph] = rrange(0, 6.28);
        s[IDX.lights + i * L.stride + L.vx] = rrange(-3.4, 3.4);
        s[IDX.lights + i * L.stride + L.vy] = rrange(-2.2, 2.2);
        s[IDX.lights + i * L.stride + L.state] = 0;
        s[IDX.lights + i * L.stride + L.glow] = 1;
        s[IDX.lights + i * L.stride + L.seed] = rrange(0, 10);
    }

    for (0..N_MOTES) |i| {
        s[IDX.motes + i * M.stride + M.x] = rrange(4, W - 4);
        s[IDX.motes + i * M.stride + M.y] = rrange(20, H - 4);
        s[IDX.motes + i * M.stride + M.ph] = rrange(0, 6.28);
        s[IDX.motes + i * M.stride + M.size] = rrange(0.6, 1.7);
    }
}

pub fn tap(x: f32, y: f32) void {
    s[IDX.tx] = clamp(x, 6, W - 6);
    s[IDX.ty] = clamp(y, 12, H - 6);
    s[IDX.rix] = s[IDX.tx];
    s[IDX.riy] = s[IDX.ty];
    s[IDX.rage] = 0;
    // A tap near a lost light becomes "go gently after that one": the walker
    // keeps following it as it drifts, so a moving spark is never a miss.
    s[IDX.seek] = 0;
    var best: f32 = 56 * 56;
    for (0..N_LIGHTS) |i| {
        if (light(i, L.state).* != 0) continue;
        const d = dist2(x, y, light(i, L.x).*, light(i, L.y).*);
        if (d < best) {
            best = d;
            s[IDX.seek] = @floatFromInt(i + 1);
        }
    }
}

fn depositCheck() void {
    if (s[IDX.place_t] > 0) return;
    if (dist2(s[IDX.cx], s[IDX.cy], s[IDX.sx], s[IDX.sy]) > 19 * 19) return;
    for (0..N_LIGHTS) |i| {
        if (light(i, L.state).* == 1) {
            light(i, L.state).* = 2;
            s[IDX.gathered] += 1;
            s[IDX.glow] = clamp(s[IDX.glow] + 0.34, 0, 1);
            s[IDX.place_t] = 0.55;
            if (s[IDX.gathered] >= @as(f32, @floatFromInt(N_LIGHTS))) s[IDX.complete] = 1;
            return;
        }
    }
}

pub fn step(dt_in: f32) void {
    const dt = clamp(dt_in, 0.0, 0.1);
    s[IDX.time] += dt;
    const t = s[IDX.time];
    s[IDX.place_t] = if (s[IDX.place_t] > 0) s[IDX.place_t] - dt else 0;

    // ---- the walker -------------------------------------------------------
    const seeking = s[IDX.seek] > 0 and light(@as(usize, @intFromFloat(s[IDX.seek])) - 1, L.state).* == 0;
    if (seeking) {
        const li = @as(usize, @intFromFloat(s[IDX.seek])) - 1;
        s[IDX.tx] = light(li, L.x).*;
        s[IDX.ty] = light(li, L.y).*;
    }
    const dx = s[IDX.tx] - s[IDX.cx];
    const dy = s[IDX.ty] - s[IDX.cy];
    const d = @sqrt(dx * dx + dy * dy);
    if (d > 1.4) {
        const speed: f32 = 44.0;
        const move = @min(speed * dt, d);
        s[IDX.cx] = clamp(s[IDX.cx] + dx / d * move, 7, W - 7);
        s[IDX.cy] = clamp(s[IDX.cy] + dy / d * move, 44, H - 6);
        s[IDX.walking] = 1;
        s[IDX.bob] += dt * 8.5;
        if (dx > 0.5) s[IDX.facing] = 1;
        if (dx < -0.5) s[IDX.facing] = -1;
    } else {
        s[IDX.walking] = 0;
        s[IDX.bob] += dt * 1.7;
    }

    // ---- the lost lights --------------------------------------------------
    for (0..N_LIGHTS) |i| {
        const st = light(i, L.state).*;
        if (st == 0) {
            const ph = light(i, L.ph).*;
            var x = light(i, L.x).* + light(i, L.vx).* * dt + @sin(t * 0.9 + ph) * 4.5 * dt;
            var y = light(i, L.y).* + light(i, L.vy).* * dt + @cos(t * 0.7 + ph * 1.7) * 3.0 * dt;
            if (x < 16) {
                x = 16;
                light(i, L.vx).* = @abs(light(i, L.vx).*);
            }
            if (x > W - 16) {
                x = W - 16;
                light(i, L.vx).* = -@abs(light(i, L.vx).*);
            }
            if (y < 62) {
                y = 62;
                light(i, L.vy).* = @abs(light(i, L.vy).*);
            }
            if (y > H - 14) {
                y = H - 14;
                light(i, L.vy).* = -@abs(light(i, L.vy).*);
            }
            light(i, L.x).* = x;
            light(i, L.y).* = y;
            light(i, L.glow).* = 0.75 + 0.25 * @sin(t * 2.1 + ph * 2.3);

            // caught by the walker? a generous reach, and then it walks the
            // light home by itself, so the whole game is one tap per spark.
            if (dist2(x, y, s[IDX.cx], s[IDX.cy] - 4) < 17 * 17) {
                light(i, L.state).* = 1;
                light(i, L.glow).* = 1;
                s[IDX.seek] = 0;
                s[IDX.tx] = s[IDX.sx];
                s[IDX.ty] = s[IDX.sy];
            }
        } else if (st == 1) {
            const ang = 3.14 * (0.55 + @as(f32, @floatFromInt(i)) * 0.62);
            const tx = s[IDX.cx] + @cos(ang + t * 0.35) * 10.0;
            const ty = s[IDX.cy] - 9 + @sin(ang + t * 0.35) * 4.0;
            const k = clamp(dt * 7.5, 0, 1);
            light(i, L.x).* += (tx - light(i, L.x).*) * k;
            light(i, L.y).* += (ty - light(i, L.y).*) * k;
            light(i, L.glow).* = 1.0 + 0.15 * @sin(t * 5.0 + @as(f32, @floatFromInt(i)));
        } else {
            const ang = 6.28 * (@as(f32, @floatFromInt(i)) / 3.0) + t * 0.12;
            const tx = s[IDX.sx] + @cos(ang) * 7.0;
            const ty = s[IDX.sy] - 3 + @sin(ang) * 2.5;
            const k = clamp(dt * 3.0, 0, 1);
            light(i, L.x).* += (tx - light(i, L.x).*) * k;
            light(i, L.y).* += (ty - light(i, L.y).*) * k;
            light(i, L.glow).* = 0.9 + 0.1 * @sin(t * 1.4 + @as(f32, @floatFromInt(i)));
        }
    }

    depositCheck();

    // ---- the stone wakes --------------------------------------------------
    if (s[IDX.complete] > 0) {
        s[IDX.awake] = clamp(s[IDX.awake] + dt * 0.55, 0, 1);
        s[IDX.glow] = clamp(s[IDX.glow] + dt * 0.08, 0, 1);
    }

    // ---- drifting motes ---------------------------------------------------
    for (0..N_MOTES) |i| {
        const ph = s[IDX.motes + i * M.stride + M.ph];
        var x = s[IDX.motes + i * M.stride + M.x] + @sin(t * 0.35 + ph) * 3.2 * dt;
        var y = s[IDX.motes + i * M.stride + M.y] - (1.1 + ph * 0.12) * dt;
        if (y < 26) y = H - 4;
        if (x < 2) x = W - 2;
        if (x > W - 2) x = 2;
        s[IDX.motes + i * M.stride + M.x] = x;
        s[IDX.motes + i * M.stride + M.y] = y;
    }

    // ---- the tap ripple ---------------------------------------------------
    if (s[IDX.rage] < 2.0) s[IDX.rage] += dt;
}
