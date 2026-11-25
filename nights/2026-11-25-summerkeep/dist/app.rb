# Summerkeep — built from src/ by build.sh. The solver (src/solver.rb) stays on the build machine.
# --- src/palette.rb
# Summerkeep colours: a night pantry, warm and dim.
# Every colour is an "#rrggbb" string built by hand for exact pixel control.
module Palette
  NIGHT       = "#0c1118"
  WALL        = "#141b25"
  WALL_WARM   = "#1c2430"
  SHELF_WOOD  = "#3b2a22"
  SHELF_EDGE  = "#5a4234"
  WOOD_DARK   = "#241a15"
  LAMP        = "#f0c98a"
  LAMP_GLOW   = "#6b5024"
  MOON        = "#cfe0ee"
  MOON_DIM    = "#8fa6bb"
  GLASS       = "#2a333f"
  GLASS_LIGHT = "#3d4855"
  SEAL        = "#c8a45e"
  TEXT        = "#d9c9ae"
  TEXT_DIM    = "#8a7f6d"
  DANGER      = "#7d4a4a"
  HINT        = "#9fd0c0"

  # fruit => [body, light, dark]
  FRUITS = {
    raspberry:    ["#b8485f", "#dd7285", "#7d2f3f"],
    gooseberry:   ["#8ab24e", "#b6d477", "#5a7530"],
    damson:       ["#7a5aa8", "#a482cc", "#4e3a70"],
    apricot:      ["#d8974f", "#f0bb7c", "#946233"],
    blackcurrant: ["#4f6b9e", "#7a95c4", "#334568"],
    elderberry:   ["#9a4a7a", "#c47aa2", "#6b3054"]
  }.freeze

  def self.fruit(fruit, tone = 0)
    FRUITS.fetch(fruit, ["#888888", "#aaaaaa", "#555555"])[tone]
  end
end
# --- src/rules.rb
# One shelf of jars, and the laws of the pantry.
# A shelf holds jars bottom-first. A jar is a fruit symbol; :plain is a
# colourless jar that takes the fruit of whatever shelf it is poured onto.
class Rack
  PLAIN = :plain

  attr_reader :jars, :capacity
  attr_accessor :covered

  def initialize(jars = [], capacity: 4, covered: false)
    @jars = jars.dup
    @capacity = capacity
    @covered = covered
  end

  def empty? = @jars.empty?
  def size = @jars.size
  def top = @jars.last
  def full? = @jars.size >= @capacity
  def open_slots = @capacity - @jars.size
  def capped? = @covered && !empty?
  def sealed? = full? && top != PLAIN && @jars.uniq.size == 1
  def settled? = empty? || sealed?
  def plain? = top == PLAIN

  def run
    n = 0
    n += 1 while n < size && @jars[size - 1 - n] == top
    n
  end

  def crowded? = full? || capped? || sealed?
  def dup = Rack.new(@jars, capacity: @capacity, covered: @covered)
  def key = "#{@jars.join(',')}/#{@capacity}#{@covered ? 'c' : ''}"
end

module Rules
  def self.pourable?(racks, from, to)
    src = racks[from]
    dst = racks[to]
    return false if blocked?(src, dst)
    dst.empty? || src.top == dst.top || src.plain?
  end

  def self.blocked?(src, dst)
    same?(src, dst) || src.empty? || dst.crowded?
  end

  def self.same?(src, dst) = src.equal?(dst)

  # Move as many matching jars as fit, and let plain jars take the fruit below.
  def self.pour(racks, from, to)
    src = racks[from]
    dst = racks[to]
    fruit = dst.top
    moved = [src.run, dst.open_slots].min.times.map { src.jars.pop }
    moved.each { |jar| dst.jars << (jar == Rack::PLAIN ? fruit : jar) }
    moved.size
  end

  def self.moves(racks)
    pairs = (0...racks.size).to_a.product((0...racks.size).to_a)
    pairs.select { |from, to| pourable?(racks, from, to) }
  end

  def self.settled?(racks) = racks.all?(&:settled?)
  def self.state_key(racks) = racks.map(&:key).sort.join("|")
  def self.snapshot(racks) = racks.map(&:dup)
end
# --- src/levels.rb
# The pantry shelves, in order. Jars are listed bottom-first:
#   [raspberry, damson] means a raspberry jar with a damson jar on top.
# Each shelf holds four jars unless it says otherwise; :plain is a colourless jar.
Level = Struct.new(:name, :hint, :fruits, :racks, keyword_init: true)

