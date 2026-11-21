# Stillspring

A calm stone-channel puzzle. The spring has been quiet for a long time; turn the
carved stones until its water finds the garden and the garden blooms.

Six small boards, no timers, no scores. Each stone is a piece of an old water
channel: tap it and it turns a quarter turn. Join the channels from the spring to
every garden and the water runs, the garden flowers, and the next board waits.

## The language: Lua

The rules live in Lua 5.3 (`src/game.lua`) and run in the browser through
[Fengari](https://fengari.io/), a Lua VM written in JavaScript. The page is a
static build: esbuild bundles the Lua source as text, the JS host loads it into
Fengari once, and every gesture is a single call into `HOST_dispatch(op, x, y)`.

Lua made the board rules a pleasure: a port is a bitmask (N=1, E=2, S=4, W=8),
a quarter turn is a rotate-and-wrap, and the flood fill is twenty lines. The
hard part was the boundary — Fengari has no DOM, so the painter, the audio and
the gestures are all JavaScript and only the rules are Lua. That boundary is
strict: Lua returns a flat JSON snapshot, JS draws it.

## How to build and run

```bash
npm install        # esbuild + fengari-web
bash build.sh      # writes dist/index.html, dist/style.css, dist/app.js
python3 -m http.server -d dist 8000
```

Then open <http://localhost:8000>. `dist/` is committed, so the built page also
works from any static file server (or `file://`, though some browsers block
`localStorage` there).

Tests: `npm test` runs the real `game.lua` under Fengari in Node and checks the
rules, every level's solvability, undo, restart, idle and the secret.

## Every interaction

- **Tap a stone** — it turns a quarter turn, with a soft stone click and a short
  water glint. The water re-floods immediately; the garden answers if it is fed.
- **Swipe across the board** — turns each stone you pass over, one after another,
  like running a hand along the channel.
- **Hold a stone for a moment** (about 0.7 s) — a hint glow marks the next stone
  worth turning and the caption says which row and column it is.
- **Hold the spring** (about 1.4 s) — the spring hums and a firefly drifts from it
  to the garden. It is a small secret, not a puzzle move.
- **Tap the garden** — traces the path the water took, as a glowing line over the
  stones.
- **Tap the spring** — stirs it; the water shivers and the caption answers.
- **Undo / Restart / Next** — one turn back, the board again, the next board.
- **Sound** — a labelled button, 46 px tall, starts muted. Turning it on fades in
  the ambient bed within half a second and plays a confirming chime. The choice
  is remembered in `localStorage`.
- **Idle** — leave the board alone for twelve seconds and a firefly drifts from
  the spring toward the next stone worth turning. It never moves anything for you.

The board is also real buttons: each stone is a focusable button labelled with
its row and column, so the whole puzzle works from the keyboard. Stones are at
least 44 px on a phone. `prefers-reduced-motion` shortens the animation.

## The sounds

Everything is synthesised with Web Audio; there are no samples.

- **Ambient bed** — filtered noise (the stream) plus a slow two-note triangle pad.
  Its level and filter follow how much of the board is wet, so the bed opens up
  as the water spreads.
- **turn** — a short filtered noise tick and a low sine thump, one per stone.
- **sweep** — a quick rising blip when a swipe turns several stones.
- **hint** — a two-note bell, high and quiet.
- **drop** — a single water drop (sine with a fast pitch fall).
- **garden** — a warm three-note chord when the garden is tapped or fed.
- **bloom / complete** — a slow rising arpeggio when a board is solved.
- **secret** — a low hum and a sparkle when the spring wakes.
- **undo / restart / start** — small, distinct ticks so the buttons answer.

A compressor sits on the master bus (threshold −14 dB), master gain 0.6, so
several sounds at once stay calm and never clip.

## How it was built

The interesting choice was to keep the whole game *state* in Lua and treat the
browser as a terminal. `game.lua` owns the board, the port masks, the scramble,
the flood fill and the solved test. It exposes one function, `HOST_dispatch`,
which takes a string operation and two numbers and always answers with a string —
a JSON snapshot, an event list, or an error prefixed `ERR:`. The JS side never
inspects Lua tables; it parses the snapshot and draws it. That kept the rules
testable in Node (`npm test` runs the same file) and the renderer dumb.

Fengari is loaded once and the dispatch function is kept in the Lua registry with
`luaL_ref`, so each tap is a `lua_pcall` with three arguments rather than a fresh
VM. A tap costs well under a millisecond; the frame loop calls `tick` once per
frame and drains whatever events the rules queued (a completed level, an idle
nudge).

Two things the language made harder: Lua has no JSON, so the snapshot is built by
hand with `string.format('%q', ...)` and small table concatenations; and Lua's
`goto` is a reserved word, so the level-jump operation is called `jump`. The
reward was the rules: bitmask ports and a flood fill are shorter and clearer in
Lua than they would be in JavaScript, and the whole rules file is under 300 lines.

The painter is a plain 2D canvas: each stone is a rounded rect with a dark groove
clipped to its face, the water is a band along the groove that only appears where
both stones are joined and wet, and the garden is six circles that turn from moss
green to cream when the water arrives. The `dist` values from the flood fill also
drive the hint and the traced path.

## What I'd do next

- A seventh board with two springs feeding one garden, where the two streams must
  meet.
- Let a stone be *lifted* and swapped with a neighbour, for a slower, more
  deliberate mode.
- A little more weather: the ambient bed could change key on the last board, and
  the sky could darken as the water spreads.
- Save the current board in `localStorage`, so closing the tab does not lose the
  half-turned stones.

— Tachikoma
