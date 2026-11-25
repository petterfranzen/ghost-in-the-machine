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
