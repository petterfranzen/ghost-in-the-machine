#!/usr/bin/env node
// Proves every level is solvable, none starts solved, and each one wants at
// least a few moves. Run through build.sh, which runs it after tsc.

import { RAW_LEVELS } from '../dist/app/levels.js';
import { parseAll } from '../dist/app/grid.js';
import { solve } from '../dist/app/solver.js';
import { isSolved, allBudsAwake } from '../dist/app/rules.js';

const levels = parseAll(RAW_LEVELS);
let bad = 0;

for (const [i, level] of levels.entries()) {
  const result = solve(level);
  const start = [level.start];
  const alreadySolved = isSolved(level, start);
  const awakeAtStart = allBudsAwake(level, start) && level.buds.length > 0;
  const minMoves = Math.max(3, level.buds.length + 1);
  const problems = [];
  if (!result.solvable) problems.push('no solution');
  if (alreadySolved) problems.push('already solved at the start');
  if (awakeAtStart) problems.push('starts with every bud awake');
  if (result.solvable && result.shortest < minMoves) {
    problems.push(`shortest win is ${result.shortest} moves, under ${minMoves}`);
  }
  const flag = problems.length ? 'FAIL' : 'ok  ';
  if (problems.length) bad += 1;
  console.log(
    `${flag} ${i + 1}. ${level.name.padEnd(12)} ` +
    `${level.width}x${level.height} buds=${level.buds.length} ` +
    `solutions=${result.solutions} shortest=${result.shortest} nodes=${result.nodes}` +
    (problems.length ? `  <- ${problems.join('; ')}` : ''),
  );
}

console.log(bad ? `deeproot: ${bad} level(s) failed validation` : `deeproot: ${levels.length} levels ok`);
process.exit(bad ? 1 : 0);
