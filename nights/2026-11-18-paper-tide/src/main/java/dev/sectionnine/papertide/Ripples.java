package dev.sectionnine.papertide;

/** A pool of expanding rings: rain drops, knocks, wakes and thumb stirs. */
public final class Ripples {
  public static final int DROP = 0;
  public static final int TAP = 1;
  public static final int WAKE = 2;
  public static final int STIR = 3;

  private static final int CAP = 84;

  /** One expanding ring, kept in a pool so nothing is allocated per frame. */
  private static final class Ring {
    int kind;
    double x;
    double y;
    double r;
    double growth;
    double amp;
    double life;
    double span;
  }

  /** What a new ring is made of. */
  public record Spec(int kind, double x, double y, double amp, double span, double seconds) {
  }

  private final Ring[] pool = new Ring[CAP];
  private int n;

  public Ripples() {
    for (int i = 0; i < CAP; i++) {
      pool[i] = new Ring();
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

  public double rAt(int i) {
    return pool[i].r;
  }

  public double ampAt(int i) {
    Ring k = pool[i];
    return k.amp * (1.0 - k.r / k.span);
  }

  public int kindAt(int i) {
    return pool[i].kind;
  }

  public void spawn(Spec sp) {
    if (n >= CAP || sp.seconds() <= 0.0) {
      return;
    }
    Ring k = pool[n++];
    k.kind = sp.kind();
    k.x = sp.x();
    k.y = sp.y();
    k.r = 0.6;
    k.amp = sp.amp();
    k.life = sp.seconds();
    k.span = sp.span();
    k.growth = sp.span() / sp.seconds();
  }

  /** Rings drift downstream with the current while they expand and fade. */
  public void step(double dt, double speed, double motion) {
    for (int i = 0; i < n; i++) {
      Ring k = pool[i];
      k.r += k.growth * dt;
      k.y += speed * dt * motion;
      k.life -= dt;
      if (k.life <= 0.0 || k.r >= k.span) {
        remove(i);
        i--;
      }
    }
  }

  /** Swap the dead ring with the last live one, so the pool stays packed. */
  private void remove(int i) {
    int last = --n;
    Ring gone = pool[i];
    pool[i] = pool[last];
    pool[last] = gone;
  }

  public void clear() {
    n = 0;
  }
}
