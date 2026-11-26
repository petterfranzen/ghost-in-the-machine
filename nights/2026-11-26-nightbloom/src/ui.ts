export interface Hud {
  level: HTMLElement;
  goal: HTMLElement;
  hint: HTMLElement;
  undo: HTMLButtonElement;
  restart: HTMLButtonElement;
  next: HTMLButtonElement;
  banner: HTMLElement;
  bannerText: HTMLElement;
  note: HTMLElement;
}

function need<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Nightbloom: missing #${id}`);
  return el as T;
}

export function hud(): Hud {
  return {
    level: need("level"),
    goal: need("goal"),
    hint: need("hint"),
    undo: need<HTMLButtonElement>("undo"),
    restart: need<HTMLButtonElement>("restart"),
    next: need<HTMLButtonElement>("next"),
    banner: need("banner"),
    bannerText: need("banner-text"),
    note: need("note"),
  };
}

export interface LevelView {
  index: number;
  count: number;
  name: string;
  hint: string;
}

export interface Counts {
  open: number;
  total: number;
}

export interface BannerView {
  text: string;
  label: string;
}

export function showLevel(hud: Hud, view: LevelView): void {
  hud.level.textContent = `Meadow ${view.index + 1} of ${view.count} \u00b7 ${view.name}`;
  hud.hint.textContent = view.hint;
}

export function showProgress(hud: Hud, counts: Counts): void {
  hud.goal.textContent = `Flowers open ${counts.open} of ${counts.total}`;
}

export function showBanner(hud: Hud, view: BannerView): void {
  hud.bannerText.textContent = view.text;
  hud.next.textContent = view.label;
  hud.banner.hidden = false;
}

export function hideBanner(hud: Hud): void {
  hud.banner.hidden = true;
}

export function setNote(hud: Hud, text: string): void {
  hud.note.textContent = text;
}
