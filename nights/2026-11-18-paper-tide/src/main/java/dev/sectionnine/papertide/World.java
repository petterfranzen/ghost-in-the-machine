package dev.sectionnine.papertide;

/**
 * The lane at night: a gutter channel between two stone kerbs, rain, a paper
 * boat, leaves, a drain and a cat. Everything here is plain Java with no
 * browser in it, so the whole simulation can be stepped and asserted in a
 * test run in the JVM.
 */
public final class World {
  public static final int W = 180;
  public static final int H = 320;
  public static final int KERB = 12;
  public static final int DRAIN_Y = 288;

  /** How far a touch in the water is felt by the boat, and the hardest shove. */
  private static final double STEER_REACH = 110.0;
  private static final double PUSH = 34.0;

  private static final int NONE = 0;
  private static final int WATER = 1;
  private static final int BOAT = 2;
  private static final int LEAF = 3;
  private static final int GRATE = 4;
  private static final int CAT = 5;
  private static final int DRAG = 6;

  public final Rand rnd = new Rand(20261118);
  public final Events events = new Events();
  public final Ripples rings = new Ripples();
  public final Rain rain = new Rain();
  public final Boat boat = new Boat();
  public final Flotsam flotsam = new Flotsam();
  public final Cat cat = new Cat();
  public final Lanterns lanterns = new Lanterns();
  public final Score score = new Score();

  public double t;
  public double flow;
  public double speed = 8.0;
  public double swell;
  public double idle;
  public double lamp = 0.3;
  public double starsT;
  public double hint;
  public double motion = 1.0;
  public double ringLife = 1.0;
  public int taps;

  /** The warm flare on the hull just after a lantern is gathered. */
  public double glow;

  private int mode = NONE;
  private int heldTarget = -1;
  private double sx;
  private double sy;
  private double px;
  private double py;
  private double moved;
  private double still;
  private double stirAcc;
  private double stirSnd;
  private boolean acted;
  private int stars;
  private double snagCool;

  public World() {
    flotsam.populate(this);
    lanterns.populate(this);
  }

  /** One fixed step of the evening. dt is in seconds, clamped by the host. */
  public void step(double dt) {
    double adt = dt * motion;
    t += dt;
    idle += dt;
    swell = Math.max(0, swell - dt / 7.5);
    speed = 8.0 + 12.0 * swell + 0.7 * Math.sin(t * 0.33);
    flow += speed * adt;
    lamp += (lampTarget() - lamp) * Math.min(1.0, dt * 0.7);
    rain.step(this, adt);
    rings.step(adt, speed, motion);
    flotsam.step(this, adt);
    boat.step(this, adt);
    lanterns.step(this, adt);
    snags(adt);
    cat.step(this, dt);
    glow = Math.max(0, glow - dt * 1.7);
    secretEvening();
    hint = idle > 24 ? Math.min(1.0, (idle - 24) / 6.0) : 0.0;
    if (still > 0) {
      still += dt;
      hold(still);
    }
  }

  private double lampTarget() {
    double calm = Math.min(1.0, idle / 9.0);
    return 0.45 + 0.40 * calm + (cat.present() ? 0.06 : 0.0);
  }

  /** Late in a still evening the water stops moving and the reflection fills. */
  private void secretEvening() {
    if (stars == 0 && starsMayCome()) {
      stars = 1;
      starsT = 13.0;
      events.add(Events.STARS, W * 0.5, H * 0.4, 0);
      events.announce("The water stills, and the reflection fills with stars.");
    }
    if (starsT > 0) {
      starsT -= 1.0 / 60.0;
    }
    if (stars == 1 && idle < 4.0) {
      stars = 0;
    }
  }

  private boolean starsMayCome() {
    return idle > 30 && cat.present() && starsT <= 0;
  }

  public void press(double x, double y) {
    idle = 0;
    sx = x;
    sy = y;
    px = x;
    py = y;
    moved = 0;
    still = 0.001;
    acted = false;
    heldTarget = flotsam.pick(x, y);
    mode = choose(x, y);
    boat.hold = 0;
    cat.shoo();
  }

