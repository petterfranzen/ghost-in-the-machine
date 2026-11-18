// draw.kt — the two cached pictures the night is painted on: the sky (deep
// gradient, the milky way's dither, the glow above the hills) and the ground
// (two ridges, a treeline, the mound the observatory stands on). Both are
// rebuilt only when the page changes size.

val STAR_COLOURS = arrayOf("#fff2d8", "#eef2ff", "#cfe0ff", "#ffd9a8")

class Layers {
  var sky: CanvasEl? = null
  var ground: CanvasEl? = null
  var w: Double = 0.0
  var h: Double = 0.0
  var dpr: Double = 1.0
  var seed: Int = Int.MIN_VALUE
}

// The one thing every painter here needs: how big the page is, at what device
// pixel ratio it is drawn, and which seed the sky was built from.
class Surface(val w: Double, val h: Double, val dpr: Double, val seed: Int)

fun sizeCanvas(c: CanvasEl, w: Double, h: Double, dpr: Double): Ctx {
  c.width = (w * dpr).toInt()
  c.height = (h * dpr).toInt()
  val ctx = c.getContext("2d")
  ctx.setTransform(dpr, 0.0, 0.0, dpr, 0.0, 0.0)
  return ctx
}

fun ensureLayers(l: Layers, s: Surface) {
  val resized = l.sky == null || l.w != s.w || l.h != s.h || l.dpr != s.dpr
  val reseeded = l.seed != s.seed
  if (!resized && !reseeded) return
  l.w = s.w
  l.h = s.h
  l.dpr = s.dpr
  l.seed = s.seed
  if (resized) {
    l.sky = makeCanvas()
    l.ground = makeCanvas()
    paintGround(l.ground!!, s)
  }
  paintSky(l.sky!!, s)
}

fun paintSky(c: CanvasEl, s: Surface) {
  val ctx = sizeCanvas(c, s.w, s.h, s.dpr)
  val grad = ctx.createLinearGradient(0.0, 0.0, 0.0, s.h * 0.92)
  grad.addColorStop(0.0, "#04060f")
  grad.addColorStop(0.42, "#0a1226")
  grad.addColorStop(0.74, "#121c33")
  grad.addColorStop(1.0, "#1c2841")
  ctx.fillStyle = grad
  ctx.fillRect(0.0, 0.0, s.w, s.h)
  paintMilkyWay(ctx, s)
  paintHorizonGlow(ctx, s)
}

fun bandY(x: Double, s: Surface): Double =
  s.h * 0.34 + kotlin.math.sin(x / s.w * 2.7 + 0.6) * s.h * 0.05 + x / s.w * s.h * 0.16

fun paintMilkyWay(ctx: Ctx, s: Surface) {
  val rng = Rng(s.seed xor 0x3C6EF372.toInt())
  val colours = arrayOf("#6f82b6", "#879bd0", "#5b6b9c", "#a3b6e8")
  var i = 0
  while (i < 2600) {
    i += 1
    val x = rng.unit() * s.w
    val spread = (rng.unit() + rng.unit() + rng.unit() - 1.5) * s.h * 0.085
    val y = bandY(x, s) + spread
    if (y < 0.0 || y > s.h * 0.9) continue
    ctx.globalAlpha = 0.05 + 0.07 * rng.unit()
    ctx.fillStyle = colours[rng.below(colours.size)]
    ctx.fillRect(x, y, 1.4, 1.4)
  }
  ctx.globalAlpha = 1.0
}

fun paintHorizonGlow(ctx: Ctx, s: Surface) {
  val glow = ctx.createLinearGradient(0.0, s.h * 0.68, 0.0, s.h)
  glow.addColorStop(0.0, "rgba(30,46,78,0)")
  glow.addColorStop(0.7, "rgba(46,68,104,0.34)")
  glow.addColorStop(1.0, "rgba(70,96,138,0.5)")
  ctx.fillStyle = glow
  ctx.fillRect(0.0, s.h * 0.68, s.w, s.h * 0.32)
}

fun farRidge(x: Double, s: Surface): Double =
  s.h * 0.905 - kotlin.math.sin(x / s.w * 3.1 + 0.4) * s.h * 0.022 - kotlin.math.sin(x / s.w * 7.3 + 2.1) * s.h * 0.008

fun nearRidge(x: Double, s: Surface): Double =
  s.h * 0.955 - kotlin.math.sin(x / s.w * 2.2 + 1.9) * s.h * 0.014

fun paintGround(c: CanvasEl, s: Surface) {
  val ctx = sizeCanvas(c, s.w, s.h, s.dpr)
  paintRidge(ctx, s, "#0e1729", { x -> farRidge(x, s) })
  paintTreeline(ctx, s)
  paintRidge(ctx, s, "#070c18", { x -> nearRidge(x, s) })
  paintObservatoryHill(ctx, s)
}

fun paintRidge(ctx: Ctx, s: Surface, colour: String, edge: (Double) -> Double) {
  ctx.globalAlpha = 1.0
  ctx.fillStyle = colour
  ctx.beginPath()
  ctx.moveTo(0.0, s.h)
  var x = 0.0
  while (x < s.w) {
    ctx.lineTo(x, edge(x))
    x += 6.0
  }
  ctx.lineTo(s.w, edge(s.w))
  ctx.lineTo(s.w, s.h)
  ctx.closePath()
  ctx.fill()
}

fun paintTreeline(ctx: Ctx, s: Surface) {
  val rng = Rng(0x7A3B)
  var x = s.w * 0.02
  while (x < s.w * 0.98) {
    val top = farRidge(x, s)
    val tall = rng.range(s.h * 0.008, s.h * 0.026)
    val wide = tall * 0.55
    ctx.fillStyle = "#0a1120"
    ctx.beginPath()
    ctx.moveTo(x - wide, top + s.h * 0.004)
    ctx.lineTo(x, top - tall)
    ctx.lineTo(x + wide, top + s.h * 0.004)
    ctx.closePath()
    ctx.fill()
    x += rng.range(s.w * 0.035, s.w * 0.085)
  }
}

fun paintObservatoryHill(ctx: Ctx, s: Surface) {
  val cx = s.w * 0.28
  val base = s.h * 0.925
  ctx.fillStyle = "#0c1424"
  ctx.beginPath()
  ctx.moveTo(cx - s.w * 0.22, s.h)
  ctx.quadraticCurveTo(cx - s.w * 0.06, base - s.h * 0.045, cx, base)
  ctx.quadraticCurveTo(cx + s.w * 0.06, base - s.h * 0.045, cx + s.w * 0.22, s.h)
  ctx.closePath()
  ctx.fill()
}

fun groundOffset(w: World, width: Double): Double {
  var px = -(w.panTotal * 0.3) % 1.0
  if (px > 0.0) px -= 1.0
  return px * width
}
