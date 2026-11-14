/* Sound.res — the loom's voice. Everything is synthesised with Web Audio:
   oscillators, filtered noise and envelopes. Nothing is downloaded. */

type actx
type node
type param
type osc
type buf
type src

@new external makeCtx: unit => actx = "AudioContext"
@send external createGain: actx => node = "createGain"
@send external createOsc: actx => osc = "createOscillator"
@send external createFilter: actx => node = "createBiquadFilter"
@send external createComp: actx => node = "createDynamicsCompressor"
@send external createDelay: actx => node = "createDelay"
@send external createSrc: actx => src = "createBufferSource"
@send external resume: actx => unit = "resume"
@get external nowT: actx => float = "currentTime"
@get external stateOf: actx => string = "state"
@get external dest: actx => node = "destination"
@send external connectTo: ('a, 'b) => unit = "connect"
@get external gainOf: node => param = "gain"
@get external freqOf: osc => param = "frequency"
@get external filterFreqOf: node => param = "frequency"
@get external filterQOf: node => param = "Q"
@get external delayTimeOf: node => param = "delayTime"
@get external compThreshold: node => param = "threshold"
@get external compKnee: node => param = "knee"
@get external compRatio: node => param = "ratio"
@get external compAttack: node => param = "attack"
@get external compRelease: node => param = "release"
@set external setFilterType: (node, string) => unit = "type"
@set external setOscType: (osc, string) => unit = "type"
@set external setSrcBuffer: (src, buf) => unit = "buffer"
@set external setSrcLoop: (src, bool) => unit = "loop"
@send external startOsc: (osc, float) => unit = "start"
@send external stopOsc: (osc, float) => unit = "stop"
@send external startSrc: (src, float) => unit = "start"
@send external stopSrc: (src, float) => unit = "stop"
@send external setVal: (param, float, float) => unit = "setValueAtTime"
@send external rampTo: (param, float, float) => unit = "linearRampToValueAtTime"
@send external expTo: (param, float, float) => unit = "exponentialRampToValueAtTime"
@send external setTargetAt: (param, float, float, float) => unit = "setTargetAtTime"

/* A noise buffer built in JS: cheap and avoids per-sample externals. */
%%raw(`
function tlNoise(ctx, seconds) {
  const n = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}`)

@val external makeNoise: (actx, float) => buf = "tlNoise"

type ev =
  | ShuttleStart
  | RowLaid
  | Beat(float)
  | Pluck(int)
  | SpoolTap(int)
  | Palette(int)
  | Tension(int, bool)
  | Gold
  | Complete(int)
  | Unlock
  | NewWarp
  | Moth
  | Rest(bool)

let on = ref(false)
let ac: ref<option<actx>> = ref(None)
let dry: ref<option<node>> = ref(None)
let send: ref<option<node>> = ref(None)
let bed: ref<option<node>> = ref(None)
let padFilter: ref<option<node>> = ref(None)
let padOscs: ref<array<osc>> = ref([])
let noise: ref<option<buf>> = ref(None)
let lastTick = ref(0.0)

/* ---------------------------------------------------------------- helpers */

let noiseBuf = c =>
  switch noise.contents {
  | Some(b) => b
  | None =>
    let b = makeNoise(c, 2.0)
    noise := Some(b)
    b
  }

let voice = (c, dur, build) =>
  switch dry.contents {
  | None => ()
  | Some(out) => build(c, out, nowT(c), dur)
  }

let bell = (c, out, t, freq, vol, dur) => {
  let o = createOsc(c)
  let g = createGain(c)
  setOscType(o, "sine")
  freqOf(o)->setVal(freq, t)
  gainOf(g)->setVal(0.0001, t)
  gainOf(g)->rampTo(vol, t +. 0.012)
  gainOf(g)->expTo(0.0001, t +. dur)
  connectTo(o, g)
  connectTo(g, out)
  startOsc(o, t)
  stopOsc(o, t +. dur +. 0.06)
}

let noiseHit = (c, out, t, dur, freq, q, vol, kind) => {
  let s = createSrc(c)
  let f = createFilter(c)
  let g = createGain(c)
  setSrcBuffer(s, noiseBuf(c))
  setFilterType(f, kind)
  filterQOf(f)->setVal(q, t)
  filterFreqOf(f)->setVal(freq, t)
  gainOf(g)->setVal(vol, t)
  gainOf(g)->expTo(0.0001, t +. dur)
  connectTo(s, f)
  connectTo(f, g)
  connectTo(g, out)
  startSrc(s, t)
  stopSrc(s, t +. dur +. 0.05)
}

