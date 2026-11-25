# The room, the shelves and the small animations. No text here: words live in
# the page around the canvas, where they stay crisp on every screen.
class View
  TAU = 6.2832

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
    draw_racks(session, pointer)
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

  def draw_racks(session, pointer)
    count = session.racks.size
    session.racks.each_with_index do |rack, index|
      next if session.held == index && pointer[:dragging]
      draw_rack(rack, index, count, session.clean?)
    end
  end

  def draw_rack(rack, index, count, ribbon)
    rx = Layout.rack_x(index, count)
    py = Layout.plank_y(index, count)
    shake = @shake[index] ? (Math.sin(@shake[index] * 40) * 2).round : 0
    rx += shake
    unless rack.empty?
      Paint.fill(rx + 2, py - (rack.capacity * Layout::JAR_H) - 4, Layout::CELL_W - 4,
                 rack.capacity * Layout::JAR_H + 4, Palette::WOOD_DARK)
    end
    rack.jars.each_with_index do |jar, level|
      draw_jar(Paint, rx + 3, py - ((level + 1) * Layout::JAR_H) + drop_for(index), jar)
    end
    draw_plank(rx, py)
    draw_overlays(rack, index, { rx: rx, py: py, ribbon: ribbon })
  end

  def drop_for(index) = @drop[index] ? -((@drop[index] / 0.22) * 6).round : 0

  def draw_plank(rx, py)
    Paint.fill(rx, py, Layout::CELL_W, Layout::PLANK_H, Palette::SHELF_WOOD)
    Paint.fill(rx, py, Layout::CELL_W, 1, Palette::SHELF_EDGE)
    Paint.fill(rx + 1, py + Layout::PLANK_H, Layout::CELL_W - 2, 2, Paint.alpha(Palette::WOOD_DARK, 0.55))
  end

  def draw_overlays(rack, index, at)
    draw_cloth(rack, at[:rx], at[:py]) if rack.capped?
    draw_seal(rack, at[:rx], at[:py], at[:ribbon]) if rack.sealed?
    draw_seal_ring(index, at[:rx], at[:py]) if @seal[index]
    draw_hint(index, at[:rx], at[:py]) if @hint && @hint[:move].include?(index)
  end

  def draw_cloth(rack, rx, py)
    top = py - (rack.size * Layout::JAR_H) - 5
    Paint.round(rx + 1, top, Layout::CELL_W - 2, rack.size * Layout::JAR_H + 5, 4, Palette::WALL_WARM)
    Paint.fill(rx + 4, top + 3, Layout::CELL_W - 8, 2, Paint.alpha(Palette::MOON, 0.18))
    Paint.round(rx + (Layout::CELL_W / 2) - 3, top - 2, 6, 5, 2, Palette::SHELF_EDGE)
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

  def draw_held(session, pointer)
    rack = session.held
    return if rack.nil?
    jar = session.held_fruit
    count = session.held_count
    rx = Layout.rack_x(rack, session.racks.size)
    py = Layout.plank_y(rack, session.racks.size)
    px = pointer[:dragging] ? pointer[:x] : rx + (Layout::CELL_W / 2)
    pyy = (pointer[:dragging] ? pointer[:y] : py - ((session.racks[rack].size + 1) * Layout::JAR_H)) - 22
    Paint.glow(px, pyy + 6, 12, Palette.fruit(jar, 1), 0.3)
    draw_jar(Paint, px - (Layout::JAR_W / 2), pyy, jar)
    return if count < 2 || pointer[:dragging]
    Paint.fill(px - 2, pyy - 6, 4, 5, Paint.alpha(Palette::TEXT, 0.8))
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
