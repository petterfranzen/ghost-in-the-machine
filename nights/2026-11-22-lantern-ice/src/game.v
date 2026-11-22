// Lantern Ice — the whole game: the bay's levels, the slide rules, lighting
// lanterns, thin ice, undo, and what the keeper does when you stop playing.
//
// Drawing, input and sound live in the JS host around this file. game.v calls
// a small set of `JS.lake_*` functions and the host calls back through `main__*`
// ones (see the README's "How it was built").
module main

// ---- the host bridge --------------------------------------------------------

fn JS.lake_ready()

fn JS.lake_grid(w int, h int)

fn JS.lake_tile(kind int, x int, y int)

fn JS.lake_actor(x f64, y f64, face int, mode int)

fn JS.lake_hud(id int, value int)

fn JS.lake_hint(text string)

fn JS.lake_skid(x int, y int)

fn JS.lake_crack(x int, y int, n int)

fn JS.lake_break(x int, y int)

fn JS.lake_splash(x int, y int)

fn JS.lake_light(x int, y int, note int)

fn JS.lake_stop(x int, y int)

fn JS.lake_flick(x int, y int)

fn JS.lake_scuff(x int, y int)

fn JS.lake_rare(kind int)

fn JS.lake_sound(id int, a int)

// ---- the world --------------------------------------------------------------

const k_ice = 0
const k_rock = 1
const k_snow = 2
const k_thin = 3
const k_water = 4
const k_lantern = 5
const k_block = 6
const k_frozen = 7 // open water a block has frozen into a bridge

const anim_len = 0.30 // seconds a skid takes to draw
const warm_len = 2.0 // seconds of holding before thin ice frays over
const idle_sit = 9.0 // seconds of stillness before the keeper sits down
const idle_rare = 38.0 // seconds before the lake shows you something rare
const fall_len = 0.6 // seconds of the ice closing over
const win_len = 2.2 // seconds of the bay glowing before the next level
const crack_limit = 2 // crossings a thin tile holds before it opens

struct Vec {
	x int
	y int
}

// A position in tiles, fractional, for the host to draw between: the game
// hands over a smooth spot, not a rounded one.
struct VecF {
	x f64
	y f64
}

struct Board {
mut:
	w       int
	h       int
	start   Vec
	rock    []bool
	snow    []bool
	thin    []bool
	lantern []bool
	blocks  []Vec
	open0   []bool
	hint    string
	free    bool
}

struct Room {
mut:
	crack  []u8
	open   []bool
	filled []bool
	lit    []bool
	blocks []Vec
}

struct Shot {
	pos    Vec
	crack  []u8
	open   []bool
	lit    []bool
	blocks []Vec
}

struct Game {
mut:
	idx        int
	board      Board
	room       Room
	pos        Vec
	from       Vec
	face       int
	busy       f64
	fall_wait  f64
	win_wait   f64
	warm       f64
	idle       f64
	dirty      bool
	won        bool
	sitting    bool
	rare_shown bool
	history    []Shot
	grid_w     int
	grid_h     int
	shown      []int
}

__global (
	lake Game
)

// ---- level data -------------------------------------------------------------
//
// One string per row. '.' frozen ice, '#' rock, 's' deep snow, 'x' thin ice,
// 'o' lantern, 'b' a loose ice block, '@' where the keeper starts.

struct Level {
	layout []string
	hint   string
	free   bool
}

