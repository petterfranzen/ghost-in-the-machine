# Approximate offline raster of Zen Rake's garden layer (same geometry as src/Main.hx)
# so the layout and palette can be reviewed without a browser. Pure stdlib.
import math, zlib, struct, sys

W, H = 900, 700
buf = bytearray(W * H * 3)

def hexc(h):
    return (int(h[1:3],16), int(h[3:5],16), int(h[5:7],16))

def blend(x, y, r, g, b, a):
    if a <= 0: return
    if x < 0 or y < 0 or x >= W or y >= H: return
    i = (y * W + x) * 3
    if a >= 1:
        buf[i] = int(r); buf[i+1] = int(g); buf[i+2] = int(b); return
    buf[i]   = int(buf[i]   * (1-a) + r * a)
    buf[i+1] = int(buf[i+1] * (1-a) + g * a)
    buf[i+2] = int(buf[i+2] * (1-a) + b * a)

# --- base gradient: linear from (0,0) to (0.4W,H) -------------------------
c0, c1, c2 = hexc("#f8f1e2"), hexc("#f0e6d2"), hexc("#e3d5bc")
vx, vy = 0.4 * W, H
vv = vx*vx + vy*vy
for y in range(H):
    for x in range(W):
        t = max(0.0, min(1.0, (x*vx + y*vy) / vv))
        if t < 0.45:
            k = t / 0.45
            col = tuple(c0[j] + (c1[j]-c0[j])*k for j in range(3))
        else:
            k = (t - 0.45) / 0.55
            col = tuple(c1[j] + (c2[j]-c1[j])*k for j in range(3))
        i = (y*W + x)*3
        buf[i], buf[i+1], buf[i+2] = int(col[0]), int(col[1]), int(col[2])

# --- warm glow, radial from (0.28W, 0.15H) --------------------------------
gx, gy, gr = 0.28*W, 0.15*H, max(W,H)*0.8
for y in range(H):
    for x in range(W):
        d = math.hypot(x-gx, y-gy)
        if d < gr:
            a = 0.78 * (1 - d/gr) ** 2
            blend(x, y, 255, 250, 235, a)

# --- PRNG identical to the app -------------------------------------------
seed = 20261029
def rnd():
    global seed
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 2147483647.0

defs = [ (0.22,0.30,0.062), (0.76,0.44,0.078), (0.40,0.79,0.050), (0.87,0.82,0.032) ]
stones = []
m = min(W,H)
for fx, fy, fs in defs:
    r = max(15.0, min(46.0, m*fs))
    n = 3 + int(rnd()*4)
    moss = []
    for _ in range(n):
        moss.append((rnd()*math.pi*2, 0.34+rnd()*0.62, 0.15+rnd()*0.20))
    rot = (rnd()-0.5)*0.9
    stones.append(dict(x=W*fx, y=H*fy, r=r, rot=rot, moss=moss))

# --- rings around stones --------------------------------------------------
for s in stones:
    for k in range(7):
        rr = s["r"] + 11 + k*9.5
        a0 = 0.125 - k*0.011
        for y in range(int(s["y"]-rr-3), int(s["y"]+rr+3)):
            for x in range(int(s["x"]-rr-3), int(s["x"]+rr+3)):
                d = math.hypot(x-s["x"], y-s["y"])
                cov = max(0.0, 1 - abs(d-rr)/1.2)
                if cov > 0:
                    blend(x, y, 146, 124, 96, a0*cov)

# --- grain ---------------------------------------------------------------
n = int(min(13000, W*H/95))
for _ in range(n):
    x = rnd()*W; y = rnd()*H
    a = 0.02 + rnd()*0.06
    w = 1.2 + rnd()*1.3; h = 1.2 + rnd()*1.3
    if rnd() < 0.55:
        col = (126, 104, 78); aa = a
    else:
        col = (255, 253, 246); aa = a*1.5
    for yy in range(int(y), int(y+h)+1):
        for xx in range(int(x), int(x+w)+1):
            blend(xx, yy, col[0], col[1], col[2], aa)

# --- stones --------------------------------------------------------------
def stone_pixel(s, x, y):
    # inverse transform into the stone's oval space
    dx, dy = x - s["x"], y - s["y"]
    ca, sa = math.cos(-s["rot"]), math.sin(-s["rot"])
    ux = dx*ca - dy*sa
    uy = dx*sa + dy*ca
    ux /= 1.14; uy /= 0.92
    return ux, uy

