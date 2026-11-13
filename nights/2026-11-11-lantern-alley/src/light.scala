import scala.scalajs.js

/** A light buffer: filled with the night's ambient colour, then every lamp adds
  * its pool with additive blending. The finished buffer is multiplied over the
  * pixel art, so the scene is colour-multiplied by the light, not washed over.
  */
class Lighting(val w: Int, val h: Int) {
  val canvas: js.Dynamic = js.Dynamic.global.document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  private val ctx: js.Dynamic = canvas.getContext("2d")

  def begin(r: Double, g: Double, b: Double): Unit = {
    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle = rgb(r, g, b)
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = "lighter"
  }

  private def rgb(r: Double, g: Double, b: Double): String =
    s"rgb(${clamp(r)},${clamp(g)},${clamp(b)})"
  private def clamp(v: Double): Int = math.max(0, math.min(255, v.toInt))

  def add(x: Double, y: Double, radius: Double, cr: Double, cg: Double, cb: Double, a: Double): Unit = {
    if (a <= 0.01 || radius <= 0.1) return
    if (x < -radius || x > w + radius || y < -radius || y > h + radius) return
    val grad = ctx.createRadialGradient(x, y, 0.0, x, y, radius)
    grad.addColorStop(0.0, s"rgba(${clamp(cr)},${clamp(cg)},${clamp(cb)},${fmt(a)})")
    grad.addColorStop(0.4, s"rgba(${clamp(cr)},${clamp(cg)},${clamp(cb)},${fmt(a * 0.45)})")
    grad.addColorStop(1.0, "rgba(0,0,0,0)")
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, radius, 0.0, 6.283185307179586)
    ctx.fill()
  }

  private def fmt(v: Double): String = {
    val s = ((v * 1000.0).round / 1000.0).toString
    s
  }

  def finish(target: js.Dynamic): Unit = {
    target.globalCompositeOperation = "multiply"
    target.drawImage(canvas, 0, 0)
    target.globalCompositeOperation = "source-over"
  }
}
