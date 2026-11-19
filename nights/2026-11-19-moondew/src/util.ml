(* Small maths and randomness helpers, kept free of any browser knowledge. *)

let pi = 4.0 *. atan 1.0
let tau = 2.0 *. pi

let clamp lo hi v = if v < lo then lo else if v > hi then hi else v
let lerp a b t = a +. ((b -. a) *. t)
let smoothstep t = let t = clamp 0.0 1.0 t in t *. t *. (3.0 -. (2.0 *. t))
let ease_out t = let t = clamp 0.0 1.0 t in 1.0 -. ((1.0 -. t) *. (1.0 -. t))

(* A flat 0..1 wave, handy for pulses.  [phase] is a period in seconds. *)
let pulse time phase =
  let t = mod_float (time /. phase) 1.0 in
  0.5 -. (0.5 *. cos (t *. tau))

(* Deterministic hash noise: same (t, salt) always gives the same value. *)
let hash t salt =
  let x = sin ((t *. 12.9898) +. (salt *. 78.233)) *. 43758.5453 in
  x -. floor x

type rng = { mutable state : int }

let make_rng seed =
  let s = (abs seed mod 0x3fffffff) + 1 in
  { state = s }

let next_int r =
  r.state <- ((r.state * 1103515245) + 12345) land 0x3fffffff;
  r.state

let rand r = float_of_int (next_int r) /. float_of_int 0x40000000
let rand_int r n = if n <= 1 then 0 else int_of_float (rand r *. float_of_int n)
let chance r p = rand r < p

let shuffle r (a : 'a array) =
  for i = Array.length a - 1 downto 1 do
    let j = rand_int r (i + 1) in
    let tmp = a.(i) in
    a.(i) <- a.(j);
    a.(j) <- tmp
  done
