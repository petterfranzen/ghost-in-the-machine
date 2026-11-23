namespace MoonmirrorMarsh.Game;

/// <summary>The four beam directions, clockwise from east.</summary>
public enum Dir
{
    Right = 0,
    Down = 1,
    Left = 2,
    Up = 3,
}

/// <summary>Lives next to <see cref="Dir"/>: turning, stepping and the letters used in level maps.</summary>
public static class Directions
{
    public static (int Dx, int Dy) Step(Dir dir) => dir switch
    {
        Dir.Right => (1, 0),
        Dir.Down => (0, 1),
        Dir.Left => (-1, 0),
        _ => (0, -1),
    };

    /// <summary>A map letter: emitters use &gt; v &lt; ^, runes use r d l u.</summary>
    public static Dir FromLetter(char letter) => letter switch
    {
        '>' or 'r' => Dir.Right,
        'v' or 'd' => Dir.Down,
        '<' or 'l' => Dir.Left,
        '^' or 'u' => Dir.Up,
        _ => throw new ArgumentException($"'{letter}' is not a direction letter."),
    };

    public static string Name(Dir dir) => dir.ToString().ToLowerInvariant();
}
