import { isSolved, parseLevel, startState, step, tucked, key } from "./board.js";
import type { Level, Puzzle, State } from "./types.js";

export class Session {
  readonly level: Level;
  readonly puzzle: Puzzle;
  state: State;
  solved = false;
  private history: State[] = [];

  constructor(level: Level) {
    this.level = level;
    this.puzzle = parseLevel(level);
    this.state = startState(this.puzzle);
  }

  get moves(): number {
    return this.history.length;
  }

  get hollowCount(): number {
    return this.puzzle.hollows.length;
  }

  tucked(): number {
    return tucked(this.puzzle, this.state);
  }

  move(dx: number, dy: number): boolean {
    if (this.solved) return false;
    const next = step(this.puzzle, this.state, dx, dy);
    if (next === null || key(next) === key(this.state)) return false;
    this.history.push(this.state);
    this.state = next;
    this.solved = isSolved(this.puzzle, this.state);
    return true;
  }

  undo(): boolean {
    const previous = this.history.pop();
    if (previous === undefined) return false;
    this.state = previous;
    this.solved = false;
    return true;
  }

  restart(): void {
    this.state = startState(this.puzzle);
    this.history = [];
    this.solved = false;
  }
}
