// The "trace the water" overlay: which stones the finished stream wets, and
// which neighbours it joins. Pure geometry over a snapshot, no drawing here.
const N = 1, E = 2, S = 4, W = 8;
const SIDES = [ { bit: N, dx: 0, dy: -1 }, { bit: E, dx: 1, dy: 0 },
                { bit: S, dx: 0, dy: 1 }, { bit: W, dx: -1, dy: 0 } ];
const OPPOSITE = { 1: 4, 2: 8, 4: 1, 8: 2 };
const key = (x, y) => `${x},${y}`;

function distGrid(path) {
  return path.split(';').map((row) => row.split(',').map(Number));
}

// A flooded stone counts only while the water can still reach a garden from it
// (a garden itself always counts). That stops the trace at the garden's rim
// instead of spilling out through its open far sides into the decoy stones.
function wayCells(grid, gardens) {
  const bloom = new Set(gardens.map((g) => key(g[0], g[1])));
  const live = new Set();
  const cells = [];
  grid.forEach((row, y) => row.forEach((d, x) => { if (d >= 0) cells.push([x, y, d]); }));
  cells.sort((a, b) => b[2] - a[2]);
  for (const [x, y, d] of cells) {
    if (bloom.has(key(x, y))) { live.add(key(x, y)); continue; }
    const step = SIDES.some((s) => live.has(key(x + s.dx, y + s.dy)) &&
      (grid[y + s.dy]?.[x + s.dx] ?? -1) === d + 1);
    if (step) live.add(key(x, y));
  }
  return live;
}

// The course stones in board order, each carrying the ports it shows solved.
export function courseCells(path, course, gardens) {
  const dist = distGrid(path), open = distGrid(course);
  const live = wayCells(dist, gardens);
  const out = [];
  for (let y = 0; y < dist.length; y += 1) {
    for (let x = 0; x < dist[y].length; x += 1) {
      if (live.has(key(x, y))) out.push({ x, y, mask: open[y][x] });
    }
  }
  return out;
}

const opens = (mask, bit) => (mask & bit) !== 0;

// Only join two course stones when each has the port that faces the other open.
export function courseLinks(cells) {
  const byKey = new Map(cells.map((c) => [key(c.x, c.y), c]));
  const out = [];
  for (const cell of cells) {
    for (const side of SIDES) {
      const nb = byKey.get(key(cell.x + side.dx, cell.y + side.dy));
      if (!nb) continue;
      if (!opens(cell.mask, side.bit)) continue;
      if (!opens(nb.mask, OPPOSITE[side.bit])) continue;
      out.push({ x: cell.x, y: cell.y, dx: side.dx, dy: side.dy });
    }
  }
  return out;
}
