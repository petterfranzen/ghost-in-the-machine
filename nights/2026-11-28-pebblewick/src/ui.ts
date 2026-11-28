import type { Level } from "./types.js";

export interface Ui {
  bg: HTMLCanvasElement;
  board: HTMLCanvasElement;
  level: HTMLElement;
  goal: HTMLElement;
  hint: HTMLElement;
  banner: HTMLElement;
  bannerText: HTMLElement;
  next: HTMLButtonElement;
  undo: HTMLButtonElement;
  restart: HTMLButtonElement;
  pad: HTMLElement;
  note: HTMLElement;
  sound: HTMLButtonElement;
}

function need(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (el === null) throw new Error(`Pebblewick: #${id} is missing`);
  return el;
}

function needCanvas(id: string): HTMLCanvasElement {
  const el = need(id);
  if (!(el instanceof HTMLCanvasElement)) throw new Error(`Pebblewick: #${id} is not a canvas`);
  return el;
}

function needButton(id: string): HTMLButtonElement {
  const el = need(id);
  if (!(el instanceof HTMLButtonElement)) throw new Error(`Pebblewick: #${id} is not a button`);
  return el;
}

export function collectUi(): Ui {
  return {
    bg: needCanvas("bg"),
    board: needCanvas("board"),
    level: need("level"),
    goal: need("goal"),
    hint: need("hint"),
    banner: need("banner"),
    bannerText: need("banner-text"),
    next: needButton("next"),
    undo: needButton("undo"),
    restart: needButton("restart"),
    pad: need("pad"),
    note: need("note"),
    sound: needButton("sound"),
  };
}

export function showLevel(ui: Ui, index: number, total: number, level: Level): void {
  ui.level.textContent = `Shelf ${index + 1} of ${total}: ${level.name}`;
  ui.hint.textContent = level.hint;
}

export function showGoal(ui: Ui, lit: number, total: number, ready: boolean): void {
  const aim = ready ? "the hollow is awake" : "the hollow still sleeps";
  ui.goal.textContent = total === 1 ? `Light 1 of 1 - ${aim}` : `Lights ${lit} of ${total} - ${aim}`;
}

export function showBanner(ui: Ui, text: string, last: boolean): void {
  ui.bannerText.textContent = text;
  ui.next.textContent = last ? "Roll the shelves again" : "Next shelf";
  ui.banner.hidden = false;
}

export function hideBanner(ui: Ui): void {
  ui.banner.hidden = true;
}

export function announce(ui: Ui, text: string): void {
  ui.note.textContent = text;
}
