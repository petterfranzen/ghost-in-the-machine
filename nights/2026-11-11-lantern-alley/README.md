# Lantern Alley

A quiet pixel-art alley at night, walked with one thumb. The lamps are cold when
you arrive; you warm them one at a time, and the alley answers — the light pools
widen, moths gather, and the stones under your feet start to glow. Three coins
lie lost in the dark corners, and a coin is only visible where a lantern is
burning, so the alley only gives up its secrets to someone who has been tending
the light. Beyond the far end there is a small courtyard, a well, a moon, and a
door that has been waiting a long time.

Everything is calm: no scores, no timers, nothing to lose. The alley dims on its
own over a few minutes, and the rain (two quick flicks of a thumb away) dims it
faster, so warming the lamps is a thing you come back to rather than finish.

Built for the 2026-11-11 night. It follows Petter's 2026-11-02 wish: keep going
in the pixel-art direction of Lantern Moss, and make a tap feel impactful while
the whole stays calm — a clear bloom of light, ripples, a small sound, and a
slight settle of the scene.

## Interactions

| what you do | what happens |
|---|---|
| **tap the ground** | the walker pads over to that spot, with soft footsteps |
| **drag a thumb** | she keeps walking while your thumb stays down — the whole alley is one-handed |
| **tap a lantern** | it warms: the light pool swells, sparks drift up, moths come, the scene settles a little and the alley's hum warms with it |
| **long press a lantern** | you tend it: a steadier flame with its own tint (amber or a cool blue), which dims much more slowly. Tending all seven plays a chord |
| **flick across the screen** | a breeze: the lanterns sway, leaves scatter, the pad of wind thickens. Two flicks wake the rain, which lasts a minute or two and then eases off |
| **stand still** | the cat pads in from the far end and sits under a warm lantern. Tap it and it purrs and follows you for a while; if the alley is warm enough and you are quiet long enough, a fox crosses |
| **walk over a coin** | it is picked up with a bell — but only if a lantern is lighting that corner, or your own lamp is close |
| **tap the well** | a ripple, and the water answers |
| **tap the barred window** | a warm room lights up behind the bars for half a minute, and a little of it spills onto the setts |
| **knock on the plank door** | a low thud; the third knock is answered — a bell, and a line of light under the door |
| **warm a lantern while it rains** | it steams, and hisses softly, and dims faster than it would dry |
| **walk through the puddle** | a splash, and rings spread across the water; in the rain it holds a small moon |
| **the sound button** | bottom right, always at least 44 px. The ambient bed is up within a third of a second and a chime confirms it, so nobody wonders whether it worked |

Three coins found lights the well from inside: a warm ghost-light rises out of
it and drifts up the alley, and the door at the far end answers with a glow.

## The sounds

All synthesised with Web Audio (oscillators, noise, filters and envelopes) —
no samples. Master gain 0.62 into a compressor on the master bus, so nothing
clips when several play at once.

- **the bed** — three layers: brown-ish wind through a slow lowpass, a low pad
  (two quiet tones an octave-ish apart) and the alley's own hum. The pad lifts
  as the alley warms, and the wind thickens in the rain.
- **rain** — a band-passed noise layer that fades in over a couple of seconds,
  with single drops on top while it lasts.
- **unmuting** — a two-note bell (G4 then D5) as confirmation.
- **footsteps** — a short band-passed noise tick, alternating two pitches.
- **warming a lantern** — a soft tone gliding up from G3 to C4, a small bell
  above it and a breath of low-passed noise.
- **tending a lantern** — a slow three-note bell figure (C5, E5, G5) with a
  sparkle on top.
- **a coin** — two bells, the second a fifth above the first; each coin is a
  step further up the pentatonic scale.
- **a breeze** — a band-passed sweep up through the noise, with a low whoosh
  underneath.
- **the cat** — a low purr: a sawtooth through a lowpass with a fast tremolo.
- **the well and the puddle** — two quick bells and a watery tick.
- **rain on a warm lantern** — a short high hiss, and a pale drift of steam.
- **knuckles on the door** — a low triangle thud with a soft knock on top.
- **the room behind the window** — two small bells and a muffled shuffle.
- **the door answering** — two quiet bells, a fifth apart, the second late.
- **three coins / all lanterns tended** — a rising swell with bells above it.
- **distant bells** — every minute or so, a quiet bell from somewhere else in
  the town, if you are listening for it.

The sound choice is remembered in `localStorage`, wrapped in try/catch, and the
AudioContext is resumed on the tap that unmutes and again when the tab returns.

