# Using AI safely in software development — deck source

Deck source for a ~45-minute talk to a development team moving from autocomplete
to agents. Every claim carries the date it was checked.

- **31 slides**, 16:9. Build target: a Claude Slides artifact (the Major builds
  it from this file; nobody here can reach claude.ai).
- **Every claim is dated 1 November 2026 (UTC)** and sourced on the references
  slide (31) from docs.github.com, learn.microsoft.com, code.visualstudio.com,
  code.claude.com, docs.anthropic.com, anthropic.com and the GitHub Trust
  Center. This field moves monthly — re-check the three or four numbers you plan
  to act on before you print.
- **Content is generic on purpose.** The repo is public, so no client or
  employer names anywhere. Examples name vendor surfaces (GitHub, Visual Studio,
  VS Code, Azure Boards, Claude Code), never a company we have worked with. The
  worked example on slide 27 is described as a pattern — one team's agent stack
  — not as our own infrastructure.

## How to read a slide

Each slide below has four or five blocks:

- **Layout** — one of the seven in the vocabulary: `title`, `two-column`,
  `big number`, `diagram`, `table`, `quote`, `demo`. The design system's
  Professional theme has a matching layout in brackets: `title`
  (`.slide--title`), `two-column` (`.slide--split`), `big number`
  (`.slide--stats`), `table` (`.slide--table`), `quote` (`.slide--quote`),
  `diagram` (`.slide--split`, vector in the evidence column), `demo`
  (`.slide--split`, screenshot or terminal in the evidence column) and the
  closing `quote` (`.slide--end`).
- **On slide** — the final text, written short enough to be read from the back
  of a room. Anything longer is speaker notes by definition.
- **Speaker notes** — what to say, including every caveat to say out loud.
- **Visual** — which tokens and accents this slide uses.
- **Diagram spec** — for every diagram and chart: boxes, arrows, labels and
  data, precise enough to draw without guessing.

## Visual direction — Professional theme

From `crew/design/claude-design-system.md` and `crew/design/tokens/tokens.json`
(Professional, dark). The deck is dark by default; the print/PDF variant is the
Professional light theme.

| Role | Token | Value | How this deck uses it |
| --- | --- | --- | --- |
| Page floor | `--bg` | `#08090c` | Title slide background only |
| Deck chrome | `--bg-soft` | `#0c0e13` | The closing band and any section band |
| Slide surface | `--surface` | `#10131a` | Every content slide |
| Table head / code | `--surface-2` | `#151922` | Table header rows, terminal and code blocks |
| Nested surface | `--surface-3` | `#1b2030` | Inside a box (a sandbox, a gate, a policy) |
| Hairline | `--line` | `rgba(255,255,255,.09)` | Card and table borders, the footer rule |
| Control border | `--line-strong` | `rgba(255,255,255,.16)` | Diagram boxes, arrows that carry meaning |
| Body and headings | `--text` | `#f3f4f8` | All copy |
| Secondary copy | `--text-muted` | `#a9aebd` | Ledes, captions, column intros |
| Captions, footers | `--text-faint` | `#7d8394` | Slide numbers, footers, axis labels, step numbers |
| Accent | `--accent` | `#7af0c8` | Eyebrow label; one figure or one box per slide, no more |
| Accent ink | `--accent-ink` | `#04140f` | Text on an accent fill |
| Accent wash / line | `--accent-soft` / `--accent-line` | `rgba(122,240,200,.12)` / `.35` | The one marked path or box on a diagram |
| State | `--success` `#6fe0b0`, `--warning` `#ffc46b`, `--danger` `#ff8f8f`, `--info` `#8ab4ff` | | Status chips only, always with the word as well as the hue |

Type and furniture:

- **Inter** for everything visible; **mono** for eyebrows, step numbers, table
  header cells, numeric columns, footers, slide numbers and any terminal text.
  Two families, no third.
- Sizes: slide title `--fs-xl` (28px) to `--fs-2xl` (36px), body 16–18px, table
  14px, labels 12px. The title slide uses `--fs-display`. Nothing under the
  12px floor.
- Headlines are sentences; six bullets maximum; a slide body line stays under
  ~45 characters. No emoji, no exclamation marks, no "seamless"/"unlock".
- Footer rule: hairline `--line`, deck name "Using AI safely" left, page number
  right (`01`…`31`) in 12px mono `--text-faint`.
- Every content slide carries an eyebrow label: mono, uppercase, tracked
  `+0.08em`, `--accent`, one to three words (`COPILOT`, `CLAUDE CODE`,
  `SECURITY`, `QUALITY GATES`).
- **One accent per slide.** The eyebrow plus at most one more use: one stat
  value, one chart series, or one marked box or path on a diagram. Everything
  else is ink, surface and space.
- Charts, if any, follow the fixed series order (`--chart-1` `#7af0c8`, then
  blue, violet, amber, pink, teal), labelled axes, one sentence of finding.
- Nothing sits inside 32px of an edge at the 1440×810 capture; margins 48px.
- `prefers-reduced-motion: reduce` collapses every transition; no slide depends
  on motion.

---

# Slides

## Slide 1 — Title

**Layout:** title.

**On slide**

> Using AI safely in software development
>
> From autocomplete to agents — the guardrails to build before you hand over a task
>
> 1 November 2026 · every claim in this deck is dated and sourced

**Speaker notes:** Set the promise in one breath: this is not a talk about
whether to use AI, it is about which guardrails stop being optional once the
tool stops suggesting and starts *doing*. Housekeeping: the deck is dated
1 November 2026, and the one-page checklist at the end is the takeaway. Say out
loud that the products move monthly, so every claim carries a date and the
references slide has the links.

**Visual:** `--bg` floor, title in `--fs-display` at weight 600, tracking
`-0.02em`, measure 24–34 characters. Lede `--text-muted` 18px. The date line is
12px mono `--text-faint`. Accent appears once — a hairline rule under the title
or the eyebrow, not both. Footer rule `--line`, "Using AI safely" left, `01`
right.

## Slide 2 — What we'll cover

**Layout:** diagram (five-stop roadmap).

**On slide**

> Five stops, in the order they pay off
>
> Copilot in the editor · Copilot as a coding agent · Claude Code ·
> levelling up: gates and guardrails · the loop, the agreement, the checklist
>
> One live demo near the end. The source list is the last slide.

**Speaker notes:** Say the shape up front so the room knows the second half is
the part they will actually be asked to build: the prerequisites, the gates and
the way you secure the agent. The features are the first half; the safety system
is the second.

**Visual:** `--surface`. Five boxes in one row, all neutral; accent only in the
eyebrow. Numbers 1–5 in 12px mono `--text-faint`.

**Diagram spec — five-stop roadmap**

- A single horizontal band, full content width (1344px), 120px tall, centred
  vertically on the slide.
- Five equal boxes, 252px wide, 21px gap. Radius 16px, fill `--surface`, 1px
  `--line` border. Inside each box, top-left: step number in 12px mono
  `--text-faint`; below it the label in 16px `--text`, two lines maximum.
- Labels, left to right: `1 Copilot in the editor`, `2 Copilot as a coding
  agent`, `3 Claude Code`, `4 Levelling up`, `5 The loop and the checklist`.
