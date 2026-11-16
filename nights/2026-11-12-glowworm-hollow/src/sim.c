/* Glowworm Hollow - a dark cave you wake with one thumb.
 *
 * C11, freestanding wasm32 (wasi-sdk clang), no libc, no allocator.
 * Every rule of the piece lives here; the page only taps, steps and blits.
 */
typedef unsigned char u8;
typedef signed char i8;
typedef unsigned short u16;
typedef short i16;
typedef unsigned int u32;
typedef int i32;
typedef float f32;

#define EXPORT __attribute__((visibility("default"), used))
#define MAXW 340
#define MAXH 460
#define LSC 4                 /* light buffer cell, world px */
#define LW (MAXW / LSC + 2)
#define LH (MAXH / LSC + 2)
#define NPAL 22
#define NWMAX 24
#define NMOTE 30
#define NRING 10
#define NTRAIL 20
#define NEV 48

#define TAU 6.28318531f
#define HPI 1.57079633f
#define PI  3.14159265f

static const u8 PAL[NPAL * 3] = {
   14,  13,  20,   /*  0 rock deep  */
   24,  23,  36,   /*  1 rock       */
   36,  34,  50,   /*  2 rock lit   */
   56,  51,  74,   /*  3 rock edge  */
   20,  34,  27,   /*  4 moss dark  */
   31,  56,  40,   /*  5 moss       */
   52,  94,  58,   /*  6 moss lit   */
   16,  32,  44,   /*  7 water deep */
   24,  48,  64,   /*  8 water      */
   42,  78,  98,   /*  9 water lit  */
  120, 168, 186,   /* 10 foam       */
   84,  70,  42,   /* 11 worm dim   */
  138, 116,  60,   /* 12 worm body  */
  224, 202, 108,   /* 13 worm glow  */
  255, 246, 200,   /* 14 worm core  */
  176, 230, 240,   /* 15 pale glow  */
  180, 140,  62,   /* 16 elder       */
  130, 232, 202,   /* 17 rune        */
  255, 250, 225,   /* 18 spark       */
   40,  38,  54,   /* 19 grit        */
   60,  80,  96,   /* 20 pool edge   */
   58,  70,  86    /* 21 mist        */
};
/* ---------------------------------------------------------------- buffers */
static u8 base[MAXW * MAXH];        /* the cave, painted once per layout   */
static u8 fb[MAXW * MAXH];          /* this frame, palette indices         */
static u8 rgba[MAXW * MAXH * 4];    /* what the page blits                 */
static u8 lint[LW * LH];            /* light intensity, 0..255             */
static u8 ltint[LW * LH];           /* how warm that light is, 0..255      */
static u8 lut[NPAL * 32 * 2 * 3];   /* [pal][level][warm|cool][rgb]        */

/* ------------------------------------------------------------------- math */
static f32 fab(f32 x) { return x < 0.0f ? -x : x; }
static f32 mn(f32 a, f32 b) { return a < b ? a : b; }
static f32 mx(f32 a, f32 b) { return a > b ? a : b; }
static f32 cl(f32 v, f32 a, f32 b) { return v < a ? a : (v > b ? b : v); }
static i32 cli(i32 v, i32 a, i32 b) { return v < a ? a : (v > b ? b : v); }
static f32 sq(f32 x) { return __builtin_sqrtf(x); }
static f32 flr(f32 x) { return __builtin_floorf(x); }
static i32 cl255(f32 v) { i32 i = (i32)(v + 0.5f); return i < 0 ? 0 : (i > 255 ? 255 : i); }

/* sin/cos without libm: reduce to [-pi/2, pi/2], then a 7th-order series. */
static f32 s_poly(f32 x) {
    f32 x2 = x * x;
    return x * (1.0f - x2 * (0.16666667f - x2 * (0.008333333f - x2 * 0.0001984127f)));
}
static f32 fsin(f32 x) {
    x = x - TAU * flr(x * 0.15915494f + 0.5f);
    if (x > HPI) x = PI - x;
    else if (x < -HPI) x = -PI - x;
    return s_poly(x);
}
static f32 fcos(f32 x) { return fsin(x + HPI); }

/* xorshift32: one global stream, reset from the seed at every layout. */
static u32 rngS = 1u;
static u32 rnd(void) {
    u32 x = rngS;
    x ^= x << 13; x ^= x >> 17; x ^= x << 5;
    rngS = x;
    return x;
}
static f32 rndf(void) { return (f32)(rnd() >> 8) * (1.0f / 16777216.0f); }
static i32 rndi(i32 n) { return n <= 1 ? 0 : (i32)(rnd() % (u32)n); }

/* value noise over a hashed lattice, for rock and moss */
static f32 hash2(i32 x, i32 y, u32 s) {
    u32 h = (u32)x * 374761393u + (u32)y * 668265263u + s * 2246822519u;
    h = (h ^ (h >> 13)) * 1274126177u;
    return (f32)((h ^ (h >> 16)) >> 8) * (1.0f / 16777216.0f);
}
static f32 vnoise(f32 x, f32 y, u32 s) {
    i32 xi = (i32)flr(x), yi = (i32)flr(y);
    f32 fx = x - (f32)xi, fy = y - (f32)yi;
    fx = fx * fx * (3.0f - 2.0f * fx);
    fy = fy * fy * (3.0f - 2.0f * fy);
    f32 a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s);
    f32 c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
    return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fy;
}
static f32 fbm(f32 x, f32 y, u32 s) {
    return vnoise(x, y, s) * 0.6f + vnoise(x * 2.3f + 11.0f, y * 2.3f + 7.0f, s) * 0.28f
         + vnoise(x * 5.1f + 3.0f, y * 5.1f + 19.0f, s) * 0.12f;
}

