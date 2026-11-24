// Small, calm effects: a puff where the root grows, a ring where a bud opens,
// drifting motes, and a mole that crosses the bedrock when the player rests.
// Everything is time-based, and all of it can be turned off for reduced motion.

import { BOARD_H, BOARD_W, CELL, PALETTE, clamp, easeOut, hash, now } from './palette.js';

interface Mote {
  x: number;
  y: number;
  vy: number;
  seed: number;
  size: number;
}

interface Puff {
  x: number;
  y: number;
  born: number;
  life: number;
  size: number;
  color: string;
}

export interface RingAt {
  readonly x: number;
  readonly y: number;
  readonly color?: string;
  readonly life?: number;
  readonly max?: number;
}

interface Ring {
  x: number;
  y: number;
  born: number;
  life: number;
  max: number;
  color: string;
}

export class Effects {
  private puffs: Puff[] = [];
  private rings: Ring[] = [];
  private motes: Mote[] = [];
  private lastInput = now();

  constructor(private readonly calm: boolean, motes = 14) {
    for (let i = 0; i < motes; i += 1) {
      this.motes.push({
        x: hash(i, 1) * CELL * 7,
        y: hash(i, 2) * CELL * 6,
        vy: 3 + hash(i, 3) * 5,
        seed: hash(i, 4),
        size: hash(i, 5) < 0.35 ? 2 : 1,
      });
    }
  }

  puff(x: number, y: number, color: string = PALETTE.root, life = 0.45): void {
    if (this.calm) return;
    this.puffs.push({ x, y, born: now(), life, size: 3 + Math.random() * 2, color });
  }

  ring(at: RingAt): void {
    if (this.calm) return;
    const { x, y, color = PALETTE.budAwake, life = 0.9, max = 26 } = at;
    this.rings.push({ x, y, born: now(), life, max, color });
  }

  /** Any touch postpones the mole; it only comes out for a resting player. */
  noteInput(): void {
    this.lastInput = now();
  }

  get idle(): number {
    return now() - this.lastInput;
  }

  update(): void {
    const t = now();
    this.puffs = this.puffs.filter((p) => t - p.born < p.life);
    this.rings = this.rings.filter((r) => t - r.born < r.life);
    if (!this.calm) {
      for (const m of this.motes) {
        m.y -= m.vy * 0.016;
        if (m.y < -4) {
          m.y = CELL * 6 + 4;
          m.x = hash(Math.floor(t) + m.seed * 97, 7) * CELL * 7;
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawMotes(ctx);
    this.drawRings(ctx);
    this.drawPuffs(ctx);
    this.drawMole(ctx);
  }

  /** After sixteen quiet seconds a mole trundles along the bedrock, low down. */
  private drawMole(ctx: CanvasRenderingContext2D): void {
    if (this.calm || this.idle < 16000) return;
    const travel = (this.idle - 16000) / 9000;
    if (travel > 1.35) return;
    const x = -30 + travel * (BOARD_W + 60);
    const y = BOARD_H - 8;
    ctx.fillStyle = PALETTE.stoneShade;
    ctx.fillRect(Math.round(x), y - 8, 22, 8);
    ctx.fillRect(Math.round(x + 16), y - 12, 8, 5);
    ctx.fillStyle = PALETTE.soilBand;
    ctx.fillRect(Math.round(x + 20), y - 10, 2, 2);
  }

  private drawMotes(ctx: CanvasRenderingContext2D): void {
    if (this.calm) return;
    const t = now();
    for (const m of this.motes) {
      const sway = Math.sin(t * 0.0006 + m.seed * 6.3) * 6;
      ctx.fillStyle = PALETTE.soilBand;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(Math.round(m.x + sway), Math.round(m.y), m.size, m.size);
    }
    ctx.globalAlpha = 1;
  }

  private drawRings(ctx: CanvasRenderingContext2D): void {
    const t = now();
    for (const r of this.rings) {
      const p = easeOut(clamp((t - r.born) / r.life, 0, 1));
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = 1 - p;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 3 + p * r.max, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private drawPuffs(ctx: CanvasRenderingContext2D): void {
    const t = now();
    for (const p of this.puffs) {
      const k = clamp((t - p.born) / p.life, 0, 1);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 1 - k;
      const rise = k * 7;
      ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2 - rise), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}
