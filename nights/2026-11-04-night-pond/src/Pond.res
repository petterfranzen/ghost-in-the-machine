/* Night Pond — the pond's little mind.
 *
 * Everything that moves or remembers lives here: ripples blooming out from a
 * tap, seeds sinking toward the three sleeping lanterns, koi gliding over to
 * look, motes lifting, the pond slowly waking. The renderer in view.js only
 * draws what this module reports, and test/sim.test.mjs steps it with no
 * browser at all. */

let width = 320.0
let height = 320.0
let cx = 160.0
let cy = 162.0
let rx = 151.0
let ry = 147.0

type koi = {
  mutable x: float,
  mutable y: float,
  mutable vx: float,
  mutable vy: float,
  mutable ang: float,
  mutable size: float,
  mutable hue: int,
  mutable ph: float,
  mutable wtx: float,
  mutable wty: float,
  mutable wt: float,
}

type ripple = {
  mutable x: float,
  mutable y: float,
  mutable age: float,
  mutable delay: float,
  mutable life: float,
  mutable maxR: float,
  mutable str: float,
}

type seed = {
  mutable x: float,
  mutable y: float,
  mutable vx: float,
  mutable vy: float,
  mutable age: float,
  mutable tgt: int,
  mutable ph: float,
}

type mote = {
  mutable x: float,
  mutable y: float,
  mutable vy: float,
  mutable age: float,
  mutable life: float,
  mutable ph: float,
}

type lantern = {
  mutable x: float,
  mutable y: float,
  mutable awake: float,
  mutable lit: bool,
  mutable ph: float,
}

type state = {
  mutable t: float,
  mutable koi: array<koi>,
  mutable ripples: array<ripple>,
  mutable seeds: array<seed>,
  mutable motes: array<mote>,
  mutable lanterns: array<lantern>,
  mutable settle: float,
  mutable bloomX: float,
  mutable bloomY: float,
  mutable bloom: float,
  mutable complete: bool,
  mutable doneAt: float,
  mutable taps: int,
  mutable events: array<string>,
  mutable rnd: float,
  mutable reduced: bool,
}

/* a tiny deterministic generator, so the pond starts the same way every time */
let next = s => {
  /* Park–Miller, in floats: deterministic, and enough variety for a pond */
  let v = s.rnd *. 16807.0
  s.rnd = v -. Js.Math.floor_float(v /. 2147483647.0) *. 2147483647.0
  s.rnd /. 2147483647.0
}

let randRange = (s, lo, hi) => lo +. next(s) *. (hi -. lo)

let sin = (a: float) => Js.Math.sin(a)
let cos = (a: float) => Js.Math.cos(a)
let fmax = (a, b) => a > b ? a : b
let fmin = (a, b) => a < b ? a : b
let fabs = a => a < 0.0 ? -.a : a
let hypot = (a, b) => Js.Math.sqrt(a *. a +. b *. b)
let drag = (keep, dt) => Js.Math.pow_float(~base=keep, ~exp=dt)

/* how far out a point is: < 1 means inside the pond's ellipse */
let depth = (x, y) => {
  let dx = (x -. cx) /. rx
  let dy = (y -. cy) /. ry
  Js.Math.sqrt(dx *. dx +. dy *. dy)
}

let wobble = (a: float) => 1.0 +. 0.035 *. sin(a *. 3.0 +. 1.1) +. 0.022 *. sin(a *. 5.0 -. 0.4)

let inWater = (x, y) => {
  let a = Js.Math.atan2(~y=y -. cy, ~x=x -. cx, ())
  depth(x, y) < wobble(a)
}

let makeKoi = (s, i) => {
  let a = float_of_int(i) /. 4.0 *. 6.28318 +. 0.4
  let x = cx +. cos(a) *. rx *. 0.45
  let y = cy +. sin(a) *. ry *. 0.45
  {
    x,
    y,
    vx: cos(a +. 1.57) *. 7.0 *. (s.reduced ? 0.5 : 1.0),
    vy: sin(a +. 1.57) *. 7.0 *. (s.reduced ? 0.5 : 1.0),
    ang: a +. 1.57,
    size: randRange(s, 0.85, 1.25),
    hue: i < 3 ? i : 0,
    ph: randRange(s, 0.0, 6.28),
    wtx: x,
    wty: y,
    wt: 0.0,
  }
}

let makeLantern = (x, y, ph) => {x, y, awake: 0.0, lit: false, ph}

