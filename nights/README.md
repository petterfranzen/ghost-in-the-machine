# nights/

One folder per night: `YYYY-MM-DD-<slug>/`, containing

- `README.md`: the idea, the language and why, how to build and run, what's next;
- `build.sh`: builds the static site into `dist/` (CI runs it on every PR);
- `dist/`: the built site, committed, so GitHub Pages can publish it as is
  (`dist/index.html` must exist);
- optionally `mise.toml`: pinned toolchain versions (`mise use <tool>@<version>`).

Shared behaviour that every night should keep lives in `_shared/` — see
[`_shared/README.md`](_shared/README.md). It holds `interact.js`, one plain ES
module with the tap, nudge, idle-hint and mobile-full-screen helpers, plus a
demo. A night copies the file into its `dist/` from `build.sh`, so the folder
Pages publishes stays self-contained. `_shared/` is not a night: it has no
`build.sh`, no `dist/` and no `LOG.md` line.
