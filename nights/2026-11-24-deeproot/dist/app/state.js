// The live game: one level at a time, an undo trail, and a small memory of how
// far you have reached.
import { applyMove, isSolved, isStuck, refusal } from './rules.js';
const STORE_KEY = 'deeproot.progress';
/** localStorage, wrapped so a locked-down browser is never fatal. */
export function readProgress() {
    try {
        const raw = window.localStorage.getItem(STORE_KEY);
        const value = raw === null ? 0 : Number.parseInt(raw, 10);
        return Number.isFinite(value) && value > 0 ? value : 0;
    }
    catch {
        return 0;
    }
}
export function writeProgress(best) {
    try {
        window.localStorage.setItem(STORE_KEY, String(best));
    }
    catch {
        // A browser that refuses storage simply forgets. Nothing to do.
    }
}
export class Game {
    levels;
    levelIndex = 0;
    path = [];
    checkpoints = [1];
    history = [];
    best = 0;
    constructor(levels, resumeAt = 0) {
        this.levels = levels;
        this.best = Math.max(resumeAt, 0);
        this.enter(0);
    }
    get level() {
        return this.levels[this.levelIndex];
    }
    get index() {
        return this.levelIndex;
    }
    get count() {
        return this.levels.length;
    }
    get bestReached() {
        return this.best;
    }
    get route() {
        return this.path;
    }
    get canUndo() {
        return this.checkpoints.length > 1;
    }
    get stuck() {
        return isStuck(this.level, this.path);
    }
    grow(target) {
        const before = this.path;
        const next = applyMove(this.level, before, target);
        if (!next)
            return { outcome: 'refused', why: refusal(this.level, before, target) };
        this.history.push([...before]);
        this.path = next;
        this.checkpoints.push(next.length);
        if (isSolved(this.level, next))
            return { outcome: 'solved', why: null };
        return { outcome: 'grew', why: null };
    }
    undo() {
        if (!this.canUndo)
            return false;
        this.checkpoints.pop();
        this.path = this.history.pop() ?? [this.level.start];
        return true;
    }
    restart() {
        this.enter(this.levelIndex);
    }
    advance() {
        if (this.levelIndex + 1 >= this.levels.length)
            return false;
        this.best = Math.max(this.best, this.levelIndex + 2);
        writeProgress(this.best);
        this.enter(this.levelIndex + 1);
        return true;
    }
    goTo(index) {
        this.enter(Math.min(Math.max(index, 0), this.levels.length - 1));
    }
    enter(index) {
        this.levelIndex = index;
        this.path = [this.levels[index].start];
        this.checkpoints = [1];
        this.history = [];
        this.best = Math.max(this.best, index + 1);
        writeProgress(this.best);
    }
}
