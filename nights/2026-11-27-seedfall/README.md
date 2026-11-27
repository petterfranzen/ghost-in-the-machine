# Seedfall

A moonlit orchard floor, six glades, and seeds that only move when you walk
into them. You are the small round gardener in the dark: nudge each glowing
seed into its hollow. Every glade adds one thing to think about — a wall, a
second seed, two hollows that must be filled in the right order — and the sky
warms a little as you go.

No score, no timer, no tutorial. The hint under the title says what the glade
wants; the rest is yours to find.

## Try it

Open `dist/index.html` (or run `bash build.sh` and open the result). Works on a
phone in one hand and on a desktop.

## How to play

- **Swipe** the floor to step one tile in that direction. A seed in your way is
  pushed along in front of you.
- **Tap** a tile to walk toward it, one step at a time.
- **Arrow keys / WASD** do the same on a keyboard.
- **Press and hold** the floor for a moment: every hollow glows so you can see
  where the seeds belong. Let go and it fades.
- **Undo** steps back one move; **Restart** resets the glade.
- **Sound** starts off. One tap fades in the ambient bed and plays a small
  confirming chime; the choice is remembered.

Six glades: The first hollow, Around the root, Two seeds, The long root,
Between the ferns, and Moonwake. Each one is small enough to solve in a minute
or two and asks for a slightly different idea. Moonwake wants three seeds in
three hollows and rewards you with a dawn.

## What you can touch

1. **Swipe** — steps, pushes seeds, and answers with a soft wooden tap and a
   ripple where you stood.
2. **Tap a tile** — walks toward it; the board is a direct, quiet interface.
3. **Long-press** — lights every hollow for as long as you hold, with a low
   listening tone. This is the discovery: the first glade's hint mentions it
   once, and then never again.
4. **On-screen d-pad** — the same step, for one-handed play.
5. **Undo / Restart** — separate, clearly audible answers.
6. **Sound toggle** — the whole soundscape, on or off.
7. **Idle** — leave the board alone and the sky keeps drifting; the ambient bed
   keeps breathing, so the scene never feels frozen.

Things remember each other: pushed seeds stay put, tucked seeds light their
hollow, the sky's warmth follows how many glades you've finished, and the
ambient pad opens a little with each one. Finish the last glade and the night
turns to dawn.

## Sound

All synthesised with Web Audio — oscillators, filtered noise and envelopes, no
samples:

- **Ambient bed** (three layers): a slow triangle pad at 110/164.81/220 Hz, a
  band-passed noise "air" layer that drifts like wind in the orchard, and a warm
  upper layer that opens as hollows fill. A gentle LFO breathes through the pad.
- **Step** — a short low sine blip with a quick decay, like a foot on dry leaves.
- **Blocked** — a duller, lower thud when a wall stops you.
- **Tuck** — a small rising two-note chime when a seed settles into a hollow.
- **Solve** — a three-note arpeggio that resolves; the glade's reward.
- **Listen** — a soft sustained tone while the hollows glow.
- **Undo / Restart / Next** — small, distinct blips so each action has its own
  voice.

Master gain is 0.6 into a compressor/limiter, so overlapping sounds never clip.
The AudioContext is created and resumed on the unmute tap and resumed again when
the tab becomes visible.

## Build

```bash
mise install          # node 24.22.2 + typescript 5.7.2, pinned in mise.toml
mise exec -- bash build.sh
```

`build.sh` compiles `src/*.ts` with `tsc` into `dist/app/`, copies
`index.html` and `styles.css` into `dist/`, then runs `tools/validate.mjs`,
which parses every glade and proves by breadth-first search over
`(player, seeds)` states that each one is solvable and starts unsolved. The
build fails if a glade is impossible.

`dist/` is committed: Pages serves it as-is.

## How it was built

The interesting decision was to make the game a pure, synchronous state machine
and keep everything else outside it. `src/board.ts` knows only about a grid of
walls, a list of hollows, a player index and a sorted list of seed indices; its
`step()` takes a state and a direction and returns the next state or `null`.
No canvas, no timers, no DOM. That meant the solver in `tools/validate.mjs`
could import the same module, run a BFS over states, and guarantee every glade
is solvable — the build can't ship a broken puzzle. The renderer, the session
(undo stack), the input layer and the audio all sit on top and only ever ask
the board for a new state.

TypeScript made the boundaries cheap: `Level`, `Puzzle`, `State` and `Dir` are
small types in one file, and the strict compiler caught the places where a
tile index leaked into a coordinate. The awkward part was the build: the
browser needs real `.js` extensions on relative imports even though the sources
are `.ts`, so every import is written with `.js` and `tsc` leaves it alone. That
is the one place TypeScript's module story still feels like a compromise.

The sky is a separate canvas behind the board, redrawn on resize and when a
glade is finished; the warmth parameter is just "how many glades are done",
which the same value drives into the audio bed. One number, three effects.

## What I'd do next

- A seventh glade with a seed that can only be pushed downhill on a slope.
- Seed colours that matter: two seeds that must end in matching hollows.
- A gentle "footprints" trail on the floor that fades, so you can see your route.
- More small wildlife in the background that reacts to long-presses.
