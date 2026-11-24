// One playing session: the game, its mood, the HUD text, and the frame loop.
// Everything the scene remembers between taps lives here.

import type { Level } from './types.js';
import { Game, readProgress, type MoveResult } from './state.js';
import { budsAwake, tipOf } from './rules.js';
import { indexOf, posOf } from './grid.js';
import { Effects } from './effects.js';
import { clamp, now } from './palette.js';
import { rectOf, render, type View } from './render.js';
import { attachInput, type InputTarget } from './input.js';
import type { Sink } from './audio.js';

export interface Hud {
  readonly level: HTMLElement;
  readonly goal: HTMLElement;
  readonly hint: HTMLElement;
  readonly note: HTMLElement;
  readonly undo: HTMLButtonElement;
  readonly restart: HTMLButtonElement;
}

export interface Scene {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly hud: Hud;
  readonly calm: boolean;
  readonly levels: readonly Level[];
  readonly sound: Sink;
}

const REFUSALS: Readonly<Record<string, string>> = {
  blocked: 'Stone and water refuse the root.',
  rooted: 'The root will not cross itself.',
  far: 'Grow from the tip — tap a tile that touches it.',
  'ember-sleeps': 'The ember sleeps until every bud wakes.',
  'gate-shut': 'That moss gate has already carried the root.',
};

const NOTE_MS = 2600;
const LISTEN_MS = 1500;
const COMPLETE_MS = 1700;
const MOLE_FROM_MS = 16000;
const MOLE_SPAN_MS = 12150;

export class Session implements InputTarget {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly hud: Hud;
  private readonly calm: boolean;
  private readonly sound: Sink;
  private readonly game: Game;
  private readonly effects: Effects;
  private note = '';
  private noteUntil = 0;
  private listenUntil = 0;
  private bloom = 0;
  private completeAt = 0;
  private moodKey = '';
  private moleOut = false;

  constructor(scene: Scene) {
    this.canvas = scene.canvas;
    this.ctx = scene.ctx;
    this.hud = scene.hud;
    this.calm = scene.calm;
    this.sound = scene.sound;
    this.game = new Game(scene.levels, Math.max(readProgress() - 1, 0));
    this.effects = new Effects(scene.calm);
  }

  currentLevel(): Level {
    return this.game.level;
  }

  busy(): boolean {
    return this.completeAt > 0;
  }

  begin(): void {
    attachInput(this);
    this.hud.undo.addEventListener('click', () => this.undo());
    this.hud.restart.addEventListener('click', () => this.restart());
    this.refresh();
    const loop = (): void => {
      requestAnimationFrame(loop);
      this.frame();
    };
    loop();
  }

  notePress(): void {
    this.effects.noteInput();
    this.moleOut = false;
  }

  noteHold(): void {
    this.listenUntil = now() + LISTEN_MS;
    this.sound.play('bud');
    const asleep = this.game.level.buds.filter((b) => !this.game.route.includes(b));
    for (const bud of asleep) {
      const c = this.centreOf(bud);
      this.effects.ring({ x: c.x, y: c.y, color: '#c9b6f2', life: 1.1, max: 18 });
    }
  }

  tap(index: number, quiet = false): void {
    if (this.busy() || index < 0) return;
    const before = budsAwake(this.game.level, this.game.route);
    const result = this.game.grow(index);
    this.afterTap(index, before, result, quiet);
  }

  stepToward(dx: number, dy: number): void {
    const level = this.game.level;
    const { x, y } = posOf(level, tipOf(this.game.route));
    const nx = x + dx;
    const ny = y + dy;
    const inside = nx >= 0 && ny >= 0 && nx < level.width && ny < level.height;
    if (inside) this.tap(indexOf(level.width, nx, ny));
  }

  undo(): void {
    this.effects.noteInput();
    this.sound.play('undo');
    if (this.game.undo()) this.refresh();
  }

