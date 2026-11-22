// Smoke test for the Lua rules engine: it runs the real game.lua under
// Fengari in Node and drives the same HOST_dispatch calls the browser makes.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fengari from 'fengari-web';

const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;
const here = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(here, '..', 'src', 'game.lua'), 'utf8');

function makeGame(code) {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  if (lauxlib.luaL_loadstring(L, to_luastring(code)) !== lua.LUA_OK) {
    throw new Error(to_jsstring(lua.lua_tostring(L, -1)));
  }
  if (lua.lua_pcall(L, 0, 0, 0) !== lua.LUA_OK) {
    throw new Error(to_jsstring(lua.lua_tostring(L, -1)));
  }
  lua.lua_getglobal(L, to_luastring('HOST_dispatch'));
  const ref = lauxlib.luaL_ref(L, lua.LUA_REGISTRYINDEX);
  const call = (op, a, b) => {
    lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, ref);
    for (const v of [op, a, b]) {
      if (typeof v === 'number') lua.lua_pushnumber(L, v);
      else if (typeof v === 'string') lua.lua_pushstring(L, to_luastring(v));
      else lua.lua_pushnil(L);
    }
    if (lua.lua_pcall(L, 3, 1, 0) !== lua.LUA_OK) {
      throw new Error(to_jsstring(lua.lua_tostring(L, -1)));
    }
    const raw = lua.lua_tostring(L, -1);
    const out = raw === null ? '' : to_jsstring(raw);
    lua.lua_pop(L, 1);
    return out;
  };
  return { call, snap: () => JSON.parse(call('snap')) };
}

let failures = 0;
function check(name, ok, extra = '') {
  if (ok) {
    console.log(`ok   ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL ${name}${extra ? ' - ' + extra : ''}`);
  }
}

const game = makeGame(src);
const snap = game.snap();

check('board has dimensions', snap.w > 0 && snap.h > 0, `${snap.w}x${snap.h}`);
check('tiles fill the board', snap.tiles.length === snap.w * snap.h, `${snap.tiles.length}`);
check('starts unsolved', snap.solved === 0);
check('starts at level 1', snap.lv === 1);
check('spring is a tile', snap.tiles.some((t) => t[0] === snap.spring[0] && t[1] === snap.spring[1]));

let solved = false;
for (let i = 0; i < 80 && !solved; i += 1) {
  const hint = game.call('hint');
  if (hint === 'null') break;
  const [x, y] = JSON.parse(hint);
  game.call('tap', x, y);
  solved = game.snap().solved === 1;
}
check('level 1 is solvable by following hints', solved);

const after = game.snap();
check('moves were recorded', after.moves > 0, `${after.moves}`);

const locked = after.tiles.find((t) => t[2] !== 0);
if (locked) {
  const before = JSON.stringify(game.snap().tiles[locked[1] * after.w + locked[0]]);
  game.call('tap', locked[0], locked[1]);
  const now = JSON.stringify(game.snap().tiles[locked[1] * after.w + locked[0]]);
  check('locked stone ignores taps', before === now);
}

const movesBefore = game.snap().moves;
game.call('undo');
check('undo removes a move', game.snap().moves === movesBefore - 1);

game.call('restart');
const restarted = game.snap();
check('restart clears moves', restarted.moves === 0);
check('restart clears solved', restarted.solved === 0);

// Every level must be solvable from its scrambled start.
const levelCount = Number(game.snap().progress.split(' of ')[1]);
for (let li = 1; li <= levelCount; li += 1) {
  game.call('jump', li);
  let done = false;
  for (let i = 0; i < 120 && !done; i += 1) {
    const hint = game.call('hint');
    if (hint === 'null') break;
    const [x, y] = JSON.parse(hint);
    game.call('tap', x, y);
    done = game.snap().solved === 1;
  }
  check(`level ${li} is solvable`, done);
}
game.call('jump', 1);

const idleEvent = game.call('tick', 13);
check('idle tick reports an event', idleEvent.includes('idle'), idleEvent);

game.call('secret');
check('secret flag is stored', game.snap().secret === 1);

game.call('next');
const nextSnap = game.snap();
check('next advances the level', nextSnap.lv === 2, `${nextSnap.lv}`);
for (let i = 0; i < 20; i += 1) game.call('next');
check('next clamps at the last level', game.snap().last === 1);

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nall checks passed');
