import { applyTap, flowerCount, isOpen, openCount } from "./board.js";
import { buildLevel, LEVELS } from "./levels.js";
export function levelCount() {
    return LEVELS.length;
}
export function levelName(index) {
    return LEVELS[index].name;
}
export function levelHint(index) {
    return LEVELS[index].hint;
}
export function loadLevel(index) {
    const { grid, solution } = buildLevel(index);
    return { levelIndex: index, grid, solution, history: [], solved: false };
}
export function tapFlower(game, r, c) {
    if (game.solved || !game.grid[r]?.[c])
        return false;
    applyTap(game.grid, r, c);
    game.history.push([r, c]);
    game.solved = isOpen(game.grid);
    return true;
}
export function undo(game) {
    const last = game.history.pop();
    if (!last)
        return false;
    applyTap(game.grid, last[0], last[1]);
    game.solved = false;
    return true;
}
export function canUndo(game) {
    return !game.solved && game.history.length > 0;
}
export function progress(game) {
    return { open: openCount(game.grid), total: flowerCount(game.grid) };
}
