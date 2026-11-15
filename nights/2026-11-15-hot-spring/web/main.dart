// Steam Spring — a pixel-art mountain hot spring at night, in Dart.
// Compiled to JavaScript with `dart compile js`.
import 'dart:async';
import 'dart:html';
import 'dart:js_interop';
import 'dart:math' as math;

// A read-only probe the smoke check can call to watch the snow respond.
@JS('steamSpringSnow')
external set _snowProbe(JSFunction f);

// ---------------------------------------------------------------- web audio --
extension type AudioParam._(JSObject _) implements JSObject {
  external void setValueAtTime(double v, double t);
  external void linearRampToValueAtTime(double v, double t);
  external void exponentialRampToValueAtTime(double v, double t);
  external void setTargetAtTime(double v, double t, double tc);
  external void cancelScheduledValues(double t);
  external double get value;
  external set value(double v);
}
extension type AudioNode._(JSObject _) implements JSObject {
  external void connect(AudioNode dest);
  external void disconnect();
}
extension type GainNode._(JSObject _) implements AudioNode {
  external GainNode();
  external AudioParam get gain;
}
extension type OscNode._(JSObject _) implements AudioNode {
  external AudioParam get frequency;
  external AudioParam get detune;
  external set type(String t);
  external void start([double? when]);
  external void stop([double? when]);
}
extension type FilterNode._(JSObject _) implements AudioNode {
  external AudioParam get frequency;
  external AudioParam get Q;
  external AudioParam get gain;
  external set type(String t);
}
extension type CompNode._(JSObject _) implements AudioNode {
  external AudioParam get threshold;
  external AudioParam get knee;
  external AudioParam get ratio;
  external AudioParam get attack;
  external AudioParam get release;
}
extension type PanNode._(JSObject _) implements AudioNode {
  external AudioParam get pan;
}
extension type AudioBuffer._(JSObject _) implements JSObject {
  external int get numberOfChannels;
  external double get duration;
  external JSFloat32Array getChannelData(int channel);
}
extension type BufSrc._(JSObject _) implements AudioNode {
  external set buffer(AudioBuffer b);
  external set loop(bool v);
  external void start([double? when]);
  external void stop([double? when]);
}
@JS('AudioContext')
extension type AudioCtx._(JSObject _) implements JSObject {
  external factory AudioCtx();
  external String get state;
  external double get currentTime;
  external AudioNode get destination;
  external JSPromise resume();
  external JSPromise suspend();
  external GainNode createGain();
  external OscNode createOscillator();
  external FilterNode createBiquadFilter();
  external BufSrc createBufferSource();
  external CompNode createDynamicsCompressor();
  external PanNode createStereoPanner();
  external AudioBuffer createBuffer(int ch, int len, double rate);
}

class _Layer {
  final OscNode osc;
  final AudioParam gain;
  final int i;
  _Layer(this.osc, this.gain, this.i);
}

/// A small synthesised sound world: three ambient layers that run while sound
/// is on, plus one short voice per interaction. Oscillators, noise and
/// envelopes only — no samples anywhere.
class Synth {
  AudioCtx? _ctx;
  GainNode? _master;
  final List<_Layer> _layers = <_Layer>[];
  bool on = false;
  math.Random rnd = math.Random(7);
  bool get ready => _ctx != null;
  double get _t => _ctx!.currentTime;

  AudioCtx _ensure() {
    var c = _ctx;
    if (c != null) return c;
    c = AudioCtx();
    final comp = c.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 24;
    comp.ratio.value = 5;
    comp.attack.value = 0.006;
    comp.release.value = 0.30;
    comp.connect(c.destination);
    final m = c.createGain();
    m.gain.value = 0.0;
    m.connect(comp);
    _ctx = c;
    _master = m;
    _buildLayers(c, m);
    return c;
  }

  AudioBuffer _noise(AudioCtx c, double seconds) {
    final buf = c.createBuffer(1, (44100 * seconds).round(), 44100.0);
    final d = buf.getChannelData(0).toDart;
    var last = 0.0;
    for (var i = 0; i < d.length; i++) {
      final w = rnd.nextDouble() * 2 - 1;
      last = (last + 0.028 * w) / 1.028;   // brown-ish: soft, good for water
      d[i] = (last * 3.2).clamp(-1.0, 1.0);
    }
    return buf;
  }

  void _lfo(AudioCtx c, AudioParam p, double rate, double lo, double hi) {
    final o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = rate;
    final g = c.createGain();
    g.gain.value = (hi - lo) / 2;
    o.connect(g);
    final JSObject raw = p;
    g.connect(raw as AudioNode);
    o.start();
  }

  void _buildLayers(AudioCtx c, GainNode master) {
    final water = c.createBufferSource();
    water.buffer = _noise(c, 3.0);
    water.loop = true;
    final wf = c.createBiquadFilter();
    wf.type = 'lowpass';
    wf.frequency.value = 520;
    final wg = c.createGain();
    wg.gain.value = 0.16;
    water.connect(wf); wf.connect(wg); wg.connect(master);
    _lfo(c, wg.gain, 0.09, 0.05, 0.16);
    water.start();

    final wind = c.createBufferSource();
    wind.buffer = _noise(c, 4.0);
    wind.loop = true;
    final wnf = c.createBiquadFilter();
    wnf.type = 'bandpass';
    wnf.frequency.value = 880;
    wnf.Q.value = 0.7;
    final wng = c.createGain();
    wng.gain.value = 0.05;
    wind.connect(wnf); wnf.connect(wng); wng.connect(master);
    _lfo(c, wng.gain, 0.05, 0.02, 0.05);
    _lfo(c, wnf.frequency, 0.03, 700, 900);
    wind.start();

    for (var i = 0; i < 3; i++) {
      final o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.value = 110.0 * (i == 0 ? 1.0 : (i == 1 ? 1.5 : 2.0));
      o.detune.value = (i - 1) * 6.0;
      final f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 620;
      final g = c.createGain();
      g.gain.value = 0.0;
      o.connect(f); f.connect(g); g.connect(master);
      _lfo(c, g.gain, 0.021 + i * 0.004, 0.03, 0.052);
      o.start();
      _layers.add(_Layer(o, g.gain, i));
    }
  }

  /// The pad drifts up as the scene warms (lanterns lit, stillness long).
  void setWarmth(double t) {
    final c = _ctx;
    if (c == null) return;
    final base = 110.0 * math.pow(2, (t * 2.0).round() / 12.0);
    for (final l in _layers) {
      final mul = l.i == 0 ? 1.0 : (l.i == 1 ? 1.5 : 2.0);
      l.osc.frequency.setTargetAtTime(base * mul, _t, 1.6);
    }
  }

  Future<void> enable() async {
    final c = _ensure();
    final m = _master!;
    on = true;
    try { await c.resume().toDart; } catch (_) {}
    m.gain.cancelScheduledValues(_t);
    m.gain.setValueAtTime(m.gain.value < 0.001 ? 0.001 : m.gain.value, _t);
    m.gain.linearRampToValueAtTime(0.55, _t + 0.30);
    bell(660, 0.30, 1.4);
    bell(990, 0.20, 1.9);
  }

  Future<void> disable() async {
    final c = _ctx;
    if (c == null) return;
    on = false;
    final m = _master!;
    m.gain.cancelScheduledValues(_t);
    m.gain.setValueAtTime(m.gain.value < 0.001 ? 0.001 : m.gain.value, _t);
    m.gain.linearRampToValueAtTime(0.0001, _t + 0.25);
  }

  Future<void> resumeIfOn() async {
    final c = _ctx;
    if (c == null) return;
    if (!on) return;
    try { await c.resume().toDart; } catch (_) {}
  }

  void _voice(double vol, double pan, void Function(AudioNode out) build, double dur) {
    final c = _ctx;
    if (c == null) return;
    if (!on) return;
    final p = c.createStereoPanner();
    p.pan.value = clamp(pan, -1.0, 1.0);
    p.connect(_master!);
    build(p);
  }

  /// Pitched pluck — the voice of a thumb on water.
  void pluck(double freq, double vol, double dur, double pan) {
    _voice(vol, pan, (out) {
      final c = _ctx!;
      final o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, _t);
      final o2 = c.createOscillator();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(freq * 2.01, _t);
      final g = c.createGain();
      g.gain.setValueAtTime(vol, _t);
      g.gain.exponentialRampToValueAtTime(0.0001, _t + dur);
      final g2 = c.createGain();
      g2.gain.setValueAtTime(vol * 0.3, _t);
      g2.gain.exponentialRampToValueAtTime(0.0001, _t + dur * 0.45);
      o.connect(g); g.connect(out);
      o2.connect(g2); g2.connect(out);
      o.start(); o2.start();
      o.stop(_t + dur + 0.05); o2.stop(_t + dur + 0.05);
    }, dur);
  }

  /// Soft bell — lanterns and the confirming chime when sound comes on.
  void bell(double freq, double vol, double dur) {
    _voice(vol, 0.0, (out) {
      final c = _ctx!;
      final parts = <double>[1.0, 2.76, 5.40];
      for (var i = 0; i < parts.length; i++) {
        final o = c.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq * parts[i], _t);
        final g = c.createGain();
        g.gain.setValueAtTime(vol / (1 + i * 1.8), _t);
        g.gain.exponentialRampToValueAtTime(0.0001, _t + dur * (1 - i * 0.22));
        o.connect(g); g.connect(out);
        o.start(); o.stop(_t + dur + 0.05);
      }
    }, dur);
  }

  /// Water noise — a splash at a tap, a hush when the snow shifts.
  void hush(double vol, double cutoff, double dur, double pan) {
    _voice(vol, pan, (out) {
      final c = _ctx!;
      final n = c.createBufferSource();
      n.buffer = _noise(c, dur + 0.1);
      n.loop = true;
      final f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = cutoff;
      final g = c.createGain();
      g.gain.setValueAtTime(vol, _t);
      g.gain.exponentialRampToValueAtTime(0.0001, _t + dur);
      n.connect(f); f.connect(g); g.connect(out);
      n.start(); n.stop(_t + dur + 0.05);
    }, dur);
  }

  /// A small breathy squeak for the monkey.
  void chirp(double freq, double vol) {
    _voice(vol, 0.0, (out) {
      final c = _ctx!;
      final o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, _t);
      o.frequency.linearRampToValueAtTime(freq * 1.5, _t + 0.05);
      o.frequency.linearRampToValueAtTime(freq * 0.9, _t + 0.13);
      final g = c.createGain();
      g.gain.setValueAtTime(0.0001, _t);
      g.gain.linearRampToValueAtTime(vol, _t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, _t + 0.16);
      o.connect(g); g.connect(out);
      o.start(); o.stop(_t + 0.2);
    }, 0.2);
  }
}

