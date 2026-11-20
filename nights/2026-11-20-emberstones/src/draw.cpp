/* Emberstones - the picture. Everything is integer pixels in an RGBA buffer:
 * sky, standing stones, rune-light and the few slow things that move. */
#include "sim.h"

extern "C" int stonePos(int i, int comp);
extern "C" int stats(int k);
extern "C" int isMossy(int i);
extern "C" int stoneCount(void);
extern "C" int stoneRing(int i);

struct Col { int r, g, b; };
/* shapes carry their own colour and strength, so a call site stays short */
struct Blob { float cx, cy, rx, ry; Col c; float k; };
struct Rect { int x0, y0, x1, y1; Col c; };
struct RuneMark { int x, y, hh, variant; Col c; };
struct Men { int x, y, hh, ww, lean; };
enum { SKY_TOP, SKY_MID, SKY_HOR, GROUND_FAR, GROUND_NEAR, PATH, STONE, STONE_EDGE,
       STONE_DARK, RUNE_DARK, RUNE_LIT, MOSS, MOSS_DARK, MOON, STAR, HINT, EMBER };

static const Col PAL[] = {
  { 9, 10, 19 },   { 17, 18, 33 },  { 33, 31, 48 },  { 20, 20, 29 },  { 12, 12, 19 },
  { 26, 26, 38 },  { 36, 38, 49 },  { 58, 60, 76 },  { 19, 19, 27 },  { 23, 24, 34 },
  { 255, 206, 122 }, { 60, 88, 58 }, { 40, 60, 42 }, { 246, 242, 224 }, { 198, 204, 226 },
  { 150, 205, 255 }, { 255, 176, 96 },
};

static inline Col pal(int i) { return PAL[i]; }
static inline Col mixc(Col a, Col b, float t) {
  Col c; c.r = (int)(a.r + (b.r - a.r) * t); c.g = (int)(a.g + (b.g - a.g) * t);
  c.b = (int)(a.b + (b.b - a.b) * t); return c;
}
static inline int clamp255(int v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }

static inline int inb(int x, int y) {
  return x >= 0 && y >= 0 && x < g_shW && y < g_shH;
}
static inline int off(int x, int y) { return (y * MAXW + x) * 4; }

static inline void put(int x, int y, Col c) {
  if (!inb(x, y)) return;
  int o = off(x, y);
  g_fb[o] = (unsigned char)c.r; g_fb[o + 1] = (unsigned char)c.g;
  g_fb[o + 2] = (unsigned char)c.b; g_fb[o + 3] = 255;
}
/* additive: light spills over whatever is already painted */
static inline void add(int x, int y, Col c, float k) {
  if (!inb(x, y)) return;
  int o = off(x, y);
  g_fb[o] = (unsigned char)clamp255((int)(g_fb[o] + c.r * k));
  g_fb[o + 1] = (unsigned char)clamp255((int)(g_fb[o + 1] + c.g * k));
  g_fb[o + 2] = (unsigned char)clamp255((int)(g_fb[o + 2] + c.b * k));
  g_fb[o + 3] = 255;
}

/* subtractive: a shadow takes light away from the ground it stands on */
static inline void sub(int x, int y, Col c, float k) {
  if (!inb(x, y)) return;
  int o = off(x, y);
  g_fb[o] = (unsigned char)clamp255((int)(g_fb[o] - c.r * k));
  g_fb[o + 1] = (unsigned char)clamp255((int)(g_fb[o + 1] - c.g * k));
  g_fb[o + 2] = (unsigned char)clamp255((int)(g_fb[o + 2] - c.b * k));
  g_fb[o + 3] = 255;
}

