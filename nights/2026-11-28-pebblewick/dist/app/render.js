/** The shelf's painter: composes the shapes in a fixed order, once per frame. */
import { palette } from "./palette.js";
import { drawBall, drawBumper, drawGround, drawHollow, drawMoth, drawMound, drawMote, drawPatch, drawSecret, drawWall, SHELF_INSET, } from "./render-shapes.js";
import { BALL_RADIUS } from "./types.js";
export const TRAIL_LIFE = 1700;
export const RING_LIFE = 900;
const LAYERS = [
    (ctx, f, s) => drawGround(ctx, f.board, f.view.time, s.lean),
    (ctx, f) => f.level.mounds.forEach((m) => drawMound(ctx, m)),
    (ctx, f) => f.level.walls.forEach((w) => drawWall(ctx, w)),
    (ctx, f) => f.level.moss.forEach((m) => drawPatch(ctx, m, { fill: palette.moss, spots: 26, time: f.view.time })),
    (ctx, f) => f.level.slick.forEach((s) => drawPatch(ctx, s, { fill: palette.slick, spots: 14, time: f.view.time })),
    (ctx, f) => f.level.bumpers.forEach((b) => drawBumper(ctx, b)),
    (ctx, f, s) => f.level.motes.forEach((m, i) => drawMote(ctx, m, s.lit[i] === true, f.view)),
    (ctx, f, s) => drawHollow(ctx, f.level.hollow, s.lit.every(Boolean), f.view.time),
    (ctx, f, s) => drawSecretLayer(ctx, f, s),
    (ctx, _f, s) => drawTrail(ctx, s.trail, _f.view.time),
    (ctx, _f, s) => drawRings(ctx, s.rings, _f.view.time),
    (ctx, _f, s) => drawMothLayer(ctx, s, _f.view.time),
    (ctx, _f, s) => drawBall(ctx, s, _f.view),
];
/** The hidden spot only appears once the pebble has found it. */
function drawSecretLayer(ctx, frame, scene) {
    if (scene.found && frame.level.secret !== undefined)
        drawSecret(ctx, frame.level.secret, frame.view.time);
}
function drawMothLayer(ctx, scene, time) {
    if (scene.moth !== null)
        drawMoth(ctx, scene.moth, time);
}
export function drawShelf(ctx, frame, scene) {
    ctx.setTransform(frame.view.tile, 0, 0, frame.view.tile, 0, 0);
    ctx.clearRect(0, 0, frame.board.w, frame.board.h);
    for (const layer of LAYERS)
        layer(ctx, frame, scene);
}
function drawTrail(ctx, trail, time) {
    for (const t of trail) {
        const age = 1 - (time - t.born) / TRAIL_LIFE;
        if (age <= 0)
            continue;
        ctx.globalAlpha = 0.34 * age;
        ctx.fillStyle = palette.ball;
        ctx.beginPath();
        ctx.arc(t.x, t.y, BALL_RADIUS * 0.62, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
function drawRings(ctx, rings, time) {
    for (const ring of rings) {
        const age = (time - ring.born) / RING_LIFE;
        if (age < 0 || age > 1)
            continue;
        ctx.globalAlpha = 0.5 * (1 - age);
        ctx.strokeStyle = palette.ball;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 6 + age * 22, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}
export { SHELF_INSET };
