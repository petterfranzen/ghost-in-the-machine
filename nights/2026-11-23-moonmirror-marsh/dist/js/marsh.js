// The page side of Moonmirror Marsh: it listens to thumbs, draws, and asks C# for the rules.
const Marsh = {
  scene: null,
  fx: [],
  motes: [],
  drag: null,
  lit: new Set(),
  moonDrift: 0,
  moonFull: false,
  celebrating: 0,
  idleAt: 0,
  lastInput: 0,
  fade: 0,
  notice: '',
  noticeUntil: 0,
};

Marsh.boot = function boot(dotNet) {
  this.dotNet = dotNet;
  this.canvas = document.getElementById('scene');
  MarshDraw.init(this.canvas);
  Sound.enabled = false;
  this.bind();
  this.loadSound();
  this.paintSoundButton();
  requestAnimationFrame((now) => this.tick(now));
};

Marsh.bind = function bind() {
  window.addEventListener('resize', () => MarshDraw.resize());
  this.canvas.addEventListener('pointerdown', (event) => this.down(event));
  this.canvas.addEventListener('pointermove', (event) => this.move(event));
  this.canvas.addEventListener('pointerup', (event) => this.up(event));
  this.canvas.addEventListener('pointercancel', () => { this.drag = null; });
  this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  document.getElementById('btn-undo').addEventListener('click', () => this.ask('Undo'));
  document.getElementById('btn-restart').addEventListener('click', () => this.ask('Restart'));
  document.getElementById('btn-again').addEventListener('click', () => this.ask('Rewind'));
  document.getElementById('btn-sound').addEventListener('click', () => this.toggleSound());
  document.addEventListener('visibilitychange', () => Sound.resume());
};

Marsh.ask = function ask(method, a, b) {
  this.lastInput = performance.now();
  if (method === 'Turn') return this.dotNet.invokeMethodAsync(method, a, b);
  return this.dotNet.invokeMethodAsync(method);
};

Marsh.pointer = function pointer(event) {
  const box = this.canvas.getBoundingClientRect();
  const lx = (event.clientX - box.left) / MarshDraw.scale;
  const ly = (event.clientY - box.top) / MarshDraw.scale;
  const x = Math.floor(lx / MarshDraw.CELL);
  const y = Math.floor((ly - MarshDraw.TOP) / MarshDraw.CELL);
  const sky = ly < MarshDraw.TOP;
  const inside = !sky && x >= 0 && y >= 0 && x < this.scene.width && y < this.scene.height;
  return { lx, ly, x, y, sky, inside };
};

Marsh.down = function down(event) {
  if (!this.scene || this.celebrating) return;
  if (this.wantSound && !Sound.enabled) this.toggleSound();
  const at = this.pointer(event);
  this.drag = { at, startX: event.clientX, startY: event.clientY, start: performance.now(),
    moved: false, turned: '', skyDrift: 0 };
  this.wake();
  this.timer = window.setTimeout(() => this.longPress(), 620);
};

Marsh.move = function move(event) {
  const drag = this.drag;
  if (!drag || this.celebrating) return;
  if (!this.dragged(event, drag)) return;
  drag.moved = true;
  window.clearTimeout(this.timer);
  if (drag.at.sky) return this.driftMoon(event, drag);
  const at = this.pointer(event);
  if (this.cellChanged(at, drag)) this.dragTurn(at, drag);
};

Marsh.dragged = function dragged(event, drag) {
  return Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY) > 7;
};

Marsh.cellChanged = function cellChanged(at, drag) {
  return at.inside && (at.x !== drag.at.x || at.y !== drag.at.y);
};

Marsh.dragTurn = function dragTurn(at, drag) {
  const key = `${at.x},${at.y}`;
  if (key === drag.turned) return;
  drag.turned = key;
  drag.at = at;
  this.turn(at, key);
};

Marsh.up = function up(event) {
  window.clearTimeout(this.timer);
  const drag = this.drag;
  this.drag = null;
  if (!drag || this.celebrating) return;
  if (drag.moved || performance.now() - drag.start > 520) return;
  if (drag.at.sky) return this.skySwipe(drag);
  return this.tap(this.pointer(event));
};

Marsh.tap = function tap(at) {
  if (!at.inside) return this.wake();
  const tile = this.tileAt(at);
  if (this.turnable(tile)) return this.turn(at, `${at.x},${at.y}`);
  if (this.litLantern(tile, at)) return this.bell(at);
  return this.ripple(at);
};

Marsh.turnable = function turnable(tile) {
  return !!tile && (tile.kind === 'mirror' || tile.kind === 'prism');
};

