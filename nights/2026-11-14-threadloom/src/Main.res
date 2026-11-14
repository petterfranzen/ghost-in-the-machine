/* Threadloom — Main.res
   A quiet wooden loom: drag the shuttle to lay a weft, tap to beat it home,
   long-press a spool to re-dye the cloth, swipe to set the warp, and go still
   to meet the moth. The picture is only revealed by weaving it. */

/* ---------------------------------------------------------------- externals */

type dom
type ctx
type rect
type grad
type pointerEvt

@val external document: dom = "document"
@val external window: dom = "window"
@val external raf: (float => unit) => unit = "requestAnimationFrame"
@val external performance: dom = "performance"
@send external nowMs: dom => float = "now"
@send external querySelector: (dom, string) => Js.Nullable.t<dom> = "querySelector"
@send external getContext2d: (dom, string) => ctx = "getContext"
@send external addEventP: (dom, string, pointerEvt => unit) => unit = "addEventListener"
@send external addEvent0: (dom, string, unit => unit) => unit = "addEventListener"
@send external setPointerCapture: (dom, int) => unit = "setPointerCapture"
@send external releasePointerCapture: (dom, int) => unit = "releasePointerCapture"
@send external getRect: dom => rect = "getBoundingClientRect"
@get external rectLeft: rect => float = "left"
@get external rectTop: rect => float = "top"
@get external rectW: rect => float = "width"
@get external rectH: rect => float = "height"
@get external clientX: pointerEvt => float = "clientX"
@get external clientY: pointerEvt => float = "clientY"
@get external pointerId: pointerEvt => int = "pointerId"
@send external preventDefaultP: pointerEvt => unit = "preventDefault"
@set external setCanvasW: (dom, int) => unit = "width"
@set external setCanvasH: (dom, int) => unit = "height"
@send external setProperty: (dom, string, string) => unit = "setProperty"
@set external setText: (dom, string) => unit = "textContent"
@set external setClassName: (dom, string) => unit = "className"
@send external setAttribute: (dom, string, string) => unit = "setAttribute"
@get external getStyle: dom => dom = "style"
@val external localStorage: dom = "localStorage"
@get external dprProp: dom => float = "devicePixelRatio"
@send external getItem: (dom, string) => Js.Nullable.t<string> = "getItem"
@send external setItem: (dom, string, string) => unit = "setItem"

/* canvas 2d */
@set external setFill: (ctx, string) => unit = "fillStyle"
@set external setFillGrad: (ctx, grad) => unit = "fillStyle"
@set external setStroke: (ctx, string) => unit = "strokeStyle"
@set external setLineWidth: (ctx, float) => unit = "lineWidth"
@set external setAlpha: (ctx, float) => unit = "globalAlpha"
@set external setSmoothing: (ctx, bool) => unit = "imageSmoothingEnabled"
@set external setFont: (ctx, string) => unit = "font"
@set external setTextAlign: (ctx, string) => unit = "textAlign"
@send external fillRect: (ctx, float, float, float, float) => unit = "fillRect"
@send external beginPath: ctx => unit = "beginPath"
@send external moveTo: (ctx, float, float) => unit = "moveTo"
@send external lineTo: (ctx, float, float) => unit = "lineTo"
@send external strokePath: ctx => unit = "stroke"
@send external fillText: (ctx, string, float, float) => unit = "fillText"
@send external saveCtx: ctx => unit = "save"
@send external restoreCtx: ctx => unit = "restore"
@send external setTransformCtx: (ctx, float, float, float, float, float, float) => unit = "setTransform"
@send external linGrad: (ctx, float, float, float, float) => grad = "createLinearGradient"
@send external radGrad: (ctx, float, float, float, float, float, float) => grad = "createRadialGradient"
@send external addStop: (grad, float, string) => unit = "addColorStop"

/* ------------------------------------------------------------------ helpers */

let warp = Motifs.width
let rows = Motifs.height

let clampF = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v
let clampI = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v
let lerp = (a, b, t) => a +. (b -. a) *. t
let modi = (a, b) => { let r = a - b * (a / b); r < 0 ? r + b : r }
let at = (a, i) => Belt.Array.getUnsafe(a, i)
let atf = (a, i) => Belt.Array.getUnsafe(a, i)

let isin = (x, lo, hi) => x >= lo && x <= hi

let digit = c =>
  if c >= 48 && c <= 57 {
    c - 48
  } else if c >= 97 && c <= 102 {
    c - 87
  } else if c >= 65 && c <= 70 {
    c - 55
  } else {
    0
  }

@send external charCodeAtS: (string, int) => int = "charCodeAt"

let hexRgb = hex => {
  let d = i => digit(charCodeAtS(hex, i))
  (d(1) * 16 + d(2), d(3) * 16 + d(4), d(5) * 16 + d(6))
}

/* one channel, clamped, as two hex digits */
let hexOf: int => string = %raw(`(n => {
  const v = Math.max(0, Math.min(255, n | 0)).toString(16);
  return v.length === 1 ? "0" + v : v;
})`)

let rgbHex = ((r, g, b)) => "#" ++ hexOf(r) ++ hexOf(g) ++ hexOf(b)

let shade = (hex, t) => {
  let (r, g, b) = hexRgb(hex)
  let target = t < 0.0 ? 0.0 : 255.0
  let mix = c => Belt.Int.fromFloat(lerp(Belt.Int.toFloat(c), target, Js.Math.abs_float(t)))
  rgbHex((mix(r), mix(g), mix(b)))
}

let rgba = (hex, a) => {
  let (r, g, b) = hexRgb(hex)
  "rgba(" ++ string_of_int(r) ++ "," ++ string_of_int(g) ++ "," ++ string_of_int(b) ++ "," ++
  Js.Float.toString(a) ++ ")"
}

