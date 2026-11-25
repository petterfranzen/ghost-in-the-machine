# Nightly log

One line per night. The nightly builder reads this to avoid repeating a
language or idea, and to follow Petter's feedback in the last column.

## Petter's wishes (newest first)

Directions to explore over the coming nights. Pick one when it fits, and say in the PR which wish you followed.

- 2026-11-23 (**every night from now on**): the goal is **a game released every night**: merged and live on Pages, so it has to pass QA first time. **No audio** any more: no sound, no AudioContext, no sound button (sound was in most QA fix rounds). **TypeScript by default** (JavaScript next); popular npm libraries are welcome, e.g. three.js, PixiJS, Phaser, matter.js (pinned, bundled into dist/). Rust, Go, Kotlin, Dart, C# or C++ for the web only occasionally, never two nights running (Petter, 25 Nov: mainstream languages so Code Health can be assessed and more libraries are available). It doesn't have to be perfect, but it has to work: simple interactions are fine. Older wishes below that ask for sound no longer apply to sound.
- 2026-11-19 (**every night from now on**, after Moondew): keep making games, with **structure and clear rules**. Petter on Moondew: "The graphics are very intense and glitchy, the game rules are unclear and don't seem to matter. More structure needed." So: (1) the first level teaches by doing, with one line of text, and each new rule arrives one at a time with its own one-line hint; (2) every rule has a visible, immediate consequence, and a rule that doesn't change play is cut; (3) show the goal and progress ("3 of 5"), a clear level-complete moment, undo and restart; (4) calm, steady graphics: integer-pixel drawing, no flicker, strobing or full-screen flashes, slow glows, a soft palette, and prefers-reduced-motion respected. Playtest a fresh player's first two minutes on a phone before calling it done. A one-line hint is fine; it isn't a tutorial.
- 2026-11-18 (**tonight's night, 19 Nov, must follow this one**): make it **more of a game**. Paper Tide was lovely, but had no game in it (feedback on #58). Build it around a real game loop: a clear goal you can see from the first screen, rules you learn by playing, a challenge that grows (levels, a puzzle that gets harder, a run that goes further), and visible progress or an ending (levels cleared, a collection filled, a puzzle solved). Losing is fine if it's gentle: an instant retry, never a game-over wall. It still stays calm, one-handed on a phone, with good sound; and for this wish a level counter or a small tally is fine, though countdown timers and pressure still aren't. Say in the PR what the goal is, how it gets harder, and how a player knows they've progressed.
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
| 2026-11-15 | Dart's `dart:js_interop`: an `external` member with no declared return type is inferred `dynamic` and rejected — write `external void`. And a `@JS('AudioContext')` annotation on the extension type is what maps `external factory` to the real JS global; without it the factory compiles to `new <YourTypeName>()`, so every call throws one uncaught `Error` and nothing else happens — the app still runs and looks fine. | Steam Spring, 15 Nov |
| 2026-11-15 | In this SDK's `dart:html`, `MouseEvent` has hidden `clientX`/`clientY` behind `_clientX` (use the public `.client` Point), and `dart:web_audio` is stale (its nodes have no `start()`). Web Audio in Dart means declaring the API by hand over `dart:js_interop`. | Steam Spring, 15 Nov |
| 2026-11-08 | Long-press interactions need `touch-action:none` + `user-select:none` + `-webkit-touch-callout:none`, or iOS selects/magnifies. Use pointer events with `setPointerCapture` and non-passive `preventDefault()` on `pointerdown`/`touchstart`; never `user-scalable=no` (it hurts accessibility). | Dune Drift, 8 Nov |
| 2026-11-14 | Canvas *silently ignores* an invalid `fillStyle` and keeps the last one, so a broken colour helper paints the previous colour over everything with no error anywhere. Format each channel as two hex digits, and print one shaded colour into a debug line before trusting the palette. | Threadloom |
| 2026-11-08 | Secrets should be discovered, not shown. Gate a hidden reward on a gesture or timing (a slow press, several taps over time, or a height reached), and show no hint until it is nearly there. | Dune Drift 4/10 |
