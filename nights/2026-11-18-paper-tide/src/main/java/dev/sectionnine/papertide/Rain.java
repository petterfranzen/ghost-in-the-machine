package dev.sectionnine.papertide;

/** Falling streaks and the little rings they leave on the water. */
public final class Rain {
  private static final int CAP = 96;
  private final double[] x = new double[CAP];
  private final double[] y = new double[CAP];
  private final double[] len = new double[CAP];
  private final double[] spd = new double[CAP];
  private int n;
  private double acc;

  public double intensity = 0.35;
  public int impacts;
  public int impactsTotal;
  public double lastX;
  public double lastY;

  public int size() {
    return n;
  }

  public double xAt(int i) {
    return x[i];
  }

  public double yAt(int i) {
    return y[i];
  }

  public double lenAt(int i) {
    return len[i];
  }

  public void step(World w, double dt) {
    intensity = 0.35 + 0.65 * w.swell;
    double rate = 3.0 + 26.0 * intensity;
    acc += rate * dt;
    while (acc >= 1.0) {
      acc -= 1.0;
      streak(w);
    }
    for (int i = 0; i < n; i++) {
      y[i] += spd[i] * dt;
      if (y[i] > World.H + 8) {
        n--;
        x[i] = x[n];
        y[i] = y[n];
        len[i] = len[n];
        spd[i] = spd[n];
        i--;
      }
    }
    impacts = 0;
  }

  private void streak(World w) {
    if (n < CAP) {
      x[n] = w.rnd.range(World.KERB - 2, World.W - World.KERB + 2);
      y[n] = w.rnd.range(-24, World.H * 0.92);
      len[n] = w.rnd.range(3, 7);
      spd[n] = w.rnd.range(210, 340);
      n++;
    }
    if (w.rnd.unit() < 0.55 + 0.3 * intensity) {
      double ix = w.rnd.range(World.KERB + 2, World.W - World.KERB - 2);
      double iy = w.rnd.range(6, World.H * 0.88);
      if (iy > World.DRAIN_Y - 26) {
        return;
      }
      w.rings.spawn(new Ripples.Spec(Ripples.DROP, ix, iy, 0.5 + 0.35 * intensity, 9 + 7 * intensity, 1.5));
      impacts++;
      impactsTotal++;
      lastX = ix;
      lastY = iy;
    }
  }
}
