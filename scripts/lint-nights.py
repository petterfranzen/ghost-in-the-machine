#!/usr/bin/env python3
"""Checks every night folder against the contract the Pages index and the crew
page assume: a `YYYY-MM-DD-<slug>/` folder with a README.md, a build.sh and a
committed `dist/index.html`, and a line in LOG.md. Exits non-zero and lists
every problem it finds.

Wired into CI (.github/workflows/ci.yml, job `nightlint`) so a night that skips
part of the contract fails the PR instead of quietly breaking the landing page.
"""
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent.parent
nights = root / "nights"
log = (root / "LOG.md").read_text()

NAME = re.compile(r"^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$")

# Legacy nights that predate the contract: folder name -> why it is excused.
# Keep this empty unless a night cannot be fixed; a night that is merely
# incomplete should be fixed, not excused.
ALLOW = {}


def main() -> int:
    folders = sorted(
        p for p in nights.iterdir() if p.is_dir() and not p.name.startswith(".")
    )
    problems = []
    excused = []

    for d in folders:
        name = d.name
        if not NAME.match(name):
            problems.append(f"nights/{name}: folder name must be YYYY-MM-DD-slug")
            continue
        if name in ALLOW:
            excused.append(f"nights/{name}: {ALLOW[name]}")
            continue
        for f in ("README.md", "build.sh"):
            if not (d / f).is_file():
                problems.append(f"nights/{name}: missing {f}")
        if not (d / "dist" / "index.html").is_file():
            problems.append(f"nights/{name}: missing dist/index.html")
        if f"| {name} |" not in log:
            problems.append(f"nights/{name}: no line in LOG.md")

    for e in excused:
        print("allow-listed:", e)

    if problems:
        print("Night lint failed:")
        for p in problems:
            print(" -", p)
        print(f"\n{len(problems)} problem(s) across {len(folders)} night(s).")
        return 1

    print(f"Night lint ok: {len(folders)} night(s) match the contract.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
