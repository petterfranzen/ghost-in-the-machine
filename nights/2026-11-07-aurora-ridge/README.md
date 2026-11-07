# Aurora Ridge

A quiet pixel-art ridge at night. Tap anywhere in the sky and a ribbon of
aurora blooms above the hills — it brightens softly, drifts, and fades while
the whole scene gives a gentle settle. Tap high for a higher note, low for a
deeper one (sound is off until you ask for it). Nothing is timed, scored or
counted.

**Follows Petter's wish of 2026-11-02**: keep the pixel art, keep the calm and
one-handed feel, and make a tap feel impactful — a soft bloom, a small gentle
sound, a slight settle — without breaking the quiet. It is deliberately **not
another pond**: the last two nights were water and a tree, so this one is light
in the sky over a sleeping ridge.

## Play it

Open `dist/index.html` in any browser — it works straight from disk. No server,
no network, no fonts, no CDNs: everything is in `dist/`.

- **tap / click the sky** — a ribbon of light rises, hangs, and fades
- **Raise a ribbon** — the same thing from the keyboard or a screen reader
- **♪ Sound off / on** — creates the audio channel only when you press it
- **keyboard** — focus the scene and press Enter or Space

## Build it

```sh
mise install   # Dart 3.13.6 and Node 24.22.2
./build.sh     # writes dist/
```

`build.sh` fetches the one Dart package (`web`, the `dart:js_interop`
bindings), compiles `src/main.dart` to a single plain JavaScript file, copies
the page and the house design system, then runs `node --check` and the smoke
check. The result is six files in `dist/`.

## How it is made

- **Dart → JavaScript.** The whole simulation and renderer is `src/main.dart`,
  compiled by `dart compile js`. I picked Dart because it is nowhere in the
  log, it ships its own static web build, and its `package:web` bindings talk
  to the real DOM and canvas without a bundler.
- **Pixel art on a canvas.** The scene is drawn at 192 × 108 and scaled up with
  `image-rendering: pixelated`, so every star, curtain and pine keeps a hard
  pixel edge.
- **The house design system, worn at runtime.** The page loads
  `crew/design/tokens/base.css`, `section9.css` and `components.css` (copied
  into `dist/design/` by the build, so `dist/` stays self-contained). The Dart
  scene then reads `--bg`, `--accent`, `--info`, `--success` and `--text` off
  `:root` with `getComputedStyle` — the aurora, the hills and the haze are
  mixed from those token values, so the scene follows the theme instead of
  hardcoding a palette.
- **Sound.** A soft two-oscillator sine with a long attack and a three-second
  release, at very low gain. The `AudioContext` is constructed inside the
  toggle's click handler and nowhere else.
- **Motion.** `prefers-reduced-motion` removes the drift, the twinkle, the
  settle and the bloom; ribbons then simply fade in and out where you tapped.

### House rules

| Rule | How it is met |
| --- | --- |
| Sound off until opted in | no `AudioContext` before the toggle click (the playtest counts constructions) |
| 44 px touch targets | `.btn` is 2.75 rem; the skip link is lifted to 44 px here |
| AA contrast | every colour is a Section 9 token; the design system's contrast pairs are AA |
| Reduced-motion variant | `matchMedia` in Dart plus the design system's CSS media query |
| No external requests | no `@font-face`, no `@import`, no fetch; the playtest asserts zero non-`file:` requests |
| Works on a phone | 390 × 844 tested: no sideways scroll, controls in thumb reach |

## Checks

```sh
node tools/smoke.mjs dist        # static: self-contained, house rules present
node tools/playtest.mjs          # Chromium at 390x844: taps, sound, targets, motion
```

`tools/playtest.mjs` needs Playwright; it is a development check, not part of
the build.

## What I would do next

- A second interaction: hold to widen a ribbon into a slow drift, so the sky
  accumulates a little weather over a session.
- A few bird silhouettes crossing the far ridge, one note each, only when sound
  is on.
- Let the ridge react to the aurora — a faint rim light on the pines as a
  ribbon passes over them.
