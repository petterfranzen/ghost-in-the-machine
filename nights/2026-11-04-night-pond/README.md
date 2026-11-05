# Night Pond

A small pond at dusk, seen from above in chunky pixel art. Three stone lanterns
sit in the water, asleep. Tap the surface and a light-seed drops where you
tapped: rings bloom out, the whole scene settles by a hair, and the koi turn and
glide over to see. Let a seed sink beside a lantern and the stone takes it in and
wakes — softly, over a couple of seconds, not in a flash. Wake all three and the
pond stays warm. Nothing chases you, nothing runs out, nothing counts down. A
minute-long thing you can finish with one thumb and then just sit in.

![The pond after waking all three lanterns, desktop](https://raw.githubusercontent.com/petterfranzen/ghost-in-the-machine/shots/night-2026-11-04-night-pond/desktop.png)

![The same pond on a 390 px phone](https://raw.githubusercontent.com/petterfranzen/ghost-in-the-machine/shots/night-2026-11-04-night-pond/phone.png)

## The idea

This follows Petter's 2026-11-02 wish: combine Koi Drift's pond with Lantern
Moss's pixel-art world, keep going in that direction, and make a tap feel
impactful while the whole thing stays calm — a soft pulse or bloom, ripples, a
small gentle sound, maybe a slight settle of the scene, everything fading
gradually. Petter liked both of those nights a lot.

So there is one gesture: tap anywhere. It always does something — a seed drops,
rings spread, the koi notice. Near a lantern it also *means* something: the seed
is drawn to the stone's dim warmth and wakes it. Near a lily pad the tap lands
on the pad instead and only the pad rocks. Tapping dry land gives a duller thud
and a shallow ring: a tap outside the water should not feel like a bug.

The "impactful but calm" part is in the timing. On every tap the whole scene
settles inward by about 1.4 % and breathes back over a second — enough to feel
in the hand, far too little to be a jolt. Ripples come in threes at different
speeds and each fades on its own curve. Lanterns wake over 2.4 seconds. The warm
bloom at the tap is a radial gradient, never a white flash. There are no hard
cuts anywhere in the animation.

It plays with a thumb, a mouse or a keyboard: the pond itself is a button, so
Tab reaches it and Enter or Space drops a seed at its centre. If your system asks
for reduced motion, the pond honours it — the scene no longer settles inward on a
tap, the rings fade much sooner and the koi glide more slowly.

Sound is silent until you press the small sound button. Then: a low water "plop"
for a tap in the water, a duller thud for the bank, a pair of soft rising tones
when a lantern wakes, and — when the third one goes — a slow chord that the pond
seems to hold. All synthesised in the page; no audio files.

## Language: ReScript 11.1.4

The log already has Nim, Haxe, Elm, Gleam and Zig. ReScript is new here. It is a
typed language that compiles to readable JavaScript, and it suits this well: the
pond's whole mind — the three koi, their wander and startle, the seeds and how
they are drawn to a lantern, the ripples and their fade, the lanterns waking, the
pseudo-random generator that keeps the scene deterministic — lives in one file,
`src/Pond.res`, compiled to `src/Pond.res.js`. The renderer only reads that
state and paints it. So the interesting behaviour is typed and testable without a
browser, and the drawing code stays dumb.

Honest trade-offs: ReScript's standard library names are not always the ones you
would guess (`Js.Math.atan2` needs a trailing `()`, `Js.Math.floor_float`
instead of `Float.floor`, `Belt.Array.forEachWithIndex` rather than the
`Array.` you might reach for), and the compiler is a small npm download plus a
native binary rather than a single static executable. In exchange the generated
JS is small and plain, the type errors catch most mistakes before the browser
sees them, and there is no bundler config beyond one `rescript.json`.

## Build and run

Requires [mise](https://mise.jdx.dev) (the repo's nights all pin their tools this
way). Then:

```sh
cd nights/2026-11-04-night-pond
mise install        # installs Node 22.23.4 from mise.toml
npm install         # ReScript 11.1.4 and esbuild, both pinned
./build.sh          # compiles the pond, runs the simulation tests, bundles dist/
open dist/index.html   # or: python3 -m http.server -d dist
```

`dist/` is committed because Pages publishes it as-is. `build.sh` rebuilds it from
source and checks the output; CI runs the same script.

Tests: `./build.sh` runs `node test/sim.test.mjs`, which steps the ReScript
simulation without a browser and checks 36 things: the pond at rest, a tap
becoming ripples and a seed, seeds finding lanterns, koi staying inside the
wobbly water edge, all three lanterns waking the pond exactly once, the same
seed producing the same pond every time, and the reduced-motion variant (no
settle, rings gone within ~2 s). There is also a browser smoke check,
`check.cjs` (CommonJS because `package.json` marks the folder as ESM), which wakes
the whole pond on a 390×844 phone viewport with real touch events and fails on
console errors, failed requests, sideways or vertical scrolling, or if the pond
cannot be woken. It needs Playwright; the repo's other nights use it the same way.

## What I'm unsure of

- The koi speed and turn rate are guesses. On a phone they read as calm to me,
  but "calm" and "sluggish" are close together, and this is the first knob I
  would turn after watching someone else play.
- The settle is 1.4 % of the scene. Petter asked for impactful; I erred toward
  calm. If it reads as too subtle, 2 % is probably still calm.
- A tap on a lily pad only rocks the pad. That is deliberate — pads are solid —
  but it might read as "nothing happened" if the pad is small on screen.
- The lanterns are found by tapping near them; there is no hint pointing at
  them except the dim spark on each sleeping stone. On a dark phone screen in a
  bright room that spark might be hard to see.
- The final chord is three sine voices and a slow LFO. It is calm to my ear, but
  audio is the easiest thing to get subtly wrong.

## What I'd do next

- A proper title card on first load (tap to begin), so the first tap is not also
  the first drop.
- Let a woken lantern's reflection stretch across the water, and let the koi
  gather around a lit stone and idle there.
- A few fireflies over the bank once the pond is fully awake — the log's Elm
  night had lovely ones, and they would suit the same dusk.
- A "again" that quietly dims the lanterns and settles the koi, instead of
  reloading the page.
- A short first-load title card, and a quiet description of the pond for screen
  readers beyond the one-line label.

— Tachikoma 2
