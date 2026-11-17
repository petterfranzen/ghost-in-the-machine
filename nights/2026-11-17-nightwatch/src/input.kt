// input.kt — how the visitor's hands reach the world. One pointer is armed on
// every press: a sideways travel makes it a drag, a long stillness makes it a
// mark, a quick flick throws the sky, and a short still press is a tap.

var pointerDown = false
var gestureMoved = false
var downAt = 0.0
var downX = 0.0
var downY = 0.0
var lastX = 0.0
var lastY = 0.0
var gestures = 0

fun currentView(): View = View(viewW, viewH, world.pan, world.tilt)

fun pointNorm(ev: dynamic): Pair<Double, Double> {
  val r = canvasEl.getBoundingClientRect()
  val nx: Double = (ev.clientX - r.left) / r.width
  val ny: Double = (ev.clientY - r.top) / r.height
  return Pair(nx.coerceIn(0.0, 1.0), ny.coerceIn(0.0, 1.0))
}

fun onDown(ev: dynamic) {
  val p = pointNorm(ev)
  pointerDown = true
  gestureMoved = false
  downAt = now()
  downX = p.first
  downY = p.second
  lastX = downX
  lastY = downY
  world.holdStart(downX, downY)
  kit.resume()
  if (pendingSound) setSound(true)
}

fun onMove(ev: dynamic) {
  if (!pointerDown) return
  val p = pointNorm(ev)
  if (!gestureMoved) {
    val fromDownX = (p.first - downX) * viewW
    val fromDownY = (p.second - downY) * viewH
    val travel = kotlin.math.sqrt(fromDownX * fromDownX + fromDownY * fromDownY)
    if (travel < 6.0) return
    gestureMoved = true
    world.holdEnd(currentView())
  }
  world.dragBy(currentView(), (p.first - lastX) * viewW, (p.second - lastY) * viewH)
  lastX = p.first
  lastY = p.second
}

fun onUp(ev: dynamic) {
  if (!pointerDown) return
  pointerDown = false
  val p = pointNorm(ev)
  val dur = now() - downAt
  val dx = (p.first - downX) * viewW
  val dy = (p.second - downY) * viewH
  val dist = kotlin.math.sqrt(dx * dx + dy * dy)
  world.holdEnd(currentView())
  if (dur < 900.0 && dist > viewW * 0.06) {
    world.flickBy(currentView(), dx, dy)
    return
  }
  if (gestureMoved || dur > 420.0) return
  if (dist < viewH * 0.07) {
    gestures += 1
    actOnTap(world.tapAt(currentView(), p.first, p.second))
  }
}

// Only the keys the sky uses are swallowed: Tab and Shift-Tab must still walk
// out of the canvas to the sound button, so the page works from a keyboard.
fun onKey(ev: dynamic) {
  val key = ev.key as String
  val v = currentView()
  if (key == "ArrowLeft") { ev.preventDefault(); world.dragBy(v, viewW * 0.05, 0.0) }
  else if (key == "ArrowRight") { ev.preventDefault(); world.dragBy(v, -viewW * 0.05, 0.0) }
  else if (key == "ArrowUp") { ev.preventDefault(); world.dragBy(v, 0.0, viewH * 0.05) }
  else if (key == "ArrowDown") { ev.preventDefault(); world.dragBy(v, 0.0, -viewH * 0.05) }
  else if (key == "Enter" || key == " ") {
    ev.preventDefault()
    gestures += 1
    actOnTap(world.tapAt(v, 0.5, 0.42))
  }
}

fun starPosForTest(i: Int): String {
  val v = currentView()
  val p = world.starScreen(v, i)
  return (p.first / viewW).toString() + "," + (p.second / viewH).toString()
}

fun lookAtForTest(lon: Double) {
  world.gesture()
  world.pan = lon - kotlin.math.floor(lon)
}
