package world

import "math"

// World is the tree, everything on it, and the frame it is drawn into.
type World struct {
	view  view
	still []byte // sky, moon, hills, ground, trunk, grass — painted once

	branches  []branch
	clusters  []cluster
	birds     []bird
	fireflies []firefly
	leaves    []leaf
	stars     []star
	grass     []tuft
	glyphs    []glyph

	moon     moon
	nest     nest
	shooting shooting

	give      spring // the tree's whole body giving to a knock
	time      float64
	motion    float64 // 1 normally; less when the visitor asked for less motion
	event     int
	noteHz    float64
	noteCount int
	pair      int   // a second bird waiting to answer
	pairT     float64
	melRun    int // how many rising taps in a row
	melLast   int // the bird of the last rising tap
	melNote   int // its note, so the next tap must climb
	message   string
	messageT  float64
	idle      float64
	hint      string
	found     [4]bool // the four small discoveries
	rng       rng

	fb []byte
}

// New builds the art at its own size: a dusk tree with four birds and two
// chicks on it. It is what the tests and the preview use.
func New() *World { return NewView(W, H) }

// NewView builds the same scene in a frame of w x h, with the art centred and
// the sky and ground carried past it. The host asks for this when the frame
// should match a phone's viewport instead of leaving a letterbox.
func NewView(vw, vh int) *World {
	v := view{w: vw, h: vh}
	if v.w < W {
		v.w = W
	}
	if v.h < H {
		v.h = H
	}
	v.ox = (v.w - W) / 2
	v.oy = (v.h - H) / 2

	w := &World{
		view:      v,
		motion:    1,
		melLast:   -1,
		give:      newSpring(5.2, 1.05),
		rng:       rng{s: 20261105},
		fb:        make([]byte, v.w*v.h*4),
		still:     make([]byte, v.w*v.h*4),
		noteCount: 0,
	}

	for _, d := range branchDefs {
		w.branches = append(w.branches, branch{
			ax: d.ax + float64(v.ox), ay: d.ay + float64(v.oy),
			bx: d.bx + float64(v.ox), by: d.by + float64(v.oy),
			w0: d.w0, w1: d.w1,
			sway:  newSpring(4.4+w.rng.rangeF(0, 2.2), 0.62+w.rng.rangeF(0, 0.3)),
			dip:   newSpring(11+w.rng.rangeF(0, 5), 1.5),
			amp:   w.rng.rangeF(0.7, 1.25),
			phase: w.rng.rangeF(0, math.Pi*2),
		})
	}

	w.buildLeaves()
	w.buildSky()
	w.buildStars()
	w.buildGrass()
	w.buildFireflies()
	w.buildLeaves2()
	w.paintStill()

	// four grown birds, one to each of the first four branches
	for i := 0; i < 4; i++ {
		w.birds = append(w.birds, bird{
			br:     i,
			t:      w.rng.rangeF(0.55, 0.88),
			face:   1,
			note:   i,
			nudge:  newSpring(26, 1.35),
			blink:  w.rng.rangeF(0, 6),
			shufT:  w.rng.rangeF(1, 5),
			rng:    rng{s: uint32(7717 + i*911)},
		})
		if w.branches[i].bx < w.branches[i].ax {
			w.birds[i].face = -1
		}
	}
	// two chicks in the top canopy, near the nest
	for i := 0; i < 2; i++ {
		w.birds = append(w.birds, bird{
			br:     4,
			t:      []float64{0.3, 0.72}[i],
			face:   1,
			chick:  true,
			note:   4 + i,
			nudge:  newSpring(34, 1.25),
			blink:  w.rng.rangeF(0, 6),
			shufT:  w.rng.rangeF(2, 7),
			rng:    rng{s: uint32(3311 + i*577)},
		})
	}
	nx, ny := w.branches[4].point(0.56, 0)
	w.nest = nest{x: nx, y: ny - 3}
	w.hint = "tap a bird · tap the trunk · swipe the leaves"
	return w
}

