package dev.sectionnine.papertide;

/**
 * What the water wants to say: a queue of sound cues and announcements, drained
 * once per frame by the host (never only inside a gesture handler).
 */
public final class Events {
  public static final int PLIP = 1;
  public static final int STIR = 2;
  public static final int RUSTLE = 3;
  public static final int THUP = 4;
  public static final int GLOOP = 5;
  public static final int MEOW = 6;
  public static final int REVEAL = 7;
  public static final int FOLD = 8;
  public static final int SWELL = 9;
  public static final int PAW = 10;
  public static final int STARS = 11;
  public static final int GONE = 12;

  private static final int CAP = 48;
  private final int[] kind = new int[CAP];
  private final double[] x = new double[CAP];
  private final double[] y = new double[CAP];
  private final double[] val = new double[CAP];
  private int n;
  private int sayN;
  private final String[] say = new String[8];

  public void add(int kind, double x, double y, double val) {
    if (n >= CAP) {
      return;
    }
    this.kind[n] = kind;
    this.x[n] = x;
    this.y[n] = y;
    this.val[n] = val;
    n++;
  }

  /** One sentence for the screen reader; batched, so a frame says one thing. */
  public void announce(String text) {
    if (sayN < say.length) {
      say[sayN++] = text;
    }
  }

  public int size() {
    return n;
  }

  public int kindAt(int i) {
    return kind[i];
  }

  public double xAt(int i) {
    return x[i];
  }

  public double yAt(int i) {
    return y[i];
  }

  public double valAt(int i) {
    return val[i];
  }

  public String announcement() {
    if (sayN == 0) {
      return null;
    }
    String text = say[sayN - 1];
    sayN = 0;
    return text;
  }

  public void clear() {
    n = 0;
    sayN = 0;
  }
}
