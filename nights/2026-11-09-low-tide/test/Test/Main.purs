-- The shore's rules, checked without a browser.
module Test.Main where

import Prelude

import Data.Array as A
import Data.Maybe (fromMaybe)
import Data.Number as N
import Effect (Effect)
import Effect.Console (log)
import Effect.Exception (throw)
import Sim (State, initial, move, press, release, resize, tap, tick, withMotion)
import Test.Speed (clockNow)

check :: String -> Boolean -> Effect Unit
check name ok = if ok then log ("ok   - " <> name) else throw ("FAIL - " <> name)

runTicks :: Number -> Int -> State -> State
runTicks dt n s = if n <= 0 then s else runTicks dt (n - 1) (tick dt s)

-- a pool's centre, so a test can tap exactly on it
poolCentre :: Int -> State -> { x :: Number, y :: Number }
poolCentre i s =
  let p = fromMaybe { cx: 0.0, cy: 0.0, rx: 1.0, ry: 1.0, wet: 0.0, kind: 0 } (A.index s.pools i)
  in { x: p.cx, y: p.cy }

wakeAll :: State -> State
wakeAll s =
  A.foldl
    ( \acc i ->
        let c = poolCentre i acc
        in tap c.x c.y acc
    )
    s
    [ 0, 1, 2, 3 ]

main :: Effect Unit
main = do
  let seedA = 4242.0
  let seedB = 99.0
  let base = initial 320.0 200.0 1.0 seedA
  let openWater = { x: base.w * 0.5, y: base.seaY * 0.5 }

  -- 1. a tap blooms
  let afterTap = tap openWater.x openWater.y base
  check "a tap on the water leaves a ring" (A.length afterTap.ripples == 2)
  check "a tap on the water wakes nothing" (afterTap.wakes == 0)

  -- 2. a tap in a pool wakes its creature and wets the rim
  let c0 = poolCentre 0 base
  let inPool = tap c0.x c0.y base
  check "a tap in a pool wakes its creature" (inPool.wakes == 1 && inPool.evt == 1 && inPool.seq == 1)
  check "a tap in a pool wets the rim" ((fromMaybe 0.0 (map (\p -> p.wet) (A.index inPool.pools 0))) > 0.6)
  check "the woken creature is awake" (fromMaybe 0.0 (map (\b -> b.awake) (A.index inPool.beasts 0)) > 0.9)
  check "a woken creature never leaves its pool" (fromMaybe true (map (\b -> b.x > 0.0 && b.x < base.w) (A.index inPool.beasts 0)))

  -- 3. rings fade, and the pool settles again
  let rested = runTicks 0.016 400 (tap c0.x c0.y base)
  check "rings fade away" (A.length rested.ripples == 0)
  check "the pool settles back" ((fromMaybe 1.0 (map (\p -> p.wet) (A.index rested.pools 0))) < 0.45)

  -- 4. waking all four brings the tide in
  let all = wakeAll base
  check "waking the fourth creature starts the tide" (all.done && all.wakes == 4 && all.evt == 2)
  let flooded = runTicks 0.05 200 all
  check "the tide rises" (flooded.tide > 0.95)
  check "a visitor arrives with the tide" (flooded.visitor > 0.9)
  let settled = runTicks 0.05 200 flooded
  check "everything comes to rest" (N.abs (settled.tide - flooded.tide) < 0.001)

  -- 5. reduced motion moves less, but still moves
  let calm = withMotion 0.35 base
  let fullRing = runTicks 0.05 6 (tap openWater.x openWater.y base)
  let calmRing = runTicks 0.05 6 (tap openWater.x openWater.y calm)
  let ringR st = fromMaybe 0.0 (map (\r -> r.r) (A.index st.ripples 0))
  check "reduced motion is gentler" (ringR calmRing < ringR fullRing)
  check "reduced motion still moves" (ringR calmRing > 3.0)

  -- 6. the moonlight is behind a held press, not a tap
  let moon = { x: base.moonX, y: base.moonY }
  let held = runTicks 0.05 60 (press moon.x moon.y (tap moon.x moon.y base))
  check "a held press over the moon spills the light" (held.gladeT > 0.5 && held.evt == 3)
  check "the moonlight eases in, it does not snap" (held.glade > 0.5 && held.glade < 1.0)
  let quick = runTicks 0.05 30 (release (tap moon.x moon.y base))
  check "a quick tap on the moon stays ordinary" (quick.gladeT == 0.0 && quick.evt == 0)
  let dragged = runTicks 0.05 30 (move (moon.x + 40.0) moon.y (press moon.x moon.y (tap moon.x moon.y base)))
  check "dragging off the moon cancels the press" (dragged.gladeT == 0.0)

  -- 7. the frame budget a phone will test at 3 a.m.
  start <- clockNow
  let frames = runTicks 0.0166 600 (wakeAll base)
  stop <- clockNow
  let perFrame = (stop - start) / 600.0
  log ("     " <> show perFrame <> " ms per 16.6 ms frame (budget 16 ms)")
  check "600 frames fit the frame budget" (perFrame < 16.0)
  check "the frames did something" (frames.t >= 9.0)

  -- 8. the shore is seeded: one seed rebuilds it, a fresh one redraws it
  let centres s = map (\p -> p.cx * 1024.0 + p.cy) s.pools
  check "the shore still has four pools" (A.length base.pools == 4)
  check "the same seed rebuilds the same shore" (centres (initial 320.0 200.0 1.0 seedA) == centres base)
  check "a different seed draws a different shore" (centres (initial 320.0 200.0 1.0 seedB) /= centres base)
  check "a resize keeps the seeded shore" (centres (resize 320.0 200.0 base) == centres base)
