export interface Ui {
  board: HTMLCanvasElement;
  bg: HTMLCanvasElement;
  level: HTMLElement;
  goal: HTMLElement;
  hint: HTMLElement;
  banner: HTMLElement;
  bannerText: HTMLElement;
  next: HTMLButtonElement;
  sound: HTMLButtonElement;
  undo: HTMLButtonElement;
  restart: HTMLButtonElement;
  note: HTMLElement;
  pad: { up: HTMLButtonElement; down: HTMLButtonElement; left: HTMLButtonElement; right: HTMLButtonElement };
}

function need<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (el === null) throw new Error(`Seedfall: #${id} is missing from the page`);
  return el as T;
}

export function collectUi(): Ui {
  return {
    board: need("board"),
    bg: need("bg"),
    level: need("level"),
    goal: need("goal"),
    hint: need("hint"),
    banner: need("banner"),
    bannerText: need("banner-text"),
    next: need("next"),
    sound: need("sound"),
    undo: need("undo"),
    restart: need("restart"),
    note: need("note"),
    pad: { up: need("move-up"), down: need("move-down"), left: need("move-left"), right: need("move-right") },
  };
}

export interface LevelLabel {
  index: number;
  total: number;
  name: string;
  hint: string;
}

export function showLevel(ui: Ui, label: LevelLabel): void {
  ui.level.textContent = `Glade ${label.index + 1} of ${label.total}`;
  ui.hint.textContent = `${label.name}. ${label.hint}`;
  ui.goal.textContent = "";
}

export function showGoal(ui: Ui, done: number, total: number): void {
  ui.goal.textContent = `Seeds tucked ${done} of ${total}`;
}

export function showBanner(ui: Ui, text: string, last: boolean): void {
  ui.bannerText.textContent = text;
  ui.next.textContent = last ? "Wander again" : "Next glade";
  ui.banner.hidden = false;
}

export function hideBanner(ui: Ui): void {
  ui.banner.hidden = true;
}

export function announce(ui: Ui, text: string): void {
  ui.note.textContent = text;
}

export function showSound(ui: Ui, on: boolean): void {
  ui.sound.setAttribute("aria-pressed", String(on));
  ui.sound.setAttribute("aria-label", on ? "Sound is on" : "Sound is off");
  ui.sound.textContent = on ? "Sound on" : "Sound off";
}
