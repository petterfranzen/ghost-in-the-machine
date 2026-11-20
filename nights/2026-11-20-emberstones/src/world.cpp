/* Emberstones - the state, the clock, the gestures and the C ABI the page
 * calls. One tap wakes a stone and its neighbours; waking every rune finishes
 * the circle and the next one is posed. */
#include "sim.h"

int g_n0, g_n1, g_ns;
int g_lit[MAXS], g_mossy[MAXS], g_ring[MAXS], g_idx[MAXS], g_start[MAXS];
int g_taps[MAXS], g_ntap, g_level;
float g_cx, g_cy, g_rx, g_ry, g_t, g_motion;
unsigned g_rng, g_seed;
unsigned char g_fb[MAXW * MAXH * 4];

static float s_px[MAXS], s_py[MAXS], s_hitR;
int g_shW, g_shH, g_stoneH;
static int s_complete, s_circlesDone, s_finale, s_keystone, s_moteDone;
static float s_completeT, s_sinceTap, s_dawnT, s_clock;
static int s_hintStone; static float s_hintT;
static int s_pressed, s_holdFired; static float s_holdT, s_pressX, s_pressY;
static int s_ev[96], s_nev;

void emb_emit(int type, int a, int b) {
  if (s_nev >= 32) return;
  s_ev[s_nev * 3] = type; s_ev[s_nev * 3 + 1] = a; s_ev[s_nev * 3 + 2] = b;
  s_nev++;
}

/* ------------------------------------------------------------- the circle */
void emb_poseStones(void) {
  g_stoneH = (int)(g_ry * 0.55f);
  if (g_stoneH > (int)(0.078f * (float)g_shH)) g_stoneH = (int)(0.078f * (float)g_shH);
  if (g_stoneH < 5) g_stoneH = 5;
  s_hitR = (float)g_stoneH;
  if (s_hitR < 0.115f * (float)g_shW) s_hitR = 0.115f * (float)g_shW;
  if (s_hitR < 0.08f * (float)g_shH) s_hitR = 0.08f * (float)g_shH;
  for (int i = 0; i < g_ns; i++) {
    float f = g_ring[i] ? 0.44f : 1.0f;
    float a = TAU * (float)g_idx[i] / (float)emb_countInRing(g_ring[i]);
    s_px[i] = g_cx + emb_sin(a) * g_rx * f;
    s_py[i] = g_cy + emb_cos(a) * g_ry * f;
  }
}

void emb_resize(int w, int h) {
  if (w < 32) w = 32; if (h < 32) h = 32;
  if (w > MAXW) w = MAXW; if (h > MAXH) h = MAXH;
  g_shW = w; g_shH = h;
  g_cx = 0.5f * (float)w;
  g_cy = 0.68f * (float)h;                 /* ring sits in the lower third */
  g_rx = 0.38f * (float)w;
  if (g_rx > 0.46f * (float)h) g_rx = 0.46f * (float)h;
  g_ry = 0.80f * g_rx;                     /* open enough to read as a circle */
  if (g_ry > 0.22f * (float)h) g_ry = 0.22f * (float)h;  /* leave room for the UI */
  if (g_ry < 12.0f) g_ry = 12.0f;
  emb_poseStones();
}

int emb_stoneAt(float x, float y) {
  int best = -1; float bd = s_hitR * s_hitR;
  for (int i = 0; i < g_ns; i++) {
    float dx = x - s_px[i], dy = y - s_py[i];
    float d2 = dx * dx + dy * dy;
    if (d2 <= bd) { bd = d2; best = i; }
  }
  return best;
}

int emb_centreHit(float x, float y) {
  float dx = (x - g_cx) / g_rx, dy = (y - g_cy) / (g_ry + 1.0f);
  return dx * dx + dy * dy < 0.22f;
}

/* --------------------------------------------------------------- the play */
static void completeCircle(void) {
  s_complete = 1; s_completeT = 0;
  if (g_level + 1 > s_circlesDone) s_circlesDone = g_level + 1;
  emb_emit(EV_COMPLETE, g_level, 0);
  if (g_level >= 5 && !s_finale) { s_finale = 1; s_dawnT = 0; emb_emit(EV_DAWN, 0, 0); }
}

static void nextCircle(void) {
  if (g_level >= 5) return;
  s_complete = 0; s_hintT = 0; s_moteDone = 0;
  emb_buildRing(g_level + 1);
  emb_emit(EV_NEXT, g_level, 0);
}

static void wakeStone(int s) {
  if (g_mossy[s]) { emb_emit(EV_MOSS, s, g_ring[s]); return; }
  emb_applyTap(s);
  g_taps[g_ntap++] = s;
  s_sinceTap = 0; s_moteDone = 0;
  if (s_hintStone == s) s_hintT = 0;
  emb_emit(EV_TAP, s, g_ring[s]);
  if (emb_allLit()) completeCircle();
}

/* after a circle is finished, a moment later a tap opens the next one */
static int awaitingNext(void) {
  return s_complete && s_completeT > 2.0f && g_level < 5;
}
static int wantsKeystone(float x, float y) {
  return s_finale && !s_keystone && emb_centreHit(x, y);
}

void emb_tapAt(float x, float y) {
  int s = emb_stoneAt(x, y);
  if (awaitingNext()) { nextCircle(); return; }
  if (s >= 0) { wakeStone(s); return; }
  emb_emit(EV_EARTH, 0, 0);
}

