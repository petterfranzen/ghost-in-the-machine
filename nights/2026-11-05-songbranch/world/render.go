package world

import "math"

/* ---------------------------------------------------------------- painting */

func clamp01(a float64) float64 {
	if a < 0 {
		return 0
	}
	if a > 1 {
		return 1
	}
	return a
}

// plot blends one pixel over an RGBA buffer. Every alpha here is small and
// every layer is soft on purpose: nothing in Songbranch should flash.
func (w *World) plot(dst []byte, x, y int, c RGB, a float64) {
	if x < 0 || y < 0 || x >= w.view.w || y >= w.view.h {
		return
	}
	a = clamp01(a)
	if a <= 0 {
		return
	}
	d := (y*w.view.w + x) * 4
	if d+3 >= len(dst) {
		return
	}
	r := clamp01(c.R) * 255
	g := clamp01(c.G) * 255
	b := clamp01(c.B) * 255
	dst[d] = uint8(float64(dst[d])*(1-a) + r*a + 0.5)
	dst[d+1] = uint8(float64(dst[d+1])*(1-a) + g*a + 0.5)
	dst[d+2] = uint8(float64(dst[d+2])*(1-a) + b*a + 0.5)
	dst[d+3] = 255
}

// addLight adds warmth instead of covering: a bird that has just sung, and
// the note leaving its beak, glow rather than paint over the branches.
func (w *World) addLight(dst []byte, x, y int, c RGB, a float64) {
	if x < 0 || y < 0 || x >= w.view.w || y >= w.view.h {
		return
	}
	a = clamp01(a)
	if a <= 0 {
		return
	}
	d := (y*w.view.w + x) * 4
	if d+3 >= len(dst) {
		return
	}
	for i, v := range [3]float64{clamp01(c.R), clamp01(c.G), clamp01(c.B)} {
		f := float64(dst[d+i]) + v*255*a
		if f > 255 {
			f = 255
		}
		dst[d+i] = uint8(f + 0.5)
	}
	dst[d+3] = 255
}

func (w *World) blob(dst []byte, cx, cy, r float64, c RGB, a float64) {
	ir := int(r) + 1
	for y := -ir; y <= ir; y++ {
		for x := -ir; x <= ir; x++ {
			d := math.Hypot(float64(x), float64(y))
			if d > r {
				continue
			}
			f := 1 - d/(r+0.8)
			w.plot(dst, int(math.Round(cx))+x, int(math.Round(cy))+y, c, a*f)
		}
	}
}

// limb draws a tapered branch as a run of small discs, gently lit on the side
// the sunset is on.
func (w *World) limb(dst []byte, x0, y0, x1, y1, w0, w1 float64, c RGB) {
	n := int(math.Hypot(x1-x0, y1-y0))
	if n < 1 {
		n = 1
	}
	for i := 0; i <= n; i++ {
		s := float64(i) / float64(n)
		cx := x0 + (x1-x0)*s
		cy := y0 + (y1-y0)*s
		r := w0 + (w1-w0)*s
		w.blob(dst, cx, cy, r, c, 1)
		w.plot(dst, int(cx+r*0.55), int(cy-r*0.75), barkLit, 0.5)
		w.plot(dst, int(cx-r*0.5), int(cy+r*0.8), barkDark, 0.45)
	}
}

/* ------------------------------------------------------------------ layers */

func (w *World) renderStars(dst []byte) {
	for i := range w.stars {
		s := &w.stars[i]
		tw := 0.62 + 0.38*math.Sin(w.time*s.speed+s.phase)
		a := s.base * tw
		w.plot(dst, int(math.Round(s.x)), int(math.Round(s.y)), starInk, a)
		if s.base > 0.5 {
			w.plot(dst, int(math.Round(s.x))+1, int(math.Round(s.y)), starInk, a*0.5)
		}
	}
}

