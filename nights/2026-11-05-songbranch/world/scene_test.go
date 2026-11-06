package world

import (
	"math"
	"testing"
)

func TestDeterministicFirstFrame(t *testing.T) {
	a, b := New(), New()
	fa, fb := a.Frame(), b.Frame()
	a.Render(fa)
	b.Render(fb)
	for i := range fa {
		if fa[i] != fb[i] {
			t.Fatalf("first frame differs at byte %d: %d vs %d", i, fa[i], fb[i])
		}
	}
}

func TestTapOnBirdSingsAndHops(t *testing.T) {
	w := New()
	x, y := w.BirdAt(0)
	if e := w.Tap(x, y); e != EventNote {
		t.Fatalf("tap on bird gave event %d, want %d", e, EventNote)
	}
	if w.Notes() != 1 {
		t.Fatalf("notes = %d, want 1", w.Notes())
	}
	if hz := w.NoteHz(); hz < 200 || hz > 900 {
		t.Fatalf("note %v outside A3..A5", hz)
	}
	if w.Flying() != 1 {
		t.Fatalf("flying = %d, want 1", w.Flying())
	}
	w.Clear()
	if w.Event() != EventNone || w.NoteHz() != 0 {
		t.Fatal("Clear did not forget the event")
	}
}

func TestTapOnTrunkMovesWholeTree(t *testing.T) {
	w := New()
	if e := w.Tap(88, 250); e != EventKnock {
		t.Fatalf("tap on trunk gave event %d, want %d", e, EventKnock)
	}
	peak := 0.0
	for i := 0; i < 120; i++ {
		w.Step(1.0 / 60)
		peak = math.Max(peak, w.Sway())
	}
	if peak < 0.6 {
		t.Fatalf("tree swayed only %.2f px after a knock", peak)
	}
	for i := 0; i < 600; i++ {
		w.Step(1.0 / 60)
	}
	if s := w.Sway(); s > 0.35 {
		t.Fatalf("tree did not settle: %.2f px after 10 s", s)
	}
}

func TestReducedMotionMovesLess(t *testing.T) {
	peak := func(motion float64) float64 {
		w := New()
		w.SetMotion(motion)
		w.Tap(88, 250)
		p := 0.0
		for i := 0; i < 120; i++ {
			w.Step(1.0 / 60)
			p = math.Max(p, w.Sway())
		}
		return p
	}
	full, reduced := peak(1), peak(0.35)
	if reduced >= full*0.7 {
		t.Fatalf("reduced motion sway %.2f not clearly below full %.2f", reduced, full)
	}
}

func TestHugeStepIsClamped(t *testing.T) {
	w := New()
	w.Tap(88, 250)
	w.Step(9.0)
	if s := w.Sway(); s > 30 {
		t.Fatalf("one 9 s step threw the tree: %.1f px", s)
	}
}

func TestSkyAndGrassAreGentle(t *testing.T) {
	w := New()
	if e := w.Tap(20, 40); e != EventWind {
		t.Fatalf("tap in the sky gave event %d, want %d", e, EventWind)
	}
	w.Step(1.0 / 60)
	if w.Notes() != 0 {
		t.Fatal("a tap in the sky should not sing")
	}
	w2 := New()
	if e := w2.Tap(20, 300); e != EventGrass {
		t.Fatalf("tap on grass gave event %d, want %d", e, EventGrass)
	}
}
