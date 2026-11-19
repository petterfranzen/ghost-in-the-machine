(* Everything the pond looks like.  Pixel-flat: every shape is snapped to
   whole canvas pixels so the grid stays crisp at any scale. *)

type ripple = { rx : float; ry : float; born : float }
type mote = { speed : float; salt : float; hue : int }

type view = {
  ctx : Dom.any;
  ox : float;
  oy : float;
  tile : float;
  level : Level.t;
  game : Game.t;
  time : float;
  ripples : ripple list;
  motes : mote array;
  hint : (int * [ `Along | `Fresh ]) option;
  bloom : float;                 (* 0..1 while a pond is waking *)
  swim : float;                  (* seconds since the koi set off *)
}

let snap x = floor (x +. 0.5)

let fill_raw v x y w h colour =
  Dom.set v.ctx "fillStyle" (Dom.str colour);
  Dom.ignore_call v.ctx "fillRect" [| Dom.num x; Dom.num y; Dom.num w; Dom.num h |]

let fill v x y w h colour = fill_raw v (snap x) (snap y) (snap w) (snap h) colour

let cell_origin v i =
  let x = Level.x_of v.level i and y = Level.y_of v.level i in
  (v.ox +. (float_of_int x *. v.tile), v.oy +. (float_of_int y *. v.tile))

(* A cell-relative fill: [u]/[vv] are the corner of the shape inside the tile
   and [w]/[h] its size, all as fractions of one tile. *)
let unit_fill v i u vv w h colour =
  let x, y = cell_origin v i in
  fill v (x +. (u *. v.tile)) (y +. (vv *. v.tile)) (w *. v.tile) (h *. v.tile) colour

let shade arr i = arr.(i mod Array.length arr)

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
    ((float_of_int v.level.h *. v.tile) +. (2.0 *. margin v)) "#0a1523"

let stone_edge v i colour =
  let x, y = cell_origin v i in
  let t = v.tile in
  fill v x y t (max 1.0 (t *. 0.08)) colour;
  fill v x y (max 1.0 (t *. 0.08)) t colour

let water_bands v i =
  let base = shade Palette.water (Level.x_of v.level i + Level.y_of v.level i) in
  unit_fill v i 0.0 0.0 1.0 1.0 base;
  for k = 0 to 1 do
    let salt = float_of_int (i * 7 + k) in
    let phase = v.time *. (0.25 +. (0.3 *. Util.hash salt 3.0)) in
    let u = Util.hash (salt +. phase) 9.0 in
    let y = 0.25 +. (0.45 *. float_of_int k) in
    unit_fill v i (u *. 0.5) y 0.36 0.06 "rgba(150, 200, 235, 0.10)"
  done

let deep_swirl v i =
  unit_fill v i 0.0 0.0 1.0 1.0 (shade Palette.deep (Level.y_of v.level i));
  let spin = (v.time *. 0.35) +. float_of_int i in
  for k = 0 to 2 do
    let u = 0.2 +. (0.3 *. float_of_int k) +. (0.08 *. sin spin) in
    unit_fill v i u 0.45 0.14 0.05 "rgba(120, 215, 220, 0.22)"
  done

let arrow v i dir =
  let dx, dy = Level.delta dir in
  let u = 0.5 +. (0.22 *. float_of_int dx) and w = 0.5 +. (0.22 *. float_of_int dy) in
  let stem_w = if dx = 0 then 0.08 else 0.28 in
  let stem_h = if dy = 0 then 0.08 else 0.28 in
  unit_fill v i (0.5 -. (stem_w /. 2.0)) (0.5 -. (stem_h /. 2.0)) stem_w stem_h "rgba(190, 250, 235, 0.75)";
  let side = 0.1 in
  if dx <> 0 then
    unit_fill v i (u -. side) (w -. 0.14) 0.14 0.28 "rgba(190, 250, 235, 0.75)"
  else unit_fill v i (u -. 0.14) (w -. side) 0.28 0.14 "rgba(190, 250, 235, 0.75)"

let moss_tile v i =
  unit_fill v i 0.0 0.0 1.0 1.0 (shade Palette.moss (i * 3));
  let salt = float_of_int i in
  for k = 0 to 2 do
    let u = Util.hash (salt +. float_of_int k) 1.0 and w = Util.hash (salt +. float_of_int k) 2.0 in
    unit_fill v i (0.12 +. (0.7 *. u)) (0.12 +. (0.7 *. w)) 0.12 0.10 "rgba(24, 40, 34, 0.32)"
  done;
  stone_edge v i "rgba(16, 28, 26, 0.5)"

