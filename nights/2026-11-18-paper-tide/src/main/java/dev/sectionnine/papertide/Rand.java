package dev.sectionnine.papertide;

/** A tiny deterministic random, so the same evening plays out the same way. */
public final class Rand {
  private int s;

  public Rand(int seed) {
    s = seed | 1;
  }

  public int next() {
    int x = s;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    s = x;
    return x;
  }

  public int below(int n) {
    return (next() >>> 1) % n;
  }

  /** 0.0 up to but not including 1.0. */
  public double unit() {
    return (next() >>> 8) / 16777216.0;
  }

  public double range(double lo, double hi) {
    return lo + unit() * (hi - lo);
  }

  public double signed() {
    return unit() * 2.0 - 1.0;
  }

  /** Speckle for water grain: a stable hash of a pixel, -1.0 to 1.0. */
  public static double grain(int x, int y) {
    int h = x * 374761393 + y * 668265263;
    h = (h ^ (h >>> 13)) * 1274126177;
    h ^= h >>> 16;
    return ((h >>> 8) & 1023) / 511.5 - 1.0;
  }
}
