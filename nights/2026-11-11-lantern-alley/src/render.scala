import scala.scalajs.js

/** Drawing. The alley itself is painted once into an offscreen canvas; every
  * frame blits it and then draws what moves, the light buffer goes over the top.
  */
class Render(world: World) {
  import Sprites._

  private val light = new Lighting(world.VIEW_W, world.VIEW_H)
  private var stat: js.Dynamic = null
  private val doc = js.Dynamic.global.document

  private def rnd(seed0: Long): Double = ((seed0 * 1103515245L + 12345L) & 0x7fffffffL).toDouble / 2147483647.0

  // ------------------------------------------------------------ static art

  private def build(): Unit = {
    if (stat != null) return
    val c = doc.createElement("canvas")
    c.width = world.W
    c.height = world.H
    val g = c.getContext("2d")

    def rect(x: Double, y: Double, w: Double, h: Double, col: String): Unit = {
      g.fillStyle = col
      g.fillRect(x, y, w, h)
    }
    def px(x: Double, y: Double, col: String): Unit = rect(x, y, 1.0, 1.0, col)

    var s = 20261111L
    def nr(): Double = { s = (s * 1103515245L + 12345L) & 0x7fffffffL; s.toDouble / 2147483647.0 }

    def bricks(x0: Double, y0: Double, x1: Double, y1: Double, base: String, hi: String, lo: String): Unit = {
      val bh = 6.0
      val bw = 14.0
      var row = 0
      var y = y0
      while (y < y1) {
        val off = if (row % 2 == 0) 0.0 else bw / 2.0
        var x = x0 - bw + off
        while (x < x1) {
          val l = math.max(x0, x)
          val r = math.min(x + bw - 1.0, x1)
          val b = math.min(y + bh - 1.0, y1)
          if (r > l && b > y) {
            val q = nr()
            rect(l, y, r - l, b - y, if (q < 0.22) hi else if (q < 0.44) lo else base)
          }
          x += bw
        }
        y += bh
        row += 1
      }
    }

    def cobbles(x0: Double, y0: Double, x1: Double, y1: Double, base: String, hi: String, lo: String, joint: String): Unit = {
      // a course of small setts, slightly warmer than the brick, so the ground
      // reads as ground even in the dark
      rect(x0, y0, x1 - x0, y1 - y0, joint)
      var row = 0
      var y = y0
      while (y < y1) {
        val near = (y - y0) / math.max(1.0, y1 - y0)
        val rh = 5.0 + near * 3.0
        val rw = 7.0 + near * 3.0
        val off = if (row % 2 == 0) 0.0 else rw / 2.0
        var x = x0 - rw - 1.0 + off
        while (x < x1) {
          val l = math.max(x0, x)
          val r = math.min(x + rw, x1)
          val b = math.min(y + rh, y1)
          if (r > l && b > y) {
            val q = nr()
            rect(l, y, r - l, b - y - 1.0, if (q < 0.22) hi else if (q < 0.42) lo else base)
            // a lit top edge on some stones, so the setts have relief
            if (q > 0.86) rect(l, y, r - l, 1.0, "#b3b4a6")
            if (q < 0.08) rect(l + 1.0, y + 2.0, r - l - 2.0, 1.0, "#7c7f74")
          }
          x += rw + 1.0
        }
        y += rh + 1.0
        row += 1
      }
    }

    // ---- sky, and the moon over the far end
    var y = 0
    while (y < 42) {
      val t = y / 42.0
      val cr = (0x11 + (0x2c - 0x11) * t).toInt
      val cg = (0x17 + (0x36 - 0x17) * t).toInt
      val cb = (0x2e + (0x5c - 0x2e) * t).toInt
      rect(0, y, world.W, 1, s"rgb($cr,$cg,$cb)")
      y += 1
    }
    var i = 0
    while (i < 30) {
      val sx = (nr() * world.W).toInt.toDouble
      val sy = (nr() * 36.0).toInt.toDouble
      px(sx, sy, if (nr() < 0.25) "#cfd6ee" else "#8f98bd")
      i += 1
    }
    // the moon, with a halo
    val halo = g.createRadialGradient(31.0, 15.0, 2.0, 31.0, 15.0, 22.0)
    halo.addColorStop(0.0, "rgba(226,228,205,0.35)")
    halo.addColorStop(1.0, "rgba(226,228,205,0)")
    g.fillStyle = halo
    g.beginPath(); g.arc(31.0, 15.0, 22.0, 0.0, 6.283185307); g.fill()
    g.fillStyle = "#e9e6d4"
    g.beginPath(); g.arc(31.0, 15.0, 6.0, 0.0, 6.283185307); g.fill()
    px(29.0, 12.0, "#d3d0bc"); px(33.0, 17.0, "#d3d0bc"); px(31.0, 16.0, "#dbd8c4")

    // ---- the courtyard: back wall, a door in it, a well, a tree, a bench
    bricks(0.0, 42.0, 112.0, 60.0, "#53576a", "#5e6376", "#464a5c")
    rect(0.0, 60.0, 112.0, 2.0, "#4d5062")
    // the ornate door (the one that is quietly waiting)
    rect(45.0, 44.0, 22.0, 16.0, "#7a5530")
    rect(47.0, 46.0, 18.0, 14.0, "#6a4a2a")
    rect(47.0, 52.0, 18.0, 1.0, "#4a4e5c")
    rect(47.0, 56.0, 18.0, 1.0, "#4a4e5c")
    px(56.0, 53.0, "#c8a24a"); px(56.0, 54.0, "#c8a24a")
    rect(45.0, 44.0, 22.0, 1.0, "#8d6a3c")
    // courtyard floor
    cobbles(0.0, 60.0, 112.0, 174.0, "#a3a598", "#aeb0a2", "#8f9184", "#6b6d63")
    // a tree, mostly behind the wall
    rect(20.0, 44.0, 5.0, 26.0, "#5a4a3a")
    rect(20.0, 44.0, 1.0, 26.0, "#6b5847")
    var k = 0
    while (k < 40) {
      val bx = 12.0 + nr() * 22.0
      val by = 26.0 + nr() * 22.0
      val sz = 2.0 + nr() * 3.0
      rect(bx, by, sz, sz, if (nr() < 0.4) "#4e6f57" else "#3f5d4a")
      k += 1
    }
    // the well: a stone rim, a dark shaft, a little roof and a bucket
    rect(52.0, 118.0, 20.0, 2.0, "#6b4f2e")
    rect(52.0, 118.0, 20.0, 1.0, "#8a6a3e")
    rect(54.0, 120.0, 2.0, 12.0, "#7d6a52")
    rect(68.0, 120.0, 2.0, 12.0, "#7d6a52")
    rect(53.0, 120.0, 18.0, 1.0, "#5f5140")
    g.fillStyle = "#6f7486"
    g.beginPath(); g.ellipse(62.0, 133.0, 11.0, 5.0, 0.0, 0.0, 6.283185307); g.fill()
    g.fillStyle = "#828799"
    g.beginPath(); g.ellipse(62.0, 132.0, 11.0, 5.0, 0.0, 0.0, 6.283185307); g.fill()
    g.fillStyle = "#1a1f2e"
    g.beginPath(); g.ellipse(62.0, 132.0, 8.0, 3.2, 0.0, 0.0, 6.283185307); g.fill()
    rect(59.0, 120.0, 1.0, 8.0, "#4a4e5c")   // the rope
    rect(58.0, 127.0, 4.0, 3.0, "#5f4630")   // the bucket
    rect(58.0, 127.0, 4.0, 1.0, "#7a5a3c")

    // two planters, and leaves the wind left behind
    rect(8.0, 150.0, 12.0, 8.0, "#7d5a3a")
    rect(8.0, 150.0, 12.0, 1.0, "#8d6a44")
    rect(10.0, 143.0, 8.0, 7.0, "#425c46")
    rect(9.0, 146.0, 3.0, 4.0, "#4e6f57")
    rect(92.0, 150.0, 12.0, 8.0, "#7d5a3a")
    rect(92.0, 150.0, 12.0, 1.0, "#8d6a44")
    rect(94.0, 143.0, 8.0, 7.0, "#425c46")
    rect(99.0, 145.0, 3.0, 5.0, "#4e6f57")
    k = 0
    while (k < 26) {
      val lx = 6.0 + nr() * 100.0
      val ly = 64.0 + nr() * 104.0
      rect(lx, ly, 2.0, 1.0, if (nr() < 0.5) "#8a6a3e" else "#6f5a34")
      k += 1
    }
    // a bench
    rect(8.0, 112.0, 22.0, 3.0, "#7a5530")
    rect(8.0, 112.0, 22.0, 1.0, "#8d6a3c")
    rect(10.0, 115.0, 2.0, 4.0, "#5f4a2c"); rect(26.0, 115.0, 2.0, 4.0, "#5f4a2c")

    // the threshold: the alley's floor starts with a worn step
    rect(34.0, 172.0, 44.0, 3.0, "#7b7e70")
    rect(34.0, 174.0, 44.0, 1.0, "#5e6156")
    // ---- the alley itself
    bricks(0.0, 174.0, 34.0, 860.0, "#53576a", "#5e6376", "#464a5c")
    bricks(78.0, 174.0, 112.0, 860.0, "#53576a", "#5e6376", "#464a5c")
    cobbles(34.0, 174.0, 78.0, 860.0, "#a1a396", "#acaea0", "#8d8f82", "#696b61")
    // the top of the walls, and the shadow they throw on the setts
    rect(0.0, 174.0, 34.0, 2.0, "#3f4354")
    rect(78.0, 174.0, 34.0, 2.0, "#3f4354")
    rect(34.0, 176.0, 3.0, 684.0, "#5c5f52")
    rect(75.0, 176.0, 3.0, 684.0, "#5c5f52")
    // the floor edges, where wall meets stone
    rect(34.0, 174.0, 2.0, 686.0, "#484c5c")
    rect(76.0, 174.0, 2.0, 686.0, "#484c5c")
    // gutter
    rect(55.0, 176.0, 2.0, 682.0, "#6f7284")
    rect(55.0, 176.0, 1.0, 682.0, "#7d8090")
    // a barred window and a plank door, so the walls have something to say
    rect(22.0, 262.0, 12.0, 16.0, "#3c3f50")
    rect(23.0, 263.0, 10.0, 14.0, "#20242f")
    rect(23.0, 269.0, 10.0, 1.0, "#4a4e5c"); rect(27.0, 263.0, 1.0, 14.0, "#4a4e5c"); rect(30.0, 263.0, 1.0, 14.0, "#4a4e5c")
    rect(78.0, 500.0, 14.0, 26.0, "#7a5530")
    rect(80.0, 502.0, 10.0, 22.0, "#63452a")
    rect(78.0, 500.0, 14.0, 1.0, "#8d6a3c")
    px(87.0, 514.0, "#c8a24a")
    // ivy on the left wall
    k = 0
    while (k < 60) {
      val bx = nr() * 30.0
      val by = 200.0 + nr() * 600.0
      rect(bx, by, 1.0 + nr() * 2.0, 1.0 + nr() * 2.0, if (nr() < 0.5) "#45624c" else "#374f3d")
      k += 1
    }
    // a crate and a barrel against the walls
    rect(34.0, 318.0, 15.0, 18.0, "#7a5530")
    rect(35.0, 319.0, 13.0, 16.0, "#6a4a2a")
    rect(34.0, 325.0, 15.0, 1.0, "#8d6a3c")
    rect(41.0, 318.0, 1.0, 18.0, "#8d6a3c")
    rect(70.0, 622.0, 13.0, 20.0, "#6b5847")
    rect(70.0, 622.0, 13.0, 1.0, "#82613a")
    rect(70.0, 630.0, 13.0, 1.0, "#4a4e5c")
    rect(70.0, 638.0, 13.0, 1.0, "#4a4e5c")
    // a pot of something green, and a hanging sign over the plank door
    rect(34.0, 452.0, 8.0, 7.0, "#7d5a3a")
    rect(34.0, 452.0, 8.0, 1.0, "#8d6a44")
    rect(36.0, 446.0, 4.0, 6.0, "#425c46")
    rect(35.0, 448.0, 2.0, 3.0, "#4e6f57")
    rect(76.0, 604.0, 10.0, 1.0, "#4a4e5c")
    rect(79.0, 605.0, 4.0, 8.0, "#5f4630")
    rect(78.0, 613.0, 6.0, 1.0, "#4a4e5c")
    px(80.0, 607.0, "#b8863c")
    // a drainpipe down the right wall
    rect(74.0, 174.0, 3.0, 200.0, "#4f5464")
    rect(74.0, 174.0, 1.0, 200.0, "#5e6474")
    rect(72.0, 370.0, 7.0, 3.0, "#4a4e5c")
    // a stack of crates, a bucket, and a broom left against the wall
    rect(34.0, 556.0, 13.0, 12.0, "#7a5530")
    rect(35.0, 557.0, 11.0, 10.0, "#6a4a2a")
    rect(34.0, 562.0, 13.0, 1.0, "#8d6a3c")
    rect(36.0, 544.0, 10.0, 11.0, "#7a5530")
    rect(37.0, 545.0, 8.0, 9.0, "#6a4a2a")
    rect(36.0, 549.0, 10.0, 1.0, "#8d6a3c")
    rect(70.0, 296.0, 6.0, 6.0, "#5f5140")
    rect(70.0, 296.0, 6.0, 1.0, "#7d6a52")
    rect(78.0, 700.0, 1.0, 22.0, "#6b5847")
    rect(77.0, 700.0, 3.0, 2.0, "#8a6a3e")
    rect(78.0, 720.0, 1.0, 3.0, "#4a4e5c")
    // the near end: a stoop and a warm door you start in front of
    bricks(0.0, 860.0, 112.0, 900.0, "#53576a", "#5e6376", "#464a5c")
    rect(44.0, 862.0, 24.0, 28.0, "#7a5530")
    rect(46.0, 864.0, 20.0, 26.0, "#6a4a2a")
    rect(44.0, 862.0, 24.0, 1.0, "#8d6a3c")
    px(64.0, 878.0, "#c8a24a"); px(64.0, 879.0, "#c8a24a")
    rect(34.0, 856.0, 44.0, 4.0, "#7c7f90")

    // lantern brackets, so the lanterns hang off something
    var li = 0
    while (li < world.lanterns.length) {
      val l = world.lanterns(li)
      val left = l.x < world.W / 2
      val wall = if (left) 34.0 else 78.0
      val x0 = math.min(wall, l.x)
      val x1 = math.max(wall, l.x)
      rect(x0, l.y - 9.0, x1 - x0 + 1.0, 1.0, "#4a4e5c")
      rect(if (left) x0 else x1 - 1.0, l.y - 9.0, 2.0, 2.0, "#5d6172")
      li += 1
    }
    stat = c
  }

