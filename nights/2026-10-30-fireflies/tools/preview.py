# Approximate offline raster of Fireflies' scene layer, so the palette and
# composition can be reviewed without a browser. Pure stdlib; same geometry and
# same deterministic values as src/Main.elm (same hash, same salts).
#
#   python3 tools/preview.py preview.png
#
# It is not a screenshot: no HTML chrome (buttons, hint) and no CSS star twinkle.
import math
import struct
import sys
import zlib

W, H = 900, 620
T = 9.0  # the moment in the app's clock this frame is drawn at

buf = bytearray(W * H * 3)


def hexc(h):
    return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16))


def rnd(salt, i):
    v = math.sin(salt * 7919 + i * 104729) * 43758.5453
    return v - math.floor(v)


def blend(x, y, r, g, b, a):
    if a <= 0 or x < 0 or y < 0 or x >= W or y >= H:
        return
    i = (y * W + x) * 3
    if a >= 1:
        buf[i], buf[i + 1], buf[i + 2] = int(r), int(g), int(b)
        return
    buf[i] = int(buf[i] * (1 - a) + r * a)
    buf[i + 1] = int(buf[i + 1] * (1 - a) + g * a)
    buf[i + 2] = int(buf[i + 2] * (1 - a) + b * a)


def screen(x, y, r, g, b, a):
    """Additive-ish 'screen' blend, the way the app's mix-blend-mode:screen group works."""
    if a <= 0 or x < 0 or y < 0 or x >= W or y >= H:
        return
    i = (y * W + x) * 3
    buf[i] = min(255, int(buf[i] + r * a * (1 - buf[i] / 255)))
    buf[i + 1] = min(255, int(buf[i + 1] + g * a * (1 - buf[i + 1] / 255)))
    buf[i + 2] = min(255, int(buf[i + 2] + b * a * (1 - buf[i + 2] / 255)))


def ramp(stops, t):
    """Linear interpolation through [(offset, '#rrggbb', alpha), ...]."""
    t = max(0.0, min(1.0, t))
    for k in range(len(stops) - 1):
        o0, c0, a0 = stops[k]
        o1, c1, a1 = stops[k + 1]
        if o0 <= t <= o1:
            f = 0.0 if o1 == o0 else (t - o0) / (o1 - o0)
            r0, g0, b0 = hexc(c0)
            r1, g1, b1 = hexc(c1)
            return (r0 + (r1 - r0) * f, g0 + (g1 - g0) * f, b0 + (b1 - b0) * f, a0 + (a1 - a0) * f)
    o, c, a = stops[-1]
    r, g, b = hexc(c)
    return (r, g, b, a)


# --- sky: vertical gradient --------------------------------------------------
sky = [
    (0.0, "#05080f", 1.0),
    (0.42, "#0b1322", 1.0),
    (0.74, "#182036", 1.0),
    (0.90, "#262a3e", 1.0),
    (1.0, "#2f2c3c", 1.0),
]
for y in range(H):
    r, g, b, _ = ramp(sky, y / H)
    row = bytes((int(r), int(g), int(b))) * W
    buf[y * W * 3:(y + 1) * W * 3] = row

# --- the last light on the horizon: radial ellipse at the bottom centre ------
ll = [
    (0.0, "#7a4a34", 0.55),
    (0.55, "#5c3b34", 0.18),
    (1.0, "#3a2b33", 0.0),
]
cx, cy = 0.5 * W, 1.02 * H
rx, ry = 0.62 * W, 0.62 * H
for y in range(H):
    for x in range(W):
        t = math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
        if t <= 1.0:
            r, g, b, a = ramp(ll, t)
            blend(x, y, r, g, b, a)

# --- stars ------------------------------------------------------------------
for i in range(64):
    sx = rnd(1, i) * W
    sy = rnd(2, i) * 0.6 * H
    sr = 0.45 + rnd(3, i) * 1.05
    # a mid-twinkle moment: the CSS animation runs from .16 to .85
    a = 0.35 + 0.35 * abs(math.sin(i * 1.7))
    rad = max(1.0, sr * 1.4)
    for y in range(int(sy - rad) - 1, int(sy + rad) + 2):
        for x in range(int(sx - rad) - 1, int(sx + rad) + 2):
            d = math.hypot(x - sx, y - sy)
            if d <= rad:
                screen(x, y, 205, 218, 243, a * (1 - d / rad) ** 2)

# --- ground silhouette ------------------------------------------------------
y0 = H * 0.94
w5 = W / 5


def endx(i):
    return i * w5


def endy(i):
    return y0 + (rnd(32, i) - 0.5) * H * 0.03


def cyc(i):
    return y0 + (rnd(31, i) - 0.5) * H * 0.02


ground = bytearray(W * H)  # 1 = inside the silhouette
for i in range(5):
    ax, ay = endx(i), endy(i)
    bx, by = endx(i + 1), endy(i + 1)
    qx, qy = (ax + bx) / 2, cyc(i)
    for s in range(0, 401):
        t = s / 400.0
        px = (1 - t) ** 2 * ax + 2 * (1 - t) * t * qx + t * t * bx
        py = (1 - t) ** 2 * ay + 2 * (1 - t) * t * qy + t * t * by
        ix = max(0, min(W - 1, int(px)))
        for yy in range(max(0, int(py)), H):
            ground[yy * W + ix] = 1
for y in range(int(H * 0.93), H):
    for x in range(W):
        if ground[y * W + x]:
            blend(x, y, 5, 8, 16, 1.0)