/* --------------------------------------------------------------- the loom */

type mote = {mutable mx: float, mutable my: float, mutable mvx: float, mutable mvy: float, mutable ml: float}
type pluck = {mutable px: float, mutable py: float, mutable pl: float}

type rowState = {
  mutable tons: array<int>,
  mutable gold: bool,
  mutable packed: float,
  mutable wiggle: float,
}

type loom = {
  mutable pic: int,
  mutable pal: int,
  mutable unlocked: int,
  mutable cloth: array<rowState>,
  mutable woven: int,
  mutable dir: int,
  mutable progress: float,
  mutable pos: float,
  mutable coast: float,
  mutable unbeaten: bool,
  mutable tension: int,
  mutable time: float,
  mutable idle: float,
  mutable moth: float,
  mutable mothX: float,
  mutable motes: array<mote>,
  mutable plucks: array<pluck>,
  mutable settle: float,
  mutable reveal: float,
  mutable complete: bool,
  mutable unlockAt: float,
  mutable completeAt: float,
  mutable holding: float,
  mutable spin: array<float>,
  mutable soundOn: bool,
  mutable firstGesture: bool,
  mutable touched: int,
  mutable hintGone: bool,
  mutable mothSeen: bool,
}

type view = {mutable vw: float, mutable vh: float, mutable dpr: float}

type layout = {
  s: float,
  clothX: float,
  clothTop: float,
  beamH: float,
  heddleY: float,
  spoolTop: float,
  spoolW: float,
  spoolGap: float,
  wellBottom: float,
  cw: float,
  ch: float,
}

type touchState = {
  mutable on: bool,
  mutable id: int,
  mutable x0: float,
  mutable y0: float,
  mutable x: float,
  mutable y: float,
  mutable t0: float,
  mutable moved: float,
  mutable spool: int,
  mutable swiped: bool,
  mutable fired: bool,
  mutable laying: bool,
  mutable armed: bool,
  mutable laid: bool,
}

/* ------------------------------------------------------------------- state */

let canvasRef: ref<option<dom>> = ref(None)
let ctxRef: ref<option<ctx>> = ref(None)
let captionRef: ref<option<dom>> = ref(None)
let hintRef: ref<option<dom>> = ref(None)
let soundBtn: ref<option<dom>> = ref(None)
let warpNameRef: ref<option<dom>> = ref(None)
let soundLabel: ref<option<dom>> = ref(None)
let frameAt = ref(0.0)
let frames = ref(0)

let view = {vw: 0.0, vh: 0.0, dpr: 1.0}

let makeCloth = pic =>
  Belt.Array.makeBy(rows, y => ({
    tons: at(at(Motifs.pictures, pic).grid, y),
    gold: Js.Math.random() < 0.11,
    packed: 0.0,
    wiggle: 0.0,
  }))

let loom = {
  pic: 0,
  pal: 0,
  unlocked: 3,
  cloth: makeCloth(0),
  woven: 0,
  dir: 1,
  progress: 0.0,
  pos: -1.0,
  coast: 0.0,
  unbeaten: false,
  tension: 1,
  time: 0.0,
  idle: 0.0,
  moth: 0.0,
  mothX: 0.4,
  motes: [],
  plucks: [],
  settle: 0.0,
  reveal: 0.0,
  complete: false,
  unlockAt: 0.0,
  completeAt: 0.0,
  holding: 0.0,
  spin: [0.0, 0.0, 0.0, 0.0],
  soundOn: false,
  firstGesture: true,
  touched: 0,
  hintGone: false,
  mothSeen: false,
}

let touch = {
  on: false,
  id: -1,
  x0: 0.0,
  y0: 0.0,
  x: 0.0,
  y: 0.0,
  t0: 0.0,
  moved: 0.0,
  spool: -1,
  swiped: false,
  fired: false,
  laying: false,
  armed: false,
  laid: false,
}

/* ------------------------------------------------------------------ layout */

let layoutOf = (cw, ch) => {
  let beamH = 34.0
  let spoolH = 86.0
  let availW = cw -. 24.0
  let availH = ch -. beamH -. 46.0 -. spoolH -. 92.0
  let sW = availW /. Belt.Int.toFloat(warp)
  let sH = availH /. Belt.Int.toFloat(rows)
  let s = Belt.Int.toFloat(clampI(Js.Math.floor(Js.Math.min_float(sW, sH)), 5, 24))
  let clothW = s *. Belt.Int.toFloat(warp)
  let clothX = Js.Math.floor_float((cw -. clothW) /. 2.0)
  let clothTop = beamH +. 44.0
  let wellBottom = ch -. spoolH -. 8.0
  let n = Belt.Int.toFloat(loom.unlocked)
  let spoolW = Js.Math.min_float(58.0, (cw -. 30.0) /. n -. 14.0)
  let spoolGap = (cw -. n *. spoolW) /. (n +. 1.0)
  {
    s: s,
    clothX: clothX,
    clothTop: clothTop,
    beamH: beamH,
    heddleY: clothTop -. 24.0,
    spoolTop: ch -. spoolH +. 16.0,
    spoolW: spoolW,
    spoolGap: spoolGap,
    wellBottom: wellBottom,
    cw: cw,
    ch: ch,
  }
}

let lay = ref(layoutOf(360.0, 620.0))

let fellOf = (ly: layout) => ly.clothTop +. ly.s *. Belt.Int.toFloat(loom.woven)
let warpX = (ly: layout, i: float) => ly.clothX +. (i +. 0.5) *. ly.s
let lowerBeamY = (ly: layout) => ly.wellBottom -. 10.0

