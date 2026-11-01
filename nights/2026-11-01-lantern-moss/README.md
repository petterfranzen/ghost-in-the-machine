# Lantern Moss

A small clearing at dusk, seen from above in chunky pixel art. Three small lights
have wandered off into the moss and lost their way. Your thumb points: tap
anywhere and the little walker in the hood turns and pads over. Come close to a
lost light and it falls in behind — then the walker carries it home to the stone
in the middle, where it settles and the stone glows a little warmer. Find all
three and the clearing quietly comes alight. Nothing chases you, nothing runs out,
nothing counts down. A tiny quest you can finish in a minute and then just sit in.

![The finished clearing, desktop](https://raw.githubusercontent.com/petterfranzen/ghost-in-the-machine/shots/night-2026-11-01-lantern-moss/desktop.png)

![The clearing on a 390 px phone](https://raw.githubusercontent.com/petterfranzen/ghost-in-the-machine/shots/night-2026-11-01-lantern-moss/phone.png)

## The idea

Petter asked for pixel art with light RPG and adventure touches: a character to
walk around, a few things to find, a tiny quest — calm, and one-handed. Lantern
Moss is the smallest version of that I could finish properly. There is one
character, three things to find and one place to bring them. No combat, no
inventory, no dialogue trees — the adventure is the walk itself: soft footsteps,
moss that sways when you pass, motes drifting up through the light, and the
clearing getting warmer as you bring each spark home.

One gesture does everything. Tap a patch of moss and the walker goes there. Tap a
lost light and they head straight for it. There is nothing to hold and nothing to
drag, so it works with one thumb on a phone; on a desktop it is one click.

Sound is silent until you tap the small sound button in the corner. Then you get
quiet footsteps in time with the walk, a warm chime when a light is found, a lower
chime when one is placed, and — when the third one goes home — a slow, breathing
drone that the stone seems to make. No music loops, no stingers.

## Language: Zig 0.15.2, compiled to WebAssembly

The log already has Nim, Haxe, Elm and Gleam. Zig is new here and it suits this
exactly: the whole clearing's logic — walker, lights, motes, deposit rules, the
pseudo-random placement — is one small `wasm32-freestanding` module built with no
external dependencies at all. `zig build-lib ... -target wasm32-freestanding`
gives a `.wasm` with no runtime and no libc; `src/app.js` embeds it as base64 so
the page works straight from `file://` with no server and no fetch, then renders
the module's flat `f32` state array onto a 320×240 canvas scaled up with
nearest-neighbour so it reads as pixel art.

Why I like it for this: the game state is a plain array of floats owned by one
small language with no garbage collector and no hidden allocation in the hot
loop. The renderer is deliberately dumb — it reads positions and draws — so the
interesting part (how a light drifts, how the walker slows as it arrives, how the
glow rises) is all Zig and all testable. Zig's `comptime` also let me keep the
sprite tables in source as data without a build step.

Honest trade-offs: Zig's WASM story is young and the 0.15 API still moves; there is no
`Math.sin` in freestanding Zig, so `world.zig` carries its own small sine and
cosine (Taylor-ish polynomial, accurate enough for wobble at this scale). And the
JS host does more work than a framework would: scaling, pointer mapping, audio.
That is the price of no bundler and no node_modules, and I think it is worth it
for a page this size.

## Build and run

Requires [mise](https://mise.jdx.dev) (the repo's nights all pin their tools
this way). Then:

```sh
cd nights/2026-11-01-lantern-moss
mise install        # installs Zig 0.15.2 and Node 22.23.4 from mise.toml
./build.sh          # builds src/main.zig -> .build/game.wasm, embeds it in dist/wasm.js and copies src/
open dist/index.html   # or: python3 -m http.server -d dist
```

`dist/` is committed because Pages publishes it as-is. `build.sh` rebuilds it from
source, and CI runs the same script to check the committed output still matches.

Tests: `zig test src/world_test.zig` (run for you by `./build.sh`) runs the Zig unit tests in
`src/world_test.zig` (placement bounds, catching reach, deposit rule). The JS
side has a browser smoke check, `check.js`, which plays the whole quest on a
390×844 phone viewport with touch events and fails on console errors or if the
quest cannot be completed.

## What I'm unsure of

- The walk speed (44 px/s in a 320-wide world) is a guess. On a phone the clearing
  fills the screen, so a tap across the whole width is a few seconds of walking —
  that felt right in the smoke run, but it is the first thing I would tune after
  watching someone else play.
- The third light's "caught" radius is generous (17 px against a 14 px sprite) so a
  tap near it works without pixel-hunting. Too generous might feel like it plays
  itself; too tight would be frustrating on a phone. I settled in between without
  a second pair of eyes.
- The sound design is four short synthesised sounds and one drone. It is calm to
  my ear, but audio is the easiest thing to get subtly wrong.
- I did not add a way to reset the clearing except reloading the page. For a
  minute-long thing that seemed fine, but a "again" would be kind.

## What I'd do next

- Let the walker stop and sit by the stone when the quest is done, with the lights
  drifting slowly overhead — a proper ending beat rather than just "it is brighter".
- A second clearing, reachable by walking off one edge, with one new kind of thing
  to find. The world is already a flat array; a second room is mostly data.
- Gently vary the walker's path around obstacles so it curves rather than walking
  straight lines through the moss.
- A proper title card on first load (tap to begin), so the first tap is not also
  the first step.

— Tachikoma 2
