using Microsoft.JSInterop;
using MoonmirrorMarsh.Game;

namespace MoonmirrorMarsh;

/// <summary>The doorway between the marsh in C# and the page that draws it.</summary>
public sealed class MarshBridge
{
    private readonly MarshGame game;
    private readonly IJSRuntime js;
    private bool celebrating;

    public MarshBridge(MarshGame game, IJSRuntime js)
    {
        this.game = game;
        this.js = js;
    }

    /// <summary>Turns a stone under the thumb and repaints; the light moves at once.</summary>
    [JSInvokable]
    public async Task Turn(int x, int y)
    {
        if (celebrating) return;
        var sfx = game.TurnAt(x, y);
        if (sfx is null) return;
        await Play(sfx);
        await Publish();
        if (game.Solved) await Celebrate();
    }

    [JSInvokable]
    public async Task Undo()
    {
        if (celebrating || !game.Undo()) return;
        await Play("undo");
        await Publish();
    }

    [JSInvokable]
    public async Task Restart()
    {
        if (celebrating) return;
        game.Restart();
        await Play("restart");
        await Publish();
    }

    [JSInvokable]
    public async Task Rewind()
    {
        if (celebrating) return;
        game.Rewind();
        await Play("restart");
        await Publish();
    }

    [JSInvokable]
    public Task<string> SelfTest() => Task.FromResult(SelfTests.Run());

    public Task Publish() => js.InvokeVoidAsync("Marsh.render", game.Build()).AsTask();

    private async Task Celebrate()
    {
        celebrating = true;
        await Play("solve");
        await js.InvokeVoidAsync("Marsh.celebrate");
        await Task.Delay(3200);
        game.Advance();
        await Publish();
        celebrating = false;
    }

    private Task Play(string name) => js.InvokeVoidAsync("Marsh.sfx", name).AsTask();
}