let spoolAt = (ly: layout, x, y) => {
  let top = ly.spoolTop -. 8.0
  if y < top || y > top +. ly.spoolW +. 24.0 {
    -1
  } else {
    let i = Js.Math.floor((x -. ly.spoolGap) /. (ly.spoolW +. ly.spoolGap))
    if i < 0 || i >= loom.unlocked {
      -1
    } else {
      let x0 = ly.spoolGap +. Belt.Int.toFloat(i) *. (ly.spoolW +. ly.spoolGap)
      isin(x, x0 -. 8.0, x0 +. ly.spoolW +. 8.0) ? i : -1
    }
  }
}

/* -------------------------------------------------------------------- fx */

let spawnMotes = (ly: layout, n, x0, y0) =>
  for _ in 1 to n {
    let _ = Belt.Array.push(loom.motes, {
      mx: x0 +. (Js.Math.random() -. 0.5) *. ly.s *. 4.0,
      my: y0 +. (Js.Math.random() -. 0.5) *. 8.0,
      mvx: (Js.Math.random() -. 0.5) *. 26.0,
      mvy: -6.0 -. Js.Math.random() *. 18.0,
      ml: 1.0,
    })
  }

/* ----------------------------------------------------------------- sound ui */

let soundUI = (v: bool) =>
  switch (soundBtn.contents, soundLabel.contents) {
  | (Some(b), Some(l)) =>
    setAttribute(b, "aria-pressed", v ? "true" : "false")
    setAttribute(b, "aria-label", v ? "Turn sound off" : "Turn sound on")
    setText(l, v ? "Sound on" : "Sound off")
  | _ => ()
  }

let applySound = (v: bool) => {
  loom.soundOn = v
  loom.firstGesture = false
  soundUI(v)
  Sound.setEnabled(v)
  try {
    setItem(localStorage, "threadloom.sound", v ? "on" : "off")
  } catch {
  | _ => ()
  }
}

/* ----------------------------------------------------------------- playing */

let publish: string => unit = %raw(`(s => { window.threadloomState = s; })`)
let dbgAt = ref(0.0)

let setWarpName = () =>
  switch (warpNameRef.contents) {
  | Some(n) => setText(n, "\u00b7 " ++ at(Motifs.palettes, loom.pal).name ++ " threads")
  | None => ()
  }

let setCaption = (text, show) =>
  switch captionRef.contents {
  | Some(c) =>
    setText(c, text)
    setClassName(c, show ? "show" : "")
  | None => ()
  }

let rowComplete = () => {
  let r = at(loom.cloth, loom.woven)
  loom.woven = loom.woven + 1
  loom.unbeaten = true
  loom.progress = 0.0
  loom.dir = -loom.dir
  loom.pos = loom.dir == 1 ? -1.0 : Belt.Int.toFloat(warp) +. 1.0
  loom.coast = 0.0
  if touch.on {
    touch.laid = true
  }
  Sound.event(Sound.RowLaid)
  if r.gold {
    Sound.event(Sound.Gold)
  }
  if loom.woven >= rows {
    loom.complete = true
    loom.reveal = 0.0001
    loom.unlockAt = loom.time +. 2.8
    loom.completeAt = loom.time
    Sound.event(Sound.Complete(loom.pal))
    setCaption(at(Motifs.pictures, loom.pic).name, true)
  }
}

let beat = () => {
  if loom.unbeaten {
    at(loom.cloth, loom.woven - 1).packed = 1.0
    loom.unbeaten = false
    loom.settle = 1.0
    let ly = lay.contents
    spawnMotes(ly, 7, Js.Math.random() *. ly.cw, fellOf(ly))
    Sound.event(Sound.Beat(1.0))
    loom.touched = loom.touched + 1
  }
}

let pluckAt = (x, y) => {
  if loom.woven > 0 {
    let ly = lay.contents
    let r = clampI(Js.Math.floor((y -. ly.clothTop) /. ly.s), 0, loom.woven - 1)
    at(loom.cloth, r).wiggle = 1.0
    let _ = Belt.Array.push(loom.plucks, {px: x, py: y, pl: 1.0})
    Sound.event(Sound.Pluck(r))
    loom.touched = loom.touched + 1
  }
}

let newWarp = () => {
  let pic = modi(loom.pic + 1, Array.length(Motifs.pictures))
  loom.pic = pic
  loom.cloth = makeCloth(pic)
  loom.woven = 0
  loom.dir = 1
  loom.progress = 0.0
  loom.pos = -1.0
  loom.coast = 0.0
  loom.unbeaten = false
  loom.complete = false
  loom.reveal = 0.0
  loom.unlockAt = 0.0
  loom.idle = 0.0
  loom.mothSeen = false
  Sound.event(Sound.NewWarp)
  setCaption("", false)
}

let setPos = x => {
  let ly = lay.contents
  let raw = clampF((x -. ly.clothX) /. ly.s, 0.0, Belt.Int.toFloat(warp))
  if loom.dir == 1 {
    loom.progress = Js.Math.max_float(loom.progress, raw)
    loom.pos = loom.progress
  } else {
    loom.progress = Js.Math.max_float(loom.progress, Belt.Int.toFloat(warp) -. raw)
    loom.pos = Belt.Int.toFloat(warp) -. loom.progress
  }
  loom.idle = 0.0
  if loom.progress >= Belt.Int.toFloat(warp) -. 0.5 {
    rowComplete()
  }
}

/* ------------------------------------------------------------------- update */