module Levels
  R = :raspberry
  G = :gooseberry
  D = :damson
  A = :apricot
  B = :blackcurrant

  ALL = [
    { name: "First Jars", hint: "Tap a jar, then tap a shelf",
      fruits: [R, D],
      racks: [{ jars: [R, R, D, D] }, { jars: [D, D, R, R] }, {}] },

    { name: "Three Fruits", hint: "Only the topmost jar lifts",
      fruits: [R, G, D],
      racks: [{ jars: [R, D, R, G] }, { jars: [G, R, G, D] }, { jars: [D, G, D, R] }, {}] },

    { name: "Short Shelves", hint: "A short shelf holds only three jars",
      fruits: [R, G, D],
      racks: [{ jars: [R, D, G], capacity: 3 }, { jars: [D, G, R], capacity: 3 },
              { jars: [G, R, D], capacity: 3 }, { capacity: 3 }, { capacity: 3 }] },

    { name: "The Covered Shelf", hint: "The covered shelf takes nothing until it is empty",
      fruits: [R, G, D],
      racks: [{ jars: [R, D], covered: true }, { jars: [G, D, R, G] }, { jars: [D, G, R, D] },
              { jars: [G, R] }, {}] },

    { name: "Plain Glass", hint: "A plain jar takes the fruit it lands on",
      fruits: [R, G, D],
      racks: [{ jars: [R, D, :plain, R] }, { jars: [G, R, G] }, { jars: [D, G, D] },
              { jars: [R, G] }, {}, {}] },

    { name: "Four Fruits", hint: "Pour a jar onto its own fruit, or an empty shelf",
      fruits: [R, G, D, A],
      racks: [{ jars: [R, A, G, D] }, { jars: [G, D, A, R] }, { jars: [D, G, R, A] },
              { jars: [A, R, D, G] }, {}, {}] },

    { name: "The Long Shelf", hint: "Short and tall shelves both want one fruit",
      fruits: [R, G, D, A],
      racks: [{ jars: [R, D, A, G] }, { jars: [G, A, D, R] }, { jars: [D, A, R], capacity: 3 },
              { jars: [G, D, A], capacity: 3 }, { capacity: 3 }, {}] },

    { name: "Summer Kept", hint: "Every jar will find its shelf",
      fruits: [R, D, A, B],
      racks: [{ jars: [R, A, B, D] }, { jars: [A, B, D, R] }, { jars: [B, D, R] },
              { jars: [D, R, A] }, { jars: [A, B] }, {}, {}] }
  ]

  def self.build(index)
    spec = ALL.fetch(index)
    Level.new(name: spec[:name], hint: spec[:hint], fruits: spec[:fruits],
              racks: spec[:racks].map do |rack|
                Rack.new(rack[:jars] || [], capacity: rack[:capacity] || 4, covered: rack[:covered] || false)
              end)
  end

  def self.count = ALL.size
