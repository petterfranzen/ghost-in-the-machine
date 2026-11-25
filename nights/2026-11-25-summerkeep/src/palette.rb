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
