# nights/

One folder per night: `YYYY-MM-DD-<slug>/`, containing

- `README.md`: the idea, the language and why, how to build and run, what's next;
- `build.sh`: builds the static site into `dist/` (CI runs it on every PR);
- `dist/`: the built site, committed, so GitHub Pages can publish it as is
  (`dist/index.html` must exist);
- optionally `mise.toml`: pinned toolchain versions (`mise use <tool>@<version>`).

Every night answers the same house rules — calm; nothing that counts, times or
scores; sound off until the user asks for it; one thumb, 44 px tap targets, no
sideways scroll; body, hint and footer text at 16 px on a phone (12 px is
allowed for a short label); a `prefers-reduced-motion` variant. Check the built
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