end
# --- src/game.rb
# One night in the pantry: a shelf at a time, with undo, restart and a slow pulse.
# Pure Ruby — no JavaScript here, so tools/validate.mjs can play a shelf through.
class Session
  STIR_AFTER = 7.0
  HINT_AFTER = 26.0
  MOTH_AFTER = 14

  attr_reader :events, :level_index, :moves, :racks, :level, :held

  def initialize
    @events = []
    @window_taps = 0
    @moth = false
    load_level(0)
  end

  def name = @level.name
  def hint = @level.hint
  def fruits = @level.fruits
  def completed? = @completed
  def finished? = @finished
  # A level is clean when nothing was taken back along the way.
  def clean? = !@touched
  def held_fruit = @held ? @racks[@held].top : nil
  def held_count = @held ? @racks[@held].run : 0
  def settled_count = @racks.count(&:sealed?)
  def goal = @level.fruits.size
  def moves_taken = @moves

  def load_level(index)
    @level_index = index
    @level = Levels.build(index)
    @racks = @level.racks
    @history = []
    @moves = 0
    @completed = false
    @finished = false
    @touched = @touched_all
    @held = nil
    @idle = 0
    @events << [:kept_open, @level_index]
  end

  def press(index)
    return unless playable?(index)
    @idle = 0
    return cancel if @held == index
    @held.nil? ? lift(index) : pour_to(index)
  end

  def playable?(index)
    valid?(index) && !@completed
  end

  def valid?(index)
    !index.nil? && !index.negative? && index < @racks.size
  end

  def cancel
    @events << [:put_back]
    @held = nil
  end

  def undo
    return @events << [:refuse] if @history.empty?
    @racks = @history.pop
    @held = nil
    @touched = true
    @completed = false
    @moves += 1
    @events << [:undo, @moves]
  end

  def restart
    @touched = true
    @touched_all = true
    load_level(@level_index)
    @events << [:restart]
  end

  def next_level
    load_level(@level_index + 1)
  end

  def begin_again
    @touched_all = false
    load_level(0)
    @events << [:restart]
  end

  def window_tap
    @idle = 0
    @window_taps += 1
    @events << [:window]
    return if @moth || @window_taps < MOTH_AFTER
    @moth = true
    @events << [:moth]
  end

  def moth? = @moth

  def tick(dt)
    @idle += dt
    track_stir
    return unless hint_due?
    @hint_shown = true
    @events << [:hint, hint_move]
    @idle = 0
  end

  def track_stir
    due = @idle > STIR_AFTER
    if due && !@stirred
      @stirred = true
      @events << [:stir]
    elsif !due
      @stirred = false
    end
  end

  def hint_due? = quiet? && @idle > HINT_AFTER

  def quiet? = !@hint_shown && !@completed

  # The gentlest nudge: a move that pours onto its own fruit, else onto a gap.
  def hint_move
    moves = Rules.moves(@racks)
    return nil if moves.empty?
    moves.find { |_f, to| !@racks[to].empty? } || moves.first
  end

  def drain_events
    drained = @events
    @events = []
    drained
  end

  private

  def lift(index)
    rack = @racks[index]
    return @events << [:refuse, index] if rack.empty? || rack.sealed?
    @held = index
    @events << [:lift, rack.top, rack.run]
  end

  def pour_to(index)
    from = @held
    return @events << [:refuse, index] unless Rules.pourable?(@racks, from, index)
    @history << Rules.snapshot(@racks)
    count = Rules.pour(@racks, from, index)
    @held = nil
    @moves += 1
    @events << [:pour, @racks[index].top, count, index]
    @events << [:seal, index] if @racks[index].sealed?
    settle!
  end

  def settle!
    return unless Rules.settled?(@racks)
    @completed = true
    @events << [:kept, @moves, clean?]
  end
end
# --- src/render.rb
# Where the pantry geometry lives, in one place, so thumbs and eyes agree.
module Layout
  W = 190
  H = 300
  ROOM_H = 92
  CELL_W = 46
  JAR_W = 40
  JAR_H = 15
  PLANK_H = 6
  ROW_H = 74
  ROW_GAP = 14

  def self.grid(count)
    count <= 3 ? count : (count <= 6 ? 3 : 4)
  end

  def self.rows(count) = (count + grid(count) - 1) / grid(count)

  def self.block_top(count)
    block = rows(count) * ROW_H - ROW_GAP
    ROOM_H + [(H - ROOM_H - block) / 2, 0].max
  end

  # The shelf line a rack's jars stand on.
  def self.plank_y(index, count)
    block_top(count) + (index / grid(count)) * ROW_H + JAR_H * 4
  end

  def self.rack_x(index, count)
    cols = grid(count)
    (W - cols * CELL_W) / 2 + (index % cols) * CELL_W
  end

  def self.rack_rect(index, count)
    [rack_x(index, count), plank_y(index, count), CELL_W, JAR_H * 4 + PLANK_H]
  end

  def self.rack_at(x, y, count)
    (0...count).find do |i|
      rx, py = rack_x(i, count), plank_y(i, count)
      x >= rx - 2 && x <= rx + CELL_W + 2 && y >= py - JAR_H * 4 - 8 && y <= py + PLANK_H + 8
    end
  end

  def self.in_window?(x, y) = y < ROOM_H && x > 96 && x < W - 4
end

