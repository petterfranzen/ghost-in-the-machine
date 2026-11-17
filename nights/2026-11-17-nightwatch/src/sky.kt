// sky.kt — the seeded sky itself: the random source, the star record, the
// constellation table, the sky builder and the camera that maps sky to page.
// Nothing here knows about the DOM, the clock or the audio.

const val TAU = 6.283185307179586
const val STAR_TOTAL = 172
const val VIEW_LON = 0.5

// A cheap xorshift, so a seed names a sky and two visits with the same seed
// (or the same page load) build exactly the same stars.
class Rng(seed: Int) {
  private var s: Int = if (seed == 0) 8191 else seed

  fun next(): Int {
    var x = s
    x = x xor (x shl 13)
    x = x xor (x ushr 17)
    x = x xor (x shl 5)
    s = x
    return x
  }

  fun unit(): Double = (next() ushr 8).toDouble() / 16777216.0
  fun range(a: Double, b: Double): Double = a + (b - a) * unit()
  fun below(n: Int): Int = (unit() * n).toInt().coerceIn(0, n - 1)
}

class Star(val lon: Double, val alt: Double, val mag: Double, val hue: Int, val phase: Double, val speed: Double, val con: Int)

class ConSpec(val name: String, val pts: List<Pair<Double, Double>>, val edges: List<Pair<Int, Int>>)

val CONSTELLATIONS: List<ConSpec> = listOf(
  ConSpec(
    "the Heron",
    listOf(0.10 to 0.50, 0.121 to 0.523, 0.141 to 0.532, 0.156 to 0.585,
      0.127 to 0.424, 0.147 to 0.441, 0.132 to 0.566),
    listOf(0 to 1, 1 to 2, 2 to 3, 1 to 6, 0 to 4, 2 to 5)
  ),
  ConSpec(
    "the Kettle",
    listOf(0.32 to 0.30, 0.36 to 0.281, 0.40 to 0.311, 0.391 to 0.363,
      0.331 to 0.352, 0.356 to 0.425),
    listOf(0 to 1, 1 to 2, 2 to 3, 3 to 4, 4 to 0, 1 to 5)
  ),
  ConSpec(
    "the Lantern",
    listOf(0.55 to 0.621, 0.575 to 0.598, 0.601 to 0.622, 0.586 to 0.663,
      0.569 to 0.681),
    listOf(0 to 1, 1 to 2, 2 to 3, 3 to 4, 4 to 1)
  ),
  ConSpec(
    "Sleeping Fox",
    listOf(0.723 to 0.262, 0.752 to 0.301, 0.789 to 0.312, 0.821 to 0.291,
      0.806 to 0.341, 0.702 to 0.243, 0.741 to 0.221, 0.801 to 0.218),
    listOf(0 to 1, 1 to 2, 2 to 3, 2 to 4, 0 to 5, 5 to 6, 6 to 1, 2 to 7)
  ),
  ConSpec(
    "the Spindle",
    listOf(0.901 to 0.552, 0.915 to 0.498, 0.931 to 0.449, 0.943 to 0.381),
    listOf(0 to 1, 1 to 2, 2 to 3, 0 to 2)
  )
)

fun wrapDelta(a: Double, b: Double): Double {
  var d = a - b
  d -= kotlin.math.floor(d + 0.5)
  return d
}

fun constellationStars(seed: Int): List<Star> {
  val rng = Rng(seed xor 0x5A17)
  val out = ArrayList<Star>()
  CONSTELLATIONS.forEachIndexed { index, spec ->
    spec.pts.forEach { p ->
      out.add(Star(p.first, p.second, 1.0, index % 4, rng.unit() * TAU, rng.range(0.6, 1.0), index))
    }
  }
  return out
}

fun randomStar(rng: Rng): Star {
  val bright = rng.unit() < 0.07
  val mag = if (bright) rng.range(0.78, 1.0) else rng.range(0.22, 0.7)
  return Star(rng.unit(), rng.range(0.02, 0.9), mag, rng.below(4), rng.unit() * TAU, rng.range(0.45, 1.3), -1)
}

fun crowded(sky: List<Star>, s: Star): Boolean = sky.any {
  kotlin.math.abs(wrapDelta(it.lon, s.lon)) < 0.016 && kotlin.math.abs(it.alt - s.alt) < 0.026
}

fun buildSky(seed: Int): List<Star> {
  val rng = Rng(seed * 2654435761.toInt() + 11)
  val sky = ArrayList<Star>(STAR_TOTAL)
  sky.addAll(constellationStars(seed))
  var guard = 0
  while (sky.size < STAR_TOTAL && guard < STAR_TOTAL * 40) {
    guard += 1
    val s = randomStar(rng)
    if (!crowded(sky, s)) sky.add(s)
  }
  return sky
}

// The camera: where the visitor is looking, and how a star maps to the page.
class View(val w: Double, val h: Double, val pan: Double, val tilt: Double) {
  val hy: Double = h * 0.88
  val spanY: Double = h * 0.62

  fun x(lon: Double): Double = (wrapDelta(lon, pan) / VIEW_LON + 0.5) * w
  fun y(alt: Double): Double = hy - (alt - tilt) * spanY
  fun lonAt(nx: Double): Double = pan + (nx - 0.5) * VIEW_LON
  fun altAt(ny: Double): Double = tilt + (hy - ny * h) / spanY
  fun scale(): Double = kotlin.math.max(h, w) / 720.0
}

class Glint(val lon: Double, val alt: Double, var life: Double, val max: Double, val bright: Double, val big: Boolean)
class Naming(val ci: Int, var life: Double, val max: Double)
class Meteor(var lon: Double, var alt: Double, val vx: Double, val vy: Double, var life: Double)
class Ev(val kind: String, val a: Double, val b: Double)
