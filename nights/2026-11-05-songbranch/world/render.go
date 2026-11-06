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
	if x < 0 || y < 0 || x >= W || y >= H {
		return
	}
	a = clamp01(a)
	if a <= 0 {
		return
	}
	d := (y*W + x) * 4
	if d+3 >= len(dst) {
		return
	}
	dst[d] = uint8(float64(dst[d])*(1-a) + c.R*255*a + 0.5)
	dst[d+1] = uint8(float64(dst[d+1])*(1-a) + c.G*255*a + 0.5)
	dst[d+2] = uint8(float64(dst[d+2])*(1-a) + c.B*255*a + 0.5)
	dst[d+3] = 255
}

// addLight adds warmth instead of covering: a bird that has just sung, and
// the note leaving its beak, glow rather than paint over the branches.
func (w *World) addLight(dst []byte, x, y int, c RGB, a float64) {
	if x < 0 || y < 0 || x >= W || y >= H {
		return
	}
	a = clamp01(a)
	if a <= 0 {
		return
	}
	d := (y*W + x) * 4
	if d+3 >= len(dst) {
		return
	}
	for i, v := range [3]float64{c.R, c.G, c.B} {
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
		x0, y0 := b.point(0, w.give.pos)
		x1, y1 := b.point(1, w.give.pos)
		// sample the branch the same way the hit test does, so what you see
		// is what your thumb can hit
		steps := 10
		px, py := x0, y0
		for s := 1; s <= steps; s++ {
			t := float64(s) / float64(steps)
			cx, cy := b.point(t, w.give.pos)
			w.limb(dst, px, py, cx, cy, b.w0+(b.w1-b.w0)*(t-1/float64(steps)), b.w0+(b.w1-b.w0)*t, barkMid)
			px, py = cx, cy
		}
		// a twig or two, so the ends do not read as a fork
		twx, twy := b.point(0.62, w.give.pos)
		w.limb(dst, twx, twy, twx-7*(1)-2, twy-9, 1.4, 0.7, barkMid)
		_ = x0
		_ = y0
		_ = x1
		_ = y1
	}
	for ci := range w.clusters {
		c := &w.clusters[ci]
		b := &w.branches[c.br]
		dx := int(math.Round(b.sway.pos + c.sway.pos))
		dy := int(math.Round(w.give.pos*0.6 + c.sway.pos*0.35))
		for _, p := range c.px {
			col := leaves[p.tone]
			a := 1.0
			// the western sky catches the crown of each cluster
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
		if b.flying {
			if int(b.hopT/b.hopDur*10)%2 == 0 {
				frame = birdFlap
			}
		} else if b.shuf > 0.45 {
			frame = birdFlap
		}
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
				a := 1.0
				if b.sing > 0.2 && line[col] == 'k' {
					c = c.toward(moonInk, 0.4) // the beak opens mid-note
				}
				w.plot(dst, px, py, c, a)
				if b.glow > 0.2 {
					w.addLight(dst, px, py, answerInk, 0.12*b.glow)
				}
			}
		}
	}
}

func (w *World) renderFeathers(dst []byte) {
	for i := range w.feathers {
		f := &w.feathers[i]
		a := clamp01(f.life / f.max)
		c := featherInk
		x, y := int(math.Round(f.x)), int(math.Round(f.y))
		w.plot(dst, x, y, c, a*0.9)
		w.plot(dst, x+1, y, c, a*0.55)
		if math.Mod(f.spin+f.life*2, 2) < 1 {
			w.plot(dst, x, y+1, c, a*0.4)
		}
	}
}

func (w *World) renderGlyphs(dst []byte) {
	for i := range w.glyphs {
		g := &w.glyphs[i]
		a := clamp01(g.life / g.max)
		a = a * a
		x, y := int(math.Round(g.x)), int(math.Round(g.y))
		// a little quaver: a stem, a flag, a head
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

// Render paints the whole scene into an RGBA buffer of at least W*H*4 bytes.
func (w *World) Render(fb []byte) {
	if len(fb) < len(w.fb) {
		return
	}
	copy(fb, w.still)
	w.renderStars(fb)
	w.renderBranches(fb)
	w.renderBirds(fb)
	w.renderFeathers(fb)
	w.renderGlyphs(fb)
}

// Frame is the internal buffer, so the wasm layer can hand it to the browser
// without a copy of its own.
func (w *World) Frame() []byte { return w.fb }