/* ------------------------------------------------------------------ state */
typedef struct {
    f32 u, v;      /* where it hangs, in cave fractions (chosen once)     */
    f32 x, y;      /* where it is drawn                                   */
    f32 glow;      /* 0..1                                                */
    f32 target;    /* what glow eases toward                              */
    f32 sway;      /* push from the last breath of air, decays            */
    f32 phase, rate;  /* breathing                                       */
    f32 pale;      /* the cool kind                                       */
    f32 bloom;     /* seconds of full bloom left                          */
    f32 spark;     /* seconds of a bright answering flare left            */
    i32 cstar;     /* 1 if it joins the idle constellation                */
} Worm;
typedef struct { f32 u, v, ux, uy, ph; i32 lit; } Mote;
typedef struct { f32 x, y, r, age, life; i32 alive; } Ring;
typedef struct { f32 x, y, age; } Trail;
typedef struct { f32 u, v, vy, life; i32 alive; } Drop;

static i32 W = 180, H = 320;
static u32 SEED = 20261112u;
static f32 ceilY = 54.0f, poolY = 254.0f;
static Worm worm[NWMAX];
static i32 nworm = 0;
static Mote mote[NMOTE];
static Ring ring[NRING];
static Trail trail[NTRAIL];
static i32 ntrail = 0;
static Drop drop[6];
static i32 litN = 0;
static f32 tS = 0.0f, motionScale = 1.0f, lastInput = 0.0f;
static i32 down = 0, moved = 0, holdFired = 0, chainN = 0;
static f32 pX = 0, pY = 0, dX = 0, dY = 0, dT = 0;
static i32 poolTaps = 0;
static f32 poolTapT = -99.0f;
static i32 elderOn = 0, runeOn = 0;
static f32 elderGlow = 0, elderT = 0, runeGlow = 0, runeQuiet = 0;
static i32 miteOn = 0, miteSeen = 0;
static f32 miteX = 0, miteY = 0, miteDir = 1, miteT = 0;
static i32 hintOn = 0, hintWorm = -1, starOn = 0;
static f32 hintT = 0, starT = 0, nextHint = 20.0f;
static f32 evq[NEV * 3];
static i32 nev = 0;

static void ev(i32 type, f32 a, f32 b) {
    if (nev >= NEV) return;
    evq[nev * 3 + 0] = (f32)type;
    evq[nev * 3 + 1] = a;
    evq[nev * 3 + 2] = b;
    nev++;
}

/* --------------------------------------------------------------- painting */
static void put(i32 x, i32 y, u8 c) {
    if (x >= 0 & x < W & y >= 0 & y < H) fb[y * MAXW + x] = c;
}

/* ------------------------------------------------------------------ layout */
static void buildBase(void);
static void place(void);
static void layout(void) {
    ceilY = flr((f32)H * 0.30f);
    poolY = flr((f32)H * 0.795f);
    rngS = SEED * 2654435761u ^ 0x9e3779b9u;

    nworm = 15 + rndi(6);
    for (i32 i = 0; i < nworm; i++) {
        Worm *w = &worm[i];
        w->u = 0.055f + 0.885f * (((f32)i + 0.15f + 0.7f * rndf()) / (f32)nworm);
        w->v = rndf();
        w->glow = 0.0f; w->target = 0.0f; w->sway = 0.0f; w->bloom = 0.0f; w->spark = 0.0f;
        w->phase = rndf() * TAU; w->rate = 0.42f + 0.55f * rndf();
        w->pale = rndf() < 0.15f ? 1.0f : 0.0f;
        w->cstar = 0;
    }
    for (i32 k = 0; k < 5; k++) {
        i32 i = cli((i32)((f32)(k * nworm) / 5.0f) + rndi(2), 0, nworm - 1);
        worm[i].cstar = 1;
    }
    for (i32 i = 0; i < NMOTE; i++) {
        Mote *m = &mote[i];
        m->u = rndf(); m->v = 0.22f + 0.5f * rndf(); m->ph = rndf() * TAU; m->lit = 0;
        m->ux = (rndf() - 0.5f) * 0.4f; m->uy = -0.15f - 0.35f * rndf();
    }
    for (i32 i = 0; i < NRING; i++) ring[i].alive = 0;
    for (i32 i = 0; i < 6; i++) drop[i].alive = 0;
    ntrail = 0;
    buildBase();
    place();
}