static void block(Rect r) {
  for (int y = r.y0; y <= r.y1; y++)
    for (int x = r.x0; x <= r.x1; x++) put(x, y, r.c);
}
static void discSolid(int cx, int cy, int rad, Col c) {
  int r2 = rad * rad;
  for (int dy = -rad; dy <= rad; dy++) for (int dx = -rad; dx <= rad; dx++) {
    if (dx * dx + dy * dy <= r2) put(cx + dx, cy + dy, c);
  }
}
/* a soft circle of light: rx == ry for a round one */
static void discAdd(Blob b) {
  int r = (int)b.rx;
  float r2 = b.rx * b.rx;
  for (int dy = -r; dy <= r; dy++) for (int dx = -r; dx <= r; dx++) {
    float d2 = (float)(dx * dx + dy * dy);
    if (d2 > r2) continue;
    float f = 1.0f - d2 / r2; f = f * f * b.k;
    add((int)b.cx + dx, (int)b.cy + dy, b.c, f);
  }
}
/* a squashed pool of light on the ground */
static void poolAdd(Blob b) {
  int ix = (int)b.rx, iy = (int)b.ry;
  for (int dy = -iy; dy <= iy; dy++) for (int dx = -ix; dx <= ix; dx++) {
    float u = (float)dx / b.rx, v = (float)dy / b.ry;
    float d2 = u * u + v * v;
    if (d2 > 1.0f) continue;
    float f = 1.0f - d2; add((int)b.cx + dx, (int)b.cy + dy, b.c, f * f * b.k);
  }
}

static void poolSub(Blob b) {
  int ix = (int)b.rx, iy = (int)b.ry;
  for (int dy = -iy; dy <= iy; dy++) for (int dx = -ix; dx <= ix; dx++) {
    float u = (float)dx / b.rx, v = (float)dy / b.ry;
    float d2 = u * u + v * v;
    if (d2 > 1.0f) continue;
    float f = 1.0f - d2; sub((int)b.cx + dx, (int)b.cy + dy, b.c, f * f * b.k);
  }
}

static float litFrac(void) {
  int n = stoneCount();
  return n ? (float)stats(0) / (float)n : 0.0f;
}
static float slow(void) { return 0.35f + 0.65f * g_motion; }

static void sky(void) {
  int hy = (int)(0.60f * (float)g_shH);
  float dawn = stats(8) ? (float)stats(10) * 0.010f : 0.0f;
  if (dawn > 1.0f) dawn = 1.0f;
  Col warm = { 96, 58, 44 };
  for (int y = 0; y < hy; y++) {
    float t = (float)y / (float)hy;
    Col c = t < 0.62f ? mixc(pal(SKY_TOP), pal(SKY_MID), t / 0.62f)
                      : mixc(pal(SKY_MID), pal(SKY_HOR), (t - 0.62f) / 0.38f);
    c = mixc(c, warm, dawn * (0.25f + 0.75f * t));
    for (int x = 0; x < g_shW; x++) put(x, y, c);
  }
}

static void stars(void) {
  int hy = (int)(0.60f * (float)g_shH);
  for (int k = 0; k < 90; k++) {
    int x = (int)(emb_rand01(k * 7u + 3u) * (float)(g_shW - 1));
    int y = (int)(emb_rand01(k * 13u + 91u) * (float)(hy - 2));
    float b = 0.35f + 0.65f * emb_rand01(k * 5u + 41u);
    float tw = 0.72f + 0.28f * emb_sin(g_t * 0.5f * slow() + (float)k);
    add(x, y, pal(STAR), b * tw * 0.5f);
  }
}

static void moon(void) {
  int hy = (int)(0.60f * (float)g_shH);
  int rad = g_shH / 28; if (rad < 3) rad = 3; if (rad > 16) rad = 16;
  int mx = (int)(0.20f * (float)g_shW + 0.60f * (float)g_shW * litFrac());
  int my = (int)(0.17f * (float)hy) + rad;
  discAdd((Blob){ (float)mx, (float)my, (float)(rad * 4), (float)(rad * 4), pal(SKY_HOR), 0.55f });
  discSolid(mx, my, rad, pal(MOON));
  Col dim = { 222, 216, 198 };
  discSolid(mx + (int)(rad * 0.35f), my - (int)(rad * 0.25f), rad / 3, dim);
}

/* the horizon is not a ruled line: two slow sines make a low, uneven ridge */
static int horizon(int x) {
  int hy = (int)(0.60f * (float)g_shH);
  int d = (int)(2.0f + 2.2f * emb_sin((float)x * 0.021f + 0.7f)
                    + 1.4f * emb_sin((float)x * 0.058f + 2.1f));
  return hy - d;
}

