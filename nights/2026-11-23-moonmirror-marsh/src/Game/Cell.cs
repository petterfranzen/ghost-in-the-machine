namespace MoonmirrorMarsh.Game;

/// <summary>One cell: its kind, the stone's turn (0 or 1) and the direction it faces.</summary>
public sealed record Cell(TileKind Kind, int Turn = 0, Dir Facing = Dir.Right)
{
    public bool Rotatable => Kind is TileKind.Mirror or TileKind.Prism;

    /// <summary>Map letters: "." water, "#" reed, "/" and "\\" mirrors, "P" prism, "Q" prism turned, "o" lantern.</summary>
    public static Cell Parse(char letter) => letter switch
    {
        '#' => new Cell(TileKind.Reed),
        '/' => new Cell(TileKind.Mirror, 0),
        '\\' => new Cell(TileKind.Mirror, 1),
        'P' => new Cell(TileKind.Prism, 0),
        'Q' => new Cell(TileKind.Prism, 1),
        'o' => new Cell(TileKind.Lantern),
        '>' or '<' or '^' or 'v' => new Cell(TileKind.Emitter, 0, Directions.FromLetter(letter)),
        'r' or 'l' or 'u' or 'd' => new Cell(TileKind.Rune, 0, Directions.FromLetter(letter)),
        _ => new Cell(TileKind.Water),
    };
}
