// A second, independent reading of Lantern Ice's rules.
//
// The smoke test uses this to find a shortest solution for every level, then
// drives the shipped game through that solution and checks it wins. Two
// readings of the same rules agreeing is the check.
const ROCK = 1, SNOW = 2, THIN = 3, WATER = 4, LANTERN = 5, BLOCK = 6;
const ICE = 0;
const WARM = 4;
const WARM_REACH = 2;
const CRACK_LIMIT = 2;
const STEP = [[0, -1], [1, 0], [0, 1], [-1, 0]];

// One row per layout character: the map says what it means.
const MARKS = {
  '#': (b, x, y) => { b.flags.rock[y * b.w + x] = true; },
  s: (b, x, y) => { b.flags.snow[y * b.w + x] = true; },
  x: (b, x, y) => { b.flags.thin[y * b.w + x] = true; },
  o: (b, x, y) => { b.flags.lantern[y * b.w + x] = true; },
  '~': (b, x, y) => { b.holes.push([x, y]); },
  b: (b, x, y) => { b.blocks.push([x, y]); },
  '@': (b, x, y) => { b.start = [x, y]; },
};

function parse(layout) {
  const w = layout[0].length;
  const h = layout.length;
  const flags = {};
  for (const name of ['rock', 'snow', 'thin', 'lantern']) flags[name] = new Array(w * h).fill(false);
  const board = { w, h, flags, start: [0, 0], blocks: [], holes: [] };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const mark = MARKS[layout[y][x]];
      if (mark) mark(board, x, y);
    }
  }
  return board;
}

function key(x, y) { return x + ',' + y; }

function inBoard(b, x, y) { return x >= 0 && y >= 0 && x < b.w && y < b.h; }

function at(flag, w, x, y) { return flag[y * w + x] === true; }

function hasBlock(s, x, y) { return s.blocks.some((p) => p[0] === x && p[1] === y); }

// What the tile at (x, y) is right now: pieces first, then the ground under
// them. Past the edge counts as rock, so a skid stops at the bay's rim.
function kindAt(b, s, x, y) {
  if (!inBoard(b, x, y)) return ROCK;
  if (at(b.flags.lantern, b.w, x, y)) return LANTERN;
  if (hasBlock(s, x, y)) return BLOCK;
  if (s.open[key(x, y)]) return WATER;
  return groundAt(b, x, y);
}

function groundAt(b, x, y) {
  const ground = [['rock', ROCK], ['snow', SNOW], ['thin', THIN]];
  for (const [name, kind] of ground) {
    if (at(b.flags[name], b.w, x, y)) return kind;
  }
  return ICE;
}

function start(board) {
  const open = {};
  for (const [x, y] of board.holes) open[key(x, y)] = true;
  return {
    x: board.start[0],
    y: board.start[1],
    crack: {},
    open,
    lit: {},
    blocks: board.blocks.map((b) => b.slice()),
  };
}

function clone(s) {
  return {
    x: s.x,
    y: s.y,
    crack: { ...s.crack },
    open: { ...s.open },
    lit: { ...s.lit },
    blocks: s.blocks.map((b) => b.slice()),
  };
}

// The keeper's lantern warms the ice around them: holding still frays every
// cracked tile within reach a little way back over.
function warm(s) {
  const next = clone(s);
  for (const spot of Object.keys(next.crack)) next.crack[spot] = frayed(next, spot);
  return next;
}

function frayed(s, spot) {
  const [x, y] = spot.split(',').map(Number);
  if (Math.abs(x - s.x) + Math.abs(y - s.y) > WARM_REACH) return s.crack[spot];
  return Math.max(0, s.crack[spot] - 1);
}

// A shoved block slides until something stops it; into open water it freezes
// that water into ice and stays there as a stepping stone.
function shove(b, s, spot, dir) {
  const bi = s.blocks.findIndex((p) => p[0] === spot.x && p[1] === spot.y);
  let [x, y] = s.blocks[bi];
  for (;;) {
    const nx = x + STEP[dir][0];
    const ny = y + STEP[dir][1];
    const kind = kindAt(b, s, nx, ny);
    if (kind === WATER) {
      delete s.open[key(nx, ny)];
      s.blocks.splice(bi, 1);
      return;
    }
    if (kind !== ICE && kind !== THIN) break;
    x = nx;
    y = ny;
  }
  s.blocks[bi] = [x, y];
}

