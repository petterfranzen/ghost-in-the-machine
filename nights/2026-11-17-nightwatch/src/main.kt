// main.kt — the host. It owns the page: sizing, the frame loop, the sound
// button, the quiet announcements, the remembered state and the small handle
// the smoke check reads.

import kotlin.math.pow
lateinit var canvasEl: CanvasEl
lateinit var ctx: Ctx
lateinit var statusEl: Element
lateinit var soundEl: Element
lateinit var soundLabelEl: Element
lateinit var hintEl: Element
val layers = Layers()
val kit = AudioKit()
var world = World(1)
var viewW: Double = 0.0
var viewH: Double = 0.0
var dpr: Double = 1.0
var lastFrame: Double = 0.0
var hintShown = false
var auroraVoiced = false
var layerSeed = -1
var levelsIn = 0.0
var pendingSound = false

fun seedFromUrl(): Int {
  val search = js("globalThis.location.search") as String
  val hit = Regex("[?&]seed=(\\d+)").find(search)
  return hit?.groupValues?.get(1)?.toIntOrNull() ?: 0
}

fun pickSeed(): Int {
  val fromUrl = seedFromUrl()
  if (fromUrl > 0) return fromUrl
  return ((js("Date.now()") as Double) % 899999.0).toInt() + 1000
}

// The seed is the sky's name: it is written into the URL as soon as it is
// chosen, and again after a reseed, so a sky can be linked to. `replaceState`
// edits the address bar in place and leaves the back button alone.
fun writeSeedToUrl(seed: Int) {
  try {
    val path = js("globalThis.location.pathname") as String
    val query = "?seed=" + seed.toString()
    js("globalThis.history.replaceState(null, '', path + query)")
  } catch (e: Throwable) {
    // A browser that refuses history edits still shows the sky; it just is not linkable.
  }
}

fun restoreNamed() {
  val raw = storeGet("nightwatch.named." + world.seed) ?: return
  raw.split(",").forEach { part ->
    val ci = part.toIntOrNull() ?: return@forEach
    if (world.named.contains(ci)) return@forEach
    if (ci >= 0 && ci < CONSTELLATIONS.size) world.restore(ci)
  }
}

fun setSound(want: Boolean) {
  pendingSound = false
  kit.toggle(want)
  soundEl.setAttribute("aria-pressed", if (want) "true" else "false")
  soundLabelEl.textContent = if (want) "Sound on" else "Sound off"
  storeSet("nightwatch.sound", if (want) "on" else "off")
}

fun sizeToWindow() {
  dpr = devicePixelRatio().coerceIn(1.0, 2.0)
  val r = canvasEl.getBoundingClientRect()
  viewW = r.width
  viewH = r.height
  canvasEl.width = (viewW * dpr).toInt()
  canvasEl.height = (viewH * dpr).toInt()
  ctx = canvasEl.getContext("2d")
  ctx.setTransform(dpr, 0.0, 0.0, dpr, 0.0, 0.0)
  layerSeed = world.seed
  ensureLayers(layers, viewW, viewH, dpr, world.seed)
}

fun announce(text: String) {
  statusEl.textContent = text
}

fun actOnTap(hit: String) {
  if (hit == "dome") announce(if (world.domeOpen) "The slit opens, and the lens turns up to the sky." else "The slit closes over the lens.")
}

fun nameEvent(ci: Int) {
  kit.naming(196.0 * 2.0.pow(ci.toDouble() / 12.0))
  announce("The stars join up: " + CONSTELLATIONS[ci].name + ".")
  saveState()
}

fun playEvent(ev: Ev) {
  when (ev.kind) {
    "chime" -> kit.chime(ev.a, ev.b)
    "double" -> kit.doubleChime(ev.a)
    "mark" -> kit.mark(ev.a)
    "named" -> nameEvent(ev.a.toInt())
    "dome" -> { kit.dome(ev.a > 0.5); actOnTap("dome") }
    "meteor" -> { kit.meteor(); announce("A meteor crosses the sky.") }
    "aurora" -> announce("Ribbons of light rise over the hill.")
    "reseed" -> { saveState(); writeSeedToUrl(world.seed); announce("A fresh sky, and the dome re-aims.") }
    else -> Unit
  }
}

fun saveState() {
  storeSet("nightwatch.named." + world.seed, world.named.joinToString(","))
}

