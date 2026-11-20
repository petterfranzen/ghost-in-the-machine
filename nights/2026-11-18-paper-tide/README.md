# Paper Tide — a paper boat on a rainy night gutter

A small folded paper boat drifts down a night gutter. You have one thumb and no
instructions: touch the water and it answers, the boat leans into the current,
and the street slowly settles into its own quiet weather.

Built in **Java, compiled to JavaScript with [TeaVM](https://teavm.org)** — one
hand-written pixel renderer and one hand-written Web Audio synth, no engine, no
framework, no images.

## Try it

Open `dist/index.html` in a browser. It works one-handed on a phone and fills a
desktop window without scrolling. Sound starts muted; press **Sound off** in the
top corner (44 px, always visible) and the ambient bed fades in within half a
second with a short confirming chime. Your choice is remembered.

## What you can do

- **Tap the water** — a ring spreads, the boat feels the wave and turns, a plip.
- **Press and hold** — the water gives under your thumb and settles slowly; the
  boat rocks and the surface dimples.
- **Drag** — you push the water along with you; the boat is carried and the
  leaves travel with the current.
- **Flick** — a quick swipe thickens the rain for a moment and quickens the
  current; the boat surges forward and the swell rises.
- **Tap a leaf** — it spins and drifts into the current.
- **Hold the boat** — a folded flap slowly lifts, and something small is drawn
  inside it.
- **Wait** — the rain finds its own rhythm, the lamp burns brighter as the
  evening settles, and if you leave the water still long enough the gutter
  offers you something else entirely.

### The gentle game

Paper lanterns float down the gutter on the current. Your boat gathers them as
it drifts past — each one settles onto the water behind it and joins the string
trailing from the stern, so you can see at a glance how the run is going. The
small lamp-and-number in the top-left corner is the same count, readable at a
distance.

Steer with the water, not against it: a tap beside the boat nudges it toward
that side, a drag carries it along with your thumb, a flick pushes it ahead in
the current. Nothing is timed and nothing can be failed — if the boat misses a
lantern, it simply drifts on. A run ends when the boat reaches the grate at the
drain: it slips under and the tally is banked ("That boat carried 3 lanterns.
Best 7."), then a fresh boat is folded at the top of the gutter and the evening
continues. The best run is kept in local storage, so it survives a reload.

Each lantern caught plays a soft rising chime over the rain, and the string
behind the boat glows a little brighter for a moment. Reaching the grate plays a
low, contented settle — the end of a run, not a failure.

## How to build

Requires a JDK 21 and Maven (pinned in `mise.toml`; `mise install` then
`mise exec -- ./build.sh`).

```bash
./build.sh          # compiles Java -> target/web/app.js, assembles dist/
```

`build.sh` writes `dist/index.html` and `dist/app.js`; `dist/` is committed so
Pages can serve it as-is. `tools/check.cjs` is a Playwright playtest that drives
the phone and desktop viewports, taps through the gestures, checks the sound
button and the local storage, and saves screenshots.

## How it was built

The interesting part is the pixel surface. TeaVM marshals a Java `int[]` into
JavaScript as an opaque `JavaArray`, so you cannot hand it to `ImageData`
directly. The fix is `org.teavm.jso.typedarrays.Uint32Array` over the canvas's
`ImageData.data`: the renderer writes one 32-bit ARGB value per pixel into a
typed array that JavaScript already understands, and `putImageData` blits the
whole frame. Everything — water, stone, the boat, the lantern — is drawn by hand
into a 180×320 buffer and scaled up by an integer factor so no row is stretched
twice. The water is a gradient ramp indexed by a moving band plus ordered
dither, which is what keeps a six-colour palette from banding.

TeaVM made the browser side easy: `@JSBody` for the few calls it does not wrap
(the `AudioContext` constructor, `ImageData`), `@JSFunctor` for animation frames
and pointer events, and plain Java for the simulation. The hard part is the same
as any WebAssembly-style target: nothing is a browser global unless you say so,
so all DOM and audio access lives in one `Bridge` class and the rest of the code
is ordinary Java that could be stepped in a JVM.

Sound is synthesised with oscillators, noise and filters — no samples. A
table-driven voice list describes each cue (shape, start and end frequency,
duration, gain, filter), and a compressor on the master bus keeps a flurry of
plips from clipping. The ambient bed is three layers: filtered noise for rain, a
slow detuned pad, and a warm hum that follows the lamp.

## What I'd do next

More weather: a fog that creeps in when you are still for a long time, and a
second boat that arrives from the drain if you keep the water calm. Also a
proper "morning" state — the lamp going out and the gutter turning pale — as a
slow reward for a long session.
