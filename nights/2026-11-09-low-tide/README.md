# Low Tide — a quiet rock shore you wake with one thumb (PureScript)

A pixel-art rock shore at dusk, after the sea has drawn back. A handful of tide
pools sit in wet stone, each holding something asleep. Tap a pool and a soft
wave blooms over it; whatever lives there stirs, and settles again. Wake all
four and the tide comes back in to visit.

No scores, no timers, no lose state. Sound stays off until you tap "sound off".

## The idea

Petter's log asked for the Koi Drift / Lantern Moss pair to be combined: a calm
pixel-art scene with taps that feel impactful and still restful. So the tap
wakes a small creature and leaves a ring that spreads and fades — a little
ripple you caused and can watch die down. Then the tide returning is the quiet
payoff: nothing is demanded, the shore just fills.

Follows two wishes from `LOG.md`: keep the pixel art and light RPG feel, and
make the taps impactful but calm. A fifth secret: hold your thumb on the moon
for a second and moonlight pours across the water.

## The language

PureScript. It is a small, strict, functional language that compiles to
JavaScript — a good fit for a pure simulation core (pool geometry, creature
waking, tide, the moon secret) with the canvas painting kept in a thin JS host.
The whole state machine lives in `src/Sim.purs`; `src/host.js` only draws what
the simulation hands it. Past nights used Zig, Gleam, AssemblyScript and Go, so
this was a new one, and it can produce a static site easily.

## Build and run

```bash
./build.sh          # npm ci (first time) + spago build + esbuild -> dist/
npx http-server dist -p 8080   # or any static server; open the page
```

`dist/` is committed: Pages publishes it as it is, and CI rebuilds it to check.
`dist/index.html` is the entry point. Everything is local — no network, no fonts.

The shore is seeded per visit: a fresh 32-bit value is drawn at load, so no two
visits share the same four pools. Add `?seed=4242` to the URL to pin one — the
same number rebuilds exactly the same shore, which is how the tests and the
screenshots below stay repeatable.

## Tests

```bash
npx --no-install spago test   # pure simulation rules, plus a 600-frame budget check
```

Twenty-four rules cover the pool geometry, waking and settling, the tide and visitor,
reduced motion, the moon press, and that one seed rebuilds the shore while another
redraws it. The budget test keeps the simulation loop
under 16 ms per frame.

## How it works

- `src/Sim.purs` — pure core: a seeded generator places four pools, each with a
  creature and a wetness value; `tap`, `press`, `hold`, `tick` and `release`
  step the state. The tide rises when all four have woken.
- `src/host.js` — reads the pure state, paints a pixel buffer, and sends input
  back into the simulation. One buffer, one blit per frame.
- `src/index.html` / `src/style.css` — the shell, the calm palette and the
  reduced-motion fallback.

## What I'd do next

- More than four pools, and a couple of creatures that wander between them.
- Let the tide reveal a second, lower shore for a minute before it withdraws.
- A gentle haptic tap on phones that support it.

— Tachikoma
