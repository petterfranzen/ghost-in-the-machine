module App

open System
open Fable.Core
open Fable.Core.JsInterop

// ---------------------------------------------------------------------------
// Interop. Canvas and synth live in small JS files beside this one; everything
// that thinks — the pond, the koi, the lanterns, the weather — is here.
// ---------------------------------------------------------------------------
module G =
    [<Emit("window.Gfx.W()")>]
    let w () : int = jsNative
    [<Emit("window.Gfx.H()")>]
    let h () : int = jsNative
    [<Emit("window.Gfx.clear($0)")>]
    let clear (c: string) : unit = jsNative
    [<Emit("window.Gfx.rect($0,$1,$2,$3,$4)")>]
    let rect (x: float) (y: float) (w: float) (h: float) (c: string) : unit = jsNative
    [<Emit("window.Gfx.rectA($0,$1,$2,$3,$4,$5)")>]
    let rectA (x: float) (y: float) (w: float) (h: float) (c: string) (a: float) : unit = jsNative
    [<Emit("window.Gfx.ell($0,$1,$2,$3,$4)")>]
    let ell (x: float) (y: float) (rx: float) (ry: float) (c: string) : unit = jsNative
    [<Emit("window.Gfx.ellA($0,$1,$2,$3,$4,$5)")>]
    let ellA (x: float) (y: float) (rx: float) (ry: float) (c: string) (a: float) : unit = jsNative
    [<Emit("window.Gfx.ring($0,$1,$2,$3,$4,$5,$6)")>]
    let ring (x: float) (y: float) (rx: float) (ry: float) (lw: float) (c: string) (a: float) : unit = jsNative
    [<Emit("window.Gfx.glow($0,$1,$2,$3,$4)")>]
    let glow (x: float) (y: float) (r: float) (c: string) (a: float) : unit = jsNative
    [<Emit("window.Gfx.clipPond($0,$1,$2,$3)")>]
    let clipPond (x: float) (y: float) (rx: float) (ry: float) : unit = jsNative
    [<Emit("window.Gfx.unclip()")>]
    let unclip () : unit = jsNative
    [<Emit("window.Gfx.save()")>]
    let save () : unit = jsNative
    [<Emit("window.Gfx.restore()")>]
    let restore () : unit = jsNative
    [<Emit("window.Gfx.translate($0,$1)")>]
    let translate (x: float) (y: float) : unit = jsNative
    [<Emit("window.Gfx.lighter($0)")>]
    let lighter (on: bool) : unit = jsNative

module A =
    [<Emit("window.MossAudio&&window.MossAudio.plink($0)")>]
    let plink (x: float) : unit = jsNative
    [<Emit("window.MossAudio&&window.MossAudio.bloop($0)")>]
    let bloop (i: float) : unit = jsNative
    [<Emit("window.MossAudio&&window.MossAudio.chime($0)")>]
    let chime (f: float) : unit = jsNative
    [<Emit("window.MossAudio&&window.MossAudio.rustle()")>]
    let rustle () : unit = jsNative
    [<Emit("window.MossAudio&&window.MossAudio.stir()")>]
    let stir () : unit = jsNative
    [<Emit("window.MossAudio&&window.MossAudio.bell()")>]
    let bell () : unit = jsNative
    [<Emit("window.MossAudio&&window.MossAudio.wind()")>]
    let wind () : unit = jsNative
    [<Emit("window.MossAudio&&window.MossAudio.koiSong()")>]
    let koiSong () : unit = jsNative
    [<Emit("window.MossAudio&&window.MossAudio.hidden()")>]
    let hidden () : unit = jsNative
    [<Emit("window.MossAudio&&window.MossAudio.lantern($0,$1)")>]
    let lantern (i: float) (f: float) : unit = jsNative

module I =
    [<Emit("window.MossInput.pull()")>]
    let pull () : obj[] = jsNative
    [<Emit("$0[$1]")>]
    let prop (o: obj) (k: string) : obj = jsNative

let num (o: obj) (k: string) : float = unbox<float> (I.prop o k)
let str (o: obj) (k: string) : string = unbox<string> (I.prop o k)

[<Emit("requestAnimationFrame($0)")>]
let raf (cb: float -> unit) : unit = jsNative
[<Emit("performance.now()")>]
let nowMs () : float = jsNative

[<Emit("(function(){try{return localStorage.getItem('mosslight.lanterns')}catch(e){return null}})()")>]
let loadLanterns () : obj = jsNative
[<Emit("(function(){try{localStorage.setItem('mosslight.lanterns',$0)}catch(e){}})()")>]
let saveLanterns (s: string) : unit = jsNative

// ---------------------------------------------------------------------------
// Small maths
// ---------------------------------------------------------------------------
let clamp (v: float) (lo: float) (hi: float) = max lo (min hi v)
let lerp (a: float) (b: float) (t: float) = a + (b - a) * t
let rnd = Random()
let rr (a: float) (b: float) = a + rnd.NextDouble() * (b - a)
let wrapPi (a: float) =
    let mutable x = a
    while x > Math.PI do x <- x - 2.0 * Math.PI
    while x < -Math.PI do x <- x + 2.0 * Math.PI
    x

// ---------------------------------------------------------------------------
// World shape — recomputed from the viewport, so the pond fills any screen
// ---------------------------------------------------------------------------
type Layout =
    { W: int; H: int; Cx: float; Cy: float; Rx: float; Ry: float; Horizon: float }

let mutable L : Layout = { W = 200; H = 300; Cx = 100.0; Cy = 170.0; Rx = 88.0; Ry = 40.0; Horizon = 130.0 }

let relayout () =
    let w = float (G.w ())
    let h = float (G.h ())
    let rx = w * (if w / h > 1.25 then 0.415 else 0.475)
    let ry = min (rx * 0.54) (h * 0.24)
    let cy = h * (if h / w > 1.15 then 0.555 else 0.60)
    L <- { W = int w; H = int h; Cx = w * 0.5; Cy = cy; Rx = rx; Ry = ry; Horizon = cy - ry - max 5.0 (ry * 0.12) }

let pondD (x: float) (y: float) =
    let dx = (x - L.Cx) / L.Rx
    let dy = (y - L.Cy) / L.Ry
    dx * dx + dy * dy

let rimPoint (angle: float) (scale: float) =
    L.Cx + cos angle * L.Rx * scale, L.Cy + sin angle * L.Ry * scale

