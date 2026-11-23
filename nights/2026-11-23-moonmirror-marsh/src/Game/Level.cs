namespace MoonmirrorMarsh.Game;

/// <summary>A frozen level: its map, its hint, and the orientations the player starts with.</summary>
public sealed class Level
{
    public Level(int index, string name, string hint, string[] rows)
    {
        Index = index;
        Name = name;
        Hint = hint;
        Height = rows.Length;
        Width = Height > 0 ? rows[0].Length : 0;
        Cells = rows.SelectMany(row => row.Select(Cell.Parse)).ToArray();
        if (Cells.Length != Width * Height)
            throw new ArgumentException($"Level {index} \"{name}\": every row must be {Width} cells wide.");
        Lanterns = Cells.Where(cell => cell.Kind == TileKind.Lantern).Count();
        StartingTurns = Cells.Select(cell => cell.Turn).ToArray();
    }

    public int Index { get; }
    public string Name { get; }
    public string Hint { get; }
    public int Width { get; }
    public int Height { get; }
    public Cell[] Cells { get; }
    public int Lanterns { get; }
    public int[] StartingTurns { get; }

    /// <summary>Cell positions of the stones the player may turn, for the solver.</summary>
    public int[] RotatableCells => Enumerable.Range(0, Cells.Length).Where(i => Cells[i].Rotatable).ToArray();

    public int CellIndex(int x, int y) => y * Width + x;

    public bool InBounds(int x, int y) => x >= 0 && y >= 0 && x < Width && y < Height;

    public Cell At(int x, int y) => Cells[CellIndex(x, y)];
}