fn levels() []Level {
	mut out := []Level{}
	out << Level{
		layout: [
			'.........',
			'.........',
			'.........',
			'.........',
			'.........',
			'.@...o...',
			'.........',
			'.........',
			'.........',
			'.........',
		]
		hint: 'Swipe anywhere, or tap an arrow: the keeper skates until something stops them.'
	}
	out << Level{
		layout: [
			'.........',
			'.@..#....',
			'.........',
			'.........',
			'.........',
			'.........',
			'.........',
			'.......o.',
			'...#.....',
			'.........',
		]
		hint: 'Rocks stop a skid. So does a lantern.'
	}
	out << Level{
		layout: [
			'.......#.',
			'.@.......',
			'..o......',
			'.#.......',
			'.........',
			'.........',
			'.........',
			'.........',
			'......o..',
			'.........',
		]
		hint: 'Light every lantern in the bay. Two, this time.'
	}
	out << Level{
		layout: [
			'.........',
			'.@.......',
			'.........',
			'.........',
			'.........',
			'.........',
			'.....#...',
			'.....o...',
			'.....#..s',
			'.........',
		]
		hint: 'Deep snow stops you just as well, and stops you softer.'
	}
	out << Level{
		layout: [
			'......#..',
			'.@.......',
			'.........',
			'.........',
			'.........',
			'..oxx....',
			'.....#...',
			'.........',
			'.........',
			'.........',
		]
		hint: 'Thin ice holds one crossing. The second opens it.'
	}
	out << Level{
		layout: [
			'.....#...',
			'.....#...',
			'.@...#...',
			'.....#...',
			'.....#...',
			'.o...x.o.',
			'.....#...',
			'.....#...',
			'.....#...',
			'o....#...',
		]
		hint: 'Thin ice can be warmed: hold still and the keeper\'s lantern frays the ice around them over.'
	}
	out << Level{
		layout: [
			'.......#.',
			'.@..b~.o#',
			'.......#.',
			'.........',
			'.........',
			'.........',
			'.........',
			'.........',
			'.........',
			'.........',
		]
		hint: 'A block shoved into open water freezes into ice you can skate across.'
	}
	out << Level{
		layout: [
			'#........',
			'..xxo#...',
			'.........',
			'........b',
			'.........',
			'.@.......',
			'........~',
			'.........',
			'.......#o',
			'........#',
		]
		hint: 'Two lanterns, thin ice and a block to shove. Take your time.'
	}
	out << Level{
		layout: [
			'.........',
			'.........',
			'.........',
			'.........',
			'.........',
			'....@....',
			'.........',
			'.........',
			'.........',
			'.........',
		]
		hint: 'The bay is lit. Skate where you like.'
		free: true
	}
	return out
}

// ---- parsing ----------------------------------------------------------------

fn parse_board(l Level) Board {
	mut b := Board{
		hint: l.hint
		free: l.free
		h: l.layout.len
		w: l.layout[0].len
	}
	n := b.w * b.h
	b.rock = []bool{len: n, init: false}
	b.snow = []bool{len: n, init: false}
	b.thin = []bool{len: n, init: false}
	b.lantern = []bool{len: n, init: false}
	b.open0 = []bool{len: n, init: false}
	b.blocks = []Vec{}
	for y in 0 .. b.h {
		for x in 0 .. b.w {
			c := l.layout[y][x]
			i := y * b.w + x
			b.rock[i] = c == `#`
			b.snow[i] = c == `s`
			b.thin[i] = c == `x`
			b.lantern[i] = c == `o`
			b.open0[i] = c == `~`
			// The spot is worked out from i, not from the loop counters: V's JS
			// backend stores those by reference, so a Vec built from x and y
			// would keep moving with the loop.
			if c == `b` {
				b.blocks << Vec{i % b.w, i / b.w}
			}
			if c == `@` {
				b.start = Vec{i % b.w, i / b.w}
			}
		}
	}
	return b
}

fn fresh_room(b Board) Room {
	n := b.w * b.h
	return Room{
		crack: []u8{len: n, init: 0}
		open: b.open0.clone()
		filled: []bool{len: n, init: false}
		lit: []bool{len: n, init: false}
		blocks: b.blocks.clone()
	}
}

fn dist_m(a int, b int) int {
	if a > b {
		return a - b
	}
	return b - a
}

fn (g &Game) store() Shot {
	return Shot{
		pos: g.pos
		crack: g.room.crack.clone()
		open: g.room.open.clone()
		lit: g.room.lit.clone()
		blocks: g.room.blocks.clone()
	}
}

fn (mut g Game) restore(s Shot) {
	g.pos = s.pos
	g.room.crack = s.crack
	g.room.open = s.open
	g.room.lit = s.lit
	g.room.blocks = s.blocks
	g.dirty = true
}

// ---- helpers ----------------------------------------------------------------

fn (g &Game) index(x int, y int) int {
	return y * g.board.w + x
}

fn (g &Game) inside(x int, y int) bool {
	return x >= 0 && y >= 0 && x < g.board.w && y < g.board.h
}

fn (g &Game) lantern_at(x int, y int) bool {
	return g.inside(x, y) && g.board.lantern[g.index(x, y)]
}

fn (g &Game) block_at(x int, y int) int {
	for bi, b in g.room.blocks {
		if b.x == x && b.y == y {
			return bi
		}
	}
	return -1
}

