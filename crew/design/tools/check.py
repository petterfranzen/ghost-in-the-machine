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

# token name -> path inside tokens.json.  One table: single tokens verbatim,
# then the token families generated from (prefix, json path, keys).
_BASE_TOKENS = {
    "--lh-tight": ("base", "lineHeight", "tight"),
    "--lh-snug": ("base", "lineHeight", "snug"),
    "--lh-base": ("base", "lineHeight", "base"),
    "--measure": ("base", "measure", "body"),
    "--measure-tight": ("base", "measure", "tight"),
    "--wrap": ("base", "measure", "wrap"),
    "--wrap-narrow": ("base", "measure", "wrapNarrow"),
    "--font-sans": ("base", "font", "sans"),
    "--font-mono": ("base", "font", "mono"),
    "--font-display": ("base", "font", "display"),
}
_TOKEN_FAMILIES = (
    ("--fs-", ("base", "fontSize"),
     ("2xs", "xs", "eyebrow", "sm", "base", "md", "lg", "xl", "2xl", "3xl", "display")),
    ("--sp-", ("base", "space"),
     ("1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "24")),
    ("--r-", ("base", "radius"), ("xs", "sm", "md", "lg", "xl", "pill")),
    ("--shadow-", ("base", "shadow"), ("1", "2", "3")),
    ("--dur-", ("base", "motion", "duration"), ("1", "2", "3", "4")),
    ("--ease-", ("base", "motion", "easing"), ("out", "inout")),
)
BASE_MAP = dict(_BASE_TOKENS)
for _prefix, _path, _keys in _TOKEN_FAMILIES:
    for _key in _keys:
        BASE_MAP[f"{_prefix}{_key}"] = _path + (_key,)

SELECTOR = {
    ("professional", "dark"): 'html[data-theme="professional"]',
    ("professional", "light"): 'html[data-theme="professional"][data-mode="light"]',
    ("section9", "dark"): 'html[data-theme="section9"]',
}
CSS_FILES = ["tokens/base.css", "tokens/professional.css", "tokens/section9.css"]


def _media_block_end(text, open_index):
    """Index of the "}" that closes the block opening at open_index."""
    depth = 0
    for j in range(open_index, len(text)):
        if text[j] == "{":
            depth += 1
        elif text[j] == "}":
            depth -= 1
            if depth == 0:
                return j
    return len(text)


def strip_media(text):
    """Drop @media blocks so a reduced-motion override is not read as the token."""
    out, i = [], 0
    while True:
        at = text.find("@media", i)
        if at == -1:
            out.append(text[i:])
            break
        out.append(text[i:at])
        i = _media_block_end(text, text.find("{", at)) + 1
    return "".join(out)


def _parse_declarations(body):
    """{prop: value} for the declarations inside one rule block."""
    props = {}
    for decl in body.split(";"):
        if ":" not in decl:
            continue
        prop, value = decl.split(":", 1)
        props[prop.strip()] = value.strip()
    return props


def parse_css(root):
    """Return {selector: {prop: value}} from the three token files."""
    blocks = {}
    for rel in CSS_FILES:
        text = (root / rel).read_text()
        text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
        text = strip_media(text)
        for sel, body in re.findall(r"([^{}]+)\{([^{}]*)\}", text):
            selector = " ".join(sel.split())
            blocks.setdefault(selector, {}).update(_parse_declarations(body))
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


def _parse_hex(value):
    h = value[1:]
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    n = int(h, 16)
    return (n >> 16, (n >> 8) & 255, n & 255, 1.0)


def _parse_rgb(value):
    match = re.fullmatch(r"rgba?\(([^)]+)\)", value)
    if not match:
        return None
    parts = [p for p in re.split(r"[,\s/]+", match.group(1).strip()) if p]
    nums = [float(p) for p in parts]
    if len(nums) == 4:
        return (nums[0], nums[1], nums[2], nums[3])
    return (nums[0], nums[1], nums[2], 1.0)


def parse_colour(value):
    value = value.strip()
    if value.startswith("#"):
        return _parse_hex(value)
    return _parse_rgb(value)


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


def _lookup(node, path):
    """Walk the tokens.json tree along a tuple path."""
    for key in path:
        node = node[key]
    return node


def _mismatch(label, actual, expected, missing):
    """None when the CSS value matches the JSON one, else the failure line."""
    if actual is None:
        return missing
    if normalise(actual) != normalise(expected):
        return f"{label}: css {actual!r} != json {expected!r}"
    return None


def check_base_tokens(css, data):
    """Section 1: every base token in the CSS matches tokens.json."""
    base = css.get(":root", {})
    failures, checked = [], 0
    for prop, path in BASE_MAP.items():
        checked += 1
        failure = _mismatch(
            prop, resolve(base, prop), str(_lookup(data, path)),
            f"{prop}: missing from tokens/base.css",
        )
        if failure:
            failures.append(failure)
    return failures, checked


def check_palettes(css, data):
    """Section 2: the theme palettes in the CSS match tokens.json."""
    failures, checked = [], 0
    for (theme, mode), selector in SELECTOR.items():
        props = css.get(selector)
        if props is None:
            failures.append(f"{selector}: selector not found")
            continue
        for name, expected in data["palettes"][theme][mode].items():
            checked += 1
            label = f"[{theme}/{mode}] --{name}"
            failure = _mismatch(
                label, resolve(props, f"--{name}"), str(expected),
                f"{label}: missing from css",
            )
            if failure:
                failures.append(failure)
    return failures, checked


def _contrast_ratio(props, pair):
    """(value, None) for one contrast pair, or (None, failure line)."""
    label = f"[{pair['theme']}/{pair['mode']}] {pair['fg']} on {pair['bg']}"
    fg_raw = resolve(props, pair["fg"])
    bg_raw = resolve(props, pair["bg"])
    if not fg_raw or not bg_raw:
        return None, f"{label}: token not found"
    fg, bg = parse_colour(fg_raw), parse_colour(bg_raw)
    if not fg or not bg:
        return None, f"{label}: unparseable colour"
    if bg[3] < 1:
        bg = over(bg, parse_colour(resolve(props, "--bg")))
    if fg[3] < 1:
        fg = over(fg, bg)
    return ratio(fg, bg), None


def check_contrast(css, contrast):
    """Section 3: every declared pair clears its WCAG minimum."""
    failures, checked = [], 0
    for pair in contrast["pairs"]:
        theme, mode = pair["theme"], pair["mode"]
        value, failure = _contrast_ratio(css[SELECTOR[(theme, mode)]], pair)
        if failure:
            failures.append(failure)
            continue
        checked += 1
        if value < pair["min"]:
            failures.append(
                f"[{theme}/{mode}] {pair['fg']} on {pair['bg']} ({pair['use']}): "
                f"{value:.2f}:1 < {pair['min']}:1"
            )
    return failures, checked


def _inline_favicon_failure(page, href, icon_bytes):
    """None when the page's inline favicon matches favicon.svg, else the line."""
    if icon_bytes is None:
        return None
    inline = urllib.parse.unquote(href.split(",", 1)[1]).encode()
    if inline == icon_bytes:
        return None
    return (
        f"{page.name}: inline favicon differs from favicon.svg "
        f"({len(inline)} vs {len(icon_bytes)} bytes)"
    )


def _favicon_failure(page, root, icon_bytes):
    """None when the page's favicon link is sound, else the failure line."""
    tag = re.search(r'<link[^>]*\brel="icon"[^>]*>', page.read_text())
    if not tag:
        return f'{page.name}: no <link rel="icon">'
    href = re.search(r'href="([^"]*)"', tag.group(0))
    if not href:
        return f"{page.name}: favicon link has no href"
    value = href.group(1)
    if value.startswith("data:image/svg+xml,"):
        return _inline_favicon_failure(page, value, icon_bytes)
    if value.startswith(("http:", "https:", "data:")):
        return None
    if not (root / value).exists():
        return f"{page.name}: favicon {value!r} not found"
    return None


def check_favicon(root):
    """Every page in this folder links a favicon, and any inline copy is
    byte-identical to favicon.svg, so the file and the data URI cannot drift."""
    icon_file = root / "favicon.svg"
    icon_bytes = icon_file.read_bytes() if icon_file.exists() else None
    failures = ["favicon.svg: missing"] if icon_bytes is None else []
    pages = sorted(root.glob("*.html"))
    for page in pages:
        failure = _favicon_failure(page, root, icon_bytes)
        if failure:
            failures.append(failure)
    return failures, len(pages)


def _report(failures, checked, favicon_checked, pairs):
    """Print the summary and return the process exit code."""
    if failures:
        print(f"FAIL {len(failures)} of {checked} checks")
        for line in failures:
            print("  " + line)
        return 1
    tokens = checked - favicon_checked
    print(f"ok {tokens} checks: {tokens - pairs} token values in sync, {pairs} contrast pairs pass AA")
    print(f"   favicon: {favicon_checked} page(s) carry favicon.svg inline")
    return 0


def main(argv):
    root = pathlib.Path(argv[1] if len(argv) > 1 else ".").resolve()
    data = json.loads((root / "tokens/tokens.json").read_text())
    contrast = json.loads((root / "tokens/contrast.json").read_text())
    css = parse_css(root)

    results = [
        check_base_tokens(css, data),
        check_palettes(css, data),
        check_contrast(css, contrast),
    ]
    failures = [line for lines, _ in results for line in lines]
    checked = sum(n for _, n in results)

    favicon_failures, favicon_checked = check_favicon(root)
    failures += favicon_failures
    checked += favicon_checked

    return _report(failures, checked, favicon_checked, len(contrast["pairs"]))


if __name__ == "__main__":
    sys.exit(main(sys.argv))
