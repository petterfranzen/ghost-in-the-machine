import type { Level, Puzzle, State } from "./types.js";

const WALL = "#";

export function parseLevel(level: Level): Puzzle {
  const w = level.rows.reduce((m, r) => Math.max(m, r.length), 0);
  const h = level.rows.length;
  const walls: boolean[] = [];
  const hollows: number[] = [];
  const seeds: number[] = [];
  let player = 0;
  for (let y = 0; y < h; y += 1) {
    const row = level.rows[y].padEnd(w, WALL);
    for (let x = 0; x < w; x += 1) {
      const i = y * w + x;
      const ch = row[x];
      walls.push(ch === WALL);
      if (ch === "o") hollows.push(i);
      if (ch === "s") seeds.push(i);
      if (ch === "@") player = i;
    }
  }
  return { w, h, walls, hollows, player, seeds };
}

export function startState(puzzle: Puzzle): State {
  return { player: puzzle.player, seeds: sorted(puzzle.seeds) };
}

function sorted(seeds: number[]): number[] {
  return [...seeds].sort((a, b) => a - b);
}

function neighbour(puzzle: Puzzle, index: number, dx: number, dy: number): number | null {
  const x = (index % puzzle.w) + dx;
  const y = Math.floor(index / puzzle.w) + dy;
  if (x < 0 || y < 0 || x >= puzzle.w || y >= puzzle.h) return null;
  return y * puzzle.w + x;
}

function free(puzzle: Puzzle, seeds: number[], index: number): boolean {
  return !puzzle.walls[index] && !seeds.includes(index);
}

// Move one tile. A seed is pushed when the destination holds one and the tile
// beyond it is free. Returns the next state, or null when the step is blocked.
export function step(puzzle: Puzzle, state: State, dx: number, dy: number): State | null {
  const ahead = neighbour(puzzle, state.player, dx, dy);
  if (ahead === null || puzzle.walls[ahead]) return null;
  const pushed = state.seeds.indexOf(ahead);
  if (pushed === -1) return { player: ahead, seeds: state.seeds.slice() };
  const beyond = neighbour(puzzle, ahead, dx, dy);
  if (beyond === null || !free(puzzle, state.seeds, beyond)) return null;
  const seeds = state.seeds.slice();
  seeds[pushed] = beyond;
  return { player: ahead, seeds: sorted(seeds) };
}

export function tucked(puzzle: Puzzle, state: State): number {
  return puzzle.hollows.filter((h) => state.seeds.includes(h)).length;
}

export function isSolved(puzzle: Puzzle, state: State): boolean {
  return puzzle.hollows.length > 0 && tucked(puzzle, state) === puzzle.hollows.length;
}

export function isResting(puzzle: Puzzle, state: State): boolean {
  return state.seeds.filter((s) => puzzle.hollows.includes(s)).length > 0;
}

export function key(state: State): string {
  return `${state.player}|${state.seeds.join(",")}`;
}
