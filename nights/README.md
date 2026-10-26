# nights/

One folder per night: `YYYY-MM-DD-<slug>/`, containing

- `README.md`: the idea, the language and why, how to build and run, what's next;
- `build.sh`: builds the static site into `dist/` (CI runs it on every PR);
- `dist/`: the built site, committed, so GitHub Pages can publish it as is
  (`dist/index.html` must exist);
- optionally `mise.toml`: pinned toolchain versions (`mise use <tool>@<version>`).
