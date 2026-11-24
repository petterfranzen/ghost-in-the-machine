// The rules of the root, all pure: given a level and the path so far, what may
// happen next. state.ts (play) and solver.ts (proof) both call these.

import type { Level, Step, Tile } from './types.js';
import { neighbours, tileAt } from './grid.js';

export const isOpen = (tile: Tile): boolean => tile !== 'stone' && tile !== 'water';

/** The tile the root could grow from next. Always a valid index. */
export const tipOf = (path: readonly number[]): number => path[path.length - 1];

export const budOf = (level: Level, index: number): boolean => level.buds.includes(index);

export const budsAwake = (level: Level, path: readonly number[]): number =>
  level.buds.filter((b) => path.includes(b)).length;

export const allBudsAwake = (level: Level, path: readonly number[]): boolean =>
  budsAwake(level, path) === level.buds.length;

export const isSolved = (level: Level, path: readonly number[]): boolean =>
  path.length > 0 && tipOf(path) === level.ember && allBudsAwake(level, path);

/** Why a tap did nothing — used for the one-line nudge under the board. */
export type Refusal = 'blocked' | 'rooted' | 'far' | 'ember-sleeps' | 'gate-shut' | null;

interface RefusalCheck {
  readonly when: (level: Level, path: readonly number[], target: number) => boolean;
  readonly why: Refusal;
}

const REFUSALS: readonly RefusalCheck[] = [
  { when: (_l, _p, t) => t < 0, why: 'far' },
  { when: (l, _p, t) => t >= l.tiles.length, why: 'far' },
  { when: (l, p, t) => !neighbours(l, tipOf(p)).includes(t), why: 'far' },
  { when: (_l, p, t) => p.includes(t), why: 'rooted' },
  { when: (l, _p, t) => !isOpen(tileAt(l, t)), why: 'blocked' },
  { when: (l, p, t) => tileAt(l, t) === 'ember' && !allBudsAwake(l, p), why: 'ember-sleeps' },
  { when: (l, p, t) => tileAt(l, t) === 'portal' && gateShut(l, p, t), why: 'gate-shut' },
];

const gateShut = (level: Level, path: readonly number[], target: number): boolean => {
  const twin = level.twins[target] ?? -1;
  return twin < 0 || path.includes(twin);
};

export function refusal(level: Level, path: readonly number[], target: number): Refusal {
  const hit = REFUSALS.find((check) => check.when(level, path, target));
  return hit ? hit.why : null;
}

/** The path after growing into `target`, or null when the tap is not allowed. */
export function applyMove(level: Level, path: readonly number[], target: number): number[] | null {
  if (refusal(level, path, target) !== null) return null;
  const next = [...path, target];
  if (tileAt(level, target) === 'portal') next.push(level.twins[target]);
  return next;
}

export const stepOf = (before: readonly number[], after: readonly number[]): Step =>
  after.slice(before.length);

export function legalTargets(level: Level, path: readonly number[]): number[] {
  return neighbours(level, tipOf(path)).filter((t) => applyMove(level, path, t) !== null);
}

export const isStuck = (level: Level, path: readonly number[]): boolean =>
  !isSolved(level, path) && legalTargets(level, path).length === 0;
