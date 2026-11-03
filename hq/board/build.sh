#!/usr/bin/env bash
# hq/board — build/check the Section 9 board page.
#
# The board is a single static file: hq/board/index.html. There is nothing to
# compile. This script is the folder's test gate: it proves the page's data
# contract and its offline sample copy have not drifted, and that the DOM hooks
# the page needs are present. Run: bash hq/board/build.sh
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

# 2. The sample follows Saito's status.json schema.
need = {"generatedAt", "budget", "model", "agents", "tasks"}
if set(sample) - {"sample"} != need:
    fail("sample top-level keys are %s, want %s" % (sorted(sample), sorted(need)))
if not re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$", sample["generatedAt"]):
    fail("generatedAt is not ISO 8601 Zulu")
states = {"working", "idle", "blocked", "sleeping", "paused"}  # "paused" is a live crew/status.json state; the page maps it to sleeping
if len({a["name"] for a in sample["agents"]}) != 8:
    fail("sample must list all eight crew")
for a in sample["agents"]:
    if a["state"] not in states:
        fail("agent %r has unknown state %r" % (a.get("name"), a.get("state")))
statuses = {"todo", "working", "review", "blocked", "done"}
for t in sample["tasks"]:
    if t["status"] not in statuses:
        fail("task %r has unknown status %r" % (t.get("id"), t.get("status")))
    if t["pr"] is not None and not t["pr"].startswith("https://"):
        fail("task %r has a non-public PR url" % t.get("id"))

# 3. The DOM hooks the renderer writes into must exist exactly once.
for hook in ('id="lanes"', 'id="columns"', 'id="filter-line"', 'id="meta"', 'id="live"'):
    if page.count(hook) != 1:
        fail("expected exactly one %s" % hook)

# 4. Contract details the brief asks for: 60 s poll, reduced-motion, 390 px.
for needle, why in (
    ("fetch('./status.json'", "the page must poll ./status.json"),
    ("60000", "the poll interval must be 60 s"),
    ("prefers-reduced-motion", "reduced motion must be honoured"),
    ("max-width:700px", "columns must stack on a phone"),
    ("DONE_LIMIT = 10", "Done must collapse to the last 10"),
    ("aria-pressed", "agent lanes must expose their filter state"),
):
    if needle not in page:
        fail("missing: %s (%s)" % (needle, why))

print("board check OK: 8 crew, %d tasks (%d done), schema + hooks + phone rules present"
      % (len(sample["tasks"]), sum(1 for t in sample["tasks"] if t["status"] == "done")))
PY
