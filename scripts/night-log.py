#!/usr/bin/env python3
"""Prints the nightly log table from nights/*/night.json, oldest first.

The nightly builder writes one night.json per night (keys: date, language,
idea, verdict); LOG.md keeps only the wishes, backlog and lessons.
"""
import json
import pathlib
import sys

root = pathlib.Path(__file__).resolve().parent.parent
KEYS = ("date", "language", "idea", "verdict")


def fail(message):
    print(f"night-log: {message}", file=sys.stderr)
    raise SystemExit(1)


rows = []
for path in sorted((root / "nights").glob("*/night.json")):
    folder = path.parent.name
    try:
        data = json.loads(path.read_text())
    except OSError as exc:
        fail(f"{path}: cannot read ({exc})")
    except ValueError as exc:
        fail(f"{path}: not valid JSON ({exc})")
    if not isinstance(data, dict):
        fail(f"{path}: expected a JSON object")
    missing = [k for k in KEYS if not isinstance(data.get(k), str) or not data[k].strip()]
    if missing:
        fail(f"{path.relative_to(root)}: missing {'/'.join(missing)}")
    if not folder.startswith(data["date"] + "-") or folder[:10] != data["date"]:
        fail(f"{path.relative_to(root)}: date {data['date']!r} is not the folder's date prefix")
    rows.append((data["date"], folder, data["language"], data["idea"], data["verdict"]))

rows.sort()
print("| Date | Folder | Language | Idea | Verdict / feedback |")
print("|---|---|---|---|---|")
for date, folder, language, idea, verdict in rows:
    print(f"| {date} | {folder} | {language} | {idea} | {verdict} |")
