(* The pond's voice: a small Web Audio engine, synthesised from scratch.

   A bed of three layers (filtered noise for the water, two detuned
   oscillators for the pad, and a slow tremolo) runs while sound is on, and
   every gesture gets its own short voice.  Everything ends in a limiter so
   many sounds at once stay calm. *)

type t = {
  ac : Dom.any;                  (* AudioContext *)
  master : Dom.any;              (* gain, the whole pond *)
  bed : Dom.any;                 (* gain, the ambient bed *)
  water : Dom.any;               (* gain, noise layer *)
  pad : Dom.any;                 (* gain, pad layer *)
  noise : Dom.any;               (* AudioBuffer, reused by the noise voices *)
  mutable running : bool;
}

let now t = Dom.float_of (Dom.get t.ac "currentTime")
let connect a b = Dom.ignore_call a "connect" [| b |]
let param node key = Dom.get node key

let set_value p v = Dom.ignore_call p "setValueAtTime" [| Dom.num v; Dom.num 0.0 |]
let ramp p v at = Dom.ignore_call p "linearRampToValueAtTime" [| Dom.num v; Dom.num at |]

let gain_node t = Dom.call t.ac "createGain" [||]

(* Attack then long decay: calmer than a hard start, and no clicks. *)
let shaped _t node ~peak ~attack ~dur at =
  let p = param node "gain" in
  Dom.ignore_call p "cancelScheduledValues" [| Dom.num at |];
  Dom.ignore_call p "setValueAtTime" [| Dom.num 0.0; Dom.num at |];
  ramp p peak (at +. attack);
  Dom.set p "value" (Dom.num peak);
  Dom.ignore_call p "exponentialRampToValueAtTime" [| Dom.num 0.0001; Dom.num (at +. dur) |]

let osc t kind freq at =
  let o = Dom.call t.ac "createOscillator" [||] in
  Dom.set o "type" (Dom.str kind);
  ignore (Dom.call (param o "frequency") "setValueAtTime" [| Dom.num freq; Dom.num at |]);
  o

(* One plucked or bowed voice, starting now and cleaning itself up. *)
let voice t ?(kind = "triangle") ?(attack = 0.012) ~freq ~dur ~vol () =
  let at = now t in
  let o = osc t kind freq at in
  let g = gain_node t in
  shaped t g ~peak:vol ~attack ~dur at;
  connect o g;
  connect g t.master;
  Dom.ignore_call o "start" [| Dom.num at |];
  Dom.ignore_call o "stop" [| Dom.num (at +. dur +. 0.05) |]

let noise_voice t ?(kind = "bandpass") ?(freq = 900.0) ?(q = 0.7) ~dur ~vol () =
  let at = now t in
  let src = Dom.call t.ac "createBufferSource" [||] in
  Dom.set src "buffer" t.noise;
  Dom.set src "loop" (Dom.bool true);
  let f = Dom.call t.ac "createBiquadFilter" [||] in
  Dom.set f "type" (Dom.str kind);
  set_value (param f "frequency") freq;
  set_value (param f "Q") q;
  let g = gain_node t in
  shaped t g ~peak:vol ~attack:0.02 ~dur at;
  connect src f;
  connect f g;
  connect g t.master;
  Dom.ignore_call src "start" [| Dom.num at |];
  Dom.ignore_call src "stop" [| Dom.num (at +. dur +. 0.05) |]

let noise_buffer ac seconds =
  let rate = Dom.float_of (Dom.get ac "sampleRate") in
  let len = int_of_float (rate *. seconds) in
  let buf = Dom.call ac "createBuffer" [| Dom.int 1; Dom.int len; Dom.num rate |] in
  let data = Dom.call buf "getChannelData" [| Dom.int 0 |] in
  let last = ref 0.0 in
  for i = 0 to len - 1 do
    let white = (Util.rand (Util.make_rng (i + 1)) *. 2.0) -. 1.0 in
    last := (0.98 *. !last) +. (0.02 *. white);
    Dom.set data (string_of_int i) (Dom.num (!last *. 3.0))
  done;
  buf

let bed_layers t at =
  let src = Dom.call t.ac "createBufferSource" [||] in
  Dom.set src "buffer" t.noise;
  Dom.set src "loop" (Dom.bool true);
  let f = Dom.call t.ac "createBiquadFilter" [||] in
  Dom.set f "type" (Dom.str "lowpass");
  set_value (param f "frequency") 620.0;
  connect src f;
  connect f t.water;
  Dom.ignore_call src "start" [| Dom.num at |];
  let pad_freqs = [| 110.0; 110.6; 164.8 |] in
  Array.iter (fun freq ->
      let o = osc t "sine" freq at in
      let g = gain_node t in
      Dom.set (param g "gain") "value" (Dom.num 0.30);
      connect o g;
      connect g t.pad;
      Dom.ignore_call o "start" [| Dom.num at |]) pad_freqs;
  let lfo = osc t "sine" 0.07 at in
  let lfo_gain = gain_node t in
  Dom.set (param lfo_gain "gain") "value" (Dom.num 0.018);
  connect lfo lfo_gain;
  connect lfo_gain (param t.pad "gain");
  Dom.ignore_call lfo "start" [| Dom.num at |]