let make = (reduced: bool) => {
  let s: state = {
    t: 0.0,
    koi: [],
    ripples: [],
    seeds: [],
    motes: [],
    lanterns: [
      makeLantern(cx -. 82.0, cy +. 44.0, 0.0),
      makeLantern(cx +. 4.0, cy -. 62.0, 2.1),
      makeLantern(cx +. 88.0, cy +. 30.0, 4.2),
    ],
    settle: 0.0,
    bloomX: cx,
    bloomY: cy,
    bloom: 0.0,
    complete: false,
    doneAt: 0.0,
    taps: 0,
    events: [],
    rnd: 20261104.0,
    reduced,
  }
  s.koi = Belt.Array.makeBy(4, i => makeKoi(s, i))
  s
}

let asleepLanterns = s => Belt.Array.reduce(s.lanterns, 0, (n, l) => l.lit ? n : n + 1)

let nearestAsleep = (s, x, y) => {
  let idx = ref(-1)
  let best = ref(1.0e9)
  Belt.Array.forEachWithIndex(s.lanterns, (i, l) => {
    if !l.lit {
      let d = hypot(l.x -. x, l.y -. y)
      if d < best.contents {
        best.contents = d
        idx.contents = i
      }
    }
  })
  idx.contents
}

let addRipple = (s, x, y, maxR, str, delay) => {
  /* under reduced motion the rings still bloom, but they fade much sooner */
  let life = s.reduced ? 1.5 : 3.6
  s.ripples = Belt.Array.concat(s.ripples, [{x, y, age: 0.0, delay, life, maxR, str}])
}

let addMote = (s, x, y) => {
  s.motes = Belt.Array.concat(
    s.motes,
    [
      {
        x: x +. randRange(s, -7.0, 7.0),
        y: y +. randRange(s, -4.0, 4.0),
        vy: randRange(s, -9.0, -4.0),
        age: 0.0,
        life: randRange(s, 2.6, 4.6),
        ph: randRange(s, 0.0, 6.28),
      },
    ],
  )
}

/* a tap: three rings blooming out at different speeds, a warm bloom, the whole
 * scene settling a hair, and — if the water still has a sleeping lantern — a
 * seed dropped in that will sink toward it. */
let tap = (s, x, y) => {
  let x = fmax(6.0, fmin(width -. 6.0, x))
  let y = fmax(6.0, fmin(height -. 6.0, y))
  let water = inWater(x, y)
  let k = water ? 1.0 : 0.45
  addRipple(s, x, y, 32.0 *. k, 1.0 *. k, 0.12)
  addRipple(s, x, y, 20.0 *. k, 0.62 *. k, 0.0)
  addRipple(s, x, y, 48.0 *. k, 0.38 *. k, 0.34)
  s.settle = s.reduced ? 0.0 : 1.0
  s.bloomX = x
  s.bloomY = y
  s.bloom = water ? 1.0 : 0.35
  s.taps = s.taps + 1
  s.events = Belt.Array.concat(s.events, [water ? "plop" : "thud"])

  if water {
    switch nearestAsleep(s, x, y) {
    | -1 => addMote(s, x, y)
    | tgt =>
      s.seeds = Belt.Array.concat(
        s.seeds,
        [{x, y, vx: 0.0, vy: 5.0, age: 0.0, tgt, ph: randRange(s, 0.0, 6.28)}],
      )
    }
  }
}

