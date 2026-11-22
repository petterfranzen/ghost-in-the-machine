// Board geometry, plus the accessible stone buttons layered over the canvas.
const MIN_TILE = 44;
const MAX_TILE = 168;

const NAMES = { 0: 'Turn stone', 1: 'Spring', 2: 'Garden', 3: 'Rock' };
const TAILS = { 0: '', 1: ' - tap to stir the water', 2: ' - tap to trace the water', 3: '' };

const labelFor = (kind, x, y) =>
  `${NAMES[kind]} row ${y + 1} column ${x + 1}${TAILS[kind]}`;

export function createBoard({ stage, canvas, grid }) {
  let tile = MIN_TILE;
  let scale = 1;
  let size = { w: 0, h: 0 };

  function fit(state) {
    size = { w: state.w, h: state.h };
    const availW = Math.max(80, stage.clientWidth);
    const availH = Math.max(80, stage.clientHeight);
    tile = Math.max(MIN_TILE, Math.floor(Math.min(availW / state.w, availH / state.h, MAX_TILE)));
    const cssW = tile * state.w;
    const cssH = tile * state.h;
    scale = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * scale);
    canvas.height = Math.round(cssH * scale);
    grid.style.width = `${cssW}px`;
    grid.style.height = `${cssH}px`;
    grid.style.gridTemplateColumns = `repeat(${state.w}, ${tile}px)`;
    grid.style.gridTemplateRows = `repeat(${state.h}, ${tile}px)`;
  }

  function buttonFor(cell) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tile';
    btn.dataset.x = String(cell[0]);
    btn.dataset.y = String(cell[1]);
    btn.dataset.kind = String(cell[2]);
    btn.setAttribute('aria-label', labelFor(cell[2], cell[0], cell[1]));
    if (cell[2] === 3) btn.disabled = true;
    return btn;
  }

  function build(state) {
    grid.textContent = '';
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', 'Stone channel board');
    for (const cell of state.tiles) grid.append(buttonFor(cell));
  }

  function cellFromEvent(ev) {
    const rect = grid.getBoundingClientRect();
    const x = Math.floor((ev.clientX - rect.left) / tile);
    const y = Math.floor((ev.clientY - rect.top) / tile);
    if (x < 0 || y < 0 || x >= size.w || y >= size.h) return null;
    return { x, y };
  }

  return {
    fit,
    build,
    cellFromEvent,
    get tile() { return tile; },
    get scale() { return scale; },
    get size() { return size; },
  };
}