/* ------------------------------------------------------------------ build */

func (w *World) buildLeaves() {
	for _, d := range clusterDefs {
		c := cluster{
			cx: d.cx + float64(w.view.ox), cy: d.cy + float64(w.view.oy), r: d.r, br: d.br,
			sway:  newSpring(6.5+w.rng.rangeF(0, 3), 1.0+w.rng.rangeF(0, 0.4)),
			speed: w.rng.rangeF(0.5, 0.9),
			amp:   w.rng.rangeF(0.6, 1.2),
		}
		ir := int(d.r) + 1
		for dy := -ir; dy <= ir; dy++ {
			for dx := -ir; dx <= ir; dx++ {
				dist := math.Hypot(float64(dx), float64(dy))
				if dist > d.r {
					continue
				}
				keep := d.den * (1 - 0.45*dist/d.r)
				if w.rng.next() > keep+0.28*w.rng.next()*keep {
					continue
				}
				tone := uint8(2)
				switch {
				case dist > d.r*0.66 && dy < 0:
					tone = 3
				case dx < 0 && dy < 2 && w.rng.next() < 0.5:
					tone = 1
				case dist > d.r*0.72:
					tone = 0
				}
				c.px = append(c.px, leafPx{dx: dx, dy: dy, tone: tone})
			}
		}
		w.clusters = append(w.clusters, c)
	}
}

func (w *World) buildSky() {
	ox, oy := w.view.ox, w.view.oy
	cx := float64(w.view.w) / 2
	for y := 0; y < w.view.h; y++ {
		f := float64(y - oy)
		var c RGB
		switch {
		case f < 150:
			c = skyHigh.toward(skyMid, f/150)
		case f < 238:
			c = skyMid.toward(skyLow, math.Pow((f-150)/88, 1.5))
		default:
			c = skyLow
		}
		for x := 0; x < w.view.w; x++ {
			ax := float64(x - ox)
			band := math.Max(0, 1-math.Abs(ax-96)/150)
			v := c.toward(skyLow, 0.22*band*math.Max(0, 1-f/250))
			if (x+y)%2 == 0 {
				v = v.toward(skyHigh, 0.015)
			}
			w.plot(w.still, x, y, v, 1)
		}
	}
	_ = cx
}

func (w *World) buildStars() {
	ox, oy := w.view.ox, w.view.oy
	for i := 0; i < 54; i++ {
		x := w.rng.rangeF(1, float64(w.view.w)-1)
		y := float64(oy) + w.rng.rangeF(2, 214)
		if math.Hypot(x-(137+float64(ox)), y-(52+float64(oy))) < 20 {
			continue
		}
		w.stars = append(w.stars, star{
			x: x, y: y,
			base:  w.rng.rangeF(0.18, 0.62),
			phase: w.rng.rangeF(0, math.Pi*2),
			speed: w.rng.rangeF(0.25, 0.75),
		})
	}
}

func (w *World) buildGrass() {
	ox, oy := w.view.ox, w.view.oy
	for i := 0; i < 90; i++ {
		x := w.rng.rangeF(1, float64(w.view.w)-2)
		y := float64(oy) + w.rng.rangeF(groundY(x-float64(ox))+4, H-3)
		if math.Abs(x-(88+float64(ox))) < 7 && y > 286+float64(oy) {
			continue
		}
		w.grass = append(w.grass, tuft{
			x: x, y: y,
			blades: [3]float64{w.rng.rangeF(-1, 1), w.rng.rangeF(-1, 1), w.rng.rangeF(-1, 1)},
			h:      w.rng.rangeF(2, 4.6),
		})
	}
}