/* The cave, painted once per layout: ceiling rock, walls, moss, the pool. */
static void buildBase(void) {
    f32 wallw = mx(9.0f, (f32)W * 0.072f);
    i32 cy = (i32)ceilY, py = (i32)poolY;
    for (i32 y = 0; y < H; y++) {
        for (i32 x = 0; x < W; x++) {
            f32 fx = (f32)x, fy = (f32)y;
            i32 iw = W - 1 - (i32)wallw;
            u8 c = 0;
            if (y < cy) {
                /* ceiling slab: layered strata, broken by grain */
                /* strata: layers whose boundaries wander with x */
                f32 wob = 3.2f * fsin(fx * 0.052f) + 5.0f * fbm(fx * 0.028f, fy * 0.012f, 0x91u);
                i32 band = (i32)flr((fy + wob) * 0.155f);
                f32 k = hash2(band, 7, 0x51ab3u);
                f32 grain = fbm(fx * 0.34f, fy * 0.36f, 0x77a1u);
                f32 patch = fbm(fx * 0.045f, fy * 0.050f, 0x1234u);
                c = k > 0.52f ? 1 : 0;
                if (k > 0.74f) c = 2;
                if (k > 0.90f) c = 3;
                if (grain > 0.80f) c = c < 3 ? (u8)(c + 1) : c;
                if (grain < 0.16f) c = 0;
                if (patch > 0.70f) c = 4;        /* moss creeping on rock  */
                if (patch > 0.80f) c = 5;
                if (patch > 0.88f) c = 6;
            } else if (y < cy + 2) {
                c = 2;
            } else if (y >= py) {
                i32 d = y - py;
                c = d < 2 ? 20 : (d < 6 ? 8 : 7);
                f32 foam = hash2(x, y, 0xf0a3u);
                if (d < 3 & foam > 0.72f) c = 10;
                if (d >= 3 & foam > 0.965f) c = 9;
            } else {
                /* open air: darkness that thickens into a haze near the pool */
                /* the air itself is a flat dark; the pool's light makes its gradient */
                c = 0;
                if (hash2(x, y, 0x2b17u) > 0.994f) c = 19;
            }
            if (x < (i32)wallw || x > iw) {
                /* side walls, a column of their own rock */
                f32 n = fbm(fx * 0.12f + 31.0f, fy * 0.09f, 0x9911u);
                c = n > 0.5f ? 1 : 0;
                if (n > 0.74f) c = 2;
                if (n > 0.88f) c = 4;
                if (x == (i32)wallw || x == iw) c = 2;
                if (x == (i32)wallw - 1 || x == iw + 1) c = 1;
            }
            base[y * MAXW + x] = c;
        }
    }
    /* stalactites hanging off the ceiling lip */
    i32 nst = 3 + rndi(3);
    for (i32 k = 0; k < nst; k++) {
        i32 cx = 8 + rndi(W - 16);
        i32 len = 5 + rndi(4 + (i32)((f32)H * 0.04f));
        i32 hw = 2 + rndi(3);
        if (len > H / 4) len = H / 4;
        for (i32 yy = 0; yy < len; yy++) {
            f32 f = 1.0f - (f32)yy / (f32)len;
            i32 h = cli((i32)((f32)hw * f + 0.5f), 0, hw);
            for (i32 dx = -h; dx <= h; dx++) {
                i32 x = cx + dx, y = cy + yy;
                if (x >= 0 & x < W & y < H & base[y * MAXW + x] < 5)
                    base[y * MAXW + x] = (dx <= -h) ? 2 : ((dx >= h) ? 0 : 1);
            }
            if (yy == len - 1 & cx >= 0 & cx < W) base[(cy + yy) * MAXW + cx] = 1;
        }
    }
    /* two boulders at the water's edge, each with a lit rim so it reads */
    i32 bx[2]; f32 br[2];
    bx[0] = (i32)((f32)W * 0.16f) + rndi(4);
    bx[1] = (i32)((f32)W * 0.84f) - rndi(4);
    br[0] = (f32)H * 0.035f + 2.0f;
    br[1] = (f32)H * 0.042f + 2.0f;
    for (i32 k = 0; k < 2; k++) {
        f32 cx = (f32)bx[k], cyy = (f32)py - br[k] * 0.35f, r = br[k];
        for (i32 y = (i32)(cyy - r); y <= py; y++) {
            for (i32 x = (i32)(cx - r); x <= (i32)(cx + r); x++) {
                f32 dx = (f32)x - cx, dy = (f32)y - cyy;
                f32 d = sq(dx * dx + dy * dy * 1.25f);
                if (d > r) continue;
                if (x < 0 || x >= W || y < 0 || y >= H) continue;
                u8 c = 0;
                f32 rim = r - d;
                if (rim < 1.6f) c = 3;
                else if (rim < 3.2f) c = 1;
                else c = 0;
                /* the light comes from above: brighter on the top-left arc */
                if (dx < 0.2f & dy < 0.0f & rim > 2.4f) c = 1;
                if (hash2(x, y, 0x1234u) > 0.93f) c = c == 0 ? 4 : 5;
                base[y * MAXW + x] = c;
            }
        }
    }
}

/* -------------------------------------------------------------- the light */
/* Intensity and warmth, at quarter resolution, then sampled bilinearly. */
static void buildLight(void) {
    i32 lw = W / LSC + 2, lh = H / LSC + 2;
    for (i32 cy = 0; cy < LH; cy++)
        for (i32 cx = 0; cx < LW; cx++) { lint[cy * LW + cx] = 104; ltint[cy * LW + cx] = 0; }
    for (i32 i = 0; i < nworm; i++) {
        Worm *w = &worm[i];
        f32 g = w->glow;
        if (g <= 0.03f) continue;
        /* a soft, wide falloff: a hard radius leaves a visible ring */
        f32 R = (14.0f + 62.0f * g) * (1.0f + 0.10f * (f32)H / 320.0f);
        for (i32 cy = 0; cy < lh; cy++) {
            f32 wy = (f32)(cy * LSC) + 2.0f;
            for (i32 cx = 0; cx < lw; cx++) {
                f32 wx = (f32)(cx * LSC) + 2.0f;
                f32 dx = (wx - w->x) / R, dy = (wy - w->y) / R;
                f32 d2 = dx * dx + dy * dy;
                if (d2 > 7.5f) continue;
                f32 f = g * 235.0f / (1.0f + 4.6f * d2);
                i32 o = cy * LW + cx;
                i32 ni = (i32)lint[o] + (i32)f;
                lint[o] = (u8)(ni > 255 ? 255 : ni);
                if (w->pale > 0.5f) {
                    i32 t = (i32)ltint[o] - (i32)(f * 0.9f);
                    ltint[o] = (u8)(t < 0 ? 0 : t);
                } else {
                    i32 t = (i32)ltint[o] + (i32)(f * 0.7f);
                    ltint[o] = (u8)(t > 255 ? 255 : t);
                }
            }
        }
    }
    /* the elder's pool of light, and the pool's own faint answer */
    if (elderGlow > 0.03f) {
        f32 R = 46.0f + 96.0f * elderGlow;
        f32 ex = (f32)W * 0.875f, ey = ceilY + (f32)H * 0.10f;
        for (i32 cy = 0; cy < lh; cy++)
            for (i32 cx = 0; cx < lw; cx++) {
                f32 dx = ((f32)(cx * LSC) - ex) / R, dy = ((f32)(cy * LSC) - ey) / R;
                f32 d2 = dx * dx + dy * dy;
                if (d2 > 7.5f) continue;
                f32 f = elderGlow * 170.0f / (1.0f + 4.2f * d2);
                i32 o = cy * LW + cx;
                i32 ni = (i32)lint[o] + (i32)f;
                lint[o] = (u8)(ni > 255 ? 255 : ni);
                i32 t = (i32)ltint[o] + (i32)(f * 0.5f);
                ltint[o] = (u8)(t > 255 ? 255 : t);
            }
    }
    /* the pool's own cold light, so the cave reads as a place before any worm */
    {
        f32 R = (f32)H * 0.78f;
        f32 ex = (f32)W * 0.5f, ey = poolY + 4.0f;
        for (i32 cy = 0; cy < lh; cy++)
            for (i32 cx = 0; cx < lw; cx++) {
                f32 dx = ((f32)(cx * LSC) - ex) / R, dy = ((f32)(cy * LSC) - ey) / R;
                f32 d2 = dx * dx + dy * dy;
                if (d2 > 9.0f) continue;
                f32 f = 46.0f / (1.0f + 2.1f * d2);
                f32 ripple = 1.0f + 0.10f * fsin((f32)(cx * LSC) * 0.2f + tS * 0.6f);
                i32 o = cy * LW + cx;
                i32 ni = (i32)lint[o] + (i32)(f * ripple);
                lint[o] = (u8)(ni > 255 ? 255 : ni);
            }
    }
    /* every lit worm lends the water a little of its colour */
    i32 pyc = (i32)poolY / LSC;
    for (i32 cy = 0; cy < lh; cy++)
        for (i32 cx = 0; cx < lw; cx++) {
            if (cy < pyc - 1) continue;
            f32 f = (f32)litN * 2.2f;
            i32 o = cy * LW + cx;
            i32 ni = (i32)lint[o] + (i32)f;
            lint[o] = (u8)(ni > 255 ? 255 : ni);
        }
}
static i32 sampleBuf(u8 *b, f32 x, f32 y) {
    f32 lx = x / (f32)LSC, ly = y / (f32)LSC;
    i32 x0 = (i32)lx, y0 = (i32)ly;
    f32 fx = lx - (f32)x0, fy = ly - (f32)y0;
    i32 x1 = x0 + 1, y1 = y0 + 1;
    if (x1 >= LW) x1 = LW - 1; if (y1 >= LH) y1 = LH - 1;
    if (x0 < 0) x0 = 0; if (y0 < 0) y0 = 0;
    f32 a = (f32)b[y0 * LW + x0], c = (f32)b[y0 * LW + x1];
    f32 d = (f32)b[y1 * LW + x0], e = (f32)b[y1 * LW + x1];
    f32 top = a + (c - a) * fx, bot = d + (e - d) * fx;
    return (i32)(top + (bot - top) * fy + 0.5f);
}

