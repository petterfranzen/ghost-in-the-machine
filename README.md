# ghost-in-the-machine

A small app every night, in a language and idea that haven't been done here
before, built by an AI agent while Petter sleeps. Most are calm, relaxing toys.

- **Try them:** https://petterfranzen.github.io/ghost-in-the-machine/
- **History:** [LOG.md](LOG.md), one line per night with Petter's verdict.
- **Layout:** `nights/YYYY-MM-DD-<slug>/` each hold a self-contained app with a
  `README.md`, a `build.sh`, and the built static site in `dist/`.
- **House rules:** every night is calm and one-handed — sound off until the
  user asks for it, 44 px tap targets, 16 px body/hint/footer text on a phone,
  a `prefers-reduced-motion` variant. Check a built night against them before
  opening a PR:

  ```sh
  node scripts/night-a11y.mjs nights/2026-11-05-songbranch   # or just songbranch
  ```

  It reads `dist/` and nothing else, prints one line per finding and exits
  non-zero when one fails. The static checks (a reduced-motion rule, no
  autoplaying audio, a sound toggle that is not on at load) always run; the
  browser checks need Playwright and a Chromium, and say so and skip when they
  are missing. It is separate from the folder lint that wants every night to
  have `README.md`, `build.sh`, `dist/` and a `LOG.md` row (section 9 #114):
  that one guards the shape of a night folder, this one guards what the night
  does.

Agents work through pull requests; Claude reviews and merges. The agent
setup lives in [agent-manager](https://github.com/petterfranzen/agent-manager).
Most nights are experiments and won't be kept long term; a keeper gets
extracted into its own repo with its history (`git subtree split`).
