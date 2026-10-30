import * as $float from "../gleam_stdlib/gleam/float.js";
import * as $int from "../gleam_stdlib/gleam/int.js";
import * as $list from "../gleam_stdlib/gleam/list.js";
import * as $option from "../gleam_stdlib/gleam/option.js";
import { Some, Option$None$const } from "../gleam_stdlib/gleam/option.js";
import {
  Ok,
  List$Empty$const as $List$Empty$const,
  prepend as listPrepend,
  CustomType as $CustomType,
  divideFloat,
} from "./gleam.js";
import * as $trig from "./trig.js";

export class Ring extends $CustomType {
  constructor(x, y, radius, age, life, strength) {
    super();
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.age = age;
    this.life = life;
    this.strength = strength;
  }
}
export const Ring$Ring = (x, y, radius, age, life, strength) =>
  new Ring(x, y, radius, age, life, strength);
export const Ring$isRing = (value) => value instanceof Ring;
export const Ring$Ring$x = (value) => value.x;
export const Ring$Ring$0 = (value) => value.x;
export const Ring$Ring$y = (value) => value.y;
export const Ring$Ring$1 = (value) => value.y;
export const Ring$Ring$radius = (value) => value.radius;
export const Ring$Ring$2 = (value) => value.radius;
export const Ring$Ring$age = (value) => value.age;
export const Ring$Ring$3 = (value) => value.age;
export const Ring$Ring$life = (value) => value.life;
export const Ring$Ring$4 = (value) => value.life;
export const Ring$Ring$strength = (value) => value.strength;
export const Ring$Ring$5 = (value) => value.strength;

export class Crumb extends $CustomType {
  constructor(x, y, age, kind) {
    super();
    this.x = x;
    this.y = y;
    this.age = age;
    this.kind = kind;
  }
}
export const Crumb$Crumb = (x, y, age, kind) => new Crumb(x, y, age, kind);
export const Crumb$isCrumb = (value) => value instanceof Crumb;
export const Crumb$Crumb$x = (value) => value.x;
export const Crumb$Crumb$0 = (value) => value.x;
export const Crumb$Crumb$y = (value) => value.y;
export const Crumb$Crumb$1 = (value) => value.y;
export const Crumb$Crumb$age = (value) => value.age;
export const Crumb$Crumb$2 = (value) => value.age;
export const Crumb$Crumb$kind = (value) => value.kind;
export const Crumb$Crumb$3 = (value) => value.kind;

export class Koi extends $CustomType {
  constructor(id, x, y, heading, speed, speed_target, phase, size, kind, nibble, gulp) {
    super();
    this.id = id;
    this.x = x;
    this.y = y;
    this.heading = heading;
    this.speed = speed;
    this.speed_target = speed_target;
    this.phase = phase;
    this.size = size;
    this.kind = kind;
    this.nibble = nibble;
    this.gulp = gulp;
  }
}
export const Koi$Koi = (id, x, y, heading, speed, speed_target, phase, size, kind, nibble, gulp) =>
  new Koi(id,
  x,
  y,
  heading,
  speed,
  speed_target,
  phase,
  size,
  kind,
  nibble,
  gulp);
export const Koi$isKoi = (value) => value instanceof Koi;
export const Koi$Koi$id = (value) => value.id;
export const Koi$Koi$0 = (value) => value.id;
export const Koi$Koi$x = (value) => value.x;
export const Koi$Koi$1 = (value) => value.x;
export const Koi$Koi$y = (value) => value.y;
export const Koi$Koi$2 = (value) => value.y;
export const Koi$Koi$heading = (value) => value.heading;
export const Koi$Koi$3 = (value) => value.heading;
export const Koi$Koi$speed = (value) => value.speed;
export const Koi$Koi$4 = (value) => value.speed;
export const Koi$Koi$speed_target = (value) => value.speed_target;
export const Koi$Koi$5 = (value) => value.speed_target;
export const Koi$Koi$phase = (value) => value.phase;
export const Koi$Koi$6 = (value) => value.phase;
export const Koi$Koi$size = (value) => value.size;
export const Koi$Koi$7 = (value) => value.size;
export const Koi$Koi$kind = (value) => value.kind;
export const Koi$Koi$8 = (value) => value.kind;
export const Koi$Koi$nibble = (value) => value.nibble;
export const Koi$Koi$9 = (value) => value.nibble;
export const Koi$Koi$gulp = (value) => value.gulp;
export const Koi$Koi$10 = (value) => value.gulp;