// ------------------------------------------------------------------ palette --
String rgba(int r, int g, int b, [double a = 1.0]) {
  int c(int v) => v < 0 ? 0 : (v > 255 ? 255 : v);
  return 'rgba(${c(r)},${c(g)},${c(b)},${a.toStringAsFixed(3)})';
}

/// Night palette: deep indigo sky, cold snow, warm lantern amber, teal water.
class Pal {
  static const List<List<int>> skyStops = [
    [11, 16, 40], [16, 22, 52], [22, 29, 66], [31, 38, 82], [44, 50, 96],
    [62, 66, 112]
  ];
  static const List<int> mountainFar = [46, 52, 90];
  static const List<int> mountainNear = [28, 33, 62];
  static const List<int> pine = [17, 21, 42];
  static const List<int> snowLit = [198, 208, 236];
  static const List<int> snowMid = [146, 158, 194];
  static const List<int> snowDim = [96, 106, 146];
  static const List<int> rock = [76, 77, 96];
  static const List<int> rockLit = [118, 114, 130];
  static const List<int> rockDark = [46, 47, 64];
  static const List<int> waterDeep = [16, 42, 60];
  static const List<int> waterMid = [28, 78, 92];
  static const List<int> waterLit = [58, 140, 140];
  static const List<int> waterShine = [190, 242, 230];
  static const List<int> fur = [128, 110, 98];
  static const List<int> furDark = [84, 71, 64];
  static const List<int> skin = [206, 168, 132];
  static const List<int> amber = [255, 190, 116];
  static const List<int> amberDeep = [236, 140, 76];
  static const List<int> koi = [246, 236, 210];
  static const List<int> koiMark = [228, 116, 96];
  static const List<int> crane = [234, 240, 252];
  static const List<int> craneRed = [212, 82, 74];
  static const List<int> moon = [236, 240, 216];
  static List<int> shade(List<int> c, double f) =>
      [(c[0] * f).round(), (c[1] * f).round(), (c[2] * f).round()];
  static const List<List<int>> lantern = [
    [255, 216, 154], [255, 176, 96], [230, 132, 68]
  ];
}

// --------------------------------------------------------------------- utils --
double clamp(double v, double lo, double hi) => v < lo ? lo : (v > hi ? hi : v);
double lerp(double a, double b, double t) => a + (b - a) * t;

class Rng {
  int s;
  Rng(int seed) : s = seed % 2147483647;
  double next() {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648.0;
  }
  double range(double a, double b) => a + (b - a) * next();
  int intRange(int a, int b) => a + (next() * (b - a + 1)).floor();
}

void fillEllipse(CanvasRenderingContext2D g, double cx, double cy, double rx, double ry,
    String color) {
  if (rx <= 0 || ry <= 0) return;
  g.fillStyle = color;
  final y0 = (cy - ry).floor();
  final y1 = (cy + ry).ceil();
  for (var y = y0; y <= y1; y++) {
    final dy = (y + 0.5 - cy) / ry;
    final k = 1.0 - dy * dy;
    if (k <= 0) continue;
    final dx = rx * math.sqrt(k);
    g.fillRect((cx - dx).floorToDouble(), y.toDouble(), (dx * 2).ceilToDouble(), 1);
  }
}

void px(CanvasRenderingContext2D g, double x, double y, double w, double h, String color) {
  g.fillStyle = color;
  g.fillRect(x.floorToDouble(), y.floorToDouble(), w, h);
}

/// Deterministic smooth 1-D value noise, for ridges and mountains.
class Noise1D {
  final List<double> _v = [];
  Noise1D(int n, int seed) {
    final r = Rng(seed);
    for (var i = 0; i < n; i++) _v.add(r.next());
  }
  double at(double x) {
    final n = _v.length;
    final i = x.floor();
    final t = x - i;
    final a = _v[((i % n) + n) % n];
    final b = _v[(((i + 1) % n) + n) % n];
    final s = t * t * (3 - 2 * t);
    return a + (b - a) * s;
  }
  double fbm(double x, int octaves) {
    var sum = 0.0, amp = 1.0, freq = 1.0, norm = 0.0;
    for (var o = 0; o < octaves; o++) {
      sum += at(x * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.0;
    }
    return sum / norm;
  }
}

// ------------------------------------------------------------------ entities --
class Lantern {
  final double x, y;
  bool lit = false;
  double glow = 0, flare = 0;
  Lantern(this.x, this.y);
}

/// One generic particle: steam (0), snow (1), splash drop (2), firefly (3).
class Part {
  int kind;
  double x, y, vx, vy, age, life, size;
  Part(this.kind, this.x, this.y, this.vx, this.vy, this.life, this.size) : age = 0;
}

class Ripple {
  double x, y, age, life, strength;
  bool deep;
  Ripple(this.x, this.y, this.strength, this.deep) : age = 0, life = 1.4 + strength * 1.1;
}

class _Spot {
  final double x, y;
  final double s;
  const _Spot(this.x, this.y, this.s);
}

// --------------------------------------------------------------------- scene --
class Scene {
  final CanvasElement canvas;
  final CanvasRenderingContext2D ctx;
  final Synth synth = Synth();
  CanvasElement buf = CanvasElement();
  CanvasRenderingContext2D g = CanvasElement().context2D;
  CanvasElement bg = CanvasElement();
  CanvasRenderingContext2D bgg = CanvasElement().context2D;

  double W = 0, H = 0, u = 2, vw = 0, vh = 0;
  double t = 0, lastInput = 0, still = 0, calm = 0;

  // layout
  double horizon = 0, poolCx = 0, poolCy = 0, poolRx = 0, poolRy = 0;
  double snowGroundY = 0;
  List<double> stars = [];
  List<_Spot> rocks = [];
  List<Lantern> lanterns = [];
  List<double> pines = [];

  // particles and marks
  final List<Part> parts = [];
  final List<Ripple> ripples = [];
  final List<List<double>> pebbles = [];
  final List<double> marks = [];      // fading dashes where a thumb has been
  final List<Part> glows = [];        // fireflies
  final List<double> mounds = [];     // packed snow, left behind on purpose

  // weather and mood
  double snowTarget = 0.45, snowAmt = 0.45, windX = 0.0, warm = 0.0;
  double snowDepth = 0.0, glowPool = 0.0;

  // a rare gift for anyone who keeps watching
  bool meteorOn = false;
  double meteorWait = 26, meteorX = 0, meteorY = 0, meteorVX = 0, meteorVY = 0, meteorAge = 0;

  // the monkey
  double mLook = 0, mFace = 1, mBlink = 6, mBob = 0, mCap = 0, mShake = 0, mReact = 0;
  double mDrowsy = 0;

  // hidden things
  double koiState = 0, koiA = 0, koiAge = 0, koiX = 0, koiY = 0;
  double craneState = 0, craneAge = 0, craneX = 0, craneY = 0, craneWing = 0;

  // tap rhythm (five unhurried taps call the koi early)
  List<double> tapTimes = [];

  bool dragging = false;
  // a user who asked for less motion still gets the world, just a stiller one
  bool reduceMotion = false;
  double dragX = 0, dragY = 0;
  double _pressX = 0, _pressY = 0;
  double _pressT = 0;
  bool _longFired = false;
  Lantern? _pressLantern;

  final Rng rng = Rng(20261115);

  Scene(this.canvas) : ctx = canvas.context2D;

  void start() {
    layout();
    _seedAmbient();
    try {
      final mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      reduceMotion = mq.matches;
      mq.onChange.listen((_) => reduceMotion = mq.matches);
    } catch (_) {}
    window.requestAnimationFrame(_frame);
  }

  // ------------------------------------------------------------------ layout --
  void layout() {
    W = (window.innerWidth ?? 0).toDouble();
    H = (window.innerHeight ?? 0).toDouble();
    canvas.width = W.toInt();
    canvas.height = H.toInt();
    canvas.style
      ..width = '${W.toInt()}px'
      ..height = '${H.toInt()}px';
    var unit = (H / 200).roundToDouble();
    if (unit < 2) unit = 2;
    final cap = (W / 120).floorToDouble();
    if (cap >= 2) {
      if (unit > cap) unit = cap;
    }
    u = unit;
    vw = (W / u).ceilToDouble();
    vh = (H / u).ceilToDouble();
    buf = CanvasElement(width: vw.toInt(), height: vh.toInt());
    g = buf.context2D;
    bg = CanvasElement(width: vw.toInt(), height: vh.toInt());
    bgg = bg.context2D;
    g.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    horizon = (vh * 0.46).roundToDouble();
    poolCy = horizon + (vh - horizon) * 0.52;
    poolRy = math.min((vh - horizon) * 0.36, vw * 0.22);
    poolRx = math.min(vw * 0.44, poolRy * 2.1);
    poolCx = vw / 2;
    snowGroundY = horizon + 1;

    if (stars.isEmpty) {
      final r = Rng(99);
      for (var i = 0; i < 70; i++) {
        stars.add(r.range(0, vw));
        stars.add(r.range(2, horizon * 0.92));
        stars.add(r.range(0, math.pi * 2));
      }
    }
    _buildSolid();
    _seedAmbient();
    _prerenderBg();
    _bakeStars();
  }

