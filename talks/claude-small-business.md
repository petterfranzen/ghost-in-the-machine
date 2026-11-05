# Using Claude at a small business — deck source

Deck source for a ~45-minute talk to the staff of a small business: mostly
non-developers, one or two people who own the IT decisions.

- **23 slides**, 16:9. Build target: a Claude Slides artifact (the Major builds
  it from this file; nobody here can reach claude.ai).
- **Every claim is dated 1 November 2026 (UTC)** and sourced on slide 23 from
  claude.com, support.claude.com, docs.claude.com, platform.claude.com and
  academy.claude.com. This field moves monthly — re-check the two or three
  numbers you plan to act on before you print.
- **Content is generic on purpose.** No client or employer names anywhere in
  this file or the deck: examples name tools (Gmail, SharePoint, Salesforce),
  never a company we have worked with.

## How to read a slide

Each slide below has four or five blocks:

- **Layout** — one of the seven in the vocabulary: `title`, `two-column`,
  `big number`, `diagram`, `table`, `quote`, `demo`. The design system's
  Professional theme has a matching layout in brackets: `title`
  (`.slide--title`), `two-column` (`.slide--split`), `big number`
  (`.slide--stats`), `table` (`.slide--table`), `quote` (`.slide--quote`),
  `diagram` (`.slide--split`, image/vector in the evidence column), `demo`
  (`.slide--split`, screenshot in the evidence column) and `title` for the
  closing (`.slide--end`).
- **On slide** — the final text, written short enough to be read from the back
  of a room. Anything longer is speaker notes by definition.
- **Speaker notes** — what to say, including the caveats to say out loud.
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
| Deck chrome | `--bg-soft` | `#0c0e13` | Section dividers and the closing band |
| Slide surface | `--surface` | `#10131a` | Every content slide |
| Table head / code | `--surface-2` | `#151922` | Table header rows, the prompt-pattern block |
| Nested surface | `--surface-3` | `#1b2030` | Inside a box (plugin contents, dashboard panel) |
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

- **Inter** for everything visible; **mono** for eyebrows, step numbers,
  table header cells, numeric columns, footers and slide numbers. Two families,
  no third.
- Sizes: slide title `--fs-xl` (28px) to `--fs-2xl` (36px), body 16–18px,
  table 14px, labels 12px. The title slide uses `--fs-display`. Nothing under
  the 12px floor.
- Headlines are sentences; six bullets maximum; a slide body line stays under
  ~45 characters. No emoji, no exclamation marks, no "seamless"/"unlock".
- Footer rule: hairline `--line`, deck name left, page number right (`01`…`23`)
  in 12px mono `--text-faint`.
- Every content slide carries an eyebrow label: mono, uppercase, tracked
  `+0.08em`, `--accent`, one to three words (`CONNECTORS`, `MICROSOFT 365`,
  `PRIVACY`).
- **One accent per slide.** The eyebrow plus at most one more use: one stat
  value, one chart series, or one marked box or path on a diagram. Everything
  else is ink, surface and space.
- Charts, if any, follow the fixed series order (`--chart-1` `#7af0c8`, then
  blue, violet, amber, pink, teal), labelled axes, and one sentence of finding
  beside the chart.
- Nothing sits inside 32px of an edge at the 1440×810 capture; margins are 48px.
- `prefers-reduced-motion: reduce` collapses every transition; no slide depends
  on motion.

---

# Slides

## Slide 1 — Title

**Layout:** title.

**On slide**

> Using Claude at a small business
>
> A practical tour for non-developers
>
> 1 November 2026 · every claim in this deck is dated and sourced

**Speaker notes:** Set the expectation in one breath: no coding, no plug-in
archaeology — what you can switch on this week, and what it costs you in
attention. Say out loud that the products move monthly, so every claim in the
deck carries a date, and the reference slide at the end has the links. No
agenda slide: the roadmap on the next slide does that job.

**Visual:** `--bg` floor, title in `--fs-display` at weight 600, tracking
`-0.02em`, measure 24–34 characters. Lede `--text-muted` 18px. The date line is
12px mono `--text-faint`. Accent appears once — the eyebrow or a hairline rule
under the title, not both. Footer rule `--line`, deck name left, `01` right.

## Slide 2 — What we'll cover

**Layout:** diagram (roadmap strip).

**On slide**

> Six stops, in the order they pay off
>
> Connectors and plugins · Claude inside Microsoft 365 · documents and sharing ·
> reading a big contract · dashboards · the rest, and privacy
>
> Two live demos at the end. The source list is the last slide.

**Speaker notes:** This is a route, not a feature list. Say the shape: first
what you turn on, then where it sits inside the apps you already use, then the
work nobody has time for (contracts, trackers), then the boring-but-asked
question about our data. Two demos are live; if the room is small, run demo 2
(tender triage) first because it is the most familiar job.

**Visual:** `--surface`. Six boxes in one row, all neutral; accent only in the
eyebrow. Numbers 1–6 in 12px mono `--text-faint`.

**Diagram spec — six-stop roadmap**

- A single horizontal band, full content width (1344px), 120px tall, centred
  vertically on the slide.
