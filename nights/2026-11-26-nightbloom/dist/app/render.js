import { targetsOf } from "./board.js";
import { KINDS } from "./kinds.js";
import { CELL, PALETTE } from "./palette.js";
const TAU = Math.PI * 2;
export function keyOf(r, c) {
    return `${r},${c}`;
}
export function bloomOf(scene, r, c) {
    return scene.blooms.get(keyOf(r, c)) ?? 0;
}
function ease(t) {
    return 1 - (1 - t) * (1 - t) * (1 - t);
}
function paintGround(ctx, grid, size) {
    ctx.fillStyle = PALETTE.night;
    ctx.fillRect(0, 0, size, size);
    for (let r = 0; r < grid.length; r += 1) {
        for (let c = 0; c < grid[r].length; c += 1) {
            if (!grid[r][c])
                continue;
            const shade = (r + c) % 2 === 0 ? PALETTE.ground : PALETTE.groundAlt;
            ctx.fillStyle = shade;
            ctx.beginPath();
            ctx.roundRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4, 12);
            ctx.fill();
        }
    }
}
function paintStem(ctx, bloom) {
    const { cx, cy } = bloom;
    ctx.strokeStyle = PALETTE.stem;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy + CELL * 0.30);
    ctx.quadraticCurveTo(cx + 2, cy + CELL * 0.16, cx, cy + CELL * 0.03);
    ctx.stroke();
    ctx.fillStyle = PALETTE.stem;
    ctx.beginPath();
    ctx.ellipse(cx + CELL * 0.07, cy + CELL * 0.22, CELL * 0.07, CELL * 0.03, -0.6, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - CELL * 0.07, cy + CELL * 0.26, CELL * 0.06, CELL * 0.026, 0.6, 0, TAU);
    ctx.fill();
}
function paintBud(ctx, bloom) {
    const { cx, cy } = bloom;
    const alpha = 1 - bloom.eased;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PALETTE.bud;
    ctx.beginPath();
    ctx.ellipse(cx, cy - CELL * 0.01, CELL * 0.055, CELL * 0.085, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = PALETTE.budRim;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = "rgba(190,214,255,0.4)";
    ctx.beginPath();
    ctx.ellipse(cx - CELL * 0.015, cy - CELL * 0.035, CELL * 0.018, CELL * 0.03, -0.3, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
}
function paintPetals(ctx, bloom) {
    const { cx, cy, eased, info, spin } = bloom;
    const petals = info.petals;
    const reach = CELL * (0.06 + 0.12 * eased);
    ctx.fillStyle = info.tint;
    for (let i = 0; i < petals; i += 1) {
        const angle = (i / petals) * TAU + spin;
        ctx.save();
        ctx.translate(cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, CELL * (0.055 + 0.055 * eased), CELL * (0.028 + 0.04 * eased), 0, 0, TAU);
        ctx.fill();
        ctx.restore();
    }
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#f4f8ff";
    for (let i = 0; i < petals; i += 1) {
        const angle = (i / petals) * TAU + spin + Math.PI / petals;
        ctx.save();
        ctx.translate(cx + Math.cos(angle) * reach * 0.5, cy + Math.sin(angle) * reach * 0.5);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, CELL * 0.032 * eased, CELL * 0.022 * eased, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff6d8";
    ctx.beginPath();
    ctx.arc(cx, cy, CELL * 0.045 * eased + 1, 0, TAU);
    ctx.fill();
}
function paintGlow(ctx, bloom) {
    const { cx, cy, eased, info, pulse } = bloom;
    const radius = CELL * (0.2 + 0.5 * eased);
    const alpha = 0.22 * eased * (0.75 + 0.25 * pulse);
    if (alpha <= 0.01)
        return;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, info.glow);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = alpha;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
}
function paintFlower(ctx, scene, at) {
    const [r, c] = at;
    const cell = scene.grid[r][c];
    if (!cell)
        return;
    const info = KINDS[cell.kind];
    const bloom = bloomOf(scene, r, c);
    const cx = (c + 0.5) * CELL;
    const cy = (r + 0.5) * CELL + CELL * 0.05;
    const eased = ease(bloom);
    const pulse = Math.sin(scene.time * 1.4 + r * 0.7 + c * 1.1);
    const spin = scene.reduced ? 0 : scene.time * 0.12;
    const flower = { cx, cy, eased, info, spin, pulse };
    paintGlow(ctx, flower);
    paintStem(ctx, flower);
    if (eased < 0.99)
        paintBud(ctx, flower);
    if (eased > 0.01)
        paintPetals(ctx, flower);
}
function paintPulses(ctx, pulses) {
    for (const p of pulses) {
        const t = p.age / p.life;
        ctx.globalAlpha = (1 - t) * 0.5;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, CELL * (0.15 + 1.3 * t), 0, TAU);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}
function paintMotes(ctx, motes) {
    for (const m of motes) {
        ctx.globalAlpha = m.alpha;
        ctx.fillStyle = "#dfe8ff";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, TAU);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
function paintFlies(ctx, flies, time) {
    for (let i = 0; i < flies.length; i += 1) {
        const fly = flies[i];
        const blink = 0.5 + 0.5 * Math.sin(time * 3 + i * 2);
        ctx.globalAlpha = 0.35 + 0.45 * blink;
        const grad = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, 12);
        grad.addColorStop(0, "#fff6cc");
        grad.addColorStop(1, "rgba(255,240,180,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, 12, 0, TAU);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
function paintPreview(ctx, scene) {
    const preview = scene.preview;
    if (!preview)
        return;
    const targets = targetsOf(scene.grid, preview[0], preview[1]);
    ctx.globalAlpha = 0.85;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = PALETTE.preview;
    ctx.lineWidth = 2;
    for (const [tr, tc] of targets) {
        if (!scene.grid[tr]?.[tc])
            continue;
        ctx.strokeRect(tc * CELL + 5, tr * CELL + 5, CELL - 10, CELL - 10);
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
}
export function drawFrame(ctx, scene, size) {
    paintGround(ctx, scene.grid, size);
    for (let r = 0; r < scene.grid.length; r += 1) {
        for (let c = 0; c < scene.grid[r].length; c += 1)
            paintFlower(ctx, scene, [r, c]);
    }
    paintPreview(ctx, scene);
    paintPulses(ctx, scene.pulses);
    if (!scene.reduced)
        paintMotes(ctx, scene.motes);
    if (!scene.reduced && scene.flies.length > 0)
        paintFlies(ctx, scene.flies, scene.time);
}
