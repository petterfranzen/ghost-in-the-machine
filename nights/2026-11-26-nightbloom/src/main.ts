import { createSound, play, rememberChoice, savedChoice, setEnabled, setOpenness, type Sound } from "./audio.js";
import { drawBackground, makeBlades, makeDrift, type Meadow } from "./background.js";
import { forEachFlower, openCount, targetsOf } from "./board.js";
import * as fx from "./effects.js";
import { attachPointer } from "./input.js";
import { KINDS } from "./kinds.js";
import { CELL } from "./palette.js";
import { drawFrame, keyOf, type Scene } from "./render.js";
import {
  canUndo,
  loadLevel,
  levelCount,
  levelHint,
  levelName,
  progress,
  tapFlower,
  undo,
  type Game,
} from "./session.js";
import * as ui from "./ui.js";
import type { Coord } from "./types.js";

const IDLE_MS = 18000;
const SWARM_MS = 45000;
const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const bgCanvas = document.getElementById("bg") as HTMLCanvasElement;
const bgCtx = bgCanvas.getContext("2d");
const hud = ui.hud();
const soundBtn = document.getElementById("sound") as HTMLButtonElement;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let sound: Sound | null = null;
const bg: Meadow = { w: 1, h: 1, blades: makeBlades(1, 1), drift: makeDrift(1, 1), time: 0, reduced };

function sizeBackground(): void {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  bg.w = window.innerWidth;
  bg.h = window.innerHeight;
  bgCanvas.width = Math.round(bg.w * dpr);
  bgCanvas.height = Math.round(bg.h * dpr);
  bgCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  bg.blades = makeBlades(bg.w, bg.h);
  bg.drift = makeDrift(bg.w, bg.h);
}

function paintBackground(time: number): void {
  if (!bgCtx) return;
  bg.time = time;
  drawBackground(bgCtx, bg);
}

let game: Game = loadLevel(0);
let size = 0;
let lastInput = performance.now();
let fliesShown = false;
let swarmShown = false;
const scene: Scene = {
  grid: game.grid,
  blooms: new Map(),
  pulses: [],
  motes: [],
  flies: [],
  preview: null,
  time: 0,
  reduced,
};

function openPerches(): Coord[] {
  const out: Coord[] = [];
  forEachFlower(game.grid, (r, c, cell) => {
    if (cell.open) out.push([r, c]);
  });
  return out;
}

function scatterFlies(): void {
  if (scene.flies.length > 0) {
    fliesShown = false;
    swarmShown = false;
  }
  scene.flies = [];
}

function refresh(): void {
  const p = progress(game);
  ui.showProgress(hud, p);
  if (sound) setOpenness(sound, p.open / p.total);
  hud.undo.disabled = !canUndo(game);
  canvas.setAttribute(
    "aria-label",
    `A night meadow of ${p.total} flowers, ${p.open} open. ${levelHint(game.levelIndex)}`,
  );
}

function pulseTargets(r: number, c: number): void {
  const cell = game.grid[r]?.[c];
  if (!cell) return;
  const color = KINDS[cell.kind].glow;
  for (const [tr, tc] of targetsOf(game.grid, r, c)) {
    if (!game.grid[tr]?.[tc]) continue;
    fx.spawnPulse(scene.pulses, { x: (tc + 0.5) * CELL, y: (tr + 0.5) * CELL, color, life: 0.55 });
  }
}

function completeLevel(): void {
  const finished = game.levelIndex === levelCount() - 1;
  const text = finished ? "Every meadow is open" : `${levelName(game.levelIndex)} is open`;
  ui.showBanner(hud, { text, label: finished ? "Wander again" : "Next meadow" });
  ui.setNote(hud, text);
}

function onTap(r: number, c: number): void {
  lastInput = performance.now();
  scatterFlies();
  if (!tapFlower(game, r, c)) return;
  const cell = game.grid[r]?.[c];
  if (sound && cell) play(sound, cell.open ? "bloom" : "tap");
  pulseTargets(r, c);
  refresh();
  if (game.solved) {
    completeLevel();
    if (sound) play(sound, "solve");
  }
}