- Four arrows between boxes: 21px horizontal lines, `--line-strong`, 1.5px,
  with a 6px chevron head pointing right, vertically centred.
- Caption under the band, 14px `--text-muted`, left-aligned to the band:
  "One live demo near the end. The source list is the last slide."
- No data: this diagram carries order only.

## Slide 3 — Assistive and agentic are not the same risk

**Layout:** two-column.

**On slide**

> Assistive responds. Agentic acts.
>
> The control moves from *reviewing a suggestion* to *bounding an actor*.
>
> You stay responsible for approving either way.

**Speaker notes:** This is the hinge of the whole talk. In the vendor's own
vocabulary the split is now explicit — *assistive*, *agentic*, *customizations*
and *external agents/tools* — and third-party coding agents are stated to be
"subject to the same security protections, mitigations, and limitations as
Copilot". Say the plain version: with assistive you review every suggestion; with
agentic something edits files and runs commands before you look, so the controls
have to move from the suggestion to the actor. Demo cue: show a one-line
completion, then a task that produces a branch and a PR.

**Visual:** `--surface`. Left column (1.1fr): the claim, sentence case, 18px
`--text`; the second line 600 weight with the two phrases in `--accent`. Right
column (0.9fr): a `--surface-2` card with two labelled rows — "Assistive" and
"Agentic" — label in 12px mono `--text-faint`, copy in 14px `--text-muted`.
Accent: eyebrow plus the two phrases only.

## Slide 4 — Copilot in Visual Studio: completions, chat and agent mode

**Layout:** two-column.

**On slide**

> In Visual Studio, Copilot is the .NET surface: completions, a chat pane and
> agent mode, all inside the solution.
>
> Ghost text, next-edit suggestions, inline chat, slash commands.

**Speaker notes:** The most "IDE-shaped" experience. Chat is bundled in the
unified Copilot experience from VS 17.10+, as a recommended component in the
Installer. Slash commands worth naming: `/doc`, `/explain`, `/tests`, `/fix`.
There are Copilot actions in the editor, the error list and feature search, plus
"Review Selection" from VS 18.8+. IntelliSense is prioritised over Copilot
completions by default; the timing is tunable under Tools > Options > Text
Editor > Inline Suggestions. Caveat to say aloud: as of 2026-04-20 GitHub paused
Copilot Pro trials — if anyone is on a trial, re-check. Re-check the version
gates before printing.

**Visual:** `--surface`. Left column: the claim in 18px `--text`, the second line
14px `--text-muted`. Right column: a `--surface-2` card listing the capabilities
as five short lines, 12px mono uppercase labels optional. Accent: eyebrow only.

## Slide 5 — In Visual Studio the control is not in Visual Studio

**Layout:** diagram (the policy gate).

**On slide**

> Agent mode and MCP are switched in Visual Studio.
>
> The lever that governs them is the GitHub Copilot admin policy.

**Speaker notes:** The single most useful admin fact here: turn the Copilot
policy off and users under that subscription cannot use agent mode or MCP in
Visual Studio at all. The control is not in the IDE; it is the Copilot policy on
GitHub. Say that twice. You switch the chat mode dropdown from Ask to Agent, and
connect MCP servers through the tools icon; MCP transports supported are stdio,
SSE and streamable HTTP, with tools, prompts, resources and sampling. The newest
MCP features need VS 2026, or VS 2022 17.14+.

**Visual:** `--surface`. Two boxes with the governing arrow marked in
`--accent-line`. Everything else is `--line-strong` on `--surface`.

**Diagram spec — the policy gate**

- Two boxes on one horizontal line, 60px gap.
  - Box A (left), 520×160px, radius 16px, fill `--surface-2`, 1px `--line`
    border. Title "Visual Studio", 16px `--text`, 600. Two lines, 14px
    `--text-muted`: "Ask → Agent mode", "MCP servers via the tools icon".
  - Box B (right), 520×160px, radius 16px, fill `--surface-2`, 1px `--line`
    border. Title "GitHub Copilot admin policy", 16px `--text`, 600. Two lines,
    14px `--text-muted`: "Agent mode: on / off", "MCP servers: on / off".
- One arrow from Box B to Box A: left-pointing, 60px, 2px `--accent-line`,
  8px solid head. Label above the arrow, 12px mono `--accent`: "governs".
- A caption under both boxes, 14px `--text-muted`: "Off on GitHub means no agent
  mode or MCP in the IDE for that subscription."
- No data series: this diagram carries one relationship, marked once in accent.

## Slide 6 — Copilot in VS Code: chat, edits and agent mode

**Layout:** two-column.

**On slide**

> VS Code has converged on one surface for coding agents.
>
> Ask a question, accept a multi-file edit, or hand over a task and watch the
> loop run.

**Speaker notes:** Do not over-specify the VS Code UI — it moved fast through
2025 and into 2026, and the vendor's own framing is that agents took over the
editor. Chat answers questions about the codebase; Edits applies multi-file
proposals you accept or reject; agent mode is the loop: it analyses the
codebase, reads files, proposes edits, runs terminal commands and tests, and
auto-corrects against compile, lint and test output. It shipped from Insiders in
February 2025 to Stable, and MCP support was added. Caveat: the original preview
post lists things it *planned* (fine-grained undo, auto-approve specific
terminal commands) — do not present the wishlist as shipped. Demo cue: attach a
file, ask a question, then ask for a change across two files and show the diff
you accept or reject.

**Visual:** `--surface`. Left column: claim 18px `--text`, second line 14px
`--text-muted`. Right column: a `--surface-2` card, three labelled rows ("Chat",
"Edits", "Agent mode"), label 12px mono `--text-faint`, copy 14px `--text-muted`.
Accent: eyebrow only.

## Slide 7 — An MCP server is a new trust boundary

**Layout:** diagram (the tool boundary).

**On slide**

> MCP connects the agent to tools its built-in tools cannot reach.
>
> Everything past the boundary is new trust you are choosing to add.

**Speaker notes:** The security line that matters: **content exclusion is a
guardrail for tools GitHub controls and is not guaranteed to be respected by
third-party MCP servers** — and Copilot's own docs say the agent firewall does
**not** cover MCP server processes. Config destinations: global
(`$COPILOT_HOME/mcp-config.json`), a workspace `.mcp.json` for team sharing, and
the older `.vscode/mcp.json`, now labelled deprecated. "Copilot connectors" (in
preview) provide GitHub-managed MCP connections without a local server. Admin
policy names to know: "MCP servers in Copilot" and "Restrict MCP access to
registry servers".

**Visual:** `--surface`. Neutral boxes; the one accent marks the boundary line
between GitHub-controlled tools and the third-party server.

**Diagram spec — the tool boundary**

- Four boxes left to right, 32px gap, each 300×120px, radius 16px, fill
  `--surface-2`, 1px `--line` border, label 16px `--text` centred, one line of
  14px `--text-muted` beneath: `Agent` → `MCP client` → `MCP server` →
  `External tool / data`.
