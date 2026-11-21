// Synthesised sound: a quiet bed of water and pad, plus one voice per gesture.
const MASTER = 0.6;
const PAD = [110, 164.81];

const SFX = {
  turn: [{ t: 'noise', f: 1500, q: 1.1, dur: 0.06, g: 0.20 },
         { t: 'sine', f: 300, dur: 0.13, g: 0.13 }],
  sweep: [{ t: 'noise', f: 1200, q: 1.4, dur: 0.05, g: 0.10 },
          { t: 'sine', f: 260, dur: 0.10, g: 0.07 }],
  hint: [{ t: 'sine', f: 587.33, dur: 1.2, g: 0.16 },
         { t: 'sine', f: 880, dur: 0.9, g: 0.06, at: 0.07 }],
  drop: [{ t: 'sine', f: 740, dur: 0.22, g: 0.14, glide: 620 },
         { t: 'noise', f: 2200, q: 2.0, dur: 0.05, g: 0.08 }],
  garden: [{ t: 'sine', f: 880, dur: 0.5, g: 0.09 },
           { t: 'sine', f: 1174.66, dur: 0.5, g: 0.05, at: 0.10 }],
  undo: [{ t: 'sine', f: 262, dur: 0.35, g: 0.13, glide: 190 }],
  restart: [{ t: 'sine', f: 130, dur: 0.7, g: 0.15, glide: 92 }],
  start: [{ t: 'sine', f: 660, dur: 0.5, g: 0.10 },
          { t: 'sine', f: 990, dur: 0.5, g: 0.05, at: 0.12 }],
  complete: [{ t: 'sine', f: 392, dur: 1.1, g: 0.12 },
             { t: 'sine', f: 493.88, dur: 1.1, g: 0.10, at: 0.16 },
             { t: 'sine', f: 587.33, dur: 1.2, g: 0.10, at: 0.33 },
             { t: 'sine', f: 783.99, dur: 1.8, g: 0.09, at: 0.52 },
             { t: 'sine', f: 196, dur: 2.4, g: 0.07, at: 0.52 }],
  secret: [{ t: 'triangle', f: 523.25, dur: 0.9, g: 0.11 },
           { t: 'triangle', f: 587.33, dur: 0.9, g: 0.10, at: 0.34 },
           { t: 'triangle', f: 659.25, dur: 0.9, g: 0.10, at: 0.68 },
           { t: 'triangle', f: 587.33, dur: 1.0, g: 0.09, at: 1.02 },
           { t: 'triangle', f: 523.25, dur: 1.6, g: 0.10, at: 1.36 }],
};

function noiseBuffer(ctx) {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function noiseVoice(ctx, out, spec, when) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = spec.f;
  filter.Q.value = spec.q || 1;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(spec.g, when + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + spec.dur);
  src.connect(filter).connect(gain).connect(out);
  src.start(when);
  src.stop(when + spec.dur + 0.05);
}

function toneVoice(ctx, out, spec, when) {
  const osc = ctx.createOscillator();
  osc.type = spec.t;
  osc.frequency.setValueAtTime(spec.f, when);
  if (spec.glide) osc.frequency.exponentialRampToValueAtTime(spec.glide, when + spec.dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(spec.g, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + spec.dur);
  osc.connect(gain).connect(out);
  osc.start(when);
  osc.stop(when + spec.dur + 0.05);
}

function bedVoices(ctx, out) {
  const hum = ctx.createBufferSource();
  hum.buffer = noiseBuffer(ctx);
  hum.loop = true;
  const humFilter = ctx.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.value = 360;
  const humGain = ctx.createGain();
  humGain.gain.value = 0.10;
  hum.connect(humFilter).connect(humGain).connect(out);
  hum.start();

  const drift = ctx.createBiquadFilter();
  drift.type = 'bandpass';
  drift.frequency.value = 950;
  drift.Q.value = 2.4;
  const driftGain = ctx.createGain();
  driftGain.gain.value = 0;
  const flow = ctx.createBufferSource();
  flow.buffer = hum.buffer;
  flow.loop = true;
  flow.connect(drift).connect(driftGain).connect(out);
  flow.start();

  const padGain = ctx.createGain();
  padGain.gain.value = 0.05;
  padGain.connect(out);
  for (const f of PAD) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = f;
    osc.connect(padGain);
    osc.start();
  }
  return { humGain, humFilter, driftGain, padGain };
}

export function createAudio() {
  let ctx = null;
  let master = null;
  let bed = null;
  let on = false;
  let flow = 0;

  function ensure() {
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = MASTER;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.knee.value = 10;
    limiter.ratio.value = 6;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.25;
    master.connect(limiter).connect(ctx.destination);
    bed = bedVoices(ctx, master);
    return ctx;
  }

  function play(name, gainScale) {
    if (!on || !ctx) return;
    const spec = SFX[name];
    if (!spec) return;
    const t0 = ctx.currentTime + 0.01;
    const bus = ctx.createGain();
    bus.gain.value = gainScale || 1;
    bus.connect(master);
    for (const voice of spec) {
      const when = t0 + (voice.at || 0);
      if (voice.t === 'noise') noiseVoice(ctx, bus, voice, when);
      else toneVoice(ctx, bus, voice, when);
    }
  }

  function setFlow(value) {
    flow = Math.max(0, Math.min(1, value));
    if (!ctx || !bed) return;
    const now = ctx.currentTime;
    bed.driftGain.gain.linearRampToValueAtTime(0.035 + 0.05 * flow, now + 1.2);
    bed.humFilter.frequency.linearRampToValueAtTime(360 + 320 * flow, now + 1.2);
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function setOn(value) {
    on = value;
    if (!value) { if (ctx) ctx.suspend(); return; }
    ensure();
    resume();
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(MASTER, now + 0.35);
    play('start');
    setFlow(flow);
  }

  return {
    play,
    setFlow,
    setOn,
    resume,
    toggle() { setOn(!on); return on; },
    get on() { return on; },
  };
}
