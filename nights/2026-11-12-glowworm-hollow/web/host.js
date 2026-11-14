/* Glowworm Hollow - the page. Loads the module, feeds it pointers, blits the
 * frame, and synthesises all the sound. No requests, no dependencies: the wasm
 * arrives base64 inside this file (built by tools/embed.cjs). */
'use strict';
(function () {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d', { alpha: false });
  var btn = document.getElementById('sound');
  var label = btn.querySelector('.label');
  var live = document.getElementById('live');

  /* ------------------------------------------------------------- module */
  var raw = atob(SIM_B64);
  var bytes = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  var sim = new WebAssembly.Instance(new WebAssembly.Module(bytes), {}).exports;
  sim.init();
  if (sim.magic() !== 424242) throw new Error('glowworm: bad module');

  /* ------------------------------------------------------------- motion */
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motion = mq.matches ? 0.35 : 1;
  sim.setMotion(motion);
  if (mq.addEventListener) mq.addEventListener('change', function (e) {
    motion = e.matches ? 0.35 : 1; sim.setMotion(motion);
  });

  /* --------------------------------------------------------- the world */
  var params = new URLSearchParams(location.search);
  var asked = parseInt(params.get('seed'), 10);
  var seed = isFinite(asked) ? (asked >>> 0) : ((Math.random() * 0xffffffff) >>> 0);
  sim.seed(seed);

  var img = null;
  function fit() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var s = Math.round(Math.max(vw / 300, vh / 520));
    s = Math.max(2, Math.min(6, s));
    var w = Math.max(96, Math.floor(vw / s)), h = Math.max(120, Math.floor(vh / s));
    sim.resize(w, h);
    var W = sim.width(), H = sim.height();
    canvas.width = W; canvas.height = H;
    canvas.style.width = (W * s) + 'px';
    canvas.style.height = (H * s) + 'px';
    img = ctx.createImageData(W, H);
    ctx.imageSmoothingEnabled = false;
  }
  fit();
  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fit, 140); });
  window.addEventListener('orientationchange', function () { clearTimeout(rt); rt = setTimeout(fit, 220); });

  function blit() {
    var W = sim.width(), H = sim.height(), stride = sim.stride() * 4;
    var src = new Uint8Array(sim.memory.buffer, sim.rgbaPtr(), stride * H);
    for (var y = 0; y < H; y++) img.data.set(src.subarray(y * stride, y * stride + W * 4), y * W * 4);
    ctx.putImageData(img, 0, 0);
  }

  /* ----------------------------------------------------------- pointers */
  function world(e) {
    var r = canvas.getBoundingClientRect();
    /* keep the fraction: trackpads and zoom give fractional clientX/clientY */
    return {
      x: (e.clientX - r.left) * (sim.width() / r.width),
      y: (e.clientY - r.top) * (sim.height() / r.height)
    };
  }
  function swallow(e) { e.preventDefault(); }
  ['touchstart', 'touchmove', 'contextmenu', 'selectstart', 'dragstart'].forEach(function (t) {
    canvas.addEventListener(t, swallow, { passive: false });
  });
  var held = -1;
  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    held = e.pointerId;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    var p = world(e); sim.press(p.x, p.y);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (held !== e.pointerId) return;
    var p = world(e); sim.moveTo(p.x, p.y);
  });
  function endPointer(e) {
    if (held !== e.pointerId) return;
    held = -1;
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    var p = world(e); sim.release(p.x, p.y);
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    e.preventDefault();
    /* aim it at a worm: a keyboard tap must do what a thumb tap does */
    var best = -1, bd = 1e9;
    for (var i = 0; i < sim.wormCount(); i++) {
      var dx = sim.wormPos(i, 0) / 16 - sim.width() * 0.5;
      var dy = sim.wormPos(i, 1) / 16 - sim.height() * 0.36;
      var d2 = dx * dx + dy * dy;
      if (d2 < bd) { bd = d2; best = i; }
    }
    var kx = sim.width() * 0.5, ky = sim.height() * 0.36;
    if (best >= 0) { kx = sim.wormPos(best, 0) / 16; ky = sim.wormPos(best, 1) / 16; }
    sim.press(kx, ky);
    sim.release(kx, ky);
  });

  /* -------------------------------------------------------------- sound */
  var SCALE = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
  var A = { ctx: null, on: false, master: null, comp: null, bed: false, noise: null };
  var BED = { drone: null, water: null, pad: null };

  function noiseBuffer(seconds) {
    if (A.noise) return A.noise;
    var n = Math.floor(A.ctx.sampleRate * seconds);
    var buf = A.ctx.createBuffer(1, n, A.ctx.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < n; i++) {
      var w = Math.random() * 2 - 1;
      last = 0.94 * last + 0.06 * w;      /* a little low-passed: soft, not bright */
      d[i] = last * 2.2 + w * 0.3;
    }
    A.noise = buf;
    return buf;
  }
  function ensureAudio() {
    if (A.ctx) return;
    var C = window.AudioContext || window.webkitAudioContext;
    A.ctx = new C();
    A.master = A.ctx.createGain();
    A.master.gain.value = 0.0001;
    A.comp = A.ctx.createDynamicsCompressor();
    A.comp.threshold.value = -16; A.comp.knee.value = 14; A.comp.ratio.value = 5;
    A.comp.attack.value = 0.007; A.comp.release.value = 0.28;
    A.master.connect(A.comp); A.comp.connect(A.ctx.destination);
  }
  function env(g, t0, atk, dur, peak) {
    g.gain.cancelScheduledValues(t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + atk + dur);
  }
  function tone(freq, type, t0, dur, peak, bend) {
    var o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (bend) o.frequency.exponentialRampToValueAtTime(Math.max(22, freq * bend), t0 + dur);
    env(g, t0, Math.min(0.025, dur * 0.25), dur, peak);
    o.connect(g); g.connect(A.master);
    o.start(t0); o.stop(t0 + dur + 0.06);
  }
  function bell(freq, t0, dur, peak) {
    bellAt(freq, t0, dur, peak, A.master);
  }
  function bellAt(freq, t0, dur, peak, dest) {
    [1, 1.5, 2.02, 2.98].forEach(function (mult, k) {
      var o = A.ctx.createOscillator(), g = A.ctx.createGain();
      o.type = k ? 'sine' : 'triangle';
      o.frequency.value = freq * mult;
      env(g, t0, 0.014, dur * (1 - k * 0.18), peak * (k ? 0.45 / k : 1));
      o.connect(g); g.connect(dest);
      o.start(t0); o.stop(t0 + dur + 0.1);
    });
  }
  function hiss(t0, dur, freq, q, peak, sweep) {
    var s = A.ctx.createBufferSource();
    s.buffer = noiseBuffer(2.5); s.loop = true;
    var f = A.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t0); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(80, freq * sweep), t0 + dur);
    var g = A.ctx.createGain();
    env(g, t0, dur * 0.3, dur, peak);
    s.connect(f); f.connect(g); g.connect(A.master);
    s.start(t0); s.stop(t0 + dur + 0.1);
  }
  function bedGainFor(node) { return node; }

  function startBed() {
    var t0 = A.ctx.currentTime;
    /* layer one: a cave drone */
    var dg = A.ctx.createGain(); dg.gain.value = 0.0001;
    var lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 200; lp.Q.value = 0.8;
    [55, 82.5].forEach(function (f, k) {
      var o = A.ctx.createOscillator(), g = A.ctx.createGain();
      o.type = k ? 'sine' : 'triangle'; o.frequency.value = f; g.gain.value = k ? 0.5 : 0.8;
      o.connect(g); g.connect(lp); o.start();
    });
    var lfo = A.ctx.createOscillator(), lg = A.ctx.createGain();
    lfo.frequency.value = 0.041; lg.gain.value = 70;
    lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    lp.connect(dg); dg.connect(A.master);
    /* layer two: water, livelier as the cave fills with light */
    var wg = A.ctx.createGain(); wg.gain.value = 0.0001;
    var bp = A.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 640; bp.Q.value = 0.9;
    var ns = A.ctx.createBufferSource(); ns.buffer = noiseBuffer(3); ns.loop = true;
    ns.connect(bp); bp.connect(wg); wg.connect(A.master); ns.start();
    var lfo2 = A.ctx.createOscillator(), lg2 = A.ctx.createGain();
    lfo2.frequency.value = 0.07; lg2.gain.value = 240;
    lfo2.connect(lg2); lg2.connect(bp.frequency); lfo2.start();
    /* layer three: a slow pad under everything */
    var pg = A.ctx.createGain(); pg.gain.value = 0.0001;
    [220, 329.63].forEach(function (f, k) {
      var o = A.ctx.createOscillator(), g = A.ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; g.gain.value = k ? 0.4 : 0.65;
      o.connect(g); g.connect(pg); o.start();
    });
    pg.connect(A.master);
    var lfo3 = A.ctx.createOscillator(), lg3 = A.ctx.createGain();
    lfo3.frequency.value = 0.05; lg3.gain.value = 0.02;
    lfo3.connect(lg3); lg3.connect(pg.gain); lfo3.start();
    BED = { drone: dg, water: wg, pad: pg, lp: lp, bp: bp };
    A.bed = true;
  }
  function bedUp(seconds) {
    var t = A.ctx.currentTime, s = seconds || 0.35;
    BED.drone.gain.cancelScheduledValues(t);
    BED.drone.gain.setValueAtTime(Math.max(0.0001, BED.drone.gain.value), t);
    BED.drone.gain.exponentialRampToValueAtTime(0.085, t + s);
    BED.water.gain.cancelScheduledValues(t);
    BED.water.gain.setValueAtTime(Math.max(0.0001, BED.water.gain.value), t);
    BED.water.gain.exponentialRampToValueAtTime(0.045, t + s + 0.15);
    BED.pad.gain.cancelScheduledValues(t);
    BED.pad.gain.setValueAtTime(Math.max(0.0001, BED.pad.gain.value), t);
    BED.pad.gain.exponentialRampToValueAtTime(0.03, t + s + 0.5);
  }
  function bedDown(seconds) {
    var t = A.ctx.currentTime, s = seconds || 0.25;
    [BED.drone, BED.water, BED.pad].forEach(function (g) {
      if (!g) return;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + s);
    });
  }
  var bedTick = 0;
  function bedFollow(dt) {
    if (!A.on && !A.bed) return;
    bedTick += dt;
    if (bedTick < 0.5) return;
    bedTick = 0;
    var t = A.ctx.currentTime;
    var lit = Math.min(1, sim.stats(0) / 16);
    BED.water.gain.setTargetAtTime(0.03 + 0.055 * lit, t, 0.9);
    BED.drone.gain.setTargetAtTime(0.075 + 0.03 * lit, t, 0.9);
    BED.pad.gain.setTargetAtTime(0.028 + (sim.stats(1) ? 0.035 : 0), t, 1.4);
  }

  function sound(type, a, b) {
    if (!A.on) return;
    var t = A.ctx.currentTime;
    var k = Math.max(0, Math.min(9, Math.round(a)));
    if (type === 1) {
      if (b > 0.5) bell(SCALE[(k + 3) % 10] * 2, t, 1.3, 0.16);
      else { tone(SCALE[k % 10], 'triangle', t, 0.8, 0.2); tone(SCALE[k % 10] * 2, 'sine', t, 0.55, 0.07); }
    } else if (type === 2) {
      tone(SCALE[k % 10] * 0.5, 'sine', t, 1.5, 0.11);
    } else if (type === 3) {
      [0, 2, 3, 5].forEach(function (n) { tone(SCALE[n + 2] * 1.5, 'triangle', t + n * 0.1, 0.5, 0.13); });
    } else if (type === 4) {
      [0, 2, 4].forEach(function (n) { tone(SCALE[n] * 2, 'sine', t + n * 0.06, 2.4, 0.085); });
    } else if (type === 5) {
      tone(55, 'sawtooth', t, 3.6, 0.1, 1.6);
      hiss(t, 3.0, 300, 0.7, 0.07, 2.2);
      bell(110, t + 0.4, 3.4, 0.09);
    } else if (type === 6) {
      bell(880, t, 3.4, 0.2); bell(1320, t + 0.02, 3.0, 0.1);
    } else if (type === 7) {
      hiss(t, 1.5, 950, 0.8, 0.15, 0.34);
    } else if (type === 8) {
      tone(1500, 'sine', t, 0.16, 0.07, 0.55);
      hiss(t, 0.09, 2600, 1.1, 0.05, 1);
    } else if (type === 9) {
      tone(760, 'sine', t, 0.34, 0.14, 0.42);
      hiss(t, 0.22, 1500, 0.8, 0.05, 0.5);
    } else if (type === 10) {
      tone(1568, 'sine', t, 0.16, 0.11); tone(2093, 'sine', t + 0.14, 0.2, 0.09);
    } else if (type === 11) {
      tone(SCALE[3] * 2, 'sine', t, 1.8, 0.09); tone(SCALE[5] * 2, 'sine', t + 0.3, 2.0, 0.075);
    } else if (type === 12) {
      [0, 3, 5, 7].forEach(function (n, j) { bell(SCALE[n] * 2, t + j * 0.42, 2.6, 0.13); });
    }
  }

  /* what the page says out loud: one line per frame, most interesting first */
  var lastSay = -99;
  var said = null;
  function say(text, t) {
    said = text;
  }
  function flushSay(now) {
    if (!said) return;
    if (now - lastSay < 1.2) return;
    lastSay = now;
    live.textContent = '';
    var t = said; said = null;
    setTimeout(function () { live.textContent = t; }, 30);
  }
  var PRIORITY = { 6: 6, 5: 5, 10: 4, 12: 3, 11: 2, 1: 1 };
  function words(type) {
    if (type === 6) return 'A moth carved in the rock begins to glow.';
    if (type === 5) return 'The elder worm wakes, and the whole cave brightens.';
    if (type === 10) return 'A pale skater crosses the water.';
    if (type === 12) return 'The worms light one by one into a pattern.';
    if (type === 11) return 'A worm flickers in the dark.';
    if (type === 1) return 'A glow-worm wakes.';
    return null;
  }

  /* --------------------------------------------------------- sound button */
  function store(v) { try { localStorage.setItem('glowworm.sound', v); } catch (e) {} }
  function stored() { try { return localStorage.getItem('glowworm.sound'); } catch (e) { return null; } }
  function paint() {
    btn.setAttribute('aria-pressed', A.on ? 'true' : 'false');
    btn.setAttribute('aria-label', A.on ? 'Sound on' : 'Sound off');
    label.textContent = A.on ? 'Sound on' : 'Sound off';
  }
  function setSound(on) {
    if (on) {
      ensureAudio();
      var p = A.ctx.resume();
      if (p && p.catch) p.catch(function () {});
      A.on = true;
      var t = A.ctx.currentTime;
      A.master.gain.cancelScheduledValues(t);
      A.master.gain.setValueAtTime(Math.max(0.0001, A.master.gain.value), t);
      A.master.gain.exponentialRampToValueAtTime(0.62, t + 0.3);
      if (!A.bed) startBed();
      bedUp(0.35);
      bell(880, t + 0.01, 0.9, 0.2);           /* the chime that says "it works" */
      tone(1320, 'sine', t + 0.12, 0.7, 0.1);
      store('1');
    } else {
      A.on = false;
      if (A.ctx) {
        bedDown(0.22);
        var t2 = A.ctx.currentTime;
        A.master.gain.cancelScheduledValues(t2);
        A.master.gain.setValueAtTime(Math.max(0.0001, A.master.gain.value), t2);
        A.master.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.24);
      }
      store('0');
    }
    paint();
  }
  btn.addEventListener('click', function (e) { e.preventDefault(); setSound(!A.on); });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && A.on && A.ctx && A.ctx.state !== 'running') {
      var p = A.ctx.resume(); if (p && p.catch) p.catch(function () {});
    }
  });
  var pref = stored();
  if (pref === '1') btn.title = 'Sound was on last visit';
  paint();

  /* ------------------------------------------------- a read-only handle */
  /* So the browser check can find goals and prove a frame was painted,
   * instead of guessing coordinates that break when the layout changes. */
  window.glowworm = {
    seed: function () { return seed; },
    size: function () {
      var r = canvas.getBoundingClientRect();
      return { w: sim.width(), h: sim.height(), scale: sim.width() ? r.width / sim.width() : 0 };
    },
    stats: function () {
      return {
        lit: sim.stats(0), elder: sim.stats(1), rune: sim.stats(2), mite: sim.stats(3),
        stars: sim.stats(4), hint: sim.stats(8), worms: sim.wormCount(), t: sim.stats(5) / 10
      };
    },
    worm: function (i) { return { x: sim.wormPos(i, 0) / 16, y: sim.wormPos(i, 1) / 16, glow: sim.wormPos(i, 2) / 1000 }; },
    pixel: function (x, y) { return [sim.shade(x, y, 0), sim.shade(x, y, 1), sim.shade(x, y, 2)]; },
    light: function (x, y) { return sim.lightAt(x, y); },
    sound: function () { return { on: A.on, ctx: !!A.ctx, state: A.ctx ? A.ctx.state : 'none', gain: A.master ? A.master.gain.value : 0 }; }
  };

  /* ------------------------------------------------------------- the loop */
  var last = performance.now();
  var announced = 0;
  function loop(now) {
    var dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    sim.tick(dt);
    var n = sim.nevents();
    if (n) {
      var ev = new Float32Array(sim.memory.buffer, sim.eventPtr(), n * 3);
      var best = 0;
      for (var i = 0; i < n; i++) {
        var type = ev[i * 3], a = ev[i * 3 + 1], b = ev[i * 3 + 2];
        sound(type, a, b);
        var pr = PRIORITY[type] || 0;
        if (pr > best) { best = pr; var w = words(type); if (w) say(w, now / 1000); }
      }
      sim.clearEvents();
    }
    flushSay(now / 1000);
    bedFollow(dt);
    blit();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