# Small canvas facade: every call crosses into JavaScript, so keep them counted.
module Paint
  def self.setup(canvas)
    @ctx = canvas.call(:getContext, "2d".to_js)
    @ctx
  end

  def self.alpha(hex, a)
    r = hex[1, 2].to_i(16)
    g = hex[3, 2].to_i(16)
    b = hex[5, 2].to_i(16)
    "rgba(#{r},#{g},#{b},#{a})"
  end

  def self.fill(x, y, w, h, color)
    @ctx[:fillStyle] = color.to_js
    @ctx.call(:fillRect, x, y, w, h)
  end

  def self.rect_outline(x, y, w, h, color, width = 1)
    @ctx[:strokeStyle] = color.to_js
    @ctx[:lineWidth] = width
    @ctx.call(:strokeRect, x, y, w, h)
  end

  def self.round(x, y, w, h, r, color)
    @ctx[:fillStyle] = color.to_js
    @ctx.call(:beginPath)
    @ctx.call(:moveTo, x + r, y)
    @ctx.call(:lineTo, x + w - r, y)
    @ctx.call(:quadraticCurveTo, x + w, y, x + w, y + r)
    @ctx.call(:lineTo, x + w, y + h - r)
    @ctx.call(:quadraticCurveTo, x + w, y + h, x + w - r, y + h)
    @ctx.call(:lineTo, x + r, y + h)
    @ctx.call(:quadraticCurveTo, x, y + h, x, y + h - r)
    @ctx.call(:lineTo, x, y + r)
    @ctx.call(:quadraticCurveTo, x, y, x + r, y)
    @ctx.call(:closePath)
    @ctx.call(:fill)
  end

  def self.glow(x, y, r, color, a = 0.5)
    @ctx[:fillStyle] = alpha(color, a).to_js
    @ctx.call(:beginPath)
    @ctx.call(:arc, x, y, r, 0, 6.2832)
    @ctx.call(:fill)
  end