// ---------------------------------------------------------------------------
// Things in the pond
// ---------------------------------------------------------------------------
type Koi =
    { mutable X: float
      mutable Y: float
      mutable Ang: float
      mutable Speed: float
      mutable Size: float
      mutable Shade: int
      mutable Wander: float
      mutable Wag: float
      mutable Startle: float
      mutable HasTarget: bool
      mutable TX: float
      mutable TY: float
      mutable TargetT: float
      mutable Moon: bool
      mutable Life: float
      mutable Diving: float }

type Ripple =
    { mutable X: float
      mutable Y: float
      mutable R: float
      mutable MaxR: float
      mutable Life: float
      mutable MaxLife: float
      mutable Power: float
      mutable Warm: bool }

type Bubble = { mutable X: float; mutable Y: float; mutable Life: float; mutable R: float }
type Spark = { mutable X: float; mutable Y: float; mutable VX: float; mutable VY: float; mutable Life: float; mutable C: string }
type Mote = { mutable X: float; mutable Y: float; mutable Phase: float; mutable Drift: float; mutable Bright: float }
type Cloud = { mutable X: float; mutable Y: float; mutable Wid: float; mutable Speed: float; mutable Alpha: float; mutable Seed: int }
type Reed = { mutable Angle: float; mutable Scale: float; mutable Lean: float; mutable Vel: float; mutable H: float; mutable Phase: float }

type Lantern =
    { mutable Angle: float
      mutable Scale: float
      mutable Lit: bool
      mutable Note: float
      mutable Pulse: float
      Index: int }

let koi = ResizeArray<Koi>()
let ripples = ResizeArray<Ripple>()
let bubbles = ResizeArray<Bubble>()
let sparks = ResizeArray<Spark>()
let motes = ResizeArray<Mote>()
let clouds = ResizeArray<Cloud>()

let reeds =
    [| { Angle = -0.42; Scale = 1.02; Lean = 0.0; Vel = 0.0; H = 26.0; Phase = 0.0 }
       { Angle = 0.62; Scale = 1.07; Lean = 0.0; Vel = 0.0; H = 20.0; Phase = 1.7 }
       { Angle = 2.06; Scale = 1.04; Lean = 0.0; Vel = 0.0; H = 24.0; Phase = 3.1 }
       { Angle = 4.05; Scale = 1.0; Lean = 0.0; Vel = 0.0; H = 22.0; Phase = 4.4 }
       { Angle = 5.35; Scale = 1.06; Lean = 0.0; Vel = 0.0; H = 28.0; Phase = 5.6 } |]

let stones =
    [| (0.30, 1.06, 3.0); (1.15, 1.10, 2.0); (2.30, 1.05, 3.5); (3.05, 1.02, 2.5)
       (3.85, 1.08, 4.0); (4.60, 1.04, 2.5); (5.30, 1.07, 3.5); (5.95, 1.03, 2.0)
       (1.75, 1.13, 2.0) |]

let lanternDefs = [| (2.55, 1.06, 293.66); (3.75, 1.07, 349.23); (0.60, 1.05, 392.00); (5.55, 1.08, 440.00) |]
let mutable lanterns : Lantern[] = [||]

let stars = [| for i in 0 .. 26 -> (rr 0.02 0.98, rr 0.0 0.62, (if i % 5 = 0 then 2.0 else 1.0), rr 0.0 6.28) |]
let speckles = [| for i in 0 .. 110 -> (rr 0.0 1.0, rr 0.0 1.0, (if i % 7 = 0 then 2.0 else 1.0)) |]

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let mutable t = 0.0
let mutable idle = 0.0
let mutable veil = 0.0            // cloud veil from a swipe across the sky
let mutable shyT = 0.0            // the koi hide after a swipe
let mutable shake = 0.0
let mutable moonTaps = 0
let mutable moonTapT = -10.0
let mutable shower = 0.0
let mutable moonKoiSeen = false
let mutable moonKoiT = 0.0
let mutable gathering = 0.0       // rises when the pond is left alone
let mutable litCount = 0
let mutable warm = 0.0
let mutable lastSplashSnd = -1.0

let koiPalette =
    [| ("#f2e6cd", "#d07a45"); ("#e9f0f2", "#7f9fb4"); ("#f4dca6", "#bc8f52")
       ("#9fb6c0", "#4d6b7a"); ("#f6eee0", "#c96f4e") |]

let initLanterns () =
    let saved = loadLanterns ()
    let s = if isNull saved then "" else unbox<string> saved
    lanterns <-
        lanternDefs
        |> Array.mapi (fun i (a, sc, note) ->
            { Angle = a; Scale = sc; Lit = s.Length > i && s.[i] = '1'; Note = note; Pulse = 0.0; Index = i })
    litCount <- lanterns |> Array.filter (fun l -> l.Lit) |> Array.length
    warm <- float litCount / 4.0
    lanterns |> Array.iter (fun l -> if l.Lit then A.lantern (float l.Index) l.Note)

let saveLanternState () =
    let s = lanterns |> Array.map (fun l -> if l.Lit then "1" else "0") |> String.concat ""
    saveLanterns s

let addKoi (x: float) (y: float) (size: float) (shade: int) (moon: bool) (life: float) =
    koi.Add
        { X = x; Y = y; Ang = rr 0.0 6.28; Speed = 8.0; Size = size; Shade = shade
          Wander = rr -1.0 1.0; Wag = rr 0.0 6.28; Startle = 0.0
          HasTarget = false; TX = x; TY = y; TargetT = 0.0; Moon = moon; Life = life; Diving = 0.0 }

let initWorld () =
    koi.Clear()
    for i in 0 .. 5 do
        let a = rr 0.0 6.28
        let r = sqrt (rr 0.0 0.6)
        addKoi (L.Cx + cos a * L.Rx * r) (L.Cy + sin a * L.Ry * r) (rr 2.7 4.3) (i % koiPalette.Length) false 0.0
    for i in 0 .. 13 do
        motes.Add { X = rr 0.1 0.9; Y = rr 0.35 0.9; Phase = rr 0.0 6.28; Drift = rr 0.4 1.2; Bright = rr 0.3 1.0 }
    for i in 0 .. 2 do
        clouds.Add { X = rr 0.0 1.0; Y = rr 0.03 0.24; Wid = rr 0.22 0.42; Speed = rr 0.004 0.012; Alpha = rr 0.10 0.22; Seed = i * 17 }

// ---------------------------------------------------------------------------
// Sounds and little events
// ---------------------------------------------------------------------------
let ripple (x: float) (y: float) (power: float) (warmRing: bool) =
    ripples.Add
        { X = x; Y = y; R = 2.0; MaxR = 14.0 + 26.0 * power; Life = 1.0
          MaxLife = 1.6 + 0.7 * power; Power = power; Warm = warmRing }

