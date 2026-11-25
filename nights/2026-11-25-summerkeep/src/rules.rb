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