## Build and run

```bash
./build.sh          # Scala (Scala.js) -> dist/main.js, plus index.html
python3 -m http.server -d dist 8000   # then open http://localhost:8000
```

`build.sh` writes the whole static site into `dist/`, which is committed (Pages
publishes it as is, and CI rebuilds it to check). Toolchain pinned in
`mise.toml`: `java 21.0.6`, `scala-cli 1.17.1`.

## A smoke check

```bash
node tools/smoke.cjs --shots shots
```

It drives the built page in a phone-sized Chromium and asserts what the scene
does in reply: the canvas size, the sound button's size and label, that tapping
it starts a running AudioContext and remembers the choice, that a tap warms a
lantern, that a long press tends it, that a drag walks the walker, that standing
still brings the cat, that two flicks raise the rain, that a coin in a dark
corner is invisible until its lantern is warm and is then picked up, that tapping
the barred window lights a room behind it, that three knocks on the door are
answered, that the camera follows to the courtyard, that the page never scrolls,
and that the console stays clean. `--shots <dir>` also writes the screenshots.

`window.alley` is a small read/write handle on the living world (see
`src/jsapi.scala`) — the checks read state through it and place the walker with
it, but everything they assert about behaviour is driven by real pointer events.

## How it was built

**Why Scala.** The alley wants real systems — a walker with facing and a step
cycle, seven lanterns that warm, decay, sway and hold a tint, weather that
arrives and leaves, a cat and a fox with their own small state machines, and a
light buffer that every frame re-multiplies over the scene. Scala's types and
pattern matching make those systems readable at a glance (`p.kind match { case 0
=> ... }`), and Scala.js compiles the whole thing to one plain JavaScript file
with no bundler, no framework and no build plugins: `scala-cli package --js
--js-module-kind none` and the page is a `<canvas>` and a `<script>`.

**The lighting is the whole trick.** The scene is painted once into an offscreen
canvas (the bricks, the setts, the well, the ivy, the threshold) and blitted
every frame; the moving things are drawn on top; and then a second, view-sized
canvas — filled with the night's ambient colour and lit additively by every
lantern, the walker's own lamp, the moon and the well — is composited over the
whole thing with `multiply`. So the alley is *colour-multiplied by the light*
rather than washed over by it: a wall goes warm as a lantern beside it warms,
the setts go dark and shiny in the rain, and the ambient colour itself drifts
warmer as the alley fills with light. It is also why a coin can genuinely be
invisible: it is drawn with an alpha taken from the same light function that
feeds the buffer, so no light means no coin.

**What was easy, and what was not.** Pixel art as arrays of strings was a
delight — a sprite is a little text block, editable by eye, and a `blit` of one
`fillRect` per lit pixel is fast enough at this size; a one-pixel silhouette
pass behind the walker, the cat and the fox came free from the same grids and
does more for readability than any amount of colour tuning. The awkward part was
the edges of the JS world: Scala.js mangles the names of fields, so the debug
handle had to become an explicit class of `@JSExport`ed methods before the smoke
check could read anything, and writing a value into a `Float32Array` is not
`data(i) = x` — it compiles to a call that does not exist, which is how the
noise buffer for the wind and the rain was silently empty until the smoke check
caught it. Both are the kind of thing that costs an hour and teaches a language
better than the manual.

**Depth, not breadth.** One alley, three screens tall, walked end to end in
about half a minute. The rain, the cat, the fox, the moths, the distant bells
and the third coin are all things you find by staying, not by being told.

## What I'd do next

- Give the walker a few more things to do with her hands: pick a lantern off its
  bracket and carry it, so the light you have becomes a choice about where to go.
- Let the rain leave puddles that spread and slowly dry, and let the cat drink
  from one.
- A second, quieter alley behind the door at the far end, unlocked by the coins.
- Move the palette by the hour: the same alley at dusk, deep night and first light.
- Draw the moths and sparks after the light multiply, so they keep their own
  colour instead of taking the lantern's tint.

## Layout

```
src/main.scala     boot, pointer handling (tap / drag / long press / flick), the loop
src/world.scala    the alley, the walker, weather, lanterns, coins, the cat and the fox
src/render.scala   the static alley painted once, the light buffer, everything that moves
src/light.scala    the light buffer itself
src/sound.scala    the ambient bed and one voice per interaction
src/sprites.scala  the pixel art, as arrays of strings
src/jsapi.scala    the handle the smoke check reads
tools/smoke.cjs    the smoke check
```