end
# --- src/scene.rb
# The room, the shelves and the small animations. No text here: words live in
# the page around the canvas, where they stay crisp on every screen.
class View
  TAU = 6.2832
  HELD_LIFT = 22

  def initialize(canvas)
    @canvas = canvas
    @ctx = Paint.setup(canvas)
    @scale = 1
    @time = 0.0
    @drop = {}
    @shake = {}
    @seal = {}
    @kept = 0.0
    @stir = 0.0
    @hint = nil
    @glint = 0.0
    @motes = Array.new(16) { [rand(Layout::W), rand(Layout::H), 0.25 + (rand(60) / 100.0)] }
    resize
  end

  def resize
    vw = JS.global[:innerWidth].to_i
    vh = JS.global[:innerHeight].to_i
    @scale = fit_for(vw, vh).clamp(1.0, 8.0)
    apply_scale(pixel_ratio)
  end

  def fit_for(vw, vh)
    [(vw - 24).to_f / Layout::W, (vh - 168).to_f / Layout::H].min
  end

  def pixel_ratio
    ratio = JS.global[:devicePixelRatio].to_f
    ratio < 1.0 ? 1.0 : ratio
  end

  def apply_scale(dpr)
    css_w = (Layout::W * @scale).round
    css_h = (Layout::H * @scale).round
    @canvas[:width] = (css_w * dpr).round
    @canvas[:height] = (css_h * dpr).round
    @canvas[:style][:width] = "#{css_w}px"
    @canvas[:style][:height] = "#{css_h}px"
    @ctx.call(:setTransform, @scale * dpr, 0, 0, @scale * dpr, 0, 0)
  end

  def notify(event)
    handler = reactions[event[0]]
    handler&.call(event)
  end

  def reactions
    @reactions ||= {
      pour: ->(e) { @drop[e[3]] = 0.22 },
      seal: ->(e) { @seal[e[1]] = 1.1 },
      refuse: ->(e) { @shake[e[1]] = 0.32 if e[1] },
      kept: ->(_e) { @kept = 2.6 },
      stir: ->(_e) { @stir = 2.0 },
      window: ->(_e) { @glint = 1.0 },
      hint: ->(e) { @hint = e[1] ? { move: e[1], t: 3.4 } : nil }
    }
  end

  def draw(session, dt, pointer)
    @time += dt
    tick_timers(dt)
    Paint.fill(0, 0, Layout::W, Layout::H, Palette::WALL)
    draw_room(session)
    draw_racks(session)
    draw_held(session, pointer)
    draw_effects(session)
    draw_motes
    Paint.fill(0, 0, Layout::W, Layout::H, Paint.alpha(Palette::LAMP, 0.10 * @kept_glow)) if @kept_glow.positive?
  end

  private

  def tick_timers(dt)
    @drop.each_key { |k| @drop[k] -= dt }
    @shake.each_key { |k| @shake[k] -= dt }
    @seal.each_key { |k| @seal[k] -= dt }
    @drop.delete_if { |_k, v| v <= 0 }
    @shake.delete_if { |_k, v| v <= 0 }
    @seal.delete_if { |_k, v| v <= 0 }
    @kept -= dt
    @stir -= dt
    @glint -= dt
    @hint = nil if @hint && (@hint[:t] -= dt) <= 0
    @kept_glow = @kept.positive? ? [@kept / 2.6, 1.0].min : 0.0
  end

  def beat(speed = 1.0) = Math.sin(@time * speed)

  def draw_room(session)
    Paint.fill(0, 0, Layout::W, Layout::ROOM_H, Palette::WALL_WARM)
    Paint.fill(0, Layout::ROOM_H, Layout::W, 3, Paint.alpha(Palette::WOOD_DARK, 0.35))
    Paint.fill(0, Layout::H - 9, Layout::W, 9, Palette::WOOD_DARK)
    draw_window
    draw_lamp
    draw_cat
    draw_moth if session.moth?
  end

  def draw_window
    x = 112
    y = 10
    w = 70
    h = 54
    Paint.round(x - 3, y - 3, w + 6, h + 6, 2, Palette::SHELF_EDGE)
    Paint.fill(x, y, w, h, Palette::GLASS)
    Paint.glow(150, 30, 9 + (beat(0.6) * 0.6), Palette::MOON, 0.55)
    Paint.fill(146, y, 2, h, Palette::SHELF_EDGE)
    Paint.fill(x, 34, w, 2, Palette::SHELF_EDGE)
    Paint.fill(x + 2, y + 2, w - 4, 4, Paint.alpha(Palette::MOON, 0.06 + (0.04 * @glint)))
  end

  def draw_lamp
    Paint.fill(30, 0, 2, 22, Palette::SHELF_EDGE)
    Paint.round(15, 22, 32, 8, 3, Palette::LAMP)
    flicker = 0.20 + (0.03 * beat(2.3)) + (0.10 * [@stir, 0].max)
    Paint.glow(31, 30, 30, Palette::LAMP, flicker)
    Paint.fill(31, 0, 1, 22, Paint.alpha(Palette::LAMP, 0.5))
  end

  def draw_cat
    breath = (beat(0.9) * 0.7).round
    dark = "#3b3448"
    Paint.round(14, 70 + breath, 42, 15, 7, dark)
    Paint.round(46, 65 + breath, 17, 15, 6, dark)
    Paint.fill(49, 66 + breath, 3, 4, Palette::WALL_WARM)
    Paint.fill(57, 66 + breath, 3, 4, Palette::WALL_WARM)
    tail = (@stir.positive? ? 4 : 0)
    Paint.round(6, 76 + breath + tail, 14, 4, 2, dark)
  end

  def draw_moth
    mx = 120 + (beat(0.7) * 12).round
    my = 52 + (beat(1.3) * 7).round
    Paint.glow(mx, my, 5, Palette::MOON, 0.25)
    Paint.fill(mx - 1, my - 1, 3, 3, Palette::TEXT)
    Paint.fill(mx - 5, my, 4, 2, Paint.alpha(Palette::MOON, 0.7))
    Paint.fill(mx + 2, my, 4, 2, Paint.alpha(Palette::MOON, 0.7))
  end

  def draw_racks(session)
    total = session.racks.size
    session.racks.each_with_index do |rack, index|
      draw_rack(rack_at(session, rack, index, total))
    end
  end

  # One record per shelf: where it stands, whether it is still unspoiled, and how
  # many of its jars are up in the player's hand (and so must not be drawn here).
  def rack_at(session, rack, index, total)
    { rack: rack, index: index, ribbon: session.clean?,
      rx: Layout.rack_x(index, total) + shake_for(index),
      py: Layout.plank_y(index, total),
      hide: session.held == index ? session.held_count : 0 }
  end

  def shake_for(index) = @shake[index] ? (Math.sin(@shake[index] * 40) * 2).round : 0

  def draw_rack(at)
    rack = at[:rack]
    draw_backing(rack, at)
    shown_jars(rack, at[:hide]).each_with_index do |jar, level|
      y = at[:py] - ((level + 1) * Layout::JAR_H) + drop_for(at[:index])
      draw_jar(Paint, at[:rx] + 3, y, jar)
    end
    draw_plank(at[:rx], at[:py])
    draw_overlays(rack, at)
  end

  # The jars still on the shelf: the top `hide` of them are in the player's hand.
  def shown_jars(rack, hide) = hide.zero? ? rack.jars : rack.jars[0...-hide]

  def draw_backing(rack, at)
    shown = rack.size - at[:hide]
    return if shown <= 0
    height = (shown * Layout::JAR_H) + 4
    Paint.fill(at[:rx] + 2, at[:py] - height, Layout::CELL_W - 4, height, Palette::WOOD_DARK)
  end

  def drop_for(index) = @drop[index] ? -((@drop[index] / 0.22) * 6).round : 0

  def draw_plank(rx, py)
    Paint.fill(rx, py, Layout::CELL_W, Layout::PLANK_H, Palette::SHELF_WOOD)
    Paint.fill(rx, py, Layout::CELL_W, 1, Palette::SHELF_EDGE)
    Paint.fill(rx + 1, py + Layout::PLANK_H, Layout::CELL_W - 2, 2, Paint.alpha(Palette::WOOD_DARK, 0.55))
  end

  def draw_overlays(rack, at)
    draw_cloth(rack, at) if rack.capped?
    draw_seal(rack, at[:rx], at[:py], at[:ribbon]) if rack.sealed?
    draw_seal_ring(at[:index], at[:rx], at[:py]) if @seal[at[:index]]
    draw_hint(at[:index], at[:rx], at[:py]) if @hint && @hint[:move].include?(at[:index])
  end

  def draw_cloth(rack, at)
    shown = rack.size - at[:hide]
    top = at[:py] - (shown * Layout::JAR_H) - 5
    Paint.round(at[:rx] + 1, top, Layout::CELL_W - 2, (shown * Layout::JAR_H) + 5, 4, Palette::WALL_WARM)
    Paint.fill(at[:rx] + 4, top + 3, Layout::CELL_W - 8, 2, Paint.alpha(Palette::MOON, 0.18))
    Paint.round(at[:rx] + (Layout::CELL_W / 2) - 3, top - 2, 6, 5, 2, Palette::SHELF_EDGE)
  end

  def draw_seal(rack, rx, py, ribbon)
    cx = rx + (Layout::CELL_W / 2)
    Paint.glow(cx, py - (rack.capacity * Layout::JAR_H / 2), 20, Palette::SEAL, 0.14 + (0.04 * beat(1.7)))
    Paint.round(cx - 4, py - 10, 8, 7, 3, Palette::SEAL) if ribbon
    Paint.fill(cx - 2, py - 9, 4, 5, Palette::SEAL) unless ribbon
  end

  def draw_seal_ring(index, rx, py)
    t = 1.1 - @seal[index]
    Paint.rect_outline(rx + 1, py - (Layout::JAR_H * 4) - 2, Layout::CELL_W - 2, Layout::JAR_H * 4 + 2,
                       Paint.alpha(Palette::SEAL, 0.5 * (1 - (t / 1.1))), 1 + ((t * 4) / 1.1).round)
  end

  def draw_hint(index, rx, py)
    pulse = 0.35 + (0.25 * beat(3.0))
    Paint.rect_outline(rx, py - (Layout::JAR_H * 4) - 4, Layout::CELL_W, Layout::JAR_H * 4 + 6,
                       Paint.alpha(Palette::HINT, pulse), 2)
  end

  def draw_jar(paint, x, y, jar)
    return if y > Layout::H
    if jar == Rack::PLAIN
      paint.round(x, y, Layout::JAR_W, Layout::JAR_H - 2, 3, Palette::GLASS_LIGHT)
      paint.fill(x + 6, y + 4, 4, 4, Paint.alpha(Palette::TEXT, 0.75))
      return
    end
    paint.round(x, y, Layout::JAR_W, Layout::JAR_H - 2, 3, Palette.fruit(jar, 0))
    paint.fill(x + 3, y + 2, Layout::JAR_W - 6, 2, Paint.alpha(Palette.fruit(jar, 1), 0.75))
    paint.fill(x + 2, y + Layout::JAR_H - 5, Layout::JAR_W - 4, 2, Paint.alpha(Palette.fruit(jar, 2), 0.7))
    paint.fill(x + 4, y - 1, Layout::JAR_W - 8, 3, Palette::SEAL)
  end

  # The jars in the hand: a small stack that follows the finger, or hovers over
  # the shelf it came from when the lift was a tap.
  def draw_held(session, pointer)
    rack = session.held
    return if rack.nil?
    jar = session.held_fruit
    at = held_at(session, pointer)
    Paint.glow(at[:x], at[:y] + 6, 12, Palette.fruit(jar, 1), 0.3)
    session.held_count.times do |level|
      draw_jar(Paint, at[:x] - (Layout::JAR_W / 2), at[:y] - (level * Layout::JAR_H), jar)
    end
  end

  def held_at(session, pointer)
    return { x: pointer[:x], y: pointer[:y] - HELD_LIFT } if pointer[:dragging]
    rack = session.held
    total = session.racks.size
    { x: Layout.rack_x(rack, total) + (Layout::CELL_W / 2),
      y: Layout.plank_y(rack, total) - ((session.racks[rack].size + 1) * Layout::JAR_H) - HELD_LIFT }
  end

  # A warm wash and rising sparks when a shelf is finally kept.
  def draw_effects(_session)
    return unless @kept.positive?
    spark = (@kept % 0.5) / 0.5
    6.times do |i|
      x = 20 + (i * 30)
      y = Layout::H - 30 - ((1 - spark) * 40) - (i * 6)
      Paint.fill(x, y, 2, 2, Paint.alpha(Palette::LAMP, 0.6 * @kept_glow))
    end
  end

  def draw_motes
    @motes.each do |mote|
      mote[1] -= (mote[2] * 4)
      mote[1] = Layout::H + 4 if mote[1] < -4
      next if rand(60) > 2
      Paint.fill(mote[0].round, mote[1].round, 1, 1, Paint.alpha(Palette::TEXT_DIM, 0.35))
    end
  end
