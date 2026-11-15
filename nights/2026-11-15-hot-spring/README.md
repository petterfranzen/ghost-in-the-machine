# Steam Spring

A pixel-art mountain hot spring at night, in **Dart**, compiled to JavaScript.
A macaque soaks in a stone basin while snow falls. One thumb stirs the water,
parts the steam, lights the lanterns, sweeps the sky — and, if you keep still
long enough, wakes what lives in the warm water.

Static site, no scores, no timers, no tutorial. Sound starts off.

**Wish followed:** 2026-11-02 (combine the pond with the pixel-art world, and
make a tap feel impactful while the whole stays calm) and 2026-10-30 (pixel art
with a light adventure touch: a small character, and a few things to find).

## Try it

```bash
./build.sh          # needs the Dart SDK, see mise.toml
python3 -m http.server -d dist 8000
```

Then open <http://localhost:8000/>. `dist/` is committed, so it also runs
straight from any static host (GitHub Pages serves it as it is).

There is a smoke check for the committed build — no console errors, no page
scroll, a 44 px sound button, a tap and a long press that change the picture,
and a sound toggle that is remembered:

```bash
node test/smoke.cjs        # needs playwright + its chromium
```

## The language

Dart, because it is the one language in the log's reach that ships a whole
toolchain in one download and still produces a plain static site: `dart compile
js` turns a single `web/main.dart` into one 180 KB `main.dart.js`, with no
bundler, no runtime download and no `node_modules` between me and the canvas.
Dart has not been used for a night before, and it is a genuinely different
shape of language from the last few: strongly typed and class-based, but with
sane nullability and a real standard library, and `dart:html` plus
`dart:js_interop` reach the browser directly.

## What you can do

| Gesture | What answers |
|---|---|
| **Tap the water** | A ring of ripples, a splash of droplets, a puff of steam and a plucked note tuned to where you tapped (low near the front, bright at the far edge). The monkey turns his head to look. Five unhurried taps in a row call the koi early. |
| **Tap the snow** | A soft thud, a littler spray of snow, and a mark that fades over a few seconds. |
| **Tap the monkey** | He looks up, blinks and answers with a small chirp. If snow has gathered on his crown, this shakes it off. |
| **Tap a stone lantern** | The dark window flickers and gives a small note: it is asking to be held, not tapped. |
| **Hold a stone lantern** | It lights: a bell, a warm window, and a pool of amber light on the snow. The pad in the ambient bed steps up with each one. |
| **Hold the water** | The whole spring settles: a slow deep swell, both rings spreading wide, the pool glows warm, the steam blooms, and the snow slows in the air for a moment. |
| **Hold the snow** | Packs a snow lump that stays where you put it. |
| **Drag across the water** | Your thumb stirs a wake: ripples follow it, and a stretched hush in the water noise. |
| **Drag through the steam** | The steam parts around your thumb and closes behind it. |
| **Swipe down the sky** | The snow thickens and the wind drops. |
| **Swipe up the sky** | A gust lifts the steam, thins the snow and slants it across the pool. |
| **Tap a shore stone** | Balances a pebble on it. Each pebble rings a note one step higher; a stack of seven is rewarded. |
| **Do nothing** | The scene settles: the monkey drowses, the snow gathers on his head, and after a while the warm water gives something up. |

## Things to find

- **Go still for a while** and something pale surfaces in the pool, circles
  slowly, and dives again when you touch the water beside it.
- **Light all three lanterns** and wait: a crane flies in from the right and
  perches on the far stones. It never leaves; it just watches.
- **Keep still with a lantern lit** and fireflies rise off the water.
- **Five unhurried taps** on the water (about one a second, no rush) call the
  koi far sooner than patience would.
- **Stack seven pebbles** on one shore stone.
- **Watch the sky long enough** and a star falls — rare, silent, and gone in a
  second.

## Sound

Off until you tap **Sound** in the corner (44 px, top right, on phone and
desktop). Turning it on answers at once: the ambient bed fades in inside a
third of a second and two soft bells confirm it. Everything is synthesised live
with the Web Audio API — no samples anywhere — through a gain of 0.55 into a
compressor on the master bus, so many voices at once stay calm and never clip.

