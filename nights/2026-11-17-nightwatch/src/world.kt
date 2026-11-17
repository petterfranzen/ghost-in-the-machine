// world.kt — the state machine behind the visitor's gestures: how the sky
// moves, what a tap or a held press does to it, and what the night does on
// its own while nobody is touching anything.

import kotlin.math.pow
class World(seed0: Int) {
  var seed: Int = seed0
  var stars: List<Star> = buildSky(seed)
  val marks = HashSet<Int>()
  val named = LinkedHashSet<Int>()
  val glints = ArrayList<Glint>()
  val namings = ArrayList<Naming>()
  val meteors = ArrayList<Meteor>()
  val events = ArrayList<Ev>()
  var pan: Double = 0.36
  var panTotal: Double = 0.0
  var tilt: Double = 0.16
  var panVel: Double = 0.0
  var tiltVel: Double = 0.0
  var time: Double = 0.0
  var idle: Double = 0.0
  var motion: Double = 1.0
  var domeOpen: Boolean = false
  var domeGlow: Double = 0.0
  var aurora: Double = 0.0
  var meteorsSeen: Int = 0
  var holdT: Double = 0.0
  var holding: Boolean = false
  var holdNx: Double = -1.0
  var holdNy: Double = -1.0
  private var rng = Rng(seed * 40503 + 977)
  private var meteorIn: Double = 7.0
  private var auroraOn: Boolean = false
  private var lastTapStar: Int = -1
  private var lastTapAt: Double = -9.0
  private var lastNudgeAt: Double = -9.0

  fun conRange(ci: Int): IntRange {
    var start = 0
    CONSTELLATIONS.forEachIndexed { i, spec -> if (i < ci) start += spec.pts.size }
    val n = CONSTELLATIONS[ci].pts.size
    return start until (start + n)
  }

  fun constellationComplete(ci: Int): Boolean = conRange(ci).all { marks.contains(it) }

  fun namedNames(): List<String> = named.map { CONSTELLATIONS[it].name }

  fun gesture(): Unit { idle = 0.0 }

  fun holdStart(nx: Double, ny: Double) {
    gesture()
    holding = true
    holdT = 0.0
    holdNx = nx
    holdNy = ny
  }

  fun holdEnd(view: View) {
    if (!holding) return
    val wasHeld = holdT >= 0.8
    holding = false
    holdT = 0.0
    if (wasHeld) fireHold(view)
  }

  fun pitchOf(i: Int): Double {
    val steps = doubleArrayOf(0.0, 2.0, 4.0, 7.0, 9.0)
    val semis = steps[i % 5] + 12.0 * ((i / 5) % 3) + stars[i].hue.toDouble()
    return 196.0 * 2.0.pow(semis / 12.0)
  }

  fun starScreen(view: View, i: Int): Pair<Double, Double> = Pair(view.x(stars[i].lon), view.y(stars[i].alt))

  fun nearestStar(view: View, nx: Double, ny: Double, radius: Double): Int {
    var best = -1
    var bestD = radius * radius
    stars.forEachIndexed { i, s ->
      val dx = view.x(s.lon) - nx * view.w
      val dy = view.y(s.alt) - ny * view.h
      val d = dx * dx + dy * dy
      if (d < bestD) { bestD = d; best = i }
    }
    return best
  }

  // The tower and its dome, not the whole hill: a narrow box keeps the
  // observatory from swallowing the stars that pass close to it.
  private fun domeHit(view: View, nx: Double, ny: Double): Boolean {
    val dx = nx * view.w - view.w * 0.28
    val dy = ny * view.h - (view.hy - view.h * 0.055)
    return kotlin.math.abs(dx) < 22.0 * view.scale() && kotlin.math.abs(dy) < 34.0 * view.scale()
  }

  private fun starOrDome(view: View, nx: Double, ny: Double): String =
    if (domeHit(view, nx, ny)) "dome" else "star"

  fun tapAt(view: View, nx: Double, ny: Double): String {
    gesture()
    if (starOrDome(view, nx, ny) == "dome") {
      toggleDome()
      return "dome"
    }
    val i = nearestStar(view, nx, ny, 30.0 * view.scale())
    if (i < 0) return "sky"
    chimeAt(i)
    return "star"
  }

