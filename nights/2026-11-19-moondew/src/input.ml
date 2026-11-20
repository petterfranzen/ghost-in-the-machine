open Water

(* Gestures, keys and the frame loop.  Dragging the head of the trail draws
   it; tapping the head (or the Undo button) takes a step back; touching
   anything else stirs the water and, if held, shows the way on. *)

let near_head w cell =
  let hx = Level.x_of w.level (Game.head w.game)
  and hy = Level.y_of w.level (Game.head w.game) in
  abs (Level.x_of w.level cell - hx) <= 1 && abs (Level.y_of w.level cell - hy) <= 1

(* A drag steps toward whichever cell the finger is over, so the trail
   follows the hand.  A cell the trail just came from is ignored, otherwise a
   finger resting on a boundary would keep trying to step back. *)
let towards w cell =
  let head = Game.head w.game in
  let dx = Level.x_of w.level cell - Level.x_of w.level head
  and dy = Level.y_of w.level cell - Level.y_of w.level head in
  if dx = 0 && dy = 0 then None
  else if abs dx > abs dy then Some (if dx > 0 then Level.E else Level.W)
  else Some (if dy > 0 then Level.S else Level.N)

let drag_towards w cell =
  let back = match w.game.Game.trail with _ :: b :: _ -> b | _ -> -1 in
  if cell <> back then
    match towards w cell with Some dir -> Pond.advance w dir | None -> ()

let distance (ax, ay) (bx, by) =
  sqrt (((ax -. bx) ** 2.0) +. ((ay -. by) ** 2.0))

let long_press w point =
  (match cell_at w point with
   | Some c when c <> Game.head w.game && c <> w.stir_cell ->
     w.stir_cell <- c;
     play w Audio.ripple_sound
   | _ -> ());
  ripple_point w point

let press w ev =
  if w.start_on_gesture then start_sound w;
  if w.started then begin
    let point = pointer w ev in
    w.dragging <- true;
    w.press_moved <- false;
    w.press_point <- point;
    w.long_fired <- false;
    w.press_at <- clock ();
    w.stir_cell <- -1;
    match cell_at w point with
    | Some cell when cell = Game.head w.game || near_head w cell ->
      w.can_drag <- true; ripple_point w point
    | Some _ -> w.can_drag <- false; long_press w point
    | None -> w.can_drag <- false; ripple_point w point
  end

let move w ev =
  if w.started && w.dragging then begin
    let point = pointer w ev in
    if distance point w.press_point > 12.0 then w.press_moved <- true;
    if w.can_drag then
      (match cell_at w point with Some cell -> drag_towards w cell | None -> ())
    else long_press w point
  end

let release w ev =
  if w.started && w.dragging then begin
    w.dragging <- false;
    let point = pointer w ev in
    if not w.press_moved then begin
      let dt = clock () -. w.press_at in
      if w.long_fired then Pond.do_hint w
      else if dt >= 0.4 then long_press w point
      else match cell_at w point with
        | Some cell when cell = Game.head w.game || near_head w cell -> Pond.undo w
        | _ -> ()
    end
  end

(* The pond strip: tapping a finished flower replays that pond. *)
let tap_flower w ev =
  let target = Dom.get ev "target" in
  if Dom.string_of (Dom.get target "tagName") = "I" then begin
    let index = Dom.int_of (Dom.get (Dom.get target "dataset") "index") in
    if index >= 1 && index <= min w.unlocked Level.count_levels then begin
      Pond.load w index;
      play w Audio.ripple_sound
    end
  end

let key w ev =
  if w.started then
    match Dom.string_of (Dom.get ev "key") with
    | "ArrowUp" -> Pond.advance w Level.N
    | "ArrowDown" -> Pond.advance w Level.S
    | "ArrowLeft" -> Pond.advance w Level.W
    | "ArrowRight" -> Pond.advance w Level.E
    | "z" | "u" | "Backspace" -> Pond.undo w
    | "h" -> Pond.do_hint w
    | "r" -> Pond.restart w
    | _ -> ()

(* ------------------------------------------------------------------ *)
(* The frame                                                          *)
(* ------------------------------------------------------------------ *)

(* A refused step nudges the whole pond by whole pixels only, and fades fast. *)
let shake_now w t =
  if w.shake_at > 0.0 then begin
    let e = Util.clamp 0.0 1.0 ((t -. w.shake_at) /. 0.42) in
    if e >= 1.0 then (w.shake_at <- 0.0; w.shake_x <- 0.0; w.shake_y <- 0.0)
    else begin
      let amp = 2.6 *. (1.0 -. e) in
      let ph = (t -. w.shake_at) *. 36.0 in
      w.shake_x <- amp *. sin ph;
      w.shake_y <- amp *. 0.35 *. sin (ph *. 1.25)
    end
  end

