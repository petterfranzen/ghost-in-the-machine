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
