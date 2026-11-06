//// The three bits of trigonometry the pond needs, straight from JavaScript's
//// `Math`. Gleam's standard library has no maths module yet, so this module is a
//// thin, honest wrapper rather than a reimplementation.

@external(javascript, "./trig_ffi.mjs", "sin")
pub fn sin(x: Float) -> Float

@external(javascript, "./trig_ffi.mjs", "cos")
pub fn cos(x: Float) -> Float

/// The angle of the vector `(x, y)`, in radians.
@external(javascript, "./trig_ffi.mjs", "atan2")
pub fn atan2(y: Float, x: Float) -> Float