fn (g &Game) kind_at(x int, y int) int {
	if !g.inside(x, y) {
		return k_rock
	}
	i := g.index(x, y)
	if g.board.lantern[i] {
		return k_lantern
	}
	if g.block_at(x, y) >= 0 {
		return k_block
	}
	if g.room.filled[i] {
		return k_frozen
	}
	if g.room.open[i] {
		return k_water
	}
	if g.board.rock[i] {
		return k_rock
	}
	if g.board.snow[i] {
		return k_snow
	}
	if g.board.thin[i] {
		return k_thin
	}
	return k_ice
}

fn (g &Game) steps_from(x int, y int, dir int) Vec {
	if dir == 0 {
		return Vec{x, y - 1}
	}
	if dir == 1 {
		return Vec{x + 1, y}
	}
	if dir == 2 {
		return Vec{x, y + 1}
	}
	return Vec{x - 1, y}
}

fn (g &Game) lit_count() int {
	mut n := 0
	for i, on in g.room.lit {
		if on && g.board.lantern[i] {
			n++
		}
	}
	return n
}

fn (g &Game) lantern_count() int {
	mut n := 0
	for l in g.board.lantern {
		if l {
			n++
		}
	}
	return n
}

// ---- the slide --------------------------------------------------------------

// Thin ice cracks as it is crossed, and opens on the crossing that reaches the
// limit. Returns false when it opens under the keeper.
fn (mut g Game) cross(x int, y int) bool {
	i := g.index(x, y)
	if !g.board.thin[i] {
		return true
	}
	c := g.room.crack[i] + 1
	g.room.crack[i] = c
	if c >= crack_limit {
		g.room.open[i] = true
		g.dirty = true
		JS.lake_break(x, y)
		return false
	}
	g.dirty = true
	JS.lake_crack(x, y, int(c))
	return true
}

// A pushed block slides until it stops, and plugs the first open water it
// meets, which freezes into a bridge.
fn (mut g Game) slide_block(bi int, dir int) {
	mut b := g.room.blocks[bi]
	for {
		n := g.steps_from(b.x, b.y, dir)
		if !g.inside(n.x, n.y) {
			break
		}
		i := g.index(n.x, n.y)
		if g.lantern_at(n.x, n.y) || g.block_at(n.x, n.y) >= 0 {
			break
		}
		if g.board.rock[i] || g.board.snow[i] {
			break
		}
		if g.room.open[i] {
			g.room.open[i] = false
			g.room.filled[i] = true
			JS.lake_sound(7, 0)
			g.room.blocks.delete(bi)
			g.dirty = true
			return
		}
		b = n
	}
	g.room.blocks[bi] = b
	g.dirty = true
}

fn (mut g Game) light_here(x int, y int) {
	i := g.index(x, y)
	if g.room.lit[i] {
		return
	}
	g.room.lit[i] = true
	g.dirty = true
	JS.lake_light(x, y, g.lit_count())
}

// The keeper stops before rock and deep snow, lands on lanterns, and falls into
// open water. Returns false when the ice closed over them.
fn (mut g Game) walk(dir int) bool {
	mut cur := g.pos
	mut pushed := false
	for {
		step := g.steps_from(cur.x, cur.y, dir)
		if !g.inside(step.x, step.y) {
			break // the shore
		}
		k := g.kind_at(step.x, step.y)
		if k == k_rock || k == k_snow {
			break
		}
		if k == k_block {
			if pushed {
				break
			}
			pushed = true
			JS.lake_sound(2, 0)
			g.slide_block(g.block_at(step.x, step.y), dir)
			continue
		}
		cur = step
		if k == k_lantern {
			g.light_here(step.x, step.y)
			break
		}
		if k == k_water {
			g.pos = cur
			JS.lake_splash(step.x, step.y)
			return false
		}
		if !g.cross(step.x, step.y) {
			g.pos = cur
			JS.lake_splash(step.x, step.y)
			return false
		}
	}
	g.pos = cur
	JS.lake_stop(cur.x, cur.y)
	return true
}

// ---- moving between levels --------------------------------------------------

fn (mut g Game) load_level(i int) {
	// Set here, not in boot(): V inlines a small caller and drops these.
	g.shown = []int{len: 8, init: -1} // nothing pushed to the host yet
	ls := levels()
	l := ls[i]
	g.idx = i
	g.board = parse_board(l)
	g.room = fresh_room(g.board)
	g.pos = g.board.start
	g.from = g.board.start
	g.face = 2
	g.busy = 0
	g.fall_wait = 0
	g.win_wait = 0
	g.warm = 0
	g.won = false
	g.idle = 0
	g.sitting = false
	g.rare_shown = false
	g.history = []Shot{}
	g.dirty = true
	JS.lake_hint(l.hint)
}

