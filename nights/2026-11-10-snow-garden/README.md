# Snow Garden

A quiet walled garden under a slow night snowfall. Tap the snow and a small
walker trudges to that spot, leaving footprints that fill in behind them; the
whole scene gives a little as they set off, and a soft bloom of snow lifts where
you touched. Nothing is timed, counted or lost — the garden only ever gets
quieter.

Two things answer a thumb: the lantern post by the gate lights when you tap it
and warms the snow around it, and the stone bench calls a fox out of the hedge.
The fox also crosses on his own if you leave the garden alone for a while.

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
  three seconds, and leaves. He is announced politely, never scored.
- **The lantern.** A small target with a generous box: tap the post and it
  lights, throws a warm pool on the snow and warms the flakes passing through
  it; tap again and it dims.

Four optional discoveries, no tutorial: the lantern, the bench, the fox that
comes to patience, and the footprints filling in. A one-line hint appears after
twelve seconds of stillness, and a second one later; never more than that.

## The language

**Rust 1.99.1**, compiled straight to WebAssembly with `rustc` — no cargo, no
`wasm-bindgen`, no bundler, no imports. The module is a single 72 KB `.wasm`
carrying the whole simulation and a fixed `180 × 280` colour-index frame buffer;
the host only sizes it, taps it, steps it and blits the frame. The wasm is
base64'd into `dist/app.js`, so the published page makes no request at all.

Why Rust: it was the one high-confidence path to a pixel-art canvas in this
sandbox — one toolchain, one compile, `std`'s `sin`/`sqrt` with no runtime, and a
frame budget with room to spare (0.8 ms for a step plus a render, measured over
600 frames). It also let me keep the fade maths and the drawing in one language.

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

- `tools/smoke.cjs` drives the compiled module in plain Node — 58 invariants:
  the exported surface, the frame only ever holding known palette indices, sky
  above and snow below at three viewports, a fractional tap landing exactly, the
  walker arriving and leaving footprints, footprints filling in, the give coming
  back to rest, the lantern's event and its warm pool, the bench calling the fox,
  patience bringing him too, reduced motion moving less and settling not at all,
  the same seed redrawing the same garden, and the frame budget.
- `tools/browser-check.cjs` (needs Playwright, `NODE_PATH=/usr/local/lib/node_modules`)
  checks the page itself (45 assertions): no console errors, no external requests, no favicon
  404, a 44 px sound control that starts off, no `AudioContext` until it is
  pressed, no page scroll at 390×844, 360×640, 844×390, 1280×800, fractional
  pointer coordinates, the keyboard route, a long press that selects nothing,
  canvas pixels that are really sky and snow, and the reduced-motion variant.

`tools/frame-png.cjs` renders one frame to a PNG from Node (`SCALE=3` to zoom),
which is how the art was iterated without opening a browser each time.

## Accessibility and the house rules

- **Sound off until asked.** No `AudioContext` exists until ♪ is pressed; the
  button starts `aria-pressed="false"` and reads "♪ off". Then a tap is a soft
  crunch underfoot and the lantern answers with one small bell, at a very low
  gain.
- **Tap targets ≥ 44 px.** The sound button is 86 × 44; the canvas is the whole
  viewport; the lantern's box is 18 world-pixels square (72 CSS px on a 390 px
  phone) around a 7-pixel lamp.
- **WCAG AA contrast.** Body text `#e6f2ea` on `#060b09` is about 15:1; the
  caption `#9db3a7` over the brightest snow, through the dock's dark scrim, is
  7.6:1; the button's edge is 13.8:1 against the same ground. Measured from the
  page by `tools/browser-check.cjs`, not from the tokens.
- **`prefers-reduced-motion`.** A `@media (prefers-reduced-motion: reduce)` block
  removes the transitions, and the module runs at a 0.35 motion scale: the
  walker and the fox move a third as far, the whole-scene give stays at rest and
  the stars stop twinkling. The walk still happens; the garden still answers.
- **A keyboard route.** The canvas is `tabindex="0"`, `role="button"`, with an
  `aria-label` that explains the piece and Enter/Space to send the walker across;
  announcements (the lantern waking, the fox) go to a polite
  `aria-live="polite"` region.
- **No page scroll, no external requests.** `position: fixed` scene with
  `viewport-fit=cover` and safe-area padding; every asset is inline.
- **Long presses pour, never select.** `touch-action: none`, no user-select and
  no callout on the canvas, pointer events with capture, and `preventDefault` on
  touch/contextmenu/selectstart.
- **Nudge, never destroy.** The fox walks away by himself; the walker is never
  in danger; nothing is lost, timed or scored.

## What I'd do next

- A second palette (a cold blue hour, a thaw) so the same garden reads as a
  different night.
- Let the fox stop and look at the walker if they are close, a small shared
  moment rather than two animations on one screen.
- A long press on the tree to shake a soft fall of snow off the branches — the
  one gesture the scene does not have yet.
- Remember the footprints in `localStorage` so a walk you took is still there
  tomorrow.

— Tachikoma
