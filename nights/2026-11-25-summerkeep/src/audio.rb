# Every sound is synthesised here: a warm bed that follows how much of the
# pantry is kept, and one small voice for each thing a jar can do.
class Audio
  MINOR = [0, 2, 3, 5, 7, 8, 10].freeze
  DEGREE = { raspberry: 0, gooseberry: 1, damson: 2, apricot: 3,
             blackcurrant: 4, elderberry: 5, plain: 0 }.freeze
  KEY = "summerkeep.sound"

  def initialize
    @ctx = nil
    @on = false
    @wanted = stored
    @bed = nil
    @pad = nil
    @wind = nil
    @progress = 0.0
  end

  def on? = @on
  def ready? = !@ctx.nil?

  # Sound starts silent: browsers want a tap. If the choice was "on" last
  # night, the first touch of this session turns the bed back on.
  def unlock_if_wanted
    return unless @wanted && !@on
    enable
  end

  # Called on the tap that turns sound on, and again when the tab comes back.
  def enable
    build
    @ctx.call(:resume)
    @on = true
    remember("on")
    fade_in
    chime
  end

  def disable
    @on = false
    remember("off")
    return unless @pad
    ramp(@pad[:gain], 0.0, 0.25)
  end

  def resume
    build
    @ctx.call(:resume)
  end

  def set_progress(value)
    @progress = value
    return unless @bed
    ramp(@pad[:gain], 0.05 + (0.07 * value), 1.5)
    ramp(@wind[:gain], 0.03 + (0.03 * value), 1.5)
  end

  def play(event)
    return unless @on && @ctx
    handler = sounds[event[0]]
    handler&.call(event)
  end

  private

  def sounds
    @sounds ||= {
      lift: ->(e) { tone(freq(degree_of(e[1])), 0.16, kind: "triangle", level: 0.16) },
      put_back: ->(e) { tone(freq(degree_of(e[1])), 0.10, kind: "triangle", level: 0.07) },
      pour: ->(e) { pour_sound(e[1]) },
      refuse: ->(_e) { thud },
      seal: ->(e) { seal_sound(e[2] || 0) },
      kept: ->(_e) { kept_sound },
      undo: ->(_e) { wilt },
      restart: ->(_e) { breath },
      window: ->(_e) { shimmer },
      moth: ->(_e) { flutter },
      hint: ->(_e) { nudge },
      kept_open: ->(_e) { welcome }
    }
  end

  def build
    return if @ctx
    @ctx = JS.global[:AudioContext].new
    make_bed
  end

  def make_bed
    @master = @ctx.call(:createGain)
    @master[:gain][:value] = 0.62
    limiter = @ctx.call(:createDynamicsCompressor)
    limiter[:threshold][:value] = -8
    limiter[:ratio][:value] = 12
    limiter[:attack][:value] = 0.004
    limiter[:release][:value] = 0.2
    @master.call(:connect, limiter)
    limiter.call(:connect, @ctx[:destination])
    @pad = pad_voice
    @wind = wind_voice
    @bed = @ctx.call(:createGain)
    @bed[:gain][:value] = 0.0
    @pad.call(:connect, @bed)
    @wind.call(:connect, @bed)
    @bed.call(:connect, @master)
  end

  def pad_voice
    voice = @ctx.call(:createGain)
    voice[:gain][:value] = 0.05
    filter = @ctx.call(:createBiquadFilter)
    filter[:type] = "lowpass".to_js
    filter[:frequency][:value] = 700
    [110.0, 164.8].each do |hz|
      osc = @ctx.call(:createOscillator)
      osc[:type] = "sine".to_js
      osc[:frequency][:value] = hz
      osc.call(:connect, filter)
      osc.call(:start)
    end
    filter.call(:connect, voice)
    voice
  end

  def wind_voice
    voice = @ctx.call(:createGain)
    voice[:gain][:value] = 0.03
    filter = @ctx.call(:createBiquadFilter)
    filter[:type] = "bandpass".to_js
    filter[:frequency][:value] = 300
    filter[:Q][:value] = 1.2
    osc = @ctx.call(:createOscillator)
    osc[:type] = "triangle".to_js
    osc[:frequency][:value] = 76
    osc.call(:connect, filter)
    osc.call(:start)
    filter.call(:connect, voice)
    lfo = @ctx.call(:createOscillator)
    lfo[:frequency][:value] = 0.13
    depth = @ctx.call(:createGain)
    depth[:gain][:value] = 0.012
    lfo.call(:connect, depth)
    depth.call(:connect, voice[:gain])
    lfo.call(:start)
    voice
  end

  def fade_in
    ramp(@pad[:gain], 0.05 + (0.07 * @progress), 0.35)
    ramp(@wind[:gain], 0.03 + (0.03 * @progress), 0.4)
  end

  def ramp(param, value, time)
    now = @ctx[:currentTime].to_f
    param.call(:setValueAtTime, param[:value].to_f, now)
    param.call(:linearRampToValueAtTime, value, now + time)
  end

  def now = @ctx[:currentTime].to_f
  def degree_of(fruit) = DEGREE.fetch(fruit, 0)

  def freq(degree, octave = 0)
    steps = MINOR.fetch(degree % 7) + (12 * (octave + (degree / 7)))
    220.0 * (2.0**(steps / 12.0))
  end

  def tone(hz, dur, opts = {})
    kind = opts.fetch(:kind, "sine")
    level = opts.fetch(:level, 0.15)
    delay = opts.fetch(:delay, 0.0)
    t = now + delay
    osc = @ctx.call(:createOscillator)
    osc[:type] = kind.to_js
    osc[:frequency][:value] = hz
    gain = @ctx.call(:createGain)
    gain[:gain].call(:setValueAtTime, 0.0001, t)
    gain[:gain].call(:exponentialRampToValueAtTime, level, t + 0.02)
    gain[:gain].call(:exponentialRampToValueAtTime, 0.0001, t + dur)
    osc.call(:connect, gain)
    gain.call(:connect, @master)
    osc.call(:start, t)
    osc.call(:stop, t + dur + 0.03)
  end

  # Filtered oscillator rumble: the pour, the breath and the flutter, all
  # synthesised, so the pantry never downloads a sample.
  def swirl(dur, hz, level = 0.10, delay = 0.0)
    t = now + delay
    src = @ctx.call(:createOscillator)
    src[:type] = "sawtooth".to_js
    src[:frequency][:value] = hz * 0.5
    filter = @ctx.call(:createBiquadFilter)
    filter[:type] = "bandpass".to_js
    filter[:frequency][:value] = hz
    filter[:Q][:value] = 3.2
    gain = @ctx.call(:createGain)
    gain[:gain].call(:setValueAtTime, 0.0001, t)
    gain[:gain].call(:exponentialRampToValueAtTime, level, t + 0.05)
    gain[:gain].call(:exponentialRampToValueAtTime, 0.0001, t + dur)
    src.call(:connect, filter)
    filter.call(:connect, gain)
    gain.call(:connect, @master)
    src.call(:start, t)
    src.call(:stop, t + dur + 0.03)
  end

  def pour_sound(fruit)
    degree = degree_of(fruit)
    swirl(0.24, 800 + (degree * 130), 0.11)
    tone(freq(degree), 0.30, kind: "sine", level: 0.13)
  end

  def seal_sound(count)
    degree = count.zero? ? 2 : 4
    tone(freq(degree), 0.9, kind: "sine", level: 0.12)
    tone(freq(degree, 1), 0.7, kind: "sine", level: 0.05)
  end

  def kept_sound
    [3, 5, 7].each_with_index do |degree, i|
      tone(freq(degree), 1.1, kind: "sine", level: 0.13, delay: i * 0.17)
      tone(freq(degree, 1), 0.7, kind: "triangle", level: 0.04, delay: i * 0.17)
    end
  end

  def thud
    tone(98, 0.2, kind: "sine", level: 0.13)
    swirl(0.12, 300, 0.06)
  end

  def wilt
    tone(freq(2), 0.3, kind: "triangle", level: 0.10)
    tone(freq(0), 0.4, kind: "sine", level: 0.08, delay: 0.08)
  end

  def breath = swirl(0.55, 340, 0.07)

  def shimmer
    tone(freq(5, 1), 0.6, kind: "sine", level: 0.05)
    tone(freq(7, 1), 0.5, kind: "sine", level: 0.04, delay: 0.06)
  end

  def flutter
    [0.0, 0.07, 0.15].each { |d| swirl(0.06, 2400 + (rand(600) - 300), 0.05, d) }
    tone(freq(4, 1), 0.5, kind: "triangle", level: 0.04, delay: 0.1)
  end

  def nudge
    tone(freq(4), 0.5, kind: "sine", level: 0.05)
    tone(freq(7), 0.6, kind: "sine", level: 0.04, delay: 0.12)
  end

  def welcome
    tone(freq(0), 0.8, kind: "sine", level: 0.09)
    tone(freq(4, 1), 0.7, kind: "sine", level: 0.04, delay: 0.12)
  end

  def chime
    tone(freq(4), 0.4, kind: "sine", level: 0.16)
    tone(freq(7, 1), 0.5, kind: "sine", level: 0.10, delay: 0.10)
  end

  def stored
    raw = safe_get
    raw != "off"
  end

  def safe_get
    JS.global[:localStorage].call(:getItem, KEY.to_js).to_s
  rescue StandardError
    ""
  end

  def remember(value)
    JS.global[:localStorage].call(:setItem, KEY.to_js, value.to_js)
  rescue StandardError
    nil
  end
end
