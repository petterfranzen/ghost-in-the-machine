// A brute-force proof that a level is solvable (and not already solved).
// Written first, before any pixels: a puzzle you cannot solve is not a game.
import { applyMove, isSolved, legalTargets } from './rules.js';
const NODE_CAP = 400000;
export function solve(level, cap = NODE_CAP) {
    let solutions = 0;
    let shortest = Number.POSITIVE_INFINITY;
    let nodes = 0;
    const walk = (path) => {
        nodes += 1;
        if (nodes > cap)
            return;
        if (isSolved(level, path)) {
            solutions += 1;
            shortest = Math.min(shortest, path.length);
            return;
        }
        for (const target of legalTargets(level, path)) {
            const next = applyMove(level, path, target);
            if (next)
                walk(next);
        }
    };
    walk([level.start]);
    return {
        solvable: solutions > 0,
        solutions,
        shortest: Number.isFinite(shortest) ? shortest : -1,
        nodes,
    };
}
