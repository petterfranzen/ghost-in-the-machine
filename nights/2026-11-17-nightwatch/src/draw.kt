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

fun sizeCanvas(c: CanvasEl, w: Double, h: Double, dpr: Double): Ctx {
  c.width = (w * dpr).toInt()
  c.height = (h * dpr).toInt()
  val ctx = c.getContext("2d")
  ctx.setTransform(dpr, 0.0, 0.0, dpr, 0.0, 0.0)
  return ctx
}

fun ensureLayers(l: Layers, w: Double, h: Double, dpr: Double, seed: Int) {
  val resized = l.sky == null || l.w != w || l.h != h || l.dpr != dpr
  val reseeded = l.seed != seed
  if (!resized && !reseeded) return
  l.w = w
  l.h = h
  l.dpr = dpr
  l.seed = seed
  if (resized) {
    l.sky = makeCanvas()
    l.ground = makeCanvas()
    paintGround(l.ground!!, w, h, dpr)
  }
  paintSky(l.sky!!, w, h, dpr, seed)
}

fun paintSky(c: CanvasEl, w: Double, h: Double, dpr: Double, seed: Int) {
  val ctx = sizeCanvas(c, w, h, dpr)
  val grad = ctx.createLinearGradient(0.0, 0.0, 0.0, h * 0.92)
  grad.addColorStop(0.0, "#04060f")
  grad.addColorStop(0.42, "#0a1226")
  grad.addColorStop(0.74, "#121c33")
  grad.addColorStop(1.0, "#1c2841")
  ctx.fillStyle = grad
  ctx.fillRect(0.0, 0.0, w, h)
  paintMilkyWay(ctx, w, h, seed)
  paintHorizonGlow(ctx, w, h)
}

fun bandY(x: Double, w: Double, h: Double): Double =
  h * 0.34 + kotlin.math.sin(x / w * 2.7 + 0.6) * h * 0.05 + x / w * h * 0.16

fun paintMilkyWay(ctx: Ctx, w: Double, h: Double, seed: Int) {
  val rng = Rng(seed xor 0x3C6EF372.toInt())
  val colours = arrayOf("#6f82b6", "#879bd0", "#5b6b9c", "#a3b6e8")
  var i = 0
  while (i < 2600) {
    i += 1
    val x = rng.unit() * w
    val spread = (rng.unit() + rng.unit() + rng.unit() - 1.5) * h * 0.085
    val y = bandY(x, w, h) + spread
    if (y < 0.0 || y > h * 0.9) continue
    ctx.globalAlpha = 0.05 + 0.07 * rng.unit()
    ctx.fillStyle = colours[rng.below(colours.size)]
    ctx.fillRect(x, y, 1.4, 1.4)
  }
  ctx.globalAlpha = 1.0
}

fun paintHorizonGlow(ctx: Ctx, w: Double, h: Double) {
  val glow = ctx.createLinearGradient(0.0, h * 0.68, 0.0, h)
  glow.addColorStop(0.0, "rgba(30,46,78,0)")
  glow.addColorStop(0.7, "rgba(46,68,104,0.34)")
  glow.addColorStop(1.0, "rgba(70,96,138,0.5)")
  ctx.fillStyle = glow
  ctx.fillRect(0.0, h * 0.68, w, h * 0.32)
}

fun farRidge(x: Double, w: Double, h: Double): Double =
  h * 0.905 - kotlin.math.sin(x / w * 3.1 + 0.4) * h * 0.022 - kotlin.math.sin(x / w * 7.3 + 2.1) * h * 0.008

fun nearRidge(x: Double, w: Double, h: Double): Double =
  h * 0.955 - kotlin.math.sin(x / w * 2.2 + 1.9) * h * 0.014

fun paintGround(c: CanvasEl, w: Double, h: Double, dpr: Double) {
  val ctx = sizeCanvas(c, w, h, dpr)
  paintRidge(ctx, w, h, "#0e1729", { x -> farRidge(x, w, h) })
  paintTreeline(ctx, w, h)
  paintRidge(ctx, w, h, "#070c18", { x -> nearRidge(x, w, h) })
  paintObservatoryHill(ctx, w, h)
}

fun paintRidge(ctx: Ctx, w: Double, h: Double, colour: String, edge: (Double) -> Double) {
  ctx.globalAlpha = 1.0
  ctx.fillStyle = colour
  ctx.beginPath()
  ctx.moveTo(0.0, h)
  var x = 0.0
  while (x < w) {
    ctx.lineTo(x, edge(x))
    x += 6.0
  }
  ctx.lineTo(w, edge(w))
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fill()
}

fun paintTreeline(ctx: Ctx, w: Double, h: Double) {
  val rng = Rng(0x7A3B)
  var x = w * 0.02
  while (x < w * 0.98) {
    val top = farRidge(x, w, h)
    val tall = rng.range(h * 0.008, h * 0.026)
    val wide = tall * 0.55
    ctx.fillStyle = "#0a1120"
    ctx.beginPath()
    ctx.moveTo(x - wide, top + h * 0.004)
    ctx.lineTo(x, top - tall)
    ctx.lineTo(x + wide, top + h * 0.004)
    ctx.closePath()
    ctx.fill()
    x += rng.range(w * 0.035, w * 0.085)
  }
}

fun paintObservatoryHill(ctx: Ctx, w: Double, h: Double) {
  val cx = w * 0.28
  val base = h * 0.925
  ctx.fillStyle = "#0c1424"
  ctx.beginPath()
  ctx.moveTo(cx - w * 0.22, h)
  ctx.quadraticCurveTo(cx - w * 0.06, base - h * 0.045, cx, base)
  ctx.quadraticCurveTo(cx + w * 0.06, base - h * 0.045, cx + w * 0.22, h)
  ctx.closePath()
  ctx.fill()
}

fun groundOffset(w: World, width: Double): Double {
  var px = -(w.panTotal * 0.3) % 1.0
  if (px > 0.0) px -= 1.0
  return px * width
}
