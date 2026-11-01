#!/usr/bin/env python3
"""Section 9 crew avatars - original GITS-95-flavoured phosphor portraits.

Every avatar is a flat-vector bust (or sigil) drawn on a 256x256 plate in the
same world as the HQ roster page: near-black ground, a phosphor-green tonal
ramp, one cyan "signature trait" per character, amber as a sparing accent, a
wireframe grid, scanlines, a touch of dither and a CRT vignette.

They are original drawings. Nothing here traces a film frame, a logo or a
likeness; the traits are plain visual shorthand (a bob, lens eyes, a scope, a
spider-tank, a yes/no sigil).

Run me:  python3 generate.py     -> writes aramaki.svg ... jev.svg
Then:    sh build.sh             -> also exports the 256x256 PNGs
"""

from pathlib import Path

OUT = Path(__file__).resolve().parent

# --- palette: the same world as crew/index.html -----------------------------
BG = "#040a08"  # near-black tube
G0 = "#0a2418"  # deepest green (shadow)
G1 = "#123a26"  # dark
G2 = "#1f6b45"  # mid
G3 = "#3fa874"  # light-mid
G4 = "#7fe3ad"  # light
G5 = "#c6ffe0"  # hot highlight
CY = "#5be7d8"  # cyan  - signature trait
AM = "#ffb454"  # amber - accent
PH = "#8bffbe"  # phosphor readout green

DEFS = f"""
  <radialGradient id="wash" cx="50%" cy="30%" r="85%">
    <stop offset="0" stop-color="{PH}" stop-opacity=".10"/>
    <stop offset="1" stop-color="{PH}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vig" cx="50%" cy="46%" r="72%">
    <stop offset="55%" stop-color="#000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000" stop-opacity=".55"/>
  </radialGradient>
  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
    <path d="M32 0H0V32" fill="none" stroke="{PH}" stroke-opacity=".07" stroke-width="1"/>
  </pattern>
  <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse">
    <rect width="4" height="1" fill="#000" fill-opacity=".22"/>
  </pattern>
  <pattern id="dith" width="2" height="2" patternUnits="userSpaceOnUse">
    <rect width="1" height="1" fill="#000" fill-opacity=".10"/>
    <rect x="1" y="1" width="1" height="1" fill="{G5}" fill-opacity=".045"/>
  </pattern>
  <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="2.4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
"""