func (w *World) buildFireflies() {
	ox, oy := w.view.ox, w.view.oy
	for i := 0; i < 12; i++ {
		w.fireflies = append(w.fireflies, firefly{
			x:     w.rng.rangeF(float64(ox)+4, float64(ox)+W-4),
			y:     float64(oy) + w.rng.rangeF(252, 306),
			vx:    w.rng.rangeF(-2.4, 2.4),
			vy:    w.rng.rangeF(-1.2, 1.2),
			phase: w.rng.rangeF(0, math.Pi*2),
			speed: w.rng.rangeF(0.35, 0.9),
			glow:  0.5,
			drift: w.rng.rangeF(0.4, 1.3),
		})
	}
}

// buildLeaves2 scatters a few leaves that will drift loose over time.
func (w *World) buildLeaves2() {
	for i := 0; i < 3; i++ {
		w.leaves = append(w.leaves, leaf{
			x:    w.rng.rangeF(20, 156) + float64(w.view.ox),
			y:    w.rng.rangeF(90, 200) + float64(w.view.oy),
			vx:   w.rng.rangeF(-4, 4),
			vy:   w.rng.rangeF(2, 7),
			spin: w.rng.rangeF(0, math.Pi*2),
			life: w.rng.rangeF(9, 20),
			tone: uint8(w.rng.intn(4)),
		})
		w.leaves[i].max = w.leaves[i].life
	}
}

// paintStill bakes everything that never moves into the still layer.
func (w *World) paintStill() {
	ox, oy := float64(w.view.ox), float64(w.view.oy)
	// moon and its halo
	for y := -16; y <= 16; y++ {
		for x := -16; x <= 16; x++ {
			d := math.Hypot(float64(x), float64(y))
			if d > 16 {
				continue
			}
			a := 0.0
			switch {
			case d <= 8:
				a = 0.95
			case d <= 10.2:
				a = 0.5
			case d <= 16:
				a = 0.14 * (1 - (d-10.2)/5.8)
			}
			c := moonInk
			if d > 8 {
				c = moonInk.toward(moonHalo, 0.8)
			}
			w.plot(w.still, 137+w.view.ox+x, 52+w.view.oy+y, c, a)
		}
	}
	// two ridges of hills, then the forest floor
	for x := 0; x < w.view.w; x++ {
		ax := float64(x) - ox
		for y := int(math.Round(hillFarY(ax))); y < w.view.h; y++ {
			w.plot(w.still, x, y, hillFar, 1)
		}
	}
	for x := 0; x < w.view.w; x++ {
		ax := float64(x) - ox
		for y := int(math.Round(hillNearY(ax))); y < w.view.h; y++ {
			w.plot(w.still, x, y, hillNear, 1)
		}
	}
	for x := 0; x < w.view.w; x++ {
		ax := float64(x) - ox
		top := int(math.Round(groundY(ax)))
		for y := top; y < w.view.h; y++ {
			f := float64(y-top) / float64(w.view.h-top)
			w.plot(w.still, x, y, groundTop.toward(groundLow, f), 1)
		}
	}
	// grass
	for _, g := range w.grass {
		for i, dir := range g.blades {
			bx := g.x + dir*0.9
			for k := 0; k < int(math.Round(g.h)); k++ {
				f := float64(k) / g.h
				x := int(math.Round(bx + dir*f*1.2))
				y := int(math.Round(g.y - float64(k)))
				w.plot(w.still, x, y, grassInk.toward(groundTop, f*0.6), 0.85-0.1*float64(i))
			}
		}
	}
	// the trunk: dark, with the light of the western sky on its left edge
	for y := 118; y <= 300; y++ {
		cx := trunkCenter(float64(y)) + ox
		hw := trunkHalf(float64(y))
		for x := int(math.Round(cx - hw)); x <= int(math.Round(cx+hw)); x++ {
			side := (float64(x) - (cx - hw)) / (2 * hw)
			c := barkMid
			switch {
			case side < 0.22:
				c = barkLit
			case side > 0.74:
				c = barkDark
			}
			if y > 292 {
				c = c.toward(barkDark, 0.25)
			}
			w.plot(w.still, x, y+int(oy), c, 1)
		}
	}
	for _, k := range [][2]int{{212, 96}, {244, 84}, {276, 90}} { // two knots
		kx, ky := k[0]+w.view.ox, k[1]+w.view.oy
		w.plot(w.still, kx, ky, barkDark, 0.85)
		w.plot(w.still, kx+1, ky, barkDark, 0.6)
		w.plot(w.still, kx, ky+1, barkDark, 0.55)
	}
}

