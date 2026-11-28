import { buildShelf } from "./shelf.js";
import { BALL_RADIUS, BOARD, MOTE_REACH } from "./types.js";
/**
 * The rules of one shelf: roll the pebble over every mote, then into the
 * hollow. The physics does the rolling; this only watches and remembers.
 */
export class Run {
    level;
    shelf;
    lit;
    homed = false;
    found = false;
    events = [];
    constructor(level) {
        this.level = level;
        this.shelf = buildShelf(level, BOARD);
        this.lit = level.motes.map(() => false);
    }
    get litCount() {
        return this.lit.filter(Boolean).length;
    }
    get totalMotes() {
        return this.level.motes.length;
    }
    get solved() {
        return this.homed;
    }
    /** One physics step under the given tilt (each axis in -1..1). */
    tilt(input) {
        this.shelf.step(limited(input));
        this.watch();
    }
    /** Hand over the events since the last call; the frame loop calls this. */
    drain() {
        const out = this.events;
        this.events = [];
        return out;
    }
    read() {
        return {
            name: this.level.name,
            hint: this.level.hint,
            ball: this.shelf.pos(),
            speed: this.shelf.speed(),
            lit: this.lit.slice(),
            found: this.found,
            homed: this.homed,
        };
    }
    resting() {
        return this.shelf.speed() < 0.05;
    }
    reset() {
        this.shelf.reset();
        this.lit = this.level.motes.map(() => false);
        this.homed = false;
        this.found = false;
        this.events = [];
    }
    watch() {
        const p = this.shelf.pos();
        this.sweepMotes(p);
        this.sweepSecret(p);
        if (this.homed || !this.allLit() || !inside(this.level.hollow, p))
            return;
        this.homed = true;
        this.events.push({ kind: "home" });
    }
    sweepMotes(p) {
        this.level.motes.forEach((m, i) => {
            if (this.lit[i] === true)
                return;
            if (Math.hypot(m.x - p.x, m.y - p.y) > MOTE_REACH)
                return;
            this.lit[i] = true;
            this.events.push({ kind: "mote", total: this.level.motes.length });
        });
    }
    sweepSecret(p) {
        const s = this.level.secret;
        if (s === undefined || this.found)
            return;
        if (Math.hypot(s.x - p.x, s.y - p.y) > BALL_RADIUS + 16)
            return;
        this.found = true;
        this.events.push({ kind: "secret" });
    }
    allLit() {
        return this.lit.every(Boolean);
    }
}
function inside(hollow, p) {
    return Math.hypot(hollow.x - p.x, hollow.y - p.y) <= hollow.r - BALL_RADIUS * 0.4;
}
function limited(t) {
    const m = Math.hypot(t.x, t.y);
    if (m <= 1 || m === 0)
        return t;
    return { x: t.x / m, y: t.y / m };
}
