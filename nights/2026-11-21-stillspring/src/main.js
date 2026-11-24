import gameSrc from './game.lua';
import { makeGame } from './host.js';
import { createRenderer } from './render.js';
import { createAudio } from './audio.js';
import { createBoard } from './board.js';
import { createGestures } from './gestures.js';
import { createEffects } from './effects.js';
import { courseCells } from './course.js';

const STORE_KEY = 'stillspring.sound';

const dom = {};
for (const id of ['stage', 'canvas', 'grid', 'caption', 'level', 'pips', 'sound', 'undo', 'restart', 'next', 'say']) {
  dom[id] = document.getElementById(id);
}
dom.soundLabel = dom.sound.querySelector('.label');

const game = makeGame(gameSrc);
const audio = createAudio();
const board = createBoard(dom);
const effects = createEffects();
const renderer = createRenderer(dom.canvas);

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let motion = motionQuery.matches ? 0.35 : 1;
let state = game.snap();
let progress = state.progress;
let clock = 0;

function remember(pref) {
  try { window.localStorage.setItem(STORE_KEY, pref); } catch { /* private mode */ }
}

function storedOn() {
  try { return window.localStorage.getItem(STORE_KEY) === 'on'; } catch { return false; }
}

function announce(text) {
  dom.say.textContent = '';
  window.setTimeout(() => { dom.say.textContent = text; }, 40);
}

function setSoundButton() {
  dom.sound.setAttribute('aria-pressed', String(audio.on));
  dom.soundLabel.textContent = audio.on ? 'Sound on' : 'Sound off';
}

function wetFraction(view) {
  const wet = view.tiles.filter((tile) => tile[4] >= 0).length;
  return wet / Math.max(1, view.tiles.length);
}

function tileAt(x, y) {
  return state.tiles.find((tile) => tile[0] === x && tile[1] === y) || null;
}

const centre = ([x, y]) => ({ x: (x + 0.5) * board.tile, y: (y + 0.5) * board.tile });

function paintPips() {
  const [current, total] = state.progress.split(' of ').map(Number);
  dom.pips.textContent = '';
  for (let i = 1; i <= total; i++) {
    const pip = document.createElement('span');
    pip.className = `pip${i < current ? ' on' : ''}${i === current ? ' now' : ''}`;
    dom.pips.append(pip);
  }
}

function updateDom() {
  dom.caption.textContent = state.hint;
  dom.level.textContent = `Level ${state.progress} - ${state.name}`;
  dom.undo.disabled = state.moves === 0;
  dom.restart.disabled = state.moves === 0 || state.solved;
  paintPips();
}

function startLevel() {
  board.build(state);
  board.fit(state);
  effects.reset();
  effects.onSnapshot(clock);
  dom.next.hidden = true;
  announce(`Level ${state.progress}: ${state.name}. ${state.hint}`);
}

function refresh() {
  state = game.snap();
  if (state.progress !== progress) {
    progress = state.progress;
    startLevel();
  }
  updateDom();
  audio.setFlow(wetFraction(state));
  effects.onSnapshot(clock);
}

function turnStone(x, y, gain) {
  const tile = tileAt(x, y);
  if (!tile || tile[2] !== 0 || state.solved) return;
  game.call('tap', x, y);
  audio.play('turn', gain);
  effects.flash(x, y, clock);
  refresh();
}

function activate(x, y) {
  const tile = tileAt(x, y);
  if (!tile) return;
  if (tile[2] === 2) traceWater(tile);
  else if (tile[2] === 1) stirSpring(tile);
  else turnStone(x, y, 1);
}

function traceWater(tile) {
  audio.play('garden');
  effects.showCourse(courseCells(state.path, state.course, state.gardens), clock);
  effects.flash(tile[0], tile[1], clock);
  announce('The garden remembers the way the water took.');
}

function stirSpring(tile) {
  audio.play('drop');
  effects.flash(tile[0], tile[1], clock);
  announce('The spring shivers.');
}

function askHint() {
  const raw = game.call('hint');
  if (!raw || raw === 'null') return;
  const spot = JSON.parse(raw);
  effects.showHint(spot[0], spot[1], clock);
  audio.play('hint');
  announce(`A stone at row ${spot[1] + 1} column ${spot[0] + 1} is worth turning.`);
  return spot;
}

function wakeSpring() {
  if (state.secret) return;
  game.call('secret');
  state = game.snap();
  audio.play('secret');
  effects.firefly(centre(state.spring), centre(state.gardens[0]), clock);
  announce('The spring hums a small tune. Something wakes above the garden.');
}

function glowToHint() {
  const raw = game.call('hint');
  if (!raw || raw === 'null') return;
  effects.firefly(centre(state.spring), centre(JSON.parse(raw)), clock);
}

function finished() {
  effects.bloom(clock);
  audio.play('complete');
  dom.next.hidden = Boolean(state.last);
  const closing = state.last ? ' Every garden drinks: Stillspring is finished.' : '';
  announce(`Level ${state.progress} complete. The garden drinks.${closing}`);
}

function handleEvents(dt) {
  const events = game.call('tick', dt);
  for (const name of events.split(',')) {
    if (name === 'complete') finished();
    if (name === 'idle') glowToHint();
  }
}

function frame(millis) {
  const t = millis / 1000;
  clock += Math.min(0.05, Math.max(0.001, t - clock));
  handleEvents(0.016);
  renderer.draw(effects.view(state, board, clock, motion));
  window.requestAnimationFrame(frame);
}

const gestures = createGestures({
  grid: dom.grid,
  board,
  onTap: activate,
  onHint: askHint,
  onSecret: wakeSpring,
  onSweep: (x, y) => turnStone(x, y, 0.6),
  onWake: () => {
    if (!audio.on && storedOn()) {
      audio.setOn(true);
      setSoundButton();
    }
  },
});

// Keyboard only: pointers are handled on pointerup by the gestures above.
dom.grid.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.tile');
  if (!btn || ev.detail > 0) return;
  activate(Number(btn.dataset.x), Number(btn.dataset.y));
});

dom.sound.addEventListener('click', () => {
  audio.toggle();
  setSoundButton();
  remember(audio.on ? 'on' : 'off');
  announce(audio.on ? 'Sound on.' : 'Sound off.');
});

dom.undo.addEventListener('click', () => {
  game.call('undo');
  audio.play('undo');
  refresh();
  announce('One turn undone.');
});

dom.restart.addEventListener('click', () => {
  game.call('restart');
  audio.play('restart');
  refresh();
  startLevel();
  announce(`Level ${state.progress} restarted. ${state.hint}`);
});

dom.next.addEventListener('click', () => {
  game.call('next');
  audio.play('start');
  refresh();
});

motionQuery.addEventListener('change', (ev) => { motion = ev.matches ? 0.35 : 1; });
window.addEventListener('resize', () => { board.fit(state); });
document.addEventListener('visibilitychange', () => audio.resume());

startLevel();
updateDom();
window.requestAnimationFrame(frame);

// A read-only handle so a browser check can drive the piece without guessing.
window.stillspring = {
  read: () => state,
  geometry: () => ({ tile: board.tile, scale: board.scale, w: state.w, h: state.h }),
  tap: activate,
  hint: askHint,
  sound: () => audio.on,
};