/* -------------------------------------------------------------------- input */

// Tap is the one verb. It always answers something: a bird hops in place and
// sings (it never leaves), the trunk knocks and the whole tree gives, the
// sky only moves the leaves. A few places keep a small secret.
func (w *World) Tap(x, y float64) int {
	// the moon, first: it is above everything and easy to miss
	if math.Hypot(x-w.moonX(), y-w.moonY()) < 13 {
		w.moon.tapT = 1
		w.moon.glow = 1
		w.moon.spark = 1
		w.found[0] = true
		w.launchShooting()
		w.say("the moon answers with an old light")
		w.event, w.noteHz = EventMoon, 392.0
		return EventMoon
	}
	// the nest: a tap there is a knock on the edge of it, not a long press
	if math.Hypot(x-w.nest.x, y-w.nest.y) < 9 {
		w.nest.blink = 1
		w.say("something small shifts in the nest")
		w.event, w.noteHz = EventNest, 523.25
		return EventNest
	}
	best, bestD := -1, 15.0
	for i := range w.birds {
		bx, by := w.birdPos(&w.birds[i])
		if d := math.Hypot(bx-x, by-y); d < bestD {
			best, bestD = i, d
		}
	}
	if best >= 0 {
		w.nudgeBird(best)
		return w.event // EventNote, or EventChime when a melody is found
	}
	// a firefly, or the grass around it
	fi := w.fireflyAt(x, y)
	if fi >= 0 {
		w.liftFireflies(fi)
		return EventSwipe
	}
	if w.nearTrunk(x, y) {
		w.give.kick(6.0 * w.motion)
		for i := range w.branches {
			w.branches[i].sway.kick(3.4 * w.motion * w.branches[i].amp)
			w.branches[i].dip.kick(1.2 * w.motion)
		}
		for ci := range w.clusters {
			w.clusters[ci].sway.kick(1.7 * w.motion * w.clusters[ci].amp)
		}
		for i := range w.birds { // the birds ruffle, they do not leave
			w.birds[i].glow = math.Max(w.birds[i].glow, 0.35)
			w.birds[i].shuf = 0.5 + w.birds[i].rng.next()
		}
		w.event, w.noteHz = EventKnock, 0
		return EventKnock
	}
	if y < groundY(x-float64(w.view.ox))+float64(w.view.oy) { // a tap in the sky
		w.breeze(1)
		w.loosenLeaves(x, y)
		return EventWind
	}
	w.breeze(0.45)
	return EventGrass
}

// Hold is a long press: only the nest answers it. It returns EventNest once
// the press has been held long enough, and EventNone before that.
func (w *World) Hold(x, y float64, seconds float64) int {
	if math.Hypot(x-w.nest.x, y-w.nest.y) > 12 {
		return EventNone
	}
	w.nest.hold = seconds
	if seconds < 0.65 {
		return EventNone
	}
	if !w.nest.peeped {
		w.nest.peeped = true
		w.nest.peek = 1
		w.found[1] = true
		w.say("a chick peeps out of the nest, and ducks back")
		w.event, w.noteHz = EventNest, 659.25
		w.noteCount++
		w.glyphs = append(w.glyphs, glyph{x: w.nest.x, y: w.nest.y - 8, life: 1.6, max: 1.6, drift: -0.7})
		return EventNest
	}
	return EventNone
}

