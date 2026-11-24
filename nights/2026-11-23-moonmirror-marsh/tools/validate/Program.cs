using MoonmirrorMarsh.Game;

// Smoke check: every level must be solvable by some arrangement of the stones,
// and no level may start already solved.
Console.WriteLine(SelfTests.Run());
return SelfTests.Passed ? 0 : 1;