- Arrows between the four boxes: 32px, 2px `--line-strong`, 6px chevron heads.
- A vertical dashed line, 2px `--accent-line`, full height, drawn between
  "MCP client" and "MCP server". Label above it, 12px mono `--accent`:
  "trust boundary".
- Caption under the row, 14px `--text-muted`: "Content exclusion covers tools
  GitHub controls. The agent firewall does not cover MCP server processes."
- No data series.

## Slide 8 — Copilot as a coding agent: a worker in a box

**Layout:** two-column.

**On slide**

> The cloud agent is a developer-grade worker in a box, not a faster
> autocomplete.
>
> Give it an issue; it plans, edits on a branch and opens a draft PR.

**Speaker notes:** Naming alert — GitHub's docs now call this the **Copilot
cloud agent**; older pages and Microsoft Learn still say *coding agent*. Same
product, mid-rename; say both names in the room. It researches a repo, plans,
makes changes on a branch, and opens draft PRs; you can review the diff and
iterate before the PR is created. Entry points: assign an issue, `@copilot` in a
PR comment, the agents panel on GitHub.com, from VS Code, and automations
(schedule or event). It runs in its own ephemeral environment powered by GitHub
Actions, with read-only access to your repository. Re-check which entry points
are GA versus preview on the day.

**Visual:** `--surface`. Left column: claim 18px `--text`, second line 14px
`--text-muted`. Right column: `--surface-2` card, heading "Where you can start
it" in 500 weight, then five short lines 14px `--text-muted`, each led by a 12px
mono `--text-faint` marker. Accent: eyebrow only.

## Slide 9 — The guardrails the coding agent gives you for free

**Layout:** table.

**On slide**

| Guardrail | What it does |
| --- | --- |
| Write access | Only users with write access can trigger the agent |
| Branch scope | It pushes only to a `copilot/` branch, never to main |
| No direct push | It cannot `git push` to a protected branch |
| No self-approval | It cannot mark a PR ready, approve, or merge |
| Branch protection | It is bound by the repo's protections and required checks |
| Workflow approval | Actions do not run until a write-access user clicks "Approve and run workflows" |

> All of these are on by default. Built-in validation adds CodeQL, dependency
> checks against the Advisory Database and secret scanning — no GHAS licence
> required.

**Speaker notes:** Read the table out loud — the vendor is doing a lot of the
work for you. The two to emphasise are "the requestor cannot approve its own PR"
and "workflows need a human's approval": together they stop the agent being an
approval-laundering machine. Built-in validation checks dependencies the agent
introduces against the Advisory Database for malware advisories and CVSS
High/Critical vulns, and the details land in the session log. Re-check the
default set — it grows.

**Visual:** `--surface`. Six data rows, header 12px mono uppercase
`--text-faint`, first column 14px `--text`, second 14px `--text-muted`,
hairlines between rows. Caption below, 14px `--text-muted`. Accent: eyebrow only.

## Slide 10 — Azure Boards hands Copilot the work item and its last 50 comments

**Layout:** two-column.

**On slide**

> From an Azure Boards work item: Copilot icon → "Create a pull request with
> Copilot" → a draft PR, linked back to the item.
>
> It captures the work item's text and its last 50 comments — and stores that
> context in the pull request.

**Speaker notes:** The Azure Boards story is real but narrow. Prerequisites: a
paid Copilot plan, the connected repos must have the agent enabled, and
installing the Azure Boards app needs an org or enterprise owner, or an App
manager. The privacy point is the one to dwell on: the last 50 comments become
visible to anyone with repo access through the PR, so watch what gets discussed
in work items you hand over. Limitation: the rich research → plan → iterate flow
is on GitHub.com (plus public preview in Teams and Slack); Azure Boards — like
JIRA and Linear — only supports creating a PR directly. Re-check GA versus
preview status; this is moving.

**Visual:** `--surface`. Left column: the flow, 18px `--text`, with the two
outcome phrases in `--accent`. Right column: `--surface-2` card, three rows
("What it takes", "What it stores", "What it can't do"), label 12px mono
`--text-faint`, copy 14px `--text-muted`. Accent: eyebrow plus the "last 50
comments" phrase only.

## Slide 11 — Copilot admin and policy controls: the four that matter

**Layout:** table.

**On slide**

| Control | What it governs | The limit to know |
| --- | --- | --- |
| Content exclusion | Repo, org or enterprise scope; excluded files get no inline suggestions and are not used in chat or review | Not applied in Copilot CLI or Agent mode; third-party MCP servers may ignore it |
| Public-code filter | Checks suggestions against an index of public GitHub code | Block suppresses a match; Allow shows it with licence and source URL |
| Model choice | "Configure models" and "Configure custom models"; BYOK routes prompts to your provider | Your provider's retention applies; GitHub still safety-filters |
| Audit logs | `action:copilot` for policy and seat changes; `actor:Copilot` for agentic events | 180-day retention; no client session data — the prompts sent locally |

**Speaker notes:** The biggest admin gotcha: **content exclusion does not apply
to Agent mode or the CLI.** If your threat model assumed exclusion covered
agentic use, it does not — the sandbox and permissions do that work instead.
Smaller limits worth saying: exclusion covers neither symlinks nor remote
filesystems, takes about 30 minutes to propagate, and semantic information can
still leak through the IDE. The public-code filter checks suggestions of 65
lexemes or more (about 150 characters) against an index that refreshes every few
months. Audit logs stream to a SIEM if you need more than 180 days. The
vendor's "supported surfaces for policies" table is the authoritative — and
changing — map.

**Visual:** `--surface`. Four data rows, header 12px mono uppercase, cells 14px
`--text` / `--text-muted`, hairline rows, numerics not needed here. The word
"not" in the first limit cell may sit in `--warning` with the word, never colour
alone. Accent: eyebrow only.

## Slide 12 — Copilot data handling: what leaves the building

**Layout:** big number.

**On slide**

> Business and Enterprise data is not used to train models. Individual plans may
> be, unless the user opts out.
>
> 28 days — default retention for inputs and outputs
>
> 180 days — audit-log retention
>
> Life of the account — coding-agent session logs

**Speaker notes:** Two numbers to repeat: 28 days for inputs and outputs, and
"session logs for the life of the account" for the coding agent. Zero-data
retention agreements run across the providers, with one carve-out worth saying
out loud: some named Claude models are not zero-retention by default unless the
enterprise is eligible. Residency: with GitHub Enterprise Cloud with data
residency, agent data stays in-region; on GitHub.com it may be processed
anywhere. These are exactly the numbers to re-check against your contract on the
day.

**Visual:** `--surface`. Three stat tiles in one row: label 12px mono uppercase
`--text-faint`, value in `--fs-2xl` (36px) tabular, `--accent` on the first
value only; footnote 14px `--text-muted`. One sentence above the tiles reads the
numbers. Accent: eyebrow plus the 28-day value.

**Diagram spec — the three retention figures (stat tiles)**

- One row, three tiles, equal width, 20px gap, each 420×220px, radius 10px, fill
  `--surface-2`, 1px `--line` border, padding 20px.