static void buildLut(void) {
    for (i32 i = 0; i < NPAL; i++) {
        f32 r = (f32)PAL[i * 3], g = (f32)PAL[i * 3 + 1], b = (f32)PAL[i * 3 + 2];
        for (i32 L = 0; L < 32; L++) {
            f32 t = (f32)L / 31.0f;
            f32 f = 0.20f + 1.02f * t * (0.72f + 0.28f * t);
            for (i32 s = 0; s < 2; s++) {
                f32 wr = s == 0 ? 1.22f : 0.90f;
                f32 wg = s == 0 ? 1.07f : 1.01f;
                f32 wb = s == 0 ? 0.93f : 1.20f;
                i32 o = ((i * 32 + L) * 2 + s) * 3;
                lut[o + 0] = (u8)cl255(r * f * wr);
                lut[o + 1] = (u8)cl255(g * f * wg);
                lut[o + 2] = (u8)cl255(b * f * wb);
            }
        }
    }
}

/* ------------------------------------------------------------ the picture */
static void drawWater(f32 t) {
    i32 py = (i32)poolY;
    u32 tick = (u32)flr(t * 1.4f);
    for (i32 x = 0; x < W; x++) {
        put(x, py, 9);
        if (hash2(x, 3, 0x9911u) > 0.55f) put(x, py + 1, 9);
    }
    for (i32 y = py + 1; y < H; y++)
        for (i32 x = 0; x < W; x++) {
            /* glints hop between hashed cells: no lattice, no scan lines */
            f32 g = hash2(x, y, 0x5a5au + tick * 7u);
            if (g > 0.9984f) put(x, y, 10);
            else if (g > 0.9962f) put(x, y, 9);
        }
    for (i32 i = 0; i < nworm; i++) {
        Worm *w = &worm[i];
        f32 g = w->glow;
        if (g < 0.22f) continue;
        f32 span = (f32)(H - py);
        for (i32 y = py; y < H; y++) {
            f32 d = (f32)(y - py);
            f32 amp = 1.2f + d * 0.03f;
            f32 xr = w->x + amp * fsin((f32)y * 0.21f + t * 0.8f + (f32)i * 1.7f);
            f32 f = g * (1.0f - d / span) * 1.2f;
            i32 x = (i32)(xr + 0.5f);
            if (f > 0.62f) put(x, y, 9);
            else if (f > 0.34f) put(x, y, 8);
            if (f > 0.82f & hash2(x, y, 0x77u) > 0.72f) put(x, y, 10);
        }
    }
}
static void drawRings(void) {
    for (i32 i = 0; i < NRING; i++) {
        Ring *r = &ring[i];
        if (!r->alive) continue;
        f32 f = 1.0f - r->age / r->life;
        if (f <= 0.0f) { r->alive = 0; continue; }
        u8 c = f > 0.55f ? 10 : (f > 0.25f ? 9 : 8);
        u8 c2 = f > 0.55f ? 9 : 8;
        for (i32 k = 0; k < 30; k++) {
            f32 a = (f32)k * TAU / 30.0f;
            i32 x = (i32)(r->x + r->r * fcos(a) + 0.5f);
            i32 y = (i32)(r->y + r->r * 0.40f * fsin(a) + 0.5f);
            if (y >= (i32)poolY) put(x, y, c);
            x = (i32)(r->x + (r->r - 2.0f) * fcos(a) + 0.5f);
            y = (i32)(r->y + (r->r - 2.0f) * 0.40f * fsin(a) + 0.5f);
            if (y >= (i32)poolY) put(x, y, c2);
        }
    }
}
static void drawDrops(void) {
    for (i32 i = 0; i < 6; i++) {
        Drop *d = &drop[i];
        if (!d->alive) continue;
        i32 x = (i32)(d->u * (f32)W), y = (i32)(d->v * (f32)H);
        put(x, y, 10); put(x, y + 1, 9);
        if (d->v * (f32)H > poolY - 2.0f) put(x, y + 2, 10);
    }
}
static void drawTrail(void) {
    for (i32 i = 0; i < ntrail; i++) {
        Trail *tr = &trail[i];
        f32 f = 1.0f - tr->age / 1.5f;
        if (f <= 0.0f) continue;
        u8 c = f > 0.6f ? 12 : (f > 0.3f ? 11 : 19);
        i32 x = (i32)tr->x, y = (i32)tr->y;
        put(x, y, c);
        if (f > 0.4f) { put(x - 1, y, 11); put(x + 1, y, 11); }
        if (f > 0.7f) { put(x, y - 1, 11); put(x, y + 1, 11); }
    }
}
static void ellipse_outline(f32 cx, f32 cy, f32 rx, f32 ry, u8 c, i32 steps) {
    i32 px = -4096, py = -4096;
    for (i32 k = 0; k <= steps; k++) {
        f32 a = (f32)k * TAU / (f32)steps;
        i32 x = (i32)(cx + rx * fcos(a) + 0.5f), y = (i32)(cy + ry * fsin(a) + 0.5f);
        if (x == px & y == py) continue;
        put(x, y, c); px = x; py = y;
    }
}
/* A moth carved in the rock above the worms: only light shows it, and only
 * the elder's wake makes the carving itself glow. */
