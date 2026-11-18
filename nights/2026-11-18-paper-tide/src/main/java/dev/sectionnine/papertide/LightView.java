package dev.sectionnine.papertide;

/**
 * The lanterns, drawn: the ones drifting down the channel, the short string
 * being towed behind the boat, the tally in the corner, and the warm burst that
 * says a lamp was gathered.
 */
public final class LightView {
  /** A three-wide, five-tall pixel face, one row of bits per row. */
  private static final int[] DIGIT = {
    7, 5, 5, 5, 7,
    2, 6, 2, 2, 7,
    7, 1, 7, 4, 7,
    7, 1, 7, 1, 7,
    5, 5, 7, 1, 1,
    7, 4, 7, 1, 7,
    7, 4, 7, 5, 7,
    7, 1, 2, 2, 2,
    7, 5, 7, 5, 7,
    7, 5, 7, 1, 7
  };

  private static final double FLARE_SECONDS = 0.7;

  private final Screen s;

  public LightView(Screen s) {
    this.s = s;
  }

  /** Everything the lanterns have to say, drawn under the boat. */
  public void lanterns(World w) {
    for (int i = 0; i < w.lanterns.size(); i++) {
      lamp((int) Math.round(w.lanterns.xAt(i)), (int) Math.round(w.lanterns.yAt(i)), w.lanterns.phaseAt(i), 255);
    }
    int fade = (int) (255 * Math.min(1.0, Math.max(0.0, w.boat.fade)));
    for (int i = 0; i < w.lanterns.towedCount(); i++) {
      lamp((int) Math.round(w.lanterns.towedXAt(i)), (int) Math.round(w.lanterns.towedYAt(i)), 0.15 * i, fade);
    }
    tally(w);
  }

  /** The gathering itself: a fast bright ring, and a halo on the hull. */
  public void flare(World w) {
    double age = w.lanterns.flareT;
    if (age < FLARE_SECONDS) {
      int a = (int) (215 * (1.0 - age / FLARE_SECONDS));
      ring((int) Math.round(w.lanterns.flareX), (int) Math.round(w.lanterns.flareY), (int) (2 + age * 30), a);
    }
    if (w.glow > 0.02) {
      ring((int) Math.round(w.boat.x), (int) Math.round(w.boat.y - 2), (int) (5 + (1 - w.glow) * 8), (int) (w.glow * 120));
    }
  }

  /** A little lamp and the number gathered by this boat, top left of the water. */
  private void tally(World w) {
    int x = World.KERB + 6;
    int y = 9;
    lamp(x, y, w.t * 0.2, 210);
    int value = Math.min(99, w.score.run);
    if (value >= 10) {
      digit(x + 7, y - 2, value / 10);
      digit(x + 11, y - 2, value % 10);
    } else {
      digit(x + 8, y - 2, value);
    }
  }

  /** One drifting lantern: a soft warm halo around a small bright core. */
  private void lamp(int x, int y, double phase, int a) {
    int pulse = (int) (85 + 70 * Trig.wave(phase));
    for (int dy = -3; dy <= 3; dy++) {
      for (int dx = -3; dx <= 3; dx++) {
        int lit = pulse - (Math.abs(dx) + Math.abs(dy)) * 24;
        if (lit > 0) {
          s.add(x + dx, y + dy, Palette.LAMP, lit * a / 255);
        }
      }
    }
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        s.blend(x + dx, y + dy, dx == 0 && dy == 0 ? Palette.LAMP_HOT : Palette.LAMP, a);
      }
    }
    s.blend(x, y - 2, Palette.LAMP_HOT, a / 2);
    s.blend(x, y + 2, Palette.LAMP_POOL, a / 2);
  }

  private void ring(int x, int y, int r, int a) {
    if (a <= 0) {
      return;
    }
    int steps = Math.max(12, r * 5);
    for (int i = 0; i < steps; i++) {
      double turn = i / (double) steps;
      int px = x + (int) Math.round(Trig.cos(turn) * r);
      int py = y + (int) Math.round(Trig.sin(turn) * r);
      s.add(px, py, Palette.LAMP_HOT, a);
    }
  }

  private void digit(int x, int y, int value) {
    for (int row = 0; row < 5; row++) {
      int bits = DIGIT[value * 5 + row];
      for (int col = 0; col < 3; col++) {
        if ((bits & (4 >> col)) != 0) {
          s.blend(x + col, y + row, Palette.PAPER_LIT, 205);
        }
      }
    }
  }
}
