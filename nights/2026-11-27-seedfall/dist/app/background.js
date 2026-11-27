import { PAL } from "./palette.js";
// A still night sky for the page behind the board: a soft moon, a scatter of
// stars and a far treeline. Drawn once per resize; nothing here animates.
export function drawSky(canvas, warmth = 0) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    const ctx = canvas.getContext("2d");
    if (ctx === null)
        return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#0d1730");
    sky.addColorStop(0.62, "#0b1428");
    sky.addColorStop(1, PAL.night);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    dawn(ctx, w, h, warmth);
    stars(ctx, w, h);
    moon(ctx, w, h);
    treeline(ctx, w, h);
}
// The horizon slowly warms as glades are finished, so the night itself marks progress.
function dawn(ctx, w, h, warmth) {
    if (warmth <= 0)
        return;
    const g = ctx.createLinearGradient(0, h * 0.55, 0, h);
    g.addColorStop(0, `rgba(240,186,128,0)`);
    g.addColorStop(1, `rgba(240,186,128,${(0.22 * warmth).toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);
}
function stars(ctx, w, h) {
    const count = Math.round((w * h) / 9000);
    for (let i = 0; i < count; i += 1) {
        const x = hash(i * 12.9898) * w;
        const y = hash(i * 78.233) * h * 0.72;
        const r = 0.6 + hash(i * 3.17) * 1.1;
        ctx.globalAlpha = 0.18 + hash(i * 5.71) * 0.5;
        ctx.fillStyle = i % 7 === 0 ? "#ffe9c2" : "#cfd9f2";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
function moon(ctx, w, h) {
    const x = w * 0.84;
    const y = h * 0.60;
    const r = Math.min(w, h) * 0.07;
    const halo = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 4.2);
    halo.addColorStop(0, "rgba(240,236,214,0.22)");
    halo.addColorStop(1, "rgba(240,236,214,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, r * 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3edd6";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(198,190,166,0.5)";
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y + r * 0.2, r * 0.24, 0, Math.PI * 2);
    ctx.arc(x + r * 0.34, y - r * 0.24, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
}
function treeline(ctx, w, h) {
    const base = h * 0.94;
    ctx.fillStyle = "rgba(7,12,24,0.92)";
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, base);
    for (let i = 0; i <= 24; i += 1) {
        const x = (w / 24) * i;
        const peak = base - (18 + hash(i * 9.1) * 46);
        ctx.lineTo(x, peak);
        ctx.lineTo(x + w / 48, base);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
}
// Deterministic 0..1 noise so the sky never reshuffles when the page resizes.
function hash(n) {
    const s = Math.sin(n) * 43758.5453;
    return s - Math.floor(s);
}