static void drawRune(void) {
    f32 cx = (f32)W * 0.46f, cy = ceilY * 0.52f;
    f32 sc = mx(1.0f, (f32)W * 0.0095f);
    u8 c = runeOn ? 17 : 3;
    if (runeOn & runeGlow < 0.35f) c = 3;
    i32 wx = (i32)(9.0f * sc), wy = (i32)(7.0f * sc);
    if (wx < 4) wx = 4;
    if (wy < 3) wy = 3;
    /* a wing each side, tips meeting at the body */
    for (i32 k = 0; k <= wx; k++) {
        i32 h = (i32)((f32)wy * (1.0f - (f32)k / (f32)wx) + 0.5f);
        put((i32)cx - k, (i32)cy - h, c); put((i32)cx - k, (i32)cy + h, c);
        put((i32)cx + k, (i32)cy - h, c); put((i32)cx + k, (i32)cy + h, c);
    }
    for (i32 k = -4; k <= 4; k++) put((i32)cx, (i32)cy + k, c);          /* body  */
    put((i32)cx - 1, (i32)cy - 5, c); put((i32)cx + 1, (i32)cy - 5, c);  /* feelers */
    put((i32)cx - 2, (i32)cy - 6, c); put((i32)cx + 2, (i32)cy - 6, c);
    /* a tally somebody left beneath it */
    f32 my = cy + (f32)wy + 6.0f;
    for (i32 k = 0; k < 3; k++) {
        put((i32)(cx - 4.0f + (f32)k * 4.0f), (i32)my, c);
        put((i32)(cx - 4.0f + (f32)k * 4.0f), (i32)my - 1, c);
    }
}
static void drawWorm(i32 i) {
    Worm *w = &worm[i];
    f32 g = w->glow;
    f32 x = w->x + w->sway, y = w->y;
    if (g <= 0.02f) {
        put((i32)x, (i32)y, 11);
        put((i32)x - 1, (i32)y, 11); put((i32)x + 1, (i32)y, 11);
        put((i32)x, (i32)y + 1, 11);
        put((i32)x, (i32)y - 1, 0);
        return;
    }
    i32 L = cli((i32)(g * 3.4f), 0, 3);
    u8 body = (u8)(11 + L), core = (u8)(12 + cli(L, 0, 2));
    if (w->pale > 0.5f) { body = g > 0.5f ? 15 : 12; core = 15; }
    for (i32 k = 1; k <= 4; k++) put((i32)x, (i32)y - k, g > 0.4f ? (u8)12 : (u8)11);
    put((i32)x, (i32)y, core);
    put((i32)x - 1, (i32)y, body); put((i32)x + 1, (i32)y, body);
    put((i32)x, (i32)y + 1, body);
    put((i32)x - 1, (i32)y + 1, g > 0.6f ? body : (u8)11);
    put((i32)x + 1, (i32)y + 1, g > 0.6f ? body : (u8)11);
    put((i32)x, (i32)y + 2, body);
    if (g > 0.72f) { put((i32)x - 2, (i32)y, 12); put((i32)x + 2, (i32)y, 12); }
}
static void drawElder(void) {
    f32 x = (f32)W * 0.875f, y = ceilY + (f32)H * 0.085f;
    if (elderGlow < 0.18f) {
        for (i32 yy = -3; yy <= 4; yy++)
            for (i32 xx = -3; xx <= 3; xx++) {
                f32 dx = (f32)xx / 3.2f, dy = ((f32)yy - 0.5f) / 4.4f;
                if (dx * dx + dy * dy < 1.0f) put((i32)x + xx, (i32)y + yy, 19);
            }
        for (i32 k = 1; k <= 6; k++) put((i32)x, (i32)y - 4 - k, 0);
        return;
    }
    i32 L = cli((i32)(elderGlow * 3.0f), 0, 3);
    u8 body = (u8)(11 + L), core = (u8)(13 + cli(L, 0, 1));
    for (i32 k = 1; k <= 6; k++) put((i32)x, (i32)y - 4 - k, elderGlow > 0.4f ? (u8)16 : (u8)11);
    for (i32 yy = -3; yy <= 4; yy++)
        for (i32 xx = -3; xx <= 3; xx++) {
            f32 dx = (f32)xx / 3.2f, dy = ((f32)yy - 0.5f) / 4.4f;
            f32 d = sq(dx * dx + dy * dy);
            if (d >= 1.0f) continue;
            u8 c = d > 0.72f ? 16 : body;
            if (d < 0.34f) c = core;
            put((i32)x + xx, (i32)y + yy, c);
        }
    put((i32)x - 4, (i32)y, 16); put((i32)x + 4, (i32)y, 16);
}
static void drawMotes(void) {
    for (i32 i = 0; i < NMOTE; i++) {
        Mote *m = &mote[i];
        i32 x = (i32)(m->u * (f32)W), y = (i32)(m->v * (f32)H);
        if (y < (i32)ceilY + 2 || y > (i32)poolY - 2) continue;
        put(x, y, m->lit ? 18 : 21);
    }
}
static void drawMite(void) {
    if (!miteOn) return;
    i32 x = (i32)miteX, y = (i32)miteY, dir = miteDir > 0 ? 1 : -1;
    put(x, y, 18);
    put(x - 1, y, 15); put(x + 1, y, 15);
    put(x - dir * 2, y - 1, 15);
    put(x - dir, y - 1, 18);
    for (i32 k = 1; k <= 4; k++) put(x - dir * k, y + 1, 8);
}

