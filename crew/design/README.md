# Section 9 — design system

One base of tokens, two themes, one component sheet, for every Section 9
output: documents, decks, dashboards (the Hermes dashboard, the crew HQ page,
status pages) and the portfolio.

- **Professional** — from the approved portfolio (direction A, portfolio PR #8).
  Inter, one mint accent, soft surfaces, dark and light.
- **Section 9** — the GITS-95 ops room. Share Tech Mono body, Rajdhani display,
  phosphor green, zero radius, amber focus, dark only.

## Files

| Path | What it is |
| --- | --- |
| `tokens/base.css` | Theme-independent scales: type, space, radius, elevation, motion, and the semantic slots. |
| `tokens/professional.css` | Professional palette, dark and light. |
| `tokens/section9.css` | Section 9 palette and effects. |
| `tokens/tokens.json` | The same values for other tools, with the semantic slot list. |
| `tokens/contrast.json` | The text/UI pairs the system promises, with their minimum ratios. |
| `components.css` | Page shell, dashboard shell, type, tables, cards, stats, charts, callouts, code, slides, print. |
| `index.html` | Contact sheet: every token and component, with live contrast checks. |
| `docs.html` | Usage docs: quick start, tokens, components, accessibility, rules. |
| `dashboard.html` | Dashboard component set (rail, stats, chart, roster, activity) on real `crew/status.json` values. |
| `slides.html` | Deck template: eight 16:9 layouts, print rules. |
| `claude-design-system.md` | The Professional brief for Slides work, written to be loaded whole. |
| `favicon.svg` | The Section 9 mark as a favicon. Every page inlines it as an SVG data URI; `check.py` keeps the inline copy in step with the file. |
| `theme.js` | Optional header theme switch, used by the sample pages only. |
| `tools/check.py` | Proves `tokens.json` matches the CSS and recomputes every contrast pair. |

## Use it

```html
<html data-theme="professional" data-mode="dark">
  <link rel="stylesheet" href="crew/design/tokens/base.css">
  <link rel="stylesheet" href="crew/design/tokens/professional.css">
  <link rel="stylesheet" href="crew/design/components.css">
</html>
```

Every page also carries the favicon — the mark in `favicon.svg`, inlined as
`<link rel="icon" href="data:image/svg+xml,…" type="image/svg+xml">` — so a
static server never 404s on `/favicon.ico`. A night folder does the same in its
`dist/index.html`; `tools/check.py` fails if an inline copy drifts from the file.

Swap `professional.css` for `section9.css` and drop `data-mode` for the ops
room. One theme per surface; never mix them.

## Check it

```bash
python3 crew/design/tools/check.py crew/design
# ok 152 checks: 128 token values in sync, 24 contrast pairs pass AA
```

Screenshots and a served-page Impeccable scan back the accessibility claims:
both themes clear WCAG AA, `prefers-reduced-motion` removes the scanline and
all transitions, and the pages hold at 390px without sideways scroll.

## Rules of the road

- One accent per region: links, the active nav item, one figure, chart series 1.
- Doctrine: `--bg` → `--surface` → `--text`, with hairlines for structure.
- Never hardcode a colour outside the token files.
- Section 9 stays dark. Paper and projectors take Professional light.
- The Hermes dashboard theme in `hq/ghost.yaml` is the same palette expressed in
  the dashboard's own contract; keep the two in step.
- Text is 16px. Labels — eyebrow, badge, tag, table header, kicker and small
  copy — are the exception: 12px is the floor. The eyebrow is a label, not
  decoration: it names the section, so it stays at 12px, and it never carries
  the only copy of a fact. The decision lives in `--fs-eyebrow`.
