// Shared vocabulary for Deeproot: tiles, positions and level shapes.

export type Tile = 'soil' | 'stone' | 'water' | 'bud' | 'ember' | 'portal' | 'seed';

export interface Pos {
  readonly x: number;
  readonly y: number;
}

/** A level as written down: a name, a one-line hint, and rows of legend chars. */
export interface RawLevel {
  readonly name: string;
  readonly hint: string;
  readonly rows: readonly string[];
}

/** A level after parsing: a flat tile grid plus the special positions. */
export interface Level {
  readonly name: string;
  readonly hint: string;
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly Tile[];
  /** For each index: its twin portal index, or -1. */
  readonly twins: readonly number[];
  readonly start: number;
  readonly ember: number;
  readonly buds: readonly number[];
}

/** What one tap added to the root: one tile, or two when a portal carried it. */
export type Step = readonly number[];