let update = (dt: float) => {
  loom.time = loom.time +. dt
  loom.idle = loom.idle +. dt
  loom.settle = Js.Math.max_float(0.0, loom.settle -. dt *. 5.0)
  if loom.reveal > 0.0 {
    loom.reveal = clampF(loom.reveal +. dt *. 0.5, 0.0, 1.0)
  }
  if loom.unlockAt > 0.0 && loom.time > loom.unlockAt {
    loom.unlockAt = 0.0
    if loom.unlocked < 4 {
      loom.unlocked = 4
      Sound.event(Sound.Unlock)
      setCaption(at(Motifs.pictures, loom.pic).name ++ "  \u00b7  tap the cloth to warp a new one", true)
      lay := layoutOf(view.vw, view.vh)
    }
  }
  if loom.coast > 0.0 {
    loom.progress = loom.progress +. dt *. Belt.Int.toFloat(warp) /. 0.30
    loom.pos = loom.dir == 1 ? loom.progress : Belt.Int.toFloat(warp) -. loom.progress
    if loom.progress >= Belt.Int.toFloat(warp) -. 0.5 {
      rowComplete()
    }
  }
  let want = loom.idle > 11.0 ? 1.0 : 0.0
  loom.moth = lerp(loom.moth, want, dt *. 0.9)
  if want > 0.0 && !loom.mothSeen && loom.idle > 12.0 {
    loom.mothSeen = true
    Sound.event(Sound.Moth)
    Sound.event(Sound.Rest(true))
  }
  if want == 0.0 && loom.mothSeen && loom.idle < 1.0 {
    loom.mothSeen = false
    Sound.event(Sound.Rest(false))
  }
  loom.mothX = clampF(loom.mothX +. dt *. Js.Math.sin(loom.time *. 0.19) *. 0.035, 0.18, 0.82)
  loom.holding = touch.on && touch.spool >= 0 && !touch.fired ? loom.holding +. dt : 0.0
  if loom.holding > 1.6 {
    loom.holding = 1.6
  }
  if loom.holding > 0.5 && !touch.fired {
    touch.fired = true
    let p = touch.spool
    if p >= 0 && p < loom.unlocked && p != loom.pal {
      loom.pal = p
      Sound.event(Sound.Palette(p))
      setWarpName()
    } else {
      Sound.event(Sound.SpoolTap(p))
    }
    loom.touched = loom.touched + 1
  }
  for i in 0 to Array.length(loom.spin) - 1 {
    let v = at(loom.spin, i)
    let _ = Belt.Array.set(loom.spin, i, Js.Math.max_float(0.0, v -. dt *. 3.2))
  }
  loom.motes = Belt.Array.keep(loom.motes, m => {
    m.ml = m.ml -. dt *. 0.7
    m.mx = m.mx +. m.mvx *. dt
    m.my = m.my +. m.mvy *. dt
    m.mvy = m.mvy +. dt *. 16.0
    m.ml > 0.0
  })
  loom.plucks = Belt.Array.keep(loom.plucks, p => {
    p.pl = p.pl -. dt *. 1.5
    p.pl > 0.0
  })
  Belt.Array.forEachWithIndex(loom.cloth, (_i, r) =>
    if r.wiggle > 0.0 {
      r.wiggle = Js.Math.max_float(0.0, r.wiggle -. dt *. 1.3)
    }
  )
  if !loom.hintGone && (loom.time > 30.0 || loom.touched >= 5) {
    loom.hintGone = true
    switch hintRef.contents {
    | Some(h) => setClassName(h, "gone")
    | None => ()
    }
  }
  Sound.tick(dt, touch.laying || loom.coast > 0.0 || loom.progress > 0.0)
  if loom.time > dbgAt.contents {
    dbgAt.contents = loom.time +. 0.2
    publish(
      "woven=" ++ string_of_int(loom.woven) ++
      ";pal=" ++ string_of_int(loom.pal) ++
      ";complete=" ++ string_of_int(loom.complete ? 1 : 0) ++
      ";unbeaten=" ++ string_of_int(loom.unbeaten ? 1 : 0) ++
      ";tension=" ++ string_of_int(loom.tension) ++
      ";unlocked=" ++ string_of_int(loom.unlocked) ++
      ";moth=" ++ Js.Float.toString(Js.Math.round(loom.moth *. 100.0) /. 100.0) ++
      ";fell=" ++ Js.Float.toString(Js.Math.round(fellOf(lay.contents))) ++
      ";clothTop=" ++ Js.Float.toString(Js.Math.round(lay.contents.clothTop)) ++
      ";clothX=" ++ Js.Float.toString(Js.Math.round(lay.contents.clothX)) ++
      ";scale=" ++ Js.Float.toString(Js.Math.round(lay.contents.s)) ++
      ";pic=" ++ string_of_int(loom.pic) ++
      ";well=" ++ Js.Float.toString(Js.Math.round(lay.contents.wellBottom)) ++
      ";spoolY=" ++ Js.Float.toString(Js.Math.round(lay.contents.spoolTop +. lay.contents.spoolW /. 2.0)) ++
      ";spool0=" ++ Js.Float.toString(Js.Math.round(lay.contents.spoolGap +. lay.contents.spoolW /. 2.0)) ++
      ";spool1=" ++ Js.Float.toString(Js.Math.round(2.0 *. lay.contents.spoolGap +. lay.contents.spoolW *. 1.5)) ++
      ";spool2=" ++ Js.Float.toString(Js.Math.round(3.0 *. lay.contents.spoolGap +. lay.contents.spoolW *. 2.5)) ++
      ";sound=" ++ string_of_int(loom.soundOn ? 1 : 0) ++
      ";ctx=" ++ Sound.ctxState() ++
      ";frames=" ++ string_of_int(frames.contents) ++
      ";idle=" ++ Js.Float.toString(Js.Math.round(loom.idle *. 10.0) /. 10.0) ++
      ";ton=" ++ string_of_int(touch.on ? 1 : 0) ++
      ";tlay=" ++ string_of_int(touch.laying ? 1 : 0) ++
      ";tfired=" ++ string_of_int(touch.fired ? 1 : 0) ++
      ";tmoved=" ++ Js.Float.toString(Js.Math.round(touch.moved))
    )
  }
}

