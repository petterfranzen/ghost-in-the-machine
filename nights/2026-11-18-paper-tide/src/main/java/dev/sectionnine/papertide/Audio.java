package dev.sectionnine.papertide;

import org.teavm.jso.typedarrays.Float32Array;
import org.teavm.jso.webaudio.AudioBuffer;
import org.teavm.jso.webaudio.AudioContext;
import org.teavm.jso.webaudio.AudioParam;
import org.teavm.jso.webaudio.BiquadFilterNode;
import org.teavm.jso.webaudio.DynamicsCompressorNode;
import org.teavm.jso.webaudio.GainNode;
import org.teavm.jso.webaudio.OscillatorNode;
import org.teavm.jso.webaudio.AudioBufferSourceNode;

/**
 * All of the sound, synthesised from oscillators and noise: an ambient bed of
 * rain, water and a warm pad, plus one short voice per interaction. Nothing is
 * built until the sound button is pressed, so nothing plays before that.
 */
public final class Audio {
  private static final double MASTER = 0.62;
  private static final String STORAGE_KEY = "papertide.sound";

  private AudioContext ctx;
  private GainNode master;
  private GainNode voices;
  private GainNode bedRain;
  private GainNode bedWater;
  private GainNode bedPad;
  private AudioBuffer noise;
  private double bedTick;

  public boolean on;
  public int created;
  public int played;

  public boolean remembered() {
    return "on".equals(Bridge.load(STORAGE_KEY));
  }

  public void remember(boolean value) {
    Bridge.store(STORAGE_KEY, value ? "on" : "off");
  }

  /** Presses the button: build the graph, fade the bed in, answer at once. */
  public void enable() {
    if (ctx == null) {
      build();
    }
    if (ctx == null) {
      return;
    }
    if ("suspended".equals(ctx.getState())) {
      ctx.resume();
    }
    on = true;
    double now = ctx.getCurrentTime();
    master.getGain().cancelScheduledValues(now);
    master.getGain().setValueAtTime(0.0001f, now);
    master.getGain().exponentialRampToValueAtTime((float) MASTER, now + 0.35);
    play(0);
  }

  public void mute() {
    on = false;
    if (ctx != null) {
      double now = ctx.getCurrentTime();
      master.getGain().cancelScheduledValues(now);
      master.getGain().setValueAtTime(Math.max(0.0001f, master.getGain().getValue()), now);
      master.getGain().exponentialRampToValueAtTime(0.0001f, now + 0.2);
    }
  }

  public void resumeIfNeeded() {
    if (ctx != null && "suspended".equals(ctx.getState())) {
      ctx.resume();
    }
  }

  private void build() {
    ctx = Bridge.newContext();
    created++;
    DynamicsCompressorNode limiter = ctx.createDynamicsCompressor();
    limiter.getThreshold().setValueAtTime(-14f, 0);
    limiter.getRatio().setValueAtTime(6f, 0);
    limiter.getAttack().setValueAtTime(0.004f, 0);
    limiter.getRelease().setValueAtTime(0.22f, 0);
    limiter.connect(ctx.getDestination());
    master = gain(0.0001);
    master.connect(limiter);
    voices = gain(0.9);
    voices.connect(master);
    noise = noiseBuffer();
    bedRain = bed(1500, "bandpass", 0.9);
    bedWater = bed(330, "lowpass", 0.6);
    bedPad = bed(620, "lowpass", 0.5);
    pad(110, bedPad);
    pad(164.81, bedPad);
  }

  private GainNode gain(double value) {
    GainNode g = ctx.createGain();
    g.getGain().setValueAtTime((float) value, 0);
    return g;
  }

  private BiquadFilterNode filter(String type, double hz, double q, double t0) {
    BiquadFilterNode f = ctx.createBiquadFilter();
    f.setType(type);
    f.getFrequency().setValueAtTime((float) hz, t0);
    f.getQ().setValueAtTime((float) q, t0);
    return f;
  }

  private GainNode bed(double hz, String type, double q) {
    AudioBufferSourceNode src = ctx.createBufferSource();
    src.setBuffer(noise);
    src.setLoop(true);
    BiquadFilterNode f = filter(type, hz, q, 0);
    GainNode g = gain(0.0001);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start();
    return g;
  }

  private void pad(double hz, GainNode out) {
    OscillatorNode o = ctx.createOscillator();
    o.setType("triangle");
    o.getFrequency().setValueAtTime((float) hz, 0);
    o.getDetune().setValueAtTime(7f, 0);
    GainNode g = gain(0.5);
    o.connect(g);
    g.connect(out);
    o.start();
  }

