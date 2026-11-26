// Nightbloom smoke check: every meadow is solvable and starts unsolved.
// Levels are generated deterministically, so this validates the shipped code.
import { applyTap, flowerCount, isOpen, openCount } from "../dist/app/board.js";
import { LEVELS, buildLevel } from "../dist/app/levels.js";

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL  ${message}`);
}

LEVELS.forEach((level, index) => {
  const square = level.map.every((row) => row.length === level.map.length);
  if (!square) fail(`meadow ${index + 1} (${level.name}) is not square`);
  const { grid, solution } = buildLevel(index);
  const total = flowerCount(grid);
  const startedOpen = openCount(grid);
  if (total === 0) fail(`meadow ${index + 1} (${level.name}) has no flowers`);
  if (isOpen(grid)) fail(`meadow ${index + 1} (${level.name}) starts already solved`);
  if (startedOpen === 0) fail(`meadow ${index + 1} (${level.name}) starts with no open flowers`);
  for (const [r, c] of solution) applyTap(grid, r, c);
  if (!isOpen(grid)) fail(`meadow ${index + 1} (${level.name}) is not solved by its recorded solution`);
  const share = Math.round((startedOpen / total) * 100);
  console.log(
    `ok    meadow ${index + 1} ${level.name.padEnd(12)} ${total} flowers, ${startedOpen} open (${share}%), ${solution.length} taps`,
  );
});

if (failures > 0) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log("all meadows solvable");
