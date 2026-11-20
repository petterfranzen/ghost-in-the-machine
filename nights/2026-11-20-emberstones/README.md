# Emberstones

A ring of standing stones at night, and one thumb. Tap a stone and it wakes —
and it takes its neighbours with it. Wake every rune in the circle and the
circle opens onto a deeper one. Six circles, each with one more rule than the
last, and something waiting at the middle.

No score, no timer, no tutorial. Just the ring, the moon, and the sound of
stones warming up.

## The language

**C++ compiled to freestanding WebAssembly** (`--target=wasm32 -nostdlib`). No
libc, no allocator, no runtime: the whole simulation and the whole picture live
in one static buffer, and the browser just blits it. That keeps the download
tiny (the wasm is ~8 KB, base64'd into the page so it runs from `file://` with
no request at all) and the frame cost flat — measured at 3–4 ms per frame for a
390×844 phone frame.

I wanted a language that would make the *logic* the hard part and the plumbing
the easy part. C++ gave me that: structs and tables for the rules, integer maths
for the pixels, and nothing between me and the memory.

## Build and run

```bash
bash build.sh          # or: mise exec -- bash build.sh
```

`build.sh` compiles `src/*.cpp` to `build/sim.wasm`, base64-embeds it plus the
page's two scripts into `dist/app.js`, copies the page, and runs the smoke
checks. The result is a static site in `dist/` — open `dist/index.html`
directly, or serve the folder.

`mise exec` is needed because `clang++` and `wasm-ld` come from the pinned
`wasi-sdk`; plain `bash build.sh` only works if the toolchain is already on
`PATH`. `mise.toml` pins `node@24.22.2` and `wasi-sdk@25.0.0`.

## What you can do

Every one of these has its own sound and its own reply in the picture.

- **Tap a stone** — it lights, and so do the stones its rule reaches. The lit
  ones glow warm and their runes burn brighter.
- **Tap bare ground** — the earth answers with a low thud and a small puff of
  dust; the ring ignores you politely.
- **Long-press a stone** — the circle leans in and shows you which stone is
  warm: a pale blue halo over the one that wants to be lit. Hold longer and it
  stays with you for a while.
- **Drag across the ring** — you brush several stones in one gesture. Each one
  you pass wakes as you pass it, so a sweep can light a whole arc at once.
- **Undo** — take the last stone back, one at a time, back to the start of the
  circle.
- **Again** — set the circle back to its opening pose.
- **Wait** — leave it alone for a few seconds and the valley starts talking to
  itself: the hint text drifts, embers rise from the ground, and after a couple
  of minutes something crosses the sky. Idle is not a dead state here.

Finishing a circle is the discovery: after the last rune lights, the ring holds
for a moment, the sky shifts, and the next circle is deeper and darker than the
one before. Circle four has moss on some stones — moss will not take a tap, so
the rules change under you. Circle six finishes with a keystone at the centre
that only appears once the ring is complete; long-press the middle to wake it
and the sky turns.

## Sound

Starts muted. The **SOUND** button (top right, 48 px, labelled) wakes the
`AudioContext` on the tap and answers immediately: a three-note chime over a
rising pad, then the ambient bed fades in over about 0.4 s. The choice is
remembered in `localStorage`.

The bed is three layers — filtered noise for wind, a band-passed noise for
water, and two sine pads a fifth apart — and all three follow the scene: the
wind rises when you drag, the water and the pads open up as more stones light.
Everything is synthesised with oscillators and noise; there are no samples.

Each interaction has its own voice, tuned to a G pentatonic so nothing clashes:

| Event | Sound |
| --- | --- |
| tap a stone | triangle ping on the stone's rung of the ladder, plus a short high hiss |
| tap bare ground | sine thud at 110 Hz, dust hiss |
| long-press hint | two high sines (19 and 24 semitones up), a thin shimmer |
| drag across stones | one ping per stone, stepping up the ladder |
| undo | two falling notes, G down to E |
| again | a low breath and a soft thud |
| circle complete | four-note rising arpeggio |
| deeper circle | three slow notes, minor-ish |
| keystone | deep thud, long hiss, a bell two octaves up |
| sky turning | four notes over 1.4 s, wide and slow |
| moss | a dull thud — moss swallows the ping |
| idle mote | a very quiet high ping, almost not there |

The master bus runs through a compressor (−14 dB threshold, 6:1) so a sweep
across nine stones at once does not clip. Master gain sits at 0.62 when on.

## How it was built

**The rules are data.** Each circle is a row in a table — how many stones in
each ring, how many are mossy, how many taps to step back, and the band of lit
counts the pose should land in. Adding a circle is adding a row.

**Every circle ships solvable, and I can prove it.** The generator does not
place stones randomly and hope. It poses the circle by starting from *all lit*
and applying a random sequence of taps — so the sequence that undoes those taps
is a solution by construction. Then it checks that the resulting lit count is in
the circle's band and that the solver agrees. The solver is a GF(2) Gaussian
elimination over the tap matrix: each stone's tap is a bitmask of which stones
it toggles, and "all lit" is a linear system. That same solver drives the hint:
ask it for the darkest state's solution and it names the first stone in it.
`tools/smoke.cjs` runs the solver on all six circles and fails the build if any
one of them is unsolvable.

**The picture is integers and a buffer.** No canvas 2D calls in the hot path —
the C++ writes RGBA straight into a 520×900 buffer and the page does one
`putImageData` per frame. Glow is additive: a soft radial falloff added onto
whatever is already there, which is why light pools on the ground and the
stones' own edges pick up warmth. Shadows are the same function subtracting.
The horizon is two sines, not a line, so the ridge never reads as ruled.

**The split.** The C++ owns the world and the pixels; the page owns the audio
and the input. They meet at a small C ABI: `resize`, `render`, `tap`, `release`,
`stats`, `stonePos`. The page never reaches into the sim's memory except to read
the framebuffer, which keeps the interface honest and the wasm small.

**What C++ made easy:** the solver and the pose generator, because they are
just bit arithmetic and a loop; and the renderer, because a framebuffer is the
most direct thing in the world. **What it made hard:** there is no `malloc`, so
every temporary is a static or a stack value — which is fine here, but it means
the stone list is a fixed `MAXS 20` and the framebuffer is a fixed 520×900. The
whole app is 1.5 MB of static memory and that is the ceiling.

## What I'd do next

- **More circle rules.** The table makes this cheap: a circle where a stone
  only toggles its *opposite* neighbour, or one where the moss moves.
- **A seventh circle with no hint.** The solver already knows the answer; just
  stop drawing the halo.
- **Let the stones remember between sessions.** The seed is already in
  `localStorage`; the lit state could be too, so the ring you left is the ring
  you come back to.
- **Sound with more air.** The bed is three layers; a fourth, very quiet, tuned
  to the current circle's chord would make each circle feel like its own room.

— Tachikoma
