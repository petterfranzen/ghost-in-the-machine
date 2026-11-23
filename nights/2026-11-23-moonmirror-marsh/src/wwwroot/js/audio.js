// The marsh's voice. Everything is synthesised with the Web Audio API; no samples.
const Sound = {
  ctx: null,
  bus: null,
  bed: null,
  shimmerGain: 0,
  enabled: false,
  level: 0,

  ensure() {
    if (this.ctx) return true;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    this.ctx = new Ctx();
    const limiter = this.ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 14;
    limiter.ratio.value = 6;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.25;
    this.bus = this.ctx.createGain();
    this.bus.gain.value = 0;
    this.bus.connect(limiter);
    limiter.connect(this.ctx.destination);
    return true;
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  // Turning sound on answers at once: the bed rises and a short chime confirms it.
  enable() {
    if (!this.ensure()) return;
    this.resume();
    this.enabled = true;
    this.fadeBed(0.45, 0.6);
    this.startBed();
    this.play('unmute');
  },

  disable() {
    this.enabled = false;
    this.fadeBed(0.25, 0);
  },

  fadeBed(seconds, peak) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.bus.gain.cancelScheduledValues(now);
    this.bus.gain.setValueAtTime(this.bus.gain.value, now);
    this.bus.gain.linearRampToValueAtTime(peak, now + seconds);
  },

  startBed() {
    if (!this.bus || this.bed) return;
    this.bed = {
      wind: this.layer(this.noiseLoop(), { kind: 'bandpass', frequency: 480, q: 0.9, gain: 0.055 }),
      water: this.layer(this.noiseLoop(), { kind: 'lowpass', frequency: 280, q: 0.7, gain: 0.07 }),
      root: this.padVoice(110),
      fifth: this.padVoice(164.8),
    };
    this.shimmerGain = this.ctx.createGain();
    this.shimmerGain.gain.value = 0;
    const shimmer = this.padVoice(1568);
    shimmer.gain.disconnect();
    shimmer.gain.connect(this.shimmerGain);
    this.shimmerGain.connect(this.bus);
    this.shimmer = shimmer;
  },

  layer(source, spec) {
    const filter = this.ctx.createBiquadFilter();
    filter.type = spec.kind;
    filter.frequency.value = spec.frequency;
    filter.Q.value = spec.q;
    const gain = this.ctx.createGain();
    gain.gain.value = spec.gain;
    this.addLfo(gain.gain, 0.06 + Math.random() * 0.05, spec.gain * 0.45, 0.5);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.bus);
    source.start();
    return { source, filter, gain };
  },

  padVoice(frequency) {
    const gain = this.ctx.createGain();
    gain.gain.value = 0.05;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 620;
    this.addLfo(filter.frequency, 0.03, 180, 500);
    [0, 1].forEach((i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = frequency;
      osc.detune.value = i === 0 ? -4 : 5;
      osc.connect(filter);
      osc.start();
    });
    filter.connect(gain);
    gain.connect(this.bus);
    return { filter, gain };
  },

  addLfo(param, rate, depth, centre) {
    const osc = this.ctx.createOscillator();
    osc.frequency.value = rate;
    const amount = this.ctx.createGain();
    amount.gain.value = depth;
    osc.connect(amount);
    amount.connect(param);
    if (centre !== undefined) param.value = centre;
    osc.start();
  },

  noiseLoop() {
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer(2.5);
    source.loop = true;
    return source;
  },

  noiseBuffer(seconds) {
    const frames = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  },

  // The bed follows the night: every level shifts the chord, and lit lanterns add a shimmer.
  setBed(level) {
    this.level = level;
    if (!this.bed) return;
    const chords = [[110, 164.8], [110, 146.8], [98, 146.8], [87.3, 130.8], [87.3, 123.5]];
    const chord = chords[Math.max(0, Math.min(chords.length - 1, level))];
    this.glideBed(this.bed.root, chord[0]);
    this.glideBed(this.bed.fifth, chord[1]);
  },

  glideBed(voice, frequency) {
    const now = this.ctx.currentTime;
    voice.filter.frequency.linearRampToValueAtTime(500 + frequency, now + 2.5);
    voice.gain.gain.linearRampToValueAtTime(0.055, now + 2.5);
  },

  setShimmer(lit) {
    if (!this.ctx || !this.shimmerGain) return;
    const now = this.ctx.currentTime;
    this.shimmerGain.gain.cancelScheduledValues(now);
    this.shimmerGain.gain.linearRampToValueAtTime(Math.min(0.035, lit * 0.014), now + 1.2);
  },

  play(name) {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const voice = this[name];
    if (typeof voice === 'function') voice.call(this);
  },
};

