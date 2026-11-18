package dev.sectionnine.papertide;

/** Sine and cosine from tables, measured in turns (1.0 is a full circle). */
public final class Trig {
  private static final int N = 720;
  private static final int MASK = N - 1;
  private static final double[] SIN = new double[N];

  static {
    for (int i = 0; i < N; i++) {
      SIN[i] = Math.sin(i * 2.0 * Math.PI / N);
    }
  }

  private Trig() {}

  private static int index(double turns) {
    int i = (int) (turns * N);
    return i & MASK;
  }

  public static double sin(double turns) {
    return SIN[index(turns)];
  }

  public static double cos(double turns) {
    return SIN[index(turns + 0.25)];
  }

  /** 0.0 to 1.0, a full sweep of turns. */
  public static double wave(double turns) {
    return 0.5 + 0.5 * sin(turns);
  }
}
