//go:build js && wasm

// Command wasm is Songbranch's only piece of browser glue: it owns a World,
// and offers the page a small set of functions — boot, tap, hold, swipe, step,
// copy the frame, read the answer, set how much motion is allowed, ask where
// the birds and the secrets are. The simulation and every pixel are Go's; the
// canvas only blits.
package main

import (
	"syscall/js"

	"songbranch/world"
)

var tree *world.World

func main() {
	js.Global().Set("songbranchBoot", js.FuncOf(func(this js.Value, a []js.Value) any {
		motion := 1.0
		vw, vh := world.W, world.H
		if len(a) > 0 {
			motion = a[0].Float()
		}
		if len(a) > 2 {
			vw, vh = a[1].Int(), a[2].Int()
		}
		tree = world.NewView(vw, vh)
		tree.SetMotion(motion)
		return nil
	}))
	js.Global().Set("songbranchTap", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return nil
		}
		tree.Tap(a[0].Float(), a[1].Float())
		return nil
	}))
	js.Global().Set("songbranchHold", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.Hold(a[0].Float(), a[1].Float(), a[2].Float())
	}))
	js.Global().Set("songbranchSwipe", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.Swipe(a[0].Float(), a[1].Float(), a[2].Float(), a[3].Float())
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
	js.Global().Set("songbranchBirds", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.BirdCount()
	}))
	js.Global().Set("songbranchChicks", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.ChickCount()
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
	js.Global().Set("songbranchViewW", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.ViewW()
	}))
	js.Global().Set("songbranchViewH", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.ViewH()
	}))
	js.Global().Set("songbranchMoonX", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0.0
		}
		x, _ := tree.MoonAt()
		return x
	}))
	js.Global().Set("songbranchMoonY", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0.0
		}
		_, y := tree.MoonAt()
		return y
	}))
	js.Global().Set("songbranchNestX", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0.0
		}
		x, _ := tree.NestAt()
		return x
	}))
	js.Global().Set("songbranchNestY", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0.0
		}
		_, y := tree.NestAt()
		return y
	}))
	js.Global().Set("songbranchMessage", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return ""
		}
		m, _ := tree.Message()
		return m
	}))
	js.Global().Set("songbranchHint", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return ""
		}
		return tree.Hints()
	}))
	js.Global().Set("songbranchDiscoveries", js.FuncOf(func(this js.Value, a []js.Value) any {
		if tree == nil {
			return 0
		}
		return tree.Discoveries()
	}))
	js.Global().Set("songbranchReady", js.ValueOf(true))
	select {}
}
