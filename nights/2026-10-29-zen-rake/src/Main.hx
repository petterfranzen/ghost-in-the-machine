// Zen Rake — a calm sand garden you rake with one thumb.
// Haxe 4.3 compiled to one JavaScript file; Canvas 2D + Web Audio, no deps.
import js.Browser;
import js.html.CanvasElement;
import js.html.CanvasRenderingContext2D;
import js.html.Element;
import js.html.MouseEvent;
import js.html.PointerEvent;

typedef Dab = { a:Float, d:Float, s:Float };
typedef Stone = { x:Float, y:Float, r:Float, rot:Float, moss:Array<Dab> };

class Main {
  // The rake: seven tines on a shared handle.
  static inline var TINES = 7;
  static inline var TINE_GAP = 15.0;
  static inline var GROOVE = "rgba(150,126,96,0.22)";
  static inline var RIDGE = "rgba(255,252,244,0.30)";

  static var base:CanvasElement;
  static var marks:CanvasElement;
  static var bctx:CanvasRenderingContext2D;
  static var mctx:CanvasRenderingContext2D;
  static var hint:Element;

  static var W:Float = 0;
  static var H:Float = 0;
  static var dpr:Float = 1;
  static var stones:Array<Stone> = [];

  // Deterministic grain so a resize redraws the same garden.
  static var seed:Int = 20261029;

  static var down = false;
  static var hasLast = false;
  static var lastX:Float = 0;
  static var lastY:Float = 0;
  static var fadeAcc:Float = 0;
  static var smoothing:Float = 0;
  static var lastT:Float = 0;
  static var hinted = false;

  // Audio: a looped noise buffer shaped into a soft sand hiss.
  static var audio:Dynamic = null;
  static var hissGain:Dynamic = null;
  static var soundOn = false;
  static var soundBtn:Element;

  static function rnd():Float {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 2147483647.0;
  }

  static function main() {
    base = cast Browser.document.getElementById("sand");
    marks = cast Browser.document.getElementById("marks");
    hint = Browser.document.getElementById("hint");
    soundBtn = Browser.document.getElementById("sound");
    bctx = base.getContext("2d");
    mctx = marks.getContext("2d");
    setSoundLabel();

    layout();

    Browser.window.addEventListener("resize", function(_:Dynamic) layout());
    marks.addEventListener("pointerdown", onDown);
    Browser.window.addEventListener("pointermove", onMove);
    Browser.window.addEventListener("pointerup", onUp);
    Browser.window.addEventListener("pointercancel", onUp);
    (cast Browser.document.getElementById("smooth") : Element)
      .addEventListener("click", function(_:MouseEvent) smoothSand());
    soundBtn.addEventListener("click", function(_:MouseEvent) toggleSound());

    Browser.window.requestAnimationFrame(tick);
  }

  // ---------- layout ----------

  static function layout() {
    W = Browser.window.innerWidth;
    H = Browser.window.innerHeight;
    var ratio:Float = Browser.window.devicePixelRatio;
    dpr = Math.min(ratio > 0 ? ratio : 1.0, 2.0);
    for (cv in [base, marks]) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = W + "px";
      cv.style.height = H + "px";
      cv.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    seed = 20261029;
    makeStones();
    paintSand();
    // A rotated phone gets a freshly smoothed garden; grooves do not survive.
    mctx.clearRect(0, 0, W, H);
    smoothing = 0;
    fadeAcc = 0;
    hasLast = false;
  }

  static function makeStones() {
    var m = Math.min(W, H);
    var defs = [
      {fx: 0.22, fy: 0.30, fs: 0.062},
      {fx: 0.76, fy: 0.44, fs: 0.078},
      {fx: 0.40, fy: 0.79, fs: 0.050},
      {fx: 0.87, fy: 0.82, fs: 0.032}
    ];
    stones = [];
    for (d in defs) {
      var r = Math.max(15.0, Math.min(46.0, m * d.fs));
      var moss:Array<Dab> = [];
      var n = 3 + Std.int(rnd() * 4);
      for (k in 0...n) moss.push({a: rnd() * Math.PI * 2, d: 0.34 + rnd() * 0.62, s: 0.15 + rnd() * 0.20});
      stones.push({x: W * d.fx, y: H * d.fy, r: r, rot: (rnd() - 0.5) * 0.9, moss: moss});
    }
  }

  // ---------- the sand itself (static layer) ----------

