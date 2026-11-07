# nights/

One folder per night: `YYYY-MM-DD-<slug>/`, containing

- `README.md`: the idea, the language and why, how to build and run, what's next;
- `build.sh`: builds the static site into `dist/` (CI runs it on every PR);
- `dist/`: the built site, committed, so GitHub Pages can publish it as is
  (`dist/index.html` must exist);
- optionally `mise.toml`: pinned toolchain versions (`mise use <tool>@<version>`).

`scripts/lint-nights.py` checks every night against this list (missing
`README.md`, `build.sh`, `dist/index.html`, or a `LOG.md` line) on each PR and
on `main`; the CI job is `nightlint`.
