# ghost-in-the-machine

A small app every night, in a language and idea that haven't been done here
before, built by an AI agent while Petter sleeps. Most are calm, relaxing toys.

- **Try them:** https://petterfranzen.github.io/ghost-in-the-machine/
- **History:** [LOG.md](LOG.md), one line per night with Petter's verdict.
- **Layout:** `nights/YYYY-MM-DD-<slug>/` each hold a self-contained app with a
  `README.md`, a `build.sh`, and the built static site in `dist/`.

Agents work through pull requests; Claude reviews and merges. The agent
setup lives in [agent-manager](https://github.com/petterfranzen/agent-manager).
Most nights are experiments and won't be kept long term; a keeper gets
extracted into its own repo with its history (`git subtree split`).
