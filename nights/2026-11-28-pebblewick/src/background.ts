/** The sky behind the shelf: still stars, and a warmth that grows with progress. */

const STARS = 110;

function hash(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function mix(from: string, to: string, t: number): string {
  const a = parseInt(from.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const channel = (shift: number): number => {
    const va = (a >> shift) & 255;
    const vb = (b >> shift) & 255;
    return Math.round(va + (vb - va) * t);
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function starField(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  for (let i = 0; i < STARS; i += 1) {
    const x = hash(i) * w;
    const y = hash(i + 400) * h * 0.72;
    const r = 0.4 + hash(i + 900) * 1.3;
    ctx.globalAlpha = 0.25 + hash(i + 1500) * 0.45;
    ctx.fillStyle = i % 9 === 0 ? "#f6d999" : "#cfe4e0";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Redraw the whole sky; called on load, on resize and when a shelf is done. */
export function drawSky(canvas: HTMLCanvasElement, progress: number): void {
  const ctx = canvas.getContext("2d");
  if (ctx === null) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, canvas.clientWidth);
  const h = Math.max(1, canvas.clientHeight);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, mix("#080f1c", "#121a38", progress));
  sky.addColorStop(0.62, mix("#0c1a24", "#1d2a44", progress));
  sky.addColorStop(1, mix("#10201f", "#2b3a3c", progress));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  starField(ctx, w, h);
  const dawn = ctx.createRadialGradient(w * 0.5, h * 1.04, 10, w * 0.5, h * 1.04, h * 0.55);
  dawn.addColorStop(0, `rgba(240, 196, 122, ${0.05 + progress * 0.28})`);
  dawn.addColorStop(1, "rgba(240, 196, 122, 0)");
  ctx.fillStyle = dawn;
  ctx.fillRect(0, 0, w, h);
}