let sweepNoise = (c, out, t, dur, f0, f1, q, vol) => {
  let s = createSrc(c)
  let f = createFilter(c)
  let g = createGain(c)
  setSrcBuffer(s, noiseBuf(c))
  setFilterType(f, "bandpass")
  filterQOf(f)->setVal(q, t)
  filterFreqOf(f)->setVal(f0, t)
  filterFreqOf(f)->expTo(f1, t +. dur)
  gainOf(g)->setVal(0.0001, t)
  gainOf(g)->rampTo(vol, t +. dur *. 0.25)
  gainOf(g)->expTo(0.0001, t +. dur)
  connectTo(s, f)
  connectTo(f, g)
  connectTo(g, out)
  startSrc(s, t)
  stopSrc(s, t +. dur +. 0.05)
}

let thump = (c, out, t, vol) => {
  let o = createOsc(c)
  let g = createGain(c)
  setOscType(o, "sine")
  freqOf(o)->setVal(78.0, t)
  freqOf(o)->expTo(42.0, t +. 0.20)
  gainOf(g)->setVal(0.0001, t)
  gainOf(g)->rampTo(vol, t +. 0.008)
  gainOf(g)->expTo(0.0001, t +. 0.34)
  connectTo(o, g)
  connectTo(g, out)
  startOsc(o, t)
  stopOsc(o, t +. 0.4)
  /* the wooden tock of the beater reed */
  noiseHit(c, out, t, 0.07, 1500.0, 5.0, vol *. 0.5, "bandpass")
  noiseHit(c, out, t, 0.16, 260.0, 1.2, vol *. 0.45, "lowpass")
}

let semis = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31]
let pick = (a, i) => Belt.Array.getUnsafe(a, i)
let modi = (a, b) => { let r = a - b * (a / b); r < 0 ? r + b : r }

let pluck = (c, out, t, row, vol) => {
  let n = pick(semis, modi(row, Array.length(semis)))
  let freq = 261.63 *. Js.Math.pow_float(~base=2.0, ~exp=Belt.Int.toFloat(n) /. 12.0)
  let o = createOsc(c)
  let f = createFilter(c)
  let g = createGain(c)
  setOscType(o, "triangle")
  freqOf(o)->setVal(freq, t)
  setFilterType(f, "lowpass")
  filterFreqOf(f)->setVal(freq *. 6.0, t)
  filterFreqOf(f)->expTo(freq *. 1.6, t +. 0.5)
  gainOf(g)->setVal(0.0001, t)
  gainOf(g)->rampTo(vol, t +. 0.006)
  gainOf(g)->expTo(0.0001, t +. 0.75)
  connectTo(o, f)
  connectTo(f, g)
  connectTo(g, out)
  startOsc(o, t)
  stopOsc(o, t +. 0.8)
  bell(c, out, t +. 0.005, freq *. 2.0, vol *. 0.25, 0.35)
}

let spoolClick = (c, out, t, pal) => {
  let base = pick([880.0, 740.0, 990.0, 620.0], modi(pal, 4))
  bell(c, out, t, base, 0.20, 0.14)
  bell(c, out, t +. 0.06, base *. 1.5, 0.15, 0.20)
  noiseHit(c, out, t, 0.04, 2600.0, 3.0, 0.12, "bandpass")
}

let woodClack = (c, out, t, up) => {
  let s = createSrc(c)
  let f = createFilter(c)
  let g = createGain(c)
  setSrcBuffer(s, noiseBuf(c))
  setFilterType(f, "bandpass")
  filterQOf(f)->setVal(7.0, t)
  filterFreqOf(f)->setVal(up ? 950.0 : 620.0, t)
  filterFreqOf(f)->expTo(up ? 520.0 : 380.0, t +. 0.09)
  gainOf(g)->setVal(0.22, t)
  gainOf(g)->expTo(0.0001, t +. 0.11)
  connectTo(s, f)
  connectTo(f, g)
  connectTo(g, out)
  startSrc(s, t)
  stopSrc(s, t +. 0.15)
}

/* ------------------------------------------------------------------ the bed */