  static function paintSand() {
    bctx.clearRect(0, 0, W, H);

    var g = bctx.createLinearGradient(0, 0, W * 0.4, H);
    g.addColorStop(0.0, "#f8f1e2");
    g.addColorStop(0.45, "#f0e6d2");
    g.addColorStop(1.0, "#e3d5bc");
    bctx.fillStyle = g;
    bctx.fillRect(0, 0, W, H);

    // Warm daylight pooled in one corner.
    var glow = bctx.createRadialGradient(W * 0.28, H * 0.15, 0, W * 0.28, H * 0.15, Math.max(W, H) * 0.8);
    glow.addColorStop(0.0, "rgba(255,250,235,0.78)");
    glow.addColorStop(1.0, "rgba(255,250,235,0)");
    bctx.fillStyle = glow;
    bctx.fillRect(0, 0, W, H);

    // Traditional concentric raking around each stone, already at rest.
    bctx.lineCap = "round";
    for (s in stones) {
      var k = 0;
      while (k < 7) {
        var rr = s.r + 11 + k * 9.5;
        var a = 0.125 - k * 0.011;
        bctx.strokeStyle = "rgba(146,124,96," + a + ")";
        bctx.lineWidth = 2.0;
        bctx.beginPath();
        bctx.arc(s.x, s.y, rr, 0, Math.PI * 2);
        bctx.stroke();
        k++;
      }
    }

    // Grain: a scatter of slightly darker and lighter specks.
    var n = Std.int(Math.min(13000.0, W * H / 95.0));
    var i = 0;
    while (i < n) {
      var x = rnd() * W;
      var y = rnd() * H;
      var a = 0.02 + rnd() * 0.06;
      bctx.fillStyle = rnd() < 0.55 ? "rgba(126,104,78," + a + ")" : "rgba(255,253,246," + (a * 1.5) + ")";
      bctx.fillRect(x, y, 1.2 + rnd() * 1.3, 1.2 + rnd() * 1.3);
      i++;
    }

    for (s in stones) paintStone(s);
  }

