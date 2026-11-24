// The colours of the underground: a soft, low-saturation palette so a long
// look stays easy on the eye. Every helper here is deterministic.

export const CELL = 48;
export const BOARD_COLS = 7;
export const BOARD_ROWS = 6;
export const BOARD_W = BOARD_COLS * CELL;
export const BOARD_H = BOARD_ROWS * CELL;

export const PALETTE = {
  bedrock: '#0b0f0c',
  soil: '#1d2620',
  soilBand: '#232e26',
  speckle: '#33422f',
  seam: '#121a15',
  strata: '#131b16',
  pebble: '#1a231c',
  stone: '#3b4a43',
  stoneTop: '#516559',
  stoneShade: '#28332d',
  water: '#16303a',
  waterRipple: '#27505e',
  root: '#e3d6b4',
  rootShade: '#b09c74',
  seed: '#cde8a2',
  budAsleep: '#3f5138',
  budAwake: '#9fe3b0',
  budCore: '#e2ffe8',
  ember: '#ffb765',
  emberCold: '#6b4a2a',
  portal: '#8a72c4',
  portalGlow: '#c9b6f2',
} as const;

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.min(Math.max(v, lo), hi);

export const easeOut = (t: number): number => 1 - (1 - clamp(t, 0, 1)) ** 3;

/** A cheap deterministic hash, so speckles never shimmer between frames. */
export function hash(a: number, b: number): number {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const now = (): number => performance.now();