def frame(name, kana, code, body):
    """Wrap a figure in the shared plate. `body` is the figure+trait markup."""
    corner = f'stroke="{PH}" stroke-opacity=".55" stroke-width="2" fill="none"'
    hud = f"""
  <g font-family="'Liberation Mono',ui-monospace,monospace" font-size="11"
     letter-spacing="1.2" fill="{PH}">
    <rect x="10" y="228" width="58" height="18" fill="#020604" fill-opacity=".78"/>
    <text x="16" y="241">{code}</text>
  </g>
  <g font-family="'IPAGothic','Noto Sans CJK JP',sans-serif" font-size="17"
     fill="{PH}" fill-opacity=".85" text-anchor="end">
    <text x="246" y="242">{kana}</text>
  </g>
  <path d="M10 34V10H34" {corner}/>
  <path d="M222 10H246V34" {corner}/>
  <path d="M246 222V246H222" {corner}/>
  <path d="M34 246H10V222" {corner}/>
"""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="{name}">
<title>{name}</title>
<defs>{DEFS}</defs>
  <rect width="256" height="256" fill="{BG}"/>
  <rect width="256" height="256" fill="url(#grid)"/>
  <rect width="256" height="256" fill="url(#wash)"/>
{body}
  <rect width="256" height="256" fill="url(#dith)"/>
  <rect width="256" height="256" fill="url(#scan)"/>
  <rect width="256" height="256" fill="url(#vig)"/>
  <rect y="150" width="256" height="1" fill="{PH}" fill-opacity=".14"/>
  <rect x="70" y="70" width="116" height="1" fill="{G5}" fill-opacity=".10"/>
{hud}</svg>
"""


def shoulders(collar=None):
    s = f'<path d="M18 256C25 196 67 168 128 168C189 168 231 196 238 256Z" fill="{G1}"/>'
    s += f'<path d="M92 172C104 190 152 190 164 172L164 256H92Z" fill="{G0}" fill-opacity=".55"/>'
    if collar:
        s += collar
    return s


def head(rx=44, ry=50, cy=104, fill=G3):
    return (
        f'<rect x="112" y="140" width="32" height="34" fill="{G2}"/>'
        f'<ellipse cx="128" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}"/>'
        f'<path d="M84 {cy} C84 {cy + ry * 0.7} 104 {cy + ry} 128 {cy + ry}'
        f' C110 {cy + ry * 0.75} 100 {cy + 8} 100 {cy - 10}Z" fill="{G1}" fill-opacity=".45"/>'
    )


def eyes(x1, y, gap, w=9, h=5, fill=CY, glow=True):
    g = ' filter="url(#glow)"' if glow else ""
    return (
        f'<g{g}>'
        f'<rect x="{x1 - w / 2}" y="{y - h / 2}" width="{w}" height="{h}" rx="2" fill="{fill}"/>'
        f'<rect x="{x1 + gap - w / 2}" y="{y - h / 2}" width="{w}" height="{h}" rx="2" fill="{fill}"/>'
        f"</g>"
    )


def suit(collar_fill=G0, tie=G2):
    return (
        f'<path d="M128 176L104 256H152Z" fill="{collar_fill}"/>'
        f'<path d="M96 256L128 186L112 176L86 214Z" fill="{G0}" fill-opacity=".7"/>'
        f'<path d="M160 256L128 186L144 176L170 214Z" fill="{G0}" fill-opacity=".7"/>'
        f'<path d="M124 190L128 182L132 190L128 214Z" fill="{tie}"/>'
    )


AVATARS = {}


def avatar(fn):
    AVATARS[fn.__name__] = fn
    return fn


@avatar
def aramaki():
    """Aramaki. Broad older face, round wireframe glasses, grey at the temples."""
    body = shoulders(suit(G0, G2))
    body += head(rx=46, ry=47, fill=G3)
    body += (
        f'<path d="M84 96C86 62 104 48 128 48C152 48 170 62 172 96'
        f'C170 74 156 62 128 62C100 62 86 74 84 96Z" fill="{G1}" fill-opacity=".65"/>'
        f'<path d="M82 100C80 84 84 74 88 68C92 84 90 96 90 104Z" fill="{G4}" fill-opacity=".5"/>'
        f'<path d="M174 100C176 84 172 74 168 68C164 84 166 96 166 104Z" fill="{G4}" fill-opacity=".5"/>'
    )
    body += f'<path d="M98 86H118M138 86H158" stroke="{G1}" stroke-width="5" stroke-linecap="round"/>'
    body += (
        f'<g filter="url(#glow)" fill="none" stroke="{CY}" stroke-width="2.4">'
        f'<circle cx="108" cy="102" r="15"/><circle cx="148" cy="102" r="15"/>'
        f'<path d="M123 102H133"/><path d="M93 100L84 96"/><path d="M163 100L172 96"/></g>'
        f'<circle cx="108" cy="102" r="15" fill="{CY}" fill-opacity=".10"/>'
        f'<circle cx="148" cy="102" r="15" fill="{CY}" fill-opacity=".10"/>'
        f'<rect x="104" y="99" width="8" height="6" rx="3" fill="{CY}"/>'
        f'<rect x="144" y="99" width="8" height="6" rx="3" fill="{CY}"/>'
    )
    body += f'<path d="M128 112V126L121 130" stroke="{G1}" stroke-width="3" fill="none" stroke-linecap="round"/>'
    body += f'<rect x="112" y="132" width="32" height="7" rx="3.5" fill="{G4}" fill-opacity=".8"/>'
    return frame("Aramaki, the Chief: an older, stern face behind round glasses", "\u8352", "S9-01", body)


@avatar
def major():
    """The Major. A short dark bob and a level, direct gaze."""
    body = shoulders(suit(G0, G2))
    body += head(rx=42, ry=48, fill=G3)
    body += (
        f'<path d="M86 108C82 60 104 44 128 44C152 44 174 60 170 108'
        f'C170 126 166 140 158 148C162 118 160 92 156 78C138 84 118 84 100 78'
        f'C96 92 94 118 98 148C90 140 86 126 86 108Z" fill="{G0}"/>'
        f'<path d="M100 76C112 70 144 70 156 78L152 60C136 54 120 54 104 60Z" fill="{G1}" fill-opacity=".8"/>'
    )
    body += eyes(110, 106, 36, w=11, h=4.5)
    body += f'<path d="M128 112V126" stroke="{G1}" stroke-width="3" stroke-linecap="round"/>'
    body += f'<path d="M116 134H140" stroke="{G1}" stroke-width="3" stroke-linecap="round"/>'
    return frame("The Major: short dark hair, a calm, direct gaze", "\u5c11", "S9-00", body)


@avatar
def batou():
    """Batou. Broad jaw, cropped pale hair, and two cybernetic lens eyes."""
    body = shoulders(suit(G0, G2))
    body += head(rx=48, ry=48, cy=102, fill=G3)
    body += (
        f'<path d="M80 100C78 58 100 42 128 42C156 42 178 58 176 100'
        f'C172 78 158 66 128 66C98 66 84 78 80 100Z" fill="{G4}" fill-opacity=".85"/>'
        f'<path d="M80 96C84 70 100 62 128 62C156 62 172 70 176 96L176 88C168 68 150 60 128 60C106 60 88 68 80 88Z" fill="{G0}" fill-opacity=".5"/>'
    )
    body += '<g filter="url(#glow)">'
    for cx in (106, 150):
        body += (
            f'<circle cx="{cx}" cy="104" r="15" fill="{G0}"/>'
            f'<circle cx="{cx}" cy="104" r="15" fill="none" stroke="{CY}" stroke-width="2.6"/>'
            f'<circle cx="{cx}" cy="104" r="8" fill="none" stroke="{CY}" stroke-width="1.6" stroke-opacity=".8"/>'
            f'<circle cx="{cx}" cy="104" r="4.4" fill="{CY}"/>'
            f'<circle cx="{cx - 2}" cy="101" r="1.6" fill="{G5}"/>'
        )
    body += "</g>"
    body += f'<path d="M100 84H116M140 84H156" stroke="{G1}" stroke-width="4.5" stroke-linecap="round"/>'
    body += f'<path d="M128 112V128" stroke="{G1}" stroke-width="3.4" stroke-linecap="round"/>'
    body += f'<path d="M114 134H142" stroke="{G1}" stroke-width="3.4" stroke-linecap="round"/>'
    return frame("Batou: a broad face with cropped pale hair and lens eyes", "\u5834", "S9-02", body)


@avatar
def togusa():
    """Togusa. A mullet, a trench collar turned up, and a plain tie."""
    collar = (
        f'<path d="M96 168L78 214L104 200L128 176Z" fill="{G2}"/>'
        f'<path d="M160 168L178 214L152 200L128 176Z" fill="{G2}"/>'
        f'<path d="M92 172L104 200L128 178Z" fill="{G3}" fill-opacity=".35"/>'
        f'<path d="M164 172L152 200L128 178Z" fill="{G3}" fill-opacity=".35"/>'
    )
    body = shoulders(collar + suit(G0, AM))
    body += head(rx=42, ry=48, fill=G3)
    body += (
        f'<path d="M86 104C84 60 104 46 128 46C152 46 172 60 170 104'
        f'C172 130 176 150 168 152C166 128 164 108 160 96C140 104 116 104 96 96'
        f'C92 108 90 128 88 152C80 150 84 130 86 104Z" fill="{G1}"/>'
        f'<path d="M96 94C114 86 142 86 160 96L156 74C138 68 118 68 100 74Z" fill="{G2}" fill-opacity=".7"/>'
    )
    body += eyes(110, 106, 36, w=10, h=4.5)
    body += f'<path d="M128 112V126" stroke="{G1}" stroke-width="3" stroke-linecap="round"/>'
    body += f'<path d="M118 133Q128 137 138 133" stroke="{G1}" stroke-width="3" fill="none" stroke-linecap="round"/>'
    return frame("Togusa: a mullet, a trench collar and a tie", "\u5510", "S9-03", body)


@avatar
def ishikawa():
    """Ishikawa. A full beard and dark glasses full of falling data."""
    body = shoulders(suit(G0, G2))
    body += head(rx=44, ry=48, fill=G3)
    body += (
        f'<path d="M84 98C84 58 104 44 128 44C152 44 172 58 172 98'
        f'C168 76 152 66 128 66C104 66 88 76 84 98Z" fill="{G1}"/>'
    )
    body += (
        f'<path d="M92 116C92 150 108 168 128 168C148 168 164 150 164 116'
        f'C156 132 148 140 128 140C108 140 100 132 92 116Z" fill="{G1}"/>'
        f'<path d="M104 140C112 158 144 158 152 140C144 150 112 150 104 140Z" fill="{G0}" fill-opacity=".6"/>'
    )
    body += (
        f'<g filter="url(#glow)">'
        f'<rect x="88" y="88" width="80" height="30" rx="8" fill="{G0}"/>'
        f'<clipPath id="lens"><rect x="92" y="92" width="72" height="22" rx="6"/></clipPath>'
        f'<g clip-path="url(#lens)">'
        f'<rect x="96" y="98" width="3" height="16" fill="{CY}" fill-opacity=".9"/>'
        f'<rect x="108" y="92" width="3" height="16" fill="{CY}" fill-opacity=".7"/>'
        f'<rect x="120" y="100" width="3" height="14" fill="{CY}" fill-opacity=".85"/>'
        f'<rect x="132" y="94" width="3" height="15" fill="{CY}" fill-opacity=".6"/>'
        f'<rect x="144" y="100" width="3" height="15" fill="{CY}" fill-opacity=".8"/>'
        f'<rect x="156" y="96" width="3" height="14" fill="{CY}" fill-opacity=".7"/>'
        f"</g>"
        f'<rect x="88" y="88" width="80" height="30" rx="8" fill="none" stroke="{CY}" stroke-width="1.6" stroke-opacity=".5"/>'
        f"</g>"
    )
    return frame("Ishikawa: a bearded man in dark glasses full of falling data", "\u77f3", "S9-04", body)


@avatar
def saito():
    """Saito. A sniper's scope for a right eye, reticle and all."""
    body = shoulders(suit(G0, G2))
    body += head(rx=43, ry=48, fill=G3)
    body += (
        f'<path d="M85 100C84 60 104 46 128 46C152 46 172 60 171 100'
        f'C168 78 152 68 128 68C104 68 88 78 85 100Z" fill="{G1}"/>'
    )
    body += f'<rect x="99" y="101" width="11" height="5" rx="2.5" fill="{G1}"/>'
    body += f'<path d="M120 90H134" stroke="{G1}" stroke-width="3" stroke-linecap="round"/>'
    body += (
        f'<g filter="url(#glow)">'
        f'<circle cx="150" cy="104" r="17" fill="{BG}"/>'
        f'<circle cx="150" cy="104" r="17" fill="none" stroke="{CY}" stroke-width="2.6"/>'
        f'<circle cx="150" cy="104" r="11" fill="none" stroke="{CY}" stroke-width="1.3" stroke-opacity=".75"/>'
        f'<path d="M150 86V122M132 104H168" stroke="{AM}" stroke-width="1.4" stroke-opacity=".95"/>'
        f'<circle cx="150" cy="104" r="3.2" fill="{AM}"/>'
        f'<circle cx="150" cy="104" r="6" fill="none" stroke="{AM}" stroke-width="1" stroke-opacity=".7" stroke-dasharray="2 3"/>'
        f"</g>"
        f'<path d="M128 112V127" stroke="{G1}" stroke-width="3.2" stroke-linecap="round"/>'
        f'<path d="M116 134H140" stroke="{G1}" stroke-width="3.2" stroke-linecap="round"/>'
    )
    return frame("Saito: a sniper with one cybernetic scope eye and a reticle", "\u658e", "S9-05", body)