func (w *World) renderBranches(dst []byte) {
	for i := range w.branches {
		b := &w.branches[i]
		steps := 10
		px, py := b.point(0, w.give.pos)
		for s := 1; s <= steps; s++ {
			t := float64(s) / float64(steps)
			cx, cy := b.point(t, w.give.pos)
			w.limb(dst, px, py, cx, cy, b.w0+(b.w1-b.w0)*(t-1/float64(steps)), b.w0+(b.w1-b.w0)*t, barkMid)
			px, py = cx, cy
		}
		twx, twy := b.point(0.62, w.give.pos)
		w.limb(dst, twx, twy, twx-9, twy-9, 1.4, 0.7, barkMid)
	}
	for ci := range w.clusters {
		c := &w.clusters[ci]
		b := &w.branches[c.br]
		dx := int(math.Round(b.sway.pos + c.sway.pos))
		dy := int(math.Round(w.give.pos*0.6 + c.sway.pos*0.35))
		for _, p := range c.px {
			col := leaves[p.tone]
			a := 1.0
			if p.tone == 3 {
				a = 0.92
				w.plot(dst, int(c.cx)+p.dx+dx, int(c.cy)+p.dy+dy, leafRim, 0.20)
			}
			w.plot(dst, int(c.cx)+p.dx+dx, int(c.cy)+p.dy+dy, col, a)
		}
	}
}

/* -------------------------------------------------------------------- birds */

var birdPerched = []string{
	".dd.....",
	"dbbeb...",
	"dbbbbykk",
	".bbbyy..",
	"..ff....",
}

var birdFlap = []string{
	"..ww....",
	".dwwd...",
	"dbbbbykk",
	".bbbyy..",
	"..ff....",
}

// a chick is smaller and rounder, and never leaves the nest branch
var chickPerched = []string{
	"..dd..",
	".bbbe.",
	"bbbykk",
	".bbby.",
	"..ff..",
}

var chickFlap = []string{
	"..ww..",
	".bwwb.",
	"bbbykk",
	".bbby.",
	"..ff..",
}

func birdTone(ch byte) (RGB, bool) {
	switch ch {
	case 'd':
		return birdDark, true
	case 'b':
		return birdBody, true
	case 'w':
		return birdWing, true
	case 'y':
		return birdBelly, true
	case 'k':
		return birdBeak, true
	case 'e':
		return birdEye, true
	case 'f':
		return birdBeak.toward(barkDark, 0.35), true
	}
	return RGB{}, false
}

func (w *World) renderBirds(dst []byte) {
	for i := range w.birds {
		b := &w.birds[i]
		x, y := w.birdPos(b)
		frame := birdPerched
		if b.chick {
			frame = chickPerched
		}
		if b.flutter > 0 {
			if b.chick {
				frame = chickFlap
			} else {
				frame = birdFlap
			}
		} else if b.shuf > 0.45 {
			frame = birdFlap
		}
		y += b.nudge.pos
		if b.glow > 0.05 {
			w.blob(dst, x, y-3, 9*b.glow+3, answerInk, 0.10*b.glow)
		}
		for row, line := range frame {
			for col := 0; col < len(line); col++ {
				if line[col] == '.' {
					continue
				}
				c, ok := birdTone(line[col])
				if !ok {
					continue
				}
				ox := col - 3
				if b.face < 0 {
					ox = 3 - col
				}
				px := int(math.Round(x)) + ox
				py := int(math.Round(y)) - 4 + row
				if b.sing > 0.2 && line[col] == 'k' {
					c = c.toward(moonInk, 0.4)
				}
				w.plot(dst, px, py, c, 1)
				if b.glow > 0.2 {
					w.addLight(dst, px, py, answerInk, 0.12*b.glow)
				}
			}
		}
	}
}

func (w *World) renderFireflies(dst []byte) {
	for i := range w.fireflies {
		f := &w.fireflies[i]
		a := clamp01(f.glow)
		w.addLight(dst, int(math.Round(f.x)), int(math.Round(f.y)), fireflyInk, 0.5*a)
		w.blob(dst, f.x, f.y, 1.4, fireflyInk, 0.9*a)
		if f.glow > 0.7 {
			w.addLight(dst, int(math.Round(f.x)), int(math.Round(f.y)), answerInk, 0.18*(f.glow-0.7)/0.3)
		}
	}
}

func (w *World) renderLeaves(dst []byte) {
	for i := range w.leaves {
		l := &w.leaves[i]
		a := clamp01(l.life / l.max)
		c := leaves[l.tone]
		x, y := int(math.Round(l.x)), int(math.Round(l.y))
		w.plot(dst, x, y, c, a)
		w.plot(dst, x+1, y, c, a*0.7)
		if math.Mod(l.spin+l.life*2, 2) < 1 {
			w.plot(dst, x, y+1, c, a*0.55)
		}
	}
}

