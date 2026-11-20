(* Everything the pond looks like.  Pixel-flat: every shape is snapped to
   whole canvas pixels so the grid stays crisp at any scale.

   Calm by construction: nothing that moves is sampled from a hash of the
   clock (that is what used to make a tile jump every frame), and every pulse
   is slow and shallow.  [time] is the ambient clock -- frozen when the player
   asks for reduced motion -- while [now] drives the short answers to a
   gesture, which must stay live. *)

type ripple = { rx : float; ry : float; born : float }
type mote = { speed : float; salt : float; hue : int }

type view = {
  ctx : Dom.any;
  ox : float;
  oy : float;
  tile : float;
  level : Level.t;
  game : Game.t;
  time : float;                  (* ambient clock; may be frozen *)
  now : float;                   (* real seconds, for gesture answers *)
  ripples : ripple list;
  motes : mote array;
  hint : (int * [ `Along | `Fresh ]) option;
  bloom : float;                 (* 0..1 while a pond is waking *)
  swim : float;                  (* seconds since the koi set off *)
  shake_x : float;               (* a refused step nudges the pond a little *)
  shake_y : float;
}

let snap x = floor (x +. 0.5)

let fill_raw v x y w h colour =
  Dom.set v.ctx "fillStyle" (Dom.str colour);
  Dom.ignore_call v.ctx "fillRect" [| Dom.num x; Dom.num y; Dom.num w; Dom.num h |]

let fill v x y w h colour = fill_raw v (snap x) (snap y) (snap w) (snap h) colour

let alpha v a =
  Dom.set v.ctx "globalAlpha" (Dom.num a)

let cell_origin v i =
  let x = Level.x_of v.level i and y = Level.y_of v.level i in
  (v.ox +. (float_of_int x *. v.tile), v.oy +. (float_of_int y *. v.tile))

(* A cell-relative fill: [u]/[vv] are the corner of the shape inside the tile
   and [w]/[h] its size, all as fractions of one tile. *)
let unit_fill v i u vv w h colour =
  let x, y = cell_origin v i in
  fill v (x +. (u *. v.tile)) (y +. (vv *. v.tile)) (w *. v.tile) (h *. v.tile) colour

let shade arr i = arr.(i mod Array.length arr)

(* A slow, shallow breath: never a flicker, at most a few percent either way. *)
let breath t period phase = 0.5 +. (0.5 *. sin (((t /. period) *. Util.tau) +. phase))

let bg v =
  let grad = Dom.call v.ctx "createLinearGradient" [| Dom.num 0.0; Dom.num 0.0; Dom.num 0.0; Dom.num (v.oy *. 2.0 +. (float_of_int v.level.h *. v.tile)) |] in
  Dom.ignore_call grad "addColorStop" [| Dom.num 0.0; Dom.str Palette.bg_top |];
  Dom.ignore_call grad "addColorStop" [| Dom.num 1.0; Dom.str Palette.bg_bottom |];
  Dom.set v.ctx "fillStyle" grad;
  Dom.ignore_call v.ctx "fillRect" [| Dom.num 0.0; Dom.num 0.0; Dom.num 4000.0; Dom.num 4000.0 |]

let margin v = v.tile *. 0.35

let pond_bed v =
  fill v (v.ox -. margin v) (v.oy -. margin v)
    ((float_of_int v.level.w *. v.tile) +. (2.0 *. margin v))
    ((float_of_int v.level.h *. v.tile) +. (2.0 *. margin v)) "#0c1725"

let stone_edge v i colour =
  let x, y = cell_origin v i in
  let t = v.tile in
  fill v x y t (max 1.0 (t *. 0.07)) colour;
  fill v x y (max 1.0 (t *. 0.07)) t colour

(* Open water: a flat tile with one still highlight, so nothing shuffles. *)
let water_tile v i =
  let base = shade Palette.water (Level.x_of v.level i + Level.y_of v.level i) in
  unit_fill v i 0.0 0.0 1.0 1.0 base;
  let u = Util.hash (float_of_int (i * 7)) 9.0 in
  unit_fill v i (0.12 +. (0.56 *. u)) 0.30 0.28 0.045 "rgba(152, 202, 236, 0.055)"

