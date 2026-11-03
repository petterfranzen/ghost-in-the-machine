# Section 9 board

A single, self-contained static page: the full-width crew and task board for
Section 9. It reads `./status.json` every 60 s (the schema Saito defines on
section9-hq "Design: Section 9 board") and renders eight agent lanes plus five
task columns. `board-sample.json` is a faithful sample; the same JSON is inlined
in `index.html` so opening the file directly (no server) still renders.

- Desktop and 390 px layouts; columns stack on a phone.
- Filter by clicking an agent lane. Done shows the last 10 by default.
- Theme tokens follow `hq/ghost.yaml` (GITS-95 phosphor green, Rajdhani/Share
  Tech Mono). No external requests except the avatar and font URLs already in
  that file.

Build/check: `bash hq/board/build.sh` (validates the data contract, the inline
sample copy, and the page's phone/reduced-motion hooks).
