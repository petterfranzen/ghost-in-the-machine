# nights/_shared — the house behaviours, in one small file

`interact.js` is a single plain ES module (no build step, no dependencies) with
the four interaction habits Petter asked every night to share: a tap that
answers at once, a poke that **nudges** instead of killing, a soft hint after
the player goes quiet, and a phone screen that actually fills the screen. A
night copies the file into its own folder with `build.sh`, so each night stays
self-contained and the page never reaches outside `dist/`.

This folder is not a night: it has no `build.sh` or `dist/`, and it is not in
`LOG.md`, so the Pages landing page and the night build job ignore it.

## The four exports

```js
import { onTap, nudge, idleHint, fullscreenOnMobile } from './interact.js';
```

- `onTap(el, fn)` — one tap: a finger down and up in the same spot. It listens
  to pointer events, so there is no 300 ms delay, and it ignores multi-touch
  and drags (a second finger or a move of more than 12 px is not a tap). It
  fires on `pointerup`, so a press-and-hold can be a nudge instead. Returns a
  function that removes the listeners.
- `nudge(el, fn)` — a poke gets a gentle answer. `fn` is called with the
  strength (0 to 1) easing up while the finger rests, then 0 when it lifts so
  the night can settle back, plus the pointer event so you know where the poke
  was. Nothing is killed, hidden or ended here; that choice stays with the
  night.
- `idleHint(el, { after = 12000, show, hide })` — after `after` ms of stillness
  it shows a soft hint (at most three times a session) and hides it on the next
  input. `show`/`hide` are handed the element so you can run your own reveal —
  e.g. a class that fades it in; pass neither and the helper just toggles the
  element's `hidden` attribute. The element also carries
  `data-motion="motion|reduced"`, so CSS can drop its transitions.
- `fullscreenOnMobile(el, { padding = true })` — sets a `100dvh` height (`100vh`
  as the fallback), keeps the safe-area insets clear, and drives the Fullscreen
  API where the platform has it. iOS Safari has no element fullscreen, so there
  the CSS fill is the whole fix and `supported` reads `false`. Returns
  `{ supported, mobile, isOn, enter, exit, toggle }`.

## The house rules it keeps

Pointer events rather than touch or click (no 300 ms delay); multi-touch
ignored; a poke always answers gently and never ends the scene; reduced motion
respected — the idle hint appears without animating (the element carries
`data-motion="motion|reduced"`, so CSS can drop its transitions, and `nudge`
gives one static answer instead of ramping); sound untouched, so a night stays
silent until the player opts in. Targets and text are the night's own CSS to
keep: 44 px controls, 16 px text.

## How a night copies it in

The helper is not committed inside the night folder; `build.sh` copies it into
`dist/` next to the built page, so the folder Pages publishes is complete on
its own:

```bash
# in nights/YYYY-MM-DD-slug/build.sh, after the app is built
cp ../_shared/interact.js dist/interact.js
test -s dist/interact.js
```

Then the page imports it and wires only what it needs:

```html
<script type="module">
  import { onTap, nudge, idleHint, fullscreenOnMobile } from './interact.js';
  onTap(document.getElementById('stage'), (e) => window.appTap(e));
  nudge(document.getElementById('stage'), (s, e) => window.appNudge(s, e));
  idleHint(document.getElementById('hint'), { after: 12000 });
  fullscreenOnMobile(document.documentElement);
</script>
```

ES modules must be served over http(s); a `file://` page cannot import them. In
practice that means `python3 -m http.server -d dist` while you work — the same
thing Pages does for you in the morning.

## The demo

`demo.html` is a small, calm page that exercises all four exports: rest a finger
on the pond to bloom it, tap for a ring, wait four seconds for the hint, and
try the full-screen button. Serve the folder and open it:

```bash
python3 -m http.server -d nights/_shared 8080   # http://localhost:8080/demo.html
```

## Used by

- `nights/2026-10-28-ripple-pool` — retrofitted as the proof it works; the pond
  taps through `onTap`, a rested finger blooms it through `nudge`, the "tap the
  water" hint is an `idleHint`, and the page fills the phone screen through
  `fullscreenOnMobile`. Newer nights should do the same rather than rolling
  their own pointer code.