/* -------------------------------------------------------------- the frame */
static void render(void) {
    for (i32 i = 0; i < MAXW * H; i++) fb[i] = base[i];
    drawWater(tS);
    drawRings();
    drawDrops();
    drawRune();
    drawTrail();
    for (i32 i = 0; i < nworm; i++) drawWorm(i);
    drawElder();
    drawMotes();
    drawMite();
    buildLight();
    for (i32 y = 0; y < H; y++)
        for (i32 x = 0; x < W; x++) {
            u8 idx = fb[y * MAXW + x];
            if (idx >= NPAL) idx = 0;
            i32 L = sampleBuf(lint, (f32)x, (f32)y);
            i32 li = L >> 3;
            if (li > 31) li = 31;
            i32 w = sampleBuf(ltint, (f32)x, (f32)y);   /* 0 cool .. 255 warm */
            i32 cw = 255 - w;
            i32 o = ((i32)idx * 32 + li) * 6;           /* warm set, then cool */
            i32 p = (y * MAXW + x) * 4;
            rgba[p + 0] = (u8)((lut[o + 0] * w + lut[o + 3] * cw) >> 8);
            rgba[p + 1] = (u8)((lut[o + 1] * w + lut[o + 4] * cw) >> 8);
            rgba[p + 2] = (u8)((lut[o + 2] * w + lut[o + 5] * cw) >> 8);
            rgba[p + 3] = 255;
        }
}

/* ---------------------------------------------------------------- helpers */
static void place(void) {
    f32 top = ceilY + 3.0f;
    f32 band = mx(10.0f, (f32)H * 0.085f);
    for (i32 i = 0; i < nworm; i++) {
        Worm *w = &worm[i];
        w->x = w->u * (f32)W + w->sway;
        w->y = top + w->v * band + 1.3f * fsin(w->phase) * motionScale;
    }
}
static i32 countLit(void) {
    i32 n = 0;
    for (i32 i = 0; i < nworm; i++) if (worm[i].glow > 0.3f) n++;
    return n;
}
static void spawnRing(f32 x, f32 y, f32 life) {
    for (i32 i = 0; i < NRING; i++) {
        if (ring[i].alive) continue;
        ring[i].alive = 1; ring[i].x = x; ring[i].y = y;
        ring[i].r = 1.5f; ring[i].age = 0.0f; ring[i].life = life;
        return;
    }
}
static void spawnDrop(f32 x, f32 y) {
    for (i32 i = 0; i < 6; i++) {
        if (drop[i].alive) continue;
        drop[i].alive = 1;
        drop[i].u = cl(x, 2.0f, (f32)W - 3.0f) / (f32)W;
        drop[i].v = cl(y, ceilY, (f32)H) / (f32)H;
        drop[i].vy = 5.0f; drop[i].life = 0.0f;
        return;
    }
}
static void addTrail(f32 x, f32 y) {
    if (ntrail >= NTRAIL) {
        for (i32 i = 1; i < NTRAIL; i++) trail[i - 1] = trail[i];
        ntrail = NTRAIL - 1;
    }
    trail[ntrail].x = x; trail[ntrail].y = y; trail[ntrail].age = 0.0f;
    ntrail++;
}
static void wakeWorm(i32 i, f32 amount, i32 sound) {
    Worm *w = &worm[i];
    f32 before = w->glow;
    if (w->target < amount) w->target = amount;
    if (sound & before < 0.3f) {
        ev(1, (f32)i, w->pale > 0.5f ? 1.0f : 0.0f);
        chainN++;
        if (chainN == 4) ev(3, 4.0f, 0.0f);
    }
}
static i32 nearestWorm(f32 x, f32 y, f32 rad) {
    i32 best = -1; f32 bd = rad * rad;
    for (i32 i = 0; i < nworm; i++) {
        f32 dx = worm[i].x - x, dy = worm[i].y - y;
        f32 d2 = dx * dx + dy * dy;
        if (d2 < bd) { bd = d2; best = i; }
    }
    return best;
}
static f32 breathF = 0.0f, breathDx = 0.0f, breathDy = 0.0f;

/* ------------------------------------------------------------ the touches */
static void breath(f32 dx, f32 dy) {
    f32 m = sq(dx * dx + dy * dy);
    if (m < 0.001f) m = 1.0f;
    f32 nX = dx / m, nY = dy / m;
    for (i32 i = 0; i < nworm; i++) {
        Worm *w = &worm[i];
        w->sway += (nX * 5.2f + nY * 1.4f) * motionScale;
        if (w->sway > 6.0f) w->sway = 6.0f;
        if (w->sway < -6.0f) w->sway = -6.0f;
        if (w->target > 0.24f) w->target = mx(0.18f, w->target - 0.30f);
    }
    breathF = 1.0f; breathDx = nX; breathDy = nY;
    for (i32 i = 0; i < NMOTE; i++) mote[i].ux += nX * 0.35f;
    ev(7, nX, nY);
}
static void doTap(f32 x, f32 y) {
    i32 py = (i32)poolY;
    if (y >= (f32)py - 2.0f) {
        spawnRing(x, cl(y, (f32)py, (f32)H - 3.0f), 3.2f);
        ev(9, x, y);
        if (tS - poolTapT > 3.5f) poolTaps = 0;
        poolTapT = tS; poolTaps++;
        if (poolTaps >= 3 & !miteOn & !miteSeen) {
            miteOn = 1; miteSeen = 1; miteT = 0.0f;
            miteX = cl(x, 12.0f, (f32)W - 12.0f);
            miteY = poolY + 5.0f;
            miteDir = rndf() < 0.5f ? -1.0f : 1.0f;
            ev(10, 0.0f, 0.0f);
        }
        return;
    }
    i32 i = nearestWorm(x, y, 20.0f);
    if (i >= 0) {
        Worm *w = &worm[i];
        if (w->glow > 0.7f) {
            w->target = 0.34f;      /* it rests warm; nothing goes out */
            ev(2, (f32)i, w->pale > 0.5f ? 1.0f : 0.0f);
        } else {
            w->spark = 0.9f;
            wakeWorm(i, 0.94f, 1);
        }
        return;
    }
    if (y < ceilY + 5.0f) spawnDrop(x, y);
    ev(8, x, y);
}
static void doHold(f32 x, f32 y) {
    i32 i = nearestWorm(x, y, 18.0f);
    if (i < 0) { ev(8, x, y); return; }
    Worm *w = &worm[i];
    if (w->glow > 0.55f) {
        w->bloom = 5.5f;
        ev(4, (f32)i, 0.0f);
        if (!elderOn & countLit() >= 4) {
            elderOn = 1; elderT = 0.0f; elderGlow = 0.0f;
            ev(5, 0.0f, 0.0f);
        }
    } else {
        w->spark = 1.3f;
        wakeWorm(i, 1.0f, 1);
        ev(4, (f32)i, 0.0f);
    }
}

