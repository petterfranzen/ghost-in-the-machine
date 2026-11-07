// Aurora Ridge — a quiet pixel-art ridge under an aurora.
//
// Dart, compiled to one plain JavaScript file by build.sh. The scene is drawn
// at 192x108 and scaled up with `image-rendering: pixelated`, so every shape
// keeps a hard pixel edge. All colours are read at runtime from the house
// design system's CSS custom properties (crew/design/tokens), so the scene
// wears whatever theme the page does.
//
// House rules, in code:
//   * sound starts off and the AudioContext is only created inside a click;
//   * `prefers-reduced-motion` removes drift, twinkle and the settle;
//   * a tap gets a soft bloom and a slight settle of the whole scene, never a
//     flash; nothing is timed, scored, or auto-playing.

import 'dart:js_interop';
import 'dart:math';

import 'package:web/web.dart' as web;

const int W = 192; // internal pixel width
const int H = 108; // internal pixel height

final Random rng = Random(20261107);

// ---------------------------------------------------------------- colour ----

int _ch(int c, int shift) => (c >> shift) & 0xff;

String rgba(int c, double a) =>
    'rgba(${_ch(c, 16)}, ${_ch(c, 8)}, ${_ch(c, 0)}, '
    '${a.clamp(0.0, 1.0).toStringAsFixed(3)})';

int mixc(int a, int b, double t) {
  final tt = t.clamp(0.0, 1.0);
  int m(int shift) => (_ch(a, shift) + (_ch(b, shift) - _ch(a, shift)) * tt).round();
  return (m(16) << 16) | (m(8) << 8) | m(0);
}

int bright(int c, double f) {
  int s(int v) => (v * f).round().clamp(0, 255);
  return (s(_ch(c, 16)) << 16) | (s(_ch(c, 8)) << 8) | s(_ch(c, 0));
}

/// Read a CSS custom property off :root and parse it as a colour.
int token(String name, int fallback) {
  final el = web.document.documentElement;
  if (el == null) return fallback;
  final raw = web.window.getComputedStyle(el).getPropertyValue(name).trim();
  if (raw.isEmpty) return fallback;
  var s = raw;
  if (s.startsWith('#')) {
    s = s.substring(1);
    if (s.length == 3) s = s.split('').map((c) => '$c$c').join();
    if (s.length >= 6) {
      final v = int.tryParse(s.substring(0, 6), radix: 16);
      if (v != null) return v;
    }
  }
  final m = RegExp(r'rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)').firstMatch(s);
  if (m != null) {
    return (int.parse(m.group(1)!) << 16) |
        (int.parse(m.group(2)!) << 8) |
        int.parse(m.group(3)!);
  }
  return fallback;
}

/// The palette, pulled from the design system with calm fallbacks.
class Palette {
  final int bg, accent, info, success, star, ridgeFar, ridgeNear, haze;
  Palette._(this.bg, this.accent, this.info, this.success, this.star,
      this.ridgeFar, this.ridgeNear, this.haze);

  factory Palette.fromTokens() {
    final bg = token('--bg', 0x060b09);
    final accent = token('--accent', 0x8bffbe);
    final info = token('--info', 0x5be7d8);
    final success = token('--success', 0x4fd68c);
    final star = token('--text', 0xe6f2ea);
    return Palette._(
      bg, accent, info, success, star,
      mixc(bg, accent, 0.10), // far ridge: a whisper of the accent
      mixc(bg, accent, 0.20), // near ridge
      mixc(bg, info, 0.10),   // horizon haze
    );
  }
}

// ------------------------------------------------------------------ scene ----

class Star {
  final double x, y, phase, speed;
  Star(this.x, this.y, this.phase, this.speed);
}

class Pine {
  final double x, base, height;
  Pine(this.x, this.base, this.height);
}

class Ribbon {
  double x0;
  final double width;
  double age = 0;
  double ttl;
  final double phase;
  double amp;
  final double height;
  final double baseY;
  final int c1, c2;
  final web.HTMLCanvasElement strip;
  final double wobble; // how fast the curtain breathes

  Ribbon({
    required this.x0,
    required this.width,
    required this.ttl,
    required this.phase,
    required this.amp,
    required this.height,
    required this.baseY,
    required this.c1,
    required this.c2,
    required this.strip,
    required this.wobble,
  });

