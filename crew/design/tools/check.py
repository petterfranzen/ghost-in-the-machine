#!/usr/bin/env python3
"""Verify the Section 9 design system, with no dependencies.

1. Parse the custom properties out of tokens/*.css.
2. Compare them with tokens/tokens.json (the copy other tools read).
3. Recompute every pair in tokens/contrast.json with alpha compositing and
   fail anything under its WCAG minimum.

Usage: python3 crew/design/tools/check.py crew/design
Exit code 0 means in sync and AA-clean; 1 means it printed a failure.
"""
import json
import pathlib
import re
import sys
import urllib.parse

# token name -> path inside tokens.json
BASE_MAP = {}
for name, path in [
    ("--lh-tight", ("base", "lineHeight", "tight")),
    ("--lh-snug", ("base", "lineHeight", "snug")),
    ("--lh-base", ("base", "lineHeight", "base")),
    ("--measure", ("base", "measure", "body")),
    ("--measure-tight", ("base", "measure", "tight")),
    ("--wrap", ("base", "measure", "wrap")),
    ("--wrap-narrow", ("base", "measure", "wrapNarrow")),
    ("--font-sans", ("base", "font", "sans")),
    ("--font-mono", ("base", "font", "mono")),
    ("--font-display", ("base", "font", "display")),
]:
    BASE_MAP[name] = path
for key in ("2xs", "xs", "sm", "base", "md", "lg", "xl", "2xl", "3xl", "display"):
    BASE_MAP[f"--fs-{key}"] = ("base", "fontSize", key)