/* ------------------------------------------------------------------- step */
static void step(f32 dt) {
    if (dt > 0.05f) dt = 0.05f;
    if (dt < 0.0f) dt = 0.0f;
    f32 ms = 0.35f + 0.65f * motionScale;
    tS += dt;
    breathF -= dt * 0.75f;
    if (breathF < 0.0f) breathF = 0.0f;

    /* a press that stays put and stays down becomes a long press */
    if (down & !holdFired) {
        f32 dx = dX - pX, dy = dY - pY;
        if (dx * dx + dy * dy < 49.0f & (tS - dT) > 1.15f) { holdFired = 1; doHold(pX, pY); }
    }

    for (i32 i = 0; i < nworm; i++) {
        Worm *w = &worm[i];
        f32 tgt = w->target;
        if (w->bloom > 0.0f) { w->bloom -= dt; tgt = 1.0f; }
        else if (w->spark > 0.0f) { w->spark -= dt; tgt = mx(tgt, 0.9f); }
        if (starOn & w->cstar) tgt = 1.0f;
        if (hintOn & i == hintWorm) tgt = mx(tgt, 0.55f);
        f32 k = tgt > w->glow ? 1.9f : 1.15f;
        w->glow += (tgt - w->glow) * mn(1.0f, k * dt * ms);
        if (w->glow < 0.005f) w->glow = 0.0f;
        w->phase += w->rate * dt * (0.5f + 0.7f * ms) * (elderOn ? 0.8f : 1.0f);
        w->sway -= w->sway * mn(1.0f, 1.7f * dt * ms);
    }
    place();
    litN = countLit();

    /* motes drift up and lean into the last breath */
    for (i32 i = 0; i < NMOTE; i++) {
        Mote *m = &mote[i];
        m->u += (m->ux + breathDx * breathF * 0.5f) * dt * 0.012f * ms;
        m->v += (m->uy - breathDy * breathF * 0.2f) * dt * 0.02f * ms;
        m->ph += dt;
        m->u += 0.0016f * fsin(m->ph * 0.7f + (f32)i) * ms;
        if (m->u < 0.0f) m->u = 1.0f; if (m->u > 1.0f) m->u = 0.0f;
        if (m->v < 0.20f) m->v = 0.74f; if (m->v > 0.76f) m->v = 0.22f;
        m->lit = breathF > 0.3f ? 1 : 0;
    }
    for (i32 i = 0; i < NRING; i++) {
        Ring *r = &ring[i];
        if (!r->alive) continue;
        r->age += dt * (0.6f + 0.6f * ms);
        r->r += dt * 11.0f * ms;
    }
    for (i32 i = 0; i < 6; i++) {
        Drop *d = &drop[i];
        if (!d->alive) continue;
        d->vy += 34.0f * dt * ms;
        d->v += d->vy * dt / (f32)H;
        if (d->v * (f32)H >= poolY + 1.0f) {
            d->alive = 0;
            spawnRing(d->u * (f32)W, poolY + 4.0f, 2.4f);
            ev(9, d->u * (f32)W, poolY);
        } else if (d->life > 4.0f) d->alive = 0;
        d->life += dt;
    }
    for (i32 i = 0; i < ntrail; i++) trail[i].age += dt;
    while (ntrail > 0 & trail[0].age > 1.5f) {
        for (i32 i = 1; i < ntrail; i++) trail[i - 1] = trail[i];
        ntrail--;
    }
    if (rndf() < dt * 0.06f) spawnDrop((f32)(2 + rndi(W - 4)), ceilY + (f32)rndi(6));

    /* the elder wakes the whole cave, then leaves the carving glowing */
    if (elderOn) {
        elderT += dt;
        elderGlow += (1.0f - elderGlow) * mn(1.0f, 0.9f * dt);
        if (!runeOn & elderT > 2.4f) { runeOn = 1; ev(6, 0.0f, 0.0f); }
        if (runeOn) runeGlow += (1.0f - runeGlow) * mn(1.0f, 0.8f * dt);
        if (elderT > 0.1f & elderT < 0.2f)
            for (i32 i = 0; i < nworm; i++) if (worm[i].target < 0.6f) worm[i].target = 0.6f;
    }
    runeQuiet = runeOn ? 1.0f : 0.0f;

    /* the visitor skates until it leaves */
    if (miteOn) {
        miteT += dt;
        miteX += miteDir * 13.0f * dt * ms;
        miteY = poolY + 5.0f + 2.6f * fsin(miteT * 1.4f);
        if (miteX < 6.0f || miteX > (f32)W - 6.0f || miteT > 26.0f) miteOn = 0;
    }

    /* idle: a hint, and then a pattern the worms remember */
    f32 idle = tS - lastInput;
    if (!hintOn & idle > nextHint & litN <= 6) {
        i32 dim = -1; f32 bd = 2.0f;
        for (i32 i = 0; i < nworm; i++) if (worm[i].glow < bd) { bd = worm[i].glow; dim = i; }
        if (dim >= 0) { hintOn = 1; hintT = 0.0f; hintWorm = dim; ev(11, (f32)dim, 0.0f); }
        nextHint = idle + 30.0f + rndf() * 12.0f;
    }
    if (hintOn) {
        hintT += dt;
        if (hintT > 3.0f) { hintOn = 0; hintWorm = -1; }
    }
    if (!starOn & idle > 40.0f & litN <= 3 & !elderOn) {
        starOn = 1; starT = 0.0f; ev(12, 0.0f, 0.0f);
    }
    if (starOn) {
        starT += dt;
        if (starT > 11.0f) {
            starOn = 0;
            for (i32 i = 0; i < nworm; i++) if (worm[i].cstar & worm[i].target > 0.5f) worm[i].target = 0.22f;
        }
    }
}

