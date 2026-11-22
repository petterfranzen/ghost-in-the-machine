// The bridge. game.v calls `lake_*` to tell the host what happened; the host
// calls `main__*` to hand the game a move. Everything the painter needs lives
// on the scene object in between.
window.LakeBridge = (function () {
const HUD_KEYS = { 0: 'level', 1: 'levels', 2: 'lit', 3: 'total', 4: 'won', 5: 'free', 6: 'falling', 7: 'warm' };
const SOUND_IDS = { 0: 'slide', 2: 'push', 4: 'mend', 5: 'lantern', 6: 'scuff', 7: 'freeze', 8: 'win' };
const RARE = { 0: 'fish', 1: 'bloom', 2: 'swarm' };

function inside(grid, x, y) {
  return x >= 0 && y >= 0 && x < grid.w && y < grid.h;
}

function waterSpots(scene) {
  const spots = [];
  for (let y = 0; y < scene.grid.h; y++) {
    for (let x = 0; x < scene.grid.w; x++) {
      if (scene.tileAt(x, y) === 4) spots.push([x, y]);
    }
  }
  return spots;
}

function createScene() {
  const scene = {
    t: 0,
    grid: { w: 9, h: 10 },
    tiles: new Array(90).fill(0),
    lit: {},
    cracks: {},
    skids: {},
    skidDir: {},
    keeper: { x: 1, y: 5, face: 2, mode: 0, fallT: 0, warm: 0 },
    hud: { level: 1, levels: 8, lit: 0, total: 1, won: 0, free: 0, falling: 0, warm: 0 },
    hint: '',
    tileAt(x, y) {
      return inside(this.grid, x, y) ? this.tiles[y * this.grid.w + x] : 1;
    },
  };
  return scene;
}

// V hands over its own number, bool and string objects: read the value out at
// the moment it arrives, never keep the object.
function unwrap(value) {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (value.str !== undefined) return value.str;
  return value.val !== undefined ? value.val : value;
}

function num(v) {
  return v && typeof v === 'object' && v.val !== undefined ? v.val : v;
}

function createBridge(scene, painter, sound) {
  scene.grid.w = scene.grid.w || 9;
  const gridOf = (w, h) => {
    scene.grid = { w: num(w), h: num(h) };
    scene.tiles = new Array(w * h).fill(0);
    scene.lit = {};
    scene.cracks = {};
    scene.skids = {};
    scene.skidDir = {};
    painter.resize();
  };
  const tile = (kind, x, y) => {
    kind = num(kind);
    x = num(x);
    y = num(y);
    const i = y * scene.grid.w + x;
    const was = scene.tiles[i];
    scene.tiles[i] = kind;
    if (kind === 4 && was !== 4) painter.spawn('ring', x, y, 0);
    if (kind === 7 && was !== 7) painter.spawn('shimmer', x, y);
  };
  const actor = (x, y, face, mode) => {
    const k = scene.keeper;
    x = num(x);
    y = num(y);
    mode = num(mode);
    k.x = x;
    k.y = y;
    k.face = num(face);
    if (mode !== k.mode) k.fallT = 0;
    k.mode = mode;
  };
  const hooks = {
    lake_ready: () => painter.resize(),
    lake_grid: gridOf,
    lake_tile: tile,
    lake_actor: actor,
    lake_hud: (id, value) => { scene.hud[HUD_KEYS[unwrap(id)]] = unwrap(value); },
    lake_hint: (text) => { scene.hint = unwrap(text); },
    lake_skid: (x, y) => {
      const k = `${num(x)},${num(y)}`;
      scene.skids[k] = scene.t;
      scene.skidDir[k] = scene.pendingDir === undefined ? 1 : scene.pendingDir;
    },
    lake_crack: (x, y, n) => {
      scene.cracks[`${num(x)},${num(y)}`] = num(n);
      painter.spawn('chip', x, y);
    },
    lake_break: (x, y) => {
      delete scene.cracks[`${num(x)},${num(y)}`];
      painter.spawn('ring', x, y, 0);
      painter.spawn('chip', x, y);
      painter.spawn('chip', x, y);
    },
    lake_splash: (x, y) => {
      for (let i = 0; i < 5; i++) painter.spawn('drop', x, y);
      painter.spawn('ring', x, y, 0);
      painter.spawn('puff', x, y);
    },
    lake_light: (x, y, note) => {
      scene.lit[`${num(x)},${num(y)}`] = true;
      painter.spawn('shimmer', x, y);
      sound.play('lantern', note);
      sound.setMood(Object.keys(scene.lit).length);
    },
    lake_stop: (x, y) => {
      painter.spawn('puff', x, y);
      sound.play('stop');
    },
    lake_flick: (x, y) => {
      painter.spawn('spark', x, y);
      painter.spawn('spark', x, y);
    },
    lake_scuff: (x, y) => painter.spawn('puff', x, y),
    lake_rare: (kind) => showRare(RARE[num(kind)] || 'fish', scene, painter, sound),
    lake_sound: (id, arg) => sound.play(SOUND_IDS[num(id)] || 'stop', num(arg)),
  };

  // The game, called the other way. The V bundle exports these as main__<fn>.
  const call = (name, ...args) => {
    const fn = window[name];
    if (typeof fn === 'function') fn(...args);
  };
  const game = {
    boot: () => call('main__boot'),
    slide: (dir) => {
      scene.pendingDir = dir;
      call('main__move', dir);
    },
    tap: (x, y) => call('main__tap', x, y),
    press: (on) => call('main__press', on),
    undo: () => call('main__undo'),
    restart: () => call('main__restart'),
    frame: (dt) => call('main__frame', dt),
  };

  return { hooks, game, tick: (dt) => tick(dt, scene) };
}

// The host's own clock, and the keeper's falling timer, which the game does not
// push frame by frame.
function tick(dt, scene) {
  scene.t += dt;
  const k = scene.keeper;
  k.warm = scene.hud.warm / 100;
  if (k.mode === 3) k.fallT += dt;
}

function showRare(kind, scene, painter, sound) {
  sound.play('rare');
  const spots = waterSpots(scene);
  const brush = { bloom: 'shimmer', swarm: 'spark' }[kind] || 'fish';
  for (let i = 0; i < 6; i++) {
    const at = spots.length ? spots[i % spots.length] : [scene.keeper.x | 0, scene.keeper.y | 0];
    painter.spawn(brush, at[0], at[1]);
  }
  if (kind !== 'bloom') return;
  for (let i = 0; i < 8; i++) painter.spawn('shimmer', i % scene.grid.w, (i * 3) % scene.grid.h);
}

return { createScene, createBridge };
})();
