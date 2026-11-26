function cross(r, c) {
    return [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
}
function diagonals(r, c) {
    return [[r, c], [r - 1, c - 1], [r - 1, c + 1], [r + 1, c - 1], [r + 1, c + 1]];
}
function ring(r, c) {
    const out = [[r, c]];
    for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
            if (dr !== 0 || dc !== 0)
                out.push([r + dr, c + dc]);
        }
    }
    return out;
}
function rowColumn(r, c, size) {
    const out = [];
    for (let i = 0; i < size; i += 1)
        out.push([r, i]);
    for (let i = 0; i < size; i += 1)
        if (i !== r)
            out.push([i, c]);
    return out;
}
export const KINDS = {
    clover: { label: "Clover", tint: "#93e9b3", glow: "#46c98a", petals: 4, pattern: cross },
    fern: { label: "Fern", tint: "#eed79b", glow: "#dcae4a", petals: 5, pattern: diagonals },
    reed: { label: "Reed", tint: "#a2d3ee", glow: "#59a9dd", petals: 6, pattern: rowColumn },
    bell: { label: "Bell", tint: "#cfaae8", glow: "#a274d8", petals: 8, pattern: ring },
};
export const KIND_LETTERS = {
    c: "clover",
    f: "fern",
    r: "reed",
    b: "bell",
};
