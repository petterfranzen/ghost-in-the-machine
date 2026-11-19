(* Scratch: print one pond's tiles, the trail and the rule check at each step. *)
open Moondew_lib

let name_tile = function
  | Level.Moss -> "M" | Level.Water -> "." | Level.Deep -> "~"
  | Level.Dew -> "o" | Level.Current _ -> ">" | Level.Spring -> "S"

let () =
  let index = if Array.length Sys.argv > 1 then int_of_string Sys.argv.(1) else 1 in
  let l = Level.generate index in
  Printf.printf "pond %d %dx%d spring=%d dew=%d\n" index l.Level.w l.Level.h
    l.Level.spring l.Level.dew_total;
  for y = 0 to l.Level.h - 1 do
    for x = 0 to l.Level.w - 1 do
      Printf.printf "%s" (name_tile (Level.tile_at l (Level.idx l x y)))
    done;
    print_newline ()
  done;
  Printf.printf "trail (%d): " (Array.length l.Level.solution);
  Array.iter (fun c -> Printf.printf "%d:%s " c (name_tile (Level.tile_at l c)))
    l.Level.solution;
  print_newline ();
  let g = ref (Game.start l) in
  Array.iteri (fun k c ->
      if k > 0 then begin
        let prev = ref None in
        Array.iteri (fun j c2 -> if j = k - 1 then prev := Some c2) l.Level.solution;
        (match !prev with
         | Some p ->
           let dx = Level.x_of l c - Level.x_of l p
           and dy = Level.y_of l c - Level.y_of l p in
           let d = if dx = 1 then Level.E else if dx = -1 then Level.W
             else if dy = 1 then Level.S else Level.N in
           let head = Game.head !g in
           let next = Game.step !g d in
           if Game.head next = c then g := next
           else begin
             Printf.printf "step %d refused: head=%d(%s) want=%d(%s)\n" k head
               (name_tile (Level.tile_at l head)) c (name_tile (Level.tile_at l c));
             g := next
           end
         | None -> ())
      end) l.Level.solution