Marsh.litLantern = function litLantern(tile, at) {
  return !!tile && tile.kind === 'lantern' && this.lit.has(`${at.x},${at.y}`);
};

Marsh.bell = function bell(at) {
  Sound.play('bell');
  this.burst(at.x, at.y, 'burst', 900);
};

Marsh.longPress = function longPress() {
  const drag = this.drag;
  if (!this.holdable(drag)) return;
  Sound.play('mist');
  this.fx.push({ kind: 'ripple', x: MarshDraw.cellX(drag.at.x) + 8, y: MarshDraw.cellY(drag.at.y) + 8,
    start: performance.now(), life: 1500, cell: '' });
};

Marsh.holdable = function holdable(drag) {
  return !!drag && !drag.moved && drag.at.inside;
};

Marsh.turn = function turn(at, key) {
  this.fx.push({ kind: 'turn', x: MarshDraw.cellX(at.x) + 8, y: MarshDraw.cellY(at.y) + 8,
    start: performance.now(), life: 420, cell: key });
  this.ask('Turn', at.x, at.y);
};

Marsh.ripple = function ripple(at) {
  this.fx.push({ kind: 'ripple', x: MarshDraw.cellX(at.x) + 8, y: MarshDraw.cellY(at.y) + 8,
    start: performance.now(), life: 900, cell: '' });
  Sound.play('ripple');
};

Marsh.driftMoon = function driftMoon(event, drag) {
  const travelled = event.clientX - drag.startX;
  this.moonDrift = Math.max(-72, Math.min(12, this.moonDrift + (travelled - drag.skyDrift) / MarshDraw.scale / 2));
  drag.skyDrift = travelled;
};

Marsh.skySwipe = function skySwipe(drag) {
  Sound.play('mist');
  this.swipes = (this.swipes || 0) + 1;
  if (this.moonFull || this.swipes % 3 !== 0) return this.wake();
  this.moonFull = true;
  this.notice = 'The moon leans closer, and the light turns warm.';
  this.noticeUntil = performance.now() + 4500;
  this.store('moonmirror.moon', 'full');
  Sound.play('bell');
  return this.wake();
};

Marsh.loadSound = function loadSound() {
  this.wantSound = this.read('moonmirror.sound') === 'on';
  if (this.read('moonmirror.moon') === 'full') this.moonFull = true;
};

Marsh.store = function store(key, value) {
  try { window.localStorage.setItem(key, value); } catch (error) { /* private mode: fine */ }
};

Marsh.read = function read(key) {
  try { return window.localStorage.getItem(key); } catch (error) { return null; }
};

Marsh.toggleSound = function toggleSound() {
  if (Sound.enabled) Sound.disable(); else Sound.enable();
  this.store('moonmirror.sound', Sound.enabled ? 'on' : 'off');
  this.paintSoundButton();
};

Marsh.paintSoundButton = function paintSoundButton() {
  const button = document.getElementById('btn-sound');
  button.textContent = Sound.enabled ? 'Sound on' : 'Sound off';
  button.setAttribute('aria-pressed', Sound.enabled ? 'true' : 'false');
};

Marsh.tileAt = function tileAt(at) {
  return this.scene.tiles.find((tile) => tile.x === at.x && tile.y === at.y) || null;
};

Marsh.render = function render(scene) {
  const before = this.scene;
  this.scene = scene;
  this.lit = new Set();
  for (let i = 0; i + 1 < scene.lit.length; i += 2) this.lit.add(`${scene.lit[i]},${scene.lit[i + 1]}`);
  this.ending = scene.finished;
  if (!before || before.level !== scene.level) this.newLevel();
  Sound.setBed(scene.bed);
  Sound.setShimmer(scene.litCount);
  this.updateHud(scene);
  this.arrivals(before, scene);
  if (scene.finished) this.showEnding();
};

Marsh.newLevel = function newLevel() {
  this.celebrating = 0;
  this.fx = [];
  this.motes = [];
  this.idleAt = 0;
  this.fade = 1;
  this.heronSung = false;
  document.getElementById('ending').hidden = true;
};

Marsh.arrivals = function arrivals(before, scene) {
  const litBefore = before ? this.keysOf(before.lit) : new Set();
  const fresh = [...this.lit].filter((key) => !litBefore.has(key));
  fresh.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    this.burst(x, y, 'burst', 1100);
  });
  if (fresh.length) Sound.play('lit');
  const blocked = this.absorbed(scene).filter((key) => !this.absorbed(before).includes(key));
  blocked.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    this.fx.push({ kind: 'absorb', x: MarshDraw.cellX(x) + 8, y: MarshDraw.cellY(y) + 8,
      start: performance.now(), life: 600, cell: key });
  });
  if (blocked.length) Sound.play('absorb');
};