let splash (x: float) (y: float) (power: float) =
    ripple x y power false
    for i in 0 .. int (3.0 + 5.0 * power) do
        sparks.Add
            { X = x + rr -3.0 3.0; Y = y + rr -1.5 1.5
              VX = rr -16.0 16.0; VY = rr -30.0 -8.0; Life = rr 0.3 0.7
              C = (if i % 3 = 0 then "#cfe9e2" else "#8fc0bd") }
    shake <- max shake (0.7 * power)
    A.plink (float (x / float L.W))

let attract (x: float) (y: float) (radius: float) (hold: float) =
    for k in koi do
        if not k.Moon || k.Life > 0.0 then
            let d = sqrt ((k.X - x) ** 2.0 + (k.Y - y) ** 2.0)
            if d < radius then
                k.HasTarget <- true
                k.TX <- x + rr -6.0 6.0
                k.TY <- y + rr -4.0 4.0
                k.TargetT <- t + hold

let startleKoi (k: Koi) =
    k.Startle <- 1.0
    k.HasTarget <- false
    k.Ang <- k.Ang + Math.PI + rr -0.7 0.7
    k.Speed <- 34.0
    A.bloop (float k.Shade)
    for i in 0 .. 4 do
        bubbles.Add { X = k.X; Y = k.Y; Life = rr 0.5 1.1; R = rr 0.6 1.4 }

let burstSparks (x: float) (y: float) (n: int) (c: string) =
    for i in 0 .. n do
        let a = rr 0.0 6.28
        let s = rr 4.0 18.0
        sparks.Add { X = x; Y = y; VX = cos a * s; VY = sin a * s * 0.6 - 6.0; Life = rr 0.5 1.2; C = c }

let nearestKoi (x: float) (y: float) (r: float) =
    let mutable best = None
    let mutable bd = r
    for k in koi do
        let d = sqrt ((k.X - x) ** 2.0 + (k.Y - y) ** 2.0)
        if d < bd && (not k.Moon || k.Life > 0.0) then
            bd <- d
            best <- Some k
    best

let lightLantern (l: Lantern) =
    if not l.Lit then
        l.Lit <- true
        l.Pulse <- 1.0
        litCount <- litCount + 1
        warm <- float litCount / 4.0
        let x, y = rimPoint l.Angle l.Scale
        A.chime l.Note
        A.lantern (float l.Index) l.Note
        burstSparks x (y - 6.0) 14 "#ffd79a"
        shake <- max shake 0.4
        saveLanternState ()
        if litCount = 4 then
            moonKoiT <- 6.0
            A.hidden ()

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
type Press =
    { mutable X0: float
      mutable Y0: float
      mutable X: float
      mutable Y: float
      mutable T0: float
      mutable Kind: string
      mutable Target: float
      mutable Moved: float
      mutable LastTrail: float
      mutable LastStir: float
      mutable Spent: bool }

let presses = Collections.Generic.Dictionary<int, Press>()

let fingerDown (id: int) (x: float) (y: float) =
    idle <- 0.0
    gathering <- 0.0
    let sky = y < L.Cy - L.Ry - 3.0
    let press =
        { X0 = x; Y0 = y; X = x; Y = y; T0 = t; Kind = "none"; Target = -1.0
          Moved = 0.0; LastTrail = -1.0; LastStir = -1.0; Spent = false }
    if sky then
        // the moon answers a touch of its own
        let mx = float L.W * 0.775
        let my = float L.H * 0.15
        let mr = max 7.0 (float (min L.W L.H) * 0.055)
        if (x - mx) ** 2.0 + (y - my) ** 2.0 < (mr + 8.0) ** 2.0 then
            moonTaps <- (if t - moonTapT < 4.0 then moonTaps + 1 else 1)
            moonTapT <- t
            A.bell ()
            burstSparks mx my 8 "#dceeff"
            if moonTaps >= 3 then
                moonTaps <- 0
                shower <- 6.0
                A.hidden ()
            press.Kind <- "moon"
        else
            press.Kind <- "sky"
    else
        match nearestKoi x y 9.0 with
        | Some k when pondD x y <= 1.0 ->
            ripple x y 0.55 false
            burstSparks x y 4 "#cfe9e2"
            if shyT <= 0.0 then startleKoi k
            press.Kind <- "koi"
        | _ ->
            let lanternHit =
                lanterns
                |> Array.tryFind (fun l ->
                    let lx, ly = rimPoint l.Angle l.Scale
                    (x - lx) ** 2.0 + (y - (ly - 5.0)) ** 2.0 < 11.0 ** 2.0)
            match lanternHit with
            | Some l ->
                press.Kind <- "lantern"
                press.Target <- float l.Index
            | None ->
                let reedHit =
                    reeds |> Array.tryFindIndex (fun rd ->
                        let rx, ry = rimPoint rd.Angle rd.Scale
                        (x - rx) ** 2.0 + (y - ry) ** 2.0 < 17.0 ** 2.0)
                match reedHit with
                | Some i ->
                    reeds.[i].Vel <- reeds.[i].Vel + 2.6
                    A.rustle ()
                    for j in 0 .. 4 do
                        motes.Add { X = x; Y = y - 4.0; Phase = rr 0.0 6.28; Drift = rr 0.6 1.6; Bright = rr 0.5 1.0 }
                    press.Kind <- "reed"
                | None ->
                    if pondD x y <= 1.0 then
                        splash x y 1.0
                        attract x y 78.0 2.4
                        press.Kind <- "water"
                    else
                        // a soft touch on the moss: a fleeing firefly, a small hush
                        burstSparks x y 5 "#9fd8c4"
                        A.rustle ()
                        press.Kind <- "moss"
    presses.[id] <- press

let fingerMove (id: int) (x: float) (y: float) =
    idle <- 0.0
    match presses.TryGetValue id with
    | true, p ->
        let dx = x - p.X
        let dy = y - p.Y
        p.Moved <- p.Moved + sqrt (dx * dx + dy * dy)
        p.X <- x
        p.Y <- y
        if p.Kind = "sky" && abs (x - p.X0) > 26.0 && t - p.T0 < 0.8 then
            veil <- 1.0
            shyT <- 4.0
            A.wind ()
            for k in koi do
                k.HasTarget <- false
                k.Startle <- max k.Startle 0.6
                k.Diving <- 1.0
            p.Spent <- true
        elif p.Kind = "water" then
            // stirring: the koi follow the fingertip, rings trail behind it
            if t - p.LastTrail > 0.085 then
                p.LastTrail <- t
                ripple x y 0.35 false
                attract x y 60.0 1.2
            if t - p.LastStir > 0.45 then
                p.LastStir <- t
                A.stir ()
            if sqrt ((x - p.X0) ** 2.0 + (y - p.Y0) ** 2.0) > 34.0 then
                ripple x y 0.55 false
    | _ -> ()

