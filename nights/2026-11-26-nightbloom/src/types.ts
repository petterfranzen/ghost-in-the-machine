export type Kind = "clover" | "fern" | "reed" | "bell";

export interface Cell {
  kind: Kind;
  open: boolean;
}

export type Grid = (Cell | null)[][];

export type Coord = [number, number];
