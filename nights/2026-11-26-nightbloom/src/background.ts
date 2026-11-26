// A slow, living meadow behind the board: grass blades and drifting pollen.
const TAU = Math.PI * 2;

export interface Blade {
  x: number;
  h: number;
  w: number;
  phase: number;
  lean: number;
}

export interface Drift {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
}

export interface Meadow {
  w: number;
  h: number;
  blades: Blade[];
  drift: Drift[];
  time: number;
  reduced: boolean;
}

export function makeBlades(w: number, h: number): Blade[] {
  const blades: Blade[] = [];
  const count = Math.max(14, Math.round(w / 26));
  for (let i = 0; i < count; i += 1) {
    blades.push({
      x: Math.random() * w,
      h: h * (0.05 + Math.random() * 0.15),
      w: 1 + Math.random() * 2,
      phase: Math.random() * TAU,
      lean: (Math.random() - 0.5) * 26,
    });
  }
  return blades;
}

export function makeDrift(w: number, h: number): Drift[] {
  const drift: Drift[] = [];
  for (let i = 0; i < 34; i += 1) {
    drift.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.6 + Math.random() * 1.5,
      speed: 3 + Math.random() * 9,
      phase: Math.random() * TAU,
    });
  }
  return drift;
}

function paintSky(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#0c1526");
  sky.addColorStop(0.55, "#0a1220");
  sky.addColorStop(1, "#08111c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const moon = ctx.createRadialGradient(w * 0.5, -h * 0.12, 0, w * 0.5, -h * 0.12, h * 0.75);
  moon.addColorStop(0, "rgba(126,168,214,0.20)");
  moon.addColorStop(1, "rgba(126,168,214,0)");
  ctx.fillStyle = moon;
  ctx.fillRect(0, 0, w, h);
}

function paintBlades(ctx: CanvasRenderingContext2D, meadow: Meadow): void {
  ctx.lineCap = "round";
  for (let i = 0; i < meadow.blades.length; i += 1) {
    const b = meadow.blades[i];
    const sway = meadow.reduced ? 0 : Math.sin(meadow.time * 0.5 + b.phase) * 5;
    ctx.strokeStyle = i % 3 === 0 ? "rgba(38,74,66,0.55)" : "rgba(27,56,52,0.5)";
    ctx.lineWidth = b.w;
    ctx.beginPath();
    ctx.moveTo(b.x, meadow.h + 2);
    ctx.quadraticCurveTo(b.x + b.lean * 0.3, meadow.h - b.h * 0.6, b.x + b.lean + sway, meadow.h - b.h);
    ctx.stroke();
  }
}

function paintDrift(ctx: CanvasRenderingContext2D, meadow: Meadow): void {
  const { w, h, time, reduced } = meadow;
  for (const d of meadow.drift) {
    const y = reduced ? d.y : (d.y - time * d.speed) % (h + 20);
    const x = d.x + (reduced ? 0 : Math.sin(time * 0.35 + d.phase) * 16);
    ctx.globalAlpha = 0.22 + 0.18 * Math.sin(time * 0.9 + d.phase);
    ctx.fillStyle = "#cfe0ff";
    ctx.beginPath();
    ctx.arc(((x % w) + w) % w, ((y % h) + h) % h, d.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawBackground(ctx: CanvasRenderingContext2D, meadow: Meadow): void {
  paintSky(ctx, meadow.w, meadow.h);
  paintBlades(ctx, meadow);
  paintDrift(ctx, meadow);
}