let fingerUp (id: int) =
    idle <- 0.0
    match presses.TryGetValue id with
    | true, p ->
        if p.Kind = "lantern" && not p.Spent then
            let l = lanterns.[int p.Target]
            if l.Lit then
                A.chime (l.Note * 2.0)
                l.Pulse <- 1.0
                burstSparks p.X p.Y 6 "#ffdca0"
            elif t - p.T0 < 0.45 then
                A.chime (l.Note * 0.5)
        presses.Remove id |> ignore
    | _ -> ()

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------
let updateKoi (dt: float) (k: Koi) =
    let litPoints = lanterns |> Array.filter (fun l -> l.Lit)
    let moonSpd = if k.Moon then 1.15 else 1.0
    let targetOpt =
        if k.Moon then Some(k.TX, k.TY)
        elif k.HasTarget && t < k.TargetT then Some(k.TX, k.TY)
        elif gathering > 0.6 && litPoints.Length > 0 then
            let l = litPoints.[int (abs (k.X + k.Y)) % litPoints.Length]
            let lx, ly = rimPoint l.Angle (l.Scale - 0.22)
            Some(lx, ly)
        else None
    let desired =
        match targetOpt with
        | Some (tx, ty) -> atan2 (ty - k.Y) (tx - k.X)
        | None -> k.Wander
    let d = pondD k.X k.Y
    let desired =
        if k.Diving > 0.0 then atan2 (L.Cy + L.Ry * 0.9 - k.Y) (L.Cx - k.X)
        elif d > 0.80 then
            let inward = atan2 (L.Cy - k.Y) (L.Cx - k.X)
            let turn = wrapPi (inward - desired)
            desired + turn * clamp ((d - 0.80) / 0.30) 0.0 1.0
        else desired
    k.Ang <- k.Ang + clamp (wrapPi (desired - k.Ang)) (-3.2 * dt) (3.2 * dt)
    let baseSpd = (7.0 + k.Size * 0.9) * moonSpd
    let targetSpd =
        if k.Startle > 0.0 then 36.0 * k.Startle + baseSpd * 0.4
        elif k.Diving > 0.0 then baseSpd * 1.5
        elif targetOpt.IsSome then baseSpd * 1.5
        elif gathering > 0.6 then baseSpd * 0.55
        else baseSpd
    k.Speed <- lerp k.Speed targetSpd (clamp (dt * 2.2) 0.0 1.0)
    k.X <- k.X + cos k.Ang * k.Speed * dt
    k.Y <- k.Y + sin k.Ang * k.Speed * dt
    k.Wander <- k.Wander + rr -1.4 1.4 * dt
    k.Wag <- k.Wag + dt * (3.0 + k.Speed * 0.35)
    k.Startle <- max 0.0 (k.Startle - dt * 1.6)
    k.Diving <- max 0.0 (k.Diving - dt * 0.7)
    if k.HasTarget && t >= k.TargetT then k.HasTarget <- false
    // wake bubbles and a travelling trail for the pale koi
    if k.Speed > 16.0 && rnd.NextDouble() < dt * 4.0 then
        bubbles.Add { X = k.X - cos k.Ang * 3.0; Y = k.Y - sin k.Ang * 3.0; Life = rr 0.4 1.0; R = rr 0.5 1.2 }
    if k.Moon && rnd.NextDouble() < dt * 10.0 then
        sparks.Add
            { X = k.X + rr -3.0 3.0; Y = k.Y + rr -2.0 2.0; VX = rr -3.0 3.0; VY = rr -6.0 -1.0
              Life = rr 0.6 1.4; C = "#bfe4ff" }
    if k.Moon then k.Life <- k.Life - dt

let tick (dt: float) =
    t <- t + dt
    relayout ()
    idle <- idle + dt
    veil <- max 0.0 (veil - dt * 0.055)
    shyT <- max 0.0 (shyT - dt)
    shake <- max 0.0 (shake - dt * 3.4)
    shower <- max 0.0 (shower - dt)
    moonKoiT <- max 0.0 (moonKoiT - dt)
    lanterns |> Array.iter (fun l -> l.Pulse <- max 0.0 (l.Pulse - dt * 0.7))
    warm <- lerp warm (float litCount / 4.0) (min 1.0 (dt * 1.5))
    gathering <- if idle > 9.0 then min 1.0 (gathering + dt * 0.6) else max 0.0 (gathering - dt * 1.5)

    // a long press wakes a lantern
    for kv in presses do
        let p = kv.Value
        if p.Kind = "lantern" && not p.Spent && t - p.T0 > 0.42 then
            p.Spent <- true
            lightLantern lanterns.[int p.Target]

    // a pale koi surfaces when the pond is warm and quiet, or all lanterns are lit
    if koi |> Seq.exists (fun k -> k.Moon) |> not then
        if moonKoiT > 0.0 || (idle > 24.0 && litCount >= 2) then
            moonKoiT <- 0.0
            moonKoiSeen <- true
            let a = rr 0.0 6.28
            addKoi (L.Cx + cos a * L.Rx * 0.4) (L.Cy + sin a * L.Ry * 0.4) 6.6 0 true 46.0
            A.koiSong ()
            for i in 0 .. 18 do
                let aa = rr 0.0 6.28
                sparks.Add { X = L.Cx; Y = L.Cy; VX = cos aa * 22.0; VY = sin aa * 12.0; Life = rr 0.8 1.8; C = "#d8ecff" }

    // the pale koi circles the pond, drifting from lantern to lantern
    for k in koi do
        if k.Moon && k.Life > 0.0 then
            let lang = t * 0.42
            k.TX <- L.Cx + cos lang * L.Rx * 0.62
            k.TY <- L.Cy + sin lang * L.Ry * 0.58
            k.Diving <- 0.0
    koi.RemoveAll(fun k -> k.Moon && k.Life <= 0.0) |> ignore

    koi |> Seq.iter (fun k -> if not k.Moon || k.Life > 0.0 then updateKoi dt k)

    // ripples spread and fade; a warm ripple nudges the nearest koi awake
    for r in ripples do
        r.R <- r.R + (5.0 + 17.0 * r.Power) * dt
        r.Life <- r.Life - dt / r.MaxLife
    ripples.RemoveAll(fun r -> r.Life <= 0.0) |> ignore

    for b in bubbles do
        b.Y <- b.Y - 16.0 * dt
        b.Life <- b.Life - dt
    bubbles.RemoveAll(fun b -> b.Life <= 0.0) |> ignore

    for s in sparks do
        s.X <- s.X + s.VX * dt
        s.Y <- s.Y + s.VY * dt
        s.VY <- s.VY + 26.0 * dt
        s.VX <- s.VX * (1.0 - 1.4 * dt)
        s.Life <- s.Life - dt
    sparks.RemoveAll(fun s -> s.Life <= 0.0) |> ignore

    for m in motes do
        m.Phase <- m.Phase + dt * (0.6 + m.Drift * 0.7)
        m.Y <- m.Y - dt * 0.012 * m.Drift

    for c in clouds do
        c.X <- c.X + dt * c.Speed
        if c.X > 1.15 then c.X <- -0.2

    for rd in reeds do
        rd.Vel <- rd.Vel + (-rd.Lean * 6.0 - rd.Vel * 1.6) * dt
        rd.Lean <- rd.Lean + rd.Vel * dt
        rd.Phase <- rd.Phase + dt * (0.7 + rd.H * 0.01)

    // input
    let evs = I.pull ()
    for e in evs do
        let kind = str e "kind"
        let x = num e "x"
        let y = num e "y"
        let id = int (num e "id")
        match kind with
        | "down" -> fingerDown id x y
        | "move" -> fingerMove id x y
        | "up" -> fingerUp id
        | _ -> ()

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
let skyBands = [| "#070a17"; "#090f21"; "#0b1329"; "#0e1a31"; "#12223c"; "#162a46" |]
let waterBands = [| "#0a1620"; "#0b1a24"; "#0c1d28"; "#0e2130"; "#102636"; "#122a3a" |]
let bankBands = [| "#0d1714"; "#0e1915"; "#0f1c17"; "#111f19"; "#13221c"; "#15251e"; "#172920"; "#192c23"; "#1b3026" |]
let mossDots = [| "#20382c"; "#28452f"; "#1a2c22"; "#33543a"; "#2a4636" |]

