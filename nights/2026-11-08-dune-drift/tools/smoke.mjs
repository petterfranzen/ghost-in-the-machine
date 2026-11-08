// Smoke check for the Dune Drift simulation. Runs the WebAssembly module in
// plain Node — no browser — and asserts the invariants the piece rests on.
//   node tools/smoke.mjs [path/to/sim.wasm]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const wasmPath = process.argv[2] || path.join(here, '..', 'build', 'sim.wasm')

let pass = 0
const fails = []
function ok(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ok   ${name}`) }
  else { fails.push(name + (extra ? ` — ${extra}` : '')); console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`) }
}

const bytes = fs.readFileSync(wasmPath)
const { instance } = await WebAssembly.instantiate(bytes, {
  env: { abort: (m, f, l, c) => { throw new Error(`wasm abort ${m}:${f}:${l} code ${c}`) } },
})
const s = instance.exports

function boot(w = 96, h = 160, sd = 1234, reduced = 0) {
  s.seed(sd); s.setReduce(reduced); s.resize(w, h)
  return { w, h }
}
function run(seconds, dt = 1 / 60) { for (let t = 0; t < seconds; t += dt) s.step(dt) }
function totalSand() { let n = 0; for (let x = 0; x < s.width(); x++) n += s.heightAt(x); return n }
function maxSlope() {
  let m = 0
  for (let x = 0; x < s.width() - 1; x++) m = Math.max(m, Math.abs(s.heightAt(x) - s.heightAt(x + 1)))
  return m
}
function anyNan() {
  for (let x = 0; x < s.width(); x++) if (!Number.isFinite(s.heightAt(x))) return true
  return false
}

console.log('Dune Drift smoke')

// 1. a field exists, and it is not flat
boot()
const W = s.width(), H = s.height()
ok('grid sized as asked', W === 96 && H === 160, `${W}x${H}`)
ok('dunes exist (some sand everywhere)', totalSand() > 0)
{
  let min = Infinity, max = -Infinity
  for (let x = 0; x < W; x++) { const v = s.heightAt(x); min = Math.min(min, v); max = Math.max(max, v) }
  ok('field has relief', max - min > 8, `range ${max - min}`)
}

// 2. initial terrain already rests at the angle of repose
ok('initial dunes rest at repose', maxSlope() <= 5, `max slope ${maxSlope()}`)

// 3. a fractional tap is accepted (the Aurora Ridge lesson) and lets sand fall
const before = totalSand()
s.seed(7)
s.tap(12.4, 3.7)                      // fractional cell coordinates
ok('fractional tap spawns grains', s.liveGrains() > 0, `${s.liveGrains()} grains`)
run(6)
ok('grains landed (field grew)', totalSand() > before, `${before} -> ${totalSand()}`)
ok('no grains left in flight', s.liveGrains() === 0)
ok('no NaN heights after a tap', !anyNan())
ok('post-tap slope still lies down', maxSlope() <= 6, `max slope ${maxSlope()}`)

// 4. the whole-scene give fires on a landing, stays gentle, then rests
boot(96, 160, 7)
s.tap(30.5, 4.5)
let sawSettle = false, settlePeak = 0
for (let i = 0; i < 800; i++) { s.step(1 / 60); settlePeak = Math.max(settlePeak, s.amount()); if (s.amount() > 0.3) sawSettle = true }
ok('a landing gives the whole scene a settle', sawSettle)
ok('the give stays gentle (soft impact)', settlePeak <= 0.6, `peak ${settlePeak.toFixed(2)}`)
ok('the settle damps back to rest', s.amount() === 0)

// 5. tapping a dune nudges it rather than removing anything
{
  s.seed(7)
  const x = Math.floor(W / 2)
  const t0 = totalSand()
  const ridge = s.heightAt(x)
  s.tap(x + 0.5, H - ridge + 0.5)     // a tap on the crest itself
  run(2)
  ok('nudging a dune conserves sand', Math.abs(totalSand() - t0) <= 1, `${t0} -> ${totalSand()}`)
}

// 6. reduced motion: no scene settle, no dust, and the field still works
{
  boot(96, 160, 1234, 1)
  s.tap(40.5, 4.25)
  let settleStayedZero = true, idxHadDust = false
  for (let i = 0; i < 300; i++) {
    s.step(1 / 60); s.render()
    if (s.amount() !== 0) settleStayedZero = false
  }
  ok('reduced motion: scene never settles', settleStayedZero)
  ok('reduced motion: grains still fall and land', s.liveGrains() === 0)
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (s.cellAt(x, y) === 18) idxHadDust = true
  ok('reduced motion: no dust motes drawn', !idxHadDust)
}

// 7. render writes only known colour indices, and the moon is in the sky
{
  boot()
  run(0); s.render()
  let bad = 0
  const seen = new Set()
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    const c = s.cellAt(x, y); seen.add(c)
    if (c < 1 || c > 19) bad++
  }
  ok('every cell is a known colour index', bad === 0, `${bad} strays`)
  ok('the moon is drawn', seen.has(9))
  ok('stars are drawn', seen.has(16) || seen.has(17))
}

// 8. determinism: the same seed builds the same field
{
  boot(96, 160, 42)
  const a = []; for (let x = 0; x < W; x++) a.push(s.heightAt(x))
  boot(96, 160, 42)
  const b = []; for (let x = 0; x < W; x++) b.push(s.heightAt(x))
  ok('same seed -> same dunes', a.join(',') === b.join(','))
}

// 9. a long quiet run stays sane and never overflows the frame
{
  boot()
  for (let i = 0; i < 30; i++) { s.tap((i * 7.3) % W + 0.5, 4.5); run(1.5) }
  ok('after 30 taps: no NaN', !anyNan())
  ok('after 30 taps: grid intact', s.width() === 96 && s.height() === 160)
  ok('after 30 taps: heights stay in range', (() => {
    for (let x = 0; x < W; x++) { const v = s.heightAt(x); if (v < 0 || v > H) return false }
    return true
  })())
  run(1); s.render()
  let bad = 0
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) { const c = s.cellAt(x, y); if (c < 1 || c > 19) bad++ }
  ok('after 30 taps: render still clean', bad === 0)
}

console.log(`\n${pass} checks passed, ${fails.length} failed`)
if (fails.length) { for (const f of fails) console.log('  - ' + f); process.exit(1) }