/* -------------------------------------------------------------------- paint */

let box = (c, x, y, w, h, colour) => {
  setFill(c, colour)
  fillRect(c, x, y, w, h)
}

let paintFrame = (c, ly) => {
  let wood = "#4a3728"
  let woodD = "#2c2016"
  let woodL = "#6b5340"
  let clothW = ly.s *. Belt.Int.toFloat(warp)
  let x0 = ly.clothX -. ly.s *. 2.2
  let x1 = ly.clothX +. clothW +. ly.s *. 2.2
  let w = x1 -. x0
  /* side posts */
  box(c, x0, 0.0, ly.s *. 1.3, ly.spoolTop, wood)
  box(c, x0 +. ly.s *. 1.0, 0.0, ly.s *. 0.3, ly.spoolTop, woodD)
  box(c, x1 -. ly.s *. 1.3, 0.0, ly.s *. 1.3, ly.spoolTop, wood)
  box(c, x1 -. ly.s *. 1.3, 0.0, ly.s *. 0.3, ly.spoolTop, woodL)
  /* top beam */
  box(c, x0, 0.0, w, ly.beamH, wood)
  box(c, x0, 0.0, w, 3.0, woodL)
  box(c, x0, ly.beamH -. 4.0, w, 4.0, woodD)
  for i in 0 to 3 {
    box(c, x0, 6.0 +. Belt.Int.toFloat(i) *. 7.0, w, 1.0, rgba("#2c2016", 0.5))
  }
  /* heddle bars */
  box(c, x0 +. ly.s *. 0.6, ly.heddleY, w -. ly.s *. 1.2, 6.0, wood)
  box(c, x0 +. ly.s *. 0.6, ly.heddleY, w -. ly.s *. 1.2, 1.5, woodL)
  box(c, x0 +. ly.s *. 0.6, ly.heddleY +. 7.0, w -. ly.s *. 1.2, 5.0, rgba("#4a3728", 0.85))
  /* lower beam, where the unwoven warp ends */
  let lb = lowerBeamY(ly)
  box(c, x0, lb, w, 10.0, wood)
  box(c, x0, lb, w, 2.0, woodL)
  box(c, x0, lb +. 8.0, w, 2.0, woodD)
  /* the beater (reed) rides at the fell line */
  let fell = fellOf(ly)
  let drop = loom.unbeaten ? 1.0 +. Js.Math.sin(loom.time *. 3.4) *. 0.35 : 0.0
  let by = fell +. drop *. ly.s *. 0.55
  box(c, ly.clothX -. ly.s *. 1.6, by, clothW +. ly.s *. 3.2, 7.0, wood)
  box(c, ly.clothX -. ly.s *. 1.6, by, clothW +. ly.s *. 3.2, 2.0, woodL)
  if loom.unbeaten {
    setAlpha(c, 0.35 +. 0.25 *. Js.Math.sin(loom.time *. 3.0))
    box(c, ly.clothX, by +. 7.0, clothW, 1.5, "#e8d9a8")
    setAlpha(c, 1.0)
  }
}

let paintWarp = (c, ly) => {
  let base = at(at(Motifs.palettes, loom.pal).colours, 0)
  let strand = shade(base, 0.55)
  let amp = at([2.4, 1.4, 0.7], loom.tension)
  let fell = fellOf(ly)
  let lb = lowerBeamY(ly)
  setStroke(c, rgba(strand, 0.44))
  setLineWidth(c, 1.0)
  for i in 0 to warp - 1 {
    let fi = Belt.Int.toFloat(i)
    let phase = Js.Math.sin(loom.time *. 0.65 +. fi *. 0.33)
    let drift = Js.Math.sin(loom.time *. 0.21 +. fi *. 1.1) *. 0.4
    let x = warpX(ly, fi) +. phase *. amp *. (0.7 +. drift)
    beginPath(c)
    moveTo(c, x, fell +. 4.0)
    lineTo(c, x +. phase *. amp *. 0.3, lb)
    strokePath(c)
  }
  /* the lean of unwoven threads against the lower beam */
  setStroke(c, rgba(strand, 0.16))
  setLineWidth(c, 1.0)
  beginPath(c)
  moveTo(c, ly.clothX, lb -. 1.0)
  lineTo(c, ly.clothX +. ly.s *. Belt.Int.toFloat(warp), lb -. 1.0)
  strokePath(c)
}

