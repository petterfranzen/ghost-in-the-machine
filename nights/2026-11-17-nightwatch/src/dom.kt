// dom.kt — the thin bridge between Kotlin and the browser. Kept deliberately
// small: every browser call the app makes is declared here once.

external interface Grad { fun addColorStop(t: Double, c: String) }

external interface Ctx {
  var fillStyle: dynamic
  var strokeStyle: dynamic
  var lineWidth: Double
  var globalAlpha: Double
  var globalCompositeOperation: String
  var font: String
  var textAlign: String
  fun save()
  fun restore()
  fun beginPath()
  fun closePath()
  fun moveTo(x: Double, y: Double)
  fun lineTo(x: Double, y: Double)
  fun quadraticCurveTo(cx: Double, cy: Double, x: Double, y: Double)
  fun arc(x: Double, y: Double, r: Double, a0: Double, a1: Double)
  fun rect(x: Double, y: Double, w: Double, h: Double)
  fun fill()
  fun stroke()
  fun clip()
  fun fillRect(x: Double, y: Double, w: Double, h: Double)
  fun clearRect(x: Double, y: Double, w: Double, h: Double)
  fun createLinearGradient(x0: Double, y0: Double, x1: Double, y1: Double): Grad
  fun createRadialGradient(x: Double, y: Double, r0: Double, x1: Double, y1: Double, r1: Double): Grad
  fun drawImage(img: CanvasEl, x: Double, y: Double, w: Double, h: Double)
  fun setTransform(a: Double, b: Double, c: Double, d: Double, e: Double, f: Double)
  fun fillText(t: String, x: Double, y: Double)
}

external interface Rect { val width: Double; val height: Double; val left: Double; val top: Double }

external interface CanvasEl {
  var width: Int
  var height: Int
  val style: dynamic
  fun getContext(kind: String): Ctx
  fun getBoundingClientRect(): Rect
  fun remove(): dynamic
}

external interface Element {
  var textContent: String
  var className: String
  val style: dynamic
  fun setAttribute(k: String, v: String)
  fun getAttribute(k: String): String?
  fun contains(e: dynamic): Boolean
  fun focus(): dynamic
}

external fun requestAnimationFrame(cb: (Double) -> Unit)

fun makeCanvas(): CanvasEl = js("document.createElement('canvas')")
fun byId(id: String): Element = js("document.getElementById(id)")
fun canvasById(id: String): CanvasEl = js("document.getElementById(id)")
fun now(): Double = js("performance.now()")
fun isReducedMotion(): Boolean = js("matchMedia('(prefers-reduced-motion: reduce)').matches")
fun devicePixelRatio(): Double = js("globalThis.devicePixelRatio || 1")

// A listener that owns its gesture: pointer and touch defaults are suppressed
// so a long press on a phone never turns into a selection or a magnifier.
fun onOwned(el: dynamic, kind: String, fn: (dynamic) -> Unit) {
  js("el.addEventListener(kind, function (ev) { ev.preventDefault(); fn(ev); }, { passive: false })")
}

fun onPlain(el: dynamic, kind: String, fn: (dynamic) -> Unit) {
  js("el.addEventListener(kind, function (ev) { fn(ev); }, { passive: true })")
}

fun setStyle(el: dynamic, prop: String, v: String) {
  js("el.style[prop] = v")
}

fun storeGet(key: String): String? = try {
  js("globalThis.localStorage.getItem(key)") as? String
} catch (e: Throwable) {
  null
}

fun storeSet(key: String, value: String) {
  try {
    js("globalThis.localStorage.setItem(key, value)")
  } catch (e: Throwable) {
    // A browser in private mode refuses storage; the night still runs, it just
    // forgets which constellations you named.
  }
}
