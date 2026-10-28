// Smoke test: run the compiled dist/app.js in Node against a stub DOM/Canvas/
// AudioContext, drive a drag and both buttons, and check what actually got drawn.
// It catches runtime faults and invalid colours that a compile-only check misses.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const appPath = join(here, "..", "dist", "app.js");
const code = readFileSync(appPath, "utf8");

const problems = [];
const fail = (msg) => problems.push(msg);

// ---- Canvas 2D stub -------------------------------------------------------
const drawLog = [];
const colourFields = ["fillStyle", "strokeStyle", "shadowColor"];

function makeCtx(name) {
  const ctx = { canvas: null, __name: name, globalAlpha: 1, globalCompositeOperation: "source-over",
                lineWidth: 1, lineCap: "butt", lineJoin: "miter", shadowBlur: 0, shadowOffsetY: 0 };
  const gradient = () => ({ addColorStop() {} });
  const record = (op, args) => drawLog.push({ canvas: name, op, args });

  ctx.createLinearGradient = (...a) => { record("createLinearGradient", a); return gradient(); };
  ctx.createRadialGradient = (...a) => { record("createRadialGradient", a); return gradient(); };
  for (const m of ["fillRect", "clearRect", "strokeRect", "beginPath", "moveTo", "lineTo",
                   "arc", "fill", "stroke", "save", "restore", "translate", "rotate",
                   "scale", "closePath", "setTransform", "rect", "clip"]) {
    ctx[m] = (...a) => record(m, a);
  }
  // A Proxy-free way to watch colour assignments without a custom setter per field.
  for (const f of colourFields) {
    let v = ctx[f];
    Object.defineProperty(ctx, f, {
      get: () => v,
      set: (nv) => {
        v = nv;
        const kind = typeof nv === "string" ? "string"
          : nv && typeof nv === "object" && "addColorStop" in nv ? "gradient" : typeof nv;
        drawLog.push({ canvas: name, op: "set:" + f, args: [nv], kind });
      },
    });
  }
  return ctx;
}

// ---- element stub --------------------------------------------------------
function makeEl(id) {
  const listeners = {};
  const el = {
    id, width: 0, height: 0, textContent: "", style: {}, _attrs: {}, _classes: new Set(),
    classList: {
      add: (c) => el._classes.add(c),
      remove: (c) => el._classes.delete(c),
      contains: (c) => el._classes.has(c),
    },
    setAttribute: (k, v) => { el._attrs[k] = String(v); },
    getAttribute: (k) => el._attrs[k],
    addEventListener: (t, f) => { (listeners[t] ||= []).push(f); },
    removeEventListener: () => {},
    getContext: () => el._ctx,
  };
  el._listeners = listeners;
  el._ctx = makeCtx(id);
  el._ctx.canvas = el;
  return el;
}

const els = {
  sand: makeEl("sand"),
  marks: makeEl("marks"),
  hint: makeEl("hint"),
  smooth: makeEl("smooth"),
  sound: makeEl("sound"),
};

const winListeners = {};
const rafQueue = [];
const audioCalls = [];
let hissTarget = 0;

function AudioContextStub() {
  audioCalls.push("construct");
  this.sampleRate = 48000;
  this.currentTime = 0;
  this.destination = { __destination: true };
  this.state = "running";
  this.resume = () => { audioCalls.push("resume"); return Promise.resolve(); };
  this.createBuffer = (ch, len, sr) => {
    audioCalls.push("createBuffer");
    const data = new Float32Array(len);
    return { length: len, sampleRate: sr, getChannelData: () => data };
  };
  this.createBufferSource = () => ({ connect() {}, start() { audioCalls.push("start"); }, buffer: null, loop: false });
  this.createBiquadFilter = () => ({ connect() {}, type: "", frequency: { value: 0 }, Q: { value: 0 } });
  this.createGain = () => {
    audioCalls.push("createGain");
    const g = {
      connect() {},
      gain: { value: 0, setTargetAtTime(v) { hissTarget = v; audioCalls.push("target:" + v); } },
    };
    return g;
  };
}

const windowStub = {
  innerWidth: 900, innerHeight: 700, devicePixelRatio: 2,
  AudioContext: AudioContextStub,
  addEventListener: (t, f) => { (winListeners[t] ||= []).push(f); },
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => { rafQueue.push(cb); return rafQueue.length; },
  setTimeout: () => 0,
  document: { getElementById: (id) => els[id] || null, addEventListener: () => {} },
};

const sandbox = { window: windowStub, document: windowStub.document, console, Math, Promise, Float32Array, Date, performance: { now: () => 0 } };
sandbox.globalThis = sandbox;
sandbox.self = windowStub;

function fire(target, type, ev) {
  const bucket = target === windowStub ? winListeners : target._listeners;
  for (const f of bucket[type] || []) f(ev);
}

function frames(n) {
  for (let i = 0; i < n; i++) {
    const cb = rafQueue.shift();
    if (!cb) break;
    cb(i * 16.7);
  }
}

