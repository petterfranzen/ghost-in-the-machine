package dev.sectionnine.papertide;

/** Every colour in the picture, in one place, so the night stays consistent. */
public final class Palette {
  private Palette() {}

  /** Water, from the deepest channel to the brightest sheen. */
  public static final int[] WATER = {
    0xFF1B2C42, 0xFF22374F, 0xFF2B4360, 0xFF355072, 0xFF40608A, 0xFF4C6E9C
  };
  public static final int WATER_FOAM = 0xFFB9CBDD;
  public static final int WATER_FOAM_DIM = 0xFF6E7F97;
  public static final int WATER_DROP = 0xFF7893B4;
  public static final int WATER_STIR = 0xFF4C6484;

  /** Stone kerb and its wet, lamp-lit face. */
  public static final int KERB = 0xFF454C5C;
  public static final int KERB_LIT = 0xFF5D6577;
  public static final int KERB_DARK = 0xFF2A2F3B;
  public static final int MORTAR = 0xFF12151D;
  public static final int MOSS = 0xFF2F4230;
  public static final int MOSS_LIT = 0xFF445C3C;

  /** The drain at the foot of the channel. */
  public static final int DRAIN = 0xFF0A0D14;
  public static final int GRATE = 0xFF3B4455;
  public static final int GRATE_HI = 0xFF556074;

  /** Warm light: the lamp, its pool on the water, a lit window. */
  public static final int LAMP = 0xFFFFD79A;
  public static final int LAMP_HOT = 0xFFFFF0D2;
  public static final int LAMP_POOL = 0xFF9A7442;
  public static final int WINDOW = 0xFFE8B978;
  public static final int GLINT = 0xFFF6F2E4;

  /** The paper boat and everything else that floats. */
  public static final int PAPER = 0xFFF1E8D6;
  public static final int PAPER_LIT = 0xFFFFF8EC;
  public static final int PAPER_SHADE = 0xFFC9BE9F;
  public static final int PAPER_CREASE = 0xFFA99C7E;
  public static final int PENCIL = 0xFF5A5348;
  public static final int LEAF = 0xFF8A5A2E;
  public static final int LEAF_HI = 0xFFB87A3C;
  public static final int LEAF_DARK = 0xFF5C3A1E;
  public static final int ACORN = 0xFF6B4A2A;

  /** Rain, and the cat on the kerb. */
  public static final int RAIN = 0xFF93A9C8;
  public static final int CAT = 0xFF6C7280;
  public static final int CAT_DARK = 0xFF474C57;
  public static final int CAT_LIT = 0xFF8B93A3;
  public static final int CAT_EYE = 0xFFE5C36A;
}
