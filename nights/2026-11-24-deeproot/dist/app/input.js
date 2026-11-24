// Pointer and keyboard wiring. It only translates events into intents, so the
// Session never has to know about pointer ids or timers.
import { cellAt } from './render.js';
import { BOARD_W } from './palette.js';
const LONG_PRESS_MS = 520;
const DRAG_SLOP = 9;
const DIRECTION_KEYS = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
};
export function attachInput(target) {
    const press = { id: -1, x: 0, y: 0, moved: false, heard: false, timer: 0 };
    const cellOf = (e) => {
        const box = target.canvas.getBoundingClientRect();
        const scale = box.width / BOARD_W || 1;
        return cellAt(target.currentLevel(), (e.clientX - box.left) / scale, (e.clientY - box.top) / scale);
    };
    target.canvas.addEventListener('pointerdown', (e) => down(target, press, e));
    target.canvas.addEventListener('pointermove', (e) => move(target, press, cellOf(e), e));
    target.canvas.addEventListener('pointerup', (e) => up(target, press, cellOf(e), e));
    target.canvas.addEventListener('pointercancel', () => {
        window.clearTimeout(press.timer);
        press.id = -1;
    });
    window.addEventListener('keydown', (e) => key(target, e));
}
function down(target, press, e) {
    if (target.busy())
        return target.skipLevel();
    target.canvas.setPointerCapture(e.pointerId);
    target.notePress();
    press.id = e.pointerId;
    press.x = e.clientX;
    press.y = e.clientY;
    press.moved = false;
    press.heard = false;
    press.timer = window.setTimeout(() => {
        press.heard = true;
        target.noteHold();
    }, LONG_PRESS_MS);
}
function move(target, press, cell, e) {
    if (press.id !== e.pointerId)
        return;
    if (Math.hypot(e.clientX - press.x, e.clientY - press.y) < DRAG_SLOP)
        return;
    press.moved = true;
    window.clearTimeout(press.timer);
    if (!press.heard && cell >= 0)
        target.tap(cell, true);
}
function up(target, press, cell, e) {
    if (press.id !== e.pointerId)
        return;
    window.clearTimeout(press.timer);
    if (!press.moved && !press.heard)
        target.tap(cell);
    press.id = -1;
}
function key(target, e) {
    const dir = DIRECTION_KEYS[e.key];
    if (dir)
        return target.stepToward(dir[0], dir[1]);
    if (e.key === 'u')
        target.undo();
    if (e.key === 'r')
        target.restart();
}
