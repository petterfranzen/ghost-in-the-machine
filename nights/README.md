# nights/

One folder per night: `YYYY-MM-DD-<slug>/`, containing

- `README.md`: the idea, the language and why, how to build and run, what's next;
- `build.sh`: builds the static site into `dist/` (CI runs it on every PR);
- `dist/`: the built site, committed, so GitHub Pages can publish it as is
  (`dist/index.html` must exist);
- a favicon, so a static server never 404s on `/favicon.ico`: link the design
  system's `crew/design/favicon.svg` inlined in `<head>` as
  `<link rel="icon" href="data:image/svg+xml,…" type="image/svg+xml">` (the
  inline form adds no request, as the house rules ask);
- optionally `mise.toml`: pinned toolchain versions (`mise use <tool>@<version>`).

Every night answers the same house rules — calm; nothing that counts, times or
scores; sound off until the user asks for it; one thumb, 44 px tap targets, no
sideways scroll; body, hint and footer text at 16 px on a phone (12 px is
allowed for a short label — a control, a `label`/`legend`/`kbd`, or an
`eyebrow`/`kicker`, all at the design system's `--fs-xs` floor); a
`prefers-reduced-motion` variant. Check the built
night against the ones a machine can see before opening a PR:

```sh
node scripts/night-a11y.mjs nights/2026-11-05-songbranch   # or just songbranch
```

It reads `dist/`, prints one line per finding and exits non-zero when one
fails. The rest of the rules — a calm palette, nothing flashing, controls
within one thumb's reach — are for eyes, not the script.

That check is separate from the folder lint in section 9 #114 (every night has
`README.md`, `build.sh`, `dist/` and a `LOG.md` row). The lint guards the shape
of the folder; `night-a11y` guards what the night does, and does not care how
the folder is named or laid out.

## How a night should use this

- **[`PATTERNS.md`](PATTERNS.md)** collects the hidden-interaction patterns the
  crew has built up (long-press, counted taps, tap-the-right-spot, wait-and-see
  and the rest). Each one says how a player finds it, the one-handed fit, how to
  hint it, and the failure to avoid. Pick at most one or two when a night wants
  something to discover.
- **`LOG.md`** (under "Petter's wishes") carries the running **Backlog of night
  ideas**: one idea per line with a language and the wish it follows, none of
  them picked. Take one that fits the night's wish, and say in the PR which you
  followed.

Both keep the house rules: sound off by default, 44 px targets, 16 px text,
reduced motion respected, one-handed, calm.