for s in stones:
    r = s["r"]
    # soft shadow, offset down 5px
    sh = r*1.35
    for y in range(int(s["y"]+5-sh), int(s["y"]+5+sh)):
        for x in range(int(s["x"]-sh), int(s["x"]+sh)):
            d = math.hypot(x-s["x"], (y-s["y"]-5))
            if d < sh:
                a = 0.30 * (1 - d/sh) ** 2
                blend(x, y, 96, 80, 58, a)
    # stone body with radial gradient from the upper-left shoulder
    cx, cy = -0.35*r, -0.40*r
    grad_r = r*1.35
    st0, st1, st2 = hexc("#c6bfb1"), hexc("#a29a8b"), hexc("#7b7466")
    for y in range(int(s["y"]-r*1.2), int(s["y"]+r*1.2)):
        for x in range(int(s["x"]-r*1.2), int(s["x"]+r*1.2)):
            ux, uy = stone_pixel(s, x, y)
            d = math.hypot(ux, uy)
            if d > r: continue
            dd = math.hypot(ux-cx, uy-cy)
            t = max(0.0, min(1.0, dd/grad_r))
            if t < 0.55:
                k = t/0.55
                col = tuple(st0[j] + (st1[j]-st0[j])*k for j in range(3))
            else:
                k = (t-0.55)/0.45
                col = tuple(st1[j] + (st2[j]-st1[j])*k for j in range(3))
            # 1px soft edge
            edge = min(1.0, (r-d)/1.2)
            blend(x, y, col[0], col[1], col[2], edge)
    # moss dabs
    for a_, d_, s_ in s["moss"]:
        ux = math.cos(a_)*r*d_; uy = math.sin(a_)*r*d_
        ca, sa = math.cos(s["rot"]), math.sin(s["rot"])
        mx = s["x"] + (ux*ca - uy*sa)*1.14
        my = s["y"] + (ux*sa + uy*ca)*0.92
        mr = r*s_
        for y in range(int(my-mr), int(my+mr)+1):
            for x in range(int(mx-mr), int(mx+mr)+1):
                d = math.hypot(x-mx, y-my)
                if d < mr:
                    a = 0.92 * (1 - d/mr) ** 2
                    blend(x, y, 163, 178, 126, a)

# --- a raked stroke, as if a thumb just swept an S ----------------------
def seg(x0, y0, x1, y1, nx, ny, off, col, hw, alpha):
    ax, ay = x0+nx*off, y0+ny*off
    bx, by = x1+nx*off, y1+ny*off
    pad = hw + 2
    minx = max(0, int(min(ax,bx)-pad)); maxx = min(W-1, int(max(ax,bx)+pad))
    miny = max(0, int(min(ay,by)-pad)); maxy = min(H-1, int(max(ay,by)+pad))
    vx2, vy2 = bx-ax, by-ay
    L2 = vx2*vx2 + vy2*vy2
    for y in range(miny, maxy+1):
        for x in range(minx, maxx+1):
            if L2 == 0: continue
            t = ((x-ax)*vx2 + (y-ay)*vy2) / L2
            t = max(0.0, min(1.0, t))
            px, py = ax+vx2*t, ay+vy2*t
            d = math.hypot(x-px, y-py)
            cov = max(0.0, 1 - (d-hw)/1.2)
            if cov <= 0: continue
            skip = False
            for s in stones:
                ux, uy = stone_pixel(s, x, y)
                if math.hypot(ux, uy) < s["r"]*1.2 + 7: skip = True; break
            if skip: continue
            blend(x, y, col[0], col[1], col[2], alpha*cov)

TINES, GAP = 7, 15.0
path = []
for i in range(140):
    u = i/139
    # a lazy S from lower-left to upper-right
    x = 60 + u*(W-120)
    y = H*0.72 - math.sin(u*math.pi*1.6)*H*0.30 - u*40
    path.append((x, y))
for i in range(len(path)-1):
    x0, y0 = path[i]; x1, y1 = path[i+1]
    dx, dy = x1-x0, y1-y0
    d = math.hypot(dx, dy)
    if d < 0.5: continue
    nx, ny = -dy/d, dx/d
    for k in range(TINES):
        off = (k - (TINES-1)/2)*GAP
        seg(x0, y0, x1, y1, nx, ny, off, (150,126,96), 1.7, 0.22)
        seg(x0, y0, x1, y1, nx, ny, off+1.9, (255,252,244), 0.65, 0.30)

# --- write PNG -----------------------------------------------------------
raw = bytearray()
for y in range(H):
    raw.append(0)
    raw += buf[y*W*3:(y+1)*W*3]
def chunk(t, data):
    c = struct.pack(">I", len(data)) + t + data
    return c + struct.pack(">I", zlib.crc32(t + data) & 0xffffffff)
png = b"\x89PNG\r\n\x1a\n"
png += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
png += chunk(b"IEND", b"")
out = sys.argv[1] if len(sys.argv) > 1 else "/tmp/zen-preview.png"
open(out, "wb").write(png)
print("wrote", out, len(png), "bytes")
