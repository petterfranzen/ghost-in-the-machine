open Water

(* A pond's life: growing one, waking it, and the small answers it gives when
   a step is refused.  Nothing is timed; the water only replies. *)

let load w index =
  let level = Level.generate index in
  w.level <- level;
  w.game <- Game.start level;
  w.dragging <- false;
  w.can_drag <- false;
  w.ripples <- [];
  w.hint <- None;
  w.bloom <- 0.0;
  w.still_at <- 0.0;
  w.shake_at <- 0.0;
  w.shake_x <- 0.0;
  w.shake_y <- 0.0;
  w.idle_at <- clock ();
  w.timers <- [];
  w.unlocked <- max w.unlocked index;
  Hud.show_start false;
  Hud.hide_banner ();
  Hud.set_text "pond-label" (Hud.label_of index);
  Hud.light_flowers (min (max 0 (w.unlocked - 1)) Level.count_levels) index;
  Hud.legend level;
  Hud.counter 0 level.Level.dew_total;
  Hud.mirror w.game;
  Hud.say level.Level.caption;
  layout w

(* The pond is awake: say so plainly, then bring the next one in. *)
let wake_pond w =
  let index = w.level.Level.index in
  w.bloom <- 0.0001;
  w.swim_start <- clock ();
  w.unlocked <- max w.unlocked (index + 1);
  play w Audio.bloom;
  Hud.banner (Printf.sprintf "Pond %d awake - every dew is lit" index);
  Hud.light_flowers (min (max 0 (w.unlocked - 1)) Level.count_levels) 0;
  later w 2.6 (fun () ->
      Hud.hide_banner ();
      load w (index + 1);
      if index + 1 > Level.count_levels then
        Hud.say "every pond is awake - the water keeps going")

let still_water w =
  w.still_at <- clock ();
  play w Audio.still;
  Hud.banner "The trail is walled in - it drifts back";
  Hud.say "no way on - the trail drifts back to the koi";
  later w 1.8 (fun () ->
      Hud.hide_banner ();
      w.game <- Game.start w.level;
      w.hint <- None;
      w.idle_at <- clock ();
      Hud.counter 0 w.level.Level.dew_total;
      Hud.mirror w.game;
      play w Audio.ripple_sound;
      Hud.say w.level.Level.caption)

(* A refused step: a gentle shake and a soft answer that names the rule. *)
let refuse w before dir =
  match Game.refusal w.level w.game.Game.visits (Game.head before) dir with
  | None -> ()
  | reason ->
    w.shake_at <- clock ();
    (match reason with
     | Some Game.Moss -> play w Audio.moss_thud
     | _ -> play w Audio.refuse);
    (match Level.neighbour w.level (Game.head before) dir with
     | Some j -> ripple_at w j
     | None -> ())

let advance w dir =
  let before = w.game in
  let g = Game.step before dir in
  if g.Game.steps > before.Game.steps then begin
    w.game <- g;
    w.idle_at <- clock ();
    Hud.counter (Game.woken g) w.level.Level.dew_total;
    Hud.mirror g;
    (match Level.tile_at w.level (Game.head g) with
     | Level.Dew -> play w (fun a -> Audio.dew_chime a (Game.woken g))
     | _ -> play w (fun a -> Audio.step_note a g.Game.steps));
    play w (fun a -> Audio.mood a ~trail:(float_of_int g.Game.steps)
                      ~woken:(Game.woken g) ~total:w.level.Level.dew_total);
    match g.Game.status with
    | Game.Won -> wake_pond w
    | Game.Stilled -> still_water w
    | Game.Playing -> ()
  end
  else refuse w before dir

let undo w =
  let g = Game.undo w.game in
  if g.Game.steps < w.game.Game.steps then begin
    w.game <- g;
    w.idle_at <- clock ();
    Hud.counter (Game.woken g) w.level.Level.dew_total;
    Hud.mirror g;
    play w Audio.ripple_sound
  end

let restart w =
  w.game <- Game.start w.level;
  w.hint <- None;
  w.bloom <- 0.0;
  w.ripples <- [];
  w.idle_at <- clock ();
  Hud.hide_banner ();
  Hud.counter 0 w.level.Level.dew_total;
  Hud.mirror w.game;
  Hud.say w.level.Level.caption;
  play w Audio.ripple_sound

(* A held touch shows the way on: a small mark for a few seconds, and the
   hint line says what it is before the pond's own rule comes back. *)
let do_hint w =
  let restore () = Hud.say w.level.Level.caption in
  match Game.hint w.game with
  | None ->
    Hud.say "that trail has drifted - tap the head to step back";
    later w 4.0 restore
  | Some (cell, kind) ->
    w.hint <- Some (cell, kind);
    w.hint_until <- clock () +. 4.0;
    play w Audio.ripple_sound;
    Hud.say (match kind with
        | `Along -> "the dew leads on"
        | `Fresh -> "the koi remembers the way");
    later w 4.0 restore
