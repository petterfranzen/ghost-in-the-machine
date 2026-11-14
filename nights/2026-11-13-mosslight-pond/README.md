# Mosslight Pond

A quiet pixel-art pond at night. Ripples call the koi, mossy stones hold lanterns
you can wake with a long press, and if you leave the pond alone long enough
something pale comes up from the deep.

It follows Petter's note of 2026-11-02: take the pond and koi from **Koi Drift**
and the pixel-art world from **Lantern Moss**, and make a tap feel impactful
while the whole thing stays calm — soft blooms, rings that spread and fade, and a
gentle settle of the scene instead of a hard flash.

Written in **F#**, compiled to JavaScript with **Fable**.

## Try it

```bash
mise install       # .NET 8, pinned in mise.toml
./build.sh         # static site in dist/
python3 -m http.server -d dist 8000
```

Then open <http://localhost:8000/>. It needs a server rather than `file://`
because the compiled output is an ES module.

## How it feels

The pond is laid out for one thumb. There are no scores, timers or instructions.

| Touch | What happens |
| --- | --- |
| Tap the water | A ring spreads, a few drops catch the moonlight, the scene settles a fraction, and the koi turn toward the sound. |
| Drag through the water | Rings trail behind your finger, the koi follow the wake, and the water stirs. |
| Tap a koi | It darts away in a soft panic, leaving bubbles and a ring where it was. |
| Long-press a mossy stone | Wakes the lantern standing there: a warm bloom, sparks, and a new voice in the ambience. A quick tap on a lit lantern makes it hum its note again. |
| Tap the reeds | They sway, and a little pollen drifts off and hangs over the pond. |
| Swipe across the sky | Cloud comes over the moon, the water darkens, and the koi slip down and hide for a few seconds. |
| Tap the moon | A soft bell; three taps in a row and the sky answers with a brief shower of stars. |
| Leave it alone | After a while the fireflies gather over the water and the koi drift to the lanterns. Keep still longer, with two lanterns lit, and a pale koi surfaces and circles the pond, trailing light. |
| Reload | The lanterns you lit are still lit; the pond remembers. |

The pale koi also comes when all four lanterns are awake, and dives again after
about forty-five seconds. Fireflies gather on the surface, a mushroom ring glows
softly on the bank, and one lily pad flowers once three lanterns are lit.

## Sound

Muted until you press **sound off** (bottom-left, 48 px tall on both phone and
desktop). Pressing it fades the ambient bed in within a fraction of a second and
plays a two-note confirming chime, so it is obvious that sound works.

Everything is synthesised with Web Audio — no samples:

- **The bed**: brown noise through a low-pass for the water, a high, quiet hiss
  for the night air, and a slow three-note pad (D, A, D) with slightly detuned
  pairs.
- **Every tap on the water** is a soft drop, pitched by where you touched it.
- **A startled koi** is a short low bloop, a different pitch per fish.
- **Lighting a lantern** plays a chime (D, F, G, A across the four lanterns) and
  adds that note to the ambient bed as a quiet, slowly breathing sine.
- **Reeds** rustle: a band-passed noise burst.
- **Dragging** stirs a low, filtered noise swell.
- **The moon** rings a soft bell; three taps add a shimmering high layer.
- **The pale koi** arrives with a four-note song and a deep bell.
- A compressor and limiter sit on the master bus (master gain 0.6) so a handful
  of sounds at once never clip.

## How it was built

F# is not a language you normally meet in a browser, and that was the appeal:
its records, unions and immutable-by-default style are lovely for a simulation
that is mostly state transitions. Fable compiles F# to plain ES modules, so the
whole app is static files with no runtime and no npm dependency.

The split is deliberate. **F# owns everything that thinks**: the layout of the
pond for the current viewport, koi steering (a wander angle, a target, a soft
boundary that pulls them back inside the ellipse), ripples as normalised life
values, lantern state, the idle clock that decides when the pond is "left alone",
the weather, and the event handling for taps, drags, long presses and swipes.
Two small JavaScript files sit underneath it: `shell.js` gives F# a 15-call
canvas API and a pointer-event queue, and `audio.js` is the Web Audio graph.
F# drives them through `[<Emit>]` bindings, so the frame is written in F# from
top to bottom.

The picture is drawn at a deliberately low logical resolution — roughly 190
pixels across on a phone — and the canvas is scaled up with
`image-rendering: pixelated`. That is what makes it read as pixel art rather than
blurry vector shapes, and it means every coordinate is a small number: a koi is
five ellipses, a pine is four rectangles, a ripple is two ellipses clipped to the
shape of the pond. Nothing is pre-rendered or cached; the scene is redrawn from
the simulation each frame, which keeps the code honest and the look coherent.

What Fable made easy: the simulation is just F# with records, `ResizeArray` and
mutable fields where the frame loop needs them, and the compiler caught most of
my mistakes before a browser ever saw them (units of time, degrees versus
radians, which is which). What it made hard: there is no DOM library in the box,
so every browser call is a hand-written `Emit` binding — fine, but you feel how
much of front-end work is library-shaped. Long-press and swipe are not events
you get for free either; both are derived here from a queue of pointer positions
and timestamps, which turned out to be the nicest part to write.

## What I'd do next

- Koi that remember you: a fish that was startled three times keeps its distance.
- A second pond beyond the treeline, reached by dragging the whole scene.
- More moss: ferns that unfurl slowly after rain, and rain itself.
- Let the lanterns be relit in a different order, and give each order its own
  short melody when all four are awake.
