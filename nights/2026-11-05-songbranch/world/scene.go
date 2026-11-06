// Package world is the whole of Songbranch that isn't a browser: the dusk
// tree, the birds on it, the breeze, one tap and its answer — and the
// framebuffer it paints into. It imports nothing but math, so the same code
// runs under `go test` and compiled to wasm32.
package world

import "math"

const (
	W = 176 // framebuffer, in pixels
	H = 312
)

// Event kinds the host may want to make a sound about.
const (
	EventNone  = 0
	EventNote  = 1 // a bird sang
	EventKnock = 2 // the trunk was tapped
	EventWind  = 3 // a tap in the sky: only leaves move
	EventGrass = 4 // a tap on the ground: only grass moves
)

// Notes is the scale the birds sing in — A minor pentatonic, A3 to A5. Eleven
// steps, so a bird that is tapped again always answers a little higher, and
// any two birds tapped together still sound like they belong together.
var Notes = []float64{220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00}

// RGB is a colour in 0..1, so the renderer can blend without repacking bytes.
type RGB struct{ R, G, B float64 }

func rgb(r, g, b int) RGB { return RGB{float64(r) / 255, float64(g) / 255, float64(b) / 255} }

func (c RGB) toward(o RGB, a float64) RGB {
	return RGB{c.R + (o.R-c.R)*a, c.G + (o.G-c.G)*a, c.B + (o.B-c.B)*a}
}

/* ----------------------------------------------------------------- palette */

var (
	skyLow  = rgb(208, 132, 92) // the last of the light, just above the hills
	skyMid  = rgb(78, 58, 88)
	skyHigh = rgb(18, 20, 38)

	moonInk  = rgb(226, 222, 206)
	moonHalo = rgb(150, 138, 168)
	starInk  = rgb(206, 212, 238)

	hillFar  = rgb(40, 34, 58)
	hillNear = rgb(24, 26, 42)

	groundTop = rgb(30, 38, 38)
	groundLow = rgb(16, 22, 26)
	grassInk  = rgb(44, 58, 50)

	barkDark = rgb(40, 30, 36)
	barkMid  = rgb(64, 48, 48)
	barkLit  = rgb(96, 74, 62)

	leaves = [4]RGB{
		rgb(22, 40, 42),
		rgb(32, 56, 52),
		rgb(46, 74, 60),
		rgb(72, 100, 70),
	}
	leafRim = rgb(132, 124, 92) // the sky's warmth catching an edge

	birdBody  = rgb(48, 56, 84)
	birdDark  = rgb(30, 34, 54)
	birdBelly = rgb(198, 176, 142)
	birdBeak  = rgb(226, 168, 86)
	birdWing  = rgb(84, 94, 126)
	birdEye   = rgb(14, 14, 20)

	featherInk = rgb(196, 178, 148)
	noteInk    = rgb(242, 216, 162)
	answerInk  = rgb(255, 204, 138)
)

/* ------------------------------------------------------------------ shapes */

// The tree, in pixels. Branches are straight in the data and bent by the wind
// at draw time; the trunk never moves, it is baked into the still layer.
var branchDefs = []struct{ ax, ay, bx, by, w0, w1 float64 }{
	{87, 184, 34, 162, 3.7, 1.4},  // low left
	{86, 176, 142, 156, 3.7, 1.4}, // low right
	{85, 150, 42, 118, 3.2, 1.3},  // high left
	{85, 142, 134, 116, 3.2, 1.3}, // high right
	{85, 132, 94, 76, 3.2, 1.3},   // top
}

func trunkCenter(y float64) float64 { return 88 - 3*(300-y)/182 }

func trunkHalf(y float64) float64 {
	if y > 300 {
		y = 300
	}
	return 2.1 + 2.6*(y-118)/182
}

var clusterDefs = []struct {
	cx, cy, r float64
	br        int
	den       float64
}{
	{34, 158, 13, 0, 0.62}, {19, 148, 9, 0, 0.5},
	{142, 152, 13, 1, 0.62}, {157, 140, 8, 1, 0.5},
	{42, 114, 12, 2, 0.62}, {27, 104, 8, 2, 0.5},
	{134, 112, 12, 3, 0.62}, {149, 100, 8, 3, 0.5},
	{94, 72, 13, 4, 0.6}, {79, 60, 9, 4, 0.5}, {108, 68, 8, 4, 0.5},
	{66, 146, 10, 0, 0.55}, {112, 138, 10, 1, 0.55},
	{66, 124, 9, 2, 0.5}, {114, 122, 9, 3, 0.5},
	{85, 100, 11, 4, 0.5}, {108, 96, 9, 4, 0.45}, {62, 96, 9, 4, 0.45},
}

func groundY(x float64) float64 { return 258 - 3*math.Sin(x/23+1.1) }

func hillFarY(x float64) float64  { return 236 - 5*math.Sin(x/31+0.4) - 2*math.Sin(x/11) }
func hillNearY(x float64) float64 { return 248 - 4*math.Sin(x/19+2.2) }

/* --------------------------------------------------------------------- rng */

// A tiny deterministic prng: the still layer and every scatter of leaf and
// star is identical on every load, which is what makes the render testable.
type rng struct{ s uint32 }

func (r *rng) next() float64 {
	r.s = r.s*1664525 + 1013904223
	return float64(r.s>>8) / float64(1<<24)
}

func (r *rng) rangeF(lo, hi float64) float64 { return lo + (hi-lo)*r.next() }

/* ------------------------------------------------------------------ spring */

// spring is one damped oscillator. Every settling thing in Songbranch — a
// branch that gave to a bird, a leaf cluster in the breeze — is one of these,
// so "does it come to rest?" is a property the tests can ask about directly.
type spring struct {
	pos, vel, k, damp float64
}

func newSpring(k, damp float64) spring { return spring{k: k, damp: damp} }

func (s *spring) advance(dt float64) {
	acc := -s.k*s.pos - s.damp*s.vel
	s.vel += acc * dt
	s.pos += s.vel * dt
}

func (s *spring) kick(v float64) { s.vel += v }

/* ------------------------------------------------------------------ pieces */

type branch struct {
	ax, ay, bx, by float64
	w0, w1         float64
	sway           spring // horizontal give of the tip
	dip            spring // vertical sag when a bird lands
	amp, phase     float64
}

// point returns where the branch runs at parameter t (0 at the trunk), after
// the wind has moved it.
func (b *branch) point(t float64, give float64) (float64, float64) {
	x := b.ax + (b.bx-b.ax)*t + b.sway.pos*t
	y := b.ay + (b.by-b.ay)*t + b.dip.pos*t + give*t*0.6
	return x, y
}

type leafPx struct {
	dx, dy int
	tone   uint8
}

type cluster struct {
	cx, cy, r float64
	br        int
	sway      spring
	speed     float64
	amp       float64
	px        []leafPx
}

type star struct {
	x, y  float64
	base  float64
	phase float64
	speed float64
}

type tuft struct {
	x, y   float64
	blades [3]float64
	h      float64
}

type bird struct {
	br     int
	t      float64
	face   int
	flying bool
	hopT   float64
	hopDur float64

	fromX, fromY float64
	toX, toY     float64
	fromT, toT   float64
	fromBr, toBr int

	glow  float64
	sing  float64
	note  int
	blink float64
	shuf  float64
	shufT float64
	rng   rng
}

type feather struct {
	x, y, vx, vy float64
	life, max    float64
	spin         float64
}

type glyph struct {
	x, y      float64
	life, max float64
	drift     float64
}