let paintCloth = (c, ly) => {
  let cols = at(Motifs.palettes, loom.pal).colours
  let table = Belt.Array.makeBy(5, i => {
    let base = at(cols, i)
    (base, shade(base, -0.05), shade(base, 0.035), shade(base, 0.45))
  })
  let fell = fellOf(ly)
  Belt.Array.forEachWithIndex(loom.cloth, (y, r) => {
    if y < loom.woven {
      let last = y == loom.woven - 1
      let yOff = last ? (loom.unbeaten ? ly.s *. 0.40 : 0.0) -. loom.settle *. ly.s *. 0.34 : 0.0
      let yBase = ly.clothTop +. Belt.Int.toFloat(y) *. ly.s +. yOff
      let brightness = last && loom.unbeaten ? 0.10 : 0.0
      for i in 0 to warp - 1 {
        let tone = at(r.tons, i)
        let (_b, dk, lt, _br) = at(table, tone)
        let col = modi(i + y, 2) == 0 ? dk : lt
        let x = warpX(ly, Belt.Int.toFloat(i)) +.
          (r.wiggle > 0.0 ? Js.Math.sin(loom.time *. 19.0 +. Belt.Int.toFloat(i) *. 0.7) *. r.wiggle *. 1.3 : 0.0)
        setFill(c, brightness > 0.0 ? shade(col, brightness) : col)
        fillRect(c, x -. ly.s /. 2.0, yBase, ly.s +. 0.5, ly.s +. 0.5)
        /* the weft thread resting on the warp: one quiet hairline at the row's foot */
        setFill(c, rgba("#000000", 0.09))
        fillRect(c, x -. ly.s /. 2.0, yBase +. ly.s *. 0.86, ly.s +. 0.5, ly.s *. 0.14)
        if r.gold && modi(i * 3 + y, 4) != 0 {
          /* a fleck of the golden weft, catching the light */
          let tw = 0.5 +. 0.5 *. Js.Math.sin(loom.time *. 1.7 +. Belt.Int.toFloat(i) *. 0.7 +. Belt.Int.toFloat(y) *. 1.1)
          setFill(c, rgba("#ffe6a8", 0.10 +. 0.22 *. tw))
          fillRect(c, x -. ly.s /. 2.0, yBase, ly.s +. 0.5, ly.s +. 0.5)
        }
      }
    }
  })
  /* a soft light falling down the cloth */
  if loom.woven > 0 {
    let h = ly.s *. Belt.Int.toFloat(loom.woven)
    let g = linGrad(c, 0.0, ly.clothTop, 0.0, ly.clothTop +. h)
    addStop(g, 0.0, "rgba(255,246,224,0.10)")
    addStop(g, 0.6, "rgba(255,246,224,0.0)")
    addStop(g, 1.0, "rgba(0,0,0,0.16)")
    setFillGrad(c, g)
    fillRect(c, ly.clothX, ly.clothTop, ly.s *. Belt.Int.toFloat(warp), h)
  }
  /* the fell line itself: a thread pulled taut */
  setFill(c, rgba("#f4ead0", 0.22))
  fillRect(c, ly.clothX, fell -. 1.0, ly.s *. Belt.Int.toFloat(warp), 1.0)
}

let paintShuttle = (c, ly) => {
  let fell = fellOf(ly)
  let clothW = ly.s *. Belt.Int.toFloat(warp)
  if loom.pos > -0.6 && loom.pos < Belt.Int.toFloat(warp) +. 0.6 {
    let x = warpX(ly, loom.pos)
    let y = fell +. ly.s *. 0.1
    /* the thread just laid, behind the shuttle */
    if loom.progress > 0.2 {
      let from = loom.dir == 1 ? ly.clothX : ly.clothX +. clothW
      let to_ = x
      setStroke(c, shade(at(at(Motifs.palettes, loom.pal).colours, 3), 0.2))
      setLineWidth(c, Js.Math.max_float(1.5, ly.s *. 0.22))
      beginPath(c)
      moveTo(c, from, y -. 2.0)
      lineTo(c, to_, y -. 2.0)
      strokePath(c)
    }
    /* the boat */
    box(c, x -. ly.s *. 1.4, y, ly.s *. 2.8, ly.s *. 0.55, "#5b4433")
    box(c, x -. ly.s *. 1.6, y -. ly.s *. 0.35, ly.s *. 3.2, ly.s *. 0.4, "#7a5c44")
    box(c, x -. ly.s *. 0.9, y +. ly.s *. 0.5, ly.s *. 1.8, ly.s *. 0.5, shade(at(at(Motifs.palettes, loom.pal).colours, 3), 0.1))
    box(c, x -. ly.s *. 0.9, y +. ly.s *. 0.5, ly.s *. 1.8, ly.s *. 0.18, shade(at(at(Motifs.palettes, loom.pal).colours, 4), 0.2))
  }
}

let paintSpools = (c, ly) => {
  setTextAlign(c, "center")
  setFont(c, "11px ui-monospace, SFMono-Regular, Menlo, monospace")
  let n = loom.unlocked
  for i in 0 to n - 1 {
    let fi = Belt.Int.toFloat(i)
    let x0 = ly.spoolGap +. fi *. (ly.spoolW +. ly.spoolGap)
    let spin = at(loom.spin, i)
    let lift = (i == loom.pal ? 5.0 : 0.0) +. spin *. 3.0
    let y0 = ly.spoolTop -. lift
    let cols = at(Motifs.palettes, i).colours
    let appear = i == 3 && loom.unlocked < 4 ? 0.0 : 1.0
    let w = ly.spoolW
    let hh = ly.spoolW *. 0.66
    /* flanges */
    box(c, x0 -. 3.0, y0, 5.0, hh +. 12.0, "#3d2d20")
    box(c, x0 +. w -. 2.0, y0, 5.0, hh +. 12.0, "#3d2d20")
    /* wound thread: five bands of the palette */
    let bands = 5
    for k in 0 to bands - 1 {
      let col = at(cols, k)
      let by = y0 +. 6.0 +. Belt.Int.toFloat(k) *. (hh /. Belt.Int.toFloat(bands))
      box(c, x0, by, w, hh /. Belt.Int.toFloat(bands) +. 0.6, k == 4 && i == loom.pal ? shade(col, 0.06) : col)
      box(c, x0, by, w, 1.0, rgba("#ffffff", 0.07))
    }
    /* the spool's wooden axis peeking out */
    box(c, x0 +. w *. 0.42, y0 +. 1.0, w *. 0.16, hh +. 10.0, "#4a3728")
    if i == loom.pal {
      setAlpha(c, 0.55)
      box(c, x0 -. 4.0, y0 -. 2.0, w +. 8.0, 2.0, "#e8dcbb")
      setAlpha(c, 1.0)
    }
    if appear > 0.0 && loom.unlocked >= 4 || i < 3 {
      setFill(c, i == loom.pal ? "#e6ddc2" : rgba("#cfc7ad", 0.62))
      fillText(c, at(Motifs.palettes, i).name, x0 +. w /. 2.0, y0 +. hh +. 26.0)
    }
    /* the hold ring: a long press fills it */
    if touch.on && touch.spool == i && !touch.fired {
      let frac = clampF(loom.holding /. 0.5, 0.0, 1.0)
      box(c, x0, y0 +. hh +. 40.0, w, 3.0, rgba("#ffffff", 0.14))
      box(c, x0, y0 +. hh +. 40.0, w *. frac, 3.0, "#e8dcbb")
    }
  }
}