let pines = [| for i in 0 .. 17 -> (rr 0.01 0.99, rr 0.055 0.125, rr 4.0 9.0) |]
let tufts = [| for i in 0 .. 64 -> (rr 0.0 1.0, rr 0.0 1.0, rr 0.0 6.28) |]
let boulders = [| (0.09, 0.80, 9.0); (0.88, 0.72, 11.0); (0.24, 0.93, 14.0); (0.71, 0.87, 8.0) |]
let shrooms = [| (0.155, 0.845); (0.183, 0.872); (0.815, 0.925); (0.605, 0.962) |]
let fgBlades = [| for i in 0 .. 44 -> (rr 0.0 1.0, rr 6.0 20.0, rr 0.0 6.28, rr 0.5 1.0) |]
let pads = [| (0.26, 0.42, 5.0, 0.0); (0.68, 0.26, 4.0, 1.7); (0.48, 0.66, 6.5, 3.2); (0.76, 0.58, 3.5, 4.4) |]

let hx (h: string) (i: int) = Convert.ToInt32(h.Substring(i, 2), 16)
let mix (a: string) (b: string) (t: float) =
    let f = clamp t 0.0 1.0
    let r = int (lerp (float (hx a 1)) (float (hx b 1)) f)
    let g = int (lerp (float (hx a 3)) (float (hx b 3)) f)
    let bl = int (lerp (float (hx a 5)) (float (hx b 5)) f)
    sprintf "#%02x%02x%02x" r g bl

let drawSky () =
    G.clear skyBands.[0]
    let horizon = max 1.0 L.Horizon
    let steps = int (horizon / 2.0) + 1
    for i in 0 .. steps do
        let f = float i / float (max 1 steps)
        let idx = min (skyBands.Length - 1) (int (f * float skyBands.Length))
        G.rect 0.0 (float i * 2.0) (float L.W) 2.0 skyBands.[idx]
    for (sx, sy, sz, ph) in stars do
        let a = (0.4 + 0.6 * sin (t * 0.7 + ph)) * (1.0 - veil * 0.85)
        if a > 0.05 then
            G.rectA (sx * float L.W) (sy * horizon) sz sz "#dfeaf7" a
            if sz > 1.5 then G.rectA (sx * float L.W - 1.0) (sy * horizon + 0.5) 1.0 sz "#9db6c9" (a * 0.5)
    // moon, and its halo on the weather
    let mx = float L.W * 0.775
    let my = float L.H * 0.15
    let mr = max 6.0 (float (min L.W L.H) * 0.055)
    G.glow mx my (mr * 5.5) "rgba(150,190,225,0.28)" (0.55 * (1.0 - veil * 0.5))
    G.ell mx my mr mr "#e9f1f6"
    G.ell (mx - mr * 0.30) (my + mr * 0.22) (mr * 0.30) (mr * 0.22) "#d2dfe7"
    G.ell (mx + mr * 0.28) (my - mr * 0.26) (mr * 0.22) (mr * 0.18) "#dae5ed"
    G.ellA (mx - mr * 0.55) (my - mr * 0.1) (mr * 0.16) (mr * 0.12) "#cddae2" 0.8
    G.glow mx my (mr * 2.1) "rgba(215,235,248,0.55)" 0.20
    for c in clouds do
        let cx0 = c.X * float L.W
        let cy0 = c.Y * float L.H
        let w = c.Wid * float L.W
        let a = c.Alpha * (0.7 + 0.3 * sin (t * 0.2 + float c.Seed)) * (1.0 - veil * 0.3)
        G.ellA cx0 cy0 (w * 0.5) (w * 0.11) "#93aebf" a
        G.ellA (cx0 - w * 0.20) (cy0 + 1.5) (w * 0.30) (w * 0.08) "#839fb0" (a * 0.9)
        G.ellA (cx0 + w * 0.22) (cy0 - 1.2) (w * 0.26) (w * 0.07) "#a6bfcd" (a * 0.7)
    // pine treeline on the far bank, two rows for depth
    for pass in 0 .. 1 do
        let col = if pass = 0 then "#08151a" else "#0b1c20"
        let baseY = horizon + (if pass = 0 then -1.0 else 2.0)
        for (px, ph, pw) in pines do
            let h = ph * float L.H
            let x = if pass = 0 then px * float L.W else (px * float L.W + 4.0) % float L.W
            let w = if pass = 0 then pw else pw * 0.8
            G.rect (x - w) (baseY - h * 0.28) (w * 2.0) (h * 0.28) col
            G.rect (x - w * 0.72) (baseY - h * 0.55) (w * 1.44) (h * 0.30) col
            G.rect (x - w * 0.44) (baseY - h * 0.80) (w * 0.88) (h * 0.28) col
            G.rect (x - w * 0.16) (baseY - h) (w * 0.4) (h * 0.25) col