export class Pond extends $CustomType {
  constructor(koi, crumbs, rings, clock, slot, fed, eaten) {
    super();
    this.koi = koi;
    this.crumbs = crumbs;
    this.rings = rings;
    this.clock = clock;
    this.slot = slot;
    this.fed = fed;
    this.eaten = eaten;
  }
}
export const Pond$Pond = (koi, crumbs, rings, clock, slot, fed, eaten) =>
  new Pond(koi, crumbs, rings, clock, slot, fed, eaten);
export const Pond$isPond = (value) => value instanceof Pond;
export const Pond$Pond$koi = (value) => value.koi;
export const Pond$Pond$0 = (value) => value.koi;
export const Pond$Pond$crumbs = (value) => value.crumbs;
export const Pond$Pond$1 = (value) => value.crumbs;
export const Pond$Pond$rings = (value) => value.rings;
export const Pond$Pond$2 = (value) => value.rings;
export const Pond$Pond$clock = (value) => value.clock;
export const Pond$Pond$3 = (value) => value.clock;
export const Pond$Pond$slot = (value) => value.slot;
export const Pond$Pond$4 = (value) => value.slot;
export const Pond$Pond$fed = (value) => value.fed;
export const Pond$Pond$5 = (value) => value.fed;
export const Pond$Pond$eaten = (value) => value.eaten;
export const Pond$Pond$6 = (value) => value.eaten;

const tau = 6.283185307179586;

/**
 * How many koi live in the pond.
 */
export const koi_count = 5;

/**
 * A ring that never dies would be a leak; this caps the pond instead.
 * 
 * @ignore
 */
const ring_cap = 56;

/**
 * Room for a scatter of food, not a meal.
 * 
 * @ignore
 */
const crumb_cap = 26;

/**
 * A crumb floats for this long before it dissolves (seconds).
 */
export const crumb_life = 26.0;

/**
 * A tiny deterministic random in [0, 1), so the pond is the same pond every
 * time it starts and a test can predict it.
 * 
 * @ignore
 */
function prand(a, b) {
  let n = $trig.sin(($int.to_float(a) * 12.9898) + ($int.to_float(b) * 78.233)) * 43758.5453;
  return n - $float.floor(n);
}

/**
 * Angles, kept in (-pi, pi] so a heading never drifts off to infinity.
 * 
 * @ignore
 */
function wrap_angle(a) {
  let _block;
  let $ = a > 3.141592653589793;
  if ($) {
    _block = a - tau;
  } else {
    _block = a;
  }
  let a$1 = _block;
  let $1 = a$1 < -3.141592653589793;
  if ($1) {
    return a$1 + tau;
  } else {
    return a$1;
  }
}

function seed_koi(i, width, height) {
  let angle = ((divideFloat($int.to_float(i), $int.to_float(koi_count))) * tau) + (prand(
    i,
    1,
  ) * 0.7);
  let radius = 0.22 + (0.09 * prand(i, 2));
  let _block;
  let $ = $int.remainder(i, 3);
  if ($ instanceof Ok) {
    let k = $[0];
    _block = k;
  } else {
    _block = 0;
  }
  let kind = _block;
  return new Koi(
    i,
    width * (0.5 + (radius * $trig.cos(angle))),
    height * (0.5 + ((radius * 0.82) * $trig.sin(angle))),
    wrap_angle(angle + 1.5707963267948966),
    14.0 + (7.0 * prand(i, 3)),
    20.0 + (9.0 * prand(i, 5)),
    prand(i, 7) * tau,
    0.82 + (0.38 * prand(i, 9)),
    kind,
    0.0,
    0.0,
  );
}

/**
 * A pond with a handful of koi already in it, facing around a loose ring.
 */
export function start(width, height) {
  return new Pond(
    $list.map(
      listPrepend(
        0,
        listPrepend(
          1,
          listPrepend(2, listPrepend(3, listPrepend(4, $List$Empty$const))),
        ),
      ),
      (i) => { return seed_koi(i, width, height); },
    ),
    $List$Empty$const,
    listPrepend(
      new Ring(width * 0.5, height * 0.5, 8.0, 0.0, 4.5, 0.9),
      $List$Empty$const,
    ),
    0.0,
    0,
    0,
    0,
  );
}