// One placed note. Short functions, one per kind of sound, driven by the table below.
Sound.voice = function voice(spec) {
  const now = this.ctx.currentTime + (spec.delay || 0);
  const osc = this.ctx.createOscillator();
  osc.type = spec.type || 'sine';
  this.glide(osc.frequency, spec, now);
  const gain = this.ctx.createGain();
  this.envelope(gain.gain, spec, now);
  osc.connect(gain);
  gain.connect(spec.out || this.bus);
  osc.start(now);
  osc.stop(now + (spec.decay || 0.3) + 0.05);
};

Sound.glide = function glide(param, spec, now) {
  param.setValueAtTime(spec.from, now);
  if (spec.to) param.exponentialRampToValueAtTime(spec.to, now + (spec.glide || 0.12));
};

Sound.envelope = function envelope(param, spec, now) {
  param.setValueAtTime(0.0001, now);
  param.exponentialRampToValueAtTime(spec.peak, now + (spec.attack || 0.012));
  param.exponentialRampToValueAtTime(0.0001, now + (spec.decay || 0.3));
};

Sound.brush = function brush(spec) {
  const now = this.ctx.currentTime + (spec.delay || 0);
  const source = this.ctx.createBufferSource();
  source.buffer = this.noiseBuffer(0.5);
  const filter = this.ctx.createBiquadFilter();
  filter.type = spec.kind || 'lowpass';
  filter.frequency.value = spec.cut;
  const gain = this.ctx.createGain();
  gain.gain.setValueAtTime(spec.peak, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.decay);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(this.bus);
  source.start(now);
  source.stop(now + spec.decay + 0.05);
};

Object.assign(Sound, {
  turn() {
    this.voice({ type: 'triangle', from: 330, to: 210, peak: 0.3, glide: 0.08, decay: 0.22 });
    this.brush({ cut: 1800, peak: 0.1, decay: 0.07, kind: 'bandpass' });
  },
  prism() {
    this.voice({ type: 'sine', from: 587, peak: 0.16, decay: 0.4 });
    this.voice({ type: 'sine', from: 880, peak: 0.12, decay: 0.5, delay: 0.04 });
  },
  lit() {
    this.voice({ from: 523.25, peak: 0.22, attack: 0.02, decay: 1.4 });
    this.voice({ from: 784, peak: 0.14, attack: 0.03, decay: 1.2, delay: 0.02 });
  },
  absorb() {
    this.brush({ cut: 420, peak: 0.26, decay: 0.32 });
    this.voice({ type: 'triangle', from: 150, to: 96, peak: 0.16, decay: 0.3 });
  },
  solve() {
    [523.25, 659.25, 783.99].forEach((note, i) =>
      this.voice({ from: note, peak: 0.2, attack: 0.02, decay: 1.3, delay: i * 0.15 }));
  },
  ripple() {
    this.voice({ from: 720, to: 480, peak: 0.12, glide: 0.09, decay: 0.16 });
    this.brush({ cut: 1400, peak: 0.07, decay: 0.2, kind: 'bandpass' });
  },
  undo() {
    this.voice({ type: 'triangle', from: 300, to: 200, peak: 0.16, decay: 0.18 });
  },
  restart() {
    this.voice({ type: 'triangle', from: 196, to: 147, peak: 0.14, decay: 0.5 });
  },
  unmute() {
    this.voice({ from: 440, peak: 0.2, attack: 0.01, decay: 0.5 });
    this.voice({ from: 659.25, peak: 0.2, attack: 0.01, decay: 0.7, delay: 0.13 });
  },
  bell() {
    this.voice({ from: 392, peak: 0.18, attack: 0.02, decay: 2.1 });
    this.voice({ from: 588, peak: 0.1, attack: 0.03, decay: 1.6, delay: 0.03 });
  },
  heron() {
    this.voice({ from: 196, peak: 0.1, attack: 0.4, decay: 1.8 });
    this.voice({ from: 199.5, peak: 0.08, attack: 0.5, decay: 1.6, delay: 0.06 });
  },
  mist() {
    this.brush({ cut: 900, peak: 0.12, decay: 1.4, kind: 'bandpass' });
  },
});

// Blazor resolves interop targets on the window object, so publish the namespace there.
window.Sound = Sound;