// The keeper stands up where they fell: the bay keeps its lights, and only the
// ice they had cracked mends.
fn (mut g Game) retry() {
	lit := g.room.lit.clone()
	g.room = fresh_room(g.board)
	g.room.lit = lit
	g.pos = g.board.start
	g.from = g.board.start
	g.busy = 0
	g.dirty = true
}

fn (mut g Game) advance() {
	if g.idx + 1 < levels().len {
		g.load_level(g.idx + 1)
	}
}

// ---- the player -------------------------------------------------------------

pub fn move(dir int) {
	mut g := &lake
	if g.won || g.busy > 0 || g.fall_wait > 0 {
		return
	}
	g.idle = 0
	g.sitting = false
	g.face = dir
	g.from = g.pos
	prev := g.pos
	snap := g.store()
	ok := g.walk(dir)
	if g.pos.x == prev.x && g.pos.y == prev.y && ok {
		return // nothing moved: the rock was already against them
	}
	g.history << snap
	if ok {
		g.busy = anim_len
		g.warm = 0
		JS.lake_sound(0, dir)
		for x in 0 .. g.board.w {
			for y in 0 .. g.board.h {
				if g.crossed_now(prev, x, y, dir) {
					JS.lake_skid(x, y)
				}
			}
		}
	} else {
		g.busy = 0
		g.fall_wait = fall_len
	}
	g.dirty = true
	g.check_win()
}

// A tile the keeper skated over on this move: it lies between where they stood
// and where they stopped, in the direction of the skid.
fn (g &Game) crossed_now(prev Vec, x int, y int, dir int) bool {
	if dir == 0 || dir == 2 {
		if x != g.pos.x || x != prev.x {
			return false
		}
		return between(y, prev.y, g.pos.y)
	}
	if y != g.pos.y || y != prev.y {
		return false
	}
	return between(x, prev.x, g.pos.x)
}

fn between(v int, a int, b int) bool {
	lo := if a < b { a } else { b }
	hi := if a < b { b } else { a }
	return v > lo && v <= hi
}

fn (mut g Game) check_win() {
	if g.won || g.board.free {
		return
	}
	total := g.lantern_count()
	if total > 0 && g.lit_count() >= total {
		g.won = true
		g.win_wait = win_len
		JS.lake_sound(8, 0)
	}
}

pub fn undo() {
	mut g := &lake
	if g.history.len == 0 || g.busy > 0 || g.won {
		return
	}
	snap := g.history[g.history.len - 1]
	g.history.delete_last()
	g.restore(snap)
	g.from = snap.pos
	g.idle = 0
	g.sitting = false
	JS.lake_scuff(g.pos.x, g.pos.y)
	g.dirty = true
}

pub fn restart() {
	mut g := &lake
	if g.busy > 0 {
		return
	}
	lit := g.room.lit.clone()
	g.room = fresh_room(g.board)
	g.room.lit = lit
	g.pos = g.board.start
	g.from = g.board.start
	g.history = []Shot{}
	g.won = false
	g.win_wait = 0
	g.dirty = true
	JS.lake_scuff(g.pos.x, g.pos.y)
}

// A tap on the bay: a lit lantern answers, bare ice takes a soft knock.
pub fn tap(x int, y int) {
	mut g := &lake
	if !g.inside(x, y) {
		return
	}
	g.idle = 0
	g.sitting = false
	i := g.index(x, y)
	if g.board.lantern[i] && g.room.lit[i] {
		JS.lake_flick(x, y)
		JS.lake_sound(5, x * 3 + y)
		return
	}
	if g.room.open[i] {
		JS.lake_sound(6, 0)
		return
	}
	JS.lake_scuff(x, y)
	JS.lake_sound(6, 0)
}

// Held down: the keeper crouches and their lantern warms the ice underfoot,
// fraying the cracks out of the nearest thin tile.
pub fn press(on int) {
	mut g := &lake
	g.idle = 0
	g.sitting = false
	if on == 0 {
		g.warm = 0
		return
	}
	if g.warm <= 0 {
		g.warm = 0.01 // the lantern comes up: the ice starts to warm
	}
}

