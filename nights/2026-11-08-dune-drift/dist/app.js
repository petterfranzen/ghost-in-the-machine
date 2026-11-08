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

  const MOON_HOLD = 1300;   // ms a still press rests on the moon before it answers
  const POUR_MS = 150;      // a held finger keeps pouring sand (no text selection)

  function fromB64(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function boot() {
    const { instance } = await WebAssembly.instantiate(fromB64(WASM_B64), {
      env: { abort: () => { throw new Error('simulation aborted'); } },
    });
    sim = instance.exports;
    mem = sim.memory;

    sim.seed(20261108);            // a fixed field, so it looks the same tomorrow
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
