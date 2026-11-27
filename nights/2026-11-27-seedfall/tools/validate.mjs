// Seedfall smoke check: every glade starts unsolved and has a way through.
// The board turns one tile at a time, so a breadth-first search over
// (player, seeds) states proves each level is solvable and records a route.
import { LEVELS } from "../dist/app/levels.js";
import { parseLevel, startState, step, isSolved, tucked, key } from "../dist/app/board.js";

const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const CAP = 400000;
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL  ${message}`);
}

function shape(rows) {
  const w = rows[0].length;
  if (!rows.every((r) => r.length === w)) return false;
  return rows.every((r) => /^[#.@so]+$/.test(r));
}

function solve(puzzle) {
  const start = startState(puzzle);
  if (isSolved(puzzle, start)) return { solvedAtStart: true, moves: 0 };
  const seen = new Map([[key(start), null]]);
  const queue = [start];
  let head = 0;
  while (head < queue.length) {
    if (seen.size > CAP) return { over: true };
    const state = queue[head];
    head += 1;
    for (const [dx, dy] of DIRS) {
      const next = step(puzzle, state, dx, dy);
      if (next === null || seen.has(key(next))) continue;
      seen.set(key(next), state);
      if (isSolved(puzzle, next)) return { moves: cost(seen, start, next) };
      queue.push(next);
    }
  }
  return { moves: 0, unsolvable: true };
}

function cost(seen, start, end) {
  let n = 0;
  let cur = end;
  while (key(cur) !== key(start)) {
    cur = seen.get(key(cur));
    n += 1;
    if (n > 4000) break;
  }
  return n;
}

LEVELS.forEach((level, index) => {
  const label = `glade ${index + 1} ${level.name}`;
  if (!shape(level.rows)) fail(`${label}: rows are ragged or carry an unknown character`);
  const puzzle = parseLevel(level);
  const start = startState(puzzle);
  if (puzzle.hollows.length === 0) fail(`${label}: no hollows`);
  if (puzzle.seeds.length !== puzzle.hollows.length) {
    fail(`${label}: ${puzzle.seeds.length} seeds but ${puzzle.hollows.length} hollows`);
  }
  const result = solve(puzzle);
  if (result.solvedAtStart) fail(`${label}: starts already solved`);
  if (result.over) fail(`${label}: state space over ${CAP}; the glade is too open`);
  if (result.unsolvable) fail(`${label}: no route reaches the hollows`);
  if (result.moves > 0) {
    console.log(`ok    ${label.padEnd(30)} ${puzzle.w}x${puzzle.h} seeds ${puzzle.seeds.length} tucked ${tucked(puzzle, start)} route ${result.moves} steps`);
  }
});

if (failures > 0) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log(`all ${LEVELS.length} glades solvable`);
