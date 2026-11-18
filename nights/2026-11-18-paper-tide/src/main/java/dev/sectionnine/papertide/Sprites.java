package dev.sectionnine.papertide;

/** The hand-placed sprites: the lantern, the boat, the leaves, the cat. */
public final class Sprites {
  private final Screen s;

  /** Where the boat is being drawn this frame. */
  private int cx;
  private int cy;
  private int alpha;
  private double angle;

  public Sprites(Screen s) {
    this.s = s;
  }

  /** A little door lantern on the left kerb: the source of the warm pool. */
  public void lantern(World w, int lx, int ly) {
    lanternFrame(lx, ly);
    lanternGlow(w, lx, ly);
  }

  private void lanternFrame(int lx, int ly) {
    for (int dy = -5; dy <= 5; dy++) {
      for (int dx = -4; dx <= 4; dx++) {
        boolean frame = Math.abs(dx) == 4 || Math.abs(dy) == 5;
        s.set(lx + dx, ly + dy, frame ? Palette.KERB_DARK : Palette.LAMP_HOT);
      }
    }
    for (int dx = -3; dx <= 3; dx++) {
      s.set(lx + dx, ly + 6, Palette.KERB_DARK);
      s.set(lx + dx, ly - 7, Palette.KERB_DARK);
    }
    s.set(lx, ly - 6, Palette.KERB_DARK);
  }

  private void lanternGlow(World w, int lx, int ly) {
    int lit = (int) (95 + 150 * w.lamp);
    for (int dy = -9; dy <= 9; dy++) {
      for (int dx = -9; dx <= 9; dx++) {
        int d = Math.abs(dx) + Math.abs(dy);
        int a = Math.min(235, Math.max(0, lit - d * 11));
        if (d > 5) {
          a = a * 2 / 3;
        }
        s.blend(lx + dx, ly + dy, Palette.LAMP, a);
      }
    }
  }

  /** The boat: a flat folded hull with a triangular sail, bow pointing downstream. */
  private static final int[] HULL = {8, 7, 6, 4, 2};
  private static final int[] SAIL = {0, 1, 2, 3, 4, 5, 4};

  public void boat(World w) {
    Boat b = w.boat;
    if (b.fade <= 0.02) {
      return;
    }
    double bob = Trig.sin(w.t * 0.9) * 0.6;
    cx = (int) Math.round(b.x);
    cy = (int) Math.round(b.y + bob);
    alpha = (int) (255 * Math.min(1.0, b.fade));
    angle = b.angle;
    shadow();
    rows(HULL, -1, this::hullColour);
    rows(SAIL, -10, this::sailColour);
    fold(w);
  }

  /** One shade function for a row-plotted sprite. */
  private interface Shade {
    int colour(int dx, int dy, int half);
  }

  /** Plots a stack of centred rows, sheared by the boat's angle. */
  private void rows(int[] widths, int base, Shade shade) {
    for (int row = 0; row < widths.length; row++) {
      int dy = row + base;
      int half = widths[row];
      int shear = (int) Math.round(angle * dy * 1.6);
      for (int dx = -half; dx <= half; dx++) {
        s.blend(cx + dx + shear, cy + dy, shade.colour(dx, dy, half), alpha);
      }
    }
  }

  /** Lit on the lamp side, creased down the middle, shaded at the rim. */
  private int hullColour(int dx, int dy, int half) {
    if (isRim(dx, dy, half)) {
      return Palette.PAPER_SHADE;
    }
    if (dx == 0) {
      return Palette.PAPER_CREASE;
    }
    return dx < 0 ? Palette.PAPER_LIT : Palette.PAPER;
  }

  private boolean isRim(int dx, int dy, int half) {
    if (Math.abs(dx) == half) {
      return true;
    }
    return dy == 2 || dy == -1;
  }

  private int sailColour(int dx, int dy, int half) {
    if (dx == half) {
      return Palette.PAPER_SHADE;
    }
    return dx <= 0 ? Palette.PAPER_LIT : Palette.PAPER;
  }

  /** A soft dark oval under the hull, so the paper sits in the water. */
  private void shadow() {
    for (int dy = 2; dy <= 4; dy++) {
      int half = 8 - (dy - 2) * 2;
      for (int dx = -half; dx <= half; dx++) {
        s.blend(cx + dx, cy + dy, Palette.WATER[0], Math.min(alpha, 110) / 2);
      }
    }
  }

  /** The hint glow at the stern, and the hidden flap it uncovers. */
  private void fold(World w) {
    hintGlow(w);
    if (w.boat.reveal <= 0) {
      return;
    }
    revealFlap(w);
  }

  private void hintGlow(World w) {
    int glow = (int) (w.hint * 70);
    if (glow <= 2) {
      return;
    }
    for (int dx = -2; dx <= 2; dx++) {
      s.add(cx + dx, cy - 9, Palette.LAMP, glow);
    }
  }

  private void revealFlap(World w) {
    int flap = (int) (Math.min(1.0, w.boat.reveal / 1.2) * 6);
    for (int dy = -13; dy <= -10; dy++) {
      int half = 2 + (dy + 13);
      for (int dx = -half; dx <= half; dx++) {
        s.blend(cx + dx, cy + dy - flap, Palette.PAPER_LIT, 255);
      }
    }
    star(cx, cy - 12 - flap);
  }

