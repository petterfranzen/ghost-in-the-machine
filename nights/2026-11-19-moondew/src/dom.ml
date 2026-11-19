(* The one place the game touches the browser: module Dom, so it never shadows
   js_of_ocaml's own Js.  Everything untyped is funnelled through here, so the
   other modules stay plain OCaml with small, checkable call sites. *)

module J = Js_of_ocaml.Js

type any = J.Unsafe.any

let global (name : string) : any = J.Unsafe.get J.Unsafe.global name
let get (o : any) (k : string) : any = J.Unsafe.get o k
let set (o : any) (k : string) (v : any) : unit = J.Unsafe.set o k v
let call (o : any) (m : string) (args : any array) : any = J.Unsafe.meth_call o m args
let new_obj (ctor : any) (args : any array) : any = J.Unsafe.new_obj ctor args
let ignore_call (o : any) (m : string) (args : any array) : unit = ignore (call o m args)

let str (s : string) : any = J.Unsafe.inject (J.string s)
let num (f : float) : any = J.Unsafe.inject (J.number_of_float f)
let int (i : int) : any = J.Unsafe.inject (J.number_of_float (float_of_int i))
let bool (b : bool) : any = J.Unsafe.inject (if b then J._true else J._false)

let float_of (v : any) : float = J.float_of_number (J.Unsafe.coerce v)
let int_of (v : any) : int = int_of_float (float_of v)
let string_of (v : any) : string = J.to_string (J.Unsafe.coerce v)

let callback (f : any -> unit) : any = J.Unsafe.inject (J.wrap_callback f)

let on (o : any) (event : string) (f : any -> unit) : unit =
  ignore_call o "addEventListener" [| str event; callback f; bool false |]

let document : any = J.Unsafe.get J.Unsafe.global "document"
let element (id : string) : any = call document "getElementById" [| str id |]

let raf (f : float -> unit) : unit =
  let frame = global "requestAnimationFrame" in
  let (_ : any) = J.Unsafe.fun_call frame [| J.Unsafe.inject (J.wrap_callback f) |] in
  ()
