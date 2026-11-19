(* Prints every pond's solution as a string of steps, for the e2e check:
   one line per pond, "N/E/S/W" from the koi's stone to the last dew. *)

open Moondew_lib

let letter = function
  | Level.N -> 'N'
  | Level.E -> 'E'
  | Level.S -> 'S'
  | Level.W -> 'W'

let step level a b =
  let dx = Level.x_of level b - Level.x_of level a
  and dy = Level.y_of level b - Level.y_of level a in
  if dx = 1 then Level.E else if dx = -1 then Level.W
  else if dy = 1 then Level.S else Level.N

let () =
  let last = match Sys.argv with
    | [| _; n |] -> int_of_string n
    | _ -> Level.count_levels in
  for index = 1 to last do
    let level = Level.generate index in
    let steps = Array.length level.Level.solution in
    let buf = Buffer.create steps in
    for k = 0 to steps - 2 do
      Buffer.add_char buf (letter (step level level.Level.solution.(k) level.Level.solution.(k + 1)))
    done;
    Printf.printf "%d %dx%d %s\n" index level.Level.w level.Level.h (Buffer.contents buf)
  done
