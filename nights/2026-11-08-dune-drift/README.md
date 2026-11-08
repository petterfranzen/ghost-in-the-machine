# Dune Drift

A quiet moonlit dune field. Tap anywhere and a handful of sand sifts down and
settles softly into the dunes; tap a dune's crest and it gives a little and
slides downhill. Nothing is timed, counted or lost — the field only ever grows
or shifts.

**Petter's wish followed:** the 2026-11-02 direction — keep the pixel art and the
calm, one-handed feel, and make a tap feel impactful (a soft bloom, one gentle
note, a slight settle of the whole scene) while the whole stays calm.

## The idea

A night desert, drawn in a phosphor palette from the Section 9 tokens. The
terrain is a per-column height field: sand stacks, so a dune is just a number.
Wherever two neighbours differ by more than four cells, a single grain crosses
over and the dune slumps — it can never hold a cliff. A tap on the sky releases
grains that fall and land; a tap on a dune's face nudges the crest and the sand
redistributes. The moon, if you tap it, gives one long slow wave across the
whole field.

Two things make it feel calm rather than busy:

- the whole-scene *give* — a 1-to-0 damped settle that lifts and lowers the
  frame by a few pixels when sand lands (the pond's settle, carried over);
- a slow gust every so often that lifts dust motes and makes the stars twinkle.

Sound is off until you press ♪. Then a landing plays a short, low hiss — the
sound of sand, not a note — with the cutoff rising with the size of the fall.
One tap to opt in; silent by default.

## The language

**AssemblyScript 0.28.8**, compiled to WebAssembly. It was the right size of
risk: a language this repo has not used, small enough to finish in an evening,
and it produces a single `.wasm` with no imports and no runtime beyond an
`abort`. The whole simulation — terrain, relaxation, grains, dust, stars, the
frame buffer — lives in the module and works on linear memory with fixed
addresses and no allocator. The host only resizes it, taps it, steps it and
blits the colour-index frame it hands back.

The compiled module is 6.9 KB. The page makes no request at all: the wasm is
base64'd into `dist/app.js`, so it runs from `file://` or a static server.

## Build and run

```bash
cd nights/2026-11-08-dune-drift
bash build.sh             # installs, compiles, smoke-tests, writes dist/
```

`build.sh` runs three steps: `npm ci`, `asc` (AssemblyScript -> WebAssembly),
and `tools/embed.mjs` (folds the wasm and the host into `dist/app.js`). It also
runs `tools/smoke.mjs`, which instantiates the module in plain Node and checks
23 invariants — sand is conserved, dunes rest at repose, fractional taps land,
the render buffer only holds known colour indices, reduced motion never
settles, and 30 taps leave the field intact.

Then open `dist/index.html`, or serve it:

```bash
python3 -m http.server -d dist 8080
```

CI runs the same `build.sh` for every changed night on each PR. The built
`dist/` is committed so Pages can publish it as is.

## Accessibility and the house rules

- **Sound off until asked.** No `AudioContext` is created until ♪ is pressed;
  `aria-pressed` starts `false` and the label reads "♪ off".
- **Tap targets ≥ 44 px.** The ♪ control is 86 × 44 (its min-width/min-height
  are both 44); the canvas is the whole viewport.
- **WCAG AA contrast.** Body text is `#e6f2ea` on `#060b09` (≈ 15:1); the muted
  caption is `#9db3a7` on `#060b09` (≈ 8.9:1), and the hint sits on a 72%-opaque
  plate over the sky.
- **`prefers-reduced-motion`.** The settle, the gust, the twinkle and the wave
  all stop; grains still fall and land so a tap still does something. The
  canvas transform is forced to `none`.
- **No external requests.** Everything is inline or in the folder; the wasm is
  base64 in `dist/app.js`. No fonts, no CDN, no analytics.
- **One-handed, full screen.** `position: fixed` scene, safe-area padding on the
  dock, `viewport-fit=cover`, no sideways scroll, and the only control sits in
  the bottom-right thumb corner.
- **Fractional pointers.** Pointer coordinates reach the module as plain
  doubles; the host never rounds `clientX/clientY`, and the smoke test taps at
  `(30.5, 4.5)` on purpose.
- **Nudge, never destroy.** Sand is conserved: a tap adds grains that land, or
  shifts a crest downhill. There is no reset, no score, no failure state.

## What I'd do next

- A second palette (dawn, or a colder blue night) as a quiet toggle, so the same
  field reads as a different hour.
- Wind ripples: a very slow directional bias in the relaxation so the dune
  crests migrate a little over minutes rather than standing still.
- A long-press "listen" mode where the whole field stills and the stars come out
  brighter — no score, just a slower frame.
- Save the field to `localStorage` so a shape you grew is still there tomorrow.

— Tachikoma
