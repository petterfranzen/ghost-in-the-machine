# A pantry walker: it plays a level out to prove the shelf can be kept.
# Two strategies share the same rules: a memoised depth-first search for tidy
# levels, then randomised greedy attempts for the crowded ones. Build-time only.
module Solver
  DFS_BUDGET = 24_000
  ATTEMPTS = 400
  RUN = 240

  def self.solve(level, budget: DFS_BUDGET)
    start = Rules.snapshot(level.racks)
    return [] if Rules.settled?(start)
    srand(20_261_125)
    @budget = budget
    path = walk(start, [], {})
    path || greedy(start)
  end

  def self.walk(racks, path, seen)
    return nil if @budget <= 0
    @budget -= 1
    key = Rules.state_key(racks)
    return nil if seen[key]
    seen[key] = true
    ordered(racks).each do |from, to|
      nxt = Rules.snapshot(racks)
      Rules.pour(nxt, from, to)
      step = path + [[from, to]]
      return step if Rules.settled?(nxt)
      found = walk(nxt, step, seen)
      return found if found
    end
    nil
  end

  # Randomised greedy: always prefer a move that fills or empties a shelf.
  def self.greedy(racks)
    ATTEMPTS.times do
      path = play(Rules.snapshot(racks))
      return path if path
    end
    nil
  end

  def self.play(racks)
    path = []
    seen = {}
    RUN.times do
      moves = Rules.moves(racks)
      return nil if moves.empty?
      from, to = moves.max_by { |m| (score(racks, m[0], m[1]) * 4) + rand(6) }
      Rules.pour(racks, from, to)
      path << [from, to]
      return path if Rules.settled?(racks)
      key = Rules.state_key(racks)
      return nil if seen[key]
      seen[key] = true
    end
    nil
  end

  def self.ordered(racks)
    Rules.moves(racks).sort_by { |from, to| -score(racks, from, to) }
  end

  # Cheap move ordering: reward moves that fill a shelf or empty one.
  def self.score(racks, from, to)
    src = racks[from]
    dst = racks[to]
    moved = [src.run, dst.open_slots].min
    score = moved > 1 ? 2 : 0
    score += 4 if !dst.empty? && dst.size + moved == dst.capacity
    score += 2 if src.size == moved
    score += 1 if dst.empty?
    score
  end
end
