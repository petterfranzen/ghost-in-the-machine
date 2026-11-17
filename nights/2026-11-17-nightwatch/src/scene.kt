// scene.kt — the frame: cached layers first, then everything that moves (the
// stars, the constellations as they are named, glints, meteors, the aurora)
// and finally the observatory on its hill.

// The observatory, resolved to page pixels: its centre and its radius.
class Obs(val cx: Double, val cy: Double, val r: Double)

// A constellation's lines as they fade in: which one, and how bright.
class ConFade(val ci: Int, val alpha: Double)

fun drawScene(ctx: Ctx, l: Layers, w: World, view: View) {
  ctx.globalAlpha = 1.0
  ctx.globalCompositeOperation = "source-over"
  ctx.fillStyle = "#04060f"
  ctx.fillRect(0.0, 0.0, view.w, view.h)
  drawLayer(ctx, l.sky, groundOffset(w, view.w), view)
  drawLayer(ctx, l.ground, groundOffset(w, view.w) * 0.75, view)
  drawAurora(ctx, w, view)
  drawStars(ctx, w, view)
  drawNaming(ctx, w, view)
  drawGlints(ctx, w, view)
  drawMeteors(ctx, w, view)
  drawObservatory(ctx, w, view)
  drawHold(ctx, w, view)
  ctx.globalAlpha = 1.0
}

fun drawLayer(ctx: Ctx, layer: CanvasEl?, dx: Double, view: View) {
  if (layer == null) return
  ctx.globalAlpha = 1.0
  ctx.drawImage(layer, dx, 0.0, view.w, view.h)
  ctx.drawImage(layer, dx + view.w, 0.0, view.w, view.h)
  ctx.drawImage(layer, dx - view.w, 0.0, view.w, view.h)
}

fun drawStars(ctx: Ctx, w: World, view: View) {
  val gain = 1.0 + w.domeGlow * 0.3
  val scale = view.scale()
  w.stars.forEachIndexed { i, s ->
    val x = view.x(s.lon)
    val y = view.y(s.alt)
    if (!onScreen(view, x, y)) return@forEachIndexed
    val tw = 0.62 + 0.38 * kotlin.math.sin(w.time * s.speed * w.motion + s.phase)
    ctx.globalAlpha = ((0.26 + 0.74 * s.mag) * tw * gain).coerceIn(0.0, 1.0)
    val size = (1.4 + 1.6 * s.mag) * scale
    ctx.fillStyle = STAR_COLOURS[s.hue]
    ctx.fillRect(x - size / 2.0, y - size / 2.0, size, size)
    if (w.marks.contains(i)) drawMark(ctx, x, y, scale)
  }
  ctx.globalAlpha = 1.0
}

// A star is worth drawing only when it sits inside the frame (with a small
// margin beyond each edge). Split into one guard per edge so the test stays
// plain.
private fun onScreen(view: View, x: Double, y: Double): Boolean {
  if (x < -4.0) return false
  if (x > view.w + 4.0) return false
  if (y < -4.0) return false
  if (y > view.hy + 2.0) return false
  return true
}

fun drawMark(ctx: Ctx, x: Double, y: Double, scale: Double) {
  ctx.globalAlpha = 0.5
  ctx.strokeStyle = "#9fb6ee"
  ctx.lineWidth = 1.0
  ctx.beginPath()
  ctx.arc(x, y, 4.2 * scale, 0.0, TAU)
  ctx.stroke()
}

fun drawNaming(ctx: Ctx, w: World, view: View) {
  CONSTELLATIONS.indices.forEach { ci ->
    if (!w.named.contains(ci)) return@forEach
    val flash = w.namings.firstOrNull { it.ci == ci }
    val alpha = if (flash == null) 0.2 else 0.2 + 0.6 * (flash.life / flash.max)
    drawConstellationLines(ctx, w, view, ConFade(ci, alpha))
  }
  w.namings.forEach { n -> drawNameLabel(ctx, w, view, n) }
  ctx.globalAlpha = 1.0
}

fun drawConstellationLines(ctx: Ctx, w: World, view: View, fade: ConFade) {
  val range = w.conRange(fade.ci)
  ctx.globalAlpha = fade.alpha.coerceIn(0.0, 1.0)
  ctx.strokeStyle = "#8ea3d8"
  ctx.lineWidth = 1.0
  ctx.beginPath()
  CONSTELLATIONS[fade.ci].edges.forEach { e ->
    val a = range.first + e.first
    val b = range.first + e.second
    ctx.moveTo(view.x(w.stars[a].lon), view.y(w.stars[a].alt))
    ctx.lineTo(view.x(w.stars[b].lon), view.y(w.stars[b].alt))
  }
  ctx.stroke()
}

