package world

import "math"

// World is the tree, everything on it, and the frame it is drawn into.
type World struct {
	still []byte // sky, moon, hills, ground, trunk, grass — painted once

	branches []branch
	clusters []cluster
	birds    []bird
	stars    []star
	grass    []tuft
	feathers []feather
	glyphs   []glyph

	give      spring // the tree's whole body giving to a knock
	time      float64
	motion    float64 // 1 normally; less when the visitor asked for less motion
	event     int
	noteHz    float64
	noteCount int
	rng       rng

	fb []byte
}

// New builds a dusk tree with four birds on it.
func New() *World {
	w := &World{
		motion:    1,
		give:      newSpring(5.2, 1.05),
		rng:       rng{s: 20261105},
		fb:        make([]byte, W*H*4),
		still:     make([]byte, W*H*4),
		noteCount: 0,
	}

	for _, d := range branchDefs {
		w.branches = append(w.branches, branch{
			ax: d.ax, ay: d.ay, bx: d.bx, by: d.by, w0: d.w0, w1: d.w1,
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
	w.paintStill()

	for i := 0; i < 4; i++ {
		w.birds = append(w.birds, bird{
			br:     i,
			t:      w.rng.rangeF(0.55, 0.88),
			face:   1,
			note:   i,
			blink:  w.rng.rangeF(0, 6),
			shufT:  w.rng.rangeF(1, 5),
			rng:    rng{s: uint32(7717 + i*911)},
			hopDur: 0.52,
		})
		if w.branches[i].bx < w.branches[i].ax {
			w.birds[i].face = -1
		}
	}
	return w
}

func (w *World) buildLeaves() {
	for _, d := range clusterDefs {
		c := cluster{
			cx: d.cx, cy: d.cy, r: d.r, br: d.br,
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
				// denser in the middle, sparser at the edge; a little
				// clumping so it reads as leaves and not as a blob
				keep := d.den * (1 - 0.45*dist/d.r)
				if w.rng.next() > keep+0.28*w.rng.next()*keep {
					continue
				}
				tone := uint8(2)
				switch {
				case dist > d.r*0.66 && dy < 0:
					tone = 3 // sky-lit crown
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
	for y := 0; y < H; y++ {
		f := float64(y)
		var c RGB
		switch {
		case f < 150:
			c = skyHigh.toward(skyMid, f/150)
		case f < 238:
			c = skyMid.toward(skyLow, math.Pow((f-150)/88, 1.5))
		default:
			c = skyLow
		}
		for x := 0; x < W; x++ {
			// a soft band of warmth behind the tree, and a shade of dither
			// so a gradient this long does not band
			band := 1 - math.Abs(float64(x)-96)/150
			v := c.toward(skyLow, 0.22*band*math.Max(0, 1-f/250))
			if (x+y)%2 == 0 {
				v = v.toward(skyHigh, 0.015)
			}
			w.plot(w.still, x, y, v, 1)
		}
	}
}

func (w *World) buildStars() {
	for i := 0; i < 54; i++ {
		x := w.rng.rangeF(1, W-1)
		y := w.rng.rangeF(2, 214)
		if math.Hypot(x-137, y-52) < 20 { // keep the moon's halo clear
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
	for i := 0; i < 74; i++ {
		x := w.rng.rangeF(1, W-2)
		y := w.rng.rangeF(groundY(x)+4, H-3)
		if math.Abs(x-88) < 7 && y > 286 { // the trunk's own foot stays clear
			continue
		}
		w.grass = append(w.grass, tuft{
			x: x, y: y,
			blades: [3]float64{w.rng.rangeF(-1, 1), w.rng.rangeF(-1, 1), w.rng.rangeF(-1, 1)},
			h:      w.rng.rangeF(2, 4.6),
		})
	}
}

// paintStill bakes everything that never moves into the still layer.
func (w *World) paintStill() {
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
			w.plot(w.still, 137+x, 52+y, c, a)
		}
	}
	// two ridges of hills, then the forest floor
	for x := 0; x < W; x++ {
		for y := int(math.Round(hillFarY(float64(x)))); y < H; y++ {
			w.plot(w.still, x, y, hillFar, 1)
		}
	}
	for x := 0; x < W; x++ {
		for y := int(math.Round(hillNearY(float64(x)))); y < H; y++ {
			w.plot(w.still, x, y, hillNear, 1)
		}
	}
	for x := 0; x < W; x++ {
		top := int(math.Round(groundY(float64(x))))
		for y := top; y < H; y++ {
			f := float64(y-top) / float64(H-top)
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
		cx := trunkCenter(float64(y))
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
			if y > 292 { // root flare
				c = c.toward(barkDark, 0.25)
			}
			w.plot(w.still, x, y, c, 1)
		}
	}
	for _, k := range [][2]int{{212, 96}, {244, 84}, {276, 90}} { // two knots
		w.plot(w.still, k[0], k[1], barkDark, 0.85)
		w.plot(w.still, k[0]+1, k[1], barkDark, 0.6)
		w.plot(w.still, k[0], k[1]+1, barkDark, 0.55)
	}
}

/* -------------------------------------------------------------------- input */

// Tap is the one verb. It always answers something: a bird sings and hops,
// the trunk knocks and the whole tree gives, the sky only moves the leaves.
func (w *World) Tap(x, y float64) int {
	best, bestD := -1, 15.0
	for i := range w.birds {
		bx, by := w.birdPos(&w.birds[i])
		if d := math.Hypot(bx-x, by-y); d < bestD {
			best, bestD = i, d
		}
	}
	if best >= 0 {
		w.sing(&w.birds[best])
		for ci := range w.clusters {
			if w.clusters[ci].br == w.birds[best].br {
				w.clusters[ci].sway.kick(2.6 * w.motion)
			}
		}
		w.give.kick(0.55 * w.motion)
		return EventNote
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
	if y < groundY(x) { // a tap in the sky: a breath of wind
		w.breeze(1)
		return EventWind
	}
	w.breeze(0.45) // a tap on the grass: only the grass moves
	return EventGrass
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
	if y >= 112 && y <= 302 {
		if math.Abs(x-trunkCenter(y)) <= trunkHalf(y)+5 {
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

// sing makes one bird answer: it hops to another branch and sings, one step
// higher in the scale than the last time it was asked.
func (w *World) sing(b *bird) {
	b.note = (b.note + 1) % len(Notes)
	b.glow, b.sing = 1, 1
	w.noteCount++
	w.event, w.noteHz = EventNote, Notes[b.note]
	w.glyphs = append(w.glyphs, glyph{
		x:     b.toXOrHere(w),
		y:     b.yOrHere(w) - 6,
		life:  1.7,
		max:   1.7,
		drift: b.rng.rangeF(-1.6, 1.6),
	})
	if !b.flying {
		w.startHop(b)
	}
	for i := 0; i < 2; i++ {
		f := feather{
			x:    w.birdX(b),
			y:    w.birdY(b),
			vx:   b.rng.rangeF(-7, 7),
			vy:   b.rng.rangeF(-3, 5),
			life: b.rng.rangeF(2.2, 4.0),
			spin: b.rng.rangeF(0, math.Pi*2),
		}
		f.max = f.life
		if w.motion < 0.6 && i == 1 {
			continue // less motion, fewer feathers
		}
		w.feathers = append(w.feathers, f)
	}
}

func (b *bird) xOrHere(w *World) float64 { _, x := w.birdPos(b); return x }
func (b *bird) yOrHere(w *World) float64 { y, _ := w.birdPos(b); return y }
func (b *bird) toXOrHere(w *World) float64 {
	if b.face > 0 {
		return b.xOrHere(w) + 5
	}
	return b.xOrHere(w) - 5
}

func (w *World) startHop(b *bird) {
	w.branches[b.br].dip.kick(-1.5 * w.motion) // the branch springs up as it leaves
	next := b.br
	for next == b.br {
		next = b.rng.intn(len(w.branches))
	}
	b.flying = true
	b.hopT = 0
	b.fromBr, b.toBr = b.br, next
	b.fromT, b.toT = b.t, b.rng.rangeF(0.55, 0.9)
	b.fromX, b.fromY = w.birdPos(b)
	nb := &w.branches[next]
	b.toX, b.toY = nb.point(b.toT, 0)
	b.face = 1
	if b.toX < b.fromX {
		b.face = -1
	}
	w.branches[next].dip.kick(4.2 * w.motion) // and dips as it lands
}

func (r *rng) intn(n int) int {
	if n <= 1 {
		return 0
	}
	return int(r.next() * float64(n))
}

func (w *World) birdX(b *bird) float64 { _, x := w.birdPos(b); return x }
func (w *World) birdY(b *bird) float64 { y, _ := w.birdPos(b); return y }

// birdPos is where a bird is now: on its branch, or on the arc between two.
func (w *World) birdPos(b *bird) (float64, float64) {
	if !b.flying {
		return w.branches[b.br].point(b.t, w.give.pos)
	}
	u := b.hopT / b.hopDur
	if u < 0 {
		u = 0
	}
	if u > 1 {
		u = 1
	}
	x := b.fromX + (b.toX-b.fromX)*u
	y := b.fromY + (b.toY-b.fromY)*u
	// a shallow, unhurried arc; with less motion asked for, a shorter one
	arc := 17 * w.motion * 4 * u * (1 - u)
	return x, y - arc + w.give.pos*0.4
}

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
		if b.flying {
			b.hopT += dt
			if b.hopT >= b.hopDur {
				b.flying = false
				b.br, b.t = b.toBr, b.toT
				w.branches[b.br].dip.kick(1.1 * w.motion)
			}
		} else {
			b.shufT -= dt
			if b.shufT <= 0 { // an idle shuffle, mostly so it feels alive
				b.shufT = b.rng.rangeF(2.5, 7)
				b.shuf = 0.35 + b.rng.next()*0.5
			}
			if b.shuf > 0 {
				b.shuf -= dt * 0.5
			}
		}
		b.glow = math.Max(0, b.glow-dt*0.75)
		b.sing = math.Max(0, b.sing-dt*0.6)
		b.blink += dt
	}

	for i := len(w.feathers) - 1; i >= 0; i-- {
		f := &w.feathers[i]
		f.life -= dt
		if f.life <= 0 {
			w.feathers = append(w.feathers[:i], w.feathers[i+1:]...)
			continue
		}
		f.vy += 6 * dt * w.motion
		f.vx *= 0.985
		f.vy *= 0.985
		f.x += (f.vx + 4*math.Sin(w.time*1.1+f.spin)) * dt
		f.y += f.vy * dt
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

func (w *World) Motion() float64 { return w.motion }
func (w *World) Notes() int      { return w.noteCount }
func (w *World) Time() float64   { return w.time }

// Event reports the last thing that happened. Reading it does not clear it:
// the host reads Event then NoteHz, and calls Clear when it has answered.
func (w *World) Event() int { return w.event }

// NoteHz is the frequency the last bird sang at, or 0 if the last event was
// not a song.
func (w *World) NoteHz() float64 {
	if w.event == EventNote {
		return w.noteHz
	}
	return 0
}

// Clear forgets the last event, once the host has made its sound.
func (w *World) Clear() { w.event, w.noteHz = EventNone, 0 }

// Sway is the widest give of any branch, in pixels — the number the tests use
// to ask "has the tree come back to rest?".
func (w *World) Sway() float64 {
	m := 0.0
	for i := range w.branches {
		if a := math.Abs(w.branches[i].sway.pos); a > m {
			m = a
		}
	}
	return m
}

func (w *World) Flying() int {
	n := 0
	for i := range w.birds {
		if w.birds[i].flying {
			n++
		}
	}
	return n
}

// BirdAt returns where bird i is, for the phone check to aim a thumb at.
func (w *World) BirdAt(i int) (float64, float64) {
	if i < 0 || i >= len(w.birds) {
		return 0, 0
	}
	return w.birdPos(&w.birds[i])
}

func (w *World) BirdCount() int { return len(w.birds) }
