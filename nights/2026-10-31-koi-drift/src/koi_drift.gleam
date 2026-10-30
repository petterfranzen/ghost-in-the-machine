//// Koi Drift — the pond, as data.
////
//// The whole scene is pure: `feed` and `advance` take a pond and give back a new
//// pond, so a test can step the scene for a minute of pond time without a
//// canvas, a browser or a clock. The JavaScript in `src/app.js` only draws the
//// pond it is handed, and hands back taps.
////
//// Everything is in pond pixels, and the pond tells the simulation how big it
//// is on every step, so the same scene works on a phone and on a laptop.

import gleam/float
import gleam/int
import gleam/list
import gleam/option.{None, Some, type Option}
import trig

/// How many koi live in the pond.
pub const koi_count: Int = 5

/// A crumb floats for this long before it dissolves (seconds).
pub const crumb_life: Float = 26.0

/// A ring that never dies would be a leak; this caps the pond instead.
const ring_cap: Int = 56

/// Room for a scatter of food, not a meal.
const crumb_cap: Int = 26

const tau: Float = 6.283185307179586

/// A ring on the surface, from a tap or from a koi nosing the food.
pub type Ring {
  Ring(
    x: Float,
    y: Float,
    radius: Float,
    age: Float,
    life: Float,
    strength: Float,
  )
}

/// One crumb of food, drifting on the surface.
pub type Crumb {
  Crumb(x: Float, y: Float, age: Float, kind: Int)
}

/// A koi, seen from above. `heading` is the way the nose points, in radians;
/// `phase` drives the tail beat and is the reason no two koi swim in step.
pub type Koi {
  Koi(
    id: Int,
    x: Float,
    y: Float,
    heading: Float,
    speed: Float,
    speed_target: Float,
    phase: Float,
    size: Float,
    kind: Int,
    nibble: Float,
    gulp: Float,
  )
}

pub type Pond {
  Pond(
    koi: List(Koi),
    crumbs: List(Crumb),
    rings: List(Ring),
    clock: Float,
    slot: Int,
    fed: Int,
    eaten: Int,
  )
}

/// A pond with a handful of koi already in it, facing around a loose ring.
pub fn start(width: Float, height: Float) -> Pond {
  Pond(
    koi: list.map([0, 1, 2, 3, 4], fn(i) { seed_koi(i, width, height) }),
    crumbs: [],
    rings: [
      Ring(
        x: width *. 0.5,
        y: height *. 0.5,
        radius: 8.0,
        age: 0.0,
        life: 4.5,
        strength: 0.9,
      ),
    ],
    clock: 0.0,
    slot: 0,
    fed: 0,
    eaten: 0,
  )
}

/// A tap: a crumb lands, and the surface answers with a ring.
pub fn feed(pond: Pond, x: Float, y: Float, width: Float, height: Float) -> Pond {
  // Keep the food off the very edge, where a koi would have to beach itself.
  let cx = float.clamp(x, 14.0, float.max(width -. 14.0, 14.0))
  let cy = float.clamp(y, 14.0, float.max(height -. 14.0, 14.0))
  Pond(
    ..pond,
    crumbs: list.take([Crumb(x: cx, y: cy, age: 0.0, kind: pond.fed), ..pond.crumbs], crumb_cap),
    rings: list.take(
      [Ring(x: cx, y: cy, radius: 5.0, age: 0.0, life: 3.4, strength: 1.0), ..pond.rings],
      ring_cap,
    ),
    fed: pond.fed + 1,
  )
}