// Swipe is a stroke across the screen. Through the leaves it shakes them and
// lifts the fireflies; elsewhere it is just a stronger breeze.
func (w *World) Swipe(x0, y0, x1, y1 float64) int {
	if math.Hypot(x1-x0, y1-y0) < 18 {
		return EventNone
	}
	w.breeze(1.4)
	w.loosenLeaves((x0+x1)/2, (y0+y1)/2)
	for i := range w.fireflies {
		f := &w.fireflies[i]
		f.vx += w.rng.rangeF(-9, 9)
		f.vy += w.rng.rangeF(-5, 2)
		f.glow = math.Max(f.glow, 1)
	}
	w.found[2] = true
	w.say("the leaves let go, and the fireflies rise")
	w.event, w.noteHz = EventSwipe, 0
	return EventSwipe
}

func (w *World) moonX() float64 { return 137 + float64(w.view.ox) }
func (w *World) moonY() float64 { return 52 + float64(w.view.oy) }

func (w *World) fireflyAt(x, y float64) int {
	best, bestD := -1, 12.0
	for i := range w.fireflies {
		if d := math.Hypot(w.fireflies[i].x-x, w.fireflies[i].y-y); d < bestD {
			best, bestD = i, d
		}
	}
	return best
}

func (w *World) liftFireflies(seed int) {
	for i := range w.fireflies {
		f := &w.fireflies[i]
		d := math.Hypot(f.x-w.fireflies[seed].x, f.y-w.fireflies[seed].y)
		if d > 42 {
			continue
		}
		f.vx += w.rng.rangeF(-7, 7)
		f.vy += w.rng.rangeF(-4, 2)
		f.glow = math.Max(f.glow, 0.9)
	}
	w.say("the fireflies lift, and settle again")
	w.event, w.noteHz = EventSwipe, 0
}

func (w *World) loosenLeaves(x, y float64) {
	n := 0
	for i := range w.leaves {
		l := &w.leaves[i]
		if math.Hypot(l.x-x, l.y-y) < 40 && l.vy < 12 {
			l.vy += 2
			l.vx += w.rng.rangeF(-2, 2)
			n++
			if n >= 2 {
				return
			}
		}
	}
}

func (w *World) breeze(strength float64) {
	for i := range w.branches {
		w.branches[i].sway.kick(1.5 * strength * w.motion * w.branches[i].amp)
	}
	for ci := range w.clusters {
		c := &w.clusters[ci]
		c.sway.kick(1.9 * strength * w.motion * c.amp)
	}
	w.give.kick(0.5 * strength * w.motion)
	w.event = EventWind
	if strength < 1 {
		w.event = EventGrass
	}
	w.noteHz = 0
}

// nearTrunk reports whether (x, y) is close enough to the trunk or a branch
// to count as a knock on the tree rather than a breath of wind.
func (w *World) nearTrunk(x, y float64) bool {
	ox, oy := float64(w.view.ox), float64(w.view.oy)
	if y >= 112+oy && y <= 302+oy {
		if math.Abs(x-(trunkCenter(y-oy)+ox)) <= trunkHalf(y-oy)+5 {
			return true
		}
	}
	for i := range w.branches {
		b := &w.branches[i]
		for s := 0.0; s <= 1.001; s += 0.05 {
			bx, by := b.point(s, 0)
			if math.Hypot(bx-x, by-y) < 4 {
				return true
			}
		}
	}
	return false
}

