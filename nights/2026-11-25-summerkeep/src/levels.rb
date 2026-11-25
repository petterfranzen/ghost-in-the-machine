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