- Six equal boxes, 200px wide, 20px gap. Radius 16px, fill `--surface`, 1px
  `--line` border. Inside each box, top-left: step number in 12px mono
  `--text-faint`; below it the label in 16px `--text`, two lines maximum.
- Labels, left to right: `1 Connectors and plugins`, `2 Microsoft 365`,
  `3 Documents and sharing`, `4 Big documents`, `5 Dashboards`,
  `6 The rest, and privacy`.
- Five arrows between boxes: 20px horizontal lines, `--line-strong`, 1.5px,
  with a 6px chevron head pointing right, vertically centred.
- Caption under the band, 14px `--text-muted`, left-aligned to the band: "Two
  live demos at the end. The source list is the last slide."
- No data: this diagram carries order only.

## Slide 3 — First, what "Claude" actually is

**Layout:** diagram (three columns, one merged).

**On slide**

> One product, three shapes
>
> **Chat** — answers, files, projects · **Cowork** — runs multi-step tasks, can
> work in the cloud · **Claude Code** — for developers
>
> Chat and Cowork are merging into one "Claude". While that rolls out, screens
> differ between people.

**Speaker notes:** Give staff one mental model and stop: *chat for answers,
Cowork for "go do this and come back with the deliverable."* Say plainly that
the unified experience is mid-rollout, so their screen may not match their
neighbour's — and that the point of naming it is so the two of them stop
comparing tabs. Claude Code is mentioned only so the room knows what the
developers are talking about.

**Visual:** `--surface`. Three boxes, third one smaller; accent drawn as a
`--accent-line` dashed outline around the first two to show the merge.

**Diagram spec — three shapes, one merge**

- Left box: 380×260px, radius 16px, fill `--surface`, 1px `--line`. Label
  "Chat" 22px `--text` weight 600; three lines 16px `--text-muted`: "Ask
  questions, read files", "Projects hold the context", "Web, desktop, mobile".
- Middle box: same size, 32px to the right. Label "Cowork" 22px; lines:
  "Runs multi-step tasks", "Can work in the cloud", "Returns the deliverable".
- Right box: 260×140px, vertically centred against the two others, 32px to the
  right of the middle box. Label "Claude Code" 18px; one line 14px
  `--text-faint`: "For developers".
- A dashed 1.5px `--accent-line` rounded rectangle, 8px outside the outer edges
  of the Chat and Cowork boxes, spanning both, with a 12px mono `--accent` label
  above its top-left corner: "becoming one Claude".
- No arrows; the dashed enclosure carries the meaning. Nothing else on the
  slide is accented.

## Slide 4 — Ground rule before anything else: you're the reviewer

**Layout:** quote.

**On slide**

> "Claude drafts. You approve."
>
> The rule for every tool in this deck.

**Speaker notes:** This is the safety story *and* the quality story, so say it
before any feature. Everywhere in this deck the human is the last step: in Word
it leaves tracked changes, in Excel it highlights the cells it changed, in
Outlook the draft waits in compose unsent, and risky edits ask for confirmation
first. Nothing is sent, saved or published until a person says so. If someone
only remembers one line from the talk, this is the one.

**Visual:** `--surface`, quote 28–36px `--text` weight 500, measure 26
characters per line maximum, attribution 14px mono `--text-faint`. Accent on
the eyebrow "THE RULE" only. No quotation marks around a person's name — this
is a principle, not a quote from someone.

## Slide 5 — Connectors: what they are

**Layout:** diagram (permission inheritance).

**On slide**

> A connector lets Claude read from — and act in — an app you already use.
>
> It inherits **your** permissions. If you can't open a file, neither can
> Claude.

**Speaker notes:** The sentence that lands with owners: *Claude never sees more
than the person asking already sees.* Walk the diagram left to right and stop
at the boundary. Then the second half: connectors work in chat, Desktop,
Cowork, Mobile and the API, and the same ones appear in all of them. One
caveat for the technical person in the room: custom connectors (your own
internal systems, over MCP) connect from Anthropic's cloud, not from a laptop.

**Visual:** `--surface`. Boundary frame `--line-strong` dashed; the boundary
label is the slide's one accent; all three boxes neutral fill.

**Diagram spec — permission inheritance**

- Three boxes in a row, each 300×180px, 40px gaps, vertically centred.
  Labels: "You" (16px `--text`), "Claude + connector" (16px), "Your app —
  Gmail, Drive, Slack, CRM" (16px, two lines). Under each label, one 14px
  `--text-muted` line: "your account", "acts as you", "already holds the data".
- Two arrows between the boxes, both double-headed (arrows at both ends,
  1.5px `--line-strong`, 24px long, 6px heads): "read" below the first arrow,
  "act" below the second, 12px mono `--text-faint`.
- A dashed 1.5px rectangle with 24px corner radius, 24px outside the outer
  edges of all three boxes and enclosing them, stroke `--line-strong`.
