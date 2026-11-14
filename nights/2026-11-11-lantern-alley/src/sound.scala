import scala.scalajs.js

/** Everything you hear.
  *
  * The bed is three synthesised layers (wind, a slow pad, a low hum) plus rain
  * when it rains; every interaction has its own voice. Nothing is sampled: it is
  * all oscillators, noise and envelopes through one compressor on the master bus.
  */
class Sound {
  private var ctx: js.Dynamic = null
  private var master: js.Dynamic = null
  private var amb: js.Dynamic = null
  private var windGain: js.Dynamic = null
  private var padGain: js.Dynamic = null
  private var rainGain: js.Dynamic = null
  private var humGain: js.Dynamic = null
  private var noiseBuf: js.Dynamic = null
  private var stepToggle = false
  private var rainNow = 0.0
  private var rainWant = 0.0
  private var dropIn = 1.0
  private var distantIn = 50.0
  private val scale = Array(523.25, 587.33, 659.25, 783.99, 880.00)

  var on = false
  var warmth = 0.0

  private def t: Double = ctx.currentTime.asInstanceOf[Double]

  def ensure(): Unit = {
    if (ctx != null) return
    val AC = js.Dynamic.global.AudioContext
    ctx = js.Dynamic.newInstance(AC)()

    master = ctx.createGain()
    master.gain.value = 0.62
    val comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -14.0
    comp.knee.value = 22.0
    comp.ratio.value = 9.0
    comp.attack.value = 0.005
    comp.release.value = 0.25
    master.connect(comp)
    comp.connect(ctx.destination)

    // two seconds of noise, looped, is the raw material for wind, rain and steps
    val sr = ctx.sampleRate.asInstanceOf[Double]
    val len = (sr * 2.0).toInt
    val buf = ctx.createBuffer(1, len, sr)
    val data = buf.getChannelData(0)
    var i = 0
    while (i < len) { data.updateDynamic(i.toString)(js.Math.random() * 2.0 - 1.0); i += 1 }
    noiseBuf = buf

    amb = ctx.createGain()
    amb.gain.value = 0.0
    amb.connect(master)

    // wind: noise through a lowpass that breathes
    val windSrc = ctx.createBufferSource()
    windSrc.buffer = noiseBuf
    windSrc.loop = true
    val windF = ctx.createBiquadFilter()
    windF.`type` = "lowpass"
    windF.frequency.value = 420.0
    windF.Q.value = 0.7
    windGain = ctx.createGain()
    windGain.gain.value = 0.085
    windSrc.connect(windF); windF.connect(windGain); windGain.connect(amb)
    windSrc.start()
    val lfo = ctx.createOscillator()
    lfo.frequency.value = 0.06
    val lfoG = ctx.createGain()
    lfoG.gain.value = 170.0
    lfo.connect(lfoG); lfoG.connect(windF.frequency); lfo.start()

    // a slow pad: two quiet low tones, one an octave-ish above
    padGain = ctx.createGain()
    padGain.gain.value = 0.055
    val padF = ctx.createBiquadFilter()
    padF.`type` = "lowpass"
    padF.frequency.value = 900.0
    padGain.connect(padF); padF.connect(amb)
    val oa = ctx.createOscillator(); oa.`type` = "triangle"; oa.frequency.value = 55.0
    val ob = ctx.createOscillator(); ob.`type` = "sine"; ob.frequency.value = 82.41
    val oc = ctx.createOscillator(); oc.`type` = "sine"; oc.frequency.value = 110.0
    val ocg = ctx.createGain(); ocg.gain.value = 0.3
    oa.connect(padGain); ob.connect(padGain); oc.connect(ocg); ocg.connect(padGain)
    oa.start(); ob.start(); oc.start()
    val trem = ctx.createOscillator(); trem.frequency.value = 0.07
    val tremG = ctx.createGain(); tremG.gain.value = 0.022
    trem.connect(tremG); tremG.connect(padGain.gain); trem.start()

    // the alley's own hum
    humGain = ctx.createGain()
    humGain.gain.value = 0.018
    val h1 = ctx.createOscillator(); h1.`type` = "sine"; h1.frequency.value = 110.0
    val h2 = ctx.createOscillator(); h2.`type` = "sine"; h2.frequency.value = 110.7
    h1.connect(humGain); h2.connect(humGain); humGain.connect(amb)
    h1.start(); h2.start()

    // rain, silent until a gust wakes it
    val rainSrc = ctx.createBufferSource()
    rainSrc.buffer = noiseBuf
    rainSrc.loop = true
    val rainF = ctx.createBiquadFilter()
    rainF.`type` = "bandpass"
    rainF.frequency.value = 1500.0
    rainF.Q.value = 0.6
    rainGain = ctx.createGain()
    rainGain.gain.value = 0.0
    rainSrc.connect(rainF); rainF.connect(rainGain); rainGain.connect(amb)
    rainSrc.start()
  }

