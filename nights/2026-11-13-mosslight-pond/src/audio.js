// All sound is synthesised with Web Audio — oscillators, filtered noise, envelopes.
// No samples. Muted until the sound button is tapped.
(function () {
  const KEY = 'mosslight.sound';
  let ctx = null, master = null, comp = null, ambient = null;
  let waterGain = null, airGain = null, padGain = null, bedGain = null;
  let enabled = false;
  const lanternVoices = {};
  let noiseBuf = null;

  const now = () => ctx.currentTime;
  const rand = (a, b) => a + Math.random() * (b - a);

  function noiseBuffer() {
    const len = ctx.sampleRate * 3;
    const b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;   // brownish
      d[i] = last * 3.2;
    }
    return b;
  }

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.6;
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 4;
    comp.attack.value = 0.01; comp.release.value = 0.3;
    master.connect(comp); comp.connect(ctx.destination);

    ambient = ctx.createGain(); ambient.gain.value = 0; ambient.connect(master);
    bedGain = ctx.createGain(); bedGain.gain.value = 1; bedGain.connect(ambient);
    noiseBuf = noiseBuffer();

    // 1. water: brown noise, low-passed, very slow swell
    const wsrc = ctx.createBufferSource(); wsrc.buffer = noiseBuf; wsrc.loop = true;
    const wf = ctx.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 520; wf.Q.value = 0.4;
    waterGain = ctx.createGain(); waterGain.gain.value = 0.16;
    wsrc.connect(wf); wf.connect(waterGain); waterGain.connect(bedGain);
    const wl = ctx.createOscillator(); wl.frequency.value = 0.06;
    const wlg = ctx.createGain(); wlg.gain.value = 0.05;
    wl.connect(wlg); wlg.connect(waterGain.gain); wl.start();
    wsrc.start();

    // 2. air: high noise, a hush over the water
    const asrc = ctx.createBufferSource(); asrc.buffer = noiseBuf; asrc.loop = true;
    const af = ctx.createBiquadFilter(); af.type = 'highpass'; af.frequency.value = 2400;
    airGain = ctx.createGain(); airGain.gain.value = 0.028;
    asrc.connect(af); af.connect(airGain); airGain.connect(bedGain);
    asrc.start();

    // 3. pad: a slow, low chord (D, A, D octave), detuned pair per note
    padGain = ctx.createGain(); padGain.gain.value = 0.05;
    const pf = ctx.createBiquadFilter(); pf.type = 'lowpass'; pf.frequency.value = 780;
    padGain.connect(pf); pf.connect(bedGain);
    [73.42, 110.0, 146.83].forEach((f, i) => {
      [0, 0.13].forEach((det) => {
        const o = ctx.createOscillator(); o.type = i === 1 ? 'triangle' : 'sine';
        o.frequency.value = f + det;
        const g = ctx.createGain(); g.gain.value = i === 1 ? 0.35 : 0.5;
        o.connect(g); g.connect(padGain); o.start();
      });
    });
    const pl = ctx.createOscillator(); pl.frequency.value = 0.045;
    const plg = ctx.createGain(); plg.gain.value = 0.02;
    pl.connect(plg); plg.connect(padGain.gain); pl.start();

    // 4. one airy voice per lantern, added as they are lit
    window.MossAudio.lantern = function (i, freq) {
      if (!ctx) return;
      if (lanternVoices[i]) return;
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 2.002;
      const g = ctx.createGain(); g.gain.value = 0;
      const g2 = ctx.createGain(); g2.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.11 + i * 0.017;
      const lg = ctx.createGain(); lg.gain.value = 0.008;
      o.connect(g); g.connect(bedGain); o2.connect(g2); g2.connect(bedGain);
      lfo.connect(lg); lg.connect(g.gain);
      o.start(); o2.start(); lfo.start();
      const t = now();
      g.gain.setTargetAtTime(0.035, t, 0.8);
      g2.gain.setTargetAtTime(0.008, t, 1.2);
      lanternVoices[i] = { o: o, o2: o2, g: g, g2: g2, lfo: lfo };
    };
  }

  function env(node, peak, attack, decay, t) {
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(peak, t + attack);
    node.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  function voice(freq, peak, attack, decay, type) {
    if (!ctx || !enabled) return;
    const t = now();
    const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.value = freq;
    const g = ctx.createGain();
    o.connect(g); g.connect(master);
    env(g, peak, attack, decay, t);
    o.start(t); o.stop(t + attack + decay + 0.1);
  }

  function noiseHit(type, freq, q, peak, attack, decay, pan) {
    if (!ctx || !enabled) return;
    const t = now();
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    s.playbackRate.value = rand(0.85, 1.15);
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) { p.pan.value = pan || 0; s.connect(f); f.connect(g); g.connect(p); p.connect(master); }
    else { s.connect(f); f.connect(g); g.connect(master); }
    env(g, peak, attack, decay, t);
    s.start(t); s.stop(t + attack + decay + 0.1);
  }

  const A = {
    enabled: () => enabled,
    lantern(i, freq) {},
    init() {
      if (!ctx) build();
      if (ctx.state === 'suspended') ctx.resume();
    },
    set(on, silent) {
      if (on && !ctx) A.init();
      enabled = on;
      if (ctx) {
        const t = now();
        if (on) { if (ctx.state === 'suspended') ctx.resume(); ambient.gain.cancelScheduledValues(t); ambient.gain.setTargetAtTime(0.9, t, 0.12); }
        else ambient.gain.setTargetAtTime(0.0, t, 0.06);
      }
      try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
      if (on && !silent) { A.chime(587.33); setTimeout(() => A.chime(880), 140); }
    },
    toggle() { A.set(!enabled); return enabled; },
    // water: a soft drop, pitch rises with x
    plink(x01) { if (!enabled) return; const f = 560 + x01 * 420; voice(f * 1.5, 0.24, 0.005, 0.28); voice(f, 0.16, 0.006, 0.4, 'triangle'); noiseHit('bandpass', 1800, 1.2, 0.05, 0.004, 0.09); },
    bloop(i) { if (!enabled) return; const f = 210 - (i % 4) * 22; voice(f, 0.26, 0.01, 0.22, 'sine'); voice(f * 0.5, 0.12, 0.02, 0.3, 'triangle'); },
    chime(freq) { if (!enabled) return; voice(freq, 0.18, 0.01, 1.9); voice(freq * 2.01, 0.06, 0.01, 1.2); voice(freq * 3.02, 0.025, 0.01, 0.8); },
    rustle() { if (!enabled) return; noiseHit('bandpass', 3200, 0.9, 0.10, 0.01, 0.22, 0.1); noiseHit('highpass', 5200, 0.7, 0.05, 0.02, 0.16, -0.1); },
    stir() { if (!enabled) return; noiseHit('lowpass', 640, 0.6, 0.10, 0.12, 0.5); },
    bell() { if (!enabled) return; [220, 330, 440, 587].forEach((f, i) => setTimeout(() => voice(f, 0.12 - i * 0.02, 0.02, 2.6), i * 55)); },
    wind() { if (!enabled) return; noiseHit('bandpass', 620, 0.5, 0.11, 0.5, 1.1); },
    koiSong() { if (!enabled) return; [293.66, 440, 587.33, 880].forEach((f, i) => setTimeout(() => voice(f, 0.14, 0.02, 1.6), i * 260)); },
    hidden() { if (!enabled) return; [146.83, 220, 293.66].forEach((f, i) => setTimeout(() => voice(f, 0.16, 0.4, 3.0, 'triangle'), i * 400)); noiseHit('highpass', 6000, 0.8, 0.02, 0.5, 1.5); }
  };
  window.MossAudio = A;

  try { if (localStorage.getItem(KEY) === '1') { enabled = true; } } catch (e) {}
  // A remembered 'on' still needs one gesture before the browser lets audio start.
  window.addEventListener('pointerdown', function first() {
    if (enabled && !ctx) { A.init(); A.set(true, true); }
  }, { once: true, capture: true });

  document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx && enabled && ctx.state === 'suspended') ctx.resume(); });

  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('sound');
    const label = document.getElementById('sound-label');
    function paint() {
      const on = enabled;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.classList.toggle('on', on);
      label.textContent = on ? 'sound on' : 'sound off';
    }
    paint();
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const wasInit = !!ctx;
      if (!ctx) A.init();
      A.set(!enabled);
      // first tap: resume and fade the bed in fast, so it answers at once
      if (!wasInit && enabled && ctx) {
        ambient.gain.cancelScheduledValues(now());
        ambient.gain.setValueAtTime(0.0001, now());
        ambient.gain.setTargetAtTime(0.9, now() + 0.02, 0.1);
      }
      paint();
    });
  });
})();
