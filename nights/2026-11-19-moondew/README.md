# Moondew

A moonlit pond, seen from above, in which you draw **one trail** with one thumb.
The koi's stone is the only place the trail may start; from there you drag it
across the water to wake every moon-dew, without crossing your own line.

It is a puzzle game this time, not a toy. Every pond has a goal you can see
from the first second (the dew still glowing on the water), a rule that teaches
itself the moment you break it, and a pond after pond that grows wider and
meaner. Nothing is timed and nothing rushes you.

## The wish it follows

Petter's wish for the night of 19 Nov, and the one this night follows:

> make it **more of a game** … Build it around a real game loop: a clear goal you
> can see from the first screen, rules you learn by playing, a challenge that
> grows (levels, a puzzle that gets harder, a run that goes further), and visible
> progress or an ending (levels cleared, a collection filled, a puzzle solved).
> Losing is fine if it's gentle: an instant retry, never a game-over wall. …
> Say in the PR what the goal is, how it gets harder, and how a player knows
> they've progressed.

So: a pond the way Petter liked it (the koi and the water are kept from Koi
Drift and Ripple Pool, from the 2 Nov wish), with an actual game inside it.

- **The goal:** wake every moon-dew in the pond with a single unbroken trail.
- **The rules, learned by playing:** the trail may not cross itself; moss
  refuses it; a woken dew stone closes behind you (so order matters); deep
  water is the one place the trail may cross itself again; and where a current
  runs, the trail must leave the way it flows.
- **How it gets harder:** twelve ponds, from a 4x4 with five dew and no moss to
  an 8x9 with sixteen dew, a quarter of it moss, deep water and currents — then
  the pond keeps going, a little fuller each time.
- **How progress is visible:** a row of flowers at the top lights one petal per
  pond woken, the label counts the ponds, and the pond you are in visibly fills
  with light as the dew wakes. The final pond opens the whole surface into
  bloom; after that the water simply keeps going.
- **Losing gently:** when the trail is walled in with dew still asleep, the
  water stills, the ripple settles, and the trail comes back to the koi's stone
  by itself a second later. There is no game-over screen and no score to lose.

## The language: OCaml, compiled by js_of_ocaml

Every night gets a language that has not been used before. OCaml has been on my
list for a while (it is on the backlog in `LOG.md`): a real compiler with a
genuinely different feel — one small typed core, modules everywhere, and a
pattern matcher that makes the rules of a puzzle pleasant to write down.
`js_of_ocaml` compiles the bytecode straight to a JavaScript file, so the night
still ships as a static site with no runtime download.

The pond is grown backwards, which is the nicest trick of the night: a random
trail is walked first, and the puzzle is read off it. Every level is therefore
solvable by construction — the trail that made it *is* the solution, and the
hint (long press) simply points one step further along it. The tests replay
that trail through the rules engine for every pond, so a generator that ever
built an unsolvable pond would fail loudly.

## Building and running

Needs `opam` (the `mise.toml` here pins one). The build creates a local switch
on the first run, which takes a few minutes; after that it is quick.

```bash
mise install
bash build.sh          # writes the static site into dist/
python3 -m http.server 8080 --directory dist
```

Then open <http://localhost:8080>. There are no dependencies at runtime: the
committed `dist/` is a plain `index.html`, `style.css` and one `moondew.js`.

Run the checks (generator and rules, for all thirteen pond shapes) with:

```bash
eval "$(opam env --switch=. --set-switch)"
dune runtest
```

## How to play

- **Drag** from the koi's stone (or from the head of the trail) across the
  water. The trail follows your thumb one stone at a time.
- **Tap the head of the trail** to step back one stone.
- **Long press** anywhere for a nudge: the next step of a solution glints for
  a few seconds (free, always available).
- **Swipe** across open water for ripples and a small koi splash — the scene
  remembers, and the koi will not settle for a while.
- **Tap the dark moss** and the trail stops with a soft thud (moss takes no
  step); the trail answers with a ripple on the stone you could not take.
- **Idle** for a while on a fresh trail and the pond offers the same glint by
  itself, so nobody gets stuck in silence.
- **Arrow keys / z / h / r** do the same on a desktop.

The legend under the pond fills in by itself as deep water and currents first
appear — a rule is never named before you can meet it.

## Sound

It starts muted, behind the Sound button (44 px, top right) and the choice is
remembered in `localStorage`. Turning it on answers immediately: a two-note
chime and the ambient bed fading in over a third of a second.

- **Bed, three layers:** a low-passed noise wash (the water), a slowly detuned
  three-oscillator pad, and a 0.07 Hz tremolo leaning on the pad. The bed
  follows the play: more trail raises the water layer, more dew wakes the pad.
- **Each step** rings a soft triangle note up a pentatonic ladder as the trail
  grows, so a long trail becomes a slow phrase.
- **Waking a dew** is a two-partial sine chime, a little brighter with each one.
- **Moss** answers a drag into it with a low, short thud; a current that
  refuses a step uses the same voice.
- **Undo, ripples, koi:** a filtered noise splash, a band-passed ripple, and a
  short downward plop when the koi stirs.
- **The water stilling** is a gentle falling pair of notes, and **waking a
  pond** is a five-note bloom with a high shimmer.
- Everything meets a master gain of 0.62 and a compressor, so many sounds at
  once stay soft instead of clipping.

## How it was built

The whole pond is synthesised — no sprite sheet, no samples. Each stone is a
handful of snapped rectangles drawn in canvas coordinates, so the grid stays
crisp at any scale, and every animation is a function of time and a hash, which
means no state to keep in sync. The palette is deliberately flat: indigo water,
three shades of moss, one warm stone for the koi, and pale dew with a pulsing
halo.

The game engine is separate from all of that: `level.ml` grows ponds,
`game.ml` knows the rules and nothing else, `draw.ml` only looks, `audio.ml`
only listens, and `main.ml` wires the browser to them. That split is why the
tests can replay a pond in plain OCaml without a browser anywhere near them,
and why the rules were the easiest part of the night to get right — the pattern
matcher turns "may the trail step here" into four short lines.

What OCaml made easy: the rules, the generator and the tests, all of which were
written in one pass and worked. What it made harder: the browser. `js_of_ocaml`
is happy to be untyped, but the compiler cannot see through the DOM, so every
canvas call and every Web Audio node needed a small declared helper — that is
why all of it lives in `js.ml` and `audio.ml` and nowhere else. The one lesson
worth keeping: the trail is a *list*, the changes are pure functions of it, and
undo/reset/still are all just "build the same state from a shorter trail" —
which removed a whole class of bugs before they existed.

## Code health

CodeScene does not score OCaml (`cs review` answers *Unsupported file-type
".ml"*), so there are no Code Health scores for this night. The code is kept to
the same shape by hand: every function is short, nesting stays at two levels,
the pond shapes live in one data table, and no file reaches 300 lines.

## What I would do next

- A pond that can be solved more than one way, and a quiet acknowledgement when
  you find a shorter trail than the last.
- Dew that sleeps in pairs: waking one leaves a ripple in the other, so the
  order of the whole pond matters.
- Let the ponds be revisited from the flower row, and let the koi of a woken
  pond stay in the water as a small resident.
- A first-run glint on the very first stone, so the tap-to-start is unmistakable
  on a phone with a thick thumb.
