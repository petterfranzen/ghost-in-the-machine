const REACH = 96;
const EASE_MS = 150;
const TAP_MS = 320;
const TAP_SLOP = 10;
const PAD_KEYS = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
};
const PAD_DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};
function clampTilt(t) {
    const m = Math.hypot(t.x, t.y);
    if (m <= 1 || m === 0)
        return t;
    return { x: t.x / m, y: t.y / m };
}
function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
/** Merge the drag, the held pad buttons and the keys into one tilt. */
export class Controls {
    board;
    hooks;
    press = null;
    lever = { x: 0, y: 0 };
    eased = { x: 0, y: 0 };
    held = new Set();
    pulses = [];
    constructor(board, hooks) {
        this.board = board;
        this.hooks = hooks;
    }
    /** The tilt the shelf should answer to right now. */
    tilt() {
        return this.eased;
    }
    /** Lean for `ms` without a hand on the shelf; used by the pad and by checks. */
    pushTilt(dir, ms) {
        this.pulses.push({ dir: clampTilt(dir), untilPulse: performance.now() + ms });
    }
    /** Aim at a held-direction set; drag beats buttons, pulses fill the gaps. */
    wanted(now) {
        if (this.press !== null)
            return this.lever;
        let sum = { x: 0, y: 0 };
        for (const name of this.held)
            sum = add(sum, PAD_DIRS[name]);
        this.pulses = this.pulses.filter((p) => p.untilPulse > now);
        for (const p of this.pulses)
            sum = add(sum, p.dir);
        return clampTilt(sum);
    }
    update(now, dt) {
        const want = this.wanted(now);
        const k = Math.min(1, dt / EASE_MS);
        this.eased = {
            x: this.eased.x + (want.x - this.eased.x) * k,
            y: this.eased.y + (want.y - this.eased.y) * k,
        };
    }
    beginDrag(e) {
        e.preventDefault();
        this.board.setPointerCapture(e.pointerId);
        this.press = { x: e.clientX, y: e.clientY, time: performance.now(), moved: 0 };
        this.lever = { x: 0, y: 0 };
    }
    moveDrag(e) {
        if (this.press === null)
            return;
        e.preventDefault();
        const dx = e.clientX - this.press.x;
        const dy = e.clientY - this.press.y;
        this.press.moved = Math.max(this.press.moved, Math.hypot(dx, dy));
        this.lever = clampTilt({ x: dx / REACH, y: dy / REACH });
    }
    endDrag(e) {
        const press = this.press;
        this.press = null;
        this.lever = { x: 0, y: 0 };
        if (press === null)
            return;
        const still = press.moved < TAP_SLOP;
        const quick = performance.now() - press.time < TAP_MS;
        if (still && quick)
            this.hooks.onTap(this.hooks.toWorld(e.clientX, e.clientY));
    }
    hold(name) {
        this.held.add(name);
    }
    release(name) {
        this.held.delete(name);
        this.pulses = this.pulses.filter((p) => p.dir !== PAD_DIRS[name]);
    }
    pressButton(name, now) {
        this.pulses.push({ dir: PAD_DIRS[name], untilPulse: now + 220 });
    }
    attach() {
        this.board.addEventListener("pointerdown", (e) => this.beginDrag(e));
        this.board.addEventListener("pointermove", (e) => this.moveDrag(e));
        this.board.addEventListener("pointerup", (e) => this.endDrag(e));
        this.board.addEventListener("pointercancel", () => {
            this.press = null;
            this.lever = { x: 0, y: 0 };
        });
        for (const name of ["contextmenu", "selectstart", "dragstart"]) {
            this.board.addEventListener(name, (e) => e.preventDefault());
        }
        window.addEventListener("keydown", (e) => {
            const name = PAD_KEYS[e.key] ?? PAD_KEYS[e.key.toLowerCase()];
            if (name === undefined)
                return;
            e.preventDefault();
            this.hold(name);
        });
        window.addEventListener("keyup", (e) => {
            const name = PAD_KEYS[e.key] ?? PAD_KEYS[e.key.toLowerCase()];
            if (name !== undefined)
                this.release(name);
        });
        window.addEventListener("blur", () => this.held.clear());
    }
    /** Wire one hold-button: hold to tilt, and a press gives a short pulse. */
    bindButton(button, name) {
        button.addEventListener("pointerdown", () => this.hold(name));
        for (const end of ["pointerup", "pointerleave", "pointercancel"]) {
            button.addEventListener(end, () => this.release(name));
        }
        button.addEventListener("click", () => this.pressButton(name, performance.now()));
    }
}
