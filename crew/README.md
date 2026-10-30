# Crew

The Section 9 roster page: who's on the team, what each agent does, live status,
budgets and standing orders. Published at `/crew/` by the Pages workflow. Avatars
are original drawings (sources in the `agent-manager` repo, `agents/avatars/`).

The roster's source of truth is `agents/roster.toml` in agent-manager; this page
is the human-friendly view. Agents may change this folder on `task/*` branches.

## Public rules

This page is public. Use codenames only: the owner is **Aramaki**, chief of
Section 9. No real names, no personal details, no private hostnames. Budget is
shown only as a percentage of the monthly budget, never as a dollar or krona
figure.

## Live data

`status.json` is fetched by the page. While `"sample": true`, the page shows a
sample-data badge and note. The Major's VM job publishes the real file hourly.
Schema:

```json
{
  "generatedAt": "2026-10-30T10:00:00Z",
  "sample": true,
  "budget": {"usedPercent": 7, "month": "2026-10"},
  "agents": [
    {"name": "Tachikoma", "role": "Nightly builder", "state": "working",
     "now": "Building tonight's app", "lastActiveAt": "2026-10-30T00:48:00Z", "budgetPercent": 12,
     "recent": [{"at": "2026-10-30T00:48:00Z", "text": "Shipped Koi Drift (Gleam)",
                 "url": "https://example.test/night/"}]}
  ]
}
```

- `state` is one of `working`, `idle`, `paused` or `off`.
- `now` may be `null`.
- `recent` has up to 3 items, newest first.
- The Major and Aramaki are command staff and are not in `agents`.

If `generatedAt` is over 3 hours old the page marks the data stale. If the fetch
fails, the static roster still renders.

## How to make your own theme

The layout lives in `themes/base.css` and never contains a colour, font or
effect of its own. Every one of those comes from a theme file. A theme is just a
set of custom properties on `html[data-theme="name"]`.

1. Copy `themes/gits95.css` to `themes/mytheme.css`.
2. Change the selector to `html[data-theme="mytheme"]` and set the values.
3. Add `mytheme` to `THEMES` in both inline scripts in `index.html` (the boot
   script in `<head>` and the main script at the end), and add an `<option>` to
   `<select id="theme">`.
4. Add `<link rel="stylesheet" href="themes/mytheme.css">` in `<head>`.
5. Check WCAG AA contrast (4.5:1 for body text, 3:1 for large text) and that
   `prefers-reduced-motion: reduce` turns the scanline, boot, cursor and state
   lights off.

The main knobs:

- surfaces: `--bg`, `--bg-image`, `--panel`, `--panel-2`, `--card-image`,
  `--panel-image`, `--line`, `--line-strong`
- text: `--ink`, `--muted`, `--dim`, `--phos`, `--amber`, `--warn`
- agents: `--c-major`, `--c-chief`, `--c-tachikoma`, `--c-batou`,
  `--c-ishikawa`, `--c-togusa`, `--c-saito`, `--c-default`
- state: `--state-working`, `--state-idle`, `--state-paused`, `--state-off`
- effects: `--scan-image`, `--scan-size`, `--scan-opacity`, `--vignette-image`,
  `--grid-image`, `--h1-glow`, `--avatar-filter`, `--avatar-blend`,
  `--avatar-scan-image`, `--monogram-image`
- motion: `--dur-boot`, `--ease-boot`, `--dur-blink`, `--dur-pulse`,
  `--dur-cursor`, `--dur-scan`
- type: `--f-display`, `--f-mono`, `--f-jp`

Switch with `?theme=name` or the selector; the choice is remembered in
`localStorage` (`s9-theme`), wrapped in try/catch.