function onUndo(): void {
  lastInput = performance.now();
  scatterFlies();
  if (undo(game)) {
    refresh();
    if (sound) play(sound, "undo");
  }
}

function load(index: number): void {
  game = loadLevel(index);
  size = game.grid.length * CELL;
  canvas.width = size;
  canvas.height = size;
  scene.grid = game.grid;
  scene.blooms.clear();
  scene.pulses.length = 0;
  scene.flies.length = 0;
  scene.preview = null;
  scene.motes = reduced ? [] : fx.makeMotes(26, size);
  fliesShown = false;
  swarmShown = false;
  lastInput = performance.now();
  ui.hideBanner(hud);
  ui.showLevel(hud, {
    index: game.levelIndex,
    count: levelCount(),
    name: levelName(game.levelIndex),
    hint: levelHint(game.levelIndex),
  });
  refresh();
  if (sound) play(sound, "next");
}

function easeBlooms(dt: number): void {
  const step = dt * 2.6;
  forEachFlower(scene.grid, (r, c, cell) => {
    const bloom = scene.blooms.get(keyOf(r, c)) ?? 0;
    const target = cell.open ? 1 : 0;
    const delta = target - bloom;
    scene.blooms.set(keyOf(r, c), reduced ? target : bloom + Math.sign(delta) * Math.min(Math.abs(delta), step));
  });
}

function idleReady(now: number): boolean {
  if (reduced) return false;
  if (game.solved) return false;
  if (now - lastInput < IDLE_MS) return false;
  return openCount(game.grid) > 0;
}

function idleWatch(now: number): void {
  if (!idleReady(now)) return;
  const perches = openPerches().map(([r, c]) => ({ x: (c + 0.5) * CELL, y: (r + 0.5) * CELL }));
  if (!fliesShown) {
    scene.flies = fx.makeFireflies(5, perches);
    fliesShown = true;
    return;
  }
  if (swarmShown || now - lastInput < SWARM_MS) return;
  scene.flies.push(...fx.makeFireflies(6, perches));
  swarmShown = true;
  if (sound) play(sound, "bloom");
}

let last = performance.now();
function frame(now: number): void {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  scene.time = now / 1000;
  easeBlooms(dt);
  fx.stepPulses(scene.pulses, dt);
  if (!reduced) {
    fx.stepMotes(scene.motes, { dt, size });
    fx.stepFireflies(scene.flies, { dt, size });
  }
  idleWatch(now);
  paintBackground(scene.time);
  drawFrame(ctx as CanvasRenderingContext2D, scene, size);
  requestAnimationFrame(frame);
}

attachPointer(canvas, {
  onTap,
  onPreview: (r, c) => {
    scene.preview = [r, c];
    lastInput = performance.now();
  },
  onPreviewEnd: () => {
    scene.preview = null;
  },
});

// The choice survives a reload; the audio itself waits for a gesture, so the
// label tells the truth about the choice while the bed is still silent.
let soundWanted = savedChoice();

function syncSound(): void {
  soundBtn.setAttribute("aria-pressed", String(soundWanted));
  soundBtn.textContent = soundWanted ? "Sound on" : "Sound off";
}

function toggleSound(): void {
  soundWanted = !soundWanted;
  if (soundWanted) {
    sound = sound ?? createSound();
    setEnabled(sound, true);
  } else if (sound) {
    setEnabled(sound, false);
  }
  rememberChoice(soundWanted);
  syncSound();
}

function restoreSound(): void {
  if (!soundWanted || sound) return;
  sound = createSound();
  setEnabled(sound, true);
}

soundBtn.addEventListener("click", toggleSound);
document.addEventListener("pointerdown", restoreSound, { once: true });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && sound?.on) void sound.ctx.resume();
});

hud.undo.addEventListener("click", onUndo);
hud.restart.addEventListener("click", () => {
  scatterFlies();
  load(game.levelIndex);
});
hud.next.addEventListener("click", () => {
  const finished = game.levelIndex === levelCount() - 1;
  load(finished ? 0 : game.levelIndex + 1);
});

syncSound();
sizeBackground();
window.addEventListener("resize", sizeBackground);
load(0);
requestAnimationFrame(frame);
