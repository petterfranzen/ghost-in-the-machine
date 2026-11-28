/** Every drawing primitive Pebblewick uses: ground, props, motes, pebble. */
import { palette } from "./palette.js";
import {
  BALL_RADIUS,
  MOTE_RADIUS,
  type Board,
  type Disc,
  type Rect,
  type Scene,
  type Tilt,
  type Vec,
  type View,
} from "./types.js";

export const SHELF_INSET = 7;
export const SHELF_RADIUS = 22;
const SPECKLES = 190;

/** A rounded rectangle described in one object, so calls stay short. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

export function rounded(ctx: CanvasRenderingContext2D, box: Box): void {
  const corner = Math.min(box.r, box.w / 2, box.h / 2);
  ctx.beginPath();
  ctx.moveTo(box.x + corner, box.y);
  ctx.arcTo(box.x + box.w, box.y, box.x + box.w, box.y + box.h, corner);
  ctx.arcTo(box.x + box.w, box.y + box.h, box.x, box.y + box.h, corner);
  ctx.arcTo(box.x, box.y + box.h, box.x, box.y, corner);
  ctx.arcTo(box.x, box.y, box.x + box.w, box.y, corner);
  ctx.closePath();
}

/** The shelf's own outline, inset from the board edge. */
export function shelfBox(board: Board, inset: number, r: number): Box {
  return { x: inset, y: inset, w: board.w - inset * 2, h: board.h - inset * 2, r };
}

function discPath(ctx: CanvasRenderingContext2D, d: Disc): void {
  ctx.beginPath();
  ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
}

/** A stable pseudo-random in [0, 1) from a seed, so the moss never flickers. */
function noise(seed: number): number {
  const raw = Math.sin(seed * 127.1) * 43758.5453;
  return raw - Math.floor(raw);
}

