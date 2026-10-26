#!/usr/bin/env python3
"""Writes the Pages landing page from LOG.md: one card per night with a dist/."""
import html
import pathlib
import sys

root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1])
rows = []
for line in (root / "LOG.md").read_text().splitlines():
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    if len(cells) < 5 or cells[0] in ("Date", "") or set(cells[0]) <= set("-:"):
        continue
    date, folder, lang, idea, verdict = cells[:5]
    if (out / folder / "index.html").exists():
        rows.append((date, folder, lang, idea, verdict))
rows.sort(reverse=True)

items = "\n".join(
    f'<li><a href="{html.escape(f)}/"><span class="d">{html.escape(d)}</span>'
    f'<span class="i">{html.escape(i)}</span><span class="l">{html.escape(l)}</span></a>'
    f'<span class="v">{html.escape(v)}</span></li>'
    for d, f, l, i, v in rows
) or "<li>No nights yet. The first one lands after the nightly builder's first run.</li>"

(out / "index.html").write_text(f"""<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ghost-in-the-machine</title>
<style>
:root{{--bg:#f4f2ee;--fg:#24222a;--mute:#6d6875;--line:#dcd7cf;--acc:#5b6f8f}}
@media (prefers-color-scheme:dark){{:root{{--bg:#16151a;--fg:#e6e2dc;--mute:#9a94a1;--line:#2c2a31;--acc:#9fb3d6}}}}
body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;padding:32px max(16px,env(safe-area-inset-left))}}
main{{max-width:640px;margin:auto}} h1{{font-weight:600;letter-spacing:-.01em}} p{{color:var(--mute)}}
ul{{list-style:none;padding:0}} li{{border-top:1px solid var(--line);padding:14px 0}}
a{{color:inherit;text-decoration:none;display:grid;grid-template-columns:7.5em 1fr;gap:2px 12px}}
a:hover .i{{color:var(--acc)}} .d{{color:var(--mute);font-variant-numeric:tabular-nums}}
.l{{grid-column:2;color:var(--mute);font-size:14px}} .v{{display:block;margin-left:calc(7.5em + 12px);font-size:14px;color:var(--mute)}}
</style>
<main><h1>ghost-in-the-machine</h1>
<p>A small app each night, in a language and idea not done before.</p>
<ul>{items}</ul></main>""")
