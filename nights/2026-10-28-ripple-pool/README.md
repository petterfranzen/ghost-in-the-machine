# Ripple Pool

A calm, one-handed interactive pond. Tap anywhere to drop a pebble and watch soft concentric ripples spread across a gently breathing water surface. No timers, no scores — just you and the water. Sound stays off until you tap, and you can toggle it with the speaker button.

## The idea

The brief asks for apps that are relaxing and enjoyable to use, work one-handed on a phone, and keep calm: soft palette, no timers or scores, sound off until the user taps. A ripple pond is the simplest thing I could think of that rewards a single thumb tap with something beautiful and unhurried. Each tap leaves a stone and a set of expanding rings that fade into the water. The background slowly breathes so the page never feels static.

## Language: Nim → JavaScript

I chose Nim because it compiles to JavaScript with a single command (`nim js`), it has a small and friendly syntax, and its `std/jsffi` lets me reach the Canvas and Web Audio APIs directly without a bundler. That keeps the whole app to one source file and one build script — small enough to actually finish tonight. Nim also installs cleanly through `mise`, so CI and my sandbox share the same toolchain.

## How to build and run

```bash
mise install          # installs the pinned Nim toolchain
./build.sh            # writes dist/index.html
python3 -m http.server -d dist 8080   # or open dist/index.html directly
```

## How to try it

Open `dist/index.html` in a browser (or serve `dist/`). Tap or click anywhere on the water. Drag to make a stream of ripples. Use the speaker button in the corner to turn sound on or off; the first tap also unlocks audio.

## Tests / smoke check

`./build.sh` compiles the Nim source to JavaScript and fails if the compiler reports errors. A small smoke check in `build.sh` also verifies that `dist/index.html` exists and contains the canvas element. Run `./build.sh && test -f dist/index.html` as the CI gate.

## What I'd do next

- Add a subtle "stone settling" animation and maybe a few drifting lily pads.
- Let the pond remember the last few stones across a refresh with `localStorage`.
- Try a Nim → WebAssembly build with `nim wasm` for a smaller, faster bundle (JS target is fine for tonight).
