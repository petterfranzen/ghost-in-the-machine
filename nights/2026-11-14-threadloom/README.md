# Threadloom

A small wooden floor loom, and one picture's worth of cloth on it. You work it
with one thumb: drag the shuttle to lay a weft, tap to beat it home, re-dye the
whole cloth by holding a spool, set the warp tension with a swipe. The cloth is
a picture — a heron, a fox, a moonrise — and you only find out which one when
you have woven it. Nothing is scored, nothing is timed, and going still is not
punishment: a moth comes to sit on the beam.

**Night 2026-11-14 · ghost-in-the-machine · ReScript (11.1.4) · no framework**

## The idea

Every night here has been a scene you disturb; this one is a thing you make.
The loom has a warp 32 threads wide and 20 weft rows to go. Each row is a pass
of the shuttle and a beat of the beater, and each row of the cloth is one row of
a pixel picture that is revealed a stripe at a time. You choose the thread (a
palette), the tension, and which rows you beat properly; the loom chooses the
picture, and there are three of them, so a finished cloth is an invitation to
warp the next one.

It follows Petter's wish of 2 Nov — a tap that feels impactful while the whole
stays calm, and pixel art with something to find — with a tap that thumps the
beater and settles a whole row of cloth.

## Run it

Needs Node (pinned in `mise.toml`; any recent Node works).

```bash
mise install          # or: nvm use 26.12.1 / any node >= 20
bash build.sh         # npm ci → art smoke check → rescript build → esbuild → dist/
python3 -m http.server 8080 -d dist
# open http://localhost:8080
```

`dist/` is committed because Pages publishes it as it is. `build.sh` needs the
network once, for `npm ci` (ReScript and esbuild are pinned exact versions in
`package.json`).

## What you can touch

Seven things, each with its own answer, and they feed each other: the tension
changes both the cloth and the pitch of the room, the palette re-dyes rows that
are already woven, and beating a row packs it into the cloth.

| Gesture | What happens |
| --- | --- |
| **Drag** sideways in the well (the bare warp in front of the cloth) | The shuttle rides your finger and lays the weft behind it; let go early and it coasts across on its own. The row lands with a soft settle. |
| **Tap** anywhere but a spool | The beater comes down: the row thumps, packs, the cloth settles a hair and dust motes drift up. With nothing to beat, a tap plucks the cloth instead — a soft note per row, and a ripple in the weave. |
| **Long-press a spool** (0.5 s, a bar fills while you hold) | Re-dyes the whole cloth — every row already woven changes colour at once. |
| **Tap a spool** | Spins it and sounds its note, without changing the cloth. |
| **Swipe up / down** on the cloth or the well | Sets the warp: loose, even, or taut. The unwoven threads slacken or straighten, the room hums a little higher, and rows woven while taut sit tighter. |
| **Hold still for ~11 s** | A moth flutters down and sits on the top beam, wings going; the room quietens. Move, and it goes. |
| **Tap the finished cloth** (a few seconds after the last row) | Warps a fresh cloth: the next of the three pictures, same thread. |

**Things to find.** The picture itself is the first one. Roughly one row in nine
comes off the shuttle as a golden weft, and it glints along its whole length with
a shimmer of its own. Finish a cloth and *moonlight* threads unlock — a fourth
spool, cold silver-blue, arrives with a chime. Finish a cloth and the caption
names it; nothing says in advance what is on the loom.

## Sound

