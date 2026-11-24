# Moonmirror Marsh

A calm pixel-art night marsh you solve one thumb at a time: turn the stone
mirrors so the moonbeam reaches every reed-lantern. Five small levels, each
adding one new rule, then a gate that opens and a heron that carries the light
home.

No timers, no scores, no tutorial. The marsh is quiet and it stays quiet.

## The idea

The whole game is one beam of moonlight and a handful of stones. You never move
the light directly; you change what is in its way. Every level is a small,
readable room: an emitter on the left, a lantern somewhere else, and one or two
mirrors between them. Turning a stone is instant and the beam redraws as you
watch, so you can see your own thinking.

Levels:

1. **First Light** — one mirror, one turn.
2. **Two Turns** — the beam has to bend twice.
3. **Reeds Drink the Light** — reeds stop the beam dead; walk around them.
4. **The Rune Gate** — a rune only lets light through in one direction.
5. **A Prism Splits the Beam** — a prism sends light two ways at once; two
   lanterns, one beam.

## The language

**C# on Blazor WebAssembly.** C# had not been used by any earlier night, and it
is a genuinely different shape from the scripting languages the marsh has seen:
a real type system, records, pattern matching, and a compiler that will not let
a switch over tile kinds be incomplete. The rules live in C# and are compiled to
WASM; the page only draws and listens. That split is the whole architecture, and
it is the reason C# was worth the 5.6 MB.

## Build and run

```bash
./build.sh          # validates the levels, then publishes dist/
python3 -m http.server 8000 --directory dist
```

`build.sh` needs the .NET SDK 11 and the `wasm-tools` workload (installed with
`dotnet workload install wasm-tools`); `mise.toml` pins the SDK. The output is a
plain static site in `dist/` with `dist/index.html`, no server code and no
compression.

## What you can do

- **Tap a stone** to turn it. The beam redraws at once and plays a low wooden
  turn.
- **Drag across several stones** to turn them in one sweep; each one answers as
  your thumb crosses it.
- **Long-press the water** to raise a ring of mist. It is not a hint system, it
  is just a thing the marsh does.
- **Swipe the sky** to drift the moon. The whole marsh's light shifts with it,
  and the moon's reflection follows.
- **Tap a lit lantern** to ring it. It holds the note and sends a soft burst of
  motes up.
- **Wait, and do nothing.** After about thirteen seconds the heron calls and
  fireflies rise out of the reeds. Touch the water again and they fade.
- **Undo / Restart** in the footer; **Sound** turns the marsh's voice on and off.

The sound button starts as "Sound off". Turning it on fades in the ambient bed
over 0.45 s and plays a two-note chime, so you know it worked. The choice is
remembered in `localStorage` and restored next time.

## The sounds

Everything is synthesised with the Web Audio API; there are no samples.

- **Ambient bed** — filtered noise for wind and water, plus two detuned triangle
  pad voices (110 Hz and 164.8 Hz) and a very quiet shimmer at 1568 Hz. A slow
  LFO moves the wind and water filters so the bed breathes.
- **turn** — triangle 330→210 Hz over 80 ms, plus a short band-passed noise tick.
- **prism** — two sine notes, 587 and 880 Hz, the second 40 ms later.
- **lit** — 523 Hz and 784 Hz sine, long decay; the lantern's bell.
- **solve** — a rising three-note figure (C, E, G) with 150 ms between notes.
- **ripple** — sine 720→480 Hz with a whisper of filtered noise.
- **undo / restart** — short downward triangle blips.
- **unmute** — 440 Hz then 659 Hz, a fifth apart.
- **bell** — 392 Hz and 588 Hz, long decay when you tap a lit lantern.
- **heron** — two very close low tones (196 and 199.5 Hz), a slow beat.
- **mist** — band-passed noise at 900 Hz with a 1.4 s decay.

A `DynamicsCompressor` sits on the master bus (threshold −10 dB, ratio 6) so a
sweep across many stones cannot clip.

## How it was built

The rules are one C# class, `BeamTracer`, that walks a beam from each emitter
one cell at a time and records every cell it crosses. A mirror is a single
reflection formula: a `/` mirror maps a direction to its opposite over the
anti-diagonal, a `\` mirror over the main diagonal. A prism is the only tile
that queues a second beam instead of ending the first. Reeds and runes end the
beam; a rune only lets light through when the beam's heading matches the rune's
facing. Lit lanterns are collected into a `bool[]` and the level is solved when
every lantern is true.

Because the tracer is pure, I could brute-force every level before drawing a
single pixel: `tools/validate` enumerates all 2^n mirror orientations and
reports how many solutions each level has. That is how the five levels were
tuned — every one has exactly one solution and none starts solved. It is a
small program, but it meant the game's puzzles were proved before the art
existed.

The renderer is a 176×152 logical frame scaled up by whole numbers, so pixels
stay crisp on a phone and a desktop. Everything is drawn with rectangles and
circles: the sky is three bands, the moon is a disc with a shadow, the reeds are
one-pixel strokes with a sway, the beam is a polyline drawn twice (a wide faint
glow under a thin bright core). The canvas is redrawn every frame; the state
lives in C#, and the page asks for it through JS interop after each turn.

The split between C# and JavaScript is deliberate. C# owns the rules and the
level data; JavaScript owns the canvas, the gestures and the audio. They meet at
one `DotNetObjectReference` and one `Marsh.render(scene)` call. That kept the
interop surface tiny, which matters because every round trip is a serialised
message.

What C# made easy: the tile rules are a `switch` over a record's `Kind`, and the
compiler complained the moment a case was missing. What it made hard: the
toolchain. A Blazor WASM publish is a multi-minute build even trimmed, and the
committed `dist` is about 5.6 MB, which is a lot for a night marsh. Trimming and
disabling compression brought it down from the default.

## What I'd do next

- A sixth level where the beam has to cross itself, so the order of turns
  matters.
- A second emitter, so two beams can meet on one prism.
- Let the moon's drift actually change which lanterns are reachable, so the sky
  is a puzzle piece and not only a mood.
- A tiny "replay" of your turns at the end, drawn as a line of ghost beams.

## Code health

Every source file was scored with CodeScene's `cs review`; the scores are in the
PR body. Data-only files (`Levels.cs`, `TileKind.cs`, `Program.cs`) report "no
scorable code".