  void _buildSolid() {
    final wasLit = lanterns.map((l) => l.lit).toList();
    rocks = [];
    lanterns = [];
    pines = [];
    final r = Rng(4242);
    // pines along the ridge
    for (var i = 0; i < (vw / 26).ceil() + 2; i++) {
      pines.add(r.range(0, vw));
    }
    // rocks around the pool rim
    for (var i = 0; i < 26; i++) {
      final a = r.range(0, math.pi * 2);
      final rx = poolRx + r.range(2.0, 5.0);
      final ry = poolRy + r.range(1.0, 3.0);
      rocks.add(_Spot(poolCx + math.cos(a) * rx, poolCy + math.sin(a) * ry,
          r.range(1.2, 3.4)));
    }
    // three stone lanterns: left, right, far side
    for (final a in <double>[math.pi * 0.80, math.pi * 0.20, -math.pi / 2]) {
      lanterns.add(Lantern(poolCx + math.cos(a) * (poolRx + 7.0),
          poolCy + math.sin(a) * (poolRy + 5.0)));
    }
    for (var i = 0; i < lanterns.length; i++) {
      if (i < wasLit.length) lanterns[i].lit = wasLit[i];
    }
  }

  void _seedAmbient() {
    for (var i = 0; i < 90; i++) {
      _spawnFlake(fromTop: true);
    }
    for (var i = 0; i < 34; i++) {
      _spawnPuff(steam: true);
    }
  }

  void _spawnFlake({bool fromTop = false}) {
    final r = rng;
    parts.add(Part(1, r.range(-4, vw + 4), fromTop ? r.range(-vh, 0) : -2,
        r.range(-2, 2), r.range(6, 16), 1e9, r.range(0.6, 1.6)));
  }

  void _spawnPuff({bool steam = false}) {
    final a = rng.range(0, math.pi * 2);
    final k = math.sqrt(rng.next());
    final x = poolCx + math.cos(a) * poolRx * k * 0.95;
    final y = poolCy + math.sin(a) * poolRy * k * 0.8;
    parts.add(Part(0, x, y - 0.5, rng.range(-1.8, 1.8), -rng.range(7.0, 14.0),
        rng.range(4.5, 8.5), rng.range(1.8, 3.4)));
  }

  // ------------------------------------------------------------- prerendered --
  List<int> _ramp(List<List<int>> stops, double f) {
    f = clamp(f, 0.0, 0.9999) * (stops.length - 1);
    final i = f.floor();
    final k = f - i;
    final a = stops[i], b = stops[math.min(i + 1, stops.length - 1)];
    return [(lerp(a[0].toDouble(), b[0].toDouble(), k)).round(),
            (lerp(a[1].toDouble(), b[1].toDouble(), k)).round(),
            (lerp(a[2].toDouble(), b[2].toDouble(), k)).round()];
  }

  void strokeEllipse(CanvasRenderingContext2D c, double cx, double cy, double rx,
      double ry, double th, String col, {double a0 = 0, double a1 = math.pi * 2}) {
    final steps = math.max(40, ((rx + ry) * 1.7).round());
    c.fillStyle = col;
    for (var i = 0; i <= steps; i++) {
      final a = a0 + (a1 - a0) * i / steps;
      final x = cx + math.cos(a) * rx;
      final y = cy + math.sin(a) * ry;
      c.fillRect(x.floorToDouble(), y.floorToDouble(), th, th);
    }
  }

  void _pine(CanvasRenderingContext2D c, double x, double baseY, double h) {
    px(c, x - 0.5, baseY - h * 0.16, 1, h * 0.16 + 1, rgba(28, 24, 30));
    for (var i = 0; i < 3; i++) {
      final ly = baseY - h * 0.16 - i * h * 0.26;
      final w = h * (0.40 - i * 0.09);
      final col = rgba(Pal.pine[0], Pal.pine[1], Pal.pine[2]);
      c.fillStyle = col;
      for (var dy = 0.0; dy < h * 0.30; dy += 1) {
        final ww = w * (1 - dy / (h * 0.30));
        c.fillRect((x - ww).floorToDouble(), (ly - dy).floorToDouble(),
            (ww * 2).ceilToDouble(), 1);
      }
      // a dusting of snow on the left of each tier
      c.fillStyle = rgba(150, 160, 196, 0.30);
      for (var dy = 0.0; dy < math.min(2.0, h * 0.10); dy += 1) {
        final ww = w * (1 - (dy + 2) / (h * 0.30));
        c.fillRect((x - ww).floorToDouble(), (ly - h * 0.30 + dy).floorToDouble(),
            (ww * 0.6).ceilToDouble(), 1);
      }
    }
  }

  void _prerenderBg() {
    final c = bgg;
    c.clearRect(0, 0, vw, vh);
    // sky
    final bands = 48;
    for (var i = 0; i < bands; i++) {
      final f = i / (bands - 1);
      final col = _ramp(Pal.skyStops, f);
      px(c, 0, f * horizon, vw, horizon / bands + 1, rgba(col[0], col[1], col[2]));
    }
    // moon and its halo
    final mx = vw * 0.74, my = horizon * 0.30;
    for (var i = 6; i >= 1; i--) {
      fillEllipse(c, mx, my, 3 + i * 2.6, 3 + i * 2.6,
          rgba(220, 228, 250, 0.05 + i * 0.006));
    }
    fillEllipse(c, mx, my, 4.4, 4.4, rgba(Pal.moon[0], Pal.moon[1], Pal.moon[2], 0.92));
    fillEllipse(c, mx + 1.4, my - 0.8, 1.1, 1.1, rgba(214, 220, 196, 0.75));
    fillEllipse(c, mx - 1.2, my + 1.4, 0.9, 0.9, rgba(214, 220, 196, 0.6));

    // two mountain ridges
    final far = Noise1D(64, 11), near = Noise1D(48, 5);
    for (var x = 0; x < vw; x++) {
      final xf = x.toDouble();
      final yFar = horizon - 8 - far.fbm(xf * 0.055, 4) * 26;
      px(c, xf, yFar, 1, horizon - yFar + 2,
          rgba(Pal.mountainFar[0], Pal.mountainFar[1], Pal.mountainFar[2]));
      final yNear = horizon - 2 - near.fbm(xf * 0.085 + 3, 4) * 15;
      px(c, xf, yNear, 1, horizon - yNear + 2,
          rgba(Pal.mountainNear[0], Pal.mountainNear[1], Pal.mountainNear[2]));
      // moonlight along the crest, so the ridge is not a flat band
      px(c, xf, yNear, 1, 1, rgba(148, 160, 202, 0.45));
      px(c, xf, yNear + 1, 1, 1, rgba(96, 108, 152, 0.30));
    }
    // snow lines on the far ridge
    final snowFar = Noise1D(64, 11);
    for (var x = 0; x < vw; x++) {
      final xf = x.toDouble();
      final yFar = horizon - 8 - snowFar.fbm(xf * 0.055, 4) * 26;
      if (yFar < horizon - 22) {
        px(c, xf, yFar, 1, 1, rgba(96, 104, 140, 0.55));
      }
    }
    for (final px0 in pines) {
      final yNear = horizon - 2 - near.fbm(px0 * 0.085 + 3, 4) * 15;
      if (px0 > 3) _pine(c, px0, yNear + 1, 13 + (px0 * 7 % 8));
    }

    // snow ground: a soft lit field. Every column carries its own tone, so it
    // reads as snow rather than as horizontal bands.
    for (var x = 0; x < vw; x++) {
      final xf = x.toDouble();
      final gy = snowGroundY +
          (near.fbm(xf * 0.05 + 9, 3) - 0.5) * 9 +
          (near.fbm(xf * 0.23 + 40, 2) - 0.5) * 3;
      final depth = vh - gy;
      const n = 14;
      final tone = (near.fbm(xf * 0.13 + 31, 3) - 0.5) * 0.16;
      for (var i = 0; i < n; i++) {
        final f = i / (n - 1);
        final jitter = (near.fbm(xf * 0.31 + i * 2.3, 2) - 0.5) * 0.10;
        final col = _ramp(<List<int>>[Pal.snowDim, Pal.snowMid, Pal.snowLit],
            clamp(f * 0.88 + tone + jitter, 0.0, 1.0));
        px(c, xf, gy + depth * f * 0.97, 1, depth / n + 1.5,
            rgba(col[0], col[1], col[2]));
      }
      // the ridge casts a little shade, and the snow catches the moon
      px(c, xf, gy - 1.0, 1, 1.5, rgba(190, 202, 234, 0.30));
      px(c, xf, gy + 0.5, 1, 3.0, rgba(48, 58, 92, 0.30));
    }
    final dr = Rng(777);
    // drifts, and the low sunless side of each one
    for (var i = 0; i < 13; i++) {
      final dx = dr.range(-16, vw + 16);
      final dy = dr.range(snowGroundY + 30, vh - 4);
      final w = dr.range(26, 74), h = dr.range(4, 11);
      for (var k = 5; k >= 1; k--) {
        fillEllipse(c, dx + k * 1.2, dy + h * 0.5, w * (0.7 + k * 0.06),
            h * (0.3 + k * 0.14), rgba(90, 102, 144, 0.055));
      }
      fillEllipse(c, dx, dy, w, h, rgba(176, 188, 224, 0.16));
      fillEllipse(c, dx, dy - h * 0.4, w * 0.9, h * 0.5, rgba(218, 228, 252, 0.22));
    }
    // a fine speckle: the grain of cold, dry snow
    for (var i = 0; i < 3000; i++) {
      final sx = dr.range(0, vw), sy = dr.range(snowGroundY + 2, vh);
      final b = dr.next();
      px(c, sx, sy, 1, 1,
          b < 0.5 ? rgba(210, 220, 246, 0.42) : rgba(118, 130, 172, 0.34));
    }
    // the spring keeps its own cool shadow, and a ring of melt
    for (var i = 10; i >= 1; i--) {
      fillEllipse(c, poolCx, poolCy + 2, poolRx + i * 2.1, poolRy + i * 1.5,
          rgba(28, 38, 62, 0.030));
    }

    // the spring basin: dark stone ring, then the water sits inside it
    fillEllipse(c, poolCx, poolCy, poolRx + 2.4, poolRy + 2.4,
        rgba(Pal.rockDark[0], Pal.rockDark[1], Pal.rockDark[2]));
    fillEllipse(c, poolCx, poolCy, poolRx + 1.1, poolRy + 1.1,
        rgba(Pal.rock[0], Pal.rock[1], Pal.rock[2]));
    // rim stones, chunky and irregular
    for (var i = 0; i < rocks.length; i++) {
      final s = rocks[i];
      final lit = s.y < poolCy ? 0.55 : 1.0;
      final col = Pal.rockLit;
      fillEllipse(c, s.x, s.y, s.s * 1.3, s.s * 0.85,
          rgba((col[0] * lit).round(), (col[1] * lit).round(), (col[2] * lit).round()));
      fillEllipse(c, s.x + s.s * 0.3, s.y + s.s * 0.35, s.s * 0.7, s.s * 0.5,
          rgba(Pal.rockDark[0], Pal.rockDark[1], Pal.rockDark[2], 0.55));
    }
    // and a lighter front lip where the moonlight lands
    strokeEllipse(c, poolCx, poolCy, poolRx + 1.0, poolRy + 1.0, 1,
        rgba(Pal.rockLit[0], Pal.rockLit[1], Pal.rockLit[2], 0.5),
        a0: 0.18 * math.pi, a1: 0.82 * math.pi);
    // steam-warmed haze above the pool
    for (var i = 3; i >= 1; i--) {
      fillEllipse(c, poolCx, poolCy - poolRy * 0.2, poolRx * (0.6 + i * 0.16),
          poolRy * (0.4 + i * 0.14), rgba(190, 212, 240, 0.030));
    }
    // stone lanterns
    for (final L in lanterns) {
      _lanternBody(c, L);
    }
  }

