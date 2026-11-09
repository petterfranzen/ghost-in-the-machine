# Songbranch

A pixel-art tree at dusk: six small birds and two chicks on its branches. Tap a
bird and it **nudges** — a small hop in place, a flutter of wings, one soft
note — then settles back onto the same branch. Nothing flies away and nothing
disappears. Tap the trunk and the whole tree gives and settles. Swipe through
the leaves and the fireflies rise. A few small things are hidden for anyone who
wants to look.

**Follows Petter's wish of 2026-11-02**: keep the pixel art and the calm,
one-handed feel, and make a tap feel impactful — a soft pulse, a small gentle
sound, a slight settle of the whole scene — without breaking the quiet. Also
follows his 7 Nov note on the first build: tap the birds to nudge, not to kill;
fill the phone screen; give the piece a few more things to find.

It is deliberately **not another pond**. The last two nights were water; this
one is a tree you can hear.

## Play it

Open `dist/index.html` in any browser — it also works straight from disk. No
server, no network, no fonts, no CDNs: everything is in `dist/`.

On a phone the scene fills the viewport edge to edge (portrait and landscape,
safe areas respected, no scrolling).

- **tap a bird** — it hops in place and sings one soft note; it stays on its branch
- **tap the trunk** — the whole tree sways and settles
- **tap the sky** — a breath of wind through the leaves
- **tap the grass** — only the grass stirs
- **keyboard** — focus the tree, then Enter/Space nudges the next bird, `T` knocks the trunk

### Small things to find

None of these are required. After a while the piece offers a quiet hint.

1. **The moon** — tap it and its old light answers; a star crosses the sky.
2. **The nest** — hold it a moment and a chick peeps out, then ducks back.
3. **The leaves** — swipe through them and the fireflies lift.
4. **A melody** — tap four different birds from low to high and the tree remembers a tune.
5. **A rare visitor** — now and then a shooting star crosses the sky on its own.

## Build it

```sh
mise install        # Go 1.27.2 and Node 24.22.2
./build.sh          # writes dist/ (module as base64, four files)
```

`build.sh` compiles `cmd/wasm` to wasm32, inlines it as base64 into
`dist/wasm.js`, copies the three web files, then runs the checks and the smoke
test. The smoke test runs the real module in Node, with no browser.

## How it is made

- `world/` — the whole simulation and software renderer, in Go: the sky, the
  tree, the springs that make branches give and settle, the birds and chicks,
  the moon and nest, the fireflies and leaves. It imports only `math`, so it
  runs under `go test` and as wasm32.
- `cmd/wasm/` — the browser glue: small functions the page may call.
- `src/` — `index.html`, `style.css`, `app.js`: blit the frame, forward a
  thumb, and make sounds only after the visitor asks.
- `cmd/preview/` — paints a frame to a PNG without a browser, for looking at
  the pixels while drawing them.
- `dist/` — committed, so the piece opens from the repo as-is.

The art is 176×312 pixels in its own frame. On a phone the frame grows to the
viewport's aspect (the sky and ground carry past the art), so the tree still
sits at its own pixel size while the scene fills the screen. Go owns every
position; the page only copies bytes and puts them on a canvas.

## The tap, in detail

- **A bird** gives a small hop on its own branch — it never leaves it. Its wings
  flutter, its branch dips and springs back, and a warm glyph rises and fades.
  A neighbour answers a beat later, one step down the scale, so two birds can
  trade a slow call and response. If sound is on, the note plays with a slow
  envelope and a short, quiet space. Chicks sing a little higher and climb the
  scale faster.
- **The trunk** takes a knock: the whole tree's body spring takes the hit and
  every branch and leaf cluster answers a little. If sound is on, a low knock
  and a soft rustle.
- **The sky** and **the grass** only move what is near them, so a stray thumb
  never feels like a mistake.

## Care taken

- **Sound is off until opted in.** The ♪ button starts `aria-pressed="false"`,
  the AudioContext is not even created until it is pressed, and the master gain
  stays at zero until then. Nothing plays on load or on the first tap.
- **44 px targets.** The sound button is at least 44×44 px. A bird's effective
  tap radius is 15 art pixels, which stays comfortably large at phone scale.
- **AA contrast.** Body text `#b9af9f` on `#14121c` is 7.0:1 or better; the
  sound button's border is at least 3:1; the caption turns `#ffcc8a` when it
  answers. Text is 16 px or larger throughout.
- **Reduced motion.** With `prefers-reduced-motion: reduce`, the simulation's
  motion scale drops to 0.35 (smaller hops, smaller sway, fewer feathers), CSS
  transitions are off, and the smoke test asserts the tree sways measurably
  less and still settles. Nothing is removed: the birds still hop and sing.
- **Fractional pointers.** Tap and hold coordinates are `float64` end to end, so
  a click at x.37, y.61 lands where it should. The smoke test and the browser
  check both tap at fractional coordinates.
- **No external requests.** The build's browser check fails if the page
  requests anything that is not `file:` or `data:`.
- **No flash.** Every layer is alpha-blended with small alphas and long
  fades; there are no white frames and no hard cuts.
- **Quiet console.** The browser check fails on any console error or warning.

## Next

- Let the melody be replayable: once found, keep it in `localStorage` so the
  tree can hum it back on a later visit.
- Give the rare visitor its own small interaction, so catching it feels like
  something.
- Let the light drift slowly from dusk toward night over a long session.