  private AudioBuffer noiseBuffer() {
    int rate = (int) ctx.getSampleRate();
    AudioBuffer buf = ctx.createBuffer(1, rate * 2, rate);
    Float32Array data = buf.getChannelData(0);
    int s = 987654321;
    int len = data.getLength();
    for (int i = 0; i < len; i++) {
      s = s * 1103515245 + 12345;
      data.set(i, (float) (((s >> 17) & 0x3FFF) / 8192.0 - 1.0));
    }
    return buf;
  }

  /** The bed follows the evening: harder rain, quicker water, warmer light. */
  public void ambient(World w) {
    if (!on || ctx == null) {
      return;
    }
    bedTick += 1.0 / 60.0;
    if (bedTick < 0.25) {
      return;
    }
    bedTick = 0;
    double now = ctx.getCurrentTime();
    glide(bedRain.getGain(), 0.09 + 0.20 * w.rain.intensity, now);
    glide(bedWater.getGain(), 0.035 + 0.055 * (w.speed / 20.0), now);
    glide(bedPad.getGain(), 0.03 + 0.05 * w.lamp, now);
  }

  private void glide(AudioParam p, double value, double now) {
    p.setTargetAtTime((float) value, now, 0.5f);
  }

  /** One short voice, a row of numbers out of {@link Sounds}. */
  public void play(int kind) {
    if (!on || ctx == null) {
      return;
    }
    played++;
    double[] v = Sounds.row(kind);
    double t0 = ctx.getCurrentTime() + 0.01;
    switch ((int) v[0]) {
      case Sounds.TONE -> tone(t0, new Tone(v[1], v[2], v[3], v[4], v[5], 0.0, "triangle"));
      case Sounds.NOISE -> noiseVoice(t0, new Noise(v[5], 0, v[3], v[4], v[6], "bandpass"));
      case Sounds.TONE_BRUSH -> toneBrush(t0, v);
      case Sounds.SWEEP -> noiseVoice(t0, new Noise(v[1], v[2], v[3], v[4], 0.8, "bandpass"));
      default -> arpeggio(t0, v[1], (int) v[6], v[4]);
    }
  }

  private void toneBrush(double t0, double[] v) {
    noiseVoice(t0, new Noise(v[5] * 1.6, 0, 0.1, v[4] * 0.7, 0.7, "bandpass"));
    tone(t0, new Tone(v[1], v[2], v[3], v[4], v[5], 0.0, "sine"));
  }

  /** A filtered noise source: a steady brush, or one whose filter sweeps. */
  private record Noise(double lo, double sweepTo, double dur, double peak, double q, String type) {
  }

  /** A filtered oscillator: a plain tone or a short arpeggio step. */
  private record Tone(double f0, double f1, double dur, double peak, double hz, double q, String wave) {
  }

  private void tone(double t0, Tone v) {
    OscillatorNode o = ctx.createOscillator();
    o.setType(v.wave());
    o.getFrequency().setValueAtTime((float) Math.max(20, v.f0()), t0);
    o.getFrequency().exponentialRampToValueAtTime((float) Math.max(20, v.f1()), t0 + v.dur());
    BiquadFilterNode f = filter("lowpass", v.hz(), v.q(), t0);
    GainNode g = gain(0.0001);
    envelope(g.getGain(), t0, v.peak(), v.dur());
    o.connect(f);
    f.connect(g);
    g.connect(voices);
    o.start(t0);
    o.stop(t0 + v.dur() + 0.05);
  }

  private void noiseVoice(double t0, Noise n) {
    AudioBufferSourceNode src = ctx.createBufferSource();
    src.setBuffer(noise);
    src.setLoop(true);
    BiquadFilterNode f = ctx.createBiquadFilter();
    f.setType(n.type());
    f.getQ().setValueAtTime((float) n.q(), t0);
    f.getFrequency().setValueAtTime((float) n.lo(), t0);
    if (n.sweepTo() > 0) {
      f.getFrequency().exponentialRampToValueAtTime((float) n.sweepTo(), t0 + n.dur());
    }
    GainNode g = gain(0.0001);
    envelope(g.getGain(), t0, n.peak(), n.dur());
    src.connect(f);
    f.connect(g);
    g.connect(voices);
    src.start(t0);
    src.stop(t0 + n.dur() + 0.05);
  }

  private void arpeggio(double t0, double f0, int notes, double peak) {
    int count = Math.max(2, Math.min(notes, Sounds.STEPS.length));
    for (int i = 0; i < count; i++) {
      double hz = f0 * Math.pow(2.0, Sounds.STEPS[i] / 12.0);
      tone(t0 + i * 0.11, new Tone(hz, hz * 0.995, 0.55, peak, 4200, 0.4, "sine"));
    }
  }

  private void envelope(AudioParam p, double t0, double peak, double dur) {
    p.setValueAtTime(0.0001f, t0);
    p.exponentialRampToValueAtTime((float) Math.max(0.0002, peak), t0 + 0.015);
    p.exponentialRampToValueAtTime(0.0001f, t0 + dur);
  }

}