  void _lanternBody(CanvasRenderingContext2D c, Lantern L) {
    final x = L.x, y = L.y;
    final rock = rgba(Pal.rock[0], Pal.rock[1], Pal.rock[2]);
    final lit0 = rgba(Pal.rockLit[0], Pal.rockLit[1], Pal.rockLit[2]);
    final dark = rgba(Pal.rockDark[0], Pal.rockDark[1], Pal.rockDark[2]);
    fillEllipse(c, x, y + 2.0, 4.2, 2.0, dark);
    px(c, x - 1.4, y - 3.4, 3.0, 5.6, rock);
    px(c, x - 2.6, y - 4.8, 5.4, 1.6, lit0);
    // the housing, with its little window still dark
    px(c, x - 3.4, y - 9.4, 7.0, 4.6, dark);
    px(c, x - 2.6, y - 8.8, 5.4, 3.4, rgba(96, 74, 60, 0.85));
    px(c, x - 0.8, y - 8.8, 1.6, 3.4, dark);
    px(c, x - 4.2, y - 10.4, 8.6, 1.4, rock);
    px(c, x - 3.4, y - 11.4, 7.0, 1.2, lit0);
    px(c, x - 0.8, y - 12.6, 1.6, 1.4, rock);
  }

  // ------------------------------------------------------------------- input --
  double _lastDragSound = 0;

  bool _inPool(double vx, double vy) {
    final dx = (vx - poolCx) / poolRx, dy = (vy - poolCy) / poolRy;
    return dx * dx + dy * dy <= 1.0;
  }

  double _poolDepth(double vy) =>
      clamp((vy - (poolCy - poolRy)) / (2 * poolRy), 0.0, 1.0);

  double _pan(double vx) => clamp((vx / vw - 0.5) * 1.6, -1.0, 1.0);

  double _monkeyX = 0, _monkeyY = 0;
  void _monkeyAnchor() {
    _monkeyX = poolCx - poolRx * 0.12;
    _monkeyY = poolCy - poolRy * 0.02;
  }

  Lantern? _lanternAt(double vx, double vy) {
    for (final L in lanterns) {
      if ((L.x - vx).abs() < 5.5 && vy > L.y - 13.0 && vy < L.y + 3.5) return L;
    }
    return null;
  }

  _Spot? _rockAt(double vx, double vy) {
    for (final s in rocks) {
      final dx = vx - s.x, dy = vy - s.y;
      if (dx * dx + dy * dy < (s.s + 2.0) * (s.s + 2.0)) return s;
    }
    return null;
  }

  void pointerDown(double vx, double vy) {
    _monkeyAnchor();
    dragging = true;
    _pressX = vx;
    _pressY = vy;
    _pressT = t;
    _longFired = false;
    _pressLantern = _lanternAt(vx, vy);
    lastInput = t;
    dragX = vx;
    dragY = vy;
  }

  void pointerMove(double vx, double vy) {
    if (!dragging) return;
    final dx = vx - dragX, dy = vy - dragY;
    dragX = vx;
    dragY = vy;
    lastInput = t;
    if ((vx - _pressX).abs() + (vy - _pressY).abs() > 4) _longFired = true;
    if (_inPool(vx, vy)) {
      if (rng.next() < 0.35) ripples.add(Ripple(vx, vy, 0.30, false));
      marks.add(vx);
      marks.add(vy);
      marks.add(t);
      if (t - _lastDragSound > 0.20) {
        _lastDragSound = t;
        synth.hush(0.09, 900, 0.30, _pan(vx));
      }
    }
    // a passing thumb parts the steam
    for (final p in parts) {
      if (p.kind != 0) continue;
      final ddx = p.x - vx, ddy = p.y - vy;
      if (ddx * ddx + ddy * ddy < 40) {
        p.vx += ddx * 0.7 + dx * 0.5;
        p.vy += ddy * 0.4 - 1.0;
      }
    }
  }

  void pointerUp(double vx, double vy) {
    dragging = false;
    final dx = vx - _pressX, dy = vy - _pressY;
    final dist = math.sqrt(dx * dx + dy * dy);
    final dur = t - _pressT;
    // A vertical swipe sweeps the sky. It moves the pointer, so pointerMove has
    // already set _longFired by the time we get here — the swipe must be tested
    // before that guard or it is never reached.
    if (dur < 0.9 && dy.abs() > 18 && dy.abs() > dx.abs() * 1.3) {
      gustSky(dy > 0 ? 1.0 : -1.0);
      return;
    }
    if (_longFired) return;
    if (dist < 8) tap(vx, vy);
  }

  void tap(double vx, double vy) {
    lastInput = t;
    _monkeyAnchor();
    if ((vx - _monkeyX).abs() < 8 && vy > _monkeyY - 19 && vy < _monkeyY + 5) {
      pokeMonkey();
      return;
    }
    final L = _lanternAt(vx, vy);
    if (L != null) {
      L.flare = 1.0;
      synth.pluck(L.lit ? 520 : 300, 0.20, 0.5, _pan(vx));
      if (!L.lit) synth.bell(880, 0.10, 0.9);
      return;
    }
    if (_inPool(vx, vy)) {
      waterTap(vx, vy);
      return;
    }
    final s = _rockAt(vx, vy);
    if (s != null) {
      stackPebble(s);
      return;
    }
    snowTap(vx, vy);
  }

  void waterTap(double vx, double vy) {
    final d = _poolDepth(vy);
    ripples.add(Ripple(vx, vy, 1.0, false));
    for (var i = 0; i < 10; i++) {
      final a = rng.range(0, math.pi * 2);
      final sp = rng.range(5, 22);
      parts.add(Part(2, vx, vy, math.cos(a) * sp, math.sin(a) * sp * 0.45 - rng.range(10, 26),
          rng.range(0.4, 0.9), rng.range(0.7, 1.5)));
    }
    for (var i = 0; i < 5; i++) {
      puffAt(vx + rng.range(-3, 3), vy + rng.range(-2, 2));
    }
    synth.pluck(lerp(900, 400, d), 0.30, 0.90, _pan(vx));
    synth.hush(0.15, 1300, 0.28, _pan(vx));
    mLook = vx;
    mReact = 0.5;
    glowPool = math.min(1.0, glowPool + 0.25);
    // five unhurried taps call the koi early
    tapTimes.add(t);
    tapTimes.removeWhere((e) => t - e > 6.0);
    if (tapTimes.length >= 5) {
      tapTimes.clear();
      callKoi(true);
    }
  }

  void snowTap(double vx, double vy) {
    for (var i = 0; i < 7; i++) {
      parts.add(Part(1, vx + rng.range(-2, 2), vy + rng.range(-1, 1),
          rng.range(-9, 9), -rng.range(2, 11), rng.range(0.8, 1.7), rng.range(0.7, 1.5)));
    }
    marks.add(vx);
    marks.add(vy);
    marks.add(t);
    synth.hush(0.12, 430, 0.24, _pan(vx));
    synth.pluck(lerp(320, 170, ((vy - snowGroundY) / (vh - snowGroundY)).clamp(0.0, 1.0)),
        0.14, 0.45, _pan(vx));
    mLook = vx;
    mReact = 0.35;
  }

  void stackPebble(_Spot s) {
    for (var i = 0; i < pebbles.length; i++) {
      final p = pebbles[i];
      if ((p[0] - s.x).abs() < 3 && (p[1] - s.y).abs() < 3) {
        if (p[2] < 7) {
          p[2] += 1;
          synth.pluck(330 * math.pow(1.122, p[2]).toDouble(), 0.26, 0.6, _pan(s.x));
          if (p[2] == 3.0) {
            glows.add(Part(3, s.x + rng.range(-4, 4), s.y - 6,
                rng.range(-1, 1), -rng.range(0.6, 1.6), rng.range(9, 14), 0.8));
          }
          if (p[2] == 7.0) {
            synth.bell(660, 0.22, 1.6);
            for (var k = 0; k < 4; k++) {
              glows.add(Part(3, s.x + rng.range(-6, 6), s.y - rng.range(4, 9),
                  rng.range(-1.5, 1.5), -rng.range(0.5, 1.4), rng.range(9, 16), 0.9));
            }
          }
        } else {
          synth.pluck(180, 0.14, 0.5, _pan(s.x));
        }
        return;
      }
    }
    pebbles.add(<double>[s.x, s.y, 1]);
    synth.pluck(330, 0.24, 0.6, _pan(s.x));
    synth.hush(0.10, 700, 0.18, _pan(s.x));
  }

  void pokeMonkey() {
    mReact = 1.0;
    mLook = mLook;
    if (mCap > 0.2) {
      mShake = 0.8;
      synth.hush(0.20, 1600, 0.45, 0.0);
      for (var i = 0; i < 14; i++) {
        parts.add(Part(1, _monkeyX + rng.range(-5, 5), _monkeyY - 13,
            rng.range(-14, 14), -rng.range(1, 8), rng.range(0.6, 1.4), rng.range(0.7, 1.5)));
      }
    }
    synth.chirp(520, 0.22);
  }

