import { applyTap, isOpen } from "./board.js";
import { KIND_LETTERS } from "./kinds.js";
import { mulberry32 } from "./rng.js";
// Each letter is a flower kind present from the start of the level
// (c clover, f fern, r reed, b bell); "." is bare ground.
export const LEVELS = [
    {
        name: "First Light",
        hint: "Tap a flower to open it \u2014 it opens its four neighbours too. Open them all.",
        map: ["ccc", "ccc", "ccc"],
        taps: 3,
        seed: 3,
    },
    {
        name: "Wider",
        hint: "Clover again, over a wider meadow.",
        map: ["cccc", "cccc", "cccc", "cccc"],
        taps: 5,
        seed: 1,
    },
    {
        name: "Ferns",
        hint: "Fern opens itself and its four diagonal neighbours.",
        map: ["cffc", "fccf", "fccf", "cffc"],
        taps: 6,
        seed: 6,
    },
    {
        name: "Both Kinds",
        hint: "Clover and fern together. Open every flower.",
        map: ["ccfcc", "cfffc", "ffcff", "cfffc", "ccfcc"],
        taps: 8,
        seed: 5,
    },
    {
        name: "Reeds",
        hint: "Reed opens its whole row and its whole column.",
        map: ["rcrcc", "ccfcc", "rfffr", "ccfcc", "ccrcr"],
        taps: 9,
        seed: 10,
    },
    {
        name: "Bells",
        hint: "Bell opens itself and all eight flowers around it.",
        map: ["bb.bb", "bcccb", ".cfc.", "bcccb", "bb.bb"],
        taps: 10,
        seed: 2,
    },
    {
        name: "Worn Ground",
        hint: "Everything so far, and the ground is bare in places.",
        map: ["cc..cc", "cfrrfc", ".fbbf.", ".fbbf.", "cfrrfc", "cc..cc"],
        taps: 12,
        seed: 7,
    },
    {
        name: "Last Meadow",
        hint: "The last meadow. Every flower kind, every trick.",
        map: ["crbbrc", "rf..fr", "bcfcfb", "bcfcfb", "rf..fr", "crbbrc"],
        taps: 14,
        seed: 2,
    },
];
function letterToCell(letter) {
    const kind = KIND_LETTERS[letter];
    return kind ? { kind, open: true } : null;
}
export function parseMap(map) {
    return map.map((row) => [...row].map(letterToCell));
}
function flowerSpots(grid) {
    const spots = [];
    for (let r = 0; r < grid.length; r += 1) {
        for (let c = 0; c < grid[r].length; c += 1)
            if (grid[r][c])
                spots.push([r, c]);
    }
    return spots;
}
// Build a level by "unsolving" an open meadow: each generating tap flips a
// pattern, and the same taps flip it back, so every level is solvable by
// construction. The recorded taps double as the level's known solution.
export function buildLevel(index) {
    const level = LEVELS[index];
    const grid = parseMap(level.map);
    const spots = flowerSpots(grid);
    const rand = mulberry32(level.seed);
    const solution = [];
    for (let i = 0; i < level.taps; i += 1) {
        const [r, c] = spots[Math.floor(rand() * spots.length)];
        applyTap(grid, r, c);
        solution.push([r, c]);
    }
    if (isOpen(grid)) {
        applyTap(grid, spots[0][0], spots[0][1]);
        solution.push([spots[0][0], spots[0][1]]);
    }
    return { grid, solution };
}
