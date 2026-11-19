open Moondew_lib

(* Moondew: the wiring.  DOM, input, the frame loop, and the small story of a
   pond being woken. *)

let clock () = Dom.float_of (Dom.call (Dom.global "performance") "now" [||]) /. 1000.0

type world = {
  canvas : Dom.any;
  ctx : Dom.any;
  mutable level : Level.t;
  mutable game : Game.t;
  mutable ripples : Draw.ripple list;
  motes : Draw.mote array;
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
}

let play w f = match w.engine with Some a when w.sound -> f a | _ -> ()
let later w delay f = w.timers <- (clock () +. delay, f) :: w.timers

let label_of index =
  if index <= Level.count_levels then
    Printf.sprintf "Pond %d of %d" index Level.count_levels
  else Printf.sprintf "Pond %d" index

let say _w msg =
  let el = Dom.element "hint" in
  Dom.set el "textContent" (Dom.str msg);
  Dom.set el "className" (Dom.str "hint")

let fade_hint () =
  Dom.ignore_call (Dom.get (Dom.element "hint") "classList") "add" [| Dom.str "faded" |]

(* ------------------------------------------------------------------ *)
(* Sound                                                              *)
(* ------------------------------------------------------------------ *)

let engine w =
  match w.engine with
  | Some a -> a
  | None -> let a = Audio.create () in w.engine <- Some a; a

let paint_sound w =
  let el = Dom.element "sound" in
  Dom.set el "textContent" (Dom.str (if w.sound then "Sound on" else "Sound off"));
  Dom.set el "aria-pressed" (Dom.bool w.sound)

let start_sound w =
  let a = engine w in
  Audio.resume a;
  Audio.set_on a true;
  Audio.wake a;
  w.sound <- true;
  w.start_on_gesture <- false;
  paint_sound w

let stop_sound w =
  (match w.engine with Some a -> Audio.set_on a false | None -> ());
  w.sound <- false;
  paint_sound w

let storage () = Dom.global "localStorage"

let store_sound on =
  try
    let args = [| Dom.str "moondew.sound"; Dom.str (if on then "on" else "off") |] in
    ignore (Dom.call (storage ()) "setItem" args)
  with _ -> ()

let recall_sound () =
  try
    let got = Dom.call (storage ()) "getItem" [| Dom.str "moondew.sound" |] in
    match Dom.string_of got with
    | "on" -> true
    | _ -> false
  with _ -> false

(* ------------------------------------------------------------------ *)
(* HUD                                                                *)
(* ------------------------------------------------------------------ *)

let build_flowers () =
  let host = Dom.element "flowers" in
  for _ = 1 to Level.count_levels do
    Dom.ignore_call host "appendChild"
      [| Dom.call Dom.document "createElement" [| Dom.str "i" |] |]
  done

let light_flowers n =
  let coll = Dom.get (Dom.element "flowers") "children" in
  for i = 0 to Level.count_levels - 1 do
    Dom.set (Dom.call coll "item" [| Dom.int i |]) "className"
      (Dom.str (if i < n then "on" else ""))
  done

let show_legend level =
  let has_deep = Array.exists (fun t -> t = Level.Deep) level.Level.cells in
  let has_current =
    Array.exists (function Level.Current _ -> true | _ -> false) level.cells in
  Dom.set (Dom.element "key-deep") "hidden" (Dom.bool (not has_deep));
  Dom.set (Dom.element "key-current") "hidden" (Dom.bool (not has_current))

(* ------------------------------------------------------------------ *)
(* Layout                                                             *)
(* ------------------------------------------------------------------ *)

let css_box w =
  let rect = Dom.call w.canvas "getBoundingClientRect" [||] in
  let rect_w = max 1.0 (Dom.float_of (Dom.get rect "width")) in
  (Dom.float_of (Dom.get rect "width"), Dom.float_of (Dom.get rect "height"),
   float_of_int (Dom.int_of (Dom.get w.canvas "width")) /. rect_w)

