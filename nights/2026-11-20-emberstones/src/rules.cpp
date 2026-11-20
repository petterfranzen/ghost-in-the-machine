/* The rules of the ring: how a tap spreads, which circles exist, and the
 * GF(2) solve that lets the piece offer a hint and lets a test prove every
 * circle can be woken. */
#include "sim.h"

extern unsigned g_seed;   /* the visit's seed, kept immutable in world.cpp */

struct Ring { int n0, n1, mossy, taps, lo, hi, hint; };

/* Six circles, each introducing at most one new rule. Data, not branches. */
static const Ring CIRCLES[6] = {
  {  5, 0, 0, 0,  0,  0, 0 },   /* all dark: learn what one tap does */
  {  7, 0, 0, 3,  3,  6, 1 },
  {  7, 3, 0, 3,  2,  8, 2 },   /* an inner ring arrives */
  {  9, 4, 0, 4,  4, 10, 1 },
  {  9, 4, 2, 4,  3,  9, 4 },   /* mossy stones cannot be tapped */
  { 11, 6, 3, 5,  5, 13, 5 },
};

int emb_countInRing(int ring) { return ring ? g_n1 : g_n0; }
int emb_firstOfRing(int ring) { return ring ? g_n0 : 0; }

int emb_partner(int stone) {
  if (!g_n1 || !g_n0) return -1;
  float a = (float)g_idx[stone] / (float)emb_countInRing(g_ring[stone]);
  int other = g_ring[stone] ? 0 : 1;
  int m = emb_countInRing(other);
  int j = (int)(a * (float)m + 0.5f) % m;
  return emb_firstOfRing(other) + j;
}

unsigned emb_flipMask(int stone) {
  unsigned mask = 1u << stone;
  int m = emb_countInRing(g_ring[stone]);
  int base = emb_firstOfRing(g_ring[stone]);
  int i = g_idx[stone];
  mask |= 1u << (base + (i + 1) % m);
  mask |= 1u << (base + (i + m - 1) % m);
  int p = emb_partner(stone);
  if (p >= 0) mask |= 1u << p;
  return mask;
}

void emb_applyTap(int stone) {
  unsigned mask = emb_flipMask(stone);
  for (int i = 0; i < g_ns; i++) if (mask & (1u << i)) g_lit[i] ^= 1;
}
int emb_tappable(int stone) { return stone >= 0 && stone < g_ns && !g_mossy[stone]; }
int emb_allLit(void) {
  for (int i = 0; i < g_ns; i++) if (!g_lit[i]) return 0;
  return 1;
}

/* ------------------------------------------------------------- the solver */
/* Rows are bit masks: the puzzle asks for a set of taps whose flips XOR to the
 * dark stones. Pivot by highest bit, carrying the tap set that built each row. */
static unsigned s_row[MAXS], s_comb[MAXS];
static int s_pivot[MAXS], s_pivots;
static unsigned s_usedMoves;

static int pivotRow(int bit) {
  for (int k = 0; k < s_pivots; k++) if (s_pivot[k] == bit) return k;
  return -1;
}

/* Reduce the mask against the rows already kept; the first bit with no row of
 * its own becomes this row's pivot. A mask that reduces to zero is dependent. */
static void gaussInsert(unsigned mask, unsigned comb) {
  for (int b = g_ns - 1; b >= 0 && mask; b--) {
    if (!((mask >> b) & 1u)) continue;
    int k = pivotRow(b);
    if (k < 0) {
      s_row[s_pivots] = mask; s_comb[s_pivots] = comb; s_pivot[s_pivots] = b; s_pivots++;
      return;
    }
    mask ^= s_row[k]; comb ^= s_comb[k];
  }
}

static void buildBasis(void) {
  s_pivots = 0; s_usedMoves = 0;
  for (int i = 0; i < g_ns; i++) if (!g_mossy[i]) gaussInsert(emb_flipMask(i), 1u << i);
}

