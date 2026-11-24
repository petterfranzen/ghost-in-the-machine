// The rules of the root, all pure: given a level and the path so far, what may
// happen next. state.ts (play) and solver.ts (proof) both call these.
import { neighbours, tileAt } from './grid.js';
export const isOpen = (tile) => tile !== 'stone' && tile !== 'water';
/** The tile the root could grow from next. Always a valid index. */
export const tipOf = (path) => path[path.length - 1];
export const budOf = (level, index) => level.buds.includes(index);
export const budsAwake = (level, path) => level.buds.filter((b) => path.includes(b)).length;
export const allBudsAwake = (level, path) => budsAwake(level, path) === level.buds.length;
export const isSolved = (level, path) => path.length > 0 && tipOf(path) === level.ember && allBudsAwake(level, path);
const REFUSALS = [
    { when: (_l, _p, t) => t < 0, why: 'far' },
    { when: (l, _p, t) => t >= l.tiles.length, why: 'far' },
    { when: (l, p, t) => !neighbours(l, tipOf(p)).includes(t), why: 'far' },
    { when: (_l, p, t) => p.includes(t), why: 'rooted' },
    { when: (l, _p, t) => !isOpen(tileAt(l, t)), why: 'blocked' },
    { when: (l, p, t) => tileAt(l, t) === 'ember' && !allBudsAwake(l, p), why: 'ember-sleeps' },
    { when: (l, p, t) => tileAt(l, t) === 'portal' && gateShut(l, p, t), why: 'gate-shut' },
];
const gateShut = (level, path, target) => {
    const twin = level.twins[target] ?? -1;
    return twin < 0 || path.includes(twin);
};
export function refusal(level, path, target) {
    const hit = REFUSALS.find((check) => check.when(level, path, target));
    return hit ? hit.why : null;
}
/** The path after growing into `target`, or null when the tap is not allowed. */
export function applyMove(level, path, target) {
    if (refusal(level, path, target) !== null)
        return null;
    const next = [...path, target];
    if (tileAt(level, target) === 'portal')
        next.push(level.twins[target]);
    return next;
}
export const stepOf = (before, after) => after.slice(before.length);
export function legalTargets(level, path) {
    return neighbours(level, tipOf(path)).filter((t) => applyMove(level, path, t) !== null);
}
export const isStuck = (level, path) => !isSolved(level, path) && legalTargets(level, path).length === 0;
