namespace MoonmirrorMarsh.Game;

/// <summary>One stone or lantern, as the renderer needs it.</summary>
public sealed record TileView(int X, int Y, string Kind, int Turn, string Facing);

/// <summary>A beam, as a flat list of x,y pairs, and where it stopped.</summary>
public sealed record BeamView(int[] Path, string End)
{
    public static BeamView[] Of(BeamResult beam) => beam.Paths
        .Select(path => new BeamView(
            path.Points.SelectMany(point => new[] { point.X, point.Y }).ToArray(), path.End))
        .ToArray();
}

/// <summary>Everything the page needs to draw and describe the current state.</summary>
public sealed record Scene(
    int Level,
    int LevelCount,
    string Name,
    string Hint,
    int Bed,
    int Width,
    int Height,
    TileView[] Tiles,
    BeamView[] Beams,
    int[] Lit,
    int LitCount,
    int Lanterns,
    bool Solved,
    bool Finished);
