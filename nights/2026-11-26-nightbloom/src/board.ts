import { KINDS } from "./kinds.js";
import type { Cell, Coord, Grid } from "./types.js";

function cellsOf(grid: Grid): Cell[] {
  const out: Cell[] = [];
  for (const row of grid) for (const cell of row) if (cell) out.push(cell);
  return out;
}

export function flowerCount(grid: Grid): number {
  return cellsOf(grid).length;
}

export function openCount(grid: Grid): number {
  return cellsOf(grid).filter((cell) => cell.open).length;
}

export function isOpen(grid: Grid): boolean {
  return cellsOf(grid).every((cell) => cell.open);
}

export function forEachFlower(grid: Grid, fn: (r: number, c: number, cell: Cell) => void): void {
  for (let r = 0; r < grid.length; r += 1) {
    const row = grid[r];
    for (let c = 0; c < row.length; c += 1) {
      const cell = row[c];
      if (cell) fn(r, c, cell);
    }
  }
}

export function targetsOf(grid: Grid, r: number, c: number): Coord[] {
  const cell = grid[r]?.[c];
  return cell ? KINDS[cell.kind].pattern(r, c, grid.length) : [];
}

export function applyTap(grid: Grid, r: number, c: number): void {
  for (const [tr, tc] of targetsOf(grid, r, c)) {
    const cell = grid[tr]?.[tc];
    if (cell) cell.open = !cell.open;
  }
}
