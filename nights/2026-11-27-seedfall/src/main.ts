import { Sound } from "./audio.js";
import { drawSky } from "./background.js";
import { bindButtons, bindInput, type Handlers } from "./input.js";
import { LEVELS } from "./levels.js";
import { drawBoard, type Effect } from "./render.js";
import { Session } from "./session.js";
import { announce, collectUi, hideBanner, showBanner, showGoal, showLevel, showSound } from "./ui.js";

interface SeedfallHandle {
  read(): Record<string, unknown>;
  step(dx: number, dy: number): void;
  go(level: number): void;
}

declare global {
  interface Window { seedfall: SeedfallHandle }
}

const ui = collectUi();
const audio = new Sound();
const SOUND_KEY = "seedfall.sound";
const screen = ui.board.getContext("2d");
if (screen === null) throw new Error("Seedfall: no 2d canvas context");

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let motion = reduced.matches ? 0.35 : 1;
reduced.addEventListener("change", () => { motion = reduced.matches ? 0.35 : 1; });

const started = performance.now();
const now = () => performance.now() - started;
let index = 0;
let done = 0;
let session = new Session(LEVELS[0]);
let effects: Effect[] = [];
let faceX = 0;
let faceY = 1;
let tile = 64;

function rememberSound(on: boolean): void {
  try {
    window.localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // Private windows and locked-down browsers can refuse storage; the night still runs.
  }
}

function wantedSound(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
}

function setSound(on: boolean): void {
  const live = audio.setOn(on);
  showSound(ui, live);
  rememberSound(live);
  announce(ui, live ? "Sound on. The orchard hums." : "Sound off.");
}

function wake(e: PointerEvent): void {
  if (e.target === ui.sound) return;
  if (wantedSound() && !audio.enabled) setSound(true);
  window.removeEventListener("pointerdown", wake);
}

function fit(): void {
  const stage = ui.board.parentElement;
  if (stage === null) return;
  const box = stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const scale = Math.min(Math.max(box.width - 4, 60) / session.puzzle.w, Math.max(box.height - 4, 60) / session.puzzle.h);
  const cssWidth = Math.floor(scale * session.puzzle.w);
  const cssHeight = Math.floor(scale * session.puzzle.h);
  ui.board.style.width = `${cssWidth}px`;
  ui.board.style.height = `${cssHeight}px`;
  ui.board.width = Math.max(1, Math.round(cssWidth * dpr));
  ui.board.height = Math.max(1, Math.round(cssHeight * dpr));
  tile = ui.board.width / session.puzzle.w;
}

function paint(): void {
  drawBoard(screen!, session.puzzle, session.state, { tile, time: now(), motion, faceX, faceY, effects });
}

function loop(): void {
  const t = now();
  paint();
  effects = effects.filter((e) => t - e.born < e.life * Math.max(0.4, motion) + 40);
  requestAnimationFrame(loop);
}

function startLevel(next: number): void {
  index = next;
  session = new Session(LEVELS[index]);
  effects = [];
  faceX = 0;
  faceY = 1;
  showLevel(ui, { index, total: LEVELS.length, name: session.level.name, hint: session.level.hint });
  showGoal(ui, session.tucked(), session.hollowCount);
  hideBanner(ui);
  drawSky(ui.bg, done / LEVELS.length);
  audio.setWarmth(done / LEVELS.length);
  fit();
  announce(ui, `Glade ${index + 1} of ${LEVELS.length}: ${session.level.name}. ${session.level.hint}`);
}

function ripple(x: number, y: number, kind: Effect["kind"], life: number): void {
  effects.push({ x, y, born: now(), life, kind });
}

function tuckEffect(before: number[]): void {
  const spot = session.puzzle.hollows.find((h) => session.state.seeds.includes(h) && !before.includes(h));
  if (spot === undefined) return;
  ripple(spot % session.puzzle.w, Math.floor(spot / session.puzzle.w), "tuck", 900);
}

function doStep(dx: number, dy: number): void {
  if (session.solved) return;
  const w = session.puzzle.w;
  const from = session.state.player;
  const seedsBefore = session.state.seeds.slice();
  const wasTucked = session.tucked();
  if (!session.move(dx, dy)) {
    audio.play("blocked");
    return;
  }
  audio.play("step");
  faceX = dx;
  faceY = dy;
  ripple(from % w, Math.floor(from / w), "step", 380);
  if (session.tucked() > wasTucked) {
    audio.play("tuck");
    tuckEffect(seedsBefore);
    announce(ui, `Seed tucked. ${session.tucked()} of ${session.hollowCount}.`);
  }
  showGoal(ui, session.tucked(), session.hollowCount);
  if (session.solved) finish();
}

function finish(): void {
  audio.play("solve");
  done = Math.max(done, index + 1);
  drawSky(ui.bg, done / LEVELS.length);
  const last = index === LEVELS.length - 1;
  const text = last
    ? "Every hollow is full. The orchard wakes as the sky warms, and the seeds will grow by morning."
    : `Tucked away. ${LEVELS[index + 1].name} waits under the next root.`;
  showBanner(ui, text, last);
  announce(ui, text);
}

function doUndo(): void {
  if (!session.undo()) return;
  audio.play("undo");
  hideBanner(ui);
  showGoal(ui, session.tucked(), session.hollowCount);
  announce(ui, `Stepped back. Seeds tucked ${session.tucked()} of ${session.hollowCount}.`);
}

function listen(): void {
  audio.play("listen");
  const w = session.puzzle.w;
  for (const h of session.puzzle.hollows) ripple(h % w, Math.floor(h / w), "tuck", 1500);
  announce(ui, session.hollowCount > 1 ? "The hollows glow where the seeds belong." : "The hollow glows where the seed belongs.");
}

function doTap(u: number, v: number): void {
  const w = session.puzzle.w;
  const column = Math.floor(u * w);
  const row = Math.floor(v * session.puzzle.h);
  const dx = column - (session.state.player % w);
  const dy = row - Math.floor(session.state.player / w);
  if (dx === 0 && dy === 0) return;
  if (Math.abs(dx) >= Math.abs(dy)) doStep(Math.sign(dx), 0);
  else doStep(0, Math.sign(dy));
}

function next(): void {
  audio.play("next");
  startLevel(index === LEVELS.length - 1 ? 0 : index + 1);
}

const handlers: Handlers = { step: doStep, tap: doTap, listen, undo: doUndo, restart: () => startLevel(index) };
bindInput(ui.board, handlers);
bindButtons(ui.pad, handlers);
ui.undo.addEventListener("click", doUndo);
ui.restart.addEventListener("click", () => {
  audio.play("restart");
  startLevel(index);
});
ui.next.addEventListener("click", next);
ui.sound.addEventListener("click", () => setSound(!audio.enabled));
window.addEventListener("pointerdown", wake);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) audio.resume();
});
window.addEventListener("resize", () => {
  drawSky(ui.bg, done / LEVELS.length);
  fit();
});

window.seedfall = {
  read: () => ({
    glade: index,
    name: session.level.name,
    w: session.puzzle.w,
    h: session.puzzle.h,
    player: session.state.player,
    seeds: session.state.seeds.slice(),
    hollows: session.puzzle.hollows.slice(),
    tucked: session.tucked(),
    solved: session.solved,
    moves: session.moves,
    tile: tile / Math.min(window.devicePixelRatio || 1, 2),
  }),
  step: doStep,
  go: startLevel,
};

startLevel(0);
loop();
