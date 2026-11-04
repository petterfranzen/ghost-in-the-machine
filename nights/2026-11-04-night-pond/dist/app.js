(() => {
  // node_modules/rescript/lib/es6/js_dict.js
  function fromArray(entries) {
    var dict = {};
    var l = entries.length;
    for (var i = 0; i < l; ++i) {
      var match = entries[i];
      dict[match[0]] = match[1];
    }
    return dict;
  }

  // node_modules/rescript/lib/es6/caml.js
  function int_compare(x, y) {
    if (x < y) {
      return -1;
    } else if (x === y) {
      return 0;
    } else {
      return 1;
    }
  }
  function bool_compare(x, y) {
    if (x) {
      if (y) {
        return 0;
      } else {
        return 1;
      }
    } else if (y) {
      return -1;
    } else {
      return 0;
    }
  }
  function float_compare(x, y) {
    if (x === y) {
      return 0;
    } else if (x < y) {
      return -1;
    } else if (x > y || x === x) {
      return 1;
    } else if (y === y) {
      return -1;
    } else {
      return 0;
    }
  }
  function string_compare(s1, s2) {
    if (s1 === s2) {
      return 0;
    } else if (s1 < s2) {
      return -1;
    } else {
      return 1;
    }
  }

  // node_modules/rescript/lib/es6/caml_obj.js
  var for_in = (function(o, foo) {
    for (var x in o) {
      foo(x);
    }
  });
  function compare(a, b) {
    if (a === b) {
      return 0;
    }
    var a_type = typeof a;
    var b_type = typeof b;
    switch (a_type) {
      case "bigint":
        if (b_type === "bigint") {
          return float_compare(a, b);
        }
        break;
      case "boolean":
        if (b_type === "boolean") {
          return bool_compare(a, b);
        }
        break;
      case "function":
        if (b_type === "function") {
          throw {
            RE_EXN_ID: "Invalid_argument",
            _1: "compare: functional value",
            Error: new Error()
          };
        }
        break;
      case "number":
        if (b_type === "number") {
          return float_compare(a, b);
        }
        break;
      case "string":
        if (b_type === "string") {
          return string_compare(a, b);
        } else {
          return 1;
        }
      case "undefined":
        return -1;
      default:
    }
    switch (b_type) {
      case "string":
        return -1;
      case "undefined":
        return 1;
      default:
        if (a_type === "boolean") {
          return 1;
        }
        if (b_type === "boolean") {
          return -1;
        }
        if (a_type === "function") {
          return 1;
        }
        if (b_type === "function") {
          return -1;
        }
        if (a_type === "number") {
          if (b === null || b.BS_PRIVATE_NESTED_SOME_NONE !== void 0) {
            return 1;
          } else {
            return -1;
          }
        }
        if (b_type === "number") {
          if (a === null || a.BS_PRIVATE_NESTED_SOME_NONE !== void 0) {
            return -1;
          } else {
            return 1;
          }
        }
        if (a === null) {
          if (b.BS_PRIVATE_NESTED_SOME_NONE !== void 0) {
            return 1;
          } else {
            return -1;
          }
        }
        if (b === null) {
          if (a.BS_PRIVATE_NESTED_SOME_NONE !== void 0) {
            return -1;
          } else {
            return 1;
          }
        }
        if (a.BS_PRIVATE_NESTED_SOME_NONE !== void 0) {
          if (b.BS_PRIVATE_NESTED_SOME_NONE !== void 0) {
            return aux_obj_compare(a, b);
          } else {
            return -1;
          }
        }
        var tag_a = a.TAG;
        var tag_b = b.TAG;
        if (tag_a === 248) {
          return int_compare(a[1], b[1]);
        }
        if (tag_a === 251) {
          throw {
            RE_EXN_ID: "Invalid_argument",
            _1: "equal: abstract value",
            Error: new Error()
          };
        }
        if (tag_a !== tag_b) {
          if (tag_a < tag_b) {
            return -1;
          } else {
            return 1;
          }
        }
        var len_a = a.length | 0;
        var len_b = b.length | 0;
        if (len_a === len_b) {
          if (Array.isArray(a)) {
            var _i = 0;
            while (true) {
              var i = _i;
              if (i === len_a) {
                return 0;
              }
              var res = compare(a[i], b[i]);
              if (res !== 0) {
                return res;
              }
              _i = i + 1 | 0;
              continue;
            }
            ;
          } else if (a instanceof Date && b instanceof Date) {
            return a - b;
          } else {
            return aux_obj_compare(a, b);
          }
        } else if (len_a < len_b) {
          var _i$1 = 0;
          while (true) {
            var i$1 = _i$1;
            if (i$1 === len_a) {
              return -1;
            }
            var res$1 = compare(a[i$1], b[i$1]);
            if (res$1 !== 0) {
              return res$1;
            }
            _i$1 = i$1 + 1 | 0;
            continue;
          }
          ;
        } else {
          var _i$2 = 0;
          while (true) {
            var i$2 = _i$2;
            if (i$2 === len_b) {
              return 1;
            }
            var res$2 = compare(a[i$2], b[i$2]);
            if (res$2 !== 0) {
              return res$2;
            }
            _i$2 = i$2 + 1 | 0;
            continue;
          }
          ;
        }
    }
  }
  function aux_obj_compare(a, b) {
    var min_key_lhs = {
      contents: void 0
    };
    var min_key_rhs = {
      contents: void 0
    };
    var do_key = function(param, key) {
      var min_key = param[2];
      var b2 = param[1];
      if (!(!Object.prototype.hasOwnProperty.call(b2, key) || compare(param[0][key], b2[key]) > 0)) {
        return;
      }
      var mk = min_key.contents;
      if (mk !== void 0 && key >= mk) {
        return;
      } else {
        min_key.contents = key;
        return;
      }
    };
    var partial_arg = [
      a,
      b,
      min_key_rhs
    ];
    var do_key_a = function(param) {
      return do_key(partial_arg, param);
    };
    var partial_arg$1 = [
      b,
      a,
      min_key_lhs
    ];
    var do_key_b = function(param) {
      return do_key(partial_arg$1, param);
    };
    for_in(a, do_key_a);
    for_in(b, do_key_b);
    var match = min_key_lhs.contents;
    var match$1 = min_key_rhs.contents;
    if (match !== void 0) {
      if (match$1 !== void 0) {
        return string_compare(match, match$1);
      } else {
        return -1;
      }
    } else if (match$1 !== void 0) {
      return 1;
    } else {
      return 0;
    }
  }
  function greaterthan(a, b) {
    if ((typeof a === "number" || typeof a === "bigint") && (typeof b === "number" || typeof b === "bigint")) {
      return a > b;
    } else {
      return compare(a, b) > 0;
    }
  }
  function lessthan(a, b) {
    if ((typeof a === "number" || typeof a === "bigint") && (typeof b === "number" || typeof b === "bigint")) {
      return a < b;
    } else {
      return compare(a, b) < 0;
    }
  }

  // node_modules/rescript/lib/es6/caml_array.js
  function sub(x, offset, len) {
    var result = new Array(len);
    var j = 0;
    var i = offset;
    while (j < len) {
      result[j] = x[i];
      j = j + 1 | 0;
      i = i + 1 | 0;
    }
    ;
    return result;
  }
  function get(xs, index) {
    if (index < 0 || index >= xs.length) {
      throw {
        RE_EXN_ID: "Invalid_argument",
        _1: "index out of bounds",
        Error: new Error()
      };
    }
    return xs[index];
  }

  // node_modules/rescript/lib/es6/curry.js
  function app(_f, _args) {
    while (true) {
      var args = _args;
      var f = _f;
      var init_arity = f.length;
      var arity = init_arity === 0 ? 1 : init_arity;
      var len = args.length;
      var d = arity - len | 0;
      if (d === 0) {
        return f.apply(null, args);
      }
      if (d >= 0) {
        return /* @__PURE__ */ (function(f2, args2) {
          return function(x) {
            return app(f2, args2.concat([x]));
          };
        })(f, args);
      }
      _args = sub(args, arity, -d | 0);
      _f = f.apply(null, sub(args, 0, arity));
      continue;
    }
    ;
  }
  function _1(o, a0) {
    var arity = o.length;
    if (arity === 1) {
      return o(a0);
    } else {
      switch (arity) {
        case 1:
          return o(a0);
        case 2:
          return function(param) {
            return o(a0, param);
          };
        case 3:
          return function(param, param$1) {
            return o(a0, param, param$1);
          };
        case 4:
          return function(param, param$1, param$2) {
            return o(a0, param, param$1, param$2);
          };
        case 5:
          return function(param, param$1, param$2, param$3) {
            return o(a0, param, param$1, param$2, param$3);
          };
        case 6:
          return function(param, param$1, param$2, param$3, param$4) {
            return o(a0, param, param$1, param$2, param$3, param$4);
          };
        case 7:
          return function(param, param$1, param$2, param$3, param$4, param$5) {
            return o(a0, param, param$1, param$2, param$3, param$4, param$5);
          };
        default:
          return app(o, [a0]);
      }
    }
  }
  function __1(o) {
    var arity = o.length;
    if (arity === 1) {
      return o;
    } else {
      return function(a0) {
        return _1(o, a0);
      };
    }
  }
  function _2(o, a0, a1) {
    var arity = o.length;
    if (arity === 2) {
      return o(a0, a1);
    } else {
      switch (arity) {
        case 1:
          return app(o(a0), [a1]);
        case 2:
          return o(a0, a1);
        case 3:
          return function(param) {
            return o(a0, a1, param);
          };
        case 4:
          return function(param, param$1) {
            return o(a0, a1, param, param$1);
          };
        case 5:
          return function(param, param$1, param$2) {
            return o(a0, a1, param, param$1, param$2);
          };
        case 6:
          return function(param, param$1, param$2, param$3) {
            return o(a0, a1, param, param$1, param$2, param$3);
          };
        case 7:
          return function(param, param$1, param$2, param$3, param$4) {
            return o(a0, a1, param, param$1, param$2, param$3, param$4);
          };
        default:
          return app(o, [
            a0,
            a1
          ]);
      }
    }
  }
  function __2(o) {
    var arity = o.length;
    if (arity === 2) {
      return o;
    } else {
      return function(a0, a1) {
        return _2(o, a0, a1);
      };
    }
  }

  // node_modules/rescript/lib/es6/belt_Array.js
  function makeByU(l, f) {
    if (l <= 0) {
      return [];
    }
    var res = new Array(l);
    for (var i = 0; i < l; ++i) {
      res[i] = f(i);
    }
    return res;
  }
  function makeBy(l, f) {
    return makeByU(l, __1(f));
  }
  function concat(a1, a2) {
    var l1 = a1.length;
    var l2 = a2.length;
    var a1a2 = new Array(l1 + l2 | 0);
    for (var i = 0; i < l1; ++i) {
      a1a2[i] = a1[i];
    }
    for (var i$1 = 0; i$1 < l2; ++i$1) {
      a1a2[l1 + i$1 | 0] = a2[i$1];
    }
    return a1a2;
  }
  function forEachU(a, f) {
    for (var i = 0, i_finish = a.length; i < i_finish; ++i) {
      f(a[i]);
    }
  }
  function forEach(a, f) {
    forEachU(a, __1(f));
  }
  function mapU(a, f) {
    var l = a.length;
    var r = new Array(l);
    for (var i = 0; i < l; ++i) {
      r[i] = f(a[i]);
    }
    return r;
  }
  function map(a, f) {
    return mapU(a, __1(f));
  }
  function keepU(a, f) {
    var l = a.length;
    var r = new Array(l);
    var j = 0;
    for (var i = 0; i < l; ++i) {
      var v = a[i];
      if (f(v)) {
        r[j] = v;
        j = j + 1 | 0;
      }
    }
    r.length = j;
    return r;
  }
  function keep(a, f) {
    return keepU(a, __1(f));
  }
  function forEachWithIndexU(a, f) {
    for (var i = 0, i_finish = a.length; i < i_finish; ++i) {
      f(i, a[i]);
    }
  }
  function forEachWithIndex(a, f) {
    forEachWithIndexU(a, __2(f));
  }
  function reduceU(a, x, f) {
    var r = x;
    for (var i = 0, i_finish = a.length; i < i_finish; ++i) {
      r = f(r, a[i]);
    }
    return r;
  }
  function reduce(a, x, f) {
    return reduceU(a, x, __2(f));
  }

  // src/Pond.res.js
  function next(s) {
    var v = s.rnd * 16807;
    s.rnd = v - Math.floor(v / 2147483647) * 2147483647;
    return s.rnd / 2147483647;
  }
  function randRange(s, lo, hi) {
    return lo + next(s) * (hi - lo);
  }
  function fmax(a, b) {
    if (greaterthan(a, b)) {
      return a;
    } else {
      return b;
    }
  }
  function fmin(a, b) {
    if (lessthan(a, b)) {
      return a;
    } else {
      return b;
    }
  }
  function fabs(a) {
    if (a < 0) {
      return -a;
    } else {
      return a;
    }
  }
  function hypot(a, b) {
    return Math.sqrt(a * a + b * b);
  }
  function depth(x, y) {
    var dx = (x - 160) / 151;
    var dy = (y - 162) / 147;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function wobble(a) {
    return 1 + 0.035 * Math.sin(a * 3 + 1.1) + 0.022 * Math.sin(a * 5 - 0.4);
  }
  function inWater(x, y) {
    var a = Math.atan2(y - 162, x - 160);
    return depth(x, y) < wobble(a);
  }
  function makeKoi(s, i) {
    var a = i / 4 * 6.28318 + 0.4;
    var x = 160 + Math.cos(a) * 151 * 0.45;
    var y = 162 + Math.sin(a) * 147 * 0.45;
    return {
      x,
      y,
      vx: Math.cos(a + 1.57) * 7,
      vy: Math.sin(a + 1.57) * 7,
      ang: a + 1.57,
      size: randRange(s, 0.85, 1.25),
      hue: i < 3 ? i : 0,
      ph: randRange(s, 0, 6.28),
      wtx: x,
      wty: y,
      wt: 0
    };
  }
  function makeLantern(x, y, ph) {
    return {
      x,
      y,
      awake: 0,
      lit: false,
      ph
    };
  }
  function make() {
    var s = {
      t: 0,
      koi: [],
      ripples: [],
      seeds: [],
      motes: [],
      lanterns: [
        makeLantern(160 - 82, 162 + 44, 0),
        makeLantern(160 + 4, 162 - 62, 2.1),
        makeLantern(160 + 88, 162 + 30, 4.2)
      ],
      settle: 0,
      bloomX: 160,
      bloomY: 162,
      bloom: 0,
      complete: false,
      doneAt: 0,
      taps: 0,
      events: [],
      rnd: 20261104
    };
    s.koi = makeBy(4, (function(i) {
      return makeKoi(s, i);
    }));
    return s;
  }
  function asleepLanterns(s) {
    return reduce(s.lanterns, 0, (function(n, l) {
      if (l.lit) {
        return n;
      } else {
        return n + 1 | 0;
      }
    }));
  }
  function nearestAsleep(s, x, y) {
    var idx = {
      contents: -1
    };
    var best = {
      contents: 1e9
    };
    forEachWithIndex(s.lanterns, (function(i, l) {
      if (l.lit) {
        return;
      }
      var d = hypot(l.x - x, l.y - y);
      if (d < best.contents) {
        best.contents = d;
        idx.contents = i;
        return;
      }
    }));
    return idx.contents;
  }
  function addRipple(s, x, y, maxR, str, delay) {
    s.ripples = concat(s.ripples, [{
      x,
      y,
      age: 0,
      delay,
      life: 3.6,
      maxR,
      str
    }]);
  }
  function addMote(s, x, y) {
    s.motes = concat(s.motes, [{
      x: x + randRange(s, -7, 7),
      y: y + randRange(s, -4, 4),
      vy: randRange(s, -9, -4),
      age: 0,
      life: randRange(s, 2.6, 4.6),
      ph: randRange(s, 0, 6.28)
    }]);
  }
  function tap(s, x, y) {
    var x$1 = fmax(6, fmin(320 - 6, x));
    var y$1 = fmax(6, fmin(320 - 6, y));
    var water = inWater(x$1, y$1);
    var k = water ? 1 : 0.45;
    addRipple(s, x$1, y$1, 32 * k, 1 * k, 0.12);
    addRipple(s, x$1, y$1, 20 * k, 0.62 * k, 0);
    addRipple(s, x$1, y$1, 48 * k, 0.38 * k, 0.34);
    s.settle = 1;
    s.bloomX = x$1;
    s.bloomY = y$1;
    s.bloom = water ? 1 : 0.35;
    s.taps = s.taps + 1 | 0;
    s.events = concat(s.events, [water ? "plop" : "thud"]);
    if (!water) {
      return;
    }
    var tgt = nearestAsleep(s, x$1, y$1);
    if (tgt !== -1) {
      s.seeds = concat(s.seeds, [{
        x: x$1,
        y: y$1,
        vx: 0,
        vy: 5,
        age: 0,
        tgt,
        ph: randRange(s, 0, 6.28)
      }]);
      return;
    } else {
      return addMote(s, x$1, y$1);
    }
  }
  function steerKoi(s, k, dt) {
    k.wt = k.wt - dt;
    if (k.wt <= 0) {
      k.wt = randRange(s, 4, 9);
      var a = randRange(s, 0, 6.28318);
      var r = randRange(s, 0, 0.72);
      k.wtx = 160 + Math.cos(a) * 151 * r;
      k.wty = 162 + Math.sin(a) * 147 * r;
    }
    var ax = 0;
    var ay = 0;
    var interest = {
      contents: 1e9
    };
    var ix = {
      contents: 0
    };
    var iy = {
      contents: 0
    };
    forEach(s.seeds, (function(sd) {
      var d2 = hypot(sd.x - k.x, sd.y - k.y);
      if (d2 < interest.contents) {
        interest.contents = d2;
        ix.contents = sd.x;
        iy.contents = sd.y;
        return;
      }
    }));
    forEach(s.lanterns, (function(l) {
      if (!(l.lit && l.awake < 0.9)) {
        return;
      }
      var d2 = hypot(l.x - k.x, l.y - k.y) * 1.6;
      if (d2 < interest.contents) {
        interest.contents = d2;
        ix.contents = l.x;
        iy.contents = l.y;
        return;
      }
    }));
    if (interest.contents < 110) {
      var d = fmax(4, interest.contents);
      var pull = 26 * (1 - d / 130);
      ax = (ix.contents - k.x) / d * pull;
      ay = (iy.contents - k.y) / d * pull;
    }
    var wx = k.wtx - k.x;
    var wy = k.wty - k.y;
    var wd = fmax(20, hypot(wx, wy));
    ax = ax + wx / wd * 9;
    ay = ay + wy / wd * 9;
    var a$1 = Math.atan2(k.y - 162, k.x - 160);
    var rim = depth(k.x, k.y) / wobble(a$1);
    if (rim > 0.8) {
      var push = (rim - 0.8) / 0.2 * 30;
      ax = ax - (k.x - 160) / fmax(1, rim * 151) * push;
      ay = ay - (k.y - 162) / fmax(1, rim * 147) * push;
    }
    ax = ax + Math.sin(s.t * 0.7 + k.ph) * 5;
    ay = ay + Math.cos(s.t * 0.53 + k.ph * 1.7) * 5;
    k.vx = k.vx + ax * dt;
    k.vy = k.vy + ay * dt;
    var drag = Math.pow(0.12, dt);
    k.vx = k.vx * drag;
    k.vy = k.vy * drag;
    var sp = hypot(k.vx, k.vy);
    var cap = 19 * k.size;
    if (sp > cap) {
      k.vx = k.vx / sp * cap;
      k.vy = k.vy / sp * cap;
    }
    k.x = k.x + k.vx * dt;
    k.y = k.y + k.vy * dt;
    if (!inWater(k.x, k.y)) {
      var toC = Math.atan2(162 - k.y, 160 - k.x);
      k.x = k.x + Math.cos(toC) * 26 * dt;
      k.y = k.y + Math.sin(toC) * 26 * dt;
      k.vx = Math.cos(toC) * 6;
      k.vy = Math.sin(toC) * 6;
    }
    var want = sp > 0.6 ? Math.atan2(k.vy, k.vx) : k.ang;
    var mut = k.ang;
    if (fabs(want - mut) > 3.14159) {
      mut = mut + (want > mut ? 6.28318 : -6.28318);
    }
    k.ang = mut + (want - mut) * fmin(1, dt * 3.2);
  }
  function stepSeed(s, sd, dt) {
    var l = get(s.lanterns, sd.tgt);
    if (l.lit) {
      addMote(s, sd.x, sd.y);
      return false;
    }
    var dx = l.x - sd.x;
    var dy = l.y - sd.y;
    var d = fmax(1, hypot(dx, dy));
    sd.vx = sd.vx + (dx / d * 17 + Math.sin(s.t * 1.3 + sd.ph) * 9) * dt;
    sd.vy = sd.vy + (dy / d * 17 * 0.8 + 7) * dt;
    var drag = Math.pow(0.4, dt);
    sd.vx = sd.vx * drag;
    sd.vy = sd.vy * drag;
    var sp = hypot(sd.vx, sd.vy);
    if (sp > 16) {
      sd.vx = sd.vx / sp * 16;
      sd.vy = sd.vy / sp * 16;
    }
    sd.x = sd.x + sd.vx * dt;
    sd.y = sd.y + sd.vy * dt;
    sd.age = sd.age + dt;
    if (!(hypot(l.x - sd.x, l.y - sd.y) < 8.5 || sd.age > 16)) {
      return true;
    }
    l.lit = true;
    l.awake = fmax(l.awake, 0.02);
    s.events = concat(s.events, ["wake"]);
    for (var _i = 0; _i <= 6; ++_i) {
      addMote(s, l.x, l.y);
    }
    return false;
  }
  function step(s, dt) {
    var dt$1 = fmax(0, fmin(0.1, dt));
    s.t = s.t + dt$1;
    s.settle = fmax(0, s.settle - dt$1 * 2.2);
    s.bloom = fmax(0, s.bloom - dt$1 * 1.15);
    s.ripples = keep(s.ripples, (function(r) {
      r.age = r.age + dt$1;
      return r.age < r.life;
    }));
    s.seeds = keep(s.seeds, (function(sd) {
      return stepSeed(s, sd, dt$1);
    }));
    forEach(s.koi, (function(k) {
      steerKoi(s, k, dt$1);
    }));
    s.motes = keep(s.motes, (function(m) {
      m.age = m.age + dt$1;
      m.y = m.y + m.vy * dt$1;
      m.x = m.x + Math.sin(s.t * 0.9 + m.ph) * 4 * dt$1;
      return m.age < m.life;
    }));
    forEach(s.lanterns, (function(l) {
      if (l.lit) {
        l.awake = fmin(1, l.awake + dt$1 / 2.4);
        return;
      }
    }));
    if (!s.complete && asleepLanterns(s) === 0) {
      s.complete = true;
      s.doneAt = s.t;
      s.events = concat(s.events, ["done"]);
      addRipple(s, 160, 162, 104, 0.5, 0);
      addRipple(s, 160, 162, 142, 0.28, 0.7);
    }
    if (!(s.complete && Math.random() < dt$1 * 2.2)) {
      return;
    }
    var pick = Math.floor(Math.random() * 3);
    var i = pick < 1 ? 0 : pick < 2 ? 1 : 2;
    addMote(s, get(s.lanterns, i).x, get(s.lanterns, i).y);
  }
  function drainEvents(s) {
    var e = s.events;
    s.events = [];
    return e;
  }
  function snapshot(s) {
    var awake = reduce(s.lanterns, 0, (function(a, l) {
      return a + l.awake;
    }));
    var lit = reduce(s.lanterns, 0, (function(n, l) {
      if (l.lit) {
        return n + 1 | 0;
      } else {
        return n;
      }
    }));
    return fromArray([
      [
        "awake",
        awake
      ],
      [
        "lit",
        lit
      ],
      [
        "complete",
        s.complete
      ],
      [
        "taps",
        s.taps
      ],
      [
        "ripples",
        s.ripples.length
      ],
      [
        "seeds",
        s.seeds.length
      ],
      [
        "motes",
        s.motes.length
      ],
      [
        "t",
        s.t
      ],
      [
        "koi",
        map(s.koi, (function(k) {
          return fromArray([
            [
              "x",
              k.x
            ],
            [
              "y",
              k.y
            ],
            [
              "ang",
              k.ang
            ],
            [
              "size",
              k.size
            ],
            [
              "hue",
              k.hue
            ]
          ]);
        }))
      ],
      [
        "lanterns",
        map(s.lanterns, (function(l) {
          return fromArray([
            [
              "x",
              l.x
            ],
            [
              "y",
              l.y
            ],
            [
              "awake",
              l.awake
            ],
            [
              "lit",
              l.lit
            ]
          ]);
        }))
      ],
      [
        "rippleList",
        map(s.ripples, (function(r) {
          return fromArray([
            [
              "x",
              r.x
            ],
            [
              "y",
              r.y
            ],
            [
              "age",
              r.age
            ],
            [
              "delay",
              r.delay
            ],
            [
              "life",
              r.life
            ],
            [
              "maxR",
              r.maxR
            ],
            [
              "str",
              r.str
            ]
          ]);
        }))
      ],
      [
        "seedList",
        map(s.seeds, (function(sd) {
          return fromArray([
            [
              "x",
              sd.x
            ],
            [
              "y",
              sd.y
            ],
            [
              "age",
              sd.age
            ]
          ]);
        }))
      ],
      [
        "moteList",
        map(s.motes, (function(m) {
          return fromArray([
            [
              "x",
              m.x
            ],
            [
              "y",
              m.y
            ],
            [
              "age",
              m.age
            ],
            [
              "life",
              m.life
            ]
          ]);
        }))
      ],
      [
        "settle",
        s.settle
      ],
      [
        "bloom",
        s.bloom
      ],
      [
        "bloomX",
        s.bloomX
      ],
      [
        "bloomY",
        s.bloomY
      ],
      [
        "doneAt",
        s.doneAt
      ]
    ]);
  }
  function read(s) {
    return JSON.stringify(snapshot(s));
  }

  // src/view.js
  var W = 320;
  var H = 320;
  var CX = 160;
  var CY = 162;
  var RX = 151;
  var RY = 147;
  var PAL = {
    bank: ["#0a1410", "#0f1d17", "#14261b", "#193020"],
    damp: "#091310",
    water: ["#173d44", "#12333d", "#0d2731", "#081d27"],
    shore: "132, 198, 186",
    pad: ["#16291f", "#1d3427", "#26412f"],
    ripple: "190, 232, 220",
    mote: "255, 226, 172",
    glow: "255, 202, 138"
  };
  function wobble2(a) {
    return 1 + 0.035 * Math.sin(a * 3 + 1.1) + 0.022 * Math.sin(a * 5 - 0.4);
  }
  function depthAt(x, y) {
    const dx = (x - CX) / RX;
    const dy = (y - CY) / RY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function rimDepth(x, y) {
    return depthAt(x, y) / wobble2(Math.atan2(y - CY, x - CX));
  }
  function hash(x, y) {
    let h = x * 374761393 + y * 668265263 | 0;
    h = (h ^ h >>> 13) * 1274126177;
    return ((h ^ h >>> 16) >>> 0) / 4294967295;
  }
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const sx = xf * xf * (3 - 2 * xf);
    const sy = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    const top = a + (b - a) * sx;
    const bot = c + (d - c) * sx;
    return top + (bot - top) * sy;
  }
  function paintStill(ctx) {
    const img = ctx.createImageData(W, H);
    const d = img.data;
    const parse = (hex) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
    const bank = PAL.bank.map(parse);
    const water = PAL.water.map(parse);
    const damp = parse(PAL.damp);
    const shore = PAL.shore.split(",").map((v) => parseInt(v, 10));
    const put = (i, c, a) => {
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
      d[i + 3] = a === void 0 ? 255 : a;
    };
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const r = rimDepth(x + 0.5, y + 0.5);
        const n = hash(x, y);
        if (r < 1) {
          const deep = Math.min(1, (1 - r) / 0.78);
          const mottle = (vnoise(x * 0.055, y * 0.055) - 0.5) * 1.5;
          let band = Math.floor((1 - deep) * 3.2 + (n - 0.5) * 0.5 + mottle);
          band = Math.max(0, Math.min(3, band));
          put(i, water[band]);
          if (r > 0.9) {
            const k = (r - 0.9) / 0.1;
            d[i] = Math.round(d[i] * (1 - 0.28 * k));
            d[i + 1] = Math.round(d[i + 1] * (1 - 0.26 * k));
            d[i + 2] = Math.round(d[i + 2] * (1 - 0.22 * k));
          }
          if (r > 0.985 && n > 0.86) {
            const a = 0.16 + (n - 0.86) * 0.6;
            d[i] = Math.round(d[i] * (1 - a) + shore[0] * a);
            d[i + 1] = Math.round(d[i + 1] * (1 - a) + shore[1] * a);
            d[i + 2] = Math.round(d[i + 2] * (1 - a) + shore[2] * a);
          }
        } else if (r < 1.02) {
          put(i, damp);
        } else {
          const t = Math.min(1, (r - 1.02) / 0.55);
          const tuft = hash(x / 3 | 0, y / 3 | 0);
          let band = 1 + Math.floor(t * 1.6 + (n - 0.5) * 0.7);
          if (tuft > 0.84 && n > 0.45) band += 1;
          band = Math.max(0, Math.min(3, band));
          put(i, bank[band]);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    const sunk = [[96, 250, 9], [214, 262, 7], [262, 130, 6], [70, 196, 5], [180, 76, 5]];
    for (const [sx, sy, sr] of sunk) {
      for (let dy = -sr; dy <= sr; dy++) {
        for (let dx = -sr; dx <= sr; dx++) {
          const dd = dx * dx / (sr * sr) + dy * dy / (sr * sr * 0.7);
          if (dd > 1) continue;
          ctx.fillStyle = dd > 0.72 ? "rgba(18, 40, 44, 0.55)" : "rgba(30, 56, 58, 0.42)";
          ctx.fillRect(sx + dx, sy + dy, 1, 1);
        }
      }
    }
    const stones = [[36, 88, 4], [282, 186, 5], [130, 300, 4], [214, 34, 3], [58, 236, 3]];
    for (const [sx, sy, sr] of stones) {
      for (let dy = -sr; dy <= sr; dy++) {
        for (let dx = -sr; dx <= sr; dx++) {
          if (dx * dx + dy * dy > sr * sr) continue;
          const shade = dy < 0 ? 1 : 0;
          ctx.fillStyle = shade ? "#2b3a31" : "#1f2d26";
          ctx.fillRect(sx + dx, sy + dy, 1, 1);
        }
      }
    }
  }
  function drawPads(ctx) {
    const pads = [
      [66, 120, 13],
      [104, 212, 10],
      [226, 112, 12],
      [258, 200, 9],
      [176, 246, 9],
      [140, 96, 8],
      [92, 158, 6]
    ];
    for (const [px, py, pr] of pads) {
      const notch = Math.atan2(CY - py, CX - px) + 0.25;
      for (let dy = -pr; dy <= pr; dy++) {
        for (let dx = -pr; dx <= pr; dx++) {
          if (dx * dx + dy * dy > pr * pr) continue;
          const a = Math.atan2(dy, dx);
          const da = Math.abs((a - notch + Math.PI * 3) % (Math.PI * 2) - Math.PI);
          if (da > Math.PI - 0.42) continue;
          const shade = dy < -pr * 0.3 ? 0 : dy > pr * 0.45 ? 2 : 1;
          ctx.fillStyle = PAL.pad[shade];
          ctx.fillRect(px + dx, py + dy, 1, 1);
        }
      }
      ctx.fillStyle = "rgba(126, 156, 112, 0.22)";
      for (let i = -pr + 2; i < pr - 2; i++) {
        const yy = py - Math.round(Math.sqrt(Math.max(0, pr * pr - i * i)) * 0.92);
        ctx.fillRect(px + i, yy, 1, 1);
      }
      ctx.fillStyle = "rgba(10, 24, 20, 0.5)";
      ctx.fillRect(px - 1, py + pr - 1, 2, 1);
    }
  }
  function drawReeds(ctx) {
    const stalks = [
      [22, 128, 11],
      [30, 150, 7],
      [296, 152, 9],
      [303, 168, 6],
      [140, 22, 6],
      [158, 18, 5],
      [92, 296, 7],
      [238, 300, 6],
      [274, 84, 5],
      [46, 210, 5],
      [186, 312, 5],
      [118, 316, 4]
    ];
    for (const [x, y, h] of stalks) {
      const bend = Math.sin(x * 0.7) * 2;
      ctx.fillStyle = "rgba(52, 78, 54, 0.8)";
      for (let i = 0; i < h; i++) {
        ctx.fillRect(x + Math.round(bend * i / h), y - i, 1, 1);
      }
      ctx.fillStyle = "rgba(104, 126, 82, 0.7)";
      ctx.fillRect(x + bend, y - h, 1, 1);
    }
  }
  var KOI = [
    { body: "#e59a5e", belly: "#f8dcb6", fin: "#f0bb8e", spot: "#c9713a" },
    { body: "#e6e6df", belly: "#fbfbf4", fin: "#f0e7d6", spot: "#c9703f" },
    { body: "#bd8143", belly: "#eed0a4", fin: "#dda86f", spot: "#8d5a2a" }
  ];
  function drawKoi(ctx, k, t) {
    const c = KOI[Math.round(k.hue) % KOI.length];
    const s = k.size * 1.3;
    const flick = Math.sin(t * 2.4 + k.x * 0.13) * 1.7;
    ctx.save();
    ctx.translate(k.x, k.y);
    ctx.rotate(k.ang);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#04141a";
    ctx.fillRect(-7 * s, -1.6 * s + 1.6, 15 * s, 3.2 * s);
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.body;
    ctx.fillRect(-5 * s, -2 * s, 7 * s, 4 * s);
    ctx.fillRect(-7 * s, -1.2 * s, 2.6 * s, 2.4 * s);
    ctx.fillRect(2 * s, -1.7 * s, 3.6 * s, 3.4 * s);
    ctx.fillStyle = c.belly;
    ctx.fillRect(-4.6 * s, 0.2 * s, 8 * s, 1.5 * s);
    ctx.fillStyle = c.spot;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(-2.2 * s, -2 * s, 2.2 * s, 2.4 * s);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#101d24";
    ctx.fillRect(4.4 * s, -1.2 * s, 1 * s, 1 * s);
    ctx.fillStyle = c.fin;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0.4 * s, -2.9 * s, 2.2 * s, 1.1 * s);
    ctx.fillRect(0.4 * s, 1.9 * s, 2.2 * s, 1.1 * s);
    ctx.fillRect(-9 * s, -1.4 * s + flick, 2.4 * s, 2.8 * s);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function glow(ctx, x, y, r, rgb, alpha) {
    if (alpha <= 2e-3) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
    g.addColorStop(0.45, `rgba(${rgb}, ${alpha * 0.4})`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  var STONE_ROWS = [5, 8, 11, 13, 13, 13, 13, 11, 8, 5];
  function drawLantern(ctx, l) {
    const w = l.awake;
    const x = Math.round(l.x);
    const y = Math.round(l.y);
    const cool = [34, 44, 42];
    const warm = [58, 52, 38];
    const mix = (c, m) => [
      Math.round(c[0] + (m[0] - c[0]) * w),
      Math.round(c[1] + (m[1] - c[1]) * w),
      Math.round(c[2] + (m[2] - c[2]) * w)
    ];
    const outer = mix(cool, warm);
    const inner = mix([44, 56, 54], [92, 78, 52]);
    const top = mix([52, 64, 60], [110, 92, 62]);
    STONE_ROWS.forEach((rowW, i) => {
      const yy = y - 5 + i;
      const off = Math.round((13 - rowW) / 2) - 6;
      ctx.fillStyle = `rgb(${outer[0]}, ${outer[1]}, ${outer[2]})`;
      ctx.fillRect(x + off, yy, rowW, 1);
      if (rowW >= 11 && i > 1 && i < 8) {
        ctx.fillStyle = `rgb(${inner[0]}, ${inner[1]}, ${inner[2]})`;
        ctx.fillRect(x + off + 2, yy, rowW - 4, 1);
      }
    });
    ctx.fillStyle = `rgba(${top[0]}, ${top[1]}, ${top[2]}, 0.9)`;
    ctx.fillRect(x - 3, y - 4, 7, 1);
    ctx.fillStyle = "rgba(6, 16, 18, 0.55)";
    ctx.fillRect(x - 4, y + 5, 9, 1);
    if (w < 0.05) {
      ctx.fillStyle = "rgba(126, 158, 150, 0.55)";
      ctx.fillRect(x, y - 1, 1, 1);
    }
  }
  function createView(canvas2) {
    canvas2.width = W;
    canvas2.height = H;
    const ctx = canvas2.getContext("2d", { alpha: false });
    ctx.imageSmoothingEnabled = false;
    const still = document.createElement("canvas");
    still.width = W;
    still.height = H;
    const sctx = still.getContext("2d", { alpha: false });
    paintStill(sctx);
    drawPads(sctx);
    drawReeds(sctx);
    const glints = [];
    const dust = [];
    for (let i = 0; i < 30; i++) {
      glints.push({
        x: 20 + hash(i, 3) * 280,
        y: 40 + hash(i, 9) * 250,
        ph: hash(i, 17) * 6.28,
        sp: 0.4 + hash(i, 23) * 0.9
      });
    }
    for (let i = 0; i < 16; i++) {
      dust.push({
        x: hash(i, 31) * 300 + 10,
        y: hash(i, 37) * 300 + 10,
        ph: hash(i, 41) * 6.28,
        sp: 0.12 + hash(i, 43) * 0.14
      });
    }
    function draw(st, t) {
      const s = 1 - 0.014 * st.settle;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = PAL.bank[0];
      ctx.fillRect(0, 0, W, H);
      ctx.setTransform(s, 0, 0, s, CX * (1 - s), CY * (1 - s));
      ctx.drawImage(still, 0, 0);
      for (const g of glints) {
        if (rimDepth(g.x, g.y) > 0.94) continue;
        const a = 0.04 + 0.075 * (0.5 + 0.5 * Math.sin(t * 0.55 * g.sp + g.ph));
        ctx.fillStyle = `rgba(148, 206, 196, ${a})`;
        ctx.fillRect(Math.round(g.x), Math.round(g.y), 2, 1);
      }
      for (const p of dust) {
        const dx = Math.sin(t * p.sp + p.ph) * 9;
        const dy = (t * p.sp * 6 + p.ph * 40) % 340 - 10;
        const a = 0.12 + 0.1 * Math.sin(t * 0.5 + p.ph);
        ctx.fillStyle = `rgba(214, 226, 196, ${a})`;
        ctx.fillRect(Math.round(p.x + dx), Math.round(340 - dy), 1, 1);
      }
      for (const l of st.lanterns) {
        const w = l.awake;
        glow(ctx, l.x, l.y, 16 + 30 * w, PAL.glow, 0.05 + 0.3 * w);
        drawLantern(ctx, l);
        if (w > 0.05) {
          const pulse = 0.72 + 0.28 * Math.sin(t * 1.1 + l.x * 0.2);
          ctx.fillStyle = `rgba(255, 222, 168, ${0.3 + 0.65 * w * pulse})`;
          ctx.fillRect(Math.round(l.x) - 2, Math.round(l.y) - 2, 4, 4);
          ctx.fillStyle = `rgba(255, 248, 220, ${0.45 + 0.55 * w})`;
          ctx.fillRect(Math.round(l.x), Math.round(l.y) - 1, 2, 2);
        }
      }
      for (const m of st.moteList) {
        const p = m.age / m.life;
        const a = Math.sin(Math.min(1, p) * Math.PI) * 0.85;
        ctx.fillStyle = `rgba(${PAL.mote}, ${a})`;
        ctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
        ctx.fillStyle = `rgba(${PAL.mote}, ${a * 0.25})`;
        ctx.fillRect(Math.round(m.x) - 1, Math.round(m.y), 3, 1);
      }
      for (const k of st.koi) drawKoi(ctx, k, t);
      for (const sd of st.seedList) {
        glow(ctx, sd.x, sd.y, 9, PAL.glow, 0.3);
        ctx.fillStyle = "rgba(255, 240, 206, 0.95)";
        ctx.fillRect(Math.round(sd.x) - 1, Math.round(sd.y) - 1, 2, 2);
      }
      for (const r of st.rippleList) {
        const p = (r.age - r.delay) / (r.life - r.delay);
        if (p < 0 || p > 1) continue;
        const e = 1 - Math.pow(1 - p, 2.2);
        const rad = 2 + r.maxR * e;
        const a = r.str * Math.pow(1 - p, 1.7) * 0.5;
        ctx.strokeStyle = `rgba(${PAL.ripple}, ${a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (st.bloom > 0.01) {
        const b = st.bloom;
        glow(ctx, st.bloomX, st.bloomY, 18 + 20 * (1 - b), "255, 236, 200", 0.28 * b);
        ctx.fillStyle = `rgba(255, 246, 224, ${0.3 * b})`;
        ctx.fillRect(Math.round(st.bloomX) - 1, Math.round(st.bloomY) - 1, 3, 3);
      }
      if (st.complete) {
        const age = Math.max(0, st.t - st.doneAt);
        const a = Math.min(0.12, age * 0.025);
        glow(ctx, CX, CY, 200, "255, 206, 148", a);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    return { draw };
  }

  // src/host.js
  var canvas = document.getElementById("stage");
  var view = createView(canvas);
  var state = make();
  var audio = null;
  var muted = true;
  var master = null;
  var pad = null;
  function ensureAudio() {
    if (audio) return audio;
    const AC = window.AudioContext || window.webkitAudioContext;
    audio = new AC();
    master = audio.createGain();
    master.gain.value = 0;
    master.connect(audio.destination);
    return audio;
  }
  function blip(freqFrom, freqTo, dur, level, type = "sine", cutoff = 1200) {
    if (!audio || muted) return;
    const t0 = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const filt = audio.createBiquadFilter();
    osc.type = type;
    filt.type = "lowpass";
    filt.frequency.value = cutoff;
    osc.frequency.setValueAtTime(freqFrom, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqTo), t0 + dur);
    gain.gain.setValueAtTime(1e-4, t0);
    gain.gain.exponentialRampToValueAtTime(level, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
    osc.connect(filt).connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function swell(freq, dur, level, delay = 0) {
    if (!audio || muted) return;
    const t0 = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(1e-4, t0);
    gain.gain.linearRampToValueAtTime(level, t0 + dur * 0.4);
    gain.gain.linearRampToValueAtTime(1e-4, t0 + dur);
    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  function startPad() {
    if (!audio || pad) return;
    const filt = audio.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 600;
    const gain = audio.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.05, audio.currentTime + 4);
    filt.connect(gain).connect(master);
    pad = [98, 146.83, 196].map((f, i) => {
      const o = audio.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = audio.createGain();
      g.gain.value = 0.34 / (i + 1);
      const lfo = audio.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.017;
      const lg = audio.createGain();
      lg.gain.value = 0.16 / (i + 1);
      lfo.connect(lg).connect(g.gain);
      o.connect(g).connect(filt);
      o.start();
      lfo.start();
      return [o, lfo];
    });
  }
  function play(event) {
    switch (event) {
      case "plop":
        blip(420, 118, 0.32, 0.16, "sine", 900);
        blip(180, 92, 0.22, 0.05, "triangle", 500);
        break;
      case "thud":
        blip(150, 74, 0.18, 0.06, "triangle", 420);
        break;
      case "wake":
        swell(523.25, 2.6, 0.05);
        swell(783.99, 3, 0.035, 0.18);
        blip(660, 990, 0.9, 0.03, "sine", 2200);
        break;
      case "done":
        swell(261.63, 5, 0.06);
        swell(392, 5, 0.045, 0.4);
        swell(523.25, 5, 0.035, 0.9);
        startPad();
        break;
    }
  }
  function setMuted(next2) {
    muted = next2;
    const btn = document.getElementById("sound");
    btn.setAttribute("aria-pressed", String(!muted));
    btn.textContent = muted ? "sound off" : "sound on";
    btn.classList.toggle("on", !muted);
    if (!muted) {
      ensureAudio();
      if (audio.state === "suspended") audio.resume();
      master.gain.linearRampToValueAtTime(0.9, audio.currentTime + 0.6);
    } else if (audio) {
      master.gain.linearRampToValueAtTime(0, audio.currentTime + 0.3);
    }
  }
  document.getElementById("sound").addEventListener("click", (e) => {
    e.stopPropagation();
    ensureAudio();
    setMuted(!muted);
  });
  function toWorld(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    return {
      x: (clientX - box.left) / box.width * W,
      y: (clientY - box.top) / box.height * H
    };
  }
  var firstTap = true;
  function tapAt(x, y) {
    tap(state, x, y);
    for (const ev of drainEvents(state)) play(ev);
    if (firstTap) {
      firstTap = false;
      document.getElementById("hint").classList.add("gone");
    }
  }
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const p = toWorld(e.clientX, e.clientY);
    tapAt(p.x, p.y);
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  var last = performance.now();
  var acc = 0;
  function frame(now) {
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1e3));
    last = now;
    acc += dt;
    let guard = 0;
    while (acc >= 1 / 60 && guard++ < 8) {
      step(state, 1 / 60);
      acc -= 1 / 60;
    }
    const snap = JSON.parse(read(state));
    view.draw(snap, snap.t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.NightPond = {
    read: () => JSON.parse(read(state)),
    tap: (x, y) => tapAt(x, y),
    world: { width: W, height: H }
  };
})();
