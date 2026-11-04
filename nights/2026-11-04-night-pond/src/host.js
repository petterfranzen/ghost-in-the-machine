/* Night Pond — input, sound and the loop.
 *
 * The page is deliberately thin: Pond.res owns the pond's mind, view.js paints
 * it, and this file only connects taps, a mute button and a gentle little
 * synthesizer to them. No frameworks, no network. */

import * as Pond from "./Pond.res.js";
import { createView, W, H } from "./view.js";

const canvas = document.getElementById("stage");
const view = createView(canvas);
const state = Pond.make();

/* ---------- sound: silent until you ask for it ---------- */

let audio = null;
let muted = true;
let master = null;
let pad = null;

function ensureAudio() {
  if (audio) return audio;
  const AC = window.AudioContext || window.webkitAudioContext;
  audio = new AC();
  master = audio.createGain();
  master.gain.value = 0.0;
  master.connect(audio.destination);
  return audio;
}

function blip(freqFrom, freqTo, dur, level, type = "sine", cutoff = 1200) {
  if (!audio || muted) return;
  const t0 = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filt = audio.createBiquadFilter();
  osc.type = type;
  filt.type = "lowpass";
  filt.frequency.value = cutoff;
  osc.frequency.setValueAtTime(freqFrom, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqTo), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(level, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(filt).connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/* a warm tone that swells in slowly and hangs, used for waking lanterns */
function swell(freq, dur, level, delay = 0) {
  if (!audio || muted) return;
  const t0 = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(level, t0 + dur * 0.4);
  gain.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function startPad() {
  if (!audio || pad) return;
  const filt = audio.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 600;
  const gain = audio.createGain();
  gain.gain.value = 0.0;
  gain.gain.linearRampToValueAtTime(0.05, audio.currentTime + 4);
  filt.connect(gain).connect(master);
  pad = [98, 146.83, 196].map((f, i) => {
    const o = audio.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = audio.createGain();
    g.gain.value = 0.34 / (i + 1);
    /* a very slow breath on each voice, so the chord never sits still */
    const lfo = audio.createOscillator();
    lfo.frequency.value = 0.05 + i * 0.017;
    const lg = audio.createGain();
    lg.gain.value = 0.16 / (i + 1);
    lfo.connect(lg).connect(g.gain);
    o.connect(g).connect(filt);
    o.start();
    lfo.start();
    return [o, lfo];
  });
}

function play(event) {
  switch (event) {
    case "plop":
      blip(420, 118, 0.32, 0.16, "sine", 900);
      blip(180, 92, 0.22, 0.05, "triangle", 500);
      break;
    case "thud":
      blip(150, 74, 0.18, 0.06, "triangle", 420);
      break;
    case "wake":
      swell(523.25, 2.6, 0.05);
      swell(783.99, 3.0, 0.035, 0.18);
      blip(660, 990, 0.9, 0.03, "sine", 2200);
      break;
    case "done":
      swell(261.63, 5.0, 0.06);
      swell(392.0, 5.0, 0.045, 0.4);
      swell(523.25, 5.0, 0.035, 0.9);
      startPad();
      break;
  }
}

function setMuted(next) {
  muted = next;
  const btn = document.getElementById("sound");
  btn.setAttribute("aria-pressed", String(!muted));
  btn.textContent = muted ? "sound off" : "sound on";
  btn.classList.toggle("on", !muted);
  if (!muted) {
    ensureAudio();
    if (audio.state === "suspended") audio.resume();
    master.gain.linearRampToValueAtTime(0.9, audio.currentTime + 0.6);
  } else if (audio) {
    master.gain.linearRampToValueAtTime(0.0, audio.currentTime + 0.3);
  }
}

document.getElementById("sound").addEventListener("click", (e) => {
  e.stopPropagation();
  ensureAudio();
  setMuted(!muted);
});

/* ---------- tapping the water ---------- */

function toWorld(clientX, clientY) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((clientX - box.left) / box.width) * W,
    y: ((clientY - box.top) / box.height) * H,
  };
}

let firstTap = true;

function tapAt(x, y) {
  Pond.tap(state, x, y);
  for (const ev of Pond.drainEvents(state)) play(ev);
  if (firstTap) {
    firstTap = false;
    document.getElementById("hint").classList.add("gone");
  }
}

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  const p = toWorld(e.clientX, e.clientY);
  tapAt(p.x, p.y);
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());

/* ---------- the loop ---------- */

let last = performance.now();
let acc = 0;

function frame(now) {
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
  last = now;
  /* fixed steps keep the fish and the ripples steady on slow phones */
  acc += dt;
  let guard = 0;
  while (acc >= 1 / 60 && guard++ < 8) {
    Pond.step(state, 1 / 60);
    acc -= 1 / 60;
  }
  const snap = JSON.parse(Pond.read(state));
  view.draw(snap, snap.t);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* a small handle for the smoke check, and for anyone poking at it in a console */
window.NightPond = {
  read: () => JSON.parse(Pond.read(state)),
  tap: (x, y) => tapAt(x, y),
  world: { width: W, height: H },
};
