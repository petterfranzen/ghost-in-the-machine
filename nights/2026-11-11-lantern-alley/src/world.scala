import scala.scalajs.js

/** A lantern: it warms when tapped, dims slowly on its own (faster in the rain),
  * and can be tended with a long press to give it a steadier, tinted flame.
  */
class Lantern(val x: Double, val y: Double) {
  var warm = 0.0
  var steady = false
  var hue = 0.0        // -1 cool blue .. 0 honey .. +1 deep amber
  var sway = 0.0
  var swayV = 0.0
  var flick = 0.0
}

class Coin(val x: Double, val y: Double) {
  var found = false
  var bob = 0.0
}

/** kind 0 spark, 1 leaf, 2 drip, 3 ring, 4 print, 5 mote */
class P(var x: Double, var y: Double, var vx: Double, var vy: Double,
        var life: Double, var max: Double, var kind: Int, var size: Double)

class World(val sound: Sound) {
  import Sprites._

  val W = 112
  val H = 900
  val VIEW_W = 112
  val VIEW_H = 300

  private val rng = new java.util.Random(11L)

  // --- the alley -----------------------------------------------------------
  val lanterns = Array(
    new Lantern(36.0, 220.0), new Lantern(76.0, 300.0), new Lantern(36.0, 400.0),
    new Lantern(76.0, 490.0), new Lantern(36.0, 590.0), new Lantern(76.0, 680.0),
    new Lantern(28.0, 104.0))
  val coins = Array(
    new Coin(44.0, 380.0), new Coin(70.0, 660.0), new Coin(40.0, 110.0))
  val windowX = 28.0
  val windowY = 270.0
  val doorX = 85.0
  val doorY = 513.0
  val wellX = 62.0
  val wellY = 130.0
  val puddleX = 60.0
  val puddleY = 560.0
  val catSitX = 66.0
  val catSitY = 236.0

  var lanternTended = 0

  // --- the walker ----------------------------------------------------------
  var wx = 56.0
  var wy = 790.0
  var tx = 56.0
  var ty = 790.0
  var facing = 0
  var walking = false
  var animT = 0.0
  var stepT = 0.0
  var bobT = 0.0
  var splashCool = 0.0
  var camY = 610.0
  var camTarget = 610.0

  // --- weather, time, mood -------------------------------------------------
  var time = 0.0
  var rain = 0.0
  var rainHold = 0.0
  var wet = 0.0
  var pulse = 0.0
  var warmth = 0.0
  var idleT = 0.0
  var inputT = 0.0
  var coinsFound = 0
  var revealT = -1.0
  var windowLit = 0.0
  var windowT = 0.0
  var knocks = 0
  var doorLight = 0.0
  var doorT = 0.0
  var hissCool = 0.0
  var chordPlayed = false
  var particles = new scala.collection.mutable.ArrayBuffer[P]()

  // --- the cat -------------------------------------------------------------
  var catMode = 0      // 0 away, 1 padding in, 2 sitting, 3 following, 4 leaving
  var cx = -20.0
  var cy = 236.0
  var ctarget = -20.0
  var cdir = 1
  var cT = 0.0
  var pets = 0
  var catCooldown = 0.0

  // --- the fox (rare) ------------------------------------------------------
  var foxMode = 0      // 0 away, 1 crossing, 2 pausing, 3 leaving
  var fx = -30.0
  var fy = 0.0
  var foxT = 0.0
  var foxCooldown = 120.0

  // --- the hidden courtyard light -----------------------------------------
  var ghostY = 0.0
  var ghostA = 0.0
  var lastDir = 3

  val render = new Render(this)

  // ------------------------------------------------------------------ input

  /** nearest lantern within reach of a point */
  def lanternAt(x: Double, y: Double, r: Double): Int = {
    var best = -1
    var bd = r * r
    var i = 0
    while (i < lanterns.length) {
      val l = lanterns(i)
      val dx = l.x - x
      val dy = l.y - y
      val d = dx * dx + dy * dy
      if (d < bd) { bd = d; best = i }
      i += 1
    }
    best
  }

