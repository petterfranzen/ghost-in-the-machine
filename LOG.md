# Nightly log

One line per night. The nightly builder reads this to avoid repeating a
language or idea, and to follow Petter's feedback in the last column.

## Petter's wishes (newest first)

Directions to explore over the coming nights. Pick one when it fits, and say in the PR which wish you followed.

- 2026-11-02: Combine Koi Drift's pond and Lantern Moss's pixel-art world, and keep going in that direction on the coming nights. Make a tap feel impactful (a clear, satisfying response: a soft pulse or bloom, ripples, a small gentle sound, maybe a slight settle of the whole scene) while the whole stays calm: slow, soft, no harsh flashes, no loud sounds, everything fades gradually. Petter likes both; say in the PR which wish you followed.
- 2026-10-30: Explore pixel art, with light RPG and adventure touches (a small character to walk around, a few things to find or talk to, a tiny quest). Keep it calm and one-handed, like Fireflies and Koi Drift, which he liked.

### Backlog of night ideas (2026-11-08)

Fifteen ideas to draw from, none picked yet. Each line is the idea, a language
the last seven nights have not used, and the wish or feedback it follows (nudge
not kill, full screen on mobile, things to find, pixel-art RPG touch). Take one
when it fits a wish, and say in the PR which you followed.

- A tidepool you smooth with a thumb, that leaves small creatures hiding in the sand - ClojureScript - things to find.
- A tea stall at dusk: tap to pour, steam drifts, a cat naps and nudges gently if poked - F# - nudge not kill.
- A window of wind chimes: drag to raise a breeze, the chimes answer, one note hides behind the others - PureScript - things to find.
- A stone gargoyle that wakes and stretches under a long press, then settles back - OCaml - nudge not kill.
- A cave of glow-worms: tap the ceiling to wake one, and they settle back when the clearing is still - C - pixel-art RPG touch.
- A snowy garden: footprints appear where you walk and fill in slowly; a fox crosses if you stand still - C++ - things to find.
- A loom: drag a thumb to weave a row, and a full pattern quietly shows a hidden motif - C# - pixel-art RPG touch.
- A tiny observatory: tap to pan the sky, and a constellation names itself when you centre it - Haskell - things to find.
- A mushroom ring at dawn: spores drift, and a small gnome nudges (never vanishes) when you poke him - Kotlin - nudge not kill.
- A lantern-lit alley: walk a little pixel character and find three dropped coins - Scala - pixel-art RPG touch.
- A rockpool orchestra: tap shells for soft notes, and a hidden fifth shell joins after three taps - Lua - things to find.
- A field of tall grass that fills the phone screen: swipe to part it, something glints and hides again - Python - full screen on mobile.
- A paper boat on a gutter stream: tap to nudge it along the whole screen, with no game-over - Java - full screen on mobile.
- A quiet beehive: plant flowers with a tap, and the bees only return when the scene is left calm - Swift - nudge not kill.
- A night-train window: stars pass, tap the glass to fog it and a faint drawing shows underneath; fills the phone screen - V - full screen on mobile.

Night rows moved: one file per night at `nights/<folder>/night.json` (keys `date`, `language`, `idea`, `verdict`); print the table with `python3 scripts/night-log.py`.

## Lessons (newest first)

Hard-won rules for the next night. Keep them short and general.

| Date | Lesson | Source |
|---|---|---|
| 2026-11-08 | Long-press interactions need `touch-action:none` + `user-select:none` + `-webkit-touch-callout:none`, or iOS selects/magnifies. Use pointer events with `setPointerCapture` and non-passive `preventDefault()` on `pointerdown`/`touchstart`; never `user-scalable=no` (it hurts accessibility). | Dune Drift, 8 Nov |
| 2026-11-08 | Secrets should be discovered, not shown. Gate a hidden reward on a gesture or timing (a slow press, several taps over time, or a height reached), and show no hint until it is nearly there. | Dune Drift 4/10 |