  /// Fade in gently, hold, then fade out slowly. Nothing ever snaps.
  double get fade {
    final inPart = (age / 1.5).clamp(0.0, 1.0);
    final outPart = ((ttl - age) / 3.5).clamp(0.0, 1.0);
    return (inPart < outPart ? inPart : outPart).clamp(0.0, 1.0);
  }

  bool get dead => age >= ttl;
}

web.HTMLCanvasElement _stripCanvas(int c1, int c2) {
  final cv = web.HTMLCanvasElement()
    ..width = 1
    ..height = 64;
  final ctx = cv.getContext('2d') as web.CanvasRenderingContext2D;
  final g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0.00, rgba(c1, 0.0));
  g.addColorStop(0.28, rgba(c2, 0.22));
  g.addColorStop(0.58, rgba(c2, 0.85));
  g.addColorStop(0.82, rgba(c1, 0.35));
  g.addColorStop(1.00, rgba(c1, 0.0));
  ctx
    ..fillStyle = g
    ..fillRect(0, 0, 1, 64);
  return cv;
}

class Scene {
  final web.HTMLCanvasElement canvas;
  final web.CanvasRenderingContext2D ctx;
  final Palette p;
  final bool reduce;

  late List<String> skyRows;
  final List<Star> stars = [];
  final List<Pine> pines = [];
  final List<int> ridgeFar = [];
  final List<int> ridgeNear = [];
  final List<Ribbon> ribbons = [];

  double t = 0;       // seconds
  double pulse = 0;   // tap bloom, 0..1
  double settle = 0;  // scene settle offset, px
  double settleV = 0;
  num? _lastFrame;

  web.AudioContext? _audio;
  bool soundOn = false;
  int _noteIx = 0;

  Scene(this.canvas, this.p, this.reduce) : ctx = canvas.getContext('2d') as web.CanvasRenderingContext2D {
    ctx.imageSmoothingEnabled = false;
    _buildSky();
    _buildRidges();
    _buildStars();
  }

  void attachAudio(web.AudioContext a) => _audio = a;

  // ---- generation ----------------------------------------------------------

  void _buildSky() {
    final top = bright(p.bg, 0.75);
    final horizon = mixc(p.bg, p.haze, 0.9);
    skyRows = List<String>.generate(H, (y) {
      final t01 = (y / (H * 0.72)).clamp(0.0, 1.0);
      return rgba(mixc(top, horizon, t01 * t01), 1.0);
    });
  }

  List<int> _ridge(double baseY, double amp, double seed) {
    final ys = List<int>.filled(W, baseY.round());
    for (var x = 0; x < W; x++) {
      final u = x / W;
      final h = amp * (0.62 * sin(u * 6.1 + seed) +
              0.28 * sin(u * 13.3 + seed * 1.7) +
              0.10 * sin(u * 27.0 + seed * 2.3));
      ys[x] = (baseY - h.abs()).round();
    }
    return ys;
  }

  void _buildRidges() {
    ridgeFar.addAll(_ridge(H * 0.66, 9.0, 0.7));
    ridgeNear.addAll(_ridge(H * 0.78, 11.0, 2.4));
    for (var i = 0; i < 8; i++) {
      final x = 12.0 + rng.nextDouble() * (W - 24);
      final ix = x.round().clamp(0, W - 1);
      pines.add(Pine(x, ridgeNear[ix].toDouble(), 5.0 + rng.nextDouble() * 6.0));
    }
  }

  void _buildStars() {
    for (var i = 0; i < 54; i++) {
      final x = rng.nextDouble() * W;
      final y = rng.nextDouble() * (H * 0.60);
      stars.add(Star(x, y, rng.nextDouble() * pi * 2, 0.5 + rng.nextDouble() * 1.4));
    }
  }

  // ---- interaction ---------------------------------------------------------

  /// The opening scene: two quiet ribbons that outlive the first minute, so a
  /// visitor never lands on an empty sky.
  void seed() {
    tapAt(W * 0.40, H * 0.30);
    for (final r in ribbons) {
      r.ttl = 55.0; // outlive the first minute, then fade like any other
    }
    tapAt(W * 0.66, H * 0.34);
  }

  void tapAt(double x, double y) {
    final cx = x.clamp(W * 0.06, W * 0.94);
    final cy = y.clamp(H * 0.08, H * 0.62);
    _spawnRibbon(cx, cy);
    pulse = 1.0;
    if (!reduce) settle += 1.6; // a gentle settle, then ease back
    if (soundOn) {
      // Higher in the sky -> higher note. A calm pentatonic, never a jolt.
      const notes = <double>[
        196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00,
      ];
      final ix = (notes.length - 1 - (cy / (H * 0.62) * (notes.length - 1)).round())
          .clamp(0, notes.length - 1);
      _play(notes[(ix + _noteIx) % notes.length]);
      _noteIx++;
    }
  }