  def tapAt(x: Double, y: Double): Unit = {
    inputT = 0.0
    val li = lanternAt(x, y, 13.0)
    if (li >= 0) { warmLantern(li); return }
    if (catMode == 2 && math.abs(cx - x) < 9 && math.abs(cy - y) < 8) { petCat(); return }
    if (math.hypot(x - wellX, y - wellY) < 15) { sound.ripple(); ring(wellX, wellY - 4, 0.9); return }
    if (math.hypot(x - windowX, y - windowY) < 15) { lightTheWindow(); return }
    if (math.hypot(x - doorX, y - doorY) < 16) { knockOnTheDoor(); return }
    // otherwise: walk there
    tx = clampX(x, y)
    ty = math.max(58.0, math.min(846.0, y))
    lastDir = if (ty < wy - 2) 0 else if (ty > wy + 2) 1 else lastDir
  }

  /** behind the barred window someone is home, for a little while */
  private def lightTheWindow(): Unit = {
    windowT = 26.0 + rng.nextDouble() * 10.0
    sound.insideRoom()
    pulse = math.min(1.0, pulse + 0.35)
    var k = 0
    while (k < 6) {
      particles += new P(windowX + (rng.nextDouble() * 2 - 1) * 3, windowY + 2,
        (rng.nextDouble() * 2 - 1) * 2, -2 - rng.nextDouble() * 3, 2.0, 2.0, 6, 1.0)
      k += 1
    }
  }

  /** three knocks, and something answers */
  private def knockOnTheDoor(): Unit = {
    sound.knock()
    knocks += 1
    if (knocks >= 3) {
      knocks = 0
      doorT = 60.0
      sound.answered()
      var k = 0
      while (k < 10) {
        particles += new P(doorX + (rng.nextDouble() * 2 - 1) * 8, 528.0,
          (rng.nextDouble() * 2 - 1) * 3, -1.5 - rng.nextDouble() * 2.0, 3.0, 3.0, 6, 1.0)
        k += 1
      }
    }
  }

  def longPressAt(x: Double, y: Double): Unit = {
    inputT = 0.0
    val li = lanternAt(x, y, 15.0)
    if (li >= 0) { tendLantern(li); return }
    if (catMode == 2 && math.abs(cx - x) < 10) { petCat(); return }
    val ci = coinAt(x, y, 12.0)
    if (ci >= 0) { sound.ripple(); ring(coins(ci).x, coins(ci).y, 0.7) }
  }

  def dragTo(x: Double, y: Double): Unit = {
    inputT = 0.0
    tx = clampX(x, y)
    ty = math.max(58.0, math.min(846.0, y))
    lastDir = if (ty < wy - 2) 0 else if (ty > wy + 2) 1 else lastDir
  }

  def gust(dirX: Double): Unit = {
    inputT = 0.0
    sound.gust()
    wet += 0.95
    var i = 0
    while (i < lanterns.length) {
      lanterns(i).swayV += (rng.nextDouble() * 2.0 - 1.0) * 2.4
      i += 1
    }
    i = 0
    while (i < 7) {
      particles += new P(wx + (rng.nextDouble() * 2 - 1) * 30, wy + (rng.nextDouble() * 2 - 1) * 40,
        dirX * (14 + rng.nextDouble() * 10), -8 - rng.nextDouble() * 10,
        3.4 + rng.nextDouble() * 1.6, 5.0, 1, 1.0)
      i += 1
    }
    if (rainHold <= 0.0 && wet >= 1.7) { rainHold = 70.0 + rng.nextDouble() * 40.0; wet = 0.0 }
  }

  private def coinAt(x: Double, y: Double, r: Double): Int = {
    var best = -1
    var bd = r * r
    var i = 0
    while (i < coins.length) {
      if (!coins(i).found) {
        val dx = coins(i).x - x
        val dy = coins(i).y - y
        if (dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; best = i }
      }
      i += 1
    }
    best
  }

  // --------------------------------------------------------------- lanterns

  def warmLantern(i: Int): Unit = {
    val l = lanterns(i)
    l.warm = math.min(1.0, l.warm + 0.45)
    l.flick = 1.0
    sound.warm()
    pulse = math.min(1.0, pulse + 0.75)
    var k = 0
    while (k < 10) {
      particles += new P(l.x + (rng.nextDouble() * 2 - 1) * 3, l.y + 1 + rng.nextDouble() * 3,
        (rng.nextDouble() * 2 - 1) * 4, 3 + rng.nextDouble() * 7, 1.1 + rng.nextDouble() * 0.9, 2.0, 0, 1.0)
      k += 1
    }
  }

