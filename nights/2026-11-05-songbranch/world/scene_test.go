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

// A tap must nudge, never kill: the bird stays on its branch, hops in place,
// sings, and settles back. Nothing leaves the tree.
func TestTapOnBirdNudges(t *testing.T) {
	w := New()
	x, y := w.BirdAt(0)
	br, tt := w.birds[0].br, w.birds[0].t
	if e := w.Tap(x, y); e != EventNote {
		t.Fatalf("tap on bird gave event %d, want %d", e, EventNote)
	}
	if w.Notes() != 1 {
		t.Fatalf("notes = %d, want 1", w.Notes())
	}
	if hz := w.NoteHz(); hz < 200 || hz > 900 {
		t.Fatalf("note %v outside A3..A5", hz)
	}
	peak := 0.0
	for i := 0; i < 12; i++ {
		w.Step(1.0 / 60)
		peak = math.Max(peak, w.NudgePeak())
	}
	if peak < 2 {
		t.Fatalf("the bird barely moved: %.2f px", peak)
	}
	if w.birds[0].br != br || w.birds[0].t != tt {
		t.Fatal("the bird left its branch; a nudge must not move it")
	}
	if w.BirdCount() != 6 {
		t.Fatalf("birds = %d, want 6", w.BirdCount())
	}
	for i := 0; i < 300; i++ {
		w.Step(1.0 / 60)
	}
	if peak := w.NudgePeak(); peak > 0.4 {
		t.Fatalf("the bird never settled: %.2f px after 5 s", peak)
	}
	w.Clear()
	if w.Event() != EventNone || w.NoteHz() != 0 {
		t.Fatal("Clear did not forget the event")
	}
}

// Two birds on the same tree trade a slow answer: the neighbour sings a beat
// after the first, and the piece still comes to rest.
func TestPairAnswers(t *testing.T) {
	w := New()
	x, y := w.BirdAt(0)
	w.Tap(x, y)
	if w.pair < 0 {
		t.Fatal("no neighbour was chosen to answer")
	}
	n := w.Notes()
	found := false
	for i := 0; i < 120; i++ {
		w.Step(1.0 / 60)
		if w.Notes() > n {
			found = true
		}
	}
	if !found {
		t.Fatal("the pair never answered")
	}
}

func TestChicksPeep(t *testing.T) {
	w := New()
	if w.ChickCount() != 2 {
		t.Fatalf("chicks = %d, want 2", w.ChickCount())
	}
	idx := -1
	for i := range w.birds {
		if w.birds[i].chick {
			idx = i
			break
		}
	}
	x, y := w.BirdAt(idx)
	if e := w.Tap(x, y); e != EventNote {
		t.Fatalf("tap on a chick gave event %d, want %d", e, EventNote)
	}
	if hz := w.NoteHz(); hz < 300 {
		t.Fatalf("a chick's peep at %v Hz is too low", hz)
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

// The frame can be any size a phone asks for, and the art keeps its own pixel
// size, centred, with sky and ground carried past it.
func TestFullScreenView(t *testing.T) {
	v := FitView(390, 844)
	if v.w != W {
		t.Fatalf("portrait frame width %d, want %d", v.w, W)
	}
	if v.h < H {
		t.Fatalf("portrait frame height %d, smaller than the art", v.h)
	}
	if v.oy <= 0 {
		t.Fatalf("portrait frame left no sky above the art: oy %d", v.oy)
	}
	w := NewView(v.w, v.h)
	if len(w.Frame()) != v.w*v.h*4 {
		t.Fatalf("frame buffer %d bytes, want %d", len(w.Frame()), v.w*v.h*4)
	}
	if len(w.still) != v.w*v.h*4 {
		t.Fatalf("still layer %d bytes, want %d", len(w.still), v.w*v.h*4)
	}
	// the birds are still where the art put them, plus the frame's offset
	x, y := w.BirdAt(0)
	if x < float64(v.ox) || x > float64(v.ox+W) {
		t.Fatalf("bird x %.1f outside the art's band %d..%d", x, v.ox, v.ox+W)
	}
	if y < float64(v.oy) || y > float64(v.oy+H) {
		t.Fatalf("bird y %.1f outside the art's band %d..%d", y, v.oy, v.oy+H)
	}
	if e := w.Tap(x, y); e != EventNote {
		t.Fatalf("tap on a bird in the tall frame gave %d, want %d", e, EventNote)
	}
	// a landscape frame grows sideways instead
	l := FitView(844, 390)
	if l.h != H {
		t.Fatalf("landscape frame height %d, want %d", l.h, H)
	}
	if l.w <= W {
		t.Fatalf("landscape frame width %d did not grow", l.w)
	}
	if l.ox <= 0 {
		t.Fatalf("landscape frame left no sky beside the art: ox %d", l.ox)
	}
}

func TestMoonTap(t *testing.T) {
	w := New()
	mx, my := w.MoonAt()
	if e := w.Tap(mx, my); e != EventMoon {
		t.Fatalf("tap on the moon gave event %d, want %d", e, EventMoon)
	}
	if w.moon.glow <= 0 {
		t.Fatal("the moon did not answer")
	}
	if !w.Shooting() {
		t.Fatal("the moon tap should send a star across the sky")
	}
	if w.Notes() != 0 {
		t.Fatal("the moon should not count as a bird song")
	}
}

func TestNestHold(t *testing.T) {
	w := New()
	nx, ny := w.NestAt()
	if e := w.Hold(nx, ny, 0.2); e != EventNone {
		t.Fatalf("a short press answered %d, want %d", e, EventNone)
	}
	if e := w.Hold(nx, ny, 0.8); e != EventNest {
		t.Fatalf("a long press answered %d, want %d", e, EventNest)
	}
	if w.nest.peek <= 0 {
		t.Fatal("the chick did not peek out")
	}
}

func TestSwipeLiftsFireflies(t *testing.T) {
	w := New()
	if w.FireflyCount() == 0 {
		t.Fatal("there are no fireflies to lift")
	}
	if e := w.Swipe(40, 300, 130, 296); e != EventSwipe {
		t.Fatalf("swipe gave event %d, want %d", e, EventSwipe)
	}
}

func TestTapIsFractionalSafe(t *testing.T) {
	// fractional pointer coordinates must land on a bird, not fall through
	w := New()
	x, y := w.BirdAt(1)
	if e := w.Tap(x+0.37, y-0.42); e != EventNote {
		t.Fatalf("a fractional tap on a bird gave %d, want %d", e, EventNote)
	}
}

// The hidden melody: four different birds, tapped low to high, make the tree
// remember a tune. Tapping the same bird twice breaks the run.
func TestHiddenMelody(t *testing.T) {
	w := New()
	last := 0
	for i := 0; i < 4; i++ {
		x, y := w.BirdAt(i)
		last = w.Tap(x, y)
		w.Clear()
	}
	// The fourth rising tap is the chime. It arrives as EventChime, not EventNote.
	if last != EventChime {
		t.Fatalf("rising taps gave event %d, want %d", last, EventChime)
	}
	if w.Discoveries() < 1 {
		t.Fatal("the melody did not count as a discovery")
	}
}

func TestMelodyRunBreaks(t *testing.T) {
	w := New()
	x, y := w.BirdAt(0)
	w.Tap(x, y)
	w.Clear()
	w.Tap(x, y) // same bird again: the run resets
	w.Clear()
	x, y = w.BirdAt(1)
	w.Tap(x, y)
	w.Clear()
	if w.Event() == EventChime {
		t.Fatal("two taps on one bird should not find the melody")
	}
}
