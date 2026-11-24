// Pins the two drawing fixes: a band stays inside its tile (so north and west
// channels draw), and the "trace the water" course joins only stones whose
// channels truly meet. It drives the real game.lua, so level 1's solved path is
// the real one rather than a hand-written fixture.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fengari from 'fengari-web';
import { bandRect } from '../src/render.js';
import { courseCells, courseLinks } from '../src/course.js';

const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;
const here = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(here, '..', 'src', 'game.lua'), 'utf8');

function makeGame(code) {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  lauxlib.luaL_loadstring(L, to_luastring(code));
  lua.lua_pcall(L, 0, 0, 0);
  lua.lua_getglobal(L, to_luastring('HOST_dispatch'));
  const ref = lauxlib.luaL_ref(L, lua.LUA_REGISTRYINDEX);
  const call = (op, a) => {
    lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, ref);
    lua.lua_pushstring(L, to_luastring(op));
    if (a === undefined) lua.lua_pushnil(L); else lua.lua_pushinteger(L, a);
    lua.lua_pushnil(L);
    lua.lua_pcall(L, 3, 1, 0);
    const out = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);
    return out;
  };
  return { snap: () => JSON.parse(call('snap')), jump: (li) => call('jump', li) };
}

let failures = 0;
const check = (name, ok, extra = '') => {
  if (ok) console.log(`ok   ${name}`);
  else { failures += 1; console.log(`FAIL ${name}${extra ? ' - ' + extra : ''}`); }
};

const D = { N: { dx: 0, dy: -1 }, E: { dx: 1, dy: 0 }, S: { dx: 0, dy: 1 }, W: { dx: -1, dy: 0 } };
const stone = { px: 200, py: 300, s: 100 };
const box = {};
for (const [name, side] of Object.entries(D)) box[name] = bandRect(stone, side, 0.28);

check('east band starts at the centre', box.E.x === 250, `${box.E.x}`);
check('west band starts at the tile edge, not half a stone out', box.W.x === 200, `${box.W.x}`);
check('north band starts at the tile edge, not half a stone out', box.N.y === 300, `${box.N.y}`);
check('south band starts at the centre', box.S.y === 350, `${box.S.y}`);
const inside = (b) => b.x >= 200 && b.y >= 300 && b.x + b.w <= 302 && b.y + b.h <= 402;
check('every band lies inside the tile', Object.values(box).every(inside));

const game = makeGame(src);

// Every stone on every level must draw its whole shape: each open side's band
// stays inside the tile, so the tile clip never cuts a groove in half.
const SIDES = [
  { name: 'N', bit: 1 }, { name: 'E', bit: 2 }, { name: 'S', bit: 4 }, { name: 'W', bit: 8 },
];
const dirOf = { N: D.N, E: D.E, S: D.S, W: D.W };
const levelBox = { px: 0, py: 0, s: 100 };
const insideTile = (b) => b.x >= 0 && b.y >= 0 && b.x + b.w <= 102 && b.y + b.h <= 102;
const maskGrid = (str) => str.split(';').map((row) => row.split(',').map(Number));
for (let li = 1; li <= 6; li += 1) {
  game.jump(li);
  const grid = maskGrid(game.snap().course);
  const pieces = grid.flat().filter((m) => m > 0).length;
  const cut = SIDES.filter((side) => grid.some((row) => row.some((m) =>
    m & side.bit && !insideTile(bandRect(levelBox, dirOf[side.name], 0.28)))));
  check(`level ${li}: every open band stays inside its tile`, pieces > 0 && cut.length === 0,
    cut.map((c) => c.name).join(','));
}

game.jump(1);
const snap = game.snap();
const cells = courseCells(snap.path, snap.course, snap.gardens);
const at = (x, y) => cells.some((c) => c.x === x && c.y === y);

check('level 1 course is spring, two stones, garden',
  at(0, 0) && at(0, 1) && at(1, 1) && at(1, 2) && cells.length === 4, `${cells.length}`);
check('level 1 course leaves the decoy stones out', !at(0, 2) && !at(2, 2));

const joined = courseLinks(cells).map((l) => [`${l.x},${l.y}`, `${l.x + l.dx},${l.y + l.dy}`].sort().join('|'));
const unique = [...new Set(joined)];
check('level 1 course joins three neighbours', unique.length === 3, unique.join(' '));
check('the decoy bottom row is not joined',
  !unique.includes('0,1|0,2') && !unique.includes('1,2|2,2'), unique.join(' '));

if (failures) { console.log(`\n${failures} check(s) failed`); process.exit(1); }
console.log('\nall checks passed');
