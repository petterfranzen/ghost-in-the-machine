import { isSolved, parseLevel, startState, step, tucked, key } from "./board.js";
export class Session {
    level;
    puzzle;
    state;
    solved = false;
    history = [];
    constructor(level) {
        this.level = level;
        this.puzzle = parseLevel(level);
        this.state = startState(this.puzzle);
    }
    get moves() {
        return this.history.length;
    }
    get hollowCount() {
        return this.puzzle.hollows.length;
    }
    tucked() {
        return tucked(this.puzzle, this.state);
    }
    move(dx, dy) {
        if (this.solved)
            return false;
        const next = step(this.puzzle, this.state, dx, dy);
        if (next === null || key(next) === key(this.state))
            return false;
        this.history.push(this.state);
        this.state = next;
        this.solved = isSolved(this.puzzle, this.state);
        return true;
    }
    undo() {
        const previous = this.history.pop();
        if (previous === undefined)
            return false;
        this.state = previous;
        this.solved = false;
        return true;
    }
    restart() {
        this.state = startState(this.puzzle);
        this.history = [];
        this.solved = false;
    }
}