  void longPress() {
    if (_longFired) return;
    _longFired = true;
    final L = _pressLantern;
    if (L != null) {
      lightLantern(L);
      return;
    }
    if (_inPool(_pressX, _pressY)) {
      deepSettle(_pressX, _pressY);
      return;
    }
    packSnow(_pressX, _pressY);
  }

  void lightLantern(Lantern L) {
    final wasLit = L.lit;
    L.lit = true;
    L.flare = 1.6;
    synth.bell(wasLit ? 740 : 587, wasLit ? 0.16 : 0.30, wasLit ? 1.0 : 2.4);
    warm = clamp(warm + 0.18, 0.0, 1.0);
    synth.setWarmth(warm);
    final lit = lanterns.where((l) => l.lit).length;
    if (lit == lanterns.length && craneState == 0.0) {
      craneState = 0.5;   // it will come, slowly
      craneAge = 0;
    }
  }

  void deepSettle(double vx, double vy) {
    ripples.add(Ripple(vx, vy, 2.0, true));
    ripples.add(Ripple(vx, vy, 1.2, true));
    glowPool = 1.0;
    warm = clamp(warm + 0.10, 0.0, 1.0);
    synth.setWarmth(warm);
    synth.bell(196, 0.26, 3.2);
    synth.hush(0.16, 700, 1.4, _pan(vx));
    for (var i = 0; i < 18; i++) {
      puffAt(vx + rng.range(-8, 8), vy + rng.range(-5, 5));
    }
    for (final p in parts) {
      if (p.kind == 1) {
        p.vy *= 0.4;
      }
    }
    for (final g0 in glows) {
      g0.vy -= 0.4;
    }
    mLook = vx;
    mDrowsy = math.min(1.0, mDrowsy + 0.5);
  }

  void packSnow(double vx, double vy) {
    mounds.add(vx);
    mounds.add(vy);
    synth.hush(0.18, 320, 0.30, _pan(vx));
    synth.pluck(150, 0.16, 0.5, _pan(vx));
    for (var i = 0; i < 6; i++) {
      parts.add(Part(1, vx + rng.range(-3, 3), vy - rng.range(0, 3),
          rng.range(-4, 4), -rng.range(3, 9), rng.range(0.6, 1.2), rng.range(0.7, 1.3)));
    }
  }

  double gust = 0;
  void gustSky(double sign) {
    if (sign > 0) {
      snowTarget = clamp(snowTarget + 0.22, 0.0, 1.0);
      gust = -1.4;
      synth.hush(0.20, 500, 1.2, 0.0);
      synth.pluck(240, 0.16, 1.0, 0.4);
    } else {
      snowTarget = clamp(snowTarget - 0.20, 0.0, 1.0);
      gust = 1.6;
      synth.hush(0.22, 1800, 1.4, 0.0);
      synth.pluck(360, 0.16, 1.2, -0.4);
    }
    for (final p in parts) {
      if (p.kind == 0) p.vx += gust * 0.8;
      if (p.kind == 1) p.vx += gust * 0.6;
    }
    lastInput = t;
  }

  void puffAt(double x, double y) {
    parts.add(Part(0, x, y, rng.range(-2.0, 2.0), -rng.range(3.5, 8.0),
        rng.range(2.4, 5.0), rng.range(1.4, 3.2)));
  }

  void callKoi(bool chime) {
    if (koiState != 0) return;
    koiState = 1;
    koiAge = 0;
    if (chime) {
      synth.bell(784, 0.20, 2.0);
      synth.hush(0.12, 900, 0.8, 0.0);
    }
  }

  // -------------------------------------------------------------------- step --
  void update(double dt) {
    dt = clamp(dt, 0.0, 0.05);
    t += dt;
    // reduced motion: snow, steam, splashes, fireflies and ripples drift far
    // more slowly (their lifetimes still run on the real clock)
    final md = reduceMotion ? dt * 0.22 : dt;
    _monkeyAnchor();
    still = t - lastInput;
    if (dragging) {
      if (!_longFired) {
        if (t - _pressT > 0.55) longPress();
      }
      lastInput = t;
      still = 0;
    }
    calm = clamp((still - 3.0) / 6.0, 0.0, 1.0);
    if (calm > 0.35) mDrowsy = math.min(1.0, mDrowsy + dt * 0.25);
    else mDrowsy = math.max(0.0, mDrowsy - dt * 0.5);

    // weather
    snowAmt += (snowTarget - snowAmt) * clamp(dt * 0.6, 0.0, 1.0);
    gust *= math.pow(0.35, dt);
    windX = gust + math.sin(t * 0.21) * 0.5 + math.sin(t * 0.07) * 0.3;
    glowPool = math.max(0.0, glowPool - dt * 0.16);

    // snow: keep the count in step with the weather
    var flakes = 0;
    for (final p in parts) {
      if (p.kind == 1) flakes++;
    }
    final want = (28 + snowAmt * 240).round();
    if (flakes < want) {
      for (var i = 0; i < math.min(6, want - flakes); i++) {
        _spawnFlake();
      }
    } else if (flakes > want) {
      for (var i = 0; i < flakes - want; i++) {
        for (var j = 0; j < parts.length; j++) {
          if (parts[j].kind == 1) {
            parts.removeAt(j);
            break;
          }
        }
      }
    }

    // steam: the pool breathes, more when the water has just been stirred
    var puffs = 0;
    for (final p in parts) {
      if (p.kind == 0) puffs++;
    }
    final wantPuff = (16 + 30 * (1 - calm * 0.5) + glowPool * 18).round();
    if (puffs < wantPuff) {
      for (var i = 0; i < math.min(3, wantPuff - puffs); i++) {
        _spawnPuff();
      }
    } else if (puffs > wantPuff + 4) {
      for (var i = 0; i < puffs - wantPuff; i++) {
        for (var j = 0; j < parts.length; j++) {
          if (parts[j].kind == 0) {
            parts.removeAt(j);
            break;
          }
        }
      }
    }

    // fireflies rise in the stillness, when the springs are warm
    final litCount = lanterns.where((l) => l.lit).length;
    if (calm > 0.5 && litCount > 0 && glows.length < 16 && rng.next() < dt * 1.6) {
      glows.add(Part(3, poolCx + rng.range(-poolRx * 0.7, poolRx * 0.7),
          poolCy + rng.range(-poolRy * 0.5, poolRy * 0.2),
          rng.range(-2, 2), -rng.range(0.6, 2.2), rng.range(8, 15), rng.range(0.7, 1.2)));
    }

    // particles
    for (var i = parts.length - 1; i >= 0; i--) {
      final p = parts[i];
      p.age += dt;
      if (p.kind == 0) {
        p.x += (p.vx + windX * 0.35) * md;
        p.y += p.vy * md;
        p.vx *= math.pow(0.9, dt);
        p.vy -= dt * 0.5;
        p.size += dt * 0.9;
        if (p.age > p.life) parts.removeAt(i);
      } else if (p.kind == 1) {
        p.x += (p.vx + windX * 3.2) * md;
        p.y += p.vy * md;
        final gx = p.x, gy = p.y;
        final onMonkey = (gx - _monkeyX).abs() < 7 && (gy - (_monkeyY - 11)).abs() < 7;
        if (gy > snowGroundY && !_inPool(gx, gy)) {
          snowDepth = math.min(1.0, snowDepth + 0.0016);
          if (onMonkey) mCap = math.min(1.0, mCap + 0.02);
          parts.removeAt(i);
        } else if (onMonkey && rng.next() < dt * 0.5) {
          mCap = math.min(1.0, mCap + 0.012);
          parts.removeAt(i);
        } else if (gy > vh + 2 || gx < -8 || gx > vw + 8) {
          parts.removeAt(i);
        } else if (p.age > p.life) {
          parts.removeAt(i);
        }
      } else if (p.kind == 2) {
        p.vy += 42 * md;
        p.x += p.vx * md;
        p.y += p.vy * md;
        if (p.age > p.life || p.y > poolCy + poolRy) {
          if (p.y <= poolCy + poolRy && !_inPool(p.x, p.y)) {
            parts.removeAt(i);
          } else {
            if (rng.next() < 0.10) ripples.add(Ripple(p.x, p.y, 0.18, false));
            parts.removeAt(i);
          }
        }
      } else {
        p.x += (p.vx + math.sin(t * 0.8 + p.y) * 0.6) * md;
        p.y += p.vy * md;
        if (p.age > p.life) parts.removeAt(i);
      }
    }

    // ripples
    for (var i = ripples.length - 1; i >= 0; i--) {
      final r = ripples[i];
      r.age += md;
      if (r.age > r.life) ripples.removeAt(i);
    }
    // a ripple nudges the steam above it
    for (final r in ripples) {
      if (r.age > 0.5) continue;
      final rr = r.age * (r.deep ? 40 : 26) * r.strength;
      for (final p in parts) {
        if (p.kind != 0) continue;
        final d = math.sqrt((p.x - r.x) * (p.x - r.x) + (p.y - r.y) * (p.y - r.y));
        if ((d - rr).abs() < 3.5) {
          p.vx += (p.x - r.x) * 0.25;
          p.vy -= 0.8;
        }
      }
    }
    // old drag marks fade away
    for (var i = marks.length - 3; i >= 0; i -= 3) {
      if (t - marks[i + 2] > 4.0) {
        marks.removeRange(i, i + 3);
      }
    }

    // the monkey
    mBob = math.sin(t * 1.1) * 0.45 + math.sin(t * 0.43) * 0.3;
    mBlink -= dt;
    if (mBlink < 0) mBlink = 2.4 + rng.range(0, 4.5);
    if ((mLook - _monkeyX).abs() > 2) mFace = mLook > _monkeyX ? 1.0 : -1.0;
    if (mReact > 0) mReact = math.max(0.0, mReact - dt);
    if (mShake > 0) {
      mShake = math.max(0.0, mShake - dt);
      mCap = math.max(0.0, mCap - dt * 1.4);
      if (rng.next() < dt * 12) {
        parts.add(Part(1, _monkeyX + rng.range(-5, 5), _monkeyY - 13,
            rng.range(-16, 16), -rng.range(2, 10), rng.range(0.5, 1.2), rng.range(0.7, 1.4)));
      }
    }
    if (calm > 0.7 && mCap > 0.4 && rng.next() < dt * 0.12) {
      mShake = 0.9;
    }

    // hidden things
    _updateKoi(dt);
    _updateCrane(dt);

    // and, rarely, a star falls
    if (meteorOn) {
      meteorAge += dt;
      meteorX += meteorVX * dt;
      meteorY += meteorVY * dt;
      if (meteorAge > 1.4 || meteorX < -20 || meteorX > vw + 20 || meteorY > horizon - 18) {
        meteorOn = false;
        meteorWait = rng.range(50, 150);
      }
    } else {
      meteorWait -= dt;
      if (meteorWait <= 0) {
        meteorOn = true;
        meteorAge = 0;
        meteorX = rng.range(vw * 0.15, vw * 0.75);
        meteorY = rng.range(4, horizon * 0.30);
        final speed = rng.range(34, 62);
        meteorVX = (rng.next() < 0.5 ? -1 : 1) * speed;
        meteorVY = speed * rng.range(0.28, 0.5);
      }
    }

    // lanterns settle
    for (final L in lanterns) {
      L.flare = math.max(0.0, L.flare - dt * 1.2);
      L.glow = L.lit ? math.min(1.0, L.glow + dt * 0.8) : math.max(0.0, L.glow - dt * 0.6);
    }
    if (litCount > 0 && rng.next() < dt * 0.7) {
      final L = lanterns.where((l) => l.lit).toList()[rng.intRange(0, litCount - 1)];
      puffAt(L.x + rng.range(-1, 1), L.y - 3);
    }
  }

