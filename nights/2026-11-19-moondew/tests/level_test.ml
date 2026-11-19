(* Smoke checks for the pond generator and the rules: every generated level
   must be solvable by replaying the trail it was grown from. *)

open Moondew_lib

let failures = ref 0

let check name cond =
  if cond then Printf.printf "ok   %s\n" name
  else begin
    Printf.printf "FAIL %s\n" name;
    incr failures
  end

let direction level a b =
  let dx = Level.x_of level b - Level.x_of level a
  and dy = Level.y_of level b - Level.y_of level a in
  if dx = 1 then Level.E else if dx = -1 then Level.W
  else if dy = 1 then Level.S else Level.N

let replay level =
  let game = ref (Game.start level) in
  let refused = ref 0 in
  let steps = Array.length level.Level.solution in
  let k = ref 0 in
  while !k < steps - 1 && !game.Game.status = Game.Playing do
    let a = level.Level.solution.(!k) and b = level.Level.solution.(!k + 1) in
    let next = Game.step !game (direction level a b) in
    if Game.head next <> b then incr refused else game := next;
    incr k
  done;
  (!game, !refused)

let dew_cells level =
  Array.to_list level.Level.cells
  |> List.mapi (fun i t -> (i, t))
  |> List.filter (fun (_, t) -> t = Level.Dew)
  |> List.map fst

let walk_visits level =
  let n = Level.size level in
  let seen = Array.make n 0 in
  Array.iter (fun c -> seen.(c) <- seen.(c) + 1) level.Level.solution;
  seen

let check_level index =
  let level = Level.generate index in
  let tag = Printf.sprintf "pond %d (%dx%d)" index level.Level.w level.Level.h in
  let game, refused = replay level in
  let seen = walk_visits level in
  check (tag ^ ": the grown trail replays cleanly") (refused = 0);
  check (tag ^ ": replaying it wakes the pond") (game.Game.status = Game.Won);
  check (tag ^ ": the spring is the koi's stone")
    (Level.tile_at level level.Level.spring = Level.Spring);
  check (tag ^ ": every dew is on the trail, once") (
    let dew = dew_cells level in
    dew <> [] && List.for_all (fun c -> seen.(c) = 1) dew);
  check (tag ^ ": the dew count is what the pond promised")
    (level.Level.dew_total = List.length (dew_cells level));
  check (tag ^ ": the trail never crosses moss") (
    Array.for_all (fun c -> Level.tile_at level c <> Level.Moss) level.Level.solution);
  check (tag ^ ": a fresh game cannot step into moss") (
    Game.legal_steps (Game.start level) |> List.for_all (fun d ->
        match Level.neighbour level level.Level.spring d with
        | None -> true
        | Some j -> Level.tile_at level j <> Level.Moss))

let check_determinism () =
  let a = Level.generate 5 and b = Level.generate 5 in
  check "pond 5 grows the same twice" (a.Level.cells = b.Level.cells)

let check_endless () =
  List.iter (fun index ->
      let level = Level.generate index in
      let game, _ = replay level in
      check (Printf.sprintf "endless pond %d is winnable" index)
        (game.Game.status = Game.Won)) [ 13; 14; 21 ]

let () =
  for index = 1 to Level.count_levels do
    check_level index
  done;
  check_determinism ();
  check_endless ();
  if !failures = 0 then Printf.printf "\nall good\n"
  else Printf.printf "\n%d checks failed\n" !failures;
  exit (if !failures = 0 then 0 else 1)