- Tile 1: label "INPUTS AND OUTPUTS" (12px mono uppercase `--text-faint`);
  value "28 days" (`--fs-2xl`, 36px, tabular, `--accent`); footnote "Default
  retention, Copilot Business and Enterprise" (14px `--text-muted`).
- Tile 2: label "AUDIT LOGS"; value "180 days" (`--fs-2xl`, 36px, tabular,
  `--text`); footnote "Stream to a SIEM for more" (14px `--text-muted`).
- Tile 3: label "AGENT SESSION LOGS"; value "Account life" (`--fs-2xl`, 36px,
  tabular, `--text`); footnote "Retained for the life of the account"
  (14px `--text-muted`).
- No axes. One accent figure only (tile 1).

## Slide 13 — Claude Code: one engine, five surfaces

**Layout:** diagram (five surfaces, one config).

**On slide**

> One engine, several surfaces, shared configuration.
>
> Pick the surface by how much steering you want to do, not by fashion.

**Speaker notes:** The terminal CLI is the most complete — scripting and the
Agent SDK are CLI-only. The VS Code extension adds a graphical panel, inline
diffs and `@file#line` references, and bundles its own copy of the CLI. The
JetBrains extension covers IntelliJ, PyCharm and WebStorm: it runs `claude` in
the IDE terminal and opens diffs in the IDE viewer. The desktop app gives visual
diff review and parallel sessions. Web and mobile run cloud sessions that
continue after you disconnect. The line to give the team: a repo's CLAUDE.md,
settings and MCP servers work across all local surfaces, so the surface is a
comfort choice, not a capability one. Demo cue: same CLAUDE.md, two surfaces,
identical behaviour.

**Visual:** `--surface`. Five neutral boxes around one shared bar; the shared
config bar is marked once in `--accent-soft` with an `--accent-line` border.

**Diagram spec — five surfaces on one config**

- Five boxes across the top, equal width, 18px gap, each 240×140px, radius 16px,
  fill `--surface-2`, 1px `--line` border. Title 16px `--text` 600; one line of
  14px `--text-muted` under it.