/* walk the target's bits down the basis; the same stones undo it */
static int reduceTarget(unsigned target, unsigned *usedOut) {
  unsigned acc = target, used = 0;
  for (int b = g_ns - 1; b >= 0; b--) {
    if (!((acc >> b) & 1u)) continue;
    int k = pivotRow(b);
    if (k < 0) return 0;
    acc ^= s_row[k]; used ^= s_comb[k];
  }
  if (acc) return 0;
  *usedOut = used;
  return 1;
}

int emb_solve(unsigned target, unsigned *movesOut) {
  buildBasis();
  unsigned used = 0;
  if (!reduceTarget(target, &used)) return 0;
  if (movesOut) *movesOut = used;
  s_usedMoves = used;
  return 1;
}

static unsigned darkMask(void) {
  unsigned dark = 0;
  for (int i = 0; i < g_ns; i++) if (!g_lit[i]) dark |= 1u << i;
  return dark;
}

int emb_hintStone(void) {
  unsigned dark = darkMask();
  if (!dark || !emb_solve(dark, 0)) return -1;
  for (int i = 0; i < g_ns; i++) if ((s_usedMoves >> i) & 1u) return i;
  return -1;
}

/* ------------------------------------------------------------- the circle */
static void spreadMoss(int count) {
  for (int r = 0; r < 2; r++) {
    int m = emb_countInRing(r), want = (r == 0 ? count : count / 2);
    for (int j = 0; j < want; j++) {
      int idx = (j * m) / want;
      g_mossy[emb_firstOfRing(r) + (idx % m)] = 1;
    }
  }
}

static int litCount(void) {
  int lit = 0;
  for (int i = 0; i < g_ns; i++) lit += g_lit[i];
  return lit;
}

/* the first circle opens all dark; the rest open all lit and are stepped back */
static void poseStart(const Ring *c) {
  for (int i = 0; i < g_ns; i++) g_lit[i] = c->taps ? 1 : 0;
}

static void scramble(int taps) {
  for (int t = 0; t < taps; t++) {
    for (int tries = 0; tries < 40; tries++) {
      int s = (int)(emb_rnd() % (unsigned)g_ns);
      if (!emb_tappable(s)) continue;
      emb_applyTap(s); break;
    }
  }
}

static int poseAttempt(const Ring *c) {
  poseStart(c);
  scramble(c->taps);
  return litCount();
}

static int inBand(const Ring *c) {
  int lit = litCount();
  return lit >= c->lo && lit <= c->hi;
}

/* Pose the circle from all-lit and step back through a few taps: the same taps,
 * applied again, are a solution, so every circle ships solvable. */
static void poseCircle(const Ring *c) {
  for (int a = 0; a < 400; a++) {
    poseAttempt(c);
    if (inBand(c) && emb_solve(darkMask(), 0)) break;
  }
  for (int i = 0; i < g_ns; i++) g_start[i] = g_lit[i];
}

void emb_buildRing(int level) {
  if (level < 0) level = 0;
  if (level > 5) level = 5;
  const Ring *c = &CIRCLES[level];
  g_level = level;
  g_n0 = c->n0; g_n1 = c->n1; g_ns = c->n0 + c->n1;
  g_rng = g_seed ^ ((unsigned)level * 2654435761u + 0x9e3779b9u);
  if (!g_rng) g_rng = 1;
  for (int i = 0; i < g_ns; i++) { g_mossy[i] = 0; g_ring[i] = i < g_n0 ? 0 : 1; g_idx[i] = i < g_n0 ? i : i - g_n0; }
  spreadMoss(c->mossy);
  poseCircle(c);
  g_ntap = 0;
  emb_poseStones();
}

void emb_restart(void) {
  for (int i = 0; i < g_ns; i++) g_lit[i] = g_start[i];
  g_ntap = 0;
}

int emb_undo(void) {
  if (g_ntap <= 0) return -1;
  int stone = g_taps[--g_ntap];
  emb_applyTap(stone);
  return stone;
}