- Above the top-left corner of that rectangle, a 12px mono `--accent` label
  (the slide's one accent): "your permission boundary".
- Below the frame, centred, 14px `--text-muted`: "Claude never sees more than
  the person asking already sees."
- No data series, no numbers — nothing to plot.

## Slide 6 — What's in the directory

**Layout:** table.

**On slide**

| Connector | What it unlocks | Day-one win |
| --- | --- | --- |
| Google Drive | Find and read the documents you already have | "Where is the current price list?" |
| Gmail | Search and read mail, draft replies | "Summarise the last month with this supplier." |
| Google Calendar | See and manage meetings | "Find a free hour with three people." |
| Microsoft 365 | SharePoint, OneDrive, Outlook, Teams in one search | "What did we decide about the renewal?" |
| Slack | Search channels and threads | "Catch me up on #operations since Friday." |
| CRM — Salesforce, HubSpot | Accounts, opportunities, activity | "List the deals that went quiet." |

> Notion, Canva, Figma and Atlassian are there too. Some connectors are
> interactive — they draw a board or dashboard inside the chat.

**Speaker notes:** Demo this one: the "+" in the message box → Connectors.
Show Gmail search and a Drive read as the day-one wins — they are the least
scary and the most obviously useful. Say that the catalogue is in the four
figures, so the honest phrasing is "over a thousand, and it changes weekly";
don't quote a number you can't defend. For the sales side, the CRM connectors
are where the real time comes back.

**Visual:** `--surface`, table per the design system: header row 12px mono
uppercase on `--surface-2`, six data rows at 14px, first column 500 weight
`--text`, others `--text-muted`. Hairlines `--line` between rows; no vertical
rules. Caption 12px `--text-faint` below the table. Accent: eyebrow only.

## Slide 7 — Connectors: the admin controls (Team and Enterprise)

**Layout:** table.

**On slide**

| Control | What it does | Default |
| --- | --- | --- |
| Who enables a connector | An Owner turns it on org-wide; each person still signs in for themselves | — |
| Action permission | Per action: **Always allow**, **Needs approval**, **Blocked** — read mail yes, send mail no | — |
| Requests to add | Members can ask an Owner for a connector | On (Team), Off (Enterprise) |
| Verified domains | Enterprise can pin connectors to approved domains | Off |
| Enterprise-managed auth *(beta)* | One authorisation for the whole organisation | Off |

> Restricting an action only ever narrows what the source app already allows.
> It can never grant more.

**Speaker notes:** This is the slide for the person who owns IT. The
reassurance to say twice: an action limit can only take capability *away*, and
every person still authenticates individually, so the connector inherits their
permissions and nothing more. Show the three-value control as the useful
middle ground — "let Claude read mail, never send it" is a setting a cautious
owner will actually accept.

**Visual:** `--surface`. Chips in the second column carry both the word and, if
state colour is used, the hue: Always allow `--success`, Needs approval
`--warning`, Blocked `--danger` — word first, colour second. Rows otherwise on
`--line` hairlines. Caption 12px mono `--text-faint`. Accent on the eyebrow.

## Slide 8 — Plugins, skills and tools

**Layout:** diagram (containment).

**On slide**

> A connector **can reach** a tool. A skill **knows how we do it**. A plugin is
> both, boxed — installed in one click.
>
> Plugins need a paid plan.

**Speaker notes:** One line does the whole slide: *connector is "can reach",
skill is "knows how we do it", plugin is both, boxed.* Give the small-business
example: your quote template and your contract checklist, written down once as
a skill, means every person in the firm gets the same first draft. Owners on
Team and Enterprise choose which plugins members may add, and can provision
their own.

**Visual:** `--surface`. Plugin box on `--surface-2`, its contents on
`--surface-3`; the containment outline and brace are the slide's one accent.

**Diagram spec — how the three parts fit**

- Left column, two boxes stacked, each 320×140px, 24px apart, radius 16px,
  fill `--surface`, 1px `--line`.
  - Box A label "Connector" 18px `--text`; line below, 14px `--text-muted`:
    "can reach a tool — mail, drive, CRM".
  - Box B label "Skill" 18px; line: "knows how we do it — our template, our
    checklist".
- Right column, single large box 520×360px, 64px to the right, radius 16px,
  fill `--surface-2`, border 1px `--accent-line`. Label at the top "Plugin"
  22px `--text`; inside it, four tiles on `--surface-3`, each 200×90px, radius
  10px, 16px gaps, labels 14px `--text-muted`: "Skill", "Connector",
  "Command", "Agent".
- A 2px `--accent-line` curly brace spanning the height of boxes A and B,
  opening to the right, with a 12px mono `--accent` label on it: "installed
  together".
- A single 1.5px `--accent-line` arrow from the brace to the left edge of the
  Plugin box, 6px head.
- Footer line on the slide, 14px `--text-muted`: "Plugins: all paid plans."

## Slide 9 — Claude inside Microsoft 365: what exists today

**Layout:** table.

**On slide**

| App | What it does inside the app | Status |
| --- | --- | --- |
| Excel | Answers with cell-level citations; builds and flexes models; pivots, formulas, debugging | Generally available, all paid plans |
| Word | Edits as tracked changes; keeps your styles; comment threads | Generally available, all paid plans |
| PowerPoint | Slides in your template; native charts | Generally available, all paid plans |
| Outlook | Triage, drafts left unsent, thread summaries with per-email citations, reads .docx/.xlsx attachments | **Beta**, all paid plans |

> These are add-ins: they work on the file you have open, in the app you are
> already in.

**Speaker notes:** Draw the hard line between this slide and slide 12: the
add-ins work *inside* the open document, the Microsoft 365 connector searches
your whole tenant. Say the Outlook beta caveat out loud; someone will ask why
the mail part feels less finished — that is why. Mention that context carries
between open files (open the workbook and the deck, ask across both).

**Visual:** `--surface`. Table as on slide 6; the "Beta" cell is the only
colour in the table — `--warning` text, with the word "Beta" present. Accent:
eyebrow only.

## Slide 10 — Microsoft 365: how you install it

**Layout:** two-column.

**On slide**

**Left — one person**

> AppSource listing → **Get it now** → sign in with Claude.
> About two minutes, no admin involved.

**Right — the whole firm**

> Microsoft 365 Admin Center → Settings → **Integrated apps** → Add-ins →
> search "Claude for Microsoft 365" → assign to the org, a group or named
> people.
>
> Needs "Let users access the Office Store". If that is off, deploy a custom
> manifest XML instead. Known Microsoft bug: deployment fails from
> **PIM-activated** admin roles.

**Speaker notes:** Frame it as a ten-minute admin task, then name the trap:
the PIM-activated role failure is the single most common deployment failure,
so if the deploy button does nothing for an admin, that is usually why. The
individual route is worth showing because it lets a sceptical owner try the
add-in before anyone buys seats for it.

**Visual:** `--surface`. Two columns, argument left (1.1fr) and evidence right
(0.9fr) per `.slide--split`. Steps in 16px `--text` with the command names in
mono `--text`; the caveats sit in a card on `--surface-2` with a 12px mono
label "CAVEAT" in `--warning` (word present, not colour alone). Accent on the
eyebrow.

## Slide 11 — Microsoft 365: what it can and can't do

**Layout:** two-column.

**On slide**

**Left — it can**

> Draft in your template, work in your styles, keep formulas intact, cite the
> cell it used. Cross-app: context carries between open files. Outlook reads
> `.docx` and `.xlsx` attachments inline.

**Right — it can't**

> Data tables. Macros or VBA. Excel on iPad, Android, or 2016/2019 perpetual.
> Files that aren't open. Anything outside the claude.ai feature set.

> Four habits: hand it a brief, a dataset or a thread and let it draft in your
> template · save a good workflow as a skill so the team reuses it · work on a
> copy for wide edits · treat files from outside the firm as untrusted.

**Speaker notes:** The prompt-injection point is worth thirty seconds: a file
from outside can carry hidden instructions, so treat it as you would an
unknown attachment from a stranger. Then the four habits, which are the
practical half of the slide. On "can't", the honest summary is: the assistant
edits what you can see, and doesn't run your macros.

**Visual:** `--surface`. Left column `--text` with the lead sentence in
`--text-muted`; right column as a list on `--surface-2` with `--line` rules.
The habits strip at the bottom is 14px `--text-muted`, four short items
separated by 8px dots in `--text-faint`. Accent: eyebrow only.

## Slide 12 — The other Microsoft 365 story: the connector

**Layout:** diagram (search fan-out with a write path).

**On slide**

> Separate from the add-ins. One search box over SharePoint, OneDrive, Outlook
> and Teams — on **every plan, including Free**.
>
> Write tools are opt-in: draft or send mail, manage the calendar, create
> files, post in Teams.

**Speaker notes:** This is the "ask the company anything" feature and it is the
one that surprises people, because it is available on the free plan. Say how:
read and search mirror the person's Microsoft 365 permissions, so nobody sees
a folder they couldn't open. Then the write path, with the two honest caveats:
admin-enabled, emails carry an "agent-initiated" attribution header, and
attachments are not supported in the write tools. Pair it with enterprise
search (Ask Your Org, Team and Enterprise) for one box across Slack, Microsoft
365 and Google.

**Visual:** `--surface`. Read arrows `--line-strong`; the write path is the
slide's one accent (`--accent-line`), drawn dashed to mark it as opt-in.

**Diagram spec — connector read and write**

- Left: one box 320×160px, radius 16px, fill `--surface`: label "One Claude
  chat" 20px `--text`; line "ask in plain language" 14px `--text-muted`.
- Right: four boxes stacked, each 320×90px, 16px apart, 64px to the right,
  fill `--surface`: labels "SharePoint", "OneDrive", "Outlook", "Teams"
  (16px `--text`), each with a 12px mono `--text-faint` sub-label
  "your permissions apply".
- Four double-headed arrows from the left box's right edge to each right box,
  1.5px `--line-strong`, 6px heads, label "read and search" 12px mono
  `--text-faint` above the top arrow.
- A dashed 1.5px rectangle with 24px radius, `--line-strong`, enclosing the
  four right boxes with 20px padding; 12px mono `--text-muted` label at its
  top-left: "matches Microsoft 365 permissions".
- Below the left box: a dashed 1.5px `--accent-line` arrow down 80px to a card
  480×120px on `--surface-2`, radius 10px. Card title 12px mono `--accent`
  uppercase: "WRITE TOOLS — OPT IN". Card body 14px `--text-muted`: "Draft or
  send mail · calendar · create files · post in Teams. Admin-enabled; sent mail
  carries an 'agent-initiated' header; no attachments."
- Total accent on slide: the eyebrow plus this one dashed path.

## Slide 13 — Making documents, decks and spreadsheets

**Layout:** big number.

**On slide**

> **30 MB**
> per file — and no paid plan required
>
> Claude writes `.docx`, `.xlsx`, `.pptx` and PDF, draws PNG charts, converts
> between formats ("turn this memo into a deck") and saves straight to Google
> Drive. Excel, PowerPoint and Word files are editable in their own apps
> afterwards.

**Speaker notes:** The free-plan point is deliberate: it is how you get a
sceptical owner to try this before buying seats. Note the cost side honestly —
building and editing files draws more usage than an ordinary chat, so a heavy
file week will eat a plan's allowance faster. Also say what the deliverable is
not: it is a first draft in a real file format, not a finished document.

**Visual:** `--surface`. One stat tile, value "30 MB" in `--fs-display` /
36–48px, tabular figures, `--accent` fill with `--accent-ink` text — this is
the slide's one accent use. Label above it in 12px mono uppercase
`--text-faint`: "FILE SIZE LIMIT". Footnotes 14px `--text-muted`.

## Slide 14 — Artifacts: sharing and permissions

**Layout:** table.

**On slide**

| Plan | Who you can share with | Access levels |
| --- | --- | --- |
| Pro / Max | Only you · anyone with the link · invite named people by email *(beta)* | view, comment |
| Team / Enterprise | Only invited people · everyone in your organisation · anyone with the link | view, comment, edit |

> Artifacts start private. Viewers need a Claude account. Docs, Slides and
> Design are generally available on every plan including Free; **Dashboards and
> Motion are beta**.

**Speaker notes:** For a small business the default is the interesting part: on
Team and Enterprise an artifact stays inside the organisation unless an Owner
turns external sharing on. That is the answer to "can someone accidentally
publish this to the internet" — by default, no. Note the two admin
prerequisites if artifacts don't appear at all: "code execution and file
creation" has to be on, then the organisation's artifacts setting.

**Visual:** `--surface`. Table as on slide 6, two data rows; the "beta" markers
in `--text-faint` with the word present. Caption below the table. Accent:
eyebrow only.

## Slide 15 — Reading a big tender, contract or spec (1): context and projects

**Layout:** big number.

**On slide**

> **200K** tokens — about 500 pages, standard on paid plans
> **1M** tokens — current models, when you need the whole thing at once
> **10×** — the extra capacity projects add, once retrieval kicks in
>
> One-off document → drop the PDF into a chat. Documents you revisit → put them
> in a project, which holds the knowledge base and the standing instructions.

**Speaker notes:** The rule of thumb is the useful part: a single tender is a
chat; a bid library or a set of contracts you come back to is a project.
Projects are where the standing instruction lives ("always check against our
bid criteria"), so the work gets better each time you open it instead of you
retyping the prompt. Free plans get five projects, so this is testable before
buying anything.

**Visual:** `--surface`. Three stat tiles in one row, `--surface` on hairline
`--line`, radius 10px; label 12px mono uppercase `--text-faint`, value 36–48px
tabular, first value only in `--accent`; footnote 12px `--text-muted`. One
sentence under the row reads the numbers, per the design system's stats rule.

## Slide 16 — Big documents (2): the pattern that works

**Layout:** diagram (six-step flow, with the output table).

**On slide**

> 1 Role and goal · 2 Name the source and demand quotes · 3 Extract into fixed
> columns · 4 Ask for the uncomfortable · 5 Mark unknowns **UNKNOWN** ·
> 6 Group the mandatory into a go/no-go checklist
>
> Columns: Requirement · Mandatory? · Our position · Risk · Blocker · Page/quote

**Speaker notes:** Say the point of the slide: the magic is not the upload, it
is the structure plus two instructions — cite the page, and admit the gaps. The
"UNKNOWN" step is what makes the output usable; a model that guesses is worse
than useless on a tender. Then show one cited table cell and click through to
its source. On citations generally: they are documented for the API (exact
passages with page and character ranges), for research mode, for enterprise
search, and cell-level in Excel and per-email in Outlook — say that plainly
rather than implying a switch in the chat window.

**Visual:** `--surface`. Six numbered steps in a single vertical flow, numbers
12px mono `--text-faint`, text 16px `--text`; the output table thumbnail sits
to the right on `--surface-2`. The one accent marks step 5 ("UNKNOWN") — it is
the habit that carries the slide.

**Diagram spec — six-step triage flow**

- Six rounded rows stacked vertically, each 640×56px, 12px apart, radius 10px,
  fill `--surface`, 1px `--line`. Left inset 16px: number (`01`–`06`, 12px mono
  `--text-faint`). Main text 16px `--text`:
  1. "Role and goal: you are checking this tender against our bid criteria."
  2. "Name the file, and say: quote the page for every claim."
  3. "Extract into fixed columns — nothing free-form."
  4. "Ask for the uncomfortable: ambiguous, contradictory, missing."
  5. "No matching evidence? Write UNKNOWN, never a guess." *(accent: 1px
     `--accent-line` border and a 12px mono `--accent` leading label "STEP 5")*
  6. "Group the mandatory requirements into a go/no-go checklist."
- Between consecutive rows, a 1.5px `--line-strong` arrow, 12px long, 6px head,
  centred on the 12px gap.
- Right column: a table thumbnail 560×260px, radius 10px, fill `--surface-2`,
  1px `--line`. Header row of six cells in 12px mono uppercase `--text-faint`:
  "REQUIREMENT", "MANDATORY?", "OUR POSITION", "RISK", "BLOCKER", "PAGE/QUOTE".
  Three body rows of placeholder hairlines `--line` at 40px pitch (grey bars of
  70% width — deliberately unreadable placeholders, this is a layout, not data).
  One cell in the first body row is filled `--accent-soft` with 12px mono
  `--accent` text "click for source", to show the citation affordance.
- Caption under the thumbnail, 12px `--text-faint`: "Every row carries the page
  it came from. Missing evidence stays visible."

## Slide 17 — Demo: triage a real tender in a project

**Layout:** demo (screenshot in the evidence column).

**On slide**

> Live: one tender PDF into a project, then the six-column table, then click a
> citation.
>
> Watch for the **UNKNOWN** rows — that is the part that makes it trustworthy.

**Speaker notes:** Seven minutes, scripted in the run-sheet at the end of this
file (Demo 2). Use a document the room recognises as boring — a supplier
contract, a tender, a long specification — and produce the table live. Leave
one UNKNOWN visible on screen and ask the room what they would do next; that
conversation is worth more than the demo. Have a second, stubbed document ready
to show that a project scales past one file.

**Visual:** `--surface`. Screenshot in the right column with a 16px radius and
1px `--line` border, cropped so the cited table is legible at capture size.
Left column: claim in 18px `--text`, watch-for line in 14px `--text-muted`.
Accent on the eyebrow and, optionally, a 2px `--accent-line` callout rule
beside the UNKNOWN row on the screenshot.

## Slide 18 — Dashboards: what's possible

**Layout:** diagram (data flow with two charts).

**On slide**

> Ask in plain language; Claude writes a SQL query for each chart, runs it
> against your data, and shows the query and the last refresh on the chart.
>
> **Beta**, on paid plans; off by default on Enterprise until an Owner turns it
> on.

**Speaker notes:** Where the data comes from is the question you will get: a
data warehouse you connect (Redshift, BigQuery, ClickHouse, Databricks,
Snowflake), or any app you have already connected — "a dashboard of my open
opportunities" works without a warehouse. Set the expectation honestly: this is
for quick questions, not a replacement for the accounting system or the BI
tool. If a number decides money, it comes from the system of record.

**Visual:** `--surface`. Data-flow boxes `--surface`, the question box accented
(`--accent-soft` fill, 12px mono `--accent` label "QUESTION"). Chart panel on
`--surface-2` using `--chart-1` and `--chart-2` only.

**Diagram spec — from question to chart**

- Top-left: box 360×120px, radius 16px, fill `--accent-soft`, 1px
  `--accent-line`. Label 12px mono uppercase `--accent`: "PLAIN-LANGUAGE
  QUESTION"; body 16px `--text`: "Which of our open deals have gone quiet?"
- Arrow right, 1.5px `--line-strong`, 60px long, 6px head; 14px `--text-muted`
  label above it: "Claude Dashboards (beta)".
- Centre: box 320×120px, radius 16px, fill `--surface`, 1px `--line`. Two
  lines, 14px `--text-muted`: "writes one SQL query per chart", "runs it and
  refreshes on a schedule".
- Two arrows leaving the centre box, each 1.5px `--line-strong`, labels above
  them in 12px mono `--text-faint`:
  - "a warehouse you connect: Redshift · BigQuery · ClickHouse · Databricks ·
    Snowflake" → box 460×100px, radius 10px, fill `--surface`, 14px `--text`
    label "Your data".
  - "any app you have already connected: CRM · mail · calendar · files" → box
    460×100px, same style, 14px `--text` label "Your connectors".
- Right: a panel 520×300px, radius 16px, fill `--surface-2`, 1px `--line`,
  containing two charts side by side:
  - Chart A, 230×180px: horizontal bars, four bars, all `--chart-1` `#7af0c8`,
    values 12, 9, 6, 3 (days since last activity) with category labels 12px mono
    `--text-faint` ("Account A"…"Account D"). Axis line `--line`; gridlines at
    3, 6, 9 and 12.
  - Chart B, 230×180px: line chart, single series `--chart-2` `#8ab4ff`, twelve
    weekly points rising 2 → 11; x labels "W1…W12" in 12px mono `--text-faint`,
    y axis 0–12 labelled in 12px mono.
  - Under each chart, 12px mono `--text-faint`: "SQL shown · refreshed 09:00".
- One sentence beside the panel, 16px `--text`: "Every chart can be opened to
  its query, so nobody has to trust a number they can't check."
- Accent budget: the question box plus the eyebrow. Chart series colours are
  chart colours, not extra accents.

## Slide 19 — Dashboards for tracking progress

**Layout:** two-column.

**On slide**

**Left — tracking the work**

> No warehouse needed. Ask Claude to pull from the connectors you already have
> — mail, Slack, files, calendar — and build an Excel tracker: status, blockers,
> who owns what.

**Right — tracking our use of Claude**

> Smart reports (Enterprise, off by default, ten a month) read how the team uses
> Claude: workstreams, cost per output, common pain points, and what to turn
> into a shared skill.

> Neither of these replaces the system of record. Numbers that decide money come
> from the finance system.

**Speaker notes:** Two different audiences, so separate them: "track the
project" is for the person running delivery; "track our Claude investment" is
for whoever signs the invoice. Read the last line out loud — it is the one that
keeps the room's trust — and add that smart reports are explicitly not for
individual performance review, which is the question this kind of reporting
always raises.

**Visual:** `--surface`. Two columns, each a card on `--surface` with a 12px
mono uppercase `--text-faint` heading. Accent marks the left card's heading
only. Bottom line 14px `--text-muted` in a `--surface-2` strip with a 1px
`--line` top rule.

## Slide 20 — Other ways of working: projects, memory, research, schedules

**Layout:** table.

**On slide**

| Feature | What it gives you | Availability |
| --- | --- | --- |
| Projects | A knowledge base plus standing instructions, per topic | Paid gets retrieval that scales past the context window; five projects on Free |
| Memory | Remembers your role, preferences and projects; can search past chats | On by default on Free, Pro and Max; **off per member on Team and Enterprise** until an Owner turns it on |
| Research | Multi-step web and connector research with cited sources | Paid |
| Scheduled tasks | Recurring briefings, weekly reports, watching a competitor | Paid, runs in the cloud while your computer is asleep |

**Speaker notes:** Pick one per audience instead of listing them all. For a
manager: "a Monday 9am summary of last week's mail and Slack". For anyone:
"turn research on before you ask a market question". The memory row is the one
to flag for the cautious — on Team and Enterprise it is off for each member
until an owner enables it, which is the opposite of what people assume.

**Visual:** `--surface`. Table, four data rows, 14px body, 12px mono header on
`--surface-2`; the "off per member" cell is the only emphasised cell (`--text`
at 500 weight plus the word "off", not colour alone). Caption 12px
`--text-faint`: "Projects, memory, research and schedules all reach further on a
paid plan; only the Free limits named above are usable without one." Accent: eyebrow only.

## Slide 21 — Data and privacy: the question you'll be asked

**Layout:** two-column.

**On slide**

**Left — the two sentences that answer it**

> On a work plan — Team, Enterprise, the API — your chats are **not used to
> train models by default**. Only if you opt in, or send feedback.
>
> On Free, Pro and Max there is a user setting for model improvement. Turn it
> off and your chats are not used.

**Right — what the owner controls**

> Retention: a work-plan Owner sets one organisation-wide period.
> The API keeps data 30 days; zero retention exists on eligible endpoints.
> Microsoft 365 add-in data is deleted within 30 days.
> Chat history stays in the browser; add-in activity is not in the audit log yet.

**Speaker notes:** Give the room the two sentences first and let them land —
on a work plan, no training by default; on consumer plans, one setting. Then
the retention column for the owner, including the two caveats worth saying
aloud: add-in activity is not in the enterprise audit log yet (it is in the
Compliance API, in beta), and on Enterprise you also get single sign-on, SCIM,
audit logs, customer-managed keys and US-only inference. If someone asks about
a specific legal duty, say plainly that it is a question for their adviser and
hand them the two support links — don't improvise compliance.

**Visual:** `--surface`. Left column: the two answers as cards, the second on
`--surface-2`; the phrase "not used to train" carries the slide's one accent at
weight 500 (a phrase, not body copy in accent — keep the rest in `--text`).
Right column: a plain list on hairlines. No lock icons, no shield clip art.

## Slide 22 — Recap and where to start

**Layout:** diagram (four steps, then the plan ladder).

**On slide**

> 1 Connect one tool — Google Workspace or Microsoft 365
> 2 Make one project for a job that repeats
> 3 Save one good prompt as a skill
> 4 Schedule one weekly report
>
> Free gets you connectors and file creation. Paid adds plugins, research,
> schedules and dashboards. Team and Enterprise add the governance: single
> sign-on, SCIM, audit logs, customer-managed keys.

**Speaker notes:** End on the homework, not on a summary: fifteen minutes after
the talk, connect one tool and run one real task on real work. Then the buying
line, honestly: most small firms should start on a paid plan for one or two
people and add governance when a second person starts depending on it. Do not
end with "thank you".

**Visual:** `--bg-soft` band (the design system's closing layout). Steps as
four chevrons on `--surface`, the first accented; plan ladder as three rungs,
lowest to highest, 14px `--text-muted` with rung labels in 12px mono
`--text-faint` ("FREE", "PAID", "TEAM / ENTERPRISE"). Footer with deck name and
`22`.

**Diagram spec — four steps and three rungs**

- Chevron strip: four chevrons across 1200px, each 300px wide, 110px tall,
  arrow-shaped right edge (30px inset), fill `--surface`, 1px `--line`. Inside:
  number `01`–`04` in 12px mono `--text-faint`, then the step text 16px
  `--text`, two lines maximum. The first chevron is filled `--accent-soft` with
  a 1px `--accent-line` border and its number in `--accent` — the accent marks
  the one step to do first.
- Below, 48px gap: three rungs as horizontal bars, right-aligned, widths
  400/560/720px, heights 56px, 12px apart, radius 10px, fill `--surface`, 1px
  `--line`. Left label in 12px mono `--text-faint` on each bar's left edge
  ("FREE", "PAID", "TEAM / ENTERPRISE"); 14px `--text-muted` text inside each
  bar: "connectors, file creation" · "plugins, research, schedules,
  dashboards" · "single sign-on, SCIM, audit logs, customer-managed keys".
- No arrows between rungs. The stair shape carries the meaning.
- Above the strip, a 12px mono `--accent` eyebrow: "START HERE".

## Slide 23 — References

**Layout:** table.

**On slide**

| Source | What it backs here |
| --- | --- |
| support.claude.com | Connectors and their admin controls, plugins, artifacts and sharing, dashboards, projects and retrieval, memory, research, schedules, smart reports, data and training, retention, plan descriptions |
| docs.claude.com | Office agents: Excel, Word, PowerPoint, Outlook, working across apps — features, limits, install, data handling |
| claude.com | Claude for Microsoft 365, the connectors and plugins marketplace, artifacts, plan and pricing pages |
| platform.claude.com | API documentation, including citations |
| academy.claude.com | Generating project status reports |
| claude.com/resources/articles | Announcements and explainers, e.g. citations, dashboards and Motion |

> All sources checked and dated **1 November 2026** (UTC). Plan names, prices
> and model limits change: read them off claude.com/pricing on the day of the
> talk. The few items that could not be confirmed are in the run-sheet at the
> end of this file, not on this slide.

**Speaker notes:** Say the quiet part: this field changes monthly, so re-check
the two or three numbers you actually plan to act on. Nobody needs to read the
table — it exists so that anyone who wants to verify a claim can. Offer to send
the file.

**Visual:** `--surface`. Two-column table, first column 12px mono uppercase
`--text-faint` (domains are labels, not prose), second column 14px
`--text-muted`, hairlines between rows. Accent: eyebrow only. Font size may
drop to 12px for this slide only — it is reference material, not a claim.

---

# Run-sheet (not slides — for the presenter)

## Live demos

Keep two, drop the third if the room is small or the wifi is bad. Every demo
runs on generic, made-up data; never a client's name.

**Demo 1 — ask the company (5 minutes, Team or Enterprise).** In an enterprise
search project, ask a real policy question ("What is our remote-work policy?")
or a status question ("summarise last week's decisions about the renewal"),
across Slack and Microsoft 365 or Google. Show the cited answer, click one
source, then ask the same question again with the connector toggled off to
prove that permissions are respected. *Lands because:* one search box over the
tools they already use, with receipts.

**Demo 2 — tender triage in a project (7 minutes).** Make a project, put a real
tender or contract PDF in it as project knowledge, paste the six-step pattern
from slide 16, produce the Requirement · Mandatory · Our position · Risk ·
Blocker · Page/quote table, and leave the UNKNOWNs visible. Have a second,
stubbed document ready to show retrieval behaviour. *Lands because:* it is the
exact job nobody has time for, and the citations make it trustworthy. **Run
this one first if the room is small.**

**Demo 3 — the Excel add-in, end to end (7 minutes).** Open a workbook, ask
Claude to flex an assumption ("change the discount rate to 8% and update the
dependents"), show the cell-level citations and the review-before-apply prompt,
then hand the result to PowerPoint to make one slide from the model. *Lands
because:* it shows Claude inside the tools, not in another window, and that
every edit is reviewable. Caveat out loud: Outlook is beta, so demo mail last
or not at all.

## Uncertain — re-check before the deck is printed

- **Catalogue size.** The marketplace page shows a four-figure connector count.
  Treat the exact number as a moving target: say "over a thousand" or omit it.
- **"Ultra" plan.** Appears in support articles as a paid tier, but no
  dedicated pricing page was found. Read plan names and prices off
  claude.com/pricing on the day.
- **Citations in the chat window.** Citations are documented for the API, and
  referenced in research mode, enterprise search and the Office add-ins. A
  user-facing citations toggle in the web chat could not be confirmed, so the
  deck frames it as "Claude cites sources (API, research, enterprise search,
  Excel and Outlook)" rather than a switch.
- **Model names and context sizes** (200K standard, 1M on current models) are
  as stated on the dated support page and will move. Re-check the context-window
  article in the week of the talk.
- **Cowork and the "new Claude experience" naming** is mid-rollout, so on-screen
  labels vary between people. The speaker notes avoid naming UI tabs precisely.
- **Claude Dashboards** and **Motion** are beta, and dashboards are off by
  default on Enterprise. Plan gating and prices are at Anthropic's discretion.

## Build checklist for the artifact

- 23 slides, 16:9; margins 48px; nothing inside 32px of an edge.
- Every content slide has an eyebrow label and exactly one accent use.
- Table slides: six data rows maximum, header 12px mono uppercase.
- All text pairs clear WCAG AA against their surface.
- Screenshots on slide 17 cropped so the cited row is readable at capture size.
- References stay the last slide; the run-sheet material never becomes a slide.
