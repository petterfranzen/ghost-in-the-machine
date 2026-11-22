// Sound. Everything is synthesised from oscillators and noise: an ambient bed
// of wind, a low pad and water, plus one quiet voice per thing that happens on
// the ice. The master bus is limited so a busy bay never clips.
//
// The bed fades in over 0.35 s and a confirming chime answers the tap that
// turns sound on, so nobody is left wondering whether it worked.
window.LakeSound = (function () {
const NOTES = [0, 2, 4, 7, 9, 12, 14, 16, 19]; // a pentatonic ladder, in semitones
const A4 = 440;
const BED_GAIN = 0.62;

function createSound() {
  const state = { on: false, ctx: null, out: null, bed: [], lit: 0, rare: false };
  try {
    state.on = localStorage.getItem('lantern-ice-sound') === 'on';
  } catch (e) {
    state.on = false;
  }

  function note(hz, opts) {
    const c = state.ctx;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(hz, c.currentTime);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, c.currentTime + opts.len);
    const peak = (opts.gain || 0.2) * (opts.delay === undefined ? 1 : 1);
    const t = c.currentTime + (opts.delay || 0);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + (opts.attack || 0.02));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.len);
    osc.connect(gain).connect(opts.bus || state.out);
    osc.start(t);
    osc.stop(t + opts.len + 0.02);
  }

  function noise(opts) {
    const c = state.ctx;
    const src = c.createBufferSource();
    src.buffer = state.white;
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = opts.filter || 'bandpass';
    filter.frequency.setValueAtTime(opts.from || 800, c.currentTime);
    if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, c.currentTime + opts.len);
    filter.Q.value = opts.q === undefined ? 1 : opts.q;
    const gain = c.createGain();
    const t = c.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(opts.gain || 0.15, t + (opts.attack || 0.02));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.len);
    src.connect(filter).connect(gain).connect(opts.bus || state.out);
    src.start(t);
    src.stop(t + opts.len + 0.02);
  }

  function bell(step, when) {
    const hz = A4 * Math.pow(2, NOTES[step % NOTES.length] / 12) / 2;
    note(hz, { len: 1.1, gain: 0.22, attack: 0.01, delay: when });
    note(hz * 2.01, { len: 0.7, gain: 0.06, attack: 0.01, delay: when });
    note(hz / 2, { len: 1.4, gain: 0.1, attack: 0.02, delay: when, type: 'triangle' });
  }

  const VOICES = {
    slide: () => {
      noise({ filter: 'bandpass', from: 1400, to: 320, q: 0.8, len: 0.28, gain: 0.16, attack: 0.03 });
      note(320, { len: 0.3, gain: 0.05, to: 180, type: 'triangle' });
    },
    stop: () => {
      noise({ filter: 'lowpass', from: 600, to: 180, len: 0.16, gain: 0.16, attack: 0.005 });
      note(140, { len: 0.22, gain: 0.16, to: 90, type: 'sine' });
    },
    push: () => {
      noise({ filter: 'bandpass', from: 380, to: 620, q: 3, len: 0.34, gain: 0.13, attack: 0.06 });
    },
    crack: () => {
      noise({ filter: 'highpass', from: 1600, len: 0.09, gain: 0.13, attack: 0.002 });
      note(2400, { len: 0.08, gain: 0.06, type: 'triangle' });
    },
    mend: () => {
      noise({ filter: 'lowpass', from: 900, to: 1600, len: 0.5, gain: 0.07, attack: 0.12 });
      note(660, { len: 0.55, gain: 0.1, attack: 0.06 });
      note(990, { len: 0.45, gain: 0.06, attack: 0.09, delay: 0.06 });
    },
    freeze: () => {
      noise({ filter: 'highpass', from: 2400, len: 0.6, gain: 0.07, attack: 0.1 });
      note(200, { len: 0.7, gain: 0.14, to: 150, type: 'triangle' });
      note(302, { len: 0.5, gain: 0.07, delay: 0.04 });
    },
    scuff: () => {
      noise({ filter: 'bandpass', from: 1500, to: 900, q: 0.7, len: 0.13, gain: 0.08, attack: 0.01 });
    },
    splash: () => {
      noise({ filter: 'lowpass', from: 900, to: 200, len: 0.5, gain: 0.22, attack: 0.006 });
      note(220, { len: 0.35, gain: 0.1, to: 900, type: 'sine', attack: 0.01 });
    },
    win: () => {
      [0, 2, 4, 7, 9].forEach((s, i) => bell(s, i * 0.16));
      note(110, { len: 2.4, gain: 0.07, attack: 0.4, type: 'triangle' });
    },
    rare: () => {
      [12, 16, 19].forEach((s, i) => bell(s, i * 0.5));
      noise({ filter: 'highpass', from: 3000, len: 2.6, gain: 0.035, attack: 0.9 });
    },
    chime: () => bell(4, 0),
  };

  function play(name, arg) {
    if (!state.on || !state.ctx) return;
    if (name === 'lantern') return bell(arg | 0, 0);
    const voice = VOICES[name];
    if (voice) voice();
  }

  // One row per bed layer: the values differ, the wiring does not, so the
  // wiring lives here once and the rows just describe what each layer is.
  const LAYERS = {
    wind: { noise: 'brown', filter: 'lowpass', hz: 380, q: 0.7, gain: 0.16, lfo: 0.05 },
    pad: { noise: 'brown', filter: 'lowpass', hz: 260, q: 0.7, gain: 0.05, lfo: 0.07, chord: [110, 164.81, 220] },
    water: { noise: 'white', filter: 'bandpass', hz: 320, q: 1.1, gain: 0.05, lfo: 0.11 },
    shimmer: { noise: 'white', filter: 'bandpass', hz: 2600, q: 0.7, gain: 0.03, lfo: 0.11 },
  };

  function chordVoices(c, gain, chord) {
    chord.forEach((hz, i) => {
      const osc = c.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = hz * (1 + i * 0.0015);
      osc.connect(gain);
      osc.start();
    });
  }

  function layer(kind) {
    const spec = LAYERS[kind];
    const c = state.ctx;
    const src = c.createBufferSource();
    src.buffer = spec.noise === 'brown' ? state.brown : state.white;
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = spec.filter;
    filter.frequency.value = spec.hz;
    filter.Q.value = spec.q;
    const gain = c.createGain();
    gain.gain.value = spec.gain;
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = spec.lfo;
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(gain.gain);
    src.connect(filter).connect(gain).connect(state.out);
    src.start();
    lfo.start();
    if (spec.chord) chordVoices(c, gain, spec.chord);
    state.bed.push({ src, lfo, gain, kind });
  }

  function listening() {
    return state.on && state.ctx && state.ctx.state === 'suspended';
  }

  function shouldShimmer() {
    return state.on && state.lit > 0 && !state.bed.some((l) => l.kind === 'shimmer');
  }

  function buildBed() {
    if (state.bed.length) return;
    layer('wind');
    layer('pad');
    layer('water');
    if (state.lit >= 1) layer('shimmer');
  }

  function enable() {
    if (!state.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      state.ctx = new Ctx();
      state.white = makeNoise(state.ctx, 2.4, false);
      state.brown = makeNoise(state.ctx, 3.2, true);
      const limiter = state.ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.knee.value = 8;
      limiter.ratio.value = 8;
      limiter.attack.value = 0.004;
      limiter.release.value = 0.25;
      state.out = state.ctx.createGain();
      state.out.gain.value = 0.0001;
      state.out.connect(limiter);
      limiter.connect(state.ctx.destination);
      buildBed();
    }
    state.ctx.resume();
    state.on = true;
    try {
      localStorage.setItem('lantern-ice-sound', 'on');
    } catch (e) { /* private mode: play this session, remember nothing */ }
    state.out.gain.cancelScheduledValues(state.ctx.currentTime);
    state.out.gain.setValueAtTime(0.0001, state.ctx.currentTime);
    state.out.gain.linearRampToValueAtTime(BED_GAIN, state.ctx.currentTime + 0.35);
    play('chime');
  }

  function disable() {
    state.on = false;
    try {
      localStorage.setItem('lantern-ice-sound', 'off');
    } catch (e) { /* as above */ }
    if (state.ctx) state.out.gain.linearRampToValueAtTime(0.0001, state.ctx.currentTime + 0.2);
  }

  return {
    play,
    enable,
    disable,
    isOn: () => state.on,
    toggle: () => (state.on ? disable() : enable()),
    // a lit bay has more air in it: the shimmer layer comes up
    setMood: (lit) => {
      state.lit = lit;
      if (shouldShimmer()) layer('shimmer');
    },
    resume: () => {
      if (listening()) state.ctx.resume();
    },
  };
}

// White noise, or brown noise (a slow low rumble) for the wind.
function makeNoise(ctx, seconds, brown) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

return { createSound };
})();
