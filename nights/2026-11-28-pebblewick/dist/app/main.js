import { Sound } from "./audio.js";
import { drawSky } from "./background.js";
import { Controls } from "./input.js";
import { LEVELS } from "./levels.js";
import { BALL_RADIUS, BOARD } from "./types.js";
import { drawShelf, RING_LIFE, TRAIL_LIFE } from "./render.js";
import { Run } from "./run.js";
import { announce, collectUi, hideBanner, showBanner, showGoal, showLevel } from "./ui.js";
const ui = collectUi();
const sound = new Sound();
const screen = ui.board.getContext("2d");
if (screen === null)
    throw new Error("Pebblewick: no 2d canvas context");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let motion = reduced.matches ? 0.35 : 1;
reduced.addEventListener("change", () => { motion = reduced.matches ? 0.35 : 1; });
const started = performance.now();
const now = () => performance.now() - started;
let lastFrame = now();
let index = 0;
let run = new Run(LEVELS[0]);
let trail = [];
let rings = [];
let reached = 0;
let homedAt = null;
let hop = 0;
let stillSince = now();
let mothAt = null;
let tile = 1;
function paintSound() {
    const on = sound.enabled;
    ui.sound.textContent = on ? "Sound on" : "Sound off";
    ui.sound.setAttribute("aria-pressed", on ? "true" : "false");
}
function toWorld(clientX, clientY) {
    const box = ui.board.getBoundingClientRect();
    return {
        x: ((clientX - box.left) / Math.max(1, box.width)) * BOARD.w,
        y: ((clientY - box.top) / Math.max(1, box.height)) * BOARD.h,
    };
}
function onTap(point) {
    const ball = run.read().ball;
    const onPebble = Math.hypot(ball.x - point.x, ball.y - point.y) <= BALL_RADIUS + 14;
    if (onPebble && !run.solved) {
        hop = 1;
        sound.hop();
        rings.push({ x: ball.x, y: ball.y, born: now() });
        announce(ui, "The pebble hops, and settles again.");
        return;
    }
    sound.tap();
    rings.push({ x: point.x, y: point.y, born: now() });
}
const controls = new Controls(ui.board, { toWorld, onTap });
controls.attach();
for (const button of ui.pad.querySelectorAll("[data-dir]")) {
    const dir = button.dataset.dir;
    if (dir !== undefined)
        controls.bindButton(button, dir);
}
function fit() {
    const stage = ui.board.parentElement;
    if (stage === null)
        return;
    const box = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = Math.min(Math.max(box.width - 4, 60) / BOARD.w, Math.max(box.height - 4, 60) / BOARD.h);
    const width = Math.floor(scale * BOARD.w);
    const height = Math.floor(scale * BOARD.h);
    ui.board.style.width = `${width}px`;
    ui.board.style.height = `${height}px`;
    ui.board.width = Math.max(1, Math.round(width * dpr));
    ui.board.height = Math.max(1, Math.round(height * dpr));
    tile = ui.board.width / BOARD.w;
}
function startLevel(next) {
    index = next;
    run = new Run(LEVELS[index]);
    trail = [];
    rings = [];
    hop = 0;
    homedAt = null;
    mothAt = null;
    stillSince = now();
    showLevel(ui, index, LEVELS.length, LEVELS[index]);
    showGoal(ui, 0, run.totalMotes, false);
    hideBanner(ui);
    drawSky(ui.bg, reached / LEVELS.length);
    sound.progress(reached / LEVELS.length);
    fit();
    announce(ui, "");
}
function finish() {
    homedAt = now();
    reached = Math.max(reached, index + 1);
    drawSky(ui.bg, reached / LEVELS.length);
    sound.progress(reached / LEVELS.length);
    const last = index === LEVELS.length - 1;
    const text = last
        ? "Every shelf is home. The sky warms, and the pebble rests where it was always rolling."
        : `Home. ${LEVELS[index + 1].name} waits on the next shelf.`;
    showGoal(ui, run.totalMotes, run.totalMotes, true);
    showBanner(ui, text, last);
    announce(ui, "");
}
function takeEvent(event) {
    if (event.kind === "secret") {
        sound.secret();
        announce(ui, "Something under the moss answers. A hidden stone glows.");
        return;
    }
    if (event.kind === "home") {
        sound.home();
        finish();
        return;
    }
    const lit = run.litCount;
    sound.mote(lit);
    showGoal(ui, lit, run.totalMotes, lit === run.totalMotes);
    announce(ui, lit === run.totalMotes ? "Every light is awake. Roll the pebble into the hollow." : `Light ${lit} of ${run.totalMotes}.`);
}
function trackTrail(ball, speed, time) {
    const last = trail[trail.length - 1];
    const moved = last === undefined ? 99 : Math.hypot(ball.x - last.x, ball.y - last.y);
    if (speed > 0.08 && moved > 7)
        trail.push({ x: ball.x, y: ball.y, born: time });
}
function mothPos(time) {
    if (mothAt === null)
        return null;
    const life = time - mothAt;
    if (life > 11000)
        return null;
    const k = life / 11000;
    return { x: BOARD.w * (0.1 + k * 1.05), y: BOARD.h * (0.32 + Math.sin(k * 7.2) * 0.17) };
}
/** True once the shelf has been still long enough for the moth to visit. */
function mothReady(time) {
    if (mothAt !== null)
        return false;
    if (run.solved)
        return false;
    return time - stillSince >= 15000;
}
function idle(speed, time) {
    if (speed > 0.05)
        stillSince = time;
    if (!mothReady(time))
        return;
    mothAt = time;
    announce(ui, "A moth drifts in from the dark, and away again.");
}
function paint(read, tilt, time) {
    const sink = homedAt === null ? 0 : Math.min(1, (time - homedAt) / 1500);
    drawShelf(screen, { level: LEVELS[index], board: BOARD, view: { tile, time, motion } }, {
        ball: read.ball,
        lit: read.lit,
        found: read.found,
        homed: read.homed,
        sink,
        lean: tilt,
        trail,
        rings,
        hop,
        moth: mothPos(time),
    });
}
function frame() {
    const time = now();
    const dt = Math.min(64, Math.max(4, time - lastFrame));
    lastFrame = time;
    controls.update(time, dt);
    run.tilt(run.solved ? { x: 0, y: 0 } : controls.tilt());
    for (const event of run.drain())
        takeEvent(event);
    const read = run.read();
    trackTrail(read.ball, read.speed, time);
    trail = trail.filter((p) => time - p.born < TRAIL_LIFE);
    rings = rings.filter((p) => time - p.born < RING_LIFE);
    hop = Math.max(0, hop - dt / 420);
    idle(read.speed, time);
    paint(read, controls.tilt(), time);
    ui.board.classList.add("lit");
    requestAnimationFrame(frame);
}
ui.undo.addEventListener("click", () => {
    run.reset();
    trail = [];
    rings = [];
    homedAt = null;
    showGoal(ui, 0, run.totalMotes, false);
    hideBanner(ui);
    announce(ui, "Back to the top of the shelf.");
});
ui.restart.addEventListener("click", () => startLevel(index));
ui.next.addEventListener("click", () => startLevel(index === LEVELS.length - 1 ? 0 : index + 1));
ui.sound.addEventListener("click", () => {
    void sound.toggle().then((on) => {
        paintSound();
        announce(ui, on ? "Sound on. The shelf breathes." : "Sound off.");
    });
});
ui.board.addEventListener("pointerdown", () => void sound.resume());
document.addEventListener("visibilitychange", () => {
    if (!document.hidden)
        void sound.resume();
});
window.addEventListener("resize", () => {
    drawSky(ui.bg, reached / LEVELS.length);
    fit();
});
window.pebblewick = {
    read: () => {
        const read = run.read();
        return {
            shelf: index,
            name: read.name,
            ball: read.ball,
            speed: read.speed,
            lit: read.lit,
            found: read.found,
            homed: read.homed,
            motes: LEVELS[index].motes,
            hollow: LEVELS[index].hollow,
            tile: tile / Math.min(window.devicePixelRatio || 1, 2),
            gone: homedAt !== null,
        };
    },
    go: startLevel,
    push: (x, y, ms) => {
        controls.pushTilt({ x, y }, ms);
    },
};
paintSound();
startLevel(0);
drawSky(ui.bg, 0);
requestAnimationFrame(frame);