let steerKoi = (s, k, dt) => {
  /* wander: pick a slow, lazy waypoint every few seconds */
  k.wt = k.wt -. dt
  if k.wt <= 0.0 {
    k.wt = randRange(s, 4.0, 9.0)
    let a = randRange(s, 0.0, 6.28318)
    let r = randRange(s, 0.0, 0.72)
    k.wtx = cx +. cos(a) *. rx *. r
    k.wty = cy +. sin(a) *. ry *. r
  }

  let ax = ref(0.0)
  let ay = ref(0.0)

  /* something interesting to swim toward: a sinking seed first, then a lantern
   * that is just waking. Each koi is a little curious in its own way. */
  let interest = ref(1.0e9)
  let ix = ref(0.0)
  let iy = ref(0.0)
  Belt.Array.forEach(s.seeds, sd => {
    let d = hypot(sd.x -. k.x, sd.y -. k.y)
    if d < interest.contents {
      interest.contents = d
      ix.contents = sd.x
      iy.contents = sd.y
    }
  })
  Belt.Array.forEach(s.lanterns, l => {
    if l.lit && l.awake < 0.9 {
      let d = hypot(l.x -. k.x, l.y -. k.y) *. 1.6
      if d < interest.contents {
        interest.contents = d
        ix.contents = l.x
        iy.contents = l.y
      }
    }
  })

  if interest.contents < 110.0 {
    let d = fmax(4.0, interest.contents)
    let pull = 26.0 *. (1.0 -. d /. 130.0)
    ax := (ix.contents -. k.x) /. d *. pull
    ay := (iy.contents -. k.y) /. d *. pull
  }

  /* the lazy waypoint, always faintly there */
  let wx = k.wtx -. k.x
  let wy = k.wty -. k.y
  let wd = fmax(20.0, hypot(wx, wy))
  ax := ax.contents +. wx /. wd *. 9.0
  ay := ay.contents +. wy /. wd *. 9.0

  /* keep away from the edge: ease back toward the middle near the rim */
  let a = Js.Math.atan2(~y=k.y -. cy, ~x=k.x -. cx, ())
  let rim = depth(k.x, k.y) /. wobble(a)
  if rim > 0.80 {
    let push = (rim -. 0.80) /. 0.20 *. 30.0
    ax := ax.contents -. (k.x -. cx) /. fmax(1.0, rim *. rx) *. push
    ay := ay.contents -. (k.y -. cy) /. fmax(1.0, rim *. ry) *. push
  }

  /* a soft wander of the tail */
  ax := ax.contents +. sin(s.t *. 0.7 +. k.ph) *. 5.0
  ay := ay.contents +. cos(s.t *. 0.53 +. k.ph *. 1.7) *. 5.0

  let motion = s.reduced ? 0.5 : 1.0
  k.vx = k.vx +. ax.contents *. dt *. motion
  k.vy = k.vy +. ay.contents *. dt *. motion

  /* water is not free: drift down, never bolt */
  let drag = drag(0.12, dt)
  k.vx = k.vx *. drag
  k.vy = k.vy *. drag

  let sp = hypot(k.vx, k.vy)
  let cap = (s.reduced ? 9.0 : 19.0) *. k.size
  if sp > cap {
    k.vx = k.vx /. sp *. cap
    k.vy = k.vy /. sp *. cap
  }
  k.x = k.x +. k.vx *. dt
  k.y = k.y +. k.vy *. dt

  /* never leave the pond, however curious */
  if !inWater(k.x, k.y) {
    let toC = Js.Math.atan2(~y=cy -. k.y, ~x=cx -. k.x, ())
    k.x = k.x +. cos(toC) *. 26.0 *. dt
    k.y = k.y +. sin(toC) *. 26.0 *. dt
    k.vx = cos(toC) *. 6.0
    k.vy = sin(toC) *. 6.0
  }

  let want = sp > 0.6 ? Js.Math.atan2(~y=k.vy, ~x=k.vx, ()) : k.ang
  /* turn slowly, like a fish, not a cursor */
  let mut = ref(k.ang)
  if fabs(want -. mut.contents) > 3.14159 {
    mut := mut.contents +. (want > mut.contents ? 6.28318 : -6.28318)
  }
  k.ang = mut.contents +. (want -. mut.contents) *. fmin(1.0, dt *. 3.2)
}

/* true means the seed is still sinking */
let stepSeed = (s, sd, dt) => {
  let l = s.lanterns[sd.tgt]
  if l.lit {
    /* someone else got there first: the seed just opens into motes */
    addMote(s, sd.x, sd.y)
    false
  } else {
    let dx = l.x -. sd.x
    let dy = l.y -. sd.y
    let d = fmax(1.0, hypot(dx, dy))
    /* sink gently, sway a little, be drawn to the lantern's dim warmth */
    let pull = 17.0
    sd.vx = sd.vx +. (dx /. d *. pull +. sin(s.t *. 1.3 +. sd.ph) *. 9.0) *. dt
    sd.vy = sd.vy +. (dy /. d *. pull *. 0.8 +. 7.0) *. dt
    let drag = drag(0.4, dt)
    sd.vx = sd.vx *. drag
    sd.vy = sd.vy *. drag
    let sp = hypot(sd.vx, sd.vy)
    if sp > 16.0 {
      sd.vx = sd.vx /. sp *. 16.0
      sd.vy = sd.vy /. sp *. 16.0
    }
    sd.x = sd.x +. sd.vx *. dt
    sd.y = sd.y +. sd.vy *. dt
    sd.age = sd.age +. dt

    if hypot(l.x -. sd.x, l.y -. sd.y) < 8.5 || sd.age > 16.0 {
      l.lit = true
      l.awake = fmax(l.awake, 0.02)
      s.events = Belt.Array.concat(s.events, ["wake"])
      for _i in 0 to 6 {
        addMote(s, l.x, l.y)
      }
      false
    } else {
      true
    }
  }
}

