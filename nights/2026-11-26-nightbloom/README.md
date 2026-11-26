# Nightbloom

A quiet night meadow of flowers. Tap one and it opens — along with its
neighbours. Open every flower in the meadow and the next one appears.

## The idea

Eight small meadows at night, each a grid of buds. Every tap is a small
bargain: the flower you touch opens, and so do the flowers around it. Some
kinds reach far (reeds), some reach in a cross (clover), some only touch
their corners (fern), and bells open a ring around themselves. The puzzle is
to find the taps that leave nothing closed.

No timers, no scores, no streaks. The meadow only wants to be walked.

## The language

TypeScript, compiled to plain ES modules with `tsc` and served as static
files. No framework and no bundler: the whole app is a handful of small
modules, and the build is one `tsc` run plus a copy. TypeScript earned its
place here because the board rules, the level tables and the canvas scene all
pass structured data between each other, and the compiler caught several
mismatches while the flowers were still being drawn.

## Build and run

```bash
mise exec -- bash build.sh          # writes dist/
python3 -m http.server 8000 -d dist # then open http://localhost:8000
```

`build.sh` type-checks, compiles, copies the page and styles, and runs
`tools/validate.mjs`, which proves every meadow starts unsolved and that its
recorded solution opens all of it.

## Every interaction

- **Tap a flower** — it opens and its neighbours open or close with it. A soft
  chime answers, and a ring of light shows which flowers were touched.
- **Long-press a flower** (about a third of a second) — a dashed outline shows
  the neighbours that tap would reach, before you commit. Let go and nothing
  happens.
- **Undo** — steps back one tap.
- **Restart** — puts the meadow back to its opening state.
- **Next meadow** — appears when a meadow is fully open.
- **Sound** — starts muted. The button turns on a wind bed and a slow pad, and
  every interaction after that has its own sound. The choice is remembered.
- **Stay still** — after about twenty seconds the open flowers attract
  fireflies; stay longer and more arrive.

## The sounds

All of it is synthesised in the browser with Web Audio — no files, no samples.

- **Wind bed** — filtered noise, always under everything, a little louder as the
  meadow opens.
- **Slow pad** — three detuned oscillators behind a lowpass; its filter opens as
  more flowers open, so the meadow sounds brighter as you get closer.
- **Tap** — a 540 Hz sine blip, 0.2 s.
- **Bloom** — 660 Hz triangle then 990 Hz sine, a fifth apart, so opening a
  flower sounds like a small rise.
- **Undo** — a 300 Hz sine, falling back.
- **Next meadow** — 392 Hz then 523 Hz, a soft step up.
- **Meadow solved** — 523, 659, 784 Hz, a slow arpeggio.
- **Fireflies** — a high, quiet shimmer when the idle meadow wakes.

Turning sound on plays a short chime at once and fades the bed in over about a
tenth of a second. A compressor sits on the master bus so many flowers at once
never clip.

## How it was built

The board is a small pure model (`board.ts`, `session.ts`): a grid of cells,
a tap function that flips the target set, and an undo stack. The canvas never
owns state; it reads the model each frame and eases each flower's bloom from
0 to 1, so opening feels like growth rather than a swap.

The levels are generated offline rather than hand-drawn. `levels.ts` holds a
seed and a target pattern per meadow; `tools/validate.mjs` runs the solver
backwards from the solved board to find a tap sequence, then replays it to
check the level is honest. The same run prints the tap count, so a meadow that
is too easy or too fiddly is visible in the build log.

The scene is drawn at 64 px per cell and scaled by CSS, which keeps the
geometry simple on both a phone and a desktop. The background is a second
canvas: a gradient sky, grass blades that sway on a sine, and pollen drifting
upward. Sound is synthesised with Web Audio — filtered noise for wind, three
detuned sines for the pad, and short oscillator envelopes for the chimes —
behind a compressor so many flowers opening at once never clip.

## What I'd do next

- A ninth meadow that changes the rule instead of the size: flowers that close
  their neighbours instead of opening them.
- A gentle hint after a long pause: dim one flower that is wrong in the current
  position.
- More kinds, and a meadow where two kinds share a cell.
- A way to revisit a solved meadow without restarting the whole walk.