// nudgeBird is the gentle verb. The bird stays exactly where it is: it gives
// a small hop, flutters its wings, sings one note and settles back onto the
// same branch. A neighbour answers a beat later, so two birds can trade a
// slow call and response. Nothing disappears.
func (w *World) nudgeBird(i int) {
	b := &w.birds[i]
	step := 1
	if b.chick {
		step = 2 // chicks climb the scale faster and sing higher
	}
	b.note = (b.note + step) % len(Notes)
	// a hidden melody: four different birds, tapped in rising order of pitch.
	if i != w.melLast && b.note > w.melNote {
		w.melRun++
	} else {
		w.melRun = 1
	}
	w.melLast, w.melNote = i, b.note
	b.glow, b.sing = 1, 1
	b.flutter = 0.55
	if b.chick {
		b.flutter = 0.4
	}
	b.nudge.kick(-30 * w.motion)
	w.noteCount++
	w.event, w.noteHz = EventNote, Notes[b.note]
	if w.melRun >= 4 && !w.found[3] {
		w.found[3] = true
		w.event, w.noteHz = EventChime, Notes[b.note]
		w.say("a melody the tree remembers")
	}
	bx, by := w.birdPos(b)
	w.glyphs = append(w.glyphs, glyph{
		x: bx + float64(b.face)*5, y: by - 7, life: 1.7, max: 1.7,
		drift: b.rng.rangeF(-1.6, 1.6),
	})
	// the branch it sits on gives a little, and comes back
	w.branches[b.br].dip.kick(2.4 * w.motion)
	for ci := range w.clusters {
		if w.clusters[ci].br == b.br {
			w.clusters[ci].sway.kick(2.2 * w.motion)
		}
	}
	// find a neighbour, so a pair answers each other
	if w.pairT <= 0 {
		for j := range w.birds {
			if j == i {
				continue
			}
			if w.birds[j].chick != b.chick {
				continue
			}
			w.pair = j
			w.pairT = 0.55
			break
		}
	}
}

// answerPair makes the waiting neighbour sing a beat later. It is the same
// gentle hop, one step down the scale so the two notes belong together.
func (w *World) answerPair() {
	j := w.pair
	if j < 0 || j >= len(w.birds) {
		return
	}
	b := &w.birds[j]
	if b.note > 0 {
		b.note--
	}
	b.glow, b.sing = 0.85, 1
	b.flutter = 0.5
	b.nudge.kick(-22 * w.motion)
	w.noteCount++
	w.event, w.noteHz = EventNote, Notes[b.note]
	bx, by := w.birdPos(b)
	w.glyphs = append(w.glyphs, glyph{
		x: bx + float64(b.face)*5, y: by - 6, life: 1.5, max: 1.5,
		drift: b.rng.rangeF(-1.2, 1.2),
	})
	w.branches[b.br].dip.kick(1.6 * w.motion)
}

func (w *World) say(text string) {
	w.message = text
	w.messageT = 4.0
}

// Message returns the line the piece wants said, and how long it has left.
func (w *World) Message() (string, float64) { return w.message, w.messageT }

// Hints returns the current gentle hint after a long idle.
func (w *World) Hints() string { return w.hint }

// Discoveries counts the small secrets found so far.
func (w *World) Discoveries() int {
	n := 0
	for _, f := range w.found {
		if f {
			n++
		}
	}
	return n
}

func (w *World) birdPos(b *bird) (float64, float64) {
	x, y := w.branches[b.br].point(b.t, w.give.pos)
	if b.chick {
		return x, y - 1
	}
	return x, y - 2
}

func (w *World) birdX(b *bird) float64 { _, x := w.birdPos(b); return x }
func (w *World) birdY(b *bird) float64 { y, _ := w.birdPos(b); return y }

/* --------------------------------------------------------------------- step */