for key in ("1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "24"):
    BASE_MAP[f"--sp-{key}"] = ("base", "space", key)
for key in ("xs", "sm", "md", "lg", "xl", "pill"):
    BASE_MAP[f"--r-{key}"] = ("base", "radius", key)
for key in ("1", "2", "3"):
    BASE_MAP[f"--shadow-{key}"] = ("base", "shadow", key)
for key in ("1", "2", "3", "4"):
    BASE_MAP[f"--dur-{key}"] = ("base", "motion", "duration", key)
BASE_MAP["--ease-out"] = ("base", "motion", "easing", "out")
BASE_MAP["--ease-inout"] = ("base", "motion", "easing", "inout")

SELECTOR = {
    ("professional", "dark"): 'html[data-theme="professional"]',
    ("professional", "light"): 'html[data-theme="professional"][data-mode="light"]',
    ("section9", "dark"): 'html[data-theme="section9"]',
}
CSS_FILES = ["tokens/base.css", "tokens/professional.css", "tokens/section9.css"]


def strip_media(text):
    """Drop @media blocks so a reduced-motion override is not read as the token."""
    out, i = [], 0
    while True:
        at = text.find("@media", i)
        if at == -1:
            out.append(text[i:])
            break
        out.append(text[i:at])
        brace = text.find("{", at)
        depth, j = 0, brace
        while j < len(text):
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        i = j + 1
    return "".join(out)


def parse_css(root):
    """Return {selector: {prop: value}} from the three token files."""
    blocks = {}
    for rel in CSS_FILES:
        text = (root / rel).read_text()
        text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
        text = strip_media(text)
        for sel, body in re.findall(r"([^{}]+)\{([^{}]*)\}", text):
            selector = " ".join(sel.split())
            props = blocks.setdefault(selector, {})
            for decl in body.split(";"):
                if ":" not in decl:
                    continue
                prop, value = decl.split(":", 1)
                props[prop.strip()] = value.strip()
    return blocks


def resolve(props, name, seen=None):
    """Follow var() references one level at a time within one block."""
    seen = seen or set()
    value = props.get(name)
    if value is None or name in seen:
        return None
    seen.add(name)
    match = re.fullmatch(r"var\((--[a-z0-9-]+)\)", value)
    if match:
        return resolve(props, match.group(1), seen)
    return value


def parse_colour(value):
    value = value.strip()
    if value.startswith("#"):
        h = value[1:]
        if len(h) == 3:
            h = "".join(c * 2 for c in h)
        n = int(h, 16)
        return (n >> 16, (n >> 8) & 255, n & 255, 1.0)
    m = re.fullmatch(r"rgba?\(([^)]+)\)", value)
    if m:
        parts = [p for p in re.split(r"[,\s/]+", m.group(1).strip()) if p]
        nums = [float(p) for p in parts]
        if len(nums) == 4:
            return (nums[0], nums[1], nums[2], nums[3])
        return (nums[0], nums[1], nums[2], 1.0)
    return None


def over(fg, bg):
    a = fg[3]
    return (
        fg[0] * a + bg[0] * (1 - a),
        fg[1] * a + bg[1] * (1 - a),
        fg[2] * a + bg[2] * (1 - a),
        1.0,
    )


def linear(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(c):
    return 0.2126 * linear(c[0]) + 0.7152 * linear(c[1]) + 0.0722 * linear(c[2])


def ratio(fg, bg):
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def normalise(value):
    return " ".join(value.split()).replace("0.", ".").replace(" 0.", ".")


def check_favicon(root):
    """Every page in this folder links a favicon, and any inline copy is
    byte-identical to favicon.svg, so the file and the data URI cannot drift."""
    failures = []
    checked = 0
    icon_file = root / "favicon.svg"
    icon_bytes = icon_file.read_bytes() if icon_file.exists() else None
    if icon_bytes is None:
        failures.append("favicon.svg: missing")
    for page in sorted(root.glob("*.html")):
        checked += 1
        tag = re.search(r'<link[^>]*\brel="icon"[^>]*>', page.read_text())
        if not tag:
            failures.append(f"{page.name}: no <link rel=\"icon\">")
            continue
        href = re.search(r'href="([^"]*)"', tag.group(0))
        if not href:
            failures.append(f"{page.name}: favicon link has no href")
            continue
        value = href.group(1)
        if value.startswith("data:image/svg+xml,"):
            if icon_bytes is None:
                continue
            inline = urllib.parse.unquote(value.split(",", 1)[1]).encode()
            if inline != icon_bytes:
                failures.append(
                    f"{page.name}: inline favicon differs from favicon.svg "
                    f"({len(inline)} vs {len(icon_bytes)} bytes)"
                )
        elif not value.startswith(("http:", "https:", "data:")):
            if not (root / value).exists():
                failures.append(f"{page.name}: favicon {value!r} not found")
    return failures, checked


def main(argv):
    root = pathlib.Path(argv[1] if len(argv) > 1 else ".").resolve()
    data = json.loads((root / "tokens/tokens.json").read_text())
    contrast = json.loads((root / "tokens/contrast.json").read_text())
    css = parse_css(root)
    failures = []
    checked = 0

    # 1. base tokens
    base = css.get(":root", {})
    for prop, path in BASE_MAP.items():
        node = data
        for key in path:
            node = node[key]
        expected = str(node)
        actual = resolve(base, prop)
        checked += 1
        if actual is None:
            failures.append(f"{prop}: missing from tokens/base.css")
        elif normalise(actual) != normalise(expected):
            failures.append(f"{prop}: css {actual!r} != json {expected!r}")

    # 2. theme palettes
    for (theme, mode), selector in SELECTOR.items():
        props = css.get(selector)
        if props is None:
            failures.append(f"{selector}: selector not found")
            continue
        for name, expected in data["palettes"][theme][mode].items():
            actual = resolve(props, f"--{name}")
            checked += 1
            if actual is None:
                failures.append(f"[{theme}/{mode}] --{name}: missing from css")
            elif normalise(actual) != normalise(str(expected)):
                failures.append(f"[{theme}/{mode}] --{name}: css {actual!r} != json {expected!r}")

    # 3. contrast
    for pair in contrast["pairs"]:
        theme, mode = pair["theme"], pair["mode"]
        props = css[SELECTOR[(theme, mode)]]
        fg_raw = resolve(props, pair["fg"])
        bg_raw = resolve(props, pair["bg"])
        if not fg_raw or not bg_raw:
            failures.append(f"[{theme}/{mode}] {pair['fg']} on {pair['bg']}: token not found")
            continue
        fg, bg = parse_colour(fg_raw), parse_colour(bg_raw)
        if not fg or not bg:
            failures.append(f"[{theme}/{mode}] {pair['fg']} on {pair['bg']}: unparseable colour")
            continue
        page = parse_colour(resolve(props, "--bg"))
        if bg[3] < 1:
            bg = over(bg, page)
        if fg[3] < 1:
            fg = over(fg, bg)
        value = ratio(fg, bg)
        checked += 1
        if value < pair["min"]:
            failures.append(
                f"[{theme}/{mode}] {pair['fg']} on {pair['bg']} ({pair['use']}): "
                f"{value:.2f}:1 < {pair['min']}:1"
            )

    # 4. favicon (page-level, separate counter so the token/contrast
    #    summary above stays meaningful).
    favicon_failures, favicon_checked = check_favicon(root)
    failures += favicon_failures
    checked += favicon_checked

    if failures:
        print(f"FAIL {len(failures)} of {checked} checks")
        for line in failures:
            print("  " + line)
        return 1
    pairs = len(contrast["pairs"])
    print(f"ok {checked - favicon_checked} checks: {checked - favicon_checked - pairs} token values in sync, {pairs} contrast pairs pass AA")
    print(f"   favicon: {favicon_checked} page(s) carry favicon.svg inline")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
