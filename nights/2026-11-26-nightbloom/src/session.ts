import { applyTap, flowerCount, isOpen, openCount } from "./board.js";
import { buildLevel, LEVELS } from "./levels.js";
import type { Coord, Grid } from "./types.js";

export interface Game {
  levelIndex: number;
  grid: Grid;
  solution: Coord[];
  history: Coord[];
  solved: boolean;
}

export function levelCount(): number {
  return LEVELS.length;
}

export function levelName(index: number): string {
  return LEVELS[index].name;
}

export function levelHint(index: number): string {
  return LEVELS[index].hint;
}

export function loadLevel(index: number): Game {
  const { grid, solution } = buildLevel(index);
  return { levelIndex: index, grid, solution, history: [], solved: false };
}

export function tapFlower(game: Game, r: number, c: number): boolean {
  if (game.solved || !game.grid[r]?.[c]) return false;
  applyTap(game.grid, r, c);
  game.history.push([r, c]);
  game.solved = isOpen(game.grid);
  return true;
}

export function undo(game: Game): boolean {
  const last = game.history.pop();
  if (!last) return false;
  applyTap(game.grid, last[0], last[1]);
  game.solved = false;
  return true;
}

export function canUndo(game: Game): boolean {
  return !game.solved && game.history.length > 0;
}

export function progress(game: Game): { open: number; total: number } {
  return { open: openCount(game.grid), total: flowerCount(game.grid) };
}
