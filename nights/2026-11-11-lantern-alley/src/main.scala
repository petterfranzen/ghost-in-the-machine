import scala.scalajs.js

/** Boot: one canvas, one loop, and five kinds of touch.
  *
  *   tap            walk somewhere, warm a lantern, nudge the cat, touch the well
  *   drag           keep walking while the thumb stays down
  *   long press     tend a lantern (it keeps its tint and dims more slowly)
  *   flick          raise a breeze; a second breeze wakes the rain
  *   stand still    the cat comes back, and if the alley is warm enough, a fox
  */
object Main {
  def main(args: Array[String]): Unit = {
    val doc = js.Dynamic.global.document
    val win = js.Dynamic.global.window
    val canvas = doc.getElementById("c")
    val ctx = canvas.getContext("2d")

    val sound = new Sound
    val world = new World(sound)
    canvas.width = world.VIEW_W
    canvas.height = world.VIEW_H
    // a small handle for smoke checks and for anyone curious in the console
    win.updateDynamic("alley")(new AlleyHandle(world).asInstanceOf[js.Any])

    def fit(): Unit = {
      val ww = win.innerWidth.asInstanceOf[Double]
      val wh = win.innerHeight.asInstanceOf[Double]
      val sc = math.min(ww / world.VIEW_W, wh / world.VIEW_H)
      canvas.style.width = math.max(1, (world.VIEW_W * sc).toInt).toString + "px"
      canvas.style.height = math.max(1, (world.VIEW_H * sc).toInt).toString + "px"
    }
    fit()

    // ---------------------------------------------------------------- sound
    val btn = doc.getElementById("sound")
    val label = btn.querySelector(".label")

    def load(): String =
      try { val v = js.Dynamic.global.localStorage.getItem("lantern-alley-sound"); if (v == null) "off" else v.toString }
      catch { case _: Throwable => "off" }
    def save(v: String): Unit =
      try js.Dynamic.global.localStorage.setItem("lantern-alley-sound", v) catch { case _: Throwable => () }

    var wantOn = load() == "on"
    def paint(): Unit = {
      val st = if (sound.on) "true" else "false"
      btn.setAttribute("data-on", st)
      btn.setAttribute("aria-pressed", st)
      btn.setAttribute("aria-label", if (sound.on) "Sound on" else "Sound off")
      label.textContent = if (sound.on) "Sound on" else "Sound off"
    }
    paint()

    val onClick: js.Function1[js.Dynamic, Unit] = (e: js.Dynamic) => {
      e.preventDefault()
      e.stopPropagation()
      if (sound.on) { sound.mute(); save("off") } else { sound.unmute(); save("on") }
      paint()
    }
    btn.addEventListener("click", onClick)

    // ---------------------------------------------------------------- touch
    var downX = 0.0
    var downY = 0.0
    var downT = 0.0
    var mode = 0          // 0 waiting, 1 dragging, 2 long-pressed, -1 finished
    var held = 0          // 0 no, 1 yes

    def logical(clientX: Double, clientY: Double): (Double, Double) = {
      val r = canvas.getBoundingClientRect()
      val sc = math.max(0.0001, r.width.asInstanceOf[Double] / world.VIEW_W)
      ((clientX - r.left.asInstanceOf[Double]) / sc, (clientY - r.top.asInstanceOf[Double]) / sc)
    }
    def worldPoint(clientX: Double, clientY: Double): (Double, Double) = {
      val (lx, ly) = logical(clientX, clientY)
      (lx, world.camY + ly)
    }

    val onDown: js.Function1[js.Dynamic, Unit] = (e: js.Dynamic) => {
      if (!btn.contains(e.target).asInstanceOf[Boolean]) {
        if (wantOn && !sound.on) { sound.unmute(); paint() }
        sound.resumeIfOn()
        downX = e.clientX.asInstanceOf[Double]
        downY = e.clientY.asInstanceOf[Double]
        downT = js.Date.now().asInstanceOf[Double]
        mode = 0
        held = 1
        world.inputT = 0.0
      }
    }
    val onMove: js.Function1[js.Dynamic, Unit] = (e: js.Dynamic) => {
      if (held == 1 && !btn.contains(e.target).asInstanceOf[Boolean]) {
        val dx = e.clientX.asInstanceOf[Double] - downX
        val dy = e.clientY.asInstanceOf[Double] - downY
        if (mode == 0 && math.abs(dx) + math.abs(dy) > 7.0) mode = 1
        if (mode == 1) {
          val (wx, wy) = worldPoint(e.clientX.asInstanceOf[Double], e.clientY.asInstanceOf[Double])
          world.dragTo(wx, wy)
        }
        if (mode == 2) { /* a tended lantern stays tended */ }
      }
    }
    val onUp: js.Function1[js.Dynamic, Unit] = (e: js.Dynamic) => {
      if (held == 1) {
        val now = js.Date.now().asInstanceOf[Double]
        val dx = e.clientX.asInstanceOf[Double] - downX
        val dy = e.clientY.asInstanceOf[Double] - downY
        val dist = math.hypot(dx, dy)
        val dur = now - downT
        if (dur < 340.0 && dist > 42.0) world.gust(if (dx >= 0.0) 1.0 else -1.0)
        else if (mode == 0) {
          if (dist < 15.0) {
            val (wx, wy) = worldPoint(e.clientX.asInstanceOf[Double], e.clientY.asInstanceOf[Double])
            world.tapAt(wx, wy)
          }
        }
        held = 0
        mode = -1
      }
    }
    val onCancel: js.Function1[js.Dynamic, Unit] = (_: js.Dynamic) => { held = 0; mode = -1 }

    val noContext: js.Function1[js.Dynamic, Unit] = (e: js.Dynamic) => e.preventDefault()
    val onResize: js.Function1[js.Dynamic, Unit] = (_: js.Dynamic) => fit()
    val onVisible: js.Function1[js.Dynamic, Unit] = (_: js.Dynamic) => {
      if (doc.visibilityState.asInstanceOf[String] == "visible") sound.resumeIfOn()
    }

    win.addEventListener("pointerdown", onDown)
    win.addEventListener("pointermove", onMove)
    win.addEventListener("pointerup", onUp)
    win.addEventListener("pointercancel", onCancel)
    win.addEventListener("resize", onResize)
    doc.addEventListener("contextmenu", noContext)
    doc.addEventListener("visibilitychange", onVisible)
    doc.addEventListener("gesturestart", noContext)

    val loading = doc.getElementById("loading")
    loading.style.display = "none"

    // ----------------------------------------------------------------- loop
    var last = js.Date.now().asInstanceOf[Double]
    var frameRef: js.Function1[Double, Unit] = null
    val frame: js.Function1[Double, Unit] = (_: Double) => {
      val now = js.Date.now().asInstanceOf[Double]
      var dt = (now - last) / 1000.0
      last = now
      if (dt > 0.08) dt = 0.08
      if (dt < 0.0) dt = 0.0
      if (held == 1 && mode == 0 && now - downT > 430.0) {
        mode = 2
        val (wx, wy) = worldPoint(downX, downY)
        world.longPressAt(wx, wy)
      }
      world.update(dt)
      world.render.draw(ctx)
      js.Dynamic.global.requestAnimationFrame(frameRef)
    }
    frameRef = frame
    js.Dynamic.global.requestAnimationFrame(frame)
  }
}
