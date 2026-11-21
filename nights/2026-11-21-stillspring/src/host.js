// The Lua side runs in Fengari (Lua 5.3 in JavaScript). The host calls one
// function, HOST_dispatch(op, x, y), and gets a string back.
import * as fengari from 'fengari-web';

const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;

function lastError(L) {
  return lua.lua_tostring(L, -1) === null ? 'lua error' : to_jsstring(lua.lua_tostring(L, -1));
}

function loadChunk(L, src) {
  if (lauxlib.luaL_loadstring(L, to_luastring(src)) !== lua.LUA_OK) throw new Error(lastError(L));
  if (lua.lua_pcall(L, 0, 0, 0) !== lua.LUA_OK) throw new Error(lastError(L));
}

function pushArg(L, value) {
  if (typeof value === 'number') lua.lua_pushnumber(L, value);
  else if (typeof value === 'string') lua.lua_pushstring(L, to_luastring(value));
  else lua.lua_pushnil(L);
}

function callRef(L, ref, op, a, b) {
  lua.lua_rawgeti(L, lua.LUA_REGISTRYINDEX, ref);
  pushArg(L, op);
  pushArg(L, a);
  pushArg(L, b);
  if (lua.lua_pcall(L, 3, 1, 0) !== lua.LUA_OK) throw new Error(lastError(L));
  const raw = lua.lua_tostring(L, -1);
  const out = raw === null ? '' : to_jsstring(raw);
  lua.lua_pop(L, 1);
  return out;
}

// Returns { call, snap } where snap() gives the board state as an object.
export function makeGame(src) {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  loadChunk(L, src);
  lua.lua_getglobal(L, to_luastring('HOST_dispatch'));
  const ref = lauxlib.luaL_ref(L, lua.LUA_REGISTRYINDEX);
  const call = (op, a, b) => callRef(L, ref, op, a, b);
  return {
    call,
    snap() {
      const json = call('snap');
      if (json.startsWith('ERR:')) throw new Error(json);
      return JSON.parse(json);
    },
  };
}
