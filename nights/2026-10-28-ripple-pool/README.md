# Ripple Pool

A calm, one-handed pond you can tap. Every tap drops a small stone and sends soft
concentric rings across a slowly breathing water surface. No timers, no scores,
no goals — just you and the water for as long as you want to stay.

## The idea

The brief asks for apps that are relaxing and enjoyable, work one-handed on a
phone, and stay calm: soft palette, no timers or scores, sound off until the user
asks for it. A ripple pond is the smallest thing I could think of that rewards a
single thumb tap with something beautiful and unhurried. The background slowly
breathes so the page never feels frozen, and the rings fade at their own pace.

## Language: Nim → JavaScript

I picked Nim because it compiles straight to JavaScript with one command
(`nim js`), its syntax is small enough to read in one sitting, and `std/jsffi`
lets me call the Canvas 2D and Web Audio APIs directly without a bundler or a
node_modules tree. The whole app is one source file, one HTML shell and one
build script — small enough to actually finish tonight. Nim also installs
cleanly through `mise`, so CI and my sandbox share the same toolchain.

## How to build and run

```bash
mise install          # installs the pinned Nim 2.2.12 toolchain
./build.sh            # compiles src/main.nim -> dist/app.js, checks dist/
python3 -m http.server -d dist 8080   # or just open dist/index.html
```

`build.sh` writes `dist/app.js` and leaves `dist/index.html` in place, so the
static site in `dist/` is exactly what Pages publishes. Both files are committed.

## How to try it

Open `dist/index.html` in a browser (serving `dist/` over http also works).
Tap or click anywhere on the water to drop a stone and watch the rings spread.
The hint fades after the first tap or after a few seconds. The speaker button in
the bottom-right corner toggles sound; it starts muted. The first tap unlocks the
audio context, and turning sound on gives each stone a soft, pitch-shifted plink.
The layout is full-screen and touch-friendly, so it works one-handed on a phone.

## Tests / smoke check

`./build.sh` fails if the Nim compiler reports an error, then checks that
`dist/index.html` and `dist/app.js` exist, that the HTML still contains the
canvas element, and that the compiled JS contains the canvas `getContext` call.
That is the CI gate: `./build.sh`.

I also executed the compiled app in Node against a stub DOM/Canvas/AudioContext
harness to catch runtime faults a compile-only check misses. That check matters:
Nim string literals assigned straight to a JS property compile to byte arrays, so
`ctx.fillStyle = "rgba(...)"` silently shipped an invalid colour and nothing was
painted. The app now sets colours and labels through small `{.importjs.}`
helpers that take `cstring`, so the emitted JS contains real strings. The harness
confirms valid colours, the speaker label toggling, and a plink firing only after
sound is switched on. The harness lives outside the repo; `build.sh` stays the CI
gate.

I could not capture a screenshot in this sandbox — the browser automation image
here has no desktop stack (no Xvnc/xfwm4), so a real page render was not
possible. The app is a dark blue pond with a soft central glow, pale blue rings,
and small stones where you tap. If you want a screenshot for the next night, I
can commit one from a machine with a display.

## What I'd do next

- Add a small "stone settling" moment and a few drifting lily pads.
- Remember the last handful of stones across a refresh with `localStorage`.
- Try Nim's WebAssembly target (`nim wasm`) for a smaller, faster bundle; the JS
  target was the safe, finished choice for tonight.
