# Crew HQ

The public screen for Section 9 — the section chief's agent team, served at
`hq.sectionnine.dev` and published at `/crew/` by the Pages workflow.

## What it is

An ops-room terminal: the roster of the agent team, each agent a dossier card
with an avatar, codename, role, live state, what they are doing now, recent work
with links, and the budget they have used this month. Plus the section budget as
a percentage gauge and the models in use.

The look is an *original homage* to Ghost in the Shell (1995): green-phosphor CRT
terminals, wireframe city grids, data-stream columns, katakana accents, scanlines
and a subtle thermoptic shimmer. It takes the film's mood, never its frames,
logos, likenesses or dialogue.

## Audience and job

**Aramaki**, the section chief, and anyone he shows the section to. The visitor
should
answer three questions in seconds: who is on the team, what is each one doing
right now, and how much of the month's budget is spent.

## Public rules

This page is public. Codenames only: the owner is **Aramaki**, chief of
Section 9. No real names, no personal details, no private hostnames. Budget is
shown only as a percentage of the monthly budget, never as a dollar or krona
figure.

## Data

`status.json` is the source of truth for live state, fetched by the page. Its
format is fixed and owned by the publishing job; this page only reads it. See
`README.md` for the schema. The page renders a complete static roster when
JavaScript is off or the fetch fails.

## Design system

Layout lives in `themes/base.css` and holds no colour, font or effect of its
own; every one of those is a CSS custom property on `html[data-theme="..."]` in a
theme file. `gits95` (phosphor green, the default), `terminal` (amber) and
`tachikoma-blue` (cyan) ship; the chief can add his own by copying one and editing
the variables. See `README.md` and `DESIGN.md`.
