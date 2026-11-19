(* Ponds and how they are grown.

   A pond is a small grid of stone tiles.  A level is generated backwards: a
   random trail is walked first, and the puzzle is read off it, so every level
   is solvable by construction (the trail that made it is the solution). *)

type dir = N | E | S | W

let dirs = [| N; E; S; W |]

let delta = function N -> (0, -1) | E -> (1, 0) | S -> (0, 1) | W -> (-1, 0)

type tile =
  | Moss                       (* cannot be entered *)
  | Water                      (* once only: the trail may not cross it twice *)
  | Deep                       (* the trail may cross it again *)
  | Dew                        (* woken once; the stone blocks afterwards *)
  | Current of dir             (* once only, and the trail must leave with the flow *)
  | Spring                     (* the koi's stone, always open, where the trail starts *)

type t = {
  index : int;
  w : int;
  h : int;
  cells : tile array;
  spring : int;
  dew_total : int;
  caption : string;
  solution : int array;
}

let size l = l.w * l.h
let idx l x y = (y * l.w) + x
let x_of l i = i mod l.w
let y_of l i = i / l.w
let in_bounds l x y = x >= 0 && y >= 0 && x < l.w && y < l.h

let tile_at l i =
  if i < 0 || i >= Array.length l.cells then Moss else l.cells.(i)

let neighbour l i d =
  let dx, dy = delta d in
  let x = x_of l i + dx and y = y_of l i + dy in
  if in_bounds l x y then Some (idx l x y) else None

let neighbours l i = Array.to_list dirs |> List.filter_map (neighbour l i)

(* One night's shape. *)
type spec = {
  size : int * int;
  dew : int;
  moss : int;            (* percent of the cells the trail never touched *)
  deep : bool;           (* may the trail cross itself? *)
  current : bool;
  caption : string;
}

let table = [|
  { size = (4, 4); dew = 5; moss = 0; deep = false; current = false;
    caption = "one trail, every dew" };
  { size = (5, 5); dew = 6; moss = 10; deep = false; current = false;
    caption = "moss will not take a step" };
  { size = (5, 6); dew = 7; moss = 15; deep = true; current = false;
    caption = "deep water: the trail may cross itself" };
  { size = (6, 6); dew = 8; moss = 15; deep = true; current = false;
    caption = "a wider pond" };
  { size = (6, 6); dew = 9; moss = 20; deep = true; current = true;
    caption = "a current runs: leave the way it flows" };
  { size = (6, 7); dew = 10; moss = 20; deep = true; current = true;
    caption = "the koi is patient" };
  { size = (7, 7); dew = 11; moss = 22; deep = true; current = true;
    caption = "the reeds close in" };
  { size = (7, 7); dew = 12; moss = 22; deep = true; current = true;
    caption = "keep the trail open" };
  { size = (7, 8); dew = 13; moss = 24; deep = true; current = true;
    caption = "the long shore" };
  { size = (8, 8); dew = 14; moss = 24; deep = true; current = true;
    caption = "the far bank" };
  { size = (8, 8); dew = 15; moss = 26; deep = true; current = true;
    caption = "a still, wide pond" };
  { size = (8, 9); dew = 16; moss = 26; deep = true; current = true;
    caption = "the last pond" };
|]

let count_levels = Array.length table

let spec_of index =
  if index <= count_levels then table.(index - 1)
  else
    { size = ((9, 9)); dew = 17 + (index - count_levels); moss = 26;
      deep = true; current = true; caption = "the pond keeps growing" }

(* ------------------------------------------------------------------ *)
(* Growing the trail                                                   *)
(* ------------------------------------------------------------------ *)

let spring_of w h = ((w / 2) * 1) + ((h - 1) * w)

(* How many neighbours of [i] the trail has not touched yet: a cell with the
   fewest ways out is the best pick, because walking it last keeps the trail
   from cornering itself. *)
let openness visits l i =
  neighbours l i
  |> List.filter (fun j -> visits.(j) = 0)
  |> List.length

let pick_fresh rng visits l i =
  let fresh = neighbours l i |> List.filter (fun j -> visits.(j) = 0) in
  match fresh with
  | [] -> None
  | _ ->
    let best = List.fold_left (fun acc j -> min acc (openness visits l j)) 99 fresh in
    let good = List.filter (fun j -> openness visits l j = best) fresh in
    Some (List.nth good (Util.rand_int rng (List.length good)))

let pick_wet rng visits l i =
  let wet = neighbours l i
            |> List.filter (fun j -> visits.(j) > 0) in
  match wet with
  | [] -> None
  | _ -> Some (List.nth wet (Util.rand_int rng (List.length wet)))

(* The trail grows until it can no longer move: a path that prefers the
   neighbours with the fewest ways on, so it wanders instead of cornering
   itself.  While the pond is deep the trail may also cross itself, but only
   a few times, and each crossing turns that stone into deep water. *)

let walk rng spec spring =
  let l = { index = 0; w = fst spec.size; h = snd spec.size; cells = [||];
            spring; dew_total = 0; caption = ""; solution = [||] } in
  let visits = Array.make (size l) 0 in
  visits.(spring) <- 1;
  let crossings = ref (if spec.deep then max 2 (size l / 6) else 0) in
  let rec loop pos order fuel =
    if fuel <= 0 then order
    else
      let wet () =
        if !crossings <= 0 then None
        else match pick_wet rng visits l pos with
          | Some j -> decr crossings; Some j
          | None -> None
      in
      let next =
        match pick_fresh rng visits l pos with
        | Some j when spec.deep && Util.chance rng 0.15 ->
          (match wet () with Some k -> Some k | None -> Some j)
        | Some j -> Some j
        | None -> wet ()
      in
      match next with
      | None -> order
      | Some j -> visits.(j) <- visits.(j) + 1; loop j (j :: order) (fuel - 1)
  in
  let order = loop spring [ spring ] (size l * 6) in
  (Array.of_list (List.rev order), visits)

(* ------------------------------------------------------------------ *)

let choose rng skip visits n =
  let once = ref [] in
  Array.iteri (fun i v -> if v = 1 && i <> skip then once := i :: !once) visits;
  let candidates = Array.of_list !once in
  Util.shuffle rng candidates;
  Array.sub candidates 0 (min n (Array.length candidates))

(* A straight run of the walk can carry a current.  The walk left the cell the
   way the arrow points, so the solution still respects it. *)
let currents rng spec path =
  if not spec.current then []
  else
    let found = ref [] in
    for k = 1 to Array.length path - 2 do
      let p = path.(k - 1) and c = path.(k) and n = path.(k + 1) in
      let d1 = c - p and d2 = n - c in
      if d1 = d2 then found := (c, d1) :: !found
    done;
    let a = Array.of_list !found in
    Util.shuffle rng a;
    Array.to_list (Array.sub a 0 (min 5 (Array.length a)))

let direction_of_step l a b =
  let dx = x_of l b - x_of l a and dy = y_of l b - y_of l a in
  if dx > 0 then E else if dx < 0 then W else if dy > 0 then S else N

let generate index =
  let spec = spec_of index in
  let rng = Util.make_rng ((index * 7919) + 31) in
  let w, h = spec.size in
  let cells = Array.make (w * h) Water in
  let shape = { index; w; h; cells; spring = 0; dew_total = 0;
                caption = spec.caption; solution = [||] } in
  let spring = spring_of w h in
  let path, visits = walk rng spec spring in
  let shape = { shape with spring } in
  let dew = choose rng spring visits spec.dew in
  let straight = currents rng spec path |> List.map (fun (c, step) ->
      let next = c + step in
      (c, direction_of_step shape c next)) in
  Array.iteri (fun i v ->
      let was_dew = Array.exists (fun d -> d = i) dew in
      let current = List.assoc_opt i straight in
      cells.(i) <-
        if i = spring then Spring
        else if v = 0 then (if Util.rand_int rng 100 < spec.moss then Moss else Water)
        else if v > 1 then Deep
        else if was_dew then Dew
        else match current with Some d -> Current d | None -> Water) visits;
  { shape with cells; dew_total = Array.length dew; solution = path }
