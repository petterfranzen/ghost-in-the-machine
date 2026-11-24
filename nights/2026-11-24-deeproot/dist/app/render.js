// Drawing the underground. Everything is laid out on whole pixels inside a
// fixed 7x6 field, so the ground never shifts between levels or resizes.
import { posOf } from './grid.js';
import { BOARD_COLS, BOARD_H, BOARD_ROWS, BOARD_W, CELL, PALETTE, clamp, hash } from './palette.js';
/** Fit the canvas to its stage at a whole-number scale, then report that scale. */
export function fitCanvas(canvas) {
    const stage = canvas.parentElement;
    const availW = (stage?.clientWidth ?? BOARD_W) - 8;
    const availH = (stage?.clientHeight ?? BOARD_H) - 8;
    const scale = Math.max(1, Math.floor(Math.min(availW / BOARD_W, availH / BOARD_H)));
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const cssW = BOARD_W * scale;
    const cssH = BOARD_H * scale;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx)
        ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    return scale;
}
const offsetOf = (span, board) => ((board - span) / 2) * CELL;
export function rectOf(level, index) {
    const { x, y } = posOf(level, index);
    return {
        x: offsetOf(level.width, BOARD_COLS) + x * CELL,
        y: offsetOf(level.height, BOARD_ROWS) + y * CELL,
        s: CELL,
    };
}
const inside = (level, x, y) => x >= 0 && y >= 0 && x < level.width && y < level.height;
export function cellAt(level, px, py) {
    const ox = offsetOf(level.width, BOARD_COLS);
    const oy = offsetOf(level.height, BOARD_ROWS);
    const x = Math.floor((px - ox) / CELL);
    const y = Math.floor((py - oy) / CELL);
    return inside(level, x, y) ? y * level.width + x : -1;
}
export function render(ctx, view) {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = PALETTE.bedrock;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);
    drawBackdrop(ctx, view);
    drawField(ctx, view);
    drawRoot(ctx, view);
    if (view.listen > 0)
        drawListen(ctx, view);
    view.effects.draw(ctx);
}
/** Faint strata and pebbles behind the tiles, so the empty field reads as earth. */
function drawBackdrop(ctx, view) {
    ctx.fillStyle = PALETTE.strata;
    for (let band = 0; band < 7; band += 1) {
        const y = 20 + band * 40 + Math.round(hash(band, 2) * 12);
        ctx.fillRect(0, y, BOARD_W, 1);
    }
    ctx.fillStyle = PALETTE.pebble;
    for (let k = 0; k < 70; k += 1) {
        const x = Math.round(hash(k, 11) * (BOARD_W - 4)) + 2;
        const y = Math.round(hash(k, 23) * (BOARD_H - 4)) + 2;
        const w = 2 + Math.round(hash(k, 31) * 3);
        ctx.fillRect(x, y, w, 2);
    }
    const glow = view.calm ? 0.35 : 0.35 + 0.1 * Math.sin(view.time * 0.0007);
    ctx.globalAlpha = glow * 0.18;
    ctx.fillStyle = PALETTE.ember;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);
    ctx.globalAlpha = 1;
}
function drawField(ctx, view) {
    const { level } = view;
    for (let index = 0; index < level.tiles.length; index += 1) {
        drawTile(ctx, level.tiles[index], { rect: rectOf(level, index), index }, view);
    }
}
function drawTile(ctx, tile, cell, view) {
    const paint = TILE_PAINTERS[tile];
    if (paint)
        paint(ctx, cell.rect, cell.index, view);
}
const paintSoil = (ctx, r, index) => {
    ctx.fillStyle = index % 2 === 0 ? PALETTE.soil : PALETTE.soilBand;
    ctx.fillRect(r.x, r.y, r.s, r.s);
    ctx.fillStyle = PALETTE.seam;
    ctx.fillRect(r.x, r.y + r.s - 1, r.s, 1);
    ctx.fillRect(r.x + r.s - 1, r.y, 1, r.s);
    ctx.fillStyle = PALETTE.speckle;
    for (let k = 0; k < 4; k += 1) {
        const sx = Math.round(r.x + hash(index, k) * (r.s - 6)) + 2;
        const sy = Math.round(r.y + hash(index, k + 9) * (r.s - 6)) + 2;
        ctx.fillRect(sx, sy, 2, 2);
    }
};
const paintStone = (ctx, r, index) => {
    ctx.fillStyle = PALETTE.stone;
    ctx.fillRect(r.x + 1, r.y + 1, r.s - 2, r.s - 2);
    ctx.fillStyle = PALETTE.stoneTop;
    ctx.fillRect(r.x + 1, r.y + 1, r.s - 2, 5);
    ctx.fillStyle = PALETTE.stoneShade;
    ctx.fillRect(r.x + 1, r.y + r.s - 6, r.s - 2, 5);
    ctx.fillRect(Math.round(r.x + 6 + hash(index, 3) * 16), Math.round(r.y + 16 + hash(index, 4) * 14), 4, 3);
};
const paintWater = (ctx, r, index, view) => {
    ctx.fillStyle = PALETTE.water;
    ctx.fillRect(r.x, r.y + 3, r.s, r.s - 6);
    ctx.fillStyle = PALETTE.waterRipple;
    ctx.globalAlpha = 0.5;
    const drift = view.calm ? 0 : Math.sin(view.time * 0.0011 + index) * 3;
    for (let k = 0; k < 3; k += 1) {
        const y = Math.round(r.y + 14 + k * 11 + (k % 2 ? drift : -drift));
        ctx.fillRect(r.x + 4 + (k % 2) * 6, y, r.s - 12 - (k % 2) * 8, 2);
    }
    ctx.globalAlpha = 1;
};
const petals = (ctx, p) => {
    for (let k = 0; k < 5; k += 1) {
        const a = (Math.PI * 2 * k) / 5 + p.spin;
        ctx.fillRect(Math.round(p.cx + Math.cos(a) * p.size * 0.5 - 2), Math.round(p.cy + Math.sin(a) * p.size * 0.5 - 2), 5, 5);
    }
};
const paintBud = (ctx, r, index, view) => {
    const open = view.awake.includes(index);
    const pulse = view.calm ? 0 : Math.sin(view.time * 0.0016 + index) * 1.5;
    const size = open ? 12 + pulse + view.bloom * 8 : 8;
    const cx = r.x + r.s / 2;
    const cy = r.y + r.s / 2;
    const ink = open ? PALETTE.budAwake : PALETTE.budAsleep;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 10);
    ctx.lineTo(cx, cy + 2);
    ctx.stroke();
    ctx.fillStyle = ink;
    petals(ctx, { cx, cy, size, spin: open ? view.time * 0.0004 : 0 });
    ctx.fillStyle = open ? PALETTE.budCore : PALETTE.budAsleep;
    ctx.fillRect(Math.round(cx - 2), Math.round(cy - 2), 5, 5);
};
const paintEmber = (ctx, r, _index, view) => {
    const breathe = view.calm ? 0.6 : 0.5 + 0.5 * Math.sin(view.time * 0.0009);
    const hot = clamp(0.25 + breathe * 0.75 + view.bloom, 0, 1);
    const cx = r.x + r.s / 2;
    const cy = r.y + r.s / 2;
    ctx.globalAlpha = hot * 0.5;
    ctx.fillStyle = PALETTE.ember;
    ctx.beginPath();
    ctx.arc(cx, cy, 14 + hot * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.emberCold;
    ctx.fillRect(r.x + 12, r.y + 12, r.s - 24, r.s - 24);
    ctx.fillStyle = PALETTE.ember;
    const s = 4 + Math.round(hot * 5);
    ctx.fillRect(Math.round(cx - s / 2), Math.round(cy - s / 2), s, s);
};
const paintPortal = (ctx, r, index, view) => {
    const spin = view.calm ? 0 : view.time * 0.0006;
    const cx = r.x + r.s / 2;
    const cy = r.y + r.s / 2;
    ctx.strokeStyle = PALETTE.portal;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 15, spin + index, spin + index + Math.PI * 1.5);
    ctx.stroke();
    ctx.fillStyle = PALETTE.portalGlow;
    for (let k = 0; k < 3; k += 1) {
        const a = spin * 2 + (Math.PI * 2 * k) / 3;
        ctx.fillRect(Math.round(cx + Math.cos(a) * 15 - 1), Math.round(cy + Math.sin(a) * 15 - 1), 3, 3);
    }
};
const paintSeed = (ctx, r, index) => {
    paintSoil(ctx, r, index, EMPTY_VIEW);
    ctx.fillStyle = PALETTE.seed;
    ctx.fillRect(Math.round(r.x + r.s / 2 - 3), Math.round(r.y + r.s / 2 - 4), 6, 8);
    ctx.fillStyle = PALETTE.stoneShade;
    ctx.fillRect(Math.round(r.x + r.s / 2 - 1), Math.round(r.y + r.s / 2 + 4), 2, 3);
};
const TILE_PAINTERS = {
    soil: paintSoil,
    stone: paintStone,
    water: paintWater,
    bud: paintBud,
    ember: paintEmber,
    portal: paintPortal,
    seed: paintSeed,
};
const EMPTY_VIEW = {
    level: {},
    path: [],
    awake: [],
    time: 0,
    calm: true,
    bloom: 0,
    listen: 0,
    effects: null,
};
function drawRoot(ctx, view) {
    const { level, path } = view;
    for (let i = 1; i < path.length; i += 1) {
        drawSegment(ctx, rectOf(level, path[i - 1]), rectOf(level, path[i]));
    }
}
function drawSegment(ctx, a, b) {
    const ax = a.x + a.s / 2;
    const ay = a.y + a.s / 2;
    const bx = b.x + b.s / 2;
    const by = b.y + b.s / 2;
    const adjacent = Math.abs(ax - bx) + Math.abs(ay - by) <= CELL + 1;
    const line = { ax, ay, bx, by, solid: adjacent };
    ctx.strokeStyle = PALETTE.rootShade;
    ctx.lineWidth = 9;
    stroke(ctx, line);
    ctx.strokeStyle = PALETTE.root;
    ctx.lineWidth = 5;
    stroke(ctx, line);
}
function stroke(ctx, line) {
    ctx.beginPath();
    ctx.setLineDash(line.solid ? [] : [3, 5]);
    ctx.moveTo(line.ax, line.ay);
    ctx.lineTo(line.bx, line.by);
    ctx.stroke();
    ctx.setLineDash([]);
}
/** A long press on the soil "listens": the buried buds answer with a faint glow. */
function drawListen(ctx, view) {
    ctx.globalAlpha = view.listen * 0.5;
    ctx.strokeStyle = PALETTE.budAwake;
    for (const bud of view.level.buds) {
        if (view.awake.includes(bud))
            continue;
        const r = rectOf(view.level, bud);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(r.x + r.s / 2, r.y + r.s / 2, 14, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}