/// One frame: `dt` seconds of pond time.
pub fn advance(pond: Pond, dt: Float, width: Float, height: Float) -> Pond {
  let clock = pond.clock +. dt

  // Crumbs age on the surface.
  let crumbs = list.map(pond.crumbs, fn(c) { Crumb(..c, age: c.age +. dt) })

  // Koi swim. They are given the same crumb list, the same neighbours and the
  // same pond box, and each returns its own next state.
  let swimming =
    list.map(pond.koi, fn(k) { swim(k, crumbs, pond.koi, dt, width, height, clock) })

  // Whoever is close enough to a crumb gets it: a crumb can feed a koi, and two
  // koi can meet over one crumb.
  let reach = fn(k: Koi) { 15.0 +. 6.5 *. k.size }
  let near = fn(k: Koi, c: Crumb) {
    let dx = c.x -. k.x
    let dy = c.y -. k.y
    let r = reach(k)
    dx *. dx +. dy *. dy <. r *. r
  }
  let koi =
    list.map(swimming, fn(k) {
      case list.any(crumbs, fn(c) { near(k, c) }) {
        True -> Koi(..k, nibble: 0.5, gulp: 1.0)
        False -> k
      }
    })
  let taken = list.filter(crumbs, fn(c) { list.any(koi, fn(k) { near(k, c) }) })
  let leftovers = list.filter(crumbs, fn(c) {
    !list.any(koi, fn(k) { near(k, c) }) && c.age <. crumb_life
  })

  // Now and then something touches the surface somewhere else — a bubble, a
  // leaf, a koi that surfaced out of sight. It keeps the pond from feeling
  // paused when nothing is happening.
  let slot = float.truncate(clock /. 6.5)
  let ambient = case slot > pond.slot {
    True -> [
      Ring(
        x: width *. { 0.12 +. 0.76 *. prand(slot, 11) },
        y: height *. { 0.12 +. 0.76 *. prand(slot, 13) },
        radius: 2.0,
        age: 0.0,
        life: 5.0,
        strength: 0.32,
      ),
    ]
    False -> []
  }

  let rings =
    list.take(
      list.append(list.map(taken, fn(c) {
        Ring(x: c.x, y: c.y, radius: 3.0, age: 0.0, life: 2.6, strength: 0.85)
      }), rings_next(pond.rings, ambient, dt)),
      ring_cap,
    )

  Pond(
    koi: koi,
    crumbs: leftovers,
    rings: rings,
    clock: clock,
    slot: slot,
    fed: pond.fed,
    eaten: pond.eaten + list.length(taken),
  )
}

fn rings_next(rings: List(Ring), extra: List(Ring), dt: Float) -> List(Ring) {
  list.filter(
    list.map(list.append(rings, extra), fn(r) {
      let left = float.max(1.0 -. r.age /. r.life, 0.0)
      // A ring spreads fast at first and slows as it dies, the way a real one does.
      Ring(..r, age: r.age +. dt, radius: r.radius +. { 10.0 +. 58.0 *. r.strength } *. left *. dt)
    }),
    fn(r) { r.age <. r.life },
  )
}

/// One koi, one frame: steer, glide, beat the tail, settle the gulp.
fn swim(
  k: Koi,
  crumbs: List(Crumb),
  others: List(Koi),
  dt: Float,
  width: Float,
  height: Float,
  clock: Float,
) -> Koi {
  let target = nearest_crumb(crumbs, k.x, k.y)

  // The pull: either a crumb, or the koi's own slow curiosity.
  let pull_x = case target {
    Some(c) -> { c.x -. k.x } *. 1.6
    None ->
      trig.cos(k.heading) *. 42.0
      +. trig.sin(clock *. 0.29 +. k.phase) *. 34.0
  }
  let pull_y = case target {
    Some(c) -> { c.y -. k.y } *. 1.6
    None ->
      trig.sin(k.heading) *. 42.0
      +. trig.cos(clock *. 0.23 +. k.phase *. 1.7) *. 34.0
  }

  // Soft walls: the pond pushes back well before the koi reaches the edge.
  let margin = 130.0
  let push_x = wall_push(k.x, width, margin)
  let push_y = wall_push(k.y, height, margin)

  // And a little room between koi, so they never pile up on one crumb.
  let sep = list.fold(others, #(0.0, 0.0), fn(acc, o) {
    case o.id == k.id {
      True -> acc
      False -> {
        let dx = k.x -. o.x
        let dy = k.y -. o.y
        let d2 = dx *. dx +. dy *. dy
        case d2 <. 3600.0 {
          True -> {
            let d2 = float.max(d2, 90.0)
            #(acc.0 +. dx /. d2 *. 2600.0, acc.1 +. dy /. d2 *. 2600.0)
          }
          False -> acc
        }
      }
    }
  })

  let want_x = pull_x +. push_x +. sep.0
  let want_y = pull_y +. push_y +. sep.1
  let desired = case want_x *. want_x +. want_y *. want_y <. 0.01 {
    True -> k.heading
    False -> trig.atan2(want_y, want_x)
  }

  // Koi turn slowly. Chasing food, they are allowed to turn faster, but they
  // still curve rather than pivot.
  let error = wrap_angle(desired -. k.heading)
  let rate = case target {
    Some(_) -> 2.5
    None -> 1.15
  }
  let turn = float.clamp(error, -1.0 *. rate *. dt, rate *. dt)
  let heading = wrap_angle(k.heading +. turn)

  // A hard turn costs speed, and a koi that has just taken a crumb pauses over it.
  let glide = float.clamp(1.0 -. 0.4 *. float.absolute_value(error) /. 3.14159, 0.4, 1.0)
  let nibbling = case k.nibble >. 0.0 {
    True -> 0.1
    False -> 1.0
  }
  let wanted_speed = k.speed_target *. glide *. nibbling
  let speed = k.speed +. { wanted_speed -. k.speed } *. float.min(1.0, 3.2 *. dt)

  let x = float.clamp(k.x +. trig.cos(heading) *. speed *. dt, 22.0, float.max(width -. 22.0, 22.0))
  let y = float.clamp(k.y +. trig.sin(heading) *. speed *. dt, 22.0, float.max(height -. 22.0, 22.0))

  Koi(
    ..k,
    x: x,
    y: y,
    heading: heading,
    speed: speed,
    // The tail beats a little faster when the koi is hurrying.
    phase: wrap_angle(k.phase +. dt *. { 2.2 +. speed /. 26.0 }),
    nibble: float.max(0.0, k.nibble -. dt),
    gulp: float.max(0.0, k.gulp -. dt *. 1.5),
  )
}