@avatar
def tachikoma():
    """Tachikoma. A small spider-tank: a pod, one big lens, four legs, antennae."""
    legs = ""
    for x, dirn in ((64, -1), (86, -1), (170, 1), (192, 1)):
        knee_x = x + dirn * 16
        foot_x = x + dirn * 26
        legs += (
            f'<path d="M{x} 168 L{knee_x} 206 L{foot_x} 246" fill="none" stroke="{G2}" '
            f'stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle cx="{knee_x}" cy="206" r="5" fill="{G1}"/>'
            f'<path d="M{foot_x - 8} 246H{foot_x + 8}" stroke="{G2}" stroke-width="6" stroke-linecap="round"/>'
        )
    body = f'<g fill-opacity=".95">{legs}</g>'
    body += (
        f'<path d="M120 92C116 74 108 64 100 58" fill="none" stroke="{G2}" stroke-width="3" stroke-linecap="round"/>'
        f'<circle cx="100" cy="58" r="5" fill="{G3}"/>'
        f'<path d="M136 92C140 74 148 64 156 58" fill="none" stroke="{G2}" stroke-width="3" stroke-linecap="round"/>'
        f'<circle cx="156" cy="58" r="5" fill="{G3}"/>'
    )
    body += (
        f'<ellipse cx="128" cy="140" rx="62" ry="52" fill="{G2}"/>'
        f'<path d="M70 130C78 108 100 96 128 96C156 96 178 108 186 130'
        f'C170 116 150 110 128 110C106 110 86 116 70 130Z" fill="{G3}"/>'
        f'<ellipse cx="128" cy="176" rx="52" ry="18" fill="{G0}" fill-opacity=".55"/>'
        f'<path d="M112 152H144M116 168H140" stroke="{G1}" stroke-width="3" stroke-linecap="round"/>'
    )
    body += (
        f'<g filter="url(#glow)">'
        f'<circle cx="128" cy="128" r="26" fill="{BG}"/>'
        f'<circle cx="128" cy="128" r="26" fill="none" stroke="{G3}" stroke-width="3"/>'
        f'<circle cx="128" cy="128" r="17" fill="none" stroke="{CY}" stroke-width="2.2"/>'
        f'<circle cx="128" cy="128" r="7.5" fill="{CY}"/>'
        f'<circle cx="122" cy="122" r="3" fill="{G5}"/>'
        f"</g>"
    )
    body += f'<circle cx="176" cy="150" r="5" fill="{AM}"/>'
    return frame("Tachikoma: a round blue-toned spider-tank with one big lens eye", "\u5854", "S9-06", body)