- **The bed, three layers, always running while sound is on:** a brown-noise
  water murmur through a low-pass with a very slow swell; a band-passed wind
  that breathes; and a slow triangle pad whose chord steps up as the scene
  warms — one step per lantern lit, more when you hold the water or the world
  goes still.
- **Each interaction has its own voice:** tap water — a plucked sine with a
  triangle harmonic, shorter at the front, brighter at the back; splash — a
  low-passed noise burst; lantern — a three-partial bell (longer and lower the
  first time); hold the water — a deep 196 Hz bell with a wide noise swell;
  snow — a duller thud with a short pluck; gust — a noise swell that rises for a
  gust up and falls for snow pulled down; monkey — a quick rising-and-falling
  chirp; the koi surfacing — a soft 392 Hz bell and a watery hush; pebbles —
  notes climbing a whole tone each; the crane — a low 587 Hz call it repeats
  now and then.

The choice is remembered in `localStorage` (wrapped in try/catch). The context
is resumed on the tap that unmutes, and again whenever the tab comes back.

## How it was built

**One virtual pixel grid, whatever the screen.** The canvas is not drawn at
device resolution. A unit `u` is chosen so the scene is about 200 virtual pixels
tall (at least 120 columns wide), everything is drawn into a small off-screen
canvas of `width/u` by `height/u`, and that buffer is blitted once to the real
canvas with image smoothing off. On a 390 px phone that is a 130×282 scene blown
up three times; on a desktop, 360×200. Sprite sizes, the pool, hit testing and
the parallax all live in those virtual pixels, so the composition is the same
everywhere and the pixel art stays square.

**The still parts are drawn once.** The sky gradient, the moon and its halo, the
two ridges, the pines, the snow field with its drifts and grain, the stone rim
and the lanterns are rasterised into a second off-screen canvas at layout time —
including a per-column pass for the terrain. Each frame only blits that, then
draws what moves: the water (a bowl-shaped vertical ramp with lantern
reflections and a moon streak), the steam, the snow, the ripples and the
creatures. Rebuilding the background on every resize is fine; doing it every
frame would not be.

**Dart talking to Web Audio.** `dart:html` has no usable Web Audio bindings in
this SDK (its old `dart:web_audio` library is stale and its `MouseEvent` has
even hidden its own `clientX` behind `_clientX`), so the synth is declared by
hand with `dart:js_interop` extension types: `AudioContext`, its nodes, and the
`AudioParam` methods the envelopes need. The one trap worth knowing: an external
method with no declared return type is inferred as `dynamic` and rejected — write
`external void` explicitly. The other: `@JS('AudioContext')` on the extension
type, or the factory compiles to `new AudioCtx()` and every sound dies silently
with one console error and no other symptom.

**What the language made easy.** The nullability is a real help with DOM and
interop code (that `clientX` yield, `int? innerWidth`, `pointerId` all failed
loudly at compile time rather than at the first touch). Extension types over
`JSObject` are a neat way to write a small, typed audio API without a wrapper
library, and `dart compile js` is one command with no config file at all.
**What it made hard.** Dart's browser story assumes Flutter: `dart:html` is
deprecated and quietly missing members, `dart:web_audio` has not kept up with
the API, and `dart:ui` is not the same as a canvas. Going canvas-only meant
writing the pixel helpers (ellipse fills, ellipse strokes, a 1-D value noise for
the ridges) myself, which is honestly the fun part.

**Simulation.** Every gesture lands on the same small world state: ripples,
steam puffs, snow flakes, splash drops, fireflies and pebble stacks, plus a
stillness clock that drives `calm`, which drives the monkey's drowsiness, the
fireflies, the koi and the warmth of the pad. Nothing is scripted per-frame: the
snow count follows the weather, the steam follows how recently the water was
stirred, and a ripple physically pushes the steam above it.

## What I'd do next

- Give the crane somewhere to stand that is clearly *not* the water (a flat
  stone at the far edge, drawn into the rim) — it reads well now, but its feet
  are still at the waterline.
- A second spring, behind the trees, that only opens when all three lanterns
  have been lit and the snow is thick — a reason to keep sweeping the sky.
- Let the pebble stacks be *found* rather than invented: seed one or two on the
  shore that are already half-built, then let the player finish them.
- A gentle day: the palette easing from this night into a pale dawn after ten
  minutes of stillness, which would make the patience rewards land even better.

— Tachikoma
