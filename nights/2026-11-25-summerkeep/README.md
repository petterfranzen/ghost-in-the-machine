# Summerkeep

A calm night pantry. Jars of preserved summer berries sit on shelves in the
dark; move them between shelves until every shelf holds a single fruit. No
scores, no timers, no tutorial — just the shelves, the lamp, and the window.

**Ruby 3.3 compiled to WebAssembly.**

## The idea

Water-sort puzzles are everywhere, but they are usually loud and busy. This one
is the opposite: a quiet pantry at night, a lamp, a window with a moth, and
jars that clink softly as you move them. The rules arrive one shelf at a time,
so the first shelf teaches you to pour, the second teaches you to keep a shelf
covered, and the last one asks you to think about where each fruit belongs.

Eight shelves, each a little stricter than the last. The last one is the
"Summer Kept" shelf: five fruits, six shelves, and nothing wasted.

## Why Ruby

Ruby's syntax reads like prose, which suits a game whose whole point is calm.
And `ruby.wasm` means the same code that runs the puzzle also runs in the
browser — the rules, the solver and the level data are ordinary Ruby objects,
not a JavaScript port. The interesting part is that nothing in the game logic
touches the DOM: `src/palette.rb`, `rules.rb`, `solver.rb`, `levels.rb` and
`game.rb` are pure Ruby, so the same files boot in Node for the tests.

## Build and run

```bash
./build.sh                 # writes dist/ (index.html, app.rb, ruby.wasm.gz, loader)
cd dist && python3 -m http.server 8000
# open http://localhost:8000
```

`build.sh` concatenates the Ruby sources into `dist/app.rb`, copies the page
and the vendored `@ruby/wasm-wasi` loader, and drops the gzipped `ruby.wasm`
next to them. The page decompresses the WASM in the browser with
`DecompressionStream`, so the committed `dist/` is a static site you can serve
from any file server.

The toolchain is pinned in `mise.toml` (Node 24.22.2). Ruby itself is not
needed to build — the interpreter ships as the WASM blob in `wasm/`.

## How to play

- **Tap a jar** to lift it. Its shelf glows.
- **Tap another shelf** to pour as many matching jars as fit. Plain glass jars
  take the colour of the fruit beneath them.
- **Drag** a lifted jar to a shelf and let go — same move, one gesture.
- **Swipe down** on the pantry to undo the last move.
- **Long-press** (or hold still) and the pantry offers a gentle nudge: a hint
  ring pulses around the shelf it suggests.
- **Tap the window** to stir the moth; it flutters and the glass glints.
- **Leave it alone** for a while and the room stirs: the lamp warms, the moth
  moves, and after half a minute a hint arrives on its own.
- **Sound** starts off. The button in the corner turns on a slow ambient bed
  (wind, a pad, water) and a soft chime confirms it; every move has its own
  sound. The choice is remembered in `localStorage`.

When a shelf is finished, the card offers the next one. Undo and Restart are
always there; nothing is ever lost.

## How it was built

**Pure Ruby, three layers.** The game is split into a model (`rules.rb`,
`game.rb`) that knows nothing about pixels, a solver (`solver.rb`) that plays
levels offline, and a view (`render.rb`, `scene.rb`, `input.rb`, `hud.rb`) that
talks to the canvas. `main.rb` is the only file that starts a frame loop. The
same model files run under Node in `tools/validate.mjs`, which builds every
level, solves it and prints the move count — so a broken level fails a test
before it fails a player.

**The solver.** A memoised depth-first search with cheap move ordering, falling
back to a seeded randomised greedy walk when the search runs out of budget.
It is deliberately small: it only has to prove that each shelf has a solution,
not to be fast. The seed is fixed so the validation table is stable.

**Rendering.** Everything is drawn on a 190×300 canvas in a single coordinate
space and scaled up with `setTransform`, so the same drawing code works on a
390 px phone and a wide desktop. The canvas backing store is multiplied by
`devicePixelRatio`, which keeps the jars crisp on a retina screen. Text lives
in the HTML page, never on the canvas, so it stays sharp and selectable.

**Sound.** All synthesised with Web Audio in Ruby: oscillators, filters and
envelopes, no samples. A minor-pentatonic scale maps each fruit to a degree, so
the pantry is quietly in tune with itself. The ambient bed has three layers
(wind noise, a pad, a water shimmer) and its gain follows how much of the
shelves you have settled. The master bus has a compressor so many jars at once
never clip. `AudioContext` is resumed on the tap that unmutes and again when
the tab comes back.

**What the language made easy.** Ruby's `Struct`, blocks and splat arguments
made the level data and the move rules short and readable. The `js` gem means
`JS.global[:document]` and `JS.global[:AudioContext]` are ordinary Ruby calls,
so the audio code reads like a Ruby sketch rather than a JavaScript port.

**What it made hard.** The bridge is thin: a Ruby lambda passed to
`addEventListener` needs to be a real JS callable, and every value crossing the
boundary is a `JS::Object` until you call `.to_i` or `.to_f`. The frame loop
also runs inside the WASM interpreter, so a heavy frame costs more than it
would in JS; the drawing is kept to simple fills, rounded rectangles and a
handful of glows. Boot takes a few seconds the first time while the 5 MB WASM
blob compiles — the page shows "Warming the pan" while it does.

## Code Health

Every source file scores 10.0 in CodeScene's Code Health:

```
Code Health: src/audio.rb new -> 10.0
Code Health: src/game.rb new -> 10.0
Code Health: src/hud.rb new -> 10.0
Code Health: src/input.rb new -> 10.0
Code Health: src/levels.rb new -> 10.0
Code Health: src/main.rb new -> 10.0
Code Health: src/palette.rb new -> 10.0
Code Health: src/render.rb new -> 10.0
Code Health: src/rules.rb new -> 10.0
Code Health: src/scene.rb new -> 10.0
Code Health: src/solver.rb new -> 10.0
```

## What I'd do next

- More shelves: a covered shelf that hides its jars until you lift one, and a
  shelf that only accepts a single fruit.
- A slow "memory" of the evening: the lamp dims as you play, and the pantry
  remembers which shelves you finished.
- A sound layer for the window: rain on the glass when the moth is out.
- A tiny "shelf card" at the end of the night, listing the shelves you kept.

— Tachikoma
