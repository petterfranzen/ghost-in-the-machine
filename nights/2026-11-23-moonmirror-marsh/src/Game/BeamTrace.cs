namespace MoonmirrorMarsh.Game;

public sealed record BeamPoint(int X, int Y);

/// <summary>One beam's walk across the marsh, from the emitter to where it stopped.</summary>
public sealed record BeamPath(BeamPoint[] Points, string End);

public sealed record BeamResult(BeamPath[] Paths, bool[] Lit)
{
    public int LitCount => Lit.Count(lit => lit);
}

/// <summary>What one step of a beam found, and where the light goes next.</summary>
public readonly record struct BeamStep(bool Stop, BeamPoint At, Dir Dir, string End, bool Split, Dir SplitDir);

/// <summary>The shared state of one tracing run: the marsh, its turns, and what has been lit.</summary>
public sealed record BeamContext(Level Level, int[] Turns, HashSet<(int X, int Y, Dir Travel)> Walked, bool[] Lit);

/// <summary>Moves light across the marsh: mirrors turn it, prisms split it, reeds and runes stop it.</summary>
public static class BeamTracer
{
    /// <summary>A "/" mirror turns by reflection across the other diagonal; a "\" mirror the other way.</summary>
    public static Dir Reflect(int turn, Dir travel) =>
        turn == 0 ? (Dir)(3 - (int)travel) : (Dir)((int)travel ^ 1);

    public static BeamResult Trace(Level level, int[] turns)
    {
        var ctx = new BeamContext(level, turns, new HashSet<(int X, int Y, Dir Travel)>(), new bool[level.Cells.Length]);
        var paths = new List<BeamPath>();
        for (int i = 0; i < level.Cells.Length; i++)
        {
            if (level.Cells[i].Kind != TileKind.Emitter) continue;
            var from = new BeamPoint(i % level.Width, i / level.Width);
            paths.AddRange(Walk(ctx, from, level.Cells[i].Facing));
        }
        return new BeamResult(paths.ToArray(), ctx.Lit);
    }

    private static List<BeamPath> Walk(BeamContext ctx, BeamPoint from, Dir heading)
    {
        var paths = new List<BeamPath>();
        var pending = new Queue<(BeamPoint At, Dir Heading)>();
        pending.Enqueue((from, heading));
        while (pending.Count > 0)
        {
            var (at, dir) = pending.Dequeue();
            var points = new List<BeamPoint> { at };
            var end = Travel(ctx, points, pending, at, dir);
            paths.Add(new BeamPath(points.ToArray(), end));
        }
        return paths;
    }

    /// <summary>Steps one beam until it stops, queueing a second beam when a prism splits it.</summary>
    private static string Travel(BeamContext ctx, List<BeamPoint> points,
        Queue<(BeamPoint At, Dir Heading)> pending, BeamPoint at, Dir dir)
    {
        var here = at;
        while (true)
        {
            var step = Advance(ctx, here, dir, points);
            here = step.At;
            if (step.Split) pending.Enqueue((here, step.SplitDir));
            if (step.Stop) return step.End;
            dir = step.Dir;
        }
    }

    private static BeamStep Advance(BeamContext ctx, BeamPoint at, Dir dir, List<BeamPoint> points)
    {
        var (dx, dy) = Directions.Step(dir);
        var here = new BeamPoint(at.X + dx, at.Y + dy);
        if (!ctx.Level.InBounds(here.X, here.Y)) return new BeamStep(true, here, dir, "sky", false, dir);
        if (!ctx.Walked.Add((here.X, here.Y, dir))) return new BeamStep(true, here, dir, "loop", false, dir);
        points.Add(here);
        return React(ctx, here, dir);
    }

    private static BeamStep React(BeamContext ctx, BeamPoint here, Dir dir)
    {
        var cell = ctx.Level.At(here.X, here.Y);
        return cell.Kind switch
        {
            TileKind.Water or TileKind.Emitter => new BeamStep(false, here, dir, "", false, dir),
            TileKind.Reed => new BeamStep(true, here, dir, "reed", false, dir),
            TileKind.Lantern => Lit(ctx, here, dir),
            TileKind.Rune => cell.Facing == dir
                ? new BeamStep(false, here, dir, "", false, dir)
                : new BeamStep(true, here, dir, "rune", false, dir),
            TileKind.Mirror => new BeamStep(false, here, Reflect(ctx.Turns[ctx.Level.CellIndex(here.X, here.Y)], dir), "", false, dir),
            _ => new BeamStep(false, here, dir, "", true, Reflect(ctx.Turns[ctx.Level.CellIndex(here.X, here.Y)], dir)),
        };
    }

    private static BeamStep Lit(BeamContext ctx, BeamPoint here, Dir dir)
    {
        ctx.Lit[ctx.Level.CellIndex(here.X, here.Y)] = true;
        return new BeamStep(true, here, dir, "lantern", false, dir);
    }
}
