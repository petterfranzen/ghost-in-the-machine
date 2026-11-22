// One thumb, or one keyboard. A swipe anywhere, the four arrows, a tap on the
// bay (a lit lantern answers), a long press to warm the ice, and the small
// buttons: undo, restart, sound.
window.LakeControls = (function () {
const SWIPE_MIN = 26;
const TAP_MAX = 14;
const HOLD_MS = 260;

function attachControls(scene, game, sound, painter) {
  const ui = {
    hint: document.getElementById('hint'),
    count: document.getElementById('count'),
    pips: document.getElementById('pips'),
    sound: document.getElementById('sound'),
    undo: document.getElementById('undo'),
    restart: document.getElementById('restart'),
  };
  const canvas = document.getElementById('bay');
  const state = { down: false, x0: 0, y0: 0, t0: 0, holdFired: false, handled: false, timer: 0, shown: {} };

  function tileAtEvent(ev) {
    const rect = canvas.getBoundingClientRect();
    const b = painter.box();
    const x = Math.floor((ev.clientX - rect.left - b.x) / b.s);
    const y = Math.floor((ev.clientY - rect.top - b.y) / b.s);
    return { x, y };
  }

  function onDown(ev) {
    sound.resume();
    state.down = true;
    state.handled = false;
    state.holdFired = false;
    state.x0 = ev.clientX;
    state.y0 = ev.clientY;
    state.t0 = performance.now();
    clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      if (!state.down || state.handled) return;
      state.holdFired = true;
      game.press(1);
    }, HOLD_MS);
  }

  function onMove(ev) {
    if (!state.down || state.handled) return;
    const dx = ev.clientX - state.x0;
    const dy = ev.clientY - state.y0;
    if (state.holdFired) {
      if (Math.abs(dx) + Math.abs(dy) > SWIPE_MIN) {
        state.down = false;
        state.handled = true;
        game.press(0);
        slideFrom(dx, dy);
      }
      return;
    }
    if (Math.abs(dx) + Math.abs(dy) < SWIPE_MIN) return;
    state.handled = true;
    slideFrom(dx, dy);
  }

  function onUp(ev) {
    if (!state.down) return;
    state.down = false;
    clearTimeout(state.timer);
    if (state.holdFired) {
      game.press(0);
      return;
    }
    if (state.handled) return;
    const quick = performance.now() - state.t0 < 500;
    const still = Math.abs(ev.clientX - state.x0) + Math.abs(ev.clientY - state.y0) < TAP_MAX;
    if (!quick || !still) return;
    const cell = tileAtEvent(ev);
    game.tap(cell.x, cell.y);
  }

  function slideFrom(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) game.slide(dx > 0 ? 1 : 3);
    else game.slide(dy > 0 ? 2 : 0);
  }

  function onKey(ev) {
    const dirs = { ArrowUp: 0, w: 0, ArrowRight: 1, d: 1, ArrowDown: 2, s: 2, ArrowLeft: 3, a: 3 };
    const key = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    if (key in dirs) { ev.preventDefault(); game.slide(dirs[key]); return; }
    if (key === 'u') game.undo();
    if (key === 'r') game.restart();
    if (key === 'm') toggleSound();
  }

  let force0 = false;

  function toggleSound() {
    const on = !sound.isOn();
    if (on) sound.enable(); else sound.disable();
    refresh(true);
  }

  // Each line of the panel is its own little writer, and each one only
  // touches the DOM when the value it shows has actually changed.
  function put(key, value, write) {
    if (!force0 && state.shown[key] === value) return;
    state.shown[key] = value;
    write();
  }

  function showHint() {
    const text = scene.hint;
    put('hint', text, () => { if (ui.hint) ui.hint.textContent = text; });
  }

  function showCount() {
    const h = scene.hud;
    const text = h.free ? 'The bay is yours' : `${h.lit} of ${h.total} lanterns lit`;
    put('count', text, () => { if (ui.count) ui.count.textContent = text; });
  }

  function showPips() {
    const h = scene.hud;
    put('pips', h.level, () => { if (ui.pips) ui.pips.innerHTML = pipRow(h.level, h.levels); });
  }

  function showSound() {
    const on = sound.isOn();
    put('sound', on ? 'Sound on' : 'Sound off', () => {
      if (!ui.sound) return;
      ui.sound.textContent = on ? 'Sound on' : 'Sound off';
      ui.sound.setAttribute('aria-pressed', on ? 'true' : 'false');
      ui.sound.classList.toggle('on', on);
    });
  }

  function refresh(force) {
    force0 = !!force;
    showHint();
    showCount();
    showPips();
    showSound();
  }

  function pipRow(level, levels) {
    let out = '';
    for (let i = 1; i <= levels; i++) out += `<i class="${i <= level ? 'lit' : ''}"></i>`;
    return out;
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', () => { state.down = false; clearTimeout(state.timer); if (state.holdFired) game.press(0); });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', onKey);
  document.querySelectorAll('[data-dir]').forEach((btn) => {
    btn.addEventListener('click', () => game.slide(Number(btn.dataset.dir)));
  });
  if (ui.sound) ui.sound.addEventListener('click', toggleSound);
  if (ui.undo) ui.undo.addEventListener('click', () => game.undo());
  if (ui.restart) ui.restart.addEventListener('click', () => game.restart());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sound.resume(); });

  refresh(true);
  return { refresh, tileAtEvent, slideFrom };
}

return { attachControls };
})();