end
# --- src/audio.rb
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
# --- src/input.rb
# Thumbs, fingers and cursors. A press lifts at once; a drag carries the jar;
# a flick down walks a move back; a long press asks for a nudge.
class Input
  DRAG_PX = 8
  SWIPE_PX = 62
  SWIPE_S = 0.6
  LONG_PRESS = 0.55

  attr_reader :pointer

  def initialize(canvas, view, session, &on_hint)
    @canvas = canvas
    @view = view
    @session = session
    @on_hint = on_hint
    @pointer = { x: Layout::W / 2, y: Layout::H, dragging: false }
    @gesture = nil
    @press_time = 0.0
    @long_fired = false
    bind
  end

  def tick(dt)
    return unless @gesture
    @press_time += dt
    return if @long_fired || @press_time < LONG_PRESS
    @long_fired = true
    @on_hint&.call(@session.hint_move)
  end

  private

  def bind
    @canvas[:style][:touchAction] = "none".to_js
    @canvas.call(:addEventListener, "pointerdown".to_js, ->(event) { pointer_down(event) })
    @canvas.call(:addEventListener, "pointermove".to_js, ->(event) { move(*point(event)); nil })
    @canvas.call(:addEventListener, "pointerup".to_js, ->(event) { pointer_up(event) })
    @canvas.call(:addEventListener, "pointercancel".to_js, ->(_event) { cancel; nil })
  end

  # Page pixels to pantry pixels: the canvas is drawn at Layout::W across.
  def point(event)
    box = @canvas.call(:getBoundingClientRect)
    scale = Layout::W / box[:width].to_f
    [(event[:clientX].to_f - box[:left].to_f) * scale,
     (event[:clientY].to_f - box[:top].to_f) * scale]
  end

  def pointer_down(event)
    return unless event[:button].to_f.zero?
    event.call(:preventDefault)
    down(*point(event))
    nil
  end

  def pointer_up(event)
    up(*point(event))
    nil
  end

  def down(x, y)
    @gesture = { x: x, y: y }
    @press_time = 0.0
    @long_fired = false
    @pointer[:x] = x
    @pointer[:y] = y
    if Layout.in_window?(x, y)
      @session.window_tap
      @pointer[:dragging] = false
      return
    end
    @session.press(Layout.rack_at(x, y, @session.racks.size))
    @pointer[:dragging] = !@session.held.nil?
  end

  def move(x, y)
    @pointer[:x] = x
    @pointer[:y] = y
    return unless @gesture
    @long_fired = true if (x - @gesture[:x]).abs + (y - @gesture[:y]).abs > DRAG_PX
  end

  def up(x, y)
    gesture = @gesture
    @gesture = nil
    @pointer[:dragging] = false
    return if gesture.nil?
    dy = y - gesture[:y]
    return @session.undo if dy > SWIPE_PX && @press_time < SWIPE_S
    return unless (x - gesture[:x]).abs + dy.abs > DRAG_PX
    target = Layout.rack_at(x, y, @session.racks.size)
    target.nil? || target == @session.held ? @session.cancel : @session.press(target)
  end

  def cancel
    @gesture = nil
    @pointer[:dragging] = false
    @session.cancel
    nil
  end