  private int choose(double x, double y) {
    if (boat.under(x, y)) {
      return BOAT;
    }
    if (heldTarget >= 0) {
      return LEAF;
    }
    if (y > DRAIN_Y) {
      return GRATE;
    }
    if (cat.under(x, y)) {
      return CAT;
    }
    return WATER;
  }

  public void move(double x, double y, double dt) {
    idle = 0;
    double stepLen = Math.abs(x - px) + Math.abs(y - py);
    moved += stepLen;
    if (shouldDrag(x, y)) {
      mode = DRAG;
      acted = true;
      stirSnd = 0.5;
    }
    if (still > 0 && moved > 4.0) {
      still = 0;
    }
    if (mode == DRAG && dt > 0) {
      stir(new Drag(x, y, (x - px) / dt, (y - py) / dt), dt);
    }
    px = x;
    py = y;
  }

  private boolean shouldDrag(double x, double y) {
    if (mode == DRAG || acted) {
      return false;
    }
    double dx = Math.abs(x - sx);
    return dx > 7 && dx > 0.7 * Math.abs(y - sy);
  }

  /** Where a drag is and how fast it is going. */
  private record Drag(double x, double y, double vx, double vy) {
  }

  private void stir(Drag d, double dt) {
    stirAcc += dt;
    if (stirAcc > 0.05) {
      stirAcc = 0;
      rings.spawn(new Ripples.Spec(Ripples.STIR, d.x(), d.y(), 0.55, 13, 1.3 * ringLife));
      flotsam.push(d.x(), d.y(), clamp(d.vx() * 0.05, -26, 26), clamp(d.vy() * 0.02, -2, 2));
      boat.steer(clamp(d.vx() * 0.22, -44, 44) * falloff(d.x(), d.y()));
    }
    stirSnd -= dt;
    if (stirSnd <= 0) {
      stirSnd = 0.45;
      events.add(Events.STIR, d.x(), d.y(), 0.5);
    }
  }