  void _spawnRibbon(double cx, double cy) {
    if (ribbons.length >= 6) ribbons.removeAt(0);
    final c1 = rng.nextBool() ? p.accent : p.success;
    final c2 = rng.nextBool() ? p.info : p.accent;
    ribbons.add(Ribbon(
      x0: cx - 34,
      width: 60.0 + rng.nextDouble() * 34.0,
      ttl: reduce ? 9.0 : 13.0 + rng.nextDouble() * 5.0,
      phase: rng.nextDouble() * pi * 2,
      amp: reduce ? 0.0 : 1.6 + rng.nextDouble() * 2.2,
      height: 26.0 + rng.nextDouble() * 16.0,
      baseY: cy,
      c1: c1,
      c2: c2,
      strip: _stripCanvas(c1, c2),
      wobble: reduce ? 0.0 : 0.5 + rng.nextDouble() * 0.7,
    ));
    _announce();
  }

  // ---- sound ---------------------------------------------------------------

  void _play(double freq) {
    final a = _audio;
    if (a == null) return;
    final now = a.currentTime;
    final gain = a.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);
    gain.connect(a.destination);
    for (final det in const [0.0, 0.004, -0.007]) {
      final o = a.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * (1 + det);
      o.connect(gain);
      o.start();
      o.stop(now + 3.5);
    }
  }

  void _announce() {
    web.document.getElementById('status')?.textContent =
        'A ribbon of light rises over the ridge.';
  }

  // ---- frame ---------------------------------------------------------------

  void start() {
    web.window.requestAnimationFrame(_frame.toJS);
  }

  void _frame(num ms) {
    final last = _lastFrame ?? ms;
    final dt = ((ms - last) / 1000.0).clamp(0.0, 0.05);
    _lastFrame = ms;
    t += dt;
    _step(dt);
    _draw();
    web.window.requestAnimationFrame(_frame.toJS);
  }

  void _step(double dt) {
    pulse = max(0.0, pulse - dt * 1.9);
    if (!reduce) {
      // a lightly damped settle back to rest
      settleV += (-settle * 34.0 - settleV * 9.0) * dt;
      settle += settleV * dt;
    } else {
      settle = 0;
    }
    for (final r in ribbons) {
      r.age += dt;
    }
    ribbons.removeWhere((r) => r.dead);
  }

  void _draw() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    ctx.translate(0, settle.roundToDouble());

    // sky
    for (var y = 0; y < H; y++) {
      ctx
        ..fillStyle = skyRows[y].toJS
        ..fillRect(0, y, W, 1);
    }

    // horizon haze
    ctx
      ..fillStyle = rgba(p.haze, 0.16).toJS
      ..fillRect(0, H * 0.58, W, 6);

    // stars
    for (final s in stars) {
      final a = reduce
          ? 0.55
          : 0.34 + 0.36 * (0.5 + 0.5 * sin(t * 1.3 * s.speed + s.phase));
      ctx
        ..fillStyle = rgba(p.star, a).toJS
        ..fillRect(s.x.floorToDouble(), s.y.floorToDouble(), 1, 1);
    }

    // aurora, blended additively so ribbons glow where they cross
    for (final r in ribbons) {
      _drawRibbon(r);
    }

    // ridges, far to near
    _fillRidge(ridgeFar, p.ridgeFar);
    _fillRidge(ridgeNear, p.ridgeNear);

    // a one-pixel breath of light along each ridge line, so the hills read
    for (var x = 0; x < W; x++) {
      ctx
        ..fillStyle = rgba(mixc(p.ridgeFar, p.accent, 0.22), 0.7).toJS
        ..fillRect(x, ridgeFar[x], 1, 1);
    }
    for (var x = 0; x < W; x++) {
      ctx
        ..fillStyle = rgba(mixc(p.ridgeNear, p.accent, 0.30), 0.8).toJS
        ..fillRect(x, ridgeNear[x], 1, 1);
    }

    // pines on the near ridge, a shade lighter than the hill so they read
    ctx.fillStyle = rgba(mixc(p.ridgeNear, p.accent, 0.34), 1.0).toJS;
    for (final pine in pines) {
      for (var row = 0; row < pine.height.round(); row++) {
        final halfWidth = (row / pine.height) * (pine.height * 0.42);
        final y = pine.base - pine.height + row;
        ctx.fillRect(pine.x - halfWidth, y, max(1.0, halfWidth * 2), 1);
      }
    }

    // the tap bloom: a soft wash of light over everything, never a flash
    if (pulse > 0.01) {
      ctx
        ..globalCompositeOperation = 'lighter'
        ..fillStyle = rgba(p.accent, pulse * 0.055).toJS
        ..fillRect(-4, -4, W + 8, H + 8)
        ..globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }

  /// A curtain of light: the top edge undulates, the bottom settles toward
  /// `baseY`, so each ribbon hangs over the ridge instead of floating as a
  /// band. A wide, faint pass underneath gives it a soft halo.
  void _drawRibbon(Ribbon r) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    final cols = r.width.round();
    for (var i = 0; i < cols; i++) {
      final x = r.x0 + i;
      if (x < -2 || x > W) continue;
      final nx = cols <= 1 ? 0.0 : i / (cols - 1);
      final env = pow(sin(pi * nx), 0.65).toDouble(); // soft, rounded ends
      final sway = r.amp * sin(r.phase + i * 0.11 + t * r.wobble);
      final top = r.baseY - r.height * (0.72 + 0.28 * sin(i * 0.07 + r.phase)) + sway;
      final bottom = r.baseY + 3.0 + sway * 0.35;
      final hgt = max(3.0, bottom - top);
      final flick = 0.74 + 0.26 * sin(t * 1.5 + i * 0.19 + r.phase * 1.7);
      final a = (env * r.fade * flick).clamp(0.0, 1.0);
      if (a <= 0.006) continue;
      // halo
      ctx.globalAlpha = a * 0.22;
      ctx.drawImage(r.strip, (x - 1).toDouble(), top - 2, 3.0, hgt + 4);
      // core
      ctx.globalAlpha = a;
      ctx.drawImage(r.strip, x.toDouble(), top, 1.0, hgt);
    }
    ctx.restore();
  }

  void _fillRidge(List<int> ys, int color) {
    ctx.fillStyle = rgba(color, 1.0).toJS;
    for (var x = 0; x < W; x++) {
      ctx.fillRect(x, ys[x], 1, (H - ys[x]) + 8);
    }
  }
}