let buildBed = c =>
  switch dry.contents {
  | None => ()
  | Some(out) =>
    let bus = createGain(c)
    gainOf(bus)->setVal(0.0, nowT(c))
    connectTo(bus, out)
    bed := Some(bus)
    /* warm pad */
    let filt = createFilter(c)
    setFilterType(filt, "lowpass")
    filterQOf(filt)->setVal(0.7, nowT(c))
    filterFreqOf(filt)->setVal(420.0, nowT(c))
    let padGain = createGain(c)
    gainOf(padGain)->setVal(0.07, nowT(c))
    connectTo(filt, padGain)
    connectTo(padGain, bus)
    padFilter := Some(filt)
    padOscs := [createOsc(c), createOsc(c)]
    Belt.Array.forEachWithIndex(padOscs.contents, (i, o) => {
      setOscType(o, i == 0 ? "triangle" : "sawtooth")
      freqOf(o)->setVal(i == 0 ? 55.0 : 55.4, nowT(c))
      let v = createGain(c)
      gainOf(v)->setVal(i == 0 ? 1.0 : 0.35, nowT(c))
      connectTo(o, v)
      connectTo(v, filt)
      startOsc(o, nowT(c))
    })
    /* air */
    let air = createSrc(c)
    let airFilt = createFilter(c)
    let airGain = createGain(c)
    setSrcBuffer(air, noiseBuf(c))
    setSrcLoop(air, true)
    setFilterType(airFilt, "bandpass")
    filterQOf(airFilt)->setVal(0.9, nowT(c))
    filterFreqOf(airFilt)->setVal(640.0, nowT(c))
    gainOf(airGain)->setVal(0.05, nowT(c))
    let lfo = createOsc(c)
    let lfoAmt = createGain(c)
    setOscType(lfo, "sine")
    freqOf(lfo)->setVal(0.07, nowT(c))
    gainOf(lfoAmt)->setVal(260.0, nowT(c))
    connectTo(lfo, lfoAmt)
    connectTo(lfoAmt, filterFreqOf(airFilt))
    connectTo(air, airFilt)
    connectTo(airFilt, airGain)
    connectTo(airGain, bus)
    startSrc(air, nowT(c))
    startOsc(lfo, nowT(c))
  }

let init = () =>
  switch ac.contents {
  | Some(_) => ()
  | None =>
    switch makeCtx() {
    | exception _ => ()
    | c =>
      let sum = createGain(c)
      let comp = createComp(c)
      compThreshold(comp)->setVal(-16.0, nowT(c))
      compKnee(comp)->setVal(18.0, nowT(c))
      compRatio(comp)->setVal(4.0, nowT(c))
      compAttack(comp)->setVal(0.006, nowT(c))
      compRelease(comp)->setVal(0.25, nowT(c))
      gainOf(sum)->setVal(0.62, nowT(c))
      /* a touch of room: a slow feedback delay, mostly dry */
      let d = createDelay(c)
      let dSend = createGain(c)
      let dWet = createGain(c)
      let fb = createGain(c)
      delayTimeOf(d)->setVal(0.27, nowT(c))
      gainOf(dSend)->setVal(0.16, nowT(c))
      gainOf(dWet)->setVal(0.30, nowT(c))
      gainOf(fb)->setVal(0.28, nowT(c))
      connectTo(comp, sum)
      connectTo(sum, dest(c))
      connectTo(sum, dSend)
      connectTo(dSend, d)
      connectTo(d, dWet)
      connectTo(dWet, comp)
      connectTo(d, fb)
      connectTo(fb, d)
      ac := Some(c)
      dry := Some(comp)
      buildBed(c)
    }
  }

let setEnabled = (v: bool) => {
  on := v
  if v {
    init()
    switch (ac.contents, bed.contents) {
    | (Some(c), Some(b)) => gainOf(b)->rampTo(0.85, nowT(c) +. 0.35)
    | _ => ()
    }
    /* the confirming chime, right away */
    switch ac.contents {
    | Some(c) => voice(c, 0.6, (c, out, t, _) => {
        bell(c, out, t, 523.25, 0.26, 0.5)
        bell(c, out, t +. 0.10, 784.0, 0.20, 0.6)
      })
    | None => ()
    }
  } else {
    switch (ac.contents, bed.contents) {
    | (Some(c), Some(b)) => gainOf(b)->setTargetAt(0.0, nowT(c), 0.12)
    | _ => ()
    }
    switch ac.contents {
    | Some(c) => resume(c)
    | None => ()
    }
  }
}

let setTension = (level: int) => {
  switch (ac.contents, padFilter.contents) {
  | (Some(c), Some(f)) =>
    let base = pick([46.0, 55.0, 66.0], modi(level, 3))
    filterFreqOf(f)->setTargetAt(280.0 +. base *. 4.0, nowT(c), 0.4)
    Belt.Array.forEachWithIndex(padOscs.contents, (i, o) =>
      freqOf(o)->setTargetAt(i == 0 ? base : base *. 1.008, nowT(c), 0.5)
    )
  | _ => ()
  }
}

let ctxState = () =>
  switch ac.contents {
  | Some(c) => stateOf(c)
  | None => "none"
  }

let resumeIfNeeded = () =>
  switch ac.contents {
  | Some(c) => resume(c)
  | None => ()
  }

