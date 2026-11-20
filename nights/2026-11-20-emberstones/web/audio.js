/* Emberstones - the sound. Everything is synthesised with the Web Audio API:
 * noise through filters for wind and water, oscillators for the stones. The
 * page starts silent; the sound button wakes the AudioContext and the bed
 * fades in at once. */
'use strict';

var EmberAudio = (function () {
  var ctx = null, master = null, comp = null, noise = null;
  var on = false, bed = null, levels = null;

  /* a pentatonic ladder, so any two stones struck together still agree */
  var LADDER = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  var BASE = 196.0;                       /* G3 */

  function hz(semis) { return BASE * Math.pow(2, semis / 12); }

  function makeNoise() {
    var len = ctx.sampleRate * 2;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function chain() {
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 18;
    comp.ratio.value = 6; comp.attack.value = 0.004; comp.release.value = 0.25;
    master = ctx.createGain(); master.gain.value = 0.0;
    master.connect(comp); comp.connect(ctx.destination);
  }

  function loopNoise(gain, freq, q, type) {
    var src = ctx.createBufferSource();
    src.buffer = noise; src.loop = true;
    var f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    var g = ctx.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
    return { src: src, filter: f, gain: g };
  }

  function pad(freq, gain, type) {
    var o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    var g = ctx.createGain(); g.gain.value = 0;
    o.connect(g); g.connect(master); o.start();
    return { osc: o, gain: g };
  }

  /* the bed: wind, water and a slow pad. Three layers, each moved by the scene. */
  function buildBed() {
    var wind = loopNoise(0.0, 420, 0.7, 'lowpass');
    var water = loopNoise(0.0, 1400, 1.6, 'bandpass');
    var drone = pad(hz(0), 0.0, 'sine');
    var fifth = pad(hz(7), 0.0, 'sine');
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    var lfoG = ctx.createGain(); lfoG.gain.value = 220;
    lfo.connect(lfoG); lfoG.connect(wind.filter.frequency); lfo.start();
    var trem = ctx.createOscillator(); trem.frequency.value = 0.11;
    var tremG = ctx.createGain(); tremG.gain.value = 0.35;
    trem.connect(tremG); tremG.connect(water.gain.gain); trem.start();
    return { wind: wind, water: water, drone: drone, fifth: fifth, lfo: lfo, trem: trem };
  }

  function ramp(param, to, sec) {
    var t = ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(to, t + sec);
  }

  /* called every frame with the scene's own numbers */
  function scene(litFrac, level, motion) {
    if (!on || !bed) return;
    var lv = Math.max(0, Math.min(1, litFrac));
    ramp(bed.wind.gain.gain, 0.045 + 0.05 * motion, 0.9);
    ramp(bed.water.gain.gain, 0.006 + 0.030 * lv, 1.2);
    ramp(bed.drone.gain.gain, 0.020 + 0.030 * lv, 1.4);
    ramp(bed.fifth.gain.gain, 0.006 + 0.016 * lv, 1.4);
    var chord = [0, 2, 5, 7, 9, 12][Math.min(5, Math.max(0, level))];
    ramp(bed.drone.osc.frequency, hz(chord), 2.0);
    ramp(bed.fifth.osc.frequency, hz(chord + 7), 2.0);
  }

  /* one short note: frequency, length, loudness, waveform. A record, so the
     voices below read as data and every call stays two arguments. */
  function note(f, d, v, t) { return { f: f, d: d, v: v, t: t || 'triangle' }; }

  function ping(t0, n) {
    var o = ctx.createOscillator(); o.type = n.t;
    var g = ctx.createGain();
    o.frequency.setValueAtTime(n.f, t0);
    if (n.bend) o.frequency.exponentialRampToValueAtTime(n.f * n.bend, t0 + n.d);
    g.gain.setValueAtTime(n.bend ? n.v : 0.0001, t0);
    if (!n.bend) g.gain.exponentialRampToValueAtTime(n.v, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.d);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + n.d + 0.05);
    return o;
  }

  /* the same voice, falling: a body rather than a bell */
  function thud(t0, n) { return ping(t0, { f: n.f, d: n.d, v: n.v, t: 'sine', bend: 0.55 }); }

  function hiss(t0, n, q) {
    var src = ctx.createBufferSource(); src.buffer = noise;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.value = n.f; f.Q.value = q || 1.2;
    var g = ctx.createGain();
    g.gain.setValueAtTime(n.v, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.d);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + n.d + 0.05);
  }

  /* one voice per event type. a table, so the mixer stays short. */
  var VOICES = {
    1: function (t, a) { ping(t, note(hz(LADDER[a % LADDER.length]), 0.55, 0.20)); hiss(t, note(2600, 0.09, 0.05), 2.4); },
    2: function (t) { thud(t, note(110, 0.22, 0.16)); hiss(t, note(700, 0.18, 0.10), 0.8); },
    3: function (t) { [0, 4, 7, 12].forEach(function (n, i) { ping(t + i * 0.09, note(hz(n + 12), 0.9, 0.16)); }); },
    4: function (t) { ping(t, note(hz(9), 0.30, 0.12)); ping(t + 0.08, note(hz(4), 0.40, 0.12)); },
    5: function (t) { hiss(t, note(500, 0.35, 0.12), 0.7); thud(t, note(140, 0.30, 0.12)); },
    6: function (t) { [0, 5, 12].forEach(function (n, i) { ping(t + i * 0.11, note(hz(n), 1.1, 0.14)); }); },
    7: function (t) { ping(t, note(hz(19), 1.4, 0.13)); ping(t + 0.02, note(hz(24), 1.6, 0.09)); },
    8: function (t) { thud(t, note(72, 1.2, 0.28)); hiss(t, note(900, 0.9, 0.14), 0.6); ping(t + 0.1, note(hz(12), 2.2, 0.10)); },
    9: function (t) { [0, 7, 12, 16].forEach(function (n, i) { ping(t + i * 0.35, note(hz(n), 2.4, 0.12)); }); },
    10: function (t) { hiss(t, note(1100, 0.12, 0.07), 0.9); },
    11: function (t) { ping(t, note(hz(26), 2.0, 0.05)); }
  };

  function play(type, a, b) {
    if (!on || !ctx) return;
    var v = VOICES[type];
    if (v) v(ctx.currentTime + 0.001, a || 0, b || 0);
  }

  function chime() {
    var t = ctx.currentTime + 0.01;
    [0, 7, 12].forEach(function (n, i) { ping(t + i * 0.07, note(hz(n + 12), 0.7, 0.18)); });
  }

  function ensureCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    chain(); noise = makeNoise();
  }

  function wake() {
    ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    on = true;
    if (!bed) bed = buildBed();
    ramp(master.gain, 0.62, 0.4);
    chime();
  }

  function hush() {
    on = false;
    if (master) ramp(master.gain, 0.0, 0.25);
  }

  function setOn(next) {
    if (next === on) return on;
    if (next) wake(); else hush();
    return on;
  }

  function suspended() { return ctx && ctx.state === 'suspended'; }
  function resume() {
    if (!on) return;
    if (suspended()) ctx.resume();
  }
  function isOn() { return on; }

  return { setOn: setOn, play: play, scene: scene, resume: resume, isOn: isOn };
})();