  void _updateKoi(double dt) {
    _monkeyAnchor();
    if (koiState == 0) {
      if (calm > 0.75 && rng.next() < dt * 0.35) callKoi(false);
      return;
    }
    if (koiState == 1) {
      koiAge += dt;
      final f = clamp(koiAge / 1.6, 0.0, 1.0);
      koiA = rng.range(0, math.pi * 2);
      koiX = poolCx + math.cos(koiA) * poolRx * 0.55;
      koiY = lerp(poolCy + poolRy * 0.5, poolCy + poolRy * 0.02, f);
      if (koiAge > 1.5 && koiAge - dt <= 1.5) {
        synth.bell(392, 0.16, 2.2);
        synth.hush(0.14, 800, 0.9, 0.0);
        for (var i = 0; i < 8; i++) {
          parts.add(Part(2, koiX + rng.range(-3, 3), koiY, rng.range(-8, 8),
              -rng.range(4, 12), rng.range(0.4, 0.8), rng.range(0.6, 1.3)));
        }
      }
      if (koiAge > 3.2) {
        koiState = 2;
        koiAge = 0;
      }
      return;
    }
    if (koiState == 2) {
      koiAge += dt;
      koiA += dt * 0.22;
      koiA %= math.pi * 2;
      koiX = poolCx + math.cos(koiA) * poolRx * 0.55;
      koiY = poolCy + poolRy * 0.02 + math.sin(koiA * 2) * 1.5;
      if (t - lastInput < 1.5 && (_pressX - koiX).abs() < 10) {
        koiState = 3;
        koiAge = 0;
      }
      if (koiAge > 26) {
        koiState = 3;
        koiAge = 0;
      }
      return;
    }
    koiAge += dt;
    koiY += dt * 6;
    if (koiAge > 2.2) {
      koiState = 0;
      koiAge = 0;
    }
  }

  void _updateCrane(double dt) {
    if (craneState == 0) return;
    if (craneState == 0.5) {
      craneAge += dt;
      if (craneAge > 5.0) {
        craneState = 1;
        craneAge = 0;
        craneWing = 0;
      }
      return;
    }
    if (craneState == 1) {
      craneAge += dt;
      final f = clamp(craneAge / 4.2, 0.0, 1.0);
      // far rim, on the back-left stone
      final tx = poolCx + poolRx * 0.50, ty = poolCy - poolRy * 1.10;
      craneX = lerp(vw + 14, tx, f * f * (3 - 2 * f));
      craneY = lerp(-14, ty, f) + math.sin(f * math.pi) * -12;
      craneWing = math.sin(craneAge * 7) * 0.5 + 0.5;
      if (f >= 1.0) {
        craneState = 2;
        craneAge = 0;
        craneX = tx;
        craneY = ty;
        synth.pluck(587, 0.20, 1.6, 0.0);
        synth.hush(0.14, 1500, 0.6, 0.0);
      }
      return;
    }
    craneAge += dt;
    if (rng.next() < dt * 0.10) {
      synth.pluck(587 + rng.range(-40, 60), 0.14, 1.4, 0.0);
    }
  }

  // ------------------------------------------------------------------ render --
  void _bakeStars() {
    final c = bgg;
    for (var i = 0; i + 2 < stars.length; i += 3) {
      final x = stars[i], y = stars[i + 1];
      if (y > horizon - 20) continue;
      final bright = (i ~/ 3) % 7 == 0;
      if (bright) {
        px(c, x, y, 2, 2, rgba(206, 216, 248, 0.45));
        px(c, x + 1, y + 1, 1, 1, rgba(236, 242, 255, 0.7));
      } else {
        px(c, x, y, 1, 1, rgba(180, 190, 226, 0.42));
      }
    }
  }

  void _twinklers(CanvasRenderingContext2D c) {
    for (var i = 0; i + 2 < stars.length; i += 3) {
      final x = stars[i], y = stars[i + 1], ph = stars[i + 2];
      if (y > horizon - 26) continue;
      if ((i ~/ 3) % 5 != 0) continue;
      final a = 0.25 + 0.6 * (0.5 + 0.5 * math.sin(t * 0.7 + ph * 3));
      px(c, x, y, 1, 1, rgba(224, 232, 255, a));
      if (a > 0.7) px(c, x - 1, y, 3, 1, rgba(206, 216, 248, a * 0.35));
    }
  }

  void _renderMeteor(CanvasRenderingContext2D c) {
    if (!meteorOn) return;
    final life = clamp(meteorAge / 1.4, 0.0, 1.0);
    final a = math.sin(life * math.pi) * 0.8;
    final n = math.sqrt(meteorVX * meteorVX + meteorVY * meteorVY);
    final ux = meteorVX / n, uy = meteorVY / n;
    // a soft head, then a tail that thins as it goes
    for (var i = 4; i >= 1; i--) {
      px(c, meteorX - 2 - i, meteorY - 2 - i, 4 + i * 2, 4 + i * 2,
          rgba(198, 218, 255, 0.05 * a * (5 - i) / 4));
    }
    for (var i = 0; i < 16; i++) {
      final f = i / 15;
      final al = a * math.pow(1 - f, 1.5).toDouble();
      if (al < 0.03) continue;
      px(c, meteorX - ux * i, meteorY - uy * i, 1.4, 1.4, rgba(232, 240, 255, al));
    }
    px(c, meteorX - 1, meteorY - 1, 2, 2, rgba(255, 253, 244, a));
  }

  void _renderWater(CanvasRenderingContext2D c) {
    final y0 = (poolCy - poolRy).floorToDouble();
    final y1 = (poolCy + poolRy).ceilToDouble();
    for (var y = y0; y <= y1; y++) {
      final dy = (y + 0.5 - poolCy) / poolRy;
      final k = 1 - dy * dy;
      if (k <= 0) continue;
      final dx = poolRx * math.sqrt(k);
      final depth = clamp((dy + 1) / 2, 0.0, 1.0);
      final col = _ramp(<List<int>>[Pal.waterDeep, Pal.waterMid, Pal.waterLit,
          Pal.waterMid, Pal.waterDeep], depth);
      c.fillStyle = rgba(col[0], col[1], col[2]);
      c.fillRect((poolCx - dx).floorToDouble(), y, (dx * 2).ceilToDouble(), 1);
    }
    // a warm haze on the water when the springs are stirred
    if (glowPool > 0.01) {
      for (var i = 3; i >= 1; i--) {
        fillEllipse(c, poolCx, poolCy - poolRy * 0.15, poolRx * (0.5 + i * 0.15),
            poolRy * (0.35 + i * 0.16), rgba(255, 206, 142, 0.035 * glowPool));
      }
    }
    // lantern reflections
    for (final L in lanterns) {
      if (L.glow < 0.05) continue;
      final f = clamp(1 - (poolCy - L.y) / (poolRy * 3), 0.0, 1.0);
      for (var y = (poolCy - poolRy * 0.6).floorToDouble(); y <= y1; y += 1) {
        final dy = (y + 0.5 - poolCy) / poolRy;
        final k = 1 - dy * dy;
        if (k <= 0) continue;
        final dx = poolRx * math.sqrt(k);
        final wob = math.sin(t * 1.6 + y * 0.45) * 1.4;
        final rx0 = L.x + wob;
        if ((rx0 - poolCx).abs() > dx - 1) continue;
        final a = 0.085 * L.glow * (0.35 + f) * (1 - (y - (poolCy - poolRy)) / (2 * poolRy) * 0.5);
        px(c, rx0 - 1, y, 3, 1,
            rgba(255, 196, 128, a * (1 + L.flare * 0.6)));
      }
    }
    // shimmer dashes
    for (var i = 0; i < 34; i++) {
      final f = (i + 0.5) / 34;
      final y = poolCy - poolRy * 0.92 + f * poolRy * 1.84;
      final dy = (y - poolCy) / poolRy;
      final k = 1 - dy * dy;
      if (k <= 0) continue;
      final dx = poolRx * math.sqrt(k);
      final ph = math.sin(y * 0.22 + t * 0.75) * 0.5 + 0.5;
      final x = poolCx + (ph - 0.5) * dx * 1.2;
      final w = 4 + ph * 9;
      final a = 0.06 + 0.13 * ph * (1 - f * 0.6);
      px(c, x - w / 2, y, w, 1, rgba(Pal.waterShine[0], Pal.waterShine[1], Pal.waterShine[2], a));
    }
    // ripples
    for (final r in ripples) {
      final life = r.age / r.life;
      if (life >= 1) continue;
      final rr = r.age * (r.deep ? 34 : 24) * r.strength;
      final a = (1 - life) * (r.deep ? 0.42 : 0.5) * (r.strength > 1.5 ? 1.2 : 1.0);
      strokeEllipse(c, r.x, r.y, rr, rr * (poolRy / poolRx), 1,
          rgba(Pal.waterShine[0], Pal.waterShine[1], Pal.waterShine[2], clamp(a, 0.0, 0.7)));
    }
    // the moon lays a pale streak across the water
    final moonX = vw * 0.74;
    for (var y = (poolCy - poolRy * 0.95).floorToDouble(); y <= y1; y += 1) {
      final dy = (y + 0.5 - poolCy) / poolRy;
      final k = 1 - dy * dy;
      if (k <= 0) continue;
      final dx = poolRx * math.sqrt(k);
      if ((moonX - poolCx).abs() > dx - 2) continue;
      final wob = math.sin(t * 1.1 + y * 0.5) * 1.8;
      final a = 0.05 + 0.05 * math.sin(y * 0.3 + t);
      px(c, moonX + wob - 2, y, 5, 1, rgba(206, 226, 250, a));
    }
    // the near lip of the basin picks up the moonlight
    strokeEllipse(c, poolCx, poolCy, poolRx - 0.5, poolRy - 0.5, 1,
        rgba(210, 244, 236, 0.28), a0: 0.25 * math.pi, a1: 0.75 * math.pi);
  }

