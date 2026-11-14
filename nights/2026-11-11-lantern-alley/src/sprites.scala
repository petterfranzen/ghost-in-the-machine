import scala.scalajs.js

/** Pixel art, written the way pixel art is drawn: little grids of characters.
  *
  * A '.' is transparent; every other letter is looked up in the sprite's
  * palette. Blitting is one fillRect per lit pixel, which is cheap at this size
  * and keeps the shapes editable by eye.
  */
object Sprites {

  type Grid = Array[String]
  type Pal = Map[Char, String]

  val person: Pal = Map(
    'h' -> "#262a48", 'H' -> "#414463", 's' -> "#f6dcbb", 'k' -> "#16161f",
    'c' -> "#46538a", 'C' -> "#5f6da6", 'd' -> "#2f3559", 'r' -> "#e09070",
    'p' -> "#313852", 'b' -> "#1e2233")

  val lanternPal: Pal = Map('c' -> "#7d6a48", 'k' -> "#332e24", 'y' -> "#ffb454", 'F' -> "#ffe9a8")
  val coinPal: Pal = Map('o' -> "#8a6a2a", 'O' -> "#e8c05a", 'B' -> "#fff2c0")
  val catPal: Pal = Map('m' -> "#5c5c76", 'M' -> "#72728e", 'g' -> "#8ce8b0", 'p' -> "#c98f6a")
  val foxPal: Pal = Map('f' -> "#b5643c", 'F' -> "#d8834f", 'w' -> "#efe6d8", 'k' -> "#221a18")
  val mothPal: Pal = Map('w' -> "#e8e2d0", 'M' -> "#c9c0a6")
  val leafPal: Pal = Map('l' -> "#a8743c", 'L' -> "#c9985a")

  val legsApart: Grid = Array(
    "..pp..pp..", "..pp..pp..", "..pp..pp..", "..bb..bb..", ".bbb..bbb.")
  val legsTogether: Grid = Array(
    "...pppp...", "...pppp...", "...pppp...", "...bbbb...", "..bbbbbb..")

  /** walking away, up the alley */
  val backA: Grid = Array(
    "...hhhh...", "..hhhhhh..", "..hhhhhh..", "..hHHHHh..", "...rrrr...",
    "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.", ".cCCCCCCc.",
    ".dcCCCCcd.", ".ddccccdd.", "..pppppp..") ++ legsApart
  val backB: Grid = Array(
    "...hhhh...", "..hhhhhh..", "..hhhhhh..", "..hHHHHh..", "...rrrr...",
    "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.", ".cCCCCCCc.",
    ".dcCCCCcd.", ".ddccccdd.", "..pppppp..") ++ legsTogether

  /** walking towards the camera */
  val frontA: Grid = Array(
    "...hhhh...", "..hhhhhh..", "..hssssh..", "..ssssss..", "..skssks..",
    "..ssssss..", "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.",
    ".cCCCCCCc.", ".dcCCCCcd.", ".ddccccdd.", "..pppppp..") ++ legsApart
  val frontB: Grid = Array(
    "...hhhh...", "..hhhhhh..", "..hssssh..", "..ssssss..", "..skssks..",
    "..ssssss..", "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.",
    ".cCCCCCCc.", ".dcCCCCcd.", ".ddccccdd.", "..pppppp..") ++ legsTogether

  /** walking sideways */
  val sideA: Grid = Array(
    "...hhhh...", "..hhhhhh..", "..hhssss..", "..hsksss..", "..hsssss..",
    "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.",
    ".dcCCCCcd.", ".ddccccdd.", "..pppppp..", "..ppp.pp..", "..pp..pp..",
    "..p....p..", "..p....p..", "..bb..bb..", ".bbb..bbb.")
  val sideB: Grid = Array(
    "...hhhh...", "..hhhhhh..", "..hhssss..", "..hsksss..", "..hsssss..",
    "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.",
    ".dcCCCCcd.", ".ddccccdd.", "..pppppp..", "..pppppp..", "..ppp.pp..",
    "...p...p..", "...p...p..", "...bb.bb..", "..bbb.bb..")