  private void star(int sx, int sy) {
    s.set(sx, sy - 1, Palette.PENCIL);
    s.set(sx, sy + 1, Palette.PENCIL);
    s.set(sx - 1, sy, Palette.PENCIL);
    s.set(sx + 1, sy, Palette.PENCIL);
    s.set(sx, sy, Palette.LAMP_HOT);
  }

  /** One drifting leaf, or a small acorn, seen from above. */
  public void flotsam(World w) {
    for (int i = 0; i < w.flotsam.size(); i++) {
      int kind = w.flotsam.kindAt(i);
      double sunk = w.flotsam.sinkAt(i);
      int a = (int) (255 * Math.max(0.35, 1.0 - sunk * 0.4));
      int x = (int) Math.round(w.flotsam.xAt(i));
      int y = (int) Math.round(w.flotsam.yAt(i) + sunk);
      if (kind == Flotsam.ACORN) {
        acorn(x, y, a);
      } else {
        leaf(x, y, a);
      }
    }
  }

  private void leaf(int x, int y, int a) {
    for (int dx = -3; dx <= 3; dx++) {
      int dy = Math.abs(dx) == 3 ? 0 : 1;
      s.blend(x + dx, y - dy, Palette.LEAF_HI, a);
      s.blend(x + dx, y + dy, Palette.LEAF, a);
    }
    s.blend(x - 4, y, Palette.LEAF_DARK, a);
    s.blend(x + 4, y, Palette.LEAF_DARK, a);
  }

  private void acorn(int x, int y, int a) {
    for (int dx = -1; dx <= 1; dx++) {
      s.blend(x + dx, y - 2, Palette.LEAF_DARK, a);
    }
    for (int dy = -1; dy <= 2; dy++) {
      int half = dy == 2 ? 0 : 1;
      for (int dx = -half; dx <= half; dx++) {
        s.blend(x + dx, y + dy, Palette.ACORN, a);
      }
    }
  }

  /** The cat: a loaf on the kerb, head toward the water, tail curling behind. */
  public void cat(World w) {
    Cat c = w.cat;
    if (!c.present()) {
      return;
    }
    int x = (int) Math.round(c.x);
    int y = (int) Math.round(c.y);
    body(x, y);
    head(c, x, y);
    tail(x, y);
    if (c.state == Cat.PAW) {
      paw(x, y);
    }
  }

  private void body(int x, int y) {
    for (int dy = -7; dy <= 6; dy++) {
      int half = (int) Math.round(4.6 * Math.sqrt(Math.max(0.0, 1.0 - (dy * dy) / 52.0)));
      for (int dx = -half; dx <= half; dx++) {
        s.blend(x + dx, y + dy, bodyColour(dx, dy), 255);
      }
    }
  }

  private int bodyColour(int dx, int dy) {
    if (((dx + dy) & 3) == 0) {
      return Palette.CAT_DARK;
    }
    if (dx < -1) {
      return Palette.CAT_LIT;
    }
    return dx > 1 ? Palette.CAT_DARK : Palette.CAT;
  }

  private void paw(int x, int y) {
    for (int dx = -7; dx <= -4; dx++) {
      s.blend(x + dx, y + 3, Palette.CAT_LIT, 255);
    }
  }

  private void head(Cat c, int x, int y) {
    for (int dy = -2; dy <= 3; dy++) {
      for (int dx = -9; dx <= -4; dx++) {
        double d = (dx + 6.5) * (dx + 6.5) / 9.0 + dy * dy / 6.0;
        if (d <= 1.0) {
          s.blend(x + dx, y + dy, dx < -6 ? Palette.CAT : Palette.CAT_LIT, 255);
        }
      }
    }
    s.blend(x - 7, y - 3, Palette.CAT_DARK, 255);
    s.blend(x - 5, y - 3, Palette.CAT_DARK, 255);
    if (c.frame() == 0) {
      s.blend(x - 8, y - 1, Palette.CAT_EYE, 255);
      s.blend(x - 8, y + 1, Palette.CAT_EYE, 255);
    }
  }

  private void tail(int x, int y) {
    for (int i = 0; i < 5; i++) {
      s.blend(x + 4 + i / 2, y - 2 + i, Palette.CAT_DARK, 255);
      s.blend(x + 5 + i / 2, y - 2 + i, Palette.CAT, 255);
    }
  }

  /** The reflection fills with stars when the lane has been still a while. */
  public void starfield(World w) {
    if (w.starsT <= 0) {
      return;
    }
    int fade = (int) (200 * Math.min(1.0, Math.min(w.starsT, 3.0) / 2.0));
    for (int i = 0; i < 9; i++) {
      int x = World.KERB + 14 + (i * 37) % (World.W - 2 * World.KERB - 28);
      int y = 58 + (i * 53) % 150;
      double tw = 0.45 + 0.55 * Trig.wave(w.t * 0.22 + i * 0.13);
      int a = (int) (fade * tw);
      s.add(x, y, Palette.GLINT, a);
      s.add(x - 1, y, Palette.GLINT, a / 3);
      s.add(x + 1, y, Palette.GLINT, a / 3);
      s.add(x, y - 1, Palette.GLINT, a / 3);
      s.add(x, y + 1, Palette.GLINT, a / 3);
    }
  }
}
