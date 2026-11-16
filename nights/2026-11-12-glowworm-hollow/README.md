# Glowworm Hollow

A dark cave you wake with one thumb. Glow-worms sleep along the ceiling, and
the only light in the place is the light you cause: warm and cold pools of it
spread over wet rock, down onto a still pool, until the ceiling shows what has
been carved there.

Calm, one-handed, no score, no timer, nothing to lose. Sound is off until you
ask for it.

**Language:** C, compiled to freestanding WebAssembly (wasm32, no libc, no
allocator) with clang from wasi-sdk. All the state, the rules, the light and the
framebuffer live in the module; the page only taps, steps and blits.

## Build and run

```bash
mise install          # node + clang/wasm-ld for wasm32
mise exec -- bash build.sh
# then open dist/index.html, or serve it if you want ?seed=
python3 -m http.server 8099 --directory dist
```

`build.sh` compiles `src/sim.c`, base64s the module into `dist/app.js` with
`tools/embed.cjs`, copies `web/index.html`, and runs the checks. `dist/` is
committed: the pages site serves it as it is, and CI rebuilds it to check.

Checks (no browser, no packages):

```bash
node tools/smoke.cjs          # the module: seeds, gestures, discoveries, frame budget
node tools/frame-png.cjs /tmp/f.png --w 195 --h 422 --seed 7 --tap 0.3,0.36
```

With a browser (one at a time):

```bash
(cd dist && python3 -m http.server 8099 --bind 127.0.0.1 &)
NODE_PATH=/usr/local/lib/node_modules flock /tmp/browser.lock \
  timeout 180 node tools/check.cjs http://localhost:8099 /tmp
```

The cave is generated from a seed: a fresh one each visit, `index.html?seed=7`
for a repeatable one.

## What you can do with it

| gesture | what answers |
| --- | --- |
| **tap a worm** | it wakes: warm light spreads over the rock, one soft note. Tap it again and it rests warm — it never goes out |
| **tap anywhere dark** | a small knock, dust, and sometimes a drip falls from the ceiling and rings the water below |
| **drag a thumb along the ceiling** | your warmth wakes the worms it passes over, one note each, and the rock keeps a fading smudge of the path |
| **hold a lit worm (~1 s)** | it blooms and holds full light for a few seconds |
| **swipe across the air** | a breath of air: every worm sways away from your hand and dims a little, the dust drifts, the pool ripples |
| **tap the water** | rings spread; the reflections break up |
| **stand still** | the cave stills, the worms settle into a slow breathing, and after a while one dim worm flickers, as if something were waking |

### Things to find

1. **The elder.** Light four or more worms, then *hold* one of them. Something
   much older wakes on the right wall and the whole cave brightens.
2. **The carving.** Once the elder is awake, a moth cut into the ceiling rock
   begins to glow — it is drawn there all along, and only light shows it. It is
   the only thing in the cave that glows teal.
3. **The pale skater.** Tap the water three times within a few seconds and
   something pale skates across the surface, leaving a wake.
4. **The constellation.** Leave the cave alone for about forty seconds with
   almost nothing lit, and the worms light up one by one into a pattern, hold it
   for a while, then settle back.

The hint after ~20 s of stillness (a single dim worm flickering twice) is the
only nudge; there is no tutorial and no overlay.

## How it was built

**Why C.** The shortlist for tonight was C (freestanding to wasm), Lua on
Fengari, and OCaml via js_of_ocaml. Lua and OCaml both need a heavy toolchain
and a JS runtime in `dist/`; C to wasm needs one compiler, produces a 32 KB
module, and let me keep the whole simulation — including the framebuffer — in
the module. wasi-sdk's clang targets `wasm32` with `-nostdlib`, and the whole
build is one `clang` line plus a `node` step. `mise` installs the compiler from
a pinned tarball, so CI builds the same binary.

**A pixel framebuffer with no libc.** `src/sim.c` keeps a `MAXW x MAXH`
colour-index buffer, a light buffer at quarter resolution, and an RGBA buffer
the page blits. Without libc there is no `memcpy`/`memset`/`sinf`: the build
needs `-ffreestanding -fno-builtin` (otherwise the optimiser turns the copy
loops into calls to functions that do not exist) and the module carries its own
`fsin` (range-reduce, then a 7th-order series). The buffer's row pitch is
`MAXW`, not the viewport width, so both the host and the tools copy row by row —
reading it flat is the classic way to get a mostly-garbage frame that still
passes a naive smoke test.

**Light is the game.** Nothing in the cave is a sprite with a baked colour: the
whole frame is shaded through a lookup table `[palette entry][32 light levels]
[warm|cool]`, so the *same* drawing code paints lit and unlit rock, and anything
I want hidden is simply drawn in the dark and multiplied by the light that
reaches it. Build a quarter-resolution light buffer (ambient cool half-light,
the pool's own faint glow, then every worm added with its own falloff), sample
it bilinearly, blend the warm and cool tints by the light's own temperature, and
the cave lights itself. Two things I had to fix by looking at frames: a worm's
light with a hard radius leaves a visible ring where it stops, so the falloff is
`1/(1+4.6 d²)` with no cutoff; and switching between the warm and cool lookup
sets at a threshold drew a hard oval across the cave, so the two are blended per
pixel. Circles around their circumference rather than their bounding box, and
the light buffer at quarter resolution, are what keep a 60 fps frame at ~5 ms
for a 195x422 phone frame.

**Sound is Web Audio only.** Three layers run while sound is on: a two-oscillator
cave drone through a low-pass with a very slow LFO, filtered noise for water
whose gain follows how many worms are lit, and a slow pad that opens up when the
elder wakes. Every gesture has its own voice (a pluck, a chain of notes, a
water plop, a breath, a bell for the carving), through a master gain at 0.62 into
a compressor so nothing clips when the cave is busy. The `AudioContext` is not
created until the sound button is pressed — a context created on load can be
resumed by a later tap and would sound on the first touch — and the choice is
remembered in `localStorage`.

**The page is boring on purpose.** It sizes the canvas so the scene fills the
viewport at an integer pixel scale (`ceil(vw/s) x ceil(vh/s)`, `s` from 2 to 6),
which is why a phone gets a tall cave and a desktop a wide cavern; feeds pointer
events (floats, never rounded) to the module; blits `putImageData`; drains the
module's event queue for sound and announcements; and does nothing else.

## Accessibility

- The canvas is a `role="button"` with `tabindex="0"`: Enter or Space wakes the
  nearest worm, and a `aria-live="polite"` region says what happened ("The elder
  worm wakes, and the whole cave brightens").
- `prefers-reduced-motion: reduce` scales every movement to 0.35 in the module
  (glow ramps, ring lifetime, sway, mote drift) and disables the CSS transitions;
  the gesture still answers. It is read from a JS media query *and* declared as a
  CSS rule beside the transitions.
- The sound button is a 44 px target, 16 px text, `aria-pressed` honest, and the
  page has no text smaller than 16 px. Nothing scrolls, at 390x844 or 1280x800.

## What I would do next

- **A second chamber.** The cave is one room; a passage behind the carving, walked
  with the same thumb, would give the light a place to travel.
- **Worms that answer each other.** Right now a worm's note is its own; letting
  neighbours answer after a beat would make a chorus you could conduct.
- **A slower tide.** The pool is static; a level that rises and falls over minutes
  would change what the water reflects, and would let the light ride on it.
- **Sound for the elder's aftermath.** The tears at the right edge are the only
  thing not driven by light yet.