let deep_tile v i =
  unit_fill v i 0.0 0.0 1.0 1.0 (shade Palette.deep (Level.y_of v.level i));
  for k = 0 to 1 do
    let u = 0.18 +. (0.34 *. float_of_int k) in
    unit_fill v i u 0.44 0.12 0.045 "rgba(122, 210, 214, 0.10)"
  done

let arrow v i dir =
  let dx, dy = Level.delta dir in
  let u = 0.5 +. (0.22 *. float_of_int dx) and w = 0.5 +. (0.22 *. float_of_int dy) in
  let stem_w = if dx = 0 then 0.08 else 0.28 in
  let stem_h = if dy = 0 then 0.08 else 0.28 in
  unit_fill v i (0.5 -. (stem_w /. 2.0)) (0.5 -. (stem_h /. 2.0)) stem_w stem_h "rgba(176, 236, 224, 0.62)";
  let side = 0.1 in
  if dx <> 0 then
    unit_fill v i (u -. side) (w -. 0.14) 0.14 0.28 "rgba(176, 236, 224, 0.62)"
  else unit_fill v i (u -. 0.14) (w -. side) 0.28 0.14 "rgba(176, 236, 224, 0.62)"

let moss_tile v i =
  unit_fill v i 0.0 0.0 1.0 1.0 (shade Palette.moss (i * 3));
  let salt = float_of_int i in
  for k = 0 to 1 do
    let u = Util.hash (salt +. float_of_int k) 1.0 and w = Util.hash (salt +. float_of_int k) 2.0 in
    unit_fill v i (0.14 +. (0.66 *. u)) (0.14 +. (0.66 *. w)) 0.13 0.11 "rgba(24, 40, 34, 0.26)"
  done;
  stone_edge v i "rgba(16, 28, 26, 0.42)"

(* A drop of dew: asleep it is a dim bead, awake it is a soft bead with a
   small steady halo that breathes once every ten seconds. *)
let dew_drop v i awake =
  let b = breath v.time 10.0 (float_of_int i *. 1.7) in
  let halo = if awake then 0.20 +. (0.08 *. b) else 0.11 +. (0.05 *. b) in
  alpha v halo;
  unit_fill v i 0.22 0.18 0.56 0.62 (if awake then Palette.dew else Palette.dew_dim);
  alpha v 1.0;
  let size = 0.26 +. (0.03 *. b) in
  unit_fill v i (0.5 -. (size /. 2.0)) (0.5 -. (size *. 0.6)) size (size *. 1.3)
    (if awake then Palette.dew else Palette.dew_dim);
  unit_fill v i 0.44 0.34 0.12 0.12
    (if awake then Palette.dew_core else "rgba(230, 242, 250, 0.34)")

let tiles v =
  Array.iteri (fun i tile ->
      match tile with
      | Level.Water -> water_tile v i
      | Level.Deep -> deep_tile v i
      | Level.Moss -> moss_tile v i
      | Level.Dew -> water_tile v i; dew_drop v i (v.game.Game.visits.(i) > 0)
      | Level.Current dir ->
        unit_fill v i 0.0 0.0 1.0 1.0 Palette.current;
        alpha v 0.30;
        unit_fill v i 0.0 0.0 1.0 1.0 (shade Palette.water (Level.x_of v.level i + Level.y_of v.level i));
        alpha v 1.0;
        arrow v i dir
      | Level.Spring -> unit_fill v i 0.0 0.0 1.0 1.0 Palette.spring)
    v.level.cells

(* One quiet 1 px line between stones, so the grid reads without shouting. *)
let grid_lines v =
  let t = v.tile in
  let w = float_of_int v.level.w *. t and h = float_of_int v.level.h *. t in
  Dom.set v.ctx "strokeStyle" (Dom.str Palette.grid);
  Dom.set v.ctx "lineWidth" (Dom.num 1.0);
  Dom.ignore_call v.ctx "beginPath" [||];
  for c = 1 to v.level.w - 1 do
    let x = snap (v.ox +. (float_of_int c *. t)) +. 0.5 in
    Dom.ignore_call v.ctx "moveTo" [| Dom.num x; Dom.num (snap v.oy) |];
    Dom.ignore_call v.ctx "lineTo" [| Dom.num x; Dom.num (snap (v.oy +. h)) |]
  done;
  for r = 1 to v.level.h - 1 do
    let y = snap (v.oy +. (float_of_int r *. t)) +. 0.5 in
    Dom.ignore_call v.ctx "moveTo" [| Dom.num (snap v.ox); Dom.num y |];
    Dom.ignore_call v.ctx "lineTo" [| Dom.num (snap (v.ox +. w)); Dom.num y |]
  done;
  Dom.ignore_call v.ctx "stroke" [||]