let drawBank () =
    let hz = L.Horizon
    let steps = int ((float L.H - hz) / 4.0) + 1
    for i in 0 .. steps do
        let f = clamp (float i / float (max 1 steps)) 0.0 1.0
        G.rect 0.0 (hz + float i * 4.0) (float L.W) 4.0 (mix "#0c1613" "#1e3528" (f ** 0.85))
    for (sx, sy, sz) in speckles do
        let px = sx * float L.W
        let py = hz + sy * (float L.H - hz)
        let ci = int (abs (px * 7.0 + py * 3.0)) % mossDots.Length
        G.rectA px py sz sz mossDots.[ci] (0.5 + 0.35 * sin (px * 0.2 + py))
    // tufts of moss-grass
    for (gx, gy, ph) in tufts do
        let x = gx * float L.W
        let y = hz + gy * (float L.H - hz)
        let sway = sin (t * 0.7 + ph) * 0.7
        G.rect (x + sway) (y - 4.0) 1.0 4.0 "#1e3a2b"
        G.rect (x + 1.0 + sway * 0.6) (y - 2.5) 1.0 2.5 "#24452f"
        G.rectA (x - 0.5) (y - 1.0) 2.0 1.0 "#152a1f" 0.8
    // a scatter of pebbles along the near shore
    for i in 0 .. 13 do
        let a = Math.PI * (0.08 + 0.84 * float i / 13.0)
        let x = L.Cx + cos a * L.Rx * 1.02
        let y = L.Cy + sin a * L.Ry * 1.15
        let s2 = 1.0 + float (i % 3)
        G.rectA (x - s2) (y - 1.0) (s2 * 2.0) 2.0 "#26362c" 0.9
        G.rectA (x - s2) (y - 1.0) (s2 * 2.0) 1.0 "#42573f" 0.5

let drawBoulder (x: float) (y: float) (s: float) =
    G.ellA x (y + s * 0.26) (s * 1.3) (s * 0.3) "#04100d" 0.55
    G.rect (x - s * 0.72) (y - s * 0.30) (s * 1.44) (s * 0.62) "#233228"
    G.rect (x - s * 0.90) (y - s * 0.06) (s * 1.80) (s * 0.40) "#24342a"
    G.rect (x - s * 0.50) (y - s * 0.52) (s * 1.00) (s * 0.34) "#2a3b30"
    G.rect (x - s * 0.30) (y - s * 0.62) (s * 0.60) (s * 0.18) "#2f4135"
    G.rectA (x - s * 0.62) (y - s * 0.50) (s * 0.70) (s * 0.12) "#4a6149" 0.55
    G.rectA (x - s * 0.80) (y - s * 0.04) (s * 0.90) (s * 0.10) "#3d5342" 0.45
    G.rectA (x + s * 0.18) (y + s * 0.06) (s * 0.55) (s * 0.18) "#141f19" 0.85

let drawShroom (x: float) (y: float) =
    G.rectA (x - 0.8) (y - 2.6) 1.6 2.6 "#cfc49c" 0.9
    G.rectA (x - 2.8) (y - 4.4) 5.6 2.0 "#c8875a" 0.95
    G.rectA (x - 2.0) (y - 5.4) 4.0 1.2 "#e2a973" 0.85
    G.rectA (x - 2.2) (y - 3.6) 1.0 1.0 "#f0e2c0" 0.5
    G.glow x (y - 3.6) 6.0 "rgba(255,190,130,0.4)" 0.16

let drawStone (angle: float) (scale: float) (size: float) =
    let x, y = rimPoint angle scale
    let s = size
    G.ellA x (y + s * 0.35) (s * 1.5) (s * 0.5) "#060f12" 0.5
    G.rect (x - s) (y - s * 0.5) (s * 2.0) (s * 1.1) "#2a3730"
    G.rect (x - s) (y - s * 0.5) (s * 2.0) 1.0 "#44574a"
    G.rectA (x - s * 0.8) (y - s * 0.7) (s * 1.6) (s * 0.4) "#4d6152" 0.5
    G.rectA (x + s * 0.2) (y + s * 0.1) (s * 0.5) (s * 0.3) "#1b2622" 0.8
    G.rectA (x - s * 0.7) (y - s * 0.62) (s * 0.7) (s * 0.15) "#5d7a56" 0.35

let drawReed (rd: Reed) =
    let bx, by = rimPoint rd.Angle rd.Scale
    let h = rd.H * (0.8 + 0.2 * sin (t * 0.5 + rd.Phase))
    let mutable i = 0.0
    while i < h do
        let f = i / h
        let sway = sin (rd.Phase + i * 0.14) * (0.7 + f * 2.2) + rd.Lean * (i / h) * 3.0
        G.rect (bx + sway) (by - i) 1.0 2.0 (if f > 0.75 then "#2c4a37" else "#1e3b2c")
        i <- i + 2.0
    let tipSway = sin (rd.Phase + h * 0.14) * 2.9 + rd.Lean * 3.0
    G.rect (bx + tipSway) (by - h - 2.0) 1.5 3.0 "#3f5942"
    G.rectA (bx + tipSway) (by - h - 3.0) 1.5 1.0 "#557050" 0.7
    let h2 = h * 0.74
    let mutable j = 0.0
    while j < h2 do
        let f = j / h2
        let sway = sin (rd.Phase + 1.7 + j * 0.12) * (0.5 + f * 1.8) + rd.Lean * 2.0
        G.rect (bx + 1.0 + sway) (by - j) 1.0 2.0 "#1b3427"
        j <- j + 2.0

