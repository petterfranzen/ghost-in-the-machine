# Section 9 — Professional design system

For Claude design work on Section 9 slides and documents. Load this file whole;
it is the complete brief. It describes the **Professional** theme only. The
Section 9 ops-room theme is a different room and is not for decks unless the
deck is internal and explicitly says so.

Version 1.0 · 4 November 2026 · source: `ghost-in-the-machine/design/`

---

## 1. The look in one paragraph

Quiet, dark, and precise. A near-black page, one hairline-separated surface at a
time, generous type at a comfortable measure, and a single mint accent used
sparingly enough that it still means something. No gradients, no glass, no
drop shadows doing the work of hierarchy, no decorative illustration. The
hierarchy comes from size, weight, space and hairline rules — never from colour
volume. When in doubt, remove something.

If the light theme is requested, it is paper: warm off-white `#f7f7f4`, white
surfaces, near-black ink, and a deeper green accent so it still clears AA on
paper. Same everything else.

---

## 2. Tokens

### Colour — dark (default)

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#08090c` | Page floor. Never use for a card. |
| `--bg-soft` | `#0c0e13` | Section band behind cards, deck chrome. |
| `--surface` | `#10131a` | Cards, tables, slides, charts. |
| `--surface-2` | `#151922` | Table heads, code blocks, hover rows. |
| `--surface-3` | `#1b2030` | Nested surfaces, pressed states. |
| `--line` | `rgba(255,255,255,.09)` | All hairlines and borders. |
| `--line-strong` | `rgba(255,255,255,.16)` | Control borders, emphasised rules. |
| `--text` | `#f3f4f8` | Body and headings. |
| `--text-muted` | `#a9aebd` | Lede, secondary copy, table labels. |
| `--text-faint` | `#7d8394` | Captions, slide numbers, footers. |
| `--accent` | `#7af0c8` | Links, active nav, one figure, series 1. |
| `--accent-ink` | `#04140f` | Text on the accent. |
| `--accent-soft` | `rgba(122,240,200,.12)` | Accent wash behind a mark. |
| `--accent-line` | `rgba(122,240,200,.35)` | Accent hairlines, chart series 1. |
| `--success` | `#6fe0b0` | Passing, shipped, healthy. |
| `--warning` | `#ffc46b` | Attention, budget at risk. |
| `--danger` | `#ff8f8f` | Failure, destructive. |
| `--info` | `#8ab4ff` | Neutral informational. |

### Colour — light

| Token | Value |
| --- | --- |
| `--bg` | `#f7f7f4` |
| `--bg-soft` | `#efefea` |
| `--surface` | `#ffffff` |
| `--surface-2` | `#f2f2ee` |
| `--line` | `rgba(16,17,22,.10)` |
| `--line-strong` | `rgba(16,17,22,.20)` |
| `--text` | `#101116` |
| `--text-muted` | `#4d5260` |
| `--text-faint` | `#5a5f6e` |
| `--accent` | `#0b6b52` |
| `--accent-ink` | `#ffffff` |
| `--accent-soft` | `rgba(11,107,82,.10)` |
| `--success` / `--warning` / `--danger` | `#116b4c` / `#8a5300` / `#a11d2b` |

### Chart series

Fixed order, never re-ordered per chart, never more than six.

| | Dark | Light |
| --- | --- | --- |
| `--chart-1` | `#7af0c8` | `#0b6b52` |
| `--chart-2` | `#8ab4ff` | `#1d4ed8` |
| `--chart-3` | `#c3a6ff` | `#6d28d9` |
| `--chart-4` | `#ffd28a` | `#92400e` |
| `--chart-5` | `#ff9db0` | `#9f1239` |
| `--chart-6` | `#6fd7e8` | `#0f766e` |

Grid lines: theme `--line`. Axis labels: `--text-faint`, 12px mono.

### Type

| Token | Size | Use |
| --- | --- | --- |
| `--fs-display` | `clamp(2.5rem, 1.6rem + 4vw, 4.5rem)` | Portfolio hero, title slide |
| `--fs-2xl` | 36px | Document `h1` |
| `--fs-xl` | 28px | Section `h2` |
| `--fs-lg` | 22px | `h3`, dashboard titles |
| `--fs-md` | 18px | `h4`, card titles, lede |
| `--fs-base` | 16px | Body |
| `--fs-sm` | 14px | Tables, secondary copy |
| `--fs-xs` | 12px | Labels, table heads, captions — the floor |
| `--fs-2xs` | 11px | Numbers inside a tag only, never prose |

- Families: **Inter** for everything visible; **mono** (`ui-monospace, SFMono-Regular, "SF Mono", Consolas, Menlo`) for labels, numbers in tables, code, timestamps and slide numbers. No third family.
- Line heights: headings 1.15, lede and card copy 1.35, body 1.6.
- Weights: 600 headings, 500 emphasis and table titles, 400 body. Nothing lighter than 400.
- Tracking: `-0.02em` on headings; `+0.08em` uppercase on mono labels.
- Measure: 68 characters for prose, 46 for tight column copy, 24–34 for slide titles. A slide body line should not exceed ~45 characters.