static void ground(void) {
  for (int x = 0; x < g_shW; x++) {
    int hz = horizon(x);
    for (int y = hz; y < g_shH; y++) {
      float t = (float)(y - hz) / (float)(g_shH - hz + 1);
      put(x, y, mixc(pal(GROUND_FAR), pal(GROUND_NEAR), t));
    }
    put(x, hz - 1, mixc(pal(GROUND_FAR), pal(SKY_HOR), 0.45f));  /* a lit rim */
  }
  for (int k = 0; k < 70; k++) {                    /* a low, calm heath */
    int x = (int)(emb_rand01(k * 3u + 17u) * (float)g_shW);
    int y = horizon(x) + (int)(emb_rand01(k * 11u + 5u) * (float)(g_shH - horizon(x)));
    put(x, y, mixc(pal(GROUND_NEAR), pal(PATH), 0.8f));
  }
}

static void ringPath(void) {
  Col c = pal(PATH);
  for (int a = 0; a < 720; a += 4) {
    float t = TAU * (float)a / 720.0f;
    if (((a / 4) % 3) == 2) continue;
    put((int)(g_cx + emb_sin(t) * g_rx), (int)(g_cy + emb_cos(t) * g_ry + 1.0f), c);
  }
}

/* each rune is a stem plus three pixels; the arms are data, not branches */
static const signed char RUNE_ARMS[3][6] = {
  {  1, 2,  2, 3,  3, 4 },     /* a stroke climbing to the right */
  { -1, 2, -2, 3, -3, 4 },     /* the same stroke, mirrored */
  {  1, 3, -1, 3,  0, 5 }      /* a small cross */
};
static void rune(RuneMark m) {
  int top = m.y - (m.hh * 7) / 10, bot = m.y - (m.hh * 4) / 10;
  for (int i = top; i <= bot; i++) put(m.x, i, m.c);
  int v = m.variant % 3;
  for (int a = 0; a < 3; a++)
    put(m.x + RUNE_ARMS[v][a * 2], top + RUNE_ARMS[v][a * 2 + 1], m.c);
}

/* one pixel of a menhir: lit edge on the left, shadow on the right, a pale crown */
static Col stoneShade(int dx, int w, int dy) {
  Col c = pal(STONE);
  if (dx <= -w + 1) c = pal(STONE_EDGE);
  else if (dx >= w) c = mixc(pal(STONE), pal(STONE_DARK), 0.6f);
  if (dy < 2) c = mixc(c, pal(STONE_EDGE), 0.45f);
  return c;
}

static void stoneBody(Men m) {
  for (int dy = 0; dy < m.hh; dy++) {
    int w = m.ww - (m.ww * dy) / (m.hh * 5 + 4);
    int bx = m.x + (m.lean * dy) / 12;
    for (int dx = -w; dx <= w; dx++) put(bx + dx, m.y - m.hh + dy, stoneShade(dx, w, dy));
  }
}

static void stoneMoss(Men m) {
  int top = m.y - m.hh;
  block((Rect){ m.x - m.ww, top, m.x + m.ww, top + 2, pal(MOSS) });
  for (int k = -m.ww; k <= m.ww; k += 3) put(m.x + k, top + 3, pal(MOSS_DARK));
  put(m.x - m.ww + 1, top + 4, pal(MOSS_DARK));
  put(m.x + m.ww - 1, top + 5, pal(MOSS_DARK));
}

static void stone(int i, int hh, int ww) {
  int x = (int)(stonePos(i, 0) / 16.0f), y = (int)(stonePos(i, 1) / 16.0f);
  int lit = stonePos(i, 2);
  poolSub((Blob){ (float)x, (float)(y + 1), (float)ww * 1.2f, (float)ww * 0.42f,
                  pal(STONE_DARK), 0.9f });
  Men m = { x, y, hh, ww, (i % 3) - 1 };
  stoneBody(m);
  if (isMossy(i)) stoneMoss(m);
  rune((RuneMark){ x, y, hh, i % 3, lit ? pal(RUNE_LIT) : pal(RUNE_DARK) });
}

/* draw the far stones first, so near ones overlap them */
static void sortByY(int *order, int n) {
  for (int i = 1; i < n; i++) {
    int key = order[i], j = i - 1;
    while (j >= 0 && stonePos(order[j], 1) > stonePos(key, 1)) { order[j + 1] = order[j]; j--; }
    order[j + 1] = key;
  }
}

static void stones(void) {
  int order[MAXS], n = stoneCount();
  for (int i = 0; i < n; i++) order[i] = i;
  sortByY(order, n);
  for (int k = 0; k < n; k++) {
    int i = order[k];
    int base = stoneRing(i) ? 82 : 96;                 /* the inner ring stands shorter */
    int vary = 88 + (int)(emb_hash((unsigned)i + 7u) % 13u);
    int hh = g_stoneH * base * vary / 10000;
    int ww = hh * 27 / 100; if (ww < 2) ww = 2;
    stone(i, hh, ww);
  }
}