/** Soft moss speckles and a few darker dents, so the shelf reads as grown, not painted. */
function drawSpeckles(ctx: CanvasRenderingContext2D, board: Board): void {
  for (let i = 0; i < SPECKLES; i += 1) {
    const x = SHELF_INSET + noise(i + 1) * (board.w - SHELF_INSET * 2);
    const y = SHELF_INSET + noise(i + 91) * (board.h - SHELF_INSET * 2);
    const r = 0.7 + noise(i + 181) * 2.1;
    const dark = i % 7 === 0;
    ctx.fillStyle = dark ? palette.shelfDark : palette.mossLit;
    ctx.globalAlpha = dark ? 0.28 : 0.16 + noise(i + 271) * 0.16;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Two slow bands of light crossing the shelf, like the sky's own reflection. */
function drawGrain(ctx: CanvasRenderingContext2D, board: Board, time: number): void {
  ctx.strokeStyle = palette.mossLit;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i += 1) {
    const drift = Math.sin(time / (4200 + i * 1300) + i) * 10;
    const top = board.h * (0.28 + i * 0.22) + drift;
    ctx.globalAlpha = 0.07 + i * 0.02;
    ctx.beginPath();
    ctx.moveTo(SHELF_INSET, top);
    ctx.bezierCurveTo(board.w * 0.3, top - board.h * 0.08, board.w * 0.7, top + board.h * 0.08, board.w - SHELF_INSET, top + board.h * 0.02);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** A darker lip around the rim, so the moss looks thick and slightly raised. */
function drawEdgeShade(ctx: CanvasRenderingContext2D, board: Board): void {
  for (let i = 0; i < 3; i += 1) {
    ctx.globalAlpha = 0.16 - i * 0.045;
    ctx.strokeStyle = palette.shelfDark;
    ctx.lineWidth = 3;
    rounded(ctx, shelfBox(board, SHELF_INSET + i * 2, SHELF_RADIUS - i));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Ground: a rounded shelf of moss, with grain and speckles so it is not flat. */
export function drawGround(ctx: CanvasRenderingContext2D, board: Board, time: number, lean: Tilt): void {
  ctx.fillStyle = palette.night;
  ctx.fillRect(0, 0, board.w, board.h);
  const breathe = 1 + Math.sin(time / 5200) * 0.012;
  const cx = board.w / 2 + lean.x * board.w * 0.16;
  const cy = board.h / 2 + lean.y * board.h * 0.14;
  const wash = ctx.createRadialGradient(cx, cy, board.w * 0.1, board.w / 2, board.h * 0.5, board.w * 0.95 * breathe);
  wash.addColorStop(0, palette.shelf);
  wash.addColorStop(1, palette.shelfDark);
  rounded(ctx, shelfBox(board, SHELF_INSET, SHELF_RADIUS));
  ctx.fillStyle = wash;
  ctx.fill();
  ctx.save();
  rounded(ctx, shelfBox(board, SHELF_INSET, SHELF_RADIUS));
  ctx.clip();
  drawSpeckles(ctx, board);
  drawGrain(ctx, board, time);
  drawEdgeShade(ctx, board);
  ctx.restore();
  ctx.strokeStyle = palette.wallLit;
  ctx.lineWidth = 1.5;
  rounded(ctx, shelfBox(board, SHELF_INSET, SHELF_RADIUS));
  ctx.stroke();
}

export function drawMound(ctx: CanvasRenderingContext2D, m: Disc): void {
  ctx.fillStyle = palette.mound;
  discPath(ctx, m);
  ctx.fill();
  ctx.fillStyle = palette.moundLit;
  ctx.beginPath();
  ctx.arc(m.x - m.r * 0.24, m.y - m.r * 0.26, m.r * 0.62, 0, Math.PI * 2);
  ctx.fill();
}

export function drawWall(ctx: CanvasRenderingContext2D, w: Rect): void {
  ctx.fillStyle = palette.wall;
  rounded(ctx, { x: w.x - w.w / 2, y: w.y - w.h / 2, w: w.w, h: w.h, r: 10 });
  ctx.fill();
  ctx.fillStyle = palette.wallLit;
  rounded(ctx, { x: w.x - w.w / 2, y: w.y - w.h / 2, w: w.w, h: w.h * 0.34, r: 8 });
  ctx.fill();
}

export interface Patch {
  fill: string;
  spots: number;
  time: number;
}

export function drawPatch(ctx: CanvasRenderingContext2D, d: Disc, patch: Patch): void {
  ctx.fillStyle = patch.fill;
  discPath(ctx, d);
  ctx.fill();
  ctx.fillStyle = palette.mossLit;
  for (let i = 0; i < patch.spots; i += 1) {
    const angle = (i / patch.spots) * Math.PI * 2 + Math.sin(patch.time / 2600 + i) * 0.2;
    const radius = d.r * (0.35 + 0.5 * ((i * 37) % 11) / 11);
    ctx.beginPath();
    ctx.arc(d.x + Math.cos(angle) * radius, d.y + Math.sin(angle) * radius, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawBumper(ctx: CanvasRenderingContext2D, b: Disc): void {
  ctx.fillStyle = palette.bumper;
  discPath(ctx, b);
  ctx.fill();
  ctx.fillStyle = palette.wall;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

export function drawMote(ctx: CanvasRenderingContext2D, m: Vec, lit: boolean, view: View): void {
  if (!lit) {
    drawDarkMote(ctx, m, view);
    return;
  }
  const pulse = 0.72 + 0.28 * Math.sin(view.time / 900);
  const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, MOTE_RADIUS * 4.4 * pulse);
  glow.addColorStop(0, "rgba(242, 196, 106, 0.55)");
  glow.addColorStop(1, "rgba(242, 196, 106, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(m.x, m.y, MOTE_RADIUS * 4.4 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.mote;
  ctx.beginPath();
  ctx.arc(m.x, m.y, MOTE_RADIUS * 0.8, 0, Math.PI * 2);
  ctx.fill();
}

/** An unlit mote: a ring of dim spores, still waiting. */
function drawDarkMote(ctx: CanvasRenderingContext2D, m: Vec, view: View): void {
  ctx.fillStyle = palette.moteDark;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + view.time / 5200;
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(view.time / 700 + i);
    ctx.beginPath();
    ctx.arc(m.x + Math.cos(a) * MOTE_RADIUS, m.y + Math.sin(a) * MOTE_RADIUS, 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawHollow(ctx: CanvasRenderingContext2D, hollow: Disc, ready: boolean, time: number): void {
  ctx.fillStyle = palette.hollow;
  discPath(ctx, hollow);
  ctx.fill();
  ctx.strokeStyle = palette.hollowRim;
  ctx.globalAlpha = ready ? 0.5 + 0.5 * Math.sin(time / 1100) : 0.22;
  ctx.lineWidth = ready ? 3 : 2;
  discPath(ctx, hollow);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawSecret(ctx: CanvasRenderingContext2D, s: Vec, time: number): void {
  const pulse = 0.5 + 0.5 * Math.sin(time / 1400);
  ctx.globalAlpha = 0.35 + 0.4 * pulse;
  ctx.fillStyle = palette.secret;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 7 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawMoth(ctx: CanvasRenderingContext2D, m: Vec, time: number): void {
  const halo = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 14);
  halo.addColorStop(0, "rgba(233, 240, 230, 0.5)");
  halo.addColorStop(1, "rgba(233, 240, 230, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(m.x, m.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.spore;
  ctx.beginPath();
  ctx.arc(m.x + Math.sin(time / 130) * 2.4, m.y, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBall(ctx: CanvasRenderingContext2D, scene: Scene, view: View): void {
  const lift = Math.sin(scene.hop * Math.PI) * 6;
  const scale = Math.max(0.1, 1 - scene.sink * 0.35) * (1 + Math.sin(view.time / 700) * 0.012 * view.motion);
  const x = scene.ball.x;
  const y = scene.ball.y - lift - Math.sin(view.time / 900) * 0.6 * view.motion;
  drawShadow(ctx, scene.ball.x, scene.ball.y + lift * 0.4, BALL_RADIUS * scale, lift);
  const body = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, BALL_RADIUS * scale);
  body.addColorStop(0, "#fff3d2");
  body.addColorStop(1, palette.ballRim);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, BALL_RADIUS * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, lift: number): void {
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = palette.night;
  ctx.beginPath();
  ctx.ellipse(x + 1.5, y + 3, r * (1 - lift * 0.05), r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