  private fun toggleDome() {
    domeOpen = !domeOpen
    events.add(Ev("dome", if (domeOpen) 1.0 else 0.0, 0.0))
  }

  // A tap on a star glints and sounds; the same star again within 1.3 s rings
  // as a double.
  private fun chimeAt(i: Int) {
    val s = stars[i]
    val twice = i == lastTapStar && time - lastTapAt < 1.3
    lastTapStar = i
    lastTapAt = time
    glints.add(Glint(s.lon, s.alt, if (twice) 1.5 else 0.85, if (twice) 1.5 else 0.85, if (twice) 1.0 else 0.72, twice))
    events.add(Ev(if (twice) "double" else "chime", pitchOf(i), s.mag))
  }

  fun dragBy(view: View, dx: Double, dy: Double) {
    gesture()
    pan -= dx / view.w * VIEW_LON
    panTotal -= dx / view.w * VIEW_LON
    tilt = (tilt + dy / view.h * 0.45).coerceIn(0.0, 0.95)
  }

  fun flickBy(view: View, dx: Double, dy: Double) {
    gesture()
    panVel = -dx / view.w * VIEW_LON * 0.9
    tiltVel = dy / view.h * 0.35
  }

  fun nudgeAt(view: View, nx: Double, ny: Double) {
    gesture()
    val i = nearestStar(view, nx, ny, 30.0 * view.scale())
    if (i < 0) return
    marks.add(i)
    events.add(Ev("mark", pitchOf(i), stars[i].mag))
    lastNudgeAt = time
    checkNaming()
  }

  fun checkNaming() {
    CONSTELLATIONS.indices.forEach { ci ->
      if (!named.contains(ci) && constellationComplete(ci)) {
        named.add(ci)
        namings.add(Naming(ci, 4.2, 4.2))
        events.add(Ev("named", ci.toDouble(), 0.0))
      }
    }
  }

  fun update(view: View, dt: Double) {
    time += dt
    idle += dt
    integrateCamera(dt)
    advanceHold(view, dt)
    advanceGlints(dt)
    advanceMeteors(dt)
    advanceWeather(dt)
  }

  private fun integrateCamera(dt: Double) {
    pan += panVel * dt
    panTotal += panVel * dt
    tilt = (tilt + tiltVel * dt).coerceIn(0.0, 0.95)
    val damp = 0.12.pow(dt * (0.4 + 0.6 * motion))
    panVel *= damp
    tiltVel *= damp
    if (kotlin.math.abs(panVel) < 0.0015) panVel = 0.0
    if (kotlin.math.abs(tiltVel) < 0.0015) tiltVel = 0.0
    pan -= kotlin.math.floor(pan)
  }

  private fun advanceHold(view: View, dt: Double) {
    holdT = if (holding) holdT + dt * (0.55 + 0.45 * motion) else 0.0
    if (!holding || holdT < 0.8) return
    holding = false
    holdT = 0.0
    fireHold(view)
  }

  private fun fireHold(view: View) {
    if (starOrDome(view, holdNx, holdNy) == "dome") reseed((rng.unit() * 899999.0).toInt() + 1000) else nudgeAt(view, holdNx, holdNy)
  }

  private fun advanceGlints(dt: Double) {
    val life = dt * (0.7 + 0.3 * motion)
    glints.forEach { it.life -= life }
    glints.removeAll { it.life <= 0.0 }
    namings.forEach { it.life -= dt * (0.55 + 0.45 * motion) }
    namings.removeAll { it.life <= 0.0 }
  }

  private fun advanceMeteors(dt: Double) {
    meteors.forEach {
      it.lon += it.vx * dt
      it.alt += it.vy * dt
      it.life -= dt
    }
    meteors.removeAll { it.life <= 0.0 }
    meteorIn -= dt
    if (idle < 6.0 || meteorIn > 0.0) return
    meteors.add(makeMeteor())
    meteorIn = rng.range(6.0, 13.0)
  }

  private fun makeMeteor(): Meteor {
    val left = rng.unit() < 0.5
    val lon = pan + rng.range(-0.16, 0.16)
    val vx = (if (left) 0.045 else -0.045) * rng.range(0.8, 1.2)
    val m = Meteor(lon, rng.range(0.62, 0.84), vx, -0.028, 1.9)
    meteorsSeen += 1
    events.add(Ev("meteor", 0.0, 0.0))
    return m
  }

