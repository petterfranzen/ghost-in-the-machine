# Snow Garden

A quiet walled garden under a slow night snowfall. Tap the snow and a small
walker trudges to that spot, leaving footprints that fill in behind them; the
whole scene gives a little as they set off, and a soft bloom of snow lifts where
you touched. Drag a thumb through the snow and it draws a groove that the snow
settles back over. Nothing is timed, counted or lost — the garden only ever gets
quieter.

**Petter's wish followed:** the 2026-11-02 direction — keep the pixel-art world
and the calm, one-handed feel, and make a tap feel impactful (a soft bloom, a
small gentle sound, a slight settle of the whole scene) while everything fades
gradually. It is the winter-garden cousin of that wish: same pixel art and same
gentle give, a new place to stand in. The pond is left for another night.

It is also the backlog's 2026-11-08 idea *"a snowy garden: footprints appear
where you walk and fill in slowly; a fox crosses if you stand still"*. The
backlog pairs that idea with C++; this sandbox has no C++-to-WebAssembly
toolchain (no clang, no emscripten), so I built it in Rust, which the brief lists
as a good fit and which no night has used yet.

Petter, 10 Nov: *"Nice! More interaction to make it more fun!"* — so four more
things answer a thumb now: **draw in the snow**, **shake the tree**, **roll a
snowball into a snowman**, and **swipe the sky for a heavier fall**.

## The idea

A night garden, drawn in a phosphor-green palette from the Section 9 tokens:
sky, hedge, a bare tree, a stone bench, a gate, one amber lamp. Everything
that moves is simulation, not animation:

- **The walk.** A tap sets a target; the walker steps toward it at about
  fifteen world-pixels a second, bobbing, and leaves a footprint every five
  pixels. A footprint starts dark, greys out and is filled in by the snow after
  about twenty-six seconds.
- **The give.** A tap drives a damped spring (`v += (-42·x - 9·v)·dt`); the host
  turns it into a two-pixel `translateY` on the canvas that peaks and settles in
  about half a second. That is the whole-scene response carried over from Koi
  Drift and Dune Drift.
- **The bloom.** Sixteen lifted snowflakes leave the ground where you touched,
  rise, and fall back.
- **The fox.** If the garden is untouched for fifteen seconds — or at once, if
  you tap the bench — a fox walks in from one edge, pauses in the middle for
  three seconds, and leaves. Whichever edge he comes from he walks nose-first,
  mirrored when he crosses right to left. He is announced politely, never
  scored.
- **The lantern.** A small target with a generous box: tap the post and it
  lights, throws a warm pool on the snow and warms the flakes passing through
  it; tap again and it dims.
- **The drawing.** Drag through the snow and every few pixels of travel leaves a
  mark; the marks form a groove, a wave, a word. Like a footprint, each mark
  greys out and is drawn back over by the snow after eighteen seconds. The
  strokes are interpolated, so a fast flick still draws a line rather than
  dots — and a drag never moves the walker.
- **The tree.** Tap the branches and a soft puff of snow comes off them. The
  bird who sits on the tree flutters across to the gate's snow cap, and a second
  tap on the tree brings him home. Tapping him mid-flight only shakes the tree
  again; he is never startled away.
- **The snowball.** Press and hold: a ball gathers under your thumb, growing for
  about a second, lifting a puff of snow as it turns. Let go and it becomes a
  small snowman where it stands; drag while holding and the ball rolls with you.
  Three is all the garden keeps — a fourth rolls the oldest back into the snow.
  Tap a snowman and he topples over, then settles back into the snow over about
  nine seconds.
- **The flurry.** Swipe across the sky and the fall thickens for a few seconds:
  sixty more flakes join the ninety, and the wind picks up. It calms down again
  by itself, with no way to leave it switched on.

Eight optional discoveries, no tutorial: the lantern, the bench, the fox that
comes to patience, the footprints filling in, the drawn groove, the bird, the
snowmen and the flurry. A one-line hint appears after twelve seconds of
stillness, and a second and third later; never more than that.

## The language

**Rust 1.99.1**, compiled straight to WebAssembly with `rustc` — no cargo, no
`wasm-bindgen`, no bundler, no imports. The module is a single 84 KB `.wasm`
carrying the whole simulation and a fixed `180 × 280` colour-index frame buffer;
the host only sizes it, taps it, steps it and blits the frame. The wasm is
base64'd into `dist/app.js`, so the published page makes no request at all.

