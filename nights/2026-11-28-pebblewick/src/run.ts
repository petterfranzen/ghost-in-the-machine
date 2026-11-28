import { buildShelf, type Shelf } from "./shelf.js";
import { BALL_RADIUS, BOARD, MOTE_REACH, type Level, type Tilt, type Vec } from "./types.js";

export type RunEvent =
  | { kind: "mote"; total: number }
  | { kind: "secret" }
  | { kind: "home" };

export interface RunRead {
  name: string;
  hint: string;
  ball: Vec;
  speed: number;
  lit: boolean[];
  found: boolean;
  homed: boolean;
}

/**
 * The rules of one shelf: roll the pebble over every mote, then into the
 * hollow. The physics does the rolling; this only watches and remembers.
 */
export class Run {
  private readonly level: Level;
  private readonly shelf: Shelf;
  private lit: boolean[];
  private homed = false;
  private found = false;
  private events: RunEvent[] = [];

  constructor(level: Level) {
    this.level = level;
    this.shelf = buildShelf(level, BOARD);
    this.lit = level.motes.map(() => false);
  }

  get litCount(): number {
    return this.lit.filter(Boolean).length;
  }

  get totalMotes(): number {
    return this.level.motes.length;
  }

  get solved(): boolean {
    return this.homed;
  }

  /** One physics step under the given tilt (each axis in -1..1). */
  tilt(input: Tilt): void {
    this.shelf.step(limited(input));
    this.watch();
  }

  /** Hand over the events since the last call; the frame loop calls this. */
  drain(): RunEvent[] {
    const out = this.events;
    this.events = [];
    return out;
  }

  read(): RunRead {
    return {
      name: this.level.name,
      hint: this.level.hint,
      ball: this.shelf.pos(),
      speed: this.shelf.speed(),
      lit: this.lit.slice(),
      found: this.found,
      homed: this.homed,
    };
  }

  resting(): boolean {
    return this.shelf.speed() < 0.05;
  }

  reset(): void {
    this.shelf.reset();
    this.lit = this.level.motes.map(() => false);
    this.homed = false;
    this.found = false;
    this.events = [];
  }

  private watch(): void {
    const p = this.shelf.pos();
    this.sweepMotes(p);
    this.sweepSecret(p);
    if (this.homed || !this.allLit() || !inside(this.level.hollow, p)) return;
    this.homed = true;
    this.events.push({ kind: "home" });
  }

  private sweepMotes(p: Vec): void {
    this.level.motes.forEach((m, i) => {
      if (this.lit[i] === true) return;
      if (Math.hypot(m.x - p.x, m.y - p.y) > MOTE_REACH) return;
      this.lit[i] = true;
      this.events.push({ kind: "mote", total: this.level.motes.length });
    });
  }

  private sweepSecret(p: Vec): void {
    const s = this.level.secret;
    if (s === undefined || this.found) return;
    if (Math.hypot(s.x - p.x, s.y - p.y) > BALL_RADIUS + 16) return;
    this.found = true;
    this.events.push({ kind: "secret" });
  }

  private allLit(): boolean {
    return this.lit.every(Boolean);
  }
}

function inside(hollow: { x: number; y: number; r: number }, p: Vec): boolean {
  return Math.hypot(hollow.x - p.x, hollow.y - p.y) <= hollow.r - BALL_RADIUS * 0.4;
}

function limited(t: Tilt): Tilt {
  const m = Math.hypot(t.x, t.y);
  if (m <= 1 || m === 0) return t;
  return { x: t.x / m, y: t.y / m };
}
