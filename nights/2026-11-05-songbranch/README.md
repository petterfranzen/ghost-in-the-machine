# Songbranch

A pixel-art tree at dusk, and four small birds on its branches. Tap a bird: it
hops to another branch and sings one soft note — one step further up a
pentatonic scale each time you ask it. Tap the trunk: the whole tree gives a
little and settles back. Tap the sky: only the leaves move. Everything fades
gradually; nothing flashes.

**Follows Petter's wish of 2026-11-02**: keep the pixel art and the calm,
one-handed feel, and make a tap feel impactful — a soft pulse, a small gentle
sound, a slight settle of the whole scene — without breaking the quiet.

It is deliberately **not another pond**. The last two nights were water; this
one is a tree you can hear.

## Play it

Open `dist/index.html` in any browser — it also works straight from disk. No
server, no network, no fonts, no CDNs: everything is in `dist/`.

- **tap / click a bird** — it hops and sings (sound stays off until you press ♪)
- **tap the trunk** — the whole tree sways and settles
- **tap the sky** — a breath of wind through the leaves
- **tap the grass** — only the grass stirs
- **keyboard** — focus the tree, then Enter/Space calls the next bird, `T` knocks the trunk

## Build it

```sh
mise install        # Go 1.27.2 and Node 22.23.4
./build.sh          # writes dist/ (module as base64, four files)
```

`build.sh` compiles `cmd/wasm` to wasm32, inlines it as base64 into
`dist/wasm.js`, copies the three web files, then runs the checks and the smoke
test. The smoke test runs the real module in Node, with no browser.

## How it is made

- `world/` — the whole simulation and software renderer, in Go: the sky, the
  tree, the springs that make branches give and settle, the birds, the notes.
  It imports only `math`, so it runs under `go test` and as wasm32.
- `cmd/wasm/` — the browser glue: eleven small functions the page may call.
- `src/` — `index.html`, `style.css`, `app.js`: blit the frame, forward a
  thumb, and make sounds only after the visitor asks.
- `cmd/preview/` — paints a frame to a PNG without a browser, for looking at
  the pixels while drawing them.
- `dist/` — committed, so the piece opens from the repo as-is.

The canvas is 176×312 pixels, drawn by Go and upscaled with nearest-neighbour,
so it stays crisp on a phone and costs almost nothing to paint. Go owns every
position; the page only copies bytes and puts them on a canvas.

## The tap, in detail

- **A bird** sings one note from A minor pentatonic (A3–A5). Each bird keeps
  its own place in the scale and steps up when tapped again; two birds tapped
  together still belong together. The bird hops on a shallow arc, the branch it
  left springs up, the branch it lands on dips — both are damped springs that
  come to rest. Two soft feathers drift off and fade. A warm glyph rises and
  fades. If sound is on, the note plays with a slow envelope and a short,
  quiet space.
- **The trunk** takes a knock: the whole tree's body spring takes the hit and
  every branch and leaf cluster answers a little. If sound is on, a low knock
  and a soft rustle.
- **The sky** and **the grass** only move what is near them, so a stray thumb
  never feels like a mistake.

## Care taken

- **Sound is off until opted in.** The ♪ button starts `aria-pressed="false"`,
  the AudioContext is not even created until it is pressed, and the master gain
  stays at zero until then. Nothing plays on load or on the first tap.
- **44 px targets.** The sound button is at least 44×44 px (48.4 px high at
  390 px). The canvas is one large target; a bird's effective tap radius is
  15 art pixels — about 58 CSS px across on a 390 px phone.
- **AA contrast.** Body text `#a99e8e` on `#14121c` is 7.0:1; the sound
  button's border is 3.68:1 against the page; the caption turns `#ffcc8a`
  (12.6:1) when it answers.
- **Reduced motion.** With `prefers-reduced-motion: reduce`, the simulation's
  motion scale drops to 0.35 (shorter hop arcs, smaller sway, fewer feathers),
  CSS transitions are off, and the smoke test asserts the tree sways
  measurably less and still settles. Nothing is removed: the birds still hop
  and sing.
- **No external requests.** The build's browser check fails if the page
  requests anything that is not `file:` or `data:`.
- **No flash.** Every layer is alpha-blended with small alphas and long
  fades; there are no white frames and no hard cuts.
- **Quiet console.** The browser check fails on any console error or warning.

## Next

- Let a second bird answer a phrase back, a beat later, so two birds can trade
  a slow call and response.
- Give the tree one long, slow event — a whole flock arriving at once — that
  happens once per session, not on a tap.
- Remember the last note in `localStorage` so the piece opens where you left it.