  restart(): void {
    this.effects.noteInput();
    this.sound.play('restart');
    this.game.restart();
    this.bloom = 0;
    this.completeAt = 0;
    this.refresh();
  }

  skipLevel(): void {
    this.completeAt = 0;
    this.bloom = 0;
    if (this.game.advance()) return this.refresh();
    this.game.restart();
    this.say('All seven descents are done. Restart to walk them again.', 6000);
  }

  // --------------------------------------------------------------- internals

  private afterTap(index: number, before: number, result: MoveResult, quiet: boolean): void {
    if (result.outcome === 'refused') return this.refuse(result, quiet);
    const c = this.centreOf(index);
    this.effects.puff(c.x, c.y);
    const awake = budsAwake(this.game.level, this.game.route);
    if (awake > before) {
      this.effects.ring({ x: c.x, y: c.y });
      this.sound.play('bud');
    } else {
      this.sound.play(result.outcome === 'solved' ? 'solve' : 'grow');
    }
    this.listenUntil = 0;
    if (result.outcome === 'solved') this.solveLevel();
    this.refresh();
  }

  private refuse(result: MoveResult, quiet: boolean): void {
    if (quiet) return;
    this.sound.play(result.why === 'gate-shut' ? 'gate' : 'refuse');
    if (!result.why) return;
    this.say(REFUSALS[result.why] ?? '', NOTE_MS);
  }

  private solveLevel(): void {
    this.bloom = 0;
    this.completeAt = now();
    const more = this.game.index + 1 < this.game.count;
    this.say(more ? 'The ember wakes. A deeper root stirs.' : 'The ember wakes, and above, the garden blooms.', 4200);
  }

  private say(text: string, ms: number): void {
    this.note = text;
    this.noteUntil = now() + ms;
    this.refresh();
  }

  private centreOf(index: number): { x: number; y: number } {
    const r = rectOf(this.game.level, index);
    return { x: r.x + r.s / 2, y: r.y + r.s / 2 };
  }

  private frame(): void {
    const t = now();
    this.effects.update();
    this.listenForMole();
    if (this.completeAt > 0) {
      this.bloom = clamp((t - this.completeAt) / COMPLETE_MS, 0, 1);
      if (t - this.completeAt > COMPLETE_MS) this.skipLevel();
    }
    if (this.note && t > this.noteUntil) this.note = '';
    render(this.ctx, this.view(t));
    this.refresh();
  }

  /** The mole only comes out for a resting player; give it a quiet voice. */
  private listenForMole(): void {
    const idle = this.effects.idle;
    const here = idle > MOLE_FROM_MS && idle < MOLE_FROM_MS + MOLE_SPAN_MS;
    if (here && !this.moleOut) this.sound.play('mole');
    this.moleOut = here;
  }

  private view(t: number): View {
    const level = this.game.level;
    return {
      level,
      path: this.game.route,
      awake: level.buds.filter((b) => this.game.route.includes(b)),
      time: this.calm ? 0 : t,
      calm: this.calm,
      bloom: this.bloom,
      listen: this.calm ? 0 : clamp((this.listenUntil - t) / LISTEN_MS, 0, 1),
      effects: this.effects,
    };
  }

  private refresh(): void {
    const level = this.game.level;
    const awake = level.buds.filter((b) => this.game.route.includes(b)).length;
    const total = level.buds.length;
    this.hud.level.textContent = `Level ${this.game.index + 1} of ${this.game.count} — ${level.name}`;
    this.hud.goal.textContent = total === 0 ? 'Reach the ember' : `Buds ${awake} of ${total}`;
    this.hud.hint.textContent = this.game.stuck
      ? 'The root has nowhere to grow — Undo a step, or Restart.'
      : level.hint;
    this.hud.note.textContent = this.note;
    this.hud.undo.disabled = !this.game.canUndo;
    const key = `${this.game.index}:${awake}`;
    if (key !== this.moodKey) {
      this.moodKey = key;
      this.sound.mood(this.game.index / this.game.count, awake);
    }
  }
}
