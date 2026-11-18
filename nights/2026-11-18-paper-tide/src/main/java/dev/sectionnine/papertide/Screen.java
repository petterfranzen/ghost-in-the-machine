package dev.sectionnine.papertide;

import org.teavm.jso.typedarrays.Uint32Array;

/**
 * The pixel buffer the whole picture is painted into. Colours are written as
 * 0xAARRGGBB and swizzled once on the way in, so the byte order in memory is
 * the R,G,B,A that ImageData expects.
 */
public final class Screen {
  public final int w;
  public final int h;
  private final Uint32Array px;

  public Screen(int w, int h, Uint32Array px) {
    this.w = w;
    this.h = h;
    this.px = px;
  }

  public static int swizzle(int argb) {
    return (argb & 0xFF00FF00) | ((argb & 0xFF) << 16) | ((argb >> 16) & 0xFF);
  }

  public boolean inside(int x, int y) {
    if (x < 0 || x >= w) {
      return false;
    }
    return y >= 0 && y < h;
  }

  public void clear(int argb) {
    int c = swizzle(argb);
    int n = w * h;
    for (int i = 0; i < n; i++) {
      px.set(i, c);
    }
  }

  public void set(int x, int y, int argb) {
    if (!inside(x, y)) {
      return;
    }
    px.set(y * w + x, swizzle(argb));
  }

  /** Soft write: a is 0 (leave the pixel) to 255 (replace it). */
  public void blend(int x, int y, int argb, int a) {
    if (!inside(x, y) || a <= 0) {
      return;
    }
    int i = y * w + x;
    if (a >= 255) {
      px.set(i, swizzle(argb));
      return;
    }
    px.set(i, mix(px.get(i), swizzle(argb), a));
  }

  /** Brightening write, for foam and glints: pushes the pixel toward argb. */
  public void add(int x, int y, int argb, int a) {
    if (!inside(x, y) || a <= 0) {
      return;
    }
    int i = y * w + x;
    int d = px.get(i);
    int r = (d & 0xFF) + (((argb & 0xFF) * a) >> 8);
    int g = ((d >> 8) & 0xFF) + ((((argb >> 8) & 0xFF) * a) >> 8);
    int b = ((d >> 16) & 0xFF) + ((((argb >> 16) & 0xFF) * a) >> 8);
    px.set(i, (d & 0xFF000000) | (clamp(b) << 16) | (clamp(g) << 8) | clamp(r));
  }

  /** Linear mix of two swizzled pixels, weight a/255 toward src. */
  private static int mix(int dst, int src, int a) {
    int inv = 255 - a;
    int r = ((dst & 0xFF) * inv + (src & 0xFF) * a) >> 8;
    int g = (((dst >> 8) & 0xFF) * inv + ((src >> 8) & 0xFF) * a) >> 8;
    int b = (((dst >> 16) & 0xFF) * inv + ((src >> 16) & 0xFF) * a) >> 8;
    return (dst & 0xFF000000) | (b << 16) | (g << 8) | r;
  }

  private static int clamp(int v) {
    if (v > 255) {
      return 255;
    }
    return v < 0 ? 0 : v;
  }

  public int at(int x, int y) {
    if (!inside(x, y)) {
      return 0;
    }
    int d = px.get(y * w + x);
    return (d & 0xFF00FF00) | ((d & 0xFF) << 16) | ((d >> 16) & 0xFF);
  }
}