let resize w =
  let css_w, css_h, _ = css_box w in
  let dpr = Dom.float_of (Dom.get (Dom.global "window") "devicePixelRatio") in
  Dom.set w.canvas "width" (Dom.int (int_of_float (css_w *. dpr)));
  Dom.set w.canvas "height" (Dom.int (int_of_float (css_h *. dpr)));
  let px_w = float_of_int (Dom.int_of (Dom.get w.canvas "width")) in
  let px_h = float_of_int (Dom.int_of (Dom.get w.canvas "height")) in
  let cols = float_of_int w.level.Level.w and rows = float_of_int w.level.Level.h in
  let tile = max 6.0 (floor (min (px_w /. (cols +. 0.7)) (px_h /. (rows +. 0.9)))) in
  w.tile <- tile;
  w.ox <- floor ((px_w -. (cols *. tile)) /. 2.0);
  w.oy <- floor (((px_h -. (rows *. tile)) /. 2.0) -. (tile *. 0.25));
  w.last_box <- (css_w, css_h)

(* The stage can settle late (fonts, the phone bar); check its size now and
   then rather than trusting the first measurement. *)
let maybe_resize w =
  let css_w, css_h, _ = css_box w in
  if abs_float (css_w -. fst w.last_box) > 1.0 || abs_float (css_h -. snd w.last_box) > 1.0
  then begin
    w.last_box <- (css_w, css_h);
    resize w
  end

(* Device-pixel position of the pointer, and the cell under it. *)
let pointer w ev =
  let _, _, scale = css_box w in
  (Dom.float_of (Dom.get ev "offsetX") *. scale, Dom.float_of (Dom.get ev "offsetY") *. scale)

let cell_at w point =
  let x, y = point in
  let cx = int_of_float (floor ((x -. w.ox) /. w.tile))
  and cy = int_of_float (floor ((y -. w.oy) /. w.tile)) in
  if Level.in_bounds w.level cx cy then Some (Level.idx w.level cx cy) else None

let ripple_point w (x, y) = w.ripples <- { Draw.rx = x; ry = y; born = clock () } :: w.ripples

let ripple_at w cell =
  w.ripples <-
    { Draw.rx = w.ox +. ((float_of_int (Level.x_of w.level cell) +. 0.5) *. w.tile);
      ry = w.oy +. ((float_of_int (Level.y_of w.level cell) +. 0.5) *. w.tile);
      born = clock () } :: w.ripples

let near_head w cell =
  let head = Game.head w.game in
  Level.neighbours w.level head |> List.exists (fun j -> j = cell)

(* ------------------------------------------------------------------ *)
(* Playing                                                            *)
(* ------------------------------------------------------------------ *)

let load w index =
  let level = Level.generate index in
  w.level <- level;
  w.game <- Game.start level;
  (* a drag that was under way when the pond changed must not follow onto the new one *)
  w.dragging <- false;
  w.can_drag <- false;
  w.ripples <- [];
  w.hint <- None;
  w.bloom <- 0.0;
  w.still_at <- 0.0;
  w.idle_at <- clock ();
  w.timers <- [];
  Dom.set (Dom.element "pond-label") "textContent" (Dom.str (label_of index));
  (* while you play pond k, the flowers show the k-1 ponds already woken *)
  light_flowers (min (index - 1) Level.count_levels);
  show_legend level;
  say w (if index <= Level.count_levels then level.Level.caption else "the pond keeps growing");
  resize w

let wake_pond w =
  w.bloom <- 0.0001;
  w.swim_start <- clock ();
  play w Audio.bloom;
  say w "the pond is awake";
  light_flowers (min w.level.Level.index Level.count_levels);
  let next = w.level.Level.index + 1 in
  later w 3.8 (fun () ->
      load w next;
      if next > Level.count_levels then say w "the pond keeps going")

let still_water w =
  w.still_at <- clock ();
  play w Audio.still;
  say w "the water stills - begin again";
  later w 1.8 (fun () ->
      w.game <- Game.start w.level;
      w.hint <- None;
      w.idle_at <- clock ();
      play w Audio.ripple_sound;
      say w "drag from the koi")

