namespace MoonmirrorMarsh.Game;

/// <summary>
/// The five levels, as data. Letters: "." water, "#" reed, "/" mirror, "\\" mirror,
/// "P"/"Q" prism, "o" lantern, "&gt; v &lt; ^" emitters, "r d l u" runes that pass light that way only.
/// </summary>
public static class Levels
{
    public static Level[] All { get; } =
    [
        new Level(1, "First Light", "Tap a mirror to turn the light.",
        [
            "...........",
            "...........",
            ".....o.....",
            "...........",
            "..>..\\.....",
            "...........",
            "...........",
        ]),
        new Level(2, "Two Turns", "One beam, two turns.",
        [
            "...........",
            "...........",
            "..o../.....",
            "...........",
            "..>..\\.....",
            "...........",
            "...........",
        ]),
        new Level(3, "Reeds Drink the Light", "Reeds drink the light.",
        [
            "...........",
            ".........o.",
            "...........",
            ".....#.....",
            "..>../.....",
            "...../...\\.",
            "...........",
        ]),
        new Level(4, "The Rune Gate", "A rune passes the light one way only.",
        [
            "...........",
            "...../..../",
            ".....d.....",
            "..>.......\\",
            ".....o.....",
            "...........",
            "...........",
        ]),
        new Level(5, "A Prism Splits the Beam", "A prism lets a copy of the beam through and bends it.",
        [
            "...........",
            ".....\\..o..",
            "...........",
            "..>..Q...o.",
            "...........",
            "...........",
            "...........",
        ]),
    ];
}
