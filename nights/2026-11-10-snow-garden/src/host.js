// Snow Garden host. Loads the compiled simulation, sizes the snow field to the
// viewport, turns a tap, a drag and a long press into gestures, blits the
// colour-index frame it gets back and — only when the reader asks — makes a sound.
(() => {
  'use strict';

  const MAXW = 180, MAXH = 280;
  const WASM_B64 = '__WASM_B64__';

  const scene = document.getElementById('scene');
  const canvas = document.getElementById('stage');
  const hint = document.getElementById('hint');
  const soundBtn = document.getElementById('sound');
  // blitted with putImageData and read back by tools/browser-check.cjs: the
  // software path keeps the console free of Chromium's readback warning
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });

  // colour index -> RGBA, from the Section 9 tokens: a near-black CRT night,
  // pale phosphor snow, one warm amber lantern. Mirrors src/lib.rs.
  const PALETTE = [
    [0, 0, 0],         //  0 unused
    [6, 11, 9],        //  1 sky, top            (--bg)
    [8, 17, 16],       //  2 sky
    [10, 26, 23],      //  3 sky
    [13, 36, 31],      //  4 sky
    [18, 46, 39],      //  5 sky at the horizon
    [10, 22, 18],      //  6 hedge
    [17, 36, 29],      //  7 hedge, lit
    [26, 52, 44],      //  8 snow, far
    [44, 78, 66],      //  9 snow, shadow
    [74, 112, 96],     // 10 snow, dim
    [120, 164, 142],   // 11 snow, mid
    [176, 210, 190],   // 12 snow, light
    [224, 240, 228],   // 13 snow, bright          (--accent)
    [140, 255, 190],   // 14 accent                (--accent)
    [255, 180, 84],    // 15 amber lamp            (--focus)
    [255, 224, 170],   // 16 lamp core
    [127, 149, 138],   // 17 star, dim             (--text-faint)
    [207, 230, 216],   // 18 star
    [9, 16, 13],       // 19 trunk, dark
    [22, 40, 32],      // 20 trunk
    [14, 24, 20],      // 21 coat, dark
    [36, 66, 54],      // 22 coat
    [91, 231, 216],    // 23 moon                  (--info)
    [46, 84, 72],      // 24 snow, warmed
    [240, 250, 246],   // 25 fresh snow
    [58, 88, 74],      // 26 footprint
    [214, 126, 64],    // 27 fox, light
    [128, 66, 32],     // 28 fox, dark
    [232, 244, 236],   // 29 fox tail tip
    [26, 44, 38],      // 30 bench, dark
    [150, 186, 166],   // 31 bench stone
    [60, 96, 80],      // 32 gate
    [186, 206, 214],   // 33 bird
    [124, 148, 158],   // 34 bird, wing
  ];
  const pal = new Uint8Array(PALETTE.length * 4);
  PALETTE.forEach((c, i) => { pal[i * 4] = c[0]; pal[i * 4 + 1] = c[1]; pal[i * 4 + 2] = c[2]; pal[i * 4 + 3] = 255; });

  let sim = null, mem = null, imgData = null, curW = 0, curH = 0;
  let offs = 0, last = 0;
  let idleTimer = 0, hintStep = 0, idleClock = 0;
  let actx = null, soundOn = false, noiseBuf = null, lastSound = 0;

  function fromB64(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function boot() {
    const mod = await WebAssembly.instantiate(fromB64(WASM_B64), {});
    sim = mod.instance.exports;      // the async form returns { instance }
    mem = sim.memory;

    sim.seed(20261110);             // the same garden every visit
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = m => sim.set_reduce(m.matches ? 1 : 0);
    apply(mq);
    if (mq.addEventListener) mq.addEventListener('change', apply);

    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', () => setTimeout(layout, 250));
    bindInput();
    // no focus on load: the canvas is reachable with Tab, and a programmatic
    // focus would draw the keyboard focus ring over the scene for everyone
    requestAnimationFrame(loop);
  }

  function layout() {
    const vw = Math.max(1, Math.floor(scene.clientWidth || window.innerWidth));
    const vh = Math.max(1, Math.floor(scene.clientHeight || window.innerHeight));
    const px = Math.max(3, Math.ceil(vw / MAXW), Math.ceil(vh / MAXH));
    const w = Math.max(24, Math.floor(vw / px));
    const h = Math.max(40, Math.floor(vh / px));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = (w * px) + 'px';
    canvas.style.height = (h * px) + 'px';
    sim.resize(w, h);
    imgData = ctx.createImageData(w, h);
    const d = imgData.data;
    for (let i = 3; i < d.length; i += 4) d[i] = 255;
    curW = w; curH = h;
    offs = Math.max(2, Math.round(h * px * 0.012));
  }

  // The module keeps a fixed-width canvas (stride x MAXH), so a frame at the
  // viewport's width is copied out row by row.
  function blit() {
    const st = sim.stride();
    const src = new Uint8Array(mem.buffer, sim.frame(), st * curH);
    const d = imgData.data;
    for (let y = 0; y < curH; y++) {
      let s = y * st, j = y * curW * 4;
      for (let x = 0; x < curW; x++, s++, j += 4) {
        const c = src[s] << 2;
        d[j] = pal[c]; d[j + 1] = pal[c + 1]; d[j + 2] = pal[c + 2];
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function loop(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    idleClock += dt;
    sim.step(dt);
    sim.render();
    blit();
    const a = sim.amount();
    canvas.style.transform = a > 0.002 || a < -0.002 ? 'translateY(' + (-a * offs).toFixed(1) + 'px)' : '';
    drain();
    requestAnimationFrame(loop);
  }

  // ---- events: sound and the one polite announcement -----------------------

  // When several things happen between two frames, the rarest one speaks.
  const RANK = { 2: 8, 7: 8, 9: 7, 8: 7, 10: 7, 5: 6, 6: 6, 3: 5, 4: 5 };
  const SAYS = {
    2: 'a fox crosses the garden',
    3: 'the lantern wakes \u2014 the snow warms around it',
    4: 'the lantern dims',
    5: 'the snow comes down heavier for a moment, then settles',
    6: 'the tree shakes off a soft puff of snow',
    7: 'the tree shakes off its snow, and the bird flutters to the other perch',
    8: 'a small snowman stands in the snow',
    9: 'three snowmen already stand \u2014 the oldest settles back in',
    10: 'the snowman topples over and settles back into the snow',
  };

  function drain() {
    let best = 0, rank = 0;
    let e = sim.poll();
    while (e !== 0) {
      if (e === 1) { if (soundOn) playStep(); }
      else if (e === 3) { if (soundOn) playBell(1); }
      else if (e === 4) { if (soundOn) playBell(0); }
      else if (e === 2) { if (soundOn) playFox(); }
      else if (e === 5) { if (soundOn) playWind(); }
      else if (e === 8) { if (soundOn) playStep(); }
      else if (e === 10) { if (soundOn) playThud(); }
      const r = RANK[e] || 0;
      if (r > rank) { rank = r; best = e; }
      e = sim.poll();
    }
    if (best && SAYS[best]) say(SAYS[best]);
  }

  let sayTimer = 0;
  function say(msg, ms) {
    hint.textContent = msg;
    hint.classList.add('show');
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => hint.classList.remove('show'), ms || 4200);
  }

  // ---- input ---------------------------------------------------------------
  //
  // One thumb does three things. A tap sends the walker; a drag draws a groove
  // through the snow (or raises a flurry if it crosses the sky); holding still
  // rolls a snowball that becomes a snowman when you let go.

  function toCell(e) {
    const r = canvas.getBoundingClientRect();
    // clientX/clientY are fractional doubles on real devices (page zoom, some
    // trackpads, high-DPI screens). Pass them through untouched.
    return {
      x: (e.clientX - r.left) / r.width * curW,
      y: (e.clientY - r.top) / r.height * curH,
    };
  }

  const HINTS = [
    'tap the snow \u2014 the walker trudges there, and the garden settles',
    'drag through the snow to draw, or swipe the sky for heavier snow',
    'press and hold to roll a snowball. the tree shakes; the bench calls the fox.',
  ];

  function quiet() {
    idleClock = 0;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (hintStep < HINTS.length) { say(HINTS[hintStep], 6000); hintStep++; }
    }, 12000);
  }

  function doTap(x, y) {
    sim.tap(x, y);
    quiet();
  }

  function bindInput() {
    const DRAG_PX = 6;    // CSS px of movement before a press becomes a drag
    const HOLD_MS = 340;  // a still press this long starts rolling a ball
    let down = null;

    canvas.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      const p = toCell(e);
      down = { id: e.pointerId, x0: e.clientX, y0: e.clientY, cell: p, drawing: false, rolling: false, hold: 0 };
      down.hold = setTimeout(() => {
        if (!down || down.drawing) return;
        down.rolling = true;
        sim.press(p.x, p.y);
      }, HOLD_MS);
      quiet();
    });

    canvas.addEventListener('pointermove', e => {
      if (!down || e.pointerId !== down.id) return;
      const p = toCell(e);
      if (down.rolling) { sim.press_move(p.x, p.y); return; }
      if (down.drawing) { sim.stroke(p.x, p.y); return; }
      const dx = e.clientX - down.x0, dy = e.clientY - down.y0;
      if (dx * dx + dy * dy > DRAG_PX * DRAG_PX) {
        clearTimeout(down.hold);
        down.drawing = true;
        sim.stroke(p.x, p.y);
      }
    });

    function finish(e) {
      if (!down || (e && e.pointerId !== undefined && e.pointerId !== down.id)) return;
      const d = down;
      down = null;
      clearTimeout(d.hold);
      if (d.rolling) sim.release();
      else if (d.drawing) sim.stroke_end();
      else doTap(d.cell.x, d.cell.y);
    }
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', finish);
    window.addEventListener('pointerup', finish);   // in case capture was refused

    // a held thumb on a canvas must pour, never select: own the gesture
    for (const ev of ['touchstart', 'touchmove', 'contextmenu', 'selectstart', 'dragstart']) {
      canvas.addEventListener(ev, e => e.preventDefault(), { passive: false });
    }
    canvas.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        doTap(curW * 0.62, curH * 0.72);
      }
    });
    soundBtn.addEventListener('click', toggleSound);
    quiet();
  }

  // ---- sound: off until the toggle is pressed ------------------------------

  function toggleSound() {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = soundOn ? '\u266a on' : '\u266a off';
    if (soundOn && !actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) actx = new AC();
    }
    if (actx && actx.state === 'suspended') actx.resume();
    say(soundOn ? 'sound on \u2014 snow underfoot and one small bell' : 'sound off');
  }

  function noise() {
    if (!noiseBuf) {
      const sr = actx.sampleRate;
      noiseBuf = actx.createBuffer(1, Math.floor(sr * 0.4), sr);
      const d = noiseBuf.getChannelData(0);
      let lp = 0;
      for (let i = 0; i < d.length; i++) {
        lp = 0.7 * lp + 0.3 * (Math.random() * 2 - 1);
        d[i] = lp;
      }
    }
    return noiseBuf;
  }

  function playStep() {
    if (!actx) return;
    const now = performance.now();
    if (now - lastSound < 90) return;
    lastSound = now;
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime;
    const src = actx.createBufferSource();
    src.buffer = noise();
    const bp = actx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800 + Math.random() * 900;
    bp.Q.value = 0.9;
    const g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.035, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    src.connect(bp).connect(g).connect(actx.destination);
    src.start(t, Math.random() * 0.2, 0.2);
  }

  function playBell(on) {
    if (!actx) return;
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime;
    const notes = on ? [523.25, 784.0] : [392.0];
    notes.forEach((f, i) => {
      const o = actx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = actx.createGain();
      const t0 = t + i * 0.14;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.055, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
      o.connect(g).connect(actx.destination);
      o.start(t0);
      o.stop(t0 + 1.2);
    });
  }

  function playFox() {
    if (!actx) return;
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime;
    const o = actx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(196.0, t);
    o.frequency.exponentialRampToValueAtTime(146.8, t + 0.7);
    const g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(g).connect(actx.destination);
    o.start(t);
    o.stop(t + 1.0);
  }

  // a snowman packed by hand: one soft, low crunch
  function playThud() {
    if (!actx) return;
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime;
    const src = actx.createBufferSource();
    src.buffer = noise();
    const lp = actx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    const g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    src.connect(lp).connect(g).connect(actx.destination);
    src.start(t, 0, 0.4);
  }

  // a heavier fall: one long, very quiet breath of wind
  function playWind() {
    if (!actx) return;
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime;
    const src = actx.createBufferSource();
    src.buffer = noise();
    src.loop = true;
    const bp = actx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 620;
    bp.Q.value = 0.4;
    const g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    src.connect(bp).connect(g).connect(actx.destination);
    src.start(t);
    src.stop(t + 2.7);
  }

  // a tiny read-only handle, so a check can find its way around the garden
  window.SnowGarden = {
    read: () => ({
      w: sim.probe(1), h: sim.probe(2),
      walker: sim.probe(3), target: sim.probe(4), walking: sim.probe(5),
      lantern: sim.probe(6), fox: sim.probe(7), foxX: sim.probe(8),
      idle: sim.probe(9), footprints: sim.probe(10), settle: sim.probe(11),
      puffs: sim.probe(12), reduce: sim.probe(14), horizon: sim.probe(15),
      lamp: [sim.probe(16), sim.probe(17)], ground: sim.probe(18),
      flurry: sim.probe(21), bird: sim.probe(22),
      birdPos: [sim.probe(23), sim.probe(24)],
      trail: sim.probe(25), rolling: sim.probe(26) === 1,
      ball: sim.probe(27), snowmen: sim.probe(28),
    }),
    snowman: i => ({ x: sim.snowman(i, 0), y: sim.snowman(i, 1), state: sim.snowman(i, 2), size: sim.snowman(i, 3) }),
    tap: (x, y) => { sim.tap(x, y); quiet(); },
    drag: (x, y) => { sim.stroke(x, y); quiet(); },
    penUp: () => sim.stroke_end(),
    press: (x, y) => { sim.press(x, y); quiet(); },
    roll: (x, y) => sim.press_move(x, y),
    release: () => sim.release(),
    pixel: (x, y) => sim.pixel(x, y),
  };

  boot().catch(err => {
    console.error(err);
    say('the garden could not wake (' + err.message + ')', 8000);
  });
})();
