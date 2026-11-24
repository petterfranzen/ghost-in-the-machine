-- Stillspring: the rules of the spring.
-- Ports are a bitmask: N=1, E=2, S=4, W=8. Two stones are joined when each
-- has an open side facing the other.
local N, E, S, W = 1, 2, 4, 8
local ALL = N + E + S + W
local MAXROT, IDLE_WAIT = 4, 12

local CHARS = {
  ['-'] = E + W, ['|'] = N + S,
  ['L'] = N + E, ['J'] = N + W, ['c'] = S + W, ['r'] = S + E,
  ['T'] = N + E + W, ['t'] = N + E + S, ['k'] = N + S + W, ['y'] = E + S + W,
  ['#'] = 0, ['S'] = ALL, ['G'] = ALL,
}
local SPECIAL = { ['S'] = 1, ['G'] = 2, ['#'] = 3 }

local function rotateMask(mask, r)
  local turns = r % MAXROT
  for _ = 1, turns do
    mask = (mask * 2) % 16 + math.floor(mask / W) * N
  end
  return mask
end

local function has(mask, bit)
  return math.floor(mask / bit) % 2 == 1
end

-- Levels are authored solved; 'scram' lists the quarter turns that hide it.
local LEVELS = {
  { name = 'First Light', hint = 'The water waits at the corner stone.',
    grid = { 'S|-', 'Lc-', '-G-' }, scram = { { 1, 1, 3 }, { 2, 0, 1 }, { 2, 1, 1 } } },
  { name = 'The Corner', hint = 'A bent stone carries water round a corner.',
    grid = { 'Sc-', '-|-', '-G-' }, scram = { { 1, 0, 1 }, { 0, 1, 1 }, { 2, 1, 1 } } },
  { name = 'Old Wall', hint = 'Moss-grey rock never carries water.',
    grid = { 'Sc-#', '#|-#', '#L-G' },
    scram = { { 1, 0, 1 }, { 1, 1, 2 }, { 1, 2, 3 }, { 2, 2, 1 } } },
  { name = 'Two Gardens', hint = 'Every garden must drink.',
    grid = { 'Sc--', '||--', '||--', 'GT-G' },
    scram = { { 1, 0, 1 }, { 1, 1, 1 }, { 1, 2, 2 }, { 0, 1, 1 }, { 1, 3, 1 }, { 2, 3, 1 } } },
  { name = 'The Split', hint = 'A three-way stone splits the water.',
    grid = { 'Sy-G', '|||-', '|||-', '-G|-' },
    scram = { { 1, 0, 1 }, { 2, 0, 1 }, { 1, 1, 1 }, { 1, 2, 1 } } },
  { name = 'Stillspring', hint = 'Everything at once. Take your time.',
    grid = { 'S|-##', '||-##', '||-##', 'Ly--G', '#L--G' },
    scram = { { 0, 1, 1 }, { 0, 3, 1 }, { 1, 3, 1 }, { 2, 3, 1 }, { 1, 4, 1 }, { 3, 4, 1 } } },
}

local DIRS = { { 1, 0, E, W }, { -1, 0, W, E }, { 0, 1, S, N }, { 0, -1, N, S } }

local Game = {
  li = 1, w = 0, h = 0, tiles = nil, spring = { 0, 0 }, dist = nil,
  history = {}, solved = false, secret = false, idle = 0, events = {},
}

local sweep -- declared early: loadLevel needs it before its body is read.

local function at(x, y)
  local row = Game.tiles[y + 1]
  return row and row[x + 1] or nil
end

local function ports(tile)
  return rotateMask(tile.base, tile.rot)
end

local function eachTile(fn)
  for y = 0, Game.h - 1 do
    for x = 0, Game.w - 1 do fn(at(x, y), x, y) end
  end
end

