package dev.sectionnine.papertide;

/**
 * The lanterns: a few small lamps drifting down the channel a little slower
 * than the boat, so steering into one is the whole gentle game. A lantern the
 * boat misses rides on to the grate and comes round again; one it gathers is
 * carried on a short string behind the stern until the boat goes under, and a
 * fresh lamp is set afloat at the top in its place.
 */
public final class Lanterns {
  private static final double REACH = 11.0;
  private static final double REACH_Y = 9.0;
  private static final int CAP = 10;
  private static final int TAIL = 6;
  private static final double WIDTH = World.W - 2 * World.KERB - 20;

  /** Where the first lanterns are put: spread down the channel, off the bow. */
  private static final double[] START_X = { 0.10, 0.28, 0.44, 0.68, 0.86, 0.20 };
  private static final double[] START_Y = { 0.20, 0.34, 0.52, 0.66, 0.80, 0.12 };

  /** The flare of the last gathering, for the renderer. */
  public double flareX;
  public double flareY;
  public double flareT = 1.0;

  /** One drifting lamp, kept in a pool so nothing is allocated per frame. */
  private static final class Light {
    double x;
    double y;
    double sway;
    double phase;
  }

  private final Light[] pool = new Light[CAP];
  private final double[] tx = new double[TAIL];
  private final double[] ty = new double[TAIL];
  private int n;
  private int towed;

  public Lanterns() {
    for (int i = 0; i < CAP; i++) {
      pool[i] = new Light();
    }
  }

  /** The channel opens with a few lanterns already on the water. */
  public void populate(World w) {
    n = 0;
    towed = 0;
    for (int i = 0; i < START_X.length && n < CAP; i++) {
      Light l = pool[n++];
      l.x = World.KERB + 10 + START_X[i] * WIDTH;
      l.y = START_Y[i] * World.H;
      l.sway = w.rnd.range(-1.4, 1.4);
      l.phase = w.rnd.unit();
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

  public double phaseAt(int i) {
    return pool[i].phase;
  }

  public int towedCount() {
    return towed;
  }

  public double towedXAt(int i) {
    return tx[i];
  }

  public double towedYAt(int i) {
    return ty[i];
  }

  /** The nearest lamp still ahead of the bow: what the next nudge aims for. */
  public double aimX(Boat b) {
    int i = ahead(b);
    return i < 0 ? -1 : pool[i].x;
  }

  public double aimY(Boat b) {
    int i = ahead(b);
    return i < 0 ? -1 : pool[i].y;
  }

  private int ahead(Boat b) {
    int best = -1;
    double bestY = Double.MAX_VALUE;
    for (int i = 0; i < n; i++) {
      Light l = pool[i];
      if (l.y > b.y - 14 && l.y < bestY) {
        bestY = l.y;
        best = i;
      }
    }
    return best;
  }

  /** One step: the lamps drift, the bow gathers what it meets, the string follows. */
  public void step(World w, double dt) {
    for (int i = 0; i < n; i++) {
      Light l = pool[i];
      drift(w, l, dt);
      if (met(w, l)) {
        gather(w, l);
      }
    }
    pull(w, dt);
    flareT += dt;
  }

  private void drift(World w, Light l, double dt) {
    l.x += (l.sway + Trig.sin(w.t * 0.24 + l.phase) * 3.0) * dt;
    l.x = clamp(l.x, World.KERB + 8, World.W - World.KERB - 8);
    l.y += (w.speed * 0.55 + 0.5) * dt;
    if (l.y > World.H + 12) {
      place(w, l);
    }
  }

  /** A lamp that reaches the grate is lifted back to the top of the channel. */
  private void place(World w, Light l) {
    l.x = World.KERB + 10 + w.rnd.unit() * WIDTH;
    l.y = w.rnd.range(-52, -10);
    l.sway = w.rnd.range(-1.4, 1.4);
    l.phase = w.rnd.unit();
  }

  private boolean met(World w, Light l) {
    Boat b = w.boat;
    if (b.state != Boat.DRIFT || b.y < 0) {
      return false;
    }
    return Math.abs(l.x - b.x) < REACH && Math.abs(l.y - b.y) < REACH_Y;
  }

  /** The bow meets a lamp: it joins the string, and a new one is set afloat upstream. */
  private void gather(World w, Light l) {
    addTowed(l.x, l.y);
    flare(l.x, l.y);
    w.catchLantern(l.x, l.y);
    place(w, l);
  }

  private void addTowed(double x, double y) {
    int m = Math.min(towed, TAIL - 1);
    for (int i = m; i > 0; i--) {
      tx[i] = tx[i - 1];
      ty[i] = ty[i - 1];
    }
    tx[0] = x;
    ty[0] = y;
    towed = m + 1;
  }

  /** The gathered lamps are towed behind the stern on a loose, swaying string. */
  private void pull(World w, double dt) {
    double k = Math.min(1.0, dt * 5.0);
    for (int i = 0; i < towed; i++) {
      double ax = w.boat.x - Trig.sin(w.t * 0.3 + i * 0.13) * (i + 1) * 1.6;
      double ay = w.boat.y - 8 - (i + 1) * 7;
      tx[i] += (ax - tx[i]) * k;
      ty[i] += (ay - ty[i]) * k;
    }
  }

  /** The boat slid under the grate: the lamps it carried went with it. */
  public void release() {
    if (towed > 0) {
      flare(tx[0], ty[0]);
    }
    towed = 0;
  }

  private void flare(double x, double y) {
    flareX = x;
    flareY = y;
    flareT = 0.0;
  }

  private static double clamp(double v, double lo, double hi) {
    return Math.max(lo, Math.min(hi, v));
  }
}
