package dev.sectionnine.papertide;

/**
 * The paper boat. It drifts down the channel, is steered by a thumb and by the
 * water, slips under the drain and is folded again at the top: the journey
 * never ends and nothing is ever lost.
 */
public final class Boat {
  public static final int DRIFT = 0;
  public static final int SINKING = 1;
  public static final int FOLDING = 2;

  public static final double HIT = 9.0;

  public double x;
  public double y;
  public double vx;
  public double vy;
  public double angle;
  public int state = FOLDING;
  public double stateT = 1.4;
  public double hold;
  public double reveal;
  public double fade = 1.0;
  public int laps;
  private double wake;
  private double wander;

  public Boat() {
    x = World.W * 0.52;
    y = 26;
  }

  public boolean under(double px, double py) {
    return Math.abs(px - x) < HIT && Math.abs(py - y) < HIT;
  }

  public void step(World w, double dt) {
    stateT -= dt;
    reveal = Math.max(0, reveal - dt);
    if (state == SINKING) {
      fade = Math.max(0, fade - dt * 1.6);
      y += w.speed * dt * 0.6;
      if (stateT <= 0) {
        reset();
      }
      return;
    }
    if (state == FOLDING) {
      if (stateT <= 0) {
        state = DRIFT;
        w.events.add(Events.FOLD, x, y, 0);
        w.events.announce("A fresh boat is folded at the top of the gutter.");
      }
      return;
    }
    drift(w, dt);
  }

  private void drift(World w, double dt) {
    wander += w.rnd.signed() * dt * 0.7;
    wander = clamp(wander, -0.5, 0.5);
    vx = vx * (1.0 - 1.6 * dt) + wander * dt * 14.0;
    vy = w.speed + 1.4 + (y < 24 ? 16.0 : 0.0);
    x = clamp(x + vx * dt, World.KERB + 6, World.W - World.KERB - 6);
    y += vy * dt;
    angle = angle * 0.94 + clamp(vx * 0.5, -0.4, 0.4) * 0.06;
    wake += dt;
    if (wake > 0.16) {
      wake = 0;
      w.rings.spawn(new Ripples.Spec(Ripples.WAKE, x, y - 7, 0.30, 20, 1.7));
    }
    if (y > World.DRAIN_Y + 3) {
      state = SINKING;
      stateT = 3.2;
      laps++;
      w.events.add(Events.GONE, x, y, 0);
    }
  }

  private void reset() {
    state = FOLDING;
    stateT = 1.5;
    fade = 1.0;
    x = World.KERB + 18 + (laps * 37) % (World.W - 2 * World.KERB - 36);
    y = -14;
    vx = 0;
    angle = 0;
    wander = 0;
    hold = 0;
  }

  public void nudge(double ix, double iy) {
    vx += ix;
    y += iy * 6;
  }

  /** A still press, held: the boat slowly unfolds a folded secret. */
  public void held(World w, double seconds) {
    if (state != DRIFT) {
      return;
    }
    hold = seconds;
    if (hold > 0.9 && reveal <= 0.0) {
      reveal = 5.0;
      hold = 0;
      w.events.add(Events.REVEAL, x, y, 0);
      w.events.announce("The folded flap lifts: a tiny pencil star is drawn inside.");
    }
  }

  private static double clamp(double v, double lo, double hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }
}
