package dev.sectionnine.papertide;

/** The water surface: grain, flow, the lamp's reflection, rings, rain, foam. */
public final class WaterView {
  public static final int LX = 22;
  public static final int LY = 74;
  private static final int RX = World.W - World.KERB - 10;

  private final Screen s;

  public WaterView(Screen s) {
    this.s = s;
  }

  public void draw(World w) {
    surface(w);
    reflection(w, new Beam(LX, LY + 3, 1.0, Palette.LAMP, 180));
    reflection(w, new Beam(RX, World.DRAIN_Y - 150, 0.55, Palette.WINDOW, 46));
    rings(w);
    rain(w);
    foam(w);
  }

  private void surface(World w) {
    for (int y = 0; y < World.DRAIN_Y; y++) {
      surfaceRow(w, y);
    }
  }

  private void surfaceRow(World w, int y) {
    double fy = y + w.flow;
    double phase = (fy * 0.055 + y * 0.011) / 6.2832;
    for (int x = World.KERB; x < World.W - World.KERB; x++) {
      s.set(x, y, Palette.WATER[waterIndex(w, new Spot(x, y, fy, phase))]);
    }
  }

  /** A point on the moving surface, with the phase already worked out. */
  private record Spot(int x, int y, double fy, double phase) {
  }

  private int waterIndex(World w, Spot p) {
    double band = Trig.sin(p.phase() + p.x() * 0.004) * 0.55
        + Trig.sin(p.phase() * 2.7 + w.t * 0.03 + p.x() * 0.011) * 0.32 + w.swell * 0.3;
    double g = Rand.grain(p.x(), (int) p.fy());
    double extra = g > 0.55 ? 1 : (g < -0.62 ? -1 : 0);
    double v = 3.5 + band + extra + edgeShade(p.x());
    int low = (int) Math.floor(v);
    double dither = 0.5 + 0.5 * Rand.grain(p.x() * 3 + 5, (int) p.fy() + 11);
    return clampIndex(v - low > dither ? low + 1 : low);
  }

  /** Water is darker where it meets the stone. */
  private int edgeShade(int x) {
    int d = Math.min(x - World.KERB, World.W - World.KERB - 1 - x);
    if (d < 2) {
      return -2;
    }
    return d < 5 ? -1 : 0;
  }

  private int clampIndex(int i) {
    if (i < 0) {
      return 0;
    }
    return Math.min(i, Palette.WATER.length - 1);
  }

  /** A reflection of a lamp or a window, broken up by the moving surface. */
  private record Beam(int lx, int from, double strength, int colour, int peak) {
  }

  private void reflection(World w, Beam b) {
    if (b.from() < 6 || b.from() > World.DRAIN_Y - 20) {
      return;
    }
    beamBody(w, b, (int) (w.lamp * b.peak() * b.strength()));
    glintLine(w, b);
  }

  private void beamBody(World w, Beam b, int lit) {
    for (int y = b.from(); y < Math.min(World.DRAIN_Y - 2, b.from() + 200); y++) {
      double fall = 1.0 - (y - b.from()) / 205.0;
      double wob = 0.5 + 0.5 * Trig.wave(w.t * 0.30 + y * 0.05);
      for (int x = b.lx() - 10; x <= b.lx() + 11; x++) {
        double lat = 1.0 - Math.abs(x - b.lx() - 1) / 11.0;
        if (lat > 0.0) {
          s.blend(x, y, b.colour(), Math.min(235, (int) (lit * fall * lat * wob) * 2));
        }
      }
    }
  }

  private void glintLine(World w, Beam b) {
    for (int y = b.from(); y < b.from() + 44; y++) {
      s.add(b.lx() + 1, y, Palette.GLINT, (int) (w.lamp * 34 * (1.0 - (y - b.from()) / 46.0)));
    }
  }

  private void rings(World w) {
    for (int i = 0; i < w.rings.size(); i++) {
      int kind = w.rings.kindAt(i);
      int a = (int) (w.rings.ampAt(i) * (kind == Ripples.STIR ? 120 : 155));
      if (a >= 4) {
        circle(new Ring((int) Math.round(w.rings.xAt(i)), (int) Math.round(w.rings.yAt(i)),
            w.rings.rAt(i), kind == Ripples.STIR ? Palette.WATER_STIR : Palette.WATER_FOAM, a));
      }
    }
  }

  /** One ring, drawn as a dotted circumference. */
  private record Ring(int cx, int cy, double r, int colour, int a) {
  }

  private void circle(Ring r) {
    int steps = Math.max(10, (int) (r.r() * 6.3));
    for (int k = 0; k < steps; k++) {
      double turn = (double) k / steps;
      int x = r.cx() + (int) Math.round(Trig.cos(turn) * r.r());
      int y = r.cy() + (int) Math.round(Trig.sin(turn) * r.r());
      s.add(x, y, r.colour(), r.a());
      if (r.a() > 90) {
        s.blend(x, y + 1, Palette.WATER[0], r.a() / 4);
      }
    }
  }

  private void rain(World w) {
    for (int i = 0; i < w.rain.size(); i++) {
      streak((int) Math.round(w.rain.xAt(i)), (int) Math.round(w.rain.yAt(i)), (int) w.rain.lenAt(i));
    }
  }

  private void streak(int x, int y, int len) {
    for (int k = 0; k < len; k++) {
      s.add(x + k / 5, y + k, Palette.RAIN, 70 - k * 9);
    }
  }

  private void foam(World w) {
    int tick = (int) (w.t * 26);
    foamGrate(tick);
    foamEdges(tick);
  }

  private void foamGrate(int tick) {
    for (int y = World.DRAIN_Y - 13; y < World.DRAIN_Y; y++) {
      grateRow(y, tick);
    }
  }

  private void grateRow(int y, int tick) {
    int strength = 40 + (y - (World.DRAIN_Y - 13)) * 9;
    for (int x = World.KERB; x < World.W - World.KERB; x++) {
      if ((x * 5 + y * 9 + tick) % 13 < 4) {
        s.add(x, y, Palette.WATER_FOAM, strength);
      }
    }
  }

  private void foamEdges(int tick) {
    for (int y = 0; y < World.DRAIN_Y; y++) {
      if ((y * 3 + tick * 2) % 17 < 3) {
        s.add(World.KERB, y, Palette.WATER_FOAM_DIM, 70);
        s.add(World.W - World.KERB - 1, y, Palette.WATER_FOAM_DIM, 70);
      }
    }
  }
}
