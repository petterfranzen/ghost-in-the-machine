# Deeproot

A small sapling is buried in the dark. Its root can only grow one tile at a time,
and the earth is full of stone, water and sleeping buds. Somewhere below waits an
ember. Grow the root down to it.

Seven descents, each introducing one rule. No timers, no scores, no tutorial —
the first tap teaches you.

## The idea

You are the root, not the tree. Each tap extends the root by one tile from its
tip, and the path never branches or doubles back on itself. Stone and water
refuse you. Buds wake when the root passes through them, and the ember will not
take you until every bud on the level is awake. Twin moss gates carry the root
from one tile to its twin, but only once.

The game is calm on purpose: a dark cross-section of earth, a slow ember glow,
soft tones instead of noise. The interesting part is that the rules are physical
rather than abstract — you are literally drawing a path through soil and seeing
what the ground allows.

## The language

TypeScript. It compiles to a static bundle with no runtime dependencies, which
means the whole game is one folder of plain `.js` after `build.sh` and the
morning preview needs nothing but a static file server. The type system earned
its keep here: the rules are a handful of pure functions over a `Level` and a
`path: number[]`, and the same functions drive both the live game and the
solver that proves each level is solvable. If the solver and the game ever
disagree, the compiler and the shared types say so immediately.

## Build and run

```bash
mise install            # node 24 + typescript 5.7, pinned in mise.toml
bash build.sh           # compiles to dist/, then validates every level
python3 -m http.server 8000 -d dist
```

Then open <http://localhost:8000/>.

`build.sh` does not just compile: after `tsc` it runs `tools/validate.mjs`,
which walks every level with a breadth-first search and refuses to ship if any
level has no solution or is already solved at the start. The current seven
levels print as:

```
ok   1. First Shoot  4x1 buds=0 solutions=1 shortest=4
ok   2. Old Stone    5x4 buds=0 solutions=16 shortest=8
...
ok   7. Emberlight   7x6 buds=4 solutions=5 shortest=22
```

## Every interaction

- **Tap a tile** next to the root's tip to grow into it. A puff of soil rises
  and the root draws itself in.
- **Drag** across the board to grow several tiles in one gesture.
- **Long-press** anywhere on the board to listen: every sleeping bud rings
  softly, so you can see what is still waiting before you commit.
- **Swipe or arrow keys** grow one tile in that direction from the tip.
- **Undo** (or `u`) retracts one step; **Restart** (or `r`) clears the level.
- **Sound** toggles the ambient bed and the gesture voices. The choice is
  remembered.
- **Wait** sixteen seconds without touching anything and a mole trundles along
  the bedrock. It is not a puzzle; it is just there.

## Sound

All sound is synthesised with Web Audio; there are no samples. It starts muted
behind the labelled **Sound off** button in the footer (44 px, visible on phone
and desktop). Turning it on ramps the ambient bed in over about a third of a
second and plays a short confirming chime, so you know it worked.

The bed has three layers: brown noise through a low-pass for wind, a low drone
at 55 Hz and 82.5 Hz for the earth, and a high shimmer at 880 Hz and 1318.5 Hz
that only appears once buds are awake. The wind's filter opens as you go deeper,
and the drone and shimmer grow with the depth and the number of awake buds.

Each gesture has its own voice: a rising triangle for growth, a low sine thud
for a refusal, a bright bell for a waking bud, a falling pair for undo, a soft
low tone for restart, a rising fifth for a moss gate, a long C-major chord for
solving a level, and a low two-note call for the mole. A compressor on the
master bus keeps a flurry of taps from clipping.

## How it was built

The rules are pure functions in `src/rules.ts`: `refusal`, `applyMove`,
`isSolved`, `legalTargets`. Nothing in there knows about canvases or events.
`src/state.ts` wraps them in a `Game` that remembers the path and the level, and
`src/solver.ts` does a breadth-first search over the same functions. That meant
the "is this level fair?" question was answered by code rather than by playing
it by hand — and it caught two levels that were either unsolvable or already
solved on the first frame.

Rendering is integer-pixel and deterministic: every speckle and strata seam is
placed by a hash of its coordinates, so the ground never shimmers between
frames. The board is drawn once into a fixed-size canvas and scaled by CSS, so
the layout never jumps between levels. Motes, puffs and rings are time-based
and are skipped entirely under `prefers-reduced-motion`.

The audio is the part TypeScript made slightly awkward — `AudioContext` types
are precise but the graph is built imperatively, so the bed and the voices live
in their own modules and the session only calls `play('bud')`. The awkward part
was the ordering: a browser will not start audio without a gesture, so the
context is created lazily on the first gesture that asks for sound, and the
saved preference only resumes it on the next tap.

## What I'd do next

- More levels that use the moss gates as a real puzzle mechanic rather than a
  shortcut, and a level where the root must deliberately avoid a bud.
- A seed that can be planted anywhere, so the player chooses the start.
- A gentle "the root is stuck" animation that shows which neighbours are legal.
- A way to replay a solved level's path as a slow drawing, as a small reward.