let event = (e: ev) => {
  if !on.contents {
    ()
  } else {
    switch ac.contents {
    | None => ()
    | Some(c) =>
      let t = () => nowT(c)
      switch e {
      | ShuttleStart =>
        voice(c, 0.5, (c, out, at, _) => sweepNoise(c, out, at, 0.42, 380.0, 1500.0, 1.1, 0.10))
      | RowLaid =>
        voice(c, 0.4, (c, out, at, _) => {
          noiseHit(c, out, at, 0.20, 900.0, 0.9, 0.10, "bandpass")
          bell(c, out, at +. 0.02, 392.0, 0.10, 0.3)
        })
      | Beat(power) =>
        voice(c, 0.6, (c, out, at, _) => thump(c, out, at, 0.30 +. 0.20 *. power))
      | Pluck(row) => voice(c, 0.9, (c, out, at, _) => pluck(c, out, at, row, 0.22))
      | SpoolTap(pal) => voice(c, 0.4, (c, out, at, _) => spoolClick(c, out, at, pal))
      | Palette(pal) =>
        voice(c, 0.9, (c, out, at, _) => {
          spoolClick(c, out, at, pal)
          bell(c, out, at +. 0.14, pick([523.25, 440.0, 587.33, 349.23], modi(pal, 4)), 0.22, 0.55)
        })
      | Tension(_, up) => voice(c, 0.3, (c, out, at, _) => woodClack(c, out, at, up))
      | Gold => voice(c, 0.9, (c, out, at, _) => {
          let shimmer = (f, d) => {
            let o = createOsc(c)
            let g = createGain(c)
            setOscType(o, "sine")
            freqOf(o)->setVal(f, at +. d)
            gainOf(g)->setVal(0.0001, at +. d)
            gainOf(g)->rampTo(0.09, at +. d +. 0.05)
            gainOf(g)->expTo(0.0001, at +. d +. 0.8)
            connectTo(o, g)
            connectTo(g, out)
            startOsc(o, at +. d)
            stopOsc(o, at +. d +. 0.9)
          }
          shimmer(1567.98, 0.0)
          shimmer(2093.0, 0.09)
          shimmer(2637.02, 0.2)
        })
      | Complete(pal) =>
        voice(c, 1.8, (c, out, at, _) => {
          let notes = [523.25, 659.25, 783.99, 1046.5]
          Belt.Array.forEachWithIndex(notes, (i, f) =>
            bell(c, out, at +. Belt.Int.toFloat(i) *. 0.19, f, 0.24, 1.5)
          )
          bell(c, out, at +. 0.02, pick([261.63, 220.0, 293.66, 174.61], modi(pal, 4)), 0.16, 1.8)
          sweepNoise(c, out, at, 1.2, 300.0, 2600.0, 0.8, 0.05)
        })
      | Unlock => voice(c, 1.2, (c, out, at, _) => {
          bell(c, out, at, 880.0, 0.20, 0.7)
          bell(c, out, at +. 0.16, 1318.51, 0.16, 1.0)
        })
      | NewWarp => voice(c, 0.9, (c, out, at, _) => {
          sweepNoise(c, out, at, 0.7, 1600.0, 300.0, 1.4, 0.12)
          bell(c, out, at +. 0.08, 196.0, 0.14, 0.6)
        })
      | Moth => voice(c, 0.6, (c, out, at, _) => {
          noiseHit(c, out, at, 0.05, 3200.0, 2.0, 0.05, "bandpass")
          noiseHit(c, out, at +. 0.12, 0.05, 3600.0, 2.0, 0.04, "bandpass")
          noiseHit(c, out, at +. 0.26, 0.08, 2800.0, 2.0, 0.03, "bandpass")
          bell(c, out, at +. 0.3, 1046.5, 0.05, 0.5)
        })
      | Rest(quiet) =>
        switch bed.contents {
        | Some(b) => gainOf(b)->setTargetAt(quiet ? 0.45 : 0.85, t(), 1.2)
        | None => ()
        }
      }
    }
  }
}

/* The bed keeps a slow working rhythm; it quickens while a weft is being laid. */
let tick = (dt: float, weaving: bool) => {
  lastTick := lastTick.contents +. dt
  let interval = weaving ? 1.05 : 2.7
  if on.contents && lastTick.contents > interval {
    lastTick := lastTick.contents -. interval
    switch ac.contents {
    | None => ()
    | Some(c) =>
      voice(c, 0.3, (c, out, at, _) => {
        noiseHit(c, out, at, 0.06, weaving ? 1150.0 : 820.0, 6.0, weaving ? 0.055 : 0.04, "bandpass")
        noiseHit(c, out, at, 0.12, 240.0, 1.1, weaving ? 0.04 : 0.028, "lowpass")
      })
    }
  }
}
