// Turning the text maps into a grid the game can walk.
const PLAIN_TILES = {
    '.': 'soil',
    '#': 'stone',
    '~': 'water',
    '*': 'bud',
    E: 'ember',
    s: 'seed',
};
const PORTAL_PAIRS = [['1', '2'], ['3', '4']];
const isPortalChar = (ch) => PORTAL_PAIRS.some(([a, b]) => ch === a || ch === b);
const tileOf = (ch) => {
    const plain = PLAIN_TILES[ch];
    if (plain)
        return plain;
    if (isPortalChar(ch))
        return 'portal';
    throw new Error(`deeproot: unknown legend char "${ch}"`);
};
export const indexOf = (width, x, y) => y * width + x;
export const posOf = (level, index) => ({ x: index % level.width, y: Math.floor(index / level.width) });
export const tileAt = (level, index) => level.tiles[index];
export const inField = (level, index) => index >= 0 && index < level.tiles.length;
/** The up-to-four orthogonal neighbours that stay inside the level. */
export function neighbours(level, index) {
    const { x, y } = posOf(level, index);
    const cand = [{ x, y: y - 1 }, { x, y: y + 1 }, { x: x - 1, y }, { x: x + 1, y }];
    return cand
        .filter((p) => p.x >= 0 && p.y >= 0 && p.x < level.width && p.y < level.height)
        .map((p) => indexOf(level.width, p.x, p.y));
}
const twinTable = (spots) => {
    const twins = [];
    for (const [a, b] of PORTAL_PAIRS) {
        const from = spots.get(a);
        const to = spots.get(b);
        if (from !== undefined && to !== undefined) {
            twins[from] = to;
            twins[to] = from;
        }
    }
    return twins;
};
export function parseLevel(raw) {
    const width = raw.rows[0]?.length ?? 0;
    const height = raw.rows.length;
    const tiles = [];
    const spots = new Map();
    let start = -1;
    let ember = -1;
    const buds = [];
    for (let y = 0; y < height; y += 1) {
        const row = raw.rows[y];
        if (row.length !== width) {
            throw new Error(`deeproot: "${raw.name}" row ${y} is ${row.length} wide, expected ${width}`);
        }
        for (let x = 0; x < width; x += 1) {
            const ch = row[x];
            const index = indexOf(width, x, y);
            tiles.push(tileOf(ch));
            if (isPortalChar(ch))
                spots.set(ch, index);
            if (ch === 's')
                start = index;
            if (ch === 'E')
                ember = index;
            if (ch === '*')
                buds.push(index);
        }
    }
    return {
        name: raw.name,
        hint: raw.hint,
        width,
        height,
        tiles,
        twins: twinTable(spots),
        start,
        ember,
        buds,
    };
}
export const parseAll = (raws) => raws.map(parseLevel);
