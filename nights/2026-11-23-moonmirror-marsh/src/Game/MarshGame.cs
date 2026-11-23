namespace MoonmirrorMarsh.Game;

/// <summary>The player's run of the marsh: which level they are on, the stones' turns, and the undo trail.</summary>
public sealed class MarshGame
{
    private readonly IReadOnlyList<Level> levels;
    private readonly Stack<int> trail = new();
    private int[] turns;
    private int levelIndex;
    private bool finished;

    public MarshGame(IReadOnlyList<Level> levels)
    {
        if (levels.Count == 0) throw new ArgumentException("A run needs at least one level.");
        this.levels = levels;
        turns = [];
        Load(0);
    }

    public Level Level => levels[levelIndex];

    public bool Finished => finished;

    public bool Solved => BeamTracer.Trace(Level, turns).LitCount == Level.Lanterns;

    /// <summary>Turns the stone under the thumb, if there is one; answers with the sound to play.</summary>
    public string? TurnAt(int x, int y)
    {
        if (!Level.InBounds(x, y) || !Level.At(x, y).Rotatable) return null;
        int cell = Level.CellIndex(x, y);
        turns[cell] ^= 1;
        trail.Push(cell);
        return Level.At(x, y).Kind == TileKind.Prism ? "prism" : "turn";
    }

    public bool Undo()
    {
        if (trail.Count == 0) return false;
        turns[trail.Pop()] ^= 1;
        return true;
    }

    public void Restart() => Load(levelIndex);

    public void Rewind() => Load(0);

    /// <summary>Moves on when a level is solved; the last level leaves the gate open instead.</summary>
    public void Advance()
    {
        if (levelIndex + 1 < levels.Count) Load(levelIndex + 1);
        else finished = true;
    }

    public Scene Build()
    {
        var beam = BeamTracer.Trace(Level, turns);
        return new Scene(
            levelIndex + 1, levels.Count, Level.Name, Level.Hint, levelIndex,
            Level.Width, Level.Height,
            Views(), BeamView.Of(beam), LitCells(beam),
            beam.LitCount, Level.Lanterns, Solved, finished);
    }

    private void Load(int index)
    {
        levelIndex = index;
        finished = false;
        turns = (int[])levels[index].StartingTurns.Clone();
        trail.Clear();
    }

    private TileView[] Views()
    {
        var views = new List<TileView>();
        for (int cell = 0; cell < Level.Cells.Length; cell++)
        {
            var kind = Level.Cells[cell].Kind;
            if (kind == TileKind.Water) continue;
            views.Add(new TileView(
                cell % Level.Width, cell / Level.Width, kind.ToString().ToLowerInvariant(),
                turns[cell], Directions.Name(Level.Cells[cell].Facing)));
        }
        return views.ToArray();
    }

    private int[] LitCells(BeamResult beam)
    {
        var lit = new List<int>();
        for (int cell = 0; cell < beam.Lit.Length; cell++)
        {
            if (!beam.Lit[cell]) continue;
            lit.Add(cell % Level.Width);
            lit.Add(cell / Level.Width);
        }
        return lit.ToArray();
    }
}