  void _renderMarks(CanvasRenderingContext2D c) {
    for (var i = 0; i + 2 < marks.length; i += 3) {
      final age = t - marks[i + 2];
      if (age > 4) continue;
      final a = (1 - age / 4) * 0.32;
      px(c, marks[i], marks[i + 1], 1, 1, rgba(16, 26, 44, a));
      px(c, marks[i], marks[i + 1] + 1, 1, 1, rgba(206, 216, 240, a * 0.5));
    }
    for (var i = 0; i + 1 < mounds.length; i += 2) {
      final x = mounds[i], y = mounds[i + 1];
      fillEllipse(c, x, y, 2.6, 1.7, rgba(196, 206, 236, 0.85));
      fillEllipse(c, x + 0.8, y + 0.7, 2.0, 1.1, rgba(150, 162, 200, 0.6));
      fillEllipse(c, x - 0.6, y - 0.8, 1.4, 0.8, rgba(226, 234, 254, 0.9));
    }
    for (final p in pebbles) {
      final n = p[2].toInt();
      for (var i = 0; i < n; i++) {
        final yy = p[1] - i * 1.7;
        final xx = p[0] + (i.isEven ? -0.6 : 0.6);
        fillEllipse(c, xx, yy, 1.6, 1.0,
            rgba(Pal.rockLit[0], Pal.rockLit[1], Pal.rockLit[2], 0.95));
        fillEllipse(c, xx, yy - 0.4, 1.2, 0.6, rgba(226, 232, 250, 0.55));
      }
      if (n >= 7) {
        fillEllipse(c, p[0], p[1] - 6, 5, 4, rgba(255, 208, 150, 0.10 + 0.05 * math.sin(t * 2)));
      }
    }
  }

  void _renderMonkey(CanvasRenderingContext2D c) {
    final x = _monkeyX, y = _monkeyY + mBob;
    final f = mFace;
    final shake = mShake > 0 ? math.sin(t * 42) * 1.6 : 0.0;
    final xx = x + shake;
    final furC = rgba(Pal.fur[0], Pal.fur[1], Pal.fur[2]);
    final darkC = rgba(Pal.furDark[0], Pal.furDark[1], Pal.furDark[2]);
    final skinC = rgba(Pal.skin[0], Pal.skin[1], Pal.skin[2]);
    // a dark hollow in the water under him
    fillEllipse(c, xx + 1.5, y + 3.5, 7.0, 2.2, rgba(14, 36, 52, 0.22));
    // shoulders, back and haunches
    fillEllipse(c, xx, y - 3.0, 7.4, 6.8, furC);
    fillEllipse(c, xx, y - 6.4, 5.8, 3.2, darkC);
    // arms resting on the rim of the water
    fillEllipse(c, xx - 5.6, y - 1.6, 2.1, 3.6, darkC);
    fillEllipse(c, xx + 5.6, y - 1.6, 2.1, 3.6, darkC);
    fillEllipse(c, xx - 5.9, y + 1.6, 1.9, 1.2, rgba(Pal.skin[0], Pal.skin[1], Pal.skin[2], 0.85));
    fillEllipse(c, xx + 5.9, y + 1.6, 1.9, 1.2, rgba(Pal.skin[0], Pal.skin[1], Pal.skin[2], 0.85));
    // head, set on a short neck
    fillEllipse(c, xx, y - 9.6, 2.6, 2.2, furC);
    final hy = y - 13.0 - mDrowsy * 0.9 + (mReact > 0 ? -1.1 : 0);
    final hx = xx + f * 0.8 + clamp((mLook - x) * 0.3, -4.0, 4.0);
    fillEllipse(c, hx - 5.6, hy + 0.4, 2.2, 2.2, darkC);
    fillEllipse(c, hx + 5.6, hy + 0.4, 2.2, 2.2, rgba(Pal.skin[0], Pal.skin[1], Pal.skin[2], 0.55));
    fillEllipse(c, hx, hy, 6.0, 5.4, furC);
    fillEllipse(c, hx, hy - 3.4, 4.6, 1.4, darkC);
    // the bare face
    fillEllipse(c, hx + f * 0.6, hy + 0.6, 4.0, 3.8, skinC);
    fillEllipse(c, hx + f * 0.6, hy - 2.0, 3.4, 1.2, rgba(160, 116, 96, 0.35));
    final ex = hx + f * 0.8;
    if (mBlink < 0.14) {
      px(c, ex - 3.0, hy - 0.9, 6.0, 1.0, rgba(58, 38, 32, 0.92));
    } else {
      px(c, ex - 2.9, hy - 1.5, 2.0, 2.2, rgba(44, 30, 26, 0.95));
      px(c, ex + 1.0, hy - 1.5, 2.0, 2.2, rgba(44, 30, 26, 0.95));
      px(c, ex - 2.6, hy - 1.9, 0.9, 0.9, rgba(238, 242, 255, 0.55));
      px(c, ex + 1.3, hy - 1.9, 0.9, 0.9, rgba(238, 242, 255, 0.55));
      // a slow blink half-closes them
      if (mBlink < 0.4) {
        px(c, ex - 3.0, hy - 0.5, 6.0, 1.0, rgba(58, 38, 32, 0.55));
      }
    }
    px(c, ex - 1.2, hy + 2.2, 2.4, 0.9, rgba(150, 108, 90, 0.75));
    // breath, and the snow that gathered on his crown
    if (mCap > 0.10) {
      final cap = clamp(mCap, 0.0, 1.0);
      fillEllipse(c, hx, hy - 4.6, 5.2 * (0.55 + cap * 0.45), 1.9 * (0.55 + cap * 0.45),
          rgba(230, 238, 255, 0.5 + cap * 0.4));
      fillEllipse(c, hx - 1.8, hy - 5.3, 2.1, 1.0, rgba(248, 252, 255, 0.6 * cap));
      if (cap > 0.6) {
        fillEllipse(c, hx + 2.4, hy - 5.0, 1.3, 0.8, rgba(248, 252, 255, 0.45 * cap));
      }
    }
    // where the warm water meets the fur
    for (var i = 0; i < 4; i++) {
      final wy = y + 1.0 + i * 1.1;
      final a = 0.11 - i * 0.02;
      px(c, xx - 6.4 + i, wy, 5.2 - i * 0.9, 0.9,
          rgba(Pal.waterShine[0], Pal.waterShine[1], Pal.waterShine[2], a));
      px(c, xx + 1.2 - i * 0.5, wy, 5.0 - i * 0.9, 0.9,
          rgba(Pal.waterShine[0], Pal.waterShine[1], Pal.waterShine[2], a));
    }
  }

  void _renderKoi(CanvasRenderingContext2D c) {
    if (koiState == 0.0) return;
    final a = koiState == 1 ? clamp(koiAge / 1.6, 0.0, 1.0) : 1.0;
    final dir = math.cos(koiA) >= 0 ? 1.0 : -1.0;
    final body = rgba(Pal.koi[0], Pal.koi[1], Pal.koi[2], 0.35 + 0.5 * a);
    // the water it turns over as it goes
    for (var i = 1; i <= 4; i++) {
      final wob = math.sin(t * 1.6 + i * 0.9) * 1.1;
      px(c, koiX - dir * (5.0 + i * 2.4), koiY + wob, 5.0, 0.8,
          rgba(Pal.waterShine[0], Pal.waterShine[1], Pal.waterShine[2], (0.16 - i * 0.03) * a));
    }
    // tail, body, head
    fillEllipse(c, koiX - dir * 5.6, koiY + math.sin(t * 2.2) * 1.0, 2.4, 2.6, body);
    fillEllipse(c, koiX - dir * 3.6, koiY + math.sin(t * 2.2) * 0.6, 1.6, 1.9, body);
    fillEllipse(c, koiX, koiY, 6.0, 2.8, body);
    fillEllipse(c, koiX, koiY - 0.9, 5.0, 1.2, rgba(255, 250, 236, (0.30 + 0.5 * a) * 0.85));
    fillEllipse(c, koiX + dir * 4.4, koiY - 0.3, 1.8, 1.7,
        rgba(Pal.koi[0], Pal.koi[1], Pal.koi[2], 0.40 + 0.5 * a));
    // the one red mark
    fillEllipse(c, koiX - dir * 1.4, koiY - 0.5, 1.5, 1.1,
        rgba(Pal.koiMark[0], Pal.koiMark[1], Pal.koiMark[2], (0.45 + 0.5 * a) * 0.9));
    px(c, koiX + dir * 5.4, koiY - 0.8, 0.9, 0.9, rgba(40, 44, 58, 0.9));
  }