let advance w dir =
  let before = w.game in
  let g = Game.step before dir in
  if g.Game.steps > before.Game.steps then begin
    let landed = Game.head g in
    w.game <- g;
    w.idle_at <- clock ();
    (match Level.tile_at w.level landed with
     | Level.Dew -> play w (fun a -> Audio.dew_chime a (Game.woken g))
     | _ -> play w (fun a -> Audio.step_note a (g.Game.steps)));
    play w (fun a -> Audio.mood a ~trail:(float_of_int g.Game.steps) ~woken:(Game.woken g)
                       ~total:w.level.Level.dew_total);
    (match g.Game.status with
     | Game.Won -> wake_pond w
     | Game.Stilled -> still_water w
     | Game.Playing -> ())
  end else begin
    play w Audio.moss_thud;
    match Level.neighbour w.level (Game.head before) dir with
    | Some j -> ripple_at w j
    | None -> ()
  end

let towards w cell =
  let head = Game.head w.game in
  let dx = Level.x_of w.level cell - Level.x_of w.level head
  and dy = Level.y_of w.level cell - Level.y_of w.level head in
  if dx = 0 && dy = 0 then None
  else if abs dx > abs dy then Some (if dx > 0 then Level.E else Level.W)
  else Some (if dy > 0 then Level.S else Level.N)

let drag_towards w cell =
  match towards w cell with Some dir -> advance w dir | None -> ()

let do_hint w =
  match Game.hint w.game with
  | Some (cell, kind) ->
    w.hint <- Some (cell, kind);
    w.hint_until <- clock () +. 5.0;
    play w (fun a -> Audio.step_note a 3);
    say w (match kind with
        | `Along -> "the dew leads on"
        | `Fresh -> "the koi remembers the way")
  | None -> say w "that trail has drifted - tap the head to step back"

let undo w =
  let g = Game.undo w.game in
  if g.Game.steps < w.game.Game.steps then begin
    w.game <- g;
    w.idle_at <- clock ();
    play w Audio.ripple_sound
  end

(* ------------------------------------------------------------------ *)
(* Events                                                             *)
(* ------------------------------------------------------------------ *)

let stir w point =
  match cell_at w point with
  | Some cell when cell <> w.stir_cell ->
    w.stir_cell <- cell;
    ripple_point w point;
    play w (fun a -> if not (Util.chance (Util.make_rng cell) 0.35) then () else
               Audio.koi_plop a)
  | _ -> ()

let distance (ax, ay) (bx, by) = sqrt (((ax -. bx) ** 2.0) +. ((ay -. by) ** 2.0))

let press w ev =
  let point = pointer w ev in
  w.dragging <- true;
  w.press_moved <- false;
  w.press_point <- point;
  w.long_fired <- false;
  w.press_at <- clock ();
  w.stir_cell <- -1;
  if w.start_on_gesture then start_sound w;
  match cell_at w point with
  | Some cell when cell = Game.head w.game || near_head w cell ->
    w.can_drag <- true;
    ripple_point w point
  | Some _ ->
    w.can_drag <- false;
    stir w point
  | None ->
    w.can_drag <- false;
    ripple_point w point

let move w ev =
  if w.dragging then begin
    let point = pointer w ev in
    if distance point w.press_point > 12.0 then w.press_moved <- true;
    if w.can_drag then
      (match cell_at w point with Some cell -> drag_towards w cell | None -> ())
    else stir w point
  end

let release w ev =
  if w.dragging then begin
    w.dragging <- false;
    let point = pointer w ev in
    match cell_at w point with
    | Some cell when cell = Game.head w.game && not w.press_moved -> undo w
    | Some _ when not w.press_moved -> ripple_point w point; play w Audio.ripple_sound
    | _ -> ()
  end