fun centreOf(w: World, ci: Int): Pair<Double, Double> {
  val range = w.conRange(ci)
  var lon = 0.0
  var alt = 0.0
  range.forEach { lon += w.stars[it].lon; alt += w.stars[it].alt }
  return Pair(lon / range.count(), alt / range.count())
}

fun drawNameLabel(ctx: Ctx, w: World, view: View, n: Naming) {
  val (lon, alt) = centreOf(w, n.ci)
  val x = view.x(lon)
  val y = view.y(alt) - view.h * 0.045
  if (x < 0.0 || x > view.w) return
  val fade = (n.life / n.max).coerceIn(0.0, 1.0)
  ctx.globalAlpha = (1.0 - (1.0 - fade) * (1.0 - fade)).coerceIn(0.0, 1.0)
  ctx.font = "16px ui-serif, Georgia, serif"
  ctx.textAlign = "center"
  ctx.fillStyle = "#e6edff"
  ctx.fillText(CONSTELLATIONS[n.ci].name, x, y)
  ctx.globalAlpha = 1.0
}

fun drawGlints(ctx: Ctx, w: World, view: View) {
  val scale = view.scale()
  w.glints.forEach { g ->
    val x = view.x(g.lon)
    val y = view.y(g.alt)
    val age = 1.0 - (g.life / g.max)
    ctx.globalAlpha = (g.life / g.max).coerceIn(0.0, 1.0)
    ctx.strokeStyle = "#dbe8ff"
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.arc(x, y, (4.0 + age * 30.0) * scale, 0.0, TAU)
    ctx.stroke()
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(x - 1.0, y - 1.0, 2.0, 2.0)
  }
  ctx.globalAlpha = 1.0
}

