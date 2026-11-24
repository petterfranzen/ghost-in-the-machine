// The seven levels, written as plain text maps.
//
//   s  seed (the root starts here)     E  the buried ember (the goal)
//   .  soil          #  stone          ~  water
//   *  bud          1/2, 3/4  twin portals
//
// Rows must all be the same length; the board is centred inside a fixed field
// so the ground never jumps between levels.
export const RAW_LEVELS = [
    {
        name: 'First Shoot',
        hint: 'Tap a tile beside the root’s tip to grow into it.',
        rows: ['s..E'],
    },
    {
        name: 'Old Stone',
        hint: 'Stone refuses the root — go around it.',
        rows: [
            's.#..',
            '.#...',
            '.#...',
            '....E',
        ],
    },
    {
        name: 'Two Buds',
        hint: 'Wake every bud before the ember will take you.',
        rows: [
            's....',
            '*..#.',
            '..#..',
            '#..*E',
        ],
    },
    {
        name: 'Cold Water',
        hint: 'The root will not cross water. Find the dry way.',
        rows: [
            's...*',
            '.~~..',
            '.~~..',
            '....E',
        ],
    },
    {
        name: 'Twin Moss',
        hint: 'Step into a moss gate and you come out of its twin.',
        rows: [
            's..#.',
            '.#.#.',
            '.#1#.',
            '.#..#',
            '2...E',
        ],
    },
    {
        name: 'The Deep',
        hint: 'Everything you have learned, all at once.',
        rows: [
            's.#...',
            '.~#.1.',
            '.~#...',
            '*..#.2',
            '.#..*.',
            '.#...E',
        ],
    },
    {
        name: 'Emberlight',
        hint: 'One last descent. Leave nothing asleep behind you.',
        rows: [
            's....#.',
            '~~.#.1.',
            '...*.2.',
            '.#.#.#.',
            '.*.#..*',
            '.#..*.E',
        ],
    },
];
