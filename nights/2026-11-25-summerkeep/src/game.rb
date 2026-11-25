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