let dew_drop v i awake =
  let beat = 0.5 +. (0.5 *. sin ((v.time *. 1.7) +. float_of_int i)) in
  let halo = if awake then 0.55 +. (0.25 *. beat) else 0.30 +. (0.45 *. beat) in
  unit_fill v i 0.18 0.14 0.64 0.7 (if awake then "rgba(220, 250, 255, 0.13)" else "rgba(150, 215, 255, 0.13)");
  let size = 0.26 +. (0.05 *. beat) in
  unit_fill v i (0.5 -. (size /. 2.0)) (0.5 -. (size *. 0.6)) size (size *. 1.3)
    (if awake then Palette.dew else Palette.dew_dim);
  if awake then
    unit_fill v i 0.42 0.32 0.16 0.16 Palette.dew_core
  else
    unit_fill v i 0.46 0.38 0.10 0.10 "rgba(233, 248, 255, 0.55)";
  Dom.set v.ctx "globalAlpha" (Dom.num (halo *. 0.5));
  unit_fill v i 0.30 0.26 0.40 0.46 Palette.dew;
  Dom.set v.ctx "globalAlpha" (Dom.num 1.0)

let water_bands_edge v i =
  let base = shade Palette.water (Level.x_of v.level i + Level.y_of v.level i) in
  Dom.set v.ctx "globalAlpha" (Dom.num 0.35);
  unit_fill v i 0.0 0.0 1.0 1.0 base;
  Dom.set v.ctx "globalAlpha" (Dom.num 1.0)

let tiles v =
  Array.iteri (fun i tile ->
      match tile with
      | Level.Water -> water_bands v i
      | Level.Deep -> deep_swirl v i
      | Level.Moss -> moss_tile v i
      | Level.Dew -> water_bands v i; dew_drop v i (v.game.Game.visits.(i) > 0)
      | Level.Current dir ->
        unit_fill v i 0.0 0.0 1.0 1.0 Palette.current;
        water_bands_edge v i; arrow v i dir
      | Level.Spring -> unit_fill v i 0.0 0.0 1.0 1.0 Palette.spring)
    v.level.cells

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
    stroke_style v Palette.trail_glow (v.tile *. 0.62);
    Dom.ignore_call v.ctx "stroke" [||];
    trail_path v;
    stroke_style v "rgba(120, 205, 245, 0.55)" (v.tile *. 0.30);
    Dom.ignore_call v.ctx "stroke" [||];
    trail_path v;
    stroke_style v Palette.trail (v.tile *. 0.16);
    Dom.ignore_call v.ctx "stroke" [||]
  end

let head_glow v =
  let x, y = cell_origin v (Game.head v.game) in
  let beat = 0.5 +. (0.5 *. sin (v.time *. 3.4)) in
  Dom.set v.ctx "globalAlpha" (Dom.num (0.25 +. (0.25 *. beat)));
  fill v (x +. (v.tile *. 0.12)) (y +. (v.tile *. 0.12)) (v.tile *. 0.76) (v.tile *. 0.76) Palette.dew;
  Dom.set v.ctx "globalAlpha" (Dom.num 1.0)

(* A small pixel koi, drawn nose-first along [dir_px]. *)
let koi v ~x ~y ~dir ~sleeping ~wag =
  let t = v.tile in
  let tail = sin wag *. (t *. 0.10) in
  let spot x' y' w h colour = fill v (x +. x' -. (t /. 2.0)) (y +. y' -. (t /. 2.0)) w h colour in
  let body = if sleeping then "#cfd8e3" else Palette.koi_body in
  spot (0.22 *. t) (0.30 *. t) (0.56 *. t) (0.40 *. t) body;
  spot (0.70 *. t) (0.36 *. t) (0.22 *. t) (0.28 *. t) body;
  spot (0.86 *. t) (0.40 *. t) (0.10 *. t) (0.20 *. t) Palette.koi_fin;
  spot (0.30 *. t) (0.34 *. t) (0.14 *. t) (0.14 *. t) Palette.koi_spot;
  spot (0.30 *. t) (0.44 *. t) (0.12 *. t) (0.12 *. t) Palette.koi_spot;
  spot (0.18 *. t) (0.34 *. t) (0.16 *. t) (0.08 *. t) Palette.koi_fin;
  spot (0.10 *. t) ((0.42 *. t) +. tail) (0.16 *. t) (0.16 *. t) Palette.koi_fin;
  if not sleeping then spot (0.62 *. t) (0.40 *. t) (0.05 *. t) (0.05 *. t) "#1c2530";
  ignore dir

let koi_at v cell ~sleeping ~wag =
  let x, y = cell_origin v cell in
  koi v ~x:(x +. (v.tile /. 2.0)) ~y:(y +. (v.tile /. 2.0)) ~dir:0 ~sleeping ~wag