  def tendLantern(i: Int): Unit = {
    val l = lanterns(i)
    l.warm = math.min(1.0, l.warm + 0.75)
    l.flick = 1.0
    if (!l.steady) { l.steady = true; lanternTended += 1 }
    l.hue = if (l.hue > 0.4) -0.6 else l.hue + 0.7
    sound.tend()
    pulse = math.min(1.0, pulse + 0.9)
    var k = 0
    while (k < 20) {
      particles += new P(l.x + (rng.nextDouble() * 2 - 1) * 4, l.y + 2,
        (rng.nextDouble() * 2 - 1) * 5, -4 - rng.nextDouble() * 12, 1.6 + rng.nextDouble() * 1.4, 3.0, 0, 1.0)
      k += 1
    }
    if (lanternTended >= lanterns.length && !chordPlayed) { chordPlayed = true; sound.reveal(); pulse = 1.0 }
  }

  private def petCat(): Unit = {
    pets += 1
    sound.purr()
    catMode = 2
    catCooldown = 150.0
    cT = 0.0
    var k = 0
    while (k < 8) {
      particles += new P(cx + (rng.nextDouble() * 2 - 1) * 5, cy - 8,
        (rng.nextDouble() * 2 - 1) * 3, -6 - rng.nextDouble() * 4, 2.0, 2.0, 5, 1.0)
      k += 1
    }
  }

  private def ring(x: Double, y: Double, size: Double): Unit =
    particles += new P(x, y, 0.0, 0.0, 1.6, 1.6, 3, size)

  /** how lit a spot is: 0 unlit, 1 right under a warm lantern */
  def lightAt(x: Double, y: Double): Double = {
    var a = 0.0
    var i = 0
    while (i < lanterns.length) {
      val l = lanterns(i)
      val d = math.hypot(l.x - x, l.y - y)
      val r = 32.0 + 18.0 * l.warm
      if (d < r) a = math.max(a, l.warm * (1.0 - d / r))
      i += 1
    }
    val dw = math.hypot(wx - x, wy - y)
    if (dw < 26.0) a = math.max(a, 0.45 * (1.0 - dw / 26.0))
    if (revealT >= 0.0) a = math.max(a, 0.6)
    a
  }

  private def clampX(x: Double, y: Double): Double = {
    val (lo, hi) = if (y < 172.0) (8.0, 104.0) else (35.0, 77.0)
    math.max(lo, math.min(hi, x))
  }
  private def inCorridor(x: Double): Boolean = x >= 36.5 && x <= 75.5

  // ---------------------------------------------------------------- update

  def update(dt: Double): Unit = {
    time += dt
    inputT += dt
    idleT += dt
    if (inputT <= dt + 0.001) idleT = 0.0
    pulse = math.max(0.0, pulse - dt * 1.4)
    splashCool = math.max(0.0, splashCool - dt)
    catCooldown = math.max(0.0, catCooldown - dt)
    foxCooldown = math.max(0.0, foxCooldown - dt)

    camTarget = math.max(0.0, math.min(H - VIEW_H, wy - VIEW_H * 0.60))
    camY += (camTarget - camY) * math.min(1.0, dt * 3.0)
    walk(dt)
    weather(dt)
    lanternStep(dt)
    coinsStep(dt)
    windowStep(dt)
    catStep(dt)
    foxStep(dt)
    revealStep(dt)
    particlesStep(dt)
    sound.sync(warmth, rain, dt)
  }

  private def walk(dt: Double): Unit = {
    val dx = tx - wx
    val dy = ty - wy
    val d = math.hypot(dx, dy)
    if (d > 1.2) {
      val sp = 26.0
      val ux = dx / d
      val uy = dy / d
      var nyt = wy + uy * sp * dt
      if (nyt > 846.0) nyt = 846.0
      if (nyt < 58.0) nyt = 58.0
      if (wy < 172.0 && nyt >= 172.0 && !inCorridor(wx)) nyt = wy
      wy = nyt
      wx = clampX(wx + ux * sp * dt, wy)
      if (math.abs(ux) > math.abs(uy)) facing = if (ux > 0) 3 else 2
      else facing = if (uy > 0) 1 else 0
      lastDir = facing
      walking = true
      animT += dt * 7.0
      bobT += dt * 7.0
      stepT -= dt
      if (stepT <= 0.0) {
        stepT = 0.40
        sound.step()
        val fpx = if (facing == 2 || facing == 3) wx + (if (facing == 2) 4 else -4) else wx
        particles += new P(fpx, wy + 1, 0.0, 0.0, 7.0, 7.0, 4, 1.0)
        if (facing == 0 || facing == 1)
          particles += new P(wx + (rng.nextDouble() * 2 - 1) * 2, wy + (if (facing == 0) -1 else 2), 0, 0, 7.0, 7.0, 4, 1.0)
      }
      val pd = math.hypot(wx - puddleX, wy - puddleY)
      if (pd < 17.0 && splashCool <= 0.0) {
        splashCool = 1.6
        sound.ripple()
        ring(puddleX + (rng.nextDouble() * 2 - 1) * 8, puddleY, 0.5)
      }
    } else walking = false
  }

