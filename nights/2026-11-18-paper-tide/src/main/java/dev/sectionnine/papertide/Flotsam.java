package dev.sectionnine.papertide;

/** Leaves and acorns riding the current: nudge them, never lose them. */
public final class Flotsam {
  public static final int LEAF = 0;
  public static final int ACORN = 1;
  public static final int FLOAT = 0;
  public static final int DIPPED = 1;
  public static final int RISING = 2;

  private static final int CAP = 9;
  private static final double WIDTH = World.W - 2 * World.KERB - 16;

  /** One leaf or acorn, kept in a pool so nothing is allocated per frame. */
  private static final class Piece {
    int kind;
    int state;
    double x;
    double y;
    double vx;
    double spin;
    double sink;
    double timer;
  }

  private final Piece[] pool = new Piece[CAP];
  private int n;

  public Flotsam() {
    for (int i = 0; i < CAP; i++) {
      pool[i] = new Piece();
    }
  }

  public int size() {
    return n;
  }

  public double xAt(int i) {
    return pool[i].x;
  }

  public double yAt(int i) {
    return pool[i].y;
  }

  public double sinkAt(int i) {
    return pool[i].sink;
  }

  public int kindAt(int i) {
    return pool[i].kind;
  }

  public int stateAt(int i) {
    return pool[i].state;
  }

  public void populate(World w) {
    n = 0;
    double[] xs = { 0.22, 0.46, 0.72, 0.34, 0.62, 0.15, 0.82 };
    double[] ys = { 0.12, 0.44, 0.20, 0.70, 0.58, 0.86, 0.32 };
    for (int i = 0; i < xs.length; i++) {
      add(w, xs[i], ys[i], i % 2 == 0 ? LEAF : ACORN);
    }
  }

  private void add(World w, double fx, double fy, int kind) {
    Piece p = pool[n++];
    p.kind = kind;
    p.x = World.KERB + 8 + fx * WIDTH;
    p.y = fy * (World.H - 40);
    p.vx = w.rnd.range(-1.4, 1.4);
    p.spin = 0;
    p.sink = 0;
    p.state = FLOAT;
    p.timer = 0;
  }

  /** Index of the flotsam under a point, or -1. */
  public int pick(double px, double py) {
    for (int i = 0; i < n; i++) {
      if (isUnder(pool[i], px, py)) {
        return i;
      }
    }
    return -1;
  }

  private boolean isUnder(Piece p, double px, double py) {
    return p.state == FLOAT && Math.abs(px - p.x) < 7 && Math.abs(py - p.y) < 7;
  }

  public void push(double px, double py, double ix, double iy) {
    for (int i = 0; i < n; i++) {
      Piece p = pool[i];
      double d = Math.abs(px - p.x) + Math.abs(py - p.y);
      if (d < 26) {
        double fall = 1.0 - d / 26.0;
        p.vx += ix * fall * 3.0;
        p.y += iy * fall * 3.0;
      }
    }
  }

  /** A spin, a gentle dip, then back up: a nudge, never a drowning. */
  public void spin(int i) {
    Piece p = pool[i];
    p.state = DIPPED;
    p.timer = 0.5;
    p.sink = 1.6;
    p.spin = 9.0;
  }

  public void step(World w, double dt) {
    for (int i = 0; i < n; i++) {
      Piece p = pool[i];
      p.vx = p.vx * (1.0 - 1.1 * dt) + w.rnd.signed() * dt * 0.5;
      p.x = clamp(p.x + p.vx * dt, World.KERB + 3, World.W - World.KERB - 3);
      p.y += (w.speed * 0.92 + 0.6) * dt;
      p.spin *= 1.0 - 1.4 * dt;
      settle(p, dt);
      if (p.y > World.H + 12) {
        recycle(w, p);
      }
    }
  }

  private void settle(Piece p, double dt) {
    if (p.state == DIPPED) {
      dip(p, dt);
    } else if (p.state == RISING) {
      rise(p, dt);
    }
  }

  private void dip(Piece p, double dt) {
    p.sink = Math.max(0, p.sink - dt * 2.2);
    p.timer -= dt;
    if (p.timer <= 0) {
      p.state = RISING;
    }
  }

  private void rise(Piece p, double dt) {
    p.sink = Math.max(0, p.sink - dt * 1.2);
    if (p.sink <= 0.01) {
      p.state = FLOAT;
    }
  }

  private void recycle(World w, Piece p) {
    p.y = w.rnd.range(-30, -6);
    p.x = World.KERB + 8 + w.rnd.unit() * WIDTH;
    p.vx = w.rnd.range(-1.2, 1.2);
    p.sink = 0;
    p.state = FLOAT;
  }

  private static double clamp(double v, double lo, double hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }
}