let trail_path v =
  let pts = List.rev_map (cell_origin v) v.game.Game.trail in
  let pts = List.rev pts in
  Dom.ignore_call v.ctx "beginPath" [||];
  (match pts with
   | (x, y) :: _ -> Dom.ignore_call v.ctx "moveTo" [| Dom.num (x +. (v.tile /. 2.0)); Dom.num (y +. (v.tile /. 2.0)) |]
   | [] -> ());
  List.iter (fun (x, y) ->
      Dom.ignore_call v.ctx "lineTo" [| Dom.num (x +. (v.tile /. 2.0)); Dom.num (y +. (v.tile /. 2.0)) |]) pts

let stroke_style v colour width =
  Dom.set v.ctx "strokeStyle" (Dom.str colour);
  Dom.set v.ctx "lineWidth" (Dom.num width);
  Dom.set v.ctx "lineCap" (Dom.str "round");
  Dom.set v.ctx "lineJoin" (Dom.str "round")

let trail v =
  if List.length v.game.Game.trail > 1 then begin
    trail_path v;
    stroke_style v Palette.trail_glow (v.tile *. 0.50);
    Dom.ignore_call v.ctx "stroke" [||];
    trail_path v;
    stroke_style v Palette.trail_mid (v.tile *. 0.26);
    Dom.ignore_call v.ctx "stroke" [||];
    trail_path v;
    stroke_style v Palette.trail (v.tile *. 0.14);
    Dom.ignore_call v.ctx "stroke" [||]
  end

(* The head of the trail carries a small, slow light so it is easy to find. *)
let head_glow v =
  let x, y = cell_origin v (Game.head v.game) in
  let b = breath v.time 4.5 0.0 in
  alpha v (0.12 +. (0.10 *. b));
  fill v (x +. (v.tile *. 0.14)) (y +. (v.tile *. 0.14)) (v.tile *. 0.72) (v.tile *. 0.72) Palette.dew;
  alpha v 1.0

(* A small pixel koi, drawn nose-first along [dir_px]. *)
let koi v ~x ~y ~dir ~sleeping ~wag =
  let t = v.tile in
  let tail = sin wag *. (t *. 0.08) in
  let spot x' y' w h colour = fill v (x +. x' -. (t /. 2.0)) (y +. y' -. (t /. 2.0)) w h colour in
  let body = if sleeping then "#c6d0dc" else Palette.koi_body in
  spot (0.22 *. t) (0.30 *. t) (0.56 *. t) (0.40 *. t) body;
  spot (0.70 *. t) (0.36 *. t) (0.22 *. t) (0.28 *. t) body;
  spot (0.86 *. t) (0.40 *. t) (0.10 *. t) (0.20 *. t) Palette.koi_fin;
  spot (0.30 *. t) (0.34 *. t) (0.14 *. t) (0.14 *. t) Palette.koi_spot;
  spot (0.18 *. t) (0.34 *. t) (0.16 *. t) (0.08 *. t) Palette.koi_fin;
  spot (0.10 *. t) ((0.42 *. t) +. tail) (0.16 *. t) (0.16 *. t) Palette.koi_fin;
  if not sleeping then spot (0.62 *. t) (0.40 *. t) (0.05 *. t) (0.05 *. t) "#202932";
  ignore dir

let koi_at v cell ~sleeping ~wag =
  let x, y = cell_origin v cell in
  koi v ~x:(x +. (v.tile /. 2.0)) ~y:(y +. (v.tile /. 2.0)) ~dir:0 ~sleeping ~wag