func (w *World) renderMoon(dst []byte) {
	m := &w.moon
	if m.glow <= 0.02 {
		return
	}
	// a warm ring grows and fades over the baked moon
	r := 10 + 14*m.glow
	w.blob(dst, w.moonX(), w.moonY(), r, moonHalo, 0.10*m.glow)
	w.blob(dst, w.moonX(), w.moonY(), 9+6*m.glow, answerInk, 0.16*m.glow)
	if m.spark > 0.02 {
		for k := 0; k < 6; k++ {
			ang := float64(k)*math.Pi/3 + m.tapT*0.6
			rr := 13 + 9*m.spark
			x := w.moonX() + math.Cos(ang)*rr
			y := w.moonY() + math.Sin(ang)*rr
			w.addLight(dst, int(math.Round(x)), int(math.Round(y)), moonInk, 0.35*m.spark)
		}
	}
}

func (w *World) renderNest(dst []byte) {
	n := &w.nest
	// a small woven bowl under the chicks
	c := barkDark
	x, y := n.x, n.y
	w.plot(dst, int(x)-3, int(y), c, 0.9)
	w.plot(dst, int(x)-2, int(y)+1, c, 0.9)
	w.plot(dst, int(x)-1, int(y)+1, c, 0.9)
	w.plot(dst, int(x), int(y)+2, c, 0.9)
	w.plot(dst, int(x)+1, int(y)+1, c, 0.9)
	w.plot(dst, int(x)+2, int(y)+1, c, 0.9)
	w.plot(dst, int(x)+3, int(y), c, 0.9)
	w.plot(dst, int(x)-2, int(y), barkLit, 0.4)
	w.plot(dst, int(x)+2, int(y), barkLit, 0.4)
	// the chick's head, when the nest has been held
	if n.peek > 0.05 {
		a := clamp01(n.peek)
		w.blob(dst, x, y-2, 2.6, birdBelly, a)
		w.plot(dst, int(x)-1, int(y)-3, birdEye, a)
		w.plot(dst, int(x)+2, int(y)-2, birdBeak, a)
	}
	if n.blink > 0 && n.blink < 0.2 {
		// a small blink: the nest is alive
		w.plot(dst, int(x)+2, int(y)-2, birdDark, 0.7)
	}
}

func (w *World) renderShooting(dst []byte) {
	s := &w.shooting
	if s.life <= 0 {
		return
	}
	a := clamp01(s.life / s.max)
	for k := 0; k < 7; k++ {
		x := s.x - s.vx*0.006*float64(k)
		y := s.y - s.vy*0.006*float64(k)
		w.plot(dst, int(math.Round(x)), int(math.Round(y)), starInk, a*(1-0.12*float64(k)))
	}
	w.addLight(dst, int(math.Round(s.x)), int(math.Round(s.y)), answerInk, 0.4*a)
}

func (w *World) renderGlyphs(dst []byte) {
	for i := range w.glyphs {
		g := &w.glyphs[i]
		a := clamp01(g.life / g.max)
		a = a * a
		x, y := int(math.Round(g.x)), int(math.Round(g.y))
		for k := 0; k < 4; k++ {
			w.plot(dst, x, y+k, noteInk, a*0.85)
		}
		w.plot(dst, x+1, y, noteInk, a*0.5)
		w.plot(dst, x+1, y+1, noteInk, a*0.35)
		w.blob(dst, float64(x)-1, float64(y)+5, 1.6, noteInk, a*0.85)
		w.addLight(dst, x-1, y+5, answerInk, a*0.25)
	}
}

/* --------------------------------------------------------------------- draw */

// Render paints the whole scene into an RGBA buffer of at least w*h*4 bytes.
func (w *World) Render(fb []byte) {
	if len(fb) < len(w.fb) {
		return
	}
	copy(fb, w.still)
	w.renderStars(fb)
	w.renderBranches(fb)
	w.renderFireflies(fb)
	w.renderLeaves(fb)
	w.renderNest(fb)
	w.renderBirds(fb)
	w.renderShooting(fb)
	w.renderGlyphs(fb)
	w.renderMoon(fb)
}

// Frame is the internal buffer, so the wasm layer can hand it to the browser
// without a copy of its own.
func (w *World) Frame() []byte { return w.fb }