### Space, radius, elevation

- Spacing: 4px grid — 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96. Component padding 16–20px, gaps between cards 20px, section gaps 48–96px, page gutter 20–48px.
- Radius: 16px cards and slides, 10px tiles and tables, 6px controls, 999px pills. No other values.
- Elevation: two shadows only — `0 1px 2px rgba(0,0,0,.30)` at rest, `0 10px 30px -18px rgba(0,0,0,.75)` for a floating panel. Light mode uses its own, weaker pair. Never animate a shadow.
- Motion: 120ms hover, 200ms state, 320ms panel. Easing `cubic-bezier(0.22, 1, 0.36, 1)`. Everything collapses to 1ms under `prefers-reduced-motion: reduce`.

---

## 3. Colour use — the rules

1. **One accent per screen region.** A region is a viewport, a slide, or a dashboard panel row. Links + the active nav item count as one use; one stat value or one chart series is the other.
2. **Never body text in the accent.** Accent text is for links, one key figure and the eyebrow. Body copy is `--text`; secondary is `--text-muted`.
3. **Hairlines carry structure.** Borders are `--line`; use `--line-strong` only for controls and emphasised rules.
4. **State colour is earned.** Green means verified, amber means act, red means broken. A green badge on a neutral fact is a lie.
5. **No colour-only meaning.** Every status chip carries a word as well as a hue.
6. **Charts:** series 1 is the accent, then 2–6 in order. Label the axes, put one sentence of finding beside the chart, and never rely on the legend alone.
7. **Light mode is not an inversion.** Keep the same hierarchy, drop the accent to `#0b6b52`, and never use pure black text or a pure white page.

All declared pairs clear WCAG AA: body ≥ 4.5:1, large text and graphical objects ≥ 3:1. The lowest shipped pairs are 4.91:1 (faint caption on surface) and 6.04:1 (accent on light background).

---

## 4. Slide rules

The canvas is **16:9**. Design for 1440×810 capture, export to PDF at 297×167mm. Margins are 48px at capture size; nothing sits inside 32px of any edge.

### Layout set — use one per slide, no hybrids

1. **Title** — deck name (display, max 24 characters per line, 2 lines max), one line of stakes, date and owner. No logo collage, no agenda.
2. **Section** — a two-digit number, a section name, and at most one line of framing. Background `--bg-soft`.
3. **Bullets** — heading plus up to **six** bullets, each one line at 18–20px. If it needs sub-bullets, it is two slides.
4. **Split** — argument on the left (1.1fr), evidence on the right (0.9fr): an image, a card, a chart or a stat pair. The left column carries the sentence that says what the evidence means.
5. **Stats** — two to four stat tiles in one row, each with a label (mono, uppercase, 12px), a value (display, 36–48px, tabular) and a one-line footnote. Add one sentence that reads the numbers.
6. **Table** — six data rows maximum, header in 12px mono uppercase, numerics right-aligned, caption below the table. If it needs a scroll, cut rows or split the slide.
7. **Quote** — one line at 28–36px display, maximum 26 characters per line, attribution as 14px mono below. Use for a principle, never for a fake quote from a person.
8. **Closing** — one action, one owner, one date. Never "Thank you" alone.

### Slide furniture

- Footer rule: hairline `--line` above 12px mono footer text, deck name at the left, page number at the right (`01`…`08`).
- Eyebrow labels at the top of content slides: mono, uppercase, tracked, accent.
- Section dividers switch the background to `--bg-soft`; everything else stays on `--surface`.
- Corner brackets and scanlines belong to the Section 9 theme only. In Professional, the slide is a clean surface with a single hairline border.

### Words

- Headlines are sentences, not labels: "Every surface was solving the same problems alone", not "Problem Statement".
- Six bullets, one idea each, no semicolon chains. Numbers spelled plainly ("7%", "24 pairs").
- Every slide answers: what is the claim, and what is the evidence on this slide?
- No emoji, no exclamation marks, no "revolutionary"/"seamless"/"unlock".

### What never appears

Gradients, glows, glassmorphism, stock photography, icon grids, drop-cap letters, three-column "features" layouts, decorative charts with unlabelled axes, clip art, drop shadows on slides, more than two font families, centred body paragraphs, or a slide that exists only to say the next slide is coming.

---

## 5. Build notes

CSS lives in `design/tokens/` and `design/components.css`; `design/slides.html` is a working deck with all eight layouts. Use these class names so the deck stays editable in the same sheet: `.slide`, `.slide--title`, `.slide--section`, `.slide--split`, `.slide--stats`, `.slide--end`, `.slide__kick`, `.slide__foot`, `.slide__no`, `.stat`, `.card`, `.table`.

Machine-readable tokens: `design/tokens/tokens.json` (`palettes.professional.dark` / `.light`). If a tool needs values, read them there rather than transcribing this file.

When a deck is done, check it: 16:9 at both 1440px and 390px, no sideways scroll, every text pair AA, reduced motion honoured, and no more than one accent per slide.
