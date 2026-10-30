// Koi Drift — the drawing half.
//
// The pond itself lives in src/koi_drift.gleam (compiled to JavaScript by
// `gleam build --target javascript`). This file never models anything: it hands
// the simulation a tap, asks it to advance, and draws the pond it gets back.
//
// It is deliberately import-light: one import from the Gleam output, no bundler,
// no framework.

import { start, feed, advance } from "./js/koi_drift/koi_drift.js";

const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");
const hint = document.getElementById("hint");
const soundButton = document.getElementById("sound");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let W = 0;
let H = 0;
let pond = null;
let lastFrame = performance.now();
let dragging = false;
let lastDrop = 0;
let seenEaten = 0;
let muted = false;

// --- the koi themselves ----------------------------------------------------

const KOI_KINDS = [
  // kohaku: snow white with warm orange patches
  { body: ["#fbf6ea", "#ddcdb0"], patch: "#d9744a", fin: "rgba(247, 235, 214, 0.72)" },
  // shiro utsuri: pale grey, ink patches
  { body: ["#f2f4ee", "#cdd4cb"], patch: "#2b3d41", fin: "rgba(238, 243, 238, 0.62)" },
  // ogon: a single gold fish, the one everyone watches
  { body: ["#f4dca6", "#cf9f52"], patch: "#fdf6e6", fin: "rgba(246, 224, 176, 0.7)" },
];

// Koi grow with the pond: a 390px phone and a 1600px desktop both get a fish
// that looks about the right size next to the lily pads.
function pondUnit() {
  return Math.min(1.6, Math.max(0.78, Math.min(W, H) / 700));
}

function hash01(n) {
  const v = Math.sin(n * 12.9898 + 4.1) * 43758.5453;
  return v - Math.floor(v);
}

// A koi is a spine with a width: the nose on the right of local space, the tail
// on the left, and a bend that grows towards the tail so the fish curves as it
// swims instead of sliding sideways.
function spinePoints(koi, length, maxWidth) {
  const steps = 14;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const x = -length * (0.42 * s + 0.58 * s * s);
    const bend = Math.sin(koi.phase - s * 3.2) * length * 0.09 * Math.pow(s, 1.4);
    const w = maxWidth * Math.pow(Math.sin(Math.PI * (0.2 + 0.75 * s)), 0.62) * (1 - 0.55 * s);
    pts.push({ x, y: bend, w: Math.max(w, 0.5) });
  }
  return pts;
}

function bodyPath(pts, offX, offY) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x + offX, pts[0].y - pts[0].w + offY);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x + offX, pts[i].y - pts[i].w + offY);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    ctx.lineTo(pts[i].x + offX, pts[i].y + pts[i].w + offY);
  }
  ctx.closePath();
}

