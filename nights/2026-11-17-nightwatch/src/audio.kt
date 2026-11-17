// audio.kt — the night's sound, synthesised from oscillators and noise. The
// context is not created until the visitor turns sound on, so nothing plays
// on load or on the first tap. Everything runs through one compressor.

external interface AudioNode { fun connect(dst: dynamic): dynamic }

external interface Param {
  var value: Double
  fun setValueAtTime(v: Double, t: Double)
  fun linearRampToValueAtTime(v: Double, t: Double)
  fun exponentialRampToValueAtTime(v: Double, t: Double)
  fun cancelScheduledValues(t: Double)
}

external interface OscNode : AudioNode { var type: String; val frequency: Param; val detune: Param; fun start(t: Double); fun stop(t: Double) }
external interface GainNode : AudioNode { val gain: Param }
external interface FilterNode : AudioNode { var type: String; val frequency: Param; val Q: Param }
external interface SourceNode : AudioNode { var buffer: dynamic; var loop: Boolean; fun start(t: Double); fun stop(t: Double) }
external interface BufNode { fun getChannelData(i: Int): FloatArray }
external interface CompNode : AudioNode { val threshold: Param; val ratio: Param; val attack: Param; val release: Param }

external class AudioContext() {
  val currentTime: Double
  val destination: AudioNode
  val sampleRate: Double
  val state: String
  fun createOscillator(): OscNode
  fun createGain(): GainNode
  fun createBiquadFilter(): FilterNode
  fun createBufferSource(): SourceNode
  fun createBuffer(channels: Int, length: Int, rate: Double): BufNode
  fun createDynamicsCompressor(): CompNode
  fun resume(): dynamic
}

const val SILENT = 0.0001

// One voice: what kind of wave it is, its pitch, and the shape of its envelope
// (gain, attack, release). A lowpass filter is applied when filterHz is set.
class VoiceSpec(val type: String, val freq: Double, val gain: Double, val attack: Double, val release: Double, val filterHz: Double)

// One noise sweep: how long it runs, how loud it is, the band it travels between
// and how resonant that band is.
class SweepSpec(val dur: Double, val gain: Double, val from: Double, val to: Double, val q: Double)

class AudioKit {
  private var ctx: AudioContext? = null
  private var master: GainNode? = null
  private var beds = ArrayList<GainNode>()
  private var noise: BufNode? = null
  private var auroraVoices = ArrayList<OscNode>()
  var voices: Int = 0
  var on: Boolean = false
  var state: String = "off"

  fun toggle(want: Boolean) {
    on = want
    if (want) {
      ensure()
      resume()
      fadeIn()
    } else {
      ramp(master?.gain, 0.0, 0.25)
      state = "muted"
    }
  }

  fun resume() {
    val c = ctx ?: return
    c.resume()
    state = if (on) "playing" else "muted"
  }

  private fun ensure() {
    if (ctx != null) return
    val c = AudioContext()
    val comp = c.createDynamicsCompressor()
    comp.threshold.value = -14.0
    comp.ratio.value = 4.0
    comp.attack.value = 0.01
    comp.release.value = 0.3
    val m = c.createGain()
    m.gain.value = SILENT
    m.connect(comp)
    comp.connect(c.destination)
    master = m
    ctx = c
    noise = makeNoise(c)
    startBed(c, m)
    state = "ready"
  }

  private fun makeNoise(c: AudioContext): BufNode {
    val frames = (c.sampleRate * 2.0).toInt()
    val buf = c.createBuffer(1, frames, c.sampleRate)
    val data = buf.getChannelData(0)
    val rng = Rng(0x5EED)
    var i = 0
    while (i < frames) {
      data[i] = (rng.unit() * 2.0 - 1.0).toFloat()
      i += 1
    }
    return buf
  }

  private fun startBed(c: AudioContext, out: GainNode) {
    val wind = c.createBufferSource()
    wind.buffer = noise
    wind.loop = true
    val wf = c.createBiquadFilter()
    wf.type = "lowpass"
    wf.frequency.value = 340.0
    val wg = c.createGain()
    wg.gain.value = 0.05
    wind.connect(wf)
    wf.connect(wg)
    wg.connect(out)
    wind.start(0.0)
    beds.add(wg)
    val pad = c.createGain()
    pad.gain.value = 0.035
    pads(c, pad)
    pad.connect(out)
    beds.add(pad)
    val hum = c.createGain()
    hum.gain.value = 0.0
    hums(c, hum)
    hum.connect(out)
    beds.add(hum)
  }

  private fun pads(c: AudioContext, out: GainNode) {
    val filter = c.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 280.0
    filter.connect(out)
    doubleArrayOf(55.0, 82.4).forEachIndexed { i, f ->
      val osc = c.createOscillator()
      osc.type = "triangle"
      osc.frequency.value = f
      osc.detune.value = if (i == 0) -6.0 else 7.0
      osc.connect(filter)
      osc.start(0.0)
    }
    val lfo = c.createOscillator()
    lfo.type = "sine"
    lfo.frequency.value = 0.055
    val depth = c.createGain()
    depth.gain.value = 0.014
    lfo.connect(depth)
    depth.connect(out.gain)
    lfo.start(0.0)
  }

  private fun hums(c: AudioContext, out: GainNode) {
    doubleArrayOf(110.0, 165.0).forEachIndexed { i, f ->
      val osc = c.createOscillator()
      osc.type = "sine"
      osc.frequency.value = f
      osc.detune.value = if (i == 0) 4.0 else -4.0
      osc.connect(out)
      osc.start(0.0)
    }
  }

