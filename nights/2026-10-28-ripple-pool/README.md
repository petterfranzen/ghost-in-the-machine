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
./build.sh            # compiles src/main.nim -> dist/app.js, copies the helper in
python3 -m http.server -d dist 8080   # then open http://localhost:8080
```

`build.sh` writes `dist/app.js`, copies `dist/index.html` across and copies the
shared helper `nights/_shared/interact.js` to `dist/interact.js`, so the folder
Pages publishes is complete on its own. All three files are committed. Serve it
over http (not `file://`): the page imports the helper as an ES module, and a
browser refuses to load modules from `file://`.

## How to try it

Serve `dist/` and open it in a browser. Tap the water to drop a stone and watch
the rings spread; rest a finger on the water instead and it only blooms softly
under your touch, then fades — a nudge, not a splash. Past a tap, the "tap the
water" hint breathes back in after twelve quiet seconds (three times at most),
and the next touch fades it out. The speaker button toggles sound; it starts
muted, and the first tap unlocks the audio context. The ⛶ button asks the browser
for real full screen where the platform offers it (iOS Safari does not, so there
the page just fills the viewport), and the layout is full-screen and
one-handed-friendly on a phone either way.

## Shared interaction helper

Input comes through `nights/_shared/interact.js`, the small ES module every night
is asked to share: `onTap` for the stone (pointer events, no 300 ms delay,
multi-touch and drags ignored), `nudge` for the gentle bloom, `idleHint` for the
hint after a quiet spell, and `fullscreenOnMobile` for the 100dvh fill plus the
Fullscreen API where it exists. Reduced motion is respected: the hint appears
without a fade and `nudge` answers in one static step. `build.sh` copies the
helper into `dist/` so the night still ships nothing of its own outside its
folder; see [`nights/_shared/README.md`](../_shared/README.md). Nim keeps the
simulation, and the page hands it a tap through an exported `rippleTap`.

## Tests / smoke check

`./build.sh` fails if the Nim compiler reports an error, then checks that
`dist/index.html`, `dist/app.js` and the copied `dist/interact.js` exist, that
the HTML still contains the canvas element and imports the helper, and that the
compiled JS contains the canvas `getContext` call.
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

The retrofit was rendered in a headless browser: a dark blue pond with a soft
central glow, pale blue rings, and a small stone where you tap. Desktop and
phone screenshots, plus a tap-through on the phone viewport, are attached to the
retrofit PR.

## What I'd do next

- Add a small "stone settling" moment and a few drifting lily pads.
- Remember the last handful of stones across a refresh with `localStorage`.
- Try Nim's WebAssembly target (`nim wasm`) for a smaller, faster bundle; the JS
  target was the safe, finished choice for tonight.
