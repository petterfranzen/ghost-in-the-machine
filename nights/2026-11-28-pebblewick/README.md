# Pebblewick

A calm tilt-and-roll game. You are a warm pebble on a shelf of moss in the dark.
Tilt the shelf with your thumb and the pebble rolls. Roll over every light to wake
it, then roll into the hollow to go home. Six shelves, each teaching one idea.

No scores, no timers, no tutorial. The hints are one line each and the shelf does
the rest.

## The idea

Most tilt games are about speed. Pebblewick is about *weight*: the pebble has
momentum, the moss drinks it, the wet stone gives none. Tilt too hard and you
overshoot; ease off and the pebble settles. The shelf reacts to you — the sky
warms as you light more motes, a trail of faint marks follows the pebble, and
if you sit still for fifteen seconds a moth drifts in from the dark.

The six shelves are one idea each:

1. **First Roll** — drag to tilt, roll over the light.
2. **Round the Bank** — a stone bank blocks the straight line; go around it.
3. **The Narrows** — a wall with one gap; the second light is on the far side.
4. **Soft Moss** — moss drinks momentum; keep tilting and it gives.
5. **Slippery Stone** — wet stone gives no grip; the posts turn you.
6. **All Together** — everything at once, plus a hidden stone.

## The language

**TypeScript**, compiled by `tsc` to plain ES modules, with the **matter.js**
physics engine vendored locally (`vendor/matter.min.js`, 0.20.0) so the build
needs no network at all.

TypeScript was the right fit for a physics game: the shelf, the bodies and the
render state are all small records that the compiler keeps honest, and the
`Scene`/`Frame` types meant the renderer could be split into primitives without
guessing what it was handed. matter.js does the collision and the resting
contact; the tilt is applied by hand as a gravity vector, so the pebble never
falls "down" the screen — it falls wherever the shelf leans.

## Build and run

```bash
./build.sh          # tsc + copy assets + smoke check -> dist/
cd dist && python3 -m http.server 8000
```

Then open <http://localhost:8000/>. `build.sh` runs the headless smoke check
(`tools/validate.mjs`) which rolls all six shelves with a simple autopilot and
fails if any shelf cannot reach its hollow.

Toolchain: `mise install` (Node 24.22.2 + TypeScript 5.7.2).

## What you can do

- **Drag** anywhere on the shelf to tilt it; the pebble follows the lean. Let go
  and the shelf settles back to level.
- **Arrow keys / WASD** tilt too, for keyboard and desktop.
- **Tap the on-screen pad** (phone) — up, down, left, right.
- **Long-press** the pad to keep pushing in that direction.
- **Undo the roll** resets the current shelf; **Restart shelf** does the same.
- **Sound** button toggles the ambient bed and every touch tone.
- **Idle** for fifteen seconds and a moth visits.
- Roll over the **hidden stone** on the last shelf to find it.

## Sound

Everything is synthesised with the Web Audio API — no samples, no downloads.
Sound starts off (browsers block audio until a tap) behind a 44 px labelled
button. Turning it on fades in the ambient bed within half a second and plays a
short confirming chime.

- **Bed**: a slow pad (two detuned oscillators through a low-pass filter), a wind
  layer of filtered noise, and a water layer whose level rises with the tilt.
- **Mote**: a soft pentatonic bell, one note per mote, so lighting all five makes
  a small phrase.
- **Hollow**: a low warm tone when the pebble settles home.
- **Bumper**: a short wooden knock.
- **Moss**: a muffled thud as the pebble slows.
- **Moth**: a high, thin shimmer.

Master gain 0.58 with a compressor on the bus, so nothing clips when several
sounds land together. The choice is remembered in `localStorage` (wrapped in
`try/catch`), and the `AudioContext` resumes on the unmute tap and when the tab
comes back.

## How it was built

**Physics as a tilt, not a fall.** matter.js normally pulls everything down. Here
the engine's gravity is zero and each frame applies an acceleration along the
shelf's lean, so "down" is wherever the player points. The shelf's walls are
static bodies; the pebble is a circle with a little friction and restitution.
That one decision made the whole feel possible: the pebble's momentum is real,
so the moss and the wet stone can change it.

**Draw order as a table.** The renderer is a list of layer functions applied in
order — ground, mounds, walls, moss, slick, bumpers, motes, hollow, secret,
trail, rings, moth, pebble. Adding a layer is one array entry. That kept the
drawing code flat and let each primitive be tested by reading it.

**The shelf remembers.** A trail of faint marks fades behind the pebble over 1.7
seconds; rings spread where it touches something; the sky's gradient warms as
motes light. None of it is scored, all of it is feedback.

**Kept small.** Every source file is under 300 lines, functions are short and
shallow, and the repeated drawing cases are driven from data tables rather than
long if-chains. Code Health on every source file: 9.68–10.0.

## What I'd do next

- A seventh shelf that leans on the secret stone's mechanic.
- Let the moth be catchable — a small, quiet reward.
- A gentle "settle" animation when the pebble comes to rest, so the stop reads.

## Code Health

```
src/audio.ts          9.68
src/background.ts     10.0
src/input.ts          10.0
src/levels.ts         (data only)
src/main.ts           9.68
src/matter.ts         10.0
src/palette.ts        (data only)
src/render-shapes.ts  9.68
src/render.ts         10.0
src/run.ts            9.68
src/shelf.ts          10.0
src/types.ts          (data only)
src/ui.ts             9.68
```