Marsh.keysOf = function keysOf(flat) {
  const keys = new Set();
  for (let i = 0; i + 1 < flat.length; i += 2) keys.add(`${flat[i]},${flat[i + 1]}`);
  return keys;
};

Marsh.absorbed = function absorbed(scene) {
  if (!scene) return [];
  return scene.beams
    .filter((beam) => beam.end === 'reed' || beam.end === 'rune')
    .map((beam) => `${beam.path[beam.path.length - 2]},${beam.path[beam.path.length - 1]}`);
};

Marsh.burst = function burst(x, y, kind, life) {
  this.fx.push({ kind, x: MarshDraw.cellX(x) + 8, y: MarshDraw.cellY(y) + 8,
    start: performance.now(), life, cell: `${x},${y}` });
};

Marsh.celebrate = function celebrate() {
  this.celebrating = performance.now();
  [...this.lit].forEach((key, i) => {
    const [x, y] = key.split(',').map(Number);
    this.burst(x, y, 'burst', 1500 + i * 150);
  });
  Sound.play('heron');
};

Marsh.showEnding = function showEnding() {
  document.getElementById('ending-text').textContent =
    'Every lantern is lit and the marsh gate stands open. The heron carries the light home.';
  document.getElementById('ending').hidden = false;
  if (!this.heronSung) {
    this.heronSung = true;
    Sound.play('heron');
  }
};

Marsh.updateHud = function updateHud(scene) {
  document.getElementById('level-line').textContent =
    `Level ${scene.level} of ${scene.levelCount} — ${scene.name}`;
  document.getElementById('progress').textContent = `Lanterns ${scene.litCount} of ${scene.lanterns}`;
  document.getElementById('hint').textContent = this.hintFor(scene);
};

Marsh.hintFor = function hintFor(scene) {
  if (this.notice && performance.now() < this.noticeUntil) return this.notice;
  if (scene.finished) return 'The marsh is yours for the night. Tap again to walk it from the start.';
  if (scene.solved) return 'The light reaches every lantern.';
  return scene.hint;
};

Marsh.refreshHint = function refreshHint(now) {
  if (!this.notice || now < this.noticeUntil) return;
  this.notice = '';
  document.getElementById('hint').textContent = this.hintFor(this.scene);
};

Marsh.tick = function tick(now) {
  this.clock = now;
  if (this.scene) {
    this.idle(now);
    this.drift(now);
    this.prune(now);
    this.refreshHint(now);
    this.fade = Math.max(0, this.fade - 0.022);
    MarshDraw.paint(this.view(now));
  }
  requestAnimationFrame((next) => this.tick(next));
};

Marsh.idle = function idle(now) {
  if (!this.wantsIdle(now)) return;
  this.idleAt = now;
  for (let i = 0; i < 8; i += 1) {
    this.motes.push({ x: 22 + Math.random() * 132, y: MarshDraw.TOP + 10 + Math.random() * 92,
      phase: Math.random() * 6.283, fade: 0 });
  }
  Sound.play('heron');
};

Marsh.wantsIdle = function wantsIdle(now) {
  if (this.idleAt || this.celebrating || this.ending) return false;
  return now - this.lastInput > 13000;
};

Marsh.wake = function wake() {
  this.lastInput = performance.now();
  if (!this.idleAt) return;
  this.idleAt = 0;
  if (this.motes.length) Sound.play('mist');
};

Marsh.drift = function drift() {
  this.motes.forEach((mote) => {
    const target = this.idleAt ? 1 : 0;
    mote.fade = mote.fade + (target - mote.fade) * 0.03;
  });
};

Marsh.prune = function prune(now) {
  this.fx = this.fx.filter((fx) => now - fx.start < fx.life);
  this.motes = this.motes.filter((mote) => mote.fade > 0.03);
};

Marsh.view = function view(now) {
  return { time: now, scene: this.scene, fx: this.fx, motes: this.motes, lit: this.lit,
    moonDrift: this.moonDrift, moonFull: this.moonFull, celebrate: this.celebrating,
    ending: this.ending, fade: this.fade };
};

Marsh.sfx = function sfx(name) { Sound.play(name); };

Marsh.shutdown = function shutdown() {
  Sound.disable();
  this.scene = null;
};

window.Marsh = Marsh;