let paintMoth = (c, ly) => {
  if loom.moth > 0.03 {
    let clothW = ly.s *. Belt.Int.toFloat(warp)
    let x = ly.clothX +. loom.mothX *. clothW
    let y = ly.beamH -. 6.0 -. loom.moth *. 2.0
    let flap = Js.Math.sin(loom.time *. 9.0)
    setAlpha(c, loom.moth)
    let u = Js.Math.max_float(1.0, ly.s *. 0.22)
    /* wings */
    box(c, x -. u *. 3.4, y -. u *. (1.4 +. flap *. 0.5), u *. 2.6, u *. 1.7, "#ded5c0")
    box(c, x +. u *. 0.8, y -. u *. (1.4 +. flap *. 0.5), u *. 2.6, u *. 1.7, "#ded5c0")
    box(c, x -. u *. 3.0, y +. u *. (0.2 +. flap *. 0.3), u *. 2.2, u *. 1.4, "#c9c0a8")
    box(c, x +. u *. 0.8, y +. u *. (0.2 +. flap *. 0.3), u *. 2.2, u *. 1.4, "#c9c0a8")
    /* body and antennae */
    box(c, x -. u *. 0.5, y -. u *. 1.2, u, u *. 3.0, "#3a3229")
    box(c, x -. u *. 1.4, y -. u *. 3.0, u *. 0.5, u *. 1.0, "#3a3229")
    box(c, x +. u *. 1.0, y -. u *. 3.0, u *. 0.5, u *. 1.0, "#3a3229")
    setAlpha(c, 1.0)
  }
}

let paintFx = (c, ly) => {
  Belt.Array.forEach(loom.motes, m => {
    setFill(c, rgba("#ffe9c0", m.ml *. 0.45))
    fillRect(c, m.mx, m.my, 2.0, 2.0)
  })
  Belt.Array.forEach(loom.plucks, p => {
    let r = (1.0 -. p.pl) *. ly.s *. 2.2
    setStroke(c, rgba("#fff3d6", p.pl *. 0.30))
    setLineWidth(c, 1.0)
    beginPath(c)
    moveTo(c, p.px -. r, p.py -. r)
    lineTo(c, p.px +. r, p.py -. r)
    lineTo(c, p.px +. r, p.py +. r)
    lineTo(c, p.px -. r, p.py +. r)
    lineTo(c, p.px -. r, p.py -. r)
    strokePath(c)
  })
}

let paint = () => {
  switch ctxRef.contents {
  | None => ()
  | Some(c) =>
    let ly = lay.contents
    setTransformCtx(c, view.dpr, 0.0, 0.0, view.dpr, 0.0, 0.0)
    setSmoothing(c, false)
    let g = linGrad(c, 0.0, 0.0, 0.0, ly.ch)
    addStop(g, 0.0, "#0b0d11")
    addStop(g, 0.5, "#131720")
    addStop(g, 1.0, "#0a0c0f")
    setFillGrad(c, g)
    fillRect(c, 0.0, 0.0, ly.cw, ly.ch)
    if loom.reveal > 0.0 {
      let cx = ly.clothX +. ly.s *. Belt.Int.toFloat(warp) /. 2.0
      let cy = ly.clothTop +. ly.s *. Belt.Int.toFloat(rows) /. 2.0
      let rg = radGrad(c, cx, cy, 4.0, cx, cy, ly.s *. 26.0)
      addStop(rg, 0.0, rgba("#ffd9a0", 0.20 *. loom.reveal))
      addStop(rg, 1.0, rgba("#ffd9a0", 0.0))
      setFillGrad(c, rg)
      fillRect(c, 0.0, 0.0, ly.cw, ly.ch)
    }
    paintFrame(c, ly)
    paintWarp(c, ly)
    paintCloth(c, ly)
    paintShuttle(c, ly)
    paintSpools(c, ly)
    paintMoth(c, ly)
    paintFx(c, ly)
  }
}

/* -------------------------------------------------------------------- input */

let toLocal = e =>
  switch canvasRef.contents {
  | None => (0.0, 0.0)
  | Some(cv) =>
    let r = getRect(cv)
    (clientX(e) -. rectLeft(r), clientY(e) -. rectTop(r))
  }

let firstGesture = () => {
  if loom.firstGesture {
    loom.firstGesture = false
    if loom.soundOn {
      Sound.setEnabled(true)
    } else {
      Sound.resumeIfNeeded()
    }
  }
}