let swimmer v =
  let pts = List.rev_map (cell_origin v) v.game.Game.trail in
  (* trail is head-first: swim back from the spring toward the head *)
  let n = List.length pts in
  if n < 2 then koi_at v (Game.head v.game) ~sleeping:false ~wag:(v.time *. 6.0)
  else begin
    let span = max 1.0 (float_of_int (n - 1)) in
    let t = mod_float (v.swim *. 0.6) 1.0 in
    let pos = t *. span in
    let k = min (n - 2) (int_of_float pos) in
    let frac = pos -. float_of_int k in
    let ax, ay = List.nth pts (n - 2 - k) and bx, by = List.nth pts (n - 1 - k) in
    koi v ~x:(Util.lerp ax bx frac +. (v.tile /. 2.0))
      ~y:(Util.lerp ay by frac +. (v.tile /. 2.0)) ~dir:0 ~sleeping:false
      ~wag:(v.time *. 7.0)
  end

let hint_mark v =
  match v.hint with
  | None -> ()
  | Some (cell, kind) ->
    let x, y = cell_origin v cell in
    let beat = Util.pulse v.time 1.6 in
    let colour = match kind with `Along -> Palette.glint | `Fresh -> Palette.mote in
    Dom.set v.ctx "globalAlpha" (Dom.num (0.30 +. (0.45 *. beat)));
    fill v (x +. (v.tile *. 0.10)) (y +. (v.tile *. 0.10)) (v.tile *. 0.80) (v.tile *. 0.80) colour;
    Dom.set v.ctx "globalAlpha" (Dom.num 1.0)

let ripples v =
  List.iter (fun r ->
      let age = v.time -. r.born in
      if age >= 0.0 && age < 1.8 then begin
        let radius = v.tile *. (0.25 +. (age *. 1.6)) in
        Dom.set v.ctx "globalAlpha" (Dom.num (0.30 *. (1.0 -. (age /. 1.8))));
        stroke_style v Palette.dew (max 1.0 (v.tile *. 0.06));
        Dom.ignore_call v.ctx "beginPath" [||];
        Dom.ignore_call v.ctx "arc" [| Dom.num r.rx; Dom.num r.ry; Dom.num radius; Dom.num 0.0; Dom.num (2.0 *. Util.pi) |];
        Dom.ignore_call v.ctx "stroke" [||];
        Dom.set v.ctx "globalAlpha" (Dom.num 1.0)
      end) v.ripples

let motes v =
  Array.iter (fun m ->
      let x = v.ox +. ((Util.hash (m.salt +. (v.time *. m.speed)) 4.0) *. float_of_int v.level.w *. v.tile) in
      let y = v.oy +. ((Util.hash (m.salt +. (v.time *. m.speed)) 11.0) *. float_of_int v.level.h *. v.tile) in
      let blink = 0.35 +. (0.65 *. Util.pulse (v.time +. m.salt) 2.4) in
      Dom.set v.ctx "globalAlpha" (Dom.num (blink *. 0.8));
      let colour = if m.hue = 0 then Palette.mote else Palette.dew in
      fill v x y (max 1.0 (v.tile *. 0.10)) (max 1.0 (v.tile *. 0.10)) colour;
      Dom.set v.ctx "globalAlpha" (Dom.num 1.0)) v.motes

let bloom_petals v =
  if v.bloom > 0.0 then begin
    let grow = Util.ease_out v.bloom in
    Array.iteri (fun i tile ->
        if tile = Level.Dew then begin
          let x, y = cell_origin v i in
          let cx = x +. (v.tile /. 2.0) and cy = y +. (v.tile /. 2.0) in
          let radius = v.tile *. (0.2 +. (0.7 *. grow)) in
          Dom.set v.ctx "globalAlpha" (Dom.num (0.75 *. (1.0 -. (v.bloom *. 0.5))));
          for k = 0 to 3 do
            let ang = (float_of_int k *. Util.pi /. 2.0) +. (v.bloom *. 0.8) +. float_of_int i in
            fill v (cx +. (radius *. cos ang) -. (v.tile *. 0.10))
              (cy +. (radius *. sin ang) -. (v.tile *. 0.10))
              (v.tile *. 0.20) (v.tile *. 0.20) Palette.flower
          done;
          Dom.set v.ctx "globalAlpha" (Dom.num 1.0)
        end) v.level.cells
  end

let scene v =
  bg v;
  pond_bed v;
  tiles v;
  trail v;
  ripples v;
  hint_mark v;
  motes v;
  bloom_petals v;
  (if v.game.Game.status = Game.Won then swimmer v
   else koi_at v v.level.spring ~sleeping:true ~wag:(v.time *. 1.2));
  head_glow v