// Skid until something stops the keeper. Returns null when they come to rest,
// or the tile they fell through when the ice gives way.
function stops(kind, pushed) {
  if (kind === ROCK || kind === SNOW) return true;
  return kind === BLOCK && pushed;
}

function walk(b, s, dir) {
  let pushed = false;
  for (;;) {
    const [dx, dy] = STEP[dir];
    const nx = s.x + dx;
    const ny = s.y + dy;
    const kind = kindAt(b, s, nx, ny);
    if (stops(kind, pushed)) return null;
    if (kind === BLOCK) {
      pushed = true;
      shove(b, s, { x: nx, y: ny }, dir);
      continue;
    }
    s.x = nx;
    s.y = ny;
    const fated = land(b, s, kind);
    if (fated) return fated === 'fall' ? [nx, ny] : null;
  }
}

// What a tile does to the keeper: fall, rest, or let the skid run on.
function land(b, s, kind) {
  if (kind === WATER) return 'fall';
  if (kind === LANTERN) {
    s.lit[key(s.x, s.y)] = true;
    return 'rest';
  }
  if (kind !== THIN || !cracks(s)) return null;
  return 'fall'; // the ice gave way under you
}

function cracks(s) {
  const spot = key(s.x, s.y);
  const count = (s.crack[spot] || 0) + 1;
  s.crack[spot] = count;
  if (count < CRACK_LIMIT) return false;
  s.open[spot] = true;
  return true;
}

function move(b, s, dir) {
  if (dir === WARM) return { state: warm(s), fell: false };
  const next = clone(s);
  const landed = walk(b, next, dir);
  return { state: next, fell: !!landed };
}

function lampLit(b, s, spot) {
  const [x, y] = spot.split(',').map(Number);
  return !!s.lit[spot] && at(b.flags.lantern, b.w, x, y);
}

function litCount(b, s) {
  return Object.keys(s.lit).filter((spot) => lampLit(b, s, spot)).length;
}

function lanterns(b) {
  return b.flags.lantern.filter(Boolean).length;
}

function stateKey(s) {
  const blocks = s.blocks.map((p) => p.join(':')).sort().join(';');
  const cracked = Object.keys(s.crack).sort().map((k) => k + '=' + s.crack[k]).join(',');
  const open = Object.keys(s.open).filter((k) => s.open[k]).sort().join(',');
  const lit = Object.keys(s.lit).sort().join(',');
  return s.x + ',' + s.y + '|' + blocks + '|' + cracked + '|' + open + '|' + lit;
}

// Breadth-first shortest solution, so each level's par comes out of the rules.
function solve(layout, maxDepth = 12) {
  const b = parse(layout);
  const goal = lanterns(b);
  if (!goal) return [];
  return search(b, goal, maxDepth);
}

function search(b, goal, maxDepth) {
  const first = start(b);
  const seen = new Set([stateKey(first)]);
  let frontier = [{ s: first, moves: [] }];
  for (let depth = 0; depth < maxDepth; depth++) {
    const step = expand(b, goal, frontier, seen);
    if (step.found) return step.found;
    if (!step.next.length) return null;
    frontier = step.next;
  }
  return null;
}

function expand(b, goal, frontier, seen) {
  const next = [];
  for (const node of frontier) {
    for (let dir = 0; dir < 5; dir++) {
      const after = move(b, node.s, dir);
      if (after.fell) continue;
      const moves = node.moves.concat([dir]);
      if (litCount(b, after.state) >= goal) return { found: moves, next };
      const spot = stateKey(after.state);
      if (seen.has(spot)) continue;
      seen.add(spot);
      next.push({ s: after.state, moves });
    }
  }
  return { found: null, next };
}

module.exports = { parse, start, move, warm, solve, litCount, lanterns, stateKey, STEP, WARM };