let onDown = e => {
  preventDefaultP(e)
  firstGesture()
  loom.idle = 0.0
  let (x, y) = toLocal(e)
  touch.on = true
  touch.id = pointerId(e)
  touch.x0 = x
  touch.y0 = y
  touch.x = x
  touch.y = y
  touch.t0 = loom.time
  touch.moved = 0.0
  touch.swiped = false
  touch.fired = false
  touch.laying = false
  let ly = lay.contents
  touch.spool = spoolAt(ly, x, y)
  /* the well in front of the cloth is where the shuttle lives; the weft only
     starts to lay once the thumb actually travels sideways, so a plain tap
     there is still a beat. */
  touch.armed = touch.spool < 0 && !loom.complete && y > fellOf(ly) -. ly.s *. 1.0
  if touch.armed {
    touch.laid = false
  }
  switch canvasRef.contents {
  | Some(cv) =>
    try {
      setPointerCapture(cv, pointerId(e))
    } catch {
    | _ => ()
    }
  | None => ()
  }
}

let onMove = e => {
  if touch.on {
    let (x, y) = toLocal(e)
    touch.moved = touch.moved +. Js.Math.abs_float(x -. touch.x) +. Js.Math.abs_float(y -. touch.y)
    touch.x = x
    touch.y = y
    let dxNow = x -. touch.x0
    let dyNow = y -. touch.y0
    if touch.armed && !touch.laying && Js.Math.abs_float(dxNow) > 7.0 &&
       Js.Math.abs_float(dxNow) > Js.Math.abs_float(dyNow) *. 0.7 {
      touch.laying = true
      Sound.event(Sound.ShuttleStart)
    }
    if touch.laying {
      setPos(x)
    } else if !touch.swiped && touch.spool < 0 {
      let dx = dxNow
      let dy = dyNow
      if Js.Math.abs_float(dy) > 44.0 && Js.Math.abs_float(dy) > Js.Math.abs_float(dx) *. 1.3 {
        touch.swiped = true
        let up = dy < 0.0
        let t = clampI(loom.tension + (up ? 1 : -1), 0, 2)
        if t != loom.tension {
          loom.tension = t
          Sound.setTension(t)
          Sound.event(Sound.Tension(t, up))
          loom.touched = loom.touched + 1
        }
      }
    }
  }
}

let onUp = e => {
  if touch.on {
    let (x, y) = toLocal(e)
    let quick = loom.time -. touch.t0 < 0.6
    let still = touch.moved < 16.0
    if touch.laying {
      if !touch.laid && loom.progress < Belt.Int.toFloat(warp) -. 0.5 {
        loom.coast = 1.0
      }
    } else if !touch.fired && !touch.swiped && quick && still {
      if touch.spool >= 0 {
        Sound.event(Sound.SpoolTap(touch.spool))
        let _ = Belt.Array.set(loom.spin, touch.spool, 1.0)
        loom.touched = loom.touched + 1
      } else if loom.complete && loom.time > loom.completeAt +. 3.5 &&
                y < fellOf(lay.contents) +. lay.contents.s {
        newWarp()
      } else if loom.unbeaten {
        beat()
      } else if y < fellOf(lay.contents) +. lay.contents.s {
        pluckAt(x, y)
      }
    }
    touch.on = false
    touch.laying = false
    touch.spool = -1
  }
}

let onCancel = _e => {
  touch.on = false
  touch.laying = false
  touch.spool = -1
}

/* --------------------------------------------------------------------- boot */

let dprOf = w => dprProp(w)

let ensureSize = () =>
  switch canvasRef.contents {
  | None => ()
  | Some(cv) =>
    let r = getRect(cv)
    let w = rectW(r)
    let h = rectH(r)
    let d = dprOf(window)
    let dpr = d != d || d < 1.0 ? 1.0 : Js.Math.min_float(d, 2.0)
    if w != view.vw || h != view.vh || dpr != view.dpr {
      view.vw = w
      view.vh = h
      view.dpr = dpr
      setCanvasW(cv, Js.Math.floor(w *. dpr))
      setCanvasH(cv, Js.Math.floor(h *. dpr))
      lay := layoutOf(w, h)
    }
  }

let rec loop = () => {
  ensureSize()
  let t = nowMs(performance) /. 1000.0
  let dt = clampF(t -. frameAt.contents, 0.0, 0.05)
  frameAt.contents = t
  frames := frames.contents + 1
  update(dt)
  paint()
  raf(_ => loop())
}

let qsel = sel => Js.Nullable.toOption(querySelector(document, sel))

let init = () => {
  switch qsel("#loom") {
  | Some(cv) =>
    canvasRef := Some(cv)
    ctxRef := Some(getContext2d(cv, "2d"))
    addEventP(cv, "pointerdown", onDown)
    addEventP(cv, "pointermove", onMove)
    addEventP(cv, "pointerup", onUp)
    addEventP(cv, "pointercancel", onCancel)
    addEventP(cv, "contextmenu", e => preventDefaultP(e))
    addEventP(cv, "touchstart", e => preventDefaultP(e))
  | None => ()
  }
  captionRef := qsel("#caption")
  hintRef := qsel("#hint")
  soundBtn := qsel("#sound")
  soundLabel := qsel("#soundLabel")
  warpNameRef := qsel("#warpName")
  setWarpName()
  let remembered = try {
    switch Js.Nullable.toOption(getItem(localStorage, "threadloom.sound")) {
    | Some(v) => v == "on"
    | None => false
    }
  } catch {
  | _ => false
  }
  loom.soundOn = remembered
  soundUI(remembered)
  switch soundBtn.contents {
  | Some(b) => addEvent0(b, "click", () => applySound(!loom.soundOn))
  | None => ()
  }
  addEvent0(document, "visibilitychange", () => Sound.resumeIfNeeded())
  addEvent0(window, "resize", () => lay := layoutOf(view.vw, view.vh))
  ensureSize()
  raf(_ => loop())
}

init()
