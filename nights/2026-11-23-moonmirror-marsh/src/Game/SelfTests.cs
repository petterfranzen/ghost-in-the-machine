namespace MoonmirrorMarsh.Game;

/// <summary>Brute-forces the levels: every one must be solvable and must not start already solved.</summary>
public static class SelfTests
{
    public static bool Passed { get; private set; }

    public static string Run()
    {
        var lines = new List<string>();
        bool passed = true;
        foreach (var level in Levels.All)
        {
            var (solutions, first) = Solve(level);
            bool startsSolved = IsSolved(level, level.StartingTurns);
            bool ok = solutions > 0 && !startsSolved;
            passed = passed && ok;
            lines.Add($"level {level.Index} {level.Name}: lanterns={level.Lanterns} stones={level.RotatableCells.Length} " +
                      $"solutions={solutions} startsSolved={startsSolved} {(ok ? "ok" : "FAIL")}");
            if (first is not null) lines.Add($"    a solution: {Describe(level, first)}");
        }
        Passed = passed;
        lines.Insert(0, passed ? "selftest: PASS" : "selftest: FAIL");
        return string.Join('\n', lines);
    }

    private static bool IsSolved(Level level, int[] turns) =>
        BeamTracer.Trace(level, turns).LitCount == level.Lanterns;

    private static (int Count, int[]? First) Solve(Level level)
    {
        var stones = level.RotatableCells;
        var turns = (int[])level.StartingTurns.Clone();
        int count = 0;
        int[]? first = null;
        for (int mask = 0; mask < 1 << stones.Length; mask++)
        {
            for (int bit = 0; bit < stones.Length; bit++)
                turns[stones[bit]] = (level.Cells[stones[bit]].Turn + ((mask >> bit) & 1)) % 2;
            if (!IsSolved(level, turns)) continue;
            count++;
            first ??= (int[])turns.Clone();
        }
        return (count, first);
    }

    private static string Describe(Level level, int[] turns) => string.Join(", ",
        level.RotatableCells
            .Where(cell => turns[cell] != level.StartingTurns[cell])
            .Select(cell => $"({cell % level.Width},{cell / level.Width}) -> {(turns[cell] == 0 ? "/" : "\\")}"));
}