  val handLamp: Grid = Array(
    "..c..", ".ccc.", ".kkk.", ".kyk.", ".kFk.", ".kkk.", "..c..")

  val lanternA: Grid = Array(
    "....c....", "...ccc...", "..ccccc..", ".ccccccc.", ".kkkkkkk.",
    ".kyykyyk.", ".kyFkFyk.", ".kyFkFyk.", ".kyykyyk.", ".kkkkkkk.",
    ".ccccccc.", "..ccccc..", "...ccc...", "....c....")
  val lanternB: Grid = Array(
    "....c....", "...ccc...", "..ccccc..", ".ccccccc.", ".kkkkkkk.",
    ".kyFkFyk.", ".kFFkFFk.", ".kyFkFyk.", ".kyykyyk.", ".kkkkkkk.",
    ".ccccccc.", "..ccccc..", "...ccc...", "....c....")

  val coinA: Grid = Array(".oooo.", "oOOOOo", "oOOOOo", "oOOOOo", "oOOOOo", ".oooo.")
  val coinB: Grid = Array(".oooo.", "oOOBOo", "oOOBOo", "oOOOOo", "oOOOOo", ".oooo.")

  val catA: Grid = Array(
    "..m......m..", ".mmmm....mm.", ".mMmm..mmmmm", "mmmmmmmmmmmm",
    ".mm.mm.mm...", ".m..m..m....")
  val catB: Grid = Array(
    "..m......m..", ".mmmm....mm.", ".mMmm..mmmmm", "mmmmmmmmmmmm",
    "mmm.mm.mm...", "..m..m..m...")
  val catSit: Grid = Array(
    "..m......m..", ".mmmmmmmmmm.", ".mgmmmmgmmm.", ".mmmmmmmmmm.",
    "mmmmmmmmmmmm", "mmmmmmmmmmmm", ".mmmmmmmmmm.")

  val foxA: Grid = Array(
    ".ff......ff...", ".ffff..ffff...", "ffffffffffff..", "Ffffffkfffff..",
    ".f.f..f.f.....", ".f.f..f.f.....")
  val foxB: Grid = Array(
    ".ff......ff...", ".ffff..ffff...", "ffffffffffff..", "Ffffffkfffff..",
    ".ff.mf.mf.....", "..f..f..f.....")

  val mothA: Grid = Array(".w.", "wMw", ".w.")
  val mothB: Grid = Array("w.w", ".M.", "w.w")
  val leaf: Grid = Array("ll.", "LLl", ".l.")

  var scale: Double = 1.0

  def blit(ctx: js.Dynamic, grid: Grid, pal: Pal, x0: Double, y0: Double, flip: Boolean, alpha: Double): Unit = {
    if (alpha <= 0.01) return
    ctx.globalAlpha = alpha
    var j = 0
    while (j < grid.length) {
      val row = grid(j)
      var i = 0
      while (i < row.length) {
        val ch = row.charAt(i)
        if (ch != '.') {
          pal.get(ch).foreach { col =>
            ctx.fillStyle = col
            val px = if (flip) x0 + (row.length - 1 - i) * scale else x0 + i * scale
            ctx.fillRect(px, y0 + j * scale, scale, scale)
          }
        }
        i += 1
      }
      j += 1
    }
    ctx.globalAlpha = 1.0
  }

  /** the same shape, flat in one colour: used for a 1px outline so a figure
    * reads against a busy floor */
  def silhouette(ctx: js.Dynamic, grid: Grid, x0: Double, y0: Double, flip: Boolean, col: String, alpha: Double): Unit = {
    ctx.globalAlpha = alpha
    ctx.fillStyle = col
    var j = 0
    while (j < grid.length) {
      val row = grid(j)
      var i = 0
      while (i < row.length) {
        if (row.charAt(i) != '.') {
          val px = if (flip) x0 + (row.length - 1 - i) * scale else x0 + i * scale
          ctx.fillRect(px, y0 + j * scale, scale, scale)
        }
        i += 1
      }
      j += 1
    }
    ctx.globalAlpha = 1.0
  }

  def w(grid: Grid): Int = grid(0).length
  def h(grid: Grid): Int = grid.length
}
