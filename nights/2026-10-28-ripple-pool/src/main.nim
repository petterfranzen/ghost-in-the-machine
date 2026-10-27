import std/[jsffi, dom, math]

# ---- Browser handles -------------------------------------------------------
let canvas = document.getElementById("pool").toJs
let ctx = canvas.getContext("2d")
let soundBtn = document.getElementById("sound-toggle").toJs

proc nowMs(): float {.importjs: "performance.now()".}
proc newAudioContext(): JsObject {.importjs: "new (window.AudioContext || window.webkitAudioContext)()".}

# ---- State -----------------------------------------------------------------
type
  Ripple = object
    x, y: float
    r0, r1: float
    t0: float
    dur: float

var ripples: seq[Ripple] = @[]
var stones: seq[tuple[x, y: float]] = @[]
var audioCtx: JsObject = nil
var soundOn = false

# ---- Resize ----------------------------------------------------------------
proc resize() =
  let dpr = window.devicePixelRatio
  canvas.width = (window.innerWidth.float * dpr).int
  canvas.height = (window.innerHeight.float * dpr).int
  ctx.setTransform(dpr, 0.0, 0.0, dpr, 0.0, 0.0)

# ---- Sound -----------------------------------------------------------------
proc initAudio() =
  if audioCtx.isNil:
    audioCtx = newAudioContext()

proc plink(freq: float) =
  if audioCtx.isNil or not soundOn: return
  let osc = audioCtx.createOscillator()
  let gain = audioCtx.createGain()
  osc.type = "sine"
  osc.frequency.value = freq
  let t = audioCtx.currentTime.to(float)
  gain.gain.setValueAtTime(0.0, t)
  gain.gain.linearRampToValueAtTime(0.07, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(t)
  osc.stop(t + 0.95)

# ---- Drawing ---------------------------------------------------------------
proc drawBackground(t: float) =
  let w = canvas.width.to(float) / window.devicePixelRatio
  let h = canvas.height.to(float) / window.devicePixelRatio
  let g = ctx.createLinearGradient(0.0, 0.0, 0.0, h)
  g.addColorStop(0.0, "rgb(12, 22, 45)")
  g.addColorStop(0.45, "rgb(20, 42, 78)")
  g.addColorStop(1.0, "rgb(10, 20, 40)")
  ctx.fillStyle = g
  ctx.fillRect(0.0, 0.0, w, h)

  let pulse = 0.5 + 0.5 * sin(t * 0.0004)
  let cx = w * 0.5
  let cy = h * 0.42
  let rr = min(w, h) * (0.40 + 0.06 * pulse)
  let glow = ctx.createRadialGradient(cx, cy, 0.0, cx, cy, rr)
  glow.addColorStop(0.0, "rgba(90, 150, 220, " & $(0.10 + 0.05 * pulse) & ")")
  glow.addColorStop(1.0, "rgba(90, 150, 220, 0.0)")
  ctx.fillStyle = glow
  ctx.fillRect(0.0, 0.0, w, h)

proc drawStones() =
  for s in stones:
    ctx.beginPath()
    ctx.arc(s.x, s.y, 4.0, 0.0, 2.0 * PI)
    ctx.fillStyle = "rgba(40, 70, 110, 0.85)"
    ctx.fill()
    ctx.beginPath()
    ctx.arc(s.x - 1.0, s.y - 1.0, 1.2, 0.0, 2.0 * PI)
    ctx.fillStyle = "rgba(180, 220, 255, 0.55)"
    ctx.fill()

proc drawRipple(r: Ripple, t: float) =
  let p = (t - r.t0) / r.dur
  if p < 0.0 or p > 1.0: return
  let ease = 1.0 - pow(1.0 - p, 3.0)
  let rad = r.r0 + (r.r1 - r.r0) * ease
  let alpha = (1.0 - p) * 0.55
  ctx.beginPath()
  ctx.arc(r.x, r.y, rad, 0.0, 2.0 * PI)
  ctx.strokeStyle = "rgba(160, 210, 255, " & $alpha & ")"
  ctx.lineWidth = 1.5
  ctx.stroke()

proc drawFrame(t: float) =
  drawBackground(t)
  drawStones()

  var alive: seq[Ripple] = @[]
  for r in ripples:
    if t - r.t0 < r.dur:
      alive.add(r)
      drawRipple(r, t)
  ripples = alive

  discard window.requestAnimationFrame(drawFrame)

# ---- Interaction -----------------------------------------------------------
proc onTap(ev: Event) =
  let e = ev.toJs
  let rect = canvas.getBoundingClientRect()
  let x = e.clientX.to(float) - rect.left.to(float)
  let y = e.clientY.to(float) - rect.top.to(float)
  let t = nowMs()

  stones.add((x: x, y: y))
  let cssW = canvas.width.to(float) / window.devicePixelRatio
  let cssH = canvas.height.to(float) / window.devicePixelRatio
  let maxR = min(cssW, cssH) * 0.55
  ripples.add(Ripple(x: x, y: y, r0: 6.0, r1: maxR, t0: t, dur: 2200.0))

  if stones.len > 40: stones.delete(0)
  if ripples.len > 40: ripples.delete(0)

  initAudio()
  plink(520.0 + (x / max(1.0, cssW)) * 220.0)

proc onSoundToggle(ev: Event) =
  soundOn = not soundOn
  soundBtn.textContent = (if soundOn: "🔊" else: "🔇")
  if soundOn: initAudio()

# ---- Boot ------------------------------------------------------------------
canvas.addEventListener("pointerdown", onTap)
soundBtn.addEventListener("click", onSoundToggle)
window.addEventListener("resize", proc(ev: Event) = resize())
resize()
discard window.requestAnimationFrame(drawFrame)
