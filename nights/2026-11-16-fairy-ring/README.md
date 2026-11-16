# Fairy ring

A mossy clearing at the edge of a pine wood, a little before dawn. Seven
mushrooms stand in a ring; grass leans in the wind; spores drift down from
somewhere. Nothing asks you to do anything. You can wake the place up with one
thumb, or just leave it and watch the sky do it for you.

No scores, no timers, no tutorial. Sound starts muted behind the button in the
top corner — turn it on and the clearing has a voice.

## The idea

A fairy ring is a circle of mushrooms that folklore says the fairies danced in.
The whole scene is one screen, one-handed, and the ring is the only thing that
matters in it. The point of the night was to build a place rather than a game:
the sky moves on its own, the grass keeps moving, and your touches leave marks
that fade slowly instead of resetting.

## The language

**ClojureScript.** The repo's nights so far have covered a lot of ground, but
not a Lisp in the browser. ClojureScript compiles to plain JavaScript with
Google Closure, so the build stays a static folder — no server, no runtime, and
it works as a GitHub Pages site. The interesting part is that a scene is
mostly a *value*: the world is one immutable map, every frame is a pure
function of the previous map plus the elapsed time, and the renderer just reads
it. That made the little systems (spores, dawn, the gnome's nap) easy to keep
apart, and it made a real bug obvious: the audio module and the world module
talk through a queue of events appended to the map, so nothing plays a sound
twice.

## Build and run

```bash
./build.sh          # compiles src/ to dist/ (needs a JDK + Maven, see mise.toml)
python3 -m http.server 8000 --directory dist
# then open http://localhost:8000/
```

`build.sh` uses Maven only to resolve the ClojureScript compiler and its
dependencies onto a classpath; the compile itself is `cljs.main` with
`:optimizations :advanced`. The output is `dist/index.html` + `dist/app.js`,
about 167 KB, committed so Pages can publish it untouched.

## What you can do

Everything below is pointer events, so a finger and a mouse behave the same.

- **Tap the grass or the sky.** A burst of spores, a soft glow, and the grass
  bends away from your finger. The sky tap is higher and brighter; the ground
  tap is a low woody pluck that rises with how low you tapped.
- **Tap a mushroom.** Its cap blooms open and a shimmer rings out, panned to
  where it sits in the scene.
- **Press and hold a mushroom.** A warm sustained tone rises, two octaves of
  triangle and sine, and the cap keeps opening while you hold. Let go and it
  settles back.
- **Drag across the moss.** You paint a trail of spores and the grass parts
  along your finger; a brushed-noise sound follows the stroke. It fades on its
  own over a few seconds.
- **Swipe upward in the sky.** You push the dawn forward. A long slow whoosh;
  when the sky crosses into full dawn there is a low peal, like a bell heard
  through the ground.
- **Tap the gnome.** He hops, turns, and tocks. Poke him twice within about
  twenty seconds and he pulls his hat down and mutters at you. He never
  disappears — he only ever gets more annoyed.
- **Press and hold the gnome.** He tucks himself in and snores for a while
  (about half a minute), then wakes up on his own. The snore is audible and
  deeper when he is properly tucked in.
- **Tap the moth**, once the dawn is full and it has come down to the elder
  mushroom. It flutters up and away, then settles again.
- **Do nothing.** The dawn creeps in by itself, faster if you have been still
  for a while — full daylight in roughly three and a half minutes of quiet.
  Fireflies thin out as the sky brightens; the moon sets; the mushrooms stop
  glowing.

### Things to find

- The elder mushroom, the biggest one at the front of the ring. Once the sky is
  fully dawn-lit, press and hold it: a small door opens in its stalk and a puff
  of spores goes up. It stays open afterwards.
- The moth only arrives after full dawn. It lands on the elder's cap, and it
  will come back if you nudge it away.
- The gnome's hat. Two pokes in quick succession is all it takes.
- The peal. It rings once, at the moment the sky finishes turning, and never
  again in that session.

## Sound

Synthesised with the Web Audio API — oscillators, noise and filters, no
samples. The master bus has a compressor so a spore burst over a held chord
never clips. Sound starts muted; the button is in the top-right corner and is
104 × 48 px, so it is easy to hit on a phone.

- **The bed**, three layers running while sound is on: a slow filtered pad that
  follows the dawn (darker at night, warmer and brighter at full dawn), a wind
  layer of filtered noise that rises and falls with the gusts in the grass, and
  a low hum that carries the whole scene. Turning sound on brings the bed up in
  about a third of a second and plays a two-note chime so you know it worked.
- **Every interaction has its own voice:** pluck (ground tap), twinkle (sky
  tap), shimmer (mushroom), a sustained pair of oscillators (holding a
  mushroom), brushed noise (dragging), whoosh (swiping up), peal (dawn), door
  (the elder's door), tock and mutter (the gnome), snooze and snore (his nap),
  and two small plucks for the moth arriving and leaving.
- The choice is remembered in `localStorage`, wrapped in `try/catch` so a
  blocked-storage browser still works. A session always starts muted; if you
  left sound on last time, the first tap on the scene turns it back on with the
  same chime, so nothing is ever audible before you touch the page.

## How it was built

The scene is drawn into a deliberately small canvas — a "fat pixel" grid of
about 427 × 267 on a desktop and 195 × 422 on a phone — and the CSS stretches
it to the viewport. That keeps the pixel-art look honest (one drawing unit is
one fat pixel) and keeps the frame cheap: everything is rectangles, no images,
no sprite sheets. The one concession is the glows, which are radial gradients
drawn in a handful of steps rather than per pixel.

The world is a single immutable map. `update-world` takes the map and a
timestep and returns a new map; the drawing module only reads it. The systems
are separate functions chained in one place: dawn, mushrooms, gnome, moth,
spores, glows, grass, ambient. Sound is the same idea — the world appends
`{:kind :shimmer :pan 0.3}` to a `:sfx` vector and the frame loop drains it and
plays each event once, so the world stays pure and the audio module owns the
browser.

What the language made easy: the whole scene as a value meant no hidden state
and no ordering bugs between systems, and the queue-of-events pattern for audio
came almost free. What it made hard: the compile is slow (about two and a half
minutes for `:advanced` on this VM), so the loop was "build, screenshot, fix"
rather than a live reload. And JavaScript interop is verbose — `(.-innerWidth
js/window)` and `(.setValueAtTime node value time)` everywhere — so the audio
module reads more like JavaScript with Lisp brackets than like Clojure. The
`:advanced` compiler also renames properties, so all the Web Audio calls go
through `goog.object`-safe accessors or plain method calls on locals.

One real bug the playtest caught: the audio graph was calling
`getChannelData` with no argument and `linearRampToValueAtTime` on a gain node
that did not exist, which threw and killed the whole sound module. The screen
kept drawing, so it looked fine — only the automated check's page-error log
showed it. That is the argument for playing with sound on and reading the
console, not just looking at a screenshot.

## What I would do next

- A second ring, further back and smaller, so the clearing has depth and the
  mushrooms can be seen in relation to each other.
- Let the painted spore trail persist as faint moss colour, so the ground
  remembers a whole evening rather than a few seconds.
- A second creature that only appears when the clearing has been quiet for a
  long time — the moth is the first hint of that idea.
- A proper "morning" state: once the dawn is full, keep the sky there and let
  the fireflies go entirely, rather than only fading them.