  private def weather(dt: Double): Unit = {
    if (rainHold > 0.0) { rainHold -= dt; wet = 0.0 } else wet = math.max(0.0, wet - dt * 0.06)
    val want = if (rainHold > 0.0) 1.0 else 0.0
    rain = rain + (want - rain) * math.min(1.0, dt * 0.22)
    if (rain > 0.25 && rng.nextDouble() < dt * 6.0 * rain) {
      particles += new P(puddleX + (rng.nextDouble() * 2 - 1) * 14, puddleY + (rng.nextDouble() * 2 - 1) * 4,
        0, 0, 1.3, 1.3, 3, 0.35)
    }
    var i = 0
    while (i < particles.length) {
      val p = particles(i)
      if (p.kind == 2 && p.life <= 0.0) particles.remove(i) else i += 1
    }
  }

  private def lanternStep(dt: Double): Unit = {
    var sum = 0.0
    var i = 0
    while (i < lanterns.length) {
      val l = lanterns(i)
      val decay = (if (l.steady) 0.0026 else 0.0065) * (1.0 + rain * 1.6)
      l.warm = math.max(0.0, l.warm - dt * decay)
      if (l.warm < 0.03) { l.steady = false; l.hue = 0.0 }
      l.swayV += (-l.sway * 9.0 - l.swayV * 1.6) * dt
      l.sway += l.swayV * dt
      l.flick = math.max(0.0, l.flick - dt * 1.6)
      sum += l.warm
      i += 1
    }
    warmth = sum / lanterns.length
    var g = 0
    while (g < lanterns.length) {
      val l = lanterns(g)
      if (l.warm > 0.45 && rng.nextDouble() < dt * 0.6 * l.warm) {
        particles += new P(l.x + (rng.nextDouble() * 2 - 1) * 4, l.y + 3,
          (rng.nextDouble() * 2 - 1) * 1.2, -1.4 - rng.nextDouble(), 3.0, 3.0, 5, 1.0)
      }
      g += 1
    }
  }

  private def coinsStep(dt: Double): Unit = {
    var i = 0
    while (i < coins.length) {
      val c = coins(i)
      if (!c.found) {
        c.bob += dt
        val lit = lightAt(c.x, c.y)
        if (lit > 0.14 && math.hypot(c.x - wx, c.y - wy) < 10.5) {
          c.found = true
          coinsFound += 1
          sound.coin(coinsFound - 1)
          pulse = math.min(1.0, pulse + 0.6)
          var k = 0
          while (k < 16) {
            particles += new P(c.x, c.y, (rng.nextDouble() * 2 - 1) * 7, -5 - rng.nextDouble() * 9,
              1.4, 1.4, 0, 1.0)
            k += 1
          }
          if (coinsFound >= 3) { revealT = 0.0; sound.reveal() }
        }
      }
      i += 1
    }
  }

  private def windowStep(dt: Double): Unit = {
    if (windowT > 0.0) { windowT -= dt; windowLit = math.min(1.0, windowLit + dt * 0.8) }
    else windowLit = math.max(0.0, windowLit - dt * 0.12)
    if (doorT > 0.0) { doorT -= dt; doorLight = math.min(1.0, doorLight + dt * 0.5) }
    else doorLight = math.max(0.0, doorLight - dt * 0.08)
    // rain on a warm lantern: steam, and a quiet hiss now and then
    hissCool = math.max(0.0, hissCool - dt)
    if (rain > 0.25 && hissCool <= 0.0) {
      var i = 0
      while (i < lanterns.length) {
        val l = lanterns(i)
        if (l.warm > 0.35 && rng.nextDouble() < 0.35) {
          hissCool = 3.5 + rng.nextDouble() * 3.0
          sound.hiss()
          var k = 0
          while (k < 3) {
            particles += new P(l.x + (rng.nextDouble() * 2 - 1) * 4, l.y + 2,
              (rng.nextDouble() * 2 - 1) * 1.6, -3.0 - rng.nextDouble() * 3.0, 2.6, 2.6, 6, 1.0)
            k += 1
          }
        }
        i += 1
      }
    }
  }