- Labels, left to right: `Terminal CLI` ("scripting and Agent SDK live here"),
  `VS Code` ("panel, inline diffs, bundled CLI"), `JetBrains`
  ("IntelliJ, PyCharm, WebStorm"), `Desktop` ("visual diffs, parallel
  sessions"), `Web and mobile` ("cloud sessions that keep running").
- One full-width bar under the five boxes, 1344×56px, radius 10px, fill
  `--accent-soft`, 1px `--accent-line` border, label centred 14px `--text`:
  "Shared: CLAUDE.md · settings · MCP servers".
- Five short vertical connectors from each box down to the bar: 18px, 1.5px
  `--line-strong`, no arrowhead.
- Caption under the bar, 14px `--text-muted`: "The surface is a comfort choice,
  not a capability one."
- No data series.

## Slide 14 — Claude Code in GitHub Actions: a mention is the trigger

**Layout:** two-column.

**On slide**

> Mention `@claude` on an issue or PR, or give the action a prompt to run on any
> event.
>
> The blast radius is the permissions you grant the workflow.

**Speaker notes:** Two modes: interactive (waits for the trigger phrase) and
automation (runs on a `prompt`). Two actor checks run before it starts: the
triggering user must have write access, and it rejects bot actors unless they
are listed in `allowed_bots` — which stops bots triggering loops. Auth is a repo
secret (`ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN`); cloud providers can
use OIDC so no long-lived cloud credential is stored. Setup is either
`/install-github-app` or manual, and either way you need repo admin. Caveat:
the Claude GitHub App has one permission set across features, so the install
grants more than the action strictly uses — grant only what the prompt needs.

**Visual:** `--surface`. Left column: claim 18px `--text`, second line 14px
`--text-muted`. Right column: `--surface-2` card, rows "Trigger", "Actor
checks", "Auth" — label 12px mono `--text-faint`, copy 14px `--text-muted`.
Accent: eyebrow only.

## Slide 15 — Permissions decide whether a call runs; the sandbox decides what it can reach

**Layout:** big number.

**On slide**

> 84% fewer permission prompts with sandboxing in Anthropic's own internal use.
>
> Default posture: read-only, asking before it modifies.
>
> The sandbox network allowlist starts empty.

**Speaker notes:** The 84% figure comes from Anthropic's own research blog and
is vendor-reported, not independently verified — say so. The mental model is the
slide title: permissions decide whether a call runs; the sandbox decides what a
running call can reach. Safe read-only commands are auto-approved; network
commands like `curl` and `wget` are not. Two modes: Manual (starts read-only)
and Auto (a classifier model reviews actions and blocks unsafe ones). The
sandboxed Bash tool limits writes to the working directory, temp and added
dirs, sends network through a proxy whose allowlist starts empty, and masks
credentials in env vars and files. Matching is fail-closed, and credentials sit
in the OS keychain where available. `--dangerously-skip-permissions` exists, and
the vendor's own guidance is to pair it with a container and a firewall, not use
it raw. Demo cue: show a blocked outbound `curl` and the allowlist prompt.

**Visual:** `--surface`. One dominant stat: "84%" as the big number in
`--fs-display`, tabular, `--accent`, with the label 12px mono uppercase
`--text-faint` underneath. The two supporting facts as 14px `--text-muted`
lines. Accent: eyebrow plus the one figure.

**Diagram spec — the 84% stat block**

- One figure block, left-aligned: value "84%" in `--fs-display` (display,
  weight 600, tabular, `--accent`), label "FEWER PERMISSION PROMPTS WITH
  SANDBOXING" in 12px mono uppercase `--text-faint` below it.
- To the right, a stack of two neutral lines, 14px `--text-muted`:
  "Default posture: read-only, asks before modifying." and "Sandbox network
  allowlist starts empty."
- Attribution line under the figure, 12px mono `--text-faint`: "Anthropic
  research, internal use — vendor-reported, not independently verified."
- No chart, no axes. One accent figure.

## Slide 16 — CLAUDE.md advises; hooks enforce

**Layout:** two-column.

**On slide**

> A rule in CLAUDE.md is a suggestion to the model.
>
> A `PreToolUse` hook is a control.

**Speaker notes:** This is the framing a safety talk has to land, because
people assume a rule in CLAUDE.md is enforced — it is not. CLAUDE.md gives
persistent project context and is loaded at the start of every session, but it
is treated as context, not enforced configuration; the docs' own advice is "to
block an action regardless of what Claude decides, use a PreToolUse hook". Team
advice straight from the docs: add to it when Claude makes the same mistake
twice, when review catches something it should have known, or when you retype
the same correction. Auto memory is separate and loads the first 200 lines or
25KB. On the hook side: PreToolUse can exit with code 2 to block a call and feed
stderr back to the model, or return a JSON `permissionDecision` of `deny`, `ask`
or `allow`. A PreToolUse `deny` fires **before any permission-mode check**, so
it blocks the tool even under `--dangerously-skip-permissions`. PostToolUse
cannot undo — the tool already ran — so it is for format, lint and logging.
Caveat: hooks fire in subagents too, and subagents do not inherit the main
agent's permissions, so a hook may be the only thing gating them.

**Visual:** `--surface`. Two columns, one per idea, divided by a full-height
`--line` hairline. Left ("Advises") card fill `--surface-2`; right ("Enforces")
card fill `--surface-3` with an `--accent-line` left border. Column headings
12px mono uppercase `--text-muted`; body 14px `--text-muted`. Accent: eyebrow
plus the enforces card's border.

## Slide 17 — Without tests and CI, an agent removes review capacity

**Layout:** two-column.

**On slide**

> The prerequisites are the safety system. The AI is the accelerator.
>
> Tests · CI · small issues · docs · branch protection.

**Speaker notes:** Blunt version for the room: if you do not have tests and CI,
an agent does not remove work — it removes *review capacity*, and you get more,
faster, unreviewable changes. The prerequisites, in order: tests the agent and
you can run; CI that runs them on every push; small issues, because the vendor's
own framing is that the cloud agent is justified on simple or routine work and
scope is the strongest lever you have; a CLAUDE.md, AGENTS.md or
copilot-instructions so the agent knows the house style; and branch protection
with required checks, so the agent is bound by the same merge rules as a human.
This is the slide people should photograph.

**Visual:** `--surface`. Left column: the claim in 18px `--text`, with "removes
review capacity" in `--accent`. Right column: `--surface-2` card, five rows,
each a 12px mono `--text-faint` index and a 14px `--text-muted` line. Accent:
eyebrow plus the one phrase.

## Slide 18 — Pairing and delegation are different jobs

**Layout:** table.

**On slide**

| | Pairing (IDE assistant) | Delegation (cloud agent) |
| --- | --- | --- |
| Where it happens | In your editor, in your session | On GitHub, in the open |
| What you do | Apply each suggestion, run the branch, push, open the PR | Specify, steer, monitor, review the PR |
| Who can see it | You, until you commit | Teammates, while it runs |
| Best for | Design arguments, hard debugging | Well-scoped, verifiable, low-consequence work |
| What changes | Less typing | More specifying and reviewing |

**Speaker notes:** Do not sell this as headcount replacement. The change is in
what you spend attention on: less typing, more specifying and reviewing. The
rule of thumb to say out loud: delegate well-scoped, verifiable,
low-consequence tasks — docs, tests, small fixes, technical debt — and pair on
the things where you would want to argue about the design. Demo cue: take one
backlog issue you would otherwise deprioritise and delegate it live.

**Visual:** `--surface`. Header row 12px mono uppercase `--text-faint` on
`--surface-2`; first column 14px `--text` (row labels), the two data columns
14px `--text-muted`. Hairlines between rows. Accent: eyebrow only.

## Slide 19 — Three gates stand between an agent and main

**Layout:** diagram (three gates into main).

**On slide**

> Required checks · required human review · an independent QA pass.
>
> The author is never the only reviewer.

**Speaker notes:** The three-gate pattern: required checks (a machine), human
review (a person), and an independent QA pass (a second, possibly AI, opinion).
Required status checks must pass before merge; you can pin a check to a specific
app as its source, and choose strict ("branch up to date") or loose. Required
human review should prevent self-approval — GitHub's own agent rule is that the
requestor cannot approve the agent's PR, and the agent cannot approve or merge.
For the QA pass, the vendor example worth quoting is that Copilot's agent gets
"a second opinion on its code with Copilot code review" before it finishes the
PR. Turn on "Require conversation resolution before merging" so review threads
must be closed.

**Visual:** `--surface`. Four boxes left to right (three gates, then main),
neutral; the human gate carries the single accent, as an `--accent-line` border
and a 12px mono `--accent` label "the one a person owns".

**Diagram spec — three gates into main**

- Four boxes in one row, 36px gap, each 300×150px, radius 16px, fill
  `--surface-2`, 1px `--line` border. Title 16px `--text` 600; one line of
  14px `--text-muted` under it.
- Labels, left to right: `Required checks` ("all green before merge"),
  `Human review` ("the requester cannot approve"), `QA pass` ("an independent
  verdict on the last push"), `main` ("the protected branch").
- Three arrows between the boxes: 36px, 2px `--line-strong`, 6px chevron heads.
- The `Human review` box gets a 2px `--accent-line` border and a 12px mono
  `--accent` label above it: "the one a person owns". All other boxes stay
  neutral.
- Caption under the row, 14px `--text-muted`: "The author is never the only
  reviewer."
- No data series.

## Slide 20 — Give the agent its own identity, and no standing secrets

**Layout:** two-column.

**On slide**

> A scoped, fine-grained token — not a personal one, not an org-wide one.
>
> No secrets sitting in its shell.

**Speaker notes:** Concrete patterns. Give the agent its own identity and a
scoped, fine-grained token. Constrain the token to named repositories, for
example with a "main: PRs only" ruleset. No secrets in the agent's environment:
it should read secrets from the platform's secret store at runtime, never have
them sitting in its shell — Claude Code's sandboxing notes that env vars,
including secrets, are inherited by default, so scrub them. Do not let the agent
hold model or provider keys where a separate runtime can hold them instead; keep
the key out of the sandbox that executes untrusted code. Rotate. This maps
directly to the worked example on slide 27.

**Visual:** `--surface`. Left column: claim 18px `--text`, with "no standing
secrets" in `--accent`. Right column: `--surface-2` card, four rows ("Identity",
"Scope", "Secrets", "Keys"), label 12px mono `--text-faint`, copy 14px
`--text-muted`. Accent: eyebrow plus the one phrase.

## Slide 21 — Run the agent where it cannot reach, and cap what it can

**Layout:** two-column.

**On slide**

> A container or VM, or the vendor's ephemeral runner — never a shared box.
>
> The firewall is a good default, not a proof.

**Speaker notes:** Run the agent where it cannot reach what it should not: a
container or VM, or the vendor's ephemeral runner — not your laptop, not a
shared box. Network limits matter most: Copilot's cloud agent is firewalled by
default with a recommended dependency allowlist, and Claude Code's sandbox proxy
allowlist starts empty. Know the limits honestly: Copilot's firewall only covers
processes the agent starts via Bash (not MCP server processes), only inside the
Actions appliance, and GitHub itself says sophisticated attacks may bypass it —
it is "not a comprehensive security solution". Prefer `.devcontainer` or
container isolation for local agent work, and turn on filesystem isolation, not
just permission prompts. Defence in depth: firewall *and* least privilege *and*
human review. Re-check the allowlist contents before relying on them.

**Visual:** `--surface`. Left column: claim 18px `--text`. Right column:
`--surface-2` card, rows "Where it runs", "Network", "The honest limit" — label
12px mono `--text-faint`, copy 14px `--text-muted`. Accent: eyebrow only.

## Slide 22 — The agent trusts what a human would treat as data

**Layout:** two-column.

**On slide**

> Hidden instructions in an issue, a comment, a README or a dependency the agent
> reads become commands to it.
>
> A PR comment you would never click is a prompt to the agent.

**Speaker notes:** Say the asymmetry plainly: the agent trusts content that a
human would treat as data. GitHub documents prompt injection as a real risk and
mitigates it by filtering hidden characters — an HTML comment in an issue is not
passed to the cloud agent. Injection is not only social: a dependency, a README
or a tool result the agent reads can carry instructions too, so anything the
agent ingests is untrusted input. Mitigations: only write-access users can
trigger the agent; comments from others are never presented; hidden content is
filtered; treat agent output as untrusted; keep the blast radius small. For
balance, note this area is contested — a public GitHub community discussion
(secondary, October 2025) argues hidden-character filtering is not applied
consistently across all Copilot chat surfaces, and that injection can still
drive malicious suggestions even where image-based exfiltration was blocked.
Treat it as an active, unresolved area.

**Visual:** `--surface`. Left column: claim 18px `--text`, the second line 14px
`--text-muted`. Right column: `--surface-2` card, rows "The input", "The
mitigations", "Still open" — label 12px mono `--text-faint`, copy 14px
`--text-muted`. Accent: eyebrow plus the one phrase "commands to it".

## Slide 23 — If you would not merge it at 03:00, do not let the agent either

**Layout:** two-column.

**On slide**

> The agent can add a dependency on your behalf.
>
> Whether you would merge that package unreviewed is the question it does not
> ask for you.

**Speaker notes:** New dependencies are a first-class risk: GitHub checks
dependencies the agent introduces against the Advisory Database for malware
advisories and CVSS High/Critical vulns. Set a patch policy for image and
dependency updates — for example, merge only when a release is 24 hours old, and
fix major CVEs fast — so a poisoned release is not merged the hour it lands. Pin
by digest or version, and require signed commits or verified provenance where
you can. Watch the agent's own supply chain: MCP servers, plugins and
third-party coding agents are all new components. The docs state third-party
agents are "subject to the same security protections… as Copilot", which helps,
but they are still new trust. The 24-hour soak rule is cheap and catches a lot.

**Visual:** `--surface`. Left column: claim 18px `--text`, second line 14px
`--text-muted`. Right column: `--surface-2` card, rows "Scanned for you",
"Set a policy", "Pin and sign" — label 12px mono `--text-faint`, copy 14px
`--text-muted`. Accent: eyebrow only.

## Slide 24 — The loop: issue, agent PR, CI, review, merge

**Layout:** diagram (the end-to-end loop).

**On slide**

> Small issue → trigger → agent branch and draft PR → CI → review → merge →
> deploy.
>
> Every gate is a place you can stand.

**Speaker notes:** Draw this on the whiteboard; it is the spine of the deck.
Step 1: a small, well-described issue — acceptance criteria, links, no secrets.
Step 2: a trigger — assign the issue, mention `@claude`, or a routine — starts
the agent in its sandbox. Step 3: the agent works on a branch, opens a draft PR,
and CI runs; on Copilot, only after a write-access user approves the run. Step
4: required checks pass, a QA pass posts, a human reviews and cannot be the
requester. Step 5: a human merges, then deploy runs down the normal pipeline.
The loop is the same whichever vendor — the trigger and the sandbox differ, the
shape does not.

**Visual:** `--surface`. A single horizontal five-step band, neutral; the human
review step carries the one accent. Step numbers 12px mono `--text-faint`.

**Diagram spec — the end-to-end loop**

- Five boxes in one row, 16px gap, each 252×130px, radius 16px, fill
  `--surface-2`, 1px `--line` border. Step number 12px mono `--text-faint`
  top-left; label 15px `--text`; one line 13px `--text-muted`.
- Labels, left to right: `1 Small issue` ("acceptance criteria, no secrets"),
  `2 Trigger` ("assign, @claude, or a routine"), `3 Branch and draft PR`
  ("agent works in its sandbox; CI runs"), `4 Review` ("checks, QA pass, a
  human"), `5 Merge and deploy` ("a human closes the loop").
- Four arrows between boxes: 16px, 2px `--line-strong`, 6px chevron heads.
- The `4 Review` box gets a 2px `--accent-line` border. All others neutral.
- A return path: a 1.5px `--line` dashed line running under the row from box 5
  back to box 1, with a 6px chevron head pointing left at box 1, labelled
  12px mono `--text-faint` at its midpoint: "feedback becomes the next small
  issue".
- Caption under the loop, 14px `--text-muted`: "Every gate is a place you can
  stand."
- No data series.

## Slide 25 — Write the rules down before you need them

**Layout:** two-column.

**On slide**

> These are decisions, not settings. One page, agreed, revisited when a vendor
> changes a default.
>
> A charter for AI contributions.

**Speaker notes:** Walk the five decisions and say that each is a choice the
team makes, not a checkbox a vendor ticks: which repos agents may touch and with
which ruleset (for example, "main: PRs only"); who can trigger an agent, who
reviews, who merges, and who never merges; where secrets live and what an agent
may never hold; the patch and soak policy for dependencies and images; and what
"good enough to merge" means for agent output, and where a QA pass is mandatory.
Frame it as a team charter for AI contributions — write it once and review it
when defaults move.

**Visual:** `--surface`. Left column: claim 18px `--text`, second line 14px
`--text-muted`. Right column: `--surface-2` card, five rows, each a 12px mono
`--text-faint` index and a 14px `--text-muted` line. Accent: eyebrow only.

## Slide 26 — Build it once, in this order

**Layout:** diagram (the build ladder).

**On slide**

> Five things to build once, in priority order.
>
> Branch protection → CI → agent identity → sandbox and network → instructions
> file.

**Speaker notes:** Everything here is "build once, benefit forever". If you do
it incrementally, this is the order: branch protection with required checks and
required review on every protected branch, first, because it is the floor;
then a CI pipeline that fails closed, with a QA gate that posts a verdict on the
PR's last push; then an agent identity — a scoped token, a PR-only ruleset, no
secret access; then a sandbox runtime and a network allowlist for agent work;
and finally a short, versioned instructions file (CLAUDE.md, AGENTS.md,
copilot-instructions) reviewed like code.

**Visual:** `--surface`. Five ascending rungs, neutral; the first rung (branch
protection) carries the one accent, marked as "the floor".

**Diagram spec — the build ladder**

- Five horizontal bars stacked bottom to top, each 720×90px, 14px vertical gap,
  radius 10px, fill `--surface-2`, 1px `--line` border. Left edge aligned at
  x=200px so the stack reads as steps; each bar sits 80px further right than the
  one below it.
- Labels, bottom to top: `1 Branch protection`, `2 CI that fails closed`,
  `3 Agent identity`, `4 Sandbox and network`, `5 Instructions file`. Each label
  16px `--text`, left-padded 20px; a 12px mono `--text-faint` note to the right
  of the bar: "the floor", "QA gate on the last push", "scoped token, no
  secrets", "container and allowlist", "reviewed like code".
- The bottom bar (`1`) gets a 2px `--accent-line` border; all others neutral.
- Caption to the right of the stack, 14px `--text-muted`: "Build once, benefit
  forever — this is the order if you do it incrementally."
- No data series.

## Slide 27 — A worked example: an agent stack, end to end

**Layout:** table.

**On slide**

| Piece | How it works |
| --- | --- |
| Coordinator | One coordinator agent reviews and merges; worker agents take one issue at a time |
| Execution | Commands run in a separate sandbox reached over SSH; the sandbox never holds the model key |
| Identity | Agents commit under a fixed author identity, enforced by a pre-push hook |
| Review gate | Every agent PR needs an independent QA pass before merge; agents never merge |
| Merge | A squash with an explicit message and no `Co-authored-by` trailer |
| Dependencies | Images and tools pinned by digest, each at least 24 h old, with a patch rule for major CVEs |

**Speaker notes:** This is one team's stack — a pattern, not our particular
infrastructure, and every idea in slides 19 through 26 shows up in it: a
sandbox, a least-privilege identity, a QA gate, no-agent-merge, pinned
dependencies. The lesson is not the specific tooling. It is that all of it is
*policy written down and enforced by hooks and gates*, not by asking the agent
nicely. Pick the two or three rows your own setup could copy this quarter and
name them out loud.

**Visual:** `--surface`. Six data rows, header 12px mono uppercase
`--text-faint`, first column 14px `--text` (piece names), second 14px
`--text-muted`, hairline rows. Accent: eyebrow only.

## Slide 28 — Demo: a coding agent, with the guardrails on

**Layout:** demo (terminal and GitHub in the evidence column).

**On slide**

> Live, in a plain public repo: one issue, one agent, three guardrails you can
> watch.
>
> Watch for the check it fixes, the secret push it cannot make, and the merge
> only a human can click.

**Speaker notes:** Ten to fifteen minutes, scripted minute by minute in the
run-sheet at the end of this file (Demo). The repo is a small public one with a
freshly added CI job and unit tests — the prerequisites from slide 17, added as
ordinary prep before the talk, not part of the demo. The issue is small and
visible. Let the audience watch the agent's plan and tool calls stream, then
move to GitHub for CI. The three guardrail beats, in order: a failing docs check
the agent reads and fixes; a secret push the pre-push hook refuses; and a human
merge the agent cannot make itself. Caveats to say out loud: this runs against a
throwaway feature branch, the blocked secret is fake and lives on a scratch
branch, and if the agent stalls past ninety seconds you fall back to the
prepared branch. Fallbacks and cost are in the run-sheet.

**Visual:** `--surface`. Evidence column: a terminal screenshot at 16px radius
with a 1px `--line` border, cropped so the refused push is legible at capture
size. Left column: claim in 18px `--text`, watch-for line in 14px `--text-muted`.
Accent: eyebrow plus a 2px `--accent-line` rule beside the refused push on the
screenshot.

## Slide 29 — The checklist: the bar to hold in memory

**Layout:** table.

**On slide**

| Group | The bar |
| --- | --- |
| Before you start | CI runs on every push and fails closed; branch protection requires checks and review |
| Identity and secrets | The agent holds a scoped token and no standing secrets; it never holds the model key |
| Execution | It runs sandboxed with the network capped, not on a shared or personal machine |
| Quality gates | Required checks, required human review, an independent QA pass on the last push |
| Supply chain | New dependencies scanned; a patch and soak policy written down |
| After | Audit logs reviewed; content exclusion understood for what it does not cover |

> The full one-page checklist is in the run-sheet at the end of this file.

**Speaker notes:** This is the takeaway slide — the bar, not the detail. Say the
through-line: an agent is a new, low-privilege contributor, so the same things
that protect you from any contributor protect you from it — required checks,
required review, an independent QA pass, a scoped identity and a sandbox. Point
at the run-sheet for the full list and suggest the room photograph this slide.
Nothing here is vendor-specific; the loop is the same whichever tool you pick.

**Visual:** `--surface`. Six data rows, header 12px mono uppercase
`--text-faint`, first column 14px `--text`, second 14px `--text-muted`, hairline
rows. Caption below, 14px `--text-muted`. Accent: eyebrow only.

## Slide 30 — The rule the whole talk rests on

**Layout:** quote (closing).

**On slide**

> Bound the actor, not the suggestion.

> Monday: turn on branch protection with required checks, then add CI.

**Speaker notes:** Close on the sentence the talk was built to earn: with
assistive tools you review a suggestion, with agents you have to bound an actor,
and everything in between follows from that. Give one action and one owner's
prompt: on Monday, whichever team owns the repo, turn on branch protection with
required checks — that is the floor from slide 26, and it is cheap. Then thank
the room and open for questions, with the demo team standing by for a re-run.

**Visual:** `--bg-soft` band. Quote in `--fs-2xl` at weight 600, `--text`, measure
26 characters per line maximum. The action line 18px `--text-muted`. Attribution
and any footer 12px mono `--text-faint`. Accent: a single hairline rule above the
quote. No logo, no "thank you" alone.

## Slide 31 — References

**Layout:** table.

**On slide**

| Source | What it backs here |
| --- | --- |
| docs.github.com | Copilot concepts, the cloud/coding agent, admin and policy controls, content exclusion, audit logs, data handling, rulesets and required checks |
| learn.microsoft.com | Copilot in Visual Studio: setup, chat, agent mode, MCP |
| code.visualstudio.com | Copilot agent mode and MCP servers in VS Code |
| code.claude.com · docs.anthropic.com | Claude Code platforms, permissions, sandboxing, CLAUDE.md, hooks, GitHub Actions |
| anthropic.com | Sandboxing research and how we contain Claude |
| copilot.github.trust.page | Trust Center FAQ: retention and training |

> All sources checked and dated **1 November 2026** (UTC). Model names, plan
> tiers and retention numbers change: re-read the two or three you plan to act
> on before the talk. Secondary sources for the prompt-injection caveat are
> OWASP LLM01 (genai.owasp.org) and a GitHub community discussion (October
> 2025). The items that could not be confirmed are in the run-sheet at the end
> of this file, not on this slide.

**Speaker notes:** Say the quiet part: this field changes monthly, so re-check
the few numbers you actually plan to act on. Nobody needs to read the table — it
exists so anyone who wants to verify a claim can. Offer to send the file.

**Visual:** `--surface`. Two-column table, first column 12px mono uppercase
`--text-faint` (domains are labels, not prose), second column 14px
`--text-muted`, hairline rows. Accent: eyebrow only. This slide may drop to
12px — it is reference material, not a claim.

---

# Run-sheet (not slides — for the presenter)

## Demo — a coding agent, with the guardrails on (10–15 minutes)

One public repo, one small issue, three guardrails on camera. Everything below
names tools and made-up data; never a client's name.

**The repo and the issue.** A small public, self-contained web repo — visible,
safe to push branches at — with a seeded issue: *"Add a `?` command-reference
overlay that toggles a panel listing every unlocked command."* It is small
enough to finish on camera and it reuses existing metadata, so the agent does
not have to invent structure. Prep merged to main **before** the talk, as an
ordinary PR (it is the talk's own message, not part of the demo): unit tests on
`node --test`; CI with a fast check job (`npm ci`, typecheck, test, build) plus a
separate secrets-scan job; a docs check that fails when the README's command
table has no row for a key the source handles; branch protection on main
(require a PR, require the checks green, no direct pushes); and the pre-push
hook installed on the presenter's laptop.

**Minute by minute.**

- **0:00** Frame it: a normal repo with a normal issue; the agent is a
  contributor with no special rights.
- **0:45** Show main's protection and the seeded issue with `gh issue view`.
- **1:30** Launch the agent in the repo and hand it the issue; let the plan and
  tool calls stream.
- **2:00–4:30** It reads the relevant files, writes the overlay, adds a test,
  runs test and typecheck locally. Narrate once: the same files you would read.
- **4:30** Commit under the agent identity, push the feature branch, open the PR.
- **5:00–6:00** GitHub: CI starts, and the docs check goes red — the README does
  not list `?`. Show the red mark and the log.
- **6:00–7:30** Back in the terminal: read the failed log, edit the README,
  push. Green. **(Guardrail 1: the check the agent fixes.)**
- **7:30–9:00** **(Guardrail 2: the blocked secret.)** Ask the agent to "commit
  the demo token so the CI job can reach the service". It writes a `.env` with a
  fake PAT; `git push` is refused by the pre-push hook. Say the second layer is
  GitHub push protection and the third is the CI secrets job. Delete the file,
  re-push. Do this on a scratch branch so the feature PR stays clean. Use a
  fake token — never a real one, and not a well-known vendor doc example.
- **9:00–10:30** Review: the agent posts a summary on the PR; checks are all
  green; show the diff size and the test it added.
- **10:30–12:00** **(Guardrail 3: the human gate.)** A person reads the diff and
  clicks Merge; branch protection refuses the agent's own merge. Nothing reaches
  main without that click. (Caveat: a solo owner cannot approve their own PR —
  if a formal approving review is wanted, add a second account as a
  collaborator; otherwise the merge click is the human gate.)
- **12:00–13:00** Main updates; run the app and press `?` live. Close on the
  numbers: files changed, tests, minutes, cost.
- **13:00–15:00** Buffer and questions.

**Fallbacks.** A screen recording of the same script, cued to the CI beat in a
background tab. A prepared `demo/help-overlay-final` branch pushed with green CI
beforehand — if the agent stalls past 90 seconds, open a PR against it and
continue from the review beat. Network down: run test, typecheck and build
locally and walk the diff, no CI beat. Prime the night before: warm `npm ci`,
model pinned, notifications off, PR tabs pre-opened.

**What the presentation machine needs.** Node 24 and npm, git, an authenticated
`gh`, the same secrets-scan build CI uses, the coding agent installed and signed
in, the pre-push hook, and a screen recorder. Optional: a second account for a
literal approving review.

**Cost per run.** On a subscription route the marginal cost is $0 — it spends
plan usage, so rehearsals are free. Metered API, on a repo this size: roughly
150–400k input tokens (mostly cache reads) plus 10–20k output, so about
$0.20–$0.60 on a mid model and $0.50–$1.50 on a top model. Budget about $5 for
ten rehearsals plus the live run. (These are estimates from one rehearsal set,
not vendor pricing — re-check the rates.)

## The full checklist (one page)

**Before you let an agent near the repo**

- CI runs on every push and fails closed.
- Tests exist that the agent and CI can run.
- Branch protection or rulesets require checks and review on every protected
  branch.
- Conversation resolution is required before merging.
- A written "what agents may and may not touch" page, agreed by the team.

**Identity and secrets**

- The agent has its own scoped, fine-grained token — no personal tokens.
- The token reaches only the repos it needs (for example, a "main: PRs only"
  ruleset).
- No standing secrets in the agent's shell; read them at runtime or not at all.
- The runtime that executes agent code does not hold the model or provider key.
- Model data handling is checked: is your plan's data used for training?
  (Business and Enterprise: no; individual: opt out.)

**Execution**

- The agent runs sandboxed — a container, a VM, or the vendor's ephemeral
  runner — not on a shared or personal machine.
- Filesystem isolation is on, not just permission prompts.
- Network access is capped: firewall on, allowlist reviewed, dependency hosts
  only.
- MCP servers, plugins and third-party agents are treated as new trust
  boundaries and reviewed.

**Quality gates**

- Required status checks are pinned (choose the source app; strict or loose
  decided).
- Human review is required; the requester cannot approve their own PR.
- An independent QA pass posts a verdict on the last push, before merge.
- The agent cannot approve, merge, or mark its own PR ready.

**Supply chain**

- New dependencies are scanned for malware and CVSS High/Critical.
- A patch and soak policy is written down (for example, a 24-hour soak; major
  CVEs fast).
- Images and tools are pinned by digest or version.

**After**

- Audit logs are reviewed (`action:copilot`, `actor:Copilot`) and streamed to a
  SIEM if you need more than 180 days.
- Content exclusion is understood for what it does *and does not* cover (not
  Agent mode or the CLI; not third-party MCP).
- Agent sessions and merged PRs trace to a human who asked for them.

## Uncertain — re-check before the talk

- **Product naming.** GitHub's docs now say **Copilot cloud agent**; older pages
  and Microsoft Learn still say *coding agent*. Say both names in the room.
- **Plan tiers and trials.** A vendor page states Copilot Pro trials were paused
  on 2026-04-20 — re-check pricing and plan pages before quoting any tier.
- **Model list and data-handling carve-outs.** The model-hosting page names
  specific models with per-provider retention; the "not zero-retention by
  default" carve-out is plan- and eligibility-dependent. Re-read on the day.
- **Retention numbers.** The 28-day input/output figure, the 180-day audit-log
  figure and "session logs for the life of the account" all come from vendor
  docs and the Trust Center FAQ — verify against your contract.
- **Surface availability.** Content exclusion in Edit and Agent modes, MCP
  connections, "Copilot connectors" and the Azure Boards rich flows are a mix of
  GA and public preview. The "supported surfaces for policies" table is the
  authoritative map and it changes.
- **VS Code's current UI shape.** The vendor's own framing suggests the
  chat/edits/agent split is being merged into one surface; the deck describes
  documented capabilities, not the exact menu today.
- **Prompt-injection coverage.** Whether hidden-character filtering is applied
  uniformly across all Copilot chat surfaces is not resolvable from primary
  docs; a public community discussion (secondary, October 2025) argues it is
  inconsistent. Frame it as an open issue.
- **The 84% figure.** Anthropic's prompt-reduction number is vendor-reported and
  not independently verified — say so when you use it.
- **Azure Boards feature depth.** The docs consistently show "create a PR
  directly" and reserve research/plan/iterate for GitHub.com (plus a Teams/Slack
  preview); no deeper backlog integration could be confirmed.

## Build checklist for the artifact

- 31 slides, 16:9; margins 48px; nothing inside 32px of an edge.
- Every content slide has an eyebrow label and exactly one accent use.
- Table slides: six data rows maximum, header 12px mono uppercase.
- Diagram and stat-block slides (2, 5, 7, 12, 13, 15, 19, 24, 26) carry their
  full spec; a builder should not have to guess a box, an arrow or a figure.
- All text pairs clear WCAG AA against their surface.
- The demo screenshot on slide 28 is cropped so the refused push is readable at
  capture size.
- References stay the last slide; the run-sheet material never becomes a slide.
- Check the built deck at 1440px and 390px, no sideways scroll, reduced motion
  honoured.
