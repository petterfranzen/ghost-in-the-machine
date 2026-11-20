(* The pond itself: what a pond is made of, where it sits, and how it sounds.
   [pond] grows and finishes a pond; [input] listens to the player. *)

let clock () =
  Dom.float_of (Dom.call (Dom.global "performance") "now" [||]) /. 1000.0

type world = {
  canvas : Dom.any;
  ctx : Dom.any;
  mutable level : Level.t;
  mutable game : Game.t;
  mutable ripples : Draw.ripple list;
  motes : Draw.mote array;      (* fixed, so the fireflies never reshuffle *)
  mutable bloom : float;
  mutable swim_start : float;
  mutable hint : (int * [ `Along | `Fresh ]) option;
  mutable hint_until : float;
  mutable still_at : float;
  mutable sound : bool;
  mutable engine : Audio.t option;
  mutable start_on_gesture : bool;
  mutable dragging : bool;
  mutable can_drag : bool;
  mutable press_at : float;
  mutable press_point : float * float;
  mutable press_moved : bool;
  mutable long_fired : bool;
  mutable stir_cell : int;
  mutable idle_at : float;
  mutable tile : float;
  mutable ox : float;
  mutable oy : float;
  mutable timers : (float * (unit -> unit)) list;
  mutable last_box : float * float;
  mutable frames : int;
  mutable started : bool;
  mutable unlocked : int;
  mutable reduce : bool;
  mutable amb : float;           (* ambient clock: frozen on reduced motion *)
  mutable last : float;
  mutable shake_at : float;
  mutable shake_x : float;
  mutable shake_y : float;
}

let play w f = match w.engine with Some a when w.sound -> f a | _ -> ()

let later w delay f = w.timers <- (clock () +. delay, f) :: w.timers

(* ------------------------------------------------------------------ *)
(* Sound                                                              *)
(* ------------------------------------------------------------------ *)

let engine w =
  match w.engine with
  | Some a -> a
  | None -> let a = Audio.create () in w.engine <- Some a; a

let start_sound w =
  let a = engine w in
  Audio.resume a;
  Audio.set_on a true;
  Audio.wake a;
  w.sound <- true;
  w.start_on_gesture <- false;
  Hud.paint_sound true

let stop_sound w =
  (match w.engine with Some a -> Audio.set_on a false | None -> ());
  w.sound <- false;
  Hud.paint_sound false

let store_sound on =
  try
    ignore (Dom.call (Dom.global "localStorage") "setItem"
              [| Dom.str "moondew.sound"; Dom.str (if on then "on" else "off") |])
  with _ -> ()

let recall_sound () =
  try Dom.string_of
        (Dom.call (Dom.global "localStorage") "getItem" [| Dom.str "moondew.sound" |]) = "on"
  with _ -> false

let toggle_sound w =
  if w.sound then (store_sound false; stop_sound w)
  else (store_sound true; start_sound w)

(* ------------------------------------------------------------------ *)
(* Where the pond sits                                                *)
(* ------------------------------------------------------------------ *)

let css_box w =
  let rect = Dom.call w.canvas "getBoundingClientRect" [||] in
  (max 1.0 (Dom.float_of (Dom.get rect "width")),
   max 1.0 (Dom.float_of (Dom.get rect "height")))

let canvas_px w =
  (max 1.0 (Dom.float_of (Dom.get w.canvas "width")),
   max 1.0 (Dom.float_of (Dom.get w.canvas "height")))

(* Lay the pond out inside the canvas as it is now: whole-pixel tiles, centred. *)
let layout w =
  let px_w, px_h = canvas_px w in
  let cols = float_of_int w.level.Level.w and rows = float_of_int w.level.Level.h in
  let tile = max 6.0 (floor (min (px_w /. (cols +. 0.6)) (px_h /. (rows +. 0.8)))) in
  w.tile <- tile;
  w.ox <- floor ((px_w -. (cols *. tile)) /. 2.0);
  w.oy <- floor ((px_h -. (rows *. tile)) /. 2.0)

let resize w =
  let css_w, css_h = css_box w in
  let dpr = Dom.float_of (Dom.get (Dom.global "window") "devicePixelRatio") in
  let dpr = if dpr > 0.0 then dpr else 1.0 in
  Dom.set w.canvas "width" (Dom.int (int_of_float (floor (css_w *. dpr))));
  Dom.set w.canvas "height" (Dom.int (int_of_float (floor (css_h *. dpr))));
  layout w;
  w.last_box <- (css_w, css_h)

(* Only re-fit when the box really changed, so a phone's toolbar cannot make
   the pond twitch. *)
let maybe_resize w =
  let css_w, css_h = css_box w in
  if abs_float (css_w -. fst w.last_box) > 1.0
     || abs_float (css_h -. snd w.last_box) > 1.0
  then resize w

let pointer w ev =
  let rect = Dom.call w.canvas "getBoundingClientRect" [||] in
  let scale = fst (canvas_px w) /. (max 1.0 (Dom.float_of (Dom.get rect "width"))) in
  ((Dom.float_of (Dom.get ev "clientX") -. Dom.float_of (Dom.get rect "left")) *. scale,
   (Dom.float_of (Dom.get ev "clientY") -. Dom.float_of (Dom.get rect "top")) *. scale)

let cell_at w (x, y) =
  let cx = int_of_float ((x -. w.ox) /. w.tile) and cy = int_of_float ((y -. w.oy) /. w.tile) in
  if cx >= 0 && cy >= 0 && cx < w.level.Level.w && cy < w.level.Level.h then
    Some ((cy * w.level.Level.w) + cx)
  else None

let cell_centre w cell =
  (w.ox +. ((float_of_int (Level.x_of w.level cell) +. 0.5) *. w.tile),
   w.oy +. ((float_of_int (Level.y_of w.level cell) +. 0.5) *. w.tile))

let ripple_point w point =
  w.ripples <- { Draw.rx = fst point; ry = snd point; born = clock () } :: w.ripples

let ripple_at w cell = ripple_point w (cell_centre w cell)
