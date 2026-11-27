import { PAL } from "./palette.js";
export function drawBoard(ctx, puzzle, state, view) {
    const ts = view.tile;
    ctx.clearRect(0, 0, puzzle.w * ts, puzzle.h * ts);
    drawFloor(ctx, puzzle, view);
    drawSpeckles(ctx, puzzle, ts);
    drawHollows(ctx, puzzle, state, view);
    drawWalls(ctx, puzzle, ts);
    drawSeeds(ctx, puzzle, state, view);
    drawBeetle(ctx, puzzle, state, view);
    drawEffects(ctx, view);
    drawVignette(ctx, puzzle, ts);
}
function drawFloor(ctx, puzzle, view) {
    const g = ctx.createLinearGradient(0, 0, 0, puzzle.h * view.tile);
    g.addColorStop(0, PAL.floorTop);
    g.addColorStop(1, PAL.floorBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, puzzle.w * view.tile, puzzle.h * view.tile);
}
// A scatter of faint moss flecks, placed from the tile index so it never flickers.
function drawSpeckles(ctx, puzzle, ts) {
    ctx.fillStyle = PAL.speck;
    ctx.globalAlpha = 0.5;
    for (let y = 0; y < puzzle.h; y += 1) {
        for (let x = 0; x < puzzle.w; x += 1) {
            if ((x * 7 + y * 13) % 5 !== 0)
                continue;
            const px = (x + 0.3 + ((x * 3 + y) % 4) * 0.12) * ts;
            const py = (y + 0.68 + ((x + y * 5) % 3) * 0.1) * ts;
            ctx.fillRect(Math.round(px), Math.round(py), 3, 2);
        }
    }
    ctx.globalAlpha = 1;
}
function drawWalls(ctx, puzzle, ts) {
    for (let i = 0; i < puzzle.walls.length; i += 1) {
        if (!puzzle.walls[i])
            continue;
        const x = (i % puzzle.w) * ts;
        const y = Math.floor(i / puzzle.w) * ts;
        ctx.fillStyle = PAL.wallDark;
        ctx.fillRect(x, y, ts, ts);
        ctx.fillStyle = PAL.wall;
        roundRect(ctx, x + 1, y + 1, ts - 2, ts - 5, ts * 0.22);
        ctx.fill();
        ctx.fillStyle = PAL.wallLit;
        roundRect(ctx, x + 1, y + 1, ts - 2, ts * 0.2, ts * 0.2);
        ctx.fill();
    }
}
function drawHollows(ctx, puzzle, state, view) {
    const ts = view.tile;
    const breath = 0.5 + 0.5 * Math.sin(view.time / 1400);
    for (const h of puzzle.hollows) {
        const x = ((h % puzzle.w) + 0.5) * ts;
        const y = (Math.floor(h / puzzle.w) + 0.52) * ts;
        const filled = state.seeds.includes(h);
        const r = ts * 0.3;
        ctx.globalAlpha = filled ? 0.55 : 0.25 + 0.15 * breath;
        ctx.fillStyle = PAL.glow;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.7, r * 1.2, 0, 0, Math.PI * 2);
        if (view.motion > 0)
            ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = PAL.hollow;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = filled ? PAL.sprout : PAL.hollowRim;
        ctx.lineWidth = Math.max(2, ts * 0.045);
        ctx.stroke();
    }
}
function drawSeeds(ctx, puzzle, state, view) {
    const ts = view.tile;
    for (const s of state.seeds) {
        const x = ((s % puzzle.w) + 0.5) * ts;
        const y = (Math.floor(s / puzzle.w) + 0.48) * ts;
        const r = ts * 0.2;
        ctx.globalAlpha = 0.32;
        ctx.fillStyle = PAL.seedLit;
        ctx.beginPath();
        ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = PAL.seedDark;
        ctx.beginPath();
        ctx.arc(x, y + r * 0.16, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.seed;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.seedLit;
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.34, r * 0.36, 0, Math.PI * 2);
        ctx.fill();
    }
}
function drawBeetle(ctx, puzzle, state, view) {
    const ts = view.tile;
    const x = ((state.player % puzzle.w) + 0.5) * ts;
    const y = (Math.floor(state.player / puzzle.w) + 0.52) * ts;
    const bob = Math.sin(view.time / 620) * ts * 0.02 * view.motion;
    const r = ts * 0.24;
    ctx.fillStyle = PAL.beetleDark;
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.5 + bob, r * 1.05, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.beetle;
    ctx.beginPath();
    ctx.ellipse(x, y + bob, r * 0.95, r * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.beetleLit;
    ctx.beginPath();
    ctx.ellipse(x - r * 0.28, y - r * 0.3 + bob, r * 0.36, r * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.beetleDark;
    ctx.lineWidth = Math.max(1.5, ts * 0.03);
    ctx.beginPath();
    ctx.moveTo(x - r * 0.4, y - r * 0.8 + bob);
    ctx.lineTo(x - r * 0.9 - view.faceX * r * 0.5, y - r * 1.5 + bob - view.faceY * r * 0.5);
    ctx.moveTo(x + r * 0.4, y - r * 0.8 + bob);
    ctx.lineTo(x + r * 0.9 + view.faceX * r * 0.5, y - r * 1.5 + bob - view.faceY * r * 0.5);
    ctx.stroke();
}
function drawEffects(ctx, view) {
    const ts = view.tile;
    for (const e of view.effects) {
        const age = (view.time - e.born) / (e.life * Math.max(0.35, view.motion));
        if (age < 0 || age > 1)
            continue;
        const x = (e.x + 0.5) * ts;
        const y = (e.y + 0.5) * ts;
        ctx.globalAlpha = (1 - age) * 0.6;
        ctx.strokeStyle = e.kind === "tuck" ? PAL.sprout : PAL.ripple;
        ctx.lineWidth = Math.max(2, ts * 0.05);
        ctx.beginPath();
        ctx.arc(x, y, ts * (0.2 + age * 0.55), 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}
function drawVignette(ctx, puzzle, ts) {
    const w = puzzle.w * ts;
    const h = puzzle.h * ts;
    const g = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.2, w / 2, h * 0.5, Math.max(w, h) * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(4,8,18,0.5)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
}
export function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}
