// Timing and the animated view: what the painter sees each frame.
const FILL_TIME = 0.45;
const SPREAD = 0.1;
const FLASH_TIME = 0.35;
const HINT_TIME = 4.5;
const COURSE_TIME = 6;
const BLOOM_TIME = 1.8;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease = (v) => 1 - (1 - v) * (1 - v);

export function createEffects() {
  const fills = new Map();
  const flashes = new Map();
  let flowAt = 0;
  let bloomed = false;
  let bloomAt = 0;
  let hint = null;
  let hintAt = -99;
  let course = null;
  let courseAt = -99;
  let glows = [];

  function onSnapshot(now) {
    flowAt = now;
  }

  function reset() {
    fills.clear();
    flashes.clear();
    bloomed = false;
    hint = null;
    course = null;
    glows = [];
  }

  function fillOf(tile, now, motion) {
    const key = `${tile[0]},${tile[1]}`;
    const wet = tile[4] >= 0;
    const start = flowAt + Math.max(0, tile[4]) * SPREAD * (2 - motion);
    const want = wet ? ease(clamp01((now - start) / (FILL_TIME * (2 - motion)))) : 0;
    const cur = fills.get(key) ?? 0;
    const next = cur + (want - cur) * 0.25;
    fills.set(key, next);
    return next;
  }

  function flashOf(tile, now) {
    const key = `${tile[0]},${tile[1]}`;
    const at = flashes.get(key);
    if (at === undefined) return 0;
    const left = 1 - (now - at) / FLASH_TIME;
    if (left <= 0) flashes.delete(key);
    return clamp01(left);
  }

  function tileViews(state, now, motion) {
    return state.tiles.map((tile) => ({
      x: tile[0], y: tile[1], sp: tile[2], mask: tile[3],
      dist: tile[4], fill: tile[2] === 1 ? 1 : fillOf(tile, now, motion),
      flash: flashOf(tile, now),
    }));
  }

  function glowViews(now, motion) {
    const speed = 2 - motion;
    const out = [];
    for (const g of glows) {
      const p = clamp01((now - g.at) / (g.travel * speed));
      if (p >= 1) continue;
      const x = g.x0 + (g.x1 - g.x0) * ease(p);
      const y = g.y0 + (g.y1 - g.y0) * ease(p) - Math.sin(p * Math.PI) * g.arc;
      const alpha = Math.sin(p * Math.PI);
      out.push({ x, y, r: g.r * (0.6 + alpha * 0.8), alpha });
    }
    return out;
  }

  function view(state, board, now, motion) {
    const tile = board.tile;
    const scale = board.scale;
    return {
      w: state.w, h: state.h, tile, scale, t: now, motion,
      bloom: bloomed ? clamp01((now - bloomAt) / BLOOM_TIME) : 0,
      hint: hint && now - hintAt < HINT_TIME ? hint : null,
      course: course ? { cells: course, fade: 1 - (now - courseAt) / COURSE_TIME } : null,
      glows: glowViews(now, motion).filter((g) => g.alpha > 0.02),
      gardens: state.gardens,
      tiles: tileViews(state, now, motion),
    };
  }

  return {
    view, onSnapshot, reset,
    tileCount: () => fills.size,
    flash(x, y, now) { flashes.set(`${x},${y}`, now); },
    showHint(x, y, now) { hint = [x, y]; hintAt = now; },
    showCourse(cells, now) { course = cells; courseAt = now; },
    bloom(now) { bloomed = true; bloomAt = now; },
    firefly(from, to, now) {
      glows.push({ x0: from.x, y0: from.y, x1: to.x, y1: to.y, r: 26, arc: 12, at: now, travel: 2.6 });
      if (glows.length > 3) glows = glows.slice(-3);
    },
  };
}
