import scala.scalajs.js
import scala.scalajs.js.annotation.JSExport

/** A thin, explicitly named handle on the living world, for the smoke check and
  * for anyone poking at it from the browser console. Scala.js mangles field
  * names, so everything here is a method.
  */
class AlleyHandle(val world: World) {
  @JSExport
  def state(): js.Dynamic = js.Dynamic.literal(
    time = world.time,
    wx = world.wx, wy = world.wy,
    camY = world.camY,
    rain = world.rain,
    warmth = world.warmth,
    coins = world.coinsFound,
    cat = world.catMode,
    fox = world.foxMode,
    sound = world.sound.on,
    walking = world.walking,
    window = world.windowLit,
    door = world.doorLight,
    warm = js.Array(world.lanterns.map(_.warm): _*),
    steady = js.Array(world.lanterns.map(_.steady): _*),
    hue = js.Array(world.lanterns.map(_.hue): _*),
    lanterns = js.Array(world.lanterns.flatMap(l => Seq(l.x, l.y)): _*),
    coinsAt = js.Array(world.coins.flatMap(c => Seq(c.x, c.y)): _*),
    well = js.Array(world.wellX, world.wellY)
  )
  @JSExport
  def audio(): String = world.sound.state
  @JSExport
  def lanternCount(): Int = world.lanterns.length
  @JSExport
  def warmLantern(i: Int): Unit = world.warmLantern(i)
  @JSExport
  def tendLantern(i: Int): Unit = world.tendLantern(i)
  @JSExport
  def place(x: Double, y: Double): Unit = {
    world.wx = x; world.wy = y; world.tx = x; world.ty = y
  }
  @JSExport
  def standStill(): Unit = {
    world.tx = world.wx
    world.ty = world.wy
    world.idleT = 60.0
    world.catCooldown = 0.0
    world.foxCooldown = 0.0
  }
  @JSExport
  def setRain(v: Double): Unit = {
    if (v > 0.0) world.rainHold = 60.0 else world.rainHold = 0.0
  }
  @JSExport
  def whoosh(dir: Double): Unit = world.gust(dir)
  @JSExport
  def windowAt(): js.Array[Double] = js.Array(world.windowX, world.windowY)
  @JSExport
  def doorAt(): js.Array[Double] = js.Array(world.doorX, world.doorY)
  @JSExport
  def lightAt(x: Double, y: Double): Double = world.lightAt(x, y)
}
