package dev.sectionnine.papertide;

/**
 * Every one-shot voice as a row of numbers, so the shapes stay in one table:
 * shape, start Hz, end Hz, seconds, gain, filter Hz, notes or Q.
 * Shapes: 0 tone glide, 1 filtered noise, 2 tone plus brush, 3 arpeggio,
 * 4 noise sweep.
 */
public final class Sounds {
  private Sounds() {}

  public static final int TONE = 0;
  public static final int NOISE = 1;
  public static final int TONE_BRUSH = 2;
  public static final int ARPEGGIO = 3;
  public static final int SWEEP = 4;

  public static final double[][] VOICE = {
    /* CHIME  */ { ARPEGGIO, 1046, 1568, 0.30, 0.11, 4000, 2 },
    /* PLIP   */ { TONE, 900, 360, 0.26, 0.15, 2600, 0 },
    /* STIR   */ { NOISE, 0, 0, 0.34, 0.06, 700, 0.9 },
    /* RUSTLE */ { NOISE, 0, 0, 0.12, 0.05, 2800, 1.4 },
    /* THUP   */ { TONE_BRUSH, 520, 430, 0.50, 0.11, 900, 0 },
    /* GLOOP  */ { TONE, 240, 78, 0.42, 0.15, 700, 0 },
    /* MEOW   */ { TONE, 980, 620, 0.55, 0.09, 2200, 0 },
    /* REVEAL */ { ARPEGGIO, 880, 1319, 0.42, 0.09, 3600, 3 },
    /* FOLD   */ { TONE_BRUSH, 392, 330, 0.45, 0.09, 800, 0 },
    /* SWELL  */ { SWEEP, 900, 1800, 1.10, 0.09, 1500, 0 },
    /* PAW    */ { TONE, 420, 170, 0.36, 0.11, 900, 0 },
    /* STARS  */ { ARPEGGIO, 659, 1319, 0.60, 0.07, 3600, 4 },
    /* GONE   */ { TONE_BRUSH, 300, 110, 0.50, 0.10, 600, 0 },
    /* CATCH  */ { ARPEGGIO, 784, 1175, 0.34, 0.11, 4200, 3 }
  };

  /** Semitone offsets for the arpeggio voices: a pentatonic ladder upwards. */
  public static final double[] STEPS = { 0, 3, 5, 7, 10, 12 };

  public static double[] row(int kind) {
    int i = kind < 0 || kind >= VOICE.length ? 1 : kind;
    return VOICE[i];
  }
}