let drawLantern (l: Lantern) =
    let x, y = rimPoint l.Angle l.Scale
    let s = clamp (float L.W / 240.0) 0.8 1.4
    let gy = y - 12.0 * s
    G.ellA x (y + 1.0) (5.0 * s) (2.0 * s) "#050d10" 0.5
    G.rect (x - 4.0 * s) (y - 1.0) (8.0 * s) 2.0 "#2b3a2e"          // stone shelf
    G.rectA (x - 4.0 * s) (y - 1.0) (8.0 * s) 1.0 "#4d6349" 0.6
    G.rect (x - 0.7 * s) (gy + 2.0 * s) (1.4 * s) (9.0 * s) "#3a2f22" // post
    G.rect (x - 2.0 * s) (gy - 0.5 * s) (4.0 * s) 1.0 "#4a3b29"       // arm
    G.rect (x - 3.2 * s) (gy) (6.4 * s) (6.0 * s) (if l.Lit then "#ffd489" else "#4a4232")
    G.rect (x - 4.2 * s) (gy - 1.2 * s) (8.4 * s) (1.4 * s) (if l.Lit then "#ffeec2" else "#5c5240")
    G.rect (x - 2.4 * s) (gy + 6.0 * s) (4.8 * s) (1.0 * s) (if l.Lit then "#c9a35f" else "#332d24")
    if l.Lit then
        let flick = 0.8 + 0.2 * sin (t * 3.1 + float l.Index * 1.9) + l.Pulse * 0.4
        G.glow x (gy + 3.0 * s) (14.0 * s + l.Pulse * 14.0) "rgba(255,196,110,0.55)" (0.5 * flick)
        G.ellA x (gy + 3.0 * s) (2.0 * s) (2.6 * s) "#fff3cf" 0.95
        G.rectA (x - 0.8 * s) (gy + 2.0 * s) (1.6 * s) (1.6 * s) "#ffffff" 0.75
    else
        G.rectA (x - 1.0 * s) (gy + 1.0 * s) (2.0 * s) (2.0 * s) "#3a352c" 0.9

let drawMote (m: Mote) =
    let x = m.X * float L.W + sin (m.Phase * 0.8) * 6.0
    let y = m.Y * float L.H + sin (m.Phase * 1.3 + 1.0) * 4.0
    let bright = m.Bright * (0.3 + 0.7 * (0.5 + 0.5 * sin (m.Phase * 1.6))) * (0.55 + gathering * 0.45)
    G.glow x y 5.0 "rgba(190,255,200,0.5)" (bright * 0.5)
    G.rectA x y 1.5 1.5 "#d8ffd0" bright

let drawKoi (k: Koi) =
    let len = if k.Moon then k.Size * 2.5 else k.Size * 2.2
    let dx = cos k.Ang
    let dy = sin k.Ang
    let px = -dy
    let py = dx
    let a = if k.Moon then 1.0 elif shyT > 0.0 then 0.30 else 1.0
    let bodyCol, spotCol =
        if k.Moon then "#eaf7ff", "#a6d2ee"
        else koiPalette.[k.Shade % koiPalette.Length]
    let wag = sin k.Wag * (0.3 + k.Startle * 0.3)
    if k.Moon then
        G.glow k.X k.Y (len * 1.15) "rgba(170,220,255,0.42)" (0.35 + 0.12 * sin (t * 1.4))
    G.ellA k.X (k.Y + 1.2) (len * 0.60) (len * 0.32) "#04141c" (0.62 * a)
    G.ellA (k.X - dx * len * 0.1) (k.Y - dy * len * 0.1 + 1.2) (len * 0.40) (len * 0.20) "#04141c" (0.4 * a)
    let tx = k.X - dx * len * 0.62 + px * wag * len * 0.5
    let ty = k.Y - dy * len * 0.62 + py * wag * len * 0.5
    G.ellA tx ty (len * 0.33) (len * 0.20) "#04141c" (0.45 * a)
    G.ellA tx ty (len * 0.30) (len * 0.17) bodyCol (a * 0.85)
    G.ellA (tx - dx * len * 0.12) (ty - dy * len * 0.12) (len * 0.2) (len * 0.12) spotCol (a * 0.7)
    G.ellA k.X k.Y (len * 0.50) (len * 0.26) bodyCol a
    G.ellA (k.X + dx * len * 0.24) (k.Y + dy * len * 0.24) (len * 0.28) (len * 0.23) bodyCol a
    G.ellA (k.X + dx * len * 0.46) (k.Y + dy * len * 0.46) (len * 0.16) (len * 0.15) bodyCol a
    G.ellA (k.X - dx * len * 0.06 + px * 1.6) (k.Y - dy * len * 0.06 + py * 1.6) (len * 0.18) (len * 0.11) spotCol (a * 0.8)
    G.ellA (k.X + dx * len * 0.1 - px * 2.4) (k.Y + dy * len * 0.1 - py * 2.4) (len * 0.13) (len * 0.08) spotCol (a * 0.55)
    G.ellA (k.X + px * len * 0.22) (k.Y + py * len * 0.22) (len * 0.2) (len * 0.08) spotCol (a * 0.45)
    // a pale line along the back
    G.ellA (k.X + dx * len * 0.08 - px * len * 0.13) (k.Y + dy * len * 0.08 - py * len * 0.13) (len * 0.34) (len * 0.06) "#ffffff" (a * 0.20)
    G.rectA (k.X + dx * len * 0.5 - 0.8) (k.Y + dy * len * 0.5 - 0.8) 1.6 1.6 "#0a1218" (0.9 * a)

let drawPads () =
    for (dx, dy, pr, ph) in pads do
        let x = L.Cx + dx * L.Rx * 0.85
        let y = L.Cy + dy * L.Ry * 0.8 + sin (t * 0.4 + ph) * 0.6
        G.ellA x y pr (pr * 0.72) "#1b382b" 0.95
        G.ellA x (y - 0.6) (pr * 0.86) (pr * 0.58) "#26492f" 0.75
        G.rectA (x - pr * 0.1) (y - pr * 0.1) (pr * 0.62) (pr * 0.5) "#0c1f2b" 0.95
        G.rectA (x - pr * 0.95) (y - 0.3) (pr * 0.3) 0.8 "#4a7a4c" 0.35

