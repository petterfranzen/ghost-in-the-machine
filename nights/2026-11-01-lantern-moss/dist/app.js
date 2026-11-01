/* Lantern Moss — the clearing's renderer.
 *
 * The Zig module owns every position; this file only draws what it finds in
 * the float array and forwards taps. The world is 320x240 pixels, scaled up
 * with nearest-neighbour so it reads as pixel art on any screen. */
(function () {
  'use strict';

  var W = 320, H = 240;
  var S_LEN = 256;
  var I = {
    time: 0, cx: 1, cy: 2, tx: 3, ty: 4, facing: 5, walking: 6, bob: 7,
    sx: 8, sy: 9, glow: 10, gathered: 11, complete: 12, awake: 13,
    rix: 14, riy: 15, rage: 16, place_t: 17,
    lights: 20, motes: 48, nmotes: 208
  };
  var L = { x: 0, y: 1, ph: 2, vx: 3, vy: 4, state: 5, glow: 6, seed: 7, stride: 8 };
  var M = { x: 0, y: 1, ph: 2, size: 3, stride: 4 };
  var NLIGHTS = 3, NMOTES = 40;

  var canvas = document.getElementById('stage');
  var ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  var caption = document.getElementById('caption');
  var soundBtn = document.getElementById('sound');
  var hint = document.getElementById('hint');

  var state = null;          // Float32Array view over the wasm memory
  var instance = null;
  var ground = null;         // pre-rendered still layer
  var t0 = 0, last = 0;
  var lastComplete = false, hintTimer = 0;
  var whisperUntil = 0, lastWhisper = -1;
  var WHISPERS = [
    'the stone is still asleep',
    'it remembers a warmer night',
    'three lights wandered off',
    'the moss is patient',
    'it listens when you stand close',
    'something under the rune is breathing'
  ];
  var soundOn = false, audio = null, drone = null;
  var motesSeeded = false;

  /* ---------------------------------------------------------------- colour */
  var C = {
    skyTop: '#171a2e', skyMid: '#2a2340', skyLow: '#463450',
    treeDark: '#141c1c', treeMid: '#1c2a24', treeLit: '#24352a',
    moss: '#2b4235', mossLit: '#39553f', mossDark: '#22352b',
    earth: '#4a4436', stone: '#4b5158', stoneLit: '#6a7178',
    cloak: '#86996b', cloakDark: '#66774f', hood: '#4c5c44',
    face: '#eddcb2', leg: '#2b3628',
    warm: '255,214,150'
  };

  /* deterministic little prng so the still layer is the same every load */
  var seed = 20261101;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function rr(a, b) { return a + (b - a) * rnd(); }
  function ri(a, b) { return Math.floor(rr(a, b + 1)); }

  /* ------------------------------------------------------------ still layer */
  function buildGround() {
    var g = document.createElement('canvas');
    g.width = W; g.height = H;
    var x = g.getContext('2d');
    x.imageSmoothingEnabled = false;
    seed = 20261101;

    // dusk sky
    var sky = x.createLinearGradient(0, 0, 0, 108);
    sky.addColorStop(0, C.skyTop);
    sky.addColorStop(0.55, C.skyMid);
    sky.addColorStop(1, C.skyLow);
    x.fillStyle = sky;
    x.fillRect(0, 0, W, 112);

    // a few early stars, faint
    for (var s = 0; s < 42; s++) {
      var sx = ri(4, W - 4), sy = ri(3, 78);
      x.fillStyle = 'rgba(233,226,255,' + (rr(0.12, 0.55)).toFixed(2) + ')';
      x.fillRect(sx, sy, 1, 1);
    }

    // far treeline: three soft silhouettes, back to front
    var layers = [
      { y: 84, col: '#241f38', amp: 9, step: 11, h: 20 },
      { y: 94, col: C.treeDark, amp: 12, step: 7, h: 26 },
      { y: 106, col: C.treeMid, amp: 14, step: 5, h: 22 }
    ];
    for (var li = 0; li < layers.length; li++) {
      var Lx = layers[li];
      x.fillStyle = Lx.col;
      x.beginPath();
      x.moveTo(0, H);
      for (var px = 0; px <= W; px += Lx.step) {
        var peak = Lx.y + Math.sin(px * 0.09 + li * 2.1) * Lx.amp + Math.sin(px * 0.031 + li) * Lx.amp * 0.7;
        x.lineTo(px, peak - Lx.h * 0.25);
        x.lineTo(px + Lx.step * 0.5, peak - Lx.h * 0.75);
        x.lineTo(px + Lx.step, peak - Lx.h * 0.2);
      }
      x.lineTo(W, H);
      x.closePath();
      x.fill();
    }

    // moss floor
    var gr = x.createLinearGradient(0, 104, 0, H);
    gr.addColorStop(0, C.mossDark);
    gr.addColorStop(0.25, C.moss);
    gr.addColorStop(1, '#2a4033');
    x.fillStyle = gr;
    x.fillRect(0, 104, W, H - 104);

    // dithered texture, patches and soft light pooling near the stone
    for (var i2 = 0; i2 < 2600; i2++) {
      var tx = ri(0, W - 1), ty = ri(104, H - 1);
      var roll = rnd();
      var shade;
      if (roll < 0.45) shade = C.mossDark;
      else if (roll < 0.82) shade = C.mossLit;
      else shade = '#456b4c';
      x.fillStyle = shade;
      x.globalAlpha = rr(0.18, 0.5);
      x.fillRect(tx, ty, 1, 1);
    }
    x.globalAlpha = 1;

    // a paler ring of flat stones around the centre
    for (var st = 0; st < 9; st++) {
      var a = (st / 9) * Math.PI * 2 + 0.3;
      var rx = W * 0.5 + Math.cos(a) * 34;
      var ry = H * 0.44 + 12 + Math.sin(a) * 12;
      x.fillStyle = st % 2 ? '#3c4a44' : '#35423c';
      x.fillRect(Math.round(rx), Math.round(ry), ri(3, 5), 2);
    }

    // ferns and tufts
    for (var f = 0; f < 70; f++) {
      var fx = ri(6, W - 8), fy = ri(112, H - 6);
      var kind = rnd();
      if (kind < 0.55) {
        x.fillStyle = rnd() < 0.5 ? '#3f6045' : '#365540';
        x.fillRect(fx, fy, 1, ri(2, 4));
        x.fillRect(fx + 1, fy - 1, 1, 2);
        x.fillRect(fx - 1, fy - 1, 1, 2);
      } else if (kind < 0.8) {
        // small fern frond
        x.fillStyle = '#41684a';
        for (var q = 0; q < 3; q++) {
          x.fillRect(fx + q, fy - q, 1, 2);
          x.fillRect(fx - q, fy - q, 1, 2);
        }
      } else {
        // a pale flower, one pixel of light
        x.fillStyle = rnd() < 0.5 ? '#d9c9a8' : '#c9b9d8';
        x.fillRect(fx, fy, 1, 1);
      }
    }

    // pebbles
    for (var pb = 0; pb < 26; pb++) {
      x.fillStyle = rnd() < 0.5 ? '#4b5158' : '#3f474d';
      x.fillRect(ri(8, W - 10), ri(118, H - 8), ri(2, 3), 1);
    }

    // edge trees: bigger trunks and canopies down the sides
    drawEdgeTrees(x);

    // soft ground shadow under the stone
    var sg = x.createRadialGradient(W * 0.5, H * 0.44 + 10, 2, W * 0.5, H * 0.44 + 10, 42);
    sg.addColorStop(0, 'rgba(12,20,16,0.55)');
    sg.addColorStop(1, 'rgba(12,20,16,0)');
    x.fillStyle = sg;
    x.fillRect(W * 0.5 - 48, H * 0.44 - 34, 96, 96);

    // the stone itself
    drawStone(x);

    // vignette
    var vg = x.createRadialGradient(W * 0.5, H * 0.48, 60, W * 0.5, H * 0.48, 200);
    vg.addColorStop(0, 'rgba(8,10,16,0)');
    vg.addColorStop(1, 'rgba(8,10,16,0.55)');
    x.fillStyle = vg;
    x.fillRect(0, 0, W, H);

    return g;
  }

  function drawEdgeTrees(x) {
    // left cluster
    canopy(x, 8, 108, 16, C.treeMid);
    canopy(x, 22, 96, 12, C.treeDark);
    canopy(x, -4, 130, 14, C.treeDark);
    x.fillStyle = '#101817';
    x.fillRect(6, 118, 3, 26);
    x.fillRect(20, 106, 2, 22);

    // right cluster
    canopy(x, 306, 104, 16, C.treeMid);
    canopy(x, 292, 120, 12, C.treeDark);
    canopy(x, 314, 138, 12, C.treeDark);
    x.fillStyle = '#101817';
    x.fillRect(305, 116, 3, 26);
    x.fillRect(296, 128, 2, 20);

    // low bushes at the bottom corners
    bush(x, 16, 196, 20);
    bush(x, 286, 204, 22);
    bush(x, 60, 226, 16);
    bush(x, 250, 228, 18);
  }

  function canopy(x, cx, cy, r, col) {
    x.fillStyle = col;
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * Math.PI * 2;
      var rr2 = r * (0.55 + 0.45 * ((i * 7) % 5) / 5);
      x.fillRect(Math.round(cx + Math.cos(a) * rr2), Math.round(cy + Math.sin(a) * rr2 * 0.7), 3, 2);
    }
    x.fillRect(Math.round(cx - r * 0.5), Math.round(cy - 2), Math.round(r), Math.round(r * 0.6));
  }

  function bush(x, bx, by, r) {
    x.fillStyle = '#1b2b22';
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2;
      x.fillRect(Math.round(bx + Math.cos(a) * r * 0.6), Math.round(by + Math.sin(a) * r * 0.35), 3, 2);
    }
    x.fillStyle = '#233828';
    for (var j = 0; j < 6; j++) {
      x.fillRect(Math.round(bx + rr(-r * 0.4, r * 0.4)), Math.round(by - rr(0, r * 0.25)), 2, 2);
    }
  }

  function drawStone(x) {
    var sx = W * 0.5, sy = H * 0.44;
    // body: a squat, rounded boulder built from rows
    x.fillStyle = C.stone;
    x.fillRect(sx - 11, sy - 6, 22, 12);
    x.fillRect(sx - 9, sy - 9, 18, 3);
    x.fillRect(sx - 13, sy - 2, 26, 6);
    x.fillRect(sx - 10, sy + 4, 20, 3);
    // lit face
    x.fillStyle = C.stoneLit;
    x.fillRect(sx - 9, sy - 8, 12, 2);
    x.fillRect(sx - 11, sy - 4, 6, 3);
    // dark base
    x.fillStyle = '#373d43';
    x.fillRect(sx - 8, sy + 6, 17, 2);
    // carved rune: a small ring and a stem
    x.fillStyle = '#2f353b';
    x.fillRect(sx - 2, sy - 4, 4, 1);
    x.fillRect(sx - 3, sy - 3, 1, 4);
    x.fillRect(sx + 2, sy - 3, 1, 4);
    x.fillRect(sx - 2, sy + 1, 4, 1);
    x.fillRect(sx, sy + 2, 1, 2);
    // moss creeping over one shoulder
    x.fillStyle = '#3c5c42';
    x.fillRect(sx - 12, sy - 1, 4, 2);
    x.fillRect(sx + 7, sy + 3, 4, 2);
    x.fillRect(sx - 13, sy + 1, 2, 1);
  }

  /* ------------------------------------------------------------- the walker */
  var SPR = [
    '..hhh..',
    '.hhhhh.',
    '.hfffh.',
    '.hfffh.',
    '..hhh..',
    '.ccccc.',
    'ccccccc',
    'ccccccc',
    '.ccccc.',
    '..l.l..',
    '..l.l..'
  ];
  var SPR_W = 7, SPR_H = 11;

  function drawWalker(x, cx, cy, facing, walking, bob) {
    var step = walking ? (Math.floor(bob) % 2 === 0 ? 1 : -1) : 0;
    var lift = walking ? (Math.floor(bob) % 2 === 0 ? 0 : -1) : 0;
    var bx = Math.round(cx - SPR_W / 2);
    var by = Math.round(cy - SPR_H + lift);

    // shadow
    x.fillStyle = 'rgba(10,16,12,0.35)';
    x.fillRect(bx - 1, Math.round(cy) - 1, SPR_W + 2, 2);

    x.save();
    if (facing < 0) {
      x.translate(bx * 2 + SPR_W, 0);
      x.scale(-1, 1);
    }
    for (var r = 0; r < SPR.length; r++) {
      var row = SPR[r];
      for (var c = 0; c < SPR_W; c++) {
        var ch = row[c];
        if (ch === '.') continue;
        var col = ch === 'h' ? C.hood : ch === 'f' ? C.face : ch === 'c' ? C.cloak : C.leg;
        var px = bx + c, py = by + r;
        if (r >= 9) px += step;          // the legs alternate
        x.fillStyle = col;
        x.fillRect(px, py, 1, 1);
      }
    }
    // cloak hem shading + a warm lantern in the hand
    x.fillStyle = C.cloakDark;
    x.fillRect(bx + (facing < 0 ? 0 : 5), by + 6, 2, 3);
    x.restore();
  }

  /* ------------------------------------------------------------- the lights */
  function drawLight(x, lx, ly, glow, awake) {
    var r = 13 + glow * 4;
    var g = x.createRadialGradient(lx, ly, 0, lx, ly, r);
    var a = 0.30 + 0.16 * glow;
    g.addColorStop(0, 'rgba(' + C.warm + ',' + a.toFixed(2) + ')');
    g.addColorStop(0.45, 'rgba(' + C.warm + ',' + (a * 0.42).toFixed(2) + ')');
    g.addColorStop(1, 'rgba(' + C.warm + ',0)');
    x.globalCompositeOperation = 'lighter';
    x.fillStyle = g;
    x.fillRect(lx - r, ly - r, r * 2, r * 2);
    // core
    x.fillStyle = 'rgba(255,246,220,' + (0.75 + 0.2 * glow).toFixed(2) + ')';
    x.fillRect(Math.round(lx) - 1, Math.round(ly) - 1, 2, 2);
    x.fillStyle = 'rgba(255,236,190,0.55)';
    x.fillRect(Math.round(lx) - 2, Math.round(ly), 4, 1);
    x.fillRect(Math.round(lx), Math.round(ly) - 2, 1, 4);
    x.globalCompositeOperation = 'source-over';
  }

  /* -------------------------------------------------------------------- wasm */
  function decode(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function boot() {
    var bytes = decode(window.WASM_B64);
    WebAssembly.instantiate(bytes, {}).then(function (res) {
      instance = res.instance;
      instance.exports.init();
      state = new Float32Array(instance.exports.memory.buffer, instance.exports.state_ptr(), S_LEN);
      motesSeeded = true;
      requestAnimationFrame(loop);
    }).catch(function (err) {
      console.error('the clearing failed to open:', err);
    });
  }

  /* ------------------------------------------------------------------- sound */
  function ensureAudio() {
    if (audio) return audio;
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { audio = null; }
    return audio;
  }

  function blip(freq, dur, vol, type) {
    if (!soundOn || !audio) return;
    var t = audio.currentTime;
    var o = audio.createOscillator();
    var g = audio.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + dur * 0.35);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(audio.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function chord(freqs, dur, vol) {
    if (!soundOn || !audio) return;
    var t = audio.currentTime;
    freqs.forEach(function (f, i) {
      var o = audio.createOscillator();
      var g = audio.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol / freqs.length, t + 0.15 + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(audio.destination);
      o.start(t); o.stop(t + dur + 0.1);
    });
  }

  function startDrone() {
    if (!soundOn || !audio || drone) return;
    var t = audio.currentTime;
    var g = audio.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.035, t + 2.5);
    var a = audio.createOscillator(), b = audio.createOscillator();
    a.type = 'sine'; a.frequency.value = 110;
    b.type = 'sine'; b.frequency.value = 165.4;
    var f = audio.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 480;
    a.connect(f); b.connect(f); f.connect(g).connect(audio.destination);
    a.start(); b.start();
    drone = { a: a, b: b, g: g };
  }

  /* -------------------------------------------------------------------- loop */
  function loop(now) {
    if (!t0) { t0 = now; last = now; }
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (dt < 0) dt = 0;

    instance.exports.step(dt);

    // read the frame's state
    var time = state[I.time];
    var cx = state[I.cx], cy = state[I.cy];
    var facing = state[I.facing], walking = state[I.walking], bob = state[I.bob];
    var glow = state[I.glow], complete = state[I.complete], awake = state[I.awake];
    var rage = state[I.rage], rix = state[I.rix], riy = state[I.riy];

    ctx.drawImage(ground, 0, 0);

    // the tap ripple, flat on the moss
    if (rage < 1.6) {
      var rad = 4 + rage * 26;
      var alpha = Math.max(0, 0.34 * (1 - rage / 1.6));
      ctx.strokeStyle = 'rgba(220,235,205,' + alpha.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(rix, riy, rad, rad * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(220,235,205,' + (alpha * 0.5).toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(rix, riy, rad * 0.6, rad * 0.33, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // the stone's glow, warm and low
    var sr = 26 + glow * 26 + awake * 40;
    var sg = ctx.createRadialGradient(W * 0.5, H * 0.44 - 2, 1, W * 0.5, H * 0.44 - 2, sr);
    var ga = 0.10 + glow * 0.32 + awake * 0.22;
    sg.addColorStop(0, 'rgba(' + C.warm + ',' + Math.min(0.75, ga).toFixed(2) + ')');
    sg.addColorStop(0.55, 'rgba(' + C.warm + ',' + (ga * 0.35).toFixed(2) + ')');
    sg.addColorStop(1, 'rgba(' + C.warm + ',0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = sg;
    ctx.fillRect(W * 0.5 - sr, H * 0.44 - sr, sr * 2, sr * 2);
    ctx.globalCompositeOperation = 'source-over';

    // the rune, lit from within as the stone wakes
    if (glow > 0.02 || awake > 0.02) {
      ctx.fillStyle = 'rgba(255,228,170,' + Math.min(0.9, glow * 0.9 + awake * 0.5).toFixed(2) + ')';
      var sx = W * 0.5, sy = H * 0.44;
      ctx.fillRect(sx - 2, sy - 4, 4, 1);
      ctx.fillRect(sx - 3, sy - 3, 1, 4);
      ctx.fillRect(sx + 2, sy - 3, 1, 4);
      ctx.fillRect(sx - 2, sy + 1, 4, 1);
      ctx.fillRect(sx, sy + 2, 1, 2);
    }

    // motes: tiny drifting dust, brighter as the stone wakes
    var moteA = 0.20 + awake * 0.35;
    for (var i = 0; i < NMOTES; i++) {
      var mx = state[I.motes + i * M.stride + M.x];
      var my = state[I.motes + i * M.stride + M.y];
      var ph = state[I.motes + i * M.stride + M.ph];
      var sz = state[I.motes + i * M.stride + M.size];
      var tw = 0.55 + 0.45 * Math.sin(time * 1.7 + ph * 3.1);
      ctx.fillStyle = 'rgba(' + C.warm + ',' + (moteA * tw).toFixed(2) + ')';
      var msz = sz > 1.3 ? 2 : 1;
      ctx.fillRect(Math.round(mx), Math.round(my), msz, msz);
    }

    // lights: halo, then core; additive so they glow against the moss
    for (var li = 0; li < NLIGHTS; li++) {
      var lx = state[I.lights + li * L.stride + L.x];
      var ly = state[I.lights + li * L.stride + L.y];
      var lg = state[I.lights + li * L.stride + L.glow];
      drawLight(ctx, lx, ly, lg, awake);
    }

    // walker, drawn last so they sit in front of the clearing
    drawWalker(ctx, cx, cy, facing, walking, bob);

    // an awake clearing breathes a little more light at the edges
    if (awake > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      var ag = ctx.createRadialGradient(W * 0.5, H * 0.44, 20, W * 0.5, H * 0.44, 240);
      ag.addColorStop(0, 'rgba(255,214,150,' + (0.10 * awake).toFixed(3) + ')');
      ag.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }

    // caption / hint state changes
    var gcount = Math.round(state[I.gathered]);
    var whispering = performance.now() < whisperUntil;
    if (whispering) {
      // the stone keeps its line for a few breaths
    } else if (!lastComplete && complete > 0.5) {
      lastComplete = true;
      caption.textContent = 'the stone remembers';
      caption.classList.add('lit');
      hint.classList.add('gone');
      chord([220, 277.2, 329.6], 3.6, 0.18);
      startDrone();
    } else if (complete < 0.5 && !lastComplete) {
      caption.classList.remove('lit');
      caption.textContent = gcount === 0 ? 'three lights are lost here' :
        gcount === 1 ? 'one light is home — two still wander' :
        gcount === 2 ? 'two are home — one last spark' : 'the clearing is almost awake';
    }

    requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------ whisper */
  function stoneWhisper(wx, wy) {
    var sx = W * 0.5, sy = H * 0.44;
    var dx = wx - sx, dy = wy - sy;
    if (dx * dx + dy * dy > 26 * 26) return false;
    var pick = Math.floor(Math.random() * WHISPERS.length);
    if (pick === lastWhisper) pick = (pick + 1) % WHISPERS.length;
    lastWhisper = pick;
    caption.textContent = WHISPERS[pick];
    caption.classList.add('lit');
    whisperUntil = performance.now() + 4000;
    blip(196, 2.2, 0.045, 'sine');
    return true;
  }

  /* ------------------------------------------------------------------- input */
  function toWorld(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    var scale = Math.min(r.width / W, r.height / H);
    var ox = r.left + (r.width - W * scale) / 2;
    var oy = r.top + (r.height - H * scale) / 2;
    return { x: (clientX - ox) / scale, y: (clientY - oy) / scale };
  }

  var dragging = false;

  function onDown(e) {
    e.preventDefault();
    if (!soundOn) {
      // the first touch wakes the sound; a soft, low welcome
      soundOn = true;
      ensureAudio();
      if (audio && audio.state === 'suspended') audio.resume();
      blip(392, 1.4, 0.06, 'sine');
      soundBtn.classList.add('on');
      soundBtn.setAttribute('aria-pressed', 'true');
    }
    dragging = true;
    hint.classList.add('gone');
    var p = toWorld(e.clientX, e.clientY);
    stoneWhisper(p.x, p.y);
    if (instance) instance.exports.tap(p.x, p.y);
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    var p = toWorld(e.clientX, e.clientY);
    if (instance) instance.exports.tap(p.x, p.y);
  }

  function onUp() { dragging = false; }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  soundBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    soundOn = !soundOn;
    if (soundOn) {
      ensureAudio();
      if (audio && audio.state === 'suspended') audio.resume();
      soundBtn.classList.add('on');
      soundBtn.setAttribute('aria-pressed', 'true');
      blip(523, 0.9, 0.05, 'sine');
      if (lastComplete) startDrone();
    } else {
      soundBtn.classList.remove('on');
      soundBtn.setAttribute('aria-pressed', 'false');
      if (drone) {
        try { drone.g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.4); } catch (err) {}
        setTimeout(function () {
          try { drone.a.stop(); drone.b.stop(); } catch (err2) {}
          drone = null;
        }, 500);
      }
    }
  });

  /* --------------------------------------------------------------- footprint */
  // expose a couple of things the smoke test can read without a DOM
  window.LanternMoss = {
    constants: { W: W, H: H, I: I, L: L, M: M },
    read: function () { return state; }
  };

  ground = buildGround();
  boot();
})();