let create () =
  let ctx = Dom.new_obj (Dom.global "AudioContext") [||] in
  let master = gain_node { ac = ctx; master = ctx; bed = ctx; water = ctx;
                           pad = ctx; noise = ctx; running = false } in
  let limiter = Dom.call ctx "createDynamicsCompressor" [||] in
  set_value (param limiter "threshold") (-14.0);
  set_value (param limiter "ratio") 6.0;
  Dom.set (param limiter "attack") "value" (Dom.num 0.01);
  set_value (param master "gain") 0.0;
  connect master limiter;
  connect limiter (Dom.get ctx "destination");
  let t = { ac = ctx; master; bed = gain_node { ac = ctx; master; bed = ctx;
                                                 water = ctx; pad = ctx; noise = ctx;
                                                 running = false };
            water = Dom.call ctx "createGain" [||];
            pad = Dom.call ctx "createGain" [||];
            noise = noise_buffer ctx 1.2; running = false } in
  set_value (param t.water "gain") 0.05;
  set_value (param t.pad "gain") 0.04;
  connect t.water t.bed;
  connect t.pad t.bed;
  set_value (param t.bed "gain") 0.0;
  connect t.bed t.master;
  bed_layers t (now t);
  t

let resume t = ignore (Dom.call t.ac "resume" [||])

(* Fade the whole pond in or out; the confirmation chime rides on top. *)
let set_on t on =
  let at = now t in
  let p = param t.master "gain" in
  Dom.ignore_call p "cancelScheduledValues" [| Dom.num at |];
  Dom.ignore_call p "setValueAtTime" [| Dom.num (if t.running then 0.62 else 0.0); Dom.num at |];
  ramp p (if on then 0.62 else 0.0) (at +. (if on then 0.35 else 0.5));
  let p = param t.bed "gain" in
  Dom.ignore_call p "cancelScheduledValues" [| Dom.num at |];
  ramp p (if on then 1.0 else 0.0) (at +. (if on then 0.35 else 0.5));
  t.running <- on

let wake t =
  voice t ~kind:"sine" ~freq:523.25 ~dur:0.45 ~vol:0.22 ();
  voice t ~kind:"sine" ~freq:783.99 ~dur:0.7 ~vol:0.16 ()

let step_note t n =
  let ladder = [| 0; 3; 5; 7; 10; 12; 15; 17 |] in
  let semi = float_of_int ladder.(n mod Array.length ladder) in
  let freq = 220.0 *. (2.0 ** (semi /. 12.0)) in
  voice t ~kind:"triangle" ~freq ~dur:0.30 ~vol:0.14 ()

let dew_chime t n =
  let freq = 440.0 *. (2.0 ** (float_of_int (n mod 5) *. 2.0 /. 12.0)) in
  voice t ~kind:"sine" ~freq ~dur:0.9 ~vol:0.20 ();
  voice t ~kind:"sine" ~freq:(freq *. 2.01) ~dur:0.5 ~vol:0.09 ()

let moss_thud t =
  noise_voice t ~kind:"lowpass" ~freq:220.0 ~dur:0.18 ~vol:0.22 ()

let ripple_sound t =
  noise_voice t ~kind:"bandpass" ~freq:1500.0 ~q:1.2 ~dur:0.24 ~vol:0.07 ()

let koi_plop t =
  voice t ~kind:"sine" ~freq:520.0 ~dur:0.22 ~vol:0.16 ();
  noise_voice t ~kind:"lowpass" ~freq:500.0 ~dur:0.14 ~vol:0.10 ()

let still t =
  voice t ~kind:"sine" ~freq:330.0 ~dur:0.9 ~vol:0.16 ();
  voice t ~kind:"sine" ~freq:247.0 ~dur:1.3 ~vol:0.13 ()

let bloom t =
  let notes = [| 261.63; 329.63; 392.0; 523.25; 659.25 |] in
  Array.iteri (fun i freq ->
      let at = now t +. (float_of_int i *. 0.14) in
      let o = osc t "sine" freq at in
      let g = gain_node t in
      shaped t g ~peak:0.20 ~attack:0.03 ~dur:1.4 at;
      connect o g;
      connect g t.master;
      Dom.ignore_call o "start" [| Dom.num at |];
      Dom.ignore_call o "stop" [| Dom.num (at +. 1.5) |]) notes;
  noise_voice t ~kind:"highpass" ~freq:3200.0 ~dur:1.6 ~vol:0.05 ()

(* The bed leans with the play: more trail, more water; more dew, more pad. *)
let mood t ~trail ~woken ~total =
  let at = now t in
  let water = 0.035 +. (0.020 *. Util.clamp 0.0 1.0 (trail /. 12.0)) in
  let pad = 0.030 +. (0.030 *. (if total = 0 then 0.0 else float_of_int woken /. float_of_int total)) in
  ramp (param t.water "gain") water (at +. 1.0);
  ramp (param t.pad "gain") pad (at +. 1.0)
