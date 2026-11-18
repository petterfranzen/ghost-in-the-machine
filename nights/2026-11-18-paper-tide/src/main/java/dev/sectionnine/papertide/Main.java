package dev.sectionnine.papertide;

import org.teavm.jso.JSObject;
import org.teavm.jso.typedarrays.Uint32Array;

/** Wiring: the canvas, the pointers, the sound button and the frame loop. */
public final class Main {
  private static final String SOUND_ON = "Sound on";
  private static final String SOUND_OFF = "Sound off";

  private static JSObject canvas;
  private static Screen screen;
  private static World world;
  private static Renderer renderer;
  private static Audio audio;
  private static boolean down;
  private static double downAt;
  private static double moveAt;
  private static double lastFrame;
  private static double frameMs;
  private static boolean fitted;
  private static String statusText = "A small paper boat drifts down the gutter.";

  private Main() {}

  public static void main(String[] args) {
    canvas = Bridge.byId("app");
    Uint32Array pixels = Bridge.wire(canvas);
    screen = new Screen(World.W, World.H, pixels);
    world = new World();
    renderer = new Renderer(screen);
    audio = new Audio();
    if (Bridge.reducedMotion()) {
      world.motion = 0.4;
      world.ringLife = 0.45;
    }
    bindPointer();
    bindKeys();
    bindSound();
    Bridge.onDoc("load", ev -> Bridge.fit(canvas, World.W, World.H));
    Bridge.onDoc("resize", ev -> Bridge.fit(canvas, World.W, World.H));
    Bridge.expose(Main::state, Main::pixelAt, Main::tapAt);
    Bridge.raf(Main::frame);
  }

  private static void bindPointer() {
    Bridge.on(canvas, "pointerdown", ev -> {
      Bridge.prevent(ev);
      Bridge.capture(canvas, ev);
      wakeRememberedSound();
      down = true;
      downAt = Bridge.now();
      moveAt = downAt;
      world.press(worldX(ev), worldY(ev));
    });
    Bridge.on(canvas, "pointermove", ev -> {
      if (!down) {
        return;
      }
      Bridge.prevent(ev);
      double now = Bridge.now();
      double dt = Math.max(0.001, (now - moveAt) / 1000.0);
      moveAt = now;
      world.move(worldX(ev), worldY(ev), dt);
    });
    Bridge.on(canvas, "pointerup", ev -> lift(ev));
    Bridge.on(canvas, "pointercancel", ev -> lift(ev));
    Bridge.on(canvas, "contextmenu", ev -> Bridge.prevent(ev));
    Bridge.onDoc("visibilitychange", ev -> audio.resumeIfNeeded());
  }

  private static void lift(JSObject ev) {
    if (!down) {
      return;
    }
    down = false;
    Bridge.release(canvas, ev);
    world.release(worldX(ev), worldY(ev), (Bridge.now() - downAt) / 1000.0);
  }

  private static void bindKeys() {
    Bridge.on(canvas, "keydown", ev -> {
      String key = Bridge.key(ev);
      if (" ".equals(key) || "Enter".equals(key)) {
        Bridge.prevent(ev);
        world.keyTap();
      }
    });
  }

  private static void bindSound() {
    Bridge.on(Bridge.byId("sound"), "click", ev -> toggleSound());
  }

  private static void toggleSound() {
    boolean want = !audio.on;
    if (want) {
      audio.enable();
    } else {
      audio.mute();
    }
    audio.remember(want);
    Bridge.setText("sound", want ? SOUND_ON : SOUND_OFF);
    Bridge.setAttr("sound", "aria-pressed", want ? "true" : "false");
    Bridge.setAttr("sound", "aria-label", want ? "Sound on" : "Sound off");
    if (want) {
      statusText = "Sound on: rain, water and a warm hum, answering what you touch.";
      Bridge.setText("status", statusText);
    }
  }

  /** The choice is remembered: it starts on the first touch after a reload. */
  private static void wakeRememberedSound() {
    if (audio.created == 0 && !audio.on && audio.remembered()) {
      audio.enable();
      Bridge.setText("sound", SOUND_ON);
      Bridge.setAttr("sound", "aria-pressed", "true");
      Bridge.setAttr("sound", "aria-label", SOUND_ON);
    }
  }

  private static double worldX(JSObject ev) {
    return Bridge.worldX(canvas, Bridge.clientX(ev));
  }

  private static double worldY(JSObject ev) {
    return Bridge.worldY(canvas, Bridge.clientY(ev));
  }

  private static void frame(double time) {
    if (!fitted) {
      fitted = true;
      Bridge.fit(canvas, World.W, World.H);
    }
    double dt = lastFrame == 0.0 ? 1.0 / 60.0 : (time - lastFrame) / 1000.0;
    lastFrame = time;
    if (dt <= 0.0 || dt > 0.05) {
      dt = 1.0 / 60.0;
    }
    world.step(dt);
    double t0 = Bridge.now();
    renderer.draw(world);
    frameMs = Bridge.now() - t0;
    Bridge.present(canvas, World.W, World.H);
    audio.ambient(world);
    drainEvents();
    Bridge.raf(Main::frame);
  }

  /** Sound cues and announcements are drained here, once per frame. */
  private static void drainEvents() {
    Events e = world.events;
    for (int i = 0; i < e.size(); i++) {
      audio.play(e.kindAt(i));
    }
    String say = e.announcement();
    if (say != null) {
      statusText = say;
      Bridge.setText("status", say);
    }
    e.clear();
  }

  private static void tapAt(double x, double y) {
    world.press(x, y);
    world.release(x, y, 0.1);
  }

  private static String pixelAt(double x, double y) {
    int c = screen.at((int) x, (int) y);
    return "[" + ((c >> 16) & 0xFF) + "," + ((c >> 8) & 0xFF) + "," + (c & 0xFF) + "]";
  }

  private static String state() {
    StringBuilder sb = new StringBuilder(220);
    sb.append("{\"t\":").append(round(world.t));
    sb.append(",\"frameMs\":").append(round(frameMs));
    sb.append(",\"rings\":").append(world.rings.size());
    sb.append(",\"rain\":").append(world.rain.size());
    sb.append(",\"impacts\":").append(world.rain.impactsTotal);
    sb.append(",\"boatY\":").append(round(world.boat.y));
    sb.append(",\"boatState\":").append(world.boat.state);
    sb.append(",\"fade\":").append(round(world.boat.fade));
    sb.append(",\"revealed\":").append(world.boat.reveal > 0 ? 1 : 0);
    sb.append(",\"taps\":").append(world.taps);
    sb.append(",\"idle\":").append(round(world.idle));
    sb.append(",\"cat\":").append(world.cat.state);
    sb.append(",\"catY\":").append(round(world.cat.y));
    sb.append(",\"lamp\":").append(round(world.lamp));
    sb.append(",\"swell\":").append(round(world.swell));
    sb.append(",\"speed\":").append(round(world.speed));
    sb.append(",\"flow\":").append(round(world.flow));
    sb.append(",\"motion\":").append(round(world.motion));
    sb.append(",\"audio\":").append(audio.on ? 1 : 0);
    sb.append(",\"ctx\":").append(audio.created);
    sb.append(",\"played\":").append(audio.played);
    sb.append(",\"cssPx\":").append(round(Bridge.cssWidth(canvas)));
    sb.append(",\"status\":\"").append(statusText.replace('"', '\'')).append("\"}");
    return sb.toString();
  }

  private static String round(double v) {
    return String.valueOf(Math.round(v * 100.0) / 100.0);
  }
}
