# Lantern Ice

A moonlit bay, frozen over, and one little lantern-keeper who can only move by
skidding: pick a direction and they slide until something stops them. Light
every lantern in the bay. Eight small rules arrive one at a time — a rock, deep
snow, thin ice, a block to shove, water to bridge with it — and then the bay is
yours to skate.

It is a slide puzzle in the old sense: no scores, no timers, no way to lose
anything but a little time. The whole game is one thumb.

![desktop](https://raw.githubusercontent.com/petterfranzen/ghost-in-the-machine/shots/night-2026-11-22-lantern-ice/desktop.png)
![phone](https://raw.githubusercontent.com/petterfranzen/ghost-in-the-machine/shots/night-2026-11-22-lantern-ice/phone.png)

## The language: V, compiled to JavaScript

The rules live in `src/game.v`, written in [V](https://vlang.io) and compiled
straight to a browser bundle with `v -b js_browser`. V's JS backend emits one
plain file — no loader, no bundler, no `require` — where every `pub fn` becomes
a global `main__<name>`, and functions declared as `fn JS.lake_something(...)`
become calls into whatever global the host defines. That is a whole interop
story in two features, and it is why V was chosen over the alternatives I
sketched (see "How it was built").

The host — the canvas painter, the input, the sound — is hand-written
JavaScript in `src/host/`, six small files that talk to the compiled rules
through those two doors.

## Build and run

```bash
mise install          # V 0.5.2, pinned in mise.toml
./build.sh            # writes dist/ and runs the checks
python3 -m http.server -d dist 8000
```

`build.sh` compiles `src/game.v` to `dist/game.js`, copies the page and the host
scripts into `dist/`, and then runs `tools/smoke.js`, which replays an
independent solver's shortest solution for every level into the real bundle and
watches the bay light up and move on.

`dist/` is committed: the night's Pages preview serves it exactly as it is.
The only toolchain needed is V 0.5.2, installed by mise.

## Every interaction

- **Swipe anywhere on the bay** (or press an arrow key, or `WASD`) — the keeper
  skids that way until a rock, a snowdrift, a lantern or the edge stops them.
  Each skid redraws as a smooth slide, not a jump.
- **Tap the four arrow buttons** — the same four moves, for one-handed play with
  the thumb that is already holding the phone.
- **Tap the ice** — the keeper scuffs a boot; tap a lantern and its little flame
  shivers. Small replies, so the bay never feels deaf.
- **Press and hold** (about a second) — the keeper crouches and holds the
  lantern down: thin ice within two tiles frays back over, one crack at a time.
  This is the sixth rule, and the only way past some of the later thin ice.
- **Shove a block into open water** — the block stays and the water freezes into
  ice you can cross. The seventh rule.
- **Undo** — steps back one move. **Restart** — begins the level again.
- **Wait**: after nine seconds of stillness the keeper sits down; after nearly
  forty the lake shows you something rare (a fish under the ice, a bloom of
  light, a swarm) if the level has open water in it. It is not a reward and it
  is not scored; it is just there when you stay.
- **Sound**: off until you tap it. The button is 89 x 44 px, labelled
  "Sound off" / "Sound on", and the choice is remembered.

## What the sounds are

All synthesised with Web Audio — oscillators, filtered noise, envelopes; no
samples. Master gain sits around 0.6 behind a limiter, so a full bay of voices
still doesn't clip.

- **Ambient bed** (fades in within half a second of the tap, with a confirming
  chime): a low brown-noise wind through a lowpass, a slow triangle pad (110 /
  165 / 220 Hz), and a bandpassed water hiss. When any lantern is lit, a fourth
  shimmer layer comes up. The bed follows the level, so it never sits still.
- **Skid** — a short breath of filtered noise as the keepers' boots leave the
  ice (pitch follows the direction).
- **Lantern lit** — a soft bell, and its pitch is the lantern's own coordinates,
  so lighting the last lantern of a bay is a rising figure rather than a beep.
- **Block shoved** — a low wooden knock; **water freezing** — a bright, tight
  crackle as the block settles in.
- **Warming** — a warm, breathy swell as the lantern frays a crack.
- **Scuff** — a quiet tap of noise when you tap ice or a lantern.
- **Bay complete** — a three-note rise, then the next level fades in.

## How it was built

Two things decided the night. The first was the language: I sketched the same
game in Blazor WASM and in V compiled to JavaScript, and V's `js_browser`
backend won on weight and on clarity — the compiled rules are one readable file
of the same size as the hand-written host, and the interop is just "a `pub fn`
is a global" and "a `fn JS.x()` is a call outward". The second was writing the
rules twice.

The shipped rules are `src/game.v`. Beside them is `tools/solver.js`, a second,
independent reading of the same rules with a breadth-first search for the
shortest solution. `tools/smoke.js` takes the solver's solution for a level and
plays it into the compiled bundle inside a `vm`, watching the HUD, the moves and
the win. If my V and my solver disagree, the build fails — and they did, several
times, which is exactly the point. The mechanical bugs it caught were real:
V's JS backend stores loop counters **by reference**, so building a `Vec{x, y}`
inside a `for x` / `for y` loop produced positions that kept sliding with the
loop, and the level layouts had to be parsed out of the flat index instead.
A second smoke check compares the host's top-level names against the bundle's
several hundred globals and fails on a collision — the host keeps one namespace
per file (`window.LakeSound`, `window.LakeArt`, ...) because of it.

Inside the V file the interesting bits are the skid itself (`walk`), which is a
tiny state machine over "what stops a skid": rock, snow, a block you've already
shoved once, thin ice that has cracked twice, water, a lantern, or the rim of
the bay. Warmth, idling, falling and the rare lake events are all timers on the
same object, so the whole game is one record of state plus one frame function
the host calls with a delta. The host draws nothing about the rules: it is
handed a grid, tiles, a lit set, cracks and a fractional keeper position, and
paints. That split is why `tools/smoke.js` can play the game with no browser.

The painting is plain canvas 2D — a tile table in `src/host/art.js` (one
drawing per tile kind), and a painter loop in `src/host/paint.js` that adds the
weather: hash-based per-tile shading, drifting flakes, glow pools under lit
lanterns, and a skid trail that fades. Everything is drawn at device pixel
ratio, capped at 2.

## Code health

Every source file I wrote, scored with `cs review` (CodeScene):

Code Health: src/host/art.js new -> 10.0
Code Health: src/host/paint.js new -> 10.0
Code Health: src/host/bridge.js new -> 10.0
Code Health: src/host/controls.js new -> 9.68
Code Health: src/host/sound.js new -> 10.0
Code Health: src/host/main.js new -> 10.0
Code Health: tools/solver.js new -> 10.0
Code Health: tools/smoke.js new -> 10.0

`src/game.v` is V, and CodeScene scores no `.v` files, so it is outside the
score. It is a single file of about 880 lines, which is longer than I would
leave it in a bigger project; the natural split is `levels.v`, `skid.v` and
`frame.v`, and I left it whole to keep the interop surface in one place.

## What I'd do next

- Split `src/game.v` into `levels.v`, `skid.v` and `frame.v`, and give the host
  a proper `Sound.js`-style module boundary rather than `window.Lake*`.
- More than eight bays: the level table is data (`fn levels() []Level`), so a
  small editor or a validator that rejects an unsolvable bay would let me add a
  dozen more without touching the rules.
- A gentle "everything is lit" ending for the free-skate bay — right now it is
  a place to wander, and it deserves one small thing that only happens there.
- Remember the level you were on, so coming back after a week drops you where
  you were.

`window.__lake` is left in the page as a debug handle (`{ scene, painter,
bridge, controls, sound }`) — it is what the browser checks in this project use.

— Tachikoma
