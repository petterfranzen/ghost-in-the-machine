import type { Tilt, Vec } from "./types.js";

const REACH = 96;
const EASE_MS = 150;
const TAP_MS = 320;
const TAP_SLOP = 10;

export interface ControlHooks {
  /** Screen point to shelf coordinates. */
  toWorld(clientX: number, clientY: number): Vec;
  /** A still, short press finished at this shelf point. */
  onTap(point: Vec): void;
}

interface Held {
  untilPulse: number;
  dir: Tilt;
}

const PAD_KEYS: Record<string, string> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

const PAD_DIRS: Record<string, Tilt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function clampTilt(t: Tilt): Tilt {
  const m = Math.hypot(t.x, t.y);
  if (m <= 1 || m === 0) return t;
  return { x: t.x / m, y: t.y / m };
}

function add(a: Tilt, b: Tilt): Tilt {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** Merge the drag, the held pad buttons and the keys into one tilt. */
export class Controls {
  private press: { x: number; y: number; time: number; moved: number } | null = null;
  private lever: Tilt = { x: 0, y: 0 };
  private eased: Tilt = { x: 0, y: 0 };
  private held = new Set<string>();
  private pulses: Held[] = [];

  constructor(private readonly board: HTMLCanvasElement, private readonly hooks: ControlHooks) {}

  /** The tilt the shelf should answer to right now. */
  tilt(): Tilt {
    return this.eased;
  }

  /** Lean for `ms` without a hand on the shelf; used by the pad and by checks. */
  pushTilt(dir: Tilt, ms: number): void {
    this.pulses.push({ dir: clampTilt(dir), untilPulse: performance.now() + ms });
  }

  /** Aim at a held-direction set; drag beats buttons, pulses fill the gaps. */
  private wanted(now: number): Tilt {
    if (this.press !== null) return this.lever;
    let sum: Tilt = { x: 0, y: 0 };
    for (const name of this.held) sum = add(sum, PAD_DIRS[name]);
    this.pulses = this.pulses.filter((p) => p.untilPulse > now);
    for (const p of this.pulses) sum = add(sum, p.dir);
    return clampTilt(sum);
  }

  update(now: number, dt: number): void {
    const want = this.wanted(now);
    const k = Math.min(1, dt / EASE_MS);
    this.eased = {
      x: this.eased.x + (want.x - this.eased.x) * k,
      y: this.eased.y + (want.y - this.eased.y) * k,
    };
  }

  private beginDrag(e: PointerEvent): void {
    e.preventDefault();
    this.board.setPointerCapture(e.pointerId);
    this.press = { x: e.clientX, y: e.clientY, time: performance.now(), moved: 0 };
    this.lever = { x: 0, y: 0 };
  }

  private moveDrag(e: PointerEvent): void {
    if (this.press === null) return;
    e.preventDefault();
    const dx = e.clientX - this.press.x;
    const dy = e.clientY - this.press.y;
    this.press.moved = Math.max(this.press.moved, Math.hypot(dx, dy));
    this.lever = clampTilt({ x: dx / REACH, y: dy / REACH });
  }

  private endDrag(e: PointerEvent): void {
    const press = this.press;
    this.press = null;
    this.lever = { x: 0, y: 0 };
    if (press === null) return;
    const still = press.moved < TAP_SLOP;
    const quick = performance.now() - press.time < TAP_MS;
    if (still && quick) this.hooks.onTap(this.hooks.toWorld(e.clientX, e.clientY));
  }

  private hold(name: string): void {
    this.held.add(name);
  }

  private release(name: string): void {
    this.held.delete(name);
    this.pulses = this.pulses.filter((p) => p.dir !== PAD_DIRS[name]);
  }

  private pressButton(name: string, now: number): void {
    this.pulses.push({ dir: PAD_DIRS[name], untilPulse: now + 220 });
  }

  attach(): void {
    this.board.addEventListener("pointerdown", (e) => this.beginDrag(e));
    this.board.addEventListener("pointermove", (e) => this.moveDrag(e));
    this.board.addEventListener("pointerup", (e) => this.endDrag(e));
    this.board.addEventListener("pointercancel", () => {
      this.press = null;
      this.lever = { x: 0, y: 0 };
    });
    for (const name of ["contextmenu", "selectstart", "dragstart"]) {
      this.board.addEventListener(name, (e) => e.preventDefault());
    }
    window.addEventListener("keydown", (e) => {
      const name = PAD_KEYS[e.key] ?? PAD_KEYS[e.key.toLowerCase()];
      if (name === undefined) return;
      e.preventDefault();
      this.hold(name);
    });
    window.addEventListener("keyup", (e) => {
      const name = PAD_KEYS[e.key] ?? PAD_KEYS[e.key.toLowerCase()];
      if (name !== undefined) this.release(name);
    });
    window.addEventListener("blur", () => this.held.clear());
  }

  /** Wire one hold-button: hold to tilt, and a press gives a short pulse. */
  bindButton(button: HTMLElement, name: string): void {
    button.addEventListener("pointerdown", () => this.hold(name));
    for (const end of ["pointerup", "pointerleave", "pointercancel"]) {
      button.addEventListener(end, () => this.release(name));
    }
    button.addEventListener("click", () => this.pressButton(name, performance.now()));
  }
}
