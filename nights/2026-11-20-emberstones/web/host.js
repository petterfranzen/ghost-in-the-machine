/* Emberstones - the page: load the wasm, paint its framebuffer, turn gestures
 * into calls, and hand the sim's events to the synth. */
'use strict';

(function () {
  var MAXW = 520, MAXH = 900;
  var S = null, cv = null, g2 = null, img = null;
  var simW = 0, simH = 0, ptr = 0, stride = 0;
  var pressed = false, dragTap = false, lastStone = -1, startX = 0, startY = 0;
  var suppress = 0, soundWanted = false, hinted = false, last = 0;

  var el = {};

  function decode(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function boot() {
    el.stage = document.getElementById('stage');
    el.title = document.getElementById('title');
    el.say = document.getElementById('say');
    el.sound = document.getElementById('sound');
    el.undo = document.getElementById('undo');
    el.again = document.getElementById('again');
    cv = document.getElementById('c');
    g2 = cv.getContext('2d', { alpha: false });
    S = new WebAssembly.Instance(new WebAssembly.Module(decode(SIM_B64)), {}).exports;
    S.init();
    S.seed(visitSeed());
    layout();
    bind();
    last = performance.now();
    requestAnimationFrame(frame);
  }

  /* a fresh circle for each visit, but a reload keeps the same one */
  function visitSeed() {
    var saved = 0;
    try { saved = parseInt(localStorage.getItem('ember.seed') || '0', 10) || 0; } catch (e) { saved = 0; }
    if (!saved) {
      saved = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
      try { localStorage.setItem('ember.seed', String(saved)); } catch (e) { /* private mode */ }
    }
    return saved >>> 0;
  }

  function layout() {
    var vw = Math.max(220, window.innerWidth), vh = Math.max(320, window.innerHeight);
    var aspect = 0.70;                       /* keep a portrait stage on wide screens */
    var w = vw, h = vh;
    if (w / h > aspect) w = h * aspect;   /* wide screens: keep the portrait column, never shrink height */
    w = Math.round(w); h = Math.round(h);
    el.stage.style.width = w + 'px';
    el.stage.style.height = h + 'px';
    var k = Math.min(1, MAXW / w, MAXH / h);
    simW = Math.max(160, Math.round(w * k));
    simH = Math.max(240, Math.round(h * k));
    cv.width = simW; cv.height = simH;
    S.resize(simW, simH);
    ptr = S.rgbaPtr(); stride = S.stride();
    img = g2.createImageData(simW, simH);
  }

  function blit() {
    var src = new Uint8Array(S.memory.buffer, ptr, simH * stride);
    var dst = img.data, row = simW * 4;
    for (var y = 0; y < simH; y++) dst.set(src.subarray(y * stride, y * stride + row), y * row);
    g2.putImageData(img, 0, 0);
  }

  function toSim(e) {
    var r = cv.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * simW / r.width,
      y: (e.clientY - r.top) * simH / r.height
    };
  }

  function say(text, ms) {
    if (!text) { el.say.classList.remove('on'); return; }
    el.say.textContent = text;
    el.say.classList.add('on');
    clearTimeout(say.t);
    say.t = setTimeout(function () { el.say.classList.remove('on'); }, ms || 4200);
  }

  function firstTouch() {
    el.title.classList.add('gone');
    if (!hinted) {
      hinted = true;
      say('tap a stone to wake it · hold one to ask which', 5200);
    }
    if (soundWanted && !EmberAudio.isOn()) setSound(true);
  }

  function setSound(on) {
    var now = EmberAudio.setOn(on);
    el.sound.setAttribute('aria-pressed', now ? 'true' : 'false');
    el.sound.setAttribute('aria-label', now ? 'Sound is on. Turn sound off.' : 'Sound is off. Turn sound on.');
    try { localStorage.setItem('ember.sound', now ? '1' : '0'); } catch (e) { /* private mode */ }
    if (now) say('the valley is listening', 2400);
    return now;
  }

  function onDown(e) {
    e.preventDefault();
    pressed = true; dragTap = false; lastStone = -1;
    var p = toSim(e);
    startX = p.x; startY = p.y;
    S.press(p.x, p.y);
    lastStone = S.stoneAt(p.x, p.y);
    firstTouch();
  }

  function onMove(e) {
    if (!pressed) return;
    var p = toSim(e);
    var dx = p.x - startX, dy = p.y - startY;
    if (dx * dx + dy * dy < 16) return;
    var s = S.stoneAt(p.x, p.y);
    if (s >= 0 && s !== lastStone) { S.tapStone(s); dragTap = true; lastStone = s; }
  }

  function onUp(e) {
    if (!pressed) return;
    pressed = false;
    if (dragTap) {
      S.release(-1000, -1000);       /* the drag already woke its stones */
      suppress = 2;
      dragTap = false;
      return;
    }
    var p = toSim(e);
    S.release(p.x, p.y);
  }

  function bind() {
    cv.addEventListener('pointerdown', onDown, { passive: false });
    cv.addEventListener('pointermove', onMove, { passive: true });
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    el.sound.addEventListener('click', function () { setSound(!EmberAudio.isOn()); });
    el.undo.addEventListener('click', function () { if (S.undoMove() >= 0) say('one stone taken back', 1800); });
    el.again.addEventListener('click', function () { S.restartLevel(); say('the circle is set again', 1800); });
    window.addEventListener('resize', function () { layout(); });
    window.addEventListener('orientationchange', function () { setTimeout(layout, 220); });
    window.addEventListener('visibilitychange', function () { if (!document.hidden) EmberAudio.resume(); });
    window.addEventListener('keydown', keys);
    try { soundWanted = localStorage.getItem('ember.sound') === '1'; } catch (e) { soundWanted = false; }
    if (soundWanted) el.sound.setAttribute('aria-label', 'Sound is off. Turn sound on.');
  }

  function keys(e) {
    var k = e.key.toLowerCase();
    if (k === 'm') setSound(!EmberAudio.isOn());
    else if (k === 'u') { if (S.undoMove() >= 0) say('one stone taken back', 1800); }
    else if (k === 'r') { S.restartLevel(); say('the circle is set again', 1800); }
  }

  var NOTES = {
    2: 'moss remembers a touch',
    3: 'the circle is awake — tap to go on',
    6: 'a deeper circle, and it is dark',
    7: 'that one is warm — it wants to be lit',
    8: 'the keystone is under your thumb',
    9: 'the sky is turning',
    11: 'something drifts in the dark'
  };

  function drain() {
    var n = S.nevents();
    if (n <= 0) return;
    var ev = new Int32Array(S.memory.buffer, S.eventPtr(), n * 3);
    for (var i = 0; i < n; i++) {
      var t = ev[i * 3], a = ev[i * 3 + 1];
      if (t === 10 && suppress > 0) continue;
      EmberAudio.play(t, a, ev[i * 3 + 2]);
      if (NOTES[t]) say(NOTES[t], t === 3 ? 5200 : 3400);
    }
    S.clearEvents();
    if (suppress > 0) suppress--;
  }

  function frame(t) {
    var dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
    last = t;
    S.tick(dt);
    S.render();
    blit();
    drain();
    var n = S.stats(1);
    EmberAudio.scene(n ? S.stats(0) / n : 0, S.stats(2), S.stats(4) ? 1 : 0.6);
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