// Step advances the whole scene. Big steps are clamped so a tab that was
// hidden for a minute comes back calm instead of exploding.
func (w *World) Step(dt float64) {
	if dt < 0 {
		dt = 0
	}
	if dt > 0.05 {
		dt = 0.05
	}
	w.time += dt

	// the breeze that is always there: slow, small, never zero
	breath := 0.5*math.Sin(w.time*0.31) + 0.3*math.Sin(w.time*0.17+1.7)
	for i := range w.branches {
		b := &w.branches[i]
		b.sway.vel += breath * 0.035 * w.motion * b.amp
		b.sway.advance(dt)
		b.dip.advance(dt)
	}
	w.give.advance(dt)

	for ci := range w.clusters {
		c := &w.clusters[ci]
		c.sway.vel += 0.06 * w.motion * c.amp * math.Sin(w.time*c.speed+c.cx*0.4)
		c.sway.advance(dt)
	}

	for i := range w.birds {
		b := &w.birds[i]
		b.nudge.advance(dt)
		if b.flutter > 0 {
			b.flutter -= dt
		}
		b.shufT -= dt
		if b.shufT <= 0 { // an idle shuffle, mostly so it feels alive
			b.shufT = b.rng.rangeF(2.5, 7)
			b.shuf = 0.35 + b.rng.next()*0.5
		}
		if b.shuf > 0 {
			b.shuf -= dt * 0.5
		}
		b.glow = math.Max(0, b.glow-dt*0.75)
		b.sing = math.Max(0, b.sing-dt*0.6)
		b.blink += dt
	}

	if w.pairT > 0 {
		w.pairT -= dt
		if w.pairT <= 0 {
			w.answerPair()
			w.pair = -1
		}
	}

	// the moon's answer fades slowly
	w.moon.glow = math.Max(0, w.moon.glow-dt*0.55)
	w.moon.tapT = math.Max(0, w.moon.tapT-dt)
	w.moon.spark = math.Max(0, w.moon.spark-dt*0.7)
	if w.moon.spark > 0 && w.rng.next() < 0.4 {
		// a little shimmer in the halo
		a := 0.10 * w.moon.spark
		r := 18 + w.rng.rangeF(-2, 3)
		for k := 0; k < 3; k++ {
			ang := w.rng.rangeF(0, math.Pi*2)
			w.plot(w.fb, int(w.moonX()+math.Cos(ang)*r), int(w.moonY()+math.Sin(ang)*r), moonHalo, a)
		}
	}

	// the nest settles back
	if w.nest.hold > 0 && w.nest.peek > 0 {
		w.nest.peek = math.Max(0, w.nest.peek-dt*0.5)
	}
	w.nest.blink += dt
	if w.nest.hold > 0 {
		w.nest.hold -= dt
	}

	// fireflies drift, and blink; tap near them and they scatter
	for i := range w.fireflies {
		f := &w.fireflies[i]
		f.x += (f.vx + 2.2*math.Sin(w.time*0.7+f.phase)) * dt
		f.y += (f.vy + 1.1*math.Cos(w.time*0.5+f.phase)) * dt
		f.vx *= 0.985
		f.vy *= 0.985
		if f.x < float64(w.view.ox)+2 || f.x > float64(w.view.ox+W)-2 {
			f.vx = -f.vx
			f.x = math.Max(float64(w.view.ox)+2, math.Min(float64(w.view.ox+W)-2, f.x))
		}
		if f.y < float64(w.view.oy)+248 || f.y > float64(w.view.oy+H)-2 {
			f.vy = -f.vy
			f.y = math.Max(float64(w.view.oy)+248, math.Min(float64(w.view.oy+H)-2, f.y))
		}
		f.glow = math.Max(0.18, 0.45+0.45*math.Sin(w.time*f.speed+f.phase))
	}

	// leaves drift down, slowly, and land
	for i := len(w.leaves) - 1; i >= 0; i-- {
		l := &w.leaves[i]
		l.life -= dt
		if l.life <= 0 {
			w.leaves = append(w.leaves[:i], w.leaves[i+1:]...)
			continue
		}
		l.vy += 3 * dt * w.motion
		l.vy *= 0.995
		l.x += (l.vx + 2.5*math.Sin(w.time*0.9+l.spin)) * dt
		l.y += l.vy * dt
		if l.y > float64(w.view.oy+H)-4 {
			l.vy = 0
			l.vx *= 0.9
		}
	}
	if len(w.leaves) < 3 && w.rng.next() < 0.002 {
		w.leaves = append(w.leaves, leaf{
			x: w.rng.rangeF(20, 156) + float64(w.view.ox), y: w.rng.rangeF(80, 190) + float64(w.view.oy),
			vx: w.rng.rangeF(-4, 4), vy: w.rng.rangeF(2, 5),
			spin: w.rng.rangeF(0, math.Pi*2), life: w.rng.rangeF(9, 20), tone: uint8(w.rng.intn(4)),
		})
		w.leaves[len(w.leaves)-1].max = w.leaves[len(w.leaves)-1].life
	}

	// the rare visitor: a shooting star, now and then, never on demand
	if w.shooting.life > 0 {
		w.shooting.life -= dt
		w.shooting.x += w.shooting.vx * dt
		w.shooting.y += w.shooting.vy * dt
	} else if w.rng.next() < 0.00035 {
		w.launchShooting()
	}

	for i := len(w.glyphs) - 1; i >= 0; i-- {
		g := &w.glyphs[i]
		g.life -= dt
		if g.life <= 0 {
			w.glyphs = append(w.glyphs[:i], w.glyphs[i+1:]...)
			continue
		}
		g.y -= 9 * dt * w.motion
		g.x += g.drift * dt
	}

	if w.messageT > 0 {
		w.messageT -= dt
		if w.messageT <= 0 {
			w.message = ""
		}
	}
	w.idle += dt
}

