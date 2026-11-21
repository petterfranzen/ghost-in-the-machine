// One thumb: a tap turns a stone, a drag turns every stone it crosses, a still
// press of ~0.7 s asks for a hint, and a long still press on the spring wakes it.
// Taps come from pointerup, so a gesture can cancel the tap it starts.
const HINT_HOLD = 650;
const SECRET_HOLD = 1400;
const DRAG_SLOP = 8;

export function createGestures({ grid, board, onTap, onHint, onSecret, onSweep, onWake }) {
  let press = null;
  let timers = [];

  function clearTimers() {
    for (const id of timers) window.clearTimeout(id);
    timers = [];
  }

  function hold(ms, run) {
    timers.push(window.setTimeout(() => {
      if (!press || press.moved) return;
      press.consumed = true;
      run(press.x, press.y);
    }, ms));
  }

  function begin(ev) {
    if (ev.button && ev.button !== 0) return;
    const cell = board.cellFromEvent(ev);
    if (!cell) return;
    press = { x: cell.x, y: cell.y, sx: ev.clientX, sy: ev.clientY, moved: false,
              consumed: false, swept: new Set() };
    timers = [];
    hold(HINT_HOLD, onHint);
    hold(SECRET_HOLD, onSecret);
    grid.setPointerCapture?.(ev.pointerId);
    ev.preventDefault();
    onWake();
  }

  function startDrag() {
    press.moved = true;
    clearTimers();
    press.consumed = true;
    press.swept.add(`${press.x},${press.y}`);
    onSweep(press.x, press.y);
  }

  function move(ev) {
    if (!press) return;
    if (!press.moved && Math.hypot(ev.clientX - press.sx, ev.clientY - press.sy) > DRAG_SLOP) startDrag();
    if (!press.moved) return;
    const cell = board.cellFromEvent(ev);
    if (!cell) return;
    const key = `${cell.x},${cell.y}`;
    if (press.swept.has(key)) return;
    press.swept.add(key);
    onSweep(cell.x, cell.y);
  }

  function end(ev) {
    clearTimers();
    if (press && !press.moved && !press.consumed) {
      const cell = board.cellFromEvent(ev) || press;
      onTap(cell.x, cell.y);
    }
    press = null;
  }

  grid.addEventListener('pointerdown', begin);
  grid.addEventListener('pointermove', move);
  grid.addEventListener('pointerup', end);
  grid.addEventListener('pointercancel', () => { clearTimers(); press = null; });
  grid.addEventListener('contextmenu', (ev) => ev.preventDefault());
  grid.addEventListener('selectstart', (ev) => ev.preventDefault());
  grid.addEventListener('dragstart', (ev) => ev.preventDefault());

  return { holding: () => press };
}