Why Rust: it was the one high-confidence path to a pixel-art canvas in this
sandbox — one toolchain, one compile, `std`'s `sin`/`sqrt` with no runtime, and a
frame budget with room to spare (1.0 ms for a step plus a render, measured over
600 frames, with the flurry's full 150 flakes). It also let me keep the fade
maths and the drawing in one language.

## Build and run

```bash
cd nights/2026-11-10-snow-garden
bash build.sh            # compiles, smoke-tests, writes dist/
python3 -m http.server -d dist 8080   # or just open dist/index.html
```

`build.sh` runs `rustc` (adding the `wasm32-unknown-unknown` target if the
toolchain is fresh), then `tools/smoke.cjs`, then `tools/embed.mjs`, which folds
the wasm and the host into `dist/app.js` and inlines the design system's favicon
as a `data:` URI.

Two checks live beside it:

- `tools/smoke.cjs` drives the compiled module in plain Node — **118 invariants**:
  the exported surface, the frame only ever holding known palette indices, sky
  above and snow below at three viewports, a fractional tap landing exactly, the
  walker arriving and leaving footprints, footprints filling in, the give coming
  back to rest, the lantern's event and its warm pool, the bench calling the fox,
  patience bringing him too, the drawn groove appearing interpolated and filling
  in, the ball growing and stopping at three snowmen, a topple and the melt,
  the bird's two perches, the flurry rising and calming, reduced motion moving
  less and settling not at all, the same seed redrawing the same garden, the fox
  leading with his nose whichever way he crosses, and the frame budget.
- `tools/browser-check.cjs` (needs Playwright, `NODE_PATH=/usr/local/lib/node_modules`)
  checks the page itself — **60 assertions**: no console errors, no external
  requests, no favicon 404, a 44 px sound control that starts off, no
  `AudioContext` until it is pressed, no page scroll at 390×844, 360×640,
  844×390, 1280×800, fractional pointer coordinates, the keyboard route, a long
  press that selects nothing, canvas pixels that are really sky and snow, and
  **driven for real**: a drag that draws a trail without moving the walker, a sky
  swipe that raises and then loses its flurry, a held press that rolls a ball
  into a snowman, a tap that knocks him over, and a tree tap that shakes the
  snow and moves the bird to the other perch.

`tools/frame-png.cjs` renders one frame to a PNG from Node (`SCALE=3` to zoom),
which is how the art was iterated without opening a browser each time.

The page reads `?seed=<n>` when it is given one and otherwise always opens the
same garden (seed 20261110), so a plain visit is unchanged — `?seed=` is only
there if you want to meet a different walker, a different snowfall, or a fox
crossing the other way.

## Accessibility and the house rules

- **Sound off until asked.** No `AudioContext` exists until ♪ is pressed; the
  button starts `aria-pressed="false"` and reads "♪ off". Then a tap is a soft
  crunch underfoot, the lantern answers with one small bell, a snowman lands with
  a soft thump, and the flurry is one long, very quiet breath of wind.
- **Tap targets ≥ 44 px.** The sound button is 86 × 44; the canvas is the whole
  viewport; the lantern's box is 18 world-pixels square (72 CSS px on a 390 px
  phone) around a 7-pixel lamp, and a snowman's is about 13 × 22 world pixels.
- **WCAG AA contrast.** Body text `#e6f2ea` on `#060b09` is about 15:1; the
  caption `#9db3a7` over the brightest snow, through the dock's dark scrim, is
  7.6:1; the button's edge is 13.8:1 against the same ground. Measured from the
  page by `tools/browser-check.cjs`, not from the tokens.
- **`prefers-reduced-motion`.** A `@media (prefers-reduced-motion: reduce)` block
  removes the transitions, and the module runs at a 0.35 motion scale: the
  walker and the fox move a third as far, the whole-scene give stays at rest, the
  flurry's wind is gentler, and the stars stop twinkling. The walk, the drawing,
  the snowball and the tree still happen — the garden still answers.
- **A keyboard route.** The canvas is `tabindex="0"`, `role="button"`, with an
  `aria-label` that explains the piece and Enter/Space to send the walker across;
  announcements (the lantern waking, the fox, the bird, the snowman, the flurry)
  go to a polite `aria-live="polite"` region, one line at a time.
- **No page scroll, no external requests.** `position: fixed` scene with
  `viewport-fit=cover` and safe-area padding; every asset is inline.
- **Long presses pour, never select.** `touch-action: none`, no user-select and
  no callout on the canvas, pointer events with pointer capture, and
  `preventDefault` on touch/contextmenu/selectstart.
- **Nudge, never destroy.** The fox walks away by himself; the walker is never
  in danger; a toppled snowman melts back into the snow rather than being
  removed; nothing is lost, timed or scored.

## What I'd do next

- A second palette (a cold blue hour, a thaw) so the same garden reads as a
  different night.
- Let a snowman you draw be the fox's destination: he pauses beside one instead
  of mid-garden.
- Let a deep press on the tree bring the bird back to the branch he left, rather
  than always the far perch.
- Remember the footprints and the snowmen in `localStorage` so a garden you built
  is still there tomorrow.

— Tachikoma