  private def catStep(dt: Double): Unit = {
    if (catMode == 0) {
      val patience = 6.5 - math.min(3.5, pets * 0.6)
      if (idleT > patience && !walking && catCooldown <= 0.0 && rain < 0.4 && wy < 800.0) {
        catMode = 1
        cx = 32.0
        cy = catSitY + (wy - catSitY) * 0.0
        ctarget = catSitX
        cdir = 1
        cT = 0.0
      }
    } else if (catMode == 1) {
      cx += 12.0 * dt
      if (cx >= ctarget) { catMode = 2; cx = ctarget; cT = 0.0 }
    } else if (catMode == 2) {
      cT += dt
      if (cT > 26.0) { catMode = 4; ctarget = 120.0 }
      if (walking && idleT < 0.4) { /* stays */ }
    } else if (catMode == 4) {
      cx += 13.0 * dt
      if (cx > 116.0) { catMode = 0; catCooldown = 40.0 + rng.nextDouble() * 40.0 }
    }
    if (catMode == 2 && pets > 0 && walking && math.hypot(cx - wx, cy - wy) > 30.0 && cT > 2.0) {
      // once petted, the cat pads along behind you for a while
      val dx = wx - cx
      val dy = (wy - 8.0) - cy
      val d = math.max(1.0, math.hypot(dx, dy))
      cx += dx / d * 15.0 * dt
      cy += dy / d * 15.0 * dt
      cdir = if (dx > 0) 1 else -1
      if (d < 7.0) { cy = wy - 8.0; cT += dt * 0.4 }
    }
  }

  private def foxStep(dt: Double): Unit = {
    if (foxMode == 0) {
      if (idleT > 38.0 && warmth > 0.35 && foxCooldown <= 0.0) {
        foxMode = 1
        fy = math.max(200.0, math.min(780.0, wy - 40.0))
        fx = 30.0
        foxT = 0.0
      }
    } else if (foxMode == 1) {
      fx += 17.0 * dt
      if (fx >= 86.0) { foxMode = 2; foxT = 0.0 }
    } else if (foxMode == 2) {
      foxT += dt
      if (foxT > 5.0) foxMode = 3
    } else if (foxMode == 3) {
      fx -= 21.0 * dt
      if (fx < 24.0) { foxMode = 0; foxCooldown = 220.0 }
    }
  }

  private def revealStep(dt: Double): Unit = {
    if (revealT < 0.0) return
    revealT += dt
    if (revealT < 9.0) {
      ghostY = wellY - 6.0 - revealT * 7.0
      ghostA = math.min(1.0, revealT * 0.9) * math.max(0.0, 1.0 - revealT / 9.0)
    } else ghostA = 0.0
  }

  private def particlesStep(dt: Double): Unit = {
    var i = 0
    while (i < particles.length) {
      val p = particles(i)
      p.life -= dt
      p.kind match {
        case 0 => p.vy += 12.0 * dt; p.x += p.vx * dt; p.y += p.vy * dt
        case 1 => p.vy += 16.0 * dt; p.vx *= (1.0 - dt * 1.2); p.x += p.vx * dt; p.y += p.vy * dt
        case 3 => p.size += dt * 1.4
        case 5 => p.vy += 1.6 * dt; p.x += p.vx * dt + math.sin(time * 2.0 + p.y) * dt * 3.0; p.y += p.vy * dt
        case 6 => p.vy += 0.6 * dt; p.vx *= (1.0 - dt * 0.7); p.x += p.vx * dt + math.sin(time * 1.7 + p.y) * dt * 2.0; p.y += p.vy * dt
        case _ =>
      }
      if (p.life <= 0.0) particles.remove(i) else i += 1
    }
  }

  // ---------------------------------------------------------------- helpers

  def fxNow: Double = if (foxMode == 0) -99.0 else fx
  def coinVisible(i: Int): Double = {
    val c = coins(i)
    if (c.found) 0.0 else math.min(1.0, lightAt(c.x, c.y) * 2.4)
  }
}
