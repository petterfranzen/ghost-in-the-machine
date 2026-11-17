# Nightwatch

A hilltop observatory under a slow night sky. You pan the stars with a finger,
tap them to hear them, and — if you stay — whole constellations learn their own
names. There is no score, no timer and no tutorial: the sky simply keeps going
while you are there.

Built for the 2026-11-17 night in **Kotlin/JS**, compiled to plain JavaScript
with `kotlinc-js` and served as a static page.

## The idea

Most night-sky toys are either a star field you can only look at, or a puzzle
with a win condition. Nightwatch is a place. The observatory on the hill is
warm and lit; the sky above it is seeded, so every visit gets its own sky (the
seed sits in the URL, so a sky you like can be returned to). You can leave it
alone and watch meteors, or work your way around the sky marking stars and
watching the constellations quietly introduce themselves.

## How to build and run

```bash
mise install        # java 21 + kotlin 1.9.25, from mise.toml
./build.sh          # writes dist/index.html and dist/night.js
python3 -m http.server 8000 --directory dist
# open http://localhost:8000/
```

`build.sh` needs `java` and `kotlinc-js` on the PATH; if they are missing it
falls back to the mise install tree (`~/.mise/installs/...`) so it also runs
without `mise exec` in front of it. The committed `dist/` is what Pages serves,
so no build happens at deploy time.

## Every interaction

| Gesture | What happens |
| --- | --- |
| **Drag** left/right | Pans the sky. Vertical drag tilts the view up or down. |
| **Flick** and release | The sky keeps drifting and settles. |
| **Tap a star** | The star glints and plays its own pitch (a pentatonic note tied to its position). |
| **Double-tap a star** within ~1.3 s | A brighter glint and a two-note chime. |
| **Tap the observatory dome** | The dome slit opens or closes; the light on the hill changes. |
| **Long-press a star** (hold ~0.8 s) | Marks it: a low, warm tone, and the star keeps a small ring. |
| **Long-press the dome** | A whole new sky is seeded and the dome re-aims. |
| **Leave it idle** | Meteors cross the sky every 6–13 s. Once three constellations have been named, staying still for about twelve seconds raises ribbons of aurora over the hill, which fade as soon as you move again. |
| **Sound button** (bottom left) | Starts muted. Turning it on fades in the ambient bed within half a second and plays a short confirming chime. The choice is remembered. |

Marking every star of a constellation makes it name itself: the figure draws
its lines, a label appears beside it and a soft chord plays. Five constellations
are scattered across the sky; the names are the ones the sky earned tonight.
Named constellations are remembered per sky, so the seed in the URL brings back
both the stars and the names you gave them.

## Sound

Everything is synthesised with the Web Audio API — no samples. The ambient bed
is three layers under a slow drift: filtered noise as wind, a low pad and a
quiet hum. Each interaction has its own voice:

- **star chime** — sine plus a filtered triangle an octave up, short attack, long tail;
- **double chime** — a fifth above with a bright upward sweep;
- **mark** — a low triangle and sine pair, slow attack and long release;
- **naming** — a small chord on the constellation's root note;
- **dome** — a filtered noise thump as the slit moves;
- **meteor** — a short high shimmer;
- **aurora** — a slow, breathy pad layer that joins the bed while the ribbons are up.

The master bus runs through a compressor so many chimes at once stay calm, and
the master gain sits around 0.6. Audio only starts after the visitor taps the
sound button, and the context is resumed again when the tab comes back.

## How it was built

The interesting choice was to keep the world **pure and browser-free**. The
seeded sky (`sky.kt`) and the gesture/state machine (`world.kt`) know nothing
about the DOM, the canvas or Web Audio: they take a small `View` value and
return events. Everything else — `dom.kt` (the browser bridge), `draw.kt`
(cached sky and ground layers), `scene.kt` (per-frame drawing), `audio.kt`
(the synth), `input.kt` (pointer → world) and `main.kt` (the frame loop) — is a
thin shell around that core. That split is what made it possible to test real
gestures in a headless browser: the page exposes a small `window.Nightwatch`
handle, and the smoke check drives taps, long presses, pans and the sound
button exactly as a finger would.

Kotlin/JS made the browser APIs pleasant: `external interface` declarations
give typed access to `AudioContext`, oscillators and canvas without any
wrapper library, and Kotlin's collection and string handling kept the drawing
code short. The hard part was the toolchain, not the language: Kotlin 2.3's
`kotlinc-js` failed to emit JS in this sandbox (a `NullPointerException` from
the IR backend), so the night is pinned to Kotlin 1.9.25, whose `-Xir-produce-js`
path emits a plain script reliably. The build script hides that behind one
`./build.sh`.

The sky itself is xorshift-seeded: stars are placed in a longitude/altitude
space that wraps, so panning never ends and the same seed always gives the same
sky. Constellation membership is assigned at seed time from the same generator,
which is why every fresh sky has its own five figures with their own names.

## What I'd do next

- Give each constellation its own short melody instead of a single chord, so
  naming one feels like meeting it.
- A slow meteor shower as a rare event, once every few minutes.
- More vertical depth: a horizon layer with a village or a lake reflecting the
  sky.

## Check

`tools/check.cjs` is a Playwright smoke check: it drives the page with real
pointer and keyboard events (no test hooks for the gestures themselves), and
loads the committed page at
1280×800 and 390×844, turns sound on, pans, taps stars, marks a whole
constellation, waits for a meteor and asserts no console errors, no failed
requests and no sideways scrolling. Run it against a served `dist/`:

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright BASE=http://127.0.0.1:8000/index.html node tools/check.cjs
```

---

Night 2026-11-17. Built by Tachikoma.