/// How hard the pond pushes a koi back from an edge at position `p`.
fn wall_push(p: Float, size: Float, margin: Float) -> Float {
  case p <. margin {
    True -> { margin -. p } *. 2.6
    False ->
      case p >. size -. margin {
        True -> -1.0 *. { margin -. { size -. p } } *. 2.6
        False -> 0.0
      }
  }
}

fn nearest_crumb(crumbs: List(Crumb), x: Float, y: Float) -> Option(Crumb) {
  let best =
    list.fold(crumbs, None, fn(best, c) {
      let dx = c.x -. x
      let dy = c.y -. y
      let d = dx *. dx +. dy *. dy
      case best {
        None -> Some(#(d, c))
        Some(#(bd, _)) ->
          case d <. bd {
            True -> Some(#(d, c))
            False -> best
          }
      }
    })
  case best {
    None -> None
    Some(#(_, c)) -> Some(c)
  }
}

/// Angles, kept in (-pi, pi] so a heading never drifts off to infinity.
fn wrap_angle(a: Float) -> Float {
  let a = case a >. 3.141592653589793 {
    True -> a -. tau
    False -> a
  }
  case a <. -3.141592653589793 {
    True -> a +. tau
    False -> a
  }
}

/// A tiny deterministic random in [0, 1), so the pond is the same pond every
/// time it starts and a test can predict it.
fn prand(a: Int, b: Int) -> Float {
  let n = trig.sin(int.to_float(a) *. 12.9898 +. int.to_float(b) *. 78.233) *. 43758.5453
  n -. float.floor(n)
}

fn seed_koi(i: Int, width: Float, height: Float) -> Koi {
  let angle = int.to_float(i) /. int.to_float(koi_count) *. tau +. prand(i, 1) *. 0.7
  let radius = 0.22 +. 0.09 *. prand(i, 2)
  let kind = case int.remainder(i, 3) {
    Ok(k) -> k
    Error(_) -> 0
  }
  Koi(
    id: i,
    x: width *. { 0.5 +. radius *. trig.cos(angle) },
    y: height *. { 0.5 +. radius *. 0.82 *. trig.sin(angle) },
    heading: wrap_angle(angle +. 1.5707963267948966),
    speed: 14.0 +. 7.0 *. prand(i, 3),
    speed_target: 20.0 +. 9.0 *. prand(i, 5),
    phase: prand(i, 7) *. tau,
    size: 0.82 +. 0.38 *. prand(i, 9),
    kind: kind,
    nibble: 0.0,
    gulp: 0.0,
  )
}