void emb_holdAt(float x, float y) {
  if (wantsKeystone(x, y)) {
    s_keystone = 1; emb_emit(EV_KEYSTONE, 0, 0); return;
  }
  int s = emb_stoneAt(x, y);
  int h = emb_hintStone();
  if (h < 0) h = s;
  if (h < 0) { emb_emit(EV_EARTH, 0, 0); return; }
  s_hintStone = h; s_hintT = 6.0f;
  emb_emit(EV_HINT, h, 0);
}

void emb_pressAt(float x, float y) {
  s_pressed = 1; s_holdFired = 0; s_holdT = 0; s_pressX = x; s_pressY = y;
}
void emb_releaseAt(float x, float y) {
  int wasPressed = s_pressed, fired = s_holdFired;
  s_pressed = 0; s_holdFired = 0;
  if (!wasPressed || fired) return;
  if (s_holdT < 0.45f) emb_tapAt(x, y);      /* a still, quick press is a tap */
  else emb_holdAt(s_pressX, s_pressY);       /* a slow one already reached the hold */
}

static void advanceClock(float dt) {
  g_t += dt;
  s_clock += dt * (0.35f + 0.65f * g_motion);
  s_sinceTap += dt;
  if (s_hintT > 0.0f) s_hintT -= dt;
  if (s_complete) s_completeT += dt;
  if (s_finale) s_dawnT += dt;
}
static void advanceHold(float dt) {
  if (!s_pressed || s_holdFired) return;
  s_holdT += dt;
  if (s_holdT >= 0.9f) { s_holdFired = 1; emb_holdAt(s_pressX, s_pressY); }
}
void emb_tick(float dt) {
  if (dt > 0.05f) dt = 0.05f;
  if (dt < 0.0f) dt = 0.0f;
  advanceClock(dt);
  advanceHold(dt);
  if (!s_moteDone && s_sinceTap > 22.0f) { s_moteDone = 1; emb_emit(EV_MOTE, 0, 0); }
}

/* ------------------------------------------------------------------- ABI */
extern "C" {

void init(void) {
  g_t = 0; g_motion = 1.0f; g_seed = 1u; g_rng = 1u;
  emb_buildRing(0);
  emb_resize(220, 420);
}
int magic(void) { return 424242; }
void seed(unsigned s) { g_seed = (s ? s : 1u); emb_buildRing(g_level); }
void resize(int w, int h) { emb_resize(w, h); }
void setMotion(float m) { g_motion = m < 0.05f ? 0.05f : (m > 1.0f ? 1.0f : m); }
int width(void) { return g_shW; }
int height(void) { return g_shH; }
int stride(void) { return MAXW * 4; }
int rgbaPtr(void) { return (int)(long)g_fb; }
int stoneCount(void) { return g_ns; }
int stonePos(int i, int comp) {
  if (i < 0 || i >= g_ns) return 0;
  if (comp == 0) return (int)(s_px[i] * 16.0f);
  if (comp == 1) return (int)(s_py[i] * 16.0f);
  if (comp == 2) return g_lit[i];
  return g_mossy[i];
}
/* the picture asks for one number at a time; the snapshot fills all eleven */
static int s_stats[11];
static void snapStats(void) {
  int lit = 0;
  for (int i = 0; i < g_ns; i++) lit += g_lit[i];
  s_stats[0] = lit; s_stats[1] = g_ns; s_stats[2] = g_level;
  s_stats[3] = s_complete; s_stats[4] = s_circlesDone;
  s_stats[5] = (int)(s_clock * 10.0f); s_stats[6] = s_hintStone;
  s_stats[7] = s_keystone; s_stats[8] = s_finale;
  s_stats[9] = (int)(s_hintT * 10.0f); s_stats[10] = (int)(s_dawnT * 10.0f);
}
int stats(int k) {
  snapStats();
  return (k >= 0 && k < 11) ? s_stats[k] : 0;
}
int stoneRing(int i) { return (i >= 0 && i < g_ns) ? g_ring[i] : -1; }
int isMossy(int i) { return (i >= 0 && i < g_ns) ? g_mossy[i] : 0; }
int allLit(void) { return emb_allLit(); }
int tappable(int i) { return emb_tappable(i); }
int solvable(void) {
  unsigned dark = 0;
  for (int i = 0; i < g_ns; i++) if (!g_lit[i]) dark |= 1u << i;
  return emb_solve(dark, 0);
}
int hintStone(void) { return emb_hintStone(); }
int applyTap(int i) { if (!emb_tappable(i)) return 0; emb_applyTap(i); return 1; }
void setLevel(int lv) { emb_buildRing(lv); }
void restartLevel(void) { emb_restart(); s_complete = 0; s_moteDone = 0; emb_emit(EV_RESTART, g_level, 0); }
int undoMove(void) {
  int s = emb_undo();
  if (s < 0) return -1;
  s_complete = 0;
  emb_emit(EV_UNDO, s, 0);
  return s;
}
void tapStone(int i) { if (i >= 0 && i < g_ns) wakeStone(i); }
void press(float x, float y) { emb_pressAt(x, y); }
void release(float x, float y) { emb_releaseAt(x, y); }
void tick(float dt) { emb_tick(dt); }
void render(void) { emb_render(); }
int nevents(void) { return s_nev; }
int eventPtr(void) { return (int)(long)s_ev; }
void clearEvents(void) { s_nev = 0; }
int shade(int x, int y, int comp) {
  int rgb[3]; emb_shadeAt(x, y, rgb);
  return rgb[comp < 0 ? 0 : (comp > 2 ? 2 : comp)];
}
int centreHit(float x, float y) { return emb_centreHit(x, y); }
int stoneAt(float x, float y) { return emb_stoneAt(x, y); }

}
