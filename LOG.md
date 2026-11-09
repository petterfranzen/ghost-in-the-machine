# Nightly log

One line per night. The nightly builder reads this to avoid repeating a
language or idea, and to follow Petter's feedback in the last column.

## Petter's wishes (newest first)

Directions to explore over the coming nights. Pick one when it fits, and say in the PR which wish you followed.

- 2026-11-02: Combine Koi Drift's pond and Lantern Moss's pixel-art world, and keep going in that direction on the coming nights. Make a tap feel impactful (a clear, satisfying response: a soft pulse or bloom, ripples, a small gentle sound, maybe a slight settle of the whole scene) while the whole stays calm: slow, soft, no harsh flashes, no loud sounds, everything fades gradually. Petter likes both; say in the PR which wish you followed.
- 2026-10-30: Explore pixel art, with light RPG and adventure touches (a small character to walk around, a few things to find or talk to, a tiny quest). Keep it calm and one-handed, like Fireflies and Koi Drift, which he liked.

| Date | Folder | Language | Idea | Verdict / feedback |
|---|---|---|---|---|
| 2026-10-28 | 2026-10-28-ripple-pool | Nim | A calm, one-handed tap-to-ripple pond with soft audio. | Great start. Wanted more ripples per stone, moving slower, and each impact dissipating gradually. Petter's idea for a next night: a zen garden raking experience. |
| 2026-10-29 | 2026-10-29-zen-rake | Haxe | A zen sand garden you rake with one thumb; grooves settle behind the rake and slowly fade. | Underwhelming: the raking feels harsh, not relaxing. It needs more satisfying physics (sand that gives, settles and smooths softly). |
| 2026-10-30 | 2026-10-30-fireflies | Elm | A dusk meadow you fill with fireflies: one tap lifts a small hush of them, and they drift, blink and slowly fade. | Liked a lot, very nice. More like this. |
| 2026-10-31 | 2026-10-31-koi-drift | Gleam | A still pond you feed with one thumb: tap and food drifts down, the koi glide over and the ripples spread and fade. | Liked a lot, together with Lantern Moss. Keep the pond and the koi. |
| 2026-11-01 | 2026-11-01-lantern-moss | Zig | A calm pixel-art clearing you explore with one thumb: gather three lost lights and wake an old stone. | Liked a lot, together with Koi Drift. Keep the pixel art. Next: combine the two, with taps that feel impactful and still calm. |
| 2026-11-05 | 2026-11-05-songbranch | Go | A pixel-art dusk tree: tap a bird and it hops to the next branch and sings one soft note, and the whole tree settles. | pending review |
| 2026-11-08 | 2026-11-08-dune-drift | AssemblyScript | A quiet moonlit dune field: tap and a handful of sand drifts down and settles softly into the dunes. | pending review (revision: landscape seeded per visit with ?seed= override, terrain now seed-driven) |

## Lessons (newest first)

Hard-won rules for the next night. Keep them short and general.

| Date | Lesson | Source |
|---|---|---|
| 2026-11-08 | Long-press interactions need `touch-action:none` + `user-select:none` + `-webkit-touch-callout:none`, or iOS selects/magnifies. Use pointer events with `setPointerCapture` and non-passive `preventDefault()` on `pointerdown`/`touchstart`; never `user-scalable=no` (it hurts accessibility). | Dune Drift, 8 Nov |
| 2026-11-08 | Secrets should be discovered, not shown. Gate a hidden reward on a gesture or timing (a slow press, several taps over time, or a height reached), and show no hint until it is nearly there. | Dune Drift 4/10 |