  static function paintStone(s:Stone) {
    var r = s.r;
    bctx.save();
    bctx.translate(s.x, s.y);
    bctx.rotate(s.rot);
    // A slight oval reads as a real river stone; the rotation then matters.
    bctx.scale(1.14, 0.92);

    bctx.shadowColor = "rgba(96,80,58,0.30)";
    bctx.shadowBlur = 14;
    bctx.shadowOffsetY = 5;
    var g = bctx.createRadialGradient(-r * 0.35, -r * 0.40, r * 0.10, 0, 0, r * 1.35);
    g.addColorStop(0.0, "#c6bfb1");
    g.addColorStop(0.55, "#a29a8b");
    g.addColorStop(1.0, "#7b7466");
    bctx.fillStyle = g;
    bctx.beginPath();
    bctx.arc(0, 0, r, 0, Math.PI * 2);
    bctx.fill();

    bctx.shadowColor = "rgba(0,0,0,0)";
    bctx.shadowBlur = 0;
    bctx.shadowOffsetY = 0;
    bctx.strokeStyle = "rgba(90,80,64,0.20)";
    bctx.lineWidth = 1.2;
    bctx.stroke();

    // Moss settles on the shaded shoulder of each stone.
    for (d in s.moss) {
      var mx = Math.cos(d.a) * r * d.d;
      var my = Math.sin(d.a) * r * d.d;
      var mr = r * d.s;
      var mg = bctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr * 1.25);
      mg.addColorStop(0.0, "rgba(163,178,126,0.92)");
      mg.addColorStop(1.0, "rgba(110,128,86,0)");
      bctx.fillStyle = mg;
      bctx.beginPath();
      bctx.arc(mx, my, mr, 0, Math.PI * 2);
      bctx.fill();
    }
    bctx.restore();
  }

  // ---------- raking ----------

  static function onDown(e:PointerEvent) {
    down = true;
    hasLast = false;
    lastX = e.clientX;
    lastY = e.clientY;
    hideHint();
    ensureAudio();
    if (soundOn && audio != null) audio.resume();
  }

  static function onMove(e:PointerEvent) {
    if (!down) return;
    var x = e.clientX;
    var y = e.clientY;
    if (!hasLast) {
      lastX = x;
      lastY = y;
      hasLast = true;
      return;
    }
    var dx = x - lastX;
    var dy = y - lastY;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < 2.0) return;
    rake(lastX, lastY, x, y, -dy / d, dx / d);
    lastX = x;
    lastY = y;
    setHiss(d);
  }

  static function onUp(_:Dynamic) {
    down = false;
    hasLast = false;
    setHiss(0);
  }

  // Draw one handle-width of grooves between two points. (nx, ny) is the
  // normal to the direction of travel, so the tines always trail straight
  // behind the thumb no matter which way the stroke goes.
  static function rake(x0:Float, y0:Float, x1:Float, y1:Float, nx:Float, ny:Float) {
    mctx.lineCap = "round";
    mctx.lineJoin = "round";

    // Furrows.
    mctx.beginPath();
    var drew = false;
    for (i in 0...TINES) {
      var off = (i - (TINES - 1) / 2.0) * TINE_GAP;
      var ax = x0 + nx * off;
      var ay = y0 + ny * off;
      var bx = x1 + nx * off;
      var by = y1 + ny * off;
      if (blocked((ax + bx) * 0.5, (ay + by) * 0.5)) continue;
      mctx.moveTo(ax, ay);
      mctx.lineTo(bx, by);
      drew = true;
    }
    if (!drew) return;
    mctx.strokeStyle = GROOVE;
    mctx.lineWidth = 3.4;
    mctx.stroke();

    // The little sunlit ridge each tine pushes up beside its furrow.
    mctx.beginPath();
    for (i in 0...TINES) {
      var off = (i - (TINES - 1) / 2.0) * TINE_GAP + 1.9;
      var ax = x0 + nx * off;
      var ay = y0 + ny * off;
      var bx = x1 + nx * off;
      var by = y1 + ny * off;
      if (blocked((ax + bx) * 0.5, (ay + by) * 0.5)) continue;
      mctx.moveTo(ax, ay);
      mctx.lineTo(bx, by);
    }
    mctx.strokeStyle = RIDGE;
    mctx.lineWidth = 1.3;
    mctx.stroke();
  }

  static function blocked(x:Float, y:Float):Bool {
    for (s in stones) {
      var dx = x - s.x;
      var dy = y - s.y;
      if (Math.sqrt(dx * dx + dy * dy) < s.r * 1.2 + 7) return true;
    }
    return false;
  }

  // ---------- fading & the animation loop ----------

  static function tick(t:Float) {
    if (lastT == 0) lastT = t;
    var dt = (t - lastT) / 1000.0;
    lastT = t;
    if (dt < 0) dt = 0;
    if (dt > 0.5) dt = 0.5;

    fadeAcc += dt;
    var a = smoothing > 0 ? 0.22 : 0.0032;
    while (fadeAcc >= 0.25) {
      fadeAcc -= 0.25;
      mctx.save();
      mctx.globalCompositeOperation = "destination-out";
      mctx.fillStyle = "rgba(0,0,0," + a + ")";
      mctx.fillRect(0, 0, W, H);
      mctx.restore();
    }

    if (smoothing > 0) {
      smoothing -= dt;
      if (smoothing <= 0) {
        smoothing = 0;
        mctx.clearRect(0, 0, W, H);
      }
    }

    Browser.window.requestAnimationFrame(tick);
  }

  static function smoothSand() {
    ensureAudio();
    smoothing = 1.6;
    hideHint();
  }

  static function hideHint() {
    if (hinted) return;
    hinted = true;
    hint.classList.add("gone");
  }

  // ---------- sound ----------

  static function ensureAudio() {
    if (audio != null) return;
    try {
      var Ctor:Dynamic = js.Syntax.code("(typeof window!=='undefined' && (window.AudioContext||window.webkitAudioContext))||null");
      if (Ctor == null) return;
      audio = js.Syntax.code("new (window.AudioContext||window.webkitAudioContext)()");
      var sr:Float = audio.sampleRate;
      var len:Int = Std.int(sr * 2.0);
      var buf:Dynamic = audio.createBuffer(1, len, sr);
      var data:Dynamic = buf.getChannelData(0);
      var i = 0;
      while (i < len) {
        data[i] = Math.random() * 2 - 1;
        i++;
      }
      var src:Dynamic = audio.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      var filt:Dynamic = audio.createBiquadFilter();
      filt.type = "bandpass";
      filt.frequency.value = 1150;
      filt.Q.value = 0.7;
      hissGain = audio.createGain();
      hissGain.gain.value = 0;
      src.connect(filt);
      filt.connect(hissGain);
      hissGain.connect(audio.destination);
      src.start(0);
    } catch (e:Dynamic) {
      audio = null;
      hissGain = null;
    }
  }

  static function setHiss(speed:Float) {
    if (audio == null || hissGain == null) return;
    var target = 0.0;
    if (soundOn && down) target = Math.min(0.075, 0.012 + speed * 0.0022);
    try {
      hissGain.gain.setTargetAtTime(target, audio.currentTime, 0.09);
    } catch (e:Dynamic) {}
  }

  static function setSoundLabel() {
    if (audio == null && soundOn) soundOn = false;
    soundBtn.textContent = audio == null && hintedSoundUnavailable ? "sound: unavailable" : (soundOn ? "sound: on" : "sound: off");
    soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
  }

  static var hintedSoundUnavailable = false;

  static function toggleSound() {
    ensureAudio();
    if (audio == null) {
      hintedSoundUnavailable = true;
      setSoundLabel();
      soundBtn.setAttribute("aria-disabled", "true");
      return;
    }
    soundOn = !soundOn;
    setSoundLabel();
    if (soundOn) audio.resume(); else setHiss(0);
  }
}