// ---- run -----------------------------------------------------------------
try {
  vm.runInNewContext(code, sandbox, { filename: "app.js" });
} catch (e) {
  fail("app threw while loading: " + e.message);
}

if (problems.length === 0) {
  // Layout happened: both canvases sized for 900x700 at dpr 2.
  for (const id of ["sand", "marks"]) {
    const el = els[id];
    if (el.width !== 1800 || el.height !== 1400) fail(`${id} canvas not sized: ${el.width}x${el.height}`);
  }
  // The sand got painted (gradients + many grain rectangles).
  const sandOps = drawLog.filter((d) => d.canvas === "sand");
  if (sandOps.filter((d) => d.op === "fillRect").length < 500) {
    fail("sand layer painted too little: " + sandOps.filter((d) => d.op === "fillRect").length + " fillRects");
  }
  if (sandOps.filter((d) => d.op === "createRadialGradient").length < 2) fail("no gradients painted on the sand");

  // Colours must be real CSS strings, never Nim-style byte arrays or numbers.
  const badColour = drawLog.find((d) => d.op.startsWith("set:") && d.kind !== "string" && d.kind !== "gradient");
  if (badColour) fail(`invalid ${badColour.op.slice(4)} value type: ${badColour.kind} (${String(badColour.args[0]).slice(0, 40)})`);
  const strColours = drawLog.filter((d) => d.op.startsWith("set:") && d.kind === "string");
  const badString = strColours.find((d) => !/^#[0-9a-fA-F]{3,8}$/.test(d.args[0]) && !/^rgba?\(\s*[\d.]+\s*,/.test(d.args[0]));
  if (badString) fail(`unexpected colour string: ${JSON.stringify(badString.args[0]).slice(0, 60)}`);

  // A drag should rake grooves and push up ridges.
  fire(els.marks, "pointerdown", { clientX: 120, clientY: 620, pointerId: 1 });
  for (let i = 0; i < 40; i++) {
    fire(windowStub, "pointermove", { clientX: 120 + i * 14, clientY: 620 - i * 3, pointerId: 1 });
  }
  fire(windowStub, "pointerup", { pointerId: 1 });

  const markOps = drawLog.filter((d) => d.canvas === "marks");
  const lineTos = markOps.filter((d) => d.op === "lineTo");
  if (lineTos.length < 7) fail("drag drew no rake tines: " + lineTos.length + " lineTo calls");
  const strokes = markOps.filter((d) => d.op === "stroke");
  if (strokes.length < 2) fail("drag did not stroke furrows + ridges");
  const nonFinite = markOps.filter((d) => d.args.some((a) => typeof a === "number" && !Number.isFinite(a)));
  if (nonFinite.length) fail("non-finite coordinates drawn: " + nonFinite.length + " ops");
  if (!els.hint._classes.has("gone")) fail("hint did not fade on first drag");

  // Sound starts off and stays silent until asked for.
  if (els.sound.textContent !== "sound: off") fail("sound button should start at 'sound: off', got " + els.sound.textContent);
  const audioBefore = audioCalls.filter((c) => c.startsWith("target:") && Number(c.slice(7)) > 0).length;
  if (audioBefore > 0) fail("sand hiss was audible before sound was turned on");

  // Turn sound on, drag again: a soft hiss should rise.
  fire(els.sound, "click", { type: "click" });
  if (els.sound.textContent !== "sound: on") fail("sound button did not switch on");
  if (els.sound.getAttribute("aria-pressed") !== "true") fail("aria-pressed not set on sound button");
  fire(els.marks, "pointerdown", { clientX: 300, clientY: 300, pointerId: 2 });
  for (let i = 0; i < 20; i++) fire(windowStub, "pointermove", { clientX: 300 + i * 12, clientY: 300 + i * 6, pointerId: 2 });
  if (!(hissTarget > 0)) fail("hiss gain did not rise while raking with sound on");
  fire(windowStub, "pointerup", { pointerId: 2 });
  if (hissTarget !== 0) fail("hiss gain did not settle to silence on release");

  // Fading: the loop should composite a destination-out pass over time.
  frames(40);
  const fades = drawLog.filter((d) => d.canvas === "marks" && d.op === "fillRect");
  if (fades.length === 0) fail("no fading pass ran over the groove layer");

  // Smoothing wipes the garden clear.
  fire(els.smooth, "click", { type: "click" });
  const before = drawLog.filter((d) => d.canvas === "marks" && d.op === "clearRect").length;
  frames(120);
  const after = drawLog.filter((d) => d.canvas === "marks" && d.op === "clearRect").length;
  if (after <= before) fail("smooth the sand did not clear the grooves");
}

if (problems.length) {
  console.error("SMOKE FAILED");
  for (const p of problems) console.error(" - " + p);
  process.exit(1);
}
const paints = drawLog.filter((d) => d.op === "fillRect").length;
const rakeOps = drawLog.filter((d) => d.op === "stroke").length;
console.log(`smoke ok: ${paints} fills, ${rakeOps} strokes, ${drawLog.length} canvas ops, audio calls ${audioCalls.length}`);
