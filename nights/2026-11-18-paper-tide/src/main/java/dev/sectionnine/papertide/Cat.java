package dev.sectionnine.papertide;

/** A cat that comes to the kerb when the lane is left alone, and watches. */
public final class Cat {
  public static final int AWAY = 0;
  public static final int WALKING = 1;
  public static final int SITTING = 2;
  public static final int PAW = 3;
  public static final int LEAVING = 4;

  private static final double PERCH = 168.0;
  private static final double HOME = -14.0;

  public int state = AWAY;
  public double x = World.W - 6;
  public double y = HOME;
  public double blink;
  public double blinkT = 2.0;
  public double since;

  public boolean present() {
    return state == SITTING || state == PAW || state == WALKING;
  }

  public int frame() {
    if (state == PAW) {
      return 2;
    }
    return blink < 0.16 ? 1 : 0;
  }

  public boolean under(double px, double py) {
    return state == SITTING && Math.abs(px - x) < 8 && Math.abs(py - y) < 9;
  }

  public void shoo() {
    if (state == WALKING) {
      state = LEAVING;
    }
  }

  public void hello(World w) {
    blink = 0.3;
    w.events.add(Events.MEOW, x, y, 1);
    w.events.announce("The cat blinks and answers, softly.");
  }

  public void step(World w, double dt) {
    since += dt;
    blinkT -= dt;
    if (blinkT <= 0) {
      blinkT = w.rnd.range(1.6, 5.5);
      blink = 0.16;
    }
    blink = Math.max(0, blink - dt);
    walk(w, dt);
  }

  private void walk(World w, double dt) {
    switch (state) {
      case WALKING -> arrive(dt);
      case SITTING -> sit(w);
      case PAW -> pause(w);
      case LEAVING -> leave(dt);
      default -> arriveFromAway(w);
    }
  }

  private void arriveFromAway(World w) {
    if (w.idle > 16) {
      state = WALKING;
      y = HOME;
      since = 0;
      w.events.announce("A cat pads along the kerb and sits down to watch the boat.");
    }
  }

  private void arrive(double dt) {
    y += 26 * dt;
    if (y >= PERCH) {
      y = PERCH;
      state = SITTING;
      since = 0;
    }
  }

  private void sit(World w) {
    if (w.idle > 34 && since > 12) {
      state = PAW;
      since = 0;
      w.events.add(Events.PAW, x - 6, y + 4, 0);
      w.events.announce("The cat dips a paw; rings cross the channel.");
      return;
    }
    if (w.idle < 1.2 && since > 6) {
      state = LEAVING;
    }
  }

  private void pause(World w) {
    if (since > 3.0) {
      state = SITTING;
      since = 0;
    } else if (w.idle < 1.2 && since > 6) {
      state = LEAVING;
    }
  }

  private void leave(double dt) {
    y -= 30 * dt;
    if (y < HOME) {
      state = AWAY;
      since = 0;
    }
  }
}
