module App
open Fable.Core
open Fable.Core.JsInterop

[<Emit("console.log($0)")>]
let log (s: string) : unit = jsNative

log "hello from fable"
