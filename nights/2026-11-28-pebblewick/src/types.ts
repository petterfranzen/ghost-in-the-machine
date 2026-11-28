/** Shared shapes: no logic lives here, only the vocabulary the rest speaks. */

export interface Vec {
  x: number;
  y: number;
}

/** A circle at (x, y) with radius r. Mounds, moss and hollows are all discs. */
export interface Disc {
  x: number;
  y: number;
  r: number;
}

/** A rounded wall, given by its centre and size. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Bumper extends Disc {
  bounce: number;
}

export interface Level {
  name: string;
  hint: string;
  start: Vec;
  motes: Vec[];
  hollow: Disc;
  mounds: Disc[];
  walls: Rect[];
  moss: Disc[];
  slick: Disc[];
  bumpers: Bumper[];
  /** A spot that rewards rolling over it; hidden until found. */
  secret?: Vec;
}

export interface Board {
  w: number;
  h: number;
}

/** How the shelf is drawn: scale, world size, clock and motion scale. */
export interface View {
  tile: number;
  time: number;
  motion: number;
}

export interface Tilt {
  x: number;
  y: number;
}

/** A faded mark the pebble leaves behind as it rolls. */
export interface Trail {
  x: number;
  y: number;
  born: number;
}

/** A ripple that spreads where the pebble touched something. */
export interface Ring {
  x: number;
  y: number;
  born: number;
}

/** Everything the renderer needs to know about the current moment. */
export interface Scene {
  ball: Vec;
  lit: boolean[];
  found: boolean;
  homed: boolean;
  sink: number;
  hop: number;
  lean: Tilt;
  trail: Trail[];
  rings: Ring[];
  moth: Vec | null;
}

/** A shelf plus the clock it is being drawn at. */
export interface Frame {
  level: Level;
  board: Board;
  view: View;
}

export const BOARD: Board = { w: 340, h: 460 };
export const BALL_RADIUS = 12;
export const MOTE_RADIUS = 10;
export const MOTE_REACH = BALL_RADIUS + MOTE_RADIUS + 3;
export const LEVEL_COUNT = 6;
