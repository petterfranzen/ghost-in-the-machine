package dev.sectionnine.papertide;

/** Paints one frame: stone, water, the drain, then everything that floats. */
public final class Renderer {
  private static final int BLOCK = 11;
  private static final int LANTERN_X = 6;
  private static final int LANTERN_Y = 74;

  private final Screen s;
  private final Sprites sprites;
  private final WaterView water;

  public Renderer(Screen s) {
    this.s = s;
    this.sprites = new Sprites(s);
    this.water = new WaterView(s);
  }

  public void draw(World w) {
    kerb(w, 0, World.KERB, true);
    kerb(w, World.W - World.KERB, World.W, false);
    water.draw(w);
    drain(w);
    sprites.lantern(w, LANTERN_X, LANTERN_Y);
    sprites.starfield(w);
    sprites.flotsam(w);
    sprites.boat(w);
    sprites.cat(w);
  }

  /** A block kerb, wet and lamp-lit near the lantern. */
  private void kerb(World w, int x0, int x1, boolean left) {
    kerbBlocks(x0, x1);
    edge(left ? x1 - 1 : x0, left ? 1 : -1);
    if (left) {
      litKerb(w, x0, x1);
    } else {
      window(w, x1 - 3, World.DRAIN_Y - 162);
    }
  }

  private void kerbBlocks(int x0, int x1) {
    for (int y = 0; y < World.H; y++) {
      int tone = kerbTone(y);
      for (int x = x0; x < x1; x++) {
        boolean joint = y % BLOCK == 0 || (x - x0) % BLOCK == 0;
        s.set(x, y, joint ? Palette.MORTAR : tone);
      }
    }
  }

  private int kerbTone(int y) {
    double speck = Rand.grain(y / BLOCK * 31, y * 3);
    if (speck < -0.5) {
      return Palette.KERB_DARK;
    }
    return speck > 0.2 ? Palette.KERB_LIT : Palette.KERB;
  }

  /** The wet line where stone meets water, with a little moss. */
  private void edge(int x, int dir) {
    for (int y = 0; y < World.H; y++) {
      s.blend(x, y, Palette.KERB_DARK, 90);
      s.blend(x - dir, y, Palette.MORTAR, 60);
      moss(x, y);
    }
  }

  private void moss(int x, int y) {
    if (y * 7 % 23 < 2) {
      s.blend(x, y, Palette.MOSS, 200);
    } else if (y * 5 % 31 < 2) {
      s.blend(x, y, Palette.MOSS_LIT, 160);
    }
  }

  private void litKerb(World w, int x0, int x1) {
    int lit = (int) (w.lamp * 90);
    for (int y = WaterView.LY - 26; y < WaterView.LY + 40; y++) {
      for (int x = x0; x < x1; x++) {
        int d = Math.abs(y - LANTERN_Y) / 3 + Math.abs(x - LANTERN_X) / 4;
        s.add(x, y, Palette.LAMP_POOL, Math.max(0, lit - d * 16));
      }
    }
  }

  /** A dim, cool window on the right: a second, quieter reflection. */
  private void window(World w, int x, int y) {
    int lit = Math.min(255, (int) (150 + 80 * w.lamp));
    for (int dy = 0; dy < 12; dy++) {
      frameRow(x, y + dy);
      if (dy >= 2 && dy < 10) {
        paneRow(x, y + dy, lit);
      }
    }
  }

  private void frameRow(int x, int y) {
    for (int dx = 0; dx < 6; dx++) {
      s.set(x + dx, y, Palette.KERB_DARK);
    }
  }

  private void paneRow(int x, int y, int lit) {
    for (int dx = 1; dx < 5; dx++) {
      s.blend(x + dx, y, Palette.WINDOW, lit);
    }
  }

  /** The grate at the foot of the channel, with foam pressing through it. */
  private void drain(World w) {
    drainFloor();
    drainBars();
    drainFoam(w);
  }

  private void drainFloor() {
    for (int y = World.DRAIN_Y; y < World.H; y++) {
      for (int x = 0; x < World.W; x++) {
        s.set(x, y, Palette.DRAIN);
      }
    }
  }

  private void drainBars() {
    for (int x = 4; x < World.W - 4; x += 5) {
      for (int y = World.DRAIN_Y + 1; y < World.H; y++) {
        s.set(x, y, Palette.GRATE);
        s.set(x + 1, y, Palette.GRATE_HI);
      }
    }
    for (int y = World.DRAIN_Y + 6; y < World.H; y += 12) {
      for (int x = 4; x < World.W - 4; x++) {
        s.set(x, y, Palette.GRATE);
      }
    }
  }

  private void drainFoam(World w) {
    int tick = (int) (w.t * 30);
    for (int i = 0; i < 14; i++) {
      int x = 8 + (i * 13 + tick) % (World.W - 16);
      int y = World.DRAIN_Y + 2 + (i * 7) % 24;
      s.add(x, y, Palette.WATER_FOAM, 60 + i % 3 * 30);
    }
  }
}