/* ------------------------------------------------------------------ layout */
static i32 laidOut = 0;
static f32 keepGlow[NWMAX], keepTgt[NWMAX], keepBloom[NWMAX], keepSpark[NWMAX];

/* ----------------------------------------------------------------- exports */
EXPORT int magic(void) { return 424242; }
EXPORT int stride(void) { return MAXW; }
EXPORT int frame(void) { return (int)(unsigned long)fb; }
EXPORT int rgbaPtr(void) { return (int)(unsigned long)rgba; }
EXPORT int width(void) { return W; }
EXPORT int height(void) { return H; }
EXPORT void setMotion(float m) { motionScale = cl(m, 0.0f, 1.0f); }
EXPORT void seed(unsigned int s) { SEED = s; layout(); }
EXPORT void init(void) { buildLut(); layout(); }
EXPORT void resize(int w, int h) {
    W = cli(w, 96, MAXW);
    H = cli(h, 120, MAXH);
    for (i32 i = 0; i < nworm & i < NWMAX; i++) { keepGlow[i] = worm[i].glow; keepTgt[i] = worm[i].target; keepBloom[i] = worm[i].bloom; keepSpark[i] = worm[i].spark; }
    layout();
    if (laidOut & nworm <= NWMAX)
        for (i32 i = 0; i < nworm; i++) { worm[i].glow = keepGlow[i]; worm[i].target = keepTgt[i]; worm[i].bloom = keepBloom[i]; worm[i].spark = keepSpark[i]; }
}
EXPORT void renderN(int n) {
    for (i32 i = 0; i < MAXW * H; i++) fb[i] = base[i];
    if (n < 1) return; drawWater(tS);
    if (n < 2) return; drawRings();
    if (n < 3) return; drawDrops();
    if (n < 4) return; drawRune();
    if (n < 5) return; drawTrail();
    if (n < 6) return;
    for (i32 i = 0; i < nworm; i++) drawWorm(i);
    if (n < 7) return; drawElder();
    if (n < 8) return; drawMotes();
    if (n < 9) return; drawMite();
}
static i32 noRender = 0;
EXPORT void setNoRender(int v) { noRender = v; }
EXPORT int dbg(int i) {
    if (i == 0) return fb[260 * MAXW + 90];
    if (i == 1) return base[260 * MAXW + 90];
    if (i == 2) return fb[300 * MAXW + 40];
    if (i == 3) return base[300 * MAXW + 40];
    if (i == 4) return fb[50 * MAXW + 90];
    if (i == 5) return base[50 * MAXW + 90];
    return 0;
}
EXPORT void tick(float dt) { step(dt); if (!noRender) render(); }
EXPORT void press(float x, float y) {
    down = 1; pX = x; pY = y; dX = x; dY = y; dT = tS;
    moved = 0; holdFired = 0; chainN = 0; lastInput = tS;
}
EXPORT void moveTo(float x, float y) {
    if (!down) return;
    dX = x; dY = y; lastInput = tS;
    f32 md = fab(x - pX) + fab(y - pY);
    if (md > 5.0f) moved = 1;
    addTrail(x, y);
    for (i32 i = 0; i < nworm; i++) {
        Worm *w = &worm[i];
        f32 dx = w->x - x, dy = w->y - y;
        if (dx * dx + dy * dy < 340.0f & w->target < 0.85f) wakeWorm(i, 0.9f, 1);
    }
}
EXPORT void release(float x, float y) {
    if (!down) return;
    down = 0; lastInput = tS;
    dX = x; dY = y;
    if (holdFired) { holdFired = 0; return; }
    f32 dur = tS - dT;
    f32 dist = sq((x - pX) * (x - pX) + (y - pY) * (y - pY));
    if (dur < 0.34f & dist > 14.0f) { breath(x - pX, y - pY); return; }
    if (dist < 13.0f) doTap(x, y);
}
EXPORT int eventPtr(void) { return (int)(unsigned long)evq; }
EXPORT int nevents(void) { return nev; }
EXPORT void clearEvents(void) { nev = 0; }
EXPORT int stats(int i) {
    if (i == 0) return litN;
    if (i == 1) return elderOn;
    if (i == 2) return runeOn;
    if (i == 3) return miteOn;
    if (i == 4) return starOn;
    if (i == 5) return (i32)(tS * 10.0f);
    if (i == 6) return nworm;
    if (i == 7) return ntrail;
    if (i == 8) return hintOn;
    return 0;
}
EXPORT int wormCount(void) { return nworm; }
EXPORT int wormPos(int i, int c) {
    if (i < 0 || i >= nworm) return 0;
    if (c == 0) return (i32)(worm[i].x * 16.0f);
    if (c == 1) return (i32)(worm[i].y * 16.0f);
    return (i32)(worm[i].glow * 1000.0f);
}
EXPORT int lightAt(int x, int y) { return sampleBuf(lint, (f32)x, (f32)y); }
EXPORT int baseAt(int x, int y) {
    if (x < 0 || x >= W || y < 0 || y >= H) return -1;
    return base[y * MAXW + x];
}
EXPORT int geom(int i) {
    if (i == 0) return (i32)ceilY;
    if (i == 1) return (i32)poolY;
    return 0;
}
EXPORT int shade(int x, int y, int c) {
    if (x < 0 || x >= W || y < 0 || y >= H || c < 0 || c > 2) return -1;
    u8 idx = fb[y * MAXW + x];
    if (idx >= NPAL) idx = 0;
    i32 li = sampleBuf(lint, (f32)x, (f32)y) >> 3;
    if (li > 31) li = 31;
    i32 w = sampleBuf(ltint, (f32)x, (f32)y), cw = 255 - w;
    i32 o = ((i32)idx * 32 + li) * 6 + c;
    return (lut[o] * w + lut[o + 3] * cw) >> 8;
}