  void _renderCrane(CanvasRenderingContext2D c) {
    if (craneState < 1.0) return;
    final x = craneX, y = craneY;
    if (craneState == 1.0) {
      final flap = math.sin(craneAge * 9) * 3.0;
      fillEllipse(c, x, y, 5.5, 2.0, rgba(Pal.crane[0], Pal.crane[1], Pal.crane[2], 0.95));
      fillEllipse(c, x - 1, y - flap, 4.5, 1.1, rgba(Pal.crane[0], Pal.crane[1], Pal.crane[2], 0.85));
      fillEllipse(c, x - 1, y + flap, 4.5, 1.1, rgba(Pal.crane[0], Pal.crane[1], Pal.crane[2], 0.7));
      px(c, x - 6, y - 0.5, 3, 1.4, rgba(70, 74, 96, 0.9));
      px(c, x + 5.5, y - 0.5, 2, 1.4, rgba(70, 74, 96, 0.9));
      return;
    }
    // perched on the far stones: tall legs, a long neck, and the red crown
    final bob = math.sin(t * 0.8) * 0.3;
    final legC = rgba(66, 70, 92, 0.92);
    px(c, x - 1.4, y + 1.6, 0.9, 7.0, legC);
    px(c, x + 0.6, y + 1.6, 0.9, 7.0, legC);
    px(c, x - 2.2, y + 8.0, 1.9, 0.9, legC);
    px(c, x - 0.2, y + 8.0, 1.9, 0.9, legC);
    // the long tail plume, then the body
    fillEllipse(c, x - 4.6, y - 1.0 + bob, 2.6, 1.5, rgba(198, 208, 232, 0.9));
    fillEllipse(c, x, y + 0.2 + bob, 4.8, 2.5, rgba(Pal.crane[0], Pal.crane[1], Pal.crane[2]));
    fillEllipse(c, x + 1.0, y - 0.9 + bob, 3.4, 1.2, rgba(214, 222, 244, 0.9));
    // neck, drawn as a slight S so it never reads as a swan
    for (var i = 0; i < 8; i++) {
      final f = i / 7;
      px(c, x + 3.2 + math.sin(f * 2.0) * 1.2, y - 1.6 - i * 1.25 + bob, 1.2, 1.5,
          rgba(Pal.crane[0], Pal.crane[1], Pal.crane[2]));
      if (i > 5) {
        px(c, x + 3.0 + math.sin(f * 2.0) * 1.2, y - 1.6 - i * 1.25 + bob, 2.0, 1.2,
            rgba(200, 210, 236, 0.7));
      }
    }
    final hx = x + 4.6, hy = y - 11.4 + bob;
    fillEllipse(c, hx, hy, 1.6, 1.4, rgba(Pal.crane[0], Pal.crane[1], Pal.crane[2]));
    px(c, hx + 0.9, hy - 0.5, 2.4, 0.8, rgba(234, 182, 98, 0.95));
    px(c, hx + 0.3, hy - 1.7, 1.1, 0.9, rgba(Pal.craneRed[0], Pal.craneRed[1], Pal.craneRed[2]));
    px(c, hx - 0.6, hy - 0.6, 0.8, 0.8, rgba(40, 34, 44, 0.9));
  }

  void _renderParts(CanvasRenderingContext2D c) {
    for (final p in parts) {
      if (p.kind == 0) {
        final f = clamp(p.age / p.life, 0.0, 1.0);
        final a = (1 - f) * (f < 0.25 ? f * 4 : 1.0) * 0.185;
        if (a < 0.008) continue;
        final s = p.size * (0.55 + f * 1.5);
        fillEllipse(c, p.x, p.y, s * 1.5, s * 1.25, rgba(186, 204, 236, a * 0.55));
        fillEllipse(c, p.x, p.y - s * 0.3, s, s * 0.85, rgba(206, 222, 246, a * 0.8));
        fillEllipse(c, p.x, p.y - s * 0.7, s * 0.6, s * 0.5, rgba(228, 238, 255, a));
      } else if (p.kind == 1) {
        final a = p.size > 1.25 ? 0.85 : 0.62;
        px(c, p.x, p.y, p.size > 1.25 ? 2 : 1, p.size > 1.25 ? 2 : 1,
            rgba(226, 234, 254, a));
      } else if (p.kind == 2) {
        px(c, p.x, p.y, 1, 1, rgba(Pal.waterShine[0], Pal.waterShine[1], Pal.waterShine[2], 0.8));
      } else {
        final pulse = 0.5 + 0.5 * math.sin(t * 2.6 + p.y * 0.7);
        final a = (1 - clamp(p.age / p.life, 0.0, 1.0)) * (0.3 + 0.7 * pulse);
        fillEllipse(c, p.x, p.y, 2.6, 2.6, rgba(255, 214, 140, 0.10 * a));
        px(c, p.x, p.y, 1, 1, rgba(255, 236, 176, clamp(a, 0.0, 1.0)));
      }
    }
  }

  void _renderLanternGlow(CanvasRenderingContext2D c) {
    for (final L in lanterns) {
      final g0 = clamp(L.glow + L.flare, 0.0, 1.9);
      if (g0 < 0.03) continue;
      final flick = 0.9 + 0.1 * math.sin(t * 7.0 + L.x * 0.7);
      final g1 = g0 * flick;
      // the light falls on the snow around the base
      fillEllipse(c, L.x, L.y + 1.4, 16.0, 7.0, rgba(255, 190, 122, 0.030 * g1));
      fillEllipse(c, L.x, L.y + 1.2, 9.0, 4.2, rgba(255, 198, 132, 0.045 * g1));
      fillEllipse(c, L.x, L.y + 1.0, 4.6, 2.2, rgba(255, 210, 148, 0.070 * g1));
      // the halo
      for (var i = 6; i >= 1; i--) {
        fillEllipse(c, L.x, L.y - 7.0, 2.2 + i * 2.4, 2.0 + i * 2.1,
            rgba(255, 194, 126, 0.028 * g1));
      }
      // and the window itself
      px(c, L.x - 2.6, L.y - 8.8, 5.4, 3.4, rgba(255, 196, 120, clamp(0.55 * g1, 0.0, 1.0)));
      px(c, L.x - 1.8, L.y - 8.2, 3.8, 2.4, rgba(255, 232, 176, clamp(0.8 * g1, 0.0, 1.0)));
      px(c, L.x - 0.8, L.y - 8.8, 1.6, 3.4, rgba(58, 46, 46, 0.85));
      px(c, L.x - 4.2, L.y - 10.4, 8.6, 1.4, rgba(150, 140, 140, 0.55));
    }
  }

  void _vignette(CanvasRenderingContext2D c) {
    final r = math.max(vw, vh).toDouble();
    final grad = c.createRadialGradient(
        poolCx, vh * 0.55, r * 0.32, poolCx, vh * 0.55, r * 0.94);
    grad.addColorStop(0.0, rgba(6, 10, 24, 0.0));
    grad.addColorStop(0.55, rgba(6, 10, 24, 0.10));
    grad.addColorStop(1.0, rgba(6, 10, 24, 0.44));
    c.fillStyle = grad;
    c.fillRect(0, 0, vw, vh);
  }

  void render() {
    final c = g;
    c.globalAlpha = 1;
    c.clearRect(0, 0, vw, vh);
    c.drawImage(bg, 0, 0);
    _twinklers(c);
    _renderMeteor(c);
    _renderMarks(c);
    _renderWater(c);
    _renderKoi(c);
    _renderMonkey(c);
    _renderCrane(c);
    _renderParts(c);
    _renderLanternGlow(c);
    _vignette(c);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#080b18';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImageScaledFromSource(buf, 0, 0, vw, vh, 0, 0, W, H);
  }

  // -------------------------------------------------------------------- loop --
  double _prev = 0;
  void _frame(num nowMs) {
    final now = nowMs / 1000.0;
    var dt = _prev == 0 ? 0.016 : now - _prev;
    if (dt > 0.1) dt = 0.1;
    _prev = now;
    update(dt);
    render();
    window.requestAnimationFrame(_frame);
  }
}

// ------------------------------------------------------------------------ boot --
void main() {
  final canvas = document.querySelector('#spring') as CanvasElement;
  final scene = Scene(canvas);
  scene.start();

  void onP(String name, void Function(PointerEvent pe, MouseEvent me) fn) {
    canvas.on[name].listen((Event e) {
      fn(e as PointerEvent, e as MouseEvent);
    });
  }
  onP('pointerdown', (PointerEvent pe, MouseEvent me) {
    try { canvas.setPointerCapture(pe.pointerId ?? 0); } catch (_) {}
    scene.pointerDown(me.client.x.toDouble() / scene.u, me.client.y.toDouble() / scene.u);
  });
  onP('pointermove', (PointerEvent pe, MouseEvent me) {
    scene.pointerMove(me.client.x.toDouble() / scene.u, me.client.y.toDouble() / scene.u);
  });
  void up(PointerEvent pe, MouseEvent me) {
    scene.pointerUp(me.client.x.toDouble() / scene.u, me.client.y.toDouble() / scene.u);
  }
  onP('pointerup', up);
  onP('pointercancel', up);

  final btn = document.querySelector('#sound') as ButtonElement;
  var prefOn = false;
  try { prefOn = window.localStorage['steam-spring-sound'] == 'on'; } catch (_) {}
  void paint() {
    if (scene.synth.on) {
      btn.text = 'Sound: on';
    } else if (prefOn) {
      btn.text = 'Sound: tap to resume';
    } else {
      btn.text = 'Sound: off';
    }
    btn.classes.toggle('on', scene.synth.on);
  }
  paint();
  btn.onClick.listen((_) async {
    if (scene.synth.on) {
      await scene.synth.disable();
      prefOn = false;
    } else {
      await scene.synth.enable();
      prefOn = true;
    }
    try { window.localStorage['steam-spring-sound'] = prefOn ? 'on' : 'off'; } catch (_) {}
    paint();
  });

  // expose the live snow amount so a test can prove a sky swipe changes it
  try { _snowProbe = (() => scene.snowAmt).toJS; } catch (_) {}

  document.on['visibilitychange'].listen((_) {
    scene.synth.resumeIfOn();
  });
  window.onResize.listen((_) {
    scene.layout();
  });
}