let key w ev =
  match Dom.string_of (Dom.get ev "key") with
  | "ArrowUp" -> advance w Level.N
  | "ArrowDown" -> advance w Level.S
  | "ArrowLeft" -> advance w Level.W
  | "ArrowRight" -> advance w Level.E
  | "z" | "Backspace" -> undo w
  | "h" -> do_hint w
  | "r" -> w.game <- Game.start w.level; say w "a fresh start"
  | _ -> ()

(* ------------------------------------------------------------------ *)
(* Frame                                                              *)
(* ------------------------------------------------------------------ *)

let update w t =
  w.frames <- w.frames + 1;
  if w.frames mod 20 = 0 then maybe_resize w;
  if w.bloom > 0.0 && w.bloom < 1.0 then w.bloom <- min 1.0 (w.bloom +. 0.02);
  (match w.hint with Some _ when t > w.hint_until -> w.hint <- None | _ -> ());
  if w.dragging && (not w.long_fired) && (not w.press_moved) && t -. w.press_at > 0.6 then begin
    w.long_fired <- true;
    do_hint w
  end;
  if t -. w.idle_at > 24.0 && w.game.Game.status = Game.Playing
     && w.game.Game.steps < 2 && w.hint = None then begin
    w.idle_at <- t;
    do_hint w
  end;
  let due, pending = List.partition (fun (at, _) -> t >= at) w.timers in
  w.timers <- pending;
  List.iter (fun (_, f) -> f ()) due

let scene w t =
  Draw.scene
    { Draw.ctx = w.ctx; ox = w.ox; oy = w.oy; tile = w.tile; level = w.level;
      game = w.game; time = t; ripples = w.ripples; motes = w.motes;
      hint = w.hint; bloom = w.bloom; swim = t -. w.swim_start }

let rec frame w (_ : float) =
  let t = clock () in
  update w t;
  scene w t;
  w.ripples <- List.filter (fun r -> t -. r.Draw.born < 1.9) w.ripples;
  Dom.raf (frame w)

(* ------------------------------------------------------------------ *)
(* Boot                                                               *)
(* ------------------------------------------------------------------ *)

let motes_for index =
  let rng = Util.make_rng ((index * 31) + 7) in
  Array.init 16 (fun i ->
      { Draw.speed = 0.05 +. (Util.rand rng *. 0.12);
        salt = float_of_int (i * 13); hue = Util.rand_int rng 2 })

let boot () =
  let canvas = Dom.element "pond" in
  let ctx = Dom.call canvas "getContext" [| Dom.str "2d" |] in
  let level = Level.generate 1 in
  let w = { canvas; ctx; level; game = Game.start level; ripples = [];
            motes = motes_for 1; bloom = 0.0; swim_start = 0.0; hint = None;
            hint_until = 0.0; still_at = 0.0; sound = false; engine = None;
            start_on_gesture = false; dragging = false; can_drag = true;
            press_at = 0.0; press_point = (0.0, 0.0); press_moved = false;
            long_fired = false; stir_cell = -1;
            idle_at = clock (); tile = 16.0; ox = 0.0; oy = 0.0; timers = [];
            last_box = (0.0, 0.0); frames = 0 } in
  build_flowers ();
  load w 1;
  if recall_sound () then begin
    w.start_on_gesture <- true;
    w.sound <- true
  end;
  paint_sound w;
  Dom.on canvas "pointerdown" (press w);
  Dom.on canvas "pointermove" (move w);
  Dom.on canvas "pointerup" (release w);
  Dom.on canvas "pointercancel" (fun _ -> w.dragging <- false);
  Dom.on canvas "contextmenu" (fun _ -> ());
  Dom.on Dom.document "keydown" (key w);
  Dom.on (Dom.global "window") "resize" (fun _ -> resize w);
  Dom.on Dom.document "visibilitychange" (fun _ ->
      match w.engine with
      | Some a when w.sound -> Audio.resume a; Audio.set_on a true
      | _ -> ());
  Dom.on (Dom.element "sound") "click" (fun _ ->
      if w.sound then (store_sound false; stop_sound w)
      else (store_sound true; start_sound w));
  later w 7.0 fade_hint;
  Dom.raf (frame w)

let () = boot ()
