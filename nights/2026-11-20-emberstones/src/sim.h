/* Emberstones - shared shapes for the C++ simulation compiled to freestanding
 * wasm32. No libc: the maths, the bit masks and the framebuffer are ours. */
#ifndef EMBER_SIM_H
#define EMBER_SIM_H

#define MAXS 20      /* 11 outer + 6 inner stones, with room to grow */
#define TAU 6.283185307179586f
#define MAXW 520
#define MAXH 900

/* ---------------------------------------------------------------- the world */
extern int g_n0, g_n1, g_ns;              /* stones on each ring, total */
extern int g_lit[MAXS], g_mossy[MAXS], g_ring[MAXS], g_idx[MAXS];
extern int g_start[MAXS];                 /* the circle as it is posed */
extern int g_taps[MAXS], g_ntap;          /* the moves so far, for undo */
extern int g_level;
extern float g_cx, g_cy, g_rx, g_ry;      /* where the ring stands */
extern int g_shW, g_shH, g_stoneH;        /* the frame, and how tall a stone is */
extern unsigned char g_fb[];              /* RGBA, contiguous, stride MAXW*4 */
extern float g_t, g_motion;
extern unsigned g_rng;

/* ------------------------------------------------------------------- maths */
static inline float emb_abs(float x) { return x < 0.0f ? -x : x; }
static inline float emb_fmod1(float x) { return x - (float)(int)x; }

static inline float emb_sin(float x) {
  x = emb_fmod1(x / TAU + (x < 0.0f ? 1.0f : 0.0f) + 0.5f) - 0.5f;
  x *= TAU;                                /* now in [-pi, pi) */
  if (x > 1.5707963f) x = 3.1415927f - x;
  if (x < -1.5707963f) x = -3.1415927f - x;
  float x2 = x * x;
  return x * (1.0f - x2 * (1.0f / 6.0f - x2 * (1.0f / 120.0f - x2 / 5040.0f)));
}
static inline float emb_cos(float x) { return emb_sin(x + 1.5707963f); }

static inline unsigned emb_rnd(void) {
  g_rng ^= g_rng << 13; g_rng ^= g_rng >> 17; g_rng ^= g_rng << 5;
  return g_rng;
}
/* a stable hash, so stars and grass do not move between frames */
static inline unsigned emb_hash(unsigned x) {
  x ^= x >> 16; x *= 0x7feb352du; x ^= x >> 15; x *= 0x846ca68bu;
  return x ^ (x >> 16);
}
static inline float emb_rand01(unsigned x) { return (float)(emb_hash(x) >> 8) / 16777216.0f; }

/* ------------------------------------------------------------------- rules */
void emb_buildRing(int level);            /* geometry + poses for one circle */
void emb_poseStones(void);                /* lay the stones out for the frame size */
unsigned emb_flipMask(int stone);         /* which stones one tap wakes */
void emb_applyTap(int stone);             /* wake it, its ring neighbours, its pair */
int emb_partner(int stone);
int emb_countInRing(int ring);
int emb_firstOfRing(int ring);
int emb_allLit(void);
int emb_tappable(int stone);
int emb_solve(unsigned target, unsigned *movesOut);
int emb_hintStone(void);
void emb_restart(void);
int emb_undo(void);

/* ------------------------------------------------------------------ events */
#define EV_TAP 1
#define EV_MOSS 2
#define EV_COMPLETE 3
#define EV_UNDO 4
#define EV_RESTART 5
#define EV_NEXT 6
#define EV_HINT 7
#define EV_KEYSTONE 8
#define EV_DAWN 9
#define EV_EARTH 10
#define EV_MOTE 11
void emb_emit(int type, int a, int b);

/* ----------------------------------------------------------------- drawing */
void emb_resize(int w, int h);
void emb_render(void);
void emb_shadeAt(int x, int y, int *out);   /* out: r, g, b */

/* --------------------------------------------------------------- the shell */
void emb_tapAt(float x, float y);
void emb_holdAt(float x, float y);
void emb_pressAt(float x, float y);
void emb_releaseAt(float x, float y);
void emb_tick(float dt);
int emb_stoneAt(float x, float y);          /* -1 when the finger is on bare earth */
int emb_centreHit(float x, float y);

#endif