let step = (s, dt) => {
  let dt = fmax(0.0, fmin(0.1, dt))
  s.t = s.t +. dt
  s.settle = fmax(0.0, s.settle -. dt *. 2.2)
  s.bloom = fmax(0.0, s.bloom -. dt *. 1.15)

  s.ripples = Belt.Array.keep(s.ripples, r => {
    r.age = r.age +. dt
    r.age < r.life
  })

  s.seeds = Belt.Array.keep(s.seeds, sd => stepSeed(s, sd, dt))

  Belt.Array.forEach(s.koi, k => steerKoi(s, k, dt))

  s.motes = Belt.Array.keep(s.motes, m => {
    m.age = m.age +. dt
    m.y = m.y +. m.vy *. dt
    m.x = m.x +. sin(s.t *. 0.9 +. m.ph) *. 4.0 *. dt
    m.age < m.life
  })

  Belt.Array.forEach(s.lanterns, l => {
    if l.lit {
      l.awake = fmin(1.0, l.awake +. dt /. 2.4)
    }
  })

  if !s.complete && asleepLanterns(s) == 0 {
    s.complete = true
    s.doneAt = s.t
    s.events = Belt.Array.concat(s.events, ["done"])
    /* the whole pond lets out a breath: one wide, slow ring from the middle */
    addRipple(s, cx, cy, 104.0, 0.5, 0.0)
    addRipple(s, cx, cy, 142.0, 0.28, 0.7)
  }

  /* once awake, motes keep lifting off the lanterns, unhurried */
  if s.complete && Js.Math.random() < dt *. 2.2 {
    let pick = Js.Math.floor_float(Js.Math.random() *. 3.0)
    let i = pick < 1.0 ? 0 : pick < 2.0 ? 1 : 2
    addMote(s, s.lanterns[i].x, s.lanterns[i].y)
  }
}

let drainEvents = s => {
  let e = s.events
  s.events = []
  e
}

/* everything the renderer and the smoke check need, as plain JSON */
let snapshot = s => {
  let awake = Belt.Array.reduce(s.lanterns, 0.0, (a, l) => a +. l.awake)
  let lit = Belt.Array.reduce(s.lanterns, 0, (n, l) => l.lit ? n + 1 : n)
  Js.Dict.fromArray([
    ("awake", Js.Json.number(awake)),
    ("lit", Js.Json.number(float_of_int(lit))),
    ("complete", Js.Json.boolean(s.complete)),
    ("taps", Js.Json.number(float_of_int(s.taps))),
    ("ripples", Js.Json.number(float_of_int(Array.length(s.ripples)))),
    ("seeds", Js.Json.number(float_of_int(Array.length(s.seeds)))),
    ("motes", Js.Json.number(float_of_int(Array.length(s.motes)))),
    ("t", Js.Json.number(s.t)),
    (
      "koi",
      Js.Json.array(
        Belt.Array.map(s.koi, k =>
          Js.Json.object_(
            Js.Dict.fromArray([
              ("x", Js.Json.number(k.x)),
              ("y", Js.Json.number(k.y)),
              ("ang", Js.Json.number(k.ang)),
              ("size", Js.Json.number(k.size)),
              ("hue", Js.Json.number(float_of_int(k.hue))),
            ]),
          )
        ),
      ),
    ),
    (
      "lanterns",
      Js.Json.array(
        Belt.Array.map(s.lanterns, l =>
          Js.Json.object_(
            Js.Dict.fromArray([
              ("x", Js.Json.number(l.x)),
              ("y", Js.Json.number(l.y)),
              ("awake", Js.Json.number(l.awake)),
              ("lit", Js.Json.boolean(l.lit)),
            ]),
          )
        ),
      ),
    ),
    (
      "rippleList",
      Js.Json.array(
        Belt.Array.map(s.ripples, r =>
          Js.Json.object_(
            Js.Dict.fromArray([
              ("x", Js.Json.number(r.x)),
              ("y", Js.Json.number(r.y)),
              ("age", Js.Json.number(r.age)),
              ("delay", Js.Json.number(r.delay)),
              ("life", Js.Json.number(r.life)),
              ("maxR", Js.Json.number(r.maxR)),
              ("str", Js.Json.number(r.str)),
            ]),
          )
        ),
      ),
    ),
    (
      "seedList",
      Js.Json.array(
        Belt.Array.map(s.seeds, sd =>
          Js.Json.object_(
            Js.Dict.fromArray([
              ("x", Js.Json.number(sd.x)),
              ("y", Js.Json.number(sd.y)),
              ("age", Js.Json.number(sd.age)),
            ]),
          )
        ),
      ),
    ),
    (
      "moteList",
      Js.Json.array(
        Belt.Array.map(s.motes, m =>
          Js.Json.object_(
            Js.Dict.fromArray([
              ("x", Js.Json.number(m.x)),
              ("y", Js.Json.number(m.y)),
              ("age", Js.Json.number(m.age)),
              ("life", Js.Json.number(m.life)),
            ]),
          )
        ),
      ),
    ),
    ("settle", Js.Json.number(s.settle)),
    ("bloom", Js.Json.number(s.bloom)),
    ("bloomX", Js.Json.number(s.bloomX)),
    ("bloomY", Js.Json.number(s.bloomY)),
    ("doneAt", Js.Json.number(s.doneAt)),
  ])->Js.Json.object_
}

let read = s => snapshot(s)->Js.Json.stringify