func (w *World) launchShooting() {
	if w.shooting.life > 0 {
		return
	}
	ox, oy := float64(w.view.ox), float64(w.view.oy)
	w.shooting = shooting{
		x:    ox + w.rng.rangeF(20, W-20),
		y:    oy + w.rng.rangeF(10, 90),
		vx:   w.rng.rangeF(-70, -35),
		vy:   w.rng.rangeF(20, 42),
		life: 1.3, max: 1.3,
	}
}

// SetMotion scales how much the scene is allowed to move: 1 normally, less
// when the visitor has asked their system for less motion.
func (w *World) SetMotion(s float64) {
	if s < 0.2 {
		s = 0.2
	}
	if s > 1 {
		s = 1
	}
	w.motion = s
}

/* ------------------------------------------------------------------- probes */

func (w *World) Motion() float64   { return w.motion }
func (w *World) Notes() int        { return w.noteCount }
func (w *World) Time() float64     { return w.time }
func (w *World) ViewW() int        { return w.view.w }
func (w *World) ViewH() int        { return w.view.h }
func (w *World) MoonAt() (float64, float64) { return w.moonX(), w.moonY() }
func (w *World) NestAt() (float64, float64) { return w.nest.x, w.nest.y }
func (w *World) FireflyCount() int { return len(w.fireflies) }
func (w *World) Shooting() bool    { return w.shooting.life > 0 }

func (w *World) Event() int { return w.event }

func (w *World) NoteHz() float64 {
	if w.event == EventNote || w.event == EventMoon || w.event == EventNest {
		return w.noteHz
	}
	return 0
}

func (w *World) Clear() { w.event, w.noteHz = EventNone, 0 }

func (w *World) Sway() float64 {
	m := 0.0
	for i := range w.branches {
		if a := math.Abs(w.branches[i].sway.pos); a > m {
			m = a
		}
	}
	return m
}

// NudgePeak is how far the tallest bird hop has reached so far, for the tests.
func (w *World) NudgePeak() float64 {
	m := 0.0
	for i := range w.birds {
		if a := math.Abs(w.birds[i].nudge.pos); a > m {
			m = a
		}
	}
	return m
}

// BirdAt returns where bird i is, for the phone check to aim a thumb at.
func (w *World) BirdAt(i int) (float64, float64) {
	if i < 0 || i >= len(w.birds) {
		return 0, 0
	}
	return w.birdPos(&w.birds[i])
}

func (w *World) BirdCount() int { return len(w.birds) }

func (w *World) ChickCount() int {
	n := 0
	for i := range w.birds {
		if w.birds[i].chick {
			n++
		}
	}
	return n
}