  // ------------------------------------------------------------------ draw

  def draw(ctx: js.Dynamic): Unit = {
    build()
    val t = world.time
    val cam = world.camY
    val settle = world.pulse * 1.5
    val warmCast = world.warmth
    val golden = if (world.lanternTended >= world.lanterns.length) 1.0 else 0.0
    val ambR = 104.0 + warmCast * 16.0 + golden * 8.0 + world.pulse * 10.0 - world.rain * 14.0
    val ambG = 108.0 + warmCast * 6.0 + golden * 2.0 + world.pulse * 6.0 - world.rain * 16.0
    val ambB = 146.0 - warmCast * 12.0 - golden * 26.0 + world.pulse * 4.0 + world.rain * 8.0

    // ---- light buffer
    light.begin(ambR, ambG, ambB)
    light.add(31.0, 15.0 - cam, 54.0, 152.0, 176.0, 232.0, 0.34)
    light.add(56.0, cam + 190.0, 215.0, 118.0, 126.0, 164.0, 0.42)
    light.add(56.0, 178.0 - cam, 46.0, 255.0, 196.0, 140.0, 0.22)
    light.add(56.0, 900.0 - cam, 120.0, 120.0, 118.0, 150.0, 0.18)
    var i = 0
    while (i < world.lanterns.length) {
      val l = world.lanterns(i)
      val flick = 0.9 + 0.1 * math.sin(t * 8.3 + i * 1.7) + l.flick * 0.18
      val (cr, cg, cb) = hueColour(l.hue)
      light.add(l.x + l.sway, l.y - cam, 38.0 + 26.0 * l.warm, cr, cg, cb, math.min(1.0, l.warm * 1.05) * flick)
      light.add(l.x + l.sway, l.y + 10.0 - cam, 22.0, cr, cg * 0.92, cb * 0.8, l.warm * 0.42 * flick)
      i += 1
    }
    light.add(world.wx, world.wy - 10.0 - cam, 30.0, 255.0, 200.0, 150.0, 0.42)
    if (world.ghostA > 0.0) light.add(world.wellX, world.ghostY - cam, 42.0, 255.0, 228.0, 172.0, 0.55 * world.ghostA)
    if (world.windowLit > 0.01) light.add(world.windowX, world.windowY - cam, 30.0, 255.0, 196.0, 132.0, 0.5 * world.windowLit)
    if (world.doorLight > 0.01) light.add(world.doorX, 526.0 - cam, 20.0, 255.0, 208.0, 150.0, 0.42 * world.doorLight)
    if (world.revealT >= 0.0) {
      val g = math.max(0.0, 1.0 - world.revealT / 14.0)
      light.add(56.0, 46.0 - cam, 30.0, 255.0, 220.0, 170.0, 0.45 * g)
    }

    // ---- the scene
    ctx.save()
    ctx.translate(0.0, -cam + settle)
    ctx.drawImage(stat, 0.0, 0.0)

    // a warm room behind the barred window, when someone is up
    if (world.windowLit > 0.01) {
      ctx.globalAlpha = 0.9 * world.windowLit
      ctx.fillStyle = "#ffce8c"
      ctx.fillRect(23.0, 263.0, 10.0, 14.0)
      ctx.globalAlpha = 1.0
      ctx.fillStyle = "#4a4e5c"
      ctx.fillRect(23.0, 269.0, 10.0, 1.0)
      ctx.fillRect(27.0, 263.0, 1.0, 14.0)
      ctx.fillRect(30.0, 263.0, 1.0, 14.0)
      // and a little of it spills onto the setts
      ctx.globalCompositeOperation = "lighter"
      ctx.globalAlpha = 0.14 * world.windowLit
      ctx.fillStyle = "#8a5c2a"
      ctx.beginPath()
      ctx.ellipse(36.0, world.windowY + 18.0, 12.0, 6.0, 0.0, 0.0, 6.283185307)
      ctx.fill()
      ctx.globalCompositeOperation = "source-over"
      ctx.globalAlpha = 1.0
    }

    // a line of light under the plank door, when it answers
    if (world.doorLight > 0.01) {
      ctx.globalAlpha = 0.85 * world.doorLight
      ctx.fillStyle = "#ffd79a"
      ctx.fillRect(80.0, 524.0, 10.0, 1.0)
      ctx.globalAlpha = 0.35 * world.doorLight
      ctx.fillRect(80.0, 525.0, 10.0, 1.0)
      ctx.globalAlpha = 1.0
    }

    // footprints, faintly
    i = 0
    while (i < world.particles.length) {
      val p = world.particles(i)
      if (p.kind == 4) {
        ctx.globalAlpha = 0.30 * (p.life / p.max)
        ctx.fillStyle = "#3d4052"
        ctx.fillRect(p.x - 1.0, p.y - 1.0, 3.0, 2.0)
      }
      i += 1
    }
    ctx.globalAlpha = 1.0

    // the puddle, and what the rain does to it
    val wet = world.rain
    ctx.globalAlpha = 0.42 + wet * 0.3
    ctx.fillStyle = "#232c46"
    ctx.beginPath()
    ctx.ellipse(world.puddleX, world.puddleY, 18.0, 5.5, 0.0, 0.0, 6.283185307)
    ctx.fill()
    ctx.globalAlpha = 0.5 + wet * 0.3
    ctx.strokeStyle = "#8f9ab8"
    ctx.lineWidth = 1.0
    ctx.beginPath()
    ctx.ellipse(world.puddleX, world.puddleY, 18.0, 5.5, 0.0, 0.0, 6.283185307)
    ctx.stroke()
    ctx.globalAlpha = 1.0
    if (wet > 0.15) {
      ctx.globalAlpha = 0.5 * wet
      ctx.fillStyle = "#e2e4cd"
      ctx.beginPath()
      ctx.ellipse(world.puddleX - 2.0, world.puddleY, 3.0, 1.2, 0.0, 0.0, 6.283185307)
      ctx.fill()
      ctx.globalAlpha = 1.0
    }

    // coins, only where the light reaches them
    i = 0
    while (i < world.coins.length) {
      val c = world.coins(i)
      val vis = world.coinVisible(i)
      if (vis > 0.02) {
        val glint = if (((c.bob * 1.6) % 1.0) < 0.5) coinA else coinB
        blit(ctx, glint, coinPal, c.x - 3.0, c.y - 3.0 + math.sin(c.bob * 1.7) * 0.6, false, math.min(1.0, vis))
      }
      i += 1
    }

    // lanterns
    i = 0
    while (i < world.lanterns.length) {
      val l = world.lanterns(i)
      if (l.warm > 0.05) {
        ctx.globalCompositeOperation = "lighter"
        val bloom = ctx.createRadialGradient(l.x + l.sway, l.y - cam, 0.0, l.x + l.sway, l.y - cam, 9.0 + 9.0 * l.warm)
        bloom.addColorStop(0.0, "rgba(255,206,140," + (0.30 * l.warm).toString + ")")
        bloom.addColorStop(1.0, "rgba(255,180,90,0)")
        ctx.fillStyle = bloom
        ctx.beginPath()
        ctx.arc(l.x + l.sway, l.y - cam, 9.0 + 9.0 * l.warm, 0.0, 6.283185307)
        ctx.fill()
        ctx.globalCompositeOperation = "source-over"
      }
      val breathing = math.sin(t * 6.1 + i) > 0.0
      val grid = if (l.flick > 0.2 || breathing) lanternB else lanternA
      blit(ctx, grid, lanternPal, l.x + l.sway - 4.5, l.y - 8.0, false, 0.6 + 0.4 * math.max(0.25, l.warm))
      // moths gather at a warm lantern; a tended one draws a pale one
      val m = math.min(3, (l.warm * 3.4).toInt)
      var mi = 0
      while (mi < m) {
        val ang = t * (0.7 + mi * 0.21) + mi * 2.2 + i
        val rad = 7.0 + mi * 2.6
        val mg = if (((t * 3.0 + mi) % 1.0) < 0.5) mothA else mothB
        blit(ctx, mg, mothPal, l.x + math.cos(ang) * rad - 1.0, l.y + math.sin(ang * 1.3) * 3.0 - 2.0, false, 0.55)
        mi += 1
      }
      i += 1
    }

    // the ghost light that rises out of the well when the third coin is found
    if (world.ghostA > 0.0) {
      ctx.globalAlpha = 0.55 * world.ghostA
      ctx.fillStyle = "#ffe6b4"
      ctx.beginPath()
      ctx.arc(world.wellX, world.ghostY, 3.5 + 2.0 * math.sin(t * 2.0), 0.0, 6.283185307)
      ctx.fill()
      ctx.globalAlpha = 1.0
    }

    // the fox, when it comes
    if (world.foxMode != 0) {
      val fg = if (((world.time * 6.0) % 1.0) < 0.5) foxA else foxB
      val fflip = world.foxMode == 3
      silhouette(ctx, fg, world.fx - 8.0, world.fy - 6.0, fflip, "#0d0e18", 0.5)
      silhouette(ctx, fg, world.fx - 6.0, world.fy - 6.0, fflip, "#0d0e18", 0.5)
      silhouette(ctx, fg, world.fx - 7.0, world.fy - 7.0, fflip, "#0d0e18", 0.5)
      silhouette(ctx, fg, world.fx - 7.0, world.fy - 5.0, fflip, "#0d0e18", 0.5)
      blit(ctx, fg, foxPal, world.fx - 7.0, world.fy - 6.0, fflip, 1.0)
    }

    // the cat
    if (world.catMode != 0) {
      shadow(ctx, world.cx, world.cy, 7.0, 2.0)
      val grid = if (world.catMode == 2 || world.catMode == 4) catSit
                 else if (((world.time * 7.0) % 1.0) < 0.5) catA else catB
      val cgy = world.cy - (if (grid eq catSit) 7.0 else 6.0)
      silhouette(ctx, grid, world.cx - 7.0, cgy, world.cdir < 0, "#0d0e18", 0.5)
      silhouette(ctx, grid, world.cx - 5.0, cgy, world.cdir < 0, "#0d0e18", 0.5)
      silhouette(ctx, grid, world.cx - 6.0, cgy - 1.0, world.cdir < 0, "#0d0e18", 0.5)
      silhouette(ctx, grid, world.cx - 6.0, cgy + 1.0, world.cdir < 0, "#0d0e18", 0.5)
      blit(ctx, grid, catPal, world.cx - 6.0, cgy, world.cdir < 0, 1.0)
    }

    // the walker, with the lamp she carries throwing a warm halo
    ctx.globalCompositeOperation = "lighter"
    ctx.globalAlpha = 0.3
    ctx.fillStyle = "#7a5426"
    ctx.beginPath()
    ctx.arc(world.wx + (if (world.facing == 2) -8.0 else 6.0), world.wy - 12.0, 16.0, 0.0, 6.283185307)
    ctx.fill()
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1.0
    shadow(ctx, world.wx, world.wy, 6.0, 2.2)
    val bob = if (world.walking) { if ((world.bobT % 1.0) < 0.5) -1.0 else 0.0 } else math.sin(t * 1.6) * 0.4
    val phaseA = (world.animT % 1.0) < 0.5
    val (grid, flip) = world.facing match {
      case 0 => (if (phaseA) backA else backB, false)
      case 1 => (if (phaseA) frontA else frontB, false)
      case 2 => (if (phaseA) sideA else sideB, true)
      case _ => (if (phaseA) sideA else sideB, false)
    }
    val gx = world.wx - 5.0
    val gy = world.wy - grid.length + bob
    silhouette(ctx, grid, gx - 1.0, gy, flip, "#0d0e18", 0.55)
    silhouette(ctx, grid, gx + 1.0, gy, flip, "#0d0e18", 0.55)
    silhouette(ctx, grid, gx, gy - 1.0, flip, "#0d0e18", 0.55)
    silhouette(ctx, grid, gx, gy + 1.0, flip, "#0d0e18", 0.55)
    blit(ctx, grid, person, gx, gy, flip, 1.0)
    val lampSide = if (flip) -10.0 else 6.0
    blit(ctx, handLamp, lanternPal, world.wx + lampSide, world.wy - 13.0 + bob, false, 0.95)

    // sparks, leaves, motes, ripple rings
    i = 0
    while (i < world.particles.length) {
      val p = world.particles(i)
      val lifeQ = math.max(0.0, p.life / p.max)
      p.kind match {
        case 0 =>
          ctx.globalAlpha = lifeQ
          ctx.fillStyle = if (p.vy > 0.0) "#fff6d8" else "#fffbe8"
          ctx.fillRect(p.x, p.y, 1.0, 1.0)
        case 1 =>
          ctx.globalAlpha = lifeQ * 0.9
          blit(ctx, leaf, leafPal, p.x, p.y, false, 1.0)
        case 3 =>
          ctx.globalAlpha = lifeQ * 0.35
          ctx.strokeStyle = "#cfd8ee"
          ctx.lineWidth = 1.0
          ctx.beginPath()
          ctx.ellipse(p.x, p.y, p.size * 9.0, p.size * 3.0, 0.0, 0.0, 6.283185307)
          ctx.stroke()
        case 5 =>
          ctx.globalAlpha = lifeQ * 0.55
          ctx.fillStyle = "#ffeec4"
          ctx.fillRect(p.x, p.y, 1.0, 1.0)
        case _ =>
      }
      i += 1
    }
    ctx.globalAlpha = 1.0
    ctx.restore()

    // the setts go dark and shiny in the rain
    if (world.rain > 0.02) {
      ctx.globalAlpha = 0.10 * world.rain
      ctx.fillStyle = "#2a3350"
      ctx.fillRect(0.0, 0.0, world.VIEW_W, world.VIEW_H)
      ctx.globalAlpha = 1.0
    }

    // ---- rain, over everything (it falls in front of the camera)
    if (world.rain > 0.02) {
      val n = 46
      ctx.globalAlpha = 0.24 + 0.28 * world.rain
      ctx.fillStyle = "#c9d4ef"
      i = 0
      while (i < n) {
        val rx = ((i * 37.7 + t * 26.0 * world.rain) % (world.VIEW_W + 40.0)) - 20.0
        val ry = ((i * 61.3 + t * 300.0) % (world.VIEW_H + 40.0)) - 20.0
        ctx.fillRect(rx, ry, 1.0, 5.0)
        i += 1
      }
      ctx.globalAlpha = 1.0
    }

    // motes drifting in the light: always a few, more when the alley is warm
    val motes = 8 + (world.warmth * 10.0).toInt
    var mi2 = 0
    while (mi2 < motes) {
      val a = t * 0.18 + mi2 * 1.7
      val mx = 56.0 + math.sin(a * 0.7 + mi2) * 22.0
      val my = ((mi2 * 53.0 + t * 6.0) % 320.0) + cam
      ctx.globalAlpha = 0.12 + 0.22 * world.lightAt(mx, my)
      ctx.fillStyle = "#fff6d8"
      ctx.fillRect(mx, my - cam, 1.0, 1.0)
      mi2 += 1
    }
    ctx.globalAlpha = 1.0

    light.finish(ctx)

    // ---- vignette, so the alley edges rest
    val vg = ctx.createRadialGradient(world.VIEW_W / 2.0, world.VIEW_H * 0.55, world.VIEW_H * 0.28,
      world.VIEW_W / 2.0, world.VIEW_H * 0.55, world.VIEW_H * 0.78)
    vg.addColorStop(0.0, "rgba(0,0,0,0)")
    vg.addColorStop(1.0, "rgba(0,0,0,0.38)")
    ctx.fillStyle = vg
    ctx.fillRect(0.0, 0.0, world.VIEW_W, world.VIEW_H)

    // ---- the idle hint: a lantern that would like some attention
    if (world.idleT > 5.0 && !world.walking && world.rain < 0.5) {
      var coldest = -1
      var bestW = 1.1
      i = 0
      while (i < world.lanterns.length) {
        val l = world.lanterns(i)
        if (l.warm < bestW && l.y > cam - 20.0 && l.y < cam + world.VIEW_H + 20.0) { bestW = l.warm; coldest = i }
        i += 1
      }
      if (coldest >= 0) {
        val l = world.lanterns(coldest)
        val ph = (math.sin(t * 1.8) * 0.5 + 0.5)
        ctx.globalAlpha = 0.06 + 0.10 * ph
        ctx.strokeStyle = "#ffdca0"
        ctx.lineWidth = 1.0
        ctx.beginPath()
        ctx.arc(l.x, l.y - cam, 7.0 + 4.0 * ph, 0.0, 6.283185307)
        ctx.stroke()
        ctx.globalAlpha = 1.0
      }
    }
  }

  private def shadow(ctx: js.Dynamic, x: Double, y: Double, rx: Double, ry: Double): Unit = {
    ctx.globalAlpha = 0.28
    ctx.fillStyle = "#0b0c16"
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, 0.0, 0.0, 6.283185307)
    ctx.fill()
    ctx.globalAlpha = 1.0
  }

  private def hueColour(h: Double): (Double, Double, Double) =
    if (h >= 0.0) (255.0, 205.0 - h * 45.0, 140.0 - h * 60.0)
    else (205.0 + h * 40.0, 225.0, 255.0)
}
