(* Night-pond colours, kept soft.  Flat hex strings keep the renderer simple;
   the canvas takes them straight.  Everything here is a few steps down from
   full saturation, so the pond reads as moonlight rather than neon. *)

let bg_top = "#101c2d"
let bg_bottom = "#0a111d"

let moss = [| "#2b4139"; "#334b41"; "#233329" |]
let water = [| "#1b3049"; "#1e3550"; "#172a40" |]
let deep = [| "#15424f"; "#194b58"; "#123743" |]
let current = "#2a5f66"

let stone = "#3a485a"
let grid = "rgba(150, 196, 232, 0.13)"
let spring = "#4a4032"
let spring_lit = "#c9a878"
let koi_body = "#dde4ec"
let koi_fin = "#d3a2ab"
let koi_spot = "#bf6a48"

let dew = "#a6d3ec"
let dew_core = "#e6f2fa"
let dew_dim = "#54708a"
let trail = "#8ecbe6"
let trail_glow = "rgba(142, 203, 230, 0.10)"
let trail_mid = "rgba(122, 188, 224, 0.40)"
let flower = "#dcc0d6"
let mote = "#e6d3a2"
let glint = "#ecdcb0"