fun drawMeteors(ctx: Ctx, w: World, view: View) {
  w.meteors.forEach { m ->
    val x = view.x(m.lon)
    val y = view.y(m.alt)
    val len = 70.0 * view.scale()
    val grad = ctx.createLinearGradient(x - len, y + len * 0.66, x, y)
    grad.addColorStop(0.0, "rgba(214,228,255,0)")
    grad.addColorStop(1.0, "rgba(226,238,255,0.75)")
    ctx.globalAlpha = (m.life * 1.6).coerceIn(0.0, 1.0)
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(x - len, y + len * 0.66)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1.0
}

fun drawAurora(ctx: Ctx, w: World, view: View) {
  if (w.aurora < 0.03) return
  val colours = arrayOf("#4fd0c0", "#6fa8ff", "#a06cff")
  ctx.globalCompositeOperation = "lighter"
  colours.forEachIndexed { i, colour ->
    val alpha = w.aurora * (0.40 - 0.085 * i)
    val top = view.h * (0.05 + 0.042 * i)
    val tall = view.h * (0.42 - 0.06 * i)
    var x = 0.0
    while (x < view.w) {
      val col = 8.0 + 5.0 * view.scale()
      val bend = kotlin.math.sin(x / view.w * 5.4 + w.time * 0.22 + i * 1.3) * view.h * 0.045
      val grad = ctx.createLinearGradient(0.0, top + bend, 0.0, top + bend + tall)
      grad.addColorStop(0.0, "rgba(0,0,0,0)")
      grad.addColorStop(0.30, colour)
      grad.addColorStop(0.62, colour)
      grad.addColorStop(1.0, "rgba(0,0,0,0)")
      ctx.globalAlpha = alpha
      ctx.fillStyle = grad
      ctx.fillRect(x, top + bend, col, tall)
      x += col
    }
  }
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1.0
}

fun obsCentre(view: View): Pair<Double, Double> = Pair(view.w * 0.28, view.hy - view.h * 0.055)

fun drawObservatory(ctx: Ctx, w: World, view: View) {
  val o = Obs(view.w * 0.28, view.hy - view.h * 0.055, 46.0 * view.scale())
  drawBeam(ctx, w, o)
  drawDomeBody(ctx, w, o)
  drawWindowLight(ctx, o)
  drawWatcher(ctx, w, o)
  ctx.globalAlpha = 1.0
}

fun drawBeam(ctx: Ctx, w: World, o: Obs) {
  if (w.domeGlow < 0.02) return
  val grad = ctx.createLinearGradient(0.0, o.cy - o.r * 6.0, 0.0, o.cy - o.r * 0.8)
  grad.addColorStop(0.0, "rgba(255,231,178,0)")
  grad.addColorStop(1.0, "rgba(255,226,160,0.26)")
  ctx.globalAlpha = 0.35 + 0.65 * w.domeGlow
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(o.cx - o.r * 0.42, o.cy - o.r * 0.7)
  ctx.lineTo(o.cx + o.r * 0.42, o.cy - o.r * 0.7)
  ctx.lineTo(o.cx + o.r * 1.6, o.cy - o.r * 6.0)
  ctx.lineTo(o.cx - o.r * 1.6, o.cy - o.r * 6.0)
  ctx.closePath()
  ctx.fill()
}

fun drawDomeBody(ctx: Ctx, w: World, o: Obs) {
  ctx.fillStyle = "#182136"
  ctx.fillRect(o.cx - o.r * 0.92, o.cy, o.r * 1.84, o.r * 0.95)
  ctx.fillStyle = "#22304d"
  ctx.beginPath()
  ctx.arc(o.cx, o.cy, o.r, kotlin.math.PI, 0.0)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = "#41598a"
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(o.cx, o.cy, o.r, kotlin.math.PI, 0.0)
  ctx.stroke()
  drawSlit(ctx, w, o)
}

fun drawSlit(ctx: Ctx, w: World, o: Obs) {
  val open = w.domeGlow > 0.5
  ctx.fillStyle = if (open) "#ffe6b4" else "#080d1a"
  ctx.globalAlpha = if (open) 0.3 + 0.7 * w.domeGlow else 0.92
  ctx.beginPath()
  ctx.moveTo(o.cx - o.r * 0.2, o.cy)
  ctx.lineTo(o.cx - o.r * 0.11, o.cy - o.r * 0.95)
  ctx.lineTo(o.cx + o.r * 0.11, o.cy - o.r * 0.95)
  ctx.lineTo(o.cx + o.r * 0.2, o.cy)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1.0
}

fun drawWindowLight(ctx: Ctx, o: Obs) {
  val wx = o.cx + o.r * 0.52
  val wy = o.cy + o.r * 0.42
  val glow = ctx.createRadialGradient(wx, wy, 0.0, wx, wy, o.r * 1.3)
  glow.addColorStop(0.0, "rgba(255,196,120,0.45)")
  glow.addColorStop(1.0, "rgba(255,196,120,0)")
  ctx.fillStyle = glow
  ctx.fillRect(wx - o.r * 1.3, wy - o.r * 1.3, o.r * 2.6, o.r * 2.6)
  ctx.fillStyle = "#ffc478"
  ctx.fillRect(wx - o.r * 0.1, wy - o.r * 0.1, o.r * 0.2, o.r * 0.2)
}

fun drawWatcher(ctx: Ctx, w: World, o: Obs) {
  val scale = (o.r / 46.0).coerceAtLeast(0.4)
  val bob = kotlin.math.sin(w.time * (0.25 + 0.6 * w.motion)) * 1.6 * scale
  val x = o.cx + o.r * 1.5
  val feet = o.cy + o.r * 0.9
  val body = 5.0 * scale
  ctx.globalAlpha = 0.92
  ctx.fillStyle = "#93a9d8"
  ctx.fillRect(x, feet - body * 2.0 + bob, body, body * 1.4)
  ctx.fillRect(x - body * 0.1, feet - body * 3.0 + bob, body * 1.2, body)
  ctx.fillRect(x, feet - body * 0.6, body * 0.4, body * 0.6)
  ctx.fillRect(x + body * 0.6, feet - body * 0.6, body * 0.4, body * 0.6)
  if (w.namings.isNotEmpty()) ctx.fillRect(x + body, feet - body * 2.7 + bob, body * 0.4, body * 1.1)
}

fun drawHold(ctx: Ctx, w: World, view: View) {
  if (!w.holding) return
  val progress = (w.holdT / 0.8).coerceIn(0.0, 1.0)
  ctx.globalAlpha = 0.22 + 0.6 * progress
  ctx.strokeStyle = "#bcd2ff"
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.arc(w.holdNx * view.w, w.holdNy * view.h, (12.0 + 12.0 * progress) * view.scale(), 0.0, TAU)
  ctx.stroke()
  ctx.globalAlpha = 1.0
}