  private fun advanceWeather(dt: Double) {
    val target = if (domeOpen) 1.0 else 0.0
    val step = dt * (0.35 + 0.65 * motion) * 1.6
    domeGlow += (target - domeGlow).coerceIn(-step, step)
    val wants = named.size >= 3 && idle > 12.0
    val drift = dt * (0.03 + 0.05 * motion)
    aurora = if (wants) (aurora + drift).coerceAtMost(1.0) else (aurora - drift * 1.4).coerceAtLeast(0.0)
    if (!auroraOn && aurora > 0.45) {
      auroraOn = true
      events.add(Ev("aurora", 0.0, 0.0))
    }
    if (auroraOn && aurora < 0.05) auroraOn = false
  }

  fun restore(ci: Int) {
    conRange(ci).forEach { marks.add(it) }
    named.add(ci)
  }

  fun reseed(newSeed: Int) {
    seed = newSeed
    stars = buildSky(newSeed)
    rng = Rng(newSeed * 40503 + 977)
    marks.clear()
    named.clear()
    namings.clear()
    glints.clear()
    meteors.clear()
    holding = false
    holdT = 0.0
    lastTapStar = -1
    events.add(Ev("reseed", 0.0, 0.0))
  }

  fun drain(): List<Ev> {
    val out = ArrayList<Ev>(events)
    events.clear()
    return out
  }

  fun signature(): String = stars.joinToString("|") {
    (it.lon * 10000).toInt().toString() + "," + (it.alt * 10000).toInt()
  }

  fun markConstellation(ci: Int) {
    conRange(ci).forEach { marks.add(it) }
    checkNaming()
  }

  fun selfTest(): String {
    val fails = ArrayList<String>()
    checkStars(fails)
    checkSeeding(fails)
    checkConstellations(fails)
    checkPan(fails)
    checkMeteors(fails)
    if (fails.isEmpty()) return "ok: " + stars.size + " stars, " + CONSTELLATIONS.size + " constellations, seeded and repeatable"
    return "FAIL: " + fails.joinToString("; ")
  }

  // One guard per edge, so the range test stays plain.
  private fun starOnScreen(s: Star): Boolean {
    if (s.lon < 0.0) return false
    if (s.lon >= 1.0) return false
    if (s.alt < 0.0) return false
    if (s.alt > 1.0) return false
    return true
  }

  private fun checkStars(fails: MutableList<String>) {
    if (stars.size != STAR_TOTAL) fails.add("star count " + stars.size)
    if (!stars.all { starOnScreen(it) }) fails.add("star out of range")
  }

  private fun checkSeeding(fails: MutableList<String>) {
    val a = World(7)
    val b = World(7)
    val c = World(8)
    if (a.signature() != b.signature()) fails.add("seed 7 is not repeatable")
    if (a.signature() == c.signature()) fails.add("seeds 7 and 8 give the same sky")
  }

  private fun checkConstellations(fails: MutableList<String>) {
    val a = World(7)
    val spec = CONSTELLATIONS[0]
    val range = a.conRange(0)
    if (range.count() != spec.pts.size) fails.add("constellation 0 range")
    if (range.any { kotlin.math.abs(a.stars[it].lon - spec.pts[it - range.first].first) > 0.0001 }) fails.add("constellation 0 is not where the table says")
    a.markConstellation(0)
    if (a.named.count() != 1 || !a.named.contains(0)) fails.add("marking a constellation did not name it")
    a.markConstellation(0)
    if (a.named.count() != 1) fails.add("naming happened twice")
  }

  private fun checkPan(fails: MutableList<String>) {
    val a = World(7)
    a.pan = 0.995
    a.dragBy(View(390.0, 844.0, a.pan, a.tilt), 6.0, 0.0)
    if (a.pan < 0.0 || a.pan >= 1.0) fails.add("pan did not wrap")
  }

  private fun checkMeteors(fails: MutableList<String>) {
    val d = World(9)
    d.idle = 40.0
    repeat(180) { d.update(View(390.0, 844.0, d.pan, d.tilt), 0.05) }
    if (d.meteors.isEmpty() && d.drain().none { it.kind == "meteor" }) fails.add("no meteor in 9 s of stillness")
  }
}
