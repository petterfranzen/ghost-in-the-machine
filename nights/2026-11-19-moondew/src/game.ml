(* The rules of the water.

   One trail, starting at the koi's stone.  Moss refuses it; open water takes
   a single step; deep water may be crossed again; dew is woken once and then
   closes behind you; a current must be left the way it flows.  The pond is
   woken when every dew has been touched, and stills when the trail can no
   longer move with dew left to find. *)

type status = Playing | Won | Stilled

(* Why a step was turned away.  Each has its own small answer, so a refused
   move teaches the rule it broke instead of just doing nothing. *)
type refusal = Edge | Moss | Taken | Flow

type t = {
  level : Level.t;
  trail : int list;             (* head first, the spring last *)
  visits : int array;
  dew_left : int;
  status : status;
  steps : int;
}

let open_cell level visits i =
  match Level.tile_at level i with
  | Level.Moss -> false
  | Level.Deep | Level.Spring -> true
  | Level.Water | Level.Dew | Level.Current _ -> visits.(i) = 0

let head g = List.hd g.trail

(* A current only lets the trail leave with the flow. *)
let with_flow level i d =
  match Level.tile_at level i with
  | Level.Current wanted -> wanted = d
  | _ -> true

let can_step level visits i d = with_flow level i d &&
  (match Level.neighbour level i d with
   | None -> false
   | Some j -> open_cell level visits j)

let has_move level visits i =
  Array.exists (fun d -> can_step level visits i d) Level.dirs

(* The rule a refused step broke.  [None] means the step is legal. *)
let refusal level visits i d =
  if not (with_flow level i d) then Some Flow
  else match Level.neighbour level i d with
    | None -> Some Edge
    | Some j ->
      (match Level.tile_at level j with
       | Level.Moss -> Some Moss
       | Level.Deep | Level.Spring -> None
       | Level.Water | Level.Dew | Level.Current _ ->
         if visits.(j) = 0 then None else Some Taken)

let legal_steps g =
  Array.to_list Level.dirs |> List.filter (can_step g.level g.visits (head g))

let of_trail level trail =
  let visits = Array.make (Level.size level) 0 in
  List.iter (fun i -> visits.(i) <- visits.(i) + 1) trail;
  let dew_left = ref 0 in
  Array.iteri (fun i tile ->
      if tile = Level.Dew && visits.(i) = 0 then incr dew_left) level.cells;
  let status =
    if !dew_left = 0 then Won
    else if has_move level visits (List.hd trail) then Playing
    else Stilled
  in
  { level; trail; visits; dew_left = !dew_left; status;
    steps = List.length trail - 1 }

let start level = of_trail level [ level.spring ]

let step g d =
  match Level.neighbour g.level (head g) d with
  | Some j when g.status = Playing && can_step g.level g.visits (head g) d ->
    of_trail g.level (j :: g.trail)
  | _ -> g

let undo g =
  match g.trail with
  | _ :: (_ :: _ as rest) -> of_trail g.level rest
  | _ -> g

let woken g = g.level.dew_total - g.dew_left

(* The trail the pond was grown from: find the part of it the player has
   already followed and point one step further along. *)
let hint g =
  let trail = Array.of_list (List.rev g.trail) in
  let solution = g.level.solution in
  let slen = Array.length solution and tlen = Array.length trail in
  let found = ref None in
  for s = 0 to slen - tlen do
    let same = ref true in
    for k = 0 to tlen - 1 do
      if solution.(s + k) <> trail.(k) then same := false
    done;
    if !same && s + tlen < slen then found := Some solution.(s + tlen)
  done;
  match !found with
  | Some cell -> Some (cell, `Along)
  | None ->
    if tlen <= 1 && slen > 1 then Some (solution.(1), `Fresh)
    else None
