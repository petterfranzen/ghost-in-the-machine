#!/usr/bin/env bash
# hq/board — build/check the Section 9 waits board.
#
# The board is a single static file: hq/board/index.html. There is nothing to
# compile. This script is the folder's test gate: it proves the page's data
# contract and its offline sample copy have not drifted, that the waits schema
# is honoured, and that the DOM hooks and phone/reduced-motion rules are
# present. Run: bash hq/board/build.sh
set -euo pipefail
cd "$(dirname "$0")"

python3 - <<'PY'
import json, re, sys

page = open("index.html", encoding="utf-8").read()
sample = json.load(open("board-sample.json", encoding="utf-8"))

def fail(msg):
    print("board check FAILED:", msg)
    sys.exit(1)

# 1. The offline sample is duplicated inline (a file:// page cannot fetch a
#    sibling .json), so the two copies must stay identical.
m = re.search(r'<script type="application/json" id="board-sample">(.*?)</script>', page, re.S)
if not m:
    fail("index.html has no inline #board-sample block")
if json.loads(m.group(1)) != sample:
    fail("inline #board-sample differs from board-sample.json")

# 2. The sample follows Saito's board schema (extended for the waits board).
need = {"generatedAt", "budget", "model", "agents", "tasks"}
if set(sample) - {"sample"} != need:
    fail("sample top-level keys are %s, want %s" % (sorted(sample), sorted(need)))
if sample.get("sample") is not True:
    fail("board-sample.json must set \"sample\": true")
if not re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$", sample["generatedAt"]):
    fail("generatedAt is not ISO 8601 Zulu")
states = {"working", "idle", "blocked", "sleeping", "paused"}  # "paused" maps to sleeping on the page
if len({a["name"] for a in sample["agents"]}) != 8:
    fail("sample must list all eight crew")
for a in sample["agents"]:
    if a["state"] not in states:
        fail("agent %r has unknown state %r" % (a.get("name"), a.get("state")))

# 2b. Tasks: the waits board adds `waits`, `waitsText` and `url`; `blocks` is
#     optional (how many open tasks clear when this one does).
statuses = {"todo", "working", "review", "blocked", "done"}
waits = {"petter", "major", "qa", "agent", "task"}
zulu = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
issue_url = "https://github.com/petterfranzen/section9-hq/issues/"
if not sample["tasks"]:
    fail("sample has no tasks")
for t in sample["tasks"]:
    tid = t.get("id")
    if not isinstance(tid, int):
        fail("task %r has a non-integer id" % tid)
    if not isinstance(t.get("title"), str) or not t["title"].strip():
        fail("task %r has no title" % tid)
    if not isinstance(t.get("agent"), str) or not t["agent"]:
        fail("task %r has no agent" % tid)
    if t.get("status") not in statuses:
        fail("task %r has unknown status %r" % (tid, t.get("status")))
    if t.get("waits") not in waits:
        fail("task %r has unknown waits %r (want one of %s)" % (tid, t.get("waits"), sorted(waits)))
    if not isinstance(t.get("waitsText"), str):
        fail("task %r has no waitsText" % tid)
    if not isinstance(t.get("url"), str) or not t["url"].startswith(issue_url):
        fail("task %r url must be a section9-hq issue link" % tid)
    if t.get("pr") is not None and not t["pr"].startswith("https://"):
        fail("task %r has a non-public PR url" % tid)
    if not isinstance(t.get("updated"), str) or not zulu.match(t["updated"]):
        fail("task %r updated is not ISO 8601 Zulu" % tid)
    if "blocks" in t and not (isinstance(t["blocks"], int) and t["blocks"] >= 0):
        fail("task %r blocks must be a non-negative integer" % tid)

# 3. The DOM hooks the renderer writes into must exist exactly once.
for hook in ('id="lanes"', 'id="start-here"', 'id="chips"', 'id="columns"', 'id="filter-line"', 'id="meta"', 'id="live"'):
    if page.count(hook) != 1:
        fail("expected exactly one %s" % hook)

# 4. Contract details the brief asks for: board.json, 60 s poll, five waits
#    columns with Needs Petter highlighted, light/dark themes, reduced motion,
#    phone stacking at 390 px, and chip filter state.
for needle, why in (
    ("fetch('./board.json'", "the page must poll ./board.json"),
    ("POLL_MS = 60000", "the poll interval must be 60 s"),
    ("prefers-reduced-motion", "reduced motion must be honoured"),
    ("max-width:700px", "columns must stack on a phone"),
    ("aria-pressed", "the agent filter chips must expose their state"),
    ("data-theme", "the page must carry a light/dark theme"),
    ("prefers-color-scheme", "the default theme must follow the OS"),
    ('class="column waits-', "the waits columns must carry their key class"),
    ("START_LIMIT = 3", "Start here must list three cards"),
    ("min-width:44px", "links need a 44 px tap target"),
    ('class="pr"', "each card must render the PR link when it has one"),
    ("Nothing here", "an empty column must read softly"),
):
    if needle not in page:
        fail("missing: %s (%s)" % (needle, why))

print("board check OK: 8 crew, %d open tasks across %d waits columns, schema + hooks + phone/theme rules present"
      % (len(sample["tasks"]), len({t["waits"] for t in sample["tasks"]})))
PY