@avatar
def jev():
    """Jev. A minimal yes/no sigil: a ring holding a check against a cross."""
    body = (
        f'<circle cx="128" cy="126" r="76" fill="{G0}" fill-opacity=".35"/>'
        f'<circle cx="128" cy="126" r="76" fill="none" stroke="{G2}" stroke-width="2.4"/>'
        f'<circle cx="128" cy="126" r="66" fill="none" stroke="{PH}" stroke-width="1" stroke-opacity=".28" stroke-dasharray="3 5"/>'
        f'<path d="M128 52V200" stroke="{G1}" stroke-width="2"/>'
    )
    body += (
        f'<g filter="url(#glow)" fill="none" stroke="{CY}" stroke-width="7" '
        f'stroke-linecap="round" stroke-linejoin="round">'
        f'<path d="M84 124L104 146L150 92"/></g>'
    )
    body += (
        f'<g fill="none" stroke="{G3}" stroke-width="7" stroke-linecap="round" stroke-opacity=".65">'
        f'<path d="M172 100L204 132M204 100L172 132"/></g>'
    )
    body += (
        '<g font-family="\'Liberation Mono\',ui-monospace,monospace" font-size="10" letter-spacing="1">'
        f'<text x="86" y="176" fill="{CY}" text-anchor="middle" opacity=".9">1</text>'
        f'<text x="170" y="176" fill="{G3}" text-anchor="middle" opacity=".75">0</text>'
        '</g>'
    )
    return frame("Jev: a minimal yes/no sigil, a check against a cross", "\u30b8", "S9-07", body)


def main():
    for name, fn in AVATARS.items():
        (OUT / f"{name}.svg").write_text(fn(), encoding="utf-8")
        print("wrote", f"{name}.svg")


if __name__ == "__main__":
    main()