/**
 * A tap: a crumb lands, and the surface answers with a ring.
 */
export function feed(pond, x, y, width, height) {
  let cx = $float.clamp(x, 14.0, $float.max(width - 14.0, 14.0));
  let cy = $float.clamp(y, 14.0, $float.max(height - 14.0, 14.0));
  return new Pond(
    pond.koi,
    $list.take(
      listPrepend(new Crumb(cx, cy, 0.0, pond.fed), pond.crumbs),
      crumb_cap,
    ),
    $list.take(
      listPrepend(new Ring(cx, cy, 5.0, 0.0, 3.4, 1.0), pond.rings),
      ring_cap,
    ),
    pond.clock,
    pond.slot,
    pond.fed + 1,
    pond.eaten,
  );
}

function rings_next(rings, extra, dt) {
  return $list.filter(
    $list.map(
      $list.append(rings, extra),
      (r) => {
        let left = $float.max(1.0 - (divideFloat(r.age, r.life)), 0.0);
        return new Ring(
          r.x,
          r.y,
          r.radius + (((10.0 + (58.0 * r.strength)) * left) * dt),
          r.age + dt,
          r.life,
          r.strength,
        );
      },
    ),
    (r) => { return r.age < r.life; },
  );
}

/**
 * How hard the pond pushes a koi back from an edge at position `p`.
 * 
 * @ignore
 */
function wall_push(p, size, margin) {
  let $ = p < margin;
  if ($) {
    return (margin - p) * 2.6;
  } else {
    let $1 = p > (size - margin);
    if ($1) {
      return (-1.0 * (margin - (size - p))) * 2.6;
    } else {
      return 0.0;
    }
  }
}

function nearest_crumb(crumbs, x, y) {
  let best = $list.fold(
    crumbs,
    Option$None$const,
    (best, c) => {
      let dx = c.x - x;
      let dy = c.y - y;
      let d = (dx * dx) + (dy * dy);
      if (best instanceof Some) {
        let bd = best[0][0];
        let $ = d < bd;
        if ($) {
          return new Some([d, c]);
        } else {
          return best;
        }
      } else {
        return new Some([d, c]);
      }
    },
  );
  if (best instanceof Some) {
    let c = best[0][1];
    return new Some(c);
  } else {
    return best;
  }
}

/**
 * One koi, one frame: steer, glide, beat the tail, settle the gulp.
 * 
 * @ignore
 */