function drawKoi(koi) {
  const unit = pondUnit();
  const length = 60 * koi.size * unit;
  const maxWidth = 15.5 * koi.size * unit;
  const pts = spinePoints(koi, length, maxWidth);
  const cols = KOI_KINDS[Math.abs(koi.kind) % KOI_KINDS.length];

  ctx.save();
  ctx.translate(koi.x, koi.y);
  ctx.rotate(koi.heading);
  ctx.scale(1 + 0.05 * koi.gulp, 1 - 0.045 * koi.gulp);

  // Below the surface: a soft, offset shadow first.
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#03201e";
  bodyPath(pts, 6, 7);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.94;

  // Tail, continuing the spine's last direction so it never looks pinned on.
  const tip = pts[pts.length - 1];
  const prev = pts[pts.length - 3];
  const flare = 1 + 0.1 * Math.sin(koi.phase * 1.8);
  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(Math.atan2(tip.y - prev.y, tip.x - prev.x));
  ctx.fillStyle = cols.fin;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.12, -length * 0.11 * flare, length * 0.29, -length * 0.235 * flare);
  ctx.quadraticCurveTo(length * 0.17, -length * 0.05, length * 0.1, 0);
  ctx.quadraticCurveTo(length * 0.17, length * 0.05, length * 0.29, length * 0.235 * flare);
  ctx.quadraticCurveTo(length * 0.12, length * 0.11 * flare, 0, 0);
  ctx.fill();
  ctx.restore();

  // Body.
  const body = ctx.createLinearGradient(0, -maxWidth, 0, maxWidth);
  body.addColorStop(0, cols.body[0]);
  body.addColorStop(0.55, cols.body[1]);
  body.addColorStop(1, cols.body[0]);
  bodyPath(pts, 0, 0);
  ctx.fillStyle = body;
  ctx.fill();

  // Patches, clipped to the body so they never spill past the water line.
  ctx.save();
  bodyPath(pts, 0, 0);
  ctx.clip();
  const h1 = hash01(koi.id * 3 + 1);
  const h2 = hash01(koi.id * 5 + 2);
  ctx.globalAlpha = 0.86;
  ctx.fillStyle = cols.patch;
  ctx.beginPath();
  ctx.ellipse(-length * (0.2 + 0.26 * h1), -maxWidth * (0.1 + 0.35 * h2), length * 0.19, maxWidth * 0.95, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-length * (0.55 + 0.16 * h2), maxWidth * (0.34 * h1 - 0.24), length * 0.15, maxWidth * 0.6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-length * 0.42, -maxWidth * 0.15, length * 0.3, maxWidth * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // A thin dark edge, which is really the water closing over the fish.
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = "#072a29";
  ctx.lineWidth = 1.1;
  bodyPath(pts, 0, 0);
  ctx.stroke();

  // Pectoral fins, asynchronously fluttering.
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = cols.fin;
  const fin = pts[2];
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(fin.x, fin.y + side * fin.w * 0.7);
    ctx.rotate(side * (0.6 + 0.35 * Math.sin(koi.phase * 1.9 + side)));
    ctx.beginPath();
    ctx.ellipse(-length * 0.05, 0, length * 0.12, length * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Eyes — two small dark dots, and suddenly it is a fish.
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = "#12201f";
  const head = pts[0];
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(head.x - length * 0.06, head.y + side * pts[1].w * 0.5, Math.max(1.2, 1.9 * koi.size * unit), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  ctx.restore();
}

// --- everything else in the pond -------------------------------------------

const PADS = [
  { x: 0.13, y: 0.19, r: 58, rot: 0.35 },
  { x: 0.86, y: 0.29, r: 42, rot: 1.1 },
  { x: 0.28, y: 0.8, r: 66, rot: -0.6 },
  { x: 0.7, y: 0.88, r: 36, rot: 2.2 },
  { x: 0.52, y: 0.12, r: 30, rot: 0.9 },
];

const PETALS = [
  { x: 0.2, y: 0.24, rot: 0.5 },
  { x: 0.8, y: 0.34, rot: -0.9 },
  { x: 0.33, y: 0.85, rot: 1.7 },
];

function drawWater(t) {
  const water = ctx.createLinearGradient(0, 0, W * 0.3, H);
  water.addColorStop(0, "#0e3638");
  water.addColorStop(0.55, "#123f40");
  water.addColorStop(1, "#0a2b2d");
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, W, H);

  // Slow light on the bottom, drifting by like sun through moving trees.
  ctx.globalCompositeOperation = "screen";
  const scale = reduceMotion ? 0 : 1;
  for (let i = 0; i < 4; i++) {
    const p = i * 1.7;
    const x = W * (0.5 + 0.34 * Math.sin(t * 0.021 * scale + p));
    const y = H * (0.5 + 0.3 * Math.cos(t * 0.017 * scale + p * 1.3));
    const r = Math.max(W, H) * (0.34 + 0.05 * Math.sin(t * 0.05 * scale + i));
    const light = ctx.createRadialGradient(x, y, 0, x, y, r);
    light.addColorStop(0, "rgba(126, 205, 196, 0.075)");
    light.addColorStop(1, "rgba(126, 205, 196, 0)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawCrumbs(crumbs) {
  for (const crumb of crumbs.toArray()) {
    const life = Math.max(0, 1 - crumb.age / 26);
    ctx.globalAlpha = Math.min(0.9, 0.35 + 0.65 * life);
    ctx.fillStyle = "#f0e0b4";
    ctx.beginPath();
    ctx.arc(crumb.x, crumb.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha *= 0.35;
    ctx.strokeStyle = "#fdf6e0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(crumb.x, crumb.y, 5.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawRings(rings) {
  for (const ring of rings.toArray()) {
    const left = Math.max(0, 1 - ring.age / ring.life);
    if (left <= 0) continue;
    const alpha = 0.55 * left * (0.35 + 0.65 * ring.strength);
    ctx.strokeStyle = `rgba(212, 240, 231, ${alpha})`;
    ctx.lineWidth = 1.1 + 1.7 * left;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(168, 216, 209, ${alpha * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius * 0.62, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPads(t) {
  const scale = Math.min(1, W / 620);
  PADS.forEach((pad, i) => {
    const x = W * pad.x + Math.sin(t * 0.11 + i) * 3;
    const y = H * pad.y + Math.cos(t * 0.09 + i * 1.3) * 3;
    const r = pad.r * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pad.rot + Math.sin(t * 0.05 + i) * 0.03);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#06201f";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(3, 5, r, 0.3, Math.PI * 2 - 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.9;
    const leaf = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.05, 0, 0, r);
    leaf.addColorStop(0, "#4a7c55");
    leaf.addColorStop(0.75, "#37604a");
    leaf.addColorStop(1, "#24483a");
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, 0.3, Math.PI * 2 - 0.3);
    ctx.closePath();
    ctx.fillStyle = leaf;
    ctx.fill();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#8fc39a";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  });

  PETALS.forEach((petal, i) => {
    const x = W * petal.x + Math.sin(t * 0.07 + i * 2) * 4;
    const y = H * petal.y + Math.cos(t * 0.06 + i) * 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(petal.rot + Math.sin(t * 0.04 + i) * 0.1);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#efd9d2";
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#d9b3a8";
    ctx.beginPath();
    ctx.ellipse(1.5 * scale, 0, 3 * scale, 1.6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawVignette() {
  const g = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.78);
  g.addColorStop(0, "rgba(0, 0, 0, 0)");
  g.addColorStop(1, "rgba(0, 0, 0, 0.34)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function render() {
  const t = pond.clock;
  drawWater(t);
  drawCrumbs(pond.crumbs);
  for (const koi of pond.koi.toArray()) drawKoi(koi);
  drawRings(pond.rings);
  drawPads(t);
  drawVignette();
}

// --- hearing the pond ------------------------------------------------------

let audio = null;

function ensureAudio() {
  if (audio) {
    if (audio.state === "suspended") audio.resume();
    return;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audio = new Ctx();
}

// A crumb landing: a short, soft drop in pitch. Not a splash, more a "tup".
function plop(strength = 1) {
  if (!audio || muted) return;
  const t0 = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(380 + Math.random() * 120, t0);
  osc.frequency.exponentialRampToValueAtTime(110, t0 + 0.17);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(0.07 * strength, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
  osc.connect(gain).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + 0.5);
}

// A koi taking the crumb: one low, almost inaudible note.
function gulpSound() {
  if (!audio || muted) return;
  const t0 = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150 + Math.random() * 40, t0);
  osc.frequency.exponentialRampToValueAtTime(96, t0 + 0.22);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(0.035, t0 + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.38);
  osc.connect(gain).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + 0.45);
}

// --- the loop --------------------------------------------------------------

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth || window.innerWidth;
  H = canvas.clientHeight || window.innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!pond) {
    pond = start(W, H);
    seenEaten = pond.eaten;
  }
}

function frame(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  pond = advance(pond, dt * (reduceMotion ? 0.45 : 1), W, H);
  // Left in the open on purpose: typing `__koi` in a console shows the pond.
  window.__koi = pond;
  if (pond.eaten > seenEaten) {
    seenEaten = pond.eaten;
    gulpSound();
  }
  render();
  requestAnimationFrame(frame);
}

function pointAt(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function drop(event) {
  const { x, y } = pointAt(event);
  pond = feed(pond, x, y, W, H);
  return { x, y };
}

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  ensureAudio();
  hint.classList.add("hint--gone");
  const { x } = drop(event);
  plop();
  dragging = true;
  lastDrop = performance.now();
  // The koi notice a tap even when it lands in a corner.
  void x;
});

canvas.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  if (performance.now() - lastDrop < 150) return;
  lastDrop = performance.now();
  drop(event);
  plop(0.55);
});

for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
  window.addEventListener(type, () => {
    dragging = false;
  });
}

soundButton.addEventListener("click", (event) => {
  event.stopPropagation();
  muted = !muted;
  soundButton.setAttribute("aria-pressed", muted ? "true" : "false");
  soundButton.innerHTML = muted ? "&#9834;&#8416;" : "&#9834;";
  if (!muted) {
    ensureAudio();
    plop(0.5);
  }
});

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
document.addEventListener("visibilitychange", () => {
  lastFrame = performance.now();
});

resize();
requestAnimationFrame((now) => {
  lastFrame = now;
  requestAnimationFrame(frame);
});
