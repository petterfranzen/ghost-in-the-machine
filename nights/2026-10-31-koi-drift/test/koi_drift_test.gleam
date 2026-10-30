//// The pond is pure, so a whole minute of pond time can be stepped here without
//// a canvas. These are the things I would want to know at 3am: that a tap lands
//// as food, that the koi find it, that nothing escapes the pond or turns into a
//// NaN, and that the surface does not fill up with rings it forgot to remove.

import gleam/list
import gleeunit
import gleeunit/should
import koi_drift

pub fn main() {
  gleeunit.main()
}

const w: Float = 820.0
const h: Float = 1180.0
const step_seconds: Float = 0.01666667

fn run(pond: koi_drift.Pond, frames: Int) -> koi_drift.Pond {
  case frames {
    0 -> pond
    _ -> run(koi_drift.advance(pond, step_seconds, w, h), frames - 1)
  }
}

fn finite(x: Float) -> Bool {
  x *. 0.0 == 0.0 && x >. -100000.0 && x <. 100000.0
}

pub fn start_fills_the_pond_test() {
  let pond = koi_drift.start(w, h)
  list.length(pond.koi) |> should.equal(5)
  pond.fed |> should.equal(0)
  pond.eaten |> should.equal(0)
  pond
  |> should.not_equal(koi_drift.start(w, h -. 40.0))
}

pub fn a_tap_becomes_food_test() {
  let pond = koi_drift.start(w, h) |> koi_drift.feed(410.0, 600.0, w, h)
  list.length(pond.crumbs) |> should.equal(1)
  pond.fed |> should.equal(1)
  case pond.crumbs {
    [crumb, ..] -> {
      crumb.age |> should.equal(0.0)
      crumb.x |> should.equal(410.0)
    }
    [] -> should.fail()
  }
}

pub fn food_lands_inside_the_pond_test() {
  let pond = koi_drift.start(w, h) |> koi_drift.feed(-400.0, 9_999.0, w, h)
  case pond.crumbs {
    [crumb, ..] -> {
      crumb.x |> should.equal(14.0)
      crumb.y |> should.equal(h -. 14.0)
    }
    [] -> should.fail()
  }
}

pub fn food_is_found_test() {
  // Drop a crumb where a koi can see it, then give them a few seconds. Running
  // the whole pond is the only honest way to test the steering.
  let pond = koi_drift.start(w, h)
  let koi = case pond.koi {
    [k, ..] -> k
    [] -> panic as "no koi in the pond"
  }
  let pond =
    pond
    |> koi_drift.feed(koi.x +. 40.0, koi.y, w, h)
    |> run(360)
  should.be_true(pond.eaten >= 1)
  list.length(pond.crumbs) |> should.equal(0)
}

pub fn koi_stay_in_the_pond_test() {
  let pond = pond_stressed()
  list.each(pond.koi, fn(k) {
    should.be_true(k.x >=. 22.0)
    should.be_true(k.y >=. 22.0)
    should.be_true(k.x <=. w -. 22.0)
    should.be_true(k.y <=. h -. 22.0)
  })
}

pub fn nothing_becomes_a_nan_test() {
  let pond = pond_stressed()
  list.each(pond.koi, fn(k) {
    should.be_true(finite(k.x))
    should.be_true(finite(k.y))
    should.be_true(finite(k.heading))
    should.be_true(finite(k.speed))
    should.be_true(k.speed >=. 0.0)
  })
}

/// Half a minute of pond time with food dropped in the corners, which is the
/// nastiest thing a thumb can do to this scene.
fn pond_stressed() -> koi_drift.Pond {
  koi_drift.start(w, h)
  |> koi_drift.feed(4.0, 4.0, w, h)
  |> koi_drift.feed(w -. 4.0, h -. 4.0, w, h)
  |> koi_drift.feed(w *. 0.5, 4.0, w, h)
  |> run(1_800)
}

pub fn food_dissolves_eventually_test() {
  // A crumb no koi ever reaches should still leave the pond clean.
  let pond =
    koi_drift.start(w, h)
    |> koi_drift.feed(w *. 0.5, h *. 0.5, w, h)
    |> run(2_400)
  list.length(pond.crumbs) |> should.equal(0)
}

pub fn the_surface_settles_test() {
  // Rings must die; after a long still minute the pond holds only the faint
  // ambient ones, never an unbounded pile.
  let pond = run(koi_drift.start(w, h), 3_600)
  should.be_true(list.length(pond.rings) <= 8)
  list.each(pond.rings, fn(r) { should.be_true(r.age <. r.life) })
}

pub fn a_flood_of_taps_is_bounded_test() {
  let pond = list.fold(list.repeat(Nil, 200), koi_drift.start(w, h), fn(pond, _) {
    koi_drift.feed(pond, w *. 0.3, h *. 0.4, w, h)
  })
  pond.fed |> should.equal(200)
  should.be_true(list.length(pond.crumbs) <= 26)
  should.be_true(list.length(pond.rings) <= 56)
}
