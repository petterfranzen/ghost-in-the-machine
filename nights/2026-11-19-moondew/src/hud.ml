(* The pond's small DOM face: the label, the dew counter, the pond strip, the
   hint line, the banner and the start screen.  Plain DOM work, kept out of
   [main] so that file stays about the water. *)

let el id = Dom.element id

let set_text id s = Dom.set (el id) "textContent" (Dom.str s)

let show id v = Dom.set (el id) "hidden" (Dom.bool (not v))

let label_of index =
  if index <= Level.count_levels then
    Printf.sprintf "Pond %d of %d" index Level.count_levels
  else Printf.sprintf "Pond %d" index

let counter woken total =
  set_text "dew-counter" (Printf.sprintf "%d of %d dew awake" woken total)

let say msg =
  set_text "hint" msg;
  Dom.set (el "hint") "className" (Dom.str "hint")

let fade_hint () =
  Dom.ignore_call (Dom.get (el "hint") "classList") "add" [| Dom.str "faded" |]

let banner msg =
  set_text "banner" msg;
  Dom.ignore_call (Dom.get (el "banner") "classList") "add" [| Dom.str "show" |]

let hide_banner () =
  Dom.ignore_call (Dom.get (el "banner") "classList") "remove" [| Dom.str "show" |]

(* The pond strip: one flower per pond, built once, then lit as ponds finish.
   Each is a full 44 px tap target so a finished pond can be replayed. *)
let build_flowers () =
  let host = el "flowers" in
  for i = 1 to Level.count_levels do
    let node = Dom.call Dom.document "createElement" [| Dom.str "i" |] in
    Dom.set (Dom.get node "dataset") "index" (Dom.str (string_of_int i));
    Dom.ignore_call host "appendChild" [| node |]
  done

(* [done_n] ponds are finished; [current] is the pond on screen (0 for none). *)
let light_flowers done_n current =
  let coll = Dom.get (el "flowers") "children" in
  for i = 0 to Level.count_levels - 1 do
    let cls =
      if i + 1 = current then "now"
      else if i < done_n then "on"
      else ""
    in
    Dom.set (Dom.call coll "item" [| Dom.int i |]) "className" (Dom.str cls)
  done

(* Only name the rules this pond actually uses. *)
let legend level =
  let has t = Array.exists (fun x -> x = t) level.Level.cells in
  show "key-moss" (has Level.Moss);
  show "key-deep" (has Level.Deep);
  show "key-current"
    (Array.exists (function Level.Current _ -> true | _ -> false) level.cells)

let paint_sound on =
  set_text "sound" (if on then "Sound on" else "Sound off");
  Dom.set (el "sound") "aria-pressed" (Dom.bool on)

let show_start on = show "start" on

(* A quiet mirror of the pond's state on the canvas, so the end-to-end check
   can ask the app what it thinks instead of guessing from pixels. *)
let mirror g =
  let ds = Dom.get (el "pond") "dataset" in
  Dom.set ds "steps" (Dom.str (string_of_int g.Game.steps));
  Dom.set ds "dew" (Dom.str (Printf.sprintf "%d/%d" (Game.woken g) g.level.Level.dew_total));
  Dom.set ds "status" (Dom.str (match g.Game.status with
      | Game.Playing -> "playing" | Game.Won -> "won" | Game.Stilled -> "stilled"))