let update w t =
  w.frames <- w.frames + 1;
  let dt = Util.clamp 0.0 0.05 (t -. w.last) in
  w.last <- t;
  if not w.reduce then w.amb <- w.amb +. dt;
  if w.frames mod 20 = 0 then maybe_resize w;
  if w.bloom > 0.0 && w.bloom < 1.0 then w.bloom <- min 1.0 (w.bloom +. (dt *. 0.9));
  (match w.hint with Some _ when t > w.hint_until -> w.hint <- None | _ -> ());
  shake_now w t;
  if w.started && w.dragging && (not w.long_fired) && (not w.press_moved)
     && t -. w.press_at > 0.7 then begin
    w.long_fired <- true; Pond.do_hint w
  end;
  if w.started && w.game.Game.status = Game.Playing && w.game.Game.steps < 2
     && w.hint = None && t -. w.idle_at > 26.0 then begin
    w.idle_at <- t; Pond.do_hint w
  end;
  let due, pending = List.partition (fun (at, _) -> t >= at) w.timers in
  w.timers <- pending;
  List.iter (fun (_, f) -> f ()) due

let scene w t =
  Draw.scene
    { Draw.ctx = w.ctx; ox = w.ox; oy = w.oy; tile = w.tile; level = w.level;
      game = w.game; time = w.amb; now = t; ripples = w.ripples; motes = w.motes;
      hint = w.hint; bloom = w.bloom; swim = t -. w.swim_start;
      shake_x = w.shake_x; shake_y = w.shake_y }

let rec frame w _ =
  let t = clock () in
  update w t;
  scene w t;
  Dom.raf (frame w)

(* ------------------------------------------------------------------ *)
(* Boot                                                               *)
(* ------------------------------------------------------------------ *)

let motes_for index =
  let rng = Util.make_rng ((index * 31) + 7) in
  Array.init 10 (fun i ->
      { Draw.speed = 0.035 +. (Util.rand rng *. 0.055);
        salt = float_of_int (i * 13);
        hue = Util.rand_int rng 2 })

let wants_reduce () =
  try Dom.bool_of
        (Dom.get (Dom.call (Dom.global "window") "matchMedia"
                    [| Dom.str "(prefers-reduced-motion: reduce)" |]) "matches")
  with _ -> false

let watch_reduce w _ =
  if wants_reduce () then w.reduce <- true

let start_pond w =
  if not w.started then begin
    w.started <- true;
    if w.start_on_gesture then start_sound w;
    Pond.load w 1;
    later w 8.0 Hud.fade_hint
  end

let boot () =
  let canvas = Dom.element "pond" in
  let ctx = Dom.call canvas "getContext" [| Dom.str "2d" |] in
  let level = Level.generate 1 in
  let w = {
    canvas; ctx; level; game = Game.start level; ripples = []; motes = motes_for 1;
    bloom = 0.0; swim_start = 0.0; hint = None; hint_until = 0.0; still_at = 0.0;
    sound = false; engine = None; start_on_gesture = false; dragging = false;
    can_drag = false; press_at = 0.0; press_point = (0.0, 0.0); press_moved = false;
    long_fired = false; stir_cell = -1; idle_at = clock (); tile = 16.0; ox = 0.0;
    oy = 0.0; timers = []; last_box = (0.0, 0.0); frames = 0; started = false;
    unlocked = 1; reduce = wants_reduce (); amb = 0.0; last = clock ();
    shake_at = 0.0; shake_x = 0.0; shake_y = 0.0;
  } in
  Hud.build_flowers ();
  Hud.light_flowers 0 0;
  Hud.counter 0 level.Level.dew_total;
  Hud.legend level;
  Hud.set_text "pond-label" "Moondew";
  Hud.show_start true;
  if recall_sound () then (w.start_on_gesture <- true; w.sound <- true);
  Hud.paint_sound w.sound;
  resize w;
  Dom.on canvas "pointerdown" (press w);
  Dom.on canvas "pointermove" (move w);
  Dom.on canvas "pointerup" (release w);
  Dom.on canvas "pointercancel" (fun _ -> w.dragging <- false);
  Dom.on Dom.document "keydown" (key w);
  Dom.on (Dom.element "begin") "click" (fun _ -> start_pond w);
  Dom.on (Dom.element "sound") "click" (fun _ -> toggle_sound w);
  Dom.on (Dom.element "undo") "click" (fun _ -> if w.started then Pond.undo w);
  Dom.on (Dom.element "restart") "click" (fun _ -> if w.started then Pond.restart w);
  Dom.on (Dom.element "flowers") "click" (fun ev -> if w.started then tap_flower w ev);
  Dom.on (Dom.global "window") "resize" (fun _ -> resize w);
  Dom.on (Dom.global "window") "pageshow" (watch_reduce w);
  (try
     let mq = Dom.call (Dom.global "window") "matchMedia"
         [| Dom.str "(prefers-reduced-motion: reduce)" |] in
     Dom.on mq "change" (fun ev -> w.reduce <- Dom.bool_of (Dom.get ev "matches"))
   with _ -> ());
  Dom.on Dom.document "visibilitychange" (fun _ ->
      match w.engine with
      | Some a when w.sound -> Audio.resume a; Audio.set_on a true
      | _ -> ());
  Dom.raf (frame w)
