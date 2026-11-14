// Command preview paints the tree into a PNG, with no browser anywhere. It is
// how the scene was drawn in the first place: a frame at a time, on a screen
// big enough to see the pixels.
//
//	go run ./cmd/preview -out /tmp/still.png
//	go run ./cmd/preview -out /tmp/tapped.png -frames 26 -tap 40,150 -tap 110,120
package main

import (
	"flag"
	"fmt"
	"image"
	"image/png"
	"os"
	"strconv"
	"strings"

	"songbranch/world"
)

type point struct{ x, y float64 }

func main() {
	out := flag.String("out", "preview.png", "where to write the PNG")
	frames := flag.Int("frames", 1, "how many 1/60 s frames to run first")
	motion := flag.Float64("motion", 1, "motion scale, 1 normally")
	scale := flag.Int("scale", 3, "pixel scale in the PNG")
	width := flag.Int("w", 0, "frame width (default: the art's 176)")
	height := flag.Int("h", 0, "frame height (default: the art's 312)")
	var taps stringList
	flag.Var(&taps, "tap", "x,y to tap on frame 2 (repeatable)")
	flag.Parse()

	tree := world.New()
	if *width > 0 && *height > 0 {
		tree = world.NewView(*width, *height)
	}
	tree.SetMotion(*motion)
	for _, t := range taps {
		p, err := parsePoint(t)
		if err != nil {
			fmt.Fprintln(os.Stderr, "bad -tap:", err)
			os.Exit(2)
		}
		_ = p
	}
	for f := 0; f < *frames; f++ {
		if f == 1 {
			for _, t := range taps {
				p, _ := parsePoint(t)
				kind := tree.Tap(p.x, p.y)
				fmt.Printf("tap %v -> event %d\n", p, kind)
			}
		}
		tree.Step(1.0 / 60)
	}
	fb := tree.Frame()
	tree.Render(fb)

	w, h := tree.ViewW(), tree.ViewH()
	img := image.NewRGBA(image.Rect(0, 0, w**scale, h**scale))
	for y := 0; y < h**scale; y++ {
		for x := 0; x < w**scale; x++ {
			si := ((y / *scale) * w * 4) + (x / *scale * 4)
			di := (y*img.Stride + x*4)
			img.Pix[di] = fb[si]
			img.Pix[di+1] = fb[si+1]
			img.Pix[di+2] = fb[si+2]
			img.Pix[di+3] = 255
		}
	}
	f, err := os.Create(*out)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	defer f.Close()
	if err := png.Encode(f, img); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Printf("%s: %dx%d, sway %.3f, notes %d\n", *out, w**scale, h**scale, tree.Sway(), tree.Notes())
}

type stringList []string

func (s *stringList) String() string { return strings.Join(*s, ";") }
func (s *stringList) Set(v string) error {
	*s = append(*s, v)
	return nil
}

func parsePoint(s string) (point, error) {
	parts := strings.Split(s, ",")
	if len(parts) != 2 {
		return point{}, fmt.Errorf("%q is not x,y", s)
	}
	x, err := strconv.ParseFloat(strings.TrimSpace(parts[0]), 64)
	if err != nil {
		return point{}, err
	}
	y, err := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
	if err != nil {
		return point{}, err
	}
	return point{x, y}, nil
}
