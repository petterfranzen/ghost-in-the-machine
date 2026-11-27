export interface Level {
  name: string;
  hint: string;
  rows: string[];
}

export interface Puzzle {
  w: number;
  h: number;
  walls: boolean[];
  hollows: number[];
  player: number;
  seeds: number[];
}

export interface State {
  player: number;
  seeds: number[];
}

export interface Dir {
  dx: number;
  dy: number;
}

export interface Tile {
  x: number;
  y: number;
  index: number;
}