end
# --- src/hud.rb
# The words around the canvas: shelf name, progress, the hint line and the
# small card that appears when a shelf is kept.
class Hud
  def initialize(doc, session, audio, &on_advance)
    @doc = doc
    @session = session
    @audio = audio
    @on_advance = on_advance
    @el = {}
    %w[title progress hint card card-title card-text card-button sound undo restart shelf].each do |id|
      @el[id] = doc.call(:getElementById, id.to_js)
    end
    @shown = {}
    bind
  end

  def bind
    on(@el["sound"]) { @audio.on? ? @audio.disable : @audio.enable }
    on(@el["undo"]) { @session.undo }
    on(@el["restart"]) { @session.restart }
    on(@el["card-button"]) { @on_advance.call }
  end

  def refresh
    set("progress", "Shelf #{@session.level_index + 1} of #{Levels.count} · " \
                    "#{@session.settled_count} of #{@session.goal} settled")
    set("hint", @session.hint)
    set("sound", @audio.on? ? "Sound: on" : "Sound: off")
    set("shelf", @session.name)
  end

  def show_kept_card
    last = @session.level_index + 1 >= Levels.count
    set("card-title", last ? "The pantry is full" : "Shelf kept")
    set("card-text", last ? "Every jar is home. Stay as long as you like." : line)
    set("card-button", last ? "Open it again" : "Next shelf")
    open
  end

  def hide_card
    @el["card"][:style][:display] = "none".to_js
    @shown["card"] = false
  end

  private

  def line
    moves = @session.moves_taken
    return "Kept in #{moves} moves, with nothing taken back." if @session.clean?
    "Kept in #{moves} moves. The jars forgave the second thoughts."
  end

  def open
    @el["card"].call(:removeAttribute, "hidden".to_js)
    @el["card"][:style][:display] = "block".to_js
    @el["card-title"][:textContent] = @shown["card-title"].to_js
    @el["card-button"].call(:focus)
  end

  def on(el, &block)
    el.call(:addEventListener, "click".to_js, lambda { |_event|
      block.call
      nil
    })
  end

  def set(key, value)
    return if @shown[key] == value
    @shown[key] = value
    @el[key][:textContent] = value.to_js
  end