let swimmer v =
  let pts = List.rev_map (cell_origin v) v.game.Game.trail in
  let n = List.length pts in
  if n < 2 then koi_at v (Game.head v.game) ~sleeping:false ~wag:(v.now *. 3.0)
  else begin
    let span = max 1.0 (float_of_int (n - 1)) in
    let t = mod_float (v.swim *. 0.5) 1.0 in
    let pos = t *. span in
    let k = min (n - 2) (int_of_float pos) in
    let frac = pos -. float_of_int k in
    let ax, ay = List.nth pts (n - 2 - k) and bx, by = List.nth pts (n - 1 - k) in
    koi v ~x:(Util.lerp ax bx frac +. (v.tile /. 2.0))
      ~y:(Util.lerp ay by frac +. (v.tile /. 2.0)) ~dir:0 ~sleeping:false
      ~wag:(v.now *. 3.5)
  end

let hint_mark v =
  match v.hint with
  | None -> ()
  | Some (cell, kind) ->
    let x, y = cell_origin v cell in
    let b = breath v.time 2.8 (float_of_int cell) in
    let colour = match kind with `Along -> Palette.glint | `Fresh -> Palette.mote in
    alpha v (0.16 +. (0.22 *. b));
    fill v (x +. (v.tile *. 0.12)) (y +. (v.tile *. 0.12)) (v.tile *. 0.76) (v.tile *. 0.76) colour;
    alpha v 1.0

(* Ripples answer a touch, so they ride the real clock whatever the motion
   setting says. *)
let ripples v =
  List.iter (fun r ->
      let age = v.now -. r.born in
      if age >= 0.0 && age < 1.8 then begin
        let radius = v.tile *. (0.22 +. (age *. 1.2)) in
        alpha v (0.22 *. (1.0 -. (age /. 1.8)));
        stroke_style v Palette.dew (max 1.0 (v.tile *. 0.05));
        Dom.ignore_call v.ctx "beginPath" [||];
        Dom.ignore_call v.ctx "arc" [| Dom.num r.rx; Dom.num r.ry; Dom.num radius; Dom.num 0.0; Dom.num (2.0 *. Util.pi) |];
        Dom.ignore_call v.ctx "stroke" [||];
        alpha v 1.0
      end) v.ripples

(* Fireflies drift on a slow circular path: continuous, so they never jump. *)
let motes v =
  let bw = float_of_int v.level.w *. v.tile and bh = float_of_int v.level.h *. v.tile in
  Array.iter (fun m ->
      let x = v.ox +. ((0.5 +. (0.42 *. sin ((v.time *. m.speed) +. m.salt))) *. bw) in
      let y = v.oy +. ((0.5 +. (0.42 *. sin ((v.time *. m.speed *. 0.8) +. (m.salt *. 1.7)))) *. bh) in
      let fade = breath v.time 18.0 (m.salt *. 3.1) in
      alpha v (0.10 +. (0.10 *. fade));
      let colour = if m.hue = 0 then Palette.mote else Palette.dew in
      fill v x y (max 1.0 (v.tile *. 0.09)) (max 1.0 (v.tile *. 0.09)) colour;
      alpha v 1.0) v.motes

let bloom_petals v =
  if v.bloom > 0.0 then begin
    let grow = Util.ease_out v.bloom in
    alpha v (0.62 *. (1.0 -. (v.bloom *. 0.45)));
    Array.iteri (fun i tile ->
        if tile = Level.Dew then begin
          let x, y = cell_origin v i in
          let cx = x +. (v.tile /. 2.0) and cy = y +. (v.tile /. 2.0) in
          let radius = v.tile *. (0.2 +. (0.7 *. grow)) in
          for k = 0 to 3 do
            let ang = (float_of_int k *. Util.pi /. 2.0) +. (v.bloom *. 0.6) +. float_of_int i in
            fill v (cx +. (radius *. cos ang) -. (v.tile *. 0.09))
              (cy +. (radius *. sin ang) -. (v.tile *. 0.09))
              (v.tile *. 0.18) (v.tile *. 0.18) Palette.flower
          done
        end) v.level.cells;
    alpha v 1.0
  end

let scene v0 =
  (* a refused step nudges the whole pond by whole pixels only *)
  let v = { v0 with ox = v0.ox +. snap v0.shake_x; oy = v0.oy +. snap v0.shake_y } in
  bg v;
  pond_bed v;
  tiles v;
  grid_lines v;
  trail v;
  ripples v;
  hint_mark v;
  motes v;
  bloom_petals v;
  (if v.game.Game.status = Game.Won then swimmer v
   else koi_at v v.level.spring ~sleeping:true ~wag:((v.time +. 3.0) *. 0.9));
  head_glow v
