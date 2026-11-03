# Pebble Pond

A pond at dusk, seen from above in chunky pixel art. One thumb, one gesture: tap
anywhere and a pebble drops. It goes *plop* — a bloom of light opens where it
breaks the surface, three rings spread out one after another and fade, and the
whole scene gives a little settle and comes back to rest. The koi turn towards
it, glide over and circle the splash for a while, then drift off again. Tap the
moss instead and you get a puff of dust and a duller sound, no rings. Nothing
counts, nothing chases you, nothing runs out. The pond never gets busy; it just
answers you and goes still.

![The pond, desktop](https://raw.githubusercontent.com/petterfranzen/ghost-in-the-machine/shots/night-2026-11-03-pebble-pond/desktop.png)

![A pebble landing, on a 390 px phone](https://raw.githubusercontent.com/petterfranzen/ghost-in-the-machine/shots/night-2026-11-03-pebble-pond/phone.png)

## The idea, and which wish it follows

Petter's wish of 2026-11-02: *combine Koi Drift's pond with Lantern Moss's
pixel-art world, keep going in that direction, and make a tap feel impactful —
a soft pulse or bloom, ripples, a small gentle sound, maybe a slight settle of
the whole scene — while everything stays calm, slow and soft, fading gradually.*

So this is the pond from Koi Drift, painted as the world from Lantern Moss: a
mossy bank you can see the edge of, a stone lantern on it, fireflies along the
shore, reeds and a few pale blooms in the moss, and water that is a colour
rather than a hole. The tap is the whole point this time, so the pebble answers
in five small ways at once, and all five fade on their own:

1. a warm **bloom** of light where it breaks the surface, gone in a second and a
   half (this is your "soft pulse");
2. **three rings**, staggered a fifth of a second apart, each slower and fainter
   than the last, spreading for three to five seconds;
3. a little **crown of spray**, and the pebble itself sinking and dimming;
4. the whole **scene settles** — a two-pixel give, twice, damped out in about a
   second, shore and all — and the **lantern lifts** a little brighter, as if the
   pond had answered it;
5. a soft **sound**, and no more than a soft sound: a low sine falling from 300
   to 120 Hz through a lowpass, with one short filtered noise droplet on top, and
   a whisper of a high bell a beat behind. On the moss it is a duller, shorter
   noise burst instead. Sound stays silent until you tap, and the small button in
   the corner turns it off.

The koi are why it isn't just a ripple toy: a pebble *interests* them. Every koi
within reach turns and swims over — noticeably faster, because they are going
somewhere now — circles the splash for three to seven seconds, and then goes back
to its wandering. They curve rather than pivot, keep to the water on their own,
and their bodies undulate faster the faster they swim.

## Language: Rust 1.99.1, compiled to WebAssembly

The log already has Nim, Haxe, Elm, Gleam and Zig, so Rust is new here. The whole
pond is one Rust crate compiled straight to `wasm32-unknown-unknown`: no
`wasm-bindgen`, no bundler, no `node_modules`, no runtime dependencies. The
module has **no imports at all** — the host instantiates it with an empty import
object — and it owns everything including the pixels. `src/app.js` only
instantiates it, turns a pointer press into `tap(x, y)`, calls `frame(dt)` once
per animation frame, blits the returned 320×240 framebuffer, and makes the
sounds.

Why I like Rust for this: the interesting part of a pond is a lot of small
arithmetic over a lot of small creatures, and Rust lets me write that as plain
data (`src/world.rs` is one flat `f32` array — 409 floats — with named offsets,
so the host, the smoke test and the unit tests all read the same numbers) and
then also write the *renderer* in the same language and measure it. The frame
budget was the real design constraint: the first honest version took **30 ms per
frame**, which is a stuttering phone. Rewriting the background to paint two
pixels at a time with direct byte stores instead of blending, replacing a
per-pixel `powf` with a smoothstep, and walking ripple rings around the circle
instead of over their bounding boxes brought it to **4.8 ms**. Having the
profiler and the game in one language is what made that an afternoon rather than
a guess.

Two things I'm honestly unsure about on the Rust side:

- **`vignette` and `moss_color` need real opinions, not defaults.** They are a
  hand-tuned curve each; I tuned them by looking at frames, which is not a
  method.
- **`std` on `wasm32-unknown-unknown`.** I use `Vec` once, at boot, for the
  framebuffer, and `f32::atan2`/`exp`/`sqrt` from `std`. That ties the build to
  the standard library for wasm — fine today, and the module is still 92 KB, but
  a `no_std` rewrite with a hand-rolled sine table (which I already have, for the
  inner loops) would make it smaller and utterly portable. I kept `std` because
  the *rules* being expressive mattered more for one night than the last 40 KB.

## Build and run

Requires [mise](https://mise.jdx.dev) — the repo's nights all pin their tools
this way. Then:

```sh
cd nights/2026-11-03-pebble-pond
mise install       # installs Rust 1.99.1 from mise.toml (and rustup's wasm target)
./build.sh         # unit tests, then rustc -> .build/pond.wasm, embedded into dist/
open dist/index.html   # or: python3 -m http.server -d dist
```

`build.sh` is the whole pipeline: it runs the unit tests, makes sure the
`wasm32-unknown-unknown` target is installed, compiles with `-C opt-level=3 -C
lto`, embeds the module into `dist/pond.wasm.js` as base64 (so the page works
from `file://` with no server and no fetch — which is also what makes the
headless checks easy), copies `src/index.html` and `src/app.js`, and runs the
smoke check. Two runs of it produce byte-identical output.

`dist/` is committed because Pages publishes it as-is; CI runs the same script to
check the committed build still matches its source.

## Checks

Three layers, all of them run before this PR:

- **`cargo`-less unit tests** — `rustc --test src/lib.rs` (run for you by
  `./build.sh`), 10 tests over the pond's rules: that it opens with four koi in
  the water and fireflies only on the moss; that a pebble on the water makes
  three rings, lifts the lantern and calls a koi; that a pebble on the moss makes
  none; that two taps in the same instant are still one pebble; that ripples die
  and the water goes still; that a koi circles and then goes back to wandering;
  that no koi can leave the pond over half a minute of tapping; that every number
  stays finite after 3,000 steps; that fireflies never drift out over the water.
- **`tools/smoke.mjs`** — `node tools/smoke.mjs`, no browser: it loads the real
  `.wasm`, checks the signature, plays the pebbles, walks a koi to its splash,
  waits for the water to go still, and asserts every pixel is opaque and every
  number finite. It also **times 600 frames** and fails above 16 ms — the budget
  that keeps a phone at 60 fps. (It reads 4.8 ms here.)
- **`check.js`** — Playwright, a real 390×844 phone with touch: it taps five
  places, checks the taps registered, that the moss tap is duller, that a koi
  turned, that the canvas is really painting (435 distinct colours in a sampled
  slice), that the caption changed, and that there is no console error, no failed
  request and no sideways scroll.

`tools/frame.mjs` + `tools/raw2png.py` are how the art got looked at without a
browser: they render a frame headlessly and wrap the raw RGBA into a PNG
(`python3 tools/raw2png.py .build/f-tap.raw /tmp/frame.png 320 240`). That is the
cheapest way to iterate on a palette, and it caught two real bugs — a framebuffer
whose alpha channel was never set (an invisible canvas with a "clean" console)
and a firefly drifting out over the water.

## What I'm unsure of

- **The settle.** A two-pixel give of the whole scene is the riskiest part of the
  whole thing: it is the difference between "the pond answered" and "the page
  jolted". It is damped twice and gone in a second, and it felt calm in the
  smoke run, but I could only feel it through a screenshot, not under my thumb.
  If it reads as a jolt, the cheapest fix is halving `2.1` in `draw_scene`.
- **The rings are geometric.** They are drawn as chains of 2×2 dots, so at
  close range a big ring can look slightly dotted rather than liquid. I liked it
  (it is honest pixel art) but it is a taste call.
- **Koi attention is a radius, not a line of sight.** Every koi within 150 px of
  a splash turns, including one on the far side of a lily pad. Cheaper and
  calmer than anything cleverer, but it does mean the whole pond sometimes turns
  at once.
- **The moss is still.** Its texture is static by design (only the water, the
  koi, the light and the fireflies move), which keeps the animation budget where
  it matters — but a still bank on a dark screen can read as flat.
- **Sound is four synthesised sounds and no ambient bed.** No music, no drones.
  It is the piece I have the least confidence in, because I cannot hear it here.

## What I'd do next

- **A koi that leaves a wake.** A slow, fading V behind a swimming koi would tie
  the fish into the water, which is the one place where the pond still looks like
  two layers rather than one.
- **Food, and a reason to come back.** Koi Drift's food drifting down is the
  obvious next gesture: press and hold to scatter a little, and let the koi
  gather slowly instead of all at once.
- **A second bank, or a season.** The whole world is a palette plus a shape
  function; a night pond, or an autumn one with drifting leaves, is mostly data.
- **A proper drop.** Right now a pebble blooms where your thumb was. Having it
  fall from above the frame (with a little shadow crossing the water first) would
  make the impact land harder without adding a single loud element.
- **`no_std`.** See above: a hand-rolled sine table already exists for the inner
  loops, and dropping `std` would take the module under 40 KB and make the whole
  thing portable to any freestanding host.

— Tachikoma 3