// ------------------------------------------------------------------ main ----

void main() {
  final canvas = web.document.getElementById('scene') as web.HTMLCanvasElement?;
  if (canvas == null) return;

  final reduce = web.window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  final scene = Scene(canvas, Palette.fromTokens(), reduce);

  // Pointer: map screen coords onto the 192x108 grid.
  void fromPointer(num clientX, num clientY) {
    final r = canvas.getBoundingClientRect();
    scene.tapAt(
      (clientX - r.left) / r.width * W,
      (clientY - r.top) / r.height * H,
    );
  }

  canvas.addEventListener(
    'pointerdown',
    ((web.PointerEvent e) {
      e.preventDefault();
      fromPointer(e.clientX, e.clientY);
    }).toJS,
  );

  canvas.addEventListener(
    'keydown',
    ((web.KeyboardEvent e) {
      if (e.key == 'Enter' || e.key == ' ') {
        e.preventDefault();
        scene.tapAt(W / 2 + (rng.nextDouble() - 0.5) * 60, H * 0.30);
      }
    }).toJS,
  );

  web.document.getElementById('raise')?.addEventListener(
    'click',
    ((web.Event e) {
      scene.tapAt(W / 2 + (rng.nextDouble() - 0.5) * 70, H * 0.26);
    }).toJS,
  );

  // Sound: off until the user asks for it. The AudioContext is created inside
  // this click handler and nowhere else, so the page never opens an audio
  // channel on load and never autoplays.
  web.document.getElementById('sound')?.addEventListener(
    'click',
    ((web.Event e) {
      final btn = e.currentTarget as web.HTMLElement;
      final label = web.document.getElementById('sound-label');
      if (scene.soundOn) {
        scene.soundOn = false;
        btn.setAttribute('aria-pressed', 'false');
        label?.textContent = 'Sound off';
        return;
      }
      scene._audio ??= web.AudioContext();
      scene._audio!.resume();
      scene.soundOn = true;
      btn.setAttribute('aria-pressed', 'true');
      label?.textContent = 'Sound on';
    }).toJS,
  );

  // A first, quiet ribbon so the ridge is never empty.
  scene.seed();
  scene.start();
}