end
# --- src/main.rb
# Boot: build the pantry, wire the page and keep the frames coming.
module Main
  def self.start
    doc = JS.global[:document]
    canvas = doc.call(:getElementById, "scene".to_js)
    session = Session.new
    view = View.new(canvas)
    audio = Audio.new
    input = Input.new(canvas, view, session) { |move| nudge(view, audio, move) }
    hud = Hud.new(doc, session, audio) { advance(session, hud, audio) }
    listen(doc, view, audio)
    JS.global[:__summerkeep] = "ready".to_js
    frame(session, view, audio, input, hud)
  end

  def self.nudge(view, audio, move)
    return if move.nil?
    view.notify([:hint, move])
    audio.play([:hint])
  end

  def self.advance(session, hud, audio)
    audio.play([:kept_open])
    session.finished? ? session.begin_again : session.next_level
    hud.hide_card
  end

  def self.listen(doc, view, audio)
    JS.global.call(:addEventListener, "resize".to_js, ->(_e) { view.resize; nil })
    doc.call(:addEventListener, "visibilitychange".to_js, lambda { |_event|
      audio.resume unless doc[:hidden].to_s == "true"
      nil
    })
  end

  # One frame: events out, sound and pictures in, words refreshed. A frame that
  # trips over itself records the reason and the next one still arrives.
  def self.frame(session, view, audio, input, hud)
    @last = 0.0
    @progress = -1.0
    step = nil
    step = lambda do |stamp|
      begin
        tick(session, view, audio, input, hud, stamp.to_f / 1000.0)
      rescue StandardError => error
        JS.global[:__frameError] = error.message.to_js
      end
      JS.global.call(:requestAnimationFrame, step)
    end
    JS.global.call(:requestAnimationFrame, step)
  end

  def self.tick(session, view, audio, input, hud, now)
    dt = step_time(now)
    input.tick(dt)
    audio.unlock_if_wanted
    session.tick(dt)
    session.drain_events.each do |event|
      view.notify(event)
      audio.play(event)
      hud.show_kept_card if event[0] == :kept
    end
    quiet(audio, session)
    view.draw(session, dt, input.pointer)
    hud.refresh
  end

  def self.step_time(now)
    dt = @last.zero? ? 0.016 : [(now - @last), 0.05].min
    @last = now
    dt
  end

  def self.quiet(audio, session)
    level = session.settled_count.to_f / [session.goal, 1].max
    return if (level - @progress).abs < 0.001
    @progress = level
    audio.set_progress(level)
  end

end
