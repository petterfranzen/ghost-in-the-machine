// Dune Drift host. Loads the simulation, sizes the grid to the viewport,
// turns taps into taps, blits the frame and (only when asked) makes a sound.
(() => {
  'use strict';

  const MAXW = 160, MAXH = 260;
  const WASM_B64 = '__WASM_B64__';

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
  let dragging = false, lastDrag = 0;
  let idleTimer = 0, noted = false, noteTimer = 0;
  let actx = null, soundOn = false, lastSound = 0, noiseBuf = null;

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
    const apply = m => sim.setReduce(m.matches ? 1 : 0);
    apply(mq);
    if (mq.addEventListener) mq.addEventListener('change', apply);

    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', () => setTimeout(layout, 250));
    bindInput();
    canvas.focus({ preventScroll: true });
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
    offs = Math.max(2, Math.round(h * px * 0.012));
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
    const mx = 0.78 * curW, my = 0.17 * curH, mr = Math.max(4, curW * 0.045) + 4;
    const dx = x - mx, dy = y - my;
    return dx * dx + dy * dy <= mr * mr;
  }

  function tapAt(x, y) {
    if (isMoon(x, y)) {
      sim.ripple();
      note('the moon answers — the whole field breathes once');
    } else {
      sim.tap(x, y);
    }
    quiet();
  }

  function bindInput() {
    canvas.addEventListener('pointerdown', e => {
      e.preventDefault();
      dragging = true;
      lastDrag = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      const p = toCell(e);
      tapAt(p.x, p.y);
    });
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      const now = performance.now();
      if (now - lastDrag < 90) return;      // sift, don't smear
      lastDrag = now;
      const p = toCell(e);
      sim.tap(p.x, p.y);
      quiet();
    });
    const end = () => { dragging = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', end);

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