function swim(k, crumbs, others, dt, width, height, clock) {
  let target = nearest_crumb(crumbs, k.x, k.y);
  let _block;
  if (target instanceof Some) {
    let c = target[0];
    _block = (c.x - k.x) * 1.6;
  } else {
    _block = ($trig.cos(k.heading) * 42.0) + ($trig.sin(
      (clock * 0.29) + k.phase,
    ) * 34.0);
  }
  let pull_x = _block;
  let _block$1;
  if (target instanceof Some) {
    let c = target[0];
    _block$1 = (c.y - k.y) * 1.6;
  } else {
    _block$1 = ($trig.sin(k.heading) * 42.0) + ($trig.cos(
      (clock * 0.23) + (k.phase * 1.7),
    ) * 34.0);
  }
  let pull_y = _block$1;
  let margin = 130.0;
  let push_x = wall_push(k.x, width, margin);
  let push_y = wall_push(k.y, height, margin);
  let sep = $list.fold(
    others,
    [0.0, 0.0],
    (acc, o) => {
      let $ = o.id === k.id;
      if ($) {
        return acc;
      } else {
        let dx = k.x - o.x;
        let dy = k.y - o.y;
        let d2 = (dx * dx) + (dy * dy);
        let $1 = d2 < 3600.0;
        if ($1) {
          let d2$1 = $float.max(d2, 90.0);
          return [
            acc[0] + ((divideFloat(dx, d2$1)) * 2600.0),
            acc[1] + ((divideFloat(dy, d2$1)) * 2600.0),
          ];
        } else {
          return acc;
        }
      }
    },
  );
  let want_x = (pull_x + push_x) + sep[0];
  let want_y = (pull_y + push_y) + sep[1];
  let _block$2;
  let $ = ((want_x * want_x) + (want_y * want_y)) < 0.01;
  if ($) {
    _block$2 = k.heading;
  } else {
    _block$2 = $trig.atan2(want_y, want_x);
  }
  let desired = _block$2;
  let error = wrap_angle(desired - k.heading);
  let _block$3;
  if (target instanceof Some) {
    _block$3 = 2.5;
  } else {
    _block$3 = 1.15;
  }
  let rate = _block$3;
  let turn = $float.clamp(error, (-1.0 * rate) * dt, rate * dt);
  let heading = wrap_angle(k.heading + turn);
  let glide = $float.clamp(
    1.0 - (((0.4 * $float.absolute_value(error))) / 3.14159),
    0.4,
    1.0,
  );
  let _block$4;
  let $1 = k.nibble > 0.0;
  if ($1) {
    _block$4 = 0.1;
  } else {
    _block$4 = 1.0;
  }
  let nibbling = _block$4;
  let wanted_speed = (k.speed_target * glide) * nibbling;
  let speed = k.speed + ((wanted_speed - k.speed) * $float.min(1.0, 3.2 * dt));
  let x = $float.clamp(
    k.x + (($trig.cos(heading) * speed) * dt),
    22.0,
    $float.max(width - 22.0, 22.0),
  );
  let y = $float.clamp(
    k.y + (($trig.sin(heading) * speed) * dt),
    22.0,
    $float.max(height - 22.0, 22.0),
  );
  return new Koi(
    k.id,
    x,
    y,
    heading,
    speed,
    k.speed_target,
    wrap_angle(k.phase + (dt * (2.2 + (speed / 26.0)))),
    k.size,
    k.kind,
    $float.max(0.0, k.nibble - dt),
    $float.max(0.0, k.gulp - (dt * 1.5)),
  );
}

/**
 * One frame: `dt` seconds of pond time.
 */
export function advance(pond, dt, width, height) {
  let clock = pond.clock + dt;
  let crumbs = $list.map(
    pond.crumbs,
    (c) => { return new Crumb(c.x, c.y, c.age + dt, c.kind); },
  );
  let swimming = $list.map(
    pond.koi,
    (k) => { return swim(k, crumbs, pond.koi, dt, width, height, clock); },
  );
  let reach = (k) => { return 15.0 + (6.5 * k.size); };
  let near = (k, c) => {
    let dx = c.x - k.x;
    let dy = c.y - k.y;
    let r = reach(k);
    return ((dx * dx) + (dy * dy)) < (r * r);
  };
  let koi = $list.map(
    swimming,
    (k) => {
      let $ = $list.any(crumbs, (c) => { return near(k, c); });
      if ($) {
        return new Koi(
          k.id,
          k.x,
          k.y,
          k.heading,
          k.speed,
          k.speed_target,
          k.phase,
          k.size,
          k.kind,
          0.5,
          1.0,
        );
      } else {
        return k;
      }
    },
  );
  let taken = $list.filter(
    crumbs,
    (c) => { return $list.any(koi, (k) => { return near(k, c); }); },
  );
  let leftovers = $list.filter(
    crumbs,
    (c) => {
      return !$list.any(koi, (k) => { return near(k, c); }) && (c.age < crumb_life);
    },
  );
  let slot = $float.truncate(clock / 6.5);
  let _block;
  let $ = slot > pond.slot;
  if ($) {
    _block = listPrepend(
      new Ring(
        width * (0.12 + (0.76 * prand(slot, 11))),
        height * (0.12 + (0.76 * prand(slot, 13))),
        2.0,
        0.0,
        5.0,
        0.32,
      ),
      $List$Empty$const,
    );
  } else {
    _block = $List$Empty$const;
  }
  let ambient = _block;
  let rings = $list.take(
    $list.append(
      $list.map(
        taken,
        (c) => { return new Ring(c.x, c.y, 3.0, 0.0, 2.6, 0.85); },
      ),
      rings_next(pond.rings, ambient, dt),
    ),
    ring_cap,
  );
  return new Pond(
    koi,
    leftovers,
    rings,
    clock,
    slot,
    pond.fed,
    pond.eaten + $list.length(taken),
  );
}