let drawForeground () =
    // a fallen log on the near bank
    let lx = float L.W * 0.74
    let ly = float L.H * 0.93
    let ll = float L.W * 0.30
    G.ellA lx (ly + 3.0) (ll * 0.5) 4.0 "#050d0a" 0.55
    G.rect (lx - ll * 0.5) (ly - 3.0) ll 6.0 "#241d15"
    G.rect (lx - ll * 0.5) (ly - 3.0) ll 1.5 "#382c1f"
    G.rectA (lx - ll * 0.45) (ly - 0.4) (ll * 0.9) 0.8 "#191309" 0.5
    G.rectA (lx - ll * 0.4) (ly + 1.4) (ll * 0.7) 0.8 "#3a2a1a" 0.45
    G.rectA (lx - ll * 0.45) (ly - 4.0) (ll * 0.7) 1.5 "#3d5c3c" 0.85
    G.rectA (lx - ll * 0.2) (ly - 4.4) (ll * 0.25) 1.2 "#4c6f46" 0.7
    G.ell (lx + ll * 0.5) (ly) 3.0 3.0 "#3a2d1f"
    G.ell (lx + ll * 0.5) (ly) 2.0 2.0 "#4d3b28"
    G.ellA (lx + ll * 0.5) (ly) 1.0 1.0 "#2a2016" 0.9
    G.rectA (lx - ll * 0.34) (ly - 5.0) 1.4 2.0 "#cfc49c" 0.85
    G.rectA (lx - ll * 0.36) (ly - 6.4) 3.2 1.4 "#c8875a" 0.9
    // blades of grass at the very bottom, a dark frame to look over
    for (gx, gh, ph, sc) in fgBlades do
        let x = gx * float L.W
        let y = float L.H + 2.0
        let mutable i = 0.0
        while i < gh * sc do
            let f = i / (gh * sc)
            let sway = sin (t * 0.55 + ph + i * 0.2) * (0.6 + f * 2.6)
            G.rectA (x + sway) (y - i) 1.0 2.0 "#0a1611" (0.85 - f * 0.25)
            i <- i + 2.0

let drawPond () =
    let mx = float L.W * 0.775
    let my = float L.H * 0.15
    G.clipPond L.Cx L.Cy L.Rx L.Ry
    let top = L.Cy - L.Ry
    let steps = int (L.Ry * 2.0 / 2.0)
    for i in 0 .. steps do
        let f = clamp (float i / float (max 1 steps)) 0.0 1.0
        let idx = min (waterBands.Length - 1) (int (f * float waterBands.Length))
        G.rect (L.Cx - L.Rx) (top + float i * 2.0) (L.Rx * 2.0) 2.0 waterBands.[idx]
    // slow drift lines on the surface
    for i in 0 .. 9 do
        let f = float i / 9.0
        let y = top + L.Ry * (0.15 + f * 1.5)
        let span = (sin (t * 0.25 + float i * 1.7) * 0.5 + 0.5) * L.Rx * 1.3
        let x = L.Cx + cos (t * 0.16 + float i) * L.Rx * 0.55 - span * 0.5
        G.rectA x y span 1.0 "#4c7d7d" (0.05 + 0.03 * sin (t * 0.5 + float i))
    // the moon's column on the water
    for i in 0 .. 8 do
        let y = top + L.Ry * 0.55 + float i * 3.0
        let w = 3.0 + sin (t * 0.8 + float i) * 2.0 + float i * 0.7
        G.rectA (mx - w * 0.5) y w 1.1 "#cfe6f0" (0.10 + 0.05 * sin (t * 1.1 + float i) * (1.0 - veil * 0.6))
    for l in lanterns do
        if l.Lit then
            let lx, ly = rimPoint l.Angle (l.Scale * 0.92)
            G.glow lx ly 18.0 "rgba(255,180,90,0.35)" (0.35 + 0.1 * sin (t * 2.0 + float l.Index))
    drawPads ()
    for r in ripples do
        let f = clamp r.Life 0.0 1.0
        let rr2 = r.R
        let col = if r.Warm then "#ffd9a0" else "#c9eef0"
        if f > 0.72 then
            G.glow r.X r.Y (16.0 * r.Power) "rgba(190,240,240,0.5)" ((f - 0.72) / 0.28 * 0.35)
        G.ring r.X r.Y rr2 (rr2 * (L.Ry / L.Rx)) 1.2 col (f * 0.75 * (0.4 + 0.6 * r.Power))
        G.ring r.X r.Y (rr2 * 0.72) (rr2 * 0.72 * (L.Ry / L.Rx)) 1.0 col (f * 0.32 * r.Power)
    let sorted = koi |> Seq.sortBy (fun k -> k.Y) |> Seq.toArray
    for k in sorted do
        if not k.Moon || k.Life > 0.0 then drawKoi k
    for b in bubbles do
        G.ellA b.X b.Y b.R b.R "#cfeeea" (clamp b.Life 0.0 1.0 * 0.4)
    G.unclip ()
    G.ring L.Cx L.Cy L.Rx L.Ry 1.2 "#2e554b" 0.55
    G.ring L.Cx L.Cy (L.Rx + 2.5) (L.Ry + 2.5) 1.0 "#30503f" 0.30

let draw () =
    relayout ()
    G.save ()
    if shake > 0.0 then
        G.translate (rr -1.0 1.0 * shake) (rr -1.0 1.0 * shake)
    drawSky ()
    drawBank ()
    G.ring L.Cx L.Cy (L.Rx + 1.0) (L.Ry + 1.0) 3.0 "#1d3327" 0.8
    for (a, s, sz) in stones do
        let _, y = rimPoint a s
        if y < L.Cy then drawStone a s sz
    drawPond ()
    for (a, s, sz) in stones do
        let _, y = rimPoint a s
        if y >= L.Cy then drawStone a s sz
    for rd in reeds do drawReed rd
    for (bx, by, bs) in boulders do
        drawBoulder (bx * float L.W) (by * float L.H) bs
    for (sx, sy) in shrooms do
        drawShroom (sx * float L.W) (sy * float L.H)
    if float L.H - (L.Cy + L.Ry) > 34.0 then drawForeground ()
    for l in lanterns do
        drawLantern l
    for m in motes do drawMote m
    for s in sparks do
        let a = clamp (s.Life * 1.6) 0.0 1.0
        G.rectA s.X s.Y 1.4 1.4 s.C a
    if warm > 0.05 then
        G.glow L.Cx L.Cy (L.Rx * 1.3) "rgba(255,170,80,0.35)" (warm * 0.28)
    if shower > 0.0 then
        for i in 0 .. 26 do
            let sx = float L.W * (float i / 26.0) + sin (t + float i) * 3.0
            let sy = (float L.H * 0.9) - (t * (60.0 + float i * 4.0)) % (float L.H * 0.9)
            G.rectA sx sy 1.2 5.0 "#dff0ff" (clamp (shower / 6.0) 0.0 1.0 * 0.7)
    G.restore ()

// ---------------------------------------------------------------------------
// Loop
// ---------------------------------------------------------------------------
let mutable lastMs = -1.0

let rec frame (ms: float) =
    let dt = if lastMs < 0.0 then 0.016 else clamp ((ms - lastMs) / 1000.0) 0.001 0.05
    lastMs <- ms
    tick dt
    draw ()
    raf frame

initLanterns ()
relayout ()
initWorld ()
relayout ()
raf frame