static void glow(void) {
  int n = stoneCount();
  for (int i = 0; i < n; i++) {
    if (!stonePos(i, 2)) continue;
    int x = (int)(stonePos(i, 0) / 16.0f), y = (int)(stonePos(i, 1) / 16.0f);
    float pulse = 0.92f + 0.08f * emb_sin(g_t * 0.8f * slow() + (float)i * 2.1f);
    discAdd((Blob){ (float)x, (float)(y - g_stoneH * 0.55f), (float)g_stoneH * 0.70f,
                    (float)g_stoneH * 0.70f, pal(RUNE_LIT), 0.34f * pulse });
    poolAdd((Blob){ (float)x, (float)(y + 1), (float)g_stoneH * 1.15f, (float)g_stoneH * 0.5f,
                    pal(EMBER), 0.22f * pulse });
  }
}

static void hint(void) {
  if (stats(9) <= 0) return;
  int s = stats(6);
  if (s < 0 || s >= stoneCount()) return;
  int x = (int)(stonePos(s, 0) / 16.0f), y = (int)(stonePos(s, 1) / 16.0f);
  float k = 0.30f + 0.18f * emb_sin(g_t * 2.2f * slow());
  discAdd((Blob){ (float)x, (float)(y - g_stoneH * 0.5f), (float)g_stoneH * 1.5f,
                  (float)g_stoneH * 1.5f, pal(HINT), k });
}

static void motes(void) {
  int hy = (int)(0.60f * (float)g_shH);
  for (int k = 0; k < 18; k++) {
    float sp = 0.02f + 0.03f * emb_rand01(k * 9u + 7u);
    float ph = emb_rand01(k * 17u + 29u);
    float drift = emb_fmod1(ph + g_t * sp * slow());
    int x = (int)(emb_rand01(k * 23u + 13u) * (float)g_shW) + (int)(emb_sin(g_t * 0.4f + (float)k) * 4.0f);
    int y = g_shH - 4 - (int)(drift * (float)(g_shH - hy));
    float b = 0.12f + 0.30f * (1.0f - drift);
    add(x, y, pal(EMBER), b);
  }
}

static void progress(void) {
  int y = g_shH / 22 + 4, r = g_shH / 240 + 2, n = 6, done = stats(4);
  int gap = r * 4 + 6;
  int x0 = g_shW / 2 - (n - 1) * gap / 2;
  for (int i = 0; i < n; i++) {
    int x = x0 + i * gap;
    discSolid(x, y, r, i < done ? pal(RUNE_LIT) : pal(STONE_DARK));
    if (i < done) discAdd((Blob){ (float)x, (float)y, (float)(r * 3), (float)(r * 3), pal(RUNE_LIT), 0.28f });
  }
}

static void keystone(void) {
  if (!stats(7)) return;
  int hh = g_stoneH * 3 / 4, ww = hh * 45 / 100;
  poolSub((Blob){ g_cx, g_cy + 1.0f, (float)hh, (float)hh * 0.4f, pal(STONE_DARK), 0.9f });
  for (int dy = 0; dy < hh; dy++) {
    int w = ww - (ww * dy) / (hh * 5 + 4);
    for (int dx = -w; dx <= w; dx++) put((int)g_cx + dx, (int)g_cy - hh + dy, dx <= -w + 1 ? pal(STONE_EDGE) : pal(STONE));
  }
  rune((RuneMark){ (int)g_cx, (int)g_cy, hh, 0, pal(RUNE_LIT) });
  discAdd((Blob){ g_cx, g_cy - (float)hh, (float)hh * 0.95f, (float)hh * 0.95f, pal(RUNE_LIT), 0.30f });
}

void emb_render(void) {
  sky(); stars(); moon(); ground(); ringPath(); stones(); glow(); hint();
  motes(); progress(); keystone();
}

void emb_shadeAt(int x, int y, int *out) {
  out[0] = out[1] = out[2] = 0;
  if (!inb(x, y)) return;
  int o = off(x, y);
  out[0] = g_fb[o]; out[1] = g_fb[o + 1]; out[2] = g_fb[o + 2];
}
