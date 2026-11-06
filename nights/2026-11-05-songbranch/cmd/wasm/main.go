//go:build js && wasm

// Command wasm is Songbranch's only piece of browser glue: it owns a World,
// and offers the page seven small functions — boot, tap, step, copy the frame,
// read the answer, set how much motion is allowed, and ask where the birds
// are. The simulation and every pixel are Go's; the canvas only blits.
package main

import (
	"syscall/js"

	"songbranch/world"
)

var tree *world.World

func main() {
	js.Global().Set("songbranchBoot", js.FuncOf(func(this js.Value, a []js.Value) any {
		tree = world.New()
		if len(a) > 0 {
			tree.SetMotion(a[0].Float())
		}
		return nil
	}))
	js.Global().Set("songbranchTap", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return nil
		}
		tree.Tap(a[0].Float(), a[1].Float())
		return nil
	}))
	js.Global().Set("songbranchStep", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return nil
		}
		tree.Step(a[0].Float())
		return nil
	}))
	js.Global().Set("songbranchFrame", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return nil
		}
		tree.Render(tree.Frame())
		js.CopyBytesToJS(a[0], tree.Frame())
		return nil
	}))
	js.Global().Set("songbranchEvent", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.Event()
	}))
	js.Global().Set("songbranchNoteHz", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0.0
		}
		return tree.NoteHz()
	}))
	js.Global().Set("songbranchClear", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree != nil {
			tree.Clear()
		}
		return nil
	}))
	js.Global().Set("songbranchMotion", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0.0
		}
		if len(a) > 0 {
			tree.SetMotion(a[0].Float())
		}
		return tree.Motion()
	}))
	js.Global().Set("songbranchSway", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0.0
		}
		return tree.Sway()
	}))
	js.Global().Set("songbranchNotes", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.Notes()
	}))
	js.Global().Set("songbranchFlying", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.Flying()
	}))
	js.Global().Set("songbranchBirds", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.BirdCount()
	}))
	js.Global().Set("songbranchBirdX", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0.0
		}
		x, _ := tree.BirdAt(a[0].Int())
		return x
	}))
	js.Global().Set("songbranchBirdY", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0.0
		}
		_, y := tree.BirdAt(a[0].Int())
		return y
	}))
	js.Global().Set("songbranchReady", js.ValueOf(true))
	select {}
}
