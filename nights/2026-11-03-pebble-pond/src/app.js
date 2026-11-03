/* Pebble Pond's host. It does four things and nothing else: instantiate the
 * WebAssembly module, hand it a pointer press and a dt each frame, blit the
 * framebuffer it hands back, and make a soft sound when a pebble lands.
 * All the pond's rules — koi, ripples, the settle — live in Rust. */
(() => {
  'use strict';

  const W = 320, H = 240;
  const stage = document.getElementById('stage');
  const caption = document.getElementById('caption');
  const hint = document.getElementById('hint');
  const soundBtn = document.getElementById('sound');
  const ctx = stage.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = false;

  // --- wasm ---------------------------------------------------------------
  const b64 = (typeof WASM_B64 === 'string' ? WASM_B64 : '').replace(/\s+/g, '');
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const instance = new WebAssembly.Instance(new WebAssembly.Module(bytes), {});
  const pond = instance.exports;

  let seed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
  pond.init(seed);

  const S = { time: 1, settle: 2, lantern: 4, taps: 5, seeks: 8, lastKind: 9 };
  const state = () => new Float32Array(pond.memory.buffer, pond.state_ptr(), pond.state_len());

  let img = null, imgBuf = null, imgData = null;
  function frameBuffer() {
    if (imgBuf !== pond.memory.buffer) {
      imgBuf = pond.memory.buffer;
      img = new Uint8ClampedArray(imgBuf, pond.fb_ptr(), pond.fb_len());
      imgData = new ImageData(img, W, H);
    }
    return imgData;
  }

  // --- sound: silent until the first tap, then three small, soft things ---
  const audio = {
    ctx: null, master: null, on: true,
    wake() {
      if (this.ctx || !this.on) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
    },
    get t() { return this.ctx.currentTime; },
    // a pebble into water: a low sine falling away, plus one soft droplet
    plop() {
      this.wake(); if (!this.ctx) return;
      const c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1100;
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(300, this.t);
      o.frequency.exponentialRampToValueAtTime(120, this.t + 0.14);
      g.gain.setValueAtTime(0.0001, this.t);
      g.gain.exponentialRampToValueAtTime(0.16, this.t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, this.t + 0.42);
      o.connect(g).connect(lp).connect(this.master);
      o.start(this.t); o.stop(this.t + 0.5);
      // the droplet: a very short filtered noise kiss on top
      const n = c.createBufferSource();
      const buf = c.createBuffer(1, c.sampleRate * 0.05 | 0, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      n.buffer = buf;
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.05, this.t);
      ng.gain.exponentialRampToValueAtTime(0.0001, this.t + 0.06);
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
      n.connect(ng).connect(hp).connect(this.master);
      n.start(this.t);
    },
    // a pebble into moss: duller, quieter, no ring
    thud() {
      this.wake(); if (!this.ctx) return;
      const c = this.ctx;
      const buf = c.createBuffer(1, c.sampleRate * 0.09 | 0, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
      const n = c.createBufferSource(); n.buffer = buf;
      const g = c.createGain();
      g.gain.setValueAtTime(0.07, this.t);
      g.gain.exponentialRampToValueAtTime(0.0001, this.t + 0.12);
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
      n.connect(g).connect(lp).connect(this.master);
      n.start(this.t);
    },
    // the bloom, a beat behind: a whisper of a high, fading bell
    shimmer() {
      this.wake(); if (!this.ctx) return;
      const c = this.ctx;
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 660;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, this.t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.022, this.t + 0.09);
      g.gain.exponentialRampToValueAtTime(0.0001, this.t + 1.1);
      o.connect(g).connect(this.master);
      o.start(this.t); o.stop(this.t + 1.2);
    },
  };

  soundBtn.classList.toggle('on', true);
  soundBtn.addEventListener('click', () => {
    audio.on = !audio.on;
    soundBtn.classList.toggle('on', audio.on);
    soundBtn.setAttribute('aria-pressed', String(audio.on));
    if (audio.on) audio.wake();
    else if (audio.master) audio.master.gain.value = 0;
    if (audio.on && audio.master) audio.master.gain.value = 0.55;
    soundBtn.blur();
  });

  // --- the one gesture ----------------------------------------------------
  let teased = 0;
  function toCanvas(clientX, clientY) {
    const r = stage.getBoundingClientRect();
    return [((clientX - r.left) / r.width) * W, ((clientY - r.top) / r.height) * H];
  }
  stage.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const [x, y] = toCanvas(e.clientX, e.clientY);
    const before = state()[S.taps];
    pond.tap(x, y);
    if (state()[S.taps] === before) return; // too soon after the last one
    if (pond.last_kind() === 0) {
      audio.plop();
      setTimeout(() => audio.shimmer(), 90);
    } else {
      audio.thud();
    }
    if (!teased) {
      teased = 1;
      hint.classList.add('gone');
      caption.textContent = 'the koi come to look';
      caption.classList.add('lit');
      setTimeout(() => caption.classList.remove('lit'), 2600);
    }
  });
  // no context menu / long-press selection on a phone
  stage.addEventListener('contextmenu', (e) => e.preventDefault());

  // --- the loop -----------------------------------------------------------
  let last = performance.now();
  let said = '';
  function tick(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    pond.frame(dt);
    ctx.putImageData(frameBuffer(), 0, 0);
    const s = state();
    if (s[S.taps] > 0) {
      const msg = s[S.settle] > 0.25 ? 'ripples, and the whole pond settles'
        : s[S.seeks] > 0 ? 'the koi drift back over the rings'
        : 'the pond is still';
      if (msg !== said) { said = msg; caption.textContent = msg; }
    }
    requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', () => { last = performance.now(); });
  requestAnimationFrame(tick);

  // for check.js, and for anyone curious in a console
  window.PebblePond = { read: state, tap: (x, y) => pond.tap(x, y), exports: pond, W, H };
})();