  private fun fadeIn() {
    ramp(master?.gain, 0.62, 0.35)
    confirm()
  }

  private fun ramp(param: Param?, to: Double, seconds: Double) {
    val c = ctx ?: return
    val p = param ?: return
    val t = c.currentTime
    p.cancelScheduledValues(t)
    p.setValueAtTime(p.value.coerceAtLeast(SILENT), t)
    p.linearRampToValueAtTime(to.coerceAtLeast(SILENT), t + seconds)
  }

  private fun voice(v: VoiceSpec) {
    val c = ctx ?: return
    val out = master ?: return
    if (!on) return
    val t = c.currentTime
    val osc = c.createOscillator()
    osc.type = v.type
    osc.frequency.value = v.freq
    val g = c.createGain()
    g.gain.value = SILENT
    g.gain.setValueAtTime(SILENT, t)
    g.gain.exponentialRampToValueAtTime(v.gain, t + v.attack)
    g.gain.exponentialRampToValueAtTime(SILENT, t + v.attack + v.release)
    var tail: AudioNode = osc
    if (v.filterHz > 0.0) {
      val f = c.createBiquadFilter()
      f.type = "lowpass"
      f.frequency.value = v.filterHz
      osc.connect(f)
      tail = f
    }
    tail.connect(g)
    g.connect(out)
    osc.start(t)
    osc.stop(t + v.attack + v.release + 0.05)
    voices += 1
  }

  private fun sweep(s: SweepSpec) {
    val c = ctx ?: return
    val out = master ?: return
    if (!on) return
    val t = c.currentTime
    val src = c.createBufferSource()
    src.buffer = noise
    src.loop = true
    val f = c.createBiquadFilter()
    f.type = "bandpass"
    f.Q.value = s.q
    f.frequency.setValueAtTime(s.from, t)
    f.frequency.exponentialRampToValueAtTime(s.to, t + s.dur)
    val g = c.createGain()
    g.gain.value = SILENT
    g.gain.setValueAtTime(SILENT, t)
    g.gain.exponentialRampToValueAtTime(s.gain, t + 0.05)
    g.gain.exponentialRampToValueAtTime(SILENT, t + s.dur)
    src.connect(f)
    f.connect(g)
    g.connect(out)
    src.start(t)
    src.stop(t + s.dur + 0.05)
    voices += 1
  }

  fun confirm() {
    voice(VoiceSpec("sine", 660.0, 0.13, 0.01, 0.45, 0.0))
    voice(VoiceSpec("sine", 990.0, 0.07, 0.02, 0.6, 0.0))
  }

  fun chime(freq: Double, mag: Double) {
    val gain = 0.10 + 0.09 * mag
    voice(VoiceSpec("sine", freq, gain, 0.012, 0.85, 0.0))
    voice(VoiceSpec("triangle", freq * 2.0, gain * 0.28, 0.01, 0.5, 2600.0))
  }

  fun doubleChime(freq: Double) {
    chime(freq, 1.0)
    voice(VoiceSpec("sine", freq * 1.5, 0.11, 0.05, 1.15, 0.0))
    sweep(SweepSpec(0.55, 0.045, 2400.0, 5200.0, 6.0))
  }

  fun mark(freq: Double) {
    voice(VoiceSpec("triangle", freq * 0.5, 0.14, 0.18, 1.5, 900.0))
    voice(VoiceSpec("sine", freq * 0.25, 0.09, 0.22, 1.7, 0.0))
  }

  fun naming(root: Double) {
    voice(VoiceSpec("sine", root, 0.13, 0.25, 2.2, 0.0))
    voice(VoiceSpec("sine", root * 1.5, 0.09, 0.35, 2.1, 0.0))
    voice(VoiceSpec("sine", root * 2.0, 0.07, 0.5, 2.0, 0.0))
    sweep(SweepSpec(2.4, 0.03, 900.0, 3200.0, 3.0))
  }

  fun dome(open: Boolean) {
    sweep(SweepSpec(1.3, 0.11, if (open) 170.0 else 720.0, if (open) 720.0 else 170.0, 1.1))
    voice(VoiceSpec("sine", 74.0, 0.13, 0.02, 1.1, 0.0))
  }

  fun meteor() {
    sweep(SweepSpec(0.8, 0.08, 1500.0, 240.0, 1.4))
  }

  fun auroraVoice(up: Boolean) {
    if (!up) {
      val t = ctx?.currentTime ?: 0.0
      auroraVoices.forEach { it.stop(t) }
      auroraVoices.clear()
      return
    }
    if (auroraVoices.isNotEmpty()) return
    val c = ctx ?: return
    val out = master ?: return
    listOf(-5.0, 6.0).forEachIndexed { i, cents ->
      val osc = c.createOscillator()
      osc.type = "sine"
      osc.frequency.value = if (i == 0) 220.0 else 277.2
      osc.detune.value = cents
      val g = c.createGain()
      g.gain.value = SILENT
      g.gain.setValueAtTime(SILENT, c.currentTime)
      g.gain.linearRampToValueAtTime(0.035, c.currentTime + 2.6)
      osc.connect(g)
      g.connect(out)
      osc.start(c.currentTime)
      auroraVoices.add(osc)
    }
  }

  fun setLevels(domeOpen: Double, auroraLevel: Double) {
    ramp(beds.getOrNull(0)?.gain, 0.05 + 0.03 * auroraLevel, 1.5)
    ramp(beds.getOrNull(1)?.gain, 0.035 + 0.02 * domeOpen, 1.5)
  }

  fun level(): Double = master?.gain?.value ?: 0.0
}