local function loadLevel(li)
  local lv = LEVELS[li]
  Game.li, Game.h, Game.w = li, #lv.grid, #lv.grid[1]
  Game.history, Game.solved, Game.idle, Game.events = {}, false, 0, {}
  Game.tiles = {}
  for y = 1, Game.h do
    local row = {}
    for x = 1, Game.w do
      local ch = lv.grid[y]:sub(x, x)
      row[x] = { ch = ch, base = CHARS[ch] or 0, rot = 0, sp = SPECIAL[ch] or 0 }
      if ch == 'S' then Game.spring = { x - 1, y - 1 } end
    end
    Game.tiles[y] = row
  end
  for _, s in ipairs(lv.scram) do
    local tile = at(s[1], s[2])
    if tile and tile.sp == 0 then tile.rot = s[3] % MAXROT end
  end
  sweep()
end

-- Water reaches every stone the spring can flow into; -1 means dry.
local function flood()
  local dist = {}
  for y = 0, Game.h - 1 do
    dist[y] = {}
    for x = 0, Game.w - 1 do dist[y][x] = -1 end
  end
  local queue, head = { { Game.spring[1], Game.spring[2] } }, 1
  dist[Game.spring[2]][Game.spring[1]] = 0
  while head <= #queue do
    local cx, cy = queue[head][1], queue[head][2]
    head = head + 1
    local from = ports(at(cx, cy))
    for _, d in ipairs(DIRS) do
      local nx, ny, tile = cx + d[1], cy + d[2], at(cx + d[1], cy + d[2])
      if tile and dist[ny][nx] < 0 and has(from, d[3]) and has(ports(tile), d[4]) then
        dist[ny][nx] = dist[cy][cx] + 1
        queue[#queue + 1] = { nx, ny }
      end
    end
  end
  Game.dist = dist
end

local function gardenList()
  local out = {}
  eachTile(function(tile, x, y)
    if tile.sp == 2 then out[#out + 1] = { x, y, Game.dist[y][x] >= 0 } end
  end)
  return out
end

local function allGardensWet(gardens)
  for _, g in ipairs(gardens) do
    if not g[3] then return false end
  end
  return true
end

-- Recomputes the water and fires the completion event exactly once.
function sweep()
  flood()
  if not Game.solved and allGardensWet(gardenList()) then
    Game.solved = true
    Game.events[#Game.events + 1] = 'complete'
  end
end

-- The next stone worth turning: the nearest stone on the finished stream that
-- is still turned away from home. Uses the solved layout, so it always answers
-- while the level is unsolved.
local function hintTile()
  local saved = {}
  eachTile(function(tile) saved[#saved + 1] = tile.rot end)
  eachTile(function(tile) tile.rot = 0 end)
  flood()
  local spots = {}
  eachTile(function(tile, x, y) spots[#spots + 1] = { x, y, Game.dist[y][x] } end)
  local i = 0
  eachTile(function(tile)
    i = i + 1
    tile.rot = saved[i]
  end)
  flood()
  local best, bestD = nil, nil
  for _, spot in ipairs(spots) do
    local home = saved[spot[2] * Game.w + spot[1] + 1]
    if spot[3] >= 0 and home % MAXROT ~= 0 and (not bestD or spot[3] < bestD) then
      best, bestD = { spot[1], spot[2] }, spot[3]
    end
  end
  return best
end

-- A 2D number grid as ';'-joined, ','-split rows (row 0 first).
local function gridJson(values)
  local rows = {}
  for y = 0, Game.h - 1 do
    local row = {}
    for x = 0, Game.w - 1 do row[#row + 1] = values[y][x] end
    rows[#rows + 1] = table.concat(row, ',')
  end
  return table.concat(rows, ';')
end

-- The finished stream: how far the water runs from the spring (the trace), and
-- the open ports each stone shows once every stone is turned home, so the host
-- can tell which neighbours the water truly joins.
local function solvedStream()
  local saved = {}
  eachTile(function(tile) saved[#saved + 1] = tile.rot end)
  local i = 0
  eachTile(function(tile)
    i = i + 1
    tile.rot = 0
  end)
  flood()
  local portGrid = {}
  for y = 0, Game.h - 1 do
    portGrid[y] = {}
    for x = 0, Game.w - 1 do portGrid[y][x] = ports(at(x, y)) end
  end
  local dist, prt = gridJson(Game.dist), gridJson(portGrid)
  i = 0
  eachTile(function(tile)
    i = i + 1
    tile.rot = saved[i]
  end)
  flood()
  return dist, prt
end

local function tileJson(tile, x, y)
  return string.format('[%d,%d,%d,%d,%d,%d]', x, y, tile.sp, ports(tile),
                       Game.dist[y][x], tile.rot % MAXROT == 0 and 1 or 0)
end

local function tilesJson()
  local rows = {}
  for y = 0, Game.h - 1 do
    local row = {}
    for x = 0, Game.w - 1 do row[#row + 1] = tileJson(at(x, y), x, y) end
    rows[#rows + 1] = table.concat(row, ',')
  end
  return '[' .. table.concat(rows, ',') .. ']'
end

local function gardensJson()
  local parts = {}
  for _, g in ipairs(gardenList()) do
    parts[#parts + 1] = string.format('[%d,%d,%d]', g[1], g[2], g[3] and 1 or 0)
  end
  return '[' .. table.concat(parts, ',') .. ']'
end

local function pair(key, value)
  return string.format('%q:%s', key, value)
end

local function snapshot()
  local lv = LEVELS[Game.li]
  local path, course = solvedStream()
  return '{' .. table.concat({
    pair('name', string.format('%q', lv.name)),
    pair('hint', string.format('%q', lv.hint)),
    pair('progress', string.format('%q', Game.li .. ' of ' .. #LEVELS)),
    pair('lv', tostring(Game.li)),
    pair('w', tostring(Game.w)),
    pair('h', tostring(Game.h)),
    pair('last', tostring(Game.li == #LEVELS and 1 or 0)),
    pair('moves', tostring(#Game.history)),
    pair('solved', tostring(Game.solved and 1 or 0)),
    pair('secret', tostring(Game.secret and 1 or 0)),
    pair('tiles', tilesJson()),
    pair('gardens', gardensJson()),
    pair('spring', string.format('[%d,%d]', Game.spring[1], Game.spring[2])),
    pair('path', string.format('%q', path)),
    pair('course', string.format('%q', course)),
  }, ',') .. '}'
end

local function turn(x, y)
  local tile = at(x, y)
  if not tile or tile.sp ~= 0 or Game.solved then return end
  tile.rot = (tile.rot + 1) % MAXROT
  Game.history[#Game.history + 1] = { x, y }
  Game.idle = 0
  sweep()
end

local function undo()
  local move = table.remove(Game.history)
  if not move then return end
  local tile = at(move[1], move[2])
  tile.rot = (tile.rot + MAXROT - 1) % MAXROT
  Game.solved, Game.idle = false, 0
  sweep()
end

local function tick(dt)
  Game.idle = Game.idle + (dt or 0)
  if Game.idle >= IDLE_WAIT and not Game.solved then
    Game.idle = 0
    Game.events[#Game.events + 1] = 'idle'
  end
end

local OPS = {
  snap = function() return snapshot() end,
  tap = function(x, y) turn(x, y) end,
  undo = undo,
  restart = function() loadLevel(Game.li) end,
  next = function() loadLevel(math.min(Game.li + 1, #LEVELS)) end,
  jump = function(x) loadLevel(math.max(1, math.min(x, #LEVELS))) end,
  hint = function()
    local h = hintTile()
    return h and string.format('[%d,%d]', h[1], h[2]) or 'null'
  end,
  secret = function() Game.secret = true end,
  tick = tick,
}

-- Only 'tick' drains the queue: a stone that completes the level must not lose
-- its event to the call that turned it.
local function dispatch(op, x, y)
  local handler = OPS[op]
  if not handler then return '' end
  local value = handler(x, y)
  if op == 'tick' then
    local out = table.concat(Game.events, ',')
    Game.events = {}
    return out
  end
  return value or ''
end

loadLevel(1)

-- The single entry point the host calls; always answers with a string.
HOST_dispatch = function(op, a, b)
  local ok, res = pcall(dispatch, op, a, b)
  if not ok then return 'ERR:' .. tostring(res) end
  return res or ''
end
