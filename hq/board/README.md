# Section 9 — waits board

A single, self-contained static page: the private board Petter reads to see who
is working on what, what is stuck, and what needs him. It reads `./board.json`
every 60 s and renders the crew plus one column per *who a task waits on*.
`board-sample.json` is a made-up sample; the same JSON is inlined in `index.html`
so opening the file directly (no server) still renders.

The page code is public; the real titles are not. `board.json` is written by
`vps/hq-status.py` (agent-manager) and served only behind Cloudflare Access on
the `hq` host. The checked-in sample uses invented titles only — keep it that
way: no real issue titles, no names of people, no private topics in this repo.

## Columns

One column per `waits` value, in this order:

| `waits`  | Column                       | Means                                       |
|----------|------------------------------|---------------------------------------------|
| `petter` | **Needs Petter**             | a decision, approval or answer from Petter — highlighted |
| `major`  | Needs the Major              | apply, merge, route or close                 |
| `qa`     | In QA                        | PR open and green, waiting for Togusa        |
| `agent`  | With an agent                | an agent has changes to make                 |
| `task`   | Waiting behind another task  | nothing to do until something else lands     |

Only open tasks appear (anything with `status: "done"` is dropped). Each card
shows the issue number (linking to the issue in `section9-hq`), the agent with a
small colour mark, the title, and a one-line "waits on …". The **Start here**
strip lists the three Needs-Petter cards that unblock the most other tasks; the
agent chips filter the board; each column carries a count pill; the header shows
an "as of" time.

## Data contract

`board.json` keeps Saito's schema from *Design: Section 9 board* (#38) and adds
three fields to every task:

```jsonc
{
  "generatedAt": "2026-11-02T09:30:00Z",   // ISO 8601 Zulu
  "sample": true,                          // only in board-sample.json
  "budget": { "usedPercent": 37, "month": "2026-11" },
  "model": "deepseek/deepseek-v4.1-flash",
  "agents": [ /* name, role, state, now, model, lastActiveAt */ ],
  "tasks": [
    {
      "id": 101,
      "title": "Approve the palette for the ops page",
      "agent": "saito",
      "status": "review",                  // todo|working|review|blocked|done
      "waits": "petter",                   // NEW: petter|major|qa|agent|task
      "waitsText": "a yes or no on the palette", // NEW: the line after "Waits on"
      "url": "https://github.com/petterfranzen/section9-hq/issues/101", // NEW
      "blocks": 4,                         // optional: open tasks this clears
      "pr": null,
      "updated": "2026-11-02T09:20:00Z"
    }
  ]
}
```

- `waits` — which column the card belongs in (one of the five above). An
  unknown value falls back to `agent` on the page.
- `waitsText` — the one line taken from the latest comment that starts with
  "Waits on". The page strips a leading "waits on" and shows the rest.
- `url` — the `section9-hq` issue link; the card number links there.
- `blocks` — optional, how many open tasks clear when this one does. If it is
  absent the page counts `#NN` references in other tasks' `waitsText`. It is
  what ranks the **Start here** strip.

## Page

- Desktop and 390 px layouts; columns stack on a phone with no sideways scroll.
- Light and dark themes: the toggle in the header, saved to `localStorage`,
  defaulting to the OS `prefers-color-scheme`.
- Tap an agent chip to filter the board; the chips carry the agent's colour
  mark and a count.
- `prefers-reduced-motion` is honoured; the only animation is the working dot.

Build/check: `bash hq/board/build.sh` (validates the data contract — including
`waits`, `waitsText` and `url` — the inline sample copy, and the page's
phone/theme/reduced-motion hooks).
