# `ghost.yaml` — Hermes dashboard theme

A theme for the Section 9 Hermes dashboard, drawn as an original homage to the
1995 *Ghost in the Shell* look: a near-black CRT, phosphor green for the chrome,
cyan lenses, amber for warnings and focus, an all-monospace instrument panel
with scanlines and one quiet glitch. No film frames, stills, or logos are used
or implied — the palette is the one our own HQ page (`crew/themes/gits95.css`)
already wears, and the only artwork is the crew's own avatars.

## Looks at a glance

| | |
| --- | --- |
| Palette | background `#060b09`, phosphor `#8bffbe`, top highlight `#e6f2ea` |
| Accents | cyan `#5be7d8` (lenses), amber `#ffb454` (warnings, focus ring) |
| Type | `Share Tech Mono` body and code, `Rajdhani` display |
| Layout | `cockpit` (left rail + content), `radius: 0`, `density: compact` |
| Motion | CRT scanlines, faint wireframe grid, a rare glitch on headings |

## Install

The theme is a single YAML file; the dashboard picks it up at runtime, with no
build step.

```bash
cp hq/ghost.yaml ~/.hermes/dashboard-themes/
```

Then open the dashboard, click the palette icon in the header, and pick
**Ghost in the Shell 1995**. The choice is stored under `dashboard.theme`.
The VPS copies `hq/*.yaml` from `main` into the themes folder, so merging this
folder is the whole deploy.

## What each block does

- **`palette`** — the three colour layers the dashboard turns into every
  shadcn token via `color-mix()`, plus an amber tube glow (`warmGlow`) and a
  low grain (`noiseOpacity: 0.55`).
- **`typography`** — body and code both read `Share Tech Mono`; headings take
  `Rajdhani` so the numbers and the chrome stay monospaced while titles get a
  step of their own. Fonts load from Google Fonts through `fontUrl`.
- **`layout` / `layoutVariant`** — zero radius and compact density for the
  instrument feel; `cockpit` puts a rail beside the content (the rail is
  populated by plugins, so it shows a placeholder until one is installed).
- **`assets`** — the crew avatars in `crew/avatars/`, reused as theme assets
  and served from `main`, so the theme carries no binary of its own. `bg` is
  `none`: the canvas stays black rather than taking a photographic backdrop.
- **`colorOverrides`** — the named tokens the palette cascade would not land
  exactly (the amber focus ring, the cyan accent, the warning and success hues).
- **`componentStyles`** — the notched card, the header/rail hairlines, the
  clipped tab, and the green-to-cyan progress bar.
- **`customCSS`** (~3.9 KiB, cap is 32 KiB) — the selector-level parts: the
  scanline overlay, the wireframe grid, themed scrollbars, selection and
  placeholder colours, the amber `:focus-visible` ring, and the one glitch
  animation.

## Contrast (WCAG AA)

Every text pair shipped by the theme clears AA (body text needs 4.5:1):

| Foreground on `#060b09` | Ratio | | Foreground on `#060b09` | Ratio |
| --- | --- | --- | --- | --- |
| `#e6f2ea` highlight | 17.2:1 | | `#ffb454` amber | 11.2:1 |
| `#8bffbe` phosphor | 16.2:1 | | `#4fd68c` success | 10.7:1 |
| `#5be7d8` cyan | 13.1:1 | | `#ff8a5c` warning | 8.5:1 |
| `#9db3a7` muted | 8.9:1 | | `#060b09` on phosphor | 16.2:1 |

Muted text sits on the card fill `#0b1410` as well, still 8.4:1.

## Motion

Nothing moves unless the visitor allows it. The scanline flicker and the
heading glitch live inside `@media (prefers-reduced-motion: no-preference)`,
and a `prefers-reduced-motion: reduce` block switches every animation and
transition off and pins the scanline opacity. The theme never relies on motion
to carry meaning.

## Preview

`preview.html` is a static mock of the dashboard shell used to render
screenshots for review; its tokens mirror `ghost.yaml` and the two should be
kept in sync. Open it directly, or render it with the sandbox's `shoot`.

## Impeccable

`impeccable detect hq/` reports **0 anti-patterns**. Two advisory notes remain,
both deliberate and both pinned by the brief: the repeating-gradient scanlines
and the two-axis grid. The grid earns its place because this is a measurement
surface — an ops HUD, not a marketing page — and the scanline texture is the
subject of the theme, not decoration sprinkled on top. The only coloured bloom
in the theme is a 14%-alpha phosphor glow on headings, which is the CRT's own
lighting rather than an elevation shadow; card depth uses a neutral, offset
shadow instead.

## Notes

- Because the live dashboard is private to the operator, the screenshots come
  from the local mock, not from the production shell. The theme's own blocks
  are the part under review.
- Heading accents are drawn with `::after` generated content, which some screen
  readers announce. If that turns out to be noisy in practice, drop the
  `h1::after, h2::after` rule and keep the amber in the focus ring and warnings.