fn (mut g Game) warm_step() {
	if g.warm < warm_len {
		return
	}
	g.warm = warm_len * 0.5
	if g.mend_patch() == 0 {
		return
	}
	JS.lake_sound(4, 0)
}

// The keeper's lantern warms the ice around them: every cracked thin tile
// within two tiles frays a little way back over. Returns how many it mended.
fn (mut g Game) mend_patch() int {
	mut fixed := 0
	for y in 0 .. g.board.h {
		for x in 0 .. g.board.w {
			i := g.index(x, y)
			if !g.board.thin[i] || g.room.crack[i] == 0 || g.room.open[i] {
				continue
			}
			if dist_m(x, g.pos.x) + dist_m(y, g.pos.y) > 2 {
				continue
			}
			g.room.crack[i] = g.room.crack[i] - 1
			fixed++
			g.dirty = true
			JS.lake_crack(x, y, int(g.room.crack[i]))
		}
	}
	return fixed
}

// ---- each frame -------------------------------------------------------------

pub fn frame(dt f64) {
	mut g := &lake
	if g.busy > 0 {
		g.busy = g.busy - dt
		if g.busy < 0 {
			g.busy = 0
		}
	}
	if g.fall_wait > 0 {
		g.fall_wait = g.fall_wait - dt
		if g.fall_wait <= 0 {
			g.retry()
		}
	}
	if g.win_wait > 0 {
		g.win_wait = g.win_wait - dt
		if g.win_wait <= 0 {
			g.advance()
		}
	}
	if g.warm > 0 {
		g.warm = g.warm + dt
		g.warm_step()
	}
	g.idle = g.idle + dt
	if g.idle > idle_sit {
		g.sitting = true
	}
	if g.idle > idle_rare && !g.rare_shown {
		g.rare_shown = true
		JS.lake_rare(g.idx)
	}
	g.push_scene()
}

fn (mut g Game) push_hud(id int, value int) {
	if g.shown[id] == value {
		return
	}
	g.shown[id] = value
	JS.lake_hud(id, value)
}

fn (mut g Game) push_scene() {
	if g.grid_w != g.board.w || g.grid_h != g.board.h {
		g.grid_w = g.board.w
		g.grid_h = g.board.h
		JS.lake_grid(g.board.w, g.board.h)
	}
	if g.dirty {
		for y in 0 .. g.board.h {
			for x in 0 .. g.board.w {
				JS.lake_tile(g.kind_at(x, y), x, y)
			}
		}
		g.dirty = false
	}
	// The last record in the table is the free skate, not a level: keep the
	// number on the pips honest even when the bay is already ours.
	last := levels().len - 1
	g.push_hud(0, if g.idx + 1 > last { last } else { g.idx + 1 })
	g.push_hud(1, last)
	g.push_hud(2, g.lit_count())
	g.push_hud(3, if g.board.free { 0 } else { g.lantern_count() })
	g.push_hud(4, if g.won { 1 } else { 0 })
	g.push_hud(5, if g.board.free { 1 } else { 0 })
	g.push_hud(6, if g.fall_wait > 0 { 1 } else { 0 })
	t := if g.warm > 0 { g.warm / warm_len } else { 0.0 }
	g.push_hud(7, int(t * 100.0))
	mode := g.actor_mode()
	v := g.visual()
	JS.lake_actor(v.x, v.y, g.face, mode)
}

fn (g &Game) actor_mode() int {
	if g.fall_wait > 0 {
		return 3
	}
	if g.busy > 0 {
		return 1
	}
	if g.warm > 0 {
		return 4
	}
	if g.sitting {
		return 2
	}
	return 0
}

// Where to draw the keeper: partway along the skid they are in the middle of.
fn (g &Game) visual() VecF {
	if g.busy <= 0 {
		return VecF{f64(g.pos.x), f64(g.pos.y)}
	}
	t := 1.0 - g.busy / anim_len
	e := t * t * (3.0 - 2.0 * t)
	dx := f64(g.pos.x - g.from.x)
	dy := f64(g.pos.y - g.from.y)
	return VecF{f64(g.from.x) + dx * e, f64(g.from.y) + dy * e}
}

pub fn boot() {
	mut g := &lake
	g.grid_w = -1
	g.grid_h = -1
	g.load_level(0)
	JS.lake_ready()
	g.push_scene()
}