  /** Turning sound on answers at once: the bed is up inside 350 ms and a chime confirms it. */
  def unmute(): Unit = {
    ensure()
    ctx.resume()
    on = true
    val now = t
    amb.gain.cancelScheduledValues(now)
    amb.gain.setValueAtTime(amb.gain.value, now)
    amb.gain.linearRampToValueAtTime(1.0, now + 0.35)
    chime()
  }

  def mute(): Unit = {
    on = false
    if (ctx == null) return
    val now = t
    amb.gain.cancelScheduledValues(now)
    amb.gain.setValueAtTime(amb.gain.value, now)
    amb.gain.linearRampToValueAtTime(0.0, now + 0.45)
  }

  def resumeIfOn(): Unit = { if (on && ctx != null) ctx.resume() }

  /** "none" before the first tap, then the AudioContext's own state */
  def state: String = if (ctx == null) "none" else ctx.state.toString

  private def burst(freq: Double, q: Double, dur: Double, gain: Double, kind: String): Unit = {
    if (!on) return
    val t0 = t
    val src = ctx.createBufferSource()
    src.buffer = noiseBuf
    src.loop = true
    val f = ctx.createBiquadFilter()
    f.`type` = kind
    f.frequency.value = freq
    f.Q.value = q
    val g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.linearRampToValueAtTime(gain, t0 + dur * 0.25)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    src.connect(f); f.connect(g); g.connect(master)
    src.start(t0, js.Math.random() * 1.5)
    src.stop(t0 + dur + 0.05)
  }