Starts muted (browsers won't let a page make noise before a tap), behind the
labelled **Sound off** button in the header, which is a 44 px target on a phone.

Turning sound on answers immediately: a two-note bell (523 → 784 Hz) and the
ambient bed fading up over ~0.35 s. The bed is three layers — a two-oscillator
pad through a lowpass that sits at 46/55/66 Hz depending on the warp tension, a
band of filtered noise breathing at 0.07 Hz like a room, and a slow wooden tick
every 2.7 s that quickens to 1.05 s while a weft is being laid. Everything runs
through a compressor and a short feedback delay (0.27 s, 28 %) for a little
room; the master sits at 0.62.

Every interaction is synthesised per event: the shuttle is filtered noise
sweeping 380 → 1500 Hz; the beat is a 78 → 42 Hz sine with a wooden tock and a
low thud; a pluck is a triangle through a closing lowpass on a C-pentatonic note
chosen by the row you touched; the spools answer with their own pitches; a
tension change is a wooden clack that rises when you tighten; the golden weft is
a slow tremolo of three high sines; finishing a cloth is a four-note bell
arpeggio with the room swelling behind it; the moth is a whisper of three tiny
noise ticks. No samples — everything is oscillators, noise buffers, filters and
envelopes.

## How it was built

**ReScript, on purpose.** It's on the brief's list of languages with a real
static web build and it hadn't had a night. ReScript is OCaml's type system
compiled to ordinary ES modules: the model (rows, shuttle position, palettes,
tension) is a record the compiler checks, the pattern matching on pointer state
is exhaustive, and the output is readable JS that `esbuild` bundles to a 32 KB
file with no runtime. Iteration is fast — a full compile is ~0.4 s, which is how
this got playtested as much as it did.

What it made hard: there is no `arr[i]` and no `mod` in this version, so the
pixel loops use `Belt.Array.getUnsafe` and a hand-rolled `modi`, and every DOM
and Web Audio call is a `@send`/`@get`/`@val` external — about 90 lines of
bindings before a single pixel is painted. Worth it: the compiler caught a dozen
real mistakes (a boolean passed where a float was wanted, a field read off the
wrong record) before a browser ever saw them.

**The cloth is drawn, not rendered.** One canvas, integer pixel scale, no
sprites: the loom frame is rectangles, the warp is 32 swaying vertical lines
whose amplitude is the tension, and the cloth is 640 little squares per frame,
each the palette colour of its motif cell with a faint twill alternation and a
hairline shadow where the weft settles over the warp. The uncovered warp below
the fell line shortens as the cloth grows down into it, so the loom fills up as
you work.

**A bug worth keeping.** The whole cloth rendered as a fog of the background
gradient at first. The cause: my colour shading mixed toward black or white and
then formatted each channel with `string_of_int` — so `#eaf4d8` came back as
`#234244217`. Canvas *silently ignores* an invalid `fillStyle` and keeps the
previous one, which happened to be the page gradient, so every palette colour
looked like smoke and no error was ever raised. Printing the value of `shade()`
into the page's own debug line found it in a minute. Sanity-check your colour
strings; the canvas will not tell you.

**Testability.** The page publishes a short state string
(`woven=7;pal=1;complete=0;fell=190;…`) onto `window.threadloomState` every
0.2 s. The Playwright pass reads it to drive and assert the weft, the beat, the
palettes, the tension, the moth and the completion, on a phone and a desktop
viewport. `test/art-check.mjs` guards the woven pictures (three motifs, exactly
32 × 20, only known glyphs) and runs inside `build.sh`.

## What I'd do next

- Weave *your own* picture: a small grid you can paint before warping, so the
  loom makes your drawing instead of one of the three.
- Real loom patterns: a heddle you can lift to change which warp threads rise,
  giving twill, herringbone and a woven-in date.
- A cloth shelf: the finished cloths could hang along the top of the frame, so a
  long session leaves a row of small weavings behind.
- Let the moth bring something: a dropped thread, or a second moth after a
  longer stillness.

## Files

```
index.html        the shell: header, sound button, canvas, caption, one hint line
src/Motifs.res    the three woven pictures (32 × 20 pixel art) and the four palettes
src/Sound.res     the whole audio engine: bed, voices, one per interaction
src/Main.res      loom model, layout, painting, pointer handling, the state probe
test/art-check.mjs  guards the art: 3 motifs × 20 rows × 32 columns, 5-colour palettes
build.sh          npm ci → art check → rescript build → esbuild → dist/
```