fun drainEvents() {
  world.drain().forEach { ev -> playEvent(ev) }
  val wantVoice = world.aurora > 0.45
  if (wantVoice != auroraVoiced) {
    auroraVoiced = wantVoice
    kit.auroraVoice(wantVoice)
  }
}

fun breathe(dt: Double) {
  levelsIn += dt
  if (levelsIn > 1.5) {
    levelsIn = 0.0
    kit.setLevels(world.domeGlow, world.aurora)
  }
  val wantHint = world.idle > 26.0
  if (wantHint != hintShown) {
    hintShown = wantHint
    setStyle(hintEl, "opacity", if (wantHint) "1" else "0")
  }
}

fun frame(stamp: Double) {
  val dt = if (lastFrame == 0.0) 0.016 else ((stamp - lastFrame) / 1000.0).coerceIn(0.002, 0.05)
  lastFrame = stamp
  val view = currentView()
  world.update(view, dt)
  if (world.seed != layerSeed) {
    layerSeed = world.seed
    ensureLayers(layers, viewW, viewH, dpr, world.seed)
  }
  drawScene(ctx, layers, world, view)
  drainEvents()
  breathe(dt)
  requestAnimationFrame { next -> frame(next) }
}

fun boot() {
  canvasEl = canvasById("sky")
  statusEl = byId("status")
  soundEl = byId("sound")
  soundLabelEl = byId("soundlabel")
  hintEl = byId("hint")
  world = World(pickSeed())
  world.motion = if (isReducedMotion()) 0.35 else 1.0
  writeSeedToUrl(world.seed)
  restoreNamed()
  pendingSound = storeGet("nightwatch.sound") == "on"
  sizeToWindow()
  onOwned(canvasEl, "pointerdown") { ev -> onDown(ev) }
  onOwned(canvasEl, "pointermove") { ev -> onMove(ev) }
  onOwned(canvasEl, "pointerup") { ev -> onUp(ev) }
  onOwned(canvasEl, "pointercancel") { ev -> onUp(ev) }
  onOwned(canvasEl, "contextmenu") { }
  onKeyed(canvasEl) { ev -> onKey(ev) }
  onOwned(soundEl, "click") { ev -> setSound(soundEl.getAttribute("aria-pressed") != "true") }
  onPlain(js("globalThis"), "resize") { sizeToWindow() }
  onPlain(js("globalThis"), "orientationchange") { sizeToWindow() }
  onPlain(js("globalThis.document"), "visibilitychange") { kit.resume() }
  expose()
  requestAnimationFrame { stamp -> frame(stamp) }
}

fun summary(): String = listOf(
  "pan=" + (world.pan * 1000.0).toInt(),
  "tilt=" + (world.tilt * 1000.0).toInt(),
  "stars=" + world.stars.size,
  "marks=" + world.marks.size,
  "named=" + world.named.size,
  "names=" + world.namedNames().joinToString(",").replace(" ", "_"),
  "glints=" + world.glints.size,
  "meteors=" + world.meteors.size,
  "meteorsSeen=" + world.meteorsSeen,
  "aurora=" + (world.aurora * 100.0).toInt(),
  "dome=" + (world.domeGlow * 100.0).toInt(),
  "open=" + (if (world.domeOpen) 1 else 0),
  "idle=" + world.idle.toInt(),
  "motion=" + (world.motion * 100.0).toInt(),
  "seed=" + world.seed,
  "gestures=" + gestures,
  "sound=" + (if (kit.on) 1 else 0),
  "ctx=" + kit.state,
  "voices=" + kit.voices,
  "level=" + (kit.level() * 1000.0).toInt(),
  "size=" + viewW.toInt() + "x" + viewH.toInt()
).joinToString(" ")

fun expose() {
  val read = { summary() }
  val sound = { want: Boolean -> setSound(want) }
  val test = { world.selfTest() }
  val reseed = { s: Int -> world.reseed(s) }
  val starPos = { i: Int -> starPosForTest(i) }
  val lookAt = { lon: Double -> lookAtForTest(lon) }
  js("globalThis.Nightwatch = { read: read, sound: sound, selfTest: test, seed: reseed, starPos: starPos, lookAt: lookAt, ready: true }")
}

fun main() {
  boot()
}