  private def bell(freq: Double, gain: Double, when: Double, decay: Double): Unit = {
    if (!on) return
    val t0 = t + when
    val o = ctx.createOscillator()
    o.`type` = "sine"
    o.frequency.setValueAtTime(freq, t0)
    val o2 = ctx.createOscillator()
    o2.`type` = "sine"
    o2.frequency.setValueAtTime(freq * 2.01, t0)
    val g2 = ctx.createGain()
    g2.gain.value = 0.25
    val g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay)
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master)
    o.start(t0); o2.start(t0)
    o.stop(t0 + decay + 0.05); o2.stop(t0 + decay + 0.05)
  }

  private def tone(f1: Double, f2: Double, dur: Double, gain: Double, kind: String): Unit = {
    if (!on) return
    val t0 = t
    val o = ctx.createOscillator()
    o.`type` = kind
    o.frequency.setValueAtTime(f1, t0)
    o.frequency.exponentialRampToValueAtTime(f2, t0 + dur)
    val g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.linearRampToValueAtTime(gain, t0 + dur * 0.2)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    o.connect(g); g.connect(master)
    o.start(t0); o.stop(t0 + dur + 0.05)
  }

  def chime(): Unit = { bell(392.0, 0.20, 0.0, 1.4); bell(587.33, 0.15, 0.10, 1.9) }

  def step(): Unit = {
    stepToggle = !stepToggle
    burst(if (stepToggle) 760.0 else 600.0, 1.5, 0.08, 0.045, "bandpass")
  }

  def warm(): Unit = { tone(196.0, 262.0, 0.75, 0.13, "sine"); bell(784.0, 0.05, 0.03, 1.1); burst(700.0, 0.7, 0.35, 0.035, "lowpass") }

  def tend(): Unit = {
    bell(523.25, 0.09, 0.0, 1.7)
    bell(659.25, 0.08, 0.09, 1.7)
    bell(783.99, 0.07, 0.18, 1.9)
    bell(1567.98, 0.04, 0.30, 1.3)
  }

  def coin(n: Int): Unit = {
    val f = scale(math.max(0, math.min(n, scale.length - 1)))
    bell(f, 0.15, 0.0, 1.5)
    bell(f * 1.5, 0.10, 0.12, 2.0)
  }

  def gust(): Unit = { burst(1400.0, 0.9, 1.2, 0.09, "bandpass"); tone(96.0, 54.0, 0.9, 0.05, "triangle") }

  def purr(): Unit = {
    if (!on) return
    val t0 = t
    val o = ctx.createOscillator()
    o.`type` = "sawtooth"
    o.frequency.setValueAtTime(86.0, t0)
    val f = ctx.createBiquadFilter()
    f.`type` = "lowpass"
    f.frequency.value = 340.0
    val g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.linearRampToValueAtTime(0.055, t0 + 0.15)
    g.gain.linearRampToValueAtTime(0.0001, t0 + 1.3)
    val trem = ctx.createOscillator(); trem.frequency.value = 26.0
    val tremG = ctx.createGain(); tremG.gain.value = 0.028
    trem.connect(tremG); tremG.connect(g.gain); trem.start(t0); trem.stop(t0 + 1.3)
    o.connect(f); f.connect(g); g.connect(master)
    o.start(t0); o.stop(t0 + 1.35)
  }

  def ripple(): Unit = { bell(880.0, 0.06, 0.0, 1.1); bell(1174.66, 0.045, 0.07, 1.3); burst(2100.0, 1.0, 0.2, 0.03, "bandpass") }

  def reveal(): Unit = {
    tone(330.0, 660.0, 2.4, 0.055, "sine")
    bell(659.25, 0.09, 0.15, 3.0)
    bell(987.77, 0.06, 0.65, 3.4)
  }

  def drop(): Unit = burst(2400.0, 1.2, 0.10, 0.03, "bandpass")

  /** rain landing on a warm lantern */
  def hiss(): Unit = { burst(3400.0, 0.7, 0.55, 0.028, "highpass"); burst(1800.0, 1.0, 0.3, 0.02, "bandpass") }

  /** knuckles on an old door */
  def knock(): Unit = { tone(150.0, 74.0, 0.16, 0.10, "triangle"); burst(420.0, 1.2, 0.13, 0.05, "lowpass") }

  /** someone moves about behind the barred window */
  def insideRoom(): Unit = { bell(659.25, 0.055, 0.0, 2.2); bell(880.0, 0.04, 0.13, 2.6); burst(320.0, 0.8, 0.35, 0.03, "lowpass") }

  /** and something answers from behind the door */
  def answered(): Unit = { bell(523.25, 0.07, 0.0, 2.4); bell(392.0, 0.05, 0.36, 3.0) }

  def sync(warm: Double, rain: Double, dt: Double): Unit = {
    warmth = warm
    rainWant = rain
    if (ctx == null) return
    if (on) {
      rainNow = rainNow + (rainWant - rainNow) * math.min(1.0, dt * 0.25)
      rainGain.gain.setTargetAtTime(0.11 * rainNow, t, 0.6)
      windGain.gain.setTargetAtTime(0.085 + 0.05 * rainNow, t, 1.5)
      padGain.gain.setTargetAtTime(0.05 + 0.035 * warmth, t, 2.0)
      dropIn -= dt * (0.2 + rainNow * 1.6)
      if (dropIn <= 0.0) { dropIn = 0.5 + js.Math.random() * 2.5; if (rainNow > 0.05) drop() }
      distantIn -= dt
      if (distantIn <= 0.0) { distantIn = 45.0 + js.Math.random() * 60.0; bell(scale((js.Math.random() * scale.length).toInt % scale.length) / 2.0, 0.045, 0.0, 3.0) }
    }
    }}