  private static double clamp(double v, double lo, double hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  /** A press held still: the longer gestures live here. */
  private void hold(double seconds) {
    if (mode == BOAT) {
      boat.held(this, seconds);
      return;
    }
    if (seconds < 0.7 || acted) {
      return;
    }
    acted = true;
    heldGesture();
  }

  private void heldGesture() {
    if (mode == LEAF && heldTarget >= 0) {
      flotsam.spin(heldTarget);
      events.add(Events.RUSTLE, sx, sy, 1);
      events.announce("The leaf spins once and settles, riding the current again.");
    } else if (mode == GRATE) {
      well(new Well(sx, sy, 0.5, 22, Events.GLOOP));
    } else if (mode == CAT) {
      cat.hello(this);
    } else {
      well(new Well(sx, sy, 0.9, 34, Events.PLIP));
    }
  }

  /** A slow, wide, deep ring: the water pushed down and let go. */
  private record Well(double x, double y, double amp, double span, int sound) {
  }

  private void well(Well w) {
    rings.spawn(new Ripples.Spec(Ripples.TAP, w.x(), w.y(), w.amp(), w.span(), 3.4 * ringLife));
    rings.spawn(new Ripples.Spec(Ripples.STIR, w.x(), w.y(), w.amp() * 0.6, w.span() * 0.5, 2.0 * ringLife));
    events.add(w.sound(), w.x(), w.y(), 0);
    events.announce("The water gives, slowly, and settles.");
  }

  public void release(double x, double y, double duration) {
    idle = 0;
    still = 0;
    double dist = Math.abs(x - sx) + Math.abs(y - sy);
    if (duration < 0.34 && dist > 42) {
      flick(x - sx, y - sy);
    } else if (mode == DRAG) {
      rings.spawn(new Ripples.Spec(Ripples.STIR, x, y, 0.4, 16, 1.6 * ringLife));
    } else if (!acted) {
      tap(x, y, mode);
    }
    mode = NONE;
    acted = false;
    heldTarget = -1;
  }

  /** A quick swipe: the rain thickens, the current quickens, the hull kicks. */
  private void flick(double dx, double dy) {
    swell = 1.0;
    boat.nudge(clamp(dx * 0.12, -30, 30), 0);
    events.add(Events.SWELL, W * 0.5, 0, 1);
    events.announce("The rain thickens for a moment and the current quickens.");
  }

  private void tap(double x, double y, int target) {
    taps++;
    boat.nudge(steerPush(x, y), target == BOAT ? 0.4 : 0.0);
    if (target == BOAT) {
      rings.spawn(new Ripples.Spec(Ripples.WAKE, boat.x, boat.y - 6, 0.5, 26, 2.0 * ringLife));
      events.add(Events.THUP, x, y, x / W);
    } else if (target == LEAF && heldTarget >= 0) {
      flotsam.spin(heldTarget);
      events.add(Events.RUSTLE, x, y, 0);
    } else if (target == GRATE) {
      grate(x, y);
    } else if (target == CAT) {
      cat.hello(this);
    } else {
      splash(x, y);
    }
  }

  private void splash(double x, double y) {
    rings.spawn(new Ripples.Spec(Ripples.TAP, x, y, 0.85, 28, 2.8 * ringLife));
    events.add(Events.PLIP, x, y, x / W);
    flotsam.push(x, y, 0, 3.0);
  }

  /** How much of a touch at (x, y) the boat feels: full at the hull, nothing far off. */
  private double falloff(double x, double y) {
    double d = Math.abs(x - boat.x) + Math.abs(y - boat.y);
    return d >= STEER_REACH ? 0.0 : 1.0 - d / STEER_REACH;
  }

  /** A tap pushes the water away from your thumb, and the boat with it. */
  private double steerPush(double x, double y) {
    double dx = boat.x - x;
    if (Math.abs(dx) < 0.5) {
      return 0.0;
    }
    return clamp(dx * 0.9, -PUSH, PUSH) * falloff(x, y);
  }

  /** The bow met a lantern: a warm flare, a rising note and the tally. */
  public void catchLantern(double x, double y) {
    score.caught();
    glow = 1.0;
    rings.spawn(new Ripples.Spec(Ripples.TAP, x, y, 0.8, 26, 2.2 * ringLife));
    events.add(Events.CATCH, x, y, Sounds.STEPS[Math.min(score.run - 1, Sounds.STEPS.length - 1)]);
    events.announce(score.tally());
  }

  /** The boat slid under the grate: the run is banked for the next one. */
  public void endRun() {
    score.finish();
    lanterns.release();
    events.announce(score.slip());
  }

  /** A fresh boat is folded, with the last run still on the water. */
  public void startRun() {
    score.restart();
    events.add(Events.FOLD, boat.x, boat.y, 0);
    events.announce(score.fold());
  }

  /** Brushing a mat of leaves drags at the hull for a moment: a snag, no harm. */
  private void snags(double dt) {
    snagCool = Math.max(0, snagCool - dt);
    if (snagCool > 0 || boat.state != Boat.DRIFT) {
      return;
    }
    int hit = flotsam.pick(boat.x, boat.y);
    if (hit < 0) {
      return;
    }
    snagCool = 2.4;
    boat.bump = 1.0;
    flotsam.spin(hit);
    events.add(Events.RUSTLE, boat.x, boat.y, 1);
    events.announce("A mat of leaves drags at the hull, and the boat slows a moment.");
  }

  private void grate(double x, double y) {
    for (int i = 0; i < 3; i++) {
      rings.spawn(new Ripples.Spec(Ripples.DROP, x + rnd.signed() * 10, y - 6 - i * 4, 0.5, 10, 1.4 * ringLife));
    }
    events.add(Events.GLOOP, x, y, 0);
    events.announce("Foam burbles up through the grate.");
  }

  /** The keyboard route: Enter or Space on the canvas is a tap on the water. */
  public void keyTap() {
    press(W * 0.5, H * 0.42);
    still = 0;
    release(W * 0.5, H * 0.42, 0.12);
  }
}
