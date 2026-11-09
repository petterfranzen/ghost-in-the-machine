// Dune Drift host. Loads the simulation, sizes the grid to the viewport,
// turns taps into taps, blits the frame and (only when asked) makes a sound.
(() => {
  'use strict';

  const MAXW = 160, MAXH = 260;
  const WASM_B64 = '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';

  const scene = document.getElementById('scene');
  const canvas = document.getElementById('stage');
  const hint = document.getElementById('hint');
  const soundBtn = document.getElementById('sound');
  const ctx = canvas.getContext('2d', { alpha: false });

  // colour index -> RGBA. Taken from the Section 9 tokens so the art and the
  // chrome share one room: a near-black CRT night, phosphor-green light.
  const PALETTE = [
    [0, 0, 0],         //  0 unused
    [6, 11, 9],        //  1 sky, high            (--bg)
    [8, 17, 16],       //  2
    [10, 26, 23],      //  3
    [13, 36, 31],      //  4
    [18, 46, 39],      //  5
    [26, 62, 53],      //  6 sky, near the dunes
    [27, 96, 88],      //  7 ripple glow
    [29, 74, 69],      //  8 moon halo
    [91, 231, 216],    //  9 moon                 (--info)
    [14, 25, 20],      // 10 sand, deep shadow    (--surface-3)
    [22, 40, 31],      // 11 sand, shadow
    [39, 62, 49],      // 12 sand, mid
    [71, 98, 78],      // 13 sand, light
    [136, 176, 148],   // 14 sand, lit face
    [196, 235, 208],   // 15 crest rim
    [127, 149, 138],   // 16 star, dim            (--text-faint)
    [207, 230, 216],   // 17 star, bright
    [157, 179, 167],   // 18 dust                 (--text-muted)
    [219, 242, 229],   // 19 falling grain
  ];
  const pal = new Uint8Array(PALETTE.length * 4);
  PALETTE.forEach((c, i) => { pal[i * 4] = c[0]; pal[i * 4 + 1] = c[1]; pal[i * 4 + 2] = c[2]; pal[i * 4 + 3] = 255; });

  let sim = null, mem = null, imgData = null, curW = 0, curH = 0;
  let offs = 0, last = 0;
  let pressing = false, pressX = 0, pressY = 0, lastPour = 0;
  let moonDown = false, moonHold = 0, moonFired = false, moonGlowVal = 0;
  let reduced = false;
  let idleTimer = 0, noted = false, noteTimer = 0;
  let actx = null, soundOn = false, lastSound = 0, noiseBuf = null;
  let currentSeed = 0;

  const MOON_HOLD = 1300;   // ms a still press rests on the moon before it answers
  const POUR_MS = 150;      // a held finger keeps pouring sand (no text selection)

  function fromB64(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // The landscape is seeded per visit. A numeric ?seed= wins; otherwise draw a
  // fresh 32-bit value so no two visits share a field.
  function readSeed() {
    const want = new URLSearchParams(location.search).get('seed');
    if (want !== null && /^\d{1,10}$/.test(want)) return Number(want) >>> 0;
    return (Math.floor(Math.random() * 0xffffffff) >>> 0);
  }

  async function boot() {
    const { instance } = await WebAssembly.instantiate(fromB64(WASM_B64), {
      env: { abort: () => { throw new Error('simulation aborted'); } },
    });
    sim = instance.exports;
    mem = sim.memory;

    // A fresh field every visit; ?seed=<n> pins one so a particular landscape
    // can be revisited or shared. Seed 0 is remapped inside the simulation.
    currentSeed = readSeed();
    sim.seed(currentSeed);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = m => { reduced = m.matches; sim.setReduce(m.matches ? 1 : 0); };
    apply(mq);
    if (mq.addEventListener) mq.addEventListener('change', apply);

    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', () => setTimeout(layout, 250));
    bindInput();
    canvas.focus({ preventScroll: true });

    // A tiny read-only handle so the headless check can watch the slow press.
    window.DuneDrift = {
      reduce: () => reduced,
      seed: () => currentSeed,
      moon: () => ({ pressing: moonDown, progress: moonHold / MOON_HOLD, fired: moonFired }),
    };

    requestAnimationFrame(loop);
  }

  function layout() {
    const vw = Math.max(1, scene.clientWidth || window.innerWidth);
    const vh = Math.max(1, scene.clientHeight || window.innerHeight);
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
    offs = Math.max(2, Math.round(h * px * 0.010));
  }

  function blit() {
    const n = curW * curH;
    const idx = new Uint8Array(mem.buffer, sim.frame(), n);
    const d = imgData.data;
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      const c = idx[i] << 2;
      d[j] = pal[c]; d[j + 1] = pal[c + 1]; d[j + 2] = pal[c + 2];
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function loop(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;

    // A held finger keeps pouring sand — a long press is a gentle stream, not
    // a text selection.
    if (pressing && !moonDown && now - lastPour > POUR_MS) {
      lastPour = now;
      sim.tap(pressX, pressY);
      quiet();
    }

    // A slow, still press on the moon: nothing shows until it is nearly there.
    if (moonDown && !moonFired) {
      moonHold += dt * 1000;
      const p = Math.min(1, moonHold / MOON_HOLD);
      moonGlowVal = p > 0.45 ? (p - 0.45) / 0.55 : 0;
      sim.setMoonGlow(moonGlowVal * 0.85);
      if (moonHold >= MOON_HOLD) {
        moonFired = true;
        moonGlowVal = 0;
        sim.setMoonGlow(0);
        sim.ripple();
        note('the moon answers — the whole field breathes once');
      }
    }

    sim.step(dt);
    sim.render();
    blit();
    const a = sim.amount();
    canvas.style.transform = a > 0.002 ? 'translateY(' + (a * offs).toFixed(1) + 'px)' : '';
    const ev = sim.poll();
    if (ev > 0) { if (soundOn) playSand(ev); quiet(); }
    requestAnimationFrame(loop);
  }

  // ---- input --------------------------------------------------------------

  function toCell(e) {
    const r = canvas.getBoundingClientRect();
    // clientX/clientY are fractional doubles on real devices (page zoom, some
    // trackpads, high-DPI). Pass them through untouched: never rounded.
    return {
      x: (e.clientX - r.left) / r.width * curW,
      y: (e.clientY - r.top) / r.height * curH,
    };
  }

  function isMoon(x, y) {
    // The secret's target is the drawn disc plus a small margin — no longer a
    // generous box, so it is found by pressing, not by accident.
    const mx = 0.78 * curW, my = 0.17 * curH, mr = Math.max(4, curW * 0.045) + 2;
    const dx = x - mx, dy = y - my;
    return dx * dx + dy * dy <= mr * mr;
  }

  function tapAt(x, y) {
    sim.tap(x, y);
    quiet();
  }

  // Leaving or releasing the moon: a quick press is just a handful of sand,
  // like anywhere else in the sky, so the secret stays unguessed.
  function endMoon() {
    if (moonDown && !moonFired) {
      sim.tap(pressX, pressY);
      quiet();
    }
    moonDown = false;
    moonHold = 0;
    moonGlowVal = 0;
    if (sim) sim.setMoonGlow(0);
  }

  function bindInput() {
    canvas.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      const p = toCell(e);
      pressX = p.x; pressY = p.y;
      lastPour = performance.now();
      if (isMoon(p.x, p.y)) {
        moonDown = true; moonHold = 0; moonFired = false; moonGlowVal = 0;
      } else {
        pressing = true;
        sim.tap(p.x, p.y);        // one handful at once; the loop keeps pouring
        quiet();
      }
    });
    canvas.addEventListener('pointermove', e => {
      const p = toCell(e);
      if (moonDown) {
        if (!isMoon(p.x, p.y)) endMoon();   // drifted off the moon: let it go
        return;
      }
      if (!pressing) return;
      pressX = p.x; pressY = p.y;           // the pour timer reads this
    });
    const end = () => { pressing = false; endMoon(); };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', end);

    // iOS: a long press on the play area must pour sand, never select text,
    // show the magnifier or zoom. touch-action/user-select live in the CSS;
    // these non-passive handlers stop the default gestures outright.
    canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('selectstart', e => e.preventDefault());
    canvas.addEventListener('dragstart', e => e.preventDefault());

    canvas.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        tapAt(curW * 0.5, curH * 0.12);
      }
    });

    soundBtn.addEventListener('click', toggleSound);
  }

  // ---- the quiet hint -----------------------------------------------------

  function quiet() {
    clearTimeout(idleTimer);
    hint.classList.remove('show');
    idleTimer = setTimeout(() => {
      if (noted) return;
      note('tap the sky — a handful of sand sifts down and settles. tap a dune to nudge it.', 6000);
      noted = true;
    }, 6500);
  }

  function note(msg, ms) {
    hint.textContent = msg;
    hint.classList.add('show');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => hint.classList.remove('show'), ms || 3800);
  }

  // ---- sound: off until the toggle ---------------------------------------

  function toggleSound() {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.textContent = soundOn ? '♪ on' : '♪ off';
    if (soundOn && !actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) actx = new AC();
    }
    if (actx && actx.state === 'suspended') actx.resume();
    note(soundOn ? 'sound on — a soft hiss as the sand lands' : 'sound off');
  }

  function hissBuffer() {
    if (!noiseBuf) {
      const sr = actx.sampleRate;
      noiseBuf = actx.createBuffer(1, Math.floor(sr * 0.5), sr);
      const d = noiseBuf.getChannelData(0);
      let lp = 0;
      for (let i = 0; i < d.length; i++) {
        lp = 0.86 * lp + 0.14 * (Math.random() * 2 - 1);
        d[i] = lp * 0.9;
      }
    }
    return noiseBuf;
  }

  function playSand(ev) {
    if (!actx) return;
    const now = performance.now();
    if (now - lastSound < 75) return;
    lastSound = now;
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime;
    const src = actx.createBufferSource();
    src.buffer = hissBuffer();
    src.loop = true;
    const lp = actx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 640 + Math.min(ev, 8) * 45;
    const g = actx.createGain();
    const peak = Math.min(0.13, 0.045 + ev * 0.006);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(lp).connect(g).connect(actx.destination);
    src.start(t);
    src.stop(t + 0.55);
  }

  boot().catch(err => {
    console.error(err);
    note('the sand could not wake (' + err.message + ')', 8000);
  });
})();