# --- reeds ------------------------------------------------------------------
for i in range(32):
    u = i / 31 + (rnd(6, i) - 0.5) * 0.022
    hh = 0.04 + rnd(7, i) * 0.12
    lean = (rnd(8, i) - 0.5) * 0.9
    x0 = u * W
    top = H * (1 - hh)
    base = H * 0.965
    lx = lean * W * 0.022
    width = 1.4 + hh * 11
    ax, ay = x0, base
    bx, by = x0 + lx, top
    qx, qy = x0 + lx * 0.4, (base + top) / 2
    for s in range(0, 61):
        t = s / 60.0
        px = (1 - t) ** 2 * ax + 2 * (1 - t) * t * qx + t * t * bx
        py = (1 - t) ** 2 * ay + 2 * (1 - t) * t * qy + t * t * by
        rad = width / 2
        for y in range(int(py - rad) - 1, int(py + rad) + 2):
            for x in range(int(px - rad) - 1, int(px + rad) + 2):
                d = math.hypot(x - px, y - py)
                if d <= rad:
                    blend(x, y, 7, 10, 18, 1.0)

# --- fireflies --------------------------------------------------------------
warm = [
    (0.0, "#fff6d8", 1.0),
    (0.16, "#ffd47c", 0.95),
    (0.45, "#ff9f45", 0.32),
    (0.75, "#ff7f2a", 0.09),
    (1.0, "#ff7f2a", 0.0),
]
cool = [
    (0.0, "#f4ffd9", 1.0),
    (0.16, "#dcff96", 0.95),
    (0.45, "#a9e86a", 0.30),
    (0.75, "#7fd257", 0.08),
    (1.0, "#7fd257", 0.0),
]


def spawn(i, px, py):
    angle = rnd(21, i) * 6.2831853
    speed = 4 + rnd(22, i) * 9
    lift = 10 + rnd(23, i) * 20
    vx = math.cos(angle) * speed * 0.5
    vy = math.sin(angle) * speed * 0.35 - lift
    return dict(x=px, y=py, vx=vx, vy=vy, seed=rnd(24, i) * 10, period=2.4 + rnd(25, i) * 3.6,
                phase=rnd(26, i) * 6.2831853, size=2.4 + rnd(27, i) * 2.6, cool=rnd(28, i) < 0.3,
                age=0.0, life=42 + rnd(29, i) * 48)


def step(f, dt):
    a = f["age"] + dt
    n1 = math.sin(a * 0.21 + f["seed"] * 7.3)
    n2 = math.cos(a * 0.17 + f["seed"] * 4.1)
    ax = n1 * 6.5 + (W * 0.5 - f["x"]) * 0.0035
    ay = n2 * 5.0 + (H * 0.44 - f["y"]) * 0.010
    damp = 1 - 0.55 * dt
    vx = (f["vx"] + ax * dt) * damp
    vy = (f["vy"] + ay * dt) * damp
    sp = math.hypot(vx, vy)
    k = 20 / sp if sp > 20 else 1.0
    f["vx"], f["vy"] = vx * k, vy * k
    f["x"] += f["vx"] * dt
    f["y"] += f["vy"] * dt
    f["age"] = a
    return f


def brightness(t, f):
    fade_in = max(0.0, min(1.0, f["age"] / 0.35))
    fade_out = max(0.0, min(1.0, (f["life"] - f["age"]) / 12))
    pulse = math.sin(2 * math.pi * (t / f["period"]) + f["phase"])
    flash = pulse ** 7 if pulse > 0 else 0.0
    return fade_in * math.sqrt(fade_out) * (0.22 + 0.78 * flash)


# two tushes: one tap, and a short trail dragged to the lower left
flies = []
n = 0
for (bx, by) in ((0.40 * W, 0.60 * H), (0.66 * W, 0.46 * H)):
    for k in range(7):
        i = n + k
        flies.append(spawn(i, bx + (rnd(11, i) - 0.5) * 62, by + (rnd(12, i) - 0.5) * 50))
    n += 7
for k in range(10):
    i = n + k
    flies.append(spawn(i, 0.72 * W - k * 26 + (rnd(11, i) - 0.5) * 30,
                       0.30 * H + k * 13 + (rnd(12, i) - 0.5) * 26))
    n += 1

for f in flies:
    dt = 0.0167
    for _ in range(int(T / dt)):
        step(f, dt)

for f in flies:
    b = brightness(T, f)
    if b <= 0.004:
        continue
    rad = f["size"] * (0.9 + 0.85 * b)
    stops = cool if f["cool"] else warm
    a_scale = max(0.0, min(1.0, b * 1.1))
    for y in range(int(f["y"] - rad) - 1, int(f["y"] + rad) + 2):
        for x in range(int(f["x"] - rad) - 1, int(f["x"] + rad) + 2):
            d = math.hypot(x - f["x"], y - f["y"])
            if d <= rad:
                r, g, bb, a = ramp(stops, d / rad)
                screen(x, y, r, g, bb, a * a_scale)

# --- write PNG --------------------------------------------------------------
raw = b"".join(b"\x00" + bytes(buf[y * W * 3:(y + 1) * W * 3]) for y in range(H))


def chunk(tag, data):
    return (struct.pack(">I", len(data)) + tag + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))


png = (b"\x89PNG\r\n\x1a\n"
       + chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
       + chunk(b"IDAT", zlib.compress(raw, 9))
       + chunk(b"IEND", b""))

out = sys.argv[1] if len(sys.argv) > 1 else "preview.png"
open(out, "wb").write(png)
print(f"wrote {out} ({W}x{H}, {len(png)} bytes, {len(flies)} fireflies at t={T}s)")
